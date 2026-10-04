import { afterEach, describe, expect, it, vi } from "vitest";

/** Minimal Web Audio stand-in that records what gets scheduled. */
function fakeAudio() {
  const log: string[] = [];
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
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
      buffer: null as unknown,
    };
  };
  class FakeCtx {
    state = "suspended";
    currentTime = 0;
    sampleRate = 8000;
    destination = {};
    resume = vi.fn(() => Promise.resolve());
    createGain = () => node("gain");
    createOscillator = () => node("osc");
    createBiquadFilter = () => node("filter");
    createBufferSource = () => node("noise");
    createDynamicsCompressor = () => node("comp");
    createBuffer = (_ch: number, len: number, rate: number) => ({
      sampleRate: rate,
      getChannelData: () => new Float32Array(len),
    });
  }
  return { log, FakeCtx };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("suit sound effects", () => {
  it("are silent no-ops without Web Audio", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { playSuitOn, playSuitOff } = await import("./suitSfx");
    expect(() => playSuitOn()).not.toThrow();
    expect(() => playSuitOff()).not.toThrow();
  });

  it("schedules whir, clicks, clunk and hiss for suiting up and down", async () => {
    const { log, FakeCtx } = fakeAudio();
    vi.stubGlobal("AudioContext", FakeCtx);
    const { playSuitOn, playSuitOff } = await import("./suitSfx");
    playSuitOn();
    const on = log.splice(0);
    expect(on).toContain("comp");
    expect(on.filter((k) => k === "osc").length).toBeGreaterThanOrEqual(3); // servo + clunk + ring
    expect(on.filter((k) => k === "noise").length).toBe(4 + 1 + 1); // ratchets, thud, hiss
    playSuitOff();
    expect(log.filter((k) => k === "noise").length).toBe(3 + 1 + 1);
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
    const { playSuitOn } = await import("./suitSfx");
    expect(() => playSuitOn()).not.toThrow();
  });
});
