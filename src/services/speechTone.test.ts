import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OPENING_GAP_MS,
  TONE_PROSODY,
  __resetSpeechTone,
  callTone,
  inferTone,
  isTalkOpening,
  markSpeechActivity,
  prosodyFor,
  segmentTone,
  setLivelyVoices,
} from "./speechTone";
import { SPEECH_RATE_FAST, SPEECH_RATE_NORMAL, SPEECH_RATE_SLOW, speechService } from "./speechService";
import { setNextSpeechTone } from "./speechTone";

beforeEach(() => {
  localStorage.clear();
  __resetSpeechTone();
});

describe("lively voices: choosing a tone", () => {
  it("English punctuation: ? rises, ! is bright; Japanese is never guessed", () => {
    expect(inferTone("Can you read this?", "en")).toBe("question");
    expect(inferTone('Most learners misread this!"', "en")).toBe("excited");
    expect(inferTone("Last month, a nephew was born.", "en")).toBe("neutral");
    expect(inferTone("読めますか？", "ja")).toBe("neutral");
    expect(inferTone("すごい！", "ja")).toBe("neutral");
  });

  it("an English line after a silence opens the talk; only its first segment is lifted", () => {
    expect(isTalkOpening()).toBe(true);
    expect(callTone(null, "en")).toBe("opening");
    expect(callTone(null, "ja")).toBeNull();
    markSpeechActivity(Date.now());
    expect(callTone(null, "en")).toBeNull();
    expect(isTalkOpening(Date.now() + OPENING_GAP_MS + 1)).toBe(true);
    expect(segmentTone("opening", 0, "Welcome back.", "en")).toBe("opening");
    expect(segmentTone("opening", 1, "Ready?", "en")).toBe("question");
    expect(segmentTone("outro", 1, "See you!", "en")).toBe("outro");
  });
});

describe("lively voices: prosody", () => {
  it("lifts speed only at the normal pace, never past the cap; pitch carries the tone", () => {
    const open = prosodyFor("opening", SPEECH_RATE_NORMAL);
    expect(open.rate).toBeCloseTo(SPEECH_RATE_NORMAL * TONE_PROSODY.opening.rate);
    expect(open.rate).toBeLessThanOrEqual(0.95);
    expect(open.pitch).toBeGreaterThan(1);
    // Slow and fast learners keep their pace; only pitch changes.
    expect(prosodyFor("opening", SPEECH_RATE_SLOW).rate).toBe(SPEECH_RATE_SLOW);
    expect(prosodyFor("opening", SPEECH_RATE_FAST).rate).toBe(SPEECH_RATE_FAST);
    // Calm tones never slow the voice (karaoke assumes normal is the floor).
    expect(prosodyFor("explain", SPEECH_RATE_NORMAL)).toEqual({ rate: SPEECH_RATE_NORMAL, pitch: TONE_PROSODY.explain.pitch });
    expect(prosodyFor("outro", SPEECH_RATE_NORMAL).pitch).toBeLessThan(1);
    expect(prosodyFor("neutral", SPEECH_RATE_NORMAL)).toEqual({ rate: SPEECH_RATE_NORMAL, pitch: 1 });
  });

  it("switched off: every line plain, and remembered", () => {
    setLivelyVoices(false);
    expect(prosodyFor("opening", SPEECH_RATE_NORMAL)).toEqual({ rate: SPEECH_RATE_NORMAL, pitch: 1 });
    expect(localStorage.getItem("jlpt-trainer:lively-voices:v1")).toBe("off");
  });
});

/* ── Through the speech service ─────────────────────────────────── */

class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((ev?: unknown) => void) | null = null;
  onboundary: unknown = null;
  constructor(text: string) {
    this.text = text;
  }
}

let spoken: FakeUtterance[];
beforeEach(() => {
  vi.useFakeTimers();
  spoken = [];
  const voices = [
    { name: "Microsoft Andrew Online", lang: "en-US", localService: false, default: true, voiceURI: "a" },
    { name: "Microsoft Nanami Online", lang: "ja-JP", localService: false, default: true, voiceURI: "n" },
  ];
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { value: FakeUtterance, configurable: true, writable: true });
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speaking: false,
      pending: false,
      cancel() {},
      pause() {},
      resume() {},
      getVoices: () => voices,
      speak: (u: FakeUtterance) => spoken.push(u),
      addEventListener() {},
      removeEventListener() {},
    },
    configurable: true,
    writable: true,
  });
});
afterEach(() => {
  speechService.stop();
  vi.useRealTimers();
});

function finish(u: FakeUtterance) {
  u.onstart?.();
  u.onend?.();
}

describe("lively voices in the speech service", () => {
  it("opening line bright and quicker; the next line plain; a question rises", () => {
    speechService.speakEnglish("Welcome to today's lesson.", undefined, SPEECH_RATE_NORMAL);
    expect(spoken[0]!.pitch).toBe(TONE_PROSODY.opening.pitch);
    expect(spoken[0]!.rate).toBeGreaterThan(SPEECH_RATE_NORMAL);
    finish(spoken[0]!);
    speechService.speakEnglish("Here is the first word.", undefined, SPEECH_RATE_NORMAL);
    expect(spoken[1]!.pitch).toBe(1);
    expect(spoken[1]!.rate).toBe(SPEECH_RATE_NORMAL);
    finish(spoken[1]!);
    speechService.speakEnglish("Can you read this?", undefined, SPEECH_RATE_NORMAL);
    expect(spoken[2]!.pitch).toBe(TONE_PROSODY.question.pitch);
  });

  it("Japanese learning lines stay plain; a hook line asked for by a runner is bright", () => {
    markSpeechActivity();
    speechService.speakJapanese("駅の前に人が集まっています。", undefined, SPEECH_RATE_NORMAL);
    expect(spoken.at(-1)!.pitch).toBe(1);
    expect(spoken.at(-1)!.rate).toBe(SPEECH_RATE_NORMAL);
    finish(spoken.at(-1)!);
    setNextSpeechTone("excited");
    speechService.speakJapanese("この言葉、知ってる？", undefined, SPEECH_RATE_NORMAL);
    expect(spoken.at(-1)!.pitch).toBe(TONE_PROSODY.excited.pitch);
    finish(spoken.at(-1)!);
    // One-shot: the next line is plain again.
    speechService.speakJapanese("知っています。", undefined, SPEECH_RATE_NORMAL);
    expect(spoken.at(-1)!.pitch).toBe(1);
  });

  it("an explicit tone wins; switched off, nothing changes", () => {
    markSpeechActivity();
    speechService.speakEnglish("Tell me in the comments!", undefined, SPEECH_RATE_NORMAL, { tone: "outro" });
    expect(spoken.at(-1)!.pitch).toBe(TONE_PROSODY.outro.pitch);
    finish(spoken.at(-1)!);
    setLivelyVoices(false);
    __resetSpeechTone();
    setLivelyVoices(false);
    speechService.speakEnglish("Welcome back!", undefined, SPEECH_RATE_NORMAL);
    expect(spoken.at(-1)!.pitch).toBe(1);
    expect(spoken.at(-1)!.rate).toBe(SPEECH_RATE_NORMAL);
  });
});
