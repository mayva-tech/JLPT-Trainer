import { describe, expect, it } from "vitest";
import { CITY_HALL_CONVERSATION } from "../data/quests/cityHallRegister";
import { QUESTS, getQuestById } from "../data/quests";
import {
  COMMUNICATION_V2,
  RESPONSE_QUALITY_DELTA,
} from "../data/rpgConfig";
import {
  applyConversationChoice,
  clampCommunication,
  defaultCommunicationStart,
  nextNaturalStreak,
  naturalStreakXpBonus,
} from "./conversationEngine";
import { validateConversation } from "./conversationValidator";
import { questHasPlayableContent } from "./questContent";
import type { ConversationChoice, ConversationDefinition } from "../types";

function choice(
  partial: Partial<ConversationChoice> &
    Pick<ConversationChoice, "id" | "japanese" | "quality" | "nextNodeId">
): ConversationChoice {
  return partial;
}

describe("Conversation Engine V2 scoring", () => {
  it("starts Communication independently of Confidence", () => {
    expect(defaultCommunicationStart()).toBe(COMMUNICATION_V2.startPercent);
    expect(defaultCommunicationStart()).toBe(75);
  });

  it("applies centralized quality deltas and clamps 0–100", () => {
    const base = {
      communication: 75,
      confidence: 5,
      naturalStreak: 0,
      maxNaturalStreak: 0,
    };
    const excellent = applyConversationChoice({
      ...base,
      choice: choice({
        id: "e",
        japanese: "a",
        quality: "excellent",
        nextNodeId: "n",
      }),
    });
    expect(excellent.communicationDelta).toBe(RESPONSE_QUALITY_DELTA.excellent);
    expect(excellent.communication).toBe(85);

    const incorrect = applyConversationChoice({
      ...base,
      choice: choice({
        id: "i",
        japanese: "b",
        quality: "incorrect",
        nextNodeId: "n",
      }),
    });
    expect(incorrect.communicationDelta).toBe(RESPONSE_QUALITY_DELTA.incorrect);
    expect(incorrect.confidence).toBe(4);

    expect(clampCommunication(200)).toBe(100);
    expect(clampCommunication(-5)).toBe(0);
  });

  it("tracks natural response streak", () => {
    expect(nextNaturalStreak(2, "excellent")).toBe(3);
    expect(nextNaturalStreak(2, "natural")).toBe(3);
    expect(nextNaturalStreak(2, "acceptable")).toBe(0);
    expect(nextNaturalStreak(2, "awkward")).toBe(0);
    expect(nextNaturalStreak(2, "incorrect")).toBe(0);
    expect(naturalStreakXpBonus(3)).toBeGreaterThan(0);
    expect(naturalStreakXpBonus(1)).toBe(0);
  });

  it("honors repair and clarification bonuses", () => {
    const repaired = applyConversationChoice({
      communication: 60,
      confidence: 4,
      naturalStreak: 0,
      maxNaturalStreak: 0,
      choice: choice({
        id: "r",
        japanese: "もう一度",
        quality: "acceptable",
        nextNodeId: "n",
        isRepair: true,
      }),
    });
    expect(repaired.communicationDelta).toBeGreaterThanOrEqual(
      COMMUNICATION_V2.repairBonus
    );
    expect(repaired.isRepair).toBe(true);

    const clarified = applyConversationChoice({
      communication: 60,
      confidence: 4,
      naturalStreak: 0,
      maxNaturalStreak: 0,
      choice: choice({
        id: "c",
        japanese: "意味は？",
        quality: "acceptable",
        nextNodeId: "n",
        isClarification: true,
      }),
    });
    expect(clarified.communicationDelta).toBeGreaterThanOrEqual(
      COMMUNICATION_V2.clarificationBonus
    );
  });

  it("applies relationship deltas from choices", () => {
    const result = applyConversationChoice({
      communication: 75,
      confidence: 5,
      naturalStreak: 0,
      maxNaturalStreak: 0,
      choice: choice({
        id: "rel",
        japanese: "x",
        quality: "natural",
        nextNodeId: "n",
        relationshipDelta: 2,
      }),
    });
    expect(result.relationshipDelta).toBe(2);
  });
});

