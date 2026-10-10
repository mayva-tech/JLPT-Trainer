import { stripFurigana } from "../../lib/japanese/furigana";
import { EVERYDAY_CATEGORIES, EVERYDAY_WORDS } from "./data.generated";
import { kanaToRomaji } from "./romaji";
import type { EverydayCategory, EverydayWord } from "./types";

export { EVERYDAY_CATEGORIES, EVERYDAY_WORDS };

const WORD_BY_ID = new Map(EVERYDAY_WORDS.map((w) => [w.id, w]));
const CATEGORY_BY_ID = new Map(EVERYDAY_CATEGORIES.map((c) => [c.id, c]));
/**
 * A location's deck: picture cards first, so a session opens on things to
 * recognise; within that, the location's own words (first category = this
 * one, so Inside Train opens on つり革, not a shared ドア) before shared ones,
 * each group in source order.
 */
const WORDS_BY_CATEGORY = new Map<string, EverydayWord[]>(
  EVERYDAY_CATEGORIES.map((c) => {
    const own = EVERYDAY_WORDS.filter((w) => w.categoryIds[0] === c.id);
    const shared = EVERYDAY_WORDS.filter((w) => w.categoryIds[0] !== c.id && w.categoryIds.includes(c.id));
    const pictured = (list: EverydayWord[], want: boolean) => list.filter((w) => (w.picture !== null) === want);
    return [c.id, [...pictured(own, true), ...pictured(shared, true), ...pictured(own, false), ...pictured(shared, false)]];
  }),
);

export function wordById(id: string): EverydayWord | undefined {
  return WORD_BY_ID.get(id);
}

export function categoryById(id: string): EverydayCategory | undefined {
  return CATEGORY_BY_ID.get(id);
}

/** Words of one location (own words first). Shared words appear in each place they belong. */
export function wordsInCategory(categoryId: string): readonly EverydayWord[] {
  return WORDS_BY_CATEGORY.get(categoryId) ?? [];
}

export function hasPicture(word: EverydayWord): boolean {
  return word.picture !== null;
}

/** 改札口(かいさつぐち) → 改札口 */
export function plainJapanese(word: EverydayWord): string {
  return stripFurigana(word.japanese);
}

/** Kana reading without the romaji word breaks. */
export function plainReading(word: EverydayWord): string {
  return word.reading.replace(/\s+/g, "");
}

export function wordRomaji(word: EverydayWord): string {
  return word.romaji ?? kanaToRomaji(word.reading);
}

/** Only when the spelling isn't already the reading (no furigana to show). */
export function showsReading(word: EverydayWord): boolean {
  return plainJapanese(word) !== plainReading(word);
}

/**
 * Reading handed to the speech engine. Only for words with kanji, where it
 * pins the pronunciation (網棚 → あみだな); katakana words speak as written.
 */
export function speechReading(word: EverydayWord): string | null {
  return /[一-龯㐀-䶿々]/.test(plainJapanese(word)) ? plainReading(word) : null;
}

/** English for the voice: drop the bracketed notes ("Cart (shopping, luggage)" → "Cart"). */
export function speechEnglish(word: EverydayWord): string {
  return word.english.replace(/\s*\([^)]*\)/g, "").trim();
}

/** Alt text for the picture. */
export function pictureAlt(word: EverydayWord): string {
  return `Picture: ${word.english}`;
}

function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[āâ]/g, "a")
    .replace(/[īî]/g, "i")
    .replace(/[ūû]/g, "u")
    .replace(/[ēê]/g, "e")
    .replace(/[ōô]/g, "o")
    .replace(/['\s-]/g, "");
}

function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * Search by English, Japanese, kana (either script) or romaji with or without
 * macrons — "kaisatsu", "かいさつ", "改札", "ticket" all find 改札口.
 */
export function searchWords(query: string, pool: readonly EverydayWord[] = EVERYDAY_WORDS): EverydayWord[] {
  const q = normalize(query);
  if (!q) return [...pool];
  const qKana = toHiragana(q);
  return pool.filter((w) => {
    if (normalize(w.english).includes(q)) return true;
    if (normalize(plainJapanese(w)).includes(q)) return true;
    if (toHiragana(plainReading(w)).includes(qKana)) return true;
    return normalize(wordRomaji(w)).includes(q);
  });
}
