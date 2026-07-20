import { describe, expect, it } from "vitest";
import { getVocabularyLessonIdForQuiz } from "./quizVocabLesson";
import { getLessonById } from "../data/lessons";
import { quizIds, getTocItem } from "../data/toc";

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

  it("covers all 75 vocabulary quizzes with 10 ids each", () => {
    const vocabQuizIds = quizIds.filter((id) => id.startsWith("quiz-vocab-"));
    expect(vocabQuizIds).toHaveLength(75);

    for (const id of vocabQuizIds) {
      const lessonId = getVocabularyLessonIdForQuiz(id);
      expect(lessonId).toBeTruthy();
      const lesson = getLessonById(lessonId!);
      expect(lesson?.vocabularyIds).toHaveLength(10);
      const toc = getTocItem(id);
      expect(toc?.kind).toBe("quiz");
      expect(toc?.quizId).toBe(id);
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
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-491-500")).toBe(
      "lesson-50"
    );
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-741-750")).toBe(
      "lesson-75"
    );
  });
});
