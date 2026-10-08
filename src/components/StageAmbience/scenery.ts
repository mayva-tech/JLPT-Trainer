import { createElement, type CSSProperties, type ReactNode } from "react";

/* Shared helpers for the stage-ambience scenes (no components here). */

/** Deterministic 0..1 generator (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Vars = CSSProperties & Record<`--${string}`, string | number>;

export interface ParticleSpec {
  count: number;
  seed: number;
  className: string;
  /** Seconds for one pass, min and max. */
  duration: [number, number];
  /** Size in cqw, min and max. */
  size: [number, number];
  opacity: [number, number];
  /** Horizontal start range in %, default full width. */
  left?: [number, number];
  /** Vertical start range in % (for rising / twinkling particles). */
  top?: [number, number];
}

export function particles(spec: ParticleSpec): ReactNode[] {
  const r = seeded(spec.seed);
  const lerp = ([a, b]: [number, number], t: number) => a + (b - a) * t;
  const out: ReactNode[] = [];
  for (let i = 0; i < spec.count; i++) {
    const duration = lerp(spec.duration, r());
    const style: Vars = {
      left: `${lerp(spec.left ?? [0, 100], (i + r()) / spec.count).toFixed(2)}%`,
      animationDuration: `${duration.toFixed(2)}s`,
      // Negative delay: particles are already spread out on first paint.
      animationDelay: `${(-duration * r()).toFixed(2)}s`,
      "--s": `${lerp(spec.size, r()).toFixed(2)}cqw`,
      "--o": lerp(spec.opacity, r()).toFixed(3),
      "--sway": `${(r() * 6 - 3).toFixed(2)}cqw`,
      "--spin": `${Math.round(r() * 540 - 270)}deg`,
    };
    if (spec.top) style.top = `${lerp(spec.top, r()).toFixed(2)}%`;
    out.push(
      createElement("span", {
        key: i,
        className: `amb-p ${spec.className}`,
        style,
      }),
    );
  }
  return out;
}

/* ── Motion helpers shared by the scenes ──────────────────────────── */

export function still(): boolean {
  try {
    return (
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
      false
    );
  } catch {
    return false;
  }
}

/** SMIL rotation around (cx, cy); nothing under reduced motion. */
export function spin(
  cx: number,
  cy: number,
  dur: number,
  reverse = false,
): ReactNode {
  if (still()) return null;
  return createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: reverse
      ? `360 ${cx} ${cy};0 ${cx} ${cy}`
      : `0 ${cx} ${cy};360 ${cx} ${cy}`,
    dur: `${dur}s`,
    repeatCount: "indefinite",
  });
}

/** SMIL rock between two angles around (cx, cy). */
export function rock(
  cx: number,
  cy: number,
  a: number,
  b: number,
  dur: number,
  begin = 0,
): ReactNode {
  if (still()) return null;
  return createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: `${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}`,
    dur: `${dur}s`,
    begin: `${begin}s`,
    repeatCount: "indefinite",
    calcMode: "spline",
    keySplines: "0.45 0 0.55 1;0.45 0 0.55 1",
  });
}

/** The word's kanji first (cycled), then stock characters. */
export function pick(
  glyphs: string | undefined,
  stock: string,
  count: number,
): string[] {
  const chars = [...(glyphs ?? "")];
  const fill = [...stock];
  return Array.from(
    { length: count },
    (_, i) =>
      chars[i % Math.max(1, chars.length)] ?? fill[i % fill.length] ?? "",
  );
}
