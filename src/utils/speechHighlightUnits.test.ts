import { describe, expect, it } from "vitest";
import {
  activeHighlightUnits,
  buildEnglishHighlightUnits,
  buildJapaneseHighlightUnits,
  findUnitForBoundary,
} from "./speechHighlightUnits";

describe("buildEnglishHighlightUnits", () => {
  it("keeps punctuation with words and skips spaces as active units", () => {
    const units = buildEnglishHighlightUnits("Check the inventory.");
    const active = activeHighlightUnits(units);
    expect(active.map((u) => u.text)).toEqual([
      "Check",
      "the",
      "inventory.",
    ]);
    expect(units.some((u) => u.kind === "space")).toBe(true);
  });

  it("keeps contractions and hyphens as single words", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("It's out-of-stock.")
    );
    expect(active.map((u) => u.text)).toEqual(["It's", "out-of-stock."]);
  });

  it("handles abbreviations and numbers", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("Please review item No. 12.")
    );
    expect(active.map((u) => u.text)).toEqual([
      "Please",
      "review",
      "item",
      "No.",
      "12.",
    ]);
  });

  it("keeps sentence punctuation with the preceding word", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("Good question. Let me think.")
    );
    expect(active.map((u) => u.text)).toEqual([
      "Good",
      "question.",
      "Let",
      "me",
      "think.",
    ]);
  });

  it("normalizes char indices to complete display units", () => {
    const units = buildEnglishHighlightUnits("Check the inventory.");
    const mid = "Check ".length + 1; // inside "the"
    const h = findUnitForBoundary(units, mid);
    expect(h).toEqual({ start: 6, end: 9 });
  });
});

describe("buildJapaneseHighlightUnits", () => {
  it("produces word-like units for a simple sentence", () => {
    const units = buildJapaneseHighlightUnits("在庫を確認します。");
    const active = activeHighlightUnits(units);
    expect(active.length).toBeGreaterThan(1);
    expect(active.every((u) => u.end > u.start)).toBe(true);
    // Full surface coverage without gaps (allowing attached punct)
    const joined = units.map((u) => u.text).join("");
    expect(joined).toBe("在庫を確認します。");
  });

  it("covers 品切れ sentence", () => {
    const text = "この商品は品切れです。";
    const units = buildJapaneseHighlightUnits(text);
    expect(units.map((u) => u.text).join("")).toBe(text);
    expect(activeHighlightUnits(units).length).toBeGreaterThan(1);
  });

  it("handles comma pause without a huge punct-only active span", () => {
    const text = "明日、管理会社に連絡します。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    const punctOnly = active.filter((u) => u.kind === "punctuation");
    // Punctuation should be attached to words when possible
    expect(punctOnly.length).toBeLessThanOrEqual(1);
    expect(active.some((u) => u.text.includes("明日"))).toBe(true);
  });

  it("handles mixed kana/kanji/katakana", () => {
    const text = "省エネの商品を選びました。";
    const units = buildJapaneseHighlightUnits(text);
    expect(units.map((u) => u.text).join("")).toBe(text);
  });

  it("maps a char index inside a word to the whole word", () => {
    const text = "在庫を確認します。";
    const units = buildJapaneseHighlightUnits(text);
    const stock = activeHighlightUnits(units).find((u) =>
      u.text.includes("在庫")
    );
    expect(stock).toBeTruthy();
    const inside = stock!.start + 1;
    const h = findUnitForBoundary(units, inside);
    expect(h).toEqual({ start: stock!.start, end: stock!.end });
  });

  it("uses UTF-16 compatible ranges", () => {
    const text = "在庫を確認します。";
    const units = buildJapaneseHighlightUnits(text);
    for (const u of units) {
      expect(text.slice(u.start, u.end)).toBe(u.text);
    }
  });

  it("keeps もと as one unit (not も|と) and leaves quotation と", () => {
    const text = "焦りは失敗のもとだとよく言われる。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual([
      "焦りは",
      "失敗の",
      "もと",
      "だ",
      "と",
      "よく",
      "言われる。",
    ]);
  });

  it("keeps もと together in grammar-style phrases", () => {
    const under = activeHighlightUnits(
      buildJapaneseHighlightUnits("厳しい指導のもとで、技術を磨いた。")
    );
    expect(under.some((u) => u.text === "もと" || u.text.startsWith("もと"))).toBe(
      true
    );
    expect(under.some((u) => u.text === "も")).toBe(false);

    const based = activeHighlightUnits(
      buildJapaneseHighlightUnits("実話をもとに、この映画は作られた。")
    );
    expect(based.some((u) => u.text === "もと" || u.text.startsWith("もと"))).toBe(
      true
    );
  });

  it("keeps しまった as one unit so ま is not skipped", () => {
    const text = "失敗したあと少し落ち込んでしまった。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual([
      "失敗した",
      "あと",
      "少し",
      "落ち込んで",
      "しまった。",
    ]);
    const shimatta = active.find((u) => u.text.startsWith("しまった"));
    expect(shimatta).toBeTruthy();
    expect(text.slice(shimatta!.start, shimatta!.end)).toContain("ま");
  });
});
