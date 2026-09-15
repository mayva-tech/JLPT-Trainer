import { describe, expect, it } from "vitest";
import { QUESTS } from "../data/quests";
import { evaluateChoiceAnswer } from "./questEngine";
import type { QuestStep } from "../types";

function chapter2McqSteps(): { questId: string; step: QuestStep }[] {
  const out: { questId: string; step: QuestStep }[] = [];
  for (const quest of QUESTS.filter((q) => q.chapter === 2)) {
    for (const step of quest.steps) {
      if (!step.choices?.length) continue;
      out.push({ questId: quest.id, step });
    }
  }
  return out;
}

describe("Chapter 2 multiple-choice answer positions", () => {
  const rows = chapter2McqSteps();

  it("collects every Chapter 2 step that has choices", () => {
    expect(rows.length).toBeGreaterThanOrEqual(20);
  });

  it("gives every multiple-choice question exactly 3 choices", () => {
    for (const { questId, step } of rows) {
      expect(step.choices, `${questId}/${step.id}`).toHaveLength(3);
    }
  });

  it("gives every multiple-choice question exactly one correct answer", () => {
    for (const { questId, step } of rows) {
      const correctCount = step.choices!.filter((c) => c.correct).length;
      expect(correctCount, `${questId}/${step.id}`).toBe(1);
    }
  });

  it("does not assume the correct answer is always index 0", () => {
    const indexes = rows.map(
      ({ step }) => step.choices!.findIndex((c) => c.correct)
    );
    expect(indexes.some((i) => i !== 0)).toBe(true);
    // No single position should dominate the chapter heavily.
    const counts = [0, 0, 0];
    for (const i of indexes) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(2);
      counts[i]! += 1;
    }
    const total = indexes.length;
    for (const count of counts) {
      expect(count / total).toBeLessThan(0.55);
      expect(count).toBeGreaterThan(0);
    }
  });

  it("places correct answers in all three positions across Chapter 2", () => {
    const correctIndexes = rows.map(({ step }) =>
      step.choices!.findIndex((choice) => choice.correct)
    );
    expect(correctIndexes).toContain(0);
    expect(correctIndexes).toContain(1);
    expect(correctIndexes).toContain(2);
  });

  it("avoids a rigid repeating 0,1,2 cycle across the chapter sequence", () => {
    const indexes = rows.map(
      ({ step }) => step.choices!.findIndex((c) => c.correct)
    );
    let rigidCycles = 0;
    for (let i = 0; i + 2 < indexes.length; i += 3) {
      if (
        indexes[i] === 0 &&
        indexes[i + 1] === 1 &&
        indexes[i + 2] === 2
      ) {
        rigidCycles += 1;
      }
    }
    expect(rigidCycles).toBeLessThan(3);
  });

  it("validates answers by choice.correct regardless of array position", () => {
    for (const { questId, step } of rows) {
      const correct = step.choices!.find((c) => c.correct)!;
      const wrong = step.choices!.find((c) => !c.correct)!;
      const correctIndex = step.choices!.findIndex((c) => c.correct);
      expect(correctIndex, `${questId}/${step.id}`).not.toBe(-1);

      const ok = evaluateChoiceAnswer(step, correct.id);
      expect(ok.correct, `${questId}/${step.id} correct id`).toBe(true);
      expect(ok.correctLabel).toBe(correct.labelJa);

      const miss = evaluateChoiceAnswer(step, wrong.id);
      expect(miss.correct, `${questId}/${step.id} wrong id`).toBe(false);
      expect(miss.correctLabel).toBe(correct.labelJa);
      expect(miss.mistake?.correctLabel).toBe(correct.labelJa);
    }
  });
});
