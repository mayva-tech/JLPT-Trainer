import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { plainJapanese, wordById } from "../everydayData";
import { KitchenArt } from "./art/KitchenArt";
import { StreetArt } from "./art/StreetArt";
import { TrainArt } from "./art/TrainArt";
import { findPrompt } from "./discoveryQuiz";
import { hotspotToScene, labelPoint, markerPoints, pointInPolygon, polygonArea } from "./geometry";
import { DISCOVERY_SCENES, objectWord, validateScene } from "./scenes";
import { SCENE_SCRIPTS } from "./sceneScripts";

const ART: Record<string, ComponentType> = { kitchen: KitchenArt, train: TrainArt, street: StreetArt };

describe("Visual Discovery scenes", () => {
  it("ships the three starter scenes", () => {
    expect(DISCOVERY_SCENES.map((s) => s.id)).toEqual(["kitchen", "train", "street"]);
  });

  for (const scene of DISCOVERY_SCENES) {
    describe(scene.id, () => {
      it("is valid (vocabulary, ids, normalized polygons, image)", () => {
        expect(validateScene(scene)).toEqual([]);
      });

      it("has a Play all intro and outro", () => {
        expect(SCENE_SCRIPTS[scene.id]?.intro.length).toBeGreaterThan(0);
        expect(SCENE_SCRIPTS[scene.id]?.outro.length).toBeGreaterThan(0);
      });

      it("has 10–15 objects, each a word of this location", () => {
        expect(scene.objects.length).toBeGreaterThanOrEqual(10);
        expect(scene.objects.length).toBeLessThanOrEqual(15);
        for (const o of scene.objects) {
          const word = wordById(o.vocabularyId)!;
          expect(word.categoryIds, `${o.id} in ${scene.categoryId}`).toContain(scene.categoryId);
          expect(word.reading).toMatch(/^[぀-ヿ ー]+$/u);
        }
      });

      it("every hotspot is a real object drawn in the picture (data-obj ↔ hotspot)", () => {
        const Art = ART[scene.imagePath.replace("art:", "")]!;
        const svg = renderToStaticMarkup(createElement(Art));
        const drawn = [...svg.matchAll(/data-obj="([^"]+)"/g)].map((m) => m[1]).sort();
        expect(drawn).toEqual(scene.objects.map((o) => o.id).sort());
      });

      it("hotspots have area, a label point inside, and no two are the same", () => {
        const seen = new Set<string>();
        for (const o of scene.objects) {
          const poly = hotspotToScene(o.hotspot, scene.imageWidth, scene.imageHeight);
          expect(polygonArea(poly), o.id).toBeGreaterThan(200);
          expect(pointInPolygon(labelPoint(poly), poly), o.id).toBe(true);
          const key = JSON.stringify(poly.map(([x, y]) => [Math.round(x), Math.round(y)]));
          expect(seen.has(key), o.id).toBe(false);
          seen.add(key);
        }
      });

      it("Show-objects markers sit inside their own object, clear of smaller ones", () => {
        const W = scene.imageWidth;
        const H = scene.imageHeight;
        const markers = markerPoints(scene.objects, W, H, W / 40);
        const polys = scene.objects.map((o) => {
          const poly = hotspotToScene(o.hotspot, W, H);
          return { id: o.id, poly, area: polygonArea(poly) };
        });
        for (const p of polys) {
          const m = markers.get(p.id)!;
          expect(pointInPolygon(m, p.poly), p.id).toBe(true);
          const onTop = polys.filter((q) => q.area < p.area && pointInPolygon(m, q.poly)).map((q) => q.id);
          expect(onTop, `${p.id} marker covered by`).toEqual([]);
        }
      });

      it("Find-it prompts read naturally in both languages", () => {
        for (const o of scene.objects) {
          const word = objectWord(o);
          const p = findPrompt(o, word);
          expect(p.en, o.id).toMatch(/^Find the .+\.$/);
          expect(p.ja.endsWith("を探してください。"), o.id).toBe(true);
          expect(p.jaReading, o.id).toMatch(/^[぀-ヿー]+をさがしてください。$/u);
          if (!o.prompt) expect(p.ja.startsWith(plainJapanese(word))).toBe(true);
        }
      });
    });
  }

  it("validateScene reports broken data", () => {
    const base = DISCOVERY_SCENES[0]!;
    const broken = {
      ...base,
      imagePath: "photo:x.webp",
      credit: null,
      objects: [
        { id: "a", vocabularyId: "no-such-word", hotspot: { type: "polygon" as const, points: [[0, 0], [2, 0], [0, 1]] as const } },
        { id: "a", vocabularyId: "fridge", hotspot: { type: "polygon" as const, points: [[0, 0], [0.0001, 0], [0, 0.0001]] as const } },
      ],
    };
    const problems = validateScene(broken).join("\n");
    expect(problems).toMatch(/needs a credit/);
    expect(problems).toMatch(/unknown vocabularyId "no-such-word"/);
    expect(problems).toMatch(/normalized/);
    expect(problems).toMatch(/duplicate object id/);
    expect(problems).toMatch(/\(almost\) no area/);
  });
});
