/**
 * Near-natural TTS pause targets (ms).
 * Differentiated breaths beat a single shared clause gap.
 *
 * JA values stay short: neural Nanami already leaves a tiny gap when starting
 * the next utterance, so large chain pauses stack and sound instructional.
 */

/** English chain: before `(`, `;` / em-dash / tip newlines / sentence splits. */
export const SPEECH_EN_CHAIN_PAUSE_MS = 400;

/** Japanese sentence breath after `。` / `！` / `？` (conversational). */
export const SPEECH_JA_SENTENCE_PAUSE_MS = 280;

/** Japanese phrase comma breath after `、` (brief phrase break). */
export const SPEECH_JA_COMMA_PAUSE_MS = 120;

/** Brief JP→EN voice-switch inside one mixed line. */
export const SPEECH_JP_EN_HANDOFF_MS = 220;

/** Gap between separate bilingual fields (JP headword → EN gloss). */
export const SPEECH_BILINGUAL_FIELD_GAP_MS = 250;

/**
 * @deprecated Prefer the specific pause constants above.
 * Kept as the English chain default for older imports.
 */
export const SPEECH_CLAUSE_PAUSE_MS = SPEECH_EN_CHAIN_PAUSE_MS;
