import { describe, expect, it } from "vitest";
import { PASSPORT_ACHIEVEMENTS } from "../data/achievements";
import { getChapterByNumber } from "../data/chapters";
import { getQuestById, QUESTS } from "../data/quests";
import { CONTRACTION_CITY_CONVERSATION } from "../data/quests/contractionCity";
import { FAST_CONVENIENCE_CONVERSATION } from "../data/quests/fastConvenience";
import { FRIEND_REAL_MEANING_CONVERSATION } from "../data/quests/friendRealMeaning";
import { IZAKAYA_LISTENING_CONVERSATION } from "../data/quests/izakayaListening";
import { NATIVE_SPEED_SURVIVAL_CONVERSATION } from "../data/quests/nativeSpeedSurvival";
import { READ_BETWEEN_LINES_CONVERSATION } from "../data/quests/readBetweenLines";
import { TRAIN_ANNOUNCEMENT_CONVERSATION } from "../data/quests/trainAnnouncement";
import { BUSINESS_PHONE_CONVERSATION } from "../data/quests/businessPhone";
import { PHONE_CALL_CONVERSATION } from "../data/quests/phoneCall";
import { WORKDAY_SURVIVAL_CONVERSATION } from "../data/quests/workdaySurvival";
import { sealAwardedByQuest } from "../data/seals";
import { SKILL_NODES } from "../data/skills";
import { isChapterComplete, isQuestPlayable } from "./chapterProgress";
import { validateConversation } from "./conversationValidator";
import {
  bumpAssistLevel,
  nativeListeningFromRun,
  nodeCountsTowardNativeListening,
  nodeSpokenFeatures,
} from "./nativeListening";
import { resolveNodeSpeechRate, speechRateToNumber } from "./nodeSpeechRate";
import {
  SPEECH_RATE_FAST,
  SPEECH_RATE_NATURAL,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
} from "../../services/speechService";
import { createTestRpgProfile } from "./testRpgProfile";
import type { ConversationDefinition } from "../types";

const CH5_IDS = [
  "fast-convenience",
  "train-announcement",
  "friend-real-meaning",
  "contraction-city",
  "izakaya-listening",
  "read-between-lines",
  "native-speed-survival",
] as const;

const CH5_GRAPHS: ConversationDefinition[] = [
  FAST_CONVENIENCE_CONVERSATION,
  TRAIN_ANNOUNCEMENT_CONVERSATION,
  FRIEND_REAL_MEANING_CONVERSATION,
  CONTRACTION_CITY_CONVERSATION,
  IZAKAYA_LISTENING_CONVERSATION,
  READ_BETWEEN_LINES_CONVERSATION,
  NATIVE_SPEED_SURVIVAL_CONVERSATION,
];

function countFeature(
  graph: ConversationDefinition,
  feature: string
): number {
  return graph.nodes.filter((n) =>
    nodeSpokenFeatures(n).includes(feature as never)
  ).length;
}

