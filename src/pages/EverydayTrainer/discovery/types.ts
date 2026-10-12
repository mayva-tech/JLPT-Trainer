/**
 * Visual Discovery (写真で日本語) — explore a scene, tap objects, learn their
 * Japanese names.
 *
 * A scene is one picture plus a list of objects. Every object points at an
 * existing Everyday Japanese word (`vocabularyId`), so words, voices, nuance,
 * progress and quiz stats are shared with the rest of Everyday Japanese — the
 * same 冷蔵庫 record whether it is met in the kitchen scene, on a card, or in
 * a quiz.
 *
 * Hotspot coordinates are normalized (0–1) to the scene picture, so they stay
 * on their objects at any size, zoom or crop.
 */

/** [x, y], each 0–1 of the picture's width / height. */
export type NormPoint = readonly [number, number];

export type Hotspot =
  | { type: "polygon"; points: readonly NormPoint[] }
  | { type: "rectangle"; x: number; y: number; width: number; height: number };

export interface DiscoveryObject {
  /** Unique within the scene. */
  id: string;
  /** An Everyday Japanese word id (scripts/everyday/words.tsv). */
  vocabularyId: string;
  hotspot: Hotspot;
  /**
   * Find-it prompt when "Find the <english>." / "<word>を探してください。"
   * would read oddly (足元 is found as the warning sticker on the floor).
   */
  prompt?: { en: string; ja: string; jaReading: string };
}

export interface DiscoveryScene {
  id: string;
  titleEnglish: string;
  /** Furigana notation, e.g. "台所(だいどころ)". */
  titleJapanese: string;
  /**
   * `art:<id>` — an original illustration (./art), or
   * `photo:<file>` — public/discovery/<file>, credited in `credit`.
   */
  imagePath: string;
  /** Size of the picture the hotspots were mapped on (its aspect ratio). */
  imageWidth: number;
  imageHeight: number;
  /** Everyday Japanese location (talking-head backdrop, ambience, stats). */
  categoryId: string;
  /** One line under the title in the gallery. */
  blurb: string;
  /** Required for photos; null for original illustrations. */
  credit: { author: string; license: string; source: string } | null;
  objects: readonly DiscoveryObject[];
}
