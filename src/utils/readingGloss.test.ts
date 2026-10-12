import { describe, expect, it } from "vitest";
import { findReadingGlosses } from "./readingGloss";

const glossed = (text: string) =>
  findReadingGlosses(text).map((g) => ({
    word: text.slice(g.baseStart, g.end),
    kanji: text.slice(g.rubyStart, g.rubyEnd),
    ruby: g.ruby,
    reading: g.reading,
  }));

describe("findReadingGlosses", () => {
  it("finds a kanji word followed by its reading", () => {
    expect(
      glossed("人 is neutral; 方 かた is the polite version, and 者 もの is humble.")
    ).toEqual([
      { word: "方 かた", kanji: "方", ruby: "かた", reading: "かた" },
      { word: "者 もの", kanji: "者", ruby: "もの", reading: "もの" },
    ]);
  });

  it("reads brackets, okurigana and a number in front", () => {
    expect(glossed("The opposite of 前 is 後 (あと).")).toEqual([
      { word: "後 (あと)", kanji: "後", ruby: "あと", reading: "あと" },
    ]);
    expect(glossed("as in 三つ みっつ.")).toEqual([
      { word: "三つ みっつ", kanji: "三", ruby: "みっ", reading: "みっつ" },
    ]);
    expect(glossed("the second floor is 2階(にかい), not 床(ゆか).")).toEqual([
      { word: "2階(にかい)", kanji: "2階", ruby: "にかい", reading: "にかい" },
      { word: "床(ゆか)", kanji: "床", ruby: "ゆか", reading: "ゆか" },
    ]);
  });

  it("ignores grammar after a word and kana that don't fit the kanji", () => {
    expect(glossed("Say 人 が here, and あの方 かた there.")).toEqual([]);
    expect(glossed("勉強 する is the verb.")).toEqual([]);
    expect(glossed("乗(の)り換(か)え")).toEqual([]);
    expect(glossed("Japanese only: 今日 は 晴れ")).toEqual([]);
  });
});
