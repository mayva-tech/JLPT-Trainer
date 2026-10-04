import type { ComponentType } from "react";
import type { HeadVoice, LookLayerProps } from "../looks";
import { AndrewHero, NanamiHero } from "./hero";
import { AndrewIdol, NanamiIdol } from "./idol";
import { AndrewKigurumi, NanamiKigurumi } from "./kigurumi";
import { AndrewMecha, NanamiMecha } from "./mecha";
import { AndrewSamurai, NanamiSamurai } from "./samurai";
import { AndrewShinobi, NanamiShinobi } from "./shinobi";

/**
 * Costumes both heads can wear over their chosen look. Each one paints the
 * look's layer slots (hair and clothing go under it); the face, eyes, mouth
 * and lip-sync are never touched. All designs are original.
 */

export type CostumeId = "mecha" | "samurai" | "shinobi" | "idol" | "kigurumi" | "hero";

/** How the costume appears when switched on. */
export type CostumeReveal = "shutter" | "poof";

export interface Costume {
  /** Stable id — persisted, so never rename an existing one. */
  id: CostumeId;
  /** English name for toasts and labels. */
  label: string;
  /** Japanese name; `reading` goes over it as ruby when it has kanji. */
  ja: string;
  reading?: string;
  /** Kana written before / after the ruby part (アイドル衣装, 着ぐるみ). */
  jaBefore?: string;
  jaAfter?: string;
  reveal: CostumeReveal;
  Layers: Record<HeadVoice, ComponentType<LookLayerProps>>;
}

export const COSTUMES: readonly Costume[] = [
  { id: "mecha", label: "Mecha suit", ja: "メカスーツ", reveal: "shutter", Layers: { ja: NanamiMecha, en: AndrewMecha } },
  { id: "samurai", label: "Samurai armour", ja: "鎧", reading: "よろい", reveal: "poof", Layers: { ja: NanamiSamurai, en: AndrewSamurai } },
  { id: "shinobi", label: "Shinobi", ja: "忍び装束", reading: "しのびしょうぞく", reveal: "poof", Layers: { ja: NanamiShinobi, en: AndrewShinobi } },
  { id: "idol", label: "Idol stage outfit", jaBefore: "アイドル", ja: "衣装", reading: "いしょう", reveal: "poof", Layers: { ja: NanamiIdol, en: AndrewIdol } },
  { id: "kigurumi", label: "Kigurumi", ja: "着", reading: "き", jaAfter: "ぐるみ", reveal: "poof", Layers: { ja: NanamiKigurumi, en: AndrewKigurumi } },
  { id: "hero", label: "RPG hero", ja: "勇者", reading: "ゆうしゃ", reveal: "poof", Layers: { ja: NanamiHero, en: AndrewHero } },
];

const BY_ID = new Map(COSTUMES.map((c) => [c.id, c]));

export function costumeById(id: string | null | undefined): Costume | null {
  return (id && BY_ID.get(id as CostumeId)) || null;
}

/** Next/previous costume in the list, wrapping. */
export function stepCostume(id: CostumeId, step: number): CostumeId {
  const i = COSTUMES.findIndex((c) => c.id === id);
  const n = COSTUMES.length;
  return COSTUMES[(((i < 0 ? 0 : i) + step) % n + n) % n].id;
}
