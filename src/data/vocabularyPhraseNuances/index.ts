import { phraseNuances1 } from "./batch1";
import { phraseNuances2 } from "./batch2";
import { phraseNuances3 } from "./batch3";
import { phraseNuances4 } from "./batch4";
import { phraseNuances5 } from "./batch5";
import { phraseNuances6 } from "./batch6";
import { phraseNuances7 } from "./batch7";
import { phraseNuances8 } from "./batch8";

/** Phrase-step usage notes keyed by vocabulary id; absent when nothing is worth noting. */
export const phraseNuances: Readonly<Record<number, string>> = {
  ...phraseNuances1,
  ...phraseNuances2,
  ...phraseNuances3,
  ...phraseNuances4,
  ...phraseNuances5,
  ...phraseNuances6,
  ...phraseNuances7,
  ...phraseNuances8,
};
