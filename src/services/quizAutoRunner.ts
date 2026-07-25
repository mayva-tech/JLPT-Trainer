import { quizTiming as T } from "../config/quizTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
} from "./speechService";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import {
  getQuizExample,
  shouldHideReadingOnAsk,
} from "../utils/quizPresentation";

export type QuizPhase =
  | "pre"
  | "asking"
  | "revealed"
  | "example"
  /** Manual ←/→ browse: answer + example together (not used during reveal). */
  | "review"
  | "after"
  | "finished";

/**
 * @deprecated Use VocabularyQuizQuestion. Kept as an alias during migration.
 */
export type QuizWord = VocabularyQuizQuestion;

export type QuizAutoUi = {
  setQuizIndex: (index: number) => void;
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

  abort(): void {
    this.session += 1;
    this.softStop = true;
    this.speaking = false;
    this.clearPauses();
    this.answerWaitResolve = null;
    speechService.stop();
  }

  notifyAnswerSelected(): void {
    this.wakeAnswerWait();
  }

  /**
   * Manual reveal sequence (EN meaning → optional example JP/EN/JP).
   * Bumps session so it can interrupt a prior manual reveal or idle state.
   */
  async playManualReveal(
    question: VocabularyQuizQuestion,
    ui: QuizAutoUi
  ): Promise<void> {
    this.abort();
    this.softStop = false;
    const sid = ++this.session;
    try {
      await this.playRevealSequence(ui, question, sid);
    } finally {
      if (sid === this.session) {
        this.speaking = false;
        this.clearSpeechUi(ui);
        this.softStop = true;
      }
    }
  }

  private async playRevealSequence(
    ui: QuizAutoUi,
    question: VocabularyQuizQuestion,
    sid: number
  ): Promise<void> {
    await this.speakEnglish(
      ui,
      question.item.meaning,
      SPEECH_RATE_NORMAL,
      sid
    );
    if (!this.shouldContinue(sid)) return;

    const example = getQuizExample(question);
    if (!example) return;

    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("example");
    ui.setSpeechRate(SPEECH_RATE_NORMAL);
    ui.setJaHighlight(null);
    ui.setEnHighlight(null);

    await this.speakJapanese(
      ui,
      example.text,
      SPEECH_RATE_NORMAL,
      sid,
      example.reading
    );
    if (!this.shouldContinue(sid)) return;

    if (example.meaning) {
      await this.pause(T.revealPause, sid);
      if (!this.shouldContinue(sid)) return;

      await this.speakEnglish(ui, example.meaning, SPEECH_RATE_NORMAL, sid);
      if (!this.shouldContinue(sid)) return;
    }

    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    await this.speakJapanese(
      ui,
      example.text,
      SPEECH_RATE_NORMAL,
      sid,
      example.reading
    );
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("revealed");
  }

  async start(
    items: VocabularyQuizQuestion[],
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

        const question = items[i]!;

        ui.setQuizIndex(i);
        ui.setSelectedChoiceIndex(null);
        ui.setPhase("asking");
        ui.setShowReading(!shouldHideReadingOnAsk(question));
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        this.clearSpeechUi(ui);

        await this.speakJapanese(
          ui,
          question.promptText,
          SPEECH_RATE_NORMAL,
          sid,
          question.item.reading
        );
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.waitForAnswer(T.answerTime, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        ui.setPhase("revealed");
        ui.setShowReading(true);
        ui.setShowFurigana(true);

        await this.playRevealSequence(ui, question, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        await this.pause(T.revealPause, sid);
        if (!this.shouldContinue(sid)) {
          completedAll = false;
          break;
        }

        ui.setShowFurigana(true);
        ui.setShowReading(true);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        await this.speakJapanese(
          ui,
          question.item.word,
          SPEECH_RATE_NORMAL,
          sid,
          question.item.reading
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
