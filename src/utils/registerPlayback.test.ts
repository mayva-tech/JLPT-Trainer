import { describe, expect, it } from "vitest";
import type { RegisterPair } from "../types/register";
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

const shape = (steps: ReturnType<typeof buildRegisterPlaySteps>) =>
  steps.map((s) => [s.part, s.lang, s.pace, s.pauseBefore]);

describe("buildRegisterPlaySteps", () => {
  it("follows the Player's Auto Mode rules and says the English once", () => {
    const steps = buildRegisterPlaySteps(pair());
    expect(shape(steps)).toEqual([
      ["casual", "ja", "normal", "none"],
      ["meaning", "en", "normal", "short"],
      ["casual", "ja", "slow", "normal"],
      ["formal", "ja", "normal", "short"],
      ["formal", "ja", "slow", "normal"],
      ["note", "nuance", "normal", "short"],
    ]);
    expect(steps.filter((s) => s.lang === "en")).toHaveLength(1);
  });

  it("keeps Japanese readings on casual/formal steps", () => {
    const steps = buildRegisterPlaySteps(pair());
    expect(steps[0]).toMatchObject({ part: "casual", reading: "だれ？" });
    expect(steps[3]).toMatchObject({ part: "formal", reading: "どちらさまですか？" });
  });

  it("skips empty meaning and empty notes", () => {
    const steps = buildRegisterPlaySteps(pair({ meaning: "  ", note: "   " }));
    expect(shape(steps)).toEqual([
      ["casual", "ja", "normal", "none"],
      ["casual", "ja", "slow", "normal"],
      ["formal", "ja", "normal", "short"],
      ["formal", "ja", "slow", "normal"],
    ]);
  });

  it("skips empty casual sides without a leading pause", () => {
    const steps = buildRegisterPlaySteps(
      pair({ casual: { text: "  ", reading: "だれ？", romaji: "Dare?" }, note: undefined })
    );
    expect(shape(steps)).toEqual([
      ["meaning", "en", "normal", "none"],
      ["formal", "ja", "normal", "short"],
      ["formal", "ja", "slow", "normal"],
    ]);
  });

  it("speaks a mixed note as one step so karaoke offsets cover the whole note", () => {
    const note = "誰 to a stranger at the door.";
    const noteSteps = buildRegisterPlaySteps(pair({ note })).filter((s) => s.part === "note");
    expect(noteSteps).toEqual([
      { part: "note", lang: "nuance", text: note, pace: "normal", pauseBefore: "short" },
    ]);
  });
});
