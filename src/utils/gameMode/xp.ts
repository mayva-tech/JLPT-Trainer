/**
 * Game Mode XP and level math. XP is a play-session reward only — it is not
 * vocabulary mastery and must not be mixed with Weak Words / quiz stats.
 */

export const GAME_XP = {
  correctAnswer: 10,
  combo5Bonus: 15,
  combo10Bonus: 30,
  weakWordDefeated: 25,
  speedRunCompleted: 50,
  bossDefeated: 100,
} as const;

/** Soft cap so a huge stored XP value cannot freeze the level loop. */
export const GAME_LEVEL_CAP = 99;

export type GameXpEvent =
  | { type: "correct" }
  | { type: "combo"; combo: number }
  | { type: "weak-defeated" }
  | { type: "speed-complete" }
  | { type: "boss-defeated" };

export type GameLevelProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  /** 0–1 progress toward the next level. */
  ratio: number;
};

/** XP required to finish `level` and reach `level + 1`. Level 1 starts at 0 XP. */
export function xpRequiredForLevel(level: number): number {
  const safe = Math.max(1, Math.floor(level));
  return 100 + (safe - 1) * 40;
}

export function totalXpToReachLevel(level: number): number {
  const target = Math.max(1, Math.floor(level));
  let total = 0;
  for (let current = 1; current < target; current++) {
    total += xpRequiredForLevel(current);
  }
  return total;
}

export function getLevelProgress(totalXp: number): GameLevelProgress {
  const safeXp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;
  let level = 1;
  let remaining = safeXp;
  while (level < GAME_LEVEL_CAP) {
    const need = xpRequiredForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  const xpForNextLevel = xpRequiredForLevel(level);
  return {
    level,
    totalXp: safeXp,
    xpIntoLevel: remaining,
    xpForNextLevel,
    ratio: xpForNextLevel === 0 ? 1 : remaining / xpForNextLevel,
  };
}

/**
 * Combo bonuses: +15 at 5, 15, 25… and +30 at 10, 20, 30…
 * Other combo lengths grant nothing extra.
 */
export function comboBonusXp(combo: number): number {
  if (!Number.isFinite(combo) || combo <= 0) return 0;
  if (combo % 10 === 0) return GAME_XP.combo10Bonus;
  if (combo % 5 === 0) return GAME_XP.combo5Bonus;
  return 0;
}

export function xpFromEvents(events: readonly GameXpEvent[]): number {
  let total = 0;
  for (const event of events) {
    switch (event.type) {
      case "correct":
        total += GAME_XP.correctAnswer;
        break;
      case "combo":
        total += comboBonusXp(event.combo);
        break;
      case "weak-defeated":
        total += GAME_XP.weakWordDefeated;
        break;
      case "speed-complete":
        total += GAME_XP.speedRunCompleted;
        break;
      case "boss-defeated":
        total += GAME_XP.bossDefeated;
        break;
    }
  }
  return total;
}
