import { describe, expect, it } from "vitest";
import {
  splitKanaMora,
  visemeForMora,
  visemesForEnglishWord,
  visemesForUnit,
} from "./visemes";

describe("splitKanaMora", () => {
  it("keeps youon attached to the mora they modify", () => {
    expect(splitKanaMora("きゃくさま")).toEqual(["きゃ", "く", "さ", "ま"]);
    expect(splitKanaMora("しゅう")).toEqual(["しゅ", "う"]);
  });

  it("attaches the long-vowel mark to the previous mora", () => {
    expect(splitKanaMora("コーヒー")).toEqual(["コー", "ヒー"]);
  });

  it("splits plain kana one per mora", () => {
    expect(splitKanaMora("ありがとう")).toEqual(["あ", "り", "が", "と", "う"]);
  });
});

describe("visemeForMora", () => {
  it("maps each vowel row to its shape", () => {
    expect(visemeForMora("か")).toBe("A");
    expect(visemeForMora("き")).toBe("I");
    expect(visemeForMora("く")).toBe("U");
    expect(visemeForMora("け")).toBe("E");
    expect(visemeForMora("こ")).toBe("O");
  });

  it("takes a youon's shape from its small kana", () => {
    // きゃ is spoken "kya" — an A mouth, not the I of き.
    expect(visemeForMora("きゃ")).toBe("A");
    expect(visemeForMora("しゅ")).toBe("U");
    expect(visemeForMora("ちょ")).toBe("O");
  });

  it("closes the lips on ん", () => {
    expect(visemeForMora("ん")).toBe("MBP");
  });

  it("handles katakana as well as hiragana", () => {
    expect(visemeForMora("ド")).toBe("O");
    expect(visemeForMora("ス")).toBe("U");
  });
});

describe("visemesForEnglishWord", () => {
  it("closes the lips on bilabials", () => {
    expect(visemesForEnglishWord("map")).toContain("MBP");
  });

  it("collapses a vowel cluster into one sustained shape", () => {
    // "book" should not open the mouth twice for "oo".
    const shapes = visemesForEnglishWord("book");
    const consecutive = shapes.filter((s, i) => i > 0 && s === shapes[i - 1]);
    expect(consecutive).toHaveLength(0);
  });

  it("does not open the mouth on a silent trailing e", () => {
    expect(visemesForEnglishWord("time").at(-1)).not.toBe("E");
  });

  it("returns nothing for punctuation-only input", () => {
    expect(visemesForEnglishWord("—")).toEqual([]);
  });
});

describe("visemesForUnit", () => {
  it("uses the kana reading rather than the kanji surface", () => {
    // 確認 carries no vowel information; かくにん does.
    const frames = visemesForUnit("確認", "かくにん", "ja", 600);
    expect(frames.map((f) => f.viseme)).toEqual(["A", "U", "I", "MBP"]);
  });

  it("spans exactly the unit's estimated duration", () => {
    const frames = visemesForUnit("ありがとう", "ありがとう", "ja", 1000);
    const last = frames.at(-1)!;
    expect(last.atMs + last.durationMs).toBeLessThanOrEqual(1001);
    expect(last.atMs + last.durationMs).toBeGreaterThan(900);
  });

  it("does not emit frames shorter than the flicker floor", () => {
    // A long word in a short window must hold fewer, longer shapes.
    const frames = visemesForUnit(
      "ありがとうございます",
      "ありがとうございます",
      "ja",
      200
    );
    for (const frame of frames) expect(frame.durationMs).toBeGreaterThanOrEqual(50);
  });

  it("still moves the mouth when no reading is available", () => {
    const frames = visemesForUnit("会議", null, "ja", 400);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("returns nothing for a zero-length unit", () => {
    expect(visemesForUnit("あ", "あ", "ja", 0)).toEqual([]);
  });
});
