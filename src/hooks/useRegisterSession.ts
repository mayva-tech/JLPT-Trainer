import { useRef, useState } from "react";
import type {
  RegisterPlayPart,
  RegisterSideName,
} from "../components/RegisterSplitCard";
import { getRegisterPairsForSection } from "../data/registerPairs";
import type { RegisterPair } from "../types/register";
import {
  speechService,
  type SpeechHighlight,
} from "../services/speechService";
import { buildRegisterPlaySteps } from "../utils/registerPlayback";

export type UseRegisterSessionOptions = {
  getSpeechRate: () => number;
  setSpeechStatus: (status: "idle" | "speaking" | "paused") => void;
  setSpeechLang: (lang: "ja" | "en" | null) => void;
  setHighlight: (highlight: SpeechHighlight | null) => void;
  clearSpeechUi: () => void;
  isRegisterScreen: () => boolean;
  betweenItemsPause: number;
};

export function useRegisterSession({
  getSpeechRate,
  setSpeechStatus,
  setSpeechLang,
  setHighlight,
  clearSpeechUi,
  isRegisterScreen,
  betweenItemsPause,
}: UseRegisterSessionOptions) {
  const [sectionId, setSectionId] = useState("register-01");
  const pairs = getRegisterPairsForSection(sectionId);
  const [index, setIndex] = useState(0);
  const [activeSide, setActiveSide] = useState<RegisterPlayPart | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [drillMode, setDrillMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [playingSection, setPlayingSection] = useState(false);
  const playSessionRef = useRef(0);
  const gapTimerRef = useRef<number | null>(null);

  function stop() {
    playSessionRef.current += 1;
    if (gapTimerRef.current != null) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    setPlayingAll(false);
    setPlayingSection(false);
    setActiveSide(null);
  }

  function open(nextSectionId: string) {
    setSectionId(nextSectionId);
    setIndex(0);
    setActiveSide(null);
    setRevealed(false);
    setPlayingAll(false);
    setPlayingSection(false);
    playSessionRef.current += 1;
  }

  function playSide(side: RegisterSideName) {
    const pair = pairs[index] ?? null;
    if (!pair) return;
    if (side === "formal" && drillMode && !revealed) {
      setRevealed(true);
    }
    const source = side === "casual" ? pair.casual : pair.formal;
    if (!source.text.trim()) return;
    speechService.stop();
    stop();
    setActiveSide(side);
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakJapanese(
      source.text,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => {
          clearSpeechUi();
          setActiveSide(null);
        },
        onError: () => {
          clearSpeechUi();
          setActiveSide(null);
        },
      },
      getSpeechRate(),
      { reading: source.reading }
    );
  }

  function playBoth() {
    const pair = pairs[index] ?? null;
    if (!pair) return;
    if (drillMode && !revealed) setRevealed(true);
    speechService.stop();
    stop();
    setActiveSide("casual");
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakJapanese(
      pair.casual.text,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => {
          setHighlight(null);
          setActiveSide("formal");
          speechService.speakJapanese(
            pair.formal.text,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: () => {
                clearSpeechUi();
                setActiveSide(null);
              },
              onError: () => {
                clearSpeechUi();
                setActiveSide(null);
              },
            },
            getSpeechRate(),
            { reading: pair.formal.reading }
          );
        },
        onError: () => {
          clearSpeechUi();
          setActiveSide(null);
        },
      },
      getSpeechRate(),
      { reading: pair.casual.reading }
    );
  }

  function playPairSequence(
    pair: RegisterPair,
    session: number,
    onComplete: () => void
  ) {
    const alive = () => session === playSessionRef.current;
    const finish = () => {
      if (!alive()) return;
      onComplete();
    };
    const steps = buildRegisterPlaySteps(pair);

    const run = (stepIndex: number) => {
      if (!alive()) return;
      const step = steps[stepIndex];
      if (!step) {
        finish();
        return;
      }
      setHighlight(null);
      setActiveSide(step.part);
      setSpeechLang(step.lang);
      const advance = () => run(stepIndex + 1);
      const includeStart = step.part !== "meaning";
      const callbacks = {
        onBoundary: (h: SpeechHighlight) => {
          if (alive()) setHighlight(h);
        },
        onEnd: advance,
        onError: finish,
        ...(includeStart
          ? {
              onStart: () => {
                if (alive()) setSpeechStatus("speaking");
              },
            }
          : {}),
      };
      if (step.lang === "ja") {
        speechService.speakJapanese(
          step.text,
          callbacks,
          getSpeechRate(),
          step.part === "note" ? undefined : { reading: step.reading }
        );
      } else {
        speechService.speakEnglish(step.text, callbacks, getSpeechRate());
      }
    };

    run(0);
  }

  function play() {
    const pair = pairs[index] ?? null;
    if (!pair) return;
    if (drillMode && !revealed) setRevealed(true);
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingSection(false);
    setPlayingAll(true);
    playPairSequence(pair, session, () => {
      if (session !== playSessionRef.current) return;
      clearSpeechUi();
      setActiveSide(null);
      setPlayingAll(false);
    });
  }

  function playAll() {
    if (playingSection) {
      speechService.stop();
      stop();
      clearSpeechUi();
      return;
    }
    const sectionPairs = pairs;
    if (sectionPairs.length === 0) return;
    if (drillMode) setRevealed(true);
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(false);
    setPlayingSection(true);
    setIndex(0);

    const run = (pairIndex: number) => {
      if (session !== playSessionRef.current) return;
      if (!isRegisterScreen()) {
        stop();
        clearSpeechUi();
        return;
      }
      const nextPair = sectionPairs[pairIndex];
      if (!nextPair) {
        stop();
        clearSpeechUi();
        return;
      }
      setIndex(pairIndex);
      playPairSequence(nextPair, session, () => {
        if (session !== playSessionRef.current) return;
        const next = pairIndex + 1;
        if (next >= sectionPairs.length) {
          stop();
          clearSpeechUi();
          return;
        }
        clearSpeechUi();
        setActiveSide(null);
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
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    speechService.stop();
    stop();
    clearSpeechUi();
    setRevealed(false);
    setIndex((i) => Math.min(pairs.length - 1, i + 1));
  }

  function toggleFurigana() {
    setShowFurigana((value) => !value);
  }

  function toggleDrill() {
    speechService.stop();
    stop();
    clearSpeechUi();
    setDrillMode((value) => !value);
    setRevealed(false);
  }

  function reveal() {
    setRevealed(true);
  }

  return {
    sectionId,
    pairs,
    index,
    activeSide,
    showFurigana,
    drillMode,
    revealed,
    playingAll,
    playingSection,
    open,
    stop,
    playSide,
    playBoth,
    play,
    playAll,
    goPrev,
    goNext,
    toggleFurigana,
    toggleDrill,
    reveal,
  };
}
