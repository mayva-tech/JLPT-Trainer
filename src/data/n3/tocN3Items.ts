import type { TocItem, TocItemId } from "../toc";
import { n3Lessons } from "./lessonsN3";
import { n3GrammarLessons } from "./grammarN3";

const two = (n: number) => String(n).padStart(2, "0");

/** `N3 Vocabulary 1: Home & Chores (Words 1–10)`. */
function vocabLabel(n: number, theme: string, prefix: string): string {
  const first = (n - 1) * 10 + 1;
  return `${prefix} ${n}: ${theme} (Words ${first}–${first + 9})`;
}

const themeOf = (subcategories: string[]) => subcategories[0] ?? "";

/** N3 vocabulary lesson TOC items: `word-n3-01` → `n3-lesson-01`. */
export function buildN3VocabularyLessonTocItems(): TocItem[] {
  return n3Lessons.map((lesson, i) => ({
    id: `word-n3-${two(i + 1)}` as TocItemId,
    label: vocabLabel(i + 1, themeOf(lesson.subcategories), "N3 Vocabulary"),
    kind: "word" as const,
    lessonId: lesson.id,
  }));
}

/** N3 vocabulary quiz TOC items: `quiz-vocab-n3-01`. */
export function buildN3VocabularyQuizTocItems(): TocItem[] {
  return n3Lessons.map((lesson, i) => {
    const id = `quiz-vocab-n3-${two(i + 1)}` as TocItemId;
    return {
      id,
      label: vocabLabel(i + 1, themeOf(lesson.subcategories), "N3 Word Quiz"),
      kind: "quiz" as const,
      quizId: id,
    };
  });
}

/** `N3 Grammar 1–10 · Time & Decisions`. */
function grammarLabel(n: number, size: number, theme: string, prefix: string): string {
  const first = (n - 1) * 10 + 1;
  return `${prefix} ${first}–${first + size - 1} · ${theme}`;
}

/** N3 grammar lesson TOC items: `n3-grammar-01` → `n3-grammar-batch-01`. */
export function buildN3GrammarLessonTocItems(): TocItem[] {
  return n3GrammarLessons.map((lesson, i) => ({
    id: `n3-grammar-${two(i + 1)}` as TocItemId,
    label: grammarLabel(i + 1, lesson.grammarIds.length, lesson.subtitle, "N3 Grammar"),
    kind: "grammar" as const,
    lessonId: lesson.id,
  }));
}

/** N3 grammar quiz TOC items: `quiz-grammar-n3-01`. */
export function buildN3GrammarQuizTocItems(): TocItem[] {
  return n3GrammarLessons.map((lesson, i) => {
    const id = `quiz-grammar-n3-${two(i + 1)}` as TocItemId;
    return {
      id,
      label: grammarLabel(i + 1, lesson.grammarIds.length, lesson.subtitle, "N3 Grammar Quiz"),
      kind: "quiz" as const,
      quizId: id,
    };
  });
}
