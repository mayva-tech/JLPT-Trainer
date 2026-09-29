import { phraseNuances } from "../vocabularyPhraseNuances";
import { vocabNuances1 } from "./part1";
import { vocabNuances2 } from "./part2";
import { vocabNuances3 } from "./part3";
import { vocabNuances4 } from "./part4";
import { vocabNuances5 } from "./part5";
import { vocabNuances6 } from "./part6";
import { vocabNuances7 } from "./part7";
import { vocabNuances8 } from "./part8";
import type { VocabNuanceEntry } from "./types";

export type { VocabNuanceEntry } from "./types";

/** Word / phrase / sentence notes keyed by vocabulary id. */
export const vocabNuances: Readonly<Record<number, VocabNuanceEntry>> = {
  ...vocabNuances1,
  ...vocabNuances2,
  ...vocabNuances3,
  ...vocabNuances4,
  ...vocabNuances5,
  ...vocabNuances6,
  ...vocabNuances7,
  ...vocabNuances8,
};

/** Optional nuance fields to spread onto a vocabulary item. */
export function vocabNuanceFields(id: number): {
  wordNuance?: string;
  phraseNuance?: string;
  sentenceNuance?: string;
} {
  const entry = vocabNuances[id];
  const phrase = phraseNuances[id] ?? entry?.phrase;
  return {
    ...(entry?.word ? { wordNuance: entry.word } : {}),
    ...(phrase ? { phraseNuance: phrase } : {}),
    ...(entry?.sentence ? { sentenceNuance: entry.sentence } : {}),
  };
}
