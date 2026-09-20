/**
 * Near-natural TTS pause targets (ms).
 * Differentiated breaths beat a single shared clause gap.
 *
 * Japanese clauses are separate utterances. Chromium already inserts a short
 * gap when starting the next speak(), so large JA sentence chain pauses stack
 * and sound slow. Keep JA sentence timeouts near zero; EN still needs a real
 * breath on `;` / em-dash / tip newlines. Commas (EN `,` / JA `、`) share one
 * constant so both languages — TTS chains and karaoke — pause the same.
 */

/** English chain: before `(`, em-dash / tip newlines / sentence splits. */
export const SPEECH_EN_CHAIN_PAUSE_MS = 400;

/**
 * English semicolon breath (`arising from; stemming from`).
 * Short gloss-list beat for all EN TTS (including mixed JP/EN lines).
 */
export const SPEECH_EN_SEMICOLON_PAUSE_MS = 100;

/**
 * English colon breath (`meaning: to prepare in advance`).
 * A colon lifts into the gloss rather than stopping, so it sits between the
 * comma and the full chain pause.
 */
export const SPEECH_EN_COLON_PAUSE_MS = 250;

/**
 * Shared comma breath for EN `,` and JA `、`.
 * Used by JA utterance chains and EN/JA karaoke dwells in all speech paths.
 */
export const SPEECH_COMMA_PAUSE_MS = 120;

/**
 * Japanese sentence breath after `。` / `！` / `？`.
 * Near-zero: the next-utterance handoff is the audible pause.
 */
export const SPEECH_JA_SENTENCE_PAUSE_MS = 40;

/** Japanese `、` chain pause — same as EN comma (SPEECH_COMMA_PAUSE_MS). */
export const SPEECH_JA_COMMA_PAUSE_MS = SPEECH_COMMA_PAUSE_MS;

/** Brief JP→EN voice-switch inside one mixed line. */
export const SPEECH_JP_EN_HANDOFF_MS = 220;

/** Gap between separate bilingual fields (JP headword → EN gloss). */
export const SPEECH_BILINGUAL_FIELD_GAP_MS = 250;

/**
 * @deprecated Prefer the specific pause constants above.
 * Kept as the English chain default for older imports.
 */
export const SPEECH_CLAUSE_PAUSE_MS = SPEECH_EN_CHAIN_PAUSE_MS;
