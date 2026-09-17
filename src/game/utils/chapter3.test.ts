import { describe, expect, it } from "vitest";
import { getChapterByNumber } from "../data/chapters";
import { FRIEND_INVITATION_CONVERSATION } from "../data/quests/friendInvitation";
import { SENPAI_FAVOR_CONVERSATION } from "../data/quests/senpaiFavor";
import { SAYING_NO_CONVERSATION } from "../data/quests/sayingNo";
import { AWKWARD_APOLOGY_CONVERSATION } from "../data/quests/awkwardApology";
import { WORKPLACE_DISCUSSION_CONVERSATION } from "../data/quests/workplaceDiscussion";
import { RELATIONSHIPS_CHALLENGE_CONVERSATION } from "../data/quests/relationshipsChallenge";
import { getQuestById, QUESTS } from "../data/quests";
import { sealAwardedByQuest } from "../data/seals";
import { validateConversation } from "./conversationValidator";
import { resolveRelationshipBranch } from "./conversationEngine";
import { socialFitFromQualities } from "./socialFit";
import { isChapterComplete, isQuestPlayable } from "./chapterProgress";
import { parsePlayerProfile } from "./playerProfile";
import type { PlayerRpgProfile } from "../types";

const CH3_GRAPHS = [
  FRIEND_INVITATION_CONVERSATION,
  SENPAI_FAVOR_CONVERSATION,
  SAYING_NO_CONVERSATION,
  AWKWARD_APOLOGY_CONVERSATION,
  WORKPLACE_DISCUSSION_CONVERSATION,
  RELATIONSHIPS_CHALLENGE_CONVERSATION,
];

describe("Chapter 3 · 人間関係", () => {
  it("defines chapter 3 with 6 V2 missions", () => {
    const ch3 = getChapterByNumber(3);
    expect(ch3?.japaneseTitle).toContain("人間関係");
    expect(ch3?.questIds).toHaveLength(6);
    expect(ch3?.nextChapterTeaser?.japaneseTitle).toContain("第4章");
    for (const id of ch3!.questIds) {
      const q = getQuestById(id);
      expect(q?.conversation, id).toBeTruthy();
      expect(q?.chapter, id).toBe(3);
    }
  });

  it("validates every Chapter 3 conversation graph", () => {
    for (const graph of CH3_GRAPHS) {
      const result = validateConversation(graph);
      expect(result.ok, JSON.stringify(result.issues)).toBe(true);
    }
  });

  it("unlocks Chapter 3 after Chapter 2 completion", () => {
    const base = parsePlayerProfile({
      completedQuestIds: [
        "city-hall-register",
        "convenience-first-shop",
        "meet-neighbor",
        "station-master",
        "cafe-order",
        "first-week-challenge",
        "clinic-visit",
        "phone-call",
        "first-day-office",
        "social-life-challenge",
      ],
      flags: { chapter1Complete: true, chapter2Complete: true },
    });
    expect(base.currentChapter).toBeGreaterThanOrEqual(3);
    const first = getQuestById("friend-invitation")!;
    expect(isQuestPlayable(first, base)).toBe(true);
  });

  it("keeps friend-invitation locked before Chapter 2 clear", () => {
    const fresh = parsePlayerProfile({});
    const first = getQuestById("friend-invitation")!;
    expect(isQuestPlayable(first, fresh)).toBe(false);
  });

  it("awards Social Seal from relationships-challenge", () => {
    expect(sealAwardedByQuest("relationships-challenge")?.id).toBe("social");
  });

  it("computes Social Fit from qualities", () => {
    expect(socialFitFromQualities(["excellent", "natural"])).toBeGreaterThan(85);
    expect(socialFitFromQualities(["awkward", "incorrect"])).toBeLessThan(40);
  });

  it("routes relationship-aware invite variants", () => {
    const router = FRIEND_INVITATION_CONVERSATION.nodes.find(
      (n) => n.id === "invite-router"
    )!;
    expect(
      resolveRelationshipBranch(router, [{ npcId: "haruka", level: 1 }])
    ).toBe("invite-high");
    expect(resolveRelationshipBranch(router, [])).toBe("invite-low");
  });

  it("marks Chapter 3 complete when all missions done", () => {
    const profile = parsePlayerProfile({
      completedQuestIds: [
        "friend-invitation",
        "senpai-favor",
        "saying-no",
        "awkward-apology",
        "workplace-discussion",
        "relationships-challenge",
      ],
      flags: { chapter3Complete: true },
    }) as PlayerRpgProfile;
    expect(isChapterComplete(profile, 3)).toBe(true);
  });

  it("leaves Chapters 1–2 story quests on linear engine except City Hall", () => {
    const ch2 = QUESTS.filter((q) => q.chapter === 2 && !q.rewards.randomEncounter);
    for (const q of ch2) {
      expect(q.conversation, q.id).toBeUndefined();
    }
  });

  it("boss has 15+ nodes and multiple social contexts", () => {
    expect(RELATIONSHIPS_CHALLENGE_CONVERSATION.nodes.length).toBeGreaterThanOrEqual(
      15
    );
    const contexts = new Set(
      RELATIONSHIPS_CHALLENGE_CONVERSATION.nodes
        .map((n) => n.socialContext)
        .filter(Boolean)
    );
    expect(contexts.has("friend")).toBe(true);
    expect(contexts.has("senpai")).toBe(true);
    expect(contexts.has("boss")).toBe(true);
  });
});
