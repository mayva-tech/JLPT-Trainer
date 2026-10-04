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
      threshold: param(),
      knee: param(),
      ratio: param(),
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

describe("costume sound effects", () => {
  it("are silent no-ops without Web Audio", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { playCostumeOn, playCostumeOff } = await import("./costumeSfx");
    expect(() => playCostumeOn("mecha")).not.toThrow();
    expect(() => playCostumeOff("samurai")).not.toThrow();
  });

  it("every costume has its own on sound", async () => {
    const { log, FakeCtx } = fakeAudio();
    vi.stubGlobal("AudioContext", FakeCtx);
    const { playCostumeOn } = await import("./costumeSfx");
    const { COSTUMES } = await import("./costumes");
    const shapes = new Set<string>();
    for (const c of COSTUMES) {
      playCostumeOn(c.id);
      const nodes = log.splice(0);
      expect(nodes.length, c.id).toBeGreaterThan(4);
      shapes.add(nodes.join(","));
    }
    expect(shapes.size).toBe(COSTUMES.length);
    playCostumeOn("unknown");
    expect(log).toEqual([]);
  });

  it("the mecha suit has its own off sound; the others share a poof", async () => {
    const { log, FakeCtx } = fakeAudio();
    vi.stubGlobal("AudioContext", FakeCtx);
    const { playCostumeOff } = await import("./costumeSfx");
    playCostumeOff("mecha");
    const mecha = log.splice(0).join(",");
    playCostumeOff("samurai");
    const samurai = log.splice(0).join(",");
    playCostumeOff("idol");
    expect(log.join(",")).toBe(samurai);
    expect(mecha).not.toBe(samurai);
  });

  it("a look change plays a swish and chime, pitched apart for Nanami and Andrew", async () => {
    const { log, FakeCtx } = fakeAudio();
    vi.stubGlobal("AudioContext", FakeCtx);
    const { playLookChange } = await import("./costumeSfx");
    playLookChange("ja");
    expect(log.splice(0)).toEqual(expect.arrayContaining(["noise", "osc"]));
    playLookChange("en");
    expect(log.splice(0).length).toBeGreaterThan(4);
    playLookChange("nobody");
    expect(log).toEqual([]);
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
    const { playCostumeOn } = await import("./costumeSfx");
    expect(() => playCostumeOn("hero")).not.toThrow();
  });
});
