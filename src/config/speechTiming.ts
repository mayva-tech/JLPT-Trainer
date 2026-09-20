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
export const SPEECH_EN_CHAIN_PAUSE_MS = 200;

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
 * English comma breath. EN needs a real breath at `,` — it is not split into
 * separate utterances, so there is no natural handoff gap to lean on.
 * Also used as the JA karaoke *visual* dwell weight at `、` (see
 * SPEECH_JA_COMMA_PAUSE_MS below for why the real JA audio silence differs).
 */
export const SPEECH_COMMA_PAUSE_MS = 80;

/**
 * Japanese sentence breath after `。` / `！` / `？`.
 * Near-zero: the next-utterance handoff is the audible pause.
 */
export const SPEECH_JA_SENTENCE_PAUSE_MS = 60;

/**
 * Japanese `、` chain pause — real silence added between the two Nanami
 * utterances split at a comma.
 *
 * Zero, deliberately: unlike English, a JA comma sits inside one breath group
 * and native speakers barely pause there — often less than the sentence
 * boundary that follows it, not three times more. Nanami's own handoff gap
 * between speak() calls is the audible pause; adding SPEECH_COMMA_PAUSE_MS
 * (120ms) on top made 、 pause longer than 。, which is backwards from natural
 * pacing and was audible as a stall (e.g. "…ございます。では、いくつか…" —
 * では、held longer than the sentence break before it).
 *
 * This was already the value once (see "Drop JA chain timeouts so pauses use
 * utterance handoff only"); a later merge coupled it to the shared EN/JA
 * comma constant and reintroduced the 120ms. Keep this independent of
 * SPEECH_COMMA_PAUSE_MS so raising the EN comma breath never drags JA along.
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
