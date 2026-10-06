import { ASSUMED_LEVEL_IDS, LISTED_LEVEL_IDS } from "../data/wordLevels";
import type { JlptLevel } from "../types/level";

/** Easiest to hardest. */
export const JLPT_LEVELS: readonly JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

const LEVEL_BY_ID = new Map<number, JlptLevel>();
const ASSUMED = new Set<number>();
for (const level of JLPT_LEVELS) {
  for (const id of LISTED_LEVEL_IDS[level]) LEVEL_BY_ID.set(id, level);
  for (const id of ASSUMED_LEVEL_IDS[level] ?? []) {
    LEVEL_BY_ID.set(id, level);
    ASSUMED.add(id);
  }
}

/**
 * Real JLPT level of a vocabulary item. This is the level the word is
 * normally taught at, not the course it sits in: the "N2" course contains
 * many N5–N3 words. Undefined for ids that are not vocabulary.
 */
export function getWordLevel(id: number): JlptLevel | undefined {
  return LEVEL_BY_ID.get(id);
}

/** True when the word is on no level list and its level comes from its course. */
export function isWordLevelAssumed(id: number): boolean {
  return ASSUMED.has(id);
}
