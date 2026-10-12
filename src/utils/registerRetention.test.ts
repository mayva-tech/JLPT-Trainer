import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  registerPairs,
  registerSections,
  getRegisterPairsForSection,
} from "../data/registerPairs";
import { checkpointIndices, firstSense } from "../components/Retention/retentionQuiz";
import { RegisterPauseAnswerCard } from "../components/Retention/RegisterPauseAnswerCard";
import { RegisterSplitCard } from "../components/RegisterSplitCard";
import {
  AMBIENCE_THEMES,
  ambienceForRegister,
  REGISTER_AMBIENCE_CATEGORIES,
} from "../components/StageAmbience/themes";
import { autoModeTiming } from "../config/autoModeTiming";
import {
  buildRegisterCheckCard,
  POLITE_HOOK_EN,
  registerCheckQuestion,
  registerCheckSpoken,
} from "./registerRetention";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/* ── Pause & answer ─────────────────────────────────────────────── */

describe("buildRegisterCheckCard", () => {
  const section = getRegisterPairsForSection("register-02");

  it("odd checkpoints ask for the polite form: formal correct, casual of the same line as a trap", () => {
    const card = buildRegisterCheckCard(section, section, 1)!;
    expect(card.kind).toBe("polite");
    expect(section.map((p) => p.id)).toContain(card.pair.id);
    expect(card.options.map((o) => o.label)).toEqual(["A", "B", "C"]);
    expect(card.options.every((o) => o.lang === "ja")).toBe(true);
    const correct = card.options.filter((o) => o.correct);
    expect(correct).toHaveLength(1);
    expect(correct[0]!.text).toBe(card.pair.formal.text);
    expect(card.options.map((o) => o.text)).toContain(card.pair.casual.text);
    expect(registerCheckSpoken(card)).toContain(card.pair.meaning);
  });

  it("even checkpoints ask the meaning of the formal line", () => {
    const card = buildRegisterCheckCard(section, section, 2)!;
    expect(card.kind).toBe("meaning");
    expect(card.options.every((o) => o.lang === "en")).toBe(true);
    expect(card.options.find((o) => o.correct)!.text).toBe(firstSense(card.pair.meaning));
    expect(registerCheckQuestion(card)).toBe("What does this mean?");
  });

  it("is the same every time (re-recordings match)", () => {
    expect(buildRegisterCheckCard(section, section, 1)).toEqual(
      buildRegisterCheckCard(section, section, 1)
    );
  });

  it("returns null without enough different answers", () => {
    const one = [section[0]!];
    expect(buildRegisterCheckCard(one, one, 2)).toBeNull();
  });

  it("builds every checkpoint of every real section, with three distinct options", () => {
    let built = 0;
    for (const s of registerSections) {
      const pairs = getRegisterPairsForSection(s.id);
      const cps = checkpointIndices(pairs.length, autoModeTiming.checkEvery);
      expect(cps.length, s.id).toBeGreaterThan(0);
      cps.forEach((cp, n) => {
        const start = n > 0 ? cps[n - 1]! + 1 : 0;
        const card = buildRegisterCheckCard(pairs.slice(start, cp + 1), pairs, n + 1);
        expect(card, `${s.id} checkpoint ${n + 1}`).not.toBeNull();
        expect(new Set(card!.options.map((o) => o.text.toLowerCase())).size).toBe(3);
        built++;
      });
    }
    expect(built).toBeGreaterThanOrEqual(registerSections.length);
  });
});

/* ── Stage ambience ─────────────────────────────────────────────── */

describe("ambienceForRegister", () => {
  const known = new Set(AMBIENCE_THEMES.map((t) => t.id));

  it("maps every register category to scene families", () => {
    for (const pair of registerPairs) {
      expect(REGISTER_AMBIENCE_CATEGORIES[pair.category], pair.category).toBeDefined();
    }
  });

  it("gives every pair a known theme, stable per pair", () => {
    for (const pair of registerPairs) {
      const theme = ambienceForRegister(pair);
      expect(known.has(theme), `${pair.id} → ${theme}`).toBe(true);
      expect(ambienceForRegister(pair)).toBe(theme);
    }
  });

  it("varies within a section (no single backdrop for six pairs in a row)", () => {
    for (const s of registerSections) {
      const themes = new Set(getRegisterPairsForSection(s.id).map(ambienceForRegister));
      expect(themes.size, s.id).toBeGreaterThan(1);
    }
  });
});

/* ── Card: hook banner, nuance karaoke ─────────────────────────── */

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  // jsdom has no ResizeObserver; the card refits on resize.
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {}
    disconnect() {}
  };
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("<RegisterSplitCard />", () => {
  const pair = registerPairs.find((p) => p.note?.includes("ございました"))!;

  it("renders the note as a Nuance box with karaoke on the whole mixed JA/EN text", () => {
    const start = pair.note!.indexOf("ございました");
    act(() =>
      root.render(
        createElement(RegisterSplitCard, {
          pair,
          activeSide: "note",
          noteHighlight: { start, end: start + "ございました".length },
        })
      )
    );
    const box = host.querySelector(".register-note.lesson-nuance--active");
    expect(box?.querySelector(".lesson-nuance-label")?.textContent).toBe("Nuance");
    expect(box?.querySelector(".speech-active")?.textContent).toContain("ございました");
  });

  it("no note highlight unless the note is the part being spoken", () => {
    act(() =>
      root.render(
        createElement(RegisterSplitCard, {
          pair,
          activeSide: "formal",
          noteHighlight: { start: 0, end: 3 },
        })
      )
    );
    expect(host.querySelector(".register-note .speech-active")).toBeNull();
  });

  it("hook: formal side hidden behind the banner, ring once a countdown is set", () => {
    act(() =>
      root.render(createElement(RegisterSplitCard, { pair, hook: { ms: 0, key: 1 } }))
    );
    expect(host.querySelector(".register-col--formal.register-col--hook")).not.toBeNull();
    expect(host.querySelector(".register-hook-banner")?.textContent).toContain(POLITE_HOOK_EN);
    expect(host.querySelector(".register-safe--hook")).not.toBeNull();
    expect(host.querySelector(".ret-ring")).toBeNull();
    act(() =>
      root.render(createElement(RegisterSplitCard, { pair, hook: { ms: 2500, key: 2 } }))
    );
    expect((host.querySelector(".ret-ring") as HTMLElement).style.animationDuration).toBe("2500ms");
    act(() => root.render(createElement(RegisterSplitCard, { pair, hook: null })));
    expect(host.querySelector(".register-hook-banner")).toBeNull();
  });
});

describe("<RegisterPauseAnswerCard />", () => {
  const section = getRegisterPairsForSection("register-02");
  const card = buildRegisterCheckCard(section, section, 1)!;

  it("asks with the English line and three Japanese options, no answer yet", () => {
    act(() => root.render(createElement(RegisterPauseAnswerCard, { card, phase: "ask", thinkMs: 5000 })));
    expect(host.textContent).toContain("Pause & answer");
    expect(host.querySelector(".ret-check-prompt-en")?.textContent).toContain(card.pair.meaning);
    expect(host.querySelectorAll('.ret-option[lang="ja"]')).toHaveLength(3);
    expect(host.querySelector(".ret-option--correct")).toBeNull();
  });

  it("reveals the formal form", () => {
    act(() => root.render(createElement(RegisterPauseAnswerCard, { card, phase: "reveal", thinkMs: 5000 })));
    expect(host.querySelector(".ret-option--correct")?.textContent).toContain(card.pair.formal.text);
    expect(host.querySelectorAll(".ret-option--wrong")).toHaveLength(2);
  });
});
