import { describe, expect, it } from "vitest";
import { getGrammarLessonIdForQuiz } from "./quizGrammarLesson";
import { getGrammarLessonById } from "../data/grammar";
import { quizIds, getTocItem } from "../data/toc";

describe("getGrammarLessonIdForQuiz", () => {
  it("maps first, middle, and final grammar quizzes to lessons", () => {
    expect(getGrammarLessonIdForQuiz("quiz-grammar-1-10")).toBe(
      "grammar-lesson-01"
    );
    expect(getGrammarLessonIdForQuiz("quiz-grammar-41-50")).toBe(
      "grammar-lesson-05"
    );
    expect(getGrammarLessonIdForQuiz("quiz-grammar-51-60")).toBe(
      "grammar-lesson-06"
    );
    expect(getGrammarLessonIdForQuiz("quiz-grammar-101-110")).toBe(
      "grammar-lesson-11"
    );
    expect(getGrammarLessonIdForQuiz("quiz-grammar-191-200")).toBe(
      "grammar-lesson-20"
    );
  });

  it("rejects vocabulary, mixed, final, and malformed ids", () => {
    expect(getGrammarLessonIdForQuiz("quiz-vocab-51-60")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-mixed")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-final")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-grammar-1-9")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-grammar-2-11")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-grammar-191-201")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-grammar-201-210")).toBeNull();
    expect(getGrammarLessonIdForQuiz(null)).toBeNull();
  });

  it("covers all 20 grammar quizzes with 10 ids each", () => {
    const grammarQuizIds = quizIds.filter((id) =>
      id.startsWith("quiz-grammar-")
    );
    expect(grammarQuizIds).toHaveLength(20);

    for (const id of grammarQuizIds) {
      const lessonId = getGrammarLessonIdForQuiz(id);
      expect(lessonId).toBeTruthy();
      const lesson = getGrammarLessonById(lessonId!);
      expect(lesson?.grammarIds).toHaveLength(10);
      const toc = getTocItem(id);
      expect(toc?.kind).toBe("quiz");
      expect(toc?.quizId).toBe(id);
    }

    expect(getGrammarLessonById("grammar-lesson-01")!.grammarIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 5001 + i)
    );
    expect(getGrammarLessonById("grammar-lesson-06")!.grammarIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 5051 + i)
    );
    expect(getGrammarLessonById("grammar-lesson-11")!.grammarIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 5101 + i)
    );
    expect(getGrammarLessonById("grammar-lesson-20")!.grammarIds).toEqual(
      Array.from({ length: 10 }, (_, i) => 5191 + i)
    );
  });
});
