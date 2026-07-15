import type { VocabularyItem } from "../types/vocabulary";
import type { StepName } from "../types/player";
import { autoModeTiming as T, shadowingPauseFor } from "../config/autoModeTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  SPEECH_RATE_SHADOWING,
  type SpeechHighlight,
} from "./speechService";

export type AutoModeUi = {
  setItemIndex: (index: number) => void;
  setStep: (step: StepName) => void;
  setShowFurigana: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechLang: (lang: "ja" | "en" | null) => void;
  setSpeechStatus: (status: "idle" | "speaking") => void;
  setHighlight: (h: SpeechHighlight | null) => void;
};

type Section = "word" | "phrase" | "sentence";

/**
 * Single-flight Auto Mode sequencer.
 * Soft-stop waits for the current utterance, then cancels remaining steps/pauses.
 */
export class AutoModeRunner {
  private session = 0;
  private softStop = false;
  private speaking = false;
  private pauseTimers = new Set<number>();
  private pauseWake: (() => void) | null = null;

  isActive(): boolean {
    return this.session > 0 && !this.softStop;
  }

  /** Soft-stop: finish current audio, skip remaining sequence. */
  requestStopAfterCurrent(): void {
    this.softStop = true;
    if (!this.speaking) {
      this.clearPauses();
    }
  }

  /** Hard cancel (unmount / new start). */
  abort(): void {
    this.session += 1;
    this.softStop = true;
    this.speaking = false;
    this.clearPauses();
    speechService.stop();
  }

  /**
   * @returns true when every item finished without soft-stop/abort
   * (used by optional video-flow sequencing; manual Auto Mode ignores this).
   */
  async start(
    items: VocabularyItem[],
    startItemIndex: number,
    ui: AutoModeUi,
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
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }
        const item = items[i]!;
        ui.setItemIndex(i);

        await this.runSection(sid, ui, item, "word");
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.runSection(sid, ui, item, "phrase");
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.runSection(sid, ui, item, "sentence");
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.runShadowingAndReview(sid, ui, item);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

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
    for (const t of this.pauseTimers) {
      window.clearTimeout(t);
    }
    this.pauseTimers.clear();
    const wake = this.pauseWake;
    this.pauseWake = null;
    wake?.();
  }

  private pause(ms: number, sid: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid)) {
        resolve();
        return;
      }

      const finish = () => {
        this.pauseWake = null;
        resolve();
      };

      this.pauseWake = finish;
      const t = window.setTimeout(() => {
        this.pauseTimers.delete(t);
        if (this.pauseWake === finish) this.pauseWake = null;
        resolve();
      }, ms);
      this.pauseTimers.add(t);
    });
  }

  private clearSpeechUi(ui: AutoModeUi): void {
    ui.setSpeechStatus("idle");
    ui.setSpeechLang(null);
    ui.setHighlight(null);
  }

  private speakJapanese(
    ui: AutoModeUi,
    text: string,
    rate: number,
    sid: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid) && !this.speaking) {
        resolve();
        return;
      }

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
    ui: AutoModeUi,
    text: string,
    rate: number,
    sid: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid) && !this.speaking) {
        resolve();
        return;
      }

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

  private sectionTexts(
    item: VocabularyItem,
    section: Section
  ): { ja: string; en: string; step: StepName } {
    switch (section) {
      case "word":
        return { ja: item.word, en: item.meaning, step: "word" };
      case "phrase":
        return { ja: item.phrase, en: item.phraseMeaning, step: "phrase" };
      case "sentence":
        return {
          ja: item.sentence,
          en: item.sentenceMeaning,
          step: "sentence",
        };
    }
  }

  /** JP normal あ off → pause → EN → pause → JP slow あ on
   *  (no final normal JA repeat — next section follows). */
  private async runSection(
    sid: number,
    ui: AutoModeUi,
    item: VocabularyItem,
    section: Section
  ): Promise<void> {
    const { ja, en, step } = this.sectionTexts(item, section);
    ui.setStep(step);

    // 1. Japanese, normal, hiragana hidden
    ui.setShowFurigana(false);
    ui.setSpeechRate(SPEECH_RATE_NORMAL);
    await this.speakJapanese(ui, ja, SPEECH_RATE_NORMAL, sid);
    if (!this.shouldContinue(sid)) return;

    // 2. Pause
    await this.pause(T.shortPause, sid);
    if (!this.shouldContinue(sid)) return;

    // 3. English, normal
    ui.setShowFurigana(false);
    ui.setSpeechRate(SPEECH_RATE_NORMAL);
    await this.speakEnglish(ui, en, SPEECH_RATE_NORMAL, sid);
    if (!this.shouldContinue(sid)) return;

    // 4. Pause
    await this.pause(T.normalPause, sid);
    if (!this.shouldContinue(sid)) return;

    // 5. Japanese, slow, hiragana visible
    ui.setShowFurigana(true);
    ui.setSpeechRate(SPEECH_RATE_SLOW);
    await this.speakJapanese(ui, ja, SPEECH_RATE_SLOW, sid);
    if (!this.shouldContinue(sid)) return;

    await this.pause(T.normalPause, sid);
  }

  private async runShadowingAndReview(
    sid: number,
    ui: AutoModeUi,
    item: VocabularyItem
  ): Promise<void> {
    // Play Japanese sentence again (shadowing rate, hiragana hidden) for listen
    ui.setStep("sentence");
    ui.setShowFurigana(false);
    ui.setSpeechRate(SPEECH_RATE_SHADOWING);
    await this.speakJapanese(ui, item.sentence, SPEECH_RATE_SHADOWING, sid);
    if (!this.shouldContinue(sid)) return;

    // Longer pause for shadowing practice — scales with sentence length
    ui.setStep("shadowing");
    await this.pause(shadowingPauseFor(item.sentence), sid);
    if (!this.shouldContinue(sid)) return;

    // Review: Japanese word once (normal, hiragana hidden)
    ui.setStep("review");
    ui.setShowFurigana(false);
    ui.setSpeechRate(SPEECH_RATE_NORMAL);
    await this.speakJapanese(ui, item.word, SPEECH_RATE_NORMAL, sid);
    if (!this.shouldContinue(sid)) return;

    await this.pause(T.normalPause, sid);
  }
}

export const autoModeRunner = new AutoModeRunner();
