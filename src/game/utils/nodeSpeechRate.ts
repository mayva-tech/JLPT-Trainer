/**
 * Map Conversation V2 speechRate labels → numeric TTS rates.
 */

import {
  SPEECH_RATE_FAST,
  SPEECH_RATE_NATURAL,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
} from "../../services/speechService";
import type { NodeSpeechRate } from "../types";

export function speechRateToNumber(rate: NodeSpeechRate | undefined): number {
  switch (rate) {
    case "slow":
      return SPEECH_RATE_SLOW;
    case "natural":
      return SPEECH_RATE_NATURAL;
    case "fast":
      return SPEECH_RATE_FAST;
    case "normal":
    default:
      return SPEECH_RATE_NORMAL;
  }
}

/**
 * Resolve effective TTS rate for a node.
 * User Slow mode and forceSlowSpeech always take priority.
 */
export function resolveNodeSpeechRate(input: {
  nodeSpeechRate?: NodeSpeechRate;
  forceSlowSpeech?: boolean;
  userRateMode?: "normal" | "slow";
  forceSlowReplay?: boolean;
}): number {
  if (
    input.forceSlowReplay ||
    input.forceSlowSpeech ||
    input.userRateMode === "slow"
  ) {
    return SPEECH_RATE_SLOW;
  }
  return speechRateToNumber(input.nodeSpeechRate);
}
