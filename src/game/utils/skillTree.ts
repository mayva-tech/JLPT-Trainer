import { SKILL_NODES, type SkillNode, type SkillNodeId } from "../data/skills";
import type { PlayerRpgProfile } from "../types";

export function isSkillUnlocked(
  profile: PlayerRpgProfile,
  node: SkillNode
): boolean {
  if (profile.unlockedSkillNodes.includes(node.id)) return true;
  if (profile.completedQuestIds.length < node.requiresQuests) return false;
  if (node.requiresNode && !profile.unlockedSkillNodes.includes(node.requiresNode)) {
    return false;
  }
  return true;
}

/** Auto-unlock eligible nodes based on quest progress (idempotent). */
export function syncSkillUnlocks(profile: PlayerRpgProfile): PlayerRpgProfile {
  const unlocked = new Set(profile.unlockedSkillNodes);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of SKILL_NODES) {
      if (unlocked.has(node.id)) continue;
      if (profile.completedQuestIds.length < node.requiresQuests) continue;
      if (node.requiresNode && !unlocked.has(node.requiresNode)) continue;
      unlocked.add(node.id);
      changed = true;
    }
  }
  const next = [...unlocked];
  if (
    next.length === profile.unlockedSkillNodes.length &&
    next.every((id) => profile.unlockedSkillNodes.includes(id))
  ) {
    return profile;
  }
  return { ...profile, unlockedSkillNodes: next };
}

export function hasSkillEffect(
  profile: PlayerRpgProfile,
  effect: NonNullable<SkillNode["effect"]>
): boolean {
  return SKILL_NODES.some(
    (node) =>
      node.effect === effect && profile.unlockedSkillNodes.includes(node.id)
  );
}

export function getSkillNode(id: SkillNodeId): SkillNode | undefined {
  return SKILL_NODES.find((n) => n.id === id);
}
