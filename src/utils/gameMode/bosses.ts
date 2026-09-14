import type { GameQuestionCategory } from "./types";

export type GameBossId =
  | "vocab-demon"
  | "grammar-fox"
  | "listening-tengu"
  | "n2-dragon"
  | "weak-word-king";

export type GameBossConfig = {
  id: GameBossId;
  emoji: string;
  nameJa: string;
  nameEn: string;
  hp: number;
  playerHearts: number;
  damagePerHit: number;
  /** Question mix for this boss. Later bosses can swap this without new UI. */
  categories: GameQuestionCategory[];
  unlocked: boolean;
};

/**
 * Only 語彙の鬼 is playable now. Additional bosses stay in this table so a
 * later unlock can reuse the same battle loop.
 */
export const GAME_BOSSES: readonly GameBossConfig[] = [
  {
    id: "vocab-demon",
    emoji: "👹",
    nameJa: "語彙の鬼",
    nameEn: "Vocabulary Demon",
    hp: 100,
    playerHearts: 5,
    damagePerHit: 10,
    categories: ["n2", "weak"],
    unlocked: true,
  },
  {
    id: "grammar-fox",
    emoji: "🦊",
    nameJa: "文法狐",
    nameEn: "Grammar Fox",
    hp: 120,
    playerHearts: 5,
    damagePerHit: 10,
    categories: ["prerequisite", "n2"],
    unlocked: false,
  },
  {
    id: "listening-tengu",
    emoji: "👺",
    nameJa: "聴解天狗",
    nameEn: "Listening Tengu",
    hp: 100,
    playerHearts: 5,
    damagePerHit: 10,
    categories: ["listening", "n2"],
    unlocked: false,
  },
  {
    id: "n2-dragon",
    emoji: "🐉",
    nameJa: "N2 Dragon",
    nameEn: "N2 Dragon",
    hp: 150,
    playerHearts: 5,
    damagePerHit: 8,
    categories: ["n2", "expression", "relation"],
    unlocked: false,
  },
  {
    id: "weak-word-king",
    emoji: "👑",
    nameJa: "弱点の王",
    nameEn: "Weak Word King",
    hp: 80,
    playerHearts: 5,
    damagePerHit: 10,
    categories: ["weak", "n2"],
    unlocked: false,
  },
];

export function getUnlockedBosses(): GameBossConfig[] {
  return GAME_BOSSES.filter((boss) => boss.unlocked);
}

export function getBossById(id: GameBossId): GameBossConfig | undefined {
  return GAME_BOSSES.find((boss) => boss.id === id);
}
