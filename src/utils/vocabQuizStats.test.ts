import { describe, expect, it } from "vitest";
import {
  VOCAB_QUIZ_STATS_KEY,
  emptyVocabQuizStats,
  getVocabQuizItemStats,
  getVocabQuizSummary,
  getWeakVocabItemIds,
  isVocabularyQuizId,
  loadVocabQuizStats,
  recordVocabQuizAnswer,
  type VocabQuizItemStats,
  type VocabQuizStatsFile,
  type VocabQuizStore,
} from "./vocabQuizStats";

const UNRELATED_KEYS = {
  "jlpt-trainer:konbini:v1": '{"known":["a"],"practiced":["b"]}',
  "jlpt-trainer:trip:v1": '{"known":["c"],"practiced":["d"]}',
  "jlpt-trainer:phone:v1": '{"known":["e"],"practiced":["f"]}',
  "jlpt-trainer:phone-favourites:v1": '{"known":["g"],"practiced":[]}',
  "jlpt-trainer:relations:v1": '{"known":["h"],"practiced":["i"]}',
} as const;

function memoryStore(
  initial: Record<string, string> = {}
): VocabQuizStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

describe("isVocabularyQuizId", () => {
  it("accepts lesson, N1, mixed, and final vocabulary quizzes", () => {
    expect(isVocabularyQuizId("quiz-vocab-1-10")).toBe(true);
    expect(isVocabularyQuizId("quiz-vocab-n1-01")).toBe(true);
    expect(isVocabularyQuizId("quiz-mixed")).toBe(true);
    expect(isVocabularyQuizId("quiz-final")).toBe(true);
  });

  it("rejects grammar quizzes and empty ids", () => {
    expect(isVocabularyQuizId("quiz-grammar-1-10")).toBe(false);
    expect(isVocabularyQuizId("quiz-grammar-11-20")).toBe(false);
    expect(isVocabularyQuizId(null)).toBe(false);
    expect(isVocabularyQuizId(undefined)).toBe(false);
    expect(isVocabularyQuizId("")).toBe(false);
  });
});

describe("loadVocabQuizStats", () => {
  it("returns an empty v1 file when storage is missing", () => {
    expect(loadVocabQuizStats(null)).toEqual({ version: 1, items: {} });
    expect(loadVocabQuizStats(memoryStore())).toEqual({ version: 1, items: {} });
  });

  it("returns an empty v1 file when JSON is corrupt", () => {
    const store = memoryStore({ [VOCAB_QUIZ_STATS_KEY]: "{not-json" });
    expect(loadVocabQuizStats(store)).toEqual({ version: 1, items: {} });
  });

  it("skips malformed stored items without crashing", () => {
    const store = memoryStore({
      [VOCAB_QUIZ_STATS_KEY]: JSON.stringify({
        version: 1,
        items: {
          "4001": {
            itemId: 4001,
            seenCount: 2,
            correctCount: 1,
            wrongCount: 1,
            lastResult: "incorrect",
            lastReviewedAt: 50,
          },
          bad: null,
          broken: { foo: 1 },
          "0": {
            itemId: 0,
            seenCount: 1,
            correctCount: 0,
            wrongCount: 1,
            lastResult: "incorrect",
            lastReviewedAt: 1,
          },
          nope: {
            itemId: "4002",
            seenCount: 1,
            correctCount: 1,
            wrongCount: 0,
            lastResult: "correct",
            lastReviewedAt: 1,
          },
        },
      }),
    });

    expect(loadVocabQuizStats(store)).toEqual({
      version: 1,
      items: {
        "4001": {
          itemId: 4001,
          seenCount: 2,
          correctCount: 1,
          wrongCount: 1,
          lastResult: "incorrect",
          lastReviewedAt: 50,
        },
      },
    });
  });
});

