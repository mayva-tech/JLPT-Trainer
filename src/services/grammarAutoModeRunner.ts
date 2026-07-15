/**
 * Grammar Auto Mode sequencer.
 *
 * Six steps per grammar item (mirrors vocabulary's 6-step flow):
 *  ① category chip     — first item of the lesson only; skipped after Review
 *  ② pattern + meaning — JP pattern → pause → EN meaning → pause → JP slow
 *  ③ formation rule    — silent 3s display (no voice-over)
 *  ④ example sentence  — JP sentence → pause → EN → pause → JP slow
 *  ⑤ shadowing         — listen phase (JP at shadowing rate) → repeat pause
 *  ⑥ review            — JP pattern once → pause → next item's pattern
 */

import type { GrammarItem } from "../types/grammar";
import { autoModeTiming as T, shadowingPauseFor } from "../config/autoModeTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  SPEECH_RATE_SHADOWING,
  type SpeechHighlight,
} from "./speechService";

export type GrammarStep =
  | "category"
  | "pattern"
  | "formation"
  | "sentence"
  | "shadowing"
  | "review";

export const GRAMMAR_STEPS: GrammarStep[] = [
  "category",
  "pattern",
  "formation",
  "sentence",
  "shadowing",
  "review",
];

export type GrammarAutoModeUi = {
  setItemIndex: (index: number) => void;
  setStep: (step: GrammarStep) => void;
  setShowFurigana: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechLang: (lang: "ja" | "en" | null) => void;
  setSpeechStatus: (status: "idle" | "speaking") => void;
  setHighlight: (h: SpeechHighlight | null) => void;
};

export class GrammarAutoModeRunner {
  private session = 0;
  private softStop = false;
  private speaking = false;
  private pauseTimers = new Set<number>();
  private pauseWake: (() => void) | null = null;

  isActive(): boolean {
    return this.session > 0 && !this.softStop;
  }

  requestStopAfterCurrent(): void {
    this.softStop = true;
    if (!this.speaking) this.clearPauses();
  }

  abort(): void {
    this.session += 1;
    this.softStop = true;
    this.speaking = false;
    this.clearPauses();
    speechService.stop();
  }

  async start(
    items: GrammarItem[],
    startItemIndex: number,
    ui: GrammarAutoModeUi,
    onState: (state: "on" | "stopping" | "off") => void
  ): Promise<boolean> {
    this.abort();
    this.softStop = false;
    const sid = ++this.session;
    onState("on");

    const from = Math.max(0, Math.min(startItemIndex, items.length - 1));
    let completedAll = true;

    try {
      for (let i = from; i < items.length; i++) {
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        const item = items[i]!;
        ui.setItemIndex(i);

        // ① category — only for the first item; after Review jump to next pattern
        if (i === 0) {
          ui.setStep("category");
          await this.pause(T.normalPause, sid);
          if (!this.shouldContinue(sid)) { completedAll = false; break; }
        }

        // ② pattern + meaning
        ui.setStep("pattern");
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        await this.speakJapanese(ui, item.pattern, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.shortPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.speakEnglish(ui, item.meaning, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.normalPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        // Pattern again — slow, furigana on
        ui.setShowFurigana(true);
        ui.setSpeechRate(SPEECH_RATE_SLOW);
        await this.speakJapanese(ui, item.pattern, SPEECH_RATE_SLOW, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.normalPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }

        // ③ formation rule — silent 3s display
        ui.setStep("formation");
        ui.setShowFurigana(false);
        await this.pause(T.formationPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }

        // ④ example sentence
        ui.setStep("sentence");
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        await this.speakJapanese(ui, item.sentence, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.shortPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.speakEnglish(ui, item.sentenceMeaning, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.normalPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        ui.setShowFurigana(true);
        ui.setSpeechRate(SPEECH_RATE_SLOW);
        await this.speakJapanese(ui, item.sentence, SPEECH_RATE_SLOW, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.normalPause, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }

        // ⑤ shadowing
        ui.setStep("sentence");
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_SHADOWING);
        await this.speakJapanese(ui, item.sentence, SPEECH_RATE_SHADOWING, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        ui.setStep("shadowing");
        await this.pause(shadowingPauseFor(item.sentence), sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }

        // ⑥ review
        ui.setStep("review");
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        await this.speakJapanese(ui, item.pattern, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) { completedAll = false; break; }
        await this.pause(T.normalPause, sid);

        if (i < items.length - 1) {
          await this.pause(T.betweenItemsPause, sid);
        }
      }
    } finally {
      if (sid === this.session) {
        this.clearPauses();
        this.speaking = false;
        ui.setSpeechStatus("idle");
        ui.setSpeechLang(null);
        ui.setHighlight(null);
        onState("off");
      }
    }

    return sid === this.session && completedAll && !this.softStop;
  }

  private shouldContinue(sid: number): boolean {
    return sid === this.session && !this.softStop;
  }

  private clearPauses(): void {
    for (const t of this.pauseTimers) window.clearTimeout(t);
    this.pauseTimers.clear();
    const wake = this.pauseWake;
    this.pauseWake = null;
    wake?.();
  }

  private pause(ms: number, sid: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid)) { resolve(); return; }
      const finish = () => { this.pauseWake = null; resolve(); };
      this.pauseWake = finish;
      const t = window.setTimeout(() => {
        this.pauseTimers.delete(t);
        if (this.pauseWake === finish) this.pauseWake = null;
        resolve();
      }, ms);
      this.pauseTimers.add(t);
    });
  }

  private clearSpeechUi(ui: GrammarAutoModeUi): void {
    ui.setSpeechStatus("idle");
    ui.setSpeechLang(null);
    ui.setHighlight(null);
  }

  private speakJapanese(
    ui: GrammarAutoModeUi,
    text: string,
    rate: number,
    sid: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid) && !this.speaking) { resolve(); return; }
      this.speaking = true;
      ui.setSpeechLang("ja");
      ui.setSpeechStatus("speaking");
      ui.setHighlight({ start: 0, end: Math.min(1, text.length) });
      speechService.speakJapanese(
        text,
        {
          onBoundary: (h) => ui.setHighlight(h),
          onEnd: () => {
            this.speaking = false;
            this.clearSpeechUi(ui);
            if (this.softStop) this.clearPauses();
            resolve();
          },
        },
        rate
      );
    });
  }

  private speakEnglish(
    ui: GrammarAutoModeUi,
    text: string,
    rate: number,
    sid: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid) && !this.speaking) { resolve(); return; }
      this.speaking = true;
      ui.setSpeechLang("en");
      ui.setSpeechStatus("speaking");
      const firstWord = text.match(/^\S+/);
      ui.setHighlight({
        start: 0,
        end: firstWord ? firstWord[0].length : Math.min(1, text.length),
      });
      speechService.speakEnglish(
        text,
        {
          onBoundary: (h) => ui.setHighlight(h),
          onEnd: () => {
            this.speaking = false;
            this.clearSpeechUi(ui);
            if (this.softStop) this.clearPauses();
            resolve();
          },
        },
        rate
      );
    });
  }
}

export const grammarAutoModeRunner = new GrammarAutoModeRunner();
