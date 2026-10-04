import type { VocabularyItem } from "../../types/vocabulary";

/** One N3 vocabulary record before kanji details / audio paths are derived. */
export type VocabularyN3Seed = Omit<
  VocabularyItem,
  "jlpt" | "category" | "kanjiDetails" | "audioWord" | "audioPhrase" | "audioSentence"
> & {
  /** Audio subfolder: /audio/n3/{folder}/{id}-word.mp3 */
  folder: string;
};
