import type { VocabularyItem } from "../types/vocabulary";

export type VocabularyQuizQuestionType =
  | "japanese-to-english"
  | "english-to-japanese"
  | "audio-to-english"
  | "phrase-context"
  | "sentence-context";

export type VocabularyQuizChoiceKind = "english" | "japanese";

export type VocabularyQuizQuestion = {
  type: VocabularyQuizQuestionType;
  item: VocabularyItem;
  /** Surface text shown as the main prompt (may include blanks). */
  promptText: string;
  /** English prompt for EN→JP questions. */
  promptEnglish?: string;
  choices: string[];
  correctChoiceIndex: number;
  choiceKind: VocabularyQuizChoiceKind;
  /** Original phrase/sentence before blanking (for reveal). */
  contextSource?: string;
  contextReading?: string;
  audioPath?: string;
};
