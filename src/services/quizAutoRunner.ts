import type { VocabularyItem } from "../types/vocabulary";
import { quizTiming as T } from "../config/quizTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
} from "./speechService";

export type QuizPhase = "pre" | "asking" | "revealed" | "after" | "finished";

export type QuizAutoUi = {
  setQuizIndex: (index: number) => void;
  setChoices: (choices: string[]) => void;
  setCorrectChoiceIndex: (index: number) => void;
  setSelectedChoiceIndex: (index: number | null) => void;
  setPhase: (phase: QuizPhase) => void;
  setShowReading: (show: boolean) => void;
  setShowFurigana: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechLang: (lang: "ja" | "en" | null) => void;
  setSpeechStatus: (status: "idle" | "speaking") => void;
  setJaHighlight: (h: SpeechHighlight | null) => void;
  setEnHighlight: (h: SpeechHighlight | null) => void;
};

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export { shuffle };

/** Build 3 English choices: 1 correct + 2 distractors from other items. */
export function buildQuizChoices(
  items: VocabularyItem[],
  questionIndex: number
): { choices: string[]; correctChoiceIndex: number } {
  const correct = items[questionIndex]!.meaning;
  const distractors = shuffle(
    items
      .map((item, i) => (i === questionIndex ? null : item.meaning))
      .filter((m): m is string => m !== null)
  ).slice(0, 2);

  while (distractors.length < 2) {
    distractors.push("—");
  }

  const choices = shuffle([correct, distractors[0]!, distractors[1]!]);
  return {
    choices,
    correctChoiceIndex: choices.indexOf(correct),
  };
}

/**
 * Single-flight Quiz Auto sequencer for the multiple-choice meaning quiz.
 * Turning off / abort stops timers and audio; only one loop can run.
 */
export class QuizAutoRunner {
  private session = 0;
  private softStop = false;
  private speaking = false;
  private pauseTimers = new Set<number>();
  private pauseWake: (() => void) | null = null;
  private answerWaitResolve: (() => void) | null = null;

  isActive(): boolean {
    return this.session > 0 && !this.softStop;
  }

  /** Stop immediately: cancel audio, timers, and answer wait. */
  abort(): void {
    this.session += 1;
    this.softStop = true;
    this.speaking = false;
    this.clearPauses();
    this.wakeAnswerWait();
    speechService.stop();
  }

  /** User picked a choice — end the answer wait early. */
  notifyAnswerSelected(): void {
    this.wakeAnswerWait();
  }

  async start(
    items: VocabularyItem[],
    ui: QuizAutoUi,
    onState: (state: "on" | "off") => void
  ): Promise<boolean> {
    this.abort();
    this.softStop = false;
    const sid = ++this.session;
    onState("on");

    ui.setPhase("asking");
    let completedAll = true;

    try {
      for (let i = 0; i < items.length; i++) {
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        const item = items[i]!;
        const { choices, correctChoiceIndex } = buildQuizChoices(items, i);

        ui.setQuizIndex(i);
        ui.setChoices(choices);
        ui.setCorrectChoiceIndex(correctChoiceIndex);
        ui.setSelectedChoiceIndex(null);
        ui.setPhase("asking");
        ui.setShowReading(false);
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        this.clearSpeechUi(ui);

        // Show JP word, play at normal speed (hiragana + answer hidden)
        await this.speakJapanese(
          ui,
          item.word,
          SPEECH_RATE_NORMAL,
          sid,
          item.reading
        );
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        // Wait answerTime, or until a manual choice wakes this wait
        await this.waitForAnswer(T.answerTime, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        // Reveal correct choice + reading
        ui.setPhase("revealed");
        ui.setShowReading(true);
        ui.setShowFurigana(true);

        // Play correct English meaning
        await this.speakEnglish(ui, item.meaning, SPEECH_RATE_NORMAL, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.pause(T.revealPause, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        // Normal JA with hiragana visible (no slow pass, no furigana-off repeat)
        ui.setShowFurigana(true);
        ui.setShowReading(true);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        await this.speakJapanese(
          ui,
          item.word,
          SPEECH_RATE_NORMAL,
          sid,
          item.reading
        );
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        if (i < items.length - 1) {
          await this.pause(T.betweenQuestionsPause, sid);
        }
      }

      if (sid === this.session && !this.softStop) {
        ui.setPhase("finished");
      } else {
        completedAll = false;
      }
    } finally {
      if (sid === this.session) {
        this.clearPauses();
        this.speaking = false;
        this.clearSpeechUi(ui);
        onState("off");
      }
    }

    return sid === this.session && completedAll && !this.softStop;
  }

  private shouldContinue(sid: number): boolean {
    return sid === this.session && !this.softStop;
  }

  private clearSpeechUi(ui: QuizAutoUi): void {
    ui.setSpeechStatus("idle");
    ui.setSpeechLang(null);
    ui.setJaHighlight(null);
    ui.setEnHighlight(null);
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

  private wakeAnswerWait(): void {
    const resolve = this.answerWaitResolve;
    this.answerWaitResolve = null;
    // Also clear any pending answer-timeout timer via clearPauses on abort;
    // for early select, just resolve — timer will no-op via settled flag.
    resolve?.();
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

  private waitForAnswer(ms: number, sid: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid)) {
        resolve();
        return;
      }

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.answerWaitResolve = null;
        resolve();
      };

      this.answerWaitResolve = finish;
      const t = window.setTimeout(() => {
        this.pauseTimers.delete(t);
        finish();
      }, ms);
      this.pauseTimers.add(t);
    });
  }

  private speakJapanese(
    ui: QuizAutoUi,
    text: string,
    rate: number,
    sid: number,
    reading?: string | null
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid) && !this.speaking) {
        resolve();
        return;
      }

      this.speaking = true;
      ui.setSpeechLang("ja");
      ui.setJaHighlight(null);
      ui.setSpeechStatus("speaking");

      speechService.speakJapanese(
        text,
        {
          onStart: () => {
            if (sid !== this.session) return;
            ui.setSpeechStatus("speaking");
          },
          onBoundary: (h) => {
            if (sid !== this.session) return;
            ui.setJaHighlight(h);
          },
          onEnd: () => {
            if (sid !== this.session) return;
            this.speaking = false;
            this.clearSpeechUi(ui);
            resolve();
          },
          onError: () => {
            if (sid !== this.session) return;
            this.speaking = false;
            this.clearSpeechUi(ui);
            resolve();
          },
        },
        rate,
        { reading }
      );
    });
  }

  private speakEnglish(
    ui: QuizAutoUi,
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
      ui.setEnHighlight(null);
      ui.setSpeechStatus("speaking");

      speechService.speakEnglish(
        text,
        {
          onStart: () => {
            if (sid !== this.session) return;
            ui.setSpeechStatus("speaking");
          },
          onBoundary: (h) => {
            if (sid !== this.session) return;
            ui.setEnHighlight(h);
          },
          onEnd: () => {
            if (sid !== this.session) return;
            this.speaking = false;
            this.clearSpeechUi(ui);
            resolve();
          },
          onError: () => {
            if (sid !== this.session) return;
            this.speaking = false;
            this.clearSpeechUi(ui);
            resolve();
          },
        },
        rate
      );
    });
  }
}

export const quizAutoRunner = new QuizAutoRunner();
