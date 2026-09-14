import {
  buildExpressionQuestion,
  buildN2Question,
  buildPrerequisiteQuestion,
  buildSynonymAntonymQuestion,
  buildWeakQuestion,
  markQuestionUsed,
} from "./questionPools";
import type { GameQuestion, GameQuestionCategory } from "./types";

/** Default weighted mix (spec). Empty categories are redistributed. */
export const DEFAULT_WEIGHTS: Record<
  Exclude<GameQuestionCategory, "mixed">,
  number
> = {
  n2: 0.4,
  weak: 0.2,
  "synonym-antonym": 0.15,
  expression: 0.15,
  prerequisite: 0.1,
};

export type SelectorWeights = Partial<
  Record<Exclude<GameQuestionCategory, "mixed">, number>
>;

export type QuestionSelectorState = {
  usedIds: Set<string>;
  counter: number;
};

export function createSelectorState(): QuestionSelectorState {
  return { usedIds: new Set(), counter: 0 };
}

type Builder = (
  usedIds: Set<string>,
  seed: string
) => GameQuestion | null;

const BUILDERS: Record<
  Exclude<GameQuestionCategory, "mixed">,
  Builder
> = {
  n2: buildN2Question,
  weak: buildWeakQuestion,
  "synonym-antonym": buildSynonymAntonymQuestion,
  expression: buildExpressionQuestion,
  prerequisite: buildPrerequisiteQuestion,
};

const FALLBACK_ORDER: Array<Exclude<GameQuestionCategory, "mixed">> = [
  "n2",
  "expression",
  "synonym-antonym",
  "prerequisite",
  "weak",
];

function pickWeightedCategory(
  weights: Record<string, number>,
  roll: number
): Exclude<GameQuestionCategory, "mixed"> {
  const entries = Object.entries(weights).filter(([, w]) => w > 0) as Array<
    [Exclude<GameQuestionCategory, "mixed">, number]
  >;
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0 || entries.length === 0) return "n2";
  let cursor = roll * total;
  for (const [key, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return key;
  }
  return entries[entries.length - 1]![0];
}

function hashRoll(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) / 0x100000000;
}

/**
 * Pick the next question using weighted categories.
 * Never invents content; skips empty categories; avoids repeats via usedIds.
 */
export function selectNextQuestion(
  state: QuestionSelectorState,
  options?: {
    weights?: SelectorWeights;
    /** Force a category (survival round progression). */
    forceCategory?: Exclude<GameQuestionCategory, "mixed"> | "mixed";
    seedPrefix?: string;
  }
): GameQuestion | null {
  const seedPrefix = options?.seedPrefix ?? "game";
  const seed = `${seedPrefix}:${state.counter}`;
  state.counter += 1;

  const base: Record<Exclude<GameQuestionCategory, "mixed">, number> = {
    ...DEFAULT_WEIGHTS,
    ...options?.weights,
  };

  let preferred: Exclude<GameQuestionCategory, "mixed"> | null = null;
  if (options?.forceCategory && options.forceCategory !== "mixed") {
    preferred = options.forceCategory;
  } else {
    preferred = pickWeightedCategory(base, hashRoll(seed));
  }

  const tryOrder: Array<Exclude<GameQuestionCategory, "mixed">> = [
    preferred,
    ...FALLBACK_ORDER.filter((c) => c !== preferred),
  ];

  for (const category of tryOrder) {
    const question = BUILDERS[category](state.usedIds, `${seed}:${category}`);
    if (!question) continue;
    markQuestionUsed(state.usedIds, question);
    return question;
  }
  return null;
}

/** Survival round → preferred category (listening omitted — no reusable quiz). */
export function survivalCategoryForRound(
  round: number
): Exclude<GameQuestionCategory, "mixed"> | "mixed" {
  if (round <= 1) return "prerequisite";
  if (round === 2) return "n2";
  if (round === 3) return "expression";
  if (round === 4) return "synonym-antonym";
  if (round >= 6) return "mixed";
  // Round 5+: mixed; later rounds bias weak via weights in the mode.
  return "mixed";
}

export function survivalWeightsForRound(
  round: number
): SelectorWeights {
  if (round >= 6) {
    return {
      n2: 0.25,
      weak: 0.4,
      "synonym-antonym": 0.15,
      expression: 0.1,
      prerequisite: 0.1,
    };
  }
  if (round === 5) {
    return {
      n2: 0.35,
      weak: 0.25,
      "synonym-antonym": 0.15,
      expression: 0.15,
      prerequisite: 0.1,
    };
  }
  return DEFAULT_WEIGHTS;
}
