import type { TocItem, TocItemId } from "./toc";
import {
  getGrammarItemsForLesson,
  getGrammarLessonById,
  grammarLessons,
} from "./grammar";
import { getGrammarLessonIdForQuiz } from "../utils/quizGrammarLesson";

/** Unique subcategories in first-seen order; show at most two (no +N count). */
export function formatGrammarCategorySuffix(categories: string[]): string {
  const unique: string[] = [];
  for (const c of categories) {
    const t = c.trim();
    if (t && !unique.includes(t)) unique.push(t);
  }
  if (unique.length === 0) return "";
  return unique.slice(0, 2).join(", ");
}

export function parseGrammarBatchRange(
  lessonId: string
): { first: number; last: number } | null {
  const match = /^grammar-batch-(\d+)-(\d+)$/.exec(lessonId);
  if (!match) return null;
  return { first: Number(match[1]), last: Number(match[2]) };
}

export function formatGrammarBatchRangeLabel(
  first: number,
  last: number
): string {
  return first === last ? String(first) : `${first}–${last}`;
}

export function grammarBatchRangeLabel(lessonId: string): string {
  const range = parseGrammarBatchRange(lessonId);
  if (!range) return "";
  return formatGrammarBatchRangeLabel(range.first, range.last);
}

export function grammarBatchCategorySuffix(lessonId: string): string {
  const lesson = getGrammarLessonById(lessonId);
  if (!lesson) return "";
  return formatGrammarCategorySuffix(
    getGrammarItemsForLesson(lesson).map((item) => item.subcategory)
  );
}

/** TOC / slide line: `1–10 · Degree & Limit, Judgement & Evaluation`. */
export function grammarBatchDisplayLabel(lessonId: string): string {
  const rangeLabel = grammarBatchRangeLabel(lessonId);
  const cats = grammarBatchCategorySuffix(lessonId);
  if (!rangeLabel) return cats;
  return cats ? `${rangeLabel} · ${cats}` : rangeLabel;
}

/** Build N2 grammar batch TOC lesson items (range + category themes). */
export function buildN2GrammarLessonTocItems(): TocItem[] {
  return grammarLessons
    .filter((lesson) => lesson.id.startsWith("grammar-batch-"))
    .map((lesson) => {
      const range = parseGrammarBatchRange(lesson.id);
      if (!range) {
        return {
          id: lesson.id as TocItemId,
          label: lesson.title,
          kind: "grammar" as const,
          lessonId: lesson.id,
        };
      }
      return {
        id: `grammar-f${range.first}-${range.last}` as TocItemId,
        label: grammarBatchDisplayLabel(lesson.id),
        kind: "grammar" as const,
        lessonId: lesson.id,
      };
    });
}

/** Build N2 grammar quiz TOC items with the same range + category themes. */
export function buildN2GrammarQuizTocItems(): TocItem[] {
  return grammarLessons
    .filter((lesson) => lesson.id.startsWith("grammar-batch-"))
    .map((lesson) => {
      const range = parseGrammarBatchRange(lesson.id);
      if (!range) return null;
      const quizId = `quiz-grammar-${range.first}-${range.last}`;
      if (getGrammarLessonIdForQuiz(quizId) !== lesson.id) return null;
      const base = grammarBatchDisplayLabel(lesson.id);
      return {
        id: quizId as TocItemId,
        label: base ? `Quiz ${base}` : `Quiz ${range.first}–${range.last}`,
        kind: "quiz" as const,
        quizId,
      };
    })
    .filter((item): item is TocItem => item !== null);
}
