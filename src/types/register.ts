/** Casual ⇄ formal expression pairs (敬語 register practice). */

export type RegisterSide = {
  /** Japanese surface form, e.g. 誰？ */
  text: string;
  /** Full kana reading used for furigana alignment and speech. */
  reading: string;
  /** Romaji shown under the Japanese, matching the reference style. */
  romaji: string;
};

export type RegisterPair = {
  id: number;
  /** Grouping used by the section chip, e.g. "Asking / Questions". */
  category: string;
  /** Shared English gloss shown across both columns. */
  meaning: string;
  casual: RegisterSide;
  formal: RegisterSide;
  /** Optional usage note: who says this to whom, and when it lands wrong. */
  note?: string;
};

export type RegisterSection = {
  id: string;
  /** TOC label, e.g. "1. 質問・依頼". */
  title: string;
  /** English subtitle for the stage chip. */
  subtitle: string;
  pairIds: number[];
};
