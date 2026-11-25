import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireVerifiedAuth, type VerifiedAuthContext } from "./auth-server";
import { logEvent } from "./logger";
import type { LearnerDossier, LearnerEvidenceRecord } from "./db.server";

/** Every account call returns a typed result instead of throwing, so the UI can always degrade gracefully. */
export type Result<T> = { data: T; error: null } | { data: null; error: string };

const ok = <T>(data: T): Result<T> => ({ data, error: null });
const fail = (msg: string, detail?: unknown): Result<never> => {
  if (detail) logEvent("error", "account", msg, { detail });
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
  evidence: LearnerEvidenceRecord[];
  authMode: "supabase" | "local_dev";
}

export type AccountAuthContext = VerifiedAuthContext;

/** Fail-closed verified auth middleware (kept under both names for import compatibility). */
export const resilientAuth = requireVerifiedAuth;
export { requireVerifiedAuth };

/** Validates YYYY-MM-DD represents a real Gregorian calendar date. */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<Me>> => {
    const { supabase, userId, authMode } = context;

    if (authMode === "local_dev" || !supabase) {
      const { localDb } = await import("./db.server");
      const r = localDb.getMe(userId);
      if (r.error || !r.data) return fail(r.error || "Couldn't load your profile.");
      return ok({
        ...r.data,
        evidence: localDb.listLearnerEvidence(userId),
        authMode: "local_dev",
      });
    }

    // Production canonical path: Supabase ONLY (no silent fallback to local SQLite)
    try {
      const [p, g, e] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, initials, signature_seed, signed_at")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("learning_goals")
          .select("id, text")
          .eq("user_id", userId)
          .order("created_at"),
        supabase
          .from("progress_events")
          .select("kind, ref, discipline, occurred_on")
          .eq("user_id", userId)
          .order("occurred_on")
          .limit(5000),
      ]);
      if (p.error || g.error || e.error) {
        return fail("Account service temporarily unavailable.", p.error ?? g.error ?? e.error);
      }
      let profile = p.data;
      if (!profile) {
        const ins = await supabase
          .from("profiles")
          .insert({ id: userId, display_name: "", initials: "U" })
          .select("display_name, initials, signature_seed, signed_at")
          .single();
        if (ins.error) return fail("Couldn't initialize your profile.", ins.error);
        profile = ins.data;
      }
      return ok({
        profile,
        goals: g.data ?? [],
        events: e.data ?? [],
        evidence: [],
        authMode: "supabase",
      });
    } catch (err) {
      return fail("Account service temporarily unavailable.", err);
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
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => signSchema.parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId, authMode } = context;

    if (authMode === "local_dev" || !supabase) {
      const { localDb } = await import("./db.server");
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
      if (up.error) return fail("Couldn't save your signature.", up.error);

      const existing = await supabase
        .from("learning_goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((existing.count ?? 0) < 3) {
        const g = await supabase
          .from("learning_goals")
          .insert({ user_id: userId, text: data.goal });
        if (g.error) {
          logEvent("warn", "account", "goal_insert_after_sign_failed", { detail: g.error });
        }
      }
      return ok(true);
    } catch (err) {
      return fail("Couldn't save your signature.", err);
    }
  });

export const addGoal = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => z.object({ text: z.string().trim().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId, authMode } = context;

    if (authMode === "local_dev" || !supabase) {
      const { localDb } = await import("./db.server");
      return localDb.addGoal(userId, data.text);
    }

    try {
      const r = await supabase.from("learning_goals").insert({ user_id: userId, text: data.text });
      if (r.error) {
        if (r.error.message.includes("up to 3")) {
          return fail("You can keep up to 3 learning goals.");
        }
        return fail("Couldn't add that goal.", r.error);
      }
      return ok(true);
    } catch (err) {
      return fail("Couldn't add that goal.", err);
    }
  });

export const removeGoal = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> => {
    const { supabase, userId, authMode } = context;

    if (authMode === "local_dev" || !supabase) {
      const { localDb } = await import("./db.server");
      return localDb.removeGoal(userId, data.id);
    }

    try {
      const r = await supabase
        .from("learning_goals")
        .delete()
        .eq("id", data.id)
        .eq("user_id", userId);
      if (r.error) return fail("Couldn't remove that goal.", r.error);
      return ok(true);
    } catch (err) {
      return fail("Couldn't remove that goal.", err);
    }
  });

