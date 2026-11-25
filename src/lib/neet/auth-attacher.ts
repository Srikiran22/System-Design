import { createMiddleware } from "@tanstack/react-start";
import { authClient, getInMemoryAccessToken, isSupabaseClientConfigured } from "./auth-client";

/**
 * Attaches the active session's bearer token to serverFn RPC calls.
 * In local dev mode, avoids invoking localGetSession() recursively from middleware —
 * the browser automatically sends the HttpOnly session cookie and any hydrated
 * in-memory token is attached synchronously.
 */
export const attachAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  try {
    let token: string | null = null;
    if (isSupabaseClientConfigured()) {
      const { data } = await authClient.getSession();
      token = data.session?.access_token ?? null;
    } else {
      token = getInMemoryAccessToken();
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    return next({ headers: {} });
  }
});
