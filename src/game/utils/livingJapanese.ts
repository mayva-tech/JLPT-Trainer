import type { LivingJapaneseWeights, PlayerRpgProfile } from "../types";

const MAX_WEIGHT = 10;
const MIN_WEIGHT = 0;

/** Increase reinforcement weight when a concept is missed in Game Mode. */
export function bumpLivingWeight(
  weights: LivingJapaneseWeights,
  concept: string,
  amount = 1
): LivingJapaneseWeights {
  const key = concept.trim();
  if (!key) return weights;
  const prev = weights[key] ?? 0;
  return {
    ...weights,
    [key]: Math.min(MAX_WEIGHT, prev + amount),
  };
}

/** Ease reinforcement when the learner shows mastery. */
export function easeLivingWeight(
  weights: LivingJapaneseWeights,
  concept: string,
  amount = 1
): LivingJapaneseWeights {
  const key = concept.trim();
  if (!key) return weights;
  const prev = weights[key] ?? 0;
  const next = Math.max(MIN_WEIGHT, prev - amount);
  if (next <= 0) {
    const { [key]: _, ...rest } = weights;
    return rest;
  }
  return { ...weights, [key]: next };
}

export function recordQuestConceptMiss(
  profile: PlayerRpgProfile,
  concept: string | undefined
): PlayerRpgProfile {
  if (!concept?.trim()) return profile;
  const key = concept.trim();
  const recent = [
    key,
    ...profile.recentFailConcepts.filter((c) => c !== key),
  ].slice(0, 24);
  return {
    ...profile,
    recentFailConcepts: recent,
    livingJapanese: bumpLivingWeight(profile.livingJapanese, key, 1),
  };
}

export function recordQuestConceptHit(
  profile: PlayerRpgProfile,
  concept: string | undefined
): PlayerRpgProfile {
  if (!concept?.trim()) return profile;
  return {
    ...profile,
    livingJapanese: easeLivingWeight(profile.livingJapanese, concept.trim(), 1),
  };
}

/**
 * Rank concepts by Living Japanese weight for future encounter selection.
 * Deterministic: higher weight first, then alphabetical.
 */
export function selectWeakConcepts(
  profile: PlayerRpgProfile,
  limit = 5
): string[] {
  const entries = Object.entries(profile.livingJapanese);
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0], "ja");
  });
  const fromWeights = entries.map(([k]) => k);
  const merged = [
    ...fromWeights,
    ...profile.recentFailConcepts.filter((c) => !fromWeights.includes(c)),
  ];
  return merged.slice(0, limit);
}

/** Selection weight for an encounter that tags a concept. */
export function encounterReinforcementWeight(
  profile: PlayerRpgProfile,
  concepts: string[]
): number {
  let total = 1;
  for (const c of concepts) {
    total += profile.livingJapanese[c.trim()] ?? 0;
  }
  return total;
}
