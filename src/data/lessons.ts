import type { Lesson } from "../types/lesson";

/** Vocabulary ids for one lesson: 4001–4010, 4011–4020, … */
function idRange(start: number): number[] {
  return Array.from({ length: 10 }, (_, i) => start + i);
}

export const lessons: Lesson[] = [
  {
    id: "lesson-01",
    title: "JLPT N2 Shopping Vocabulary #1",
    subtitle: "Shopping • Supermarket",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #1 | Shopping • Supermarket",
    category: "Daily Life",
    subcategories: ["Shopping", "Supermarket"],
    vocabularyIds: idRange(4001),
  },
  {
    id: "lesson-02",
    title: "JLPT N2 Apartment Vocabulary #2",
    subtitle: "Apartment • Renting",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #2 | Apartment • Renting",
    category: "Daily Life",
    subcategories: ["Apartment", "Housing"],
    vocabularyIds: idRange(4011),
  },
  {
    id: "lesson-03",
    title: "JLPT N2 Weather Vocabulary #3",
    subtitle: "Weather • Forecast",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #3 | Weather • Forecast",
    category: "Daily Life",
    subcategories: ["Weather"],
    vocabularyIds: idRange(4021),
  },
  {
    id: "lesson-04",
    title: "JLPT N2 Transportation Vocabulary #4",
    subtitle: "Trains • Commuting",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #4 | Transportation • Trains",
    category: "Daily Life",
    subcategories: ["Transportation"],
    vocabularyIds: idRange(4031),
  },
  {
    id: "lesson-05",
    title: "JLPT N2 Health Vocabulary #5",
    subtitle: "Health • Hospital",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #5 | Health • Hospital",
    category: "Daily Life",
    subcategories: ["Health", "Hospital"],
    vocabularyIds: idRange(4041),
  },
  {
    id: "lesson-06",
    title: "JLPT N2 Work Vocabulary #6",
    subtitle: "Work • Office",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #6 | Work • Office",
    category: "Daily Life",
    subcategories: ["Work", "Office"],
    vocabularyIds: idRange(4051),
  },
  {
    id: "lesson-07",
    title: "JLPT N2 Money Vocabulary #7",
    subtitle: "Money • Banking",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #7 | Money • Banking",
    category: "Daily Life",
    subcategories: ["Money", "Banking"],
    vocabularyIds: idRange(4061),
  },
  {
    id: "lesson-08",
    title: "JLPT N2 Cooking Vocabulary #8",
    subtitle: "Cooking • Kitchen",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #8 | Cooking • Kitchen",
    category: "Daily Life",
    subcategories: ["Cooking", "Kitchen"],
    vocabularyIds: idRange(4071),
  },
  {
    id: "lesson-09",
    title: "JLPT N2 School Vocabulary #9",
    subtitle: "School • Study",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #9 | School • Study",
    category: "Daily Life",
    subcategories: ["School", "Study"],
    vocabularyIds: idRange(4081),
  },
  {
    id: "lesson-10",
    title: "JLPT N2 Communication Vocabulary #10",
    subtitle: "Communication • Manners",
    youtubeTitle: "JLPT N2 Daily Life Vocabulary #10 | Communication • Manners",
    category: "Daily Life",
    subcategories: ["Communication", "Manners"],
    vocabularyIds: idRange(4091),
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
