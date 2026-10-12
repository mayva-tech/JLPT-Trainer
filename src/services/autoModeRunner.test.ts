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

  it("locks every Auto Mode pass at 1.25× while fast is preferred", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");
    const { SPEECH_RATE_FAST } = await import("./speechService");

    const rates: number[] = [];
    const ui = mockUi();
    ui.getPreferredSpeechRate = () => SPEECH_RATE_FAST;
    ui.setSpeechRate = vi.fn((rate: number) => {
      rates.push(rate);
    });

    const started = autoModeRunner.start([sampleItem], 0, ui, vi.fn());

    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);
    // Finish first JA (normal pass) + EN + JA (slow pass) of the word section
    for (let n = 0; n < 3; n++) {
      const u = spoken[n];
      expect(u).toBeTruthy();
      u!.onstart?.();
      u!.onend?.();
      await vi.advanceTimersByTimeAsync(autoModeTiming.normalPause);
    }

    autoModeRunner.abort();
    await started;

    expect(rates.length).toBeGreaterThanOrEqual(3);
    expect(rates.every((r) => r === SPEECH_RATE_FAST)).toBe(true);
    expect(spoken.slice(0, 3).every((u) => u.rate === SPEECH_RATE_FAST)).toBe(
      true
    );
  });

  it("speaks the phrase nuance after the phrase, only when one exists", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const langs: (string | null)[] = [];
    const ui = mockUi();
    ui.setSpeechLang = vi.fn((lang) => {
      langs.push(lang);
    });
    const item: VocabularyItem = {
      ...sampleItem,
      phraseNuance: "確認 is the everyday word for checking.",
    };
    const started = autoModeRunner.start([item], 0, ui, vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    // Word JA/EN/JA, then phrase JA/EN/JA, then the two nuance runs.
    for (let n = 0; n < 8; n++) {
      const u = spoken[n];
      expect(u, `utterance ${n}`).toBeTruthy();
      u!.onstart?.();
      u!.onend?.();
      await vi.advanceTimersByTimeAsync(autoModeTiming.normalPause);
    }

    expect(spoken[6]!.text).toBe("確認");
    expect(spoken[7]!.text).toMatch(/is the everyday word for checking/);
    expect(langs).toContain("nuance");

    autoModeRunner.abort();
    await started;
  });

  it("speaks word and sentence nuances after their own sections", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const item: VocabularyItem = {
      ...sampleItem,
      wordNuance: "Stock is a business word.",
      sentenceNuance: "The sentence is plain and polite.",
    };
    const started = autoModeRunner.start([item], 0, mockUi(), vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    const texts: string[] = [];
    for (let n = 0; n < 14 && spoken[n]; n++) {
      const u = spoken[n]!;
      texts.push(u.text);
      u.onstart?.();
      u.onend?.();
      await vi.advanceTimersByTimeAsync(autoModeTiming.normalPause * 3);
    }

    // JA is spoken from the reading; word note after the word, sentence note after the slow sentence.
    expect(texts[3]).toBe("Stock is a business word.");
    expect(texts[5]).toBe("check stock");
    expect(texts[9]).toBe("ざいこ です。");
    expect(texts[10]).toBe("The sentence is plain and polite.");

    autoModeRunner.abort();
    await started;
  });

  it("shows the meaning only when Andrew reads it, after the Japanese", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const shownAt: (boolean | number)[] = [];
    const ui = mockUi();
    ui.setMeaningShown = vi.fn((shown: boolean) => {
      shownAt.push(shown, spoken.length);
    });
    const started = autoModeRunner.start([sampleItem], 0, ui, vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    // Hidden while Nanami says the word.
    expect(spoken[0]!.text).toBe("ざいこ");
    expect(ui.setMeaningShown).toHaveBeenLastCalledWith(false);
    spoken[0]!.onstart?.();
    spoken[0]!.onend?.();
    await vi.advanceTimersByTimeAsync(autoModeTiming.shortPause);

    // Shown just before the English is spoken.
    expect(ui.setMeaningShown).toHaveBeenLastCalledWith(true);
    expect(shownAt.slice(-2)).toEqual([true, 1]);
    expect(spoken[1]!.text).toBe("stock");

    autoModeRunner.abort();
    await started;
  });

  it("shows the nuance only after the slow pass with furigana", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const shownAt: [boolean, number][] = [];
    const ui = mockUi();
    ui.setNuanceShown = vi.fn((shown: boolean) => {
      shownAt.push([shown, spoken.length]);
    });
    const started = autoModeRunner.start([sampleItem], 0, ui, vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    const finish = async (index: number, pause: number) => {
      spoken[index]!.onstart?.();
      spoken[index]!.onend?.();
      await vi.advanceTimersByTimeAsync(pause);
    };
    await finish(0, autoModeTiming.shortPause);
    await finish(1, autoModeTiming.normalPause);
    expect(spoken[2]!.text).toBe("ざいこ");
    expect(ui.setNuanceShown).toHaveBeenLastCalledWith(false);

    await finish(2, 0);
    expect(shownAt.at(-1)).toEqual([true, 3]);

    autoModeRunner.abort();
    await started;
  });

  it("fades the finished item out before the next one comes in", async () => {
    const { spoken } = installSpeechMock();
    const { autoModeRunner } = await import("./autoModeRunner");
    const { autoModeTiming } = await import("../config/autoModeTiming");

    const events: string[] = [];
    const ui = mockUi();
    ui.setItemLeaving = vi.fn((leaving: boolean) => {
      events.push(leaving ? "out" : "in");
    });
    ui.setItemIndex = vi.fn((i: number) => {
      events.push(`item ${i}`);
    });
    const second = { ...sampleItem, id: 4002 };
    const started = autoModeRunner.start([sampleItem, second], 0, ui, vi.fn());
    await vi.advanceTimersByTimeAsync(autoModeTiming.categoryPause);

    let next = 0;
    for (let tick = 0; tick < 200 && !events.includes("item 1"); tick++) {
      const u = spoken[next];
      if (u) {
        next += 1;
        u.onstart?.();
        u.onend?.();
      }
      await vi.advanceTimersByTimeAsync(autoModeTiming.normalPause);
    }

    const out = events.lastIndexOf("out");
    expect(out).toBeGreaterThan(-1);
    expect(events.indexOf("item 1")).toBeGreaterThan(out);
    expect(events.slice(events.indexOf("item 1"))).toContain("in");

    autoModeRunner.abort();
    await started;
  });
});
