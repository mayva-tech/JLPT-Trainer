/** Shared Game Mode question shape (multiple-choice). */
export type GameQuestionCategory =
  | "n2"
  | "weak"
  | "synonym-antonym"
  | "expression"
  | "prerequisite"
  | "mixed";

export type GameQuestion = {
  id: string;
  category: GameQuestionCategory;
  prompt: string;
  promptReading?: string;
  promptEn?: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  /** When set, answers update Weak Words via recordVocabQuizAnswer. */
  vocabItemId?: number;
};

export type GameModeId =
  | "survival"
  | "speed-run"
  | "weak-revenge"
  | "boss-battle";

export type GameMistake = {
  prompt: string;
  promptReading?: string;
  correctAnswer: string;
  selectedAnswer: string;
  explanation?: string;
};

export type BossConfig = {
  id: string;
  nameJa: string;
  nameEn: string;
  emoji: string;
  bossMaxHp: number;
  playerMaxHp: number;
  damagePerHit: number;
};
