import { flatLessons, lessonKey } from "./content";
import type { Path } from "./types";

export function pathProgress(path: Path, completed: string[]) {
  const all = flatLessons(path);
  const done = all.filter((x) => completed.includes(lessonKey(path.slug, x.lesson.slug))).length;
  return { done, total: all.length, ratio: all.length ? done / all.length : 0 };
}

export function firstOpenLesson(path: Path, completed: string[]) {
  const all = flatLessons(path);
  return all.find((x) => !completed.includes(lessonKey(path.slug, x.lesson.slug))) ?? all[0];
}
