import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetSpeechBus, emitSpeechEvent } from "../../services/speechBus";
import { __resetReactionBus } from "../../services/reactionBus";
import { __resetSenseiBus } from "../../services/senseiBus";
import { __resetHeadStyle } from "./headStyleStore";
import TalkingHead from "./TalkingHead";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Fake layout: 1024×768 stage, 120×150 head, 10px-wide characters. */
const VIEW = { w: 1024, h: 768 };
const HEAD = { w: 120, h: 150 };
const CHAR_W = 10;

type Line = { text: string; x: number; y: number; h: number };
let host: HTMLDivElement;
let stage: HTMLDivElement;
let root: Root;
const restore: (() => void)[] = [];

function rect(left: number, top: number, w: number, h: number): DOMRect {
  return { left, top, right: left + w, bottom: top + h, width: w, height: h, x: left, y: top, toJSON() {} } as DOMRect;
}

function patch<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) {
  const had = Object.getOwnPropertyDescriptor(obj, key);
  Object.defineProperty(obj, key, { configurable: true, writable: true, value });
  restore.push(() => (had ? Object.defineProperty(obj, key, had) : delete obj[key]));
}

function layOut(lines: Line[]) {
  stage.replaceChildren(
    ...lines.map((l) => {
      const span = document.createElement("span");
      span.textContent = l.text;
      span.dataset.line = JSON.stringify(l);
      return span;
    }),
  );
}

/** The head's box as placed (left / top style, scaled by --th-fit). */
function headBox() {
  const el = host.querySelector<HTMLElement>(".th-root")!;
  const fit = Number(el.style.getPropertyValue("--th-fit") || 1);
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  return { left, top, right: left + HEAD.w * fit, bottom: top + HEAD.h * fit, el };
}

const intersects = (a: { left: number; top: number; right: number; bottom: number }, b: Line) =>
  a.left < b.x + b.text.length * CHAR_W && a.right > b.x && a.top < b.y + b.h && a.bottom > b.y;

beforeEach(() => {
  vi.useFakeTimers();
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  localStorage.clear();
  __resetHeadStyle();
  patch(window, "innerWidth", VIEW.w);
  patch(window, "innerHeight", VIEW.h);

  const baseRect = Element.prototype.getBoundingClientRect;
  patch(Element.prototype, "getBoundingClientRect", function (this: Element) {
    if (this.classList.contains("stage")) return rect(0, 0, VIEW.w, VIEW.h);
    if (this.classList.contains("th-root")) {
      const el = this as HTMLElement;
      const fit = Number(el.style.getPropertyValue("--th-fit") || 1);
      return rect(parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0, HEAD.w * fit, HEAD.h * fit);
    }
    return baseRect.call(this);
  });
  patch(Range.prototype, "getClientRects", function (this: Range) {
    const parent = this.startContainer.parentElement;
    const raw = parent?.dataset.line;
    if (!raw) return [] as unknown as DOMRectList;
    const l = JSON.parse(raw) as Line;
    const from = this.startOffset;
    const to = this.endContainer === this.startContainer ? this.endOffset : l.text.length;
    return [rect(l.x + from * CHAR_W, l.y, (to - from) * CHAR_W, l.h)] as unknown as DOMRectList;
  });

  stage = document.createElement("div");
  stage.className = "stage";
  document.body.appendChild(stage);
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(TalkingHead)));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  stage.remove();
  restore.splice(0).reverse().forEach((r) => r());
  __resetSpeechBus();
  __resetReactionBus();
  __resetSenseiBus();
  __resetHeadStyle();
  vi.useRealTimers();
});

/** Japanese speech that has just finished, so no karaoke and no "speaking" guard. */
function spokeJapanese() {
  act(() => emitSpeechEvent({ type: "start", lang: "ja", rate: 1 }));
  act(() => emitSpeechEvent({ type: "end" }));
  act(() => vi.advanceTimersByTime(400));
}

/** Rows of one text filling the whole stage. */
function fill(char: string): Line[] {
  const lines: Line[] = [];
  for (let y = 0; y < VIEW.h; y += 40) lines.push({ text: char.repeat(VIEW.w / CHAR_W), x: 0, y, h: 40 });
  return lines;
}

describe("TalkingHead never covers Japanese text", () => {
  it("steps off a Japanese line sitting where the head would go", () => {
    const ja: Line = { text: "パーティーへの招待", x: VIEW.w - 300, y: VIEW.h - 200, h: 60 };
    layOut([ja]);
    spokeJapanese();
    const box = headBox();
    expect(box.el.classList.contains("th-root--yield")).toBe(false);
    expect(intersects(box, ja)).toBe(false);
  });

  it("fades out rather than cover Japanese when the stage is full of it", () => {
    layOut(fill("あ"));
    spokeJapanese();
    expect(headBox().el.classList.contains("th-root--yield")).toBe(true);
  });

  it("may rest over English text when there is no free spot (only least overlap)", () => {
    layOut(fill("a"));
    spokeJapanese();
    expect(headBox().el.classList.contains("th-root--yield")).toBe(false);
  });

  it("guards only the Japanese words inside an English line", () => {
    // English everywhere, except one row whose left end quotes a Japanese word.
    const lines = fill("a");
    const quote = "招待".padEnd(VIEW.w / CHAR_W, "a");
    lines.splice(lines.length - 4, 1, { ...lines[lines.length - 4], text: quote });
    layOut(lines);
    spokeJapanese();
    const box = headBox();
    expect(box.el.classList.contains("th-root--yield")).toBe(false);
    const jaWord: Line = { ...lines[lines.length - 4], text: "招待" };
    expect(intersects(box, jaWord)).toBe(false);
  });
});
