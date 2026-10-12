import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Every utterance "speaks" instantly: one boundary, then end. */
const spoken: { lang: string; text: string }[] = [];
vi.mock("../services/speechService", () => {
  const speak =
    (lang: string) =>
    (
      text: string,
      cb?: { onStart?: () => void; onBoundary?: (h: { start: number; end: number }) => void; onEnd?: () => void }
    ) => {
      spoken.push({ lang, text });
      queueMicrotask(() => {
        cb?.onStart?.();
        cb?.onBoundary?.({ start: 0, end: Math.min(2, text.length) });
        cb?.onEnd?.();
      });
    };
  return {
    speechService: { speakJapanese: speak("ja"), speakEnglish: speak("en"), stop: vi.fn() },
    SPEECH_RATE_NORMAL: 0.8,
    SPEECH_RATE_SLOW: 0.68,
    resolveAutoModeSpeechRate: (_preferred: number, scripted: number) => scripted,
  };
});

import { useRegisterSession } from "./useRegisterSession";
import { getRegisterPairsForSection } from "../data/registerPairs";
import { POLITE_HOOK_EN } from "../utils/registerRetention";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Session = ReturnType<typeof useRegisterSession>;

let host: HTMLDivElement;
let root: Root;
let session: Session;
const hookStates: unknown[] = [];
const checkPhases: string[] = [];
const langs: (string | null)[] = [];

function mount(retention: { hook: boolean; check: boolean }) {
  function Probe() {
    session = useRegisterSession({
      getSpeechRate: () => 1,
      setSpeechStatus: () => {},
      setSpeechLang: (l) => langs.push(l),
      setHighlight: () => {},
      clearSpeechUi: () => {},
      isRegisterScreen: () => true,
      betweenItemsPause: 10,
      getRetention: () => retention,
    });
    if (session.hook) hookStates.push(session.hook);
    if (session.check && checkPhases.at(-1) !== session.check.phase) {
      checkPhases.push(session.check.phase);
    }
    return null;
  }
  act(() => root.render(createElement(Probe)));
}

async function runAll() {
  // Drain microtasks and every timer the sequence schedules.
  // Small steps, so React renders each phase (banner, countdown, card).
  for (let i = 0; i < 2000; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    if (!session.playingSection) break;
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  spoken.length = 0;
  hookStates.length = 0;
  checkPhases.length = 0;
  langs.length = 0;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe("useRegisterSession Play All hooks", () => {
  const pairs = getRegisterPairsForSection("register-01");

  it("says the polite hook on the first pair only, and pauses for a checkpoint", async () => {
    mount({ hook: true, check: true });
    act(() => session.playAll());
    await runAll();

    const hookLines = spoken.filter((s) => s.text === POLITE_HOOK_EN);
    expect(hookLines).toHaveLength(1);
    // A hook (banner) on every pair, with a countdown.
    expect(hookStates.some((h) => (h as { ms: number }).ms > 0)).toBe(true);

    // The hook comes after the casual form and before the formal form.
    const first = pairs[0]!;
    const at = spoken.findIndex((s) => s.text === POLITE_HOOK_EN);
    expect(spoken.slice(0, at).some((s) => s.text === first.casual.text)).toBe(true);
    expect(spoken.slice(0, at).some((s) => s.text === first.formal.text)).toBe(false);

    expect(spoken.filter((s) => s.text.startsWith("Pause and answer!")).length).toBeGreaterThan(0);
    // "ask" lasts only as long as the (instant) prompt here; think → reveal follow.
    expect(checkPhases.indexOf("think")).toBeLessThan(checkPhases.indexOf("reveal"));
    expect(checkPhases.indexOf("think")).toBeGreaterThanOrEqual(0);
    // Notes are spoken through the nuance path (whole-note karaoke offsets).
    expect(langs).toContain("nuance");
    expect(session.playingSection).toBe(false);
  });

  it("says each English meaning once per pair, and never repeats it on a polite reveal", async () => {
    mount({ hook: false, check: true });
    act(() => session.playAll());
    await runAll();
    expect(spoken.some((s) => s.text.startsWith("Pause and answer! Which is the polite"))).toBe(true);
    for (const p of pairs) {
      expect(spoken.filter((s) => s.lang === "en" && s.text === p.meaning)).toHaveLength(1);
    }
  });

  it("plays plainly with both hooks off", async () => {
    mount({ hook: false, check: false });
    act(() => session.playAll());
    await runAll();
    expect(spoken.some((s) => s.text === POLITE_HOOK_EN)).toBe(false);
    expect(spoken.some((s) => s.text.startsWith("Pause and answer!"))).toBe(false);
    expect(hookStates).toHaveLength(0);
    expect(spoken.filter((s) => s.text === pairs.at(-1)!.formal.text).length).toBeGreaterThan(0);
  });

  it("single-pair Play never runs the hook (Play All only, like Auto Mode)", async () => {
    mount({ hook: true, check: true });
    act(() => session.play());
    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await vi.runAllTimersAsync();
      });
    }
    expect(spoken.some((s) => s.text === POLITE_HOOK_EN)).toBe(false);
    expect(hookStates).toHaveLength(0);
  });
});
