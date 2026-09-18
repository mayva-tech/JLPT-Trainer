import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type BoundaryHandler = (ev: {
  name?: string;
  charIndex?: number;
  charLength?: number;
}) => void;

class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((ev?: unknown) => void) | null = null;
  onboundary: BoundaryHandler | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function installSpeechMock(opts?: { emptyVoices?: boolean }) {
  const spoken: FakeUtterance[] = [];
  let voices: SpeechSynthesisVoice[] = opts?.emptyVoices
    ? []
    : [
        {
          name: "Microsoft Andrew Online",
          lang: "en-US",
          localService: false,
          default: true,
          voiceURI: "andrew",
        } as SpeechSynthesisVoice,
        {
          name: "Microsoft Nanami Online",
          lang: "ja-JP",
          localService: false,
          default: true,
          voiceURI: "nanami",
        } as SpeechSynthesisVoice,
      ];

  const listeners = new Map<string, Set<() => void>>();

  const synth = {
    speaking: false,
    paused: false,
    cancel: vi.fn(() => {
      synth.speaking = false;
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => voices,
    speak: vi.fn((utter: FakeUtterance) => {
      spoken.push(utter);
      synth.speaking = true;
    }),
    addEventListener: vi.fn((type: string, handler: () => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    }),
    removeEventListener: vi.fn((type: string, handler: () => void) => {
      listeners.get(type)?.delete(handler);
    }),
  };

  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    value: FakeUtterance,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "speechSynthesis", {
    value: synth,
    configurable: true,
    writable: true,
  });

  return {
    synth,
    spoken,
    setVoices(next: SpeechSynthesisVoice[]) {
      voices = next;
    },
    fireVoicesChanged() {
      for (const h of listeners.get("voiceschanged") ?? []) h();
    },
  };
}

describe("speechService playback generation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("ignores old callbacks after stop", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakJapanese("在庫", {
      onBoundary: (h) => highlights.push(h),
    });

    expect(spoken.length).toBe(1);
    const first = spoken[0]!;
    speechService.stop();

    first.onstart?.();
    first.onboundary?.({ name: "word", charIndex: 0, charLength: 2 });
    expect(highlights.length).toBe(0);
  });

  it("ignores old callbacks after a newer utterance starts", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const a: number[] = [];
    const b: number[] = [];
    speechService.speakEnglish("Hello world", {
      onBoundary: (h) => a.push(h.start),
    });
    expect(spoken.length).toBe(1);
    const first = spoken[0]!;
    speechService.speakEnglish("Next line", {
      onBoundary: (h) => b.push(h.start),
    });
    expect(spoken.length).toBe(2);
    const second = spoken[1]!;

    first.onstart?.();
    first.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    expect(a.length).toBe(0);

    second.onstart?.();
    second.onboundary?.({ name: "word", charIndex: 0, charLength: 4 });
    expect(b.length).toBe(1);
  });

  it("startOnce prevents duplicate speak when voices load late", async () => {
    const { synth, spoken, setVoices, fireVoicesChanged } = installSpeechMock({
      emptyVoices: true,
    });
    const { speechService } = await import("./speechService");

    speechService.speakEnglish("Hello");
    expect(synth.addEventListener).toHaveBeenCalled();
    expect(spoken.length).toBe(0);

    setVoices([
      {
        name: "Andrew",
        lang: "en-US",
        localService: true,
        default: true,
        voiceURI: "andrew",
      } as SpeechSynthesisVoice,
    ]);
    fireVoicesChanged();
    vi.advanceTimersByTime(200);
    expect(spoken.length).toBe(1);
  });

  it("stop cancels pending delayed startup", async () => {
    const { spoken } = installSpeechMock({ emptyVoices: true });
    const { speechService } = await import("./speechService");

    speechService.speakEnglish("Hello");
    speechService.stop();
    vi.advanceTimersByTime(300);
    expect(spoken.length).toBe(0);
  });

  it("stop during an utterance settles the waiter once via cancel, not onEnd", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, isSpeechCancelled } = await import("./speechService");

    let ends = 0;
    let errors = 0;
    const errorsSeen: unknown[] = [];
    const settled = new Promise<string>((resolve) => {
      speechService.speakEnglish("Hello world", {
        onEnd: () => {
          ends += 1;
          resolve("end");
        },
        onError: (error) => {
          errors += 1;
          errorsSeen.push(error);
          resolve("error");
        },
      });
    });

    const first = spoken[0]!;
    speechService.stop();
    await expect(settled).resolves.toBe("error");
    expect(ends).toBe(0);
    expect(errors).toBe(1);
    expect(isSpeechCancelled(errorsSeen[0])).toBe(true);

    first.onstart?.();
    first.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    first.onend?.();
    first.onerror?.({ error: "interrupted" });
    expect(ends).toBe(0);
    expect(errors).toBe(1);
  });

  it("ignores stale karaoke timers after stop", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world today", {
      onBoundary: (h) => highlights.push(h),
    });
    spoken[0]!.onstart?.();
    // The timeline starts immediately, so exactly the first unit is lit.
    const afterStart = highlights.length;
    expect(afterStart).toBe(1);

    speechService.stop();
    vi.advanceTimersByTime(5000);
    expect(highlights.length).toBe(afterStart);
  });

  it("starting a new utterance cancels the previous without onEnd and plays the new one", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, isSpeechCancelled } = await import("./speechService");

    let firstEnds = 0;
    let firstErrors = 0;
    speechService.speakEnglish("Hello world", {
      onEnd: () => {
        firstEnds += 1;
      },
      onError: (error) => {
        firstErrors += 1;
        expect(isSpeechCancelled(error)).toBe(true);
      },
    });
    const first = spoken[0]!;

    const highlights: number[] = [];
    speechService.speakEnglish("Next line", {
      onBoundary: (h) => highlights.push(h.start),
    });
    expect(firstEnds).toBe(0);
    expect(firstErrors).toBe(1);

    first.onstart?.();
    first.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    first.onend?.();
    expect(firstEnds).toBe(0);
    expect(firstErrors).toBe(1);
    expect(highlights.length).toBe(0);

    const second = spoken[1]!;
    second.onstart?.();
    second.onboundary?.({ name: "word", charIndex: 0, charLength: 4 });
    expect(highlights).toEqual([0]);
  });

  it("cancellation does not advance a callback-chained next clip", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    let advanced = false;
    speechService.speakEnglish("Hello", {
      onEnd: () => {
        advanced = true;
        speechService.speakEnglish("World");
      },
      onError: () => {
        // cancel path — must not start the next clip
      },
    });
    speechService.stop();
    expect(advanced).toBe(false);
    expect(spoken.length).toBe(1);
    spoken[0]!.onend?.();
    expect(advanced).toBe(false);
    expect(spoken.length).toBe(1);
  });
});

