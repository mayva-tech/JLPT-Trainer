import { describe, expect, it } from "vitest";
import {
  alignFurigana,
  alignFuriganaWithTokenSpans,
  ensureKanjiReadingsSeeded,
  karaokeTokenSpansAreUsable,
} from "./alignFurigana";

describe("ensureKanjiReadingsSeeded", () => {
  it("aligns a dictionary compound without importing the vocabulary corpus", () => {
    const segments = alignFurigana("在庫", "ざいこ");
    expect(segments).toEqual([
      { text: "在", reading: "ざい" },
      { text: "庫", reading: "こ" },
    ]);
  });

  it("keeps a representative okurigana compound split (品切れ)", () => {
    const segments = alignFurigana("品切れ", "しなぎれ");
    expect(segments).toEqual([
      { text: "品", reading: "しな" },
      { text: "切", reading: "ぎ" },
      { text: "れ" },
    ]);
  });

  it("is safe to call repeatedly", () => {
    ensureKanjiReadingsSeeded();
    const first = alignFurigana("在庫", "ざいこ");
    ensureKanjiReadingsSeeded();
    ensureKanjiReadingsSeeded();
    const second = alignFurigana("在庫", "ざいこ");
    expect(second).toEqual(first);
    expect(second).toEqual([
      { text: "在", reading: "ざい" },
      { text: "庫", reading: "こ" },
    ]);
  });
});

describe("alignFuriganaWithTokenSpans karaoke fallback", () => {
  it("recovers unspaced わたくしが承ります so karaoke can time うけたまわります", () => {
    const surface = "わたくしが承ります。";
    const reading = "わたくしがうけたまわります。";
    const { tokenSpans } = alignFuriganaWithTokenSpans(surface, reading);
    expect(karaokeTokenSpansAreUsable(tokenSpans, surface)).toBe(true);
    expect(tokenSpans.map((s) => s.token.replace(/\s+/g, ""))).toEqual([
      "わたくしが",
      "うけたまわります。",
    ]);
    expect(tokenSpans[1]?.start).toBe(5);
    expect(tokenSpans[1]?.end).toBe(10);
  });
});
