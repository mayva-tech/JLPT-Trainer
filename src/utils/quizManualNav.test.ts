import { describe, expect, it } from "vitest";
import {
  quizNextReviewIndex,
  quizPrevReviewIndex,
  quizQuestionAt,
} from "./quizManualNav";

describe("quizManualNav", () => {
  it("advances through multiple questions via repeated next", () => {
    let index = 0;
    const total = 10;
    const seen: number[] = [];
    for (let i = 0; i < 9; i += 1) {
      const next = quizNextReviewIndex(index, total);
      expect(next).not.toBe("finished");
      index = next as number;
      seen.push(index);
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(quizNextReviewIndex(index, total)).toBe("finished");
  });

  it("returns to the correct previous question", () => {
    expect(quizPrevReviewIndex(0)).toBeNull();
    expect(quizPrevReviewIndex(1)).toBe(0);
    expect(quizPrevReviewIndex(5)).toBe(4);
  });

  it("resolves JP/EN/example targets from a live index after navigation", () => {
    const deck = [
      { id: 4001, word: "品切れ", meaning: "out of stock" },
      { id: 4002, word: "返品", meaning: "return" },
      { id: 4003, word: "レシート", meaning: "receipt" },
    ];
    const quizIndexRef = { current: 0 };

    quizIndexRef.current = quizNextReviewIndex(quizIndexRef.current, deck.length) as number;
    quizIndexRef.current = quizNextReviewIndex(quizIndexRef.current, deck.length) as number;

    const current = quizQuestionAt(deck, quizIndexRef.current);
    expect(current).toEqual(deck[2]);
    expect(current?.word).toBe("レシート");
    expect(current?.meaning).toBe("receipt");

    quizIndexRef.current = quizPrevReviewIndex(quizIndexRef.current)!;
    expect(quizQuestionAt(deck, quizIndexRef.current)?.id).toBe(4002);
  });
});
