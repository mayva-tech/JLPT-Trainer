import { describe, expect, it } from "vitest";
import { resolveQuestSpeech } from "./questSpeech";
import type { QuestStep } from "../types";

function step(partial: Partial<QuestStep> & Pick<QuestStep, "id" | "kind" | "promptJa">): QuestStep {
  return partial as QuestStep;
}

describe("resolveQuestSpeech", () => {
  it("auto-plays NPC Japanese with always karaoke", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "purpose",
        kind: "dialogue",
        npcId: "tanaka-city-hall",
        promptJa: "本日はどのようなご用件でしょうか。",
        promptReading: "ほんじつ は どの ような ごようけん でしょう か。",
      })
    );
    expect(resolved.enabled).toBe(true);
    expect(resolved.language).toBe("ja");
    expect(resolved.autoPlay).toBe(true);
    expect(resolved.karaokeMode).toBe("always");
    expect(resolved.hideTranscriptUntilAnswer).toBe(false);
    expect(resolved.speakText).toBe("本日はどのようなご用件でしょうか。");
  });

  it("hides announcement transcript until answer", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "delay-announcement",
        kind: "listening",
        promptJa: "車内・駅の放送を聞いてください。",
        promptEn: "Listen carefully.",
        listenText:
          "ただいま人身事故の影響で、さくら線は運転を見合わせております。",
        speech: { karaokeMode: "after-answer", announcement: true },
      })
    );
    expect(resolved.hideTranscriptUntilAnswer).toBe(true);
    expect(resolved.announcement).toBe(true);
    expect(resolved.speakText).toContain("運転を見合わせて");
    expect(resolved.displayJa).toContain("運転を見合わせて");
  });

  it("hides listening transcript even when listenText equals promptJa", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "points",
        kind: "listening",
        npcId: "sato-clerk",
        promptJa: "ポイントカードはお持ちですか？",
        listenText: "ポイントカードはお持ちですか？",
        promptEn: "Listen carefully.",
      })
    );
    expect(resolved.karaokeMode).toBe("after-answer");
    expect(resolved.hideTranscriptUntilAnswer).toBe(true);
    expect(resolved.autoPlay).toBe(true);
    expect(resolved.speakText).toBe("ポイントカードはお持ちですか？");
  });

  it("defaults reading challenges to karaoke off without autoplay", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "notice-reading",
        kind: "reading",
        npcId: "tanaka-city-hall",
        promptJa: "掲示をご確認ください。",
        promptEn: "Please check the notice.",
        bodyJa: "【お知らせ】転入届の受付時間は平日の午前9時から午後5時までです。",
      })
    );
    expect(resolved.karaokeMode).toBe("off");
    expect(resolved.autoPlay).toBe(false);
    expect(resolved.hideTranscriptUntilAnswer).toBe(false);
    expect(resolved.enabled).toBe(true);
    expect(resolved.speakText).toBe("掲示をご確認ください。");
  });

  it("keeps English intro manual by default", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "intro",
        kind: "intro",
        promptJa: "ことば町の市役所に着きました。",
        promptEn: "You arrive at Kotoba Town City Hall.",
      })
    );
    expect(resolved.language).toBe("ja");
    expect(resolved.autoPlay).toBe(false);
    expect(resolved.speakText).toBe("ことば町の市役所に着きました。");
    expect(resolved.englishText).toBe("You arrive at Kotoba Town City Hall.");
  });

  it("does not mix English into Japanese speak text", () => {
    const resolved = resolveQuestSpeech(
      step({
        id: "bag",
        kind: "dialogue",
        npcId: "sato-clerk",
        promptJa: "袋はご利用ですか？",
        promptEn: "Would you like a bag?",
      })
    );
    expect(resolved.speakText).toBe("袋はご利用ですか？");
    expect(resolved.englishText).toBe("Would you like a bag?");
  });
});
