/**
 * Shared RPG profile factory for tests and smoke scripts.
 * Mirrors production defaults from createDefaultProfile / parsePlayerProfile.
 */

import { createDefaultProfile } from "./playerProfile";
import type {
  ImmersionPrefs,
  LanguageStats,
  NpcRelationship,
  PlayerRpgProfile,
} from "../types";

const CH1_QUESTS = [
  "city-hall-register",
  "convenience-first-shop",
  "meet-neighbor",
  "station-master",
  "cafe-order",
  "first-week-challenge",
] as const;

const CH2_QUESTS = [
  "clinic-visit",
  "phone-call",
  "first-day-office",
  "social-life-challenge",
] as const;

const CH3_QUESTS = [
  "friend-invitation",
  "senpai-favor",
  "saying-no",
  "awkward-apology",
  "workplace-discussion",
  "relationships-challenge",
] as const;

export type TestRpgProfileOverrides = Partial<PlayerRpgProfile> & {
  /** Complete all story quests through this chapter (1–3). */
  completedThroughChapter?: 1 | 2 | 3;
};

function languageStats(partial?: Partial<LanguageStats>): LanguageStats {
  return {
    vocabulary: 20,
    grammar: 18,
    listening: 18,
    reading: 18,
    conversation: 22,
    politeness: 20,
    ...partial,
  };
}

function completedRows(ids: string[], at: number) {
  return ids.map((questId) => ({
    questId,
    accuracy: 90,
    confidenceLeft: 3,
    completedAt: at,
    xpGained: 50,
  }));
}

/** Build a valid PlayerRpgProfile for tests/smoke without duplicating defaults. */
export function createTestRpgProfile(
  overrides: TestRpgProfileOverrides = {}
): PlayerRpgProfile {
  const base = createDefaultProfile(null);
  const now = Date.now();
  const { completedThroughChapter, ...rest } = overrides;

  let completedQuestIds = [...(rest.completedQuestIds ?? base.completedQuestIds)];
  let flags = { ...base.flags, ...(rest.flags ?? {}) };
  let currentChapter = rest.currentChapter ?? base.currentChapter;
  let rewardedQuestIds = [...(rest.rewardedQuestIds ?? base.rewardedQuestIds)];
  let unlockedLocationIds = [
    ...(rest.unlockedLocationIds ?? base.unlockedLocationIds),
  ];

  if (completedThroughChapter && completedThroughChapter >= 1) {
    completedQuestIds = [...new Set([...completedQuestIds, ...CH1_QUESTS])];
    rewardedQuestIds = [...new Set([...rewardedQuestIds, ...CH1_QUESTS])];
    flags = { ...flags, chapter1Complete: true };
    currentChapter = Math.max(currentChapter, 2);
    unlockedLocationIds = [
      ...new Set([
        ...unlockedLocationIds,
        "home",
        "city-hall",
        "convenience-store",
        "cafe",
        "train-station",
        "clinic",
        "phone-center",
        "office",
        "training-dojo",
        "weak-word-dungeon",
      ]),
    ];
  }
  if (completedThroughChapter && completedThroughChapter >= 2) {
    completedQuestIds = [...new Set([...completedQuestIds, ...CH2_QUESTS])];
    rewardedQuestIds = [...new Set([...rewardedQuestIds, ...CH2_QUESTS])];
    flags = { ...flags, chapter2Complete: true };
    currentChapter = Math.max(currentChapter, 3);
  }
  if (completedThroughChapter && completedThroughChapter >= 3) {
    completedQuestIds = [...new Set([...completedQuestIds, ...CH3_QUESTS])];
    rewardedQuestIds = [...new Set([...rewardedQuestIds, ...CH3_QUESTS])];
    flags = { ...flags, chapter3Complete: true };
    currentChapter = Math.max(currentChapter, 3);
  }

  const immersion: ImmersionPrefs = {
    ...base.immersion,
    ...(rest.immersion ?? {}),
  };

  const relationships: NpcRelationship[] = Array.isArray(rest.relationships)
    ? rest.relationships
    : base.relationships;

  const completedQuests =
    rest.completedQuests ??
    completedRows(completedQuestIds, now);

  return {
    ...base,
    ...rest,
    version: 1,
    playerName: rest.playerName ?? "Test Traveler",
    xp: rest.xp ?? Math.max(base.xp, completedQuestIds.length * 40),
    currentChapter,
    completedQuestIds,
    unlockedLocationIds,
    activeQuestId:
      rest.activeQuestId !== undefined ? rest.activeQuestId : base.activeQuestId,
    languageStats: languageStats(rest.languageStats),
    completedQuests,
    metNpcIds: rest.metNpcIds ?? base.metNpcIds,
    rewardedQuestIds,
    flags,
    seals: rest.seals ?? base.seals,
    relationships,
    coins: rest.coins ?? base.coins,
    unlockedSkillNodes: rest.unlockedSkillNodes ?? base.unlockedSkillNodes,
    immersion,
    daily: rest.daily ?? null,
    livingJapanese: rest.livingJapanese ?? {},
    recentFailConcepts: rest.recentFailConcepts ?? [],
    createdAt: rest.createdAt ?? base.createdAt,
    updatedAt: rest.updatedAt ?? now,
  };
}

export function createProfileCompletedThroughChapter(
  chapter: 1 | 2 | 3,
  overrides: TestRpgProfileOverrides = {}
): PlayerRpgProfile {
  return createTestRpgProfile({
    ...overrides,
    completedThroughChapter: chapter,
  });
}
