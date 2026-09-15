import { describe, expect, it } from "vitest";
import { styleExpressions } from "../../data/speechStyles";
import {
  buildItemClassificationParts,
  buildItemClassificationSpeech,
} from "./styleSpeechIntro";

describe("buildItemClassificationParts", () => {
  it("returns strength, politeness, and naturalness labels for chip highlighting", () => {
    const item = styleExpressions.find((e) => e.id.includes("watakushi"))
      ?? styleExpressions[0]!;
    const parts = buildItemClassificationParts(item);
    expect(parts).toHaveLength(3);
    expect(parts.map((p) => p.field)).toEqual([
      "classification-strength",
      "classification-politeness",
      "classification-naturalness",
    ]);
    expect(parts.every((p) => p.text.trim().length > 0)).toBe(true);
    expect(buildItemClassificationSpeech(item)).toBe(
      parts.map((p) => p.text).join(". ")
    );
  });
});
