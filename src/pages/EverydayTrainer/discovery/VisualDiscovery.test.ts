import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spoken: { lang: string; text: string; reading?: string | null }[] = [];
vi.mock("../../../services/speechService", async (orig) => {
  const real = await orig<typeof import("../../../services/speechService")>();
  const speak =
    (lang: string) =>
    (text: string, cb?: { onStart?: () => void; onEnd?: () => void }, _rate?: number, opts?: { reading?: string | null }) => {
      spoken.push({ lang, text, reading: opts?.reading });
      queueMicrotask(() => {
        cb?.onStart?.();
        cb?.onEnd?.();
      });
    };
  return { ...real, speechService: { ...real.speechService, speakJapanese: speak("ja"), speakEnglish: speak("en"), stop: vi.fn() } };
});

import { EVERYDAY_PROGRESS_KEY } from "../everydayProgress";
import { useEverydayProgress } from "../useEverydayProgress";
import { useEverydaySpeech } from "../useEverydaySpeech";
import { DISCOVERY_PROGRESS_KEY } from "./discoveryProgress";
import VisualDiscovery from "./VisualDiscovery";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {}
  disconnect() {}
};

function Host({ sceneId }: { sceneId: string | null }) {
  const everyday = useEverydayProgress();
  const speech = useEverydaySpeech();
  return createElement(VisualDiscovery, {
    everyday,
    speech,
    initialSceneId: sceneId,
    editor: false,
    onExit: () => {},
    onSceneChange: () => {},
  });
}

let host: HTMLDivElement;
let root: Root;

async function mount(sceneId: string | null) {
  await act(async () => {
    root.render(createElement(Host, { sceneId }));
  });
  // Let the lazily loaded scene art resolve.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

const q = <T extends Element = HTMLElement>(sel: string) => host.querySelector<T>(sel);
const press = async (el: Element, key: string) => {
  await act(async () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });
};
const click = async (el: Element) => {
  await act(async () => {
    (el as HTMLElement).click();
  });
};
const button = (label: string) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === label || b.getAttribute("aria-label") === label)!;
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "{}");

