import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StageAmbience, AMBIENCE_FADE_MS } from "./StageAmbience";
import {
  AMBIENCE_THEMES,
  NEUTRAL_THEMES,
  ambienceForGrammar,
  ambienceForOnomatopoeia,
  ambienceForVocab,
  ambienceGlyphs,
  GLYPH_THEMES,
  resolveAmbience,
  scoreAmbience,
  type AmbienceTheme,
} from "./themes";
import { useAmbienceSetting } from "./useAmbienceSetting";
import { vocabulary } from "../../data/vocabulary";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
import { grammar } from "../../data/grammar";
import { grammarN3 } from "../../data/n3/grammarN3";
import { onomatopoeiaItems } from "../../data/onomatopoeia";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const ALL: readonly AmbienceTheme[] = AMBIENCE_THEMES.map((t) => t.id);

function word(
  wordText: string,
  meaning: string,
  extra: Partial<{
    subcategory: string;
    category: string;
    sentence: string;
    sentenceMeaning: string;
  }> = {},
) {
  return { id: 1, word: wordText, meaning, ...extra };
}

describe("theme resolver — words pick their theme", () => {
  const cases: [string, string, AmbienceTheme][] = [
    ["花見", "cherry blossom viewing", "spring"],
    ["花火", "fireworks", "summer"],
    ["紅葉", "autumn leaves", "autumn"],
    ["雪", "snow", "winter"],
    ["台風", "typhoon", "rain"],
    ["宇宙", "outer space; universe", "space"],
    ["港", "harbor; port", "ocean"],
    ["残業", "overtime", "city"],
    ["森林", "forest", "mountains"],
    ["漢字", "kanji", "washi"],
  ];
  for (const [w, m, theme] of cases) {
    it(`${w} → ${theme}`, () => {
      expect(ambienceForVocab(word(w, m))).toBe(theme);
    });
  }

  const japanCases: [string, string, AmbienceTheme][] = [
    ["富士山", "Mount Fuji", "fuji"],
    ["神社", "Shinto shrine", "torii"],
    ["満潮", "high tide", "seaTorii"],
    ["お寺", "Buddhist temple", "pagoda"],
    ["歴史", "history", "castle"],
    ["近所", "neighborhood", "machiya"],
    ["温泉", "hot spring", "onsen"],
    ["集中", "concentration; focus", "karesansui"],
    ["竹", "bamboo", "bamboo"],
    ["新幹線", "bullet train", "shinkansen"],
    ["願い", "wish", "tanabata"],
    ["池", "pond", "koi"],
    ["屋台", "food stall", "yatai"],
    ["畳", "tatami mat", "washitsu"],
    ["稲", "rice plant", "tanbo"],
    ["協力", "cooperation", "gassho"],
    ["流行", "trend; fashion", "neon"],
    ["子供", "child", "koinobori"],
    ["月見", "moon viewing", "tsukimi"],
    ["版画", "woodblock print", "ukiyoe"],
  ];
  for (const [w, m, theme] of japanCases) {
    it(`${w} → ${theme}`, () => {
      expect(ambienceForVocab(word(w, m))).toBe(theme);
    });
  }

  it("運 (luck) is a shrine word, but 運転 (driving) is not", () => {
    expect(
      scoreAmbience({
        id: 1,
        primary: ["運転", "driving"],
        categories: [],
        context: [],
      }).torii,
    ).toBe(0);
  });

  it("the word beats its category", () => {
    // A snow word filed under Transportation still shows winter.
    expect(
      ambienceForVocab(
        word("雪道", "snowy road", { subcategory: "Transportation" }),
      ),
    ).toBe("winter");
  });

  it("falls back to the category when the word says nothing", () => {
    expect(
      ambienceForVocab(word("契約", "contract", { subcategory: "Apartment" })),
    ).toBe("machiya");
    expect(
      ambienceForVocab(
        word("検討", "consideration", { subcategory: "Science & Tech" }),
      ),
    ).toBe("space");
  });

  it("does not misread look-alike kanji", () => {
    // 沢山 (a lot) is not a mountain; 今月 (this month) is not the moon;
    // かき氷 (shaved ice) is summer, not winter.
    expect(
      scoreAmbience({
        id: 1,
        primary: ["沢山", ""],
        categories: [],
        context: [],
      }).mountains,
    ).toBe(0);
    expect(
      scoreAmbience({
        id: 1,
        primary: ["今月", ""],
        categories: [],
        context: [],
      }).space,
    ).toBe(0);
    expect(ambienceForVocab(word("かき氷", "shaved ice"))).toBe("summer");
  });

  it("matches English as whole words only", () => {
    // "support" must not count as "port", "start" not as "art".
    expect(
      scoreAmbience({
        id: 1,
        primary: ["", "support"],
        categories: [],
        context: [],
      }).ocean,
    ).toBe(0);
    expect(
      scoreAmbience({
        id: 1,
        primary: ["", "start"],
        categories: [],
        context: [],
      }).autumn,
    ).toBe(0);
  });

  it("an item with no signal gets a stable neutral theme", () => {
    const source = {
      id: "x-42",
      primary: ["〜", ""],
      categories: [],
      context: [],
    };
    const first = resolveAmbience(source);
    expect(NEUTRAL_THEMES).toContain(first);
    for (let i = 0; i < 5; i++) expect(resolveAmbience(source)).toBe(first);
  });

  it("grammar follows its example sentence", () => {
    const g = {
      id: 9,
      pattern: "〜にもかかわらず",
      meaning: "despite",
      subcategory: "Concession & Contrast",
      sentence: "大雨にもかかわらず、試合は行われた。",
      sentenceMeaning: "Despite the heavy rain, the match was held.",
    };
    expect(ambienceForGrammar(g)).toBe("rain");
  });
});

