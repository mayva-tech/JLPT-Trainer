import { describe, expect, it } from "vitest";
import { getLessonById, lessons } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import {
  assignQuestionTypes,
  buildVocabularyQuizQuestions,
  getVocabularyItemsForQuiz,
  seededShuffle,
} from "./vocabularyQuiz";

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
  it("uses mixed question types for a full 10-item N2 quiz", () => {
    const lesson = getLessonById("lesson-01")!;
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    const questions = buildVocabularyQuizQuestions(items, "quiz-vocab-1-10");
    expect(questions).toHaveLength(10);
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
      const normalized = question.choices.map((c) => c.trim().toLowerCase());
      expect(new Set(normalized).size).toBe(question.choices.length);
    }
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
