import { recordVocabQuizAnswer } from "../../utils/vocabQuizStats";
import type { QuestChoice, QuestRunMistake, QuestStep } from "../types";

export type StepAnswerResult = {
  correct: boolean;
  feedback: string;
  selectedLabel: string;
  correctLabel: string;
  mistake?: QuestRunMistake;
  costsConfidence: boolean;
};

export function findCorrectChoice(
  step: QuestStep
): QuestChoice | undefined {
  return step.choices?.find((choice) => choice.correct);
}

export function evaluateChoiceAnswer(
  step: QuestStep,
  choiceId: string
): StepAnswerResult {
  const choices = step.choices ?? [];
  const selected = choices.find((choice) => choice.id === choiceId);
  const correctChoice = findCorrectChoice(step);
  const correct = Boolean(selected?.correct);
  const costsConfidence =
    step.costsConfidence !== false &&
    step.kind !== "intro" &&
    step.kind !== "outro";

  const feedback = correct
    ? selected?.feedbackCorrect ?? "✅ Correct"
    : selected?.feedbackWrong ??
      `❌ Not quite.\n\nBetter: ${correctChoice?.labelJa ?? ""}`;

  const result: StepAnswerResult = {
    correct,
    feedback,
    selectedLabel: selected?.labelJa ?? choiceId,
    correctLabel: correctChoice?.labelJa ?? "",
    costsConfidence: costsConfidence && !correct,
  };

  if (!correct) {
    result.mistake = {
      stepId: step.id,
      promptJa: step.promptJa,
      selectedLabel: result.selectedLabel,
      correctLabel: result.correctLabel,
      feedback,
      vocabHint: step.vocabHint,
    };
  }

  return result;
}

/**
 * Soft Weak Words hook: only mark a vocab hint when the player misses it.
 * Uses the existing vocab quiz stats store without inventing fake item IDs.
 * String-only hints (quest phrases) are returned for UI monster messages;
 * numeric corpus IDs would call recordVocabQuizAnswer when available.
 */
export function noteQuestVocabMiss(options: {
  vocabHint?: string;
  vocabItemId?: number;
  correct: boolean;
}): { monsterLabel: string | null } {
  if (options.correct) return { monsterLabel: null };
  if (options.vocabItemId != null) {
    recordVocabQuizAnswer({ itemId: options.vocabItemId, correct: false });
  }
  if (!options.vocabHint) return { monsterLabel: null };
  // Only surface a "monster appeared" message for clear vocab targets.
  return { monsterLabel: options.vocabHint };
}

export function accuracyFromCounts(correct: number, answered: number): number {
  if (answered <= 0) return 0;
  return Math.round((correct / answered) * 100);
}
