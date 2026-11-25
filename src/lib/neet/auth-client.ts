import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  localGetSession,
  localSignIn,
  localSignOut,
  localSignUp,
  localUpdatePassword,
  type LocalAuthSessionPayload,
} from "./local-auth.functions";

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const localListeners = new Set<AuthListener>();

// In-memory session cache ONLY — zero credentials or tokens ever stored in localStorage/sessionStorage.
let memorySession: Session | null = null;
let hydratedFromServer = false;
let hydratingPromise: Promise<Session | null> | null = null;
let isHydratingDevSession = false;

/** Synchronously returns the currently hydrated in-memory access token without triggering RPCs. */
export function getInMemoryAccessToken(): string | null {
  return memorySession?.access_token ?? null;
}

/** True when Supabase client environment variables are configured. */
export function isSupabaseClientConfigured(): boolean {
  const url =
    import.meta.env["VITE_SUPABASE_URL"] ||
    (typeof process !== "undefined" ? process.env["SUPABASE_URL"] : undefined);
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    (typeof process !== "undefined" ? process.env["SUPABASE_PUBLISHABLE_KEY"] : undefined);
  return Boolean(url && key && String(url).trim().length > 0 && String(key).trim().length > 0);
}

/** Local dev auth is strictly limited to non-production dev/test builds when Supabase is unconfigured. */
export function isLocalDevClientMode(): boolean {
  if (isSupabaseClientConfigured()) return false;
  return Boolean(import.meta.env.DEV || import.meta.env.MODE === "test");
}

function toSession(payload: LocalAuthSessionPayload | null): Session | null {
  if (!payload) return null;
  const user: User = {
    id: payload.user.id,
    app_metadata: { provider: "local_dev" },
    user_metadata: { display_name: payload.user.display_name },
    aud: "authenticated",
    created_at: payload.user.created_at,
    email: payload.user.email,
  } as User;

  return {
    access_token: payload.access_token,
    refresh_token: "",
    expires_in: 60 * 60 * 24 * 7,
    token_type: "bearer",
    user,
  };
}

function notifyLocalListeners(event: AuthChangeEvent, session: Session | null) {
  localListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      // ignore subscriber errors
    }
  });
}

async function ensureHydratedDevSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  if (hydratedFromServer) return memorySession;
  if (isHydratingDevSession) return hydratingPromise ?? memorySession;
  isHydratingDevSession = true;
  hydratingPromise = Promise.resolve()
    .then(() => localGetSession())
    .then((res) => {
      memorySession = toSession(res.data);
      hydratedFromServer = true;
      return memorySession;
    })
    .catch(() => {
      memorySession = null;
      hydratedFromServer = true;
      return null;
    })
    .finally(() => {
      isHydratingDevSession = false;
      hydratingPromise = null;
    });
  return hydratingPromise;
}

const PROD_UNCONFIGURED_ERR = {
  code: "auth_unconfigured",
  message: "Authentication service is not configured for this deployment.",
};

/**
 * Auth client wrapper:
 * - Uses Supabase Auth whenever configured (production & cloud dev).
 * - In local non-production dev without Supabase, delegates to server-side scrypt + HS256
 *   HttpOnly session endpoints while holding the active session strictly in JS memory.
 * - Fails closed in production when Supabase is unconfigured.
 */
export const authClient = {
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    if (isSupabaseClientConfigured()) {
      const res = await supabase.auth.getSession();
      return { data: { session: res.data.session }, error: null };
    }
    if (!isLocalDevClientMode()) {
      return { data: { session: null }, error: null };
    }
    const session = await ensureHydratedDevSession();
    return { data: { session }, error: null };
  },

  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    if (isSupabaseClientConfigured()) {
      const res = await supabase.auth.getUser();
      return { data: { user: res.data.user }, error: null };
    }
    if (!isLocalDevClientMode()) {
      return { data: { user: null }, error: null };
    }
    const session = await ensureHydratedDevSession();
    return { data: { user: session?.user ?? null }, error: null };
  },

  onAuthStateChange(callback: AuthListener) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.onAuthStateChange(callback);
    }
    localListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            localListeners.delete(callback);
          },
        },
      },
    };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.signInWithPassword({ email, password });
    }
    if (!isLocalDevClientMode()) {
      return { data: { user: null, session: null }, error: PROD_UNCONFIGURED_ERR };
    }
    const res = await localSignIn({ data: { email, password } });
    if (res.error || !res.data) {
      return {
        data: { user: null, session: null },
        error: res.error ?? { code: "signin_failed", message: "Sign in failed." },
      };
    }
    const session = toSession(res.data)!;
    memorySession = session;
    hydratedFromServer = true;
    notifyLocalListeners("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { emailRedirectTo?: string; data?: { display_name?: string } };
  }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.signUp({
        email,
        password,
        ...(options
          ? {
              options: {
                ...(options.emailRedirectTo !== undefined
                  ? { emailRedirectTo: options.emailRedirectTo }
                  : {}),
                ...(options.data !== undefined ? { data: options.data } : {}),
              },
            }
          : {}),
      });
    }
    if (!isLocalDevClientMode()) {
      return { data: { user: null, session: null }, error: PROD_UNCONFIGURED_ERR };
    }
    const displayName = options?.data?.display_name?.trim();
    const res = await localSignUp({
      data: {
        email,
        password,
        ...(displayName ? { displayName } : {}),
      },
    });
    if (res.error || !res.data) {
      return {
        data: { user: null, session: null },
        error: res.error ?? { code: "signup_failed", message: "Account creation failed." },
      };
    }
    const session = toSession(res.data)!;
    memorySession = session;
    hydratedFromServer = true;
    notifyLocalListeners("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.resetPasswordForEmail(email, options);
    }
    if (!isLocalDevClientMode()) {
      return { data: {}, error: PROD_UNCONFIGURED_ERR };
    }
    return { data: {}, error: null };
  },

  async updateUser({ password }: { password: string }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.updateUser({ password });
    }
    if (!isLocalDevClientMode()) {
      return { data: { user: null }, error: PROD_UNCONFIGURED_ERR };
    }
    const res = await localUpdatePassword({ data: { password } });
    if (res.error) {
      return { data: { user: null }, error: res.error };
    }
    notifyLocalListeners("USER_UPDATED", memorySession);
    return { data: { user: memorySession?.user ?? null }, error: null };
  },

  async signOut() {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.signOut();
    }
    memorySession = null;
    hydratedFromServer = true;
    if (isLocalDevClientMode()) {
      await localSignOut().catch(() => {});
    }
    notifyLocalListeners("SIGNED_OUT", null);
    return { error: null };
  },
};
