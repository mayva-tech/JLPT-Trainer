import { describe, expect, it } from "vitest";
import { getChapterByNumber } from "../data/chapters";
import { PASSPORT_ACHIEVEMENTS } from "../data/achievements";
import { getNpcById } from "../data/npcs";
import { getQuestById, QUESTS } from "../data/quests";
import { BUSINESS_PHONE_CONVERSATION } from "../data/quests/businessPhone";
import { CUSTOMER_SERVICE_CONVERSATION } from "../data/quests/customerService";
import { MEETING_SPEAK_CONVERSATION } from "../data/quests/meetingSpeak";
import { MORNING_OFFICE_CONVERSATION } from "../data/quests/morningOffice";
import { REPORT_MISTAKE_CONVERSATION } from "../data/quests/reportMistake";
import { REPORTING_TO_BOSS_CONVERSATION } from "../data/quests/reportingToBoss";
import { WORKDAY_SURVIVAL_CONVERSATION } from "../data/quests/workdaySurvival";
import { sealAwardedByQuest } from "../data/seals";
import { SKILL_NODES } from "../data/skills";
import { PHONE_CALL_CONVERSATION } from "../data/quests/phoneCall";
import { CITY_HALL_CONVERSATION } from "../data/quests/cityHallRegister";
import { applyConversationChoice } from "./conversationEngine";
import { validateConversation } from "./conversationValidator";
import {
  nodeCountsTowardProfessionalFit,
  professionalFitFromQualities,
  summarizeReportingTags,
} from "./professionalFit";
import { createTestRpgProfile } from "./testRpgProfile";
import { isQuestPlayable } from "./chapterProgress";
import type { ConversationChoice } from "../types";

const CH4_IDS = [
  "morning-office",
  "reporting-to-boss",
  "business-phone",
  "customer-service",
  "report-mistake",
  "meeting-speak",
  "workday-survival",
] as const;

const CH4_GRAPHS = [
  MORNING_OFFICE_CONVERSATION,
  REPORTING_TO_BOSS_CONVERSATION,
  BUSINESS_PHONE_CONVERSATION,
  CUSTOMER_SERVICE_CONVERSATION,
  REPORT_MISTAKE_CONVERSATION,
  MEETING_SPEAK_CONVERSATION,
  WORKDAY_SURVIVAL_CONVERSATION,
];

