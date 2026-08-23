import {
  STYLE_CATEGORIES,
  STYLE_LEVELS,
  styleExpressions,
} from "../data/speechStyles";
import type {
  StyleCategory,
  StyleCategoryId,
  StyleExpression,
  StyleGender,
  StyleLevel,
  StyleNaturalness,
  StylePoliteness,
} from "../types/speechStyle";

export type GenderFilter = StyleGender | "all";
export type LevelFilter = StyleLevel | "all";
export type CategoryFilter = StyleCategoryId | "all";
export type PolitenessFilter = StylePoliteness | "all";

export interface StyleFilter {
  search?: string;
  gender?: GenderFilter;
  level?: LevelFilter;
  category?: CategoryFilter;
  politeness?: PolitenessFilter;
  /** Hide anything that isn't very-common or common in modern Japan. */
  modernOnly?: boolean;
  /** Show expressions marked `rough` (swearing, fighting language). */
  showRough?: boolean;
  /** Show expressions that mostly exist in fiction. */
  showAnime?: boolean;
}

export const styleTotal: number = styleExpressions.length;

export const styleCountByGender: Readonly<Record<StyleGender, number>> = {
  feminine: styleExpressions.filter((item) => item.gender === "feminine").length,
  neutral: styleExpressions.filter((item) => item.gender === "neutral").length,
  masculine: styleExpressions.filter((item) => item.gender === "masculine")
    .length,
};

export const styleCountByLevel: Readonly<Record<StyleLevel, number>> =
  STYLE_LEVELS.reduce(
    (acc, level) => {
      acc[level] = styleExpressions.filter(
        (item) => item.jlptLevel === level
      ).length;
      return acc;
    },
    {} as Record<StyleLevel, number>
  );

export const styleCountByCategory: Readonly<Record<StyleCategoryId, number>> =
  STYLE_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.id] = styleExpressions.filter(
        (item) => item.category === category.id
      ).length;
      return acc;
    },
    {} as Record<StyleCategoryId, number>
  );

export function getStyleCategory(
  id: StyleCategoryId
): StyleCategory | undefined {
  return STYLE_CATEGORIES.find((category) => category.id === id);
}

export function getStyleById(id: string): StyleExpression | undefined {
  return styleExpressions.find((item) => item.id === id);
}

const MODERN: StyleNaturalness[] = ["very-common", "common"];

