/**
 * Game Mode persistence. Isolated from vocabulary mastery (vocab-quiz-stats)
 * except for intentional Weak Words updates performed by the play modes.
 */

import type { GameModeId } from "./types";
import { getLevelProgress } from "./xp";

export const GAME_MODE_STATS_KEY = "jlpt-trainer:game-mode:v1";

export type GameModeStats = {
  version: 1;
  totalXp: number;
  survivalBestScore: number;
  speedRunBestScore: number;
  bossVictories: number;
  bossBestScore: number;
  revengeBestDefeated: number;
  bestCombo: number;
  bestOverallScore: number;
  streak: number;
  bestStreak: number;
  lastPlayedDay: string | null;
  gamesPlayed: number;
};

export type GameModeStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function emptyGameModeStats(): GameModeStats {
  return {
    version: 1,
    totalXp: 0,
    survivalBestScore: 0,
    speedRunBestScore: 0,
    bossVictories: 0,
    bossBestScore: 0,
    revengeBestDefeated: 0,
    bestCombo: 0,
    bestOverallScore: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayedDay: null,
    gamesPlayed: 0,
  };
}

function browserStore(): GameModeStore | null {
  try {
    const store = globalThis.localStorage;
    if (
      !store ||
      typeof store.getItem !== "function" ||
      typeof store.setItem !== "function"
    ) {
      return null;
    }
    return store;
  } catch {
    return null;
  }
}

function nonNegativeInt(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function parseDay(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

export function localDayKey(at: number = Date.now()): string {
  const date = new Date(at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousLocalDayKey(at: number): string {
  const date = new Date(at);
  date.setDate(date.getDate() - 1);
  return localDayKey(date.getTime());
}

export function parseGameModeStats(raw: unknown): GameModeStats {
  const empty = emptyGameModeStats();
  if (!raw || typeof raw !== "object") return empty;
  const row = raw as Record<string, unknown>;
  return {
    version: 1,
    totalXp: nonNegativeInt(row.totalXp),
    survivalBestScore: nonNegativeInt(row.survivalBestScore),
    speedRunBestScore: nonNegativeInt(row.speedRunBestScore),
    bossVictories: nonNegativeInt(row.bossVictories),
    bossBestScore: nonNegativeInt(row.bossBestScore),
    revengeBestDefeated: nonNegativeInt(row.revengeBestDefeated),
    bestCombo: nonNegativeInt(row.bestCombo),
    bestOverallScore: nonNegativeInt(row.bestOverallScore),
    streak: nonNegativeInt(row.streak),
    bestStreak: nonNegativeInt(row.bestStreak),
    lastPlayedDay: parseDay(row.lastPlayedDay),
    gamesPlayed: nonNegativeInt(row.gamesPlayed),
  };
}

export function loadGameModeStats(
  store: GameModeStore | null = browserStore()
): GameModeStats {
  if (!store) return emptyGameModeStats();
  try {
    const raw = store.getItem(GAME_MODE_STATS_KEY);
    if (!raw) return emptyGameModeStats();
    return parseGameModeStats(JSON.parse(raw));
  } catch {
    return emptyGameModeStats();
  }
}

export function saveGameModeStats(
  stats: GameModeStats,
  store: GameModeStore | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(GAME_MODE_STATS_KEY, JSON.stringify({ ...stats, version: 1 }));
  } catch {
    // Private mode or a full quota: stats just won't persist.
  }
}

export function comparableOverallScore(mode: GameModeId, score: number): number {
  const safe = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
  if (mode === "speed") return safe * 20;
  if (mode === "boss") return safe * 8;
  if (mode === "revenge") return safe * 80;
  return safe;
}

export function applyPlayDay(
  stats: GameModeStats,
  at: number = Date.now()
): GameModeStats {
  const today = localDayKey(at);
  if (stats.lastPlayedDay === today) {
    return stats;
  }
  const yesterday = previousLocalDayKey(at);
  const streak = stats.lastPlayedDay === yesterday ? stats.streak + 1 : 1;
  return {
    ...stats,
    lastPlayedDay: today,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
  };
}

export type GameResultPatch = {
  mode: GameModeId;
  score: number;
  bestCombo: number;
  xpGained: number;
  bossVictory?: boolean;
  revengeDefeated?: number;
  at?: number;
};

export function applyGameResult(
  stats: GameModeStats,
  patch: GameResultPatch
): { stats: GameModeStats; personalBest: boolean; leveledUp: boolean; newLevel: number } {
  const previousLevel = getLevelProgress(stats.totalXp).level;
  let next = applyPlayDay(stats, patch.at ?? Date.now());
  next = {
    ...next,
    totalXp: next.totalXp + Math.max(0, Math.floor(patch.xpGained)),
    bestCombo: Math.max(next.bestCombo, Math.max(0, Math.floor(patch.bestCombo))),
    gamesPlayed: next.gamesPlayed + 1,
  };

  const score = Math.max(0, Math.floor(patch.score));
  let personalBest = false;

  if (patch.mode === "survival") {
    personalBest = score > next.survivalBestScore;
    next = {
      ...next,
      survivalBestScore: Math.max(next.survivalBestScore, score),
    };
  } else if (patch.mode === "speed") {
    personalBest = score > next.speedRunBestScore;
    next = {
      ...next,
      speedRunBestScore: Math.max(next.speedRunBestScore, score),
    };
  } else if (patch.mode === "boss") {
    personalBest = score > next.bossBestScore;
    next = {
      ...next,
      bossBestScore: Math.max(next.bossBestScore, score),
      bossVictories: next.bossVictories + (patch.bossVictory ? 1 : 0),
    };
  } else if (patch.mode === "revenge") {
    const defeated = Math.max(0, Math.floor(patch.revengeDefeated ?? 0));
    personalBest = defeated > next.revengeBestDefeated;
    next = {
      ...next,
      revengeBestDefeated: Math.max(next.revengeBestDefeated, defeated),
    };
  }

  const overall = comparableOverallScore(patch.mode, score);
  next = {
    ...next,
    bestOverallScore: Math.max(next.bestOverallScore, overall),
  };

  const newLevel = getLevelProgress(next.totalXp).level;
  return {
    stats: next,
    personalBest,
    leveledUp: newLevel > previousLevel,
    newLevel,
  };
}

export function recordGameResult(
  patch: GameResultPatch,
  store: GameModeStore | null = browserStore()
): {
  stats: GameModeStats;
  personalBest: boolean;
  leveledUp: boolean;
  newLevel: number;
} {
  const applied = applyGameResult(loadGameModeStats(store), patch);
  saveGameModeStats(applied.stats, store);
  return applied;
}
