import { describe, expect, it } from "vitest";
import { getLessonById } from "../data/lessons";
import { getVocabularyById, getVocabularyByIds, vocabulary } from "../data/vocabulary";
import {
  getTocItem,
  lessonGroupIds,
  quizIds,
  tocGroups,
} from "../data/toc";
import { getVocabularyLessonIdForQuiz } from "./quizVocabLesson";
import {
  isVocabularyQuizId,
  recordVocabQuizAnswer,
  VOCAB_QUIZ_STATS_KEY,
  type VocabQuizItemStats,
  type VocabQuizStatsFile,
  type VocabQuizStore,
} from "./vocabQuizStats";
import { buildVocabularyQuizQuestions } from "./vocabularyQuiz";
import {
  getWeakVocabularyReviewItems,
  getWeakVocabularyRetestItems,
  WEAK_WORDS_RETEST_QUIZ_ID,
} from "./weakVocabularyReview";

function weakStats(
  itemId: number,
  extra: Partial<VocabQuizItemStats> = {}
): VocabQuizItemStats {
  return {
    itemId,
    seenCount: 1,
    correctCount: 0,
    wrongCount: 1,
    lastResult: "incorrect",
    lastReviewedAt: 1,
    ...extra,
  };
}

function statsFile(rows: VocabQuizItemStats[]): VocabQuizStatsFile {
  return {
    version: 1,
    items: Object.fromEntries(rows.map((row) => [String(row.itemId), row])),
  };
}

function memoryStore(initial: string | null = null): VocabQuizStore {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
  };
}

describe("getWeakVocabularyReviewItems", () => {
  it("returns no review items when stats are empty", () => {
    expect(getWeakVocabularyReviewItems(statsFile([]))).toEqual([]);
  });

  it("resolves weak ids to the correct VocabularyItems", () => {
    const file = statsFile([weakStats(4002), weakStats(4001)]);
    const items = getWeakVocabularyReviewItems(file);
    expect(items.map((item) => item.id)).toEqual([4001, 4002]);
    expect(items[0]).toEqual(getVocabularyById(4001));
    expect(items[1]).toEqual(getVocabularyById(4002));
  });

  it("skips unknown ids without failing", () => {
    const file = statsFile([
      weakStats(4001),
      weakStats(9_999_999),
      weakStats(4003),
    ]);
    expect(getWeakVocabularyReviewItems(file).map((item) => item.id)).toEqual([
      4001, 4003,
    ]);
  });

  it("keeps deterministic weak-id order across repeated calls", () => {
    const file = statsFile([
      weakStats(4010),
      weakStats(4005),
      weakStats(4001),
    ]);
    const first = getWeakVocabularyReviewItems(file).map((item) => item.id);
    const second = getWeakVocabularyReviewItems(file).map((item) => item.id);
    expect(first).toEqual([4001, 4005, 4010]);
    expect(second).toEqual(first);
  });

  it("can include N1 weak vocabulary", () => {
    const n1Id = 4213;
    const n1Item = getVocabularyById(n1Id);
    expect(n1Item?.jlpt).toBe("N1");

    const file = statsFile([weakStats(4001), weakStats(n1Id)]);
    const items = getWeakVocabularyReviewItems(file);
    expect(items.map((item) => item.id)).toEqual([4001, n1Id]);
    expect(items[1]?.jlpt).toBe("N1");
    expect(items[1]).toEqual(n1Item);
  });

  it("does not change normal lesson-01 vocabulary", () => {
    const lesson = getLessonById("lesson-01")!;
    expect(lesson.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4001 + i)
    );
    expect(getVocabularyByIds(lesson.vocabularyIds).map((item) => item.id)).toEqual(
      lesson.vocabularyIds
    );
    getWeakVocabularyReviewItems(statsFile([weakStats(4001)]));
    expect(getLessonById("lesson-01")!.vocabularyIds).toEqual(lesson.vocabularyIds);
  });
});