const eventSchema = z.object({
  kind: z.enum(["lesson", "lab", "quiz", "explain", "article"]),
  ref: z.string().trim().min(1).max(200),
  discipline: z.enum(["st", "sd", "en"]).nullable(),
  occurred_on: z.string().refine(isValidCalendarDate, "Invalid calendar date (YYYY-MM-DD)"),
});

const evidenceInputSchema = z.object({
  idempotency_key: z.string().trim().min(1).max(200),
  skill_id: z.string().trim().min(1).max(100),
  evidence_type: z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]),
  ref: z.string().trim().min(1).max(200),
  score: z.number().min(0).max(1),
  weight: z.number().min(0.1).max(10),
  confidence: z.number().min(0).max(1).nullable(),
  verification_tier: z.enum([
    "self-assessed",
    "automated-check",
    "rubric-evaluated",
    "reviewer-verified",
  ]),
  rubric_version: z.string().max(40).nullable(),
  rubric_scores_json: z.string().max(4000).nullable(),
  artifact_url: z
    .string()
    .max(500)
    .refine(
      (u) => !u || /^https?:\/\//i.test(u) || u.startsWith("/"),
      "Artifact URL must use http(s) or a relative path",
    )
    .nullable(),
  artifact_notes: z.string().max(8000).nullable(),
  occurred_at: z.string().datetime({ offset: true }).or(z.string().min(10).max(40)),
});

export const recordEvents = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) =>
    z
      .object({
        events: z.array(eventSchema).min(1).max(500),
        evidence: z.array(evidenceInputSchema).max(500).optional(),
        snapshotJson: z.string().max(250_000).optional(),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<Result<{ syncedEvents: number; syncedEvidence: number }>> => {
      const { supabase, userId, authMode } = context;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        const evRes = localDb.recordEvents(userId, data.events);
        if (evRes.error) return fail(evRes.error);

        let syncedEvidence = 0;
        if (data.evidence && data.evidence.length > 0) {
          const res = localDb.recordLearnerEvidence(userId, data.evidence);
          if (res.error) return fail(res.error);
          syncedEvidence = res.data ?? 0;
        }
        if (data.snapshotJson) {
          const snapRes = localDb.saveLearnerSnapshot(userId, data.snapshotJson);
          if (snapRes.error) return fail(snapRes.error);
        }
        return ok({ syncedEvents: evRes.data ?? 0, syncedEvidence });
      }

      // Production canonical path: Supabase ONLY
      try {
        const rows = data.events.map((e) => ({ ...e, user_id: userId }));
        const r = await supabase
          .from("progress_events")
          .upsert(rows, { onConflict: "user_id,kind,ref", ignoreDuplicates: true });
        if (r.error) {
          return fail("Couldn't sync progress to account. Retrying automatically.", r.error);
        }
        return ok({ syncedEvents: rows.length, syncedEvidence: 0 });
      } catch (err) {
        return fail("Couldn't sync progress to account. Retrying automatically.", err);
      }
    },
  );

export const getLearnerSnapshotFn = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(
    async ({
      context,
    }): Promise<
      Result<{
        stateJson: string | null;
        updatedAt: string | null;
        evidence: LearnerEvidenceRecord[];
      }>
    > => {
      const { userId, authMode, supabase } = context;
      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        const snap = localDb.getLearnerSnapshot(userId);
        const evidence = localDb.listLearnerEvidence(userId);
        return ok({
          stateJson: snap?.stateJson ?? null,
          updatedAt: snap?.updatedAt ?? null,
          evidence,
        });
      }
      return ok({ stateJson: null, updatedAt: null, evidence: [] });
    },
  );

