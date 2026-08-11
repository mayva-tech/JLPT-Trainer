/**
 * Data model for the Konbini (Family Mart) trainer page.
 *
 * Japanese strings use the same inline furigana notation as the original
 * artifact: kanji runs are followed by their reading in parentheses, e.g.
 *   "少々(しょうしょう)お待(ま)ちください"
 * `Furigana` renders these as <ruby>, and `stripFurigana` removes the
 * readings before the string is handed to the speech engine.
 */

export type Register = 'formal' | 'friendly';

export type DeckId = 'core' | 'vocab' | 'survival';

export type Speaker = 'staff' | 'customer';

/** One register-specific rendering of a line: Japanese, romaji, English. */
export interface Variant {
  jp: string;
  ro: string;
  en: string;
}

/** A flashcard: one concept, shown in whichever register is active. */
export interface Card {
  id: string;
  label: string;
  formal: Variant;
  friendly: Variant;
}

export interface ScriptLine {
  who: Speaker;
  formal: Variant;
  friendly: Variant;
}

export interface Script {
  id: string;
  title: string;
  titleEn: string;
  lines: ScriptLine[];
}

export interface Deck {
  id: DeckId;
  label: string;
  cards: Card[];
}

/** Progress is persisted to localStorage under STORAGE_KEY. */
export interface Progress {
  known: string[];
  practiced: string[];
}
