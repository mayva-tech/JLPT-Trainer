import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GrammarItem } from "../types/grammar";
import type { GrammarAutoModeUi } from "./grammarAutoModeRunner";

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
    { name: "Microsoft Andrew Online", lang: "en-US", localService: false, default: true, voiceURI: "andrew" },
    { name: "Microsoft Nanami Online", lang: "ja-JP", localService: false, default: true, voiceURI: "nanami" },
  ] as SpeechSynthesisVoice[];
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

const item: GrammarItem = {
  id: 5001,
  jlpt: "N2",
  courseLevel: "N2_CORE",
  familyId: "test",
  isPrimary: true,
  category: "Grammar",
  subcategory: "Test",
  pattern: "〜ものの",
  patternReading: "〜ものの",
  meaning: "although",
  nuance: "ものの sounds more written than けど.",
  formation: "V plain + ものの",
  sentence: "合格したものの、自信はない。",
  sentenceReading: "ごうかく した ものの、じしん は ない。",
  sentenceMeaning: "Although I passed, I am not confident.",
  sentenceNuance: "The second clause states the letdown.",
  audioSentence: "",
};

function mockUi(langs: (string | null)[]): GrammarAutoModeUi {
  return {
    setItemIndex: vi.fn(),
    setStep: vi.fn(),
    setShowFurigana: vi.fn(),
    setSpeechRate: vi.fn(),
    setSpeechLang: vi.fn((lang) => {
      langs.push(lang);
    }),
    setSpeechStatus: vi.fn(),
    setHighlight: vi.fn(),
  };
}

describe("grammarAutoModeRunner nuance notes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("speaks the pattern and sentence nuances after their slow passes", async () => {
    const { spoken } = installSpeechMock();
    const { grammarAutoModeRunner } = await import("./grammarAutoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const langs: (string | null)[] = [];
    const started = grammarAutoModeRunner.start([item], 0, mockUi(langs), vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    const texts: string[] = [];
    for (let n = 0; n < 12 && spoken[n]; n++) {
      const u = spoken[n]!;
      texts.push(u.text);
      u.onstart?.();
      u.onend?.();
      await vi.advanceTimersByTimeAsync(autoModeTiming.formationPause + autoModeTiming.normalPause);
    }

    // Pattern JA/EN/JA, then the note split into JA and EN runs.
    expect(texts[1]).toBe("although");
    expect(texts[3]).toBe("ものの");
    expect(texts[4]).toMatch(/^sounds more written than/);
    expect(texts).toContain("The second clause states the letdown.");
    expect(langs).toContain("nuance");

    grammarAutoModeRunner.abort();
    await started;
  });
});
