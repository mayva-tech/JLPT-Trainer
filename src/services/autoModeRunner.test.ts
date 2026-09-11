import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VocabularyItem } from "../types/vocabulary";
import type { AutoModeUi } from "./autoModeRunner";

class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((ev?: unknown) => void) | null = null;
  onboundary: ((ev?: unknown) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function installSpeechMock() {
  const spoken: FakeUtterance[] = [];
  const voices = [
    {
      name: "Microsoft Andrew Online",
      lang: "en-US",
      localService: false,
      default: true,
      voiceURI: "andrew",
    } as SpeechSynthesisVoice,
    {
      name: "Microsoft Nanami Online",
      lang: "ja-JP",
      localService: false,
      default: true,
      voiceURI: "nanami",
    } as SpeechSynthesisVoice,
  ];
  const synth = {
    speaking: false,
    paused: false,
    cancel: vi.fn(() => {
      synth.speaking = false;
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => voices,
    speak: vi.fn((utter: FakeUtterance) => {
      spoken.push(utter);
      synth.speaking = true;
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    value: FakeUtterance,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "speechSynthesis", {
    value: synth,
    configurable: true,
    writable: true,
  });
  return { spoken };
}

const sampleItem: VocabularyItem = {
  id: 4001,
  jlpt: "N2",
  category: "Daily Life",
  subcategory: "Shopping",
  word: "在庫",
  reading: "ざいこ",
  meaning: "stock",
  phrase: "在庫を確認",
  phraseReading: "ざいこ を かくにん",
  phraseMeaning: "check stock",
  sentence: "在庫です。",
  sentenceReading: "ざいこ です。",
  sentenceMeaning: "It is stock.",
  kanjiDetails: [],
  wordType: "noun",
  audioWord: "",
  audioPhrase: "",
  audioSentence: "",
};

function mockUi(): AutoModeUi {
  return {
    setItemIndex: vi.fn(),
    setStep: vi.fn(),
    setShowFurigana: vi.fn(),
    setSpeechRate: vi.fn(),
    setSpeechLang: vi.fn(),
    setSpeechStatus: vi.fn(),
    setHighlight: vi.fn(),
  };
}

describe("autoModeRunner abort while speaking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("returns from the awaited speak and does not continue the old sequence", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const ui = mockUi();
    const onState = vi.fn();
    const started = autoModeRunner.start([sampleItem], 0, ui, onState);

    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);
    expect(spoken.length).toBe(1);

    autoModeRunner.abort();
    await expect(started).resolves.toBe(false);

    const afterAbort = spoken.length;
    spoken[0]!.onend?.();
    spoken[0]!.onerror?.({ error: "interrupted" });
    await vi.advanceTimersByTimeAsync(8000);
    expect(spoken.length).toBe(afterAbort);
  });
});
