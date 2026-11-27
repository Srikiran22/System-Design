import { describe, expect, it } from "vitest";
import {
  MAX_PG_INT4,
  bucketByDay,
  disciplineOf,
  heatmapGrid,
  initialsFrom,
  level,
  seedFrom,
  streaks,
} from "./progress-math";

describe("initials signature source", () => {
  it("uses only initials, max three", () => {
    expect(initialsFrom("srikiran v")).toBe("SV");
    expect(initialsFrom("  ada  byron lovelace king ")).toBe("ABL");
    expect(initialsFrom("")).toBe("U");
  });
  it("seed is deterministic and strictly clamped to PostgreSQL signed INT4 [1, 2_147_483_647]", () => {
    expect(seedFrom("SV")).toBe(seedFrom("SV"));
    expect(seedFrom("SV")).not.toBe(seedFrom("VS"));
    const samples = [
      "",
      "U",
      "SV",
      "ZZZ",
      "AAA",
      "999",
      "λΩ∑",
      "a".repeat(200),
      ...Array.from({ length: 1000 }, (_, i) => `user-${i}-${String.fromCharCode(65 + (i % 26))}`),
    ];
    for (const s of samples) {
      const seed = seedFrom(s);
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(1);
      expect(seed).toBeLessThanOrEqual(MAX_PG_INT4);
    }
  });
});

describe("heatmap", () => {
  it("levels follow 0/1/2-3/4-5/6+", () => {
    expect([0, 1, 3, 5, 6].map(level)).toEqual([0, 1, 2, 3, 4]);
  });
  it("grid is 52 weeks x 7 days and ends in the current week", () => {
    const today = new Date(2026, 10, 5);
    const g = heatmapGrid(bucketByDay(["2026-11-05", "2026-11-05"]), today);
    expect(g).toHaveLength(52);
    expect(g.every((c) => c.length === 7)).toBe(true);
    const cell = g.flat().find((c) => c.date === "2026-11-05");
    expect(cell?.count).toBe(2);
    expect(g.flat().find((c) => c.date === "2026-11-07")?.future).toBe(true);
  });
});

describe("streaks", () => {
  const today = new Date(2026, 10, 5);
  it("current streak survives an empty today", () => {
    const s = streaks(bucketByDay(["2026-11-02", "2026-11-03", "2026-11-04"]), today);
    expect(s).toEqual({ current: 3, longest: 3 });
  });
  it("gap breaks current but keeps longest", () => {
    const s = streaks(bucketByDay(["2026-10-01", "2026-10-02", "2026-10-03", "2026-11-05"]), today);
    expect(s).toEqual({ current: 1, longest: 3 });
  });
});

describe("discipline mapping", () => {
  it("maps skill prefixes", () => {
    expect(disciplineOf("st-loops")).toBe("st");
    expect(disciplineOf("xx-a")).toBeNull();
  });
});
