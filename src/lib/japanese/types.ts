/**
 * Shared data model for the Japanese trainer pages (konbini work, trip).
 *
 * Japanese strings use inline furigana notation: each kanji run is followed by
 * its reading in parentheses, e.g. "少々(しょうしょう)お待(ま)ちください".
 * `Furigana` renders these as <ruby>; `stripFurigana` removes the readings
 * before the string reaches the speech engine.
 */

/**
 * Two ways of saying the same thing. Each page labels the pair for its own
 * situation — Formal/Friendly behind the counter, Polite/Casual on a trip.
 */
export type Register = 'formal' | 'friendly';

/** Who is speaking: the learner, or the person in front of them. */
export type Speaker = 'self' | 'other';

export interface Variant {
  jp: string;
  ro: string;
  en: string;
}

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
  id: string;
  label: string;
  cards: Card[];
}

export interface Progress {
  known: string[];
  practiced: string[];
}
