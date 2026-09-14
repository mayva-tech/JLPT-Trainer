import { describe, expect, it } from "vitest";
import {
  getLevelProgress,
  levelFromTotalXp,
  totalXpToReachLevel,
  xpForCorrectAnswer,
  xpRequiredForNextLevel,
  XP_REWARDS,
} from "./xp";

describe("xpRequiredForNextLevel", () => {
  it("grows with level", () => {
    expect(xpRequiredForNextLevel(1)).toBe(100);
    expect(xpRequiredForNextLevel(2)).toBeGreaterThan(100);
    expect(xpRequiredForNextLevel(5)).toBeGreaterThan(xpRequiredForNextLevel(4));
  });
});

describe("levelFromTotalXp", () => {
  it("starts at level 1 with 0 XP", () => {
    expect(levelFromTotalXp(0)).toBe(1);
    expect(totalXpToReachLevel(1)).toBe(0);
  });

  it("levels up after enough XP", () => {
    const need = xpRequiredForNextLevel(1);
    expect(levelFromTotalXp(need - 1)).toBe(1);
    expect(levelFromTotalXp(need)).toBe(2);
  });
});

describe("getLevelProgress", () => {
  it("reports progress within the current level", () => {
    const progress = getLevelProgress(40);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(40);
    expect(progress.xpForNext).toBe(100);
    expect(progress.progressRatio).toBeCloseTo(0.4);
  });
});

describe("xpForCorrectAnswer", () => {
  it("awards base XP plus combo milestones", () => {
    expect(xpForCorrectAnswer(1)).toBe(XP_REWARDS.correctAnswer);
    expect(xpForCorrectAnswer(5)).toBe(
      XP_REWARDS.correctAnswer + XP_REWARDS.combo5
    );
    expect(xpForCorrectAnswer(10)).toBe(
      XP_REWARDS.correctAnswer + XP_REWARDS.combo10
    );
  });
});
