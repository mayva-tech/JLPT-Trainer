import { CURRENCY, DAILY_QUEST_RESET_HOUR_UTC } from "../data/rpgConfig";
import type { DailyQuestProgress, PlayerRpgProfile } from "../types";

export type DailyQuestDef = {
  id: string;
  label: string;
  japaneseLabel: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
};

export const DAILY_QUEST_POOL: readonly DailyQuestDef[] = [
  {
    id: "clear-encounters",
    label: "Clear 3 encounters",
    japaneseLabel: "会話を3回クリア",
    target: 3,
    rewardCoins: CURRENCY.perDailyComplete,
    rewardXp: 20,
  },
  {
    id: "no-english",
    label: "Complete 1 encounter without English",
    japaneseLabel: "英語なしで1回クリア",
    target: 1,
    rewardCoins: CURRENCY.perDailyComplete + 5,
    rewardXp: 25,
  },
  {
    id: "review-weak",
    label: "Visit Weak Word Dungeon once",
    japaneseLabel: "弱点ダンジョンに1回入る",
    target: 1,
    rewardCoins: CURRENCY.perDailyComplete,
    rewardXp: 15,
  },
  {
    id: "repair-once",
    label: "Successfully repair a conversation",
    japaneseLabel: "会話修復を1回成功",
    target: 1,
    rewardCoins: CURRENCY.perDailyComplete,
    rewardXp: 20,
  },
  {
    id: "first-listen",
    label: "Clear a listening step on first try",
    japaneseLabel: "リスニングを一発クリア",
    target: 1,
    rewardCoins: CURRENCY.perDailyComplete + 5,
    rewardXp: 25,
  },
] as const;

export function localDayKey(at = Date.now()): string {
  const d = new Date(at);
  // Shift by configured UTC hour for a stable “quest day”.
  const shifted = new Date(d.getTime() - DAILY_QUEST_RESET_HOUR_UTC * 3600_000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deterministic pick of 3 dailies from the pool for a day key. */
export function pickDailyQuestIds(dayKey: string): string[] {
  let seed = 0;
  for (let i = 0; i < dayKey.length; i++) seed = (seed * 31 + dayKey.charCodeAt(i)) >>> 0;
  const pool = [...DAILY_QUEST_POOL];
  const picked: string[] = [];
  while (picked.length < 3 && pool.length > 0) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    const [item] = pool.splice(idx, 1);
    if (item) picked.push(item.id);
  }
  return picked;
}

export function ensureDailyQuests(
  profile: PlayerRpgProfile,
  at = Date.now()
): PlayerRpgProfile {
  const dayKey = localDayKey(at);
  if (profile.daily?.dayKey === dayKey) return profile;
  const questIds = pickDailyQuestIds(dayKey);
  const daily: DailyQuestProgress = {
    dayKey,
    questIds,
    completedIds: [],
    progress: Object.fromEntries(questIds.map((id) => [id, 0])),
  };
  return { ...profile, daily };
}

export function getDailyQuestDef(id: string): DailyQuestDef | undefined {
  return DAILY_QUEST_POOL.find((q) => q.id === id);
}

export function bumpDailyProgress(
  profile: PlayerRpgProfile,
  questId: string,
  amount = 1
): PlayerRpgProfile {
  const withDay = ensureDailyQuests(profile);
  const daily = withDay.daily;
  if (!daily || !daily.questIds.includes(questId)) return withDay;
  if (daily.completedIds.includes(questId)) return withDay;
  const def = getDailyQuestDef(questId);
  if (!def) return withDay;
  const nextProgress = Math.min(
    def.target,
    (daily.progress[questId] ?? 0) + amount
  );
  const progress = { ...daily.progress, [questId]: nextProgress };
  let completedIds = daily.completedIds;
  let coins = withDay.coins;
  let xp = withDay.xp;
  if (nextProgress >= def.target && !completedIds.includes(questId)) {
    completedIds = [...completedIds, questId];
    coins += def.rewardCoins;
    xp += def.rewardXp;
  }
  return {
    ...withDay,
    coins,
    xp,
    daily: { ...daily, progress, completedIds },
  };
}
