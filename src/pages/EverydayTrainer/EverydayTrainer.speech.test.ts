import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { speechService, type SpeakCallbacks } from "../../services/speechService";
import EverydayTrainer from "./EverydayTrainer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let spoken: string[];

function click(el: Element | null | undefined) {
  expect(el, "element to click").toBeTruthy();
  act(() => (el as HTMLElement).click());
}
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.includes(text));

/** Fake voices: log each utterance and finish it a moment later. */
function fakeVoice(lang: "ja" | "en") {
  return (text: string, callbacks?: SpeakCallbacks) => {
    spoken.push(`${lang}:${text}`);
    setTimeout(() => callbacks?.onEnd?.(), 10);
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  spoken = [];
  vi.spyOn(speechService, "speakJapanese").mockImplementation(fakeVoice("ja"));
  vi.spyOn(speechService, "speakEnglish").mockImplementation(fakeVoice("en"));
  localStorage.clear();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(EverydayTrainer)));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(20_000));

describe("Everyday Japanese voices", () => {
  it("Play reads Japanese (Nanami), English (Andrew), then the nuance run by run", () => {
    click(button("Inside Train"));
    click(button("Play"));
    settle();
    expect(spoken).toEqual([
      "ja:つり革",
      "en:Hand strap",
      "en:The hanging straps standing passengers hold. Also written",
      "ja:つりかわ",
    ]);
  });

  it("follows the play order and still reads the nuance", () => {
    click(button("Inside Train"));
    click(button("EN → JP"));
    click(button("Play"));
    settle();
    expect(spoken.slice(0, 2)).toEqual(["en:Hand strap", "ja:つり革"]);
    expect(spoken.length).toBe(4);
  });

  it("reads just the note when the nuance is tapped, and highlights it", () => {
    click(button("Inside Train"));
    const note = host.querySelector(".ev-nuance--btn");
    expect(note?.querySelector("ruby")).not.toBeNull();
    click(note);
    expect(host.querySelector(".ev-nuance--btn")?.classList.contains("ev-speaking")).toBe(true);
    expect(host.querySelector(".ev-nuance--btn")?.hasAttribute("data-head-avoid")).toBe(true);
    settle();
    expect(spoken[0]).toBe("en:The hanging straps standing passengers hold. Also written");
    expect(host.querySelector(".ev-nuance--btn")?.classList.contains("ev-speaking")).toBe(false);
  });

  it("auto-play reads each card's nuance before moving on", () => {
    click(button("Inside Train"));
    click(button("Auto-play"));
    act(() => vi.advanceTimersByTime(3_000));
    expect(spoken.slice(0, 4)).toEqual([
      "ja:つり革",
      "en:Hand strap",
      "en:The hanging straps standing passengers hold. Also written",
      "ja:つりかわ",
    ]);
    act(() => vi.advanceTimersByTime(4_000));
    expect(spoken).toContain("ja:網棚");
    click(button("Stop"));
  });
});
