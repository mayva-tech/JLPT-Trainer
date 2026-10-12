import type { RegisterPair } from "../types/register";
import type { RegisterPlayPart } from "../components/RegisterSplitCard";

export type RegisterPlayStep = {
  part: RegisterPlayPart;
  /** "nuance": the whole mixed JA/EN note, spoken run by run. */
  lang: "ja" | "en" | "nuance";
  text: string;
  reading?: string;
  /** Scripted rate, like the Player's Auto Mode passes. */
  pace: "normal" | "slow";
  /** Pause before this step (autoModeTiming short/normal pause). */
  pauseBefore: "none" | "short" | "normal";
};

function pushSide(
  steps: RegisterPlayStep[],
  part: "casual" | "formal",
  side: RegisterPair["casual"],
  pace: RegisterPlayStep["pace"],
  pauseBefore: RegisterPlayStep["pauseBefore"]
) {
  if (!side.text.trim()) return;
  steps.push({ part, lang: "ja", text: side.text, reading: side.reading, pace, pauseBefore });
}

/**
 * Spoken order for Play / Play All on one pair, on the Player's Auto Mode
 * rules (JP normal → pause → EN → pause → JP slow, then the nuance):
 *   casual JP, meaning EN, casual JP slow, formal JP, formal JP slow, note.
 * The English meaning is said once — both forms share it.
 */
export function buildRegisterPlaySteps(pair: RegisterPair): RegisterPlayStep[] {
  const steps: RegisterPlayStep[] = [];

  pushSide(steps, "casual", pair.casual, "normal", "none");
  if (pair.meaning.trim()) {
    steps.push({ part: "meaning", lang: "en", text: pair.meaning, pace: "normal", pauseBefore: "short" });
  }
  pushSide(steps, "casual", pair.casual, "slow", "normal");
  pushSide(steps, "formal", pair.formal, "normal", "short");
  pushSide(steps, "formal", pair.formal, "slow", "normal");

  const note = pair.note?.trim() ?? "";
  if (note) {
    steps.push({ part: "note", lang: "nuance", text: note, pace: "normal", pauseBefore: "short" });
  }

  if (steps[0]) steps[0] = { ...steps[0], pauseBefore: "none" };
  return steps;
}
