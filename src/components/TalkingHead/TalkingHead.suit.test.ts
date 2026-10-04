import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus } from "../../services/reactionBus";
import { __resetSenseiBus, getSenseiSettings } from "../../services/senseiBus";
import TalkingHead from "./TalkingHead";
import HeadStyleButtons from "./HeadStyleButtons";
import { __resetHeadStyle } from "./headStyleStore";
import * as sfx from "./suitSfx";
import { SUIT_REVEAL_MS } from "./useSuitMode";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Voice = "ja" | "en";
const SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";
let host: HTMLDivElement;
let root: Root;

/** A fresh visit: the head plus the Player bar's Nanami / Andrew buttons. */
function mount() {
  __resetHeadStyle();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() =>
    root.render(createElement(Fragment, null, createElement(TalkingHead), createElement(HeadStyleButtons))),
  );
}

function unmount() {
  act(() => root.unmount());
  host.remove();
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
  unmount();
  __resetHeadStyle();
  __resetSpeechBus();
  __resetReactionBus();
  __resetSenseiBus();
  vi.useRealTimers();
});

function say(lang: Voice) {
  act(() => emitSpeechEvent({ type: "start", lang, rate: 1 }));
}
function stop() {
  act(() => emitSpeechEvent({ type: "end" }));
}
const group = (voice: Voice) =>
  host.querySelector<HTMLElement>(`.head-style-group[aria-label^="${voice === "ja" ? "Nanami" : "Andrew"}"]`)!;
const suitBtn = (voice: Voice) => group(voice).querySelector<HTMLButtonElement>("[aria-pressed]")!;
const lookBtn = (voice: Voice) => group(voice).querySelector<HTMLButtonElement>("button:not([aria-pressed])")!;
const seatEl = (voice: Voice) => host.querySelector<HTMLElement>(`.th-seat[data-voice="${voice}"]`)!;
const suits = () => host.querySelectorAll(".th-suit-helmet").length;
const toast = () => host.querySelector(".th-look-toast")?.textContent;
const stored = () => JSON.parse(localStorage.getItem(SUIT_KEY) ?? "{}") as Record<string, boolean>;
function duo() {
  say("ja");
  stop();
  say("en");
}

describe("TalkingHead look and mecha suit (Player bar buttons)", () => {
  it("the head itself has no buttons; the bar has look and suit for Nanami and Andrew", () => {
    duo();
    expect(host.querySelector(".th-root button")).toBeNull();
    expect(group("ja").textContent).toContain("Nanami");
    expect(group("en").textContent).toContain("Andrew");
    expect(group("ja").querySelectorAll("button")).toHaveLength(2);
    expect(group("en").querySelectorAll("button")).toHaveLength(2);
  });

  it("the Sensei group swaps tanuki and neko and hides / shows the mascot", () => {
    const sensei = host.querySelector<HTMLElement>('.head-style-group[aria-label="Sensei mascot"]')!;
    expect(sensei.textContent).toContain("Tanuki");
    const swapBtn = sensei.querySelector<HTMLButtonElement>("button:not([aria-pressed])")!;
    const showBtn = sensei.querySelector<HTMLButtonElement>("[aria-pressed]")!;
    act(() => swapBtn.click());
    expect(sensei.textContent).toContain("Neko");
    expect(getSenseiSettings().character).toBe("neko");
    expect(showBtn.getAttribute("aria-pressed")).toBe("true");
    act(() => showBtn.click());
    expect(getSenseiSettings().enabled).toBe(false);
    expect(showBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("is off by default and Nanami's suit button puts her suit on", () => {
    say("ja");
    expect(suits()).toBe(0);
    expect(suitBtn("ja").getAttribute("aria-pressed")).toBe("false");
    act(() => suitBtn("ja").click());
    expect(suits()).toBe(1);
    expect(suitBtn("ja").getAttribute("aria-pressed")).toBe("true");
    expect(suitBtn("en").getAttribute("aria-pressed")).toBe("false");
    expect(stored()).toEqual({ ja: true, en: false });
    expect(toast()).toBe("Mecha suit on");
  });

  it("plays the reveal once, right after switching on", () => {
    say("ja");
    act(() => suitBtn("ja").click());
    expect(host.querySelector(".th-seat--suit-reveal")).not.toBeNull();
    act(() => vi.advanceTimersByTime(SUIT_REVEAL_MS + 50));
    expect(host.querySelector(".th-seat--suit-reveal")).toBeNull();
    expect(suits()).toBe(1);
  });

  it("in duo each head suits up separately", () => {
    duo();
    act(() => suitBtn("en").click());
    expect(seatEl("en").querySelector(".th-suit-helmet")).not.toBeNull();
    expect(seatEl("ja").querySelector(".th-suit-helmet")).toBeNull();
    expect(toast()).toBe("Andrew: Mecha suit on");
    act(() => suitBtn("ja").click());
    expect(suits()).toBe(2);
    expect(host.querySelectorAll(".th-seat .th-mouth")).toHaveLength(2);
  });

  it("in duo each look button changes only that head", () => {
    duo();
    const label = (v: Voice) => seatEl(v).querySelector(".th-svg")?.getAttribute("aria-label");
    const ja = label("ja");
    const en = label("en");
    act(() => lookBtn("ja").click());
    expect(label("ja")).not.toBe(ja);
    expect(label("en")).toBe(en);
    expect(toast()).toMatch(/^Nanami: /);
  });

  it("a hidden head's buttons still apply, seen when that head appears", () => {
    say("ja");
    act(() => suitBtn("en").click());
    expect(suits()).toBe(0);
    stop();
    say("en");
    expect(suits()).toBe(1);
  });

  it("A toggles the speaker's suit from the keyboard and the bar button takes it off", () => {
    say("en");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true })));
    expect(suits()).toBe(1);
    expect(stored()).toEqual({ ja: false, en: true });
    expect(suitBtn("en").getAttribute("aria-pressed")).toBe("true");
    act(() => suitBtn("en").click());
    expect(suits()).toBe(0);
    expect(stored()).toEqual({ ja: false, en: false });
  });

  it("an older saved \"on\" suits both heads", () => {
    unmount();
    localStorage.setItem(SUIT_KEY, "on");
    mount();
    duo();
    expect(suits()).toBe(2);
  });

  it("double-clicking the head does not change the look", () => {
    say("ja");
    const label = () => host.querySelector(".th-svg")?.getAttribute("aria-label");
    const before = label();
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
    expect(label()).toBe(before);
    act(() => lookBtn("ja").click());
    expect(label()).not.toBe(before);
    expect(toast()).toBeTruthy();
  });

  it("plays the suit-up sound on, the suit-down sound off, and nothing on load", () => {
    const on = vi.spyOn(sfx, "playSuitOn");
    const off = vi.spyOn(sfx, "playSuitOff");
    say("ja");
    act(() => suitBtn("ja").click());
    expect(on).toHaveBeenCalledTimes(1);
    expect(off).not.toHaveBeenCalled();
    act(() => suitBtn("ja").click());
    expect(off).toHaveBeenCalledTimes(1);
    act(() => suitBtn("ja").click());
    unmount();
    mount();
    say("ja");
    expect(on).toHaveBeenCalledTimes(2);
    expect(off).toHaveBeenCalledTimes(1);
    on.mockRestore();
    off.mockRestore();
  });

  it("is remembered on the next visit", () => {
    say("ja");
    act(() => suitBtn("ja").click());
    unmount();
    __resetSpeechBus();
    mount();
    say("ja");
    expect(suits()).toBe(1);
    expect(suitBtn("ja").getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector(".th-seat--suit-reveal")).toBeNull();
  });
});