describe("theme resolver — whole corpus", () => {
  const themes = [
    ...vocabulary.map(ambienceForVocab),
    ...vocabularyN3.map(ambienceForVocab),
    ...grammar.map(ambienceForGrammar),
    ...grammarN3.map(ambienceForGrammar),
    ...onomatopoeiaItems.map(ambienceForOnomatopoeia),
  ];

  it("gives every item a valid theme", () => {
    for (const t of themes) expect(ALL).toContain(t);
  });

  it("uses all thirty themes", () => {
    expect(AMBIENCE_THEMES).toHaveLength(30);
    expect(new Set(themes).size).toBe(30);
  });

  it("keeps variety — no theme takes over the corpus", () => {
    const counts = new Map<AmbienceTheme, number>();
    for (const t of themes) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [, n] of counts) expect(n / themes.length).toBeLessThan(0.2);
  });

  it("varies inside a lesson — 10-word vocabulary lessons average 3+ scenes", () => {
    let distinct = 0;
    let lessons = 0;
    for (let i = 0; i < vocabulary.length; i += 10) {
      lessons++;
      distinct += new Set(vocabulary.slice(i, i + 10).map(ambienceForVocab))
        .size;
    }
    expect(distinct / lessons).toBeGreaterThanOrEqual(3);
  });
});

describe("kanji echo", () => {
  it("takes up to three distinct kanji from the word", () => {
    expect(ambienceGlyphs("天気予報")).toBe("天気予");
    expect(ambienceGlyphs("人々")).toBe("人々");
    expect(ambienceGlyphs("〜にもかかわらず")).toBe("");
    expect(ambienceGlyphs("お手伝い")).toBe("手伝");
    expect(ambienceGlyphs(undefined)).toBe("");
  });
});

/* ── Component ─────────────────────────────────────────────────── */

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.useFakeTimers();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  localStorage.clear();
});

function render(theme: AmbienceTheme | null) {
  act(() => root.render(createElement(StageAmbience, { theme })));
}

describe("<StageAmbience />", () => {
  it("renders nothing when off", () => {
    render(null);
    expect(host.querySelector(".amb")).toBeNull();
  });

  for (const theme of ALL) {
    it(`draws the ${theme} theme, decorative only`, () => {
      render(theme);
      const amb = host.querySelector(".amb");
      expect(amb?.getAttribute("aria-hidden")).toBe("true");
      expect(host.querySelector(`.amb-layer--${theme}`)).not.toBeNull();
      expect(host.querySelector(".amb-scrim")).not.toBeNull();
      // No ids: two layers can be on screen during a cross-fade.
      expect(host.querySelector("[id]")).toBeNull();
    });
  }

  for (const theme of GLYPH_THEMES) {
    it(`${theme} writes the word's kanji into the scene`, () => {
      act(() =>
        root.render(createElement(StageAmbience, { theme, glyphs: "桜" })),
      );
      const text = [...host.querySelectorAll("text")]
        .map((t) => t.textContent)
        .join("");
      expect(text).toContain("桜");
    });
  }

  it("glyph scenes still draw stock characters when the word has no kanji", () => {
    act(() =>
      root.render(
        createElement(StageAmbience, { theme: "tanabata", glyphs: "" }),
      ),
    );
    expect(host.querySelectorAll("text").length).toBeGreaterThan(0);
  });

  it("cross-fades: the old layer leaves, then is removed", () => {
    render("spring");
    render("winter");
    expect(
      host.querySelector(".amb-layer--spring.amb-layer--leaving"),
    ).not.toBeNull();
    expect(
      host.querySelector(".amb-layer--winter:not(.amb-layer--leaving)"),
    ).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(AMBIENCE_FADE_MS + 10);
    });
    expect(host.querySelector(".amb-layer--spring")).toBeNull();
    expect(host.querySelectorAll(".amb-layer")).toHaveLength(1);
  });

  it("keeps the same layer when the theme does not change", () => {
    render("ocean");
    const before = host.querySelector(".amb-layer");
    render("ocean");
    expect(host.querySelector(".amb-layer")).toBe(before);
  });

  it("art is identical on every render (stable for recordings)", () => {
    render("city");
    const first = host.innerHTML;
    act(() => root.unmount());
    root = createRoot(host);
    render("city");
    expect(host.innerHTML).toBe(first);
  });
});

describe("useAmbienceSetting", () => {
  function Probe({ onValue }: { onValue: (v: [boolean, () => void]) => void }) {
    onValue(useAmbienceSetting());
    return null;
  }

  it("is on by default and remembers being switched off", () => {
    let current: [boolean, () => void] = [false, () => {}];
    act(() =>
      root.render(createElement(Probe, { onValue: (v) => (current = v) })),
    );
    expect(current[0]).toBe(true);
    act(() => current[1]());
    expect(current[0]).toBe(false);
    expect(localStorage.getItem("jlpt-trainer:player-ambience:v1")).toBe("off");
  });
});
