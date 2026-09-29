import { grammarNuances1 } from "./part1";
import { grammarNuances2 } from "./part2";
import { grammarNuances3 } from "./part3";
import { grammarNuances4 } from "./part4";
import type { GrammarNuanceEntry } from "./types";

export type { GrammarNuanceEntry } from "./types";

/** Pattern / sentence notes keyed by grammar id. */
export const grammarNuances: Readonly<Record<number, GrammarNuanceEntry>> = {
  ...grammarNuances1,
  ...grammarNuances2,
  ...grammarNuances3,
  ...grammarNuances4,
};

/** Optional nuance fields to spread onto a grammar item. */
export function grammarNuanceFields(id: number): {
  nuance?: string;
  sentenceNuance?: string;
} {
  const entry = grammarNuances[id];
  return {
    ...(entry?.pattern ? { nuance: entry.pattern } : {}),
    ...(entry?.sentence ? { sentenceNuance: entry.sentence } : {}),
  };
}
