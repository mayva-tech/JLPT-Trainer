import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import { speechService } from "./speechService";
import { QuizAutoRunner, type QuizAutoUi } from "./quizAutoRunner";

function makeQuestion(id: number, word: string): VocabularyQuizQuestion {
  return {
    type: "japanese-to-english",
    item: {
      id,
      word,
      reading: word,
      meaning: `meaning-${id}`,
    },
    choices: [`meaning-${id}`, "other", "wrong", "nope"],
    correctChoiceIndex: 0,
    choiceKind: "english",
    promptText: word,
  };
}

function makeUi(): QuizAutoUi & { indices: number[] } {
  const indices: number[] = [];
  return {
    indices,
    setQuizIndex: (index) => {
      indices.push(index);
    },
    setSelectedChoiceIndex: vi.fn(),
    setPhase: vi.fn(),
    setShowReading: vi.fn(),
    setShowFurigana: vi.fn(),
    setSpeechRate: vi.fn(),
    setSpeechLang: vi.fn(),
    setSpeechStatus: vi.fn(),
    setJaHighlight: vi.fn(),
    setEnHighlight: vi.fn(),
  };
}

describe("QuizAutoRunner.start startAt", () => {
  beforeEach(() => {
    vi.spyOn(speechService, "speakJapanese").mockImplementation((_text, cbs) => {
      queueMicrotask(() => cbs?.onEnd?.());
    });
    vi.spyOn(speechService, "speakEnglish").mockImplementation((_text, cbs) => {
      queueMicrotask(() => cbs?.onEnd?.());
    });
    vi.spyOn(speechService, "stop").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("begins the loop at startAt instead of question 0", async () => {
    const runner = new QuizAutoRunner();
    const ui = makeUi();
    const deck = [
      makeQuestion(1, "一"),
      makeQuestion(2, "二"),
      makeQuestion(3, "三"),
      makeQuestion(4, "四"),
    ];

    const started = runner.start(deck, ui, () => {}, 2);
    // First prompt finishes → waitForAnswer; stop before answering.
    await vi.waitFor(() => {
      expect(ui.indices[0]).toBe(2);
    });
    runner.abort();
    await started;

    expect(ui.indices.every((i) => i >= 2)).toBe(true);
    expect(ui.indices.includes(0)).toBe(false);
    expect(ui.indices.includes(1)).toBe(false);
  });
});
