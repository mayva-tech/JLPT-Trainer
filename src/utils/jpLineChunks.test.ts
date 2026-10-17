import { describe, expect, it } from "vitest";
import { breaksBefore, chunkJapaneseWords } from "./jpLineChunks";
import { buildJapaneseHighlightUnits } from "./speechHighlightUnits";

const chunks = (text: string) =>
  chunkJapaneseWords(buildJapaneseHighlightUnits(text), (u) => text.slice(u.start, u.end)).map((c) =>
    c.map((u) => text.slice(u.start, u.end)).join("")
  );

describe("chunkJapaneseWords", () => {
  it("breaks after particles, never inside a verb", () => {
    expect(chunks("三年前に日本へ来ました。")).toEqual(["三年前に", "日本へ", "来ました。"]);
  });

  it("keeps te-form + auxiliary and kana words together", () => {
    const parts = chunks("毎朝、新聞を読んでいます。");
    expect(parts.at(-1)).toBe("読んでいます。");
    expect(parts).toContain("新聞を");
  });

  it("breaks after a topic particle before a kana word", () => {
    expect(chunks("これはとてもおいしいです。")[0]).toBe("これは");
  });

  it("every chunk joins back to the original text", () => {
    for (const text of ["部屋の掃除をする", "在庫を確認します。", "きっと約束を守るだろう。"]) {
      expect(chunks(text).join("")).toBe(text);
    }
  });
});

describe("breaksBefore", () => {
  it("never splits a kanji stem from its ending", () => {
    expect(breaksBefore("来", "ました。")).toBe(false);
    expect(breaksBefore("勉強", "して")).toBe(false);
  });

  it("breaks after punctuation and before an opening quote", () => {
    expect(breaksBefore("はい、", "そうです")).toBe(true);
    expect(breaksBefore("彼は", "「はい」")).toBe(true);
  });
});
