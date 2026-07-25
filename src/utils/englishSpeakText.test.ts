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

  it("does not speak parenthetical notes like (formal)", () => {
    expect(
      buildEnglishSpeakText(
        "on the occasion of; at the time of (formal)"
      )
    ).toBe("on the occasion of; at the time of");
    expect(
      buildEnglishSpeakText("must be; certainly (strong inference)")
    ).toBe("must be; certainly");
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
});
