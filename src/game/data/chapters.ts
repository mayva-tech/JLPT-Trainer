import type { ChapterDefinition } from "../types";

export const CHAPTERS: readonly ChapterDefinition[] = [
  {
    id: "chapter-1",
    number: 1,
    title: "New Life in Kotoba Town",
    japaneseTitle: "第1章・新生活",
    description: "Your new life in Kotoba Town begins.",
    openingLines: [
      "You have arrived in Kotoba Town with a suitcase, a new address, and enough Japanese to get started.",
      "Before you can settle in, there are a few things you need to do.",
    ],
    objectives: [
      "Register your address at City Hall",
      "Buy essentials",
      "Meet your neighbor",
      "Learn to use the station",
      "Order successfully at a café",
      "Complete the First Week Challenge",
    ],
    questIds: [
      "city-hall-register",
      "convenience-first-shop",
      "meet-neighbor",
      "station-master",
      "cafe-order",
      "first-week-challenge",
    ],
    nextChapterTeaser: {
      japaneseTitle: "第2章・社会生活",
      title: "Life Gets Real",
    },
  },
  {
    id: "chapter-2",
    number: 2,
    title: "Life Gets Real",
    japaneseTitle: "第2章・社会生活",
    description: "Japanese becomes part of everyday responsibilities.",
    openingLines: [
      "Your first week in Kotoba Town is over.",
      "Buying snacks and finding the train was only the beginning — now you have to function independently in Japanese society.",
      "Clinic visits, phone calls, and workplace talk will push your Confidence harder than Chapter 1.",
    ],
    objectives: [
      "Visit a clinic",
      "Handle a phone inquiry",
      "Communicate at work",
      "Ask for clarification instead of pretending to understand",
      "Survive the Social Life Challenge",
    ],
    questIds: [
      "clinic-visit",
      "phone-call",
      "first-day-office",
      "social-life-challenge",
    ],
    nextChapterTeaser: {
      japaneseTitle: "第3章・人間関係",
      title: "Work, Friends & Relationships",
    },
  },
] as const;

export function getChapterByNumber(
  number: number
): ChapterDefinition | undefined {
  return CHAPTERS.find((chapter) => chapter.number === number);
}
