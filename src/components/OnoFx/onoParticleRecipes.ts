import type { OnoParticleKind } from "./onoFxData";

/**
 * Particle recipes for the onomatopoeia effects.
 *
 * Each particle is placed in % of the word box (x: 0 = left edge, 100 = right
 * edge; y likewise), sized in em so it scales with the word's font, rotated by
 * `r`, and animated by an `ono-a-<anim>` class. Travel (`dx`/`dy`, em) is in
 * the particle's own rotated frame.
 */

export type Shape =
  | "heart"
  | "star4"
  | "star5"
  | "dot"
  | "drop"
  | "line"
  | "arc"
  | "zig"
  | "bolt"
  | "arrow"
  | "check"
  | "swirl"
  | "cloud"
  | "crack"
  | "anger"
  | "speed"
  | "eye"
  | "flower"
  | "bubble"
  | "wave"
  | "foot"
  | "blush"
  | "speech"
  | "square"
  | "Z"
  | "!"
  | "?"
  | "…"
  | "♪"
  | "＊";

export type Anim =
  | "rise"
  | "fall"
  | "pop"
  | "flash"
  | "wave"
  | "slide"
  | "spin"
  | "drift"
  | "fly"
  | "pulse"
  | "fade"
  | "shake"
  | "step";

export interface P {
  s: Shape;
  x: number;
  y: number;
  /** Size in em. */
  k: number;
  /** Rotation, deg. */
  r?: number;
  a: Anim;
  /** Delay, ms. */
  d?: number;
  /** Travel for wave/slide/drift/fly, in em. */
  dx?: number;
  dy?: number;
  /** Colour override (otherwise the effect's accent). */
  c?: string;
}

const SWEAT = "#7ec4ec";
const WHITE = "#ffffff";

/** Radial burst of `n` items around the word centre. */
function ring(n: number, s: Shape, k: number, a: Anim, dist: number, extra: Partial<P> = {}): P[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return {
      s,
      x: 50 + Math.cos(t) * 62,
      y: 50 + Math.sin(t) * 95,
      k,
      // Rotated to point outward; the inner span then travels along its own +x.
      r: (t * 180) / Math.PI,
      a,
      d: i * 30,
      dx: dist,
      ...extra,
    };
  });
}

