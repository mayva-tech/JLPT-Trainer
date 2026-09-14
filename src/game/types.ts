/** Shared RPG types for ペラペラクエスト. Content stays data-driven. */

export type LocationId =
  | "home"
  | "convenience-store"
  | "cafe"
  | "train-station"
  | "city-hall"
  | "clinic"
  | "phone-center"
  | "office"
  | "training-dojo"
  | "weak-word-dungeon"
  | "jlpt-castle";

export type LanguageStatKey =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "reading"
  | "conversation"
  | "politeness";

export type LanguageStats = Record<LanguageStatKey, number>;

export type AdventureRankId =
  | "kotoba-beginner"
  | "nihongo-adventurer"
  | "kaiwa-fighter"
  | "communication-master"
  | "pera-pera-master";

export type QuestObjectiveType =
  | "dialogue"
  | "multiple-choice"
  | "listening"
  | "vocabulary"
  | "grammar"
  | "reading"
  | "form-label"
  | "typed-response"
  | "timed-response"
  | "collect"
  | "menu"
  | "map";

export type QuestStepKind =
  | "intro"
  | "dialogue"
  | "multiple-choice"
  | "form-label"
  | "reading"
  | "listening"
  | "menu"
  | "map"
  | "outro";

export type QuestChoice = {
  id: string;
  labelJa: string;
  labelEn?: string;
  correct: boolean;
  feedbackCorrect?: string;
  feedbackWrong?: string;
};

export type QuestStepWhen = {
  /** Show only if this NPC id is already in metNpcIds. */
  metNpc?: string;
  /** Show only if this NPC id is NOT yet met. */
  notMetNpc?: string;
};

export type QuestStep = {
  id: string;
  kind: QuestStepKind;
  objectiveType?: QuestObjectiveType;
  npcId?: string;
  promptJa: string;
  promptReading?: string;
  promptEn?: string;
  bodyJa?: string;
  bodyEn?: string;
  choices?: QuestChoice[];
  formFields?: { id: string; labelJa: string; meaningEn: string }[];
  formAskEn?: string;
  formCorrectFieldId?: string;
  /** Simple menu / price list for café-style steps. */
  menuItems?: { nameJa: string; priceYen: number }[];
  /** ASCII / text route diagram for station map steps. */
  mapText?: string;
  /** Optional spoken line for listening steps (TTS if available). */
  listenText?: string;
  listenReading?: string;
  skillHint?: LanguageStatKey;
  vocabHint?: string;
  costsConfidence?: boolean;
  when?: QuestStepWhen;
  helpHint?: string;
  /** TTS / karaoke behavior — inferred when omitted. */
  speech?: {
    enabled?: boolean;
    language?: "ja" | "en";
    autoPlay?: boolean;
    karaokeMode?: "always" | "after-answer" | "off";
    announcement?: boolean;
  };
};

export type QuestRewards = {
  xp: number;
  /** Small XP granted on replay after first clear. Default 0. */
  replayXp?: number;
  skillRewards: Partial<LanguageStats>;
  /** Tiny skill bumps on replay (optional). */
  replaySkillRewards?: Partial<LanguageStats>;
  unlockLocationIds?: LocationId[];
  unlockQuestIds?: string[];
  nextQuestTeaser?: { id: string; title: string; japaneseTitle: string };
};

export type QuestDefinition = {
  id: string;
  title: string;
  japaneseTitle: string;
  locationId: LocationId;
  chapter: number;
  description: string;
  difficulty: "easy" | "normal" | "hard" | "boss";
  recommendedLevel: number;
  startingConfidence: number;
  /** Prior quest ids that must be completed before this one is playable. */
  requiresQuestIds?: string[];
  objectives: { id: string; label: string }[];
  steps: QuestStep[];
  rewards: QuestRewards;
  unlocks: {
    locationIds?: LocationId[];
    questIds?: string[];
  };
  /** NPCs introduced / remembered when this quest is completed. */
  meetNpcIds?: string[];
  icon?: string;
};

export type NpcDefinition = {
  id: string;
  name: string;
  japaneseName: string;
  role: string;
  locationId: LocationId;
  portrait: string;
  dialogueStyle: "polite" | "casual" | "formal";
};

export type LocationDefinition = {
  id: LocationId;
  name: string;
  japaneseName: string;
  icon: string;
  description: string;
  requiredLevel: number;
  requiredQuestIds: string[];
  route:
    | "home"
    | "city-hall"
    | "convenience-store"
    | "train-station"
    | "cafe"
    | "training-dojo"
    | "weak-word-dungeon"
    | "coming-soon";
};

export type ChapterDefinition = {
  id: string;
  number: number;
  title: string;
  japaneseTitle: string;
  description: string;
  openingLines: string[];
  objectives: string[];
  questIds: string[];
  /** Locations previewed after chapter clear (not fully playable yet). */
  chapterClearPreviewLocationIds?: LocationId[];
  nextChapterTeaser?: { japaneseTitle: string; title: string };
};

export type CompletedQuestRecord = {
  questId: string;
  accuracy: number;
  confidenceLeft: number;
  completedAt: number;
  xpGained: number;
};

export type PlayerRpgProfile = {
  version: 1;
  playerName: string;
  xp: number;
  currentChapter: number;
  completedQuestIds: string[];
  unlockedLocationIds: LocationId[];
  activeQuestId: string | null;
  languageStats: LanguageStats;
  completedQuests: CompletedQuestRecord[];
  metNpcIds: string[];
  rewardedQuestIds: string[];
  /** Soft story flags (chapter clears, etc.). */
  flags: Record<string, boolean>;
  /** Optional help usage during the active run — not persisted heavily. */
  createdAt: number;
  updatedAt: number;
};

export type LocationStatus = "unlocked" | "locked" | "completed-area";

export type QuestRunMistake = {
  stepId: string;
  promptJa: string;
  selectedLabel: string;
  correctLabel: string;
  feedback: string;
  vocabHint?: string;
};
