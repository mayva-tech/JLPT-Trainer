import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetSceneBus, pushScene } from "../../services/sceneBus";
import TalkingHead from "./TalkingHead";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
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
  act(() => emitSpeechEvent({ type: "start", lang: "ja", rate: 1 }));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  __resetSpeechBus();
  __resetSceneBus();
});

describe("TalkingHead scenes", () => {
  it("shows no backdrop until a scene is declared", () => {
    expect(host.querySelector(".th-backdrop")).toBeNull();
  });

  it("draws the declared backdrop with its Japanese name and the prop", () => {
    let release = () => {};
    act(() => {
      release = pushScene({ backdrop: "station", prop: "phone" });
    });
    expect(host.querySelector(".th-backdrop--station")).not.toBeNull();
    expect(host.querySelector(".th-scene-tag")?.textContent).toBe("駅えき");
    expect(host.querySelector(".th-root--scene")).not.toBeNull();
    expect(host.querySelectorAll(".th-seat rect[fill='#2b2d33']").length).toBe(1);
    act(() => release());
    expect(host.querySelector(".th-backdrop")).toBeNull();
  });

  it("B hides and restores scenes", () => {
    act(() => {
      pushScene({ backdrop: "cafe", prop: "cup" });
    });
    const rootEl = host.querySelector<HTMLElement>(".th-root")!;
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true })));
    expect(host.querySelector(".th-backdrop")).toBeNull();
    expect(localStorage.getItem("jlpt-trainer:talking-head-scene:v1")).toBe("off");
    act(() => rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true })));
    expect(host.querySelector(".th-backdrop--cafe")).not.toBeNull();
  });
});
