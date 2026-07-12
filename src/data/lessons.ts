import type { Lesson } from "../types/lesson";

/** Shared shopping pack used by Word Lesson 1–10 (and quiz content). */
const SHOPPING_IDS = [
  4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
];

export const lessons: Lesson[] = [
  {
    id: "lesson-01",
    title: "JLPT N2 Shopping Vocabulary #1",
    subtitle: "Supermarket • Shopping",
    youtubeTitle:
      "JLPT N2 Daily Life Vocabulary #1 | Shopping • Supermarket",
    category: "Daily Life",
    subcategories: ["Shopping", "Supermarket"],
    vocabularyIds: SHOPPING_IDS,
  },
  {
    id: "lesson-02",
    title: "JLPT N2 Vocabulary Lesson 11–20",
    subtitle: "Coming soon",
    youtubeTitle: "JLPT N2 Vocabulary Lesson 11–20",
    category: "Daily Life",
    subcategories: ["Coming soon"],
    vocabularyIds: [],
  },
  {
    id: "lesson-03",
    title: "JLPT N2 Vocabulary Lesson 21–30",
    subtitle: "Coming soon",
    youtubeTitle: "JLPT N2 Vocabulary Lesson 21–30",
    category: "Daily Life",
    subcategories: ["Coming soon"],
    vocabularyIds: [],
  },
  {
    id: "lesson-04",
    title: "JLPT N2 Vocabulary Lesson 31–40",
    subtitle: "Coming soon",
    youtubeTitle: "JLPT N2 Vocabulary Lesson 31–40",
    category: "Daily Life",
    subcategories: ["Coming soon"],
    vocabularyIds: [],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
