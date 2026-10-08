import { act, createElement, type FC } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VocabularyItem } from "../../types/vocabulary";
import { vocabulary } from "../../data/vocabulary";
import { playlistLessons } from "../../data/playlists";
import type { AutoModeUi } from "../../services/autoModeRunner";
import {
  buildCheckCard,
  checkQuestion,
  checkpointIndices,
  firstSense,
} from "./retentionQuiz";
import { PauseAnswerCard } from "./PauseAnswerCard";
import { ReadHook, ReadHookBanner } from "./ReadHook";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const base: VocabularyItem = { ...vocabulary[0]! };
function word(id: number, w: string, reading: string, meaning: string): VocabularyItem {
  return { ...base, id, word: w, reading, meaning, sentence: `${w}です。`, sentenceReading: `${reading} です 。` };
}
const lesson: VocabularyItem[] = [
  word(1, "天気", "てんき", "weather"),
  word(2, "雨", "あめ", "rain"),
  word(3, "雪", "ゆき", "snow"),
  word(4, "風", "かぜ", "wind"),
  word(5, "空", "そら", "sky; the air"),
];

/* ── Checkpoints ────────────────────────────────────────────────── */

describe("checkpointIndices", () => {
  it("places a checkpoint after every 5 words", () => {
    expect(checkpointIndices(10)).toEqual([4, 9]);
    expect(checkpointIndices(5)).toEqual([4]);
  });

  it("gives a 3–4 word tail its own checkpoint, but not 1–2 words", () => {
    expect(checkpointIndices(13)).toEqual([4, 9, 12]);
    expect(checkpointIndices(12)).toEqual([4, 9]);
    expect(checkpointIndices(2)).toEqual([]);
  });
});

/* ── Questions ──────────────────────────────────────────────────── */

describe("buildCheckCard", () => {
  it("asks about a word from the window, with three distinct options and one correct", () => {
    const card = buildCheckCard(lesson, lesson, 1)!;
    expect(lesson.map((w) => w.id)).toContain(card.item.id);
    expect(card.options).toHaveLength(3);
    expect(card.options.map((o) => o.label)).toEqual(["A", "B", "C"]);
    expect(card.options.filter((o) => o.correct)).toHaveLength(1);
    expect(new Set(card.options.map((o) => o.text)).size).toBe(3);
  });

  it("odd checkpoints ask the meaning, even ones the reading", () => {
    const meaning = buildCheckCard(lesson, lesson, 1)!;
    expect(meaning.kind).toBe("meaning");
    expect(meaning.options.find((o) => o.correct)!.text).toBe(firstSense(meaning.item.meaning));
    const reading = buildCheckCard(lesson, lesson, 2)!;
    expect(reading.kind).toBe("reading");
    expect(reading.options.find((o) => o.correct)!.text).toBe(reading.item.reading);
    expect(checkQuestion(reading)).toMatch(/read/);
  });

  it("asks the meaning of kana-only words even on a reading checkpoint", () => {
    const kana = [word(11, "あなた", "あなた", "you"), word(12, "これ", "これ", "this"), word(13, "それ", "それ", "that")];
    expect(buildCheckCard(kana, kana, 2)!.kind).toBe("meaning");
  });

  it("is the same every time for the same lesson (re-recordings match)", () => {
    expect(buildCheckCard(lesson, lesson, 1)).toEqual(buildCheckCard(lesson, lesson, 1));
  });

  it("uses the first sense only", () => {
    expect(firstSense("sky; the air")).toBe("sky");
  });

  it("returns null when there are not enough different answers", () => {
    expect(buildCheckCard([lesson[0]!], [lesson[0]!], 1)).toBeNull();
  });

  it("works for every checkpoint of every real lesson", () => {
    const byId = new Map(vocabulary.map((v) => [v.id, v]));
    let built = 0;
    for (const l of playlistLessons) {
      const items = l.vocabularyIds.map((id) => byId.get(id)).filter((v): v is VocabularyItem => !!v);
      const cps = checkpointIndices(items.length);
      cps.forEach((cp, n) => {
        const start = n > 0 ? cps[n - 1]! + 1 : 0;
        const card = buildCheckCard(items.slice(start, cp + 1), items, n + 1);
        expect(card, `${l.id} checkpoint ${n + 1}`).not.toBeNull();
        const answers = card!.options.map((o) => o.text.toLowerCase());
        expect(new Set(answers).size).toBe(3);
        built++;
      });
    }
    expect(built).toBeGreaterThan(100);
  });
});

/* ── Components ─────────────────────────────────────────────────── */

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("<ReadHook />", () => {
  it("marks the card while active and leaves it untouched otherwise", () => {
    act(() => root.render(createElement(ReadHook as FC<{ active: boolean }>, { active: true }, "card")));
    expect(host.querySelector(".ret-hook--on")?.textContent).toBe("card");
    act(() => root.render(createElement(ReadHook as FC<{ active: boolean }>, { active: false }, "card")));
    expect(host.querySelector(".ret-hook--on")).toBeNull();
    expect(host.textContent).toBe("card");
  });

  it("banner: the line first, the ring once a countdown is set", () => {
    act(() => root.render(createElement(ReadHookBanner, { ms: 0, runKey: 1 })));
    expect(host.textContent).toContain("Can you read this?");
    expect(host.querySelector(".ret-ring")).toBeNull();
    act(() => root.render(createElement(ReadHookBanner, { ms: 2500, runKey: 2 })));
    expect((host.querySelector(".ret-ring") as HTMLElement).style.animationDuration).toBe("2500ms");
  });
});