describe("speechService karaoke timeline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.resetModules();
  });

  /** Planned absolute offsets (ms) of each karaoke unit from the timeline origin. */
  async function plannedEnglishOffsets(text: string, rate: number) {
    const { buildEnglishSpokenKaraokeSteps, estimateUnitDurationMs } =
      await import("../utils/speechHighlightUnits");
    const { __speechTestHooks } = await import("./speechService");
    const units = buildEnglishSpokenKaraokeSteps(text);
    const offsets: number[] = [];
    let acc = __speechTestHooks.FALLBACK_START_OFFSET_MS;
    // Mirror speechService EN rate handling (neural Andrew is nonlinear < ~0.88).
    const rateDivisor = Math.max(rate, 0.88);
    for (let i = 0; i < units.length; i += 1) {
      offsets.push(acc);
      acc +=
        (estimateUnitDurationMs(units[i]!, "en", units[i + 1] ?? null) /
          rateDivisor) *
        __speechTestHooks.FALLBACK_TIMING_SCALE_EN;
    }
    return offsets;
  }

  it("highlights the first unit immediately on onstart, with no detection window", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      "Hello world today",
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    // Synchronous — no timers advanced at all.
    expect(highlights).toEqual([{ start: 0, end: 5 }]);
  });

  it("does not highlight anything before onstart", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello", { onBoundary: (h) => highlights.push(h) }, 1);
    expect(spoken.length).toBe(1);

    vi.advanceTimersByTime(2000);
    expect(highlights.length).toBe(0);
  });

  it("a later browser boundary corrects an already-running fallback timeline", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      "Hello world today",
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    expect(highlights).toEqual([{ start: 0, end: 5 }]);

    // Fallback is running; the browser then reports the real position.
    vi.advanceTimersByTime(60);
    utter.onboundary?.({ name: "word", charIndex: 6, charLength: 5 });
    expect(highlights.at(-1)).toEqual({ start: 6, end: 11 });

    // Timeline was rebased onto that boundary: the next unit is a full unit
    // away from the boundary instant, not from the original origin.
    const planned = await plannedEnglishOffsets("Hello world today", 1);
    const gap = planned[2]! - planned[1]!;
    vi.advanceTimersByTime(gap - 20);
    expect(highlights.at(-1)).toEqual({ start: 6, end: 11 });
    vi.advanceTimersByTime(40);
    expect(highlights.at(-1)).toEqual({ start: 12, end: 17 });
  });

  it("snaps straight to a browser jump instead of replaying skipped units", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "Hello world today and tomorrow";
    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(text, { onBoundary: (h) => highlights.push(h) }, 1);
    const utter = spoken[0]!;
    utter.onstart?.();
    expect(highlights).toEqual([{ start: 0, end: 5 }]);

    // Browser skips "world" and "today" and reports "and".
    utter.onboundary?.({ name: "word", charIndex: 18, charLength: 3 });
    expect(highlights.at(-1)).toEqual({ start: 18, end: 21 });
    // Synchronous snap — the skipped units are never lit, then or later.
    expect(highlights).toHaveLength(2);
    vi.advanceTimersByTime(300);
    expect(highlights.some((h) => h.start === 6 || h.start === 12)).toBe(false);
  });

  it("snaps a Japanese browser jump without replaying skipped units", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, splitHighlightUnits } = await import("./speechService");

    // No speak-text transformation → browser boundaries are usable.
    const text = "在庫を確認する";
    const units = splitHighlightUnits(text);
    expect(units.length).toBeGreaterThanOrEqual(3);
    const last = units.at(-1)!;

    const highlights: string[] = [];
    speechService.speakJapanese(
      text,
      { onBoundary: (h) => highlights.push(text.slice(h.start, h.end)) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    const first = highlights.length;

    utter.onboundary?.({
      name: "word",
      charIndex: last.start,
      charLength: last.end - last.start,
    });
    expect(highlights.at(-1)).toBe(text.slice(last.start, last.end));
    expect(highlights.length).toBe(first + 1);
  });

  it("never moves the highlight backwards on a stale boundary", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      "Hello world today",
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    utter.onboundary?.({ name: "word", charIndex: 12, charLength: 5 });
    expect(highlights.at(-1)).toEqual({ start: 12, end: 17 });

    const count = highlights.length;
    utter.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    utter.onboundary?.({ name: "word", charIndex: 6, charLength: 5 });
    expect(highlights.length).toBe(count);
    expect(highlights.at(-1)).toEqual({ start: 12, end: 17 });
  });

  it("absolute deadlines do not accumulate timer drift", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "Hello world today and tomorrow";
    const planned = await plannedEnglishOffsets(text, 1);

    // Simulate each highlight callback costing 30 ms of wall clock that the
    // timer queue does not know about. Chained relative timeouts would fall
    // 30 ms further behind on every unit.
    const LAG = 30;
    let extraLag = 0;
    const baseNow = performance.now.bind(performance);
    vi.spyOn(performance, "now").mockImplementation(() => baseNow() + extraLag);

    const firedAt: number[] = [];
    speechService.speakEnglish(
      text,
      {
        onBoundary: () => {
          firedAt.push(performance.now());
          extraLag += LAG;
        },
      },
      1
    );
    const utter = spoken[0]!;
    const origin = performance.now();
    utter.onstart?.();
    vi.advanceTimersByTime(10000);

    expect(firedAt.length).toBe(planned.length);
    for (let i = 0; i < firedAt.length; i += 1) {
      const error = Math.abs(firedAt[i]! - (origin + planned[i]!));
      expect(error).toBeLessThanOrEqual(LAG + 5);
    }
  });

  it("EN karaoke at normal rate stretches longer than at rate 1 (not racing the voice)", async () => {
    const { __speechTestHooks } = await import("./speechService");
    const { SPEECH_RATE_NORMAL } = await import("./speechService");

    const text = "How can I help you today?";
    // Scale must stay ≥ 1 — values like 0.88 made Game Mode EN karaoke race ahead.
    expect(__speechTestHooks.FALLBACK_TIMING_SCALE_EN).toBeGreaterThanOrEqual(1);

    const atFull = await plannedEnglishOffsets(text, 1);
    const atNormal = await plannedEnglishOffsets(text, SPEECH_RATE_NORMAL);
    const spanFull = atFull.at(-1)!;
    const spanNormal = atNormal.at(-1)!;
    // Neural floor still stretches past rate=1 so highlights do not outrun Andrew.
    expect(spanNormal).toBeGreaterThan(spanFull);
  });

  it("pause freezes karaoke and resume preserves sync", async () => {
    const { spoken, synth } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "Hello world today";
    const planned = await plannedEnglishOffsets(text, 1);
    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(text, { onBoundary: (h) => highlights.push(h) }, 1);
    const utter = spoken[0]!;
    utter.onstart?.();
    expect(highlights.length).toBe(1);

    vi.advanceTimersByTime(50);
    speechService.pause();
    expect(synth.pause).toHaveBeenCalled();

    // Frozen: a long pause must not fire any karaoke step.
    vi.advanceTimersByTime(10000);
    expect(highlights.length).toBe(1);

    speechService.resume();
    // Remaining time to unit 1 is what was left when we paused, not zero.
    vi.advanceTimersByTime(planned[1]! - 50 - 20);
    expect(highlights.length).toBe(1);
    vi.advanceTimersByTime(40);
    expect(highlights.at(-1)).toEqual({ start: 6, end: 11 });
  });

  it("highlights the last unit on end when browser skipped its boundary", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      "Hello world",
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    utter.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    expect(highlights.at(-1)).toEqual({ start: 0, end: 5 });

    utter.onend?.();
    expect(highlights.at(-1)).toEqual({ start: 6, end: 11 });
  });

  it("does not rush multiple remaining units at end of speech", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      "Hello world today",
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    expect(highlights).toEqual([{ start: 0, end: 5 }]);

    utter.onend?.();
    // Two+ unlit units must not flash — clear instead of fake sync.
    expect(highlights).toEqual([{ start: 0, end: 5 }]);
    vi.advanceTimersByTime(500);
    expect(highlights).toEqual([{ start: 0, end: 5 }]);
  });

  it("uses spoken-kana fallback timing when a reading is provided", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: string[] = [];
    const text = "妊娠";
    speechService.speakJapanese(
      text,
      { onBoundary: (h) => highlights.push(text.slice(h.start, h.end)) },
      1,
      { reading: "にんしん" }
    );
    const utter = spoken[0]!;
    expect(utter.text).toContain("にんしん");
    utter.onstart?.();
    expect(highlights[0]).toBe("妊娠");
  });

  it("ignores browser boundaries when audio text differs from visible text", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "妊娠";
    const highlights: string[] = [];
    speechService.speakJapanese(
      text,
      { onBoundary: (h) => highlights.push(text.slice(h.start, h.end)) },
      1,
      { reading: "にんしん" }
    );
    const utter = spoken[0]!;
    utter.onstart?.();
    const count = highlights.length;
    // charIndex refers to にんしん, not 妊娠 — must not be mapped.
    utter.onboundary?.({ name: "word", charIndex: 3, charLength: 2 });
    expect(highlights.length).toBe(count);
  });

  it("recovers unit timing when the reading is an unspaced kana blob", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    // Speech-styles style data: kana reading with no token boundaries.
    const text = "私も行きます。";
    const highlights: string[] = [];
    speechService.speakJapanese(
      text,
      { onBoundary: (h) => highlights.push(text.slice(h.start, h.end)) },
      1,
      { reading: "わたしもいきます。" }
    );
    const utter = spoken[0]!;
    // Audio still uses the reading.
    expect(utter.text).toContain("わたし");
    utter.onstart?.();
    // Each unit is timed by its own kana, not by a positional pairing that
    // would give 私も the reading わたし.
    expect(highlights[0]).toBe("私も");
    vi.advanceTimersByTime(8000);
    expect(highlights).toContain("行きます。");
  });

  it("uses fallback karaoke when Japanese reading equals the surface (ている patterns)", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "〜ことになっている";
    const highlights: string[] = [];
    speechService.speakJapanese(
      text,
      { onBoundary: (h) => highlights.push(text.slice(h.start, h.end)) },
      1,
      { reading: "〜ことになっている" }
    );
    const utter = spoken[0]!;
    // Wave-slot pause is inserted even when reading equals the surface.
    expect(utter.text).toBe("〜、ことになっている");
    utter.onstart?.();
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights[0]).not.toContain("〜");
    expect(highlights[0]).toContain("こと");
    // Advance through remaining fallback steps
    vi.advanceTimersByTime(8000);
    expect(highlights.some((h) => h.includes("いる"))).toBe(true);
  });

  it("rebases English karaoke from spoken audio even when display has (notes)", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "to return (goods)";
    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish(
      text,
      { onBoundary: (h) => highlights.push(h) },
      1
    );
    const utter = spoken[0]!;
    // Parenthetical is stripped from audio but kept on the display string.
    expect(utter.text).toBe("to return");
    expect(utter.text).not.toEqual(text);

    utter.onstart?.();
    expect(highlights[0]).toEqual({ start: 0, end: 2 }); // "to"

    // Andrew reports the second spoken word; map onto display "return".
    utter.onboundary?.({ name: "word", charIndex: 3, charLength: 6 });
    expect(highlights.at(-1)).toEqual({ start: 3, end: 9 });
  });

  it("splits I (soft, casual) into two utterances with a real pause and highlights casual", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text = "I (soft, casual)";
    const highlights: string[] = [];
    let ended = 0;
    speechService.speakEnglish(text, {
      onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      onEnd: () => {
        ended += 1;
      },
    });

    expect(spoken.length).toBe(1);
    expect(spoken[0]!.text).toBe("I");
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 50);
    expect(highlights).toContain("I");
    spoken[0]!.onend?.();
    expect(ended).toBe(0);
    expect(spoken.length).toBe(1);

    vi.advanceTimersByTime(700);
    expect(spoken.length).toBe(2);
    expect(spoken[1]!.text).toBe("soft, casual");
    spoken[1]!.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 50);
    expect(highlights).toContain("(soft,");
    // Advance through aside karaoke so casual) lights up.
    vi.advanceTimersByTime(5000);
    expect(highlights).toContain("casual)");
    spoken[1]!.onend?.();
    expect(ended).toBe(1);
  });

  it("cancels the gloss aside pause when stop is called mid-gap", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, isSpeechCancelled } = await import("./speechService");

    let ended = 0;
    let cancelled = false;
    speechService.speakEnglish("I (soft, casual)", {
      onEnd: () => {
        ended += 1;
      },
      onError: (error) => {
        cancelled = isSpeechCancelled(error);
      },
    });
    spoken[0]!.onstart?.();
    spoken[0]!.onend?.();
    speechService.stop();
    vi.advanceTimersByTime(1000);
    expect(spoken.length).toBe(1);
    expect(ended).toBe(0);
    expect(cancelled).toBe(true);
  });

  it("splits soft; warning into two utterances and highlights through 私", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text =
      "Not a default for women. In a workplace or with strangers it sounds too soft; many women use 私 in every situation of their lives.";
    const highlights: string[] = [];
    let ended = 0;
    speechService.speakEnglish(text, {
      onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      onEnd: () => {
        ended += 1;
      },
    });

    expect(spoken.length).toBe(1);
    expect(spoken[0]!.text).toMatch(/for women$/i);
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 50);
    expect(highlights[0]).toBe("Not");
    // Finish first clause karaoke quickly then end utterance.
    vi.advanceTimersByTime(20000);
    spoken[0]!.onend?.();
    expect(ended).toBe(0);

    // Advance through remaining clause pauses + utterances.
    for (let i = 0; i < 8 && ended === 0; i++) {
      vi.advanceTimersByTime(700);
      const utter = spoken[spoken.length - 1]!;
      if (utter.onstart) {
        utter.onstart?.();
        vi.advanceTimersByTime(
          __speechTestHooks.FALLBACK_START_OFFSET_MS + 20000
        );
        utter.onend?.();
      }
    }
    expect(spoken.length).toBeGreaterThanOrEqual(3);
    expect(spoken.some((u) => u.text.includes("watashi"))).toBe(true);
    expect(highlights).toContain("私");
    expect(highlights).toContain("lives.");
    expect(ended).toBe(1);
  });

  it("splits explanation sentences and keeps karaoke from lagging on the last clause", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text =
      "From a senior to a junior it can sound condescending. In song lyrics it is romantic; in an office it can grate.";
    const highlights: string[] = [];
    let ended = 0;
    speechService.speakEnglish(text, {
      onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      onEnd: () => {
        ended += 1;
      },
    });

    expect(spoken[0]!.text).toMatch(/condescending$/);
    for (let i = 0; i < 5 && ended === 0; i++) {
      const utter = spoken[spoken.length - 1]!;
      utter.onstart?.();
      vi.advanceTimersByTime(
        __speechTestHooks.FALLBACK_START_OFFSET_MS + 15000
      );
      utter.onend?.();
      if (ended === 0) vi.advanceTimersByTime(700);
    }
    expect(spoken.map((u) => u.text)).toEqual([
      "From a senior to a junior it can sound condescending",
      "In song lyrics it is romantic",
      "in an office it can grate",
    ]);
    expect(highlights).toContain("grate.");
    expect(ended).toBe(1);
  });

  it("splits on em dash with a real pause so karaoke does not race ahead", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text = "Sorry — I'll be a bit late!";
    const highlights: string[] = [];
    let ended = 0;
    speechService.speakEnglish(text, {
      onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      onEnd: () => {
        ended += 1;
      },
    });

    expect(spoken).toHaveLength(1);
    expect(spoken[0]!.text).toBe("Sorry");
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 50);
    // Highlight covers "Sorry —" so the mdash pause is visible on the dash.
    expect(highlights[0]).toMatch(/^Sorry/);
    expect(highlights[0]).toContain("—");
    spoken[0]!.onend?.();
    expect(ended).toBe(0);
    expect(spoken).toHaveLength(1);

    // Real inter-utterance pause (mdash) — next clip must not start early.
    vi.advanceTimersByTime(400);
    expect(spoken).toHaveLength(1);
    vi.advanceTimersByTime(300);
    expect(spoken).toHaveLength(2);
    expect(spoken[1]!.text).toBe("I'll be a bit late");

    spoken[1]!.onstart?.();
    vi.advanceTimersByTime(
      __speechTestHooks.FALLBACK_START_OFFSET_MS + 15000
    );
    spoken[1]!.onend?.();
    expect(highlights).toContain("I'll");
    expect(highlights).toContain("late!");
    expect(ended).toBe(1);
  });

  it("splits Japanese on 。 with a real pause so karaoke stays aligned", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text = "ありがとうございます。では、いくつか確認しますね。";
    const highlights: string[] = [];
    let ended = 0;
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
        onEnd: () => {
          ended += 1;
        },
      },
      1,
      { reading: "ありがとう ございます では いくつ か かくにん します ね" }
    );

    expect(spoken).toHaveLength(1);
    expect(spoken[0]!.text).toMatch(/ございます/);
    expect(spoken[0]!.text).not.toMatch(/確認|かくにん/);
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 50);
    expect(highlights.some((h) => h.includes("ありがとう") || h.includes("ございます"))).toBe(
      true
    );
    spoken[0]!.onend?.();
    expect(ended).toBe(0);
    expect(spoken).toHaveLength(1);

    // Real inter-utterance pause after 。 — next clip must not start early.
    vi.advanceTimersByTime(400);
    expect(spoken).toHaveLength(1);
    vi.advanceTimersByTime(300);
    expect(spoken).toHaveLength(2);
    expect(spoken[1]!.text).toMatch(/では|確認|かくにん/);

    spoken[1]!.onstart?.();
    vi.advanceTimersByTime(
      __speechTestHooks.FALLBACK_START_OFFSET_MS + 20000
    );
    spoken[1]!.onend?.();
    expect(highlights.some((h) => /では|確認|いくつ/.test(h))).toBe(true);
    expect(ended).toBe(1);
  });
});

