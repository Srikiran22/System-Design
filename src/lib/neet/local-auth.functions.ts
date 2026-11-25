import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  DEV_SESSION_COOKIE,
  extractBearerToken,
  extractCookie,
  hashPassword,
  isLocalDevAuthAllowed,
  signDevToken,
  verifyDevToken,
  verifyPassword,
} from "./auth-server";
import { logEvent } from "./logger";

export interface LocalAuthSessionPayload {
  access_token: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
  };
}

export type LocalAuthResult<T> =
  { data: T; error: null } | { data: null; error: { code: string; message: string } };

function buildCookieHeader(token: string | null, request: Request | undefined): string {
  const proto = request?.headers?.get("x-forwarded-proto") ?? "";
  const urlIsHttps = request?.url?.startsWith("https://") ?? false;
  const isSecure = proto === "https" || urlIsHttps;

  if (!token) {
    const base = `${DEV_SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`;
    return isSecure ? `${base}; SameSite=None; Secure; Partitioned` : `${base}; SameSite=Lax`;
  }
  const maxAge = 60 * 60 * 24 * 7;
  const base = `${DEV_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${maxAge}`;
  return isSecure ? `${base}; SameSite=None; Secure; Partitioned` : `${base}; SameSite=Lax`;
}

function ensureDevAuthEnabled(): LocalAuthResult<never> | null {
  if (!isLocalDevAuthAllowed()) {
    return {
      data: null,
      error: {
        code: "local_auth_disabled",
        message: "Local development authentication is disabled in this environment.",
      },
    };
  }
  return null;
}

const signUpSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().max(80).optional(),
});

export const localSignUp = createServerFn({ method: "POST" })
  .validator((input: unknown) => signUpSchema.parse(input))
  .handler(async ({ data }): Promise<LocalAuthResult<LocalAuthSessionPayload>> => {
    const blocked = ensureDevAuthEnabled();
    if (blocked) return blocked;

    const { localDb } = await import("./db.server");
    const email = data.email.toLowerCase();
    const existing = localDb.findLocalAuthUserByEmail(email);
    if (existing) {
      return {
        data: null,
        error: {
          code: "user_already_exists",
          message: "An account with this email already exists. Try signing in.",
        },
      };
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(data.password);
    const displayName = data.displayName?.trim() || "";
    const createdAt = new Date().toISOString();

    localDb.createLocalAuthUser({
      id,
      email,
      passwordHash,
      displayName,
      createdAt,
    });

    const token = signDevToken({ sub: id, email, display_name: displayName });
    const req = getRequest();
    setResponseHeader("Set-Cookie", buildCookieHeader(token, req));
    logEvent("info", "local_auth", "signup_success", { userId: id });

    return {
      data: {
        access_token: token,
        user: { id, email, display_name: displayName, created_at: createdAt },
      },
      error: null,
    };
  });

const signInSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export const localSignIn = createServerFn({ method: "POST" })
  .validator((input: unknown) => signInSchema.parse(input))
  .handler(async ({ data }): Promise<LocalAuthResult<LocalAuthSessionPayload>> => {
    const blocked = ensureDevAuthEnabled();
    if (blocked) return blocked;

    const { localDb } = await import("./db.server");
    const email = data.email.toLowerCase();
    const stored = localDb.findLocalAuthUserByEmail(email);

    if (!stored || !verifyPassword(data.password, stored.password_hash)) {
      logEvent("warn", "local_auth", "signin_failed", { reason: "invalid_credentials" });
      return {
        data: null,
        error: {
          code: "invalid_credentials",
          message: "Email or password is incorrect.",
        },
      };
    }

    const token = signDevToken({
      sub: stored.id,
      email: stored.email,
      display_name: stored.display_name,
    });
    const req = getRequest();
    setResponseHeader("Set-Cookie", buildCookieHeader(token, req));
    logEvent("info", "local_auth", "signin_success", { userId: stored.id });

    return {
      data: {
        access_token: token,
        user: {
          id: stored.id,
          email: stored.email,
          display_name: stored.display_name,
          created_at: stored.created_at,
        },
      },
      error: null,
    };
  });

export const localGetSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<LocalAuthResult<LocalAuthSessionPayload | null>> => {
    const blocked = ensureDevAuthEnabled();
    if (blocked) return { data: null, error: null };

    const req = getRequest();
    const token =
      extractBearerToken(req) ??
      extractCookie(req?.headers?.get("cookie") ?? null, DEV_SESSION_COOKIE);
    if (!token) return { data: null, error: null };

    try {
      const claims = verifyDevToken(token);
      const { localDb } = await import("./db.server");
      const stored = localDb.findLocalAuthUserById(claims.sub);
      if (!stored) {
        setResponseHeader("Set-Cookie", buildCookieHeader(null, req));
        return { data: null, error: null };
      }
      return {
        data: {
          access_token: token,
          user: {
            id: stored.id,
            email: stored.email,
            display_name: stored.display_name,
            created_at: stored.created_at,
          },
        },
        error: null,
      };
    } catch {
      setResponseHeader("Set-Cookie", buildCookieHeader(null, req));
      return { data: null, error: null };
    }
  },
);

export const localSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const req = getRequest();
  setResponseHeader("Set-Cookie", buildCookieHeader(null, req));
  return { error: null };
});

export const localUpdatePassword = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ password: z.string().min(8).max(128) }).parse(input))
  .handler(async ({ data }): Promise<LocalAuthResult<{ updated: true }>> => {
    const blocked = ensureDevAuthEnabled();
    if (blocked) return blocked;

    const req = getRequest();
    const token =
      extractBearerToken(req) ??
      extractCookie(req?.headers?.get("cookie") ?? null, DEV_SESSION_COOKIE);
    if (!token) {
      return {
        data: null,
        error: { code: "unauthorized", message: "Sign in first to update your password." },
      };
    }

    try {
      const claims = verifyDevToken(token);
      const { localDb } = await import("./db.server");
      localDb.updateLocalAuthPassword(claims.sub, hashPassword(data.password));
      return { data: { updated: true }, error: null };
    } catch {
      return {
        data: null,
        error: { code: "unauthorized", message: "Invalid or expired session." },
      };
    }
  });
