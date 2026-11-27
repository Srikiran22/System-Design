import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/neet/auth-client";
import { authErrorMessage } from "@/hooks/use-session";
import { pageHead } from "@/lib/neet/meta";

const search = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

/** Only allow same-origin relative paths as post-login destinations. */
function safeRedirect(r?: string) {
  if (!r) return "/me";
  try {
    const u = new URL(r, window.location.origin);
    return u.origin === window.location.origin ? u.pathname + u.search : "/me";
  } catch {
    return "/me";
  }
}

function AuthPage() {
  const { redirect, mode: initial } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initial ?? "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    authClient.getUser().then(({ data }) => {
      if (data.user) navigate({ to: safeRedirect(redirect), replace: true });
    });
  }, [navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const em = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) return setError("Enter a valid email address.");
    if (mode !== "forgot" && password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (mode === "signup" && !name.trim())
      return setError("Tell us your name — your signature is made from your initials.");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await authClient.signInWithPassword({ email: em, password });
        if (error) throw error;
        navigate({ to: safeRedirect(redirect), replace: true });
      } else if (mode === "signup") {
        const { data, error } = await authClient.signUp({
          email: em,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { display_name: name.trim().slice(0, 80) },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: safeRedirect(redirect), replace: true });
        else setNotice("Check your inbox to confirm your email, then sign in.");
      } else {
        const { error } = await authClient.resetPasswordForEmail(em, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-5 py-16">
      <div className="rounded-lg border border-line bg-surface-2 p-8">
        <p className="section-label text-accent">Account</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "forgot"
            ? "We'll email you a link to set a new password."
            : "Your progress, goals, and engineering artifacts follow you across devices."}
        </p>

        {mode !== "forgot" && (
          <div
            role="tablist"
            className="mt-6 grid grid-cols-2 gap-1 rounded-md border border-line bg-surface-1 p-1 text-sm"
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`rounded py-2 text-xs font-semibold transition ${
                  mode === m ? "bg-accent text-bg" : "text-muted hover:text-text"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === "signup" && (
            <Field label="Full name" value={name} onChange={setName} autoComplete="name" />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          {mode !== "forgot" && (
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          )}
          {error && (
            <p
              role="alert"
              className="rounded-md border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-text"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-text"
            >
              {notice}
            </p>
          )}
          <button
            disabled={busy}
            className="btn-ink w-full justify-center text-sm disabled:opacity-50"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {mode === "signin" && (
            <button type="button" onClick={() => setMode("forgot")} className="hover:text-accent">
              Forgot password?
            </button>
          )}
          {mode === "forgot" && (
            <button type="button" onClick={() => setMode("signin")} className="hover:text-accent">
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-1.5 w-full rounded-md border border-line bg-bg px-3.5 py-2.5 text-sm text-text outline-none transition focus:border-accent"
      />
    </label>
  );
}

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () =>
    pageHead(
      "Sign in",
      "Sign in or create a NEET account to save your progress, goals and signature.",
    ),
  component: AuthPage,
});
