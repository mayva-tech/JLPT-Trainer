/**
 * Onomatopoeia (オノマトペ) content types.
 *
 * This is an INDEPENDENT content database. It is intentionally kept separate
 * from the N2 grammar corpus and the vocabulary corpus so that item counts,
 * lessons, quizzes and progress remain isolated per category.
 */

export type OnomatopoeiaJlptLevel = 'N5' | 'N4' | 'N3' | 'N2';

export type OnomatopoeiaCategoryId =
  | 'emotion'
  | 'movement'
  | 'state'
  | 'manner'
  | 'sound'
  | 'other';

export interface OnomatopoeiaCategory {
  id: OnomatopoeiaCategoryId;
  /** Japanese label shown in the UI, e.g. 感情・気持ち */
  japanese: string;
  /** English label used for filter chips, e.g. Emotion */
  english: string;
  /** Short helper line for the filter bar / tooltips */
  description: string;
}

export interface OnomatopoeiaItem {
  /** Stable id, e.g. 'ono-001'. Used for audio paths and progress keys. */
  id: string;
  /** The expression itself, always written in kana. */
  japanese: string;
  /** Kana reading. Identical to `japanese` for kana-only expressions, kept for interface parity with the other corpora. */
  reading: string;
  /** Natural English meaning. */
  meaning: string;
  category: OnomatopoeiaCategoryId;
  /** What a native speaker actually feels when using it: register, connotation, common pitfalls. */
  nuance: string;
  /** Typical grammatical frame, e.g. 'ぐっすり + 眠る' or '〜がぴったりだ'. */
  collocation: string;
  exampleJapanese: string;
  /**
   * Kana reading of the example sentence.
   * Tokens are space-separated by word unit, particles stand alone,
   * and punctuation is attached to the preceding token.
   */
  exampleReading: string;
  exampleEnglish: string;
  jlptLevel: OnomatopoeiaJlptLevel;
}

export type OnomatopoeiaAudioPart = 'word' | 'sentence';

/** Highlighted line while the card Play sequence is speaking. */
export type OnomatopoeiaPart =
  | 'categoryJa'
  | 'categoryEn'
  | 'word'
  | 'meaning'
  | 'collocation'
  | 'nuance'
  | 'example'
  | 'exampleEn';
