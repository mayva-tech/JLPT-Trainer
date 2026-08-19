import { describe, expect, it } from "vitest";
import {
  WORD_RELATION_LEVELS,
  WORD_RELATION_TYPES,
  wordRelations,
} from "./wordRelations";
import {
  filterWordRelations,
  wordRelationTotal,
} from "../utils/wordRelations";

const EXPECTED_BY_LEVEL = {
  N5: 58,
  N4: 69,
  N3: 104,
  N2: 204,
} as const;

function pairKey(relation: (typeof wordRelations)[number]): string {
  const words = [relation.word1.japanese, relation.word2.japanese].sort();
  return `${relation.type}:${words[0]}:${words[1]}`;
}

describe("wordRelations corpus", () => {
  it("has 435 unique relations from N5 through N2", () => {
    expect(wordRelationTotal).toBe(435);
    expect(wordRelations).toHaveLength(435);
    const ids = wordRelations.map((relation) => relation.id);
    expect(new Set(ids).size).toBe(435);
  });

  it("meets the per-level size targets", () => {
    for (const level of WORD_RELATION_LEVELS) {
      const count = wordRelations.filter(
        (relation) => relation.jlptLevel === level
      ).length;
      expect(count).toBe(EXPECTED_BY_LEVEL[level]);
    }
  });

  it("includes both relationship types at every level", () => {
    for (const level of WORD_RELATION_LEVELS) {
      for (const type of WORD_RELATION_TYPES) {
        const count = wordRelations.filter(
          (relation) => relation.jlptLevel === level && relation.type === type
        ).length;
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate ids, pairs, or self-pairings", () => {
    const ids = new Set<string>();
    const pairs = new Set<string>();

    for (const relation of wordRelations) {
      expect(ids.has(relation.id)).toBe(false);
      ids.add(relation.id);

      expect(relation.word1.japanese).not.toBe(relation.word2.japanese);
      expect(pairs.has(pairKey(relation))).toBe(false);
      pairs.add(pairKey(relation));
    }
  });

  it("requires a nuance note on every synonym pair", () => {
    for (const relation of wordRelations) {
      if (relation.type !== "synonym") continue;
      expect(relation.nuance?.trim()).toBeTruthy();
    }
  });

  it("filters by search across Japanese, reading, and English", () => {
    const byKanji = filterWordRelations(wordRelations, { search: "増える" });
    const byReading = filterWordRelations(wordRelations, { search: "ふえる" });
    const byEnglish = filterWordRelations(wordRelations, { search: "increase" });

    expect(byKanji.length).toBeGreaterThan(0);
    expect(byReading.length).toBeGreaterThan(0);
    expect(byEnglish.length).toBeGreaterThan(0);

    const shared = byKanji.find((relation) =>
      byReading.some((other) => other.id === relation.id)
    );
    expect(shared).toBeDefined();
    expect(
      byEnglish.some((relation) => relation.id === shared?.id)
    ).toBe(true);
  });
});
