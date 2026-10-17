import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sfx: string[] = [];
vi.mock("./shortSfx", () => ({
  playSfx: (kind: string, opts?: { last?: boolean }) => sfx.push(opts?.last ? `${kind}!` : kind),
}));

import { vocabulary } from "../../data/vocabulary";
import { buildShortScript } from "./shortScript";
import { ShortStage, type ShortStageProps } from "./ShortStage";
import { useShortPlayer } from "./useShortPlayer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  sfx.length = 0;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

const item = vocabulary.find((v) => v.word === "注文")!;

function stage(over: Partial<ShortStageProps>) {
  const props: ShortStageProps = {
    item,
    level: "N2",
    wordNumber: 1,
    seriesLabel: "",
    phase: "hook",
    cue: { kind: "countdown", ms: 3000, key: 7 },
    highlight: null,
    activeLang: null,
    ambience: false,
    pan: false,
    panSeconds: 30,
    ...over,
  };
  act(() => root.render(createElement(ShortStage, props)));
}

describe("Shorts countdown", () => {
  it("classic: a draining ring timed to the countdown, with 3 · 2 · 1", () => {
    stage({ hookStyle: "classic" });
    const count = host.querySelector<HTMLElement>(".sh-count")!;
    expect(count.style.getPropertyValue("--sh-cd")).toBe("3000ms");
    expect(count.querySelector(".sh-count-arc")).not.toBeNull();
    expect([...count.querySelectorAll("span")].map((s) => s.textContent)).toEqual(["3", "2", "1"]);
  });

  it("message: ring, a bar draining across the card, typing dots, glowing answers", () => {
    stage({ hookStyle: "message" });
    expect(host.querySelector(".sh-chat-timer--on .sh-count--msg")).not.toBeNull();
    expect(host.querySelector<HTMLElement>(".sh-timer-bar span")?.style.animationDuration).toBe("3000ms");
    expect(host.querySelector(".sh-msg--counting")).not.toBeNull();
    stage({ hookStyle: "message", phase: "idle", cue: null });
    // Idle keeps the row's space (no layout jump) but shows nothing in it.
    expect(host.querySelector(".sh-chat-timer")).not.toBeNull();
    expect(host.querySelector(".sh-chat-timer--on, .sh-msg--counting, .sh-count")).toBeNull();
  });

  it("ticks once a second (the last one brighter), then time-up; Stop silences the rest", () => {
    vi.useFakeTimers();
    const steps = buildShortScript(item, { hookStyle: "classic" });
    let api: ReturnType<typeof useShortPlayer> | null = null;
    function Probe() {
      api = useShortPlayer(steps);
      return null;
    }
    act(() => root.render(createElement(Probe)));
    act(() => api!.play());
    for (let i = 0; i < 40 && !sfx.includes("timeup"); i++) {
      act(() => {
        vi.advanceTimersByTime(250);
      });
    }
    expect(sfx).toEqual(["tick", "tick", "tick!", "timeup"]);

    sfx.length = 0;
    act(() => api!.play());
    for (let i = 0; i < 40 && !sfx.length; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    act(() => api!.stop());
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(sfx).toEqual(["tick"]);
  });
});

describe("Shorts voice tones", () => {
  it("hook bright, the question up, the answer bright, the outro warm; taught lines plain", () => {
    const steps = buildShortScript(item, { hookStyle: "message" });
    const says = steps.filter((s) => s.kind === "say");
    const tone = (phase: string, i = 0) => says.filter((s) => s.phase === phase)[i];
    expect(tone("hook", 0)).toMatchObject({ tone: "opening" });
    expect(tone("hook", 1)).not.toHaveProperty("tone"); // Nanami's message = the example sentence
    expect(tone("hook", 2)).toMatchObject({ tone: "question" });
    expect(says.find((s) => s.text.startsWith("It's"))).toMatchObject({ tone: "excited" });
    expect(tone("outro")).toMatchObject({ tone: "outro" });
    for (const s of says.filter(
      (x) =>
        ["reveal", "meaning", "example", "shadow"].includes(x.phase) &&
        !x.text.startsWith("It's")
    )) {
      expect(s).not.toHaveProperty("tone");
    }
    const classic = buildShortScript(item, { hookStyle: "classic" }).filter((s) => s.kind === "say");
    expect(classic[0]).toMatchObject({ tone: "opening" });
    expect(classic[1]).toMatchObject({ tone: "excited", lang: "ja" });
  });
});
