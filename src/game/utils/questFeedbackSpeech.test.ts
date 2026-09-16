import { describe, expect, it } from "vitest";
import {
  hasSpeakableFeedback,
  parseBilingualSpeakSegments,
} from "./questFeedbackSpeech";

describe("parseBilingualSpeakSegments", () => {
  it("speaks Japanese gloss then English definition", () => {
    expect(
      parseBilingualSpeakSegments(
        "「届を出す」 means to submit/file a notification or form."
      )
    ).toEqual([
      { language: "ja", text: "届を出す" },
      {
        language: "en",
        text: "means to submit/file a notification or form.",
      },
    ]);
  });

  it("handles Better: lines with a quoted Japanese answer", () => {
    expect(
      parseBilingualSpeakSegments(
        "❌ That would sound unnatural here.\n\nBetter: 「転入届を出したいんですが。」\n\n「届を出す」 means to submit/file a notification or form."
      )
    ).toEqual([
      { language: "en", text: "That would sound unnatural here. Better:" },
      { language: "ja", text: "転入届を出したいんですが。" },
      { language: "ja", text: "届を出す" },
      {
        language: "en",
        text: "means to submit/file a notification or form.",
      },
    ]);
  });

  it("merges adjacent Japanese quotes after wave-dash normalize", () => {
    // Adjacent JA segments merge when no EN between them.
    const segs = parseBilingualSpeakSegments(
      "✅ Soft purpose with 「お伺いしたいんですが」."
    );
    expect(segs).toEqual([
      { language: "en", text: "Soft purpose with" },
      { language: "ja", text: "お伺いしたいんですが" },
    ]);
  });

  it("keeps grammar wave dash inside Japanese segments", () => {
    expect(
      parseBilingualSpeakSegments("「〜たいんですが」softens a counter request.")
    ).toEqual([
      { language: "ja", text: "〜たいんですが" },
      { language: "en", text: "softens a counter request." },
    ]);
  });

  it("keeps pure English feedback speakable", () => {
    expect(
      parseBilingualSpeakSegments("❌ That would sound unnatural here.")
    ).toEqual([{ language: "en", text: "That would sound unnatural here." }]);
  });

  it("handles equals-style vocab glosses", () => {
    expect(
      parseBilingualSpeakSegments("✅ 「現住所」= current address.")
    ).toEqual([
      { language: "ja", text: "現住所" },
      { language: "en", text: "current address." },
    ]);
  });

  it("reports speakable when any text remains", () => {
    expect(hasSpeakableFeedback("✅ Correct")).toBe(true);
    expect(hasSpeakableFeedback("")).toBe(false);
    expect(hasSpeakableFeedback("✅")).toBe(false);
  });
});