describe("recordVocabQuizAnswer", () => {
  it("records one correct answer", () => {
    const store = memoryStore();
    const stats = recordVocabQuizAnswer(
      { itemId: 4001, correct: true, at: 1_000 },
      store
    );
    expect(stats).toEqual({
      itemId: 4001,
      seenCount: 1,
      correctCount: 1,
      wrongCount: 0,
      lastResult: "correct",
      lastReviewedAt: 1_000,
    });
    expect(getVocabQuizItemStats(4001, loadVocabQuizStats(store))).toEqual(
      stats
    );
  });

  it("increments after a correct then an incorrect answer", () => {
    const store = memoryStore();
    recordVocabQuizAnswer({ itemId: 4001, correct: true, at: 1_000 }, store);
    const stats = recordVocabQuizAnswer(
      { itemId: 4001, correct: false, at: 2_000 },
      store
    );
    expect(stats).toEqual({
      itemId: 4001,
      seenCount: 2,
      correctCount: 1,
      wrongCount: 1,
      lastResult: "incorrect",
      lastReviewedAt: 2_000,
    });
  });

  it("increments repeated incorrect answers", () => {
    const store = memoryStore();
    recordVocabQuizAnswer({ itemId: 4002, correct: false, at: 10 }, store);
    recordVocabQuizAnswer({ itemId: 4002, correct: false, at: 20 }, store);
    const stats = recordVocabQuizAnswer(
      { itemId: 4002, correct: false, at: 30 },
      store
    );
    expect(stats).toEqual({
      itemId: 4002,
      seenCount: 3,
      correctCount: 0,
      wrongCount: 3,
      lastResult: "incorrect",
      lastReviewedAt: 30,
    });
  });

  it("updates lastReviewedAt with the explicit timestamp", () => {
    const store = memoryStore();
    recordVocabQuizAnswer({ itemId: 4003, correct: true, at: 111 }, store);
    expect(
      getVocabQuizItemStats(4003, loadVocabQuizStats(store))?.lastReviewedAt
    ).toBe(111);
    recordVocabQuizAnswer({ itemId: 4003, correct: false, at: 222 }, store);
    expect(
      getVocabQuizItemStats(4003, loadVocabQuizStats(store))?.lastReviewedAt
    ).toBe(222);
  });

  it("does not record grammar quiz ids", () => {
    const store = memoryStore();
    const result = recordVocabQuizAnswer(
      {
        itemId: 4001,
        correct: false,
        quizId: "quiz-grammar-1-10",
        at: 1,
      },
      store
    );
    expect(result).toBeNull();
    expect(getVocabQuizItemStats(4001, loadVocabQuizStats(store))).toBeUndefined();
    expect(loadVocabQuizStats(store)).toEqual({ version: 1, items: {} });
    expect(store.data[VOCAB_QUIZ_STATS_KEY]).toBeUndefined();
  });

  it("records mixed and final quizzes when quizId is passed", () => {
    const store = memoryStore();
    recordVocabQuizAnswer(
      { itemId: 4018, correct: true, quizId: "quiz-mixed", at: 5 },
      store
    );
    recordVocabQuizAnswer(
      { itemId: 4833, correct: false, quizId: "quiz-final", at: 6 },
      store
    );
    const file = loadVocabQuizStats(store);
    expect(getVocabQuizItemStats(4018, file)?.seenCount).toBe(1);
    expect(getVocabQuizItemStats(4833, file)?.wrongCount).toBe(1);
  });

  it("records weak-words retest quizzes when quizId is passed", () => {
    const store = memoryStore();
    recordVocabQuizAnswer(
      { itemId: 4001, correct: false, quizId: "quiz-weak-retest", at: 7 },
      store
    );
    expect(getVocabQuizItemStats(4001, loadVocabQuizStats(store))).toMatchObject({
      wrongCount: 1,
      lastResult: "incorrect",
    });
  });

  it("leaves unrelated progress keys untouched", () => {
    const store = memoryStore({ ...UNRELATED_KEYS });
    const before = { ...store.data };
    recordVocabQuizAnswer({ itemId: 4001, correct: true, at: 1 }, store);
    for (const key of Object.keys(UNRELATED_KEYS)) {
      expect(store.data[key]).toBe(before[key]);
    }
    expect(store.data[VOCAB_QUIZ_STATS_KEY]).toBeTruthy();
  });
});

describe("getWeakVocabItemIds", () => {
  it("follows the v1 weak-item rule", () => {
    const store = memoryStore();
    recordVocabQuizAnswer({ itemId: 1, correct: true, at: 1 }, store);
    recordVocabQuizAnswer({ itemId: 2, correct: false, at: 1 }, store);
    recordVocabQuizAnswer({ itemId: 3, correct: true, at: 1 }, store);
    recordVocabQuizAnswer({ itemId: 3, correct: false, at: 2 }, store);
    recordVocabQuizAnswer({ itemId: 4, correct: false, at: 1 }, store);
    recordVocabQuizAnswer({ itemId: 4, correct: true, at: 2 }, store);
    recordVocabQuizAnswer({ itemId: 4, correct: true, at: 3 }, store);
    recordVocabQuizAnswer({ itemId: 5, correct: false, at: 1 }, store);
    recordVocabQuizAnswer({ itemId: 5, correct: false, at: 2 }, store);
    recordVocabQuizAnswer({ itemId: 5, correct: true, at: 3 }, store);

    expect(getWeakVocabItemIds(loadVocabQuizStats(store))).toEqual([2, 3, 5]);
  });
});

function statsFile(rows: VocabQuizItemStats[]): VocabQuizStatsFile {
  return {
    version: 1,
    items: Object.fromEntries(rows.map((row) => [String(row.itemId), row])),
  };
}

