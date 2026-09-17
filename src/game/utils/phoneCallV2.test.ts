import { describe, expect, it } from "vitest";
import { PHONE_CALL_CONVERSATION, PHONE_CALL_QUEST } from "../data/quests/phoneCall";
import { getQuestById } from "../data/quests";
import { CITY_HALL_CONVERSATION } from "../data/quests/cityHallRegister";
import {
  applyConversationChoice,
  getConversationNode,
} from "./conversationEngine";
import { validateConversation } from "./conversationValidator";
import {
  bumpRepairCount,
  emptyRepairCounts,
  totalRepairs,
} from "./repairCounts";
import { createTestRpgProfile } from "./testRpgProfile";
import type { ConversationChoice } from "../types";

describe("Phone Call Conversation V2", () => {
  it("uses Conversation Engine V2 on the phone-call quest", () => {
    const quest = getQuestById("phone-call");
    expect(quest?.conversation).toBeDefined();
    expect(quest?.conversation?.presentation).toBe("phone");
    expect(quest?.conversation?.resultSummaryTitle).toBe("CALL REPORT");
    expect(PHONE_CALL_QUEST.conversation).toBe(PHONE_CALL_CONVERSATION);
  });

  it("keeps legacy steps as a compatibility shim", () => {
    expect(PHONE_CALL_QUEST.steps.length).toBeGreaterThan(0);
    expect(PHONE_CALL_QUEST.steps.some((s) => s.kind === "intro")).toBe(true);
  });

  it("passes the conversation validator", () => {
    const result = validateConversation(PHONE_CALL_CONVERSATION);
    expect(result.ok, JSON.stringify(result.issues, null, 2)).toBe(true);
  });

  it("has at least 14 nodes and required structural beats", () => {
    expect(PHONE_CALL_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(14);
    const ids = new Set(PHONE_CALL_CONVERSATION.nodes.map((n) => n.id));
    expect(ids.has("identify-caller")).toBe(true);
    expect(ids.has("purpose")).toBe(true);
    expect(ids.has("datetime-info")).toBe(true);
    expect(ids.has("datetime-check")).toBe(true);
    expect(ids.has("mishear-recovery")).toBe(true);
    expect(ids.has("datetime-slow")).toBe(true);
    expect(ids.has("explain-orikaeshi")).toBe(true);
    expect(ids.has("recall")).toBe(true);
    expect(ids.has("final-confirm")).toBe(true);
    expect(ids.has("closing")).toBe(true);
    expect(ids.has("success")).toBe(true);
  });

  it("includes audio-first listening nodes with hidden transcript intent", () => {
    const audioFirst = PHONE_CALL_CONVERSATION.nodes.filter((n) => n.audioFirst);
    expect(audioFirst.length).toBeGreaterThanOrEqual(2);
    expect(audioFirst.every((n) => n.speech?.karaokeMode === "after-answer" || n.listenOnly)).toBe(
      true
    );
  });

  it("sets appointment facts before the recall node", () => {
    const info = getConversationNode(PHONE_CALL_CONVERSATION, "datetime-info");
    expect(info?.setsFacts?.appointmentDay).toBe("水曜日");
    expect(info?.setsFacts?.appointmentTime).toBe("午後三時");
    const recall = getConversationNode(PHONE_CALL_CONVERSATION, "recall");
    expect(recall?.choices?.some((c) => c.japanese.includes("水曜日の午後三時"))).toBe(
      true
    );
    expect(recall?.choices?.some((c) => c.japanese.includes("木曜日"))).toBe(true);
    expect(recall?.choices?.some((c) => c.japanese.includes("午後二時"))).toBe(true);
    // Original sentence is not on the recall node itself.
    expect(recall?.japanese.includes("来週の水曜日")).toBe(false);
  });

  it("offers phone repair kinds: repeat, slow, meaning, confirm", () => {
    const kinds = new Set<string>();
    for (const node of PHONE_CALL_CONVERSATION.nodes) {
      for (const c of node.choices ?? []) {
        if (c.repairKind) kinds.add(c.repairKind);
      }
    }
    expect(kinds.has("repeat")).toBe(true);
    expect(kinds.has("slow")).toBe(true);
    expect(kinds.has("meaning")).toBe(true);
    expect(kinds.has("confirm")).toBe(true);
  });

  it("has a replayCurrent repeat that stays on the purpose beat", () => {
    const purpose = getConversationNode(PHONE_CALL_CONVERSATION, "purpose");
    const repeat = purpose?.choices?.find((c) => c.repairKind === "repeat");
    expect(repeat?.replayCurrent).toBe(true);
  });

  it("routes mishearing to recovery then rejoins instruction", () => {
    const check = getConversationNode(PHONE_CALL_CONVERSATION, "datetime-check");
    const wrong = check?.choices?.find((c) => c.id === "dt-mishear");
    expect(wrong?.nextNodeId).toBe("mishear-recovery");
    expect(wrong?.quality).toBe("incorrect");
    expect(wrong?.confidenceDelta ?? 0).toBe(0);
    expect(wrong?.communicationDelta).toBe(-8);

    const recovery = getConversationNode(
      PHONE_CALL_CONVERSATION,
      "mishear-recovery"
    );
    expect(
      recovery?.choices?.every((c) => c.nextNodeId === "instruction")
    ).toBe(true);
  });

  it("keeps Communication independent of Confidence on plausible mishear", () => {
    const wrong: ConversationChoice = {
      id: "dt-mishear",
      japanese: "木曜日の午後三時ですね。",
      quality: "incorrect",
      nextNodeId: "mishear-recovery",
      communicationDelta: -8,
      confidenceDelta: 0,
    };
    const applied = applyConversationChoice({
      choice: wrong,
      communication: 75,
      confidence: 5,
      naturalStreak: 0,
      maxNaturalStreak: 0,
    });
    expect(applied.communication).toBe(67);
    expect(applied.confidence).toBe(5);
  });

  it("City Hall graph still validates", () => {
    const result = validateConversation(CITY_HALL_CONVERSATION);
    expect(result.ok).toBe(true);
  });
});

describe("repairCounts helpers", () => {
  it("bumps kinds independently", () => {
    let counts = emptyRepairCounts();
    counts = bumpRepairCount(counts, "repeat");
    counts = bumpRepairCount(counts, "slow");
    counts = bumpRepairCount(counts, "slow");
    counts = bumpRepairCount(counts, "meaning");
    counts = bumpRepairCount(counts, "confirm");
    counts = bumpRepairCount(counts, undefined);
    expect(counts).toEqual({ repeat: 1, slow: 2, meaning: 1, confirm: 1 });
    expect(totalRepairs(counts)).toBe(5);
  });
});

describe("createTestRpgProfile", () => {
  it("builds a valid profile from production-like defaults", () => {
    const profile = createTestRpgProfile({
      currentChapter: 2,
      activeQuestId: "phone-call",
      completedThroughChapter: 1,
      immersion: {
        enabled: true,
        hideEnglish: true,
        hideSubtitles: true,
      },
    });
    expect(profile.version).toBe(1);
    expect(profile.currentChapter).toBe(2);
    expect(profile.activeQuestId).toBe("phone-call");
    expect(profile.completedQuestIds).toContain("city-hall-register");
    expect(profile.flags.chapter1Complete).toBe(true);
    expect(profile.immersion.enabled).toBe(true);
    expect(profile.immersion.hideEnglish).toBe(true);
    expect(profile.languageStats.conversation).toBeGreaterThan(0);
    expect(profile.updatedAt).toBeGreaterThan(0);
    expect(Array.isArray(profile.relationships)).toBe(true);
  });

  it("supports completedThroughChapter 2 for Chapter 3 seeding", () => {
    const profile = createTestRpgProfile({
      completedThroughChapter: 2,
      activeQuestId: "friend-invitation",
      relationships: [{ npcId: "haruka", level: 0, xp: 0 }],
    });
    expect(profile.currentChapter).toBe(3);
    expect(profile.completedQuestIds).toContain("phone-call");
    expect(profile.completedQuestIds).toContain("social-life-challenge");
    expect(profile.flags.chapter2Complete).toBe(true);
    expect(profile.relationships[0]?.npcId).toBe("haruka");
  });
});
