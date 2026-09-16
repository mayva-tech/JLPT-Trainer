import { describe, expect, it } from "vitest";
import {
  buildStepAnswerDelta,
  undoStepAnswer,
  type StepAnswerResult,
} from "./questEngine";

const wrongResult: StepAnswerResult = {
  correct: false,
  feedback: "❌ Wrong",
  selectedLabel: "bad",
  correctLabel: "good",
  costsConfidence: true,
  mistake: {
    stepId: "s1",
    promptJa: "？",
    selectedLabel: "bad",
    correctLabel: "good",
    feedback: "❌ Wrong",
    vocabHint: "引っ越す",
  },
};

const correctResult: StepAnswerResult = {
  correct: true,
  feedback: "✅ Correct",
  selectedLabel: "good",
  correctLabel: "good",
  costsConfidence: false,
};

describe("undoStepAnswer", () => {
  it("restores confidence, answered count, mistake, and monster after a miss", () => {
    const delta = buildStepAnswerDelta(wrongResult, {
      confidenceBefore: 3,
      confidenceAfter: 2,
      vocabAdded: null,
      monsterAdded: "引っ越す",
    });

    const undone = undoStepAnswer(
      {
        confidence: 2,
        correctCount: 1,
        answeredCount: 4,
        mistakes: [
          {
            stepId: "earlier",
            promptJa: "a",
            selectedLabel: "x",
            correctLabel: "y",
            feedback: "no",
          },
          wrongResult.mistake!,
        ],
        monsters: ["引っ越す"],
        vocabDiscovered: ["駅"],
      },
      delta
    );

    expect(undone).toEqual({
      confidence: 3,
      correctCount: 1,
      answeredCount: 3,
      mistakes: [
        {
          stepId: "earlier",
          promptJa: "a",
          selectedLabel: "x",
          correctLabel: "y",
          feedback: "no",
        },
      ],
      monsters: [],
      vocabDiscovered: ["駅"],
    });
  });

  it("rolls back correct count and newly discovered vocab after a hit", () => {
    const delta = buildStepAnswerDelta(correctResult, {
      confidenceBefore: 4,
      confidenceAfter: 4,
      vocabAdded: "引っ越す",
      monsterAdded: null,
    });

    const undone = undoStepAnswer(
      {
        confidence: 4,
        correctCount: 2,
        answeredCount: 2,
        mistakes: [],
        monsters: [],
        vocabDiscovered: ["駅", "引っ越す"],
      },
      delta
    );

    expect(undone).toEqual({
      confidence: 4,
      correctCount: 1,
      answeredCount: 1,
      mistakes: [],
      monsters: [],
      vocabDiscovered: ["駅"],
    });
  });

  it("is safe when answered count is already zero", () => {
    const delta = buildStepAnswerDelta(correctResult, {
      confidenceBefore: 5,
      confidenceAfter: 5,
      vocabAdded: null,
      monsterAdded: null,
    });

    const undone = undoStepAnswer(
      {
        confidence: 5,
        correctCount: 0,
        answeredCount: 0,
        mistakes: [],
        monsters: [],
        vocabDiscovered: [],
      },
      delta
    );

    expect(undone.answeredCount).toBe(0);
    expect(undone.correctCount).toBe(0);
  });
});
