import type { JlptLevel } from "../../types/level";
import type { SceneBackdrop } from "../../services/sceneBus";
import type { AmbienceTheme } from "../../components/StageAmbience/themes";

/**
 * Everyday Japanese (身の回りの日本語) — visual vocabulary by location.
 *
 * The data is generated from scripts/everyday/*.tsv by
 * scripts/generateEveryday.mjs; see the column notes there.
 */

/** A real-life location (At Home, Train Station, …). */
export interface EverydayCategory {
  id: string;
  english: string;
  /** Furigana notation, e.g. "駅(えき)". */
  japanese: string;
  /** A word in this category that has a picture; used as the thumbnail. */
  coverWordId: string;
  /** Talking-head backdrop while this category is open. */
  backdrop: SceneBackdrop;
  /** Stage ambience drawn behind this location's cards. */
  ambience: AmbienceTheme;
}

/**
 * One canonical word. A word that appears in several places (エレベーター in
 * an apartment, an airport, a hospital…) is still one record with several
 * `categoryIds`, so progress and quiz stats never split.
 */
export interface EverydayWord {
  id: string;
  /** Furigana notation: "改札口(かいさつぐち)", "買(か)い物(もの)かご". */
  japanese: string;
  /** Kana reading. Spaces mark word breaks for romaji only. */
  reading: string;
  english: string;
  partOfSpeech: string;
  /**
   * One emoji, `svg:<id>` (hand-drawn, ./art), or `photo:<file>`
   * (public/everyday/<file>, credited in PHOTO_CREDITS). Null when no verified
   * picture exists yet — the card then shows the word without a picture
   * rather than a stand-in.
   */
  picture: string | null;
  categoryIds: readonly string[];
  /** One short usage note, or null. */
  nuance: string | null;
  /** Override for the derived Hepburn romaji (ATM, ICカード, 大家さん). */
  romaji: string | null;
  /**
   * Level from scripts/levels/jlptWordLevels.tsv (tanos.co.uk list, CC BY —
   * a widely used guide; there is no official list). "unclassified" when the
   * word is not on it.
   */
  jlptLevel: JlptLevel | "unclassified";
}

export interface PhotoCredit {
  author: string;
  license: string;
  source: string;
}
