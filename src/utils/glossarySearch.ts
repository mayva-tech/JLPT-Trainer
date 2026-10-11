import { kanaToRomaji } from "../lib/japanese/romaji";

/**
 * Content-glossary search: one query matches English, kanji/kana and romaji.
 *
 * Romaji is compared loosely so "toukyou", "tōkyō" and "tokyo" all find the
 * same reading: macrons and apostrophes are dropped and long vowels collapse
 * (ou/oo → o, uu → u) on both sides.
 */

function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** Loose Latin form shared by the typed query and the derived romaji. */
export function looseRomaji(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[āâ]/g, "a")
    .replace(/[īî]/g, "i")
    .replace(/[ūû]/g, "u")
    .replace(/[ēê]/g, "e")
    .replace(/[ōô]/g, "o")
    .replace(/['’\s\-・.,;:!?~〜()（）[\]「」]/g, "")
    .replace(/ou|oo/g, "o")
    .replace(/uu/g, "u");
}

function plain(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

/** Reading → romaji, ignoring anything that isn't kana (〜, brackets, kanji). */
function readingRomaji(reading: string): string {
  const kana = reading.replace(/[^ぁ-ゖァ-ヺー\s]/g, " ");
  return looseRomaji(kanaToRomaji(kana));
}

export type GlossaryEntry = {
  /** Japanese spelling (kanji / pattern). */
  surface: string;
  reading: string;
  meaning: string;
  /** Extra English text worth searching (aliases, nuance). */
  extra?: readonly string[];
};

/**
 * Returns a predicate for the query, or null when the query is empty.
 * Matches: English meaning, surface, kana reading (hira/kata), romaji.
 */
export function glossaryMatcher(query: string): ((entry: GlossaryEntry) => boolean) | null {
  const raw = query.trim();
  if (!raw) return null;
  const q = plain(raw);
  const qKana = toHiragana(q);
  const qRomaji = looseRomaji(raw);
  const latin = /^[\x20-\x7EÀ-ſ]+$/.test(raw);

  return (entry) => {
    if (plain(entry.meaning).includes(q)) return true;
    if (entry.extra?.some((e) => plain(e).includes(q))) return true;
    if (plain(entry.surface).includes(q)) return true;
    if (toHiragana(plain(entry.reading)).includes(qKana)) return true;
    return latin && qRomaji.length > 0 && readingRomaji(entry.reading).includes(qRomaji);
  };
}
