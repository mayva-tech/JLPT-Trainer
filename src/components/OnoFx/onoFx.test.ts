import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { onomatopoeiaItems as ONOMATOPOEIA } from "../../data/onomatopoeia";
import {
  DEFAULT_ONO_FX,
  ONO_FX_WORDS,
  hasOnoFx,
  onoFxFor,
  toHiragana,
  type OnoParticleKind,
} from "./onoFxData";
import { PARTICLES } from "./onoParticleRecipes";
import { OnoParticles } from "./onoParticles";
import { OnoWordFx } from "./OnoWordFx";

describe("onomatopoeia effects", () => {
  it("maps every word in the corpus explicitly", () => {
    const missing = ONOMATOPOEIA.filter((i) => !hasOnoFx(i.japanese)).map((i) => i.japanese);
    expect(missing).toEqual([]);
  });

  it("has no stale mappings for words that left the corpus", () => {
    const corpus = new Set(ONOMATOPOEIA.map((i) => toHiragana(i.japanese)));
    expect(ONO_FX_WORDS.filter((w) => !corpus.has(w))).toEqual([]);
  });

  it("treats katakana and hiragana alike", () => {
    expect(onoFxFor("ドキドキ")).toEqual(onoFxFor("どきどき"));
    expect(onoFxFor("ゴロゴロ").particles).toBe("rumble");
    expect(onoFxFor("キラキラ").particles).toBe("sparkles");
    expect(onoFxFor("ドキドキ").particles).toBe("hearts");
  });

  it("falls back gently for unknown words", () => {
    expect(onoFxFor("ぽよぽよ")).toEqual(DEFAULT_ONO_FX);
  });

  it("uses hex accent colours", () => {
    for (const i of ONOMATOPOEIA) expect(onoFxFor(i.japanese).color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("renders every particle recipe", () => {
    for (const kind of Object.keys(PARTICLES) as OnoParticleKind[]) {
      const html = renderToStaticMarkup(createElement(OnoParticles, { kind, color: "#123456" }));
      if (kind === "none") expect(html).toBe("");
      else expect(html.match(/class="ono-p"/g)?.length).toBe(PARTICLES[kind].length);
    }
  });

  it("wraps the word with its motion and particles", () => {
    const html = renderToStaticMarkup(
      createElement(OnoWordFx, { word: "どきどき", playKey: 1 }, "どきどき")
    );
    expect(html).toContain("ono-m-pulse");
    expect(html).toContain('data-ono-particles="hearts"');
    expect(html).toContain("どきどき");
  });
});
