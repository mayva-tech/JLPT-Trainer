import { describe, expect, it } from "vitest";
import { looksFor } from "./looks";
import { SUIT_LOOK_ID, suitLookFor } from "./suit";

describe("suitLookFor", () => {
  it("keeps the brow colour of the look underneath", () => {
    for (const voice of ["ja", "en"] as const) {
      for (const base of looksFor(voice)) {
        const suit = suitLookFor(voice, base);
        expect(suit.id).toBe(SUIT_LOOK_ID);
        expect(suit.browColor).toBe(base.browColor);
      }
    }
  });

  it("returns the same object and component each time (no remounts)", () => {
    const base = looksFor("ja")[0];
    expect(suitLookFor("ja", base)).toBe(suitLookFor("ja", base));
    const other = looksFor("ja").find((l) => l.browColor !== base.browColor)!;
    expect(suitLookFor("ja", other).Layers).toBe(suitLookFor("ja", base).Layers);
  });

  it("gives each voice its own fit", () => {
    expect(suitLookFor("ja", looksFor("ja")[0]).Layers).not.toBe(
      suitLookFor("en", looksFor("en")[0]).Layers
    );
  });

  it("is not one of the cycling looks", () => {
    for (const voice of ["ja", "en"] as const) {
      expect(looksFor(voice).some((l) => l.id === SUIT_LOOK_ID)).toBe(false);
    }
  });
});
