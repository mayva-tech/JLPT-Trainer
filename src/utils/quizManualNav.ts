/**
 * Pure quiz index navigation for manual ←/→ review.
 * Callers must pass the live index (e.g. quizIndexRef.current).
 */

/** Previous review index, or null when already at the first question. */
export function quizPrevReviewIndex(quizIndex: number): number | null {
  if (quizIndex <= 0) return null;
  return quizIndex - 1;
}

/**
 * Next review index, or `"finished"` when advancing past the last question.
 */
export function quizNextReviewIndex(
  quizIndex: number,
  total: number
): number | "finished" {
  if (total <= 0 || quizIndex >= total - 1) return "finished";
  return quizIndex + 1;
}

/** Resolve the current deck question using a live index (ref-backed). */
export function quizQuestionAt<T>(
  deck: readonly T[],
  quizIndex: number
): T | undefined {
  return deck[quizIndex];
}