describe("Conversation validator", () => {
  it("accepts the City Hall conversation graph", () => {
    const result = validateConversation(CITY_HALL_CONVERSATION);
    expect(result.ok, JSON.stringify(result.issues, null, 2)).toBe(true);
  });

  it("accepts the Phone Call conversation graph", async () => {
    const { PHONE_CALL_CONVERSATION } = await import(
      "../data/quests/phoneCall"
    );
    const result = validateConversation(PHONE_CALL_CONVERSATION);
    expect(result.ok, JSON.stringify(result.issues, null, 2)).toBe(true);
  });

  it("detects missing nextNodeId targets", () => {
    const bad: ConversationDefinition = {
      startNodeId: "a",
      nodes: [
        {
          id: "a",
          japanese: "hi",
          choices: [
            {
              id: "c1",
              japanese: "x",
              quality: "natural",
              nextNodeId: "missing",
            },
          ],
        },
      ],
    };
    const result = validateConversation(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "missing-node")).toBe(true);
  });

  it("detects duplicate node ids and unreachable nodes", () => {
    const bad: ConversationDefinition = {
      startNodeId: "a",
      nodes: [
        { id: "a", japanese: "1", nextNodeId: "b" },
        { id: "a", japanese: "dup", endState: "success" },
        { id: "b", japanese: "2", endState: "success" },
        { id: "orphan", japanese: "3", endState: "success" },
      ],
    };
    const result = validateConversation(bad);
    expect(result.issues.some((i) => i.code === "duplicate-node")).toBe(true);
    expect(result.issues.some((i) => i.code === "unreachable-node")).toBe(true);
  });

  it("requires a success path from start", () => {
    const bad: ConversationDefinition = {
      startNodeId: "a",
      nodes: [{ id: "a", japanese: "only", endState: "failure" }],
    };
    const result = validateConversation(bad);
    expect(result.issues.some((i) => i.code === "no-success-path")).toBe(true);
  });
});

describe("City Hall Conversation V2 content", () => {
  it("has 10+ nodes and meaningful branch coverage", () => {
    const nodes = CITY_HALL_CONVERSATION.nodes;
    expect(nodes.length).toBeGreaterThanOrEqual(10);
    const qualities = new Set<string>();
    let repairNodes = 0;
    let clarification = 0;
    let listening = 0;
    let kinyuReuse = 0;
    for (const node of nodes) {
      if (node.objectiveType === "repair") repairNodes += 1;
      if (node.objectiveType === "listening" || node.listenOnly) listening += 1;
      if (node.vocabHint === "記入") kinyuReuse += 1;
      for (const c of node.choices ?? []) {
        qualities.add(c.quality);
        if (c.isClarification) clarification += 1;
        if (c.isRepair) repairNodes += 1;
      }
    }
    expect(qualities.has("awkward")).toBe(true);
    expect(qualities.has("incorrect")).toBe(true);
    expect(qualities.has("excellent")).toBe(true);
    expect(clarification).toBeGreaterThanOrEqual(1);
    expect(repairNodes).toBeGreaterThanOrEqual(1);
    expect(listening).toBeGreaterThanOrEqual(1);
    expect(kinyuReuse).toBeGreaterThanOrEqual(2);
  });

  it("rejoins the main path after repair/clarify branches", () => {
    const reception = CITY_HALL_CONVERSATION.nodes.find((n) => n.id === "reception");
    const repair = CITY_HALL_CONVERSATION.nodes.find((n) => n.id === "repair-purpose");
    expect(reception?.choices?.some((c) => c.nextNodeId === "repair-purpose")).toBe(
      true
    );
    expect(
      repair?.choices?.some(
        (c) => c.nextNodeId === "purpose-ok" || c.nextNodeId === "reception"
      )
    ).toBe(true);
  });

  it("exposes conversation on the City Hall quest while keeping steps for compat", () => {
    const quest = getQuestById("city-hall-register");
    expect(quest?.conversation).toBeTruthy();
    expect(questHasPlayableContent(quest!)).toBe(true);
    expect(quest!.steps.length).toBeGreaterThan(0);
  });
});

describe("Old quest compatibility", () => {
  it("leaves Chapter 1–2 non-V2 quests on linear steps without conversation", () => {
    const v2Ids = new Set(["city-hall-register", "phone-call"]);
    const others = QUESTS.filter(
      (q) =>
        !q.rewards.randomEncounter &&
        !v2Ids.has(q.id) &&
        (q.chapter === 1 || q.chapter === 2)
    );
    expect(others.length).toBeGreaterThan(5);
    for (const q of others) {
      expect(q.conversation, q.id).toBeUndefined();
      expect(q.steps.length, q.id).toBeGreaterThan(0);
      expect(questHasPlayableContent(q)).toBe(true);
    }
  });

  it("can reach success via multiple City Hall paths", () => {
    const paths = [
      ["arrive", "reception", "purpose-ok", "move-date", "date-ok-react", "kinyu", "form-followup", "address-confirm", "boss", "success"],
      ["arrive", "reception", "clarify-purpose", "purpose-ok"],
      ["arrive", "reception", "repair-purpose", "explain-yoken", "reception"],
      ["arrive", "reception", "purpose-ok", "move-date", "date-wrong", "date-ok-react"],
      ["arrive", "reception", "purpose-ok", "move-date", "date-ok-react", "kinyu", "kinyu-explain", "form-followup"],
    ];
    const ids = new Set(CITY_HALL_CONVERSATION.nodes.map((n) => n.id));
    for (const path of paths) {
      for (const id of path) {
        expect(ids.has(id), id).toBe(true);
      }
    }
  });
});
