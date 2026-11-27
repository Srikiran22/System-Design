import crypto from "node:crypto";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { logEvent, safeUserRef } from "./logger";
import { recordAuthOutcome } from "./metrics.server";

export const DEV_SESSION_COOKIE = "neet_dev_session";
const DEV_TOKEN_ISSUER = "neet-local-dev";
const DEV_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AppRole = "learner" | "reviewer" | "author" | "admin";

const ROLE_RANK: Record<AppRole, number> = {
  learner: 0,
  reviewer: 1,
  author: 2,
  admin: 3,
};

export function isAppRole(v: unknown): v is AppRole {
  return v === "learner" || v === "reviewer" || v === "author" || v === "admin";
}

export function hasRoleAtLeast(role: AppRole, minimum: AppRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export class AuthError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 401, code = "unauthorized") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type VerifiedAuthContext = {
  supabase: SupabaseClient<Database> | null;
  userId: string;
  email: string | null;
  role: AppRole;
  authMode: "supabase" | "local_dev";
  requestId: string;
};

/** True when Supabase server env vars are configured. */
export function isSupabaseServerConfigured(): boolean {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
}

/**
 * Local dev authentication is ONLY permitted when:
 *  1) Runtime is NOT production (NODE_ENV !== "production"), AND
 *  2) Supabase is NOT configured.
 * Production builds NEVER permit local dev auth.
 */
export function isLocalDevAuthAllowed(): boolean {
  if (process.env["NODE_ENV"] === "production") return false;
  if (isSupabaseServerConfigured()) return false;
  return true;
}

/** Checks server-configured ADMIN_EMAILS allowlist against a verified email address. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env["ADMIN_EMAILS"] ?? "";
  if (!raw.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}

// Ephemeral in-memory signing secret for local dev tokens (never persisted or exposed to client).
let _ephemeralDevSecret: Buffer | null = null;
function getDevSigningSecret(): Buffer {
  const configured = process.env["LOCAL_DEV_AUTH_SECRET"];
  if (configured && configured.trim().length >= 32) {
    return Buffer.from(configured.trim(), "utf-8");
  }
  if (!_ephemeralDevSecret) {
    _ephemeralDevSecret = crypto.randomBytes(32);
  }
  return _ephemeralDevSecret;
}

/** Password hashing for dev-only local accounts using scrypt + random 16-byte salt. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

/** Constant-time password verification against stored scrypt hash. */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const mod = padded.length % 4;
  const normalized = mod === 0 ? padded : padded + "=".repeat(4 - mod);
  return Buffer.from(normalized, "base64");
}

export interface DevTokenClaims {
  sub: string;
  email: string;
  display_name?: string;
  iss: string;
  iat: number;
  exp: number;
}

