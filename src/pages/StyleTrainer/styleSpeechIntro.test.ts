import { describe, expect, it } from "vitest";
import { styleExpressions } from "../../data/speechStyles";
import { fieldLabelHighlight, fieldSpeaking } from "./styleSpeech";
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

describe("fieldLabelHighlight", () => {
  it("lights the whole chip label until word bounds arrive", () => {
    const text = "Old-fashioned";
    const target = {
      id: "x",
      field: "classification-naturalness" as const,
    };
    expect(fieldSpeaking(target, "x", "classification-naturalness")).toBe(
      true
    );
    expect(
      fieldLabelHighlight(
        target,
        null,
        "x",
        "classification-naturalness",
        text
      )
    ).toEqual({ start: 0, end: text.length });
    expect(
      fieldLabelHighlight(
        target,
        { start: 0, end: 3 },
        "x",
        "classification-naturalness",
        text
      )
    ).toEqual({ start: 0, end: 3 });
    expect(
      fieldLabelHighlight(
        target,
        null,
        "other",
        "classification-naturalness",
        text
      )
    ).toBeNull();
  });
});
