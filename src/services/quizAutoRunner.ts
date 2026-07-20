import { quizTiming as T } from "../config/quizTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
} from "./speechService";

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
 * Minimal shape the quiz feature needs from a source item. `VocabularyItem`
 * and `GrammarItem` are both structurally assignable to this — vocab quizzes
 * pass `{ id, word, reading, meaning, ... }` through as-is, grammar quizzes
 * map `{ id, pattern, patternReading, meaning }` onto these three fields.
 * This lets one runner + one card serve both quiz kinds with zero duplication.
 *
 * `sentence` / `sentenceReading` / `sentenceMeaning` are optional — when
 * present, the quiz card shows a short usage example after the answer is
 * revealed. Both `VocabularyItem` and `GrammarItem` already carry fields
 * with these exact names, so vocab quizzes get this for free with no
 * remapping; grammar quizzes populate them explicitly from `GrammarItem`.
 */
export type QuizWord = {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  sentence?: string;
  sentenceReading?: string;
  sentenceMeaning?: string;
};

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

/** Build 2 English choices: 1 correct + 1 distractor from another item. */
export function buildQuizChoices(
  items: QuizWord[],
  questionIndex: number
): { choices: string[]; correctChoiceIndex: number } {
  const correct = items[questionIndex]!.meaning;
  const distractors = shuffle(
    items
      .map((item, i) => (i === questionIndex ? null : item.meaning))
      .filter((m): m is string => m !== null)
  ).slice(0, 1);

  while (distractors.length < 1) {
    distractors.push("—");
  }

  const choices = shuffle([correct, distractors[0]!]);
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

  /**
   * Manual (non-auto) answer reveal: runs the same sequence as auto reveal
   * (correct meaning → example JP → example EN → example JP again). Starts
   * a fresh session so it cleanly cancels any previous in-flight sequence
   * (mirrors `start()`'s own top-of-function session bump). Safe to call
   * even when no auto-quiz session is active.
   */
  async playManualReveal(item: QuizWord, ui: QuizAutoUi): Promise<void> {
    this.abort();
    this.softStop = false;
    const sid = ++this.session;
    try {
      await this.playRevealSequence(ui, item, sid);
    } finally {
      if (sid === this.session) {
        this.speaking = false;
        this.clearSpeechUi(ui);
        // Mark inactive so manual ↑JP/↓EN buttons work after the sequence.
        this.softStop = true;
      }
    }
  }

  /**
   * Speaks the correct English meaning, then — if `item.sentence` is
   * present — pauses, switches to the "example" phase (hiding the answer
   * choices), speaks the example sentence (using `sentenceReading` for
   * correct pronunciation), pauses, speaks `sentenceMeaning` if present,
   * then speaks the Japanese example again with karaoke, and returns the
   * phase to "revealed". The auto loop then re-reads the grammar pattern
   * and advances. Shared by auto and manual reveal. Caller owns `sid` and
   * phase transitions before/after this call.
   */
  private async playRevealSequence(
    ui: QuizAutoUi,
    item: QuizWord,
    sid: number
  ): Promise<void> {
    await this.speakEnglish(ui, item.meaning, SPEECH_RATE_NORMAL, sid);
    if (!this.shouldContinue(sid)) return;

    if (!item.sentence) return;

    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("example");
    ui.setJaHighlight(null);
    ui.setEnHighlight(null);

    await this.speakJapanese(
      ui,
      item.sentence,
      SPEECH_RATE_NORMAL,
      sid,
      item.sentenceReading
    );
    if (!this.shouldContinue(sid)) return;

    if (item.sentenceMeaning) {
      await this.pause(T.revealPause, sid);
      if (!this.shouldContinue(sid)) return;

      await this.speakEnglish(
        ui,
        item.sentenceMeaning,
        SPEECH_RATE_NORMAL,
        sid
      );
      if (!this.shouldContinue(sid)) return;
    }

    // Second pass: Japanese example again with karaoke highlight.
    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    await this.speakJapanese(
      ui,
      item.sentence,
      SPEECH_RATE_NORMAL,
      sid,
      item.sentenceReading
    );
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("revealed");
  }

  async start(
    items: QuizWord[],
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

        // Speak correct English meaning, then (if present) example JP →
        // example EN → example JP again — see playRevealSequence. After
        // that, re-read the pattern below and advance.
        await this.playRevealSequence(ui, item, sid);
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
