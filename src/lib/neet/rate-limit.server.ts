import { hashForLog, logEvent } from "./logger";
import { recordRateLimitHit } from "./metrics.server";

/**
 * Sliding-window per-endpoint rate limiter for server functions.
 *
 * Deployment note: This in-memory sliding window protects single-instance deployments,
 * local development, and automated tests. Horizontally scaled production deployments
 * must pair this with edge/CDN/Supabase Auth rate limits or a shared store (e.g. Redis/KV).
 */

export type RateLimitBucket = "auth" | "sync" | "write" | "export" | "search" | "admin";

export interface RateLimitPolicy {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_POLICIES: Record<RateLimitBucket, RateLimitPolicy> = {
  auth: { maxRequests: 15, windowMs: 15 * 60_000 }, // 15 auth attempts per 15 min per key
  sync: { maxRequests: 60, windowMs: 60_000 }, // 60 sync flushes per min per user
  write: { maxRequests: 40, windowMs: 60_000 }, // 40 profile/goal mutations per min per user
  export: { maxRequests: 10, windowMs: 5 * 60_000 }, // 10 full dossier exports per 5 min
  search: { maxRequests: 120, windowMs: 60_000 }, // 120 searches per min
  admin: { maxRequests: 120, windowMs: 60_000 }, // 120 CMS/admin operations per min
};

export class RateLimitError extends Error {
  readonly statusCode = 429;
  readonly code = "rate_limited";
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message?: string) {
    super(message ?? `Too many requests. Try again in ${retryAfterSeconds}s.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const windows = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 10_000;

function pruneMapIfLarge(now: number): void {
  if (windows.size <= MAX_TRACKED_KEYS) return;
  for (const [k, timestamps] of windows.entries()) {
    const latest = timestamps[timestamps.length - 1] ?? 0;
    if (now - latest > 15 * 60_000) {
      windows.delete(k);
    }
  }
}

/** Check and record a sliding-window rate limit hit. Purely deterministic when `now` is supplied. */
export function checkRateLimit(
  bucket: RateLimitBucket,
  subjectKey: string,
  now = Date.now(),
  overridePolicy?: RateLimitPolicy,
): RateLimitDecision {
  const policy = overridePolicy ?? RATE_LIMIT_POLICIES[bucket];
  const fullKey = `${bucket}:${subjectKey}`;
  const cutoff = now - policy.windowMs;
  const existing = windows.get(fullKey) ?? [];
  const active = existing.filter((ts) => ts > cutoff);

  if (active.length >= policy.maxRequests) {
    const oldest = active[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + policy.windowMs - now) / 1000));
    windows.set(fullKey, active);
    recordRateLimitHit(bucket);
    logEvent("warn", "rate_limit", "limit_exceeded", {
      bucket,
      subjectHash: hashForLog(subjectKey),
      retryAfterSeconds,
    });
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  active.push(now);
  windows.set(fullKey, active);
  pruneMapIfLarge(now);
  return {
    allowed: true,
    remaining: Math.max(0, policy.maxRequests - active.length),
    retryAfterSeconds: 0,
  };
}

/** Throws RateLimitError (HTTP 429) if the caller exceeded the policy for `bucket`. */
export function enforceRateLimit(
  bucket: RateLimitBucket,
  subjectKey: string,
  now = Date.now(),
  overridePolicy?: RateLimitPolicy,
): RateLimitDecision {
  const decision = checkRateLimit(bucket, subjectKey, now, overridePolicy);
  if (!decision.allowed) {
    throw new RateLimitError(decision.retryAfterSeconds);
  }
  return decision;
}

/** Extract a safe client network fingerprint from Request headers (never stores raw IP). */
export function extractClientKey(request: Request | undefined | null): string {
  const forwarded = request?.headers?.get("x-forwarded-for");
  const realIp = request?.headers?.get("x-real-ip") ?? request?.headers?.get("cf-connecting-ip");
  const raw = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "local";
  return hashForLog(raw);
}

/** Reset in-memory rate-limit buckets (used in automated tests). */
export function resetRateLimitsForTest(): void {
  windows.clear();
}
