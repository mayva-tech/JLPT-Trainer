import { recordVocabQuizAnswer } from "../vocabQuizStats";
import type { GameQuestion } from "./types";

/** Updates the existing Weak Words / quiz-stats file for vocabulary items only. */
export function recordGameVocabAnswer(
  question: GameQuestion,
  correct: boolean
): void {
  if (question.vocabItemId == null) return;
  recordVocabQuizAnswer({ itemId: question.vocabItemId, correct });
}
