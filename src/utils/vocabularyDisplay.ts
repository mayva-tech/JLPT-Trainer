import type { Lesson } from "../types/lesson";

export type VocabularyDisplayRange = {
  lessonNumber: number;
  firstWordNumber: number;
  lastWordNumber: number;
};

const LESSON_ID_RE = /^lesson-(\d{2})$/;

/** Display ordinal from a data vocabulary id (4001 → 1, 4750 → 750). */
export function vocabularyIdToDisplayNumber(id: number): number {
  return id - 4000;
}

/** Data vocabulary id from a display ordinal (1 → 4001). */
export function displayNumberToVocabularyId(display: number): number {
  return 4000 + display;
}

export function parseLessonNumber(lessonId: string): number | null {
  const match = LESSON_ID_RE.exec(lessonId);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

/**
 * Resolve lesson number and display word range for an N2 vocabulary lesson id.
 * `lesson-51` → words 501–510.
 */
export function getVocabularyDisplayRange(
  lessonId: string
): VocabularyDisplayRange | null {
  const lessonNumber = parseLessonNumber(lessonId);
  if (lessonNumber === null) return null;

  const firstWordNumber = (lessonNumber - 1) * 10 + 1;
  const lastWordNumber = lessonNumber * 10;

  return { lessonNumber, firstWordNumber, lastWordNumber };
}

export function formatWordRangeLabel(range: VocabularyDisplayRange): string {
  return `Words ${range.firstWordNumber}–${range.lastWordNumber}`;
}

export function formatVocabularyLessonHeader(lessonId: string): string | null {
  const range = getVocabularyDisplayRange(lessonId);
  if (!range) return null;
  return `Vocabulary Lesson ${range.lessonNumber}`;
}

export function formatVocabularyLessonSubheader(lessonId: string): string | null {
  const range = getVocabularyDisplayRange(lessonId);
  if (!range) return null;
  return formatWordRangeLabel(range);
}

export function formatVocabularyQuizHeader(quizLessonId: string): string | null {
  const range = getVocabularyDisplayRange(quizLessonId);
  if (!range) return null;
  return `Vocabulary Quiz ${range.lessonNumber}`;
}

export function formatN2VocabularyTocLessonLabel(lessonNumber: number): string {
  const first = (lessonNumber - 1) * 10 + 1;
  const last = lessonNumber * 10;
  return `Vocabulary Lesson ${lessonNumber} | Words ${first}–${last}`;
}

export function formatN2VocabularyTocQuizLabel(lessonNumber: number): string {
  const first = (lessonNumber - 1) * 10 + 1;
  const last = lessonNumber * 10;
  return `Vocabulary Quiz ${lessonNumber} | Words ${first}–${last}`;
}

export function formatN2VocabularyTocWordId(lessonNumber: number): string {
  const first = (lessonNumber - 1) * 10 + 1;
  const last = lessonNumber * 10;
  return `word-${first}-${last}`;
}

export function formatN2VocabularyTocQuizId(lessonNumber: number): string {
  const first = (lessonNumber - 1) * 10 + 1;
  const last = lessonNumber * 10;
  return `quiz-vocab-${first}-${last}`;
}

export function formatLessonIdFromNumber(lessonNumber: number): string {
  return `lesson-${String(lessonNumber).padStart(2, "0")}`;
}

export function lessonDisplayMeta(lesson: Lesson): {
  header: string | null;
  subheader: string | null;
} {
  const range = getVocabularyDisplayRange(lesson.id);
  if (!range) {
    return { header: null, subheader: null };
  }
  return {
    header: `Vocabulary Lesson ${range.lessonNumber}`,
    subheader: formatWordRangeLabel(range),
  };
}
