import { useRef, useState } from "react";
import { getOnomatopoeiaForLevel } from "../data/onomatopoeia";
import type {
  OnomatopoeiaItem,
  OnomatopoeiaJlptLevel,
  OnomatopoeiaPart,
} from "../types/onomatopoeia";
import {
  speechService,
  type SpeechHighlight,
} from "../services/speechService";
import { buildOnoPlaySteps } from "../utils/onomatopoeiaPlayback";

export type UseOnomatopoeiaSessionOptions = {
  getSpeechRate: () => number;
  setSpeechStatus: (status: "idle" | "speaking" | "paused") => void;
  setSpeechLang: (lang: "ja" | "en" | null) => void;
  setHighlight: (highlight: SpeechHighlight | null) => void;
  clearSpeechUi: () => void;
  isOnomatopoeiaScreen: () => boolean;
  betweenItemsPause: number;
};

export function useOnomatopoeiaSession({
  getSpeechRate,
  setSpeechStatus,
  setSpeechLang,
  setHighlight,
  clearSpeechUi,
  isOnomatopoeiaScreen,
  betweenItemsPause,
}: UseOnomatopoeiaSessionOptions) {
  const [level, setLevel] = useState<OnomatopoeiaJlptLevel>("N5");
  const items = getOnomatopoeiaForLevel(level);
  const [index, setIndex] = useState(0);
  const [activePart, setActivePart] = useState<OnomatopoeiaPart | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [playingAll, setPlayingAll] = useState(false);
  const [playingLevel, setPlayingLevel] = useState(false);
  const playSessionRef = useRef(0);
  const gapTimerRef = useRef<number | null>(null);

  function stop() {
    playSessionRef.current += 1;
    if (gapTimerRef.current != null) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    setPlayingAll(false);
    setPlayingLevel(false);
    setActivePart(null);
  }

  /** Open a JLPT band. Furigana always resets to ON (unlike register). */
  function open(nextLevel: OnomatopoeiaJlptLevel) {
    setLevel(nextLevel);
    setIndex(0);
    setActivePart(null);
    setShowFurigana(true);
    setPlayingAll(false);
    setPlayingLevel(false);
    playSessionRef.current += 1;
  }

  function playWord() {
    const item = items[index] ?? null;
    if (!item) return;
    speechService.stop();
    stop();
    setActivePart("word");
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakJapanese(
      item.japanese,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => {
          clearSpeechUi();
          setActivePart(null);
        },
        onError: () => {
          clearSpeechUi();
          setActivePart(null);
        },
      },
      getSpeechRate(),
      { reading: item.reading }
    );
  }

  function playEnglish() {
    const item = items[index] ?? null;
    if (!item?.meaning.trim()) return;
    speechService.stop();
    stop();
    setActivePart("meaning");
    setSpeechLang("en");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakEnglish(
      item.meaning,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => {
          setHighlight(null);
          setActivePart("word");
          setSpeechLang("ja");
          speechService.speakJapanese(
            item.japanese,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: () => {
                clearSpeechUi();
                setActivePart(null);
              },
              onError: () => {
                clearSpeechUi();
                setActivePart(null);
              },
            },
            getSpeechRate(),
            { reading: item.reading }
          );
        },
        onError: () => {
          clearSpeechUi();
          setActivePart(null);
        },
      },
      getSpeechRate()
    );
  }

  function playExample() {
    const item = items[index] ?? null;
    if (!item?.exampleJapanese.trim()) return;
    speechService.stop();
    stop();
    setActivePart("example");
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");

    const finishExample = () => {
      clearSpeechUi();
      setActivePart(null);
    };

    const repeatExampleJa = () => {
      setHighlight(null);
      setActivePart("example");
      setSpeechLang("ja");
      speechService.speakJapanese(
        item.exampleJapanese,
        {
          onBoundary: (h) => setHighlight(h),
          onEnd: finishExample,
          onError: finishExample,
        },
        getSpeechRate(),
        { reading: item.exampleReading }
      );
    };

    speechService.speakJapanese(
      item.exampleJapanese,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => {
          if (!item.exampleEnglish.trim()) {
            finishExample();
            return;
          }
          setHighlight(null);
          setActivePart("exampleEn");
          setSpeechLang("en");
          speechService.speakEnglish(
            item.exampleEnglish,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: repeatExampleJa,
              onError: finishExample,
            },
            getSpeechRate()
          );
        },
        onError: finishExample,
      },
      getSpeechRate(),
      { reading: item.exampleReading }
    );
  }

  function playCardSequence(
    item: OnomatopoeiaItem,
    session: number,
    onComplete: () => void
  ) {
    const alive = () => session === playSessionRef.current;

    const finish = () => {
      if (!alive()) return;
      onComplete();
    };

    const steps = buildOnoPlaySteps(item);
    if (steps.length === 0) {
      finish();
      return;
    }

    const run = (stepIndex: number) => {
      if (!alive()) return;
      const step = steps[stepIndex];
      if (!step) {
        finish();
        return;
      }

      setHighlight(null);
      setActivePart(step.part);
      setSpeechLang(step.lang);

      const advance = () => run(stepIndex + 1);
      const callbacks = {
        onStart: () => {
          if (alive()) setSpeechStatus("speaking");
        },
        onBoundary: (h: SpeechHighlight) => {
          if (alive()) setHighlight(h);
        },
        onEnd: advance,
        onError: finish,
      };

      if (step.lang === "ja") {
        speechService.speakJapanese(
          step.text,
          callbacks,
          getSpeechRate(),
          step.reading ? { reading: step.reading } : undefined
        );
      } else {
        speechService.speakEnglish(step.text, callbacks, getSpeechRate());
      }
    };

    run(0);
  }

  /** Every visible line: category, word, meaning, collocation, nuance, example. */
  function play() {
    const item = items[index] ?? null;
    if (!item) return;
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingLevel(false);
    setPlayingAll(true);
    playCardSequence(item, session, () => {
      if (session !== playSessionRef.current) return;
      clearSpeechUi();
      setActivePart(null);
      setPlayingAll(false);
    });
  }

  /** Play every expression in the current JLPT band from the start. */
  function playAll() {
    if (playingLevel) {
      speechService.stop();
      stop();
      clearSpeechUi();
      return;
    }
    const levelItems = items;
    if (levelItems.length === 0) return;
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(false);
    setPlayingLevel(true);
    setIndex(0);

    const run = (itemIndex: number) => {
      if (session !== playSessionRef.current) return;
      if (!isOnomatopoeiaScreen()) {
        stop();
        clearSpeechUi();
        return;
      }
      const nextItem = levelItems[itemIndex];
      if (!nextItem) {
        stop();
        clearSpeechUi();
        return;
      }
      setIndex(itemIndex);
      playCardSequence(nextItem, session, () => {
        if (session !== playSessionRef.current) return;
        const next = itemIndex + 1;
        if (next >= levelItems.length) {
          stop();
          clearSpeechUi();
          return;
        }
        clearSpeechUi();
        setActivePart(null);
        gapTimerRef.current = window.setTimeout(() => {
          gapTimerRef.current = null;
          if (session !== playSessionRef.current) return;
          run(next);
        }, betweenItemsPause);
      });
    };

    run(0);
  }

  function goPrev() {
    speechService.stop();
    stop();
    clearSpeechUi();
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    speechService.stop();
    stop();
    clearSpeechUi();
    setIndex((i) => Math.min(items.length - 1, i + 1));
  }

  function toggleFurigana() {
    setShowFurigana((value) => !value);
  }

  return {
    level,
    items,
    index,
    activePart,
    showFurigana,
    playingAll,
    playingLevel,
    open,
    stop,
    playWord,
    playEnglish,
    playExample,
    play,
    playAll,
    goPrev,
    goNext,
    toggleFurigana,
  };
}
