import { describe, expect, it } from "vitest";
import { getTocItem } from "../data/toc";
import {
  formatWeakWordsTocLabel,
  shouldShowWeakWordsQuizCta,
} from "./weakWordsDiscoverability";

describe("formatWeakWordsTocLabel", () => {
  it("renders Weak Words when count is 0", () => {
    expect(formatWeakWordsTocLabel(0)).toBe("Weak Words");
  });

  it("renders Weak Words (N) when count is positive", () => {
    expect(formatWeakWordsTocLabel(7)).toBe("Weak Words (7)");
  });

  it("leaves the static toc.ts label unchanged", () => {
    expect(getTocItem("weak-words")?.label).toBe("Weak Words");
  });
});

describe("shouldShowWeakWordsQuizCta", () => {
  it("shows Review/Retest for vocab quizzes when weakCount > 0", () => {
    expect(shouldShowWeakWordsQuizCta("quiz-vocab-1-10", 3)).toBe(true);
    expect(shouldShowWeakWordsQuizCta("quiz-vocab-n1-01", 1)).toBe(true);
    expect(shouldShowWeakWordsQuizCta("quiz-mixed", 2)).toBe(true);
    expect(shouldShowWeakWordsQuizCta("quiz-final", 5)).toBe(true);
  });

  it("shows the same actions for quiz-weak-retest when weakness remains", () => {
    expect(shouldShowWeakWordsQuizCta("quiz-weak-retest", 1)).toBe(true);
  });

  it("hides CTA when weakCount is 0", () => {
    expect(shouldShowWeakWordsQuizCta("quiz-vocab-1-10", 0)).toBe(false);
    expect(shouldShowWeakWordsQuizCta("quiz-weak-retest", 0)).toBe(false);
  });

  it("hides CTA for grammar quizzes even with weak items", () => {
    expect(shouldShowWeakWordsQuizCta("quiz-grammar-1-10", 4)).toBe(false);
  });
});
