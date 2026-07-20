import { quizTiming as T } from "../config/quizTiming";
import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
} from "./speechService";

import type { VocabularyQuizQuestionType } from "../types/vocabularyQuiz";

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
  phrase?: string;
  phraseReading?: string;
  phraseMeaning?: string;
  sentence?: string;
  sentenceReading?: string;
  sentenceMeaning?: string;
  audioWord?: string;
  jlpt?: "N1" | "N2";
  questionType?: VocabularyQuizQuestionType;
  promptText?: string;
  promptEnglish?: string;
  contextSource?: string;
  contextReading?: string;
  choiceKind?: "english" | "japanese";
  choices?: string[];
  correctChoiceIndex?: number;
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

/** Build choices for a quiz item. Vocabulary quizzes embed choices; grammar uses legacy pool. */
export function buildQuizChoices(
  items: QuizWord[],
  questionIndex: number
): { choices: string[]; correctChoiceIndex: number } {
  const item = items[questionIndex]!;
  if (item.choices && item.correctChoiceIndex !== undefined) {
    return {
      choices: item.choices,
      correctChoiceIndex: item.correctChoiceIndex,
    };
  }

  const correct = item.meaning;
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

    const exampleText =
      item.questionType === "phrase-context" && item.contextSource
        ? item.contextSource
        : item.questionType === "sentence-context" && item.contextSource
          ? item.contextSource
          : item.sentence;

    const exampleReading =
      item.questionType === "phrase-context" && item.contextReading
        ? item.contextReading
        : item.questionType === "sentence-context" && item.contextReading
          ? item.contextReading
          : item.sentenceReading;

    const exampleMeaning =
      item.questionType === "phrase-context" && item.phraseMeaning
        ? item.phraseMeaning
        : item.sentenceMeaning;

    if (!exampleText) return;

    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("example");
    ui.setJaHighlight(null);
    ui.setEnHighlight(null);

    await this.speakJapanese(
      ui,
      exampleText,
      SPEECH_RATE_NORMAL,
      sid,
      exampleReading
    );
    if (!this.shouldContinue(sid)) return;

    if (exampleMeaning) {
      await this.pause(T.revealPause, sid);
      if (!this.shouldContinue(sid)) return;

      await this.speakEnglish(
        ui,
        exampleMeaning,
        SPEECH_RATE_NORMAL,
        sid
      );
      if (!this.shouldContinue(sid)) return;
    }

    await this.pause(T.revealPause, sid);
    if (!this.shouldContinue(sid)) return;

    await this.speakJapanese(
      ui,
      exampleText,
      SPEECH_RATE_NORMAL,
      sid,
      exampleReading
    );
    if (!this.shouldContinue(sid)) return;

    ui.setPhase("revealed");
  }

  private playWordAudio(audioPath: string, sid: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.shouldContinue(sid)) {
        resolve(false);
        return;
      }
      const audio = new Audio(audioPath);
      const finish = (ok: boolean) => {
        audio.onended = null;
        audio.onerror = null;
        resolve(ok);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      void audio.play().catch(() => finish(false));
    });
  }

  private promptForItem(item: QuizWord): string {
    return item.promptText ?? item.word;
  }

  private shouldHideReading(item: QuizWord): boolean {
    return (
      item.questionType === "audio-to-english" ||
      item.questionType === "english-to-japanese" ||
      item.questionType === "phrase-context" ||
      item.questionType === "sentence-context"
    );
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
        ui.setShowReading(!this.shouldHideReading(item));
        ui.setShowFurigana(false);
        ui.setSpeechRate(SPEECH_RATE_NORMAL);
        this.clearSpeechUi(ui);

        if (item.questionType === "english-to-japanese") {
          // English prompt only — no Japanese audio before answer.
        } else if (item.questionType === "audio-to-english" && item.audioWord) {
          const played = await this.playWordAudio(item.audioWord, sid);
          if (!played) {
            await this.speakJapanese(
              ui,
              item.word,
              SPEECH_RATE_NORMAL,
              sid,
              item.reading
            );
          }
        } else if (
          item.questionType === "phrase-context" ||
          item.questionType === "sentence-context"
        ) {
          // Context shown on card — no pre-answer audio.
        } else {
          await this.speakJapanese(
            ui,
            this.promptForItem(item),
            SPEECH_RATE_NORMAL,
            sid,
            item.reading
          );
        }
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
