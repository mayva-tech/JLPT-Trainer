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
    ["桜", "cherry blossoms", "spring"],
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

  const festivalCases: [string, string, AmbienceTheme][] = [
    ["餅", "rice cake", "mochitsuki"],
    ["獅子舞", "lion dance", "shishimai"],
    ["鵜飼", "cormorant fishing", "ukai"],
    ["猿", "monkey", "snowMonkey"],
    ["鶴", "crane", "tsurumai"],
    ["藤", "wisteria", "fujidana"],
    ["茶畑", "tea field", "chabatake"],
    ["風鈴", "wind chime", "furin"],
    ["歌舞伎", "kabuki", "kabuki"],
    ["太鼓", "drum", "taiko"],
    ["たこ焼き", "octopus balls", "takoyaki"],
    ["おもちゃ", "toy", "gacha"],
    ["将棋", "shogi", "shogi"],
    ["図書館", "library", "library"],
    ["喫茶店", "coffee shop", "kissaten"],
    ["ブランコ", "swing", "playground"],
    ["稲刈り", "rice harvest", "harvest"],
    ["漁港", "fishing harbor", "harbor"],
    ["雪まつり", "snow festival", "yukimatsuri"],
    ["折り紙", "origami", "origami"],
  ];
  for (const [w, m, theme] of festivalCases) {
    it(`${w} → ${theme}`, () => {
      expect(ambienceForVocab(word(w, m))).toBe(theme);
    });
  }

  it("look-alikes stay apart: 折り鶴 is origami, 漁港 is the harbor, 雪まつり is the festival", () => {
    expect(ambienceForVocab(word("折り鶴", "paper crane"))).toBe("origami");
    expect(ambienceForVocab(word("漁港", "fishing port"))).toBe("harbor");
    expect(
      scoreAmbience({
        id: 1,
        primary: ["雪まつり", ""],
        categories: [],
        context: [],
      }).winter,
    ).toBe(0);
  });

  const motionCases: [string, string, AmbienceTheme][] = [
    ["自転車", "bicycle", "cycling"],
    ["凧", "kite", "kite"],
    ["踏切", "railroad crossing", "enoden"],
    ["灯籠", "lantern", "toro"],
    ["蛍", "firefly", "hotaru"],
    ["観覧車", "Ferris wheel", "kanransha"],
    ["水族館", "aquarium", "aquarium"],
    ["サーフィン", "surfing", "surf"],
    ["風船", "balloon", "balloon"],
    ["駅伝", "long-distance relay", "ekiden"],
    ["運動会", "sports day", "undokai"],
    ["洗濯", "laundry; washing", "laundry"],
    ["出前", "food delivery", "demae"],
    ["鹿", "deer", "deer"],
    ["雲海", "sea of clouds", "unkai"],
    ["テント", "tent", "camping"],
    ["スキー", "skiing", "ski"],
    ["犬", "dog", "dogWalk"],
    ["招き猫", "beckoning cat", "manekineko"],
    ["虹", "rainbow", "rainbow"],
  ];
  for (const [w, m, theme] of motionCases) {
    it(`${w} → ${theme}`, () => {
      expect(ambienceForVocab(word(w, m))).toBe(theme);
    });
  }

  it("a category shared by several scenes spreads its words across them", () => {
    const seen = new Set<AmbienceTheme>();
    for (let id = 1; id <= 40; id++) {
      seen.add(
        ambienceForVocab({
          id,
          word: "〜",
          meaning: "",
          subcategory: "Daily Vocabulary",
        }),
      );
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
    // …and each word keeps its own scene.
    const one = {
      id: 7,
      word: "〜",
      meaning: "",
      subcategory: "Daily Vocabulary",
    };
    expect(ambienceForVocab(one)).toBe(ambienceForVocab(one));
  });

  const peopleCases: [string, string, AmbienceTheme][] = [
    ["花見", "cherry blossom viewing", "hanami"],
    ["盆踊り", "Bon festival dance", "bonOdori"],
    ["通勤", "commuting", "rushHour"],
    ["書道", "calligraphy", "shodo"],
    ["抹茶", "powdered green tea", "sado"],
    ["相撲", "sumo wrestling", "sumo"],
    ["神輿", "portable shrine", "mikoshi"],
    ["車窓", "view from a train window", "trainWindow"],
    ["コンビニ", "convenience store", "konbini"],
    ["自販機", "vending machine", "jihanki"],
    ["交差点", "intersection", "scramble"],
    ["剣道", "kendo", "kendo"],
    ["黒板", "blackboard", "classroom"],
    ["釣り", "fishing", "fishing"],
    ["寿司", "sushi", "kaitenSushi"],
    ["雪だるま", "snowman", "kamakura"],
    ["金魚", "goldfish", "kingyo"],
    ["体操", "exercises", "radioTaiso"],
    ["名刺", "business card", "meishi"],
    ["縁側", "veranda", "engawa"],
  ];
  for (const [w, m, theme] of peopleCases) {
    it(`${w} → ${theme}`, () => {
      expect(ambienceForVocab(word(w, m))).toBe(theme);
    });
  }

  it("look-alike kanji stay with their own scene", () => {
    // 協力 is cooperation (合掌造り), not 力 strength (相撲); 期待 is not 待つ.
    expect(ambienceForVocab(word("協力", "cooperation"))).toBe("gassho");
    expect(
      scoreAmbience({
        id: 1,
        primary: ["期待", ""],
        categories: [],
        context: [],
      }).fishing,
    ).toBe(0);
  });

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
        word("検討", "consideration", { subcategory: "Sleep & Rest" }),
      ),
    ).toBe("tsukimi");
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
      sentence: "雨にもかかわらず、傘を持たずに出かけた。",
      sentenceMeaning: "Despite the rain, he went out without an umbrella.",
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

  it("uses all ninety themes", () => {
    expect(AMBIENCE_THEMES).toHaveLength(90);
    expect(new Set(themes).size).toBe(90);
  });

  it("keeps variety — no theme takes over the corpus", () => {
    const counts = new Map<AmbienceTheme, number>();
    for (const t of themes) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [, n] of counts) expect(n / themes.length).toBeLessThan(0.1);
  });

  it("varies inside a lesson — 10-word vocabulary lessons average 4.5+ scenes", () => {
    let distinct = 0;
    let lessons = 0;
    for (let i = 0; i < vocabulary.length; i += 10) {
      lessons++;
      distinct += new Set(vocabulary.slice(i, i + 10).map(ambienceForVocab))
        .size;
    }
    expect(distinct / lessons).toBeGreaterThanOrEqual(4.5);
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
