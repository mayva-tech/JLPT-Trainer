import { describe, expect, it } from "vitest";
import { PITCH_ACCENT } from "../data/pitchAccent";
import {
  accentType,
  getPitchAccent,
  pitchKey,
  pitchPattern,
  splitMorae,
} from "./pitchAccent";

describe("splitMorae", () => {
  it("joins small kana and counts っ ー ん as morae", () => {
    expect(splitMorae("きょう")).toEqual(["きょ", "う"]);
    expect(splitMorae("がっこう")).toEqual(["が", "っ", "こ", "う"]);
    expect(splitMorae("コーヒー")).toEqual(["コ", "ー", "ヒ", "ー"]);
    expect(splitMorae("しんぶん")).toEqual(["し", "ん", "ぶ", "ん"]);
    expect(splitMorae("ちゅうしゃ")).toEqual(["ちゅ", "う", "しゃ"]);
  });
});

describe("pitchPattern — the はし minimal set", () => {
  it("箸 [1] head-high", () => {
    expect(pitchPattern(2, 1)).toEqual({ morae: ["H", "L"], particle: "L" });
  });
  it("橋 [2] tail-high: drop on the particle", () => {
    expect(pitchPattern(2, 2)).toEqual({ morae: ["L", "H"], particle: "L" });
  });
  it("端 [0] flat: particle stays high", () => {
    expect(pitchPattern(2, 0)).toEqual({ morae: ["L", "H"], particle: "H" });
  });
  it("先生 [3] middle-high", () => {
    expect(pitchPattern(4, 3)).toEqual({ morae: ["L", "H", "H", "L"], particle: "L" });
  });
});

describe("accentType", () => {
  it("names the four patterns", () => {
    expect(accentType(2, 0)).toBe("heiban");
    expect(accentType(2, 1)).toBe("atamadaka");
    expect(accentType(4, 3)).toBe("nakadaka");
    expect(accentType(2, 2)).toBe("odaka");
  });
});

describe("generated data", () => {
  it("normalises keys like the generator", () => {
    expect(pitchKey("〜品切れ", "しなぎれ")).toBe("品切れ|しなぎれ");
    expect(pitchKey("アプリ", "アプリ")).toBe("アプリ|あぷり");
  });

  it("knows known reference words", () => {
    expect(getPitchAccent("どきどき", "どきどき")).toEqual([{ n: 1 }]);
    expect(getPitchAccent("いらいら", "いらいら")).toEqual([
      { n: 1, pos: "副" },
      { n: 0, pos: "名" },
    ]);
  });

  it("returns null for unknown words", () => {
    expect(getPitchAccent("ぽよぽよ", "ぽよぽよ")).toBeNull();
  });

  it("has well-formed entries", () => {
    for (const [key, list] of Object.entries(PITCH_ACCENT)) {
      expect(key).toMatch(/^[^|]+\|[ぁ-ゖー]+$/);
      expect(list.length).toBeGreaterThan(0);
      for (const e of list) {
        const n = typeof e === "number" ? e : e.n;
        expect(Number.isInteger(n) && n >= 0).toBe(true);
      }
    }
  });
});
