import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { recordEvents } from "@/lib/neet/account.functions";
import { useSession } from "@/hooks/use-session";
import { lessonSkill, readProgressSnapshot, type ProgressSignal } from "@/lib/neet/store";
import { disciplineOf, isoDay } from "@/lib/neet/progress-math";
import { LABS } from "@/lib/neet/content";

type Row = {
  kind: ProgressSignal["kind"];
  ref: string;
  discipline: "st" | "sd" | "en" | null;
  occurred_on: string;
};

const toRow = (s: ProgressSignal, day = isoDay(new Date())): Row => ({
  kind: s.kind,
  ref: s.ref.slice(0, 200),
  discipline: disciplineOf(s.skillId),
  occurred_on: day,
});

/** Forwards browser progress to the account; queues offline and retries; backfills local history once per user. */
export default function ProgressSync() {
  const { user } = useSession();
  const send = useServerFn(recordEvents);
  const qc = useQueryClient();
  const queue = useRef<Row[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    const flush = async () => {
      timer.current = null;
      const batch = queue.current.splice(0, 500);
      if (!batch.length) return;
      try {
        const r = await send({ data: { events: batch } });
        if (r.error) throw new Error(r.error);
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {
        queue.current.unshift(...batch); // keep for retry
        timer.current = setTimeout(flush, 15_000);
      }
    };
    const schedule = () => {
      if (!timer.current) timer.current = setTimeout(flush, 800);
    };

    // one-time backfill of what this browser already knows
    const flag = `neet.backfilled.${user.id}`;
    if (!localStorage.getItem(flag)) {
      const s = readProgressSnapshot();
      const today = isoDay(new Date());
      s.completed.forEach((k) =>
        queue.current.push(toRow({ kind: "lesson", ref: k, skillId: lessonSkill(k) }, today)),
      );
      Object.entries(s.labs).forEach(([id, v]) =>
        queue.current.push(
          toRow(
            { kind: "lab", ref: id, skillId: LABS.find((l) => l.id === id)?.skillId },
            isoDay(new Date(v.at)),
          ),
        ),
      );
      s.evidence
        .filter((e) => e.type === "quiz" && e.ref && !e.ref.startsWith("demo"))
        .forEach((e) =>
          queue.current.push(
            toRow({ kind: "quiz", ref: e.ref!, skillId: e.skillId }, isoDay(new Date(e.at))),
          ),
        );
      localStorage.setItem(flag, "1");
      schedule();
    }

    const onSig = (e: Event) => {
      queue.current.push(toRow((e as CustomEvent<ProgressSignal>).detail));
      schedule();
    };
    const onOnline = () => schedule();
    window.addEventListener("neet:progress", onSig);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("neet:progress", onSig);
      window.removeEventListener("online", onOnline);
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [user, send, qc]);

  return null;
}
