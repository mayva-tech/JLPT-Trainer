import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetReactionBus, reportAnswer } from "../../services/reactionBus";
import { __resetSceneBus, pushScene } from "../../services/sceneBus";
import { __resetSenseiBus, showSenseiTip } from "../../services/senseiBus";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { speechService } from "../../services/speechService";
import TalkingHead from "../TalkingHead/TalkingHead";
import { SCENE_TIPS } from "./senseiTips";

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
  __resetSceneBus();
  __resetSenseiBus();
  __resetReactionBus();
  __resetSpeechBus();
  vi.useRealTimers();
});

const bubble = () => host.querySelector(".sensei-bubble");
const click = (el: Element | null) =>
  act(() => el!.dispatchEvent(new MouseEvent("click", { bubbles: true })));

describe("SenseiMascot", () => {
  it("peeks quietly until something happens", () => {
    expect(host.querySelector(".sensei")).not.toBeNull();
    expect(host.querySelector(".sensei--up")).toBeNull();
    expect(bubble()).toBeNull();
  });

  it("pops a culture note the first time a scene appears", () => {
    act(() => {
      pushScene({ backdrop: "station" });
    });
    act(() => vi.advanceTimersByTime(1600));
    const ids = SCENE_TIPS.station.map((t) => t.en);
    expect(ids).toContain(host.querySelector(".sensei-text")?.textContent);
    expect(host.querySelector(".sensei--up")).not.toBeNull();
  });

  it("keeps its tip when the talking head appears", () => {
    act(() => showSenseiTip({ id: "x", ja: "テスト", en: "Hello from sensei" }));
    act(() => emitSpeechEvent({ type: "start", lang: "ja", rate: 1 }));
    expect(host.querySelector(".sensei-text")?.textContent).toBe("Hello from sensei");
    expect(host.querySelector(".th-root")).not.toBeNull();
  });

  it("auto-hides after the reading time", () => {
    act(() => showSenseiTip({ id: "x", en: "Short" }));
    act(() => vi.advanceTimersByTime(5500));
    expect(bubble()).toBeNull();
  });

  it("gives a tip on click and swaps mascot on double-click", () => {
    const body = host.querySelector(".sensei-body");
    click(body);
    expect(bubble()).not.toBeNull();
    expect(host.querySelector(".sensei-name")?.textContent).toBe("たぬき先生");
    act(() => body!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
    expect(host.querySelector(".sensei-name")?.textContent).toBe("ねこ先生");
  });

  it("tap stops playback and voices the tip: Japanese, then English", async () => {
    const stop = vi.spyOn(speechService, "stop").mockImplementation(() => {});
    const ja = vi
      .spyOn(speechService, "speakJapanese")
      .mockImplementation((_t, cb) => cb?.onEnd?.());
    const en = vi
      .spyOn(speechService, "speakEnglish")
      .mockImplementation((_t, cb) => cb?.onEnd?.());
    click(host.querySelector(".sensei-body"));
    await act(async () => {
      await Promise.resolve();
    });
    expect(stop).toHaveBeenCalled();
    const text = host.querySelector(".sensei-text")?.textContent;
    expect(en).toHaveBeenCalledWith(text, expect.anything(), expect.any(Number));
    const phrase = ja.mock.calls[0]?.[0];
    if (phrase) expect(ja.mock.invocationCallOrder[0]).toBeLessThan(en.mock.invocationCallOrder[0]!);
    vi.restoreAllMocks();
  });

  it("hides behind the Nuance panel when one is on screen", () => {
    const panel = document.createElement("div");
    panel.className = "lesson-nuance";
    panel.getBoundingClientRect = () =>
      ({ width: 300, height: 60, top: 400, left: 0, right: 300, bottom: 460 }) as DOMRect;
    document.body.appendChild(panel);
    const rand = vi.spyOn(Math, "random").mockReturnValue(0);
    act(() => vi.advanceTimersByTime(600));
    expect(panel.querySelector(".sensei--nuance .sensei-slot .sensei-body")).not.toBeNull();
    expect(host.querySelector(".sensei")).toBeNull();
    expect(panel.querySelector(".sensei--peek")).toBeNull();
    act(() => vi.advanceTimersByTime(10_100));
    expect(panel.querySelector(".sensei--peek")).not.toBeNull();
    rand.mockRestore();
    panel.remove();
    act(() => vi.advanceTimersByTime(600));
    expect(host.querySelector(".sensei")).not.toBeNull();
  });

  it("× hides the mascot; the leaf brings it back", () => {
    click(host.querySelector(".sensei-body"));
    click(host.querySelector(".sensei-close"));
    expect(host.querySelector(".sensei")).toBeNull();
    expect(host.querySelector(".sensei-tab")).not.toBeNull();
    click(host.querySelector(".sensei-tab"));
    expect(host.querySelector(".sensei")).not.toBeNull();
  });

  it("encourages after three misses in a row", () => {
    act(() => {
      reportAnswer(false);
      reportAnswer(false);
      reportAnswer(false);
    });
    expect(bubble()).not.toBeNull();
  });
});
