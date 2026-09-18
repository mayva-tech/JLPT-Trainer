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
  {
    id: "chapter-3",
    number: 3,
    title: "Work, Friends & Relationships",
    japaneseTitle: "第3章・人間関係",
    description:
      "You can buy things and survive City Hall — now Japanese changes depending on who you talk to.",
    openingLines: [
      "You can buy things, make appointments, and survive City Hall.",
      "But real Japanese changes depending on who you are talking to.",
      "Friends, senpai, coworkers, managers — grammatically correct is not always socially natural.",
    ],
    objectives: [
      "Respond naturally to a friend invitation",
      "Ask a senpai for help softly",
      "Refuse without sounding cold",
      "Apologize with the right register",
      "Disagree gently at work",
      "Clear the Social Intelligence Challenge",
    ],
    questIds: [
      "friend-invitation",
      "senpai-favor",
      "saying-no",
      "awkward-apology",
      "workplace-discussion",
      "relationships-challenge",
    ],
    nextChapterTeaser: {
      japaneseTitle: "第4章・仕事と敬語",
      title: "Business & Keigo",
    },
  },
  {
    id: "chapter-4",
    number: 4,
    title: "Business & Keigo",
    japaneseTitle: "第4章・仕事と敬語",
    description:
      "You understand the words. Now you need to sound appropriate at work.",
    openingLines: [
      "You understand the words. Now you need to sound appropriate at work.",
      "The same message can sound natural, too casual, too stiff, or even rude — depending on who you are speaking to.",
      "報連相, business phone Japanese, customer keigo, and professional disagreement are next.",
    ],
    objectives: [
      "Greet and leave the office with the right register",
      "Report status with 報連相",
      "Handle an external business call",
      "Serve a customer with appropriate keigo",
      "Report a mistake with recovery steps",
      "Speak up in a meeting",
      "Survive a full workday",
    ],
    questIds: [
      "morning-office",
      "reporting-to-boss",
      "business-phone",
      "customer-service",
      "report-mistake",
      "meeting-speak",
      "workday-survival",
    ],
    nextChapterTeaser: {
      japaneseTitle: "第5章・ネイティブスピード",
      title: "Fast & Natural Japanese",
    },
  },
  {
    id: "chapter-5",
    number: 5,
    title: "Fast & Natural Japanese",
    japaneseTitle: "第5章・ネイティブスピード",
    description:
      "Japanese hasn’t changed. The way people say it has.",
    openingLines: [
      "Japanese hasn’t changed. The way people say it has.",
      "Native speakers shorten, omit, and imply — now listen for meaning at real speed.",
    ],
    objectives: [
      "Survive a fast convenience-store exchange",
      "Catch train announcement details",
      "Read a friend’s implied meaning",
      "Recognize everyday reductions",
      "Follow izakaya-style casual chat",
      "Infer meaning from context",
      "Clear Native-Speed Survival",
    ],
    questIds: [
      "fast-convenience",
      "train-announcement",
      "friend-real-meaning",
      "contraction-city",
      "izakaya-listening",
      "read-between-lines",
      "native-speed-survival",
    ],
    nextChapterTeaser: {
      japaneseTitle: "第6章・トラブル対応",
      title: "Handling Problems",
    },
  },
] as const;

export function getChapterByNumber(
  number: number
): ChapterDefinition | undefined {
  return CHAPTERS.find((chapter) => chapter.number === number);
}
