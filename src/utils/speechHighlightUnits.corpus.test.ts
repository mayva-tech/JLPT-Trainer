import { describe, it, expect } from "vitest";
import {
  buildJapaneseHighlightUnits,
  activeHighlightUnits,
} from "./speechHighlightUnits";
import { grammar } from "../data/grammar";
import { vocabulary } from "../data/vocabulary";

describe("final karaoke audit", () => {
  it("has no lone だ/です/ます units outside intentional もとだと", () => {
    const bad: string[] = [];
    const check = (id: number, kind: string, text: string) => {
      const units = activeHighlightUnits(buildJapaneseHighlightUnits(text)).map(
        (u) => u.text
      );
      for (const u of units) {
        const core = u.replace(/[、。！？．，!?.]+$/u, "");
        if (core === "だ" || core === "です" || core === "ます") {
          // Allowed: quotation だ before と (もとだと)
          const idx = units.indexOf(u);
          const next = units[idx + 1]?.replace(/[、。！？．，!?.]+$/u, "");
          if (core === "だ" && next === "と") continue;
          bad.push(`${kind}#${id} ${text} => ${units.join("|")}`);
        }
      }
      // no consecutive katakana splits
      for (let i = 0; i < units.length - 1; i++) {
        if (
          /^[\u30a0-\u30ffー]+$/.test(units[i]!) &&
          /^[\u30a0-\u30ffー]+$/.test(units[i + 1]!)
        ) {
          bad.push(`kata ${kind}#${id} ${units[i]}+${units[i + 1]}`);
        }
      }
    };
    for (const g of grammar) {
      check(g.id, "p", g.pattern);
      check(g.id, "s", g.sentence);
    }
    for (const v of vocabulary) {
      check(v.id, "w", v.word);
      check(v.id, "ph", v.phrase);
      check(v.id, "s", v.sentence);
    }
    if (bad.length) console.log(bad.slice(0, 30).join("\n"));
    expect(bad).toEqual([]);
  });
});