describe("getVocabQuizSummary", () => {
  it("returns zeros and null accuracy for an empty file", () => {
    expect(getVocabQuizSummary(emptyVocabQuizStats())).toEqual({
      uniqueItemsAttempted: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      accuracyPercent: null,
      weakCount: 0,
      nonWeakAttemptedCount: 0,
      recentItemIds: [],
    });
  });

  it("aggregates repeated answers for one item", () => {
    const summary = getVocabQuizSummary(
      statsFile([
        {
          itemId: 4001,
          seenCount: 5,
          correctCount: 3,
          wrongCount: 2,
          lastResult: "correct",
          lastReviewedAt: 100,
        },
      ])
    );
    expect(summary).toEqual({
      uniqueItemsAttempted: 1,
      totalAttempts: 5,
      totalCorrect: 3,
      totalIncorrect: 2,
      accuracyPercent: 60,
      weakCount: 0,
      nonWeakAttemptedCount: 1,
      recentItemIds: [4001],
    });
  });

  it("aggregates multiple items and weak vs non-weak counts", () => {
    const summary = getVocabQuizSummary(
      statsFile([
        {
          itemId: 4001,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 10,
        },
        {
          itemId: 4002,
          seenCount: 2,
          correctCount: 0,
          wrongCount: 2,
          lastResult: "incorrect",
          lastReviewedAt: 20,
        },
        {
          itemId: 4003,
          seenCount: 3,
          correctCount: 1,
          wrongCount: 2,
          lastResult: "correct",
          lastReviewedAt: 30,
        },
      ])
    );
    // 4002 weak (last incorrect). 4003 weak (wrong > correct). 4001 not weak.
    expect(summary.uniqueItemsAttempted).toBe(3);
    expect(summary.totalAttempts).toBe(6);
    expect(summary.totalCorrect).toBe(2);
    expect(summary.totalIncorrect).toBe(4);
    expect(summary.accuracyPercent).toBe(33); // round(2/6*100)
    expect(summary.weakCount).toBe(2);
    expect(summary.nonWeakAttemptedCount).toBe(1);
  });

  it("returns null accuracy when there are zero answers", () => {
    expect(getVocabQuizSummary(emptyVocabQuizStats()).accuracyPercent).toBeNull();
  });

  it("rounds accuracy to a whole percent", () => {
    expect(
      getVocabQuizSummary(
        statsFile([
          {
            itemId: 1,
            seenCount: 3,
            correctCount: 1,
            wrongCount: 2,
            lastResult: "incorrect",
            lastReviewedAt: 1,
          },
        ])
      ).accuracyPercent
    ).toBe(33);
    expect(
      getVocabQuizSummary(
        statsFile([
          {
            itemId: 1,
            seenCount: 3,
            correctCount: 2,
            wrongCount: 1,
            lastResult: "correct",
            lastReviewedAt: 1,
          },
        ])
      ).accuracyPercent
    ).toBe(67);
  });

  it("summarizes only rows that survive load sanitization", () => {
    const store = memoryStore({
      [VOCAB_QUIZ_STATS_KEY]: JSON.stringify({
        version: 1,
        items: {
          "4001": {
            itemId: 4001,
            seenCount: 2,
            correctCount: 1,
            wrongCount: 1,
            lastResult: "incorrect",
            lastReviewedAt: 50,
          },
          bad: null,
          broken: { foo: 1 },
        },
      }),
    });
    const summary = getVocabQuizSummary(loadVocabQuizStats(store));
    expect(summary.uniqueItemsAttempted).toBe(1);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.totalCorrect).toBe(1);
    expect(summary.totalIncorrect).toBe(1);
    expect(summary.accuracyPercent).toBe(50);
    expect(summary.weakCount).toBe(1);
  });

  it("orders recent item ids by lastReviewedAt desc, then item id", () => {
    const summary = getVocabQuizSummary(
      statsFile([
        {
          itemId: 4003,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 100,
        },
        {
          itemId: 4001,
          seenCount: 1,
          correctCount: 0,
          wrongCount: 1,
          lastResult: "incorrect",
          lastReviewedAt: 200,
        },
        {
          itemId: 4002,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 200,
        },
        {
          itemId: 4004,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 50,
        },
        {
          itemId: 4005,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 40,
        },
        {
          itemId: 4006,
          seenCount: 1,
          correctCount: 1,
          wrongCount: 0,
          lastResult: "correct",
          lastReviewedAt: 30,
        },
      ])
    );
    // 200: 4001 then 4002 (id asc), then 100, 50, 40 — drop 4006 beyond limit 5
    expect(summary.recentItemIds).toEqual([4001, 4002, 4003, 4004, 4005]);
  });
});
