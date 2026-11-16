import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Every account call returns a typed result instead of throwing, so the UI can always degrade gracefully. */
export type Result<T> = { data: T; error: null } | { data: null; error: string };

const ok = <T>(data: T): Result<T> => ({ data, error: null });
const fail = (msg: string, detail?: unknown): Result<never> => {
  if (detail) console.error("[account]", msg, detail);
  return { data: null, error: msg };
};

export interface Me {
  profile: {
    display_name: string;
    initials: string;
    signature_seed: number;
    signed_at: string | null;
  };
  goals: { id: string; text: string }[];
  events: { kind: string; ref: string; discipline: string | null; occurred_on: string }[];
}

export type AccountAuthContext = {
  supabase: SupabaseClient<Database> | null;
  userId: string;
};

/** Resilient auth middleware: verifies Supabase bearer if available, otherwise falls back gracefully */
export const resilientAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");

  let tokenUserId: string | null = null;
  let token: string | null = null;
  let supabaseInstance: SupabaseClient<Database> | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
    try {
      const parts = token.split(".");
      if (parts.length === 3 && parts[1]) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        if (payload && typeof payload["sub"] === "string") {
          tokenUserId = payload["sub"];
        }
      }
    } catch {
      // Ignore invalid or malformed JWT token
    }
  }

  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && token) {
    try {
      const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: {
          fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (
              SUPABASE_PUBLISHABLE_KEY.startsWith("sb_") &&
              h.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
            ) {
              h.delete("Authorization");
            }
            h.set("apikey", SUPABASE_PUBLISHABLE_KEY);
            h.set("Authorization", `Bearer ${token}`);
            return fetch(input, { ...init, headers: h });
          },
        },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await client.auth.getClaims(token);
      if (!error && data?.claims?.sub) {
        supabaseInstance = client;
        tokenUserId = data.claims.sub;
      }
    } catch (e) {
      console.warn(
        "[account.auth] Supabase token verification failed, falling back to local user:",
        e,
      );
    }
  }

  const fallbackUserId = tokenUserId || "00000000-0000-0000-0000-000000000001";
  const authContext: AccountAuthContext = {
    supabase: supabaseInstance,
    userId: fallbackUserId,
  };
  return next({
    context: authContext,
  });
});

export const getMe = createServerFn({ method: "GET" })
  .middleware([resilientAuth])
  .handler(async ({ context }): Promise<Result<Me>> => {
    const { supabase, userId } = context;
    const { localDb } = await import("./db.server");
    if (!supabase) {
      return localDb.getMe(userId);
    }
    try {
      const [p, g, e] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, initials, signature_seed, signed_at")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("learning_goals").select("id, text").order("created_at"),
        supabase
          .from("progress_events")
          .select("kind, ref, discipline, occurred_on")
          .order("occurred_on")
          .limit(5000),
      ]);
      if (p.error || g.error || e.error) {
        console.warn(
          "[account] Supabase query failed, falling back to local SQLite:",
          p.error ?? g.error ?? e.error,
        );
        return localDb.getMe(userId);
      }
      let profile = p.data;
      if (!profile) {
        const ins = await supabase
          .from("profiles")
          .insert({ id: userId, display_name: "", initials: "U" })
          .select("display_name, initials, signature_seed, signed_at")
          .single();
        if (ins.error) return localDb.getMe(userId);
        profile = ins.data;
      }
      return ok({ profile, goals: g.data ?? [], events: e.data ?? [] });
    } catch (err) {
      console.warn("[account] Supabase query threw exception, falling back to local SQLite:", err);
      return localDb.getMe(userId);
    }
  });

const signSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  initials: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,3}$/),
  seed: z
    .number()
    .int()
    .min(0)
    .max(2 ** 32),
  goal: z.string().trim().min(1).max(200),
});

