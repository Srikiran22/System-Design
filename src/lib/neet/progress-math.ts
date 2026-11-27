/** Pure helpers for identity + progress. No browser or server APIs — safe everywhere and unit-tested. */

export type DisciplineCode = "st" | "sd" | "en";

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts
    .slice(0, 3)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function disciplineOf(skillId: string | undefined | null): DisciplineCode | null {
  if (!skillId) return null;
  const p = skillId.slice(0, 2);
  return p === "st" || p === "sd" || p === "en" ? p : null;
}

/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one for learners east/west of Greenwich). */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Counts per day. */
export function bucketByDay(days: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of days) m.set(d, (m.get(d) ?? 0) + 1);
  return m;
}

/** 0–4 intensity level, GitHub-style. */
export function level(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export interface HeatCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

/** Weeks (columns, Sunday-first) ending with the week containing `today`. */
export function heatmapGrid(counts: Map<string, number>, today: Date, weeks = 52): HeatCell[][] {
  const end = addDays(today, 6 - today.getDay());
  const start = addDays(end, -(weeks * 7 - 1));
  const todayKey = isoDay(today);
  const cols: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = isoDay(addDays(start, w * 7 + d));
      const count = counts.get(date) ?? 0;
      col.push({ date, count, level: level(count), future: date > todayKey });
    }
    cols.push(col);
  }
  return cols;
}

/** Current streak (counts today or, if today is empty, yesterday as still alive) and longest streak. */
export function streaks(
  counts: Map<string, number>,
  today: Date,
): { current: number; longest: number } {
  const active = [...counts.entries()]
    .filter(([, c]) => c > 0)
    .map(([d]) => d)
    .sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of active) {
    run = prev && isoDay(addDays(new Date(prev + "T00:00:00"), 1)) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  let current = 0;
  let cursor = today;
  if (!counts.get(isoDay(cursor))) cursor = addDays(cursor, -1);
  while ((counts.get(isoDay(cursor)) ?? 0) > 0) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

/** Deterministic PRNG so a signature looks the same on every device. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Maximum signed PostgreSQL INT4 value (2^31 - 1). */
export const MAX_PG_INT4 = 2_147_483_647;

/** Deterministic positive 31-bit FNV-1a seed guaranteed to fit PostgreSQL signed INT4 [1, 2147483647]. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const signed31 = h & MAX_PG_INT4;
  return signed31 === 0 ? 1 : signed31;
}
