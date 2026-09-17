/**
 * Native Listening — result-only Chapter 5 listening-adaptation metric.
 */

import type { ResponseQuality, SpokenFeature } from "../types";

const QUALITY_OK = new Set<ResponseQuality>([
  "excellent",
  "natural",
  "acceptable",
]);

export function isListeningQualityOk(quality: ResponseQuality): boolean {
  return QUALITY_OK.has(quality);
}

export function nodeSpokenFeatures(node: {
  spokenFeature?: SpokenFeature | SpokenFeature[];
}): SpokenFeature[] {
  if (!node.spokenFeature) return [];
  return Array.isArray(node.spokenFeature)
    ? node.spokenFeature
    : [node.spokenFeature];
}

export function nodeCountsTowardNativeListening(node: {
  audioFirst?: boolean;
  listenOnly?: boolean;
  objectiveType?: string;
  spokenFeature?: SpokenFeature | SpokenFeature[];
  intendedMeaning?: string;
  contextMeaning?: string;
}): boolean {
  if (node.audioFirst || node.listenOnly || node.objectiveType === "listening") {
    return true;
  }
  if (nodeSpokenFeatures(node).length > 0) return true;
  if (node.intendedMeaning || node.contextMeaning) return true;
  return false;
}

export type NativeListeningInput = {
  firstListenCorrect: number;
  firstListenTotal: number;
  /** Reduced-form / spokenFeature beats answered well. */
  reductionCorrect: number;
  reductionTotal: number;
  /** Implied-meaning / context beats answered well. */
  inferenceCorrect: number;
  inferenceTotal: number;
  /** At least one successful repair this run. */
  repairSuccess: boolean;
};

/** 0–100 result-only Native Listening score. */
export function nativeListeningFromRun(input: NativeListeningInput): number {
  const parts: number[] = [];
  if (input.firstListenTotal > 0) {
    parts.push((input.firstListenCorrect / input.firstListenTotal) * 100);
  }
  if (input.reductionTotal > 0) {
    parts.push((input.reductionCorrect / input.reductionTotal) * 100);
  }
  if (input.inferenceTotal > 0) {
    parts.push((input.inferenceCorrect / input.inferenceTotal) * 100);
  }
  if (parts.length === 0) {
    return input.repairSuccess ? 70 : 55;
  }
  let score = parts.reduce((a, b) => a + b, 0) / parts.length;
  if (input.repairSuccess) score = Math.min(100, score + 4);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Assist ladder: 0 audio → 1 replay → 2 slow → 3 transcript → 4 English. */
export type ListeningAssistLevel = 0 | 1 | 2 | 3 | 4;

export function bumpAssistLevel(
  current: ListeningAssistLevel,
  next: ListeningAssistLevel
): ListeningAssistLevel {
  return (Math.max(current, next) as ListeningAssistLevel);
}
