import { describe, expect, it } from "vitest";
import { QUESTS } from "../data/quests";
import { evaluateChoiceAnswer } from "./questEngine";
import type { QuestStep } from "../types";

type McqRow = {
  questId: string;
  chapter: number;
  step: QuestStep;
  correctIndex: number;
};

function allMcqRows(): McqRow[] {
  const rows: McqRow[] = [];
  for (const quest of QUESTS) {
    for (const step of quest.steps) {
      if (!step.choices?.length) continue;
      rows.push({
        questId: quest.id,
        chapter: quest.chapter,
        step,
        correctIndex: step.choices.findIndex((c) => c.correct),
      });
    }
  }
  return rows;
}

describe("RPG multiple-choice quality (all chapters)", () => {
  const rows = allMcqRows();

  it("finds multiple-choice steps across the RPG dataset", () => {
    expect(rows.length).toBeGreaterThanOrEqual(50);
  });

  it("gives every multiple-choice step exactly 3 choices", () => {
    for (const { questId, step } of rows) {
      expect(step.choices, `${questId}/${step.id}`).toHaveLength(3);
    }
  });

  it("gives every multiple-choice step exactly one correct answer", () => {
    for (const { questId, step } of rows) {
      expect(
        step.choices!.filter((c) => c.correct).length,
        `${questId}/${step.id}`
      ).toBe(1);
    }
  });

  it("does not assume the correct answer is always index 0", () => {
    expect(rows.some((r) => r.correctIndex !== 0)).toBe(true);
  });

  it("uses all three correct-answer positions across the RPG dataset", () => {
    const indexes = rows.map((r) => r.correctIndex);
    expect(indexes).toContain(0);
    expect(indexes).toContain(1);
    expect(indexes).toContain(2);
    const counts = [0, 0, 0];
    for (const i of indexes) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(2);
      counts[i]! += 1;
    }
    const total = indexes.length;
    for (const count of counts) {
      expect(count / total).toBeLessThan(0.5);
      expect(count).toBeGreaterThan(0);
    }
  });

  it("avoids a rigid repeating 0,1,2 cycle across the full dataset", () => {
    const indexes = rows.map((r) => r.correctIndex);
    let rigid = 0;
    for (let i = 0; i + 2 < indexes.length; i += 3) {
      if (
        indexes[i] === 0 &&
        indexes[i + 1] === 1 &&
        indexes[i + 2] === 2
      ) {
        rigid += 1;
      }
    }
    expect(rigid).toBeLessThan(2);
  });

  it("validates answers by choice.correct regardless of array position", () => {
    for (const { questId, step } of rows) {
      const correct = step.choices!.find((c) => c.correct)!;
      const wrong = step.choices!.find((c) => !c.correct)!;
      const ok = evaluateChoiceAnswer(step, correct.id);
      expect(ok.correct, `${questId}/${step.id}`).toBe(true);
      expect(ok.correctLabel).toBe(correct.labelJa);
      const miss = evaluateChoiceAnswer(step, wrong.id);
      expect(miss.correct, `${questId}/${step.id}`).toBe(false);
      expect(miss.correctLabel).toBe(correct.labelJa);
    }
  });

  it("keeps every choice label non-empty", () => {
    for (const { questId, step } of rows) {
      for (const choice of step.choices!) {
        expect(choice.labelJa.trim().length, `${questId}/${step.id}`).toBeGreaterThan(
          0
        );
      }
    }
  });
});
