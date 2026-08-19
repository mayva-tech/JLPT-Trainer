import { describe, expect, it } from "vitest";
import { buildEnglishSpeakText } from "./englishSpeakText";

describe("buildEnglishSpeakText", () => {
  it('speaks "fare" as "fair" (not "far")', () => {
    expect(buildEnglishSpeakText("fare")).toBe("fair");
  });

  it("fixes fare inside phrases", () => {
    expect(buildEnglishSpeakText("the train fare")).toBe("the train fair");
    expect(buildEnglishSpeakText("The fare has gone up.")).toBe(
      "The fair has gone up."
    );
  });

  it("does not change unrelated words", () => {
    expect(buildEnglishSpeakText("far away")).toBe("far away");
    expect(buildEnglishSpeakText("affair")).toBe("affair");
  });

  it("preserves case", () => {
    expect(buildEnglishSpeakText("Fare")).toBe("Fair");
  });

  it('speaks "lecture" as "lekcher" (clearer noun pronunciation)', () => {
    expect(buildEnglishSpeakText("lecture")).toBe("lekcher");
    expect(buildEnglishSpeakText("a university lecture")).toBe(
      "a university lekcher"
    );
    expect(buildEnglishSpeakText("Lecture")).toBe("Lekcher");
  });

  it('speaks verb "live" as /lɪv/ and "die" as /daɪ/', () => {
    expect(buildEnglishSpeakText("to live")).toBe("to liv");
    expect(buildEnglishSpeakText("to die")).toBe("to dai");
    expect(buildEnglishSpeakText("Live")).toBe("Liv");
    expect(buildEnglishSpeakText("Die")).toBe("Dai");
  });

  it('speaks "strange; odd" under 変 as two clear words', () => {
    expect(buildEnglishSpeakText("strange; odd")).toBe("straynge, awd");
    expect(buildEnglishSpeakText("strange; funny")).toBe("straynge, funny");
    expect(buildEnglishSpeakText("Strange")).toBe("Straynge");
    expect(buildEnglishSpeakText("odd")).toBe("awd");
  });

  it("does not speak parenthetical notes like (formal)", () => {
    expect(
      buildEnglishSpeakText(
        "on the occasion of; at the time of (formal)"
      )
    ).toBe("on the occasion of, at the time of");
    expect(
      buildEnglishSpeakText("must be; certainly (strong inference)")
    ).toBe("must be, certainly");
    expect(buildEnglishSpeakText("word (note) and more (also)")).toBe(
      "word and more"
    );
  });

  it("pauses after grammar-slot ～ / 〜 / ~", () => {
    expect(buildEnglishSpeakText("not only ～ but also")).toBe(
      "not only, but also"
    );
    expect(buildEnglishSpeakText("not only 〜 but also")).toBe(
      "not only, but also"
    );
    expect(buildEnglishSpeakText("A ~ B ~ C")).toBe("A, B, C");
  });

  it('pauses on "/" instead of saying "slash"', () => {
    expect(
      buildEnglishSpeakText("to make/let someone do (causative)")
    ).toBe("to make ... let someone do");
    expect(buildEnglishSpeakText("〜せる / させる")).toBe("せる ... させる");
    expect(buildEnglishSpeakText("make / let")).toBe("make ... let");
  });

  it("speaks yen amounts as words, not digits", () => {
    expect(buildEnglishSpeakText("Taking 1,000 yen")).toBe(
      "Taking one thousand yen"
    );
    expect(buildEnglishSpeakText("Out of 1,000 yen")).toBe(
      "Out of one thousand yen"
    );
    expect(buildEnglishSpeakText("Out of 1,000")).toBe("Out of one thousand");
    expect(buildEnglishSpeakText("That will be 800 yen altogether")).toBe(
      "That will be eight hundred yen altogether"
    );
    expect(buildEnglishSpeakText("200 yen is your change")).toBe(
      "two hundred yen is your change"
    );
    expect(buildEnglishSpeakText("The total is 3,000 yen. Cash only")).toBe(
      "The total is three thousand yen. Cash only"
    );
    expect(buildEnglishSpeakText("Postage is 900 yen, and it arrives tomorrow")).toBe(
      "Postage is nine hundred yen, and it arrives tomorrow"
    );
    expect(buildEnglishSpeakText("It's 200 yen. You can buy it at that machine")).toBe(
      "It's two hundred yen. You can buy it at that machine"
    );
    expect(buildEnglishSpeakText("a 1,000-yen bill")).toBe(
      "a one thousand yen bill"
    );
    expect(buildEnglishSpeakText("That bicycle cost 30,000 yen.")).toBe(
      "That bicycle cost thirty thousand yen."
    );
    expect(buildEnglishSpeakText("10,000 yen")).toBe("ten thousand yen");
  });

  it("does not rewrite non-money numbers", () => {
    expect(buildEnglishSpeakText("lesson 12")).toBe("lesson 12");
    expect(buildEnglishSpeakText("There is a five-yen charge")).toBe(
      "There is a five-yen charge"
    );
  });
});
