import type { Lesson } from "../../types/lesson";
import { N3_VOCAB_ID_START, N3_VOCAB_ITEMS_PER_LESSON } from "../../config/vocabularyCourseN3";

/** Lesson n covers ids 7001 + (n − 1) × 10 … + 9. */
function idRange(lessonNumber: number): number[] {
  const start = N3_VOCAB_ID_START + (lessonNumber - 1) * N3_VOCAB_ITEMS_PER_LESSON;
  return Array.from({ length: N3_VOCAB_ITEMS_PER_LESSON }, (_, i) => start + i);
}

function n3Lesson(
  n: number,
  theme: string,
  subtitle: string,
  category: string,
  subcategory: string
): Lesson {
  return {
    id: formatN3LessonId(n),
    title: `JLPT N3 ${theme} Vocabulary #${n}`,
    subtitle,
    youtubeTitle: `JLPT N3 Vocabulary #${n} | ${theme.replace(" & ", " and ")}`,
    category,
    subcategories: [subcategory],
    vocabularyIds: idRange(n),
  };
}

/** `n3-lesson-01` for lesson 1. */
export function formatN3LessonId(lessonNumber: number): string {
  return `n3-lesson-${String(lessonNumber).padStart(2, "0")}`;
}

export const n3Lessons: Lesson[] = [
  n3Lesson(1, "Home & Chores", "Home • Chores", "Daily Life", "Home & Chores"),
  n3Lesson(2, "Feelings & Moods", "Feelings • Moods", "Daily Life", "Feelings & Moods"),
  n3Lesson(3, "Work & School", "Work • School", "Work & Business", "Work & School"),
  n3Lesson(4, "Town & Travel", "Town • Travel", "Daily Life", "Town & Travel"),
  n3Lesson(5, "Health & Body", "Health • Body", "Daily Life", "Health & Body"),
  n3Lesson(6, "Food & Cooking", "Food • Cooking", "Daily Life", "Food & Cooking"),
  n3Lesson(7, "Nature & Seasons", "Nature • Seasons", "Daily Life", "Nature & Seasons"),
  n3Lesson(8, "Money & Shopping", "Money • Shopping", "Daily Life", "Money & Shopping"),
  n3Lesson(9, "People & Relationships", "People • Relationships", "Daily Life", "People & Relationships"),
  n3Lesson(10, "Hobbies & Free Time", "Hobbies • Free Time", "Daily Life", "Hobbies & Free Time"),
];
