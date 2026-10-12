import { NUANCE_FURIGANA } from "../data/nuanceFurigana.generated";
import { findReadingGlosses, type ReadingGloss } from "./readingGloss";

export const KANJI_RUN_RE = /[\p{Script=Han}々〆]+/gu;

/** Lookup key for a kanji run: the run plus the character after it (okurigana decides 降り/降りる). */
export function kanjiRunKey(run: string, next: string): string {
  return `${run}|${next}`;
}

/** Furigana for the run at `at`, preferring an entry that also matches the character before it. */
function runReadings(text: string, run: string, at: number): string | undefined {
  const key = kanjiRunKey(run, text[at + run.length] ?? "");
  return NUANCE_FURIGANA[`${text[at - 1] ?? "^"}${key}`] ?? NUANCE_FURIGANA[key];
}

/** "2ざいこ1き" → [[2, "ざいこ"], [1, "き"]]: kanji count and furigana per word. */
export function decodeRunReadings(encoded: string): [number, string][] {
  return [...encoded.matchAll(/(\d+)(\D+)/g)].map((m) => [Number(m[1]), m[2]!]);
}

export function encodeRunReadings(parts: readonly (readonly [number, string])[]): string {
  return parts.map(([count, reading]) => `${count}${reading}`).join("");
}

/**
 * Furigana for every kanji in a nuance note, from the generated table
 * (`npm run nuance-furigana`). Nothing is spoken differently: the ruby only
 * sits over the kanji.
 */
export function findKanjiFurigana(text: string): ReadingGloss[] {
  const out: ReadingGloss[] = [];
  for (const m of text.matchAll(KANJI_RUN_RE)) {
    const run = m[0];
    const at = m.index ?? 0;
    const encoded = runReadings(text, run, at);
    if (!encoded) continue;
    const chars = [...run];
    let offset = at;
    let index = 0;
    for (const [count, ruby] of decodeRunReadings(encoded)) {
      const piece = chars.slice(index, index + count).join("");
      index += count;
      out.push({
        rubyStart: offset,
        rubyEnd: offset + piece.length,
        ruby,
        baseStart: offset,
        end: offset + piece.length,
        reading: ruby,
      });
      offset += piece.length;
    }
  }
  return out;
}

/**
 * All furigana for a nuance note, in text order: readings the note writes out
 * itself ("方 かた") first, then the table for every other kanji.
 */
export function nuanceFurigana(text: string): ReadingGloss[] {
  const written = findReadingGlosses(text);
  const inWritten = (g: ReadingGloss) =>
    written.some((w) => g.rubyStart < w.end && g.rubyEnd > Math.min(w.baseStart, w.rubyStart));
  return [...written, ...findKanjiFurigana(text).filter((g) => !inWritten(g))].sort(
    (a, b) => a.rubyStart - b.rubyStart
  );
}
