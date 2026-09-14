/** Game Mode XP awards (separate from vocabulary mastery). */
export const XP_REWARDS = {
  correctAnswer: 10,
  combo5: 15,
  combo10: 30,
  weakWordDefeated: 25,
  speedRunCompleted: 50,
  bossDefeated: 100,
} as const;

/** XP required to advance from `level` to `level + 1` (level is 1-based). */
export function xpRequiredForNextLevel(level: number): number {
  const safe = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(1.45, safe - 1));
}

/** Cumulative XP needed to reach a given level (level 1 = 0 XP). */
export function totalXpToReachLevel(level: number): number {
  const target = Math.max(1, Math.floor(level));
  let total = 0;
  for (let l = 1; l < target; l++) {
    total += xpRequiredForNextLevel(l);
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = xp;
  while (remaining >= xpRequiredForNextLevel(level)) {
    remaining -= xpRequiredForNextLevel(level);
    level += 1;
    if (level > 999) break;
  }
  return level;
}

export type LevelProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNext: number;
  progressRatio: number;
};

export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = levelFromTotalXp(xp);
  const floor = totalXpToReachLevel(level);
  const xpIntoLevel = xp - floor;
  const xpForNext = xpRequiredForNextLevel(level);
  return {
    level,
    totalXp: xp,
    xpIntoLevel,
    xpForNext,
    progressRatio: xpForNext <= 0 ? 1 : Math.min(1, xpIntoLevel / xpForNext),
  };
}

/**
 * XP gained for one correct answer, including combo milestones hit
 * exactly at this answer (combo is post-increment value).
 */
export function xpForCorrectAnswer(comboAfter: number): number {
  let xp = XP_REWARDS.correctAnswer;
  if (comboAfter === 5) xp += XP_REWARDS.combo5;
  if (comboAfter === 10) xp += XP_REWARDS.combo10;
  return xp;
}
