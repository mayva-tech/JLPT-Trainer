import { recordVocabQuizAnswer } from "../vocabQuizStats";
import type { GameMistake, GameQuestion } from "./types";

export const GAME_MODE_QUIZ_ID = "quiz-game-mode";

/** Record vocab answers into the shared Weak Words stats when applicable. */
export function recordGameVocabAnswer(
  question: GameQuestion,
  correct: boolean
): void {
  if (question.vocabItemId == null) return;
  // Use weak-retest id so answers count toward vocabulary weak-word tracking.
  recordVocabQuizAnswer({
    itemId: question.vocabItemId,
    correct,
    quizId: "quiz-weak-retest",
  });
}

export function mistakeFromAnswer(
  question: GameQuestion,
  selectedIndex: number
): GameMistake {
  return {
    prompt: question.prompt,
    promptReading: question.promptReading,
    correctAnswer: question.choices[question.correctIndex] ?? "",
    selectedAnswer: question.choices[selectedIndex] ?? "",
    explanation: question.explanation,
  };
}

export function accuracyPercent(correct: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((correct / total) * 100)}%`;
}
