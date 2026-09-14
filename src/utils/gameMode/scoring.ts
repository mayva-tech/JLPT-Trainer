export const GAME_SCORE = {
  survivalCorrect: 100,
  speedCorrect: 1,
  bossCorrect: 10,
} as const;

export function accuracyPercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
