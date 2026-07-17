/** Adjustable pauses for Auto Mode lesson flow. */
export const autoModeTiming = {
  shortPause: 700,
  normalPause: 1200,
  /** Hold on category intro (Daily Life • Emotions, etc.) before first word/pattern. */
  categoryPause: 3000,
  formationPause: 3000,
  /** Minimum repeat-hold for short shadowing sentences. */
  shadowingPause: 5000,
  /** Extra ms per character (excluding spaces/punctuation weight). */
  shadowingPausePerChar: 160,
  /** Cap so very long lines don't stall the lesson forever. */
  shadowingPauseMax: 14000,
  betweenItemsPause: 1800,
} as const;

/**
 * Shadowing "Repeat…" hold — longer for longer Japanese sentences
 * so the learner has time to speak the full line aloud.
 */
export function shadowingPauseFor(sentence: string): number {
  const chars = [...sentence.replace(/\s+/g, "")].length;
  const scaled =
    autoModeTiming.shadowingPause +
    Math.max(0, chars - 12) * autoModeTiming.shadowingPausePerChar;
  return Math.min(scaled, autoModeTiming.shadowingPauseMax);
}