/** Signs an HMAC-SHA256 JWT exclusively for local development mode. */
export function signDevToken(
  payload: { sub: string; email: string; display_name?: string },
  ttlSeconds = DEV_TOKEN_TTL_SECONDS,
): string {
  if (!UUID_RE.test(payload.sub)) {
    throw new AuthError("Invalid subject identifier.", 400, "invalid_subject");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const claims: DevTokenClaims = {
    sub: payload.sub,
    email: payload.email,
    ...(payload.display_name ? { display_name: payload.display_name } : {}),
    iss: DEV_TOKEN_ISSUER,
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = base64UrlEncode(JSON.stringify(claims));
  const sig = base64UrlEncode(
    crypto.createHmac("sha256", getDevSigningSecret()).update(`${header}.${body}`).digest(),
  );
  return `${header}.${body}.${sig}`;
}

/**
 * Cryptographically verifies a local development HS256 token.
 * Explicitly rejects alg:"none", invalid algorithms, tampered signatures,
 * wrong issuer, malformed UUID subjects, and expired tokens.
 */
export function verifyDevToken(
  token: string,
  nowSec = Math.floor(Date.now() / 1000),
): DevTokenClaims {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new AuthError("Malformed session token.", 401, "malformed_token");
  }
  const [headerB64, bodyB64, sigB64] = parts;

  let header: Record<string, unknown>;
  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString("utf-8")) as Record<string, unknown>;
  } catch {
    throw new AuthError("Invalid token header.", 401, "invalid_header");
  }

  if (header["alg"] !== "HS256" || header["typ"] !== "JWT") {
    throw new AuthError("Unsupported token algorithm.", 401, "unsupported_alg");
  }

  const expectedSig = crypto
    .createHmac("sha256", getDevSigningSecret())
    .update(`${headerB64}.${bodyB64}`)
    .digest();
  let actualSig: Buffer;
  try {
    actualSig = base64UrlDecode(sigB64);
  } catch {
    throw new AuthError("Invalid token signature encoding.", 401, "invalid_signature");
  }

  if (actualSig.length !== expectedSig.length || !crypto.timingSafeEqual(actualSig, expectedSig)) {
    throw new AuthError("Token signature verification failed.", 401, "invalid_signature");
  }

  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(base64UrlDecode(bodyB64).toString("utf-8")) as Record<string, unknown>;
  } catch {
    throw new AuthError("Invalid token payload.", 401, "invalid_payload");
  }

  if (claims["iss"] !== DEV_TOKEN_ISSUER) {
    throw new AuthError("Invalid token issuer.", 401, "invalid_issuer");
  }
  if (typeof claims["sub"] !== "string" || !UUID_RE.test(claims["sub"])) {
    throw new AuthError("Invalid token subject.", 401, "invalid_subject");
  }
  if (typeof claims["email"] !== "string" || !claims["email"]) {
    throw new AuthError("Invalid token email.", 401, "invalid_email");
  }
  if (typeof claims["exp"] !== "number" || claims["exp"] <= nowSec) {
    throw new AuthError("Session token expired.", 401, "token_expired");
  }
  if (typeof claims["iat"] !== "number" || claims["iat"] > nowSec + 60) {
    throw new AuthError("Invalid token issued-at time.", 401, "invalid_iat");
  }

  return {
    sub: claims["sub"],
    email: claims["email"],
    ...(typeof claims["display_name"] === "string" ? { display_name: claims["display_name"] } : {}),
    iss: claims["iss"],
    iat: claims["iat"],
    exp: claims["exp"],
  };
}

