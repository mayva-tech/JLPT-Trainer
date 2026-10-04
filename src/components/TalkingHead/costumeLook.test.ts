import { describe, expect, it } from "vitest";
import { looksFor } from "./looks";
import { COSTUMES } from "./costumes";
import { costumeLookFor } from "./costumeLook";

describe("costumeLookFor", () => {
  it("keeps the brow colour of the look underneath", () => {
    for (const costume of COSTUMES) {
      for (const voice of ["ja", "en"] as const) {
        for (const base of looksFor(voice)) {
          const look = costumeLookFor(costume, voice, base);
          expect(look.id).toBe(`costume-${costume.id}`);
          expect(look.browColor).toBe(base.browColor);
          expect(look.Layers).toBe(costume.Layers[voice]);
        }
      }
    }
  });

  it("returns the same object each time (no remounts)", () => {
    const base = looksFor("ja")[0];
    expect(costumeLookFor(COSTUMES[1], "ja", base)).toBe(costumeLookFor(COSTUMES[1], "ja", base));
  });

  it("costume looks never collide with the cycling looks", () => {
    for (const voice of ["ja", "en"] as const) {
      const ids = new Set(looksFor(voice).map((l) => l.id));
      for (const c of COSTUMES) expect(ids.has(costumeLookFor(c, voice, looksFor(voice)[0]).id)).toBe(false);
    }
  });
});
