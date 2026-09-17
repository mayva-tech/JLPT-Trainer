import { RELATIONSHIP } from "../data/rpgConfig";
import type { NpcRelationship, PlayerRpgProfile } from "../types";

export function relationshipHearts(level: number): number {
  return Math.max(0, Math.min(RELATIONSHIP.maxHearts, level));
}

export function levelFromRelationshipXp(xp: number): number {
  return Math.max(
    0,
    Math.min(
      RELATIONSHIP.maxHearts,
      Math.floor(Math.max(0, xp) / RELATIONSHIP.xpPerHeart)
    )
  );
}

export function getRelationship(
  profile: PlayerRpgProfile,
  npcId: string
): NpcRelationship {
  const found = profile.relationships.find((r) => r.npcId === npcId);
  if (found) return found;
  return { npcId, xp: 0, level: 0 };
}

export function addRelationshipXp(
  profile: PlayerRpgProfile,
  npcId: string,
  amount: number
): PlayerRpgProfile {
  if (amount <= 0) return profile;
  const existing = [...profile.relationships];
  const idx = existing.findIndex((r) => r.npcId === npcId);
  const prev = idx >= 0 ? existing[idx]! : { npcId, xp: 0, level: 0 };
  const xp = prev.xp + amount;
  const next: NpcRelationship = {
    npcId,
    xp,
    level: levelFromRelationshipXp(xp),
  };
  if (idx >= 0) existing[idx] = next;
  else existing.push(next);
  return { ...profile, relationships: existing };
}

export function grantQuestRelationshipXp(
  profile: PlayerRpgProfile,
  npcIds: string[],
  communicationPercent: number
): PlayerRpgProfile {
  let next = profile;
  const bonus =
    communicationPercent >= RELATIONSHIP.highCommThreshold
      ? RELATIONSHIP.highCommBonusXp
      : 0;
  for (const npcId of npcIds) {
    next = addRelationshipXp(
      next,
      npcId,
      RELATIONSHIP.questClearXp + bonus
    );
  }
  return next;
}
