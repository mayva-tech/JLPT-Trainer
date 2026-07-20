import type { TocItem, TocItemId } from "./toc";
import {
  formatLessonIdFromNumber,
  formatN2VocabularyTocLessonLabel,
  formatN2VocabularyTocQuizId,
  formatN2VocabularyTocQuizLabel,
  formatN2VocabularyTocWordId,
} from "../utils/vocabularyDisplay";

/** Build N2 vocabulary lesson TOC items (lessons 1–75). */
export function buildN2VocabularyLessonTocItems(): TocItem[] {
  return Array.from({ length: 75 }, (_, index) => {
    const lessonNumber = index + 1;
    return {
      id: formatN2VocabularyTocWordId(lessonNumber) as TocItemId,
      label: formatN2VocabularyTocLessonLabel(lessonNumber),
      kind: "word" as const,
      lessonId: formatLessonIdFromNumber(lessonNumber),
    };
  });
}

/** Build N2 vocabulary quiz TOC items (quizzes 1–75). */
export function buildN2VocabularyQuizTocItems(): TocItem[] {
  return Array.from({ length: 75 }, (_, index) => {
    const lessonNumber = index + 1;
    const quizId = formatN2VocabularyTocQuizId(lessonNumber) as TocItemId;
    return {
      id: quizId,
      label: formatN2VocabularyTocQuizLabel(lessonNumber),
      kind: "quiz" as const,
      quizId,
    };
  });
}
