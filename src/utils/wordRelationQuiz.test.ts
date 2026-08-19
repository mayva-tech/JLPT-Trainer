import { describe, expect, it } from "vitest";
import { wordRelations } from "../data/wordRelations";
import {
  buildRelationQuiz,
  scoreRelationQuiz,
} from "./wordRelationQuiz";
import { filterWordRelations } from "./wordRelations";

describe("wordRelationQuiz", () => {
  it("builds a deterministic quiz from an injectable RNG", () => {
    let seed = 1;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const pool = filterWordRelations(wordRelations, { level: "N5" });
    const questions = buildRelationQuiz({ pool, count: 5, random });
    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((question) => question.id)).size).toBe(5);

    const again = buildRelationQuiz({ pool, count: 5, random: () => 0.42 });
    expect(again).toHaveLength(5);
  });

  it("scores answers and collects missed questions", () => {
    const pool = wordRelations.slice(0, 12);
    const questions = buildRelationQuiz({ pool, count: 3, random: () => 0.25 });
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      selectedOptionId:
        index === 0
          ? question.correctOptionId
          : question.options.find((option) => option.id !== question.correctOptionId)!
              .id,
      correct: index === 0,
    }));

    const result = scoreRelationQuiz(questions, answers);
    expect(result.total).toBe(3);
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(2);
    expect(result.percentage).toBe(33);
    expect(result.missed).toHaveLength(2);
    expect(result.missed[0]?.explanation.length).toBeGreaterThan(0);
  });
});
