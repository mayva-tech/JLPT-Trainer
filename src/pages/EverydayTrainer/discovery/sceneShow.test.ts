import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Every utterance "speaks" at once (a microtask), so only the show's own waits take time. */
const spoken: { lang: string; text: string }[] = [];
vi.mock("../../../services/speechService", async (orig) => {
  const real = await orig<typeof import("../../../services/speechService")>();
  const speak =
    (lang: string) =>
    (text: string, cb?: { onStart?: () => void; onEnd?: () => void }) => {
      spoken.push({ lang, text });
      queueMicrotask(() => {
        cb?.onStart?.();
        cb?.onEnd?.();
      });
    };
  return { ...real, speechService: { ...real.speechService, speakJapanese: speak("ja"), speakEnglish: speak("en"), stop: vi.fn() } };
});

import { DISCOVERY_SCENES } from "./scenes";
import { buildSceneCheck, checkpointIndices, sceneCheckQuestion } from "./sceneShow";
import { fillCount, HOOK_EN, lineReading, linePlain, SCENE_SCRIPTS } from "./sceneScripts";
import { useEverydaySpeech } from "../useEverydaySpeech";
import { useSceneShow, type SceneShow, type ShowOptions } from "./useSceneShow";
import type { DiscoveryScene } from "./types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("scene scripts", () => {
  for (const scene of DISCOVERY_SCENES) {
    it(`${scene.id}: intro and outro by both voices, readable Japanese, a comment line last`, () => {
      const s = SCENE_SCRIPTS[scene.id]!;
      for (const lines of [s.intro, s.outro]) {
        expect(lines.length).toBeGreaterThanOrEqual(3);
        expect(new Set(lines.map((l) => l.speaker))).toEqual(new Set(["nanami", "andrew"]));
        for (const l of lines) {
          if (l.speaker === "nanami") {
            expect(lineReading(l.text), l.text).toMatch(/^[぀-ゟ゠-ヿー、。！？]+$/u);
            expect(l.sub, l.text).toBeTruthy();
          } else {
            expect(fillCount(l.text, scene.objects.length)).not.toMatch(/[{}]/);
          }
        }
      }
      expect(s.outro.at(-1)!.text).toMatch(/comments/);
    });
  }

  it("fills the object count in words and readings in kana", () => {
    expect(fillCount("Let's find all {n}! {N} words.", 11)).toBe("Let's find all eleven! Eleven words.");
    expect(lineReading("ここは台所(だいどころ)です。")).toBe("ここはだいどころです。");
    expect(linePlain("ここは台所(だいどころ)です。")).toBe("ここは台所です。");
  });
});

describe("Pause & answer checks", () => {
  const scene = DISCOVERY_SCENES[0]!;
  it("alternate 'what is this' (three words, one right) and 'where is it'", () => {
    const cps = checkpointIndices(scene.objects.length, 5);
    expect(cps).toEqual([4, 9, 14]);
    const first = buildSceneCheck(scene.objects.slice(0, 5), scene.objects, 1)!;
    expect(first.kind).toBe("name");
    expect(first.options).toHaveLength(3);
    expect(first.options.filter((o) => o.correct)).toHaveLength(1);
    expect(new Set(first.options.map((o) => o.text)).size).toBe(3);
    expect(scene.objects.slice(0, 5)).toContain(first.object);
    const second = buildSceneCheck(scene.objects.slice(5, 10), scene.objects, 2)!;
    expect(second.kind).toBe("where");
    expect(sceneCheckQuestion(second)).toMatch(/^Where is the .+\?$/);
    expect(buildSceneCheck(scene.objects.slice(0, 5), scene.objects, 1)).toEqual(first);
  });
});

/* ── The show, end to end with fake timers ── */

let host: HTMLDivElement;
let root: Root;
let show: SceneShow;
const phases: string[] = [];

function mount(scene: DiscoveryScene, opts: ShowOptions, revealed: string[]) {
  function Probe() {
    const speech = useEverydaySpeech();
    show = useSceneShow({ scene, speech, getOptions: () => opts, onReveal: (o) => revealed.push(o.id) });
    if (phases.at(-1) !== show.phase) phases.push(show.phase);
    return null;
  }
  act(() => root.render(createElement(Probe)));
}

async function runFor(ms: number) {
  for (let t = 0; t < ms; t += 100) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  spoken.length = 0;
  phases.length = 0;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe("useSceneShow", () => {
  const train = DISCOVERY_SCENES.find((s) => s.id === "train")!;

  it("intro → every object (hook said once) → checks after 5 and 10 → outro", async () => {
    const revealed: string[] = [];
    mount(train, { hook: true, check: true, introOutro: true }, revealed);
    await act(async () => {
      void show.start();
    });
    await runFor(200_000);

    const script = SCENE_SCRIPTS.train!;
    const texts = spoken.map((s) => s.text);
    // Intro first, in order and in the right voices.
    expect(spoken.slice(0, script.intro.length).map((s) => s.lang)).toEqual(
      script.intro.map((l) => (l.speaker === "nanami" ? "ja" : "en")),
    );
    expect(texts[1]).toBe(linePlain(script.intro[1]!.text));
    // Hook line once, before the first object.
    expect(texts.filter((t) => t === HOOK_EN)).toHaveLength(1);
    expect(texts.indexOf(HOOK_EN)).toBe(script.intro.length);
    // Two checkpoints for 11 objects (after the 5th and 10th; a 1-object tail gets none).
    expect(texts.filter((t) => t.startsWith("Pause and answer!"))).toHaveLength(2);
    // Every object named, in order, then the outro, ending on the comment line.
    expect(revealed).toEqual(train.objects.map((o) => o.id));
    expect(texts.at(-1)).toMatch(/comments/);
    expect(phases).toEqual(expect.arrayContaining(["intro", "hook", "object", "check", "outro", "done"]));
    expect(show.playing).toBe(false);
  });

  it("with the hooks and intro off it is just the words", async () => {
    const revealed: string[] = [];
    mount(train, { hook: false, check: false, introOutro: false }, revealed);
    await act(async () => {
      void show.start();
    });
    await runFor(120_000);
    const texts = spoken.map((s) => s.text);
    expect(texts.some((t) => t === HOOK_EN || t.startsWith("Pause and answer!"))).toBe(false);
    expect(texts.some((t) => /comments/.test(t))).toBe(false);
    expect(revealed).toHaveLength(train.objects.length);
    expect(phases).not.toContain("intro");
  });

  it("pause stops at the current object; play resumes there without the intro", async () => {
    const revealed: string[] = [];
    mount(train, { hook: false, check: false, introOutro: true }, revealed);
    await act(async () => {
      void show.start();
    });
    await runFor(9_000);
    await act(async () => show.pause());
    const at = show.index;
    const count = spoken.length;
    await runFor(10_000);
    expect(spoken.length).toBe(count);
    expect(show.playing).toBe(false);
    await act(async () => show.play());
    await runFor(500);
    expect(show.index).toBe(at);
    expect(spoken.slice(count).some((s) => /aboard/.test(s.text))).toBe(false);
  });
});
