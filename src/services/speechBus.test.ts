import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  __resetSpeechBus,
  emitSpeechEvent,
  subscribeToSpeech,
  type SpeechBusEvent,
} from "./speechBus";

describe("speechBus", () => {
  beforeEach(() => __resetSpeechBus());
  afterEach(() => __resetSpeechBus());

  it("delivers events to every subscriber", () => {
    const a: SpeechBusEvent[] = [];
    const b: SpeechBusEvent[] = [];
    subscribeToSpeech((e) => a.push(e));
    subscribeToSpeech((e) => b.push(e));

    emitSpeechEvent({ type: "start", lang: "ja", rate: 1 });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });

  it("stops delivering after unsubscribe", () => {
    const seen: SpeechBusEvent[] = [];
    const off = subscribeToSpeech((e) => seen.push(e));
    emitSpeechEvent({ type: "end" });
    off();
    emitSpeechEvent({ type: "end" });
    expect(seen).toHaveLength(1);
  });

  it("does not let a throwing listener break speech for others", () => {
    const seen: SpeechBusEvent[] = [];
    subscribeToSpeech(() => {
      throw new Error("listener blew up");
    });
    subscribeToSpeech((e) => seen.push(e));

    // The emit itself must not throw — it runs inside the audio path.
    expect(() => emitSpeechEvent({ type: "end" })).not.toThrow();
    expect(seen).toHaveLength(1);
  });
});

describe("speechService → bus integration", () => {
  beforeEach(() => __resetSpeechBus());
  afterEach(() => {
    __resetSpeechBus();
    vi.useRealTimers();
  });

  it("emits units carrying kana and a usable duration while speaking Japanese", async () => {
    vi.useFakeTimers();
    const events: SpeechBusEvent[] = [];
    subscribeToSpeech((e) => events.push(e));

    // Local shape rather than SpeechSynthesisUtterance: the real handlers take
    // an event argument this fake does not need.
    type FakeUtterance = {
      text: string;
      onstart: (() => void) | null;
      onend: (() => void) | null;
    };
    const spoken: FakeUtterance[] = [];
    const voice = {
      name: "Microsoft Nanami Online (Natural) - Japanese (Japan)",
      lang: "ja-JP",
    } as SpeechSynthesisVoice;

    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [voice],
      speak: (u: FakeUtterance) => spoken.push(u),
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      speaking: false,
      paused: false,
      pending: false,
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        text = "";
        lang = "";
        rate = 1;
        voice: SpeechSynthesisVoice | null = null;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        onboundary: (() => void) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      }
    );

    const { speechService } = await import("./speechService");
    // Signature is (text, callbacks, rate, options) — the reading is the
    // fourth argument, not the third.
    speechService.speakJapanese("確認します", undefined, 1, {
      reading: "かくにんします",
    });

    expect(spoken.length).toBeGreaterThan(0);
    spoken[0]!.onstart?.();

    const start = events.find((e) => e.type === "start");
    expect(start).toBeDefined();
    expect(start).toMatchObject({ type: "start", lang: "ja" });

    // Let the karaoke timeline advance through the units.
    vi.advanceTimersByTime(4000);

    const units = events.filter((e) => e.type === "unit");
    expect(units.length).toBeGreaterThan(0);

    for (const unit of units) {
      if (unit.type !== "unit") continue;
      expect(unit.lang).toBe("ja");
      expect(unit.durationMs).toBeGreaterThan(0);
      // Every unit must carry something a mouth shape can be derived from.
      expect((unit.spokenText ?? unit.text).length).toBeGreaterThan(0);
    }

    spoken[0]!.onend?.();
    expect(events.some((e) => e.type === "end")).toBe(true);
  });
});
