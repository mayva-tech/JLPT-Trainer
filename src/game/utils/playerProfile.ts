/**
 * RPG player profile persistence. Separate from Game Mode arcade stats and
 * from vocabulary mastery — except intentional Weak Words writes during quests.
 */

import { getLevelProgress } from "../../utils/gameMode/xp";
import { STARTER_LOCATION_IDS } from "../data/locations";
import { sealAwardedByQuest } from "../data/seals";
import { CURRENCY } from "../data/rpgConfig";
import type {
  CommunicationSealId,
  CompletedQuestRecord,
  DailyQuestProgress,
  ImmersionPrefs,
  LanguageStats,
  LivingJapaneseWeights,
  LocationId,
  NpcRelationship,
  PlayerRpgProfile,
} from "../types";
import {
  calcJapanesePower,
  mergeLanguageStats,
  seedLanguageStatsFromTrainer,
} from "./languageStats";
import { resolveAdventureRank } from "../data/ranks";
import { addRelationshipXp, grantQuestRelationshipXp } from "./relationships";
import { syncSkillUnlocks } from "./skillTree";
import { ensureDailyQuests } from "./dailyQuests";

export const RPG_PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

export type RpgStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function browserStore(): RpgStore | null {
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

function nonNegativeInt(value: unknown, fallback = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

function clampStat(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseLanguageStats(raw: unknown): LanguageStats | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  return {
    vocabulary: clampStat(row.vocabulary),
    grammar: clampStat(row.grammar),
    listening: clampStat(row.listening),
    reading: clampStat(row.reading),
    conversation: clampStat(row.conversation),
    politeness: clampStat(row.politeness),
  };
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function parseLocationIds(raw: unknown): LocationId[] {
  const allowed = new Set<string>([
    "home",
    "convenience-store",
    "cafe",
    "train-station",
    "city-hall",
    "clinic",
    "phone-center",
    "office",
    "training-dojo",
    "weak-word-dungeon",
    "jlpt-castle",
  ]);
  return parseStringArray(raw).filter((id): id is LocationId =>
    allowed.has(id)
  );
}

function parseCompleted(raw: unknown): CompletedQuestRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: CompletedQuestRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.questId !== "string") continue;
    out.push({
      questId: row.questId,
      accuracy: clampStat(row.accuracy),
      confidenceLeft: nonNegativeInt(row.confidenceLeft),
      completedAt: nonNegativeInt(row.completedAt, Date.now()),
      xpGained: nonNegativeInt(row.xpGained),
    });
  }
  return out;
}

export function createDefaultProfile(
  store: RpgStore | null = browserStore()
): PlayerRpgProfile {
  const now = Date.now();
  return {
    version: 1,
    playerName: "Traveler",
    xp: 0,
    currentChapter: 1,
    completedQuestIds: [],
    unlockedLocationIds: [...STARTER_LOCATION_IDS],
    activeQuestId: "city-hall-register",
    languageStats: seedLanguageStatsFromTrainer(store),
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

function parseFlags(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

function parseSeals(raw: unknown): CommunicationSealId[] {
  const allowed = new Set<string>([
    "city-hall",
    "transportation",
    "daily-life",
    "communication",
    "workplace",
    "social",
    "fluency",
  ]);
  return parseStringArray(raw).filter((id): id is CommunicationSealId =>
    allowed.has(id)
  );
}

function parseRelationships(raw: unknown): NpcRelationship[] {
  if (!Array.isArray(raw)) return [];
  const out: NpcRelationship[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.npcId !== "string") continue;
    out.push({
      npcId: row.npcId,
      xp: nonNegativeInt(row.xp),
      level: nonNegativeInt(row.level),
    });
  }
  return out;
}

function parseImmersion(raw: unknown): ImmersionPrefs {
  if (!raw || typeof raw !== "object") {
    return { enabled: false, hideEnglish: false, hideSubtitles: false };
  }
  const row = raw as Record<string, unknown>;
  return {
    enabled: row.enabled === true,
    hideEnglish: row.hideEnglish === true,
    hideSubtitles: row.hideSubtitles === true,
  };
}

function parseDaily(raw: unknown): DailyQuestProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.dayKey !== "string") return null;
  const progress: Record<string, number> = {};
  if (row.progress && typeof row.progress === "object") {
    for (const [k, v] of Object.entries(row.progress as Record<string, unknown>)) {
      progress[k] = nonNegativeInt(v);
    }
  }
  return {
    dayKey: row.dayKey,
    questIds: parseStringArray(row.questIds),
    completedIds: parseStringArray(row.completedIds),
    progress,
  };
}

