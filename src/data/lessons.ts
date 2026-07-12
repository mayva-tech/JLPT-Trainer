import type { Lesson } from "../types/lesson";

export const lessons: Lesson[] = [
  {
    id: "lesson-01",
    title: "JLPT N2 Shopping Vocabulary #1",
    subtitle: "Supermarket • Shopping",
    youtubeTitle:
      "JLPT N2 Daily Life Vocabulary #1 | Shopping • Supermarket",
    category: "Daily Life",
    subcategories: ["Shopping", "Supermarket"],
    vocabularyIds: [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
