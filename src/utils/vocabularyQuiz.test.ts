import { describe, expect, it } from "vitest";
import { getLessonById, lessons } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import {
  assignQuestionTypes,
  buildGrammarQuizQuestions,
  buildVocabularyQuizQuestions,
  getN2VocabularyCoursePool,
  getVocabularyItemsForQuiz,
  sampleN2CourseQuizItems,
  seededShuffle,
} from "./vocabularyQuiz";
import { getGrammarItemsForLesson, getGrammarLessonById } from "../data/grammar";
import {
  N2_VOCAB_ID_END,
  N2_VOCAB_ID_START,
  N2_VOCAB_ITEMS_PER_LESSON,
  N2_VOCAB_LESSON_COUNT,
} from "../config/vocabularyCourse";
import { formatLessonIdFromNumber } from "./vocabularyDisplay";

describe("getVocabularyItemsForQuiz", () => {
  it("excludes N1 items from N2 quizzes", () => {
    const lesson = getLessonById("lesson-22")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    expect(items.every((item) => item.jlpt === "N2")).toBe(true);
    expect(items.length).toBeLessThan(lesson.vocabularyIds.length);
  });

  it("includes N1 items in N1 curated quizzes", () => {
    const lesson = getLessonById("n1-lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N1" });
    expect(items.length).toBe(8);
    expect(items.every((item) => item.jlpt === "N1")).toBe(true);
  });
});

