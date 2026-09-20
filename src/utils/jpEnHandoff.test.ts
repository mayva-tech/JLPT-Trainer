import { describe, expect, it, vi } from "vitest";
import {
  SPEECH_BILINGUAL_FIELD_GAP_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
  SPEECH_JP_EN_HANDOFF_MS,
} from "../config/speechTiming";
import { scheduleAfterLanguageHandoff } from "./jpEnHandoff";

describe("speechTiming targets", () => {
  it("uses near-natural differentiated pauses", () => {
    expect(SPEECH_EN_CHAIN_PAUSE_MS).toBe(400);
    expect(SPEECH_EN_SEMICOLON_PAUSE_MS).toBe(200);
    expect(SPEECH_JA_SENTENCE_PAUSE_MS).toBe(40);
    expect(SPEECH_JA_COMMA_PAUSE_MS).toBe(0);
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
