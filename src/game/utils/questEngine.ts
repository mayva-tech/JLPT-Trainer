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

/** Effects of one MCQ answer — used to undo scoring when the learner retries. */
export type QuestStepAnswerDelta = {
  correct: boolean;
  confidenceCost: number;
  mistakeAdded: boolean;
  vocabAdded: string | null;
  monsterAdded: string | null;
};

export type QuestStepRunStats = {
  confidence: number;
  correctCount: number;
  answeredCount: number;
  mistakes: QuestRunMistake[];
  monsters: string[];
  vocabDiscovered: string[];
};

/** Build the delta recorded when an answer is committed. */
export function buildStepAnswerDelta(
  result: StepAnswerResult,
  options: {
    confidenceBefore: number;
    confidenceAfter: number;
    vocabAdded: string | null;
    monsterAdded: string | null;
  }
): QuestStepAnswerDelta {
  return {
    correct: result.correct,
    confidenceCost: Math.max(
      0,
      options.confidenceBefore - options.confidenceAfter
    ),
    mistakeAdded: Boolean(result.mistake),
    vocabAdded: options.vocabAdded,
    monsterAdded: options.monsterAdded,
  };
}

/** Reverse one answer so the same step can be attempted again without double-counting. */
export function undoStepAnswer(
  stats: QuestStepRunStats,
  delta: QuestStepAnswerDelta
): QuestStepRunStats {
  let mistakes = stats.mistakes;
  if (delta.mistakeAdded && mistakes.length > 0) {
    mistakes = mistakes.slice(0, -1);
  }

  let monsters = stats.monsters;
  if (delta.monsterAdded) {
    const idx = monsters.lastIndexOf(delta.monsterAdded);
    if (idx >= 0) {
      monsters = [...monsters.slice(0, idx), ...monsters.slice(idx + 1)];
    }
  }

  let vocabDiscovered = stats.vocabDiscovered;
  if (delta.vocabAdded) {
    const idx = vocabDiscovered.lastIndexOf(delta.vocabAdded);
    if (idx >= 0) {
      vocabDiscovered = [
        ...vocabDiscovered.slice(0, idx),
        ...vocabDiscovered.slice(idx + 1),
      ];
    }
  }

  return {
    confidence: stats.confidence + delta.confidenceCost,
    correctCount: Math.max(
      0,
      stats.correctCount - (delta.correct ? 1 : 0)
    ),
    answeredCount: Math.max(0, stats.answeredCount - 1),
    mistakes,
    monsters,
    vocabDiscovered,
  };
}
