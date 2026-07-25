import { describe, expect, it } from "vitest";
import {
  getQuizDisplayPrompt,
  getQuizPromptLabel,
  shouldHideReadingOnAsk,
  shouldShowQuizReading,
  shouldShowQuizWordPanel,
} from "./quizPresentation";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";

const baseItem = {
  id: 4001,
  word: "確認",
  reading: "かくにん",
  meaning: "confirmation",
  phrase: "確認する",
  phraseReading: "かくにんする",
  phraseMeaning: "to confirm",
  sentence: "確認してください。",
  sentenceReading: "かくにんしてください",
  sentenceMeaning: "Please confirm.",
  audioWord: "/audio/n2/vocab/4001-word.mp3",
};

function jpToEn(): VocabularyQuizQuestion {
  return {
    type: "japanese-to-english",
    item: baseItem,
    promptText: baseItem.word,
    choices: ["confirmation", "cancel", "delay"],
    correctChoiceIndex: 0,
    choiceKind: "english",
  };
}

describe("quizPresentation", () => {
  it("labels japanese-to-english prompts", () => {
    expect(getQuizPromptLabel("japanese-to-english", false)).toContain(
      "English meaning"
    );
    expect(getQuizPromptLabel("japanese-to-english", true)).toBe(
      "English meaning"
    );
  });

  it("always shows the Japanese word panel", () => {
    expect(shouldShowQuizWordPanel(jpToEn(), false)).toBe(true);
    expect(shouldShowQuizWordPanel(jpToEn(), true)).toBe(true);
  });

  it("does not hide reading on ask for word quizzes", () => {
    expect(shouldHideReadingOnAsk(jpToEn())).toBe(false);
  });

  it("shows the Japanese word as the prompt", () => {
    expect(getQuizDisplayPrompt(jpToEn(), false)).toBe("確認");
    expect(getQuizDisplayPrompt(jpToEn(), true)).toBe("確認");
  });

  it("gates reading visibility by showReading flag", () => {
    expect(shouldShowQuizReading(jpToEn(), false, false)).toBe(false);
    expect(shouldShowQuizReading(jpToEn(), false, true)).toBe(true);
  });
});
