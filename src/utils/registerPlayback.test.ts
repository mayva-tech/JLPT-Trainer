import { describe, expect, it } from "vitest";
import type { RegisterPair } from "../types/register";
import { splitNuanceForSpeech } from "./nuanceSpeech";
import { buildRegisterPlaySteps } from "./registerPlayback";

function pair(overrides: Partial<RegisterPair> = {}): RegisterPair {
  return {
    id: 1,
    category: "test",
    meaning: "Who are you?",
    casual: { text: "誰？", reading: "だれ？", romaji: "Dare?" },
    formal: {
      text: "どちら様ですか？",
      reading: "どちらさまですか？",
      romaji: "Dochira sama desu ka?",
    },
    note: "Safe default at work.",
    ...overrides,
  };
}

describe("buildRegisterPlaySteps", () => {
  it("follows the existing Play order: casual JP+EN, casual JP, formal JP+EN, formal JP, then notes", () => {
    const steps = buildRegisterPlaySteps(pair());
    expect(steps.map((step) => [step.part, step.lang, step.text])).toEqual([
      ["casual", "ja", "誰？"],
      ["meaning", "en", "Who are you?"],
      ["casual", "ja", "誰？"],
      ["formal", "ja", "どちら様ですか？"],
      ["meaning", "en", "Who are you?"],
      ["formal", "ja", "どちら様ですか？"],
      ["note", "en", "Safe default at work."],
    ]);
    expect(steps.filter((step) => step.lang === "ja").every((step) => step.lang === "ja")).toBe(
      true
    );
    expect(steps.find((step) => step.part === "meaning")?.lang).toBe("en");
  });

  it("keeps Japanese readings on casual/formal steps", () => {
    const steps = buildRegisterPlaySteps(pair());
    expect(steps[0]).toMatchObject({
      part: "casual",
      lang: "ja",
      reading: "だれ？",
    });
    expect(steps[3]).toMatchObject({
      part: "formal",
      lang: "ja",
      reading: "どちらさまですか？",
    });
  });

  it("skips empty meaning and empty notes", () => {
    const steps = buildRegisterPlaySteps(
      pair({ meaning: "  ", note: "   " })
    );
    expect(steps.map((step) => [step.part, step.lang, step.text])).toEqual([
      ["casual", "ja", "誰？"],
      ["casual", "ja", "誰？"],
      ["formal", "ja", "どちら様ですか？"],
      ["formal", "ja", "どちら様ですか？"],
    ]);
  });

  it("skips empty casual or formal sides", () => {
    const steps = buildRegisterPlaySteps(
      pair({
        casual: { text: "  ", reading: "だれ？", romaji: "Dare?" },
        note: undefined,
      })
    );
    expect(steps.map((step) => step.part)).toEqual([
      "meaning",
      "formal",
      "meaning",
      "formal",
    ]);
  });

  it("splits mixed notes with the existing nuance helper", () => {
    const note = "誰 to a stranger at the door.";
    const steps = buildRegisterPlaySteps(pair({ note }));
    const noteSteps = steps.filter((step) => step.part === "note");
    expect(noteSteps).toEqual(
      splitNuanceForSpeech(note).map((segment) => ({
        part: "note" as const,
        lang: segment.lang,
        text: segment.text.trim(),
      }))
    );
    expect(noteSteps.some((step) => step.lang === "ja")).toBe(true);
    expect(noteSteps.some((step) => step.lang === "en")).toBe(true);
  });

  it("is deterministic for the same pair", () => {
    const source = pair();
    expect(buildRegisterPlaySteps(source)).toEqual(
      buildRegisterPlaySteps(source)
    );
  });
});
