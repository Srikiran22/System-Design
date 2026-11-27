import crypto from "node:crypto";
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachAuth } from "@/lib/neet/auth-attacher";
import { logEvent } from "@/lib/neet/logger";

const DEFAULT_CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https:",
].join("; ");

function resolveRequestId(request: Request): string {
  const incoming = request.headers.get("x-request-id")?.trim();
  if (incoming && /^[A-Za-z0-9._-]{8,64}$/.test(incoming)) {
    return incoming;
  }
  return crypto.randomUUID();
}

function isPrivateOrMutatingPath(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return true;
  try {
    const pathname = new URL(request.url).pathname;
    return (
      pathname.startsWith("/me") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/_serverFn")
    );
  } catch {
    return true;
  }
}

function extractResponse(result: unknown): Response | null {
  if (result instanceof Response) return result;
  if (
    result != null &&
    typeof result === "object" &&
    "response" in result &&
    (result as { response?: unknown }).response instanceof Response
  ) {
    return (result as { response: Response }).response;
  }
  return null;
}

const errorAndCorrelationMiddleware = createMiddleware().server(async ({ next, request }) => {
  const requestId = resolveRequestId(request);
  try {
    const result = await next();
    const response = extractResponse(result);
    if (response) {
      response.headers.set("X-Request-Id", requestId);
    }
    return result;
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    let pathname = "/";
    try {
      pathname = new URL(request.url).pathname;
    } catch {
      /* ignore */
    }
    logEvent(
      "error",
      "http",
      "unhandled_request_error",
      {
        method: request.method,
        path: pathname,
        error,
      },
      requestId,
    );
    return new Response(renderErrorPage(), {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "X-Request-Id": requestId,
        "Cache-Control": "private, no-store",
      },
    });
  }
});

const securityHeadersMiddleware = createMiddleware().server(async ({ next, request }) => {
  const result = await next();
  const response = extractResponse(result);
  if (response) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Enable Report-Only CSP by default so browser violations are observable without breaking legitimate scripts.
    if (
      process.env["CSP_REPORT_ONLY"] !== "0" &&
      !response.headers.has("Content-Security-Policy")
    ) {
      const policy = process.env["CSP_REPORT_ONLY"]?.trim() || DEFAULT_CSP_REPORT_ONLY;
      response.headers.set("Content-Security-Policy-Report-Only", policy);
    }

    // Emit HSTS only on HTTPS connections (terminated at proxy or direct TLS).
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedProto === "https" || request.url.startsWith("https://")) {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    // Prevent shared CDN/browser caching of private account pages, auth pages, and mutating endpoints.
    if (isPrivateOrMutatingPath(request) && !response.headers.has("Cache-Control")) {
      response.headers.set("Cache-Control", "private, no-store");
    }
  }
  return result;
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachAuth],
  requestMiddleware: [errorAndCorrelationMiddleware, securityHeadersMiddleware, csrfMiddleware],
}));
