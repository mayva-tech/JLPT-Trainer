import { describe, expect, it } from "vitest";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";
import {
  buildJapaneseHighlightUnits,
  buildJapaneseSpokenKaraokeSteps,
} from "./speechHighlightUnits";

describe("first week karaoke coverage", () => {
  const surface =
    "ことば町での最初の一週間。今日は一日中、日本語で乗り切れるか？";
  const reading =
    "ことばまち で の さいしょ の いっしゅうかん。きょう は いちにちじゅう、 にほんご で のりきれる か？";

  it("emits separate spoken steps for さいしょ and にほんご that exist in Nanami audio", () => {
    const audio = buildJapaneseSpeakText(surface, reading);
    const units = buildJapaneseHighlightUnits(surface);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);

    // Display units may glue particles (最初の / 日本語で), but spoken forms
    // must stay as reading tokens so boundary rebase can find them in audio.
    expect(audio.includes("さいしょ")).toBe(true);
    expect(audio.includes("にほんご")).toBe(true);
    expect(audio.includes("さいしょの")).toBe(false);
    expect(audio.includes("にほんごで")).toBe(false);

    const saisho = steps.filter((s) => s.spokenText.includes("さいしょ"));
    const nihongo = steps.filter((s) => s.spokenText.includes("にほんご"));
    expect(saisho.length).toBeGreaterThanOrEqual(1);
    expect(nihongo.length).toBeGreaterThanOrEqual(1);

    // Must not glue particle into spokenText (breaks boundary mapping).
    expect(saisho.some((s) => s.spokenText === "さいしょの")).toBe(false);
    expect(nihongo.some((s) => s.spokenText === "にほんごで")).toBe(false);

    // Highlight ranges must cover the kanji themselves.
    expect(
      steps.some((s) => s.text.includes("最") || s.text.includes("初"))
    ).toBe(true);
    expect(steps.some((s) => s.text.includes("日") && s.start >= 20)).toBe(
      true
    );
  });

  it("covers every non-punct character including 最初 and 日本語", () => {
    const units = buildJapaneseHighlightUnits(surface);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);
    const covered = new Array(surface.length).fill(false);
    for (const s of steps) {
      for (let i = s.start; i < s.end; i++) covered[i] = true;
    }
    const missed = [...surface]
      .map((ch, i) => (covered[i] || /[。、？]/.test(ch) ? null : `${i}:${ch}`))
      .filter(Boolean);
    expect(missed).toEqual([]);
  });
});

describe("haruka cafe-invite karaoke coverage", () => {
  const surface = "じゃあ一緒に行こうか？カフェ寄ってもいいし。";
  const reading = "じゃあ いっしょ に いこう か？ かふぇ よって も いい し。";

  it("covers the full invite line with spoken steps for カフェ / 寄って", () => {
    const units = buildJapaneseHighlightUnits(surface);
    const audio = buildJapaneseSpeakText(surface, reading);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);
    expect(audio.replace(/\s+/g, "")).toContain("かふぇ");
    expect(steps.map((s) => s.text).join("")).toBe(surface);
    expect(steps.some((s) => s.text === "カフェ" && s.spokenText.includes("かふぇ"))).toBe(
      true
    );
    expect(steps.some((s) => s.text.includes("寄") && s.spokenText.includes("よ"))).toBe(
      true
    );
  });
});

describe("station notice body karaoke coverage", () => {
  const surface =
    "【お知らせ】中央線は信号点検のため、本日22時以降、一部列車の運転を見合わせる場合があります。お乗り換えの際は、改札内の案内表示をご確認ください。";
  const reading =
    "【 おしらせ 】 ちゅうおうせん は しんごう てんけん の ため、 ほんじつ にじゅうにじ いこう、 いちぶ れっしゃ の うんてん を みあわせる ばあい が あります。 お のりかえ の さい は、 かいさつない の あんない ひょうじ を ごかくにん ください。";

  it("aligns 22時 as にじゅうにじ and keeps spoken steps on the right glyphs", () => {
    const units = buildJapaneseHighlightUnits(surface);
    const audio = buildJapaneseSpeakText(surface, reading);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);
    expect(audio.replace(/\s+/g, "")).toContain("にじゅうにじ");
    expect(audio.replace(/\s+/g, "")).not.toMatch(/ににじ/);
    expect(steps.map((s) => s.text).join("")).toBe(surface);
    const clock = steps.find((s) => s.text === "22" || s.text.startsWith("22"));
    expect(clock?.spokenText.replace(/\s+/g, "")).toContain("にじゅうに");
    expect(
      steps.some((s) => s.text.includes("中央") && s.spokenText.includes("ちゅうおう"))
    ).toBe(true);
    expect(
      steps.some((s) => s.text.includes("見合") && s.spokenText.includes("みあ"))
    ).toBe(true);
  });
});
