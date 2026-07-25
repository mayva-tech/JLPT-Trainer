export type GrammarCourseLevel =
  | "N2_CORE"
  | "N2_SECONDARY"
  | "N3_REVIEW"
  | "N1";

export type GrammarItem = {
  id: number;
  jlpt: "N1" | "N2" | "N3";
  /** Curated course track — independent of raw jlpt inventory label. */
  courseLevel: GrammarCourseLevel;
  /** Teaching family; one N2 lesson = one family. */
  familyId: string;
  /** True for the pattern that introduces the family in lessons. */
  isPrimary: boolean;
  /** Alternate spellings / formal variants of this pattern (not separate families). */
  aliases?: string[];

  category: string;
  subcategory: string;

  pattern: string;
  patternReading: string;
  meaning: string;

  formation: string;

  sentence: string;
  sentenceReading: string;
  sentenceMeaning: string;

  audioSentence: string;
};

export type GrammarFamily = {
  id: string;
  title: string;
  courseLevel: GrammarCourseLevel;
  /** Primary item id (must match the item with isPrimary). */
  primaryId: number;
  memberIds: number[];
};
