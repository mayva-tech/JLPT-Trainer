import type { StrokeData } from "./strokePlan";

/**
 * The stroke data (~1 MB of SVG paths) is its own chunk, loaded the first
 * time a stroke animation is needed, so other screens never pay for it.
 */
let cache: StrokeData | null = null;
let pending: Promise<StrokeData> | null = null;

export function loadKanjiStrokes(): Promise<StrokeData> {
  if (cache) return Promise.resolve(cache);
  pending ??= import("./kanjiStrokes.data").then((m) => {
    cache = m.KANJI_STROKES;
    return cache;
  });
  return pending;
}

/** Already-loaded data, or null (no loading started). */
export function kanjiStrokesIfLoaded(): StrokeData | null {
  return cache;
}
