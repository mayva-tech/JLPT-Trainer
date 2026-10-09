import { strokeLength } from "./brushGeometry";

/**
 * Timing for a word written stroke by stroke.
 *
 * Strictly one stroke at a time: each stroke starts only after the previous
 * one has finished and the brush has lifted. Longer strokes take longer to
 * draw (the brush travels further). Kana between kanji appear in their turn
 * (集 → ま → る). If the word would run past the cap, every stroke and
 * every lift is shortened by the same factor — they are never overlapped.
 */

export type StrokeData = Readonly<Record<string, readonly string[]>>;

export interface PlannedStroke {
  d: string;
  /** ms from the start of the word. */
  delay: number;
  /** ms this stroke takes to draw. */
  duration: number;
}

export type PlannedChar =
  | { kind: "kanji"; ch: string; start: number; strokes: PlannedStroke[] }
  | { kind: "text"; ch: string; start: number };

export interface StrokePlan {
  chars: PlannedChar[];
  /** ms until the last stroke / character is finished. */
  totalMs: number;
  strokeCount: number;
}

export interface PlanOptions {
  /** Fixed part of one stroke's draw time (the brush landing). */
  strokeMs?: number;
  /** Extra draw time per unit of stroke length (KanjiVG box is 109). */
  msPerUnit?: number;
  /** Pause between two strokes, while the brush lifts and moves. */
  liftMs?: number;
  /** Time slot of a kana / non-kanji character. */
  textMs?: number;
  /**
   * Cap for the whole word; strokes and lifts shrink to fit. Default:
   * 3.2 s, stretching up to 5.2 s for words with very many strokes so
   * each stroke still reads on its own.
   */
  maxTotalMs?: number;
  /** Floors when shrinking. */
  minStrokeMs?: number;
  minLiftMs?: number;
}

const DEFAULTS: Required<Omit<PlanOptions, "maxTotalMs">> = {
  strokeMs: 120,
  msPerUnit: 3.6,
  liftMs: 90,
  textMs: 160,
  minStrokeMs: 70,
  minLiftMs: 20,
};

export function planStrokes(word: string, data: StrokeData, options: PlanOptions = {}): StrokePlan {
  const o = { ...DEFAULTS, ...options };
  const chars = [...word];
  const lengths = new Map<string, number[]>();
  /** Natural draw time of every stroke, in writing order. */
  const natural: number[] = [];
  let textCount = 0;
  for (const ch of chars) {
    const ds = data[ch];
    if (ds && ds.length) {
      let ls = lengths.get(ch);
      if (!ls) {
        ls = ds.map(strokeLength);
        lengths.set(ch, ls);
      }
      for (const len of ls) natural.push(o.strokeMs + o.msPerUnit * len);
    } else {
      textCount++;
    }
  }
  const strokeCount = natural.length;

  // Shrink strokes and lifts by one factor until the word fits the cap
  // (strokes that reach their floor stay there; nothing ever overlaps).
  const lifts = Math.max(0, strokeCount - 1);
  const cap = options.maxTotalMs ?? Math.min(5200, Math.max(3200, 3200 + (strokeCount - 24) * 60));
  const budget = cap - textCount * o.textMs;
  const durationAt = (x: number, f: number) => Math.floor(Math.max(o.minStrokeMs, x * f));
  const liftAt = (f: number) => Math.floor(Math.max(o.minLiftMs, o.liftMs * f));
  const spent = (f: number) => natural.reduce((n, x) => n + durationAt(x, f), 0) + lifts * liftAt(f);
  let k = 1;
  if (strokeCount > 0 && spent(1) > budget) {
    let lo = 0;
    let hi = 1;
    for (let it = 0; it < 24; it++) {
      const mid = (lo + hi) / 2;
      if (spent(mid) <= budget) lo = mid;
      else hi = mid;
    }
    k = lo;
  }
  const lift = liftAt(k);

  const planned: PlannedChar[] = [];
  let t = 0;
  let n = 0;
  for (const ch of chars) {
    const ds = data[ch];
    if (ds && ds.length) {
      const start = n === 0 ? t : t + lift;
      let at = start;
      const strokes: PlannedStroke[] = ds.map((d, i) => {
        if (i > 0) at += lift;
        const duration = durationAt(natural[n++]!, k);
        const stroke = { d, delay: at, duration };
        at += duration;
        return stroke;
      });
      planned.push({ kind: "kanji", ch, start, strokes });
      t = at;
    } else {
      planned.push({ kind: "text", ch, start: t });
      t += o.textMs;
    }
  }
  return { chars: planned, totalMs: t, strokeCount };
}

/** True when at least one character of the word has stroke data. */
export function hasStrokes(word: string, data: StrokeData): boolean {
  return [...word].some((ch) => (data[ch]?.length ?? 0) > 0);
}
