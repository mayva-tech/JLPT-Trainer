import { describe, expect, it } from "vitest";
import {
  comboBonusXp,
  GAME_XP,
  getLevelProgress,
  totalXpToReachLevel,
  xpFromEvents,
  xpRequiredForLevel,
} from "./xp";

describe("xpRequiredForLevel", () => {
  it("starts level 1 at a 100 XP step", () => {
    expect(xpRequiredForLevel(1)).toBe(100);
    expect(totalXpToReachLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(140);
  });
});

describe("getLevelProgress", () => {
  it("is level 1 at 0 XP", () => {
    const progress = getLevelProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.xpForNextLevel).toBe(100);
    expect(progress.ratio).toBe(0);
  });

  it("levels up after filling the current requirement", () => {
    expect(getLevelProgress(100).level).toBe(2);
    expect(getLevelProgress(99).level).toBe(1);
  });

  it("treats malformed XP as 0", () => {
    expect(getLevelProgress(Number.NaN).level).toBe(1);
    expect(getLevelProgress(-20).totalXp).toBe(0);
  });
});

describe("xpFromEvents", () => {
  it("uses the shared XP table", () => {
    expect(
      xpFromEvents([
        { type: "correct" },
        { type: "combo", combo: 5 },
        { type: "combo", combo: 10 },
        { type: "weak-defeated" },
        { type: "speed-complete" },
        { type: "boss-defeated" },
      ])
    ).toBe(
      GAME_XP.correctAnswer +
        GAME_XP.combo5Bonus +
        GAME_XP.combo10Bonus +
        GAME_XP.weakWordDefeated +
        GAME_XP.speedRunCompleted +
        GAME_XP.bossDefeated
    );
  });

  it("only awards combo bonuses at 5/10 multiples", () => {
    expect(comboBonusXp(4)).toBe(0);
    expect(comboBonusXp(5)).toBe(GAME_XP.combo5Bonus);
    expect(comboBonusXp(10)).toBe(GAME_XP.combo10Bonus);
    expect(comboBonusXp(15)).toBe(GAME_XP.combo5Bonus);
  });
});