describe("Chapter 4 · 仕事と敬語", () => {
  it("defines chapter 4 with Business & Keigo identity and Ch5 teaser", () => {
    const ch = getChapterByNumber(4)!;
    expect(ch.japaneseTitle).toBe("第4章・仕事と敬語");
    expect(ch.title).toBe("Business & Keigo");
    expect(ch.questIds).toEqual([...CH4_IDS]);
    expect(ch.nextChapterTeaser?.japaneseTitle).toBe("第5章・速い日本語");
    expect(ch.nextChapterTeaser?.title).toContain("Fast");
  });

  it("unlocks Chapter 4 after Chapter 3 complete", () => {
    const profile = createTestRpgProfile({
      completedThroughChapter: 3,
      activeQuestId: "morning-office",
    });
    expect(profile.flags.chapter3Complete).toBe(true);
    expect(profile.currentChapter).toBe(4);
    expect(profile.completedQuestIds).toContain("relationships-challenge");
    const morning = getQuestById("morning-office")!;
    expect(isQuestPlayable(morning, profile)).toBe(true);
  });

  it("registers all Chapter 4 quests as Conversation V2", () => {
    for (const id of CH4_IDS) {
      const q = getQuestById(id);
      expect(q, id).toBeDefined();
      expect(q!.chapter).toBe(4);
      expect(q!.conversation, id).toBeDefined();
      expect(q!.conversation!.nodes.length, id).toBeGreaterThanOrEqual(8);
    }
  });

  it("validates every Chapter 4 conversation graph", () => {
    for (const graph of CH4_GRAPHS) {
      const result = validateConversation(graph);
      expect(result.ok, JSON.stringify(result.issues, null, 2)).toBe(true);
    }
  });

  it("keeps City Hall and Phone Call V2 graphs valid (regression)", () => {
    expect(validateConversation(CITY_HALL_CONVERSATION).ok).toBe(true);
    expect(validateConversation(PHONE_CALL_CONVERSATION).ok).toBe(true);
  });

  it("computes Professional Fit from qualities", () => {
    expect(professionalFitFromQualities(["excellent", "natural"])).toBeGreaterThan(
      85
    );
    expect(professionalFitFromQualities(["awkward", "incorrect"])).toBeLessThan(
      40
    );
  });

  it("counts business contexts toward Professional Fit", () => {
    expect(
      nodeCountsTowardProfessionalFit({
        socialContext: "customer",
        objectiveType: "social-choice",
      })
    ).toBe(true);
    expect(
      nodeCountsTowardProfessionalFit({
        socialContext: "external-caller",
        register: "formal",
      })
    ).toBe(true);
    expect(
      nodeCountsTowardProfessionalFit({
        socialContext: "friend",
        countsTowardProfessionalFit: false,
      })
    ).toBe(false);
  });

  it("scores coworker vs customer register differently via feedback qualities", () => {
    const overKeigo: ConversationChoice = {
      id: "awk",
      japanese: "かしこまりました。",
      quality: "awkward",
      nextNodeId: "n",
    };
    const applied = applyConversationChoice({
      choice: overKeigo,
      communication: 75,
      confidence: 5,
      naturalStreak: 0,
      maxNaturalStreak: 0,
    });
    expect(applied.quality).toBe("awkward");
    expect(applied.communication).toBeLessThan(75);
  });

  it("supports reporting quality tag summaries", () => {
    const summary = summarizeReportingTags([
      "conclusion-first",
      "action-stated",
      "too-much-detail",
    ]);
    expect(summary.conclusionFirst).toBe(true);
    expect(summary.actionStated).toBe(true);
    expect(summary.notes.some((n) => n.includes("conclusion"))).toBe(true);
    expect(summary.notes.some((n) => n.includes("detail"))).toBe(true);
  });

  it("business phone reuses phone presentation and fact memory", () => {
    expect(BUSINESS_PHONE_CONVERSATION.presentation).toBe("phone");
    expect(BUSINESS_PHONE_CONVERSATION.resultSummaryTitle).toBe(
      "BUSINESS CALL REPORT"
    );
    const facts = BUSINESS_PHONE_CONVERSATION.nodes.filter((n) => n.setsFacts);
    expect(facts.length).toBeGreaterThan(0);
    const audio = BUSINESS_PHONE_CONVERSATION.nodes.filter((n) => n.audioFirst);
    expect(audio.length).toBeGreaterThanOrEqual(2);
  });

  it("boss Workday Survival meets structural requirements", () => {
    expect(WORKDAY_SURVIVAL_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(20);
    const audio = WORKDAY_SURVIVAL_CONVERSATION.nodes.filter((n) => n.audioFirst);
    expect(audio.length).toBeGreaterThanOrEqual(2);
    const contexts = new Set(
      WORKDAY_SURVIVAL_CONVERSATION.nodes
        .map((n) => n.socialContext)
        .filter(Boolean)
    );
    expect(contexts.size).toBeGreaterThanOrEqual(3);
    const registers = new Set(
      WORKDAY_SURVIVAL_CONVERSATION.nodes.map((n) => n.register).filter(Boolean)
    );
    expect(registers.size).toBeGreaterThanOrEqual(3);
    expect(getQuestById("workday-survival")?.difficulty).toBe("boss");
    expect(getQuestById("workday-survival")?.rewards.sealId).toBe("professional");
  });

  it("awards Professional Seal and Hourensou skill path", () => {
    expect(sealAwardedByQuest("workday-survival")?.id).toBe("professional");
    expect(SKILL_NODES.some((n) => n.id === "conv-hourensou")).toBe(true);
    expect(SKILL_NODES.find((n) => n.id === "conv-hourensou")?.effect).toBe(
      "reporting-hint"
    );
    expect(SKILL_NODES.find((n) => n.id === "conv-keigo")?.effect).toBe(
      "keigo-sense"
    );
  });

  it("adds Chapter 4 passport achievements", () => {
    const ids = PASSPORT_ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toContain("hourensou-master");
    expect(ids).toContain("business-phone-survivor");
    expect(ids).toContain("owned-the-mistake");
    expect(ids).toContain("spoke-up-meeting");
  });

  it("includes client NPC yoshida-client", () => {
    expect(getNpcById("yoshida-client")?.japaneseName).toBe("吉田様");
  });

  it("includes business random encounters", () => {
    const ids = QUESTS.filter((q) => q.rewards.randomEncounter).map((q) => q.id);
    expect(ids).toContain("random-docs-today");
    expect(ids).toContain("random-manager-minute");
    expect(ids).toContain("random-external-caller");
  });

  it("meeting graph soft-disagrees instead of blunt それは違います as excellent", () => {
    const blunt = MEETING_SPEAK_CONVERSATION.nodes.some((n) =>
      n.choices?.some(
        (c) => c.japanese.includes("それは違います") && c.quality === "excellent"
      )
    );
    expect(blunt).toBe(false);
  });

  it("mistake report rewards recovery language", () => {
    const hasApology = REPORT_MISTAKE_CONVERSATION.nodes.some((n) =>
      n.choices?.some((c) => c.japanese.includes("申し訳"))
    );
    expect(hasApology).toBe(true);
  });
});
