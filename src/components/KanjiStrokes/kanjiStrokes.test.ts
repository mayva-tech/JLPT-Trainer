import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vocabulary } from "../../data/vocabulary";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
import { KANJI_STROKES, KANJIVG_VERSION } from "./kanjiStrokes.data";
import { hasStrokes, planStrokes } from "./strokePlan";
import { KanjiStrokes } from "./KanjiStrokes";
import { loadKanjiStrokes } from "./loadStrokes";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const KANJI = /[\u3400-\u4dbf\u4e00-\u9fff々]/u;

describe("KanjiVG stroke data", () => {
  it("covers every kanji in every vocabulary word (re-run the generator if not)", () => {
    const missing = new Set<string>();
    for (const v of [...vocabulary, ...vocabularyN3]) {
      for (const ch of v.word) if (KANJI.test(ch) && !KANJI_STROKES[ch]) missing.add(ch);
    }
    expect([...missing].join("")).toBe("");
  });

  it("has the right number of strokes for well-known kanji", () => {
    const expected: Record<string, number> = { 一: 1, 人: 2, 大: 3, 日: 4, 母: 5, 気: 6, 友: 4, 達: 12, 語: 14, 々: 3 };
    for (const [ch, n] of Object.entries(expected)) {
      expect(KANJI_STROKES[ch]?.length, ch).toBe(n);
    }
  });

  it("stores plain SVG path data", () => {
    for (const ds of Object.values(KANJI_STROKES)) {
      // Absolute (M) or relative (m) move first — both valid SVG.
      for (const d of ds) expect(d).toMatch(/^[Mm]\s*-?[\d.]+/);
    }
  });

  it("records which KanjiVG version it came from", () => {
    expect(KANJIVG_VERSION).not.toBe("");
  });
});

describe("stroke plan", () => {
  const data = { 友: ["M1", "M2", "M3", "M4"], 達: Array.from({ length: 12 }, (_, i) => `M${i}`) };

  it("plays strokes in order, one kanji after the other", () => {
    const plan = planStrokes("友達", data);
    const delays = plan.chars.flatMap((c) => (c.kind === "kanji" ? c.strokes.map((s) => s.delay) : []));
    expect(delays).toHaveLength(16);
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThan(delays[i - 1]!);
    expect(plan.chars.map((c) => c.ch)).toEqual(["友", "達"]);
    expect(plan.strokeCount).toBe(16);
  });

  it("gives kana their own turn between kanji (集まる)", () => {
    const plan = planStrokes("集まる", { 集: ["M1", "M2"] });
    expect(plan.chars.map((c) => c.kind)).toEqual(["kanji", "text", "text"]);
    expect(plan.chars[1]!.start).toBeGreaterThan(0);
    expect(plan.chars[2]!.start).toBeGreaterThan(plan.chars[1]!.start);
  });

  it("speeds strokes up to fit 3.2 s, but never below 60 ms each", () => {
    const twenty = { 字: Array.from({ length: 20 }, (_, i) => `M${i}`) };
    expect(planStrokes("字", twenty, { maxTotalMs: 3200 }).totalMs).toBeLessThanOrEqual(3200);
    const huge = { 鬱: Array.from({ length: 29 }, (_, i) => `M${i}`) };
    const plan = planStrokes("鬱鬱", huge, { maxTotalMs: 3200 });
    const delays = plan.chars.flatMap((c) => (c.kind === "kanji" ? c.strokes.map((x) => x.delay) : []));
    for (let i = 1; i < delays.length; i++) expect(delays[i]! - delays[i - 1]!).toBeGreaterThanOrEqual(60);
  });

  it("every corpus word writes itself in under 4 s", () => {
    for (const v of [...vocabulary, ...vocabularyN3]) {
      expect(planStrokes(v.word, KANJI_STROKES).totalMs, v.word).toBeLessThan(4000);
    }
  });

  it("knows kana-only words have nothing to draw", () => {
    expect(hasStrokes("あなた", KANJI_STROKES)).toBe(false);
    expect(hasStrokes("友達", KANJI_STROKES)).toBe(true);
  });
});

/* ── Component ─────────────────────────────────────────────────── */

let host: HTMLDivElement;
let root: Root;
beforeEach(async () => {
  await loadKanjiStrokes();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("<KanjiStrokes />", () => {
  it("draws one SVG per kanji with every stroke, kana as text", () => {
    act(() => root.render(createElement(KanjiStrokes, { word: "集まる", state: "draw" })));
    expect(host.querySelectorAll(".ks-char")).toHaveLength(1);
    expect(host.querySelectorAll(".ks-ink path")).toHaveLength(KANJI_STROKES["集"]!.length);
    expect([...host.querySelectorAll(".ks-text")].map((n) => n.textContent)).toEqual(["ま", "る"]);
    expect(host.querySelector(".ks-ink path")?.getAttribute("pathLength")).toBe("1");
    expect(host.querySelector(".ks")?.getAttribute("aria-label")).toBe("集まる");
  });

  it("staggers the strokes in order", () => {
    act(() => root.render(createElement(KanjiStrokes, { word: "友達", state: "draw" })));
    const delays = [...host.querySelectorAll<SVGPathElement>(".ks-ink path")].map((p) =>
      parseFloat(p.style.animationDelay)
    );
    expect(delays.length).toBe(16);
    for (let i = 1; i < delays.length; i++) expect(delays[i]!).toBeGreaterThan(delays[i - 1]!);
  });

  it("switches between blank, draw and done", () => {
    for (const state of ["blank", "draw", "done"] as const) {
      act(() => root.render(createElement(KanjiStrokes, { word: "人", state })));
      expect(host.querySelector(`.ks--${state}`)).not.toBeNull();
    }
  });

  it("can hide the ghost outline", () => {
    act(() => root.render(createElement(KanjiStrokes, { word: "人", state: "draw", ghost: false })));
    expect(host.querySelector(".ks-ghost")).toBeNull();
  });
});
