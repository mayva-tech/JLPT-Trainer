/**
 * Masculine / Feminine / Neutral speech styles (話し方) content types.
 *
 * A sixth INDEPENDENT content database, alongside grammar, vocabulary,
 * onomatopoeia, word relations and phone calls.
 *
 * Design note: this corpus deliberately does NOT model Japanese as
 * "women say X, men say Y". `strength` is a five-point lean, `speakers` is a
 * list rather than a single value, and `naturalness` separates what people
 * actually say today from what only exists in fiction. Most of the corpus is
 * `neutral`, which is the honest picture of modern spoken Japanese.
 */

export type StyleLevel = "N5" | "N4" | "N3" | "N2" | "beyond";

export type StyleCategoryId =
  | "pronouns-first"
  | "pronouns-second"
  | "particles"
  | "questions"
  | "commands"
  | "negatives"
  | "sound-changes"
  | "reactions"
  | "agreement"
  | "apologies"
  | "regional"
  | "character";

export interface StyleCategory {
  id: StyleCategoryId;
  japanese: string;
  english: string;
  description: string;
}

/** Five-point lean. Derived `gender` collapses this to three buckets. */
export type StyleStrength =
  | "strongly-feminine"
  | "somewhat-feminine"
  | "neutral"
  | "somewhat-masculine"
  | "strongly-masculine";

export type StyleGender = "feminine" | "neutral" | "masculine";

export type StylePoliteness =
  | "formal"
  | "polite"
  | "casual"
  | "very-casual"
  | "rough";

export type StyleSpeaker =
  | "young-woman"
  | "adult-woman"
  | "young-man"
  | "adult-man"
  | "older-speaker"
  | "anyone";

export type StyleRelationship =
  | "stranger"
  | "coworker"
  | "friend"
  | "close-friend"
  | "partner"
  | "family";

export type StyleNaturalness =
  | "very-common"
  | "common"
  | "situational"
  | "old-fashioned"
  | "anime-drama"
  | "rough";

export interface StyleExample {
  japanese: string;
  reading: string;
  english: string;
}

export interface StyleExpression {
  id: string;
  jlptLevel: StyleLevel;
  category: StyleCategoryId;
  /**
   * Comparison group. Every expression sharing a group is a variant of the
   * same underlying thing (私 / あたし / 僕 / 俺), which is what the
   * side-by-side cards and the rewrite quiz are built from.
   */
  group: string;
  japanese: string;
  reading: string;
  romaji: string;
  english: string;
  /** Collapsed from `strength` at generation time. */
  gender: StyleGender;
  strength: StyleStrength;
  politeness: StylePoliteness;
  speakers: StyleSpeaker[];
  relationships: StyleRelationship[];
  naturalness: StyleNaturalness;
  /** How it can land wrong: rude, childish, dated, overdone, unnatural. */
  warning?: string;
  example: StyleExample;
  /** A natural counterpart to reach for instead, when one exists. */
  alternative?: string;
  tags: string[];
}

/** How one person's speech shifts across situations (spec section 11). */
export interface RegisterShiftContext {
  context: string;
  japanese: string;
  note: string;
}

export interface RegisterShift {
  id: string;
  speaker: string;
  summary: string;
  contexts: RegisterShiftContext[];
}
