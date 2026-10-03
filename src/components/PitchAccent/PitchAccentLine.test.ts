import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PhrasePitchLine, PitchAccentLine } from "./PitchAccentLine";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const render = (props: { word: string; reading: string; speaking?: boolean }) =>
  act(() => root.render(createElement(PitchAccentLine, props)));

describe("PitchAccentLine", () => {
  it("renders nothing for a word without verified data", () => {
    render({ word: "ぽよぽよ", reading: "ぽよぽよ" });
    expect(host.innerHTML).toBe("");
  });

  it("shows morae with high/low classes, the particle and the accent type", () => {
    render({ word: "どきどき", reading: "どきどき" });
    const morae = [...host.querySelectorAll(".pa-mora:not(.pa-mora--particle)")];
    expect(morae.map((m) => m.textContent)).toEqual(["ど", "き", "ど", "き"]);
    expect(morae.map((m) => m.className.match(/pa-mora--([HL])/)?.[1])).toEqual(["H", "L", "L", "L"]);
    expect(host.querySelector(".pa-tag--on")?.textContent).toContain("Head-high");
    expect(host.querySelectorAll(".pa-dot")).toHaveLength(5);
  });

  it("draws on when speech starts, and switches usage-dependent accents", () => {
    render({ word: "いらいら", reading: "いらいら", speaking: false });
    expect(host.querySelector(".pa-play")).toBeNull();
    render({ word: "いらいら", reading: "いらいら", speaking: true });
    expect(host.querySelector(".pa-play")).not.toBeNull();
    const tags = host.querySelectorAll<HTMLButtonElement>(".pa-tag");
    expect(tags).toHaveLength(2);
    act(() => tags[1].click());
    expect(host.querySelector(".pa-tag--on")?.textContent).toContain("Flat");
    expect(host.querySelector(".pa-sr")?.textContent).toContain("particle H");
  });
});

const renderPhrase = (props: { phrase: string; reading: string; speaking?: boolean }) =>
  act(() => root.render(createElement(PhrasePitchLine, props)));

describe("PhrasePitchLine", () => {
  it("draws each word with its own accent and the particles after it", () => {
    renderPhrase({ phrase: "品切れの商品", reading: "しなぎれ の しょうひん" });
    const figures = [...host.querySelectorAll(".pa-figure")];
    expect(figures).toHaveLength(2);
    const pitch = (f: Element) =>
      [...f.querySelectorAll(".pa-mora:not(.pa-mora--particle)")].map(
        (m) => m.className.match(/pa-mora--([HL])/)?.[1],
      );
    expect(pitch(figures[0])).toEqual(["L", "H", "H", "H"]);
    expect(figures[0].querySelector(".pa-mora--particle")?.textContent).toBe("の");
    expect(pitch(figures[1])).toEqual(["H", "L", "L", "L"]);
    expect(figures[1].querySelector(".pa-mora--particle")).toBeNull();
    expect(host.querySelector(".pa-sr")?.textContent).toContain("の H");
  });

  it("renders nothing for a phrase without a verified line", () => {
    renderPhrase({ phrase: "十人の学生", reading: "じゅうにんの がくせい" });
    expect(host.innerHTML).toBe("");
  });

  it("draws on when the phrase is spoken", () => {
    renderPhrase({ phrase: "花をあげる", reading: "はなをあげる", speaking: false });
    expect(host.querySelector(".pa-play")).toBeNull();
    renderPhrase({ phrase: "花をあげる", reading: "はなをあげる", speaking: true });
    expect(host.querySelector(".pa-play")).not.toBeNull();
  });
});
