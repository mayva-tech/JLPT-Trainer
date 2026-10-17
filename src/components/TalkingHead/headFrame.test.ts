import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emitSpeechEvent, __resetSpeechBus } from "../../services/speechBus";
import TalkingHead from "./TalkingHead";
import HeadStyleButtons from "./HeadStyleButtons";
import { getHeadFrame, setHeadFrame } from "./headFrame";

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
  setHeadFrame("figure");
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  __resetSpeechBus();
  vi.useRealTimers();
});

describe("talking heads: speaking cue and profile badges", () => {
  it("the speaking head is marked talking (hop + halo); it stops with the line", () => {
    act(() => root.render(createElement(TalkingHead)));
    act(() => emitSpeechEvent({ type: "start", lang: "ja", rate: 1 }));
    expect(host.querySelector(".th-seat--talking .th-frame .th-motion svg")).not.toBeNull();
    act(() => emitSpeechEvent({ type: "end" }));
    expect(host.querySelector(".th-seat--talking")).toBeNull();
  });

  it("the Heads button switches to round badges with names, and is remembered", () => {
    act(() =>
      root.render(createElement("div", null, createElement(HeadStyleButtons), createElement(TalkingHead)))
    );
    act(() => emitSpeechEvent({ type: "start", lang: "ja", rate: 1 }));
    expect(host.querySelector(".th-root--badge")).toBeNull();
    const btn = host.querySelector<HTMLButtonElement>("button[aria-label='Show round profile badges']")!;
    act(() => btn.click());
    expect(host.querySelector(".th-root--badge")).not.toBeNull();
    expect(host.querySelector(".th-badge-name")?.textContent).toBe("七海");
    expect(getHeadFrame()).toBe("badge");
    expect(localStorage.getItem("jlpt-trainer:talking-head-frame:v1")).toBe("badge");
  });

  it("O on the head toggles badges", () => {
    act(() => root.render(createElement(TalkingHead)));
    act(() => emitSpeechEvent({ type: "start", lang: "en", rate: 1 }));
    const head = host.querySelector<HTMLElement>(".th-root")!;
    act(() => head.dispatchEvent(new KeyboardEvent("keydown", { key: "o", bubbles: true })));
    expect(host.querySelector(".th-root--badge")).not.toBeNull();
    expect(host.textContent).toContain("Profile badges");
    act(() => head.dispatchEvent(new KeyboardEvent("keydown", { key: "O", bubbles: true })));
    expect(host.querySelector(".th-root--badge")).toBeNull();
  });
});
