import { createMiddleware } from "@tanstack/react-start";
import { authClient } from "./auth-client";

/**
 * Attaches the active session's bearer token to serverFn RPC calls.
 * Never throws when Supabase environment variables are absent.
 */
export const attachAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  try {
    const { data } = await authClient.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    return next({ headers: {} });
  }
});
