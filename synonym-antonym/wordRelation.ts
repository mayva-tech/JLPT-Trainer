/**
 * Synonyms & Antonyms (類義語・反対語) content types.
 *
 * This is an INDEPENDENT content database, like the onomatopoeia corpus.
 * It must never be merged into the grammar or vocabulary corpora — the counts
 * shown for those sections stay exactly as they are.
 */

export type WordRelationLevel = "N5" | "N4" | "N3" | "N2";

/** ≈ for synonyms, ↔ for antonyms. */
export type WordRelationType = "synonym" | "antonym";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "i-adjective"
  | "na-adjective"
  | "adverb"
  | "expression";

export interface RelatedWord {
  /** Written form as a learner meets it (kanji, kana or katakana). */
  japanese: string;
  /** Hiragana/katakana reading, shown under the word. */
  reading: string;
  /** Natural English meaning. */
  meaning: string;
  partOfSpeech: PartOfSpeech;
}

export interface WordRelation {
  /** Stable id, e.g. 'rel-n2-042'. Used for progress keys. */
  id: string;
  jlptLevel: WordRelationLevel;
  type: WordRelationType;
  word1: RelatedWord;
  word2: RelatedWord;
  /**
   * Why the two words are not simply interchangeable. Present on every synonym
   * pair and on antonyms where the boundary is easy to get wrong.
   */
  nuance?: string;
  /** Derived facets for filtering: level, type and parts of speech. */
  tags: string[];
}

/** New → Learning → Learned, mapped onto the shared two-list progress model. */
export type RelationStatus = "new" | "learning" | "learned";
