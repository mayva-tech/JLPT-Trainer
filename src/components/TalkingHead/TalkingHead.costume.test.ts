import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus } from "../../services/reactionBus";
import { __resetSenseiBus, getSenseiSettings } from "../../services/senseiBus";
import TalkingHead from "./TalkingHead";
import HeadStyleButtons from "./HeadStyleButtons";
import { __resetHeadStyle } from "./headStyleStore";
import * as sfx from "./costumeSfx";
import { COSTUME_REVEAL_MS } from "./useHeadCostume";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Voice = "ja" | "en";
const COSTUME_KEY = "jlpt-trainer:talking-head-costume:v1";
const OLD_SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";
let host: HTMLDivElement;
let root: Root;

/** A fresh visit: the head plus the Player bar's Nanami / Andrew / Sensei buttons. */
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
const hanger = (voice: Voice) => group(voice).querySelector<HTMLButtonElement>("[data-costume-opener]")!;
const lookBtn = (voice: Voice) => group(voice).querySelector<HTMLButtonElement>("button:not([data-costume-opener])")!;
const menu = () => host.querySelector<HTMLElement>(".th-costume-menu");
/** Open that head's menu and pick by English label ("Normal clothes" takes it off). */
function pick(voice: Voice, label: string) {
  act(() => hanger(voice).click());
  const item = [...menu()!.querySelectorAll<HTMLButtonElement>(".th-costume-item")].find(
    (b) => b.querySelector(".th-costume-en")?.textContent === label,
  )!;
  act(() => item.click());
}
const seatEl = (voice: Voice) => host.querySelector<HTMLElement>(`.th-seat[data-voice="${voice}"]`)!;
const helmets = () => host.querySelectorAll(".th-suit-helmet").length;
const lookOn = (voice: Voice) => seatEl(voice).querySelector(".th-svg")?.getAttribute("aria-label") ?? "";
const toast = () => host.querySelector(".th-look-toast")?.textContent;
const stored = () => JSON.parse(localStorage.getItem(COSTUME_KEY) ?? "{}") as Record<Voice, { on: string | null; last: string }>;
function duo() {
  say("ja");
  stop();
  say("en");
}

