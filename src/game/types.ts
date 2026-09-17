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
  /** Communication Seal awarded on first clear. */
  sealId?: CommunicationSealId;
  /** Kotoba Coins on first clear (defaults from config if omitted). */
  coins?: number;
  /** Relationship XP granted to these NPCs on clear. */
  relationshipNpcIds?: string[];
  /** True for short random street encounters. */
  randomEncounter?: boolean;
};

/** Conversation Engine V2 — branching dialogue (optional per quest). */
export type ResponseQuality =
  | "excellent"
  | "natural"
  | "acceptable"
  | "awkward"
  | "incorrect";

export type ConversationObjectiveType =
  | "dialogue"
  | "listening"
  | "grammar"
  | "vocabulary"
  | "social-choice"
  | "repair";

export type ConversationEndState = "success" | "failure" | "continue";

/** Who the player is talking to (for feedback / Social Fit). */
export type SocialContext =
  | "friend"
  | "acquaintance"
  | "senpai"
  | "coworker"
  | "boss"
  | "stranger";

/** Expected speech register for this beat. */
export type SpeechRegister = "casual" | "neutral" | "polite" | "formal";

export type RelationshipBranch = {
  npcId: string;
  /** Inclusive minimum relationship heart level. */
  minLevel: number;
  nextNodeId: string;
};

/** Functional repair categories for Call Report / analytics. */
export type RepairKind = "repeat" | "slow" | "meaning" | "confirm";

export type RepairCounts = {
  repeat: number;
  slow: number;
  meaning: number;
  confirm: number;
};

export type ConversationChoice = {
  id: string;
  japanese: string;
  reading?: string;
  english?: string;
  quality: ResponseQuality;
  nextNodeId: string;
  feedback?: string;
  /** Override default quality → Communication delta. */
  communicationDelta?: number;
  /** Confidence hearts delta (usually 0 or −1). */
  confidenceDelta?: number;
  /** Soft relationship XP delta for the active NPC. */
  relationshipDelta?: number;
  consequenceFlag?: string;
  /** Marks this choice as a conversation-repair move. */
  isRepair?: boolean;
  /** Functional repair category (repeat / slow / meaning / confirm). */
  repairKind?: RepairKind;
  /**
   * Replay the current NPC line instead of advancing (repeat / slow).
   * Pair with repairKind "repeat" or "slow".
   */
  replayCurrent?: boolean;
  /** Marks clarification / meaning-check (Living Japanese friendly). */
  isClarification?: boolean;
  vocabHint?: string;
  grammarHint?: string;
  /** Optional fact key this answer claims to recall. */
  checksFact?: string;
  /** Expected value when checksFact is set (for report / tests). */
  expectedFactValue?: string;
};

export type ConversationNode = {
  id: string;
  npcId?: string;
  japanese: string;
  reading?: string;
  english?: string;
  objectiveType?: ConversationObjectiveType;
  choices?: ConversationChoice[];
  /** Linear advance when there are no choices. */
  nextNodeId?: string;
  /**
   * Optional relationship-aware routing (checked before nextNodeId).
   * First matching branch wins; otherwise falls back to nextNodeId.
   */
  relationshipBranches?: RelationshipBranch[];
  helpHint?: string;
  vocabHint?: string;
  grammarHint?: string;
  listenOnly?: boolean;
  /**
   * Audio-first beat: hide transcript until Help / answer; prioritize TTS.
   * Implies listening-style presentation.
   */
  audioFirst?: boolean;
  endState?: ConversationEndState;
  /** Force slow TTS for this node (e.g. after 「ゆっくり」repair). */
  forceSlowSpeech?: boolean;
  socialContext?: SocialContext;
  register?: SpeechRegister;
  /**
   * When true (default for social-choice), answers count toward Social Fit %.
   * Set false to exclude utility/repair beats.
   */
  countsTowardSocialFit?: boolean;
  /** Merge into conversation fact memory when this node is entered. */
  setsFacts?: Record<string, string>;
  /** Human labels for Call Report / result summary. */
  factLabels?: Record<string, string>;
  speech?: {
    enabled?: boolean;
    language?: "ja" | "en";
    autoPlay?: boolean;
    karaokeMode?: "always" | "after-answer" | "off";
  };
};

export type ConversationDefinition = {
  startNodeId: string;
  nodes: ConversationNode[];
  /** Optional presentation skin (e.g. phone call chrome). */
  presentation?: "default" | "phone";
  /** Title for optional result summary panel. */
  resultSummaryTitle?: string;
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
  /**
   * Optional Conversation Engine V2 graph. When present, QuestRunner uses the
   * branching runner instead of the linear `steps` MCQ flow.
   */
  conversation?: ConversationDefinition;
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
  /** Soft speaking-style tag for Immersion / future branches. */
  speakingStyle?: string;
};

export type CommunicationSealId =
  | "city-hall"
  | "transportation"
  | "daily-life"
  | "communication"
  | "workplace"
  | "social"
  | "fluency";

export type NpcRelationship = {
  npcId: string;
  xp: number;
  level: number;
};

export type DailyQuestProgress = {
  /** Local calendar day key YYYY-MM-DD. */
  dayKey: string;
  questIds: string[];
  completedIds: string[];
  progress: Record<string, number>;
};

export type LivingJapaneseWeights = Record<string, number>;

export type ImmersionPrefs = {
  enabled: boolean;
  hideEnglish: boolean;
  hideSubtitles: boolean;
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
    | "clinic"
    | "phone-center"
    | "office"
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
  /** Communication Seals collected. */
  seals: CommunicationSealId[];
  /** NPC familiarity / relationship XP. */
  relationships: NpcRelationship[];
  /** Soft currency for future cosmetics (not purchases). */
  coins: number;
  /** Unlocked skill-tree node ids. */
  unlockedSkillNodes: string[];
  /** Immersion Mode preferences. */
  immersion: ImmersionPrefs;
  /** Daily quest board state. */
  daily: DailyQuestProgress | null;
  /** Living Japanese reinforcement weights keyed by vocab/grammar hint. */
  livingJapanese: LivingJapaneseWeights;
  /** Concepts recently failed in Game Mode (for adaptive selection). */
  recentFailConcepts: string[];
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
