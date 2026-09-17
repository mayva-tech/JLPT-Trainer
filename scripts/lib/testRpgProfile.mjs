/**
 * Shared RPG profile factory for Playwright smoke scripts (plain Node ESM).
 * Keep in sync with src/game/utils/testRpgProfile.ts
 */

const CH1_QUESTS = [
  "city-hall-register",
  "convenience-first-shop",
  "meet-neighbor",
  "station-master",
  "cafe-order",
  "first-week-challenge",
];

const CH2_QUESTS = [
  "clinic-visit",
  "phone-call",
  "first-day-office",
  "social-life-challenge",
];

const CH3_QUESTS = [
  "friend-invitation",
  "senpai-favor",
  "saying-no",
  "awkward-apology",
  "workplace-discussion",
  "relationships-challenge",
];

function languageStats(partial = {}) {
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

function completedRows(ids, at) {
  return ids.map((questId) => ({
    questId,
    accuracy: 90,
    confidenceLeft: 3,
    completedAt: at,
    xpGained: 50,
  }));
}

function baseProfile(now) {
  return {
    version: 1,
    playerName: "Test Traveler",
    xp: 0,
    currentChapter: 1,
    completedQuestIds: [],
    unlockedLocationIds: [
      "home",
      "city-hall",
      "training-dojo",
      "weak-word-dungeon",
    ],
    activeQuestId: null,
    languageStats: languageStats(),
    completedQuests: [],
    metNpcIds: [],
    rewardedQuestIds: [],
    flags: {},
    seals: [],
    relationships: [],
    coins: 0,
    unlockedSkillNodes: [],
    immersion: {
      enabled: false,
      hideEnglish: false,
      hideSubtitles: false,
    },
    daily: null,
    livingJapanese: {},
    recentFailConcepts: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * @param {Record<string, unknown>} [overrides]
 */
export function createTestRpgProfile(overrides = {}) {
  const now = Date.now();
  const base = baseProfile(now);
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

  const immersion = {
    ...base.immersion,
    ...(rest.immersion ?? {}),
  };

  const relationships = Array.isArray(rest.relationships)
    ? rest.relationships
    : base.relationships;

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
    languageStats: languageStats(rest.languageStats ?? {}),
    completedQuests: rest.completedQuests ?? completedRows(completedQuestIds, now),
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

export function createProfileCompletedThroughChapter(chapter, overrides = {}) {
  return createTestRpgProfile({
    ...overrides,
    completedThroughChapter: chapter,
  });
}
