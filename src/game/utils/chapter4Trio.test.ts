import { describe, expect, it } from "vitest";
import { getQuestById } from "../data/quests";
import {
  REPORT_MISTAKE_CONVERSATION,
  REPORT_MISTAKE_QUEST,
} from "../data/quests/reportMistake";
import {
  MEETING_SPEAK_CONVERSATION,
  MEETING_SPEAK_QUEST,
} from "../data/quests/meetingSpeak";
import {
  WORKDAY_SURVIVAL_CONVERSATION,
  WORKDAY_SURVIVAL_QUEST,
} from "../data/quests/workdaySurvival";
import { validateConversation } from "./conversationValidator";
import { sealAwardedByQuest } from "../data/seals";

describe("Chapter 4 · report / meeting / workday trio", () => {
  it("validates all three conversation graphs", () => {
    for (const graph of [
      REPORT_MISTAKE_CONVERSATION,
      MEETING_SPEAK_CONVERSATION,
      WORKDAY_SURVIVAL_CONVERSATION,
    ]) {
      const result = validateConversation(graph);
      expect(result.ok, JSON.stringify(result.issues)).toBe(true);
    }
  });

  it("wires quest metadata and unlock chain", () => {
    expect(getQuestById("report-mistake")?.chapter).toBe(4);
    expect(getQuestById("report-mistake")?.locationId).toBe("office");
    expect(REPORT_MISTAKE_QUEST.requiresQuestIds).toContain("customer-service");
    expect(REPORT_MISTAKE_QUEST.rewards.unlockQuestIds).toContain(
      "meeting-speak"
    );
    expect(MEETING_SPEAK_QUEST.requiresQuestIds).toContain("report-mistake");
    expect(MEETING_SPEAK_QUEST.rewards.unlockQuestIds).toContain(
      "workday-survival"
    );
    expect(WORKDAY_SURVIVAL_QUEST.difficulty).toBe("boss");
    expect(WORKDAY_SURVIVAL_QUEST.rewards.xp).toBe(350);
    expect(WORKDAY_SURVIVAL_QUEST.rewards.sealId).toBe("professional");
    expect(sealAwardedByQuest("workday-survival")?.id).toBe("professional");
  });

  it("meets workday survival content requirements", () => {
    expect(REPORT_MISTAKE_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(12);
    expect(MEETING_SPEAK_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(12);
    expect(WORKDAY_SURVIVAL_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(
      20
    );
    const audio = WORKDAY_SURVIVAL_CONVERSATION.nodes.filter(
      (n) => n.audioFirst
    ).length;
    expect(audio).toBeGreaterThanOrEqual(2);
    const regs = new Set(
      WORKDAY_SURVIVAL_CONVERSATION.nodes
        .map((n) => n.register)
        .filter(Boolean)
    );
    expect(regs.size).toBeGreaterThanOrEqual(3);
    expect(
      WORKDAY_SURVIVAL_CONVERSATION.nodes.some((n) => n.setsFacts)
    ).toBe(true);
    expect(
      WORKDAY_SURVIVAL_CONVERSATION.nodes.some((n) =>
        n.choices?.some((c) => c.checksFact)
      )
    ).toBe(true);
    expect(
      WORKDAY_SURVIVAL_CONVERSATION.nodes.some(
        (n) =>
          n.objectiveType === "repair" ||
          n.choices?.some((c) => c.isRepair)
      )
    ).toBe(true);
    expect(WORKDAY_SURVIVAL_QUEST.meetNpcIds).toContain("yoshida-client");
  });
});
