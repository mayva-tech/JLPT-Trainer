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
    chapterClearPreviewLocationIds: ["clinic", "phone-center", "office"],
    nextChapterTeaser: {
      japaneseTitle: "社会生活",
      title: "Coming next",
    },
  },
] as const;

export function getChapterByNumber(
  number: number
): ChapterDefinition | undefined {
  return CHAPTERS.find((chapter) => chapter.number === number);
}
