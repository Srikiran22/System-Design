import crypto from "node:crypto";

/**
 * Structured server logger with automatic redaction of credentials, tokens, cookies,
 * raw personal evidence payloads, and secrets. Safe for JSON log ingestion and
 * request-ID correlation.
 */

const REDACT_KEYS =
  /token|password|secret|authorization|cookie|apikey|api_key|key|jwt|artifact_notes|state_json|snapshotjson|email/i;

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[redacted-depth]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (
      value.startsWith("Bearer ") ||
      /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(value) ||
      value.split(".").length === 3
    ) {
      return "[redacted-token]";
    }
    return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...("statusCode" in value &&
      typeof (value as { statusCode?: unknown }).statusCode === "number"
        ? { statusCode: (value as { statusCode: number }).statusCode }
        : {}),
      ...("code" in value && typeof (value as { code?: unknown }).code === "string"
        ? { code: (value as { code: string }).code }
        : {}),
    };
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (REDACT_KEYS.test(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = sanitizeValue(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/** Deterministic non-reversible short hash for correlating IPs or emails without logging PII. */
export function hashForLog(raw: string): string {
  return crypto.createHash("sha256").update(raw.trim().toLowerCase()).digest("hex").slice(0, 12);
}

/** Safe short user identifier prefix for logs (avoids full raw UUID/PII exposure in metrics). */
export function safeUserRef(userId: string): string {
  return `usr_${hashForLog(userId)}`;
}

export type LogLevel = "info" | "warn" | "error";

export function formatLogPayload(
  level: LogLevel,
  scope: string,
  event: string,
  meta?: Record<string, unknown>,
  requestId?: string,
): Record<string, unknown> {
  return {
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    ...(requestId ? { requestId } : {}),
    ...(meta ? { meta: sanitizeValue(meta) } : {}),
  };
}

export function logEvent(
  level: LogLevel,
  scope: string,
  event: string,
  meta?: Record<string, unknown>,
  requestId?: string,
): void {
  const payload = formatLogPayload(level, scope, event, meta, requestId);
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (process.env["NODE_ENV"] !== "test") console.info(line);
}
