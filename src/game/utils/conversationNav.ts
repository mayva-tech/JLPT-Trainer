/**
 * Checkpoint helpers for Conversation Engine V2 step navigation
 * (Back / Try Again / Forward) without double-counting scores.
 */

import type { QuestRunMistake, RepairCounts, ResponseQuality } from "../types";
import type { ListeningAssistLevel } from "./nativeListening";
import { emptyQualityCounts } from "./conversationEngine";
import { emptyRepairCounts } from "./repairCounts";

/** Scoring + reveal state captured at node arrival (before an answer). */
export type ConversationNavCheckpoint = {
  nodeId: string;
  confidence: number;
  communication: number;
  naturalStreak: number;
  maxNaturalStreak: number;
  correctCount: number;
  answeredCount: number;
  mistakes: QuestRunMistake[];
  conceptsLearned: string[];
  needsReview: string[];
  vocabDiscovered: string[];
  monsters: string[];
  relationshipDeltas: { npcId: string; delta: number }[];
  qualityCounts: Record<ResponseQuality, number>;
  socialFitQualities: ResponseQuality[];
  professionalFitQualities: ResponseQuality[];
  reportingTags: string[];
  repairedConversation: boolean;
  repairCounts: RepairCounts;
  facts: Record<string, string>;
  factLabels: Record<string, string>;
  understoodFacts: string[];
  firstListenCorrect: number;
  firstListenTotal: number;
  firstListenWithReplayCorrect: number;
  listenCompromised: boolean;
  highestAssistLevel: ListeningAssistLevel;
  reductionCorrect: number;
  reductionTotal: number;
  inferenceCorrect: number;
  inferenceTotal: number;
  helpUses: number;
  usedEnglishAssist: boolean;
  showHelp: boolean;
};

export function emptyConversationNavCheckpoint(
  nodeId: string,
  startingConfidence: number,
  communication: number
): ConversationNavCheckpoint {
  return {
    nodeId,
    confidence: startingConfidence,
    communication,
    naturalStreak: 0,
    maxNaturalStreak: 0,
    correctCount: 0,
    answeredCount: 0,
    mistakes: [],
    conceptsLearned: [],
    needsReview: [],
    vocabDiscovered: [],
    monsters: [],
    relationshipDeltas: [],
    qualityCounts: emptyQualityCounts(),
    socialFitQualities: [],
    professionalFitQualities: [],
    reportingTags: [],
    repairedConversation: false,
    repairCounts: emptyRepairCounts(),
    facts: {},
    factLabels: {},
    understoodFacts: [],
    firstListenCorrect: 0,
    firstListenTotal: 0,
    firstListenWithReplayCorrect: 0,
    listenCompromised: false,
    highestAssistLevel: 0,
    reductionCorrect: 0,
    reductionTotal: 0,
    inferenceCorrect: 0,
    inferenceTotal: 0,
    helpUses: 0,
    usedEnglishAssist: false,
    showHelp: false,
  };
}

export function cloneConversationNavCheckpoint(
  checkpoint: ConversationNavCheckpoint
): ConversationNavCheckpoint {
  return {
    ...checkpoint,
    mistakes: checkpoint.mistakes.map((m) => ({ ...m })),
    conceptsLearned: [...checkpoint.conceptsLearned],
    needsReview: [...checkpoint.needsReview],
    vocabDiscovered: [...checkpoint.vocabDiscovered],
    monsters: [...checkpoint.monsters],
    relationshipDeltas: checkpoint.relationshipDeltas.map((r) => ({ ...r })),
    qualityCounts: { ...checkpoint.qualityCounts },
    socialFitQualities: [...checkpoint.socialFitQualities],
    professionalFitQualities: [...checkpoint.professionalFitQualities],
    reportingTags: [...checkpoint.reportingTags],
    repairCounts: { ...checkpoint.repairCounts },
    facts: { ...checkpoint.facts },
    factLabels: { ...checkpoint.factLabels },
    understoodFacts: [...checkpoint.understoodFacts],
  };
}

export function canStepBack(historyLength: number): boolean {
  return historyLength > 0;
}

export function canRetryStep(revealed: boolean, isInteractive: boolean): boolean {
  return revealed && isInteractive;
}

export function canStepForward(options: {
  forwardStackLength: number;
  canContinue: boolean;
}): boolean {
  return options.forwardStackLength > 0 || options.canContinue;
}

/**
 * Push current onto history and clear the forward stack when advancing
 * to a newly unlocked node (not when restoring from Forward).
 */
export function pushHistoryClearingForward<T>(
  history: T[],
  current: T
): { history: T[]; forward: T[] } {
  return {
    history: [...history, current],
    forward: [],
  };
}

/**
 * Move one step back: current goes onto forward; previous comes off history.
 */
export function stepBackNav<T>(
  history: T[],
  forward: T[],
  current: T
): { history: T[]; forward: T[]; current: T } | null {
  if (history.length === 0) return null;
  const previous = history[history.length - 1]!;
  return {
    history: history.slice(0, -1),
    forward: [...forward, current],
    current: previous,
  };
}

/**
 * Move one step forward from the forward stack (after Back).
 */
export function stepForwardNav<T>(
  history: T[],
  forward: T[],
  current: T
): { history: T[]; forward: T[]; current: T } | null {
  if (forward.length === 0) return null;
  const next = forward[forward.length - 1]!;
  return {
    history: [...history, current],
    forward: forward.slice(0, -1),
    current: next,
  };
}
