import type { GrammarItem } from "../../types/grammar";
import type { VocabularyItem } from "../../types/vocabulary";
import type { WordRelation } from "../../types/wordRelation";
import { getGrammarQuizPool } from "../../data/grammarCourse";
import { wordRelations } from "../../data/wordRelations";
import { getWeakVocabularyReviewItems } from "../weakVocabularyReview";
import { getN2VocabularyCoursePool, seededShuffle } from "../vocabularyQuiz";
import { buildRelationQuiz } from "../wordRelationQuiz";
import type { GameQuestion, GameQuestionCategory, GameQuestionChoice } from "./types";

export type GameContentPools = {
  n2Vocab: VocabularyItem[];
  weakVocab: VocabularyItem[];
  expressions: VocabularyItem[];
  relationsN2: WordRelation[];
  relationsPrereq: WordRelation[];
  grammarPrereq: GrammarItem[];
};

const CHOICE_COUNT = 4;

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function formatChoice(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = normalize(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

export function buildChoiceSet(
  correct: string,
  distractorPool: string[],
  seed: string,
  count: number = CHOICE_COUNT
): { choices: GameQuestionChoice[]; correctChoiceId: string } | null {
  const formattedCorrect = formatChoice(correct);
  const distractors = uniqueLabels(
    distractorPool.filter((label) => normalize(label) !== normalize(correct))
  );
  const picked = seededShuffle(distractors, `${seed}:d`).slice(
    0,
    Math.max(0, count - 1)
  );
  if (picked.length < 1) return null;
  const labels = seededShuffle(
    uniqueLabels([formattedCorrect, ...picked.map(formatChoice)]),
    `${seed}:c`
  ).slice(0, count);
  if (!labels.some((label) => normalize(label) === normalize(formattedCorrect))) {
    labels[0] = formattedCorrect;
  }
  const choices = labels.map((label, index) => ({
    id: `c-${index}`,
    label,
  }));
  const correctChoice = choices.find(
    (choice) => normalize(choice.label) === normalize(formattedCorrect)
  );
  if (!correctChoice) return null;
  return { choices, correctChoiceId: correctChoice.id };
}

export function loadGameContentPools(): GameContentPools {
  const n2Vocab = getN2VocabularyCoursePool();
  const expressions = n2Vocab.filter(
    (item) => item.phrase.trim() && item.phraseMeaning.trim()
  );
  return {
    n2Vocab,
    weakVocab: getWeakVocabularyReviewItems(),
    expressions,
    relationsN2: wordRelations.filter((relation) => relation.jlptLevel === "N2"),
    relationsPrereq: wordRelations.filter((relation) =>
      relation.jlptLevel === "N5" ||
      relation.jlptLevel === "N4" ||
      relation.jlptLevel === "N3"
    ),
    grammarPrereq: getGrammarQuizPool("N3_REVIEW"),
  };
}

export function itemsForCategory(
  pools: GameContentPools,
  category: GameQuestionCategory
): number {
  switch (category) {
    case "n2":
    case "listening":
      return pools.n2Vocab.length;
    case "weak":
      return pools.weakVocab.length;
    case "expression":
      return pools.expressions.length;
    case "relation":
      return pools.relationsN2.length;
    case "prerequisite":
      return pools.relationsPrereq.length + pools.grammarPrereq.length;
  }
}

export function vocabQuestion(
  item: VocabularyItem,
  pool: VocabularyItem[],
  category: GameQuestionCategory,
  seed: string,
  options?: { listening?: boolean; prompt?: "word" | "phrase" }
): GameQuestion | null {
  const promptKind = options?.prompt ?? "word";
  const correct =
    promptKind === "phrase" ? item.phraseMeaning : item.meaning;
  const distractors = pool.map((candidate) =>
    promptKind === "phrase" ? candidate.phraseMeaning : candidate.meaning
  );
  const built = buildChoiceSet(correct, distractors, seed);
  if (!built) return null;
  const listening = options?.listening === true;
  const promptJa = promptKind === "phrase" ? item.phrase : item.word;
  const reading =
    promptKind === "phrase" ? item.phraseReading : item.reading;
  return {
    id: `${category}:${item.id}:${seed}`,
    sourceKey:
      promptKind === "phrase"
        ? `phrase:${item.id}`
        : listening
          ? `listen:${item.id}`
          : `word:${item.id}`,
    category,
    promptJa,
    promptEn: listening
      ? "What did you hear?"
      : promptKind === "phrase"
        ? "What does this expression mean?"
        : "What is the English meaning?",
    reading,
    choices: built.choices,
    correctChoiceId: built.correctChoiceId,
    correctLabel: formatChoice(correct),
    vocabItemId: item.id,
    listening,
    speakText: item.word,
    speakReading: item.reading,
  };
}

function grammarQuestion(
  item: GrammarItem,
  pool: GrammarItem[],
  seed: string
): GameQuestion | null {
  const built = buildChoiceSet(
    item.meaning,
    pool.map((candidate) => candidate.meaning),
    seed
  );
  if (!built) return null;
  return {
    id: `prerequisite:g${item.id}:${seed}`,
    sourceKey: `grammar:${item.id}`,
    category: "prerequisite",
    promptJa: item.pattern,
    promptEn: "What does this grammar pattern mean?",
    reading: item.patternReading,
    choices: built.choices,
    correctChoiceId: built.correctChoiceId,
    correctLabel: formatChoice(item.meaning),
  };
}

function relationQuestion(
  relation: WordRelation,
  category: GameQuestionCategory,
  seed: string,
  random: () => number
): GameQuestion | null {
  const [built] = buildRelationQuiz({
    pool: [relation],
    count: 1,
    random,
  });
  if (!built) return null;
  return {
    id: `${category}:${built.id}:${seed}`,
    sourceKey: `rel:${relation.id}`,
    category,
    promptJa: built.promptDetail
      ? `${built.prompt}\n${built.promptDetail}`
      : built.prompt,
    promptEn: built.promptEn,
    choices: built.options.map((option) => ({
      id: option.id,
      label: option.label,
      reading: option.reading,
    })),
    correctChoiceId: built.correctOptionId,
    correctLabel:
      built.options.find((option) => option.id === built.correctOptionId)
        ?.label ?? "",
  };
}

export function buildCategoryQuestion(
  pools: GameContentPools,
  category: GameQuestionCategory,
  usedKeys: ReadonlySet<string>,
  seed: string,
  random: () => number = Math.random
): GameQuestion | null {
  const tryVocab = (
    items: VocabularyItem[],
    options?: { listening?: boolean; prompt?: "word" | "phrase" }
  ): GameQuestion | null => {
    const unused = items.filter((item) => {
      const key =
        options?.prompt === "phrase"
          ? `phrase:${item.id}`
          : options?.listening
            ? `listen:${item.id}`
            : `word:${item.id}`;
      return !usedKeys.has(key);
    });
    const ordered = seededShuffle(unused.length > 0 ? unused : items, seed);
    for (const item of ordered.slice(0, 12)) {
      const question = vocabQuestion(item, items, category, `${seed}:${item.id}`, options);
      if (question && !usedKeys.has(question.sourceKey)) return question;
      if (question && unused.length === 0) return question;
    }
    return null;
  };

  if (category === "n2") return tryVocab(pools.n2Vocab);
  if (category === "weak") return tryVocab(pools.weakVocab.length > 0 ? pools.weakVocab : []);
  if (category === "expression") {
    return tryVocab(pools.expressions, { prompt: "phrase" });
  }
  if (category === "listening") {
    return tryVocab(pools.n2Vocab, { listening: true });
  }

  if (category === "relation") {
    const unused = pools.relationsN2.filter(
      (relation) => !usedKeys.has(`rel:${relation.id}`)
    );
    const pool = unused.length > 0 ? unused : pools.relationsN2;
    if (pool.length === 0) return null;
    const pick = seededShuffle(pool, seed)[0];
    if (!pick) return null;
    return relationQuestion(pick, "relation", seed, random);
  }

  if (category === "prerequisite") {
    const grammarUnused = pools.grammarPrereq.filter(
      (item) => !usedKeys.has(`grammar:${item.id}`)
    );
    const relationUnused = pools.relationsPrereq.filter(
      (relation) => !usedKeys.has(`rel:${relation.id}`)
    );
    const useGrammar =
      grammarUnused.length + relationUnused.length === 0
        ? random() < 0.5
        : grammarUnused.length >= relationUnused.length
          ? random() < 0.6 || relationUnused.length === 0
          : random() < 0.4 && grammarUnused.length > 0;

    if (useGrammar && (grammarUnused.length > 0 || pools.grammarPrereq.length > 0)) {
      const pool = grammarUnused.length > 0 ? grammarUnused : pools.grammarPrereq;
      const item = seededShuffle(pool, seed)[0];
      if (item) return grammarQuestion(item, pools.grammarPrereq, seed);
    }
    const relPool =
      relationUnused.length > 0 ? relationUnused : pools.relationsPrereq;
    const relation = seededShuffle(relPool, `${seed}:r`)[0];
    if (!relation) return null;
    return relationQuestion(relation, "prerequisite", seed, random);
  }

  return null;
}

export function defaultMixedWeights(
  pools: GameContentPools
): Record<GameQuestionCategory, number> {
  const has = (category: GameQuestionCategory) => itemsForCategory(pools, category) > 0;
  return {
    n2: has("n2") ? 40 : 0,
    weak: has("weak") ? 20 : 0,
    relation: has("relation") ? 15 : 0,
    expression: has("expression") ? 15 : 0,
    prerequisite: has("prerequisite") ? 10 : 0,
    listening: 0,
  };
}

export function survivalRoundWeights(
  round: number,
  pools: GameContentPools
): Record<GameQuestionCategory, number> {
  const has = (category: GameQuestionCategory) => itemsForCategory(pools, category) > 0;
  const mixed = defaultMixedWeights(pools);
  if (round <= 1) {
    return {
      n2: has("prerequisite") ? 0 : mixed.n2,
      weak: 0,
      relation: 0,
      expression: 0,
      prerequisite: has("prerequisite") ? 100 : 0,
      listening: 0,
    };
  }
  if (round === 2) {
    return { n2: has("n2") ? 100 : mixed.n2, weak: 0, relation: 0, expression: 0, prerequisite: 0, listening: 0 };
  }
  if (round === 3) {
    return {
      n2: has("expression") ? 0 : mixed.n2,
      weak: 0,
      relation: 0,
      expression: has("expression") ? 100 : 0,
      prerequisite: 0,
      listening: 0,
    };
  }
  if (round === 4) {
    return {
      n2: has("relation") ? 0 : mixed.n2,
      weak: 0,
      relation: has("relation") ? 100 : 0,
      expression: 0,
      prerequisite: 0,
      listening: 0,
    };
  }
  if (round === 5) {
    return {
      n2: has("listening") ? 30 : mixed.n2,
      weak: 0,
      relation: 0,
      expression: 0,
      prerequisite: 0,
      listening: has("listening") ? 70 : 0,
    };
  }
  return {
    ...mixed,
    weak: has("weak") ? 35 : 0,
    n2: has("n2") ? 30 : mixed.n2,
    listening: has("listening") ? 10 : 0,
  };
}

export function pickWeightedCategory(
  weights: Record<GameQuestionCategory, number>,
  random: () => number
): GameQuestionCategory | null {
  const entries = (Object.entries(weights) as [GameQuestionCategory, number][]).filter(
    ([, weight]) => weight > 0
  );
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let ticket = random() * total;
  for (const [category, weight] of entries) {
    ticket -= weight;
    if (ticket <= 0) return category;
  }
  return entries[entries.length - 1]?.[0] ?? null;
}

export function selectNextGameQuestion(options: {
  pools: GameContentPools;
  weights: Record<GameQuestionCategory, number>;
  usedKeys: Set<string>;
  seed: string;
  random?: () => number;
}): GameQuestion | null {
  const random = options.random ?? Math.random;
  const fallback = defaultMixedWeights(options.pools);
  for (let attempt = 0; attempt < 16; attempt++) {
    const category =
      pickWeightedCategory(attempt === 0 ? options.weights : fallback, random) ??
      pickWeightedCategory(fallback, random);
    if (!category) continue;
    const question = buildCategoryQuestion(
      options.pools,
      category,
      options.usedKeys,
      `${options.seed}:${attempt}:${category}`,
      random
    );
    if (question) return question;
  }
  // Last resort: any unused N2 item, even if recently seen.
  return buildCategoryQuestion(
    options.pools,
    "n2",
    new Set(),
    `${options.seed}:any`,
    random
  );
}

/** Deterministic-ish seed helper for a session clock. */
export function gameSessionSeed(prefix: string, random: () => number = Math.random): string {
  return `${prefix}:${Math.floor(random() * 1e9)}`;
}
