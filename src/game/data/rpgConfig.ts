/** Centralized RPG tuning for ペラペラクエスト immersion / rewards. */

export const IMMERSION_BONUS = {
  /** Extra XP when English stayed hidden for the whole encounter. */
  noEnglishXp: 15,
  /** Extra listening XP when first answer on listening steps was correct. */
  firstListenXp: 20,
  /** Multiplier on base quest XP when cleared with no English / no help. */
  noSubtitleXpMultiplier: 1.5,
} as const;

export const RELATIONSHIP = {
  xpPerHeart: 25,
  maxHearts: 5,
  /** Relationship XP granted on successful quest that meets the NPC. */
  questClearXp: 12,
  /** Bonus XP when conversation ends with high communication score. */
  highCommBonusXp: 8,
  highCommThreshold: 80,
} as const;

/** V1 linear quests: Communication mirrors remaining Confidence. */
export const COMMUNICATION = {
  /** Start of every interactive encounter (mirrors confidence scale 0–100). */
  startPercent: 100,
  /** Drop per costly miss (maps 1 confidence ≈ 20%). */
  missPenalty: 20,
  /** Small recovery when the learner repairs via Try again then correct. */
  repairBonus: 10,
  /** Cap at 100. */
  maxPercent: 100,
} as const;

/**
 * Conversation Engine V2: Communication is independent of Confidence.
 * Choice data may override these defaults via communicationDelta.
 */
export const COMMUNICATION_V2 = {
  startPercent: 75,
  minPercent: 0,
  maxPercent: 100,
  /** Successful clarification / repair recovery. */
  repairBonus: 6,
  clarificationBonus: 5,
  /** Small XP when max natural streak reaches this threshold. */
  naturalStreakBadgeAt: 3,
  naturalStreakXpBonus: 5,
} as const;

/** Default Communication deltas by response quality (centralized). */
export const RESPONSE_QUALITY_DELTA = {
  excellent: 10,
  natural: 7,
  acceptable: 3,
  awkward: -3,
  incorrect: -8,
} as const;

export const RESPONSE_QUALITY_LABEL = {
  excellent: "🌟 Very natural",
  natural: "✓ Natural",
  acceptable: "✓ Understandable",
  awkward: "△ Grammatically possible, but awkward here",
  incorrect: "✕ Misunderstood",
} as const;

export const CURRENCY = {
  /** Display name — not real yen. */
  name: "Kotoba Coins",
  symbol: "🪙",
  perQuestClear: 25,
  perBossClear: 60,
  perDailyComplete: 15,
  perRandomClear: 10,
} as const;

export const DAILY_QUEST_RESET_HOUR_UTC = 0;
