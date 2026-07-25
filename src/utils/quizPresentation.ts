import type {
  VocabularyQuizQuestion,
  VocabularyQuizQuestionType,
} from "../types/vocabularyQuiz";

export function getQuizPromptLabel(
  _type: VocabularyQuizQuestionType,
  revealed: boolean
): string {
  void _type;
  return revealed ? "English meaning" : "What is the English meaning?";
}

export function getQuizDisplayPrompt(
  question: VocabularyQuizQuestion,
  _revealed: boolean
): string {
  void _revealed;
  return question.promptText;
}

export function shouldShowQuizWordPanel(
  _question: VocabularyQuizQuestion,
  _revealed: boolean
): boolean {
  void _question;
  void _revealed;
  return true;
}

/** Whether reading/furigana may be shown for the current ask/reveal state. */
export function shouldShowQuizReading(
  _question: VocabularyQuizQuestion,
  _revealed: boolean,
  showReading: boolean
): boolean {
  void _question;
  void _revealed;
  return showReading;
}

/** Asking-phase default: word quizzes show reading after reveal / when enabled. */
export function shouldHideReadingOnAsk(
  _question: VocabularyQuizQuestion
): boolean {
  void _question;
  return false;
}

export function isJapaneseQuizPrompt(
  _question: VocabularyQuizQuestion,
  _revealed: boolean
): boolean {
  void _question;
  void _revealed;
  return true;
}

export function getQuizExample(
  question: VocabularyQuizQuestion
): {
  text: string;
  reading?: string;
  meaning?: string;
} | null {
  const text = question.item.sentence;
  if (!text) return null;
  return {
    text,
    reading: question.item.sentenceReading,
    meaning: question.item.sentenceMeaning,
  };
}

export function choicesAreJapanese(
  _question: VocabularyQuizQuestion
): boolean {
  void _question;
  return false;
}
