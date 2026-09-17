import type { ResponseQuality } from "../types";

const SOCIAL_FIT_SCORE: Record<ResponseQuality, number> = {
  excellent: 100,
  natural: 88,
  acceptable: 70,
  awkward: 40,
  incorrect: 10,
};

/** Result-only Social Fit % from social-choice qualities. */
export function socialFitFromQualities(
  qualities: readonly ResponseQuality[]
): number {
  if (qualities.length === 0) return 100;
  const sum = qualities.reduce((acc, q) => acc + SOCIAL_FIT_SCORE[q], 0);
  return Math.max(0, Math.min(100, Math.round(sum / qualities.length)));
}

export function nodeCountsTowardSocialFit(node: {
  objectiveType?: string;
  countsTowardSocialFit?: boolean;
  socialContext?: string;
}): boolean {
  if (node.countsTowardSocialFit === false) return false;
  if (node.countsTowardSocialFit === true) return true;
  return (
    node.objectiveType === "social-choice" || Boolean(node.socialContext)
  );
}
