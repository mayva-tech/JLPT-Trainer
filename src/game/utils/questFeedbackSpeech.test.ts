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
      {
        language: "en",
        text: "That would sound unnatural here.\nBetter:",
      },
      { language: "ja", text: "転入届を出したいんですが。" },
      { language: "ja", text: "届を出す" },
      {
        language: "en",
        text: "means to submit/file a notification or form.",
      },
    ]);
  });

  it("keeps tip title and body on separate lines for Andrew's pause", () => {
    expect(
      parseBilingualSpeakSegments("✓ Natural\n\nClear purpose.")
    ).toEqual([
      { language: "en", text: "Natural\nClear purpose." },
    ]);
    expect(
      parseBilingualSpeakSegments(
        "✓ Natural\n\nClear purpose. 「〜したいです」works politely at a counter."
      )
    ).toEqual([
      { language: "en", text: "Natural\nClear purpose." },
      { language: "ja", text: "〜したいです" },
      { language: "en", text: "works politely at a counter." },
    ]);
    expect(
      parseBilingualSpeakSegments(
        "△ Awkward\n\nVague 「いろいろ」before facts wastes a manager's time."
      )
    ).toEqual([
      { language: "en", text: "Awkward\nVague" },
      { language: "ja", text: "いろいろ" },
      {
        language: "en",
        text: "before facts wastes a manager's time.",
      },
    ]);
  });

  it("merges adjacent Japanese quotes after wave-dash normalize", () => {
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

  it("routes unquoted JP glosses to Nanami, not Andrew", () => {
    expect(
      parseBilingualSpeakSegments(
        "ご用件 = your business / reason for coming."
      )
    ).toEqual([
      { language: "ja", text: "ご用件" },
      { language: "en", text: "your business / reason for coming." },
    ]);
    expect(
      parseBilingualSpeakSegments(
        "転入届 = moving-in notification (registering a new address)."
      )
    ).toEqual([
      { language: "ja", text: "転入届" },
      {
        language: "en",
        text: "moving-in notification (registering a new address).",
      },
    ]);
    expect(parseBilingualSpeakSegments("改札 = ticket gates.")).toEqual([
      { language: "ja", text: "改札" },
      { language: "en", text: "ticket gates." },
    ]);
  });

  it("speaks repair tips with Nanami for 「ゆっくり」 then Andrew for the gloss", () => {
    expect(
      parseBilingualSpeakSegments(
        "✓ Repair\n\n「ゆっくり」buys listening time."
      )
    ).toEqual([
      { language: "en", text: "Repair" },
      { language: "ja", text: "ゆっくり" },
      { language: "en", text: "buys listening time." },
    ]);
  });

  it("splits multiple unquoted JP runs in one help line", () => {
    expect(
      parseBilingualSpeakSegments(
        "いりますか？= do you need…？ 結構です declines politely."
      )
    ).toEqual([
      { language: "ja", text: "いりますか？" },
      { language: "en", text: "do you need…？" },
      { language: "ja", text: "結構です" },
      { language: "en", text: "declines politely." },
    ]);
    expect(
      parseBilingualSpeakSegments(
        "Particles dropped — 今どこにいるの？ shrinks to 今どこ？"
      )
    ).toEqual([
      { language: "en", text: "Particles dropped" },
      { language: "ja", text: "今どこにいるの？" },
      { language: "en", text: "shrinks to" },
      { language: "ja", text: "今どこ？" },
    ]);
    expect(
      parseBilingualSpeakSegments(
        "してんの ≈ しているの — てる often shrinks in casual speech."
      )
    ).toEqual([
      { language: "ja", text: "してんの" },
      { language: "ja", text: "しているの" },
      { language: "ja", text: "てる" },
      { language: "en", text: "often shrinks in casual speech." },
    ]);
  });

  it("reports speakable when any text remains", () => {
    expect(hasSpeakableFeedback("✅ Correct")).toBe(true);
    expect(hasSpeakableFeedback("")).toBe(false);
    expect(hasSpeakableFeedback("✅")).toBe(false);
  });
});
