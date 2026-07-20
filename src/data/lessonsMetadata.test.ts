import { describe, expect, it } from "vitest";
import { lessons } from "../data/lessons";
import type { VocabularyLessonCategory } from "../types/lesson";
import { getVocabularyDisplayRange } from "../utils/vocabularyDisplay";
import { getVocabularyLessonIdForQuiz } from "../utils/quizVocabLesson";
import { getVocabularyItemsForQuiz } from "../utils/vocabularyQuiz";

const ALLOWED_CATEGORIES: VocabularyLessonCategory[] = [
  "Daily Life",
  "Work & Business",
  "Society & Public Affairs",
  "Academic & Abstract",
  "Technology & Science",
];

describe("N2 vocabulary lesson metadata", () => {
  const n2Lessons = lessons.filter((lesson) => lesson.id.startsWith("lesson-"));

  it("has exactly 75 N2 vocabulary lessons", () => {
    expect(n2Lessons).toHaveLength(75);
  });

  it("gives each N2 lesson exactly 10 vocabulary ids", () => {
    for (const lesson of n2Lessons) {
      expect(lesson.vocabularyIds).toHaveLength(10);
    }
  });

  it("uses valid categories for every N2 lesson", () => {
    for (const lesson of n2Lessons) {
      expect(ALLOWED_CATEGORIES).toContain(lesson.category);
    }
  });

  it("avoids Daily Life Vocabulary in YouTube titles", () => {
    for (const lesson of n2Lessons) {
      expect(lesson.youtubeTitle).not.toContain("Daily Life Vocabulary");
      expect(lesson.youtubeTitle).toMatch(/^JLPT N2 Vocabulary #\d+ \| /);
    }
  });

  it("avoids duplicated Vocabulary wording in titles", () => {
    for (const lesson of n2Lessons) {
      expect(lesson.title).not.toMatch(/Vocabulary Vocabulary/i);
    }
  });

  it("fixes lesson 74 and 75 titles", () => {
    const lesson74 = lessons.find((l) => l.id === "lesson-74")!;
    const lesson75 = lessons.find((l) => l.id === "lesson-75")!;
    expect(lesson74.title).toBe("JLPT N2 Academic Reading Vocabulary #74");
    expect(lesson74.youtubeTitle).toBe(
      "JLPT N2 Vocabulary #74 | Academic Reading"
    );
    expect(lesson75.title).toBe(
      "JLPT N2 High-Frequency Abstract Verbs #75"
    );
    expect(lesson75.subtitle).toBe("Abstract • High-Frequency Verbs");
    expect(lesson75.youtubeTitle).toBe(
      "JLPT N2 Vocabulary #75 | High-Frequency Abstract Verbs"
    );
  });

  it("maps lesson 1 to words 1–10 and lesson 51 to words 501–510", () => {
    expect(getVocabularyDisplayRange("lesson-01")).toMatchObject({
      firstWordNumber: 1,
      lastWordNumber: 10,
    });
    expect(getVocabularyDisplayRange("lesson-51")).toMatchObject({
      firstWordNumber: 501,
      lastWordNumber: 510,
    });
  });

  it("maps every N2 vocabulary quiz to its lesson", () => {
    for (let n = 1; n <= 75; n++) {
      const first = (n - 1) * 10 + 1;
      const last = n * 10;
      const quizId = `quiz-vocab-${first}-${last}`;
      expect(getVocabularyLessonIdForQuiz(quizId)).toBe(
        `lesson-${String(n).padStart(2, "0")}`
      );
    }
  });

  it("reports lessons with fewer than 10 N2 quiz items when N1 words are present", () => {
    const reduced = n2Lessons
      .map((lesson) => ({
        lessonId: lesson.id,
        count: getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" }).length,
      }))
      .filter((entry) => entry.count < 10);
    expect(reduced.length).toBeGreaterThan(0);
  });
});
