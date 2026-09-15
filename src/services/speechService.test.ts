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

  it("ignores stale fallback timers after stop", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world", {
      onBoundary: (h) => highlights.push(h),
    });
    spoken[0]!.onstart?.();
    speechService.stop();
    vi.advanceTimersByTime(
      __speechTestHooks.BOUNDARY_DETECT_MS +
        __speechTestHooks.FALLBACK_START_OFFSET_MS +
        2000
    );
    expect(highlights.length).toBe(0);
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

describe("speechService highlight mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("selects boundary mode when a boundary arrives during detection", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world", {
      onBoundary: (h) => highlights.push(h),
    });
    const utter = spoken[0]!;
    utter.onstart?.();
    utter.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    expect(highlights[0]).toEqual({ start: 0, end: 5 });

    vi.advanceTimersByTime(__speechTestHooks.BOUNDARY_DETECT_MS + 50);
    const before = highlights.length;
    vi.advanceTimersByTime(2000);
    expect(highlights.length).toBe(before);
  });

  it("selects fallback when no boundary arrives", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world", {
      onBoundary: (h) => highlights.push(h),
    });
    const utter = spoken[0]!;
    utter.onstart?.();
    expect(highlights.length).toBe(0);

    vi.advanceTimersByTime(
      __speechTestHooks.BOUNDARY_DETECT_MS +
        __speechTestHooks.FALLBACK_START_OFFSET_MS +
        10
    );
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights[0]).toEqual({ start: 0, end: 5 });
  });

  it("ignores late boundaries after fallback mode starts", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world today", {
      onBoundary: (h) => highlights.push(h),
    });
    const utter = spoken[0]!;
    utter.onstart?.();
    vi.advanceTimersByTime(
      __speechTestHooks.BOUNDARY_DETECT_MS +
        __speechTestHooks.FALLBACK_START_OFFSET_MS +
        10
    );
    expect(highlights.length).toBeGreaterThanOrEqual(1);

    utter.onboundary?.({ name: "word", charIndex: 12, charLength: 5 });
    expect(highlights.at(-1)?.start).toBe(0);
  });

  it("does not begin fallback before onstart", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello", {
      onBoundary: (h) => highlights.push(h),
    });
    expect(spoken.length).toBe(1);

    vi.advanceTimersByTime(__speechTestHooks.BOUNDARY_DETECT_MS + 50);
    expect(highlights.length).toBe(0);
  });

  it("highlights the last unit on end when browser skipped its boundary", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const highlights: Array<{ start: number; end: number }> = [];
    speechService.speakEnglish("Hello world", {
      onBoundary: (h) => highlights.push(h),
    });
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
    speechService.speakEnglish("Hello world today", {
      onBoundary: (h) => highlights.push(h),
    });
    const utter = spoken[0]!;
    utter.onstart?.();
    utter.onboundary?.({ name: "word", charIndex: 0, charLength: 5 });
    expect(highlights).toEqual([{ start: 0, end: 5 }]);

    utter.onend?.();
    // Two+ unlit units must not flash — clear instead of fake sync.
    expect(highlights).toEqual([{ start: 0, end: 5 }]);
    vi.advanceTimersByTime(500);
    expect(highlights).toEqual([{ start: 0, end: 5 }]);
  });

  it("uses spoken-kana fallback timing when a reading is provided", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const highlights: string[] = [];
    const text = "妊娠";
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      },
      1,
      { reading: "にんしん" }
    );
    const utter = spoken[0]!;
    expect(utter.text).toContain("にんしん");
    utter.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 10);
    expect(highlights[0]).toBe("妊娠");
  });

  it("uses fallback karaoke when Japanese reading equals the surface (ている patterns)", async () => {
    const { spoken } = installSpeechMock();
    const { speechService, __speechTestHooks } = await import("./speechService");

    const text = "〜ことになっている";
    const highlights: string[] = [];
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
      },
      1,
      { reading: "〜ことになっている" }
    );
    const utter = spoken[0]!;
    // Wave-slot pause is inserted even when reading equals the surface.
    expect(utter.text).toBe("〜、ことになっている");
    utter.onstart?.();
    vi.advanceTimersByTime(__speechTestHooks.FALLBACK_START_OFFSET_MS + 10);
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights[0]).not.toContain("〜");
    expect(highlights[0]).toContain("こと");
    // Advance through remaining fallback steps
    vi.advanceTimersByTime(8000);
    expect(highlights.some((h) => h.includes("いる"))).toBe(true);
  });

  it("fills skipped みる when browser jumps から→と in 〜からみると", async () => {
    const { spoken } = installSpeechMock();
    const { speechService } = await import("./speechService");

    const text = "〜からみると";
    const highlights: string[] = [];
    // No reading → browser boundary mode (audioText === text)
    speechService.speakJapanese(text, {
      onBoundary: (h) => highlights.push(text.slice(h.start, h.end)),
    });
    const utter = spoken[0]!;
    utter.onstart?.();
    // Boundary reports index inside から (may gap-fill 〜 first)
    utter.onboundary?.({ name: "word", charIndex: 1, charLength: 2 });
    vi.advanceTimersByTime(500);
    expect(highlights).toContain("から");
    // Browser skips みる and jumps to と
    utter.onboundary?.({ name: "word", charIndex: 5, charLength: 1 });
    vi.advanceTimersByTime(500);
    expect(highlights).toContain("みる");
    expect(highlights.at(-1)).toBe("と");
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
});
