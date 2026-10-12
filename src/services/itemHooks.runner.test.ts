import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Utterances end at once (a microtask); only the runners' own waits take time. */
const spoken: { lang: string; text: string }[] = [];
vi.mock("./speechService", async (orig) => {
  const real = await orig<typeof import("./speechService")>();
  const speak =
    (lang: string) =>
    (text: string, cb?: { onStart?: () => void; onEnd?: () => void }) => {
      spoken.push({ lang, text });
      queueMicrotask(() => {
        cb?.onStart?.();
        cb?.onEnd?.();
      });
    };
  return { ...real, speechService: { ...real.speechService, speakJapanese: speak("ja"), speakEnglish: speak("en"), stop: vi.fn() } };
});

import { grammar } from "../data/grammar";
import { vocabulary } from "../data/vocabulary";
import { buildVocabularyQuizQuestions } from "../utils/vocabularyQuiz";
import { grammarHook, hookSpeech, quizHook, vocabHook, type HookKind, type ItemHook, type ItemHookState } from "../utils/itemHooks";
import { AutoModeRunner } from "./autoModeRunner";
import { GrammarAutoModeRunner } from "./grammarAutoModeRunner";
import { QuizAutoRunner } from "./quizAutoRunner";

const noop = () => {};
const words = vocabulary.slice(0, 3);
const patterns = grammar.slice(0, 2);

function hookSource<T>(list: readonly T[], make: (k: HookKind, it: T, c: { index: number; total: number; prevId: string | null }) => ItemHook, on = { intro: true, outro: true }) {
  return (kind: HookKind, index: number, prevId: string | null) =>
    (kind === "intro" ? on.intro : on.outro) ? make(kind, list[index]!, { index, total: list.length, prevId }) : null;
}

async function drain(p: Promise<unknown>) {
  for (let i = 0; i < 4000; i++) {
    await vi.advanceTimersByTimeAsync(250);
    let done = false;
    void p.then(() => (done = true));
    await Promise.resolve();
    if (done) break;
  }
  await p;
}

beforeEach(() => {
  vi.useFakeTimers();
  spoken.length = 0;
});
afterEach(() => vi.useRealTimers());

describe("vocabulary Auto Mode with item hooks", () => {
  it("intro line before each word, outro after it; the read hook stops repeating the first line", async () => {
    const cards: (ItemHookState | null)[] = [];
    const runner = new AutoModeRunner();
    const run = runner.start(
      words,
      0,
      {
        setItemIndex: noop,
        setStep: noop,
        setShowFurigana: noop,
        setSpeechRate: noop,
        setSpeechLang: noop,
        setSpeechStatus: noop,
        setHighlight: noop,
        getRetention: () => ({ hook: true, check: false }),
        setReadHook: noop,
        getItemHook: hookSource(words, vocabHook),
        setItemHook: (s) => cards.push(s),
      },
      noop,
    );
    await drain(run);

    const texts = spoken.map((s) => s.text);
    const expected = (i: number, kind: HookKind) => hookSpeech(cards.filter(Boolean).map((c) => c!.hook)[i * 2 + (kind === "intro" ? 0 : 1)]!).text;
    // Hook cards come in intro/outro pairs, one pair per word, and are cleared.
    expect(cards.filter(Boolean).map((c) => c!.hook.kind)).toEqual(["intro", "outro", "intro", "outro", "intro", "outro"]);
    expect(cards.at(-1)).toBeNull();
    // The first word: intro line, then the word itself.
    const introAt = texts.indexOf(expected(0, "intro"));
    expect(introAt).toBeGreaterThanOrEqual(0);
    expect(texts.indexOf(words[0]!.word, introAt)).toBeGreaterThan(introAt);
    // The outro comes after the word's last line and before the next intro.
    const outroAt = texts.indexOf(expected(0, "outro"));
    expect(outroAt).toBeGreaterThan(texts.indexOf(words[0]!.sentence));
    expect(outroAt).toBeLessThan(texts.indexOf(expected(1, "intro"), outroAt));
    // "Can you read this?" is not said on top of an intro line.
    expect(texts).not.toContain("Can you read this?");
  });

  it("hooks off: exactly the old sequence (the read hook speaks its line once)", async () => {
    const runner = new AutoModeRunner();
    const cards: unknown[] = [];
    await drain(
      runner.start(
        words,
        0,
        {
          setItemIndex: noop,
          setStep: noop,
          setShowFurigana: noop,
          setSpeechRate: noop,
          setSpeechLang: noop,
          setSpeechStatus: noop,
          setHighlight: noop,
          getRetention: () => ({ hook: true, check: false }),
          setReadHook: noop,
          getItemHook: hookSource(words, vocabHook, { intro: false, outro: false }),
          setItemHook: (s) => s && cards.push(s),
        },
        noop,
      ),
    );
    expect(cards).toHaveLength(0);
    expect(spoken.filter((s) => s.text === "Can you read this?")).toHaveLength(1);
  });
});

describe("grammar Auto Mode with item hooks", () => {
  it("intro before the pattern, outro after the review", async () => {
    const cards: ItemHookState[] = [];
    const runner = new GrammarAutoModeRunner();
    await drain(
      runner.start(
        patterns,
        0,
        {
          setItemIndex: noop,
          setStep: noop,
          setShowFurigana: noop,
          setSpeechRate: noop,
          setSpeechLang: noop,
          setSpeechStatus: noop,
          setHighlight: noop,
          getItemHook: hookSource(patterns, grammarHook),
          setItemHook: (s) => s && cards.push(s),
        },
        noop,
      ),
    );
    const texts = spoken.map((s) => s.text);
    expect(cards.map((c) => c.hook.kind)).toEqual(["intro", "outro", "intro", "outro"]);
    const intro0 = texts.indexOf(hookSpeech(cards[0]!.hook).text);
    expect(texts.indexOf(patterns[0]!.pattern, intro0)).toBeGreaterThan(intro0);
    const outro0 = texts.indexOf(hookSpeech(cards[1]!.hook).text);
    expect(outro0).toBeGreaterThan(texts.indexOf(patterns[0]!.sentence));
  });
});

describe("Quiz Auto with item hooks", () => {
  it("intro before each question is asked, outro after the answer", async () => {
    const deck = buildVocabularyQuizQuestions(words, "hooks-test");
    const cards: ItemHookState[] = [];
    const runner = new QuizAutoRunner();
    await drain(
      runner.start(
        deck,
        {
          setQuizIndex: noop,
          setSelectedChoiceIndex: noop,
          setPhase: noop,
          setShowReading: noop,
          setShowFurigana: noop,
          setSpeechRate: noop,
          setSpeechLang: noop,
          setSpeechStatus: noop,
          setJaHighlight: noop,
          setEnHighlight: noop,
          getItemHook: hookSource(deck, quizHook),
          setItemHook: (s) => s && cards.push(s),
        },
        noop,
      ),
    );
    expect(cards.map((c) => c.hook.id)).toEqual(expect.arrayContaining(["q-first", "q-last"]));
    expect(cards.filter((c) => c.hook.kind === "intro")).toHaveLength(deck.length);
    const texts = spoken.map((s) => s.text);
    const intro0 = texts.indexOf(hookSpeech(cards[0]!.hook).text);
    expect(texts.indexOf(deck[0]!.promptText, intro0)).toBeGreaterThan(intro0);
    expect(spoken.at(-1)!.text).toBe(hookSpeech(cards.at(-1)!.hook).text);
  });
});
