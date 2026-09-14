export type GameModeId = "survival" | "speed" | "revenge" | "boss";

export type GameQuestionCategory =
  | "n2"
  | "weak"
  | "expression"
  | "relation"
  | "prerequisite"
  | "listening";

export type GameQuestionChoice = {
  id: string;
  label: string;
  reading?: string;
};

export type GameQuestion = {
  id: string;
  /** Stable identity used to avoid repeats in a session. */
  sourceKey: string;
  category: GameQuestionCategory;
  promptJa: string;
  promptEn: string;
  reading?: string;
  choices: GameQuestionChoice[];
  correctChoiceId: string;
  correctLabel: string;
  /** When set, a correct/wrong answer updates existing Weak Words stats. */
  vocabItemId?: number;
  /** Hide the Japanese prompt until reveal (listening). */
  listening?: boolean;
  speakText?: string;
  speakReading?: string;
  /** Session HP overlay for Weak Word Revenge. */
  enemyHp?: { current: number; max: number };
};

export type GameMistake = {
  prompt: string;
  reading?: string;
  correctAnswer: string;
  selectedAnswer: string;
  category: GameQuestionCategory;
};

export type GameCategoryWeights = Partial<Record<GameQuestionCategory, number>>;

export type GameFeedbackKind = "correct" | "wrong" | "hit" | "defeated" | "boss-hit" | "boss-hurt";

export type GameFeedback = {
  kind: GameFeedbackKind;
  title: string;
  detail?: string;
  combo?: number;
  scoreDelta?: number;
};

export type FinishedGame = {
  mode: GameModeId;
  score: number;
  correct: number;
  wrong: number;
  attempted: number;
  bestCombo: number;
  mistakes: GameMistake[];
  xpGained: number;
  survived?: number;
  weakDiscovered?: string[];
  revengeAttempted?: number;
  revengeDefeated?: number;
  revengeImproved?: string[];
  revengeStillWeak?: string[];
  bossVictory?: boolean;
  bossHpLeft?: number;
};
