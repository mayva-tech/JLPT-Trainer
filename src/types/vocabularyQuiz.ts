import type { VocabularyItem } from "./vocabulary";

export type VocabularyQuizQuestionType = "japanese-to-english";

export type VocabularyQuizChoiceKind = "english" | "japanese";

/**
 * Shared display/source fields for quiz questions.
 * VocabularyItem is structurally assignable; grammar projects pattern → word.
 */
export type QuizSourceItem = {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  phrase?: string;
  phraseReading?: string;
  phraseMeaning?: string;
  sentence?: string;
  sentenceReading?: string;
  sentenceMeaning?: string;
  audioWord?: string;
  jlpt?: "N1" | "N2";
};

/** Japanese word → English meaning (same shape as grammar quizzes). */
export type VocabularyQuizQuestion = {
  type: "japanese-to-english";
  item: QuizSourceItem;
  choices: string[];
  correctChoiceIndex: number;
  choiceKind: "english";
  promptText: string;
};

/** Project a vocabulary record into the quiz source shape (keeps nested identity). */
export function vocabularyToQuizSource(item: VocabularyItem): QuizSourceItem {
  return item;
}