describe("TalkingHead costumes (Player bar menus)", () => {
  it("the head itself has no buttons; each person has a look button and a costume menu", () => {
    duo();
    expect(host.querySelector(".th-root button")).toBeNull();
    for (const v of ["ja", "en"] as const) {
      expect(lookBtn(v)).not.toBeNull();
      expect(hanger(v).getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("the menu lists normal clothes and the six costumes, and closes on pick", () => {
    say("ja");
    act(() => hanger("ja").click());
    expect(hanger("ja").getAttribute("aria-expanded")).toBe("true");
    const labels = [...menu()!.querySelectorAll(".th-costume-en")].map((e) => e.textContent);
    expect(labels).toEqual([
      "Normal clothes",
      "Mecha suit",
      "Samurai armour",
      "Shinobi",
      "Idol stage outfit",
      "Kigurumi",
      "RPG hero",
    ]);
    act(() => menu()!.querySelectorAll<HTMLButtonElement>(".th-costume-item")[2].click());
    expect(menu()).toBeNull();
    expect(lookOn("ja")).toContain("Samurai armour");
    expect(hanger("ja").classList.contains("head-style-btn--on")).toBe(true);
    expect(toast()).toBe("Samurai armour");
  });

  it("Escape and an outside click close the menu without changing anything", () => {
    say("ja");
    act(() => hanger("ja").click());
    act(() => menu()!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(menu()).toBeNull();
    act(() => hanger("ja").click());
    act(() => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(menu()).toBeNull();
    expect(stored()).toEqual({});
  });

  it("in duo each head wears its own costume", () => {
    duo();
    pick("en", "Mecha suit");
    pick("ja", "Kigurumi");
    expect(seatEl("en").querySelector(".th-suit-helmet")).not.toBeNull();
    expect(lookOn("ja")).toContain("Kigurumi");
    expect(lookOn("en")).toContain("Mecha suit");
    expect(toast()).toBe("Nanami: Kigurumi");
    expect(stored()).toEqual({ ja: { on: "kigurumi", last: "kigurumi" }, en: { on: "mecha", last: "mecha" } });
    expect(host.querySelectorAll(".th-seat .th-mouth")).toHaveLength(2);
  });

  it("normal clothes takes it off and brings the chosen look back", () => {
    say("ja");
    const before = lookOn("ja");
    pick("ja", "Shinobi");
    pick("ja", "Normal clothes");
    expect(lookOn("ja")).toBe(before);
    expect(toast()).toBe("Normal clothes");
    expect(stored().ja).toEqual({ on: null, last: "shinobi" });
  });

  it("mecha reveals with its shutter, the others with a poof, once", () => {
    say("ja");
    pick("ja", "Mecha suit");
    expect(seatEl("ja").classList.contains("th-seat--suit-reveal")).toBe(true);
    expect(seatEl("ja").querySelector(".th-suit-shutter")).not.toBeNull();
    act(() => vi.advanceTimersByTime(COSTUME_REVEAL_MS + 50));
    expect(seatEl("ja").classList.contains("th-seat--suit-reveal")).toBe(false);
    pick("ja", "RPG hero");
    expect(seatEl("ja").classList.contains("th-seat--suit-reveal")).toBe(true);
    expect(seatEl("ja").querySelector(".th-costume-poof")).not.toBeNull();
  });

  it("A toggles the speaker's costume (last worn), Shift+A moves to the next", () => {
    say("en");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    const key = (shiftKey: boolean) =>
      act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: shiftKey ? "A" : "a", shiftKey, bubbles: true })));
    key(false);
    expect(helmets()).toBe(1);
    key(true);
    expect(lookOn("en")).toContain("Samurai armour");
    key(false);
    expect(lookOn("en")).not.toContain("Samurai");
    key(false);
    expect(lookOn("en")).toContain("Samurai armour");
    expect(stored().ja).toEqual({ on: null, last: "mecha" });
  });

  it("M still toggles the sensei, not the costume", () => {
    say("ja");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "m", bubbles: true })));
    expect(getSenseiSettings().enabled).toBe(false);
    expect(localStorage.getItem(COSTUME_KEY)).toBeNull();
  });

  it("a hidden head's choice applies once that head appears", () => {
    say("ja");
    pick("en", "Idol stage outfit");
    stop();
    say("en");
    expect(lookOn("en")).toContain("Idol stage outfit");
  });

  it("a look change under a costume says so", () => {
    say("ja");
    pick("ja", "Samurai armour");
    act(() => lookBtn("ja").click());
    expect(toast()).toMatch(/\(under the costume\)$/);
    expect(lookOn("ja")).toContain("Samurai armour");
  });

  it("carries over the older mecha suit settings", () => {
    unmount();
    localStorage.setItem(OLD_SUIT_KEY, JSON.stringify({ ja: false, en: true }));
    mount();
    duo();
    expect(seatEl("en").querySelector(".th-suit-helmet")).not.toBeNull();
    expect(seatEl("ja").querySelector(".th-suit-helmet")).toBeNull();
    unmount();
    localStorage.clear();
    localStorage.setItem(OLD_SUIT_KEY, "on");
    mount();
    duo();
    expect(helmets()).toBe(2);
  });

  it("reads a single saved costume (both heads)", () => {
    unmount();
    localStorage.setItem(COSTUME_KEY, JSON.stringify({ on: "hero", last: "hero" }));
    mount();
    duo();
    expect(lookOn("ja")).toContain("RPG hero");
    expect(lookOn("en")).toContain("RPG hero");
  });

  it("plays each costume's sound on, the off sound off, and nothing on load", () => {
    const on = vi.spyOn(sfx, "playCostumeOn");
    const off = vi.spyOn(sfx, "playCostumeOff");
    say("ja");
    pick("ja", "Shinobi");
    expect(on).toHaveBeenLastCalledWith("shinobi");
    pick("ja", "Shinobi");
    expect(on).toHaveBeenCalledTimes(1);
    pick("ja", "Normal clothes");
    expect(off).toHaveBeenLastCalledWith("shinobi");
    pick("ja", "Mecha suit");
    unmount();
    mount();
    say("ja");
    expect(on).toHaveBeenCalledTimes(2);
    expect(off).toHaveBeenCalledTimes(1);
    expect(seatEl("ja").classList.contains("th-seat--suit-reveal")).toBe(false);
    expect(helmets()).toBe(1);
    on.mockRestore();
    off.mockRestore();
  });

  it("the Sensei group swaps tanuki and neko and hides / shows the mascot", () => {
    const sensei = host.querySelector<HTMLElement>('.head-style-group[aria-label="Sensei mascot"]')!;
    expect(sensei.textContent).toContain("Tanuki");
    const swapBtn = sensei.querySelector<HTMLButtonElement>("button:not([aria-pressed])")!;
    const showBtn = sensei.querySelector<HTMLButtonElement>("[aria-pressed]")!;
    act(() => swapBtn.click());
    expect(sensei.textContent).toContain("Neko");
    act(() => showBtn.click());
    expect(getSenseiSettings().enabled).toBe(false);
  });
});