describe("getWeakVocabularyRetestItems", () => {
  it("returns no retest targets when there are zero weak items", () => {
    expect(getWeakVocabularyRetestItems(statsFile([]))).toEqual([]);
  });

  it("uses all weak items when count is 1–10", () => {
    const file = statsFile([
      weakStats(4003),
      weakStats(4001),
      weakStats(4002),
    ]);
    expect(getWeakVocabularyRetestItems(file).map((item) => item.id)).toEqual([
      4001, 4002, 4003,
    ]);
  });

  it("samples exactly 10 deterministic targets when more than 10 are weak", () => {
    const ids = Array.from({ length: 15 }, (_, i) => 4001 + i);
    const file = statsFile(ids.map((id) => weakStats(id)));
    const first = getWeakVocabularyRetestItems(file).map((item) => item.id);
    const second = getWeakVocabularyRetestItems(file).map((item) => item.id);
    expect(first).toHaveLength(10);
    expect(second).toEqual(first);
    expect(new Set(first).size).toBe(10);
    for (const id of first) {
      expect(ids).toContain(id);
    }
  });

  it("only includes currently weak items as targets", () => {
    const file = statsFile([
      weakStats(4001),
      weakStats(4002, {
        correctCount: 2,
        wrongCount: 1,
        lastResult: "correct",
      }),
      weakStats(4003),
    ]);
    // 4002 is not weak: last correct and wrongCount <= correctCount
    expect(getWeakVocabularyRetestItems(file).map((item) => item.id)).toEqual([
      4001, 4003,
    ]);
  });

  it("skips unknown ids and can include N1 with N2", () => {
    const n1Id = 4213;
    expect(getVocabularyById(n1Id)?.jlpt).toBe("N1");
    const file = statsFile([
      weakStats(4001),
      weakStats(9_999_999),
      weakStats(n1Id),
    ]);
    expect(getWeakVocabularyRetestItems(file).map((item) => item.id)).toEqual([
      4001,
      n1Id,
    ]);
  });

  it("does not mutate weak classification by selecting targets", () => {
    const file = statsFile([weakStats(4001), weakStats(4002)]);
    getWeakVocabularyRetestItems(file);
    expect(file.items["4001"]?.wrongCount).toBe(1);
    expect(file.items["4002"]?.lastResult).toBe("incorrect");
  });
});

describe("weak-words quiz isolation", () => {
  it("is not recognized as a vocabulary quiz or lesson", () => {
    expect(isVocabularyQuizId("weak-words")).toBe(false);
    expect(getVocabularyLessonIdForQuiz("weak-words")).toBeNull();
  });

  it("recognizes quiz-weak-retest as a vocabulary quiz without a lesson map", () => {
    expect(isVocabularyQuizId(WEAK_WORDS_RETEST_QUIZ_ID)).toBe(true);
    expect(getVocabularyLessonIdForQuiz(WEAK_WORDS_RETEST_QUIZ_ID)).toBeNull();
  });
});

describe("weak-words TOC placement", () => {
  it("exists under Reference beside Glossary", () => {
    const reference = tocGroups.find((group) => group.id === "reference");
    expect(reference?.items.map((item) => item.id)).toEqual([
      "glossary",
      "weak-words",
    ]);
    expect(getTocItem("weak-words")).toEqual({
      id: "weak-words",
      label: "Weak Words",
      kind: "weak-words",
    });
  });

  it("is not included in lesson, quiz, or video-flow groups", () => {
    expect(lessonGroupIds).not.toContain("weak-words");
    expect(quizIds).not.toContain("weak-words");
    expect(quizIds).not.toContain(WEAK_WORDS_RETEST_QUIZ_ID);
    expect(getTocItem(WEAK_WORDS_RETEST_QUIZ_ID)).toBeUndefined();
  });
});

describe("weak words retest quiz building", () => {
  it("builds a single-item retest with a real English distractor", () => {
    const targets = getWeakVocabularyRetestItems(statsFile([weakStats(4001)]));
    expect(targets).toHaveLength(1);
    const questions = buildVocabularyQuizQuestions(
      targets,
      WEAK_WORDS_RETEST_QUIZ_ID,
      { distractorPool: vocabulary }
    );
    expect(questions).toHaveLength(1);
    const q = questions[0]!;
    expect(q.item.id).toBe(4001);
    expect(q.choices).toHaveLength(2);
    expect(q.choices).toContain(q.item.meaning);
    const wrong = q.choices.find((c) => c !== q.item.meaning);
    expect(wrong).toBeTruthy();
    expect(wrong).not.toBe("—");
    expect(wrong!.trim().length).toBeGreaterThan(0);
  });

  it("never adds non-weak items as question targets", () => {
    const file = statsFile([weakStats(4001), weakStats(4002)]);
    const targets = getWeakVocabularyRetestItems(file);
    const questions = buildVocabularyQuizQuestions(
      targets,
      WEAK_WORDS_RETEST_QUIZ_ID,
      { distractorPool: vocabulary }
    );
    expect(questions.map((q) => q.item.id).sort((a, b) => a - b)).toEqual([
      4001, 4002,
    ]);
  });

  it("records correct and incorrect retest answers in existing vocab stats", () => {
    const store = memoryStore();
    recordVocabQuizAnswer(
      {
        itemId: 4001,
        correct: false,
        quizId: WEAK_WORDS_RETEST_QUIZ_ID,
        at: 10,
      },
      store
    );
    recordVocabQuizAnswer(
      {
        itemId: 4001,
        correct: true,
        quizId: WEAK_WORDS_RETEST_QUIZ_ID,
        at: 20,
      },
      store
    );
    const raw = store.getItem(VOCAB_QUIZ_STATS_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as VocabQuizStatsFile;
    expect(parsed.items["4001"]).toMatchObject({
      itemId: 4001,
      seenCount: 2,
      correctCount: 1,
      wrongCount: 1,
      lastResult: "correct",
    });
  });
});
