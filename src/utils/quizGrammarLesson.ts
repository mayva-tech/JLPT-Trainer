import type { TocItemId } from "../data/toc";
import { getGrammarItemsForLesson, getGrammarLessonById } from "../data/grammar";
import { formatN3GrammarLessonId } from "../data/n3/grammarN3";
import type { GrammarItem } from "../types/grammar";

const GRAMMAR_QUIZ_ID_RE = /^quiz-grammar-(\d+)-(\d+)$/;
const N3_GRAMMAR_QUIZ_ID_RE = /^quiz-grammar-n3-(\d+)$/;

/**
 * Resolve a grammar quiz TOC id to its batch lesson id.
 * `quiz-grammar-1-10` → `grammar-batch-001-010`
 */
export function getGrammarLessonIdForQuiz(
  quizTocId: TocItemId | string | null
): string | null {
  if (!quizTocId) return null;

  // `quiz-grammar-n3-01` → `n3-grammar-batch-01`
  const n3 = N3_GRAMMAR_QUIZ_ID_RE.exec(quizTocId);
  if (n3) {
    const id = formatN3GrammarLessonId(Number(n3[1]));
    return getGrammarLessonById(id) ? id : null;
  }

  const match = GRAMMAR_QUIZ_ID_RE.exec(quizTocId);
  if (!match) return null;

  const first = Number(match[1]);
  const last = Number(match[2]);
  if (!Number.isInteger(first) || !Number.isInteger(last)) return null;
  if (first < 1 || last < first) return null;

  const id = `grammar-batch-${String(first).padStart(3, "0")}-${String(last).padStart(3, "0")}`;
  return getGrammarLessonById(id) ? id : null;
}

/** All grammar items for a grammar quiz (batch / family pool). */
export function getGrammarQuizItemsForToc(
  quizTocId: TocItemId | string | null
): GrammarItem[] {
  const lessonId = getGrammarLessonIdForQuiz(quizTocId);
  if (!lessonId) return [];
  const lesson = getGrammarLessonById(lessonId);
  if (!lesson) return [];
  // Same course-track filter as the lesson itself (N2 batches → N2 items, n3- → N3).
  return getGrammarItemsForLesson(lesson);
}
