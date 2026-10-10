import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import EverydayTrainer from "./EverydayTrainer";
import { EVERYDAY_PROGRESS_KEY } from "./everydayProgress";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

function click(el: Element | null | undefined) {
  expect(el, "element to click").toBeTruthy();
  act(() => (el as HTMLElement).click());
}

function button(text: string): HTMLButtonElement | undefined {
  return [...host.querySelectorAll("button")].find((b) => b.textContent?.includes(text));
}

function saved() {
  return JSON.parse(localStorage.getItem(EVERYDAY_PROGRESS_KEY) ?? "{}");
}

beforeEach(() => {
  localStorage.clear();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(EverydayTrainer)));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("Everyday Japanese page", () => {
  it("shows the title and all 18 locations with thumbnails", () => {
    expect(host.querySelector(".ev-title")?.textContent).toContain("Everyday Japanese");
    expect(host.querySelector(".ev-tagline")?.textContent).toBe("Explore Japan, one word at a time.");
    const tiles = host.querySelectorAll(".ev-tile");
    expect(tiles).toHaveLength(18);
    for (const t of tiles) expect(t.querySelector(".ev-pic"), t.textContent ?? "").not.toBeNull();
  });

  it("opens a location on its own first word and saves progress", () => {
    click(button("Inside Train"));
    const card = host.querySelector(".ev-card");
    expect(card?.textContent).toContain("Hand strap");
    expect(card?.textContent).toContain("tsurikawa");
    expect(card?.querySelector(".ev-pic")?.getAttribute("aria-label")).toBe("Picture: Hand strap");
    expect(saved().practiced).toContain("hand-strap");
    expect(saved().resume).toEqual({ categoryId: "train", wordId: "hand-strap" });

    click(button("Learn"));
    expect(saved().known).toEqual(["hand-strap"]);
    click(button("Save"));
    expect(saved().favorites).toEqual(["hand-strap"]);

    click(host.querySelector('[aria-label="Next word"]'));
    expect(host.querySelector(".ev-card")?.textContent).toContain("Overhead luggage rack");
  });

  it("finds words by romaji and kana, and opens the match", () => {
    const input = host.querySelector<HTMLInputElement>(".ev-search input")!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    act(() => {
      setValue.call(input, "kaisatsu");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const results = host.querySelectorAll(".ev-results li button");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.textContent).toContain("Ticket gate");
    click(results[0]);
    expect(host.querySelector(".ev-card")?.textContent).toContain("Ticket gate");
  });

  it("runs a Picture Quiz and records the answer", () => {
    click(button("Street"));
    click(button("Picture Quiz"));
    expect(host.querySelector(".ev-prompt")?.textContent).toBe("What is this called in Japanese?");
    const options = host.querySelectorAll(".ev-opt");
    expect(options).toHaveLength(4);
    click(options[0]);
    expect(host.querySelector(".ev-feedback")).not.toBeNull();
    expect(Object.keys(saved().stats ?? {})).toHaveLength(1);
  });

  it("hides the words in picture-first mode until revealed", () => {
    click(button("Inside Train"));
    click([...host.querySelectorAll("label")].find((l) => l.textContent?.includes("Picture first"))?.querySelector("input"));
    expect(host.querySelector(".ev-card")?.textContent).not.toContain("Hand strap");
    click(button("Tap to show"));
    expect(host.querySelector(".ev-card")?.textContent).toContain("Hand strap");
  });

  it("disables Quick Review until a word has been met", () => {
    expect(button("Quick Review")?.disabled).toBe(true);
  });

  it("draws the location's own stage ambience, with no paper frame behind the picture", () => {
    expect(host.querySelector(".app-amb .amb-layer")?.getAttribute("data-theme")).toBe("scramble");
    click(button("Inside Train"));
    expect(host.querySelector(".app-amb .amb-layer:not(.amb-layer--leaving)")?.getAttribute("data-theme")).toBe("trainWindow");
  });

  it("keeps the talking heads off the picture and the Japanese word", () => {
    click(button("Inside Train"));
    expect(host.querySelector(".ev-card-picture .ev-pic")?.hasAttribute("data-head-avoid")).toBe(true);
    expect(host.querySelector(".ev-card .ev-jp")?.hasAttribute("data-head-avoid")).toBe(true);
    click(button("Picture Quiz"));
    expect(host.querySelector(".ev-quiz-picture .ev-pic")?.hasAttribute("data-head-avoid")).toBe(true);
  });
});
