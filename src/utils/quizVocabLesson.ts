import type { TocItemId } from "../data/toc";

const VOCAB_QUIZ_ID_RE = /^quiz-vocab-(\d+)-(\d+)$/;
const MAX_VOCAB_LESSON = 75;

/**
 * Resolve a vocabulary quiz TOC id to its lesson id.
 * `quiz-vocab-1-10` → `lesson-01`, `quiz-vocab-491-500` → `lesson-50`.
 * Returns null for grammar / mixed / final / unrelated ids.
 */
export function getVocabularyLessonIdForQuiz(
  quizTocId: TocItemId | string | null
): string | null {
  if (!quizTocId) return null;

  const match = VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (!match) return null;

  const first = Number(match[1]);
  const last = Number(match[2]);

  if (!Number.isInteger(first) || !Number.isInteger(last)) return null;
  if (first < 1 || last !== first + 9) return null;
  if ((first - 1) % 10 !== 0) return null;

  const lessonNumber = Math.floor((first - 1) / 10) + 1;
  if (lessonNumber < 1 || lessonNumber > MAX_VOCAB_LESSON) return null;

  return `lesson-${String(lessonNumber).padStart(2, "0")}`;
}
