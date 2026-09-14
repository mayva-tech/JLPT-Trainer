import type { BossConfig } from "./types";

/** Initial boss roster — only Vocabulary Demon is playable. */
export const BOSSES: readonly BossConfig[] = [
  {
    id: "vocab-demon",
    nameJa: "語彙の鬼",
    nameEn: "Vocabulary Demon",
    emoji: "👹",
    bossMaxHp: 100,
    playerMaxHp: 5,
    damagePerHit: 10,
  },
] as const;

export function getBossById(id: string): BossConfig | undefined {
  return BOSSES.find((boss) => boss.id === id);
}

export function getDefaultBoss(): BossConfig {
  return BOSSES[0]!;
}
