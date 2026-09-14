import type { GameModeId } from "./types";
import { levelFromTotalXp } from "./xp";

export const GAME_MODE_STATS_KEY = "jlpt-trainer:game-mode-stats:v1";

export type GameModeStatsFile = {
  version: 1;
  totalXp: number;
  survivalBest: number;
  speedRunBest: number;
  bossVictories: number;
  bestCombo: number;
  gamesPlayed: number;
  /** ISO date (YYYY-MM-DD) of last play day, for optional day streak. */
  lastPlayedDate: string | null;
  dayStreak: number;
};

export type GameModeStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function emptyGameModeStats(): GameModeStatsFile {
  return {
    version: 1,
    totalXp: 0,
    survivalBest: 0,
    speedRunBest: 0,
    bossVictories: 0,
    bestCombo: 0,
    gamesPlayed: 0,
    lastPlayedDate: null,
    dayStreak: 0,
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

function nonNegativeInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

function parseStats(raw: unknown): GameModeStatsFile {
  const empty = emptyGameModeStats();
  if (!raw || typeof raw !== "object") return empty;
  const row = raw as Record<string, unknown>;
  return {
    version: 1,
    totalXp: nonNegativeInt(row.totalXp) ?? 0,
    survivalBest: nonNegativeInt(row.survivalBest) ?? 0,
    speedRunBest: nonNegativeInt(row.speedRunBest) ?? 0,
    bossVictories: nonNegativeInt(row.bossVictories) ?? 0,
    bestCombo: nonNegativeInt(row.bestCombo) ?? 0,
    gamesPlayed: nonNegativeInt(row.gamesPlayed) ?? 0,
    lastPlayedDate:
      typeof row.lastPlayedDate === "string" ? row.lastPlayedDate : null,
    dayStreak: nonNegativeInt(row.dayStreak) ?? 0,
  };
}

export function loadGameModeStats(
  store: GameModeStore | null = browserStore()
): GameModeStatsFile {
  if (!store) return emptyGameModeStats();
  try {
    const raw = store.getItem(GAME_MODE_STATS_KEY);
    if (!raw) return emptyGameModeStats();
    return parseStats(JSON.parse(raw));
  } catch {
    return emptyGameModeStats();
  }
}

export function saveGameModeStats(
  file: GameModeStatsFile,
  store: GameModeStore | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(GAME_MODE_STATS_KEY, JSON.stringify(file));
  } catch {
    // Private mode or quota: stats just won't persist.
  }
}

function todayIso(at = Date.now()): string {
  return new Date(at).toISOString().slice(0, 10);
}

function yesterdayIso(at = Date.now()): string {
  return new Date(at - 86_400_000).toISOString().slice(0, 10);
}

/** Bump day streak when the player finishes a game. */
export function touchPlayDay(
  file: GameModeStatsFile,
  at = Date.now()
): GameModeStatsFile {
  const today = todayIso(at);
  if (file.lastPlayedDate === today) {
    return { ...file, gamesPlayed: file.gamesPlayed + 1 };
  }
  const streak =
    file.lastPlayedDate === yesterdayIso(at) ? file.dayStreak + 1 : 1;
  return {
    ...file,
    lastPlayedDate: today,
    dayStreak: streak,
    gamesPlayed: file.gamesPlayed + 1,
  };
}

export type GameSessionResultPatch = {
  xpGained: number;
  survivalScore?: number;
  speedRunScore?: number;
  bossVictory?: boolean;
  bestCombo?: number;
};

export function applyGameSessionResult(
  patch: GameSessionResultPatch,
  store: GameModeStore | null = browserStore(),
  at = Date.now()
): GameModeStatsFile {
  const prev = loadGameModeStats(store);
  let next = touchPlayDay(prev, at);
  next = {
    ...next,
    totalXp: next.totalXp + Math.max(0, Math.floor(patch.xpGained)),
  };
  if (patch.survivalScore !== undefined) {
    next.survivalBest = Math.max(next.survivalBest, patch.survivalScore);
  }
  if (patch.speedRunScore !== undefined) {
    next.speedRunBest = Math.max(next.speedRunBest, patch.speedRunScore);
  }
  if (patch.bossVictory) {
    next.bossVictories += 1;
  }
  if (patch.bestCombo !== undefined) {
    next.bestCombo = Math.max(next.bestCombo, patch.bestCombo);
  }
  saveGameModeStats(next, store);
  return next;
}

export function getDerivedLevel(
  file: GameModeStatsFile = loadGameModeStats()
): number {
  return levelFromTotalXp(file.totalXp);
}

export function bestOverallScore(
  file: GameModeStatsFile = loadGameModeStats()
): number {
  return Math.max(file.survivalBest, file.speedRunBest);
}

/** Rotate featured challenge by UTC day. */
export function todaysFeaturedChallenge(at = Date.now()): GameModeId {
  const modes: GameModeId[] = [
    "survival",
    "speed-run",
    "weak-revenge",
    "boss-battle",
  ];
  const day = Math.floor(at / 86_400_000);
  return modes[day % modes.length]!;
}

export const FEATURED_LABELS: Record<GameModeId, string> = {
  survival: "❤️ Survival Mode",
  "speed-run": "⚡ Speed Run",
  "weak-revenge": "🧠 Weak Word Revenge",
  "boss-battle": "👹 Boss Battle",
};
