import type { TocItemId } from "../data/toc";

const VOCAB_QUIZ_ID_RE = /^quiz-vocab-(\d+)-(\d+)$/;
const N1_VOCAB_QUIZ_ID_RE = /^quiz-vocab-n1-(\d+)$/;
const MAX_VOCAB_LESSON = 75;
const MAX_N1_VOCAB_LESSON = 3;

/**
 * Resolve a vocabulary quiz TOC id to its lesson id.
 * `quiz-vocab-1-10` → `lesson-01`, `quiz-vocab-491-500` → `lesson-50`.
 * `quiz-vocab-n1-01` → `n1-lesson-01` (curated N1 lessons reference
 * non-contiguous word ids, so they use an explicit lesson number instead of
 * the decade-range algorithm below).
 * Returns null for grammar / mixed / final / unrelated ids.
 */
export function getVocabularyLessonIdForQuiz(
  quizTocId: TocItemId | string | null
): string | null {
  if (!quizTocId) return null;

  const n1Match = N1_VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (n1Match) {
    const n1LessonNumber = Number(n1Match[1]);
    if (
      !Number.isInteger(n1LessonNumber) ||
      n1LessonNumber < 1 ||
      n1LessonNumber > MAX_N1_VOCAB_LESSON
    ) {
      return null;
    }
    return `n1-lesson-${String(n1LessonNumber).padStart(2, "0")}`;
  }

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