describe("speechService Nanami Japanese voice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("assigns Microsoft Nanami for speakJapanese and ja-JP lang", async () => {
    const { spoken, setVoices } = installSpeechMock();
    setVoices([
      {
        name: "Microsoft Haruka Online",
        lang: "ja-JP",
        localService: false,
        default: false,
        voiceURI: "haruka",
      } as SpeechSynthesisVoice,
      {
        name: "Microsoft Nanami Online",
        lang: "ja-JP",
        localService: false,
        default: true,
        voiceURI: "nanami",
      } as SpeechSynthesisVoice,
      {
        name: "Microsoft Andrew Online",
        lang: "en-US",
        localService: false,
        default: true,
        voiceURI: "andrew",
      } as SpeechSynthesisVoice,
    ]);
    const { speechService } = await import("./speechService");

    speechService.speakJapanese("確認してください");
    expect(spoken).toHaveLength(1);
    expect((spoken[0]!.voice as SpeechSynthesisVoice).name).toMatch(/Nanami/i);
    expect(spoken[0]!.lang).toBe("ja-JP");
    expect(speechService.getPreferredVoiceName("ja")).toMatch(/Nanami/i);
  });

  it("does not assign Nanami for English speech", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    speechService.speakEnglish("Please confirm");
    expect(spoken).toHaveLength(1);
    expect((spoken[0]!.voice as SpeechSynthesisVoice).name).toMatch(/Andrew/i);
    expect((spoken[0]!.voice as SpeechSynthesisVoice).name).not.toMatch(
      /Nanami/i
    );
    expect(spoken[0]!.lang).toBe("en-US");
  });
});
