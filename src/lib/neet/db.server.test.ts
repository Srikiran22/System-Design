import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import {
  initTablesSync,
  seedDatabaseSync,
  listArticles,
  getArticle,
  searchArticles,
  listSources,
  listPrompts,
  listRoles,
  getCoverage,
  getMe,
  signCommitment,
  addGoal,
  removeGoal,
  recordEvents,
  getSystemHealth,
  exportLearnerDossier,
} from "./db.server";

describe("Synchronous SQLite Local Database Engine", () => {
  it("seeds cleanly in under 1 second with exact counts for all tables", () => {
    const memDb = new DatabaseSync(":memory:");
    initTablesSync(memDb);
    const stats = seedDatabaseSync(memDb, { force: true });

    expect(stats.durationMs).toBeLessThan(1000);
    expect(stats.counts).toEqual({
      articles: 120,
      sources: 320,
      practice_prompts: 73,
      roles: 28,
      coverage_deep: 50,
      coverage_research: 28,
      scrape_audit: 162,
      pack_meta: 2,
    });
  });

  describe("Articles queries", () => {
    it("listArticles returns 120 items in track and number order", () => {
      const articles = listArticles();
      expect(articles.length).toBe(120);

      const first = articles[0]!;
      expect(first.slug).toBe("00-start-here");
      expect(first.number).toBe(0);
      expect(first.track).toBe("Start here");
      expect(first.track_order).toBe(0);
      expect(first.word_count).toBeGreaterThan(0);
      expect(first.summary.length).toBeGreaterThan(0);

      // Verify track order is non-decreasing
      for (let i = 1; i < articles.length; i++) {
        expect(articles[i]!.track_order).toBeGreaterThanOrEqual(articles[i - 1]!.track_order);
      }
    });

    it("getArticle returns article details, adjacent navigation, and full fileMap", () => {
      const result = getArticle("01-definitions-and-mental-models");
      expect(result).not.toBeNull();
      expect(result!.article.slug).toBe("01-definitions-and-mental-models");
      expect(result!.article.number).toBe(1);
      expect(result!.article.body).toContain("Definitions");
      expect(result!.prev).not.toBeNull();
      expect(result!.prev!.slug).toBe("00-start-here");
      expect(result!.next).not.toBeNull();
      expect(result!.next!.slug).toBe("02-systems-thinking");
      expect(Object.keys(result!.fileMap).length).toBe(120);
      expect(result!.fileMap["00_START_HERE.md"]).toBe("00-start-here");
    });

    it("getArticle returns null for non-existent slug", () => {
      expect(getArticle("non-existent-slug-xyz")).toBeNull();
    });

    it("searchArticles returns matching slugs from titles, summaries, and bodies", () => {
      const hits = searchArticles("safety case");
      expect(hits.length).toBeGreaterThan(0);
      expect(hits.some((slug) => slug.includes("safety") || slug.includes("assurance"))).toBe(true);

      const emptyHits = searchArticles("");
      expect(emptyHits).toEqual([]);
    });
  });

  describe("Structured pack queries", () => {
    it("listSources returns all 320 sources with valid IDs and titles", () => {
      const sources = listSources();
      expect(sources.length).toBe(320);
      expect(sources[0]!.source_id).toBeTruthy();
      expect(sources[0]!.title).toBeTruthy();
    });

    it("listPrompts returns all 73 prompts with exercises and artifacts", () => {
      const prompts = listPrompts();
      expect(prompts.length).toBe(73);
      expect(prompts[0]!.prompt_id).toBeTruthy();
      expect(prompts[0]!.exercise).toBeTruthy();
    });

    it("listRoles returns all 28 career roles with competencies and deliverables", () => {
      const roles = listRoles();
      expect(roles.length).toBe(28);
      expect(roles[0]!.role).toBeTruthy();
      expect(roles[0]!.career_level).toBeTruthy();
    });

    it("getCoverage returns deep, research, audit, and parsed JSON pack_meta", () => {
      const coverage = getCoverage();
      expect(coverage.deep.length).toBe(50);
      expect(coverage.research.length).toBe(28);
      expect(coverage.audit.length).toBe(162);
      expect(coverage.meta).toHaveProperty("pack_metadata");
      expect(coverage.meta).toHaveProperty("portal_entity_schema");
      expect(typeof coverage.meta["pack_metadata"]).toBe("object");
    });
  });

  describe("Account and progress queries", () => {
    const testUserId = crypto.randomUUID();

    it("getMe auto-creates initial profile for fresh user", () => {
      const res = getMe(testUserId);
      expect(res.error).toBeNull();
      expect(res.data).not.toBeNull();
      expect(res.data!.profile.display_name).toBe("");
      expect(res.data!.profile.initials).toBe("U");
      expect(res.data!.profile.signed_at).toBeNull();
      expect(res.data!.goals).toEqual([]);
      expect(res.data!.events).toEqual([]);
    });

    it("signCommitment saves signature and adds commitment goal", () => {
      const signRes = signCommitment(testUserId, {
        displayName: "Ada Lovelace",
        initials: "AL",
        seed: 1815,
        goal: "Pioneer algorithmic architecture and systems design",
      });
      expect(signRes.error).toBeNull();
      expect(signRes.data).toBe(true);

      const me = getMe(testUserId);
      expect(me.data!.profile.display_name).toBe("Ada Lovelace");
      expect(me.data!.profile.initials).toBe("AL");
      expect(me.data!.profile.signature_seed).toBe(1815);
      expect(me.data!.profile.signed_at).not.toBeNull();
      expect(me.data!.goals.length).toBe(1);
      expect(me.data!.goals[0]!.text).toBe("Pioneer algorithmic architecture and systems design");
    });

    it("addGoal adds goals up to 3 and enforces max 3 limit", () => {
      const g2 = addGoal(testUserId, "Second learning goal");
      expect(g2.error).toBeNull();

      const g3 = addGoal(testUserId, "Third learning goal");
      expect(g3.error).toBeNull();

      const g4 = addGoal(testUserId, "Fourth goal should be rejected");
      expect(g4.error).toBe("You can keep up to 3 learning goals.");

      const me = getMe(testUserId);
      expect(me.data!.goals.length).toBe(3);
    });

    it("removeGoal deletes a goal", () => {
      const meBefore = getMe(testUserId);
      const goalToRemove = meBefore.data!.goals[1]!;

      const delRes = removeGoal(testUserId, goalToRemove.id);
      expect(delRes.error).toBeNull();

      const meAfter = getMe(testUserId);
      expect(meAfter.data!.goals.length).toBe(2);
      expect(meAfter.data!.goals.some((g) => g.id === goalToRemove.id)).toBe(false);
    });

    it("recordEvents logs progress events idempotently", () => {
      const events = [
        { kind: "lesson", ref: "00-start-here", discipline: "sd", occurred_on: "2026-11-05" },
        { kind: "lab", ref: "lab-systems-thinking", discipline: "st", occurred_on: "2026-11-05" },
        { kind: "quiz", ref: "quiz-definitions", discipline: "en", occurred_on: "2026-11-05" },
      ];

      const r1 = recordEvents(testUserId, events);
      expect(r1.error).toBeNull();
      expect(r1.data).toBe(3);

      let me = getMe(testUserId);
      expect(me.data!.events.length).toBe(3);

      // Re-recording identical events must be ignored due to unique(user_id, kind, ref)
      const r2 = recordEvents(testUserId, events);
      expect(r2.error).toBeNull();

      me = getMe(testUserId);
      expect(me.data!.events.length).toBe(3);
    });

    it("getSystemHealth returns enterprise telemetry with 120 volumes and 320 sources", () => {
      const health = getSystemHealth();
      expect(health.status).toBe("healthy");
      expect(health.version).toBe("1.0.0-enterprise");
      expect(health.database.engine).toContain("node:sqlite");
      expect(health.database.walMode).toBe(true);
      expect(health.database.counts.articles).toBe(120);
      expect(health.database.counts.sources).toBe(320);
      expect(health.database.counts.practice_prompts).toBe(73);
      expect(health.database.counts.roles).toBe(28);
      expect(health.runtime.memory.rssMb).toBeGreaterThan(0);
    });

    it("exportLearnerDossier exports full portfolio with metrics", () => {
      const dossier = exportLearnerDossier(testUserId);
      expect(dossier.userId).toBe(testUserId);
      expect(dossier.profile).not.toBeNull();
      expect(dossier.profile!.display_name).toBe("Ada Lovelace");
      expect(dossier.goals.length).toBe(2);
      expect(dossier.events.length).toBe(3);
      expect(dossier.metrics.totalEvents).toBe(3);
      expect(dossier.metrics.lessonsDone).toBe(1);
      expect(dossier.metrics.labsDone).toBe(1);
      expect(dossier.metrics.distinctDisciplines.sort()).toEqual(["en", "sd", "st"]);
    });
  });
});
