import { describe, expect, it } from "vitest";
import { EVERYDAY_WORDS, hasPicture, plainReading, wordById, wordsInCategory } from "./everydayData";
import {
  OPTION_COUNT,
  buildQuestion,
  buildQuiz,
  buildReviewQuiz,
  overlaps,
  seededRandom,
  type QuizQuestion,
} from "./everydayQuiz";

function checkQuestion(q: QuizQuestion) {
  expect(q.options).toHaveLength(OPTION_COUNT);
  expect(q.options[q.answerIndex]).toBe(q.target);
  expect(new Set(q.options.map((o) => o.id)).size).toBe(OPTION_COUNT);
  // No option may also be a right answer.
  for (let a = 0; a < q.options.length; a++) {
    for (let b = a + 1; b < q.options.length; b++) {
      expect(overlaps(q.options[a]!, q.options[b]!), `${q.options[a]!.id} vs ${q.options[b]!.id}`).toBe(false);
    }
  }
  if (q.kind === "listen") for (const o of q.options) expect(hasPicture(o), o.id).toBe(true);
}

describe("Everyday Japanese quizzes", () => {
  it("builds a fair four-option picture and listening question for every pictured word", () => {
    const rand = seededRandom("all-pictured");
    for (const w of EVERYDAY_WORDS.filter(hasPicture)) {
      checkQuestion(buildQuestion("picture", w, rand)!);
      checkQuestion(buildQuestion("listen", w, rand)!);
    }
  });

  it("builds a meaning question for every word, pictured or not", () => {
    const rand = seededRandom("all-meaning");
    for (const w of EVERYDAY_WORDS) checkQuestion(buildQuestion("meaning", w, rand)!);
  });

  it("refuses picture questions for words without a picture", () => {
    const noPic = EVERYDAY_WORDS.find((w) => !hasPicture(w))!;
    expect(buildQuestion("picture", noPic, seededRandom("x"))).toBeNull();
    expect(buildQuestion("listen", noPic, seededRandom("x"))).toBeNull();
  });

  it("prefers distractors from the same location", () => {
    const q = buildQuestion("picture", wordById("ticket-gate")!, seededRandom("gate"))!;
    const station = new Set(wordsInCategory("station").map((w) => w.id));
    expect(q.options.filter((o) => station.has(o.id)).length).toBe(OPTION_COUNT);
  });

  it("never pairs words that are both right or sound the same", () => {
    expect(overlaps(wordById("clock")!, wordById("alarm-clock")!)).toBe(true);
    expect(overlaps(wordById("swing")!, wordById("playground-equipment")!)).toBe(true);
    expect(overlaps(wordById("swing")!, wordById("slide")!)).toBe(false);
    const drain = wordById("bath-drain")!;
    const channel = wordById("drainage-channel")!;
    expect(plainReading(drain)).toBe(plainReading(channel));
    expect(overlaps(drain, channel)).toBe(true);
  });

  it("is deterministic per seed and has no repeated targets", () => {
    const words = wordsInCategory("street");
    const a = buildQuiz("picture", words, 10, "street:1");
    const b = buildQuiz("picture", words, 10, "street:1");
    expect(a.map((q) => q.target.id)).toEqual(b.map((q) => q.target.id));
    expect(new Set(a.map((q) => q.target.id)).size).toBe(a.length);
    expect(a.length).toBe(10);
    for (const q of a) checkQuestion(q);
  });

  it("caps a round at the pictured words a location has", () => {
    const restaurant = wordsInCategory("restaurant");
    const pictured = restaurant.filter(hasPicture).length;
    expect(buildQuiz("listen", restaurant, 10, "r").length).toBe(Math.min(10, pictured));
  });

  it("mixes question types in Quick Review by what each word has", () => {
    const ids = ["hand-strap", "ticket-gate", "priority-seat", "guardrail", "curb"];
    const quiz = buildReviewQuiz(ids, 10, "review");
    expect(quiz.map((q) => q.target.id).sort()).toEqual([...ids].sort());
    for (const q of quiz) {
      checkQuestion(q);
      expect(q.kind === "meaning").toBe(!hasPicture(q.target));
    }
  });
});
