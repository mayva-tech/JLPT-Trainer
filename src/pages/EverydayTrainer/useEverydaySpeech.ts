import { useCallback, useEffect, useRef } from "react";
import { autoModeTiming } from "../../config/autoModeTiming";
import { useTrainerSpeech, type TrainerSpeechLang } from "../../hooks/useTrainerSpeech";
import { plainJapanese, speechEnglish, speechReading } from "./everydayData";
import type { PlayOrder } from "./everydayProgress";
import type { EverydayWord } from "./types";

/** The languages a play order speaks, in order. */
export function orderLanguages(order: PlayOrder): TrainerSpeechLang[] {
  switch (order) {
    case "jp":
      return ["ja"];
    case "en":
      return ["en"];
    case "en-jp":
      return ["en", "ja"];
    default:
      return ["ja", "en"];
  }
}

/**
 * Everyday Japanese on top of the shared trainer voice (useTrainerSpeech →
 * speechService): Nanami for Japanese, Andrew for English, the saved speed
 * preference, one stream at a time. Single words don't need character
 * karaoke, so the card highlights the whole word while `activeLang` is set.
 */
export function useEverydaySpeech() {
  const speech = useTrainerSpeech();
  const { speakJapanese, speakEnglish, stop: stopVoice } = speech;
  const sessionRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearTimer();
    stopVoice();
  }, [stopVoice]);

  useEffect(() => () => {
    sessionRef.current += 1;
    clearTimer();
  }, []);

  /** Wait `ms`, unless a newer action has started meanwhile. */
  const wait = useCallback((ms: number, session: number, next: () => void) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (session === sessionRef.current) next();
    }, ms);
  }, []);

  const speakIn = useCallback(
    (word: EverydayWord, lang: TrainerSpeechLang, onEnded?: () => void) => {
      if (lang === "ja") {
        speakJapanese(plainJapanese(word), { reading: speechReading(word), karaoke: false, onEnded });
      } else {
        speakEnglish(speechEnglish(word), { karaoke: false, onEnded });
      }
    },
    [speakJapanese, speakEnglish],
  );

  /** Tap a language: speak just that, cancelling anything playing. */
  const say = useCallback(
    (word: EverydayWord, lang: TrainerSpeechLang) => {
      sessionRef.current += 1;
      clearTimer();
      speakIn(word, lang);
    },
    [speakIn],
  );

  /**
   * Speak a word in the given order with a short pause between languages,
   * then call onDone. `session` lets auto-play chain cards on one session.
   */
  const playSequence = useCallback(
    (word: EverydayWord, order: PlayOrder, onDone?: () => void, session = ++sessionRef.current) => {
      clearTimer();
      const langs = orderLanguages(order);
      const run = (i: number) => {
        if (session !== sessionRef.current) return;
        const lang = langs[i];
        if (!lang) {
          onDone?.();
          return;
        }
        speakIn(word, lang, () => {
          if (session !== sessionRef.current) return;
          if (i + 1 < langs.length) wait(autoModeTiming.shortPause, session, () => run(i + 1));
          else run(i + 1);
        });
      };
      run(0);
      return session;
    },
    [speakIn, wait],
  );

  const newSession = useCallback(() => {
    clearTimer();
    stopVoice();
    return ++sessionRef.current;
  }, [stopVoice]);

  const isCurrent = useCallback((session: number) => session === sessionRef.current, []);

  return {
    activeLang: speech.activeLang,
    speaking: speech.speaking,
    rateMode: speech.rateMode,
    setRateMode: speech.setRateMode,
    say,
    playSequence,
    stop,
    wait,
    newSession,
    isCurrent,
  };
}

export type EverydaySpeech = ReturnType<typeof useEverydaySpeech>;
