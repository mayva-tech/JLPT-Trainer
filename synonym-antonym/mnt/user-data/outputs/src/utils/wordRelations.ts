import { wordRelations, WORD_RELATION_LEVELS } from "../data/wordRelations";
import type {
  RelationStatus,
  WordRelation,
  WordRelationLevel,
  WordRelationType,
} from "../types/wordRelation";

/** Filter values include the "all" pseudo-option used by the chip rows. */
export type LevelFilter = WordRelationLevel | "all";
export type TypeFilter = WordRelationType | "all";
export type RelationSort = "level" | "japanese" | "english" | "random";

export interface RelationFilter {
  search?: string;
  level?: LevelFilter;
  type?: TypeFilter;
}

const LEVEL_INDEX = new Map(
  WORD_RELATION_LEVELS.map((level, index) => [level, index])
);

/** Total number of relations — never hardcode this in the UI. */
export const wordRelationTotal: number = wordRelations.length;

export const wordRelationCountByLevel: Readonly<
  Record<WordRelationLevel, number>
> = WORD_RELATION_LEVELS.reduce(
  (acc, level) => {
    acc[level] = wordRelations.filter(
      (relation) => relation.jlptLevel === level
    ).length;
    return acc;
  },
  {} as Record<WordRelationLevel, number>
);

export const wordRelationCountByType: Readonly<
  Record<WordRelationType, number>
> = {
  synonym: wordRelations.filter((relation) => relation.type === "synonym")
    .length,
  antonym: wordRelations.filter((relation) => relation.type === "antonym")
    .length,
};

export function getWordRelationById(id: string): WordRelation | undefined {
  return wordRelations.find((relation) => relation.id === id);
}

/** Every searchable string of a relation, lowercased once per call. */
function haystack(relation: WordRelation): string {
  return [
    relation.word1.japanese,
    relation.word1.reading,
    relation.word1.meaning,
    relation.word1.partOfSpeech,
    relation.word2.japanese,
    relation.word2.reading,
    relation.word2.meaning,
    relation.word2.partOfSpeech,
    relation.nuance ?? "",
    relation.jlptLevel,
    relation.type,
    ...relation.tags,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Client-side filter used by Browse, Study and Quiz alike, so the three modes
 * always agree on what "N2 + Antonyms" means.
 */
export function filterWordRelations(
  relations: readonly WordRelation[],
  { search, level, type }: RelationFilter
): WordRelation[] {
  const query = search?.trim().toLowerCase() ?? "";

  return relations.filter((relation) => {
    if (level && level !== "all" && relation.jlptLevel !== level) return false;
    if (type && type !== "all" && relation.type !== type) return false;
    if (!query) return true;
    return haystack(relation).includes(query);
  });
}

/** Deterministic except for "random", which the caller re-rolls on demand. */
export function sortWordRelations(
  relations: readonly WordRelation[],
  sort: RelationSort,
  random: () => number = Math.random
): WordRelation[] {
  const list = [...relations];

  switch (sort) {
    case "japanese":
      return list.sort((a, b) =>
        a.word1.reading.localeCompare(b.word1.reading, "ja")
      );
    case "english":
      return list.sort((a, b) =>
        a.word1.meaning.localeCompare(b.word1.meaning, "en")
      );
    case "random":
      return shuffle(list, random);
    case "level":
    default:
      return list.sort((a, b) => {
        const byLevel =
          (LEVEL_INDEX.get(a.jlptLevel) ?? 0) -
          (LEVEL_INDEX.get(b.jlptLevel) ?? 0);
        if (byLevel !== 0) return byLevel;
        return a.word1.reading.localeCompare(b.word1.reading, "ja");
      });
  }
}

/** Fisher–Yates on a copy; the caller supplies the RNG so tests stay stable. */
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function pickRandom<T>(
  items: readonly T[],
  random: () => number = Math.random
): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(random() * items.length)];
}

/**
 * Maps the shared `useProgress` two-list model onto New / Learning / Learned
 * rather than introducing a second progress system.
 */
export function relationStatus(
  id: string,
  progress: { known: string[]; practiced: string[] }
): RelationStatus {
  if (progress.known.includes(id)) return "learned";
  if (progress.practiced.includes(id)) return "learning";
  return "new";
}

export interface RelationStats {
  total: number;
  synonyms: number;
  antonyms: number;
  learned: number;
  learning: number;
  remaining: number;
}

export function relationStats(
  relations: readonly WordRelation[],
  progress: { known: string[]; practiced: string[] }
): RelationStats {
  let learned = 0;
  let learning = 0;
  let synonyms = 0;
  let antonyms = 0;

  for (const relation of relations) {
    if (relation.type === "synonym") synonyms += 1;
    else antonyms += 1;

    const status = relationStatus(relation.id, progress);
    if (status === "learned") learned += 1;
    else if (status === "learning") learning += 1;
  }

  return {
    total: relations.length,
    synonyms,
    antonyms,
    learned,
    learning,
    remaining: relations.length - learned,
  };
}
