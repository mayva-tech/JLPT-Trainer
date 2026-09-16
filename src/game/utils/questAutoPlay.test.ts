import { describe, expect, it } from "vitest";
import { buildQuestAutoPlayQueue } from "./questAutoPlay";
import type { QuestStep } from "../types";
import type { ResolvedQuestSpeech } from "./questSpeech";

const baseResolved: ResolvedQuestSpeech = {
  enabled: true,
  language: "ja",
  autoPlay: true,
  karaokeMode: "always",
  announcement: false,
  displayJa: "本日はどのようなご用件でしょうか。",
  speakText: "本日はどのようなご用件でしょうか。",
  reading: null,
  hideTranscriptUntilAnswer: false,
  englishText: "How can I help you today?",
};

const step: QuestStep = {
  id: "s1",
  kind: "dialogue",
  promptJa: "本日はどのようなご用件でしょうか。",
  promptEn: "How can I help you today?",
  helpHint: "「〜たいんですが」softens a counter request.",
  choices: [
    {
      id: "a",
      labelJa: "転入届を出したいんですが。",
      labelEn: "I'd like to file a move-in notice.",
      correct: true,
    },
    {
      id: "b",
      labelJa: "転出届を出したいんですが。",
      labelEn: "I'd like to file a move-out notice.",
      correct: false,
    },
  ],
};

describe("buildQuestAutoPlayQueue", () => {
  it("speaks prompt then every multiple-choice answer", () => {
    const queue = buildQuestAutoPlayQueue({
      step,
      resolved: baseResolved,
      showHelp: false,
      revealed: false,
    });
    expect(queue.map((q) => ("text" in q ? q.text : q))).toEqual([
      "本日はどのようなご用件でしょうか。",
      "転入届を出したいんですが。",
      "転出届を出したいんですが。",
    ]);
    expect(queue.filter((q) => q.kind === "ja" && q.choiceId)).toHaveLength(2);
  });

  it("inserts English after Japanese when Help is active", () => {
    const queue = buildQuestAutoPlayQueue({
      step,
      resolved: baseResolved,
      showHelp: true,
      revealed: false,
    });
    expect(queue.map((q) => [q.kind, "text" in q ? q.text : ""])).toEqual([
      ["ja", "本日はどのようなご用件でしょうか。"],
      ["en", "How can I help you today?"],
      ["ja", "転入届を出したいんですが。"],
      ["en", "I'd like to file a move-in notice."],
      ["ja", "転出届を出したいんですが。"],
      ["en", "I'd like to file a move-out notice."],
      ["bilingual", "「〜たいんですが」softens a counter request."],
    ]);
  });

  it("skips choices after the answer is revealed", () => {
    const queue = buildQuestAutoPlayQueue({
      step,
      resolved: baseResolved,
      showHelp: true,
      revealed: true,
    });
    expect(queue.some((q) => q.kind === "ja" && q.choiceId)).toBe(false);
    expect(queue[0]).toMatchObject({ kind: "ja" });
    expect(queue.some((q) => q.kind === "en")).toBe(true);
    expect(queue.some((q) => q.kind === "bilingual")).toBe(true);
  });

  it("returns empty when autoPlay is disabled for the step", () => {
    expect(
      buildQuestAutoPlayQueue({
        step,
        resolved: { ...baseResolved, autoPlay: false },
        showHelp: true,
        revealed: false,
      })
    ).toEqual([]);
  });
});
