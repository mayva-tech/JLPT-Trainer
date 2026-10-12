import { categoryById, wordById } from "../../everydayData";
import type { EverydayWord } from "../../types";
import { hotspotPoints, hotspotToScene, polygonArea } from "../geometry";
import type { DiscoveryObject, DiscoveryScene } from "../types";
import { KITCHEN_SCENE } from "./kitchen";
import { STREET_SCENE } from "./street";
import { TRAIN_SCENE } from "./train";

/**
 * The scene gallery, in display order. A new scene is one file in this
 * folder (picture + hotspots) and one line here — see ../README.md.
 */
export const DISCOVERY_SCENES: readonly DiscoveryScene[] = [KITCHEN_SCENE, TRAIN_SCENE, STREET_SCENE];

const SCENE_BY_ID = new Map(DISCOVERY_SCENES.map((s) => [s.id, s]));

export function sceneById(id: string): DiscoveryScene | undefined {
  return SCENE_BY_ID.get(id);
}

/** The Everyday word behind an object (validated by the corpus test). */
export function objectWord(obj: DiscoveryObject): EverydayWord {
  const word = wordById(obj.vocabularyId);
  if (!word) throw new Error(`Visual Discovery: unknown vocabularyId "${obj.vocabularyId}"`);
  return word;
}

/**
 * Every problem with a scene, as readable lines (empty = valid). Run by the
 * corpus test for the shipped scenes, and by the hotspot editor live.
 */
export function validateScene(scene: DiscoveryScene): string[] {
  const problems: string[] = [];
  const at = (o: DiscoveryObject) => `${scene.id}/${o.id}`;
  if (!categoryById(scene.categoryId)) problems.push(`${scene.id}: unknown category "${scene.categoryId}"`);
  if (!/^(art|photo):[\w.-]+$/.test(scene.imagePath)) problems.push(`${scene.id}: imagePath must be art:<id> or photo:<file>`);
  if (scene.imagePath.startsWith("photo:") && !scene.credit) problems.push(`${scene.id}: a photo needs a credit`);
  if (!(scene.imageWidth > 0 && scene.imageHeight > 0)) problems.push(`${scene.id}: image size missing`);
  const ids = new Set<string>();
  for (const o of scene.objects) {
    if (ids.has(o.id)) problems.push(`${at(o)}: duplicate object id`);
    ids.add(o.id);
    if (!wordById(o.vocabularyId)) problems.push(`${at(o)}: unknown vocabularyId "${o.vocabularyId}"`);
    const pts = hotspotPoints(o.hotspot);
    if (pts.length < 3) problems.push(`${at(o)}: hotspot needs at least 3 points`);
    if (pts.some(([x, y]) => !(x >= 0 && x <= 1 && y >= 0 && y <= 1))) {
      problems.push(`${at(o)}: hotspot points must be normalized 0–1`);
    }
    if (polygonArea(hotspotToScene(o.hotspot, scene.imageWidth, scene.imageHeight)) < 40) {
      problems.push(`${at(o)}: hotspot has (almost) no area`);
    }
  }
  const words = new Set<string>();
  for (const o of scene.objects) {
    if (words.has(o.vocabularyId)) problems.push(`${at(o)}: word "${o.vocabularyId}" already used in this scene`);
    words.add(o.vocabularyId);
  }
  return problems;
}
