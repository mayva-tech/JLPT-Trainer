import { afterEach, describe, expect, it, vi } from "vitest";

/** Minimal Web Audio stand-in that records what gets scheduled. */
function fakeAudio() {
  const log: string[] = [];
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const node = (kind: string) => {
    log.push(kind);
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      gain: param(),
      frequency: param(),
      Q: param(),
      type: "",
    };
  };
  class FakeCtx {
    state = "suspended";
    currentTime = 0;
    destination = {};
    resume = vi.fn(() => Promise.resolve());
    createGain = () => node("gain");
    createOscillator = () => node("osc");
    createBiquadFilter = () => node("filter");
  }
  return { log, FakeCtx };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("quiz answer sounds", () => {
  it("are silent no-ops without Web Audio", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { playAnswerSound } = await import("./answerSfx");
    expect(() => playAnswerSound(true)).not.toThrow();
    expect(() => playAnswerSound(false)).not.toThrow();
  });

  it("correct, wrong and almost each sound different", async () => {
    const { log, FakeCtx } = fakeAudio();
    vi.stubGlobal("AudioContext", FakeCtx);
    const { playAnswerSound } = await import("./answerSfx");
    playAnswerSound(true);
    const correct = log.splice(0);
    playAnswerSound(false);
    const wrong = log.splice(0);
    playAnswerSound("almost");
    const almost = log.splice(0);
    expect(correct.filter((k) => k === "osc").length).toBeGreaterThanOrEqual(2);
    expect(wrong).toContain("filter");
    expect(correct).not.toContain("filter");
    expect(new Set([correct.join(), wrong.join(), almost.join()]).size).toBe(3);
  });

  it("never throws if the audio graph fails", async () => {
    class Broken {
      state = "running";
      currentTime = 0;
      createGain() {
        throw new Error("boom");
      }
    }
    vi.stubGlobal("AudioContext", Broken);
    const { playAnswerSound } = await import("./answerSfx");
    expect(() => playAnswerSound(false)).not.toThrow();
  });

  it("every reported quiz answer plays its sound", async () => {
    const sfx = await import("./answerSfx");
    const spy = vi.spyOn(sfx, "playAnswerSound").mockImplementation(() => {});
    const { reportAnswer, __resetReactionBus } = await import("./reactionBus");
    __resetReactionBus();
    reportAnswer(true);
    reportAnswer(false);
    reportAnswer("almost");
    expect(spy.mock.calls).toEqual([[true], [false], ["almost"]]);
    spy.mockRestore();
  });
});
