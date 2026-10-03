import { PITCH_ACCENT } from "../data/pitchAccent";
import { PHRASE_PITCH, type PhrasePitchSegment } from "../data/pitchAccentPhrases";

/**
 * Pitch accent (アクセント) helpers for Tokyo-standard Japanese.
 *
 * An accent number n is the mora after which the pitch drops:
 *   0 平板 heiban    — low, then high; the following particle stays high
 *   1 頭高 atamadaka — high on the first mora, then low
 *   n 中高 nakadaka  — low, high up to mora n, then low (1 < n < length)
 *   n 尾高 odaka     — high to the last mora; the particle drops (n = length)
 */

export type Pitch = "H" | "L";

export interface AccentReading {
  /** Mora position of the drop (0 = none). */
  n: number;
  /** Part of speech this accent applies to, when it depends on usage. */
  pos?: string;
}

export type AccentType = "heiban" | "atamadaka" | "nakadaka" | "odaka";

export const ACCENT_TYPE_LABEL: Record<AccentType, { ja: string; reading: string; en: string }> = {
  heiban: { ja: "平板型", reading: "へいばんがた", en: "Flat" },
  atamadaka: { ja: "頭高型", reading: "あたまだかがた", en: "Head-high" },
  nakadaka: { ja: "中高型", reading: "なかだかがた", en: "Middle-high" },
  odaka: { ja: "尾高型", reading: "おだかがた", en: "Tail-high" },
};

/** Kanjium part-of-speech labels, in English. */
export const POS_LABEL: Record<string, string> = {
  副: "adverb",
  名: "noun",
  形動: "na-adj.",
  代: "pronoun",
  感: "interjection",
  "名;形動": "noun / na-adj.",
  "副;名": "adverb / noun",
  "形動;副": "na-adj. / adverb",
  "副;感": "adverb / interjection",
};

const SMALL = new Set("ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ");

/** Split kana into morae: small ゃ/ゅ/ょ/ぁ… join the previous kana; っ, ー, ん count on their own. */
export function splitMorae(kana: string): string[] {
  const morae: string[] = [];
  for (const ch of kana.replace(/[\s〜~・]/g, "")) {
    if (SMALL.has(ch) && morae.length) morae[morae.length - 1] += ch;
    else morae.push(ch);
  }
  return morae;
}

/** High/low pitch per mora, plus the pitch of a following particle (が, を…). */
export function pitchPattern(moraCount: number, n: number): { morae: Pitch[]; particle: Pitch } {
  const morae: Pitch[] = [];
  for (let i = 1; i <= moraCount; i++) {
    if (n === 1) morae.push(i === 1 ? "H" : "L");
    else if (i === 1) morae.push("L");
    else morae.push(n === 0 || i <= n ? "H" : "L");
  }
  return { morae, particle: n === 0 ? "H" : "L" };
}

export function accentType(moraCount: number, n: number): AccentType {
  if (n === 0) return "heiban";
  if (n === 1) return "atamadaka";
  return n >= moraCount ? "odaka" : "nakadaka";
}

const toHira = (s: string) =>
  s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Same key normalisation as scripts/pitch/generatePitchAccent.mjs. */
export function pitchKey(word: string, reading: string): string {
  const clean = (s: string) => s.replace(/[〜~]/g, "").trim();
  return `${clean(word)}|${toHira(clean(reading)).replace(/\s+/g, "")}`;
}

/**
 * Accent readings for a word, most common first, or null when the word has
 * no verified entry. Entries that don't fit the word's mora count are dropped.
 */
export function getPitchAccent(word: string, reading: string): AccentReading[] | null {
  const raw = PITCH_ACCENT[pitchKey(word, reading)];
  if (!raw) return null;
  const moraCount = splitMorae(reading).length;
  const list = raw
    .map((e) => (typeof e === "number" ? { n: e } : { n: e.n, pos: e.pos }))
    .filter((a) => a.n <= moraCount);
  return list.length ? list : null;
}

/** Per-word accents of a vocabulary sample phrase, or null when it has no verified line. */
export function getPhrasePitch(phrase: string, reading: string): readonly PhrasePitchSegment[] | null {
  return PHRASE_PITCH[pitchKey(phrase, reading)] ?? null;
}
