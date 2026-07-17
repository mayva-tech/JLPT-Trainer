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
    vi.advanceTimersByTime(__speechTestHooks.BOUNDARY_DETECT_MS + 500);
    expect(highlights.length).toBe(0);
  });
});
