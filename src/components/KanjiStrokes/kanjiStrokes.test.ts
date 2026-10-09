import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vocabulary } from "../../data/vocabulary";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
import { KANJI_STROKES, KANJIVG_VERSION } from "./kanjiStrokes.data";
import { hasStrokes, planStrokes } from "./strokePlan";
import { brushProfile, brushShape, brushWidth, strokeLength, strokePoints } from "./brushGeometry";
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
  const strokesOf = (plan: ReturnType<typeof planStrokes>) =>
    plan.chars.flatMap((c) => (c.kind === "kanji" ? c.strokes : []));

  it("draws exactly one stroke at a time — the next starts after the last ends", () => {
    for (const word of ["友達", "議論", "響く", "集まる", "鑑", "避難場所"]) {
      const strokes = strokesOf(planStrokes(word, KANJI_STROKES));
      for (let i = 1; i < strokes.length; i++) {
        const prev = strokes[i - 1]!;
        expect(strokes[i]!.delay, `${word} stroke ${i + 1}`).toBeGreaterThan(prev.delay + prev.duration);
      }
    }
  });

  it("never overlaps strokes anywhere in the corpus", () => {
    for (const v of [...vocabulary, ...vocabularyN3]) {
      const strokes = strokesOf(planStrokes(v.word, KANJI_STROKES));
      for (let i = 1; i < strokes.length; i++) {
        expect(strokes[i]!.delay).toBeGreaterThanOrEqual(strokes[i - 1]!.delay + strokes[i - 1]!.duration);
      }
    }
  });

  it("plays strokes in order, one kanji after the other", () => {
    const plan = planStrokes("友達", KANJI_STROKES);
    expect(strokesOf(plan)).toHaveLength(16);
    expect(plan.chars.map((c) => c.ch)).toEqual(["友", "達"]);
    expect(plan.strokeCount).toBe(16);
  });

  it("gives longer strokes more time (一 takes longer than the dot of 丶-like strokes)", () => {
    const plan = planStrokes("犬", KANJI_STROKES, { maxTotalMs: 99999 });
    const s = strokesOf(plan);
    // 犬: the long sweep (stroke 2) outlasts the final dot (stroke 4).
    expect(s[1]!.duration).toBeGreaterThan(s[3]!.duration);
  });

  it("gives kana their own turn between kanji (集まる)", () => {
    const plan = planStrokes("集まる", KANJI_STROKES);
    expect(plan.chars.map((c) => c.kind)).toEqual(["kanji", "text", "text"]);
    const last = strokesOf(plan).at(-1)!;
    expect(plan.chars[1]!.start).toBeGreaterThanOrEqual(last.delay + last.duration);
    expect(plan.chars[2]!.start).toBeGreaterThan(plan.chars[1]!.start);
  });

  it("speeds up to fit the cap, but keeps every stroke at least 70 ms", () => {
    expect(planStrokes("議", KANJI_STROKES, { maxTotalMs: 3200 }).totalMs).toBeLessThanOrEqual(3200);
    for (const st of strokesOf(planStrokes("鑑驚", KANJI_STROKES, { maxTotalMs: 1000 }))) {
      expect(st.duration).toBeGreaterThanOrEqual(70);
    }
  });

  it("every corpus word writes itself in at most 5.2 s (3.2 s unless it has 25+ strokes)", () => {
    for (const v of [...vocabulary, ...vocabularyN3]) {
      const plan = planStrokes(v.word, KANJI_STROKES);
      expect(plan.totalMs, v.word).toBeLessThanOrEqual(5200);
      if (plan.strokeCount <= 24) expect(plan.totalMs, v.word).toBeLessThanOrEqual(3200);
    }
  });

  it("knows kana-only words have nothing to draw", () => {
    expect(hasStrokes("あなた", KANJI_STROKES)).toBe(false);
    expect(hasStrokes("友達", KANJI_STROKES)).toBe(true);
  });
});

describe("brush geometry", () => {
  it("reads KanjiVG path data (M, C, S, relative and absolute)", () => {
    const one = KANJI_STROKES["一"]![0]!;
    const pts = strokePoints(one);
    expect(pts[0]![0]).toBeCloseTo(11, 1);
    expect(pts.at(-1)![0]).toBeCloseTo(11 + 3.19 + 3.06 + 3.48 + 68.58 + 7.57, 0);
    expect(strokeLength(one)).toBeGreaterThan(80);
  });

  it("is thick where the brush lands and thin where it leaves", () => {
    expect(brushProfile(0)).toBeGreaterThan(1.2);
    expect(brushProfile(1)).toBeLessThan(0.5);
    for (let u = 0.1; u <= 1; u += 0.1) expect(brushProfile(u)).toBeLessThan(brushProfile(u - 0.1));
  });

  it("uses a lighter brush for kanji with many strokes", () => {
    expect(brushWidth(20)).toBeLessThan(brushWidth(4));
    expect(brushWidth(29)).toBeGreaterThanOrEqual(2.6);
  });

  it("turns every stroke in the data into a closed outline", () => {
    for (const ds of Object.values(KANJI_STROKES)) {
      for (const d of ds) {
        const b = brushShape(d, 5);
        expect(b.body).toMatch(/^M [\d.-]+ [\d.-]+ .* Z$/);
        expect(b.body).not.toContain("NaN");
      }
    }
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
    expect(host.querySelectorAll(".ks-ink .ks-stroke")).toHaveLength(KANJI_STROKES["集"]!.length);
    expect(host.querySelectorAll(".ks-reveal")).toHaveLength(KANJI_STROKES["集"]!.length);
    expect([...host.querySelectorAll(".ks-text")].map((n) => n.textContent)).toEqual(["ま", "る"]);
    expect(host.querySelector(".ks-reveal")?.getAttribute("pathLength")).toBe("1");
    expect(host.querySelector(".ks")?.getAttribute("aria-label")).toBe("集まる");
  });

  it("reveals one stroke at a time, in order", () => {
    act(() => root.render(createElement(KanjiStrokes, { word: "友達", state: "draw" })));
    const reveals = [...host.querySelectorAll<SVGPathElement>(".ks-reveal")];
    expect(reveals.length).toBe(16);
    for (let i = 1; i < reveals.length; i++) {
      const prevEnd =
        parseFloat(reveals[i - 1]!.style.animationDelay) + parseFloat(reveals[i - 1]!.style.animationDuration);
      expect(parseFloat(reveals[i]!.style.animationDelay)).toBeGreaterThanOrEqual(prevEnd);
    }
  });

  it("links every stroke to its own mask", () => {
    act(() => root.render(createElement(KanjiStrokes, { word: "人", state: "draw" })));
    const ids = [...host.querySelectorAll("mask")].map((m) => m.id);
    expect(new Set(ids).size).toBe(2);
    for (const g of host.querySelectorAll(".ks-stroke")) {
      const ref = g.getAttribute("mask")!.slice(5, -1);
      expect(ids).toContain(ref);
    }
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
