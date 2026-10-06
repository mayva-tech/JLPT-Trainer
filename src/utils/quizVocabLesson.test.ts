import { describe, expect, it } from "vitest";
import { getVocabularyLessonIdForQuiz } from "./quizVocabLesson";
import { getLessonById } from "../data/lessons";

describe("getVocabularyLessonIdForQuiz", () => {
  it("maps first, middle, and final word quizzes to lessons", () => {
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-1-10")).toBe("lesson-01");
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-221-230")).toBe(
      "lesson-23"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-441-450")).toBe(
      "lesson-45"
    );
  });

  it("rejects grammar, mixed, final, and malformed ids", () => {
    expect(getVocabularyLessonIdForQuiz("quiz-grammar-1-10")).toBeNull();
    expect(getVocabularyLessonIdForQuiz("quiz-mixed")).toBeNull();
    expect(getVocabularyLessonIdForQuiz("quiz-final")).toBeNull();
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-1-11")).toBeNull();
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-2-11")).toBeNull();
    expect(getVocabularyLessonIdForQuiz(null)).toBeNull();
  });

  it("covers all 200 vocabulary quizzes with 10 ids each", () => {
    // The mixed-level N2 course is no longer in the TOC (level playlists replace it),
    // but its lessons and quiz ids still resolve for the mixed / final quiz pools.
    const vocabQuizIds = Array.from({ length: 200 }, (_, i) => `quiz-vocab-${i * 10 + 1}-${i * 10 + 10}`);

    for (const id of vocabQuizIds) {
      const lessonId = getVocabularyLessonIdForQuiz(id);
      expect(lessonId).toBeTruthy();
      const lesson = getLessonById(lessonId!);
      expect(lesson?.vocabularyIds).toHaveLength(10);
    }

    expect(getLessonById("lesson-01")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4001 + i)
    );
    expect(getLessonById("lesson-23")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4221 + i)
    );
    expect(getLessonById("lesson-45")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4441 + i)
    );
    expect(getLessonById("lesson-50")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4491 + i)
    );
    expect(getLessonById("lesson-75")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4741 + i)
    );
    expect(getLessonById("lesson-76")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 4751 + i)
    );
    expect(getLessonById("lesson-200")!.vocabularyIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 5991 + i)
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-491-500")).toBe(
      "lesson-50"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-741-750")).toBe(
      "lesson-75"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-751-760")).toBe(
      "lesson-76"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-1991-2000")).toBe(
      "lesson-200"
    );
  });

  it("covers all 3 curated N1 vocabulary quizzes", () => {
    const n1VocabQuizIds = ["quiz-vocab-n1-01", "quiz-vocab-n1-02", "quiz-vocab-n1-03"];

    const expectedItemCounts: Record<string, number> = {
      "quiz-vocab-n1-01": 8,
      "quiz-vocab-n1-02": 5,
      "quiz-vocab-n1-03": 9,
    };

    for (const id of n1VocabQuizIds) {
      const lessonId = getVocabularyLessonIdForQuiz(id);
      expect(lessonId).toBeTruthy();
      const lesson = getLessonById(lessonId!);
      expect(lesson?.vocabularyIds).toHaveLength(expectedItemCounts[id]);
    }

    expect(getVocabularyLessonIdForQuiz("quiz-vocab-n1-01")).toBe(
      "n1-lesson-01"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-n1-04")).toBeNull();
  });
});
