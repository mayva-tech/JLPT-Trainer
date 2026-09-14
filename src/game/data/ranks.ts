import type { AdventureRankId } from "../types";

export type AdventureRank = {
  id: AdventureRankId;
  japaneseName: string;
  englishName: string;
  /** Minimum completed story quests. */
  minQuests: number;
  /** Minimum player level (from XP). */
  minLevel: number;
  /** Minimum Japanese Power (0–100). */
  minJapanesePower: number;
};

export const ADVENTURE_RANKS: readonly AdventureRank[] = [
  {
    id: "kotoba-beginner",
    japaneseName: "ことば初心者",
    englishName: "Kotoba Beginner",
    minQuests: 0,
    minLevel: 1,
    minJapanesePower: 0,
  },
  {
    id: "nihongo-adventurer",
    japaneseName: "日本語冒険者",
    englishName: "Japanese Adventurer",
    minQuests: 1,
    minLevel: 3,
    minJapanesePower: 25,
  },
  {
    id: "kaiwa-fighter",
    japaneseName: "会話ファイター",
    englishName: "Conversation Fighter",
    minQuests: 4,
    minLevel: 8,
    minJapanesePower: 45,
  },
  {
    id: "communication-master",
    japaneseName: "コミュニケーション達人",
    englishName: "Communication Expert",
    minQuests: 10,
    minLevel: 15,
    minJapanesePower: 65,
  },
  {
    id: "pera-pera-master",
    japaneseName: "ペラペラマスター",
    englishName: "Pera Pera Master",
    minQuests: 20,
    minLevel: 30,
    minJapanesePower: 85,
  },
] as const;

export function getRankById(id: AdventureRankId): AdventureRank {
  return (
    ADVENTURE_RANKS.find((rank) => rank.id === id) ?? ADVENTURE_RANKS[0]!
  );
}

/**
 * Highest rank whose thresholds are all met. Final rank stays hard by design.
 */
export function resolveAdventureRank(options: {
  completedQuests: number;
  level: number;
  japanesePower: number;
}): AdventureRank {
  let current = ADVENTURE_RANKS[0]!;
  for (const rank of ADVENTURE_RANKS) {
    if (
      options.completedQuests >= rank.minQuests &&
      options.level >= rank.minLevel &&
      options.japanesePower >= rank.minJapanesePower
    ) {
      current = rank;
    }
  }
  return current;
}

export function nextAdventureRank(
  current: AdventureRank
): AdventureRank | null {
  const index = ADVENTURE_RANKS.findIndex((rank) => rank.id === current.id);
  if (index < 0 || index >= ADVENTURE_RANKS.length - 1) return null;
  return ADVENTURE_RANKS[index + 1] ?? null;
}