export const signCommitment = createServerFn({ method: "POST" })
  .middleware([resilientAuth])
  .validator((input: unknown) => signSchema.parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId } = context;
    const { localDb } = await import("./db.server");
    if (!supabase) {
      return localDb.signCommitment(userId, data);
    }
    try {
      const up = await supabase.from("profiles").upsert({
        id: userId,
        display_name: data.displayName,
        initials: data.initials,
        signature_seed: data.seed,
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (up.error) {
        console.warn(
          "[account] Supabase profile upsert failed, falling back to local SQLite:",
          up.error,
        );
        return localDb.signCommitment(userId, data);
      }
      const existing = await supabase
        .from("learning_goals")
        .select("id", { count: "exact", head: true });
      if ((existing.count ?? 0) < 3) {
        const g = await supabase
          .from("learning_goals")
          .insert({ user_id: userId, text: data.goal });
        if (g.error) {
          console.warn("[account] Supabase goal insert failed:", g.error);
        }
      }
      localDb.signCommitment(userId, data);
      return ok(true);
    } catch (err) {
      console.warn(
        "[account] Supabase signCommitment exception, falling back to local SQLite:",
        err,
      );
      return localDb.signCommitment(userId, data);
    }
  });

export const addGoal = createServerFn({ method: "POST" })
  .middleware([resilientAuth])
  .validator((input: unknown) => z.object({ text: z.string().trim().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId } = context;
    const { localDb } = await import("./db.server");
    if (!supabase) {
      return localDb.addGoal(userId, data.text);
    }
    try {
      const r = await supabase.from("learning_goals").insert({ user_id: userId, text: data.text });
      if (r.error) {
        if (r.error.message.includes("up to 3"))
          return fail("You can keep up to 3 learning goals.");
        console.warn("[account] Supabase addGoal failed, falling back to local SQLite:", r.error);
        return localDb.addGoal(userId, data.text);
      }
      localDb.addGoal(userId, data.text);
      return ok(true);
    } catch (err) {
      console.warn("[account] Supabase addGoal exception, falling back to local SQLite:", err);
      return localDb.addGoal(userId, data.text);
    }
  });

export const removeGoal = createServerFn({ method: "POST" })
  .middleware([resilientAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId } = context;
    const { localDb } = await import("./db.server");
    if (!supabase) {
      return localDb.removeGoal(userId, data.id);
    }
    try {
      const r = await supabase.from("learning_goals").delete().eq("id", data.id);
      if (r.error) {
        console.warn(
          "[account] Supabase removeGoal failed, falling back to local SQLite:",
          r.error,
        );
        return localDb.removeGoal(userId, data.id);
      }
      localDb.removeGoal(userId, data.id);
      return ok(true);
    } catch (err) {
      console.warn("[account] Supabase removeGoal exception, falling back to local SQLite:", err);
      return localDb.removeGoal(userId, data.id);
    }
  });

const eventSchema = z.object({
  kind: z.enum(["lesson", "lab", "quiz", "explain", "article"]),
  ref: z.string().min(1).max(200),
  discipline: z.enum(["st", "sd", "en"]).nullable(),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const recordEvents = createServerFn({ method: "POST" })
  .middleware([resilientAuth])
  .validator((input: unknown) =>
    z.object({ events: z.array(eventSchema).min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Result<number>> => {
    const { supabase, userId } = context;
    const { localDb } = await import("./db.server");
    if (!supabase) {
      return localDb.recordEvents(userId, data.events);
    }
    try {
      const rows = data.events.map((e) => ({ ...e, user_id: userId }));
      const r = await supabase
        .from("progress_events")
        .upsert(rows, { onConflict: "user_id,kind,ref", ignoreDuplicates: true });
      if (r.error) {
        console.warn(
          "[account] Supabase recordEvents failed, falling back to local SQLite:",
          r.error,
        );
        return localDb.recordEvents(userId, data.events);
      }
      localDb.recordEvents(userId, data.events);
      return ok(rows.length);
    } catch (err) {
      console.warn("[account] Supabase recordEvents exception, falling back to local SQLite:", err);
      return localDb.recordEvents(userId, data.events);
    }
  });

export const exportDossier = createServerFn({ method: "GET" })
  .middleware([resilientAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { localDb } = await import("./db.server");
    return ok(localDb.exportLearnerDossier(userId));
  });