describe("Chapter 5 · ネイティブスピード", () => {
  it("defines chapter 5 with Fast & Natural identity and Ch6 teaser", () => {
    const ch = getChapterByNumber(5)!;
    expect(ch.japaneseTitle).toBe("第5章・ネイティブスピード");
    expect(ch.title).toBe("Fast & Natural Japanese");
    expect(ch.openingLines[0]).toMatch(/hasn.?t changed/i);
    expect(ch.questIds).toEqual([...CH5_IDS]);
    expect(ch.nextChapterTeaser?.japaneseTitle).toBe("第6章・トラブル対応");
    expect(ch.nextChapterTeaser?.title).toContain("Handling Problems");
  });

  it("unlocks Chapter 5 after Chapter 4 complete", () => {
    const profile = createTestRpgProfile({
      completedThroughChapter: 4,
      activeQuestId: "fast-convenience",
    });
    expect(profile.flags.chapter4Complete).toBe(true);
    expect(profile.currentChapter).toBe(5);
    expect(profile.completedQuestIds).toContain("workday-survival");
    const first = getQuestById("fast-convenience")!;
    expect(isQuestPlayable(first, profile)).toBe(true);
  });

  it("registers all Chapter 5 quests as Conversation V2", () => {
    for (const id of CH5_IDS) {
      const q = getQuestById(id);
      expect(q, id).toBeDefined();
      expect(q!.chapter).toBe(5);
      expect(q!.conversation, id).toBeDefined();
      expect(q!.conversation!.nodes.length, id).toBeGreaterThanOrEqual(8);
    }
  });

  it("validates every Chapter 5 conversation graph", () => {
    for (const graph of CH5_GRAPHS) {
      const result = validateConversation(graph);
      expect(result.ok, JSON.stringify(result.issues)).toBe(true);
    }
  });

  it("maps speechRate labels to TTS rates with Slow override", () => {
    expect(speechRateToNumber("slow")).toBe(SPEECH_RATE_SLOW);
    expect(speechRateToNumber("normal")).toBe(SPEECH_RATE_NORMAL);
    expect(speechRateToNumber("natural")).toBe(SPEECH_RATE_NATURAL);
    expect(speechRateToNumber("fast")).toBe(SPEECH_RATE_FAST);
    expect(
      resolveNodeSpeechRate({
        nodeSpeechRate: "fast",
        userRateMode: "slow",
      })
    ).toBe(SPEECH_RATE_SLOW);
    expect(
      resolveNodeSpeechRate({
        nodeSpeechRate: "natural",
        forceSlowReplay: true,
      })
    ).toBe(SPEECH_RATE_SLOW);
    expect(
      resolveNodeSpeechRate({ nodeSpeechRate: "fast" })
    ).toBe(SPEECH_RATE_FAST);
  });

  it("uses audio-first nodes with hidden-transcript karaoke mode", () => {
    const audioFirst = FAST_CONVENIENCE_CONVERSATION.nodes.filter(
      (n) => n.audioFirst || n.listenOnly
    );
    expect(audioFirst.length).toBeGreaterThanOrEqual(4);
    expect(
      audioFirst.every(
        (n) =>
          n.speech?.karaokeMode === "after-answer" ||
          n.speech?.autoPlay === true
      )
    ).toBe(true);
  });

  it("train mission uses fact recall and ≥3 audio-first beats", () => {
    const audio = TRAIN_ANNOUNCEMENT_CONVERSATION.nodes.filter(
      (n) => n.audioFirst || n.listenOnly
    );
    expect(audio.length).toBeGreaterThanOrEqual(3);
    const setsFacts = TRAIN_ANNOUNCEMENT_CONVERSATION.nodes.filter(
      (n) => n.setsFacts && Object.keys(n.setsFacts).length > 0
    );
    expect(setsFacts.length).toBeGreaterThanOrEqual(2);
    const checks = TRAIN_ANNOUNCEMENT_CONVERSATION.nodes.some((n) =>
      n.choices?.some((c) => c.checksFact)
    );
    expect(checks).toBe(true);
    expect(countFeature(TRAIN_ANNOUNCEMENT_CONVERSATION, "fast-formal")).toBeGreaterThanOrEqual(1);
  });

  it("friend mission teaches implied meaning with contextMeaning", () => {
    const implied = FRIEND_REAL_MEANING_CONVERSATION.nodes.filter(
      (n) =>
        nodeSpokenFeatures(n).includes("implied-meaning") ||
        Boolean(n.contextMeaning || n.intendedMeaning)
    );
    expect(implied.length).toBeGreaterThanOrEqual(3);
  });

  it("contraction city teaches reductions without requiring formal conversion", () => {
    const jp = CONTRACTION_CITY_CONVERSATION.nodes.map((n) => n.japanese).join(" ");
    expect(jp).toMatch(/してん|ちゃっ|なきゃ|って/);
    expect(countFeature(CONTRACTION_CITY_CONVERSATION, "contraction")).toBeGreaterThanOrEqual(2);
  });

  it("izakaya uses fillers, casual endings, and faster speech", () => {
    expect(countFeature(IZAKAYA_LISTENING_CONVERSATION, "filler")).toBeGreaterThanOrEqual(1);
    const rates = IZAKAYA_LISTENING_CONVERSATION.nodes.filter(
      (n) => n.speechRate === "natural" || n.speechRate === "fast"
    );
    expect(rates.length).toBeGreaterThanOrEqual(3);
  });

  it("read-between-lines scores contextual meaning", () => {
    const withMeaning = READ_BETWEEN_LINES_CONVERSATION.nodes.filter(
      (n) => n.contextMeaning || n.intendedMeaning
    );
    expect(withMeaning.length).toBeGreaterThanOrEqual(3);
    expect(
      READ_BETWEEN_LINES_CONVERSATION.nodes.some((n) =>
        nodeCountsTowardNativeListening(n)
      )
    ).toBe(true);
  });

  it("boss meets native-speed survival requirements", () => {
    const boss = NATIVE_SPEED_SURVIVAL_CONVERSATION;
    expect(boss.nodes.length).toBeGreaterThanOrEqual(20);
    const audioFirst = boss.nodes.filter((n) => n.audioFirst || n.listenOnly);
    expect(audioFirst.length).toBeGreaterThanOrEqual(4);
    expect(countFeature(boss, "contraction") + countFeature(boss, "reduced-sound")).toBeGreaterThanOrEqual(3);
    expect(countFeature(boss, "implied-meaning")).toBeGreaterThanOrEqual(2);
    expect(countFeature(boss, "fast-formal")).toBeGreaterThanOrEqual(1);
    const factSets = boss.nodes.filter((n) => n.setsFacts);
    expect(factSets.length).toBeGreaterThanOrEqual(2);
    const repairs = boss.nodes.flatMap((n) => n.choices ?? []).filter((c) => c.isRepair);
    expect(repairs.length).toBeGreaterThanOrEqual(2);
    const npcs = new Set(boss.nodes.map((n) => n.npcId).filter(Boolean));
    expect(npcs.size).toBeGreaterThanOrEqual(3);
  });

  it("awards Fluency Seal on native-speed-survival", () => {
    const seal = sealAwardedByQuest("native-speed-survival");
    expect(seal?.id).toBe("fluency");
    expect(getQuestById("native-speed-survival")!.rewards.sealId).toBe("fluency");
  });

  it("unlocks Listening Adaptation skill", () => {
    const skill = SKILL_NODES.find((n) => n.id === "listening-adapt");
    expect(skill?.japaneseName).toBe("耳が慣れる");
    expect(skill?.effect).toBe("listening-adapt");
  });

  it("includes Chapter 5 achievements", () => {
    const ids = PASSPORT_ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toContain("no-subtitles-ch5");
    expect(ids).toContain("got-it-first-try");
    expect(ids).toContain("reduction-master");
    expect(ids).toContain("read-the-context");
  });

  it("includes native-speed random encounters", () => {
    const ids = QUESTS.filter((q) => q.rewards.randomEncounter).map((q) => q.id);
    expect(ids).toContain("random-bag-ok");
    expect(ids).toContain("random-where-now");
    expect(ids).toContain("random-running-late");
  });

  it("computes Native Listening result metric", () => {
    expect(
      nativeListeningFromRun({
        firstListenCorrect: 4,
        firstListenTotal: 7,
        reductionCorrect: 3,
        reductionTotal: 3,
        inferenceCorrect: 2,
        inferenceTotal: 2,
        repairSuccess: true,
      })
    ).toBeGreaterThanOrEqual(70);
    expect(
      nativeListeningFromRun({
        firstListenCorrect: 0,
        firstListenTotal: 0,
        reductionCorrect: 0,
        reductionTotal: 0,
        inferenceCorrect: 0,
        inferenceTotal: 0,
        repairSuccess: false,
      })
    ).toBe(55);
  });

  it("tracks assist ladder levels", () => {
    expect(bumpAssistLevel(0, 1)).toBe(1);
    expect(bumpAssistLevel(1, 2)).toBe(2);
    expect(bumpAssistLevel(3, 1)).toBe(3);
    expect(bumpAssistLevel(2, 4)).toBe(4);
  });

  it("marks chapter 5 complete after boss clear", () => {
    const profile = createTestRpgProfile({
      completedThroughChapter: 5,
    });
    expect(isChapterComplete(profile, 5)).toBe(true);
    expect(profile.flags.chapter5Complete).toBe(true);
  });

  it("keeps Chapter 1–4 and Phone V2 regressions green", () => {
    expect(validateConversation(WORKDAY_SURVIVAL_CONVERSATION).ok).toBe(true);
    expect(validateConversation(BUSINESS_PHONE_CONVERSATION).ok).toBe(true);
    expect(validateConversation(PHONE_CALL_CONVERSATION).ok).toBe(true);
    const ch4 = getChapterByNumber(4)!;
    expect(ch4.questIds).toContain("workday-survival");
    expect(ch4.nextChapterTeaser?.japaneseTitle).toBe("第5章・ネイティブスピード");
  });
});