describe("buildVocabularyQuizQuestions", () => {
  it("uses only japanese-to-english questions for a full 10-item N2 quiz", () => {
    const lesson = getLessonById("lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const questions = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.type === "japanese-to-english")).toBe(true);
    expect(questions.every((q) => q.choiceKind === "english")).toBe(true);
    expect(questions.map((q) => q.type)).toEqual(assignQuestionTypes(10));
  });

  it("adapts question count when fewer N2 items are available", () => {
    const lesson = getLessonById("lesson-22")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const questions = buildVocabularyQuizQuestions(
      items,
      "quiz-vocab-211-220"
    );
    expect(questions.length).toBe(items.length);
    expect(questions.length).toBeLessThan(10);
    expect(questions[0]?.type).toBe("japanese-to-english");
  });

  it("generates deterministic question order for the same quiz id", () => {
    const lesson = getLessonById("lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const first = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    const second = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    expect(first.map((q) => q.item.id)).toEqual(second.map((q) => q.item.id));
  });

  it("never produces duplicate answer choices", () => {
    const lesson = getLessonById("lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const questions = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    for (const question of questions) {
      expect(question.choices).toHaveLength(2);
      const normalized = question.choices.map((c) => c.trim().toLowerCase());
      expect(new Set(normalized).size).toBe(question.choices.length);
    }
  });

  it("keeps default distractor pool when no options are passed", () => {
    const lesson = getLessonById("lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const withOpts = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10", {});
    const without = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    expect(withOpts.map((q) => q.item.id)).toEqual(without.map((q) => q.item.id));
    expect(withOpts.map((q) => q.choices)).toEqual(without.map((q) => q.choices));
  });

  it("can draw distractors from a separate pool without adding targets", () => {
    const target = getVocabularyByIds([4001]);
    const pool = getVocabularyByIds([4001, 4002, 4003]);
    const questions = buildVocabularyQuizQuestions(target, "quiz-weak-retest", {
      distractorPool: pool,
    });
    expect(questions).toHaveLength(1);
    expect(questions[0]!.item.id).toBe(4001);
    expect(questions[0]!.choices).toContain(questions[0]!.item.meaning);
    const other = questions[0]!.choices.find(
      (c) => c !== questions[0]!.item.meaning
    );
    expect([pool[1]!.meaning, pool[2]!.meaning]).toContain(other);
  });
});

describe("seededShuffle", () => {
  it("is deterministic for the same seed", () => {
    const ids = getVocabularyByIds(lessons[0]!.vocabularyIds).map((v) => v.id);
    const a = seededShuffle(ids, "quiz-vocab-1-10");
    const b = seededShuffle(ids, "quiz-vocab-1-10");
    expect(a).toEqual(b);
  });
});

describe("buildGrammarQuizQuestions", () => {
  it("embeds japanese-to-english choices for grammar lessons", () => {
    const lesson = getGrammarLessonById("grammar-batch-001-010")!;
    const items = getGrammarItemsForLesson(lesson);
    expect(items.every((item) => item.jlpt === "N2" || item.courseLevel.startsWith("N2"))).toBe(true);
    const questions = buildGrammarQuizQuestions(items, "quiz-grammar-1-10");
    expect(questions.length).toBe(items.length);
    for (const question of questions) {
      expect(question.type).toBe("japanese-to-english");
      expect(question.choiceKind).toBe("english");
      expect(question.choices).toHaveLength(2);
      expect(question.choices[question.correctChoiceIndex]).toBe(
        question.item.meaning
      );
    }
  });

  it("is deterministic for the same quiz id", () => {
    const lesson = getGrammarLessonById("grammar-batch-001-010")!;
    const items = getGrammarItemsForLesson(lesson);
    const a = buildGrammarQuizQuestions(items, "quiz-grammar-1-10");
    const b = buildGrammarQuizQuestions(items, "quiz-grammar-1-10");
    expect(a.map((q) => q.item.id)).toEqual(b.map((q) => q.item.id));
    expect(a.map((q) => q.choices)).toEqual(b.map((q) => q.choices));
  });
});

function n2LessonIdForVocabId(vocabId: number): string | undefined {
  return lessons.find(
    (lesson) =>
      lesson.id.startsWith("lesson-") && lesson.vocabularyIds.includes(vocabId)
  )?.id;
}

describe("N2 course mixed/final quiz sampling", () => {
  const lesson01Ids = getLessonById("lesson-01")!.vocabularyIds;

  it("builds a pool covering lessons 1–200 and the Core 2000 range", () => {
    const pool = getN2VocabularyCoursePool();
    expect(pool.every((item) => item.jlpt === "N2")).toBe(true);
    expect(pool.some((item) => item.id === N2_VOCAB_ID_START)).toBe(true);
    expect(pool.some((item) => item.id === N2_VOCAB_ID_END)).toBe(true);
    expect(pool.some((item) => item.id >= 4751)).toBe(true);

    const lessonIds = new Set(
      pool.map((item) => n2LessonIdForVocabId(item.id)).filter(Boolean)
    );
    expect(lessonIds.size).toBe(N2_VOCAB_LESSON_COUNT);
    expect(lessonIds.has("lesson-01")).toBe(true);
    expect(lessonIds.has("lesson-200")).toBe(true);
    expect(lessonIds.has(formatLessonIdFromNumber(1))).toBe(true);
    expect(lessonIds.has(formatLessonIdFromNumber(N2_VOCAB_LESSON_COUNT))).toBe(
      true
    );
  });

  it("samples 10 N2 items for mixed from more than one lesson, not lesson 1 only", () => {
    const items = sampleN2CourseQuizItems("quiz-mixed");
    expect(items).toHaveLength(N2_VOCAB_ITEMS_PER_LESSON);
    expect(items.every((item) => item.jlpt === "N2")).toBe(true);

    const sourceLessons = new Set(
      items.map((item) => n2LessonIdForVocabId(item.id))
    );
    expect(sourceLessons.size).toBeGreaterThan(1);
    expect([...items.map((item) => item.id)].sort((a, b) => a - b)).not.toEqual(
      [...lesson01Ids].sort((a, b) => a - b)
    );

    const questions = buildVocabularyQuizQuestions(items, "quiz-mixed");
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.type === "japanese-to-english")).toBe(true);
    expect(questions.every((q) => q.item.jlpt === "N2")).toBe(true);
    expect(questions.every((q) => q.choiceKind === "english")).toBe(true);
    for (const question of questions) {
      expect(question.choices).toHaveLength(2);
      const normalized = question.choices.map((c) => c.trim().toLowerCase());
      expect(new Set(normalized).size).toBe(2);
    }
  });

  it("samples 10 N2 items for final from more than one lesson, not lesson 1 only", () => {
    const items = sampleN2CourseQuizItems("quiz-final");
    expect(items).toHaveLength(N2_VOCAB_ITEMS_PER_LESSON);
    expect(items.every((item) => item.jlpt === "N2")).toBe(true);

    const sourceLessons = new Set(
      items.map((item) => n2LessonIdForVocabId(item.id))
    );
    expect(sourceLessons.size).toBeGreaterThan(1);
    expect([...items.map((item) => item.id)].sort((a, b) => a - b)).not.toEqual(
      [...lesson01Ids].sort((a, b) => a - b)
    );

    const questions = buildVocabularyQuizQuestions(items, "quiz-final");
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.type === "japanese-to-english")).toBe(true);
    expect(questions.every((q) => q.item.jlpt === "N2")).toBe(true);
  });

  it("is deterministic for the same quiz id, including choices", () => {
    const firstItems = sampleN2CourseQuizItems("quiz-mixed");
    const secondItems = sampleN2CourseQuizItems("quiz-mixed");
    expect(firstItems.map((item) => item.id)).toEqual(
      secondItems.map((item) => item.id)
    );

    const first = buildVocabularyQuizQuestions(firstItems, "quiz-mixed");
    const second = buildVocabularyQuizQuestions(secondItems, "quiz-mixed");
    expect(first.map((q) => q.item.id)).toEqual(second.map((q) => q.item.id));
    expect(first.map((q) => q.choices)).toEqual(second.map((q) => q.choices));

    const deckA = seededShuffle(first, "quiz-mixed");
    const deckB = seededShuffle(second, "quiz-mixed");
    expect(deckA.map((q) => q.item.id)).toEqual(deckB.map((q) => q.item.id));
  });

  it("gives mixed and final different sampled sets", () => {
    const mixedIds = sampleN2CourseQuizItems("quiz-mixed").map(
      (item) => item.id
    );
    const finalIds = sampleN2CourseQuizItems("quiz-final").map(
      (item) => item.id
    );
    expect(mixedIds).not.toEqual(finalIds);
    expect([...mixedIds].sort((a, b) => a - b)).not.toEqual(
      [...finalIds].sort((a, b) => a - b)
    );
  });
});
