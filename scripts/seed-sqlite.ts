import { getDatabase, seedDatabaseSync } from "../src/lib/neet/db.server.ts";

console.log("==================================================");
console.log("   SYSTEM DESIGN PACK - SYNCHRONOUS SQLITE SEED   ");
console.log("==================================================");

const db = getDatabase();
const stats = seedDatabaseSync(db, { force: true });

console.log(`\nDatabase seeded in ${stats.durationMs.toFixed(2)}ms (< 1000ms goal)`);
console.log("\nTable Counts:");
console.table(stats.counts);

const expected: Record<keyof typeof stats.counts, number> = {
  articles: 120,
  sources: 320,
  practice_prompts: 73,
  roles: 28,
  coverage_deep: 50,
  coverage_research: 28,
  scrape_audit: 162,
  pack_meta: 2,
};

let allMatch = true;
for (const [table, expectedCount] of Object.entries(expected)) {
  const actual = stats.counts[table as keyof typeof stats.counts];
  if (actual !== expectedCount) {
    console.error(`Mismatch for ${table}: expected ${expectedCount}, got ${actual}`);
    allMatch = false;
  }
}

if (!allMatch) {
  console.error("\nFAIL: Table counts did not match expected values!");
  process.exit(1);
}

if (stats.durationMs > 1000) {
  console.error(`\nFAIL: Seeding took longer than 1000ms (${stats.durationMs.toFixed(2)}ms)`);
  process.exit(1);
}

console.log(
  "\nSUCCESS: All 120 articles, 320 sources, 73 prompts, 28 roles, 50 deep coverage, 28 research coverage, 162 audit items, and pack metadata verified cleanly!",
);
