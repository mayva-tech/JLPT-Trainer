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
});