beforeEach(() => {
  localStorage.clear();
  spoken.length = 0;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("<VisualDiscovery />", () => {
  it("gallery: three scenes with object counts and progress", async () => {
    await mount(null);
    const cards = host.querySelectorAll(".vd-scene-card");
    expect(cards).toHaveLength(3);
    expect(cards[0]!.textContent).toContain("15 objects · 0 discovered · 0 learned");
    expect(host.textContent).toContain("写真で日本語".slice(0, 2));
  });

  it("explore: a hotspot (keyboard) opens the card, speaks Nanami, counts as discovered — not learned", async () => {
    await mount("kitchen");
    const fridge = q('[data-hotspot="fridge"]')!;
    expect(fridge.getAttribute("aria-label")).toBe("Refrigerator — 冷蔵庫");
    await press(fridge, "Enter");

    expect(q(".vd-card-jp")?.textContent).toBe("冷蔵庫");
    expect(q(".vd-card")?.textContent).toContain("reizōko");
    expect(q(".vd-card")?.textContent).toContain("New!");
    expect(q(".vd-count")?.textContent).toBe("1 / 15 discovered");
    expect(q('[data-hotspot="fridge"]')?.getAttribute("class")).toContain("vd-hs--selected");
    expect(spoken.at(-1)).toMatchObject({ lang: "ja", text: "冷蔵庫", reading: "れいぞうこ" });

    expect(stored(DISCOVERY_PROGRESS_KEY).discovered).toEqual({ kitchen: ["fridge"] });
    expect(stored(EVERYDAY_PROGRESS_KEY).practiced).toContain("fridge");
    expect(stored(EVERYDAY_PROGRESS_KEY).known).not.toContain("fridge");

    await click(button("Mark learned"));
    expect(stored(EVERYDAY_PROGRESS_KEY).known).toContain("fridge");
    await click(button("Save for review"));
    expect(stored(EVERYDAY_PROGRESS_KEY).favorites).toContain("fridge");

    await click(button("Next undiscovered →"));
    expect(q(".vd-card-jp")?.textContent).toBe("冷凍庫");
    expect(q(".vd-count")?.textContent).toBe("2 / 15 discovered");
  });

  it("explore: English audio uses Andrew; the second tap of the same object is not 'New!'", async () => {
    await mount("kitchen");
    await press(q('[data-hotspot="sink"]')!, "Enter");
    await click(button("English audio (Andrew)"));
    expect(spoken.at(-1)).toMatchObject({ lang: "en", text: "Kitchen sink" });
    await press(q('[data-hotspot="sink"]')!, "Enter");
    expect(q(".vd-card")?.textContent).not.toContain("New!");
  });

  it("the one toolbar ▶ Play all opens Guided and runs the show; Stop pauses it", async () => {
    await mount("kitchen");
    expect(host.querySelectorAll(".vd-playall")).toHaveLength(1);
    spoken.length = 0;
    await click(q(".vd-playall")!);
    expect(button("Guided")?.getAttribute("aria-pressed")).toBe("true");
    expect(q(".vd-playall")?.textContent?.trim()).toBe("Stop");
    expect(q(".vd-tour-pos")?.textContent).toBe("Intro");
    expect(spoken[0]?.lang).toBe("en");

    await click(q(".vd-playall")!);
    expect(q(".vd-playall")?.textContent?.trim()).toBe("Play all");
    expect(button("Resume")).toBeTruthy();
  });

  it("narrow window: controls fold behind ▾, Play all leaves a clean frame, the word card has no buttons", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("max-width: 700px"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      await mount("kitchen");
      expect(q(".vd-playall")).toBeNull();
      expect(q(".vd-frame .vd-zoom")).toBeNull();

      await click(q(".vd-controls-toggle")!);
      expect(q(".vd-zoom-slot .vd-zoom")).not.toBeNull();
      expect(q(".vd-frame .vd-zoom")).toBeNull();

      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      try {
        await click(q(".vd-playall")!);
        expect(q("#vd-controls")).toBeNull();
        expect(q(".vd-show-panel [data-head-dock]")).not.toBeNull();
        expect(host.querySelectorAll(".vd-script-line")).toHaveLength(1);

        for (let k = 0; k < 40 && !q(".vd-card--compact"); k++) {
          await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
          });
        }
        const card = q(".vd-card--compact")!;
        expect(card.textContent).toContain("Refrigerator");
        expect(card.querySelectorAll("button")).toHaveLength(0);
        expect(card.closest(".vd-show-panel")?.querySelector("[data-head-dock]")).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    } finally {
      window.matchMedia = original;
    }
  });

  it("Find it: names hidden from the hotspots, a prompt per object, answers recorded", async () => {
    await mount("kitchen");
    await click(button("Find it"));
    const labels = [...host.querySelectorAll("[data-hotspot]")].map((e) => e.getAttribute("aria-label"));
    expect(labels.every((l) => /^Object \d+$/.test(l ?? ""))).toBe(true);

    const prompt = q(".vd-prompt")!.textContent!;
    expect(prompt).toMatch(/^Find the .+\.$/);
    expect(spoken.at(-1)).toMatchObject({ lang: "en", text: prompt });

    // Answer correctly by finding the object whose word the prompt names.
    const { KITCHEN_SCENE } = await import("./scenes/kitchen");
    const { findPrompt } = await import("./discoveryQuiz");
    const { objectWord } = await import("./scenes");
    const target = KITCHEN_SCENE.objects.find((o) => findPrompt(o, objectWord(o)).en === prompt)!;
    const wrong = KITCHEN_SCENE.objects.find((o) => o.id !== target.id)!;

    await press(q(`[data-hotspot="${wrong.id}"]`)!, "Enter");
    expect(q(".vd-feedback")?.textContent).toMatch(/Try again/);
    await press(q(`[data-hotspot="${target.id}"]`)!, "Enter");
    expect(q(".vd-feedback")?.textContent).toMatch(/^✓/);

    const stats = stored(EVERYDAY_PROGRESS_KEY).stats[target.vocabularyId];
    expect(stats).toMatchObject({ seenCount: 1, wrongCount: 1, lastResult: "incorrect" });
    expect(stored(DISCOVERY_PROGRESS_KEY).quiz.kitchen).toMatchObject({ correct: 1, incorrect: 1 });
    expect(q(".vd-quiz-pos")?.textContent).toMatch(/^2 \/ 15 · 0 first try/);
  });

  it("Listen: nothing is tappable until Start, then Nanami says the word", async () => {
    await mount("train");
    await click(button("Listen"));
    expect(q('[data-hotspot="seat"]')?.getAttribute("tabindex")).toBe("-1");
    spoken.length = 0;
    await click(button("Start listening"));
    expect(spoken[0]?.lang).toBe("ja");
    expect(q('[data-hotspot="seat"]')?.getAttribute("tabindex")).toBe("0");
  });
});

describe("<SceneView /> with a photo that fails to load", () => {
  it("says so and stops taking taps instead of showing a blank, tappable picture", async () => {
    const { SceneView } = await import("./SceneView");
    const { KITCHEN_SCENE } = await import("./scenes/kitchen");
    const scene = {
      ...KITCHEN_SCENE,
      id: "photo-test",
      imagePath: "photo:missing.webp",
      credit: { author: "test", license: "CC0", source: "-" },
    };
    const onSelect = vi.fn();
    await act(async () => {
      root.render(
        createElement(SceneView, {
          scene,
          selectedId: null,
          onSelect,
          labelFor: (o: { id: string }) => o.id,
          showObjects: false,
          foundIds: new Set<string>(),
        }),
      );
    });
    const img = host.querySelector("image")!;
    expect(img.getAttribute("href")).toMatch(/discovery\/missing\.webp$/);
    expect(q('[data-hotspot="fridge"]')?.getAttribute("tabindex")).toBe("0");
    await act(async () => {
      img.dispatchEvent(new Event("error"));
    });
    expect(q('[role="alert"]')?.textContent).toMatch(/could not be loaded/);
    expect(q('[data-hotspot="fridge"]')?.getAttribute("tabindex")).toBe("-1");
    await press(q('[data-hotspot="fridge"]')!, "Enter");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
