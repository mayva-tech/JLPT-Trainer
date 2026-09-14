import { describe, expect, it } from "vitest";
import {
  applyGameResult,
  applyPlayDay,
  emptyGameModeStats,
  GAME_MODE_STATS_KEY,
  loadGameModeStats,
  parseGameModeStats,
  recordGameResult,
  localDayKey,
  type GameModeStore,
} from "./stats";

function memoryStore(
  initial: Record<string, string> = {}
): GameModeStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

describe("parseGameModeStats", () => {
  it("returns empty stats for missing or corrupt payloads", () => {
    expect(parseGameModeStats(null)).toEqual(emptyGameModeStats());
    expect(parseGameModeStats("{nope")).toEqual(emptyGameModeStats());
    expect(loadGameModeStats(memoryStore({ [GAME_MODE_STATS_KEY]: "{nope" }))).toEqual(
      emptyGameModeStats()
    );
  });

  it("ignores negative and non-numeric fields", () => {
    const parsed = parseGameModeStats({
      totalXp: -9,
      survivalBestScore: "500",
      streak: 3.8,
      lastPlayedDay: "yesterday",
    });
    expect(parsed.totalXp).toBe(0);
    expect(parsed.survivalBestScore).toBe(0);
    expect(parsed.streak).toBe(3);
    expect(parsed.lastPlayedDay).toBeNull();
  });
});

describe("applyPlayDay", () => {
  it("starts a streak on the first play and continues the next local day", () => {
    const first = applyPlayDay(emptyGameModeStats(), new Date(2026, 8, 13, 8, 0, 0).getTime());
    expect(first.streak).toBe(1);
    const second = applyPlayDay(first, new Date(2026, 8, 14, 1, 0, 0).getTime());
    expect(second.streak).toBe(2);
    const gap = applyPlayDay(second, new Date(2026, 8, 16, 1, 0, 0).getTime());
    expect(gap.streak).toBe(1);
  });

  it("does not double-count the same local day", () => {
    const once = applyPlayDay(emptyGameModeStats(), new Date(2026, 8, 13, 8, 0, 0).getTime());
    const twice = applyPlayDay(once, new Date(2026, 8, 13, 22, 0, 0).getTime());
    expect(twice.streak).toBe(1);
    expect(twice.lastPlayedDay).toBe(localDayKey(new Date(2026, 8, 13, 22, 0, 0).getTime()));
  });
});

describe("applyGameResult", () => {
  it("tracks personal bests, XP, and level-ups without touching mastery", () => {
    const first = applyGameResult(emptyGameModeStats(), {
      mode: "survival",
      score: 400,
      bestCombo: 4,
      xpGained: 100,
      at: Date.parse("2026-09-13T08:00:00Z"),
    });
    expect(first.personalBest).toBe(true);
    expect(first.leveledUp).toBe(true);
    expect(first.newLevel).toBe(2);
    expect(first.stats.survivalBestScore).toBe(400);

    const second = applyGameResult(first.stats, {
      mode: "survival",
      score: 200,
      bestCombo: 2,
      xpGained: 20,
      at: Date.parse("2026-09-13T09:00:00Z"),
    });
    expect(second.personalBest).toBe(false);
    expect(second.stats.survivalBestScore).toBe(400);
    expect(second.stats.gamesPlayed).toBe(2);
  });
});

describe("recordGameResult", () => {
  it("persists through the injectable store", () => {
    const store = memoryStore();
    recordGameResult(
      {
        mode: "speed",
        score: 18,
        bestCombo: 6,
        xpGained: 50,
        at: Date.parse("2026-09-13T08:00:00Z"),
      },
      store
    );
    const loaded = loadGameModeStats(store);
    expect(loaded.speedRunBestScore).toBe(18);
    expect(loaded.bestCombo).toBe(6);
    expect(loaded.totalXp).toBe(50);
  });
});
