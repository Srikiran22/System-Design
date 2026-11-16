import {
  pgTable,
  text,
  integer,
  bigserial,
  timestamp,
  date,
  uuid,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const articles = pgTable(
  "articles",
  {
    slug: text("slug").primaryKey(),
    filename: text("filename").notNull(),
    number: integer("number"),
    title: text("title").notNull(),
    trackOrder: integer("track_order").notNull().default(0),
    track: text("track").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull(),
    wordCount: integer("word_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("articles_track_idx").on(table.trackOrder, table.number)],
);

export const sources = pgTable("sources", {
  sort: integer("sort").notNull().default(0),
  sourceId: text("source_id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  sourceType: text("source_type"),
  relevance: text("relevance"),
  qualitySignal: text("quality_signal"),
  limitations: text("limitations"),
});

export const practicePrompts = pgTable("practice_prompts", {
  sort: integer("sort").notNull().default(0),
  promptId: text("prompt_id").primaryKey(),
  exercise: text("exercise").notNull(),
  primaryConcepts: text("primary_concepts"),
  requiredArtifacts: text("required_artifacts"),
});

export const roles = pgTable("roles", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sort: integer("sort").notNull().default(0),
  role: text("role").notNull(),
  careerLevel: text("career_level"),
  competencyAreas: text("competency_areas"),
  typicalDeliverables: text("typical_deliverables"),
  sourceAnchors: text("source_anchors"),
  portfolioProject: text("portfolio_project"),
});

export const coverageDeep = pgTable("coverage_deep", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sort: integer("sort").notNull().default(0),
  domain: text("domain").notNull(),
  depthInRepository: text("depth_in_repository"),
  newDeepVolumes: text("new_deep_volumes"),
  primarySourceAnchors: text("primary_source_anchors"),
  evidenceStatus: text("evidence_status"),
  remainingGap: text("remaining_gap"),
  nextValidationAction: text("next_validation_action"),
});

export const coverageResearch = pgTable("coverage_research", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sort: integer("sort").notNull().default(0),
  domain: text("domain").notNull(),
  knowledgeFiles: text("knowledge_files"),
  sourceAnchors: text("source_anchors"),
  knownLimitationsOrGaps: text("known_limitations_or_gaps"),
  coverageStatus: text("coverage_status"),
});

export const scrapeAudit = pgTable("scrape_audit", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sort: integer("sort").notNull().default(0),
  researchRef: text("research_ref"),
  canonicalSourceId: text("canonical_source_id"),
  title: text("title"),
  url: text("url"),
  status: text("status"),
  tools: text("tools"),
  extractionExtent: text("extraction_extent"),
  limitations: text("limitations"),
});

export const packMeta = pgTable("pack_meta", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  initials: text("initials").notNull().default(""),
  signatureSeed: integer("signature_seed").notNull().default(0),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const learningGoals = pgTable(
  "learning_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("learning_goals_user_id_idx").on(table.userId)],
);

export const progressEvents = pgTable(
  "progress_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    kind: text("kind").notNull(),
    ref: text("ref").notNull(),
    discipline: text("discipline"),
    occurredOn: date("occurred_on").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("progress_events_user_occurred_idx").on(table.userId, table.occurredOn),
    unique("progress_events_user_kind_ref_key").on(table.userId, table.kind, table.ref),
  ],
);

export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;
export type Source = InferSelectModel<typeof sources>;
export type NewSource = InferInsertModel<typeof sources>;
export type PracticePrompt = InferSelectModel<typeof practicePrompts>;
export type NewPracticePrompt = InferInsertModel<typeof practicePrompts>;
export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;
export type CoverageDeep = InferSelectModel<typeof coverageDeep>;
export type NewCoverageDeep = InferInsertModel<typeof coverageDeep>;
export type CoverageResearch = InferSelectModel<typeof coverageResearch>;
export type NewCoverageResearch = InferInsertModel<typeof coverageResearch>;
export type ScrapeAudit = InferSelectModel<typeof scrapeAudit>;
export type NewScrapeAudit = InferInsertModel<typeof scrapeAudit>;
export type PackMeta = InferSelectModel<typeof packMeta>;
export type NewPackMeta = InferInsertModel<typeof packMeta>;
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type LearningGoal = InferSelectModel<typeof learningGoals>;
export type NewLearningGoal = InferInsertModel<typeof learningGoals>;
export type ProgressEvent = InferSelectModel<typeof progressEvents>;
export type NewProgressEvent = InferInsertModel<typeof progressEvents>;