export function extractCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function extractBearerToken(request: Request | undefined | null): string | null {
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function extractRequestId(request: Request | undefined | null): string {
  const incoming = request?.headers?.get("x-request-id")?.trim();
  if (incoming && /^[A-Za-z0-9._-]{8,64}$/.test(incoming)) return incoming;
  return crypto.randomUUID();
}

async function resolveSupabaseRole(
  client: SupabaseClient<Database>,
  userId: string,
  email: string | null,
  claims: Record<string, unknown> | undefined,
): Promise<AppRole> {
  if (isAdminEmail(email)) return "admin";

  // Check verified JWT app_metadata ONLY (never user_metadata, which users can self-edit).
  const appMeta = claims?.["app_metadata"];
  if (appMeta && typeof appMeta === "object") {
    const metaRole = (appMeta as Record<string, unknown>)["role"];
    if (isAppRole(metaRole)) return metaRole;
  }

  // Fallback to owner-readable user_roles table if provisioned in Supabase.
  try {
    const res = await (
      client as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (
              col: string,
              val: string,
            ) => {
              maybeSingle: () => Promise<{
                data: { role?: unknown } | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      }
    )
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (!res.error && isAppRole(res.data?.role)) {
      return res.data.role;
    }
  } catch {
    /* table not provisioned yet — fail closed to learner */
  }

  return "learner";
}

async function resolveLocalRole(userId: string, email: string | null): Promise<AppRole> {
  if (isAdminEmail(email)) return "admin";
  try {
    const { localDb } = await import("./db.server");
    const dbRole = localDb.getUserRole(userId);
    if (isAppRole(dbRole)) return dbRole;
  } catch {
    /* ignore */
  }
  return "learner";
}

/**
 * Fail-closed server authentication principal resolver.
 * Never reads unverified JWT payload claims; never falls back to a fixed default user ID.
 */
export async function verifyRequestPrincipal(
  request: Request | undefined | null,
): Promise<VerifiedAuthContext> {
  const bearer = extractBearerToken(request);
  const requestId = extractRequestId(request);

  // Path A: Production / Supabase-configured mode — STRICTLY verified via Supabase getClaims()
  if (isSupabaseServerConfigured()) {
    if (!bearer) {
      recordAuthOutcome("denied");
      throw new AuthError("Authentication required.", 401, "missing_token");
    }
    const SUPABASE_URL = (process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"])!;
    const SUPABASE_KEY = (process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"])!;

    const client = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (
            SUPABASE_KEY.startsWith("sb_") &&
            h.get("Authorization") === `Bearer ${SUPABASE_KEY}`
          ) {
            h.delete("Authorization");
          }
          h.set("apikey", SUPABASE_KEY);
          h.set("Authorization", `Bearer ${bearer}`);
          return fetch(input, { ...init, headers: h });
        },
      },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client.auth.getClaims(bearer);
    const sub = data?.claims?.sub;
    if (error || typeof sub !== "string" || !UUID_RE.test(sub)) {
      recordAuthOutcome("denied");
      logEvent(
        "warn",
        "auth",
        "supabase_claims_rejected",
        { reason: error?.message ?? "missing_sub" },
        requestId,
      );
      throw new AuthError("Invalid or expired session.", 401, "invalid_session");
    }

    const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
    const role = await resolveSupabaseRole(
      client,
      sub,
      email,
      data?.claims as Record<string, unknown> | undefined,
    );
    return {
      supabase: client,
      userId: sub,
      email,
      role,
      authMode: "supabase",
      requestId,
    };
  }

  // Path B: Local development mode ONLY — strictly verified HS256 token signed by this server
  if (!isLocalDevAuthAllowed()) {
    recordAuthOutcome("denied");
    logEvent("error", "auth", "production_auth_unconfigured", undefined, requestId);
    throw new AuthError(
      "Authentication service is not configured for production.",
      503,
      "auth_unconfigured",
    );
  }

  const cookieToken = extractCookie(request?.headers?.get("cookie") ?? null, DEV_SESSION_COOKIE);
  const candidateToken = bearer ?? cookieToken;
  if (!candidateToken) {
    recordAuthOutcome("denied");
    throw new AuthError("Authentication required.", 401, "missing_token");
  }

  const claims = verifyDevToken(candidateToken);
  const role = await resolveLocalRole(claims.sub, claims.email);
  return {
    supabase: null,
    userId: claims.sub,
    email: claims.email,
    role,
    authMode: "local_dev",
    requestId,
  };
}

/** Optional auth principal resolver for public endpoints that optionally expose draft content to authors/admins. */
export async function tryVerifyRequestPrincipal(
  request: Request | undefined | null,
): Promise<VerifiedAuthContext | null> {
  try {
    return await verifyRequestPrincipal(request);
  } catch {
    return null;
  }
}

/** Fail-closed TanStack Start server-function middleware for all account operations. */
export const requireVerifiedAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authContext = await verifyRequestPrincipal(request);
    return next({ context: authContext });
  },
);

function createRoleMiddleware(minimumRole: AppRole, label: string) {
  return createMiddleware({ type: "function" }).server(async ({ next }) => {
    const request = getRequest();
    const authContext = await verifyRequestPrincipal(request);
    if (!hasRoleAtLeast(authContext.role, minimumRole)) {
      recordAuthOutcome("denied");
      logEvent(
        "warn",
        "rbac",
        "role_access_denied",
        {
          userRef: safeUserRef(authContext.userId),
          actualRole: authContext.role,
          requiredRole: minimumRole,
        },
        authContext.requestId,
      );
      throw new AuthError(`${label} privileges required.`, 403, "forbidden");
    }
    return next({ context: authContext });
  });
}

/** Requires verified reviewer, author, or admin role (for independent rubric/evidence verification). */
export const requireReviewerOrAdmin = createRoleMiddleware("reviewer", "Reviewer");

/** Requires verified course author or admin role (for dynamic curriculum CMS mutations). */
export const requireAuthorOrAdmin = createRoleMiddleware("author", "Course author or admin");

/** Requires verified admin role (for RBAC role grants, audit logs, and operational telemetry). */
export const requireAdmin = createRoleMiddleware("admin", "Administrator");
