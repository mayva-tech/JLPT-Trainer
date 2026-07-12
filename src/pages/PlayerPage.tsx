import { useState, useEffect, useRef } from "react";
import { getLessonById } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import type { StepName } from "../types/player";
import { CategoryCard } from "../components/CategoryCard";
import { WordCard } from "../components/WordCard";
import { PhraseCard } from "../components/PhraseCard";
import { SentenceCard } from "../components/SentenceCard";
import { ShadowingCard } from "../components/ShadowingCard";
import { ReviewCard } from "../components/ReviewCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import {
  getSpeakableEnglish,
  getSpeakableJapanese,
  speechService,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  type SpeechHighlight,
} from "../services/speechService";
import {
  autoModeRunner,
  type AutoModeUi,
} from "../services/autoModeRunner";

const STEPS: StepName[] = [
  "category",
  "word",
  "phrase",
  "sentence",
  "shadowing",
  "review",
];

type AutoState = "off" | "on" | "stopping";

export function PlayerPage() {
  const lesson = getLessonById("lesson-01");
  const items = lesson ? getVocabularyByIds(lesson.vocabularyIds) : [];

  const [itemIndex, setItemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [speechStatus, setSpeechStatus] = useState<"idle" | "speaking">("idle");
  const [speechLang, setSpeechLang] = useState<"ja" | "en" | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);
  const [speechRate, setSpeechRate] = useState(SPEECH_RATE_NORMAL);
  const [showFurigana, setShowFurigana] = useState(true);
  const [autoState, setAutoState] = useState<AutoState>("off");

  const speechRateRef = useRef(speechRate);
  speechRateRef.current = speechRate;

  const itemIndexRef = useRef(itemIndex);
  const stepIndexRef = useRef(stepIndex);
  itemIndexRef.current = itemIndex;
  stepIndexRef.current = stepIndex;

  const autoStateRef = useRef(autoState);
  autoStateRef.current = autoState;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isFirst = itemIndex === 0 && stepIndex === 0;
  const isLast =
    items.length > 0 &&
    itemIndex === items.length - 1 &&
    stepIndex === STEPS.length - 1;

  function currentItem() {
    return items[itemIndexRef.current] ?? null;
  }

  function currentStep(): StepName | null {
    return STEPS[stepIndexRef.current] ?? null;
  }

  function clearSpeechUi() {
    setSpeechStatus("idle");
    setSpeechLang(null);
    setHighlight(null);
  }

  function buildAutoUi(): AutoModeUi {
    return {
      setItemIndex,
      setStep: (step) => {
        const idx = STEPS.indexOf(step);
        if (idx >= 0) setStepIndex(idx);
      },
      setShowFurigana,
      setSpeechRate,
      setSpeechLang,
      setSpeechStatus,
      setHighlight,
    };
  }

  function softStopAuto() {
    if (autoStateRef.current === "on") {
      setAutoState("stopping");
      autoModeRunner.requestStopAfterCurrent();
    }
  }

  function startAutoMode() {
    const list = itemsRef.current;
    if (list.length === 0) return;

    // Continue from the currently selected item (item 1 if still at start).
    const startAt = itemIndexRef.current;

    void autoModeRunner.start(list, startAt, buildAutoUi(), (state) => {
      setAutoState(state);
    });
  }

  function toggleAutoMode() {
    const state = autoStateRef.current;
    if (state === "on") {
      setAutoState("stopping");
      autoModeRunner.requestStopAfterCurrent();
      return;
    }
    if (state === "stopping") {
      // Second press while waiting: hard-cancel remaining wait.
      autoModeRunner.abort();
      clearSpeechUi();
      setAutoState("off");
      return;
    }
    startAutoMode();
  }

  function goNextStep() {
    if (items.length === 0) return;
    softStopAuto();
    speechService.stop();
    clearSpeechUi();
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
    } else if (itemIndex < items.length - 1) {
      setItemIndex((i) => i + 1);
      setStepIndex(0);
    }
  }

  function goPrevStep() {
    if (items.length === 0) return;
    softStopAuto();
    speechService.stop();
    clearSpeechUi();
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else if (itemIndex > 0) {
      setItemIndex((i) => i - 1);
      setStepIndex(STEPS.length - 1);
    }
  }

  function playJapanese() {
    softStopAuto();
    const item = currentItem();
    const step = currentStep();
    if (!item || !step) return;
    const text = getSpeakableJapanese(step, item);
    if (!text) return;
    setSpeechLang("ja");
    setSpeechStatus("speaking");
    setHighlight({ start: 0, end: Math.min(1, text.length) });
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => setHighlight(h),
        onEnd: () => clearSpeechUi(),
      },
      speechRateRef.current
    );
  }

  function playEnglish() {
    softStopAuto();
    const item = currentItem();
    const step = currentStep();
    if (!item || !step) return;
    const text = getSpeakableEnglish(step, item);
    if (!text) return;
    setSpeechLang("en");
    setSpeechStatus("speaking");
    const firstWord = text.match(/^\S+/);
    setHighlight({
      start: 0,
      end: firstWord ? firstWord[0].length : Math.min(1, text.length),
    });
    speechService.speakEnglish(
      text,
      {
        onBoundary: (h) => setHighlight(h),
        onEnd: () => clearSpeechUi(),
      },
      speechRateRef.current
    );
  }

  useEffect(() => {
    return () => {
      autoModeRunner.abort();
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const warm = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          goNextStep();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goPrevStep();
          break;
        case "ArrowUp":
          event.preventDefault();
          playJapanese();
          break;
        case "ArrowDown":
          event.preventDefault();
          playEnglish();
          break;
        case "Shift":
          if (event.repeat) break;
          event.preventDefault();
          setSpeechRate((r) =>
            r === SPEECH_RATE_NORMAL ? SPEECH_RATE_SLOW : SPEECH_RATE_NORMAL
          );
          break;
        case "Control":
          if (event.repeat) break;
          event.preventDefault();
          setShowFurigana((v) => !v);
          break;
        case "a":
        case "A":
          if (event.repeat) break;
          event.preventDefault();
          toggleAutoMode();
          break;
        case "Escape":
          event.preventDefault();
          if (autoStateRef.current !== "off") {
            autoModeRunner.abort();
            setAutoState("off");
          }
          speechService.stop();
          clearSpeechUi();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [itemIndex, stepIndex, items.length]);

  if (!lesson || items.length === 0) {
    return (
      <div className="stage-wrapper">
        <div className="stage">
          <div className="safe-area">
            <div className="word-meaning">No vocabulary found.</div>
          </div>
        </div>
      </div>
    );
  }

  const item = items[itemIndex]!;
  const step = STEPS[stepIndex] as StepName;
  const canJa = !!getSpeakableJapanese(step, item);
  const canEn = !!getSpeakableEnglish(step, item);
  const jaHighlight = speechLang === "ja" ? highlight : null;
  const enHighlight = speechLang === "en" ? highlight : null;

  function renderStep() {
    switch (step) {
      case "category":
        return <CategoryCard item={item} />;
      case "word":
        return (
          <WordCard
            item={item}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            showFurigana={showFurigana}
          />
        );
      case "phrase":
        return (
          <PhraseCard
            item={item}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            showFurigana={showFurigana}
          />
        );
      case "sentence":
        return (
          <SentenceCard
            item={item}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            showFurigana={showFurigana}
          />
        );
      case "shadowing":
        return (
          <ShadowingCard
            item={item}
            phase={autoState === "on" ? "repeat" : "listen"}
            highlight={jaHighlight}
            showFurigana={showFurigana}
          />
        );
      case "review":
        return (
          <ReviewCard
            item={item}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            showFurigana={showFurigana}
          />
        );
    }
  }

  const speechHint =
    autoState === "on"
      ? "Auto ON · A to stop after current audio"
      : autoState === "stopping"
        ? "Auto stopping after audio…"
        : speechStatus === "speaking" && speechLang === "ja"
          ? "JP Nanami… (Esc stop)"
          : speechStatus === "speaking" && speechLang === "en"
            ? "EN Andrew… (Esc stop)"
            : `← → navigate · ↑ JP · ↓ EN · Shift rate · Ctrl あ · A Auto`;

  const autoLabel =
    autoState === "on"
      ? "Auto ON"
      : autoState === "stopping"
        ? "Auto…"
        : "Auto OFF";

  const autoClass =
    autoState === "on"
      ? "auto-btn auto-btn--active"
      : autoState === "stopping"
        ? "auto-btn auto-btn--stopping"
        : "auto-btn";

  return (
    <>
      <div className="stage-wrapper">
        <div className="stage">
          <ProgressIndicator
            current={itemIndex}
            total={items.length}
            step={step}
          />
          {renderStep()}
        </div>
      </div>

      <div className="step-indicator" aria-hidden="true">
        Step {stepIndex + 1} of {STEPS.length} — {step}
        {" · "}
        {speechHint}
      </div>

      <div className="nav-bar" aria-hidden="true">
        <button onClick={goPrevStep} disabled={isFirst} tabIndex={-1}>
          ← Back
        </button>
        <button
          onClick={playJapanese}
          tabIndex={-1}
          disabled={!canJa}
          title="Japanese voice — Microsoft Nanami / 七海 (↑)"
          className={
            speechStatus === "speaking" && speechLang === "ja"
              ? "voice-btn voice-btn--active"
              : "voice-btn"
          }
        >
          ↑ JP
        </button>
        <button
          onClick={playEnglish}
          tabIndex={-1}
          disabled={!canEn}
          title="English — Microsoft Andrew Online Natural (↓)"
          className={
            speechStatus === "speaking" && speechLang === "en"
              ? "voice-btn voice-btn--active"
              : "voice-btn"
          }
        >
          ↓ EN
        </button>
        <span className="rate-group">
          <button
            type="button"
            className={
              speechRate === SPEECH_RATE_NORMAL
                ? "rate-btn rate-btn--active"
                : "rate-btn"
            }
            tabIndex={-1}
            title="Normal speed (0.85) — Shift toggles"
            onClick={() => setSpeechRate(SPEECH_RATE_NORMAL)}
          >
            Normal
          </button>
          <button
            type="button"
            className={
              speechRate === SPEECH_RATE_SLOW
                ? "rate-btn rate-btn--active"
                : "rate-btn"
            }
            tabIndex={-1}
            title="Slow speed (0.7) — Shift toggles"
            onClick={() => setSpeechRate(SPEECH_RATE_SLOW)}
          >
            Slow
          </button>
        </span>
        <button
          type="button"
          className={showFurigana ? "furi-btn furi-btn--active" : "furi-btn"}
          tabIndex={-1}
          title="Toggle hiragana readings (Ctrl)"
          onClick={() => setShowFurigana((v) => !v)}
        >
          あ {showFurigana ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          className={autoClass}
          tabIndex={-1}
          title="Toggle Auto Mode (A) — stops after current audio"
          onClick={toggleAutoMode}
        >
          {autoLabel}
        </button>
        <button onClick={goNextStep} disabled={isLast} tabIndex={-1}>
          Forward →
        </button>
      </div>
    </>
  );
}