function haystack(item: StyleExpression): string {
  return [
    item.japanese,
    item.reading,
    item.romaji,
    item.english,
    item.warning ?? "",
    item.alternative ?? "",
    item.example.japanese,
    item.example.reading,
    item.example.english,
    item.gender,
    item.strength,
    item.politeness,
    item.naturalness,
    item.jlptLevel,
    getStyleCategory(item.category)?.english ?? "",
    getStyleCategory(item.category)?.japanese ?? "",
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * The rough and anime toggles are opt-in rather than opt-out: a learner who has
 * not asked for fighting language should not meet てめえ by accident.
 */
export function filterStyles(
  items: readonly StyleExpression[],
  {
    search,
    gender,
    level,
    category,
    politeness,
    modernOnly,
    showRough = true,
    showAnime = true,
  }: StyleFilter
): StyleExpression[] {
  const query = search?.trim().toLowerCase() ?? "";

  return items.filter((item) => {
    if (gender && gender !== "all" && item.gender !== gender) return false;
    if (level && level !== "all" && item.jlptLevel !== level) return false;
    if (category && category !== "all" && item.category !== category) {
      return false;
    }
    if (
      politeness &&
      politeness !== "all" &&
      item.politeness !== politeness
    ) {
      return false;
    }
    if (modernOnly && !MODERN.includes(item.naturalness)) return false;
    if (!showRough && (item.naturalness === "rough" || item.politeness === "rough")) {
      return false;
    }
    if (!showAnime && item.naturalness === "anime-drama") return false;
    if (!query) return true;
    return haystack(item).includes(query);
  });
}

export function shuffleStyles<T>(
  items: readonly T[],
  random: () => number
): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function pickRandomStyle(
  items: readonly StyleExpression[],
  random: () => number = Math.random
): StyleExpression | null {
  if (items.length === 0) return null;
  return items[Math.floor(random() * items.length)];
}

const STRENGTH_ORDER = [
  "strongly-feminine",
  "somewhat-feminine",
  "neutral",
  "somewhat-masculine",
  "strongly-masculine",
];

export interface StyleComparison {
  group: string;
  /** Sorted feminine → neutral → masculine, which is how the cards render. */
  members: StyleExpression[];
}

export interface StyleCategoryGroup {
  category: StyleCategory;
  items: StyleExpression[];
}

export interface StyleCategoryComparisonGroup {
  category: StyleCategory;
  comparisons: StyleComparison[];
}

/** Filtered items in corpus category order, omitting empty sections. */
export function groupStylesByCategory(
  items: readonly StyleExpression[]
): StyleCategoryGroup[] {
  const byCategory = new Map<StyleCategoryId, StyleExpression[]>();

  for (const item of items) {
    const existing = byCategory.get(item.category) ?? [];
    existing.push(item);
    byCategory.set(item.category, existing);
  }

  return STYLE_CATEGORIES.filter(
    (category) => (byCategory.get(category.id)?.length ?? 0) > 0
  ).map((category) => ({
    category,
    items: byCategory.get(category.id)!,
  }));
}

/** Keep category sections intact while capping total visible cards. */
export function limitGroupedStyles(
  groups: readonly StyleCategoryGroup[],
  limit: number
): StyleCategoryGroup[] {
  let remaining = limit;
  const result: StyleCategoryGroup[] = [];

  for (const group of groups) {
    if (remaining <= 0) break;
    if (group.items.length <= remaining) {
      result.push(group);
      remaining -= group.items.length;
    } else {
      result.push({
        category: group.category,
        items: group.items.slice(0, remaining),
      });
      remaining = 0;
    }
  }

  return result;
}

/** Side-by-side groups bucketed by their members' category. */
export function groupComparisonsByCategory(
  comparisons: readonly StyleComparison[]
): StyleCategoryComparisonGroup[] {
  const byCategory = new Map<StyleCategoryId, StyleComparison[]>();

  for (const comparison of comparisons) {
    const categoryId = comparison.members[0]?.category;
    if (!categoryId) continue;
    const existing = byCategory.get(categoryId) ?? [];
    existing.push(comparison);
    byCategory.set(categoryId, existing);
  }

  return STYLE_CATEGORIES.filter(
    (category) => (byCategory.get(category.id)?.length ?? 0) > 0
  ).map((category) => ({
    category,
    comparisons: byCategory.get(category.id)!,
  }));
}

/** Groups with two or more members, i.e. everything worth comparing. */
export function buildComparisons(
  items: readonly StyleExpression[]
): StyleComparison[] {
  const byGroup = new Map<string, StyleExpression[]>();

  for (const item of items) {
    const existing = byGroup.get(item.group) ?? [];
    existing.push(item);
    byGroup.set(item.group, existing);
  }

  return [...byGroup.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([group, members]) => ({
      group,
      members: [...members].sort(
        (a, b) =>
          STRENGTH_ORDER.indexOf(a.strength) -
          STRENGTH_ORDER.indexOf(b.strength)
      ),
    }))
    .sort((a, b) => b.members.length - a.members.length);
}

export interface StyleStats {
  total: number;
  feminine: number;
  neutral: number;
  masculine: number;
  modern: number;
  fiction: number;
}

export function styleStats(items: readonly StyleExpression[]): StyleStats {
  return {
    total: items.length,
    feminine: items.filter((item) => item.gender === "feminine").length,
    neutral: items.filter((item) => item.gender === "neutral").length,
    masculine: items.filter((item) => item.gender === "masculine").length,
    modern: items.filter((item) => MODERN.includes(item.naturalness)).length,
    fiction: items.filter((item) => item.naturalness === "anime-drama").length,
  };
}
