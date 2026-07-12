import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
  type SpeakCallbacks,
} from "./speechService";

export type BilingualOrder = "en-ja" | "ja-en";

export type BilingualPlaybackUi = {
  setActiveLang: (lang: "en" | "ja" | null) => void;
  setSpeechStatus: (status: "idle" | "speaking" | "paused") => void;
  setEnHighlight: (h: SpeechHighlight | null) => void;
  setJaHighlight: (h: SpeechHighlight | null) => void;
};

/**
 * Plays two lines in a fixed order with highlight callbacks.
 * Pause/resume uses the browser speechSynthesis API via speechService.
 */
export class BilingualPlayback {
  private session = 0;
  private paused = false;

  abort() {
    this.session += 1;
    this.paused = false;
    speechService.stop();
  }

  pause() {
    this.paused = true;
    speechService.pause();
  }

  resume() {
    this.paused = false;
    speechService.resume();
  }

  isPaused() {
    return this.paused;
  }

  async play(
    english: string,
    japanese: string,
    order: BilingualOrder,
    ui: BilingualPlaybackUi,
    rate = SPEECH_RATE_NORMAL,
    onDone?: () => void
  ): Promise<void> {
    this.abort();
    this.paused = false;
    const sid = ++this.session;

    ui.setEnHighlight(null);
    ui.setJaHighlight(null);
    ui.setSpeechStatus("speaking");

    const sequence =
      order === "en-ja"
        ? ([
            { lang: "en" as const, text: english },
            { lang: "ja" as const, text: japanese },
          ] as const)
        : ([
            { lang: "ja" as const, text: japanese },
            { lang: "en" as const, text: english },
          ] as const);

    try {
      for (const step of sequence) {
        if (sid !== this.session) return;
        if (!step.text.trim()) continue;

        ui.setActiveLang(step.lang);
        await this.speakOne(sid, step.lang, step.text, ui, rate);
        if (sid !== this.session) return;
      }
    } finally {
      if (sid === this.session) {
        ui.setActiveLang(null);
        ui.setEnHighlight(null);
        ui.setJaHighlight(null);
        ui.setSpeechStatus("idle");
        onDone?.();
      }
    }
  }

  private speakOne(
    sid: number,
    lang: "en" | "ja",
    text: string,
    ui: BilingualPlaybackUi,
    rate: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (sid !== this.session) {
        resolve();
        return;
      }

      const callbacks: SpeakCallbacks = {
        onBoundary: (h) => {
          if (sid !== this.session) return;
          if (lang === "en") ui.setEnHighlight(h);
          else ui.setJaHighlight(h);
        },
        onEnd: () => {
          if (lang === "en") ui.setEnHighlight(null);
          else ui.setJaHighlight(null);
          resolve();
        },
      };

      if (lang === "en") {
        const firstWord = text.match(/^\S+/);
        ui.setEnHighlight({
          start: 0,
          end: firstWord ? firstWord[0].length : Math.min(1, text.length),
        });
        speechService.speakEnglish(text, callbacks, rate);
      } else {
        ui.setJaHighlight({ start: 0, end: Math.min(1, text.length) });
        speechService.speakJapanese(text, callbacks, rate);
      }
    });
  }
}

export const bilingualPlayback = new BilingualPlayback();
