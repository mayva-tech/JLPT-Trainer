import { describe, expect, it } from "vitest";
import {
  getVocabularyDisplayRange,
  formatN2VocabularyTocLessonLabel,
} from "./vocabularyDisplay";

describe("getVocabularyDisplayRange", () => {
  it("maps lesson-01 to words 1–10", () => {
    expect(getVocabularyDisplayRange("lesson-01")).toEqual({
      lessonNumber: 1,
      firstWordNumber: 1,
      lastWordNumber: 10,
    });
  });

  it("maps lesson-50 to words 491–500", () => {
    expect(getVocabularyDisplayRange("lesson-50")).toEqual({
      lessonNumber: 50,
      firstWordNumber: 491,
      lastWordNumber: 500,
    });
  });

  it("maps lesson-51 to words 501–510", () => {
    expect(getVocabularyDisplayRange("lesson-51")).toEqual({
      lessonNumber: 51,
      firstWordNumber: 501,
      lastWordNumber: 510,
    });
  });

  it("maps lesson-75 to words 741–750", () => {
    expect(getVocabularyDisplayRange("lesson-75")).toEqual({
      lessonNumber: 75,
      firstWordNumber: 741,
      lastWordNumber: 750,
    });
  });

  it("returns null for curated N1 lessons", () => {
    expect(getVocabularyDisplayRange("n1-lesson-01")).toBeNull();
  });
});

describe("formatN2VocabularyTocLessonLabel", () => {
  it("formats lesson 51 label with lesson number and word range", () => {
    expect(formatN2VocabularyTocLessonLabel(51)).toBe(
      "Vocabulary Lesson 51 | Words 501–510"
    );
  });
});