describe("<PauseAnswerCard />", () => {
  const card = buildCheckCard(lesson, lesson, 1)!;

  it("asks: question, word and three options, no answer yet", () => {
    act(() => root.render(createElement(PauseAnswerCard, { card, phase: "ask", thinkMs: 5000 })));
    expect(host.textContent).toContain("Pause & answer");
    expect(host.textContent).toContain(checkQuestion(card));
    expect(host.querySelectorAll(".ret-option")).toHaveLength(3);
    expect(host.querySelector(".ret-option--correct")).toBeNull();
    expect(host.querySelector(".ret-ring")).toBeNull();
  });

  it("thinks: countdown ring", () => {
    act(() => root.render(createElement(PauseAnswerCard, { card, phase: "think", thinkMs: 5000 })));
    expect(host.querySelector(".ret-ring")).not.toBeNull();
    expect(host.textContent).toContain("Pause the video");
  });

  it("reveals: the correct option lit, the others dimmed, the full answer shown", () => {
    act(() => root.render(createElement(PauseAnswerCard, { card, phase: "reveal", thinkMs: 5000 })));
    const correct = host.querySelector(".ret-option--correct");
    expect(correct?.textContent).toContain(firstSense(card.item.meaning));
    expect(host.querySelectorAll(".ret-option--wrong")).toHaveLength(2);
    expect(host.querySelector(".ret-check-answer")?.textContent).toContain(card.item.reading);
  });
});

/* ── Auto Mode integration ──────────────────────────────────────── */

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

function installSpeech() {
  const spoken: FakeUtterance[] = [];
  const voices = [
    { name: "Microsoft Andrew Online", lang: "en-US", localService: false, default: true, voiceURI: "a" },
    { name: "Microsoft Nanami Online", lang: "ja-JP", localService: false, default: true, voiceURI: "n" },
  ] as SpeechSynthesisVoice[];
  const synth = {
    speaking: false,
    paused: false,
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => voices,
    speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { value: FakeUtterance, configurable: true, writable: true });
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true, writable: true });
  return spoken;
}

function mockUi(retention: { hook: boolean; check: boolean }) {
  const log: string[] = [];
  const ui: AutoModeUi = {
    setItemIndex: vi.fn(),
    setStep: vi.fn(),
    setShowFurigana: vi.fn(),
    setSpeechRate: vi.fn(),
    setSpeechLang: vi.fn(),
    setSpeechStatus: vi.fn(),
    setHighlight: vi.fn(),
    getRetention: () => retention,
    setReadHook: vi.fn((s) => log.push(s ? `hook:${s.ms}` : "hook:off")),
    setCheck: vi.fn((card, phase) => log.push(card ? `check:${phase}` : "check:off")),
  };
  return { ui, log };
}

/** Plays a whole lesson: ends each utterance as it starts, advances time. */
async function runLesson(spoken: FakeUtterance[], done: () => boolean) {
  let ended = 0;
  for (let guard = 0; guard < 2000 && !done(); guard++) {
    while (ended < spoken.length) {
      const u = spoken[ended++]!;
      u.onstart?.();
      u.onend?.();
    }
    await vi.advanceTimersByTimeAsync(250);
  }
}

describe("Auto Mode with retention", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("hooks every word, says the line once, and quizzes after word 5", async () => {
    const spoken = installSpeech();
    const { autoModeRunner } = await import("../../services/autoModeRunner");
    const { ui, log } = mockUi({ hook: true, check: true });
    let finished = false;
    const run = autoModeRunner.start(lesson, 0, ui, vi.fn()).then((ok) => {
      finished = true;
      return ok;
    });
    await runLesson(spoken, () => finished);
    await expect(run).resolves.toBe(true);

    const texts = spoken.map((u) => u.text);
    expect(texts.filter((t) => t === "Can you read this?")).toHaveLength(1);
    // The speech service speaks English sentence by sentence, without the "!".
    expect(texts.filter((t) => /^Pause and answer/.test(t))).toHaveLength(1);
    expect(log.filter((l) => l === "hook:2500")).toHaveLength(5);
    expect(log.filter((l) => l === "hook:0")).toHaveLength(1);
    const checks = log.filter((l) => l.startsWith("check:"));
    expect(checks.slice(0, 4)).toEqual(["check:ask", "check:think", "check:reveal", "check:off"]);
    // The hook comes before each word is first spoken.
    expect(texts.indexOf("Can you read this?")).toBeLessThan(texts.indexOf(lesson[0]!.reading));
    expect(texts.indexOf(lesson[0]!.reading)).toBeGreaterThan(-1);
  });

  it("plays the plain lesson when both are off", async () => {
    const spoken = installSpeech();
    const { autoModeRunner } = await import("../../services/autoModeRunner");
    const { ui, log } = mockUi({ hook: false, check: false });
    let finished = false;
    const run = autoModeRunner.start(lesson, 0, ui, vi.fn()).then(() => (finished = true));
    await runLesson(spoken, () => finished);
    await run;
    expect(spoken.some((u) => u.text === "Can you read this?" || u.text.startsWith("Pause"))).toBe(false);
    expect(log.filter((l) => !l.endsWith(":off"))).toEqual([]);
  });

  it("stopping mid-question clears the card", async () => {
    const spoken = installSpeech();
    const { autoModeRunner } = await import("../../services/autoModeRunner");
    const { ui, log } = mockUi({ hook: true, check: true });
    const run = autoModeRunner.start(lesson, 0, ui, vi.fn());
    await runLesson(spoken, () => log.includes("check:think"));
    autoModeRunner.abort();
    await run;
    expect(log[log.length - 1]).toMatch(/:off$/);
    expect(ui.setCheck).toHaveBeenLastCalledWith(null);
  });
});
