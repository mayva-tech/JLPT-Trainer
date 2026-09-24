import { describe, expect, it } from "vitest";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";
import {
  buildJapaneseHighlightUnits,
  buildJapaneseSpokenKaraokeSteps,
} from "./speechHighlightUnits";
import { alignFuriganaWithTokenSpans } from "./alignFurigana";

describe("カード karaoke", () => {
  it("spaced reading: カード spokenText is findable in Nanami audio", () => {
    const surface = "はい、在留カードを持っています。";
    const reading = "はい、 ざいりゅう かーど を もって います。";
    const audio = buildJapaneseSpeakText(surface, reading);
    const units = buildJapaneseHighlightUnits(surface);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);
    const kado = steps.find((s) => s.text.includes("カード"));
    expect(kado).toBeTruthy();
    expect(audio.includes(kado!.spokenText)).toBe(true);
    expect(kado!.spokenText).toMatch(/かど/);
    expect(kado!.spokenText).not.toMatch(/かあど/);
  });

  it("glued ざいりゅうカード: audio is hiragana and token span covers カード", () => {
    const surface = "はい、在留カードを持っています。";
    const reading = "はい、 ざいりゅうカード を もって います。";
    const audio = buildJapaneseSpeakText(surface, reading);
    expect(audio).toContain("かど");
    expect(audio).not.toContain("かあど");
    expect(audio).not.toMatch(/カ[ぁあ]/);

    const { tokenSpans } = alignFuriganaWithTokenSpans(surface, reading);
    const cardSpan = tokenSpans.find((s) => s.token.includes("カード"));
    expect(cardSpan).toBeTruthy();
    expect(surface.slice(cardSpan!.start, cardSpan!.end)).toContain("カード");

    const units = buildJapaneseHighlightUnits(surface);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading, units);
    const kado = steps.find((s) => s.text.includes("カード"));
    expect(kado).toBeTruthy();
    // Soft script-insensitive: spoken かど must occur in audio as kana
    const compact = audio.replace(/\s+/g, "");
    expect(compact.includes(kado!.spokenText.replace(/\s+/g, ""))).toBe(true);
  });

  it("マイナンバーカード speaks card as かど, not かあど", () => {
    expect(
      buildJapaneseSpeakText(
        "保険証かマイナンバーカードを見せてほしい。",
        "ほけん しょう か、 マイナンバーカード を みせて ほしい。"
      )
    ).toMatch(/マイナンバーかど|まいなんばあかど/);
    expect(
      buildJapaneseSpeakText("カード", "カード")
    ).toBe("かど");
  });
});