function parseLiving(raw: unknown): LivingJapaneseWeights {
  if (!raw || typeof raw !== "object") return {};
  const out: LivingJapaneseWeights = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v) && v > 0) {
      out[k] = Math.min(10, Math.round(v));
    }
  }
  return out;
}

export function parsePlayerProfile(
  raw: unknown,
  store: RpgStore | null = null
): PlayerRpgProfile {
  const fallback = createDefaultProfile(store);
  if (!raw || typeof raw !== "object") return fallback;
  const row = raw as Record<string, unknown>;
  const languageStats =
    parseLanguageStats(row.languageStats) ?? fallback.languageStats;
  const unlocked = parseLocationIds(row.unlockedLocationIds);
  const completedQuestIds = parseStringArray(row.completedQuestIds);
  const flags = parseFlags(row.flags);
  let currentChapter = Math.max(1, nonNegativeInt(row.currentChapter, 1));

  // Backward compatible: Chapter 1 clearers immediately see Chapter 2.
  if (
    flags.chapter1Complete ||
    completedQuestIds.includes("first-week-challenge")
  ) {
    flags.chapter1Complete = true;
    currentChapter = Math.max(currentChapter, 2);
  }
  if (
    flags.chapter2Complete ||
    completedQuestIds.includes("social-life-challenge")
  ) {
    const ch2Done = [
      "clinic-visit",
      "phone-call",
      "first-day-office",
      "social-life-challenge",
    ].every((id) => completedQuestIds.includes(id));
    if (flags.chapter2Complete || ch2Done) {
      flags.chapter2Complete = true;
      currentChapter = Math.max(currentChapter, 3);
    }
  }
  if (
    flags.chapter3Complete ||
    completedQuestIds.includes("relationships-challenge")
  ) {
    const ch3Done = [
      "friend-invitation",
      "senpai-favor",
      "saying-no",
      "awkward-apology",
      "workplace-discussion",
      "relationships-challenge",
    ].every((id) => completedQuestIds.includes(id));
    if (flags.chapter3Complete || ch3Done) {
      flags.chapter3Complete = true;
      // Stay on chapter 3 as playable max (Ch4 teaser only).
      currentChapter = Math.max(currentChapter, 3);
    }
  }

  let profile: PlayerRpgProfile = {
    version: 1,
    playerName:
      typeof row.playerName === "string" && row.playerName.trim()
        ? row.playerName.trim().slice(0, 32)
        : fallback.playerName,
    xp: nonNegativeInt(row.xp),
    currentChapter,
    completedQuestIds,
    unlockedLocationIds:
      unlocked.length > 0 ? unlocked : fallback.unlockedLocationIds,
    activeQuestId:
      typeof row.activeQuestId === "string" || row.activeQuestId === null
        ? (row.activeQuestId as string | null)
        : fallback.activeQuestId,
    languageStats,
    completedQuests: parseCompleted(row.completedQuests),
    metNpcIds: parseStringArray(row.metNpcIds),
    rewardedQuestIds: parseStringArray(row.rewardedQuestIds),
    flags,
    seals: parseSeals(row.seals),
    relationships: parseRelationships(row.relationships),
    coins: nonNegativeInt(row.coins),
    unlockedSkillNodes: parseStringArray(row.unlockedSkillNodes),
    immersion: parseImmersion(row.immersion),
    daily: parseDaily(row.daily),
    livingJapanese: parseLiving(row.livingJapanese),
    recentFailConcepts: parseStringArray(row.recentFailConcepts).slice(0, 24),
    createdAt: nonNegativeInt(row.createdAt, fallback.createdAt),
    updatedAt: nonNegativeInt(row.updatedAt, fallback.updatedAt),
  };

  // Migrate: grant seals already earned from completed quests.
  for (const questId of profile.completedQuestIds) {
    const seal = sealAwardedByQuest(questId);
    if (seal && !profile.seals.includes(seal.id)) {
      profile = { ...profile, seals: [...profile.seals, seal.id] };
    }
  }

  profile = syncSkillUnlocks(profile);
  profile = ensureDailyQuests(profile);
  return profile;
}

