import type { KanjiDetail } from "../types/vocabulary";
import { KANJI } from "./kanji";

const KANJI_RE = /[\u4e00-\u9faf々]/;

/**
 * Collect, in order of first appearance, the kanji used by the given texts.
 * Entries come from the shared KANJI table in ./kanji. The furigana engine
 * seeds its reading cache from that table (alignFurigana.ts ->
 * ensureKanjiReadingsSeeded), not by iterating this corpus at startup.
 */
export function kanjiDetailsFor(...texts: string[]): KanjiDetail[] {
  const seen = new Set<string>();
  const details: KanjiDetail[] = [];
  for (const text of texts) {
    for (const character of text) {
      if (!KANJI_RE.test(character) || seen.has(character)) continue;
      seen.add(character);
      const entry = KANJI[character];
      if (!entry) {
        console.warn(`[vocabulary] No KANJI entry for "${character}"`);
        continue;
      }
      details.push({ character, ...entry });
    }
  }
  return details;
}
