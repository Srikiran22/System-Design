/**
 * Structured server logger with automatic redaction of credentials, tokens, and secrets.
 */

const REDACT_KEYS = /token|password|secret|authorization|cookie|apikey|api_key|key|jwt/i;

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[redacted-depth]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (value.startsWith("Bearer ") || value.split(".").length === 3) {
      return "[redacted-token]";
    }
    return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
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

export type LogLevel = "info" | "warn" | "error";

export function logEvent(
  level: LogLevel,
  scope: string,
  event: string,
  meta?: Record<string, unknown>,
): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    ...(meta ? { meta: sanitizeValue(meta) } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (process.env["NODE_ENV"] !== "test") console.info(line);
}
