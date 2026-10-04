import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus } from "../../services/reactionBus";
import TalkingHead from "./TalkingHead";
import { SUIT_REVEAL_MS } from "./useSuitMode";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";
let host: HTMLDivElement;
let root: Root;

function mount() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(TalkingHead)));
}

beforeEach(() => {
  vi.useFakeTimers();
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  localStorage.clear();
  mount();
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  __resetSpeechBus();
  __resetReactionBus();
  vi.useRealTimers();
});

function say(lang: "ja" | "en") {
  act(() => emitSpeechEvent({ type: "start", lang, rate: 1 }));
}
function stop() {
  act(() => emitSpeechEvent({ type: "end" }));
}
const button = () => host.querySelector<HTMLButtonElement>(".th-suit-btn")!;
const suits = () => host.querySelectorAll(".th-suit-helmet").length;

describe("TalkingHead mecha suit", () => {
  it("is off by default and the button puts it on", () => {
    say("ja");
    expect(suits()).toBe(0);
    expect(button().getAttribute("aria-pressed")).toBe("false");
    act(() => button().click());
    expect(suits()).toBe(1);
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem(SUIT_KEY)).toBe("on");
    expect(host.querySelector(".th-look-toast")?.textContent).toBe("Mecha suit on");
  });

  it("plays the reveal once, right after switching on", () => {
    say("ja");
    act(() => button().click());
    expect(host.querySelector(".th-root--suit-reveal")).not.toBeNull();
    act(() => vi.advanceTimersByTime(SUIT_REVEAL_MS + 50));
    expect(host.querySelector(".th-root--suit-reveal")).toBeNull();
    expect(host.querySelector(".th-root--suit")).not.toBeNull();
  });

  it("suits up both heads in duo and the face keeps its mouth", () => {
    say("ja");
    stop();
    say("en");
    act(() => button().click());
    expect(suits()).toBe(2);
    expect(host.querySelectorAll(".th-seat .th-mouth")).toHaveLength(2);
  });

  it("A toggles it from the keyboard and the button takes it off", () => {
    say("en");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true })));
    expect(suits()).toBe(1);
    act(() => button().click());
    expect(suits()).toBe(0);
    expect(localStorage.getItem(SUIT_KEY)).toBe("off");
  });

  it("the button does not start a drag or change the look", () => {
    say("ja");
    const before = host.querySelector(".th-svg")?.getAttribute("aria-label");
    act(() => {
      button().dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    expect(host.querySelector(".th-look-toast")).toBeNull();
    expect(host.querySelector(".th-svg")?.getAttribute("aria-label")).toBe(before);
  });

  it("is remembered on the next visit", () => {
    say("ja");
    act(() => button().click());
    act(() => root.unmount());
    host.remove();
    __resetSpeechBus();
    mount();
    say("ja");
    expect(suits()).toBe(1);
    expect(host.querySelector(".th-root--suit-reveal")).toBeNull();
  });
});
