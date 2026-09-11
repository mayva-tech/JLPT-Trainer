import type { RegisterPair } from "../types/register";
import type { RegisterPlayPart } from "../components/RegisterSplitCard";
import { splitNuanceForSpeech } from "./nuanceSpeech";

export type RegisterPlayStep = {
  part: RegisterPlayPart;
  lang: "ja" | "en";
  text: string;
  reading?: string;
};

function pushSide(
  steps: RegisterPlayStep[],
  part: "casual" | "formal",
  side: RegisterPair["casual"]
) {
  if (!side.text.trim()) return;
  steps.push({
    part,
    lang: "ja",
    text: side.text,
    reading: side.reading,
  });
}

function pushMeaning(steps: RegisterPlayStep[], pair: RegisterPair) {
  if (!pair.meaning.trim()) return;
  steps.push({
    part: "meaning",
    lang: "en",
    text: pair.meaning,
  });
}

/**
 * Spoken order for Play / Play All on one pair.
 * Matches the current Player sequence: casual JP+EN, casual JP again,
 * formal JP+EN, formal JP again, then nuance/note segments.
 */
export function buildRegisterPlaySteps(pair: RegisterPair): RegisterPlayStep[] {
  const steps: RegisterPlayStep[] = [];

  pushSide(steps, "casual", pair.casual);
  pushMeaning(steps, pair);
  pushSide(steps, "casual", pair.casual);
  pushSide(steps, "formal", pair.formal);
  pushMeaning(steps, pair);
  pushSide(steps, "formal", pair.formal);

  const note = pair.note?.trim() ?? "";
  if (!note) return steps;

  for (const segment of splitNuanceForSpeech(note)) {
    const text = segment.text.trim();
    if (!text) continue;
    steps.push({
      part: "note",
      lang: segment.lang,
      text,
    });
  }

  return steps;
}
