import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus, reportAnswer } from "../../services/reactionBus";
import TalkingHead from "./TalkingHead";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  localStorage.clear();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(TalkingHead)));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  __resetSpeechBus();
  __resetReactionBus();
  vi.useRealTimers();
});

const seats = () =>
  [...host.querySelectorAll<HTMLElement>(".th-seat")].map(
    (el) => `${el.dataset.voice}:${el.className.replace(/.*th-seat--/, "")}`
  );

function say(lang: "ja" | "en") {
  act(() => emitSpeechEvent({ type: "start", lang, rate: 1 }));
}
function stop() {
  act(() => emitSpeechEvent({ type: "end" }));
}

describe("TalkingHead duo stage", () => {
  it("is hidden until someone speaks, then shows one head", () => {
    expect(seats()).toEqual([]);
    say("ja");
    expect(seats()).toEqual(["ja:solo"]);
  });

  it("brings both heads on stage once both voices speak", () => {
    say("ja");
    stop();
    say("en");
    expect(seats()).toEqual(["ja:listening", "en:speaking"]);
    expect(host.querySelector(".th-root--duo")).not.toBeNull();
    stop();
    expect(seats()).toEqual(["ja:idle", "en:idle"]);
    say("ja");
    expect(seats()).toEqual(["ja:speaking", "en:listening"]);
  });

  it("folds back to one head after the duo window lapses", () => {
    say("ja");
    stop();
    say("en");
    stop();
    act(() => vi.advanceTimersByTime(31_000));
    expect(seats()).toEqual(["en:solo"]);
  });

  it("D toggles duo off and on", () => {
    say("ja");
    stop();
    say("en");
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true })));
    expect(seats()).toEqual(["en:solo"]);
    expect(localStorage.getItem("jlpt-trainer:talking-head-duo:v1")).toBe("off");
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true })));
    expect(seats()).toHaveLength(2);
  });

  it("both heads react in duo", () => {
    say("ja");
    stop();
    say("en");
    stop();
    act(() => reportAnswer(true));
    expect(host.querySelectorAll(".th-motion--hop")).toHaveLength(2);
    expect(host.querySelector(".th-bubble")).not.toBeNull();
  });
});