export function loadPlayerProfile(
  store: RpgStore | null = browserStore()
): PlayerRpgProfile {
  if (!store) return createDefaultProfile(null);
  try {
    const raw = store.getItem(RPG_PROFILE_KEY);
    if (!raw) return createDefaultProfile(store);
    return parsePlayerProfile(JSON.parse(raw), store);
  } catch {
    return createDefaultProfile(store);
  }
}

export function savePlayerProfile(
  profile: PlayerRpgProfile,
  store: RpgStore | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(
      RPG_PROFILE_KEY,
      JSON.stringify({ ...profile, version: 1, updatedAt: Date.now() })
    );
  } catch {
    // Private mode / quota — progress won't persist.
  }
}

export function getProfileLevel(profile: PlayerRpgProfile): number {
  return getLevelProgress(profile.xp).level;
}

export function getProfileRank(profile: PlayerRpgProfile) {
  return resolveAdventureRank({
    completedQuests: profile.completedQuestIds.length,
    level: getProfileLevel(profile),
    japanesePower: calcJapanesePower(profile.languageStats),
  });
}

export function townCompletionPercent(profile: PlayerRpgProfile): number {
  const total = 11;
  const unlocked = new Set(profile.unlockedLocationIds).size;
  return Math.round((unlocked / total) * 100);
}

export type QuestCompletionInput = {
  questId: string;
  accuracy: number;
  confidenceLeft: number;
  xpGained: number;
  skillRewards: Partial<LanguageStats>;
  /** Tiny XP on replay after first clear. */
  replayXp?: number;
  replaySkillRewards?: Partial<LanguageStats>;
  unlockLocationIds?: LocationId[];
  unlockQuestIds?: string[];
  metNpcIds?: string[];
  /** Soft story flags to set true (e.g. chapter1Complete). */
  setFlags?: string[];
  at?: number;
  sealId?: CommunicationSealId;
  coins?: number;
  relationshipNpcIds?: string[];
  communicationPercent?: number;
  /** Immersion extras already folded into xpGained / skillRewards by caller. */
  immersionNoEnglish?: boolean;
  repairedConversation?: boolean;
  /** Per-choice relationship XP deltas from Conversation V2. */
  relationshipDeltas?: { npcId: string; delta: number }[];
};

export type QuestCompletionResult = {
  profile: PlayerRpgProfile;
  newlyRewarded: boolean;
  /** True when only small replay XP/skills were granted. */
  replayRewarded: boolean;
  xpGranted: number;
  skillRewardsApplied: Partial<LanguageStats>;
};

/**
 * First clear grants full XP/skills. Replays unlock locations/NPC memory
 * still apply if missing, but XP is either 0 or a small replayXp amount —
 * never a second full reward (anti-farm).
 */
