import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/neet/progress-math";

const RAMP = " .·:-=+*#%@";

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Cursor-reactive ASCII particle field (inspired by bencho ascii-wake "particles").
 * Browser-only: everything runs inside useEffect. Pauses when hidden or off-screen.
 */
export function AsciiParticles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const cell = 14;
    let w = 0,
      h = 0,
      cols = 0,
      rows = 0,
      raf = 0,
      visible = true;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
    let wake: Float32Array = new Float32Array(0);
    const color = cssVar("--muted-foreground", "#888");
    const accent = cssVar("--accent", "#0a84ff");
    const still = reducedMotion();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      wake = new Float32Array(cols * rows);
      ctx.font = `${cell - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left,
        y = e.clientY - r.top;
      mouse.vx = x - mouse.x;
      mouse.vy = y - mouse.y;
      mouse.x = x;
      mouse.y = y;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      const mc = Math.floor(mouse.x / cell),
        mr = Math.floor(mouse.y / cell);
      const speed = Math.min(1, Math.hypot(mouse.vx, mouse.vy) / 30);
      for (let r = -4; r <= 4; r++)
        for (let c = -4; c <= 4; c++) {
          const cc = mc + c,
            rr = mr + r;
          if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) continue;
          const d = Math.hypot(c, r);
          if (d <= 4)
            wake[rr * cols + cc] = Math.max(wake[rr * cols + cc]!, (1 - d / 4) * (0.5 + speed));
        }
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const n = Math.sin(c * 0.18 + time * 0.6) * Math.cos(r * 0.22 - time * 0.4) * 0.5 + 0.5;
          const base = n * n * 0.45;
          const wk = wake[i]!;
          const v = Math.min(1, base + wk);
          if (v < 0.08) continue;
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]!;
          ctx.globalAlpha = 0.15 + v * 0.55;
          ctx.fillStyle = wk > 0.25 ? accent : color;
          ctx.fillText(ch, c * cell, r * cell);
          wake[i] = wk * 0.93;
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (visible && !document.hidden) draw(t);
      raf = requestAnimationFrame(loop);
    };
    if (still) draw(0);
    else raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(0);
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}

/**
 * ASCII signature generated only from initials (inspired by bencho ascii-wake "signature").
 * `progress` (0–1) reveals the stroke left→right while the user holds to sign.
 */
export function AsciiSignature({
  initials,
  seed,
  progress = 1,
  className = "",
  cell = 9,
}: {
  initials: string;
  seed: number;
  progress?: number;
  className?: string;
  cell?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rand = mulberry32(seed || 1);
    const slant = -0.18 - rand() * 0.12;
    const fonts = ["italic 700", "italic 600", "italic 800"];
    const weight = fonts[Math.floor(rand() * fonts.length)]!;
    const ink = cssVar("--foreground", "#111");
    const accent = cssVar("--accent", "#0a84ff");
    const still = reducedMotion();
    let w = 0,
      h = 0,
      cols = 0,
      rows = 0,
      raf = 0;
    let mask: Float32Array = new Float32Array(0);
    const mouse = { x: -999, y: -999 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / cell);
      rows = Math.floor(h / cell);
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d")!;
      o.fillStyle = "#000";
      o.font = `${weight} ${Math.floor(rows * 0.8)}px Georgia, "Times New Roman", serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.setTransform(1, 0, slant, 1, rows * 0.1, 0);
      o.fillText(initials, cols / 2, rows / 2);
      // flourish underline unique to the seed
      o.setTransform(1, 0, 0, 1, 0, 0);
      o.lineWidth = Math.max(1, rows * 0.05);
      o.strokeStyle = "#000";
      o.beginPath();
      const y0 = rows * (0.8 + rand() * 0.06);
      o.moveTo(cols * 0.12, y0);
      o.bezierCurveTo(
        cols * 0.35,
        y0 + rows * 0.12 * (rand() - 0.5),
        cols * 0.65,
        y0 - rows * 0.15 * rand(),
        cols * 0.9,
        y0 - rows * 0.08,
      );
      o.stroke();
      const px = o.getImageData(0, 0, cols, rows).data;
      mask = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) mask[i] = px[i * 4 + 3]! / 255;
      ctx.font = `${cell}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const reveal = progressRef.current * cols;
      const time = t / 1000;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const m = mask[r * cols + c]!;
          if (m < 0.1 || c > reveal) continue;
          const dx = c * cell - mouse.x,
            dy = r * cell - mouse.y;
          const d = Math.hypot(dx, dy);
          const push = d < 40 ? (1 - d / 40) * 6 : 0;
          const jitter = still ? 0 : Math.sin(time * 2 + c * 0.7 + r) * 0.08;
          const v = Math.min(1, m + jitter);
          const ch =
            RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1))))]!;
          ctx.fillStyle = push > 0 || c > reveal - 2 ? accent : ink;
          ctx.globalAlpha = 0.35 + v * 0.65;
          ctx.fillText(
            ch,
            c * cell + (d ? (dx / d) * push : 0),
            r * cell + (d ? (dy / d) * push : 0),
          );
        }
      ctx.globalAlpha = 1;
    };
    const loop = (t: number) => {
      if (!document.hidden) draw(t);
      raf = requestAnimationFrame(loop);
    };
    build();
    if (still) draw(0);
    else raf = requestAnimationFrame(loop);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      build();
      if (still) draw(0);
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [initials, seed, cell]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Signature: ${initials}`}
      className={`block h-full w-full ${className}`}
    />
  );
}
