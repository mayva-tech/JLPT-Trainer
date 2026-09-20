/**
 * Near-natural TTS pause targets (ms).
 * Differentiated breaths beat a single shared clause gap.
 *
 * Japanese clauses are separate utterances. Chromium already inserts a short
 * gap when starting the next speak(), so large JA chain pauses stack and
 * sound slow. Keep JA timeouts near zero; EN still needs a real breath.
 */

/** English chain: before `(`, em-dash / tip newlines / sentence splits. */
export const SPEECH_EN_CHAIN_PAUSE_MS = 400;

/**
 * English semicolon breath (`arising from; stemming from`).
 * Half of SPEECH_EN_CHAIN_PAUSE_MS — gloss lists need a quicker beat.
 */
export const SPEECH_EN_SEMICOLON_PAUSE_MS = 200;

/**
 * Japanese sentence breath after `。` / `！` / `？`.
 * Near-zero: the next-utterance handoff is the audible pause.
 */
export const SPEECH_JA_SENTENCE_PAUSE_MS = 40;

/**
 * Japanese phrase comma breath after `、`.
 * Zero: rely on utterance boundary only (no extra setTimeout).
 */
export const SPEECH_JA_COMMA_PAUSE_MS = 0;

/** Brief JP→EN voice-switch inside one mixed line. */
export const SPEECH_JP_EN_HANDOFF_MS = 220;

/** Gap between separate bilingual fields (JP headword → EN gloss). */
export const SPEECH_BILINGUAL_FIELD_GAP_MS = 250;

/**
 * @deprecated Prefer the specific pause constants above.
 * Kept as the English chain default for older imports.
 */
export const SPEECH_CLAUSE_PAUSE_MS = SPEECH_EN_CHAIN_PAUSE_MS;
