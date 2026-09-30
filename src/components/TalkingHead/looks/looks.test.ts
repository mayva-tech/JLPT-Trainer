import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ANDREW_LOOKS,
  NANAMI_LOOKS,
  looksFor,
  resolveLook,
  stepLookId,
  type HeadLook,
  type LookLayer,
} from "./index";

const LAYERS: LookLayer[] = ["back", "outfit", "face", "lip", "top", "collar"];

function layerMarkup(look: HeadLook, layer: LookLayer): string {
  return renderToStaticMarkup(
    createElement("svg", null, createElement(look.Layers, { layer }))
  );
}

describe.each([
  ["Andrew", ANDREW_LOOKS, "classic"],
  ["Nanami", NANAMI_LOOKS, "kimono"],
] as const)("%s looks", (_name, looks, defaultId) => {
  it("has twenty looks, the original first", () => {
    expect(looks).toHaveLength(20);
    expect(looks[0].id).toBe(defaultId);
  });

  it("has unique, slug-shaped ids and unique labels", () => {
    const ids = looks.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    const labels = looks.map((l) => l.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("uses hex brow colours", () => {
    for (const l of looks) expect(l.browColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("renders every layer without throwing, with an outfit and hair", () => {
    for (const l of looks) {
      for (const layer of LAYERS) expect(() => layerMarkup(l, layer)).not.toThrow();
      expect(layerMarkup(l, "outfit")).toContain("<path");
      const hair = layerMarkup(l, "face") + layerMarkup(l, "top");
      expect(hair.length).toBeGreaterThan(20);
    }
  });

  it("keeps clipPath ids unique across looks", () => {
    const ids = looks.flatMap((l) =>
      LAYERS.flatMap((layer) =>
        [...layerMarkup(l, layer).matchAll(/id="([^"]+)"/g)].map((m) => m[1])
      )
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never paints the fixed features (eyes are the head's own)", () => {
    for (const l of looks) {
      for (const layer of LAYERS) {
        expect(layerMarkup(l, layer)).not.toContain("th-mouth");
        expect(layerMarkup(l, layer)).not.toContain("th-gaze");
      }
    }
  });
});

describe("look selection helpers", () => {
  it("maps voices to their look lists", () => {
    expect(looksFor("en")).toBe(ANDREW_LOOKS);
    expect(looksFor("ja")).toBe(NANAMI_LOOKS);
  });

  it("falls back to the default look for unknown or missing ids", () => {
    expect(resolveLook(ANDREW_LOOKS, "nope").id).toBe("classic");
    expect(resolveLook(NANAMI_LOOKS, null).id).toBe("kimono");
    expect(resolveLook(NANAMI_LOOKS, "bob").id).toBe("bob");
  });

  it("steps forward and backward with wrap-around", () => {
    expect(stepLookId(ANDREW_LOOKS, "classic", 1)).toBe("side-part");
    expect(stepLookId(ANDREW_LOOKS, "classic", -1)).toBe("flat-cap");
    expect(stepLookId(ANDREW_LOOKS, "flat-cap", 1)).toBe("classic");
    expect(stepLookId(ANDREW_LOOKS, "headphones", 1)).toBe("chef");
    expect(stepLookId(NANAMI_LOOKS, undefined, 1)).toBe("yukata");
  });
});
