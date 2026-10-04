import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Illustration } from "./Illustration";
import { grammarPicture, vocabPicture } from "./pictures";
import { usePictureSetting } from "./usePictureSetting";
import { WordCard } from "../WordCard";
import { GrammarPatternCard } from "../GrammarPatternCard";
import { getVocabularyById } from "../../data/vocabulary";
import { grammar } from "../../data/grammar";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  // FuriganaWrapText measures itself; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  localStorage.clear();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const render = (el: ReturnType<typeof createElement>) => act(() => root.render(el));

describe("Illustration", () => {
  it("draws an emoji in a tile with its motion", () => {
    render(createElement(Illustration, { picture: { src: "🐈", motion: "bob" } }));
    expect(host.querySelector(".pic-emoji")?.textContent).toBe("🐈");
    expect(host.querySelector(".pic-motion--bob")).not.toBeNull();
    expect(host.querySelector(".pic-tile")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws an svg picture; spin turns its parts, not the tile", () => {
    render(createElement(Illustration, { picture: { src: "svg:washer", motion: "spin" } }));
    expect(host.querySelector("svg.pic-svg .pic-anim-spin")).not.toBeNull();
    expect(host.querySelector(".pic-motion--spin")).toBeNull();
    expect(host.querySelector(".pic-motion--bob")).not.toBeNull();
  });

  it("draws nothing for no picture or an unknown drawing", () => {
    render(createElement(Illustration, { picture: null }));
    expect(host.innerHTML).toBe("");
    render(createElement(Illustration, { picture: { src: "svg:nope", motion: "bob" } }));
    expect(host.innerHTML).toBe("");
  });
});

describe("cards", () => {
  it("WordCard shows the word's picture only when asked", () => {
    const item = getVocabularyById(4462)!; // 洗濯機
    render(createElement(WordCard, { item }));
    expect(host.querySelector(".pic-tile")).toBeNull();
    render(createElement(WordCard, { item, showPicture: true }));
    expect(host.querySelector(".pic-tile")?.getAttribute("data-picture")).toBe("svg:washer");
    expect(vocabPicture(4462)?.src).toBe("svg:washer");
  });

  it("GrammarPatternCard shows the pattern's picture when asked", () => {
    const item = grammar[0];
    render(createElement(GrammarPatternCard, { item, showPicture: true }));
    expect(host.querySelector(".pic-tile")?.getAttribute("data-picture")).toBe(grammarPicture(item.id)?.src);
  });
});

describe("usePictureSetting", () => {
  function Probe() {
    const [on, toggle] = usePictureSetting();
    return createElement("button", { onClick: toggle }, on ? "on" : "off");
  }

  it("is on by default and remembers being switched off", () => {
    render(createElement(Probe));
    const btn = () => host.querySelector("button")!;
    expect(btn().textContent).toBe("on");
    act(() => btn().click());
    expect(btn().textContent).toBe("off");
    expect(localStorage.getItem("jlpt-trainer:player-pictures:v1")).toBe("off");
    act(() => root.unmount());
    root = createRoot(host);
    render(createElement(Probe));
    expect(btn().textContent).toBe("off");
  });
});