export function applyQuestCompletion(
  profile: PlayerRpgProfile,
  input: QuestCompletionInput
): QuestCompletionResult {
  const alreadyRewarded = profile.rewardedQuestIds.includes(input.questId);
  const at = input.at ?? Date.now();

  let next: PlayerRpgProfile = {
    ...profile,
    updatedAt: at,
    activeQuestId: alreadyRewarded
      ? input.unlockQuestIds?.[0] ?? profile.activeQuestId
      : input.unlockQuestIds?.[0] ?? null,
  };

  if (!profile.completedQuestIds.includes(input.questId)) {
    next = {
      ...next,
      completedQuestIds: [...next.completedQuestIds, input.questId],
      completedQuests: [
        ...next.completedQuests.filter((row) => row.questId !== input.questId),
        {
          questId: input.questId,
          accuracy: input.accuracy,
          confidenceLeft: input.confidenceLeft,
          completedAt: at,
          xpGained: alreadyRewarded ? 0 : input.xpGained,
        },
      ],
    };
  }

  if (input.metNpcIds?.length) {
    const met = new Set([...next.metNpcIds, ...input.metNpcIds]);
    next = { ...next, metNpcIds: [...met] };
  }

  if (input.unlockLocationIds?.length) {
    const unlocked = new Set([
      ...next.unlockedLocationIds,
      ...input.unlockLocationIds,
    ]);
    next = { ...next, unlockedLocationIds: [...unlocked] };
  }

  if (input.setFlags?.length) {
    const flags = { ...next.flags };
    for (const key of input.setFlags) flags[key] = true;
    next = { ...next, flags };
  }

  if (alreadyRewarded) {
    const replayXp = Math.max(0, Math.floor(input.replayXp ?? 0));
    const replaySkills = input.replaySkillRewards ?? {};
    const hasReplay =
      replayXp > 0 || Object.values(replaySkills).some((v) => (v ?? 0) > 0);
    // Cap farming: only one small replay payout per quest ever.
    const replayFlag = `replayPaid:${input.questId}`;
    if (hasReplay && !next.flags[replayFlag]) {
      next = {
        ...next,
        xp: next.xp + replayXp,
        languageStats: mergeLanguageStats(next.languageStats, replaySkills),
        flags: { ...next.flags, [replayFlag]: true },
      };
      return {
        profile: next,
        newlyRewarded: false,
        replayRewarded: true,
        xpGranted: replayXp,
        skillRewardsApplied: replaySkills,
      };
    }
    return {
      profile: next,
      newlyRewarded: false,
      replayRewarded: false,
      xpGranted: 0,
      skillRewardsApplied: {},
    };
  }

  next = {
    ...next,
    xp: next.xp + Math.max(0, Math.floor(input.xpGained)),
    languageStats: mergeLanguageStats(next.languageStats, input.skillRewards),
    rewardedQuestIds: [...next.rewardedQuestIds, input.questId],
  };

  const seal =
    input.sealId ?? sealAwardedByQuest(input.questId)?.id ?? undefined;
  if (seal && !next.seals.includes(seal)) {
    next = { ...next, seals: [...next.seals, seal] };
  }

  const coinGain =
    input.coins ??
    (input.questId.includes("challenge")
      ? CURRENCY.perBossClear
      : CURRENCY.perQuestClear);
  next = { ...next, coins: next.coins + Math.max(0, coinGain) };

  const relNpcs = input.relationshipNpcIds ?? input.metNpcIds ?? [];
  if (relNpcs.length > 0) {
    next = grantQuestRelationshipXp(
      next,
      relNpcs,
      input.communicationPercent ?? input.accuracy
    );
  }

  if (input.relationshipDeltas?.length) {
    for (const row of input.relationshipDeltas) {
      if (!row.npcId || !row.delta) continue;
      next = addRelationshipXp(next, row.npcId, row.delta);
    }
  }

  if (input.immersionNoEnglish) {
    next = {
      ...next,
      flags: { ...next.flags, "achievement:no-subtitle-clear": true },
    };
  }
  if (input.repairedConversation) {
    next = {
      ...next,
      flags: { ...next.flags, "achievement:repair-ace": true },
    };
  }

  next = syncSkillUnlocks(next);

  return {
    profile: next,
    newlyRewarded: true,
    replayRewarded: false,
    xpGranted: Math.max(0, Math.floor(input.xpGained)),
    skillRewardsApplied: input.skillRewards,
  };
}

export function setActiveQuest(
  profile: PlayerRpgProfile,
  questId: string | null
): PlayerRpgProfile {
  return { ...profile, activeQuestId: questId, updatedAt: Date.now() };
}

export function renamePlayer(
  profile: PlayerRpgProfile,
  name: string
): PlayerRpgProfile {
  const trimmed = name.trim().slice(0, 32) || profile.playerName;
  return { ...profile, playerName: trimmed, updatedAt: Date.now() };
}
