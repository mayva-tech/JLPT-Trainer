import { describe, expect, it, vi } from "vitest";
import {
  SPEECH_BILINGUAL_FIELD_GAP_MS,
  SPEECH_COMMA_PAUSE_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
  SPEECH_JP_EN_HANDOFF_MS,
} from "../config/speechTiming";
import { scheduleAfterLanguageHandoff } from "./jpEnHandoff";

describe("speechTiming targets", () => {
  it("uses near-natural differentiated pauses", () => {
    expect(SPEECH_EN_CHAIN_PAUSE_MS).toBe(200);
    expect(SPEECH_EN_SEMICOLON_PAUSE_MS).toBe(50);
    expect(SPEECH_COMMA_PAUSE_MS).toBe(80);
    expect(SPEECH_JA_SENTENCE_PAUSE_MS).toBe(60);
    // JA 、 adds no real silence — independent of the EN comma breath above,
    // and shorter than the JA sentence pause, matching natural JA pacing
    // (a comma is a lighter beat than a sentence end, not a longer one).
    expect(SPEECH_JA_COMMA_PAUSE_MS).toBe(0);
    expect(SPEECH_JA_COMMA_PAUSE_MS).toBeLessThan(SPEECH_JA_SENTENCE_PAUSE_MS);
    expect(SPEECH_JP_EN_HANDOFF_MS).toBe(220);
    expect(SPEECH_BILINGUAL_FIELD_GAP_MS).toBe(250);
  });
});

describe("scheduleAfterLanguageHandoff", () => {
  it("delays only on JP→EN", () => {
    vi.useFakeTimers();
    const next = vi.fn();
    scheduleAfterLanguageHandoff("ja", "en", next);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SPEECH_JP_EN_HANDOFF_MS - 1);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("continues immediately for EN→JA and same-language", () => {
    const a = vi.fn();
    const b = vi.fn();
    scheduleAfterLanguageHandoff("en", "ja", a);
    scheduleAfterLanguageHandoff("ja", "ja", b);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe("JA 。 vs 、 pause ordering", () => {
  it("never lets the comma pause exceed the sentence pause, in real silence or karaoke dwell", async () => {
    const { SPEECH_JA_COMMA_PAUSE_MS, SPEECH_JA_SENTENCE_PAUSE_MS } = await import(
      "../config/speechTiming"
    );
    const { estimateUnitDurationMs } = await import("./speechHighlightUnits");

    // Real audible silence between utterances.
    expect(SPEECH_JA_COMMA_PAUSE_MS).toBeLessThan(SPEECH_JA_SENTENCE_PAUSE_MS);

    // Karaoke visual dwell, on a case drawn from an actual reported line
    // ("ありがとうございます。では、いくつか確認しますね。" — the では、
    // held longer than the 。 before it prior to this fix).
    const sentenceDwell = estimateUnitDurationMs(
      { start: 0, end: 6, text: "ございます。", kind: "word" },
      "ja"
    );
    const commaDwell = estimateUnitDurationMs(
      { start: 0, end: 3, text: "では、", kind: "word" },
      "ja"
    );
    expect(commaDwell).toBeLessThan(sentenceDwell);
  });
});
