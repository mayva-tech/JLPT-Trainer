import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus } from "../../services/reactionBus";
import TalkingHead from "./TalkingHead";
import * as sfx from "./suitSfx";
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
const seatEl = (voice: "ja" | "en") => host.querySelector<HTMLElement>(`.th-seat[data-voice="${voice}"]`)!;
const suitBtn = (voice: "ja" | "en") => seatEl(voice).querySelector<HTMLButtonElement>(".th-suit-btn")!;
const lookBtn = (voice: "ja" | "en") => seatEl(voice).querySelector<HTMLButtonElement>(".th-look-btn")!;
const suits = () => host.querySelectorAll(".th-suit-helmet").length;
const stored = () => JSON.parse(localStorage.getItem(SUIT_KEY) ?? "{}") as Record<string, boolean>;
function duo() {
  say("ja");
  stop();
  say("en");
}

describe("TalkingHead mecha suit", () => {
  it("is off by default and the button puts it on", () => {
    say("ja");
    expect(suits()).toBe(0);
    expect(button().getAttribute("aria-pressed")).toBe("false");
    act(() => button().click());
    expect(suits()).toBe(1);
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(stored()).toEqual({ ja: true, en: false });
    expect(host.querySelector(".th-look-toast")?.textContent).toBe("Mecha suit on");
  });

  it("plays the reveal once, right after switching on", () => {
    say("ja");
    act(() => button().click());
    expect(host.querySelector(".th-seat--suit-reveal")).not.toBeNull();
    act(() => vi.advanceTimersByTime(SUIT_REVEAL_MS + 50));
    expect(host.querySelector(".th-seat--suit-reveal")).toBeNull();
    expect(suits()).toBe(1);
  });

  it("in duo each head has its own buttons and suits up separately", () => {
    duo();
    expect(host.querySelectorAll(".th-seat .th-controls")).toHaveLength(2);
    act(() => suitBtn("en").click());
    expect(seatEl("en").querySelector(".th-suit-helmet")).not.toBeNull();
    expect(seatEl("ja").querySelector(".th-suit-helmet")).toBeNull();
    expect(host.querySelector(".th-look-toast")?.textContent).toBe("Andrew: Mecha suit on");
    act(() => suitBtn("ja").click());
    expect(suits()).toBe(2);
    expect(host.querySelectorAll(".th-seat .th-mouth")).toHaveLength(2);
  });

  it("in duo each head's look button changes only that head", () => {
    duo();
    const label = (v: "ja" | "en") => seatEl(v).querySelector(".th-svg")?.getAttribute("aria-label");
    const ja = label("ja");
    const en = label("en");
    act(() => lookBtn("ja").click());
    expect(label("ja")).not.toBe(ja);
    expect(label("en")).toBe(en);
    expect(host.querySelector(".th-look-toast")?.textContent).toMatch(/^Nanami: /);
  });

  it("A toggles the speaker's suit from the keyboard and the button takes it off", () => {
    say("en");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true })));
    expect(suits()).toBe(1);
    expect(stored()).toEqual({ ja: false, en: true });
    act(() => button().click());
    expect(suits()).toBe(0);
    expect(stored()).toEqual({ ja: false, en: false });
  });

  it("an older saved \"on\" suits both heads", () => {
    act(() => root.unmount());
    host.remove();
    localStorage.setItem(SUIT_KEY, "on");
    mount();
    duo();
    expect(suits()).toBe(2);
  });

  it("the look button changes the look; double-clicking the head no longer does", () => {
    say("ja");
    const label = () => host.querySelector(".th-svg")?.getAttribute("aria-label");
    const before = label();
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
    expect(label()).toBe(before);
    act(() => host.querySelector<HTMLButtonElement>(".th-look-btn")!.click());
    expect(label()).not.toBe(before);
    expect(host.querySelector(".th-look-toast")).not.toBeNull();
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

  it("plays the suit-up sound on, the suit-down sound off, and nothing on load", () => {
    const on = vi.spyOn(sfx, "playSuitOn");
    const off = vi.spyOn(sfx, "playSuitOff");
    say("ja");
    act(() => button().click());
    expect(on).toHaveBeenCalledTimes(1);
    expect(off).not.toHaveBeenCalled();
    act(() => button().click());
    expect(off).toHaveBeenCalledTimes(1);
    act(() => button().click());
    act(() => root.unmount());
    host.remove();
    mount();
    say("ja");
    expect(on).toHaveBeenCalledTimes(2);
    expect(off).toHaveBeenCalledTimes(1);
    on.mockRestore();
    off.mockRestore();
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
    expect(host.querySelector(".th-seat--suit-reveal")).toBeNull();
  });
});
