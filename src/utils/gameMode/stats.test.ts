import { describe, expect, it } from "vitest";
import {
  applyGameSessionResult,
  bestOverallScore,
  emptyGameModeStats,
  GAME_MODE_STATS_KEY,
  loadGameModeStats,
  todaysFeaturedChallenge,
  type GameModeStore,
} from "./stats";

function memoryStore(
  initial: Record<string, string> = {}
): GameModeStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

describe("loadGameModeStats", () => {
  it("returns empty stats when missing or corrupt", () => {
    expect(loadGameModeStats(null)).toEqual(emptyGameModeStats());
    expect(loadGameModeStats(memoryStore())).toEqual(emptyGameModeStats());
    const store = memoryStore({ [GAME_MODE_STATS_KEY]: "{bad" });
    expect(loadGameModeStats(store)).toEqual(emptyGameModeStats());
  });

  it("ignores malformed numeric fields", () => {
    const store = memoryStore({
      [GAME_MODE_STATS_KEY]: JSON.stringify({
        version: 1,
        totalXp: -5,
        survivalBest: "nope",
        speedRunBest: 12,
      }),
    });
    const loaded = loadGameModeStats(store);
    expect(loaded.totalXp).toBe(0);
    expect(loaded.survivalBest).toBe(0);
    expect(loaded.speedRunBest).toBe(12);
  });
});

describe("applyGameSessionResult", () => {
  it("persists XP and personal bests", () => {
    const store = memoryStore();
    const next = applyGameSessionResult(
      { xpGained: 50, survivalScore: 80, bestCombo: 6 },
      store,
      Date.parse("2026-09-14T12:00:00Z")
    );
    expect(next.totalXp).toBe(50);
    expect(next.survivalBest).toBe(80);
    expect(next.bestCombo).toBe(6);
    expect(next.dayStreak).toBe(1);
    expect(loadGameModeStats(store).survivalBest).toBe(80);
  });

  it("does not lower an existing best score", () => {
    const store = memoryStore({
      [GAME_MODE_STATS_KEY]: JSON.stringify({
        ...emptyGameModeStats(),
        survivalBest: 100,
      }),
    });
    const next = applyGameSessionResult(
      { xpGained: 10, survivalScore: 40 },
      store
    );
    expect(next.survivalBest).toBe(100);
  });
});

describe("bestOverallScore / featured", () => {
  it("takes the max of survival and speed run", () => {
    expect(
      bestOverallScore({
        ...emptyGameModeStats(),
        survivalBest: 40,
        speedRunBest: 55,
      })
    ).toBe(55);
  });

  it("returns a stable featured mode for a day", () => {
    const a = todaysFeaturedChallenge(Date.parse("2026-09-14T01:00:00Z"));
    const b = todaysFeaturedChallenge(Date.parse("2026-09-14T23:00:00Z"));
    expect(a).toBe(b);
  });
});
