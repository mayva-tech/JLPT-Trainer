import { describe, expect, it } from "vitest";
import { parseFurigana, stripFurigana } from "./furigana";

describe("stripFurigana", () => {
  it("removes parenthesised readings from kanji runs", () => {
    expect(stripFurigana("少々(しょうしょう)お待(ま)ちください")).toBe(
      "少々お待ちください"
    );
  });

  it("leaves a string with no kanji untouched", () => {
    expect(stripFurigana("いらっしゃいませ")).toBe("いらっしゃいませ");
  });
});

describe("parseFurigana", () => {
  it("splits mixed text into ruby and plain segments", () => {
    const segments = parseFurigana("少々(しょうしょう)お待(ま)ちください");
    expect(segments).toHaveLength(4);
    expect(segments.filter((segment) => segment.reading)).toHaveLength(2);
    expect(segments[0]).toEqual({
      base: "少々",
      reading: "しょうしょう",
    });
    expect(segments[1]).toEqual({ base: "お" });
    expect(segments[2]).toEqual({ base: "待", reading: "ま" });
    expect(segments[3]).toEqual({ base: "ちください" });
  });
});
