import type { TocItemId } from "../data/toc";

const GRAMMAR_QUIZ_ID_RE = /^quiz-grammar-(\d+)-(\d+)$/;
const MAX_GRAMMAR_LESSON = 20;
const MAX_GRAMMAR_POINT = 200;

/**
 * Resolve a grammar quiz TOC id to its grammar lesson id.
 * `quiz-grammar-1-10` → `grammar-lesson-01`,
 * `quiz-grammar-191-200` → `grammar-lesson-20`.
 * Returns null for vocabulary / mixed / final / unrelated ids.
 */
export function getGrammarLessonIdForQuiz(
  quizTocId: TocItemId | string | null
): string | null {
  if (!quizTocId) return null;

  const match = GRAMMAR_QUIZ_ID_RE.exec(quizTocId);
  if (!match) return null;

  const first = Number(match[1]);
  const last = Number(match[2]);

  if (!Number.isInteger(first) || !Number.isInteger(last)) return null;
  if (first < 1 || last !== first + 9) return null;
  if ((first - 1) % 10 !== 0) return null;
  if (last > MAX_GRAMMAR_POINT) return null;

  const lessonNumber = Math.floor((first - 1) / 10) + 1;
  if (lessonNumber < 1 || lessonNumber > MAX_GRAMMAR_LESSON) return null;

  return `grammar-lesson-${String(lessonNumber).padStart(2, "0")}`;
}
