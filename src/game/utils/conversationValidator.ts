/**
 * Static validation for Conversation Engine V2 graphs.
 */

import type { ConversationDefinition, ConversationNode } from "../types";
import { getConversationNode } from "./conversationEngine";

export type ConversationValidationIssue = {
  code: string;
  message: string;
  nodeId?: string;
  choiceId?: string;
};

export type ConversationValidationResult = {
  ok: boolean;
  issues: ConversationValidationIssue[];
};

const END_STATES = new Set(["success", "failure", "continue"]);

function collectOutgoing(node: ConversationNode): string[] {
  const ids: string[] = [];
  if (node.nextNodeId) ids.push(node.nextNodeId);
  for (const c of node.choices ?? []) {
    ids.push(c.nextNodeId);
  }
  return ids;
}

/**
 * Detect cycles that cannot escape to an endState (simple DFS with end exits).
 * Explicitly allows cycles that also have a path out (e.g. repair → same node).
 */
function hasInescapableCycle(
  conversation: ConversationDefinition,
  startId: string
): boolean {
  const byId = new Map(conversation.nodes.map((n) => [n.id, n]));
  const visiting = new Set<string>();
  const done = new Set<string>();
  let found = false;

  function canReachEnd(id: string, stack: Set<string>): boolean {
    if (found) return true;
    const node = byId.get(id);
    if (!node) return false;
    if (node.endState === "success" || node.endState === "failure") return true;
    if (stack.has(id)) return false;
    stack.add(id);
    const outs = collectOutgoing(node);
    if (outs.length === 0) {
      stack.delete(id);
      return false;
    }
    let ok = false;
    for (const next of outs) {
      if (canReachEnd(next, stack)) {
        ok = true;
        break;
      }
    }
    stack.delete(id);
    return ok;
  }

  function dfs(id: string) {
    if (done.has(id) || found) return;
    if (visiting.has(id)) {
      // Cycle edge — only flag if this component cannot reach an end.
      if (!canReachEnd(id, new Set())) found = true;
      return;
    }
    visiting.add(id);
    const node = byId.get(id);
    if (node) {
      for (const next of collectOutgoing(node)) dfs(next);
    }
    visiting.delete(id);
    done.add(id);
  }

  dfs(startId);
  return found;
}

function canReachSuccess(
  conversation: ConversationDefinition,
  startId: string
): boolean {
  const byId = new Map(conversation.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = byId.get(id);
    if (!node) continue;
    if (node.endState === "success") return true;
    for (const next of collectOutgoing(node)) queue.push(next);
  }
  return false;
}

export function validateConversation(
  conversation: ConversationDefinition
): ConversationValidationResult {
  const issues: ConversationValidationIssue[] = [];
  const ids = conversation.nodes.map((n) => n.id);
  const seen = new Set<string>();

  if (!conversation.startNodeId) {
    issues.push({ code: "missing-start", message: "startNodeId is required" });
  }

  for (const node of conversation.nodes) {
    if (!node.id) {
      issues.push({ code: "empty-node-id", message: "Node id is empty" });
      continue;
    }
    if (seen.has(node.id)) {
      issues.push({
        code: "duplicate-node",
        message: `Duplicate node id: ${node.id}`,
        nodeId: node.id,
      });
    }
    seen.add(node.id);

    if (node.endState && !END_STATES.has(node.endState)) {
      issues.push({
        code: "invalid-end-state",
        message: `Invalid endState on ${node.id}`,
        nodeId: node.id,
      });
    }

    const hasChoices = Boolean(node.choices?.length);
    const isTerminal =
      node.endState === "success" || node.endState === "failure";

    if (!isTerminal && !hasChoices && !node.nextNodeId) {
      issues.push({
        code: "dead-end",
        message: `Node ${node.id} has no choices, nextNodeId, or terminal endState`,
        nodeId: node.id,
      });
    }

    if (hasChoices) {
      const choiceIds = new Set<string>();
      for (const choice of node.choices!) {
        if (choiceIds.has(choice.id)) {
          issues.push({
            code: "duplicate-choice",
            message: `Duplicate choice id ${choice.id} on ${node.id}`,
            nodeId: node.id,
            choiceId: choice.id,
          });
        }
        choiceIds.add(choice.id);
        if (!choice.nextNodeId) {
          issues.push({
            code: "missing-next",
            message: `Choice ${choice.id} on ${node.id} missing nextNodeId`,
            nodeId: node.id,
            choiceId: choice.id,
          });
        } else if (!ids.includes(choice.nextNodeId)) {
          issues.push({
            code: "missing-node",
            message: `Choice ${choice.id} points to missing node ${choice.nextNodeId}`,
            nodeId: node.id,
            choiceId: choice.id,
          });
        }
      }
    }

    if (node.nextNodeId && !ids.includes(node.nextNodeId)) {
      issues.push({
        code: "missing-node",
        message: `Node ${node.id} nextNodeId missing: ${node.nextNodeId}`,
        nodeId: node.id,
      });
    }
  }

  if (
    conversation.startNodeId &&
    !getConversationNode(conversation, conversation.startNodeId)
  ) {
    issues.push({
      code: "missing-start-node",
      message: `startNodeId "${conversation.startNodeId}" not found`,
    });
  }

  if (
    conversation.startNodeId &&
    getConversationNode(conversation, conversation.startNodeId) &&
    !canReachSuccess(conversation, conversation.startNodeId)
  ) {
    issues.push({
      code: "no-success-path",
      message: "No path from start reaches endState success",
    });
  }

  if (
    conversation.startNodeId &&
    getConversationNode(conversation, conversation.startNodeId) &&
    hasInescapableCycle(conversation, conversation.startNodeId)
  ) {
    issues.push({
      code: "inescapable-cycle",
      message: "Graph has a cycle with no path to a terminal end state",
    });
  }

  // Unreachable nodes (practical warning as issue)
  if (conversation.startNodeId) {
    const reach = new Set<string>();
    const queue = [conversation.startNodeId];
    const byId = new Map(conversation.nodes.map((n) => [n.id, n]));
    while (queue.length) {
      const id = queue.shift()!;
      if (reach.has(id)) continue;
      reach.add(id);
      const node = byId.get(id);
      if (!node) continue;
      for (const next of collectOutgoing(node)) queue.push(next);
    }
    for (const node of conversation.nodes) {
      if (!reach.has(node.id)) {
        issues.push({
          code: "unreachable-node",
          message: `Node ${node.id} is unreachable from start`,
          nodeId: node.id,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
