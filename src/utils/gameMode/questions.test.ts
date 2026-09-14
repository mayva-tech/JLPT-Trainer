import { describe, expect, it } from "vitest";
import type { VocabularyItem } from "../../types/vocabulary";
import {
  applyRevengeAnswer,
  createRevengeEnemies,
  livingRevengeEnemies,
  revengeSummary,
} from "./revenge";
import { emptyVocabQuizStats, type VocabQuizStore } from "../vocabQuizStats";
import {
  buildChoiceSet,
  defaultMixedWeights,
  pickWeightedCategory,
  selectNextGameQuestion,
  type GameContentPools,
} from "./questions";

function fakeVocab(id: number, word: string, meaning: string): VocabularyItem {
  return {
    id,
    jlpt: "N2",
    category: "Test",
    subcategory: "Test",
    word,
    reading: word,
    meaning,
    phrase: `${word}の例`,
    phraseReading: word,
    phraseMeaning: `${meaning} example`,
    sentence: `${word}です。`,
    sentenceReading: word,
    sentenceMeaning: `It is ${meaning}.`,
    kanjiDetails: [],
    wordType: "noun",
    audioWord: "",
    audioPhrase: "",
    audioSentence: "",
  };
}

function emptyPools(overrides: Partial<GameContentPools> = {}): GameContentPools {
  return {
    n2Vocab: [],
    weakVocab: [],
    expressions: [],
    relationsN2: [],
    relationsPrereq: [],
    grammarPrereq: [],
    ...overrides,
  };
}

function memoryStore(): VocabQuizStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

describe("buildChoiceSet", () => {
  it("builds unique shuffled choices including the correct answer", () => {
    const built = buildChoiceSet("stock", ["stock", "out of stock", "receipt", "aisle", "cart"], "s1");
    expect(built).not.toBeNull();
    expect(built!.choices.length).toBeGreaterThanOrEqual(2);
    expect(built!.choices.some((choice) => choice.id === built!.correctChoiceId)).toBe(true);
  });

  it("returns null when there are no usable distractors", () => {
    expect(buildChoiceSet("stock", ["stock", "Stock"], "s2")).toBeNull();
  });
});

describe("selectNextGameQuestion", () => {
  it("returns null-safe fallbacks when most categories are empty", () => {
    const pools = emptyPools({
      n2Vocab: [
        fakeVocab(4001, "在庫", "stock"),
        fakeVocab(4002, "品切れ", "out of stock"),
        fakeVocab(4003, "レジ", "cash register"),
        fakeVocab(4004, "袋", "bag"),
      ],
    });
    const used = new Set<string>();
    const first = selectNextGameQuestion({
      pools,
      weights: defaultMixedWeights(pools),
      usedKeys: used,
      seed: "t1",
      random: () => 0.1,
    });
    expect(first).not.toBeNull();
    expect(first!.choices.length).toBeGreaterThanOrEqual(2);
    used.add(first!.sourceKey);
    const second = selectNextGameQuestion({
      pools,
      weights: defaultMixedWeights(pools),
      usedKeys: used,
      seed: "t2",
      random: () => 0.4,
    });
    expect(second).not.toBeNull();
    expect(second!.sourceKey).not.toBe(first!.sourceKey);
  });

  it("does not crash when every category is empty", () => {
    const question = selectNextGameQuestion({
      pools: emptyPools(),
      weights: defaultMixedWeights(emptyPools()),
      usedKeys: new Set(),
      seed: "empty",
    });
    expect(question).toBeNull();
  });

  it("skips zero-weight categories", () => {
    const picked = pickWeightedCategory(
      { n2: 0, weak: 0, relation: 0, expression: 0, prerequisite: 0, listening: 10 },
      () => 0.5
    );
    expect(picked).toBe("listening");
  });
});

describe("revenge enemies", () => {
  it("takes two correct hits to defeat a word without deleting the list itself", () => {
    const enemies = createRevengeEnemies(
      [fakeVocab(4001, "あえて", "dare to")],
      "r1"
    );
    expect(enemies[0]?.hp).toBe(2);
    const afterHit = applyRevengeAnswer(enemies, 4001, true);
    expect(afterHit.defeated).toBe(false);
    expect(afterHit.remainingHp).toBe(1);
    const afterKill = applyRevengeAnswer(afterHit.enemies, 4001, true);
    expect(afterKill.defeated).toBe(true);
    expect(livingRevengeEnemies(afterKill.enemies)).toHaveLength(0);
  });

  it("keeps a word living after a miss", () => {
    const enemies = createRevengeEnemies(
      [fakeVocab(4001, "あえて", "dare to")],
      "r2"
    );
    const afterMiss = applyRevengeAnswer(enemies, 4001, false);
    expect(afterMiss.defeated).toBe(false);
    expect(afterMiss.remainingHp).toBe(2);
  });

  it("summarizes against the existing stats file", () => {
    const store = memoryStore();
    store.setItem(
      "jlpt-trainer:vocab-quiz-stats:v1",
      JSON.stringify(emptyVocabQuizStats())
    );
    const enemies = createRevengeEnemies(
      [fakeVocab(4001, "あえて", "dare to")],
      "r3"
    );
    const summary = revengeSummary(enemies, store);
    expect(summary.attempted).toBe(0);
    expect(summary.defeated).toBe(0);
  });
});
