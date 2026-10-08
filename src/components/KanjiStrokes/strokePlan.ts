/**
 * Timing for a word written stroke by stroke.
 *
 * Kanji strokes play one after another (slightly overlapped, like a brush
 * that lifts and lands again); kana between kanji appear in their turn
 * (集 → ま → る). The whole word is capped so a 20-stroke word still fits
 * a Short's rhythm.
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
  /** Draw time of one stroke. */
  strokeMs?: number;
  /** Start-to-start time between strokes (at most). */
  stepMs?: number;
  /** Time slot of a kana / non-kanji character. */
  textMs?: number;
  /** Cap for the whole word; steps shrink to fit. */
  maxTotalMs?: number;
}

const DEFAULTS: Required<PlanOptions> = {
  strokeMs: 300,
  stepMs: 210,
  textMs: 140,
  maxTotalMs: 3200,
};

export function planStrokes(word: string, data: StrokeData, options: PlanOptions = {}): StrokePlan {
  const o = { ...DEFAULTS, ...options };
  const chars = [...word];
  const strokeCount = chars.reduce((n, ch) => n + (data[ch]?.length ?? 0), 0);
  const textCount = chars.filter((ch) => !data[ch]).length;

  // Shrink the stroke step (never the draw time) until the word fits the cap.
  let step = o.stepMs;
  if (strokeCount > 0) {
    const budget = o.maxTotalMs - o.strokeMs - textCount * o.textMs;
    step = Math.max(60, Math.min(o.stepMs, budget / Math.max(1, strokeCount - 1)));
  }

  const planned: PlannedChar[] = [];
  let t = 0;
  let end = 0;
  for (const ch of chars) {
    const ds = data[ch];
    if (ds && ds.length) {
      const start = t;
      const strokes = ds.map((d, i) => ({ d, delay: start + i * step, duration: o.strokeMs }));
      planned.push({ kind: "kanji", ch, start, strokes });
      t = start + ds.length * step;
      end = Math.max(end, start + (ds.length - 1) * step + o.strokeMs);
    } else {
      planned.push({ kind: "text", ch, start: t });
      t += o.textMs;
      end = Math.max(end, t);
    }
  }
  return { chars: planned, totalMs: Math.round(end), strokeCount };
}

/** True when at least one character of the word has stroke data. */
export function hasStrokes(word: string, data: StrokeData): boolean {
  return [...word].some((ch) => (data[ch]?.length ?? 0) > 0);
}