export const exportDossier = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<LearnerDossier>> => {
    const { supabase, userId, authMode } = context;

    if (authMode === "local_dev" || !supabase) {
      const { localDb } = await import("./db.server");
      return ok(localDb.exportLearnerDossier(userId));
    }

    try {
      const [p, g, e] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, initials, signature_seed, signed_at")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("learning_goals")
          .select("id, text, created_at")
          .eq("user_id", userId)
          .order("created_at"),
        supabase
          .from("progress_events")
          .select("kind, ref, discipline, occurred_on")
          .eq("user_id", userId)
          .order("occurred_on")
          .limit(5000),
      ]);
      if (p.error || g.error || e.error) {
        return fail("Couldn't export your portfolio right now.", p.error ?? g.error ?? e.error);
      }
      const events = e.data ?? [];
      const disciplines = Array.from(
        new Set(events.map((ev) => ev.discipline).filter(Boolean)),
      ) as string[];

      return ok({
        exportDate: new Date().toISOString(),
        dossierVersion: "2.0.0",
        disclaimer:
          "Self-directed engineering learning portfolio exported from account records; not a formal INCOSE, ISO, NASA, or regulatory certification.",
        userId,
        profile: p.data ?? null,
        goals: g.data ?? [],
        events,
        evidence: [],
        metrics: {
          totalEvents: events.length,
          totalEvidenceItems: 0,
          distinctDisciplines: disciplines,
          lessonsDone: events.filter((ev) => ev.kind === "lesson").length,
          labsDone: events.filter((ev) => ev.kind === "lab").length,
          rubricEvaluatedCount: 0,
        },
      });
    } catch (err) {
      return fail("Couldn't export your portfolio right now.", err);
    }
  });

export type AuthenticatedDiagnostics = {
  authMode: "supabase" | "local_dev";
  storageEngine: string;
  walMode: boolean;
  uptimeSeconds: number;
  packCounts: {
    articles: number;
    sources: number;
    practice_prompts: number;
    roles: number;
    coverage_deep: number;
    coverage_research: number;
    scrape_audit: number;
    pack_meta: number;
  };
  yourAccountCounts: {
    goals: number;
    events: number;
    evidenceItems: number;
  };
};

/** Authenticated-only diagnostics — never exposes file paths, host OS internals, or other users' counts. */
export const getAuthenticatedDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<AuthenticatedDiagnostics>> => {
    const { supabase, userId, authMode } = context;
    const { localDb } = await import("./db.server");
    const sys = localDb.getSystemHealth();

    if (authMode === "local_dev" || !supabase) {
      const me = localDb.getMe(userId);
      const evidence = localDb.listLearnerEvidence(userId);
      return ok({
        authMode: "local_dev",
        storageEngine: "node:sqlite (local dev)",
        walMode: sys.database.walMode,
        uptimeSeconds: sys.uptimeSeconds,
        packCounts: {
          articles: sys.database.counts.articles,
          sources: sys.database.counts.sources,
          practice_prompts: sys.database.counts.practice_prompts,
          roles: sys.database.counts.roles,
          coverage_deep: sys.database.counts.coverage_deep,
          coverage_research: sys.database.counts.coverage_research,
          scrape_audit: sys.database.counts.scrape_audit,
          pack_meta: sys.database.counts.pack_meta,
        },
        yourAccountCounts: {
          goals: me.data?.goals.length ?? 0,
          events: me.data?.events.length ?? 0,
          evidenceItems: evidence.length,
        },
      });
    }

    try {
      const [g, e] = await Promise.all([
        supabase
          .from("learning_goals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("progress_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);
      return ok({
        authMode: "supabase",
        storageEngine: "Supabase PostgreSQL (RLS-enforced)",
        walMode: true,
        uptimeSeconds: sys.uptimeSeconds,
        packCounts: {
          articles: sys.database.counts.articles,
          sources: sys.database.counts.sources,
          practice_prompts: sys.database.counts.practice_prompts,
          roles: sys.database.counts.roles,
          coverage_deep: sys.database.counts.coverage_deep,
          coverage_research: sys.database.counts.coverage_research,
          scrape_audit: sys.database.counts.scrape_audit,
          pack_meta: sys.database.counts.pack_meta,
        },
        yourAccountCounts: {
          goals: g.count ?? 0,
          events: e.count ?? 0,
          evidenceItems: 0,
        },
      });
    } catch (err) {
      return fail("Diagnostics temporarily unavailable.", err);
    }
  });
