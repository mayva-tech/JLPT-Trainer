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

  it("aligns first-week challenge prompt (日本語 / 乗り切れる)", () => {
    const surface =
      "ことば町での最初の一週間。今日は一日中、日本語で乗り切れるか？";
    const reading =
      "ことばまち で の さいしょ の いっしゅうかん。きょう は いちにちじゅう、 にほんご で のりきれる か？";
    const segments = alignFurigana(surface, reading);
    const dump = segments
      .map((s) => (s.reading ? `${s.text}[${s.reading}]` : s.text))
      .join("");
    expect(dump).toBe(
      "ことば町[まち]での最[さい]初[しょ]の一[いっ]週[しゅう]間[かん]。今日[きょう]は一[いち]日[にち]中[じゅう]、日[に]本[ほん]語[ご]で乗[の]り切[き]れるか？"
    );
    // No unaligned kanji left for the destructive kana-anchor fallback
    expect(
      segments.some(
        (s) =>
          !s.reading &&
          [...s.text].some((ch) => /[\u4e00-\u9faf]/.test(ch))
      )
    ).toBe(false);
  });
});
