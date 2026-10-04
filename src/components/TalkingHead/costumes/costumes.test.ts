import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LookLayer } from "../looks";
import { COSTUMES, costumeById, stepCostume } from ".";

const LAYERS: LookLayer[] = ["back", "outfit", "face", "lip", "top", "collar"];

describe("costumes", () => {
  it("has six with unique ids and art for both voices", () => {
    expect(COSTUMES).toHaveLength(6);
    expect(new Set(COSTUMES.map((c) => c.id)).size).toBe(6);
    for (const c of COSTUMES) {
      expect(c.Layers.ja).toBeTypeOf("function");
      expect(c.Layers.en).toBeTypeOf("function");
      expect(c.Layers.ja).not.toBe(c.Layers.en);
    }
  });

  it("every layer renders, nothing paints over the mouth, and each has a reveal", () => {
    for (const c of COSTUMES) {
      for (const voice of ["ja", "en"] as const) {
        const svg = LAYERS.map((layer) => renderToStaticMarkup(createElement(c.Layers[voice], { layer }))).join("");
        expect(svg).toContain("th-suit");
        expect(svg).not.toContain("NaN");
        expect(renderToStaticMarkup(createElement(c.Layers[voice], { layer: "lip" }))).toBe("");
        expect(svg).toContain(c.reveal === "shutter" ? "th-suit-shutter" : "th-costume-poof");
      }
    }
  });

  it("steps through the list and wraps", () => {
    expect(stepCostume("mecha", 1)).toBe("samurai");
    expect(stepCostume("hero", 1)).toBe("mecha");
    expect(stepCostume("mecha", -1)).toBe("hero");
  });

  it("resolves only known ids", () => {
    expect(costumeById("idol")?.label).toBe("Idol stage outfit");
    expect(costumeById("nope")).toBeNull();
    expect(costumeById(null)).toBeNull();
  });
});
