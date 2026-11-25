import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_SESSION_KEY = "neet.local.session.v1";
const LOCAL_USERS_KEY = "neet.local.users.v1";

interface LocalStoredUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

interface LocalStoredSession {
  user: User;
  access_token: string;
}

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const localListeners = new Set<AuthListener>();

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

function deterministicUuid(seedText: string): string {
  // Simple FNV-1a based deterministic UUID v4-shaped identifier for local accounts
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < seedText.length; i++) {
    const ch = seedText.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (ch + i), 0x85ebca6b) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  const p1 = hex(h1);
  const p2 = hex(h2);
  const p3 = hex((h1 ^ 0x5bd1e995) >>> 0);
  const p4 = hex((h2 ^ 0x27d4eb2d) >>> 0);
  return `${p1}-${p2.slice(0, 4)}-4${p2.slice(5, 8)}-a${p3.slice(1, 4)}-${p3.slice(4)}${p4.slice(0, 8)}`;
}

function makeLocalToken(userId: string, email: string): string {
  const toBase64 = (obj: unknown) => {
    const json = JSON.stringify(obj);
    if (typeof btoa === "function") {
      return btoa(unescape(encodeURIComponent(json)));
    }
    return Buffer.from(json, "utf-8").toString("base64");
  };
  return `${toBase64({ alg: "none", typ: "JWT" })}.${toBase64({ sub: userId, email })}.local`;
}

function readLocalUsers(): Record<string, LocalStoredUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalStoredUser>) : {};
  } catch {
    return {};
  }
}

function writeLocalUsers(users: Record<string, LocalStoredUser>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

function readLocalSession(): LocalStoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? (JSON.parse(raw) as LocalStoredSession) : null;
  } catch {
    return null;
  }
}

function writeLocalSession(session: LocalStoredSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}

function toSupabaseSession(local: LocalStoredSession | null): Session | null {
  if (!local) return null;
  return {
    access_token: local.access_token,
    refresh_token: "local-refresh-token",
    expires_in: 60 * 60 * 24 * 365,
    token_type: "bearer",
    user: local.user,
  };
}

function buildLocalUser(stored: LocalStoredUser): User {
  return {
    id: stored.id,
    app_metadata: { provider: "local" },
    user_metadata: { display_name: stored.displayName },
    aud: "authenticated",
    created_at: stored.createdAt,
    email: stored.email,
  } as User;
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

/**
 * Resilient auth client: uses Supabase Auth when configured, and falls back to
 * a local browser session (paired with local SQLite on the server) otherwise.
 */
export const authClient = {
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    if (isSupabaseClientConfigured()) {
      const res = await supabase.auth.getSession();
      return { data: { session: res.data.session }, error: null };
    }
    return { data: { session: toSupabaseSession(readLocalSession()) }, error: null };
  },

  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    if (isSupabaseClientConfigured()) {
      const res = await supabase.auth.getUser();
      return { data: { user: res.data.user }, error: null };
    }
    return { data: { user: readLocalSession()?.user ?? null }, error: null };
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
    const normalized = email.trim().toLowerCase();
    const users = readLocalUsers();
    const existing = users[normalized];
    if (!existing || existing.password !== password) {
      return {
        data: { user: null, session: null },
        error: {
          code: "invalid_credentials",
          message: existing
            ? "Email or password is incorrect."
            : "No account found for this email yet. Switch to Create account.",
        },
      };
    }
    const user = buildLocalUser(existing);
    const localSession: LocalStoredSession = {
      user,
      access_token: makeLocalToken(user.id, normalized),
    };
    writeLocalSession(localSession);
    const session = toSupabaseSession(localSession);
    notifyLocalListeners("SIGNED_IN", session);
    return { data: { user, session }, error: null };
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
    const normalized = email.trim().toLowerCase();
    const users = readLocalUsers();
    if (users[normalized]) {
      return {
        data: { user: null, session: null },
        error: {
          code: "user_already_exists",
          message: "An account with this email already exists. Try signing in.",
        },
      };
    }
    const stored: LocalStoredUser = {
      id: deterministicUuid(normalized),
      email: normalized,
      password,
      displayName: options?.data?.display_name?.trim() || "",
      createdAt: new Date().toISOString(),
    };
    users[normalized] = stored;
    writeLocalUsers(users);
    const user = buildLocalUser(stored);
    const localSession: LocalStoredSession = {
      user,
      access_token: makeLocalToken(user.id, normalized),
    };
    writeLocalSession(localSession);
    const session = toSupabaseSession(localSession);
    notifyLocalListeners("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.resetPasswordForEmail(email, options);
    }
    return { data: {}, error: null };
  },

  async updateUser({ password }: { password: string }) {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.updateUser({ password });
    }
    const current = readLocalSession();
    if (!current?.user.email) {
      return { data: { user: null }, error: { message: "Sign in first to update your password." } };
    }
    const users = readLocalUsers();
    const stored = users[current.user.email];
    if (stored) {
      stored.password = password;
      writeLocalUsers(users);
    }
    notifyLocalListeners("USER_UPDATED", toSupabaseSession(current));
    return { data: { user: current.user }, error: null };
  },

  async signOut() {
    if (isSupabaseClientConfigured()) {
      return supabase.auth.signOut();
    }
    writeLocalSession(null);
    notifyLocalListeners("SIGNED_OUT", null);
    return { error: null };
  },
};
