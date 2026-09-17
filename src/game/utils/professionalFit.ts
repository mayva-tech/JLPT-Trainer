/**
 * Professional Fit — result-only business-register metric (Chapter 4).
 * Reuses the same quality → score mapping as Social Fit.
 */

import type { ResponseQuality } from "../types";
import { socialFitFromQualities } from "./socialFit";

const BUSINESS_CONTEXTS = new Set([
  "boss",
  "manager",
  "coworker",
  "senpai",
  "customer",
  "client",
  "external-caller",
]);

/** Alias — same scoring curve as Social Fit. */
export function professionalFitFromQualities(
  qualities: readonly ResponseQuality[]
): number {
  return socialFitFromQualities(qualities);
}

export function nodeCountsTowardProfessionalFit(node: {
  objectiveType?: string;
  countsTowardProfessionalFit?: boolean;
  countsTowardSocialFit?: boolean;
  socialContext?: string;
  register?: string;
}): boolean {
  if (node.countsTowardProfessionalFit === false) return false;
  if (node.countsTowardProfessionalFit === true) return true;
  if (node.socialContext && BUSINESS_CONTEXTS.has(node.socialContext)) {
    return true;
  }
  if (node.register === "business" || node.register === "formal") {
    return (
      node.objectiveType === "social-choice" ||
      node.objectiveType === "dialogue" ||
      Boolean(node.socialContext)
    );
  }
  return false;
}

export type ReportingQualitySummary = {
  conclusionFirst: boolean;
  clear: boolean;
  actionStated: boolean;
  notes: string[];
};

export function summarizeReportingTags(
  tags: readonly string[]
): ReportingQualitySummary {
  const set = new Set(tags);
  const notes: string[] = [];
  const conclusionFirst = set.has("conclusion-first");
  const clear = set.has("clear");
  const actionStated = set.has("action-stated");
  if (conclusionFirst) notes.push("✓ Clear conclusion");
  else if (tags.length > 0) notes.push("△ Lead with the conclusion");
  if (clear) notes.push("✓ Clear status");
  if (actionStated) notes.push("✓ Next action stated");
  if (set.has("too-much-detail")) notes.push("△ Too much detail");
  if (set.has("excuse-heavy")) notes.push("△ Too many excuses");
  return { conclusionFirst, clear, actionStated, notes };
}