export const PARTICLES: Record<OnoParticleKind, readonly P[]> = {
  none: [],
  hearts: [
    { s: "heart", x: -6, y: 40, k: 0.45, a: "rise", d: 0 },
    { s: "heart", x: 104, y: 30, k: 0.55, a: "rise", d: 250 },
    { s: "heart", x: 18, y: -10, k: 0.35, a: "rise", d: 500 },
    { s: "heart", x: 84, y: -14, k: 0.4, a: "rise", d: 700 },
  ],
  sparkles: [
    { s: "star4", x: -8, y: 10, k: 0.45, a: "flash", d: 0 },
    { s: "star4", x: 106, y: 0, k: 0.55, a: "flash", d: 180 },
    { s: "star4", x: 30, y: -24, k: 0.3, a: "flash", d: 360 },
    { s: "star4", x: 72, y: 112, k: 0.35, a: "flash", d: 120 },
    { s: "star4", x: 102, y: 90, k: 0.3, a: "flash", d: 480 },
    { s: "star4", x: -4, y: 96, k: 0.3, a: "flash", d: 600 },
  ],
  stars: [
    { s: "star5", x: -8, y: 20, k: 0.45, a: "pop", d: 0, r: -15 },
    { s: "star5", x: 108, y: 14, k: 0.5, a: "pop", d: 150, r: 12 },
    { s: "star5", x: 50, y: -30, k: 0.4, a: "pop", d: 300 },
    { s: "star5", x: 20, y: 112, k: 0.3, a: "pop", d: 420, r: 20 },
    { s: "star5", x: 86, y: 114, k: 0.32, a: "pop", d: 540, r: -10 },
  ],
  zzz: [
    { s: "Z", x: 100, y: 20, k: 0.38, a: "rise", d: 0, r: -10 },
    { s: "Z", x: 110, y: -2, k: 0.5, a: "rise", d: 450, r: -6 },
    { s: "Z", x: 122, y: -26, k: 0.62, a: "rise", d: 900, r: -12 },
  ],
  rain: Array.from({ length: 9 }, (_, i) => ({
    s: "drop" as Shape,
    x: -6 + i * 14,
    y: -40 + (i % 3) * 12,
    k: 0.22 + (i % 2) * 0.06,
    a: "fall" as Anim,
    d: (i * 137) % 700,
    r: 180,
  })),
  soundwaves: [
    { s: "arc", x: 104, y: 50, k: 0.5, a: "wave", d: 0, dx: 0.5 },
    { s: "arc", x: 104, y: 50, k: 0.7, a: "wave", d: 220, dx: 0.8 },
    { s: "arc", x: -4, y: 50, k: 0.5, a: "wave", d: 0, dx: 0.5, r: 180 },
    { s: "arc", x: -4, y: 50, k: 0.7, a: "wave", d: 220, dx: 0.8, r: 180 },
  ],
  exclaim: [
    { s: "!", x: 104, y: -18, k: 0.7, a: "pop", d: 60, r: 12 },
    { s: "line", x: 90, y: -30, k: 0.35, a: "pop", d: 0, r: -60 },
    { s: "line", x: 112, y: 6, k: 0.35, a: "pop", d: 0, r: 30 },
    { s: "line", x: 120, y: -24, k: 0.3, a: "pop", d: 0, r: -15 },
  ],
  question: [
    { s: "?", x: 106, y: -14, k: 0.6, a: "pop", d: 0, r: 12 },
    { s: "?", x: -8, y: -4, k: 0.45, a: "pop", d: 250, r: -12 },
    { s: "?", x: 54, y: -34, k: 0.38, a: "pop", d: 500 },
  ],
  flow: [
    { s: "wave", x: 20, y: 112, k: 0.7, a: "slide", d: 0, dx: 1.2 },
    { s: "wave", x: 50, y: 120, k: 0.8, a: "slide", d: 150, dx: 1.2 },
    { s: "wave", x: 80, y: 110, k: 0.6, a: "slide", d: 300, dx: 1.2 },
  ],
  gloom: [
    { s: "line", x: 22, y: -18, k: 0.4, a: "fade", d: 0, r: 90 },
    { s: "line", x: 38, y: -22, k: 0.5, a: "fade", d: 120, r: 90 },
    { s: "line", x: 54, y: -18, k: 0.4, a: "fade", d: 240, r: 90 },
    { s: "line", x: 70, y: -22, k: 0.5, a: "fade", d: 360, r: 90 },
  ],
  rumble: [
    { s: "zig", x: -10, y: 30, k: 0.5, a: "shake", d: 0, r: 90 },
    { s: "zig", x: 110, y: 30, k: 0.5, a: "shake", d: 0, r: 90 },
    { s: "zig", x: 30, y: 118, k: 0.6, a: "shake", d: 100 },
    { s: "zig", x: 70, y: 118, k: 0.6, a: "shake", d: 100 },
  ],
  throb: [
    { s: "arc", x: -6, y: 20, k: 0.45, a: "pulse", d: 0, r: 200 },
    { s: "arc", x: 106, y: 20, k: 0.45, a: "pulse", d: 0, r: -20 },
    { s: "anger", x: 100, y: -18, k: 0.4, a: "pulse", d: 120 },
  ],
  arrows: [
    { s: "arrow", x: -8, y: 70, k: 0.4, a: "rise", d: 0 },
    { s: "arrow", x: 108, y: 60, k: 0.5, a: "rise", d: 200 },
    { s: "arrow", x: 50, y: -8, k: 0.35, a: "rise", d: 400 },
  ],
  burst: ring(10, "line", 0.32, "fly", 0.6),
  impact: [
    { s: "line", x: -10, y: 20, k: 0.35, a: "flash", d: 0, r: 20 },
    { s: "line", x: -14, y: 50, k: 0.4, a: "flash", d: 0 },
    { s: "line", x: -10, y: 80, k: 0.35, a: "flash", d: 0, r: -20 },
    { s: "line", x: 110, y: 20, k: 0.35, a: "flash", d: 160, r: -20 },
    { s: "line", x: 114, y: 50, k: 0.4, a: "flash", d: 160 },
    { s: "line", x: 110, y: 80, k: 0.35, a: "flash", d: 160, r: 20 },
  ],
  cracks: [
    { s: "crack", x: 8, y: 20, k: 0.5, a: "flash", d: 0 },
    { s: "crack", x: 92, y: 70, k: 0.5, a: "flash", d: 150, r: 160 },
    { s: "dot", x: 30, y: 110, k: 0.14, a: "fall", d: 200 },
    { s: "dot", x: 60, y: 108, k: 0.12, a: "fall", d: 320 },
    { s: "dot", x: 80, y: 112, k: 0.1, a: "fall", d: 420 },
  ],
  drips: [
    { s: "drop", x: 18, y: 96, k: 0.26, a: "fall", d: 0, r: 180 },
    { s: "drop", x: 46, y: 100, k: 0.32, a: "fall", d: 350, r: 180 },
    { s: "drop", x: 76, y: 96, k: 0.24, a: "fall", d: 650, r: 180 },
  ],
  check: [
    { s: "check", x: 112, y: 40, k: 0.6, a: "pop", d: 120 },
    { s: "star4", x: 120, y: 4, k: 0.25, a: "flash", d: 300 },
  ],
  swirl: [
    { s: "swirl", x: -10, y: 40, k: 0.5, a: "spin", d: 0 },
    { s: "swirl", x: 110, y: 40, k: 0.5, a: "spin", d: 100 },
  ],
  clouds: [
    { s: "cloud", x: -10, y: 10, k: 0.6, a: "drift", d: 0, dx: 0.6 },
    { s: "cloud", x: 104, y: -10, k: 0.5, a: "drift", d: 300, dx: -0.5 },
    { s: "cloud", x: 60, y: -30, k: 0.4, a: "drift", d: 600, dx: 0.4 },
  ],
  cold: [
    { s: "wave", x: -10, y: 30, k: 0.5, a: "shake", d: 0, r: 90 },
    { s: "wave", x: 110, y: 30, k: 0.5, a: "shake", d: 0, r: 90 },
    { s: "＊", x: 20, y: -20, k: 0.35, a: "fall", d: 200 },
    { s: "＊", x: 80, y: -24, k: 0.3, a: "fall", d: 500 },
  ],
  shine: [
    { s: "speed", x: 10, y: 110, k: 1.2, a: "slide", d: 0, r: -60, dx: 2.4, c: WHITE },
    { s: "star4", x: 104, y: -6, k: 0.5, a: "flash", d: 400 },
    { s: "star4", x: -4, y: 100, k: 0.3, a: "flash", d: 600 },
  ],
  chatter: [
    { s: "speech", x: -12, y: -10, k: 0.5, a: "pop", d: 0 },
    { s: "speech", x: 112, y: -14, k: 0.55, a: "pop", d: 200, r: 0 },
    { s: "speech", x: 50, y: -36, k: 0.4, a: "pop", d: 400 },
  ],
  haze: [
    { s: "wave", x: 10, y: 0, k: 0.8, a: "drift", d: 0, dx: 0.5 },
    { s: "wave", x: 90, y: 100, k: 0.8, a: "drift", d: 200, dx: -0.5 },
    { s: "wave", x: 50, y: -16, k: 0.7, a: "drift", d: 400, dx: 0.4 },
  ],
  sweat: [
    { s: "drop", x: 104, y: -4, k: 0.32, a: "fall", d: 100, c: SWEAT },
    { s: "drop", x: 116, y: 20, k: 0.24, a: "fall", d: 400, c: SWEAT },
  ],
  puff: [
    { s: "cloud", x: 108, y: 40, k: 0.45, a: "drift", d: 0, dx: 0.8 },
    { s: "cloud", x: 118, y: 20, k: 0.3, a: "drift", d: 250, dx: 1 },
  ],
  anger: [
    { s: "anger", x: 104, y: -12, k: 0.5, a: "pulse", d: 0 },
    { s: "anger", x: -6, y: -6, k: 0.36, a: "pulse", d: 200 },
  ],
  speed: [
    { s: "speed", x: -16, y: 25, k: 0.8, a: "slide", d: 0, dx: -0.8 },
    { s: "speed", x: -22, y: 50, k: 1, a: "slide", d: 60, dx: -1 },
    { s: "speed", x: -16, y: 75, k: 0.8, a: "slide", d: 120, dx: -0.8 },
  ],
  bubbles: [
    { s: "bubble", x: 10, y: 100, k: 0.25, a: "rise", d: 0 },
    { s: "bubble", x: 36, y: 110, k: 0.18, a: "rise", d: 200 },
    { s: "bubble", x: 64, y: 104, k: 0.3, a: "rise", d: 400 },
    { s: "bubble", x: 90, y: 110, k: 0.2, a: "rise", d: 600 },
  ],
  zap: [
    { s: "bolt", x: -8, y: 10, k: 0.5, a: "flash", d: 0, r: -15 },
    { s: "bolt", x: 108, y: 30, k: 0.6, a: "flash", d: 120, r: 15 },
    { s: "bolt", x: 50, y: -28, k: 0.4, a: "flash", d: 240 },
  ],
  steps: [
    { s: "foot", x: 6, y: 118, k: 0.24, a: "step", d: 0, r: 80 },
    { s: "foot", x: 28, y: 108, k: 0.24, a: "step", d: 250, r: 80 },
    { s: "foot", x: 50, y: 118, k: 0.24, a: "step", d: 500, r: 80 },
    { s: "foot", x: 72, y: 108, k: 0.24, a: "step", d: 750, r: 80 },
    { s: "foot", x: 94, y: 118, k: 0.24, a: "step", d: 1000, r: 80 },
  ],
  tears: [
    { s: "drop", x: 20, y: 96, k: 0.26, a: "fall", d: 0, c: SWEAT },
    { s: "drop", x: 80, y: 96, k: 0.26, a: "fall", d: 300, c: SWEAT },
    { s: "drop", x: 22, y: 100, k: 0.2, a: "fall", d: 700, c: SWEAT },
    { s: "drop", x: 78, y: 100, k: 0.2, a: "fall", d: 900, c: SWEAT },
  ],
  eyes: [
    { s: "eye", x: -12, y: 40, k: 0.5, a: "flash", d: 0 },
    { s: "eye", x: 112, y: 40, k: 0.5, a: "flash", d: 0 },
  ],
  blush: [
    { s: "blush", x: -8, y: 70, k: 0.5, a: "pulse", d: 0 },
    { s: "blush", x: 108, y: 70, k: 0.5, a: "pulse", d: 0 },
  ],
  flowers: [
    { s: "flower", x: -8, y: 20, k: 0.45, a: "pop", d: 0 },
    { s: "flower", x: 108, y: 10, k: 0.5, a: "pop", d: 180 },
    { s: "flower", x: 30, y: -26, k: 0.3, a: "pop", d: 360 },
    { s: "flower", x: 76, y: 116, k: 0.32, a: "pop", d: 520 },
  ],
  notes: [
    { s: "♪", x: -8, y: 20, k: 0.5, a: "rise", d: 0, r: -10 },
    { s: "♪", x: 108, y: 10, k: 0.55, a: "rise", d: 300, r: 10 },
    { s: "♪", x: 60, y: -20, k: 0.4, a: "rise", d: 600 },
  ],
  scatter: ring(8, "square", 0.18, "fly", 0.9),
  ellipsis: [{ s: "…", x: 112, y: 60, k: 0.6, a: "fade", d: 200 }],
};
