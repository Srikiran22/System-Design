import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Client-side session for UI affordances (nav avatar etc.). Server calls re-validate the bearer. */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return { user, ready };
}

/** Plain-language messages for auth failures. */
export function authErrorMessage(err: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine)
    return "You're offline. Check your connection and try again.";
  const msg = (err as { message?: string })?.message ?? "";
  const code = (err as { code?: string })?.code ?? "";
  if (code === "invalid_credentials" || /invalid login/i.test(msg))
    return "Email or password is incorrect.";
  if (code === "email_not_confirmed" || /not confirmed/i.test(msg))
    return "Please confirm your email first — check your inbox.";
  if (code === "user_already_exists" || /already registered/i.test(msg))
    return "An account with this email already exists. Try signing in.";
  if (code === "weak_password" || (/password/i.test(msg) && /weak|short|least/i.test(msg)))
    return "Choose a stronger password (at least 8 characters).";
  if (/rate|too many|429/i.test(msg + code))
    return "Too many attempts. Wait a minute and try again.";
  return msg || "Something went wrong. Please try again.";
}
