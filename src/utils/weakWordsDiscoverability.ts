import { isVocabularyQuizId } from "./vocabQuizStats";

/** Runtime TOC label for Weak Words; does not mutate static toc.ts. */
export function formatWeakWordsTocLabel(weakCount: number): string {
  if (weakCount <= 0) return "Weak Words";
  return `Weak Words (${weakCount})`;
}

/**
 * Whether finished-quiz Weak Words actions should appear.
 * Grammar and non-vocab quizzes are excluded via isVocabularyQuizId.
 */
export function shouldShowWeakWordsQuizCta(
  quizId: string | null | undefined,
  weakCount: number
): boolean {
  return weakCount > 0 && isVocabularyQuizId(quizId);
}
