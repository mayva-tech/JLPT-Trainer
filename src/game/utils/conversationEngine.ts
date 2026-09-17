/**
 * Conversation Engine V2 — pure helpers for branching dialogue scoring.
 */

import {
  COMMUNICATION_V2,
  RESPONSE_QUALITY_DELTA,
  RESPONSE_QUALITY_LABEL,
} from "../data/rpgConfig";
import type {
  ConversationChoice,
  ConversationDefinition,
  ConversationNode,
  ResponseQuality,
} from "../types";

export function clampCommunication(value: number): number {
  return Math.max(
    COMMUNICATION_V2.minPercent,
    Math.min(COMMUNICATION_V2.maxPercent, Math.round(value))
  );
}

export function defaultCommunicationStart(): number {
  return COMMUNICATION_V2.startPercent;
}

export function qualityCommunicationDelta(quality: ResponseQuality): number {
  return RESPONSE_QUALITY_DELTA[quality];
}

export function qualityFeedbackLabel(quality: ResponseQuality): string {
  return RESPONSE_QUALITY_LABEL[quality];
}

export function isNaturalQuality(quality: ResponseQuality): boolean {
  return quality === "excellent" || quality === "natural";
}

export function nextNaturalStreak(
  current: number,
  quality: ResponseQuality
): number {
  return isNaturalQuality(quality) ? current + 1 : 0;
}

export function getConversationNode(
  conversation: ConversationDefinition,
  nodeId: string
): ConversationNode | undefined {
  return conversation.nodes.find((n) => n.id === nodeId);
}

export function getConversationChoice(
  node: ConversationNode,
  choiceId: string
): ConversationChoice | undefined {
  return node.choices?.find((c) => c.id === choiceId);
}

export type ChoiceApplyResult = {
  communication: number;
  confidence: number;
  naturalStreak: number;
  maxNaturalStreak: number;
  communicationDelta: number;
  confidenceDelta: number;
  relationshipDelta: number;
  quality: ResponseQuality;
  nextNodeId: string;
  isRepair: boolean;
  isClarification: boolean;
  conceptHints: string[];
  qualityLabel: string;
};

export function resolveChoiceCommunicationDelta(
  choice: ConversationChoice
): number {
  if (typeof choice.communicationDelta === "number") {
    return choice.communicationDelta;
  }
  let delta = qualityCommunicationDelta(choice.quality);
  if (choice.isClarification) {
    delta = Math.max(delta, COMMUNICATION_V2.clarificationBonus);
  }
  if (choice.isRepair) {
    delta = Math.max(delta, COMMUNICATION_V2.repairBonus);
  }
  return delta;
}

export function applyConversationChoice(input: {
  choice: ConversationChoice;
  communication: number;
  confidence: number;
  naturalStreak: number;
  maxNaturalStreak: number;
}): ChoiceApplyResult {
  const { choice } = input;
  const communicationDelta = resolveChoiceCommunicationDelta(choice);
  const confidenceDelta =
    typeof choice.confidenceDelta === "number"
      ? choice.confidenceDelta
      : choice.quality === "incorrect"
        ? -1
        : 0;
  const relationshipDelta =
    typeof choice.relationshipDelta === "number" ? choice.relationshipDelta : 0;
  const naturalStreak = nextNaturalStreak(input.naturalStreak, choice.quality);
  const maxNaturalStreak = Math.max(input.maxNaturalStreak, naturalStreak);
  const conceptHints = [choice.vocabHint, choice.grammarHint].filter(
    (x): x is string => Boolean(x?.trim())
  );

  return {
    communication: clampCommunication(input.communication + communicationDelta),
    confidence: Math.max(0, input.confidence + confidenceDelta),
    naturalStreak,
    maxNaturalStreak,
    communicationDelta,
    confidenceDelta,
    relationshipDelta,
    quality: choice.quality,
    nextNodeId: choice.nextNodeId,
    isRepair: Boolean(choice.isRepair),
    isClarification: Boolean(choice.isClarification),
    conceptHints,
    qualityLabel: qualityFeedbackLabel(choice.quality),
  };
}

/** Advance from a non-choice node (intro / reaction / end). */
export function advanceLinearNode(
  node: ConversationNode
): { nextNodeId: string } | { endState: "success" | "failure" } | null {
  if (node.endState === "success" || node.endState === "failure") {
    return { endState: node.endState };
  }
  if (node.nextNodeId) return { nextNodeId: node.nextNodeId };
  return null;
}

export function emptyQualityCounts(): Record<ResponseQuality, number> {
  return {
    excellent: 0,
    natural: 0,
    acceptable: 0,
    awkward: 0,
    incorrect: 0,
  };
}

export function naturalStreakXpBonus(maxNaturalStreak: number): number {
  if (maxNaturalStreak >= COMMUNICATION_V2.naturalStreakBadgeAt) {
    return COMMUNICATION_V2.naturalStreakXpBonus;
  }
  return 0;
}

export function conversationNodeIds(
  conversation: ConversationDefinition
): string[] {
  return conversation.nodes.map((n) => n.id);
}
