import { describe, expect, it } from "vitest";
import { glossaryMatcher, looseRomaji } from "./glossarySearch";

const teinei = { surface: "丁寧", reading: "ていねい", meaning: "careful; polite; meticulous" };
const tokyo = { surface: "東京", reading: "とうきょう", meaning: "Tokyo" };
const grammar = { surface: "〜に違いない", reading: "〜にちがいない", meaning: "must be; no doubt" };

describe("glossaryMatcher", () => {
  it("returns null for an empty query", () => {
    expect(glossaryMatcher("  ")).toBeNull();
  });

  it("finds by English meaning", () => {
    expect(glossaryMatcher("careful")!(teinei)).toBe(true);
    expect(glossaryMatcher("rude")!(teinei)).toBe(false);
  });

  it("finds by romaji, with or without macrons and long-vowel spellings", () => {
    for (const q of ["teinei", "Teinei", "tei nei", "tōkyō", "toukyou", "tokyo"]) {
      const entry = q.toLowerCase().includes("t") && /ky/.test(q) ? tokyo : teinei;
      expect(glossaryMatcher(q)!(entry), q).toBe(true);
    }
  });

  it("finds by kana (either script) and kanji", () => {
    expect(glossaryMatcher("ていねい")!(teinei)).toBe(true);
    expect(glossaryMatcher("テイネイ")!(teinei)).toBe(true);
    expect(glossaryMatcher("丁寧")!(teinei)).toBe(true);
  });

  it("romanizes grammar readings that contain 〜", () => {
    expect(glossaryMatcher("chigainai")!(grammar)).toBe(true);
    expect(glossaryMatcher("ni chigai")!(grammar)).toBe(true);
    expect(glossaryMatcher("no doubt")!(grammar)).toBe(true);
  });

  it("does not match unrelated romaji", () => {
    expect(glossaryMatcher("zzz")!(teinei)).toBe(false);
  });

  it("collapses long vowels the same on both sides", () => {
    expect(looseRomaji("Tōkyō")).toBe(looseRomaji("toukyou"));
  });
});
