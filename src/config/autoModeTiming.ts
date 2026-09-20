/** Adjustable pauses for Auto Mode lesson flow. */
export const autoModeTiming = {
  shortPause: 700,
  normalPause: 1200,
  /** Hold on category intro (Daily Life • Emotions, etc.) before first word/pattern. */
  categoryPause: 3000,
  formationPause: 3000,
  /** Floor for the repeat-hold, so very short lines still get thinking time. */
  shadowingPause: 2200,
  /** Repeat-hold as a multiple of the spoken length of the line. */
  shadowingPauseRatio: 1.5,
  /** Fixed reaction time added on top of the spoken length. */
  shadowingPauseLeadMs: 500,
  /** Cap so very long lines don't stall the lesson forever. */
  shadowingPauseMax: 12000,
  betweenItemsPause: 1800,
} as const;

/** ms per mora at rate 1 — matches the karaoke model in speechHighlightUnits. */
const MORA_MS = 145;

/**
 * Rough spoken length of a Japanese line, in ms at rate 1.
 * Kanji average close to two mora per character; kana are one; small kana and
 * punctuation carry none.
 */
function spokenLengthMs(sentence: string): number {
  let mora = 0;
  for (const ch of sentence) {
    if (/[ぁぃぅぇぉゃゅょっァィゥェォャュョッ]/.test(ch)) continue;
    if (/[\u4e00-\u9faf]/.test(ch)) mora += 1.8;
    else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(ch)) mora += 1;
    else if (/\d/.test(ch)) mora += 1.5;
    else if (/\S/.test(ch) && !/[、。！？,.!?・「」]/.test(ch)) mora += 0.5;
  }
  return mora * MORA_MS;
}

/**
 * Shadowing "Repeat…" hold.
 *
 * Scales with how long the line actually takes to say, rather than raw
 * character count. The old flat floor gave a ten-character line five seconds
 * of silence — over three times the time needed to say it — which reads as the
 * lesson having stalled. A constant ratio keeps the beat even across lengths.
 */
export function shadowingPauseFor(sentence: string): number {
  const spoken = spokenLengthMs(sentence.replace(/\s+/g, ""));
  const scaled =
    spoken * autoModeTiming.shadowingPauseRatio +
    autoModeTiming.shadowingPauseLeadMs;
  return Math.min(
    Math.max(scaled, autoModeTiming.shadowingPause),
    autoModeTiming.shadowingPauseMax
  );
}
