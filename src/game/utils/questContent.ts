import type { QuestDefinition } from "../types";

/** True when the quest can be started (linear steps and/or V2 conversation). */
export function questHasPlayableContent(quest: QuestDefinition): boolean {
  if (quest.conversation && quest.conversation.nodes.length > 0) return true;
  return quest.steps.length > 0;
}
