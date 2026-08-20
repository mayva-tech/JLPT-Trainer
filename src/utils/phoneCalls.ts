import {
  PHONE_CATEGORIES,
  PHONE_LEVELS,
  phoneScenarios,
} from "../data/phoneCalls";
import type {
  PhoneCategory,
  PhoneCategoryId,
  PhoneLevel,
  PhoneScenario,
  PhoneStatus,
} from "../types/phoneCall";

export type PhoneLevelFilter = PhoneLevel | "all";
export type PhoneCategoryFilter = PhoneCategoryId | "all";

export interface PhoneFilter {
  search?: string;
  level?: PhoneLevelFilter;
  category?: PhoneCategoryFilter;
}

/** Totals are derived, never hardcoded in the UI. */
export const phoneScenarioTotal: number = phoneScenarios.length;

export const phoneLineTotal: number = phoneScenarios.reduce(
  (sum, scenario) => sum + scenario.dialogue.length,
  0
);

export const phoneCountByLevel: Readonly<Record<PhoneLevel, number>> =
  PHONE_LEVELS.reduce(
    (acc, level) => {
      acc[level] = phoneScenarios.filter(
        (scenario) => scenario.jlptLevel === level
      ).length;
      return acc;
    },
    {} as Record<PhoneLevel, number>
  );

export const phoneCountByCategory: Readonly<Record<PhoneCategoryId, number>> =
  PHONE_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.id] = phoneScenarios.filter(
        (scenario) => scenario.category === category.id
      ).length;
      return acc;
    },
    {} as Record<PhoneCategoryId, number>
  );

export function getPhoneScenarioById(id: string): PhoneScenario | undefined {
  return phoneScenarios.find((scenario) => scenario.id === id);
}

export function getPhoneCategory(
  id: PhoneCategoryId
): PhoneCategory | undefined {
  return PHONE_CATEGORIES.find((category) => category.id === id);
}

/**
 * Everything a learner might type: titles, the situation, every dialogue line
 * in kanji, kana and English, the key phrases, the vocabulary and the category
 * labels. Searching "reservation", "よやく" or "予約" all reach the same
 * scenarios.
 */
function haystack(scenario: PhoneScenario): string {
  const category = getPhoneCategory(scenario.category);
  return [
    scenario.title,
    scenario.titleEn,
    scenario.situation,
    scenario.politeness,
    scenario.roleA,
    scenario.roleB,
    scenario.jlptLevel,
    category?.japanese ?? "",
    category?.english ?? "",
    ...scenario.tags,
    ...scenario.dialogue.flatMap((line) => [
      line.japanese,
      line.reading,
      line.english,
    ]),
    ...scenario.keyPhrases.flatMap((phrase) => [
      phrase.japanese,
      phrase.reading,
      phrase.english,
      phrase.note,
    ]),
    ...scenario.vocabulary.flatMap((word) => [
      word.japanese,
      word.reading,
      word.english,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterPhoneScenarios(
  scenarios: readonly PhoneScenario[],
  { search, level, category }: PhoneFilter
): PhoneScenario[] {
  const query = search?.trim().toLowerCase() ?? "";

  return scenarios.filter((scenario) => {
    if (level && level !== "all" && scenario.jlptLevel !== level) return false;
    if (category && category !== "all" && scenario.category !== category) {
      return false;
    }
    if (!query) return true;
    return haystack(scenario).includes(query);
  });
}

export function shufflePhone<T>(items: readonly T[], random: () => number): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Random scenario from whatever the filters currently allow. */
export function pickRandomScenario(
  scenarios: readonly PhoneScenario[],
  random: () => number = Math.random
): PhoneScenario | null {
  if (scenarios.length === 0) return null;
  return scenarios[Math.floor(random() * scenarios.length)];
}

/** Same two-list progress model as the other trainers — no new system. */
export function phoneStatus(
  id: string,
  progress: { known: string[]; practiced: string[] }
): PhoneStatus {
  if (progress.known.includes(id)) return "mastered";
  if (progress.practiced.includes(id)) return "practised";
  return "new";
}

export interface PhoneStats {
  total: number;
  practised: number;
  mastered: number;
  remaining: number;
  favourites: number;
}

export function phoneStats(
  scenarios: readonly PhoneScenario[],
  progress: { known: string[]; practiced: string[] },
  favourites: readonly string[]
): PhoneStats {
  let practised = 0;
  let mastered = 0;
  let favourite = 0;

  for (const scenario of scenarios) {
    const status = phoneStatus(scenario.id, progress);
    if (status === "mastered") mastered += 1;
    else if (status === "practised") practised += 1;
    if (favourites.includes(scenario.id)) favourite += 1;
  }

  return {
    total: scenarios.length,
    practised,
    mastered,
    remaining: scenarios.length - mastered,
    favourites: favourite,
  };
}
