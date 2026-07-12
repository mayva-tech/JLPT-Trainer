import { useState, useEffect, useRef } from "react";
import { getLessonById } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import {
  getTocItem,
  type TocItemId,
} from "../data/toc";
import type { StepName } from "../types/player";
import { CategoryCard } from "../components/CategoryCard";
import { WordCard } from "../components/WordCard";
import { PhraseCard } from "../components/PhraseCard";
import { SentenceCard } from "../components/SentenceCard";
import { ShadowingCard } from "../components/ShadowingCard";
import { ReviewCard } from "../components/ReviewCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { TableOfContents } from "../components/TableOfContents";
import { IntroHookDisplay } from "../components/IntroHookDisplay";
import { EndingCtaDisplay } from "../components/EndingCtaDisplay";
import { SectionPlaceholder } from "../components/SectionPlaceholder";
import { QuizCard } from "../components/QuizCard";
import {
  VideoFlowSetup,
  type VideoFlowConfig,
} from "../components/VideoFlowSetup";
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
import { bilingualPlayback } from "../services/bilingualPlayback";
import {
  loadEndingCta,
  loadIntroHook,
  resetEndingCta,
  resetIntroHook,
  saveEndingCta,
  saveIntroHook,
} from "../services/introCtaStorage";

const STEPS: StepName[] = [
  "category",
  "word",
  "phrase",
  "sentence",
  "shadowing",
  "review",
];

type AutoState = "off" | "on" | "stopping";
type Screen =
  | "toc"
  | "intro"
  | "lesson"
  | "grammar"
  | "quiz"
  | "ending"
  | "flow-setup";
type SpeechUiStatus = "idle" | "speaking" | "paused";

const QUIZ_VOCAB_LESSON = "lesson-01";

export function PlayerPage() {
  const [screen, setScreen] = useState<Screen>("toc");
  const [activeTocId, setActiveTocId] = useState<TocItemId | null>(null);
  const [lessonId, setLessonId] = useState("lesson-01");

  const lesson = getLessonById(lessonId);
  const items = lesson ? getVocabularyByIds(lesson.vocabularyIds) : [];

  const [itemIndex, setItemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [speechStatus, setSpeechStatus] = useState<SpeechUiStatus>("idle");
  const [speechLang, setSpeechLang] = useState<"ja" | "en" | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);
  const [speechRate, setSpeechRate] = useState(SPEECH_RATE_NORMAL);
  const [showFurigana, setShowFurigana] = useState(true);
  const [autoState, setAutoState] = useState<AutoState>("off");

  const [introEn, setIntroEn] = useState(() => loadIntroHook().english);
  const [introJa, setIntroJa] = useState(() => loadIntroHook().japanese);
  const [ctaJa, setCtaJa] = useState(() => loadEndingCta().japanese);
  const [ctaEn, setCtaEn] = useState(() => loadEndingCta().english);
  const [hookActiveLang, setHookActiveLang] = useState<"en" | "ja" | null>(
    null
  );
  const [enHighlight, setEnHighlight] = useState<SpeechHighlight | null>(null);
  const [jaHighlight, setJaHighlight] = useState<SpeechHighlight | null>(null);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);

  const [flowConfig, setFlowConfig] = useState<VideoFlowConfig>({
    includeIntro: true,
    lessonGroups: ["word-1-10"],
    quiz: null,
    includeEnding: true,
  });
  const [flowActive, setFlowActive] = useState(false);
  const [flowQueue, setFlowQueue] = useState<TocItemId[]>([]);
  const [flowPos, setFlowPos] = useState(0);

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

  const flowActiveRef = useRef(flowActive);
  flowActiveRef.current = flowActive;
  const flowQueueRef = useRef(flowQueue);
  flowQueueRef.current = flowQueue;
  const flowPosRef = useRef(flowPos);
  flowPosRef.current = flowPos;

  const introEnRef = useRef(introEn);
  const introJaRef = useRef(introJa);
  const ctaEnRef = useRef(ctaEn);
  const ctaJaRef = useRef(ctaJa);
  introEnRef.current = introEn;
  introJaRef.current = introJa;
  ctaEnRef.current = ctaEn;
  ctaJaRef.current = ctaJa;

  const quizItems =
    activeTocId === "quiz-vocab-1-10" ||
    activeTocId === "quiz-mixed" ||
    activeTocId === "quiz-final"
      ? getVocabularyByIds(
          getLessonById(QUIZ_VOCAB_LESSON)?.vocabularyIds ?? []
        )
      : [];

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
    setHookActiveLang(null);
    setEnHighlight(null);
    setJaHighlight(null);
  }

  function stopAllAudio() {
    bilingualPlayback.abort();
    softStopAuto();
    speechService.stop();
    clearSpeechUi();
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

  function bilingualUi() {
    return {
      setActiveLang: setHookActiveLang,
      setSpeechStatus,
      setEnHighlight,
      setJaHighlight,
    };
  }

  function goToToc() {
    stopAllAudio();
    setFlowActive(false);
    setFlowQueue([]);
    setFlowPos(0);
    setScreen("toc");
    // Keep activeTocId so the last opened section stays highlighted.
  }

  function openTocItem(id: TocItemId, options?: { fromFlow?: boolean }) {
    if (!options?.fromFlow) {
      stopAllAudio();
      setFlowActive(false);
      setFlowQueue([]);
      setFlowPos(0);
    } else {
      bilingualPlayback.abort();
      speechService.stop();
      clearSpeechUi();
      if (autoStateRef.current !== "off") {
        autoModeRunner.abort();
        setAutoState("off");
      }
    }

    const item = getTocItem(id);
    if (!item) return;

    setActiveTocId(id);
    setItemIndex(0);
    setStepIndex(0);
    setQuizIndex(0);
    setQuizRevealed(false);

    switch (item.kind) {
      case "intro":
        setScreen("intro");
        break;
      case "ending":
        setScreen("ending");
        break;
      case "word":
        setLessonId(item.lessonId ?? "lesson-01");
        setScreen("lesson");
        break;
      case "grammar":
        setScreen("grammar");
        break;
      case "quiz":
        setScreen("quiz");
        break;
    }
  }

  function startAutoMode(fromFlow = false) {
    const list = itemsRef.current;
    if (list.length === 0) {
      if (fromFlow) advanceFlow();
      return;
    }

    const startAt = fromFlow ? 0 : itemIndexRef.current;

    void autoModeRunner
      .start(list, startAt, buildAutoUi(), (state) => {
        setAutoState(state);
      })
      .then((completed) => {
        if (fromFlow && completed && flowActiveRef.current) {
          advanceFlow();
        }
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
      autoModeRunner.abort();
      clearSpeechUi();
      setAutoState("off");
      return;
    }
    startAutoMode(false);
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

  function playIntro(autoAdvance = false) {
    softStopAuto();
    void bilingualPlayback.play(
      introEnRef.current,
      introJaRef.current,
      "en-ja",
      bilingualUi(),
      speechRateRef.current,
      () => {
        if (autoAdvance && flowActiveRef.current) {
          window.setTimeout(() => advanceFlow(), 700);
        }
      }
    );
  }

  function playCta(autoAdvance = false) {
    softStopAuto();
    void bilingualPlayback.play(
      ctaEnRef.current,
      ctaJaRef.current,
      "ja-en",
      bilingualUi(),
      speechRateRef.current,
      () => {
        if (autoAdvance && flowActiveRef.current) {
          window.setTimeout(() => advanceFlow(), 700);
        }
      }
    );
  }

  function pauseHookPlayback() {
    if (speechService.getStatus() === "speaking") {
      bilingualPlayback.pause();
      setSpeechStatus("paused");
    } else if (speechService.getStatus() === "paused") {
      bilingualPlayback.resume();
      setSpeechStatus("speaking");
    }
  }

  function restartIntro() {
    playIntro(flowActiveRef.current && screen === "intro");
  }

  function restartCta() {
    playCta(flowActiveRef.current && screen === "ending");
  }

  function buildFlowQueue(config: VideoFlowConfig): TocItemId[] {
    const queue: TocItemId[] = [];
    if (config.includeIntro) queue.push("intro-hook");
    queue.push(...config.lessonGroups);
    if (config.quiz) queue.push(config.quiz);
    if (config.includeEnding) queue.push("ending-cta");
    return queue;
  }

  function advanceFlow() {
    if (!flowActiveRef.current) return;
    const next = flowPosRef.current + 1;
    const queue = flowQueueRef.current;
    if (next >= queue.length) {
      setFlowActive(false);
      setFlowQueue([]);
      setFlowPos(0);
      setScreen("toc");
      return;
    }
    setFlowPos(next);
    openTocItem(queue[next]!, { fromFlow: true });
  }

  function startVideoFlow() {
    const queue = buildFlowQueue(flowConfig);
    if (queue.length === 0) return;
    stopAllAudio();
    setFlowQueue(queue);
    setFlowPos(0);
    setFlowActive(true);
    openTocItem(queue[0]!, { fromFlow: true });
  }

  // When flow opens a section, kick off its automatic playback.
  useEffect(() => {
    if (!flowActive) return;

    let cancelled = false;

    if (screen === "intro") {
      playIntro(true);
      return () => {
        cancelled = true;
      };
    }
    if (screen === "ending") {
      playCta(true);
      return () => {
        cancelled = true;
      };
    }
    if (screen === "lesson") {
      if (items.length === 0) {
        const t = window.setTimeout(() => {
          if (!cancelled && flowActiveRef.current) advanceFlow();
        }, 1200);
        return () => {
          cancelled = true;
          window.clearTimeout(t);
        };
      }
      startAutoMode(true);
      return () => {
        cancelled = true;
      };
    }
    if (screen === "grammar") {
      const t = window.setTimeout(() => {
        if (!cancelled && flowActiveRef.current) advanceFlow();
      }, 1600);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }
    if (screen === "quiz") {
      void runQuizFlow();
      return () => {
        cancelled = true;
      };
    }

    return () => {
      cancelled = true;
    };
  }, [flowActive, screen, activeTocId, lessonId, items.length]);

  async function runQuizFlow() {
    const list =
      activeTocId === "quiz-vocab-1-10" ||
      activeTocId === "quiz-mixed" ||
      activeTocId === "quiz-final"
        ? getVocabularyByIds(
            getLessonById(QUIZ_VOCAB_LESSON)?.vocabularyIds ?? []
          )
        : [];

    if (list.length === 0) {
      window.setTimeout(() => advanceFlow(), 1200);
      return;
    }

    for (let i = 0; i < list.length; i++) {
      if (!flowActiveRef.current) return;
      setQuizIndex(i);
      setQuizRevealed(false);
      const item = list[i]!;
      await speakPromise("en", item.meaning);
      if (!flowActiveRef.current) return;
      await delay(600);
      if (!flowActiveRef.current) return;
      setQuizRevealed(true);
      await speakPromise("ja", item.word);
      if (!flowActiveRef.current) return;
      await delay(900);
    }
    if (flowActiveRef.current) advanceFlow();
  }

  function speakPromise(lang: "en" | "ja", text: string): Promise<void> {
    return new Promise((resolve) => {
      setSpeechLang(lang);
      setSpeechStatus("speaking");
      if (lang === "en") {
        const firstWord = text.match(/^\S+/);
        setEnHighlight({
          start: 0,
          end: firstWord ? firstWord[0].length : Math.min(1, text.length),
        });
        speechService.speakEnglish(
          text,
          {
            onBoundary: (h) => setEnHighlight(h),
            onEnd: () => {
              setEnHighlight(null);
              setSpeechStatus("idle");
              setSpeechLang(null);
              resolve();
            },
          },
          speechRateRef.current
        );
      } else {
        setJaHighlight({ start: 0, end: Math.min(1, text.length) });
        speechService.speakJapanese(
          text,
          {
            onBoundary: (h) => setJaHighlight(h),
            onEnd: () => {
              setJaHighlight(null);
              setSpeechStatus("idle");
              setSpeechLang(null);
              resolve();
            },
          },
          speechRateRef.current
        );
      }
    });
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  useEffect(() => {
    return () => {
      autoModeRunner.abort();
      bilingualPlayback.abort();
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
        target.isContentEditable ||
        target.tagName === "SELECT"
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if (screen !== "lesson") return;

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
          bilingualPlayback.abort();
          speechService.stop();
          clearSpeechUi();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [itemIndex, stepIndex, items.length, screen]);

  const tocItem = activeTocId ? getTocItem(activeTocId) : undefined;
  const item = items[itemIndex];
  const step = STEPS[stepIndex] as StepName;
  const canJa = item ? !!getSpeakableJapanese(step, item) : false;
  const canEn = item ? !!getSpeakableEnglish(step, item) : false;
  const jaLessonHighlight = speechLang === "ja" ? highlight : null;
  const enLessonHighlight = speechLang === "en" ? highlight : null;

  function renderStep() {
    if (!item) return null;
    switch (step) {
      case "category":
        return <CategoryCard item={item} />;
      case "word":
        return (
          <WordCard
            item={item}
            jaHighlight={jaLessonHighlight}
            enHighlight={enLessonHighlight}
            showFurigana={showFurigana}
          />
        );
      case "phrase":
        return (
          <PhraseCard
            item={item}
            jaHighlight={jaLessonHighlight}
            enHighlight={enLessonHighlight}
            showFurigana={showFurigana}
          />
        );
      case "sentence":
        return (
          <SentenceCard
            item={item}
            jaHighlight={jaLessonHighlight}
            enHighlight={enLessonHighlight}
            showFurigana={showFurigana}
          />
        );
      case "shadowing":
        return (
          <ShadowingCard
            item={item}
            phase={autoState === "on" ? "repeat" : "listen"}
            highlight={jaLessonHighlight}
            showFurigana={showFurigana}
          />
        );
      case "review":
        return (
          <ReviewCard
            item={item}
            jaHighlight={jaLessonHighlight}
            enHighlight={enLessonHighlight}
            showFurigana={showFurigana}
          />
        );
    }
  }

  function renderStage() {
    switch (screen) {
      case "toc":
      case "flow-setup":
        return (
          <TableOfContents
            selectedId={activeTocId}
            onSelect={(id) => openTocItem(id)}
          />
        );
      case "intro":
        return (
          <IntroHookDisplay
            english={introEn}
            japanese={introJa}
            activeLang={hookActiveLang}
            enHighlight={enHighlight}
            jaHighlight={jaHighlight}
          />
        );
      case "ending":
        return (
          <EndingCtaDisplay
            japanese={ctaJa}
            english={ctaEn}
            activeLang={hookActiveLang}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
          />
        );
      case "grammar":
        return (
          <SectionPlaceholder
            chip="Grammar"
            title={tocItem?.label ?? "Grammar Lesson"}
            subtitle="Grammar lesson content will appear here for recording."
          />
        );
      case "quiz":
        return (
          <QuizCard
            title={tocItem?.label ?? "Quiz"}
            item={quizItems[quizIndex] ?? null}
            index={quizIndex}
            total={Math.max(quizItems.length, 1)}
            revealed={quizRevealed}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            showFurigana={showFurigana}
          />
        );
      case "lesson":
        if (!lesson || items.length === 0) {
          return (
            <SectionPlaceholder
              chip="Vocabulary"
              title={lesson?.title ?? tocItem?.label ?? "Word Lesson"}
              subtitle={
                lesson?.subtitle === "Coming soon"
                  ? "This lesson group is reserved — add vocabulary data when ready."
                  : "No vocabulary found."
              }
            />
          );
        }
        return (
          <>
            <ProgressIndicator
              current={itemIndex}
              total={items.length}
              step={step}
            />
            {renderStep()}
          </>
        );
    }
  }

  const speechHint =
    flowActive
      ? `Video flow ${flowPos + 1}/${flowQueue.length} · controls stay live`
      : autoState === "on"
        ? "Auto ON · A to stop after current audio"
        : autoState === "stopping"
          ? "Auto stopping after audio…"
          : speechStatus === "speaking" && speechLang === "ja"
            ? "JP Nanami… (Esc stop)"
            : speechStatus === "speaking" && speechLang === "en"
              ? "EN Andrew… (Esc stop)"
              : screen === "lesson"
                ? `← → navigate · ↑ JP · ↓ EN · Shift rate · Ctrl あ · A Auto`
                : "TOC · Intro · Lessons · Quizzes · Ending CTA";

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

  const showLessonChrome = screen === "lesson" && items.length > 0;
  const showBackToToc = screen !== "toc" && screen !== "flow-setup";

  const showProductionPanel =
    screen === "intro" ||
    screen === "ending" ||
    screen === "flow-setup" ||
    (screen === "quiz" && quizItems.length > 0);

  return (
    <>
      <div
        className={
          showProductionPanel
            ? "stage-wrapper stage-wrapper--with-panel"
            : "stage-wrapper"
        }
      >
        <div className="stage">{renderStage()}</div>
      </div>

      {screen === "intro" ? (
        <div className="production-panel">
          <div className="production-panel-title">Customizable Intro Hook</div>
          <div className="production-fields">
            <label className="production-field">
              <span>English Intro Hook</span>
              <textarea
                rows={2}
                value={introEn}
                onChange={(e) => setIntroEn(e.target.value)}
              />
            </label>
            <label className="production-field">
              <span>Japanese Intro Hook</span>
              <textarea
                rows={2}
                value={introJa}
                onChange={(e) => setIntroJa(e.target.value)}
              />
            </label>
          </div>
          <div className="production-actions">
            <button
              type="button"
              onClick={() => {
                saveIntroHook({ english: introEn, japanese: introJa });
              }}
            >
              Save Intro
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const next = resetIntroHook();
                setIntroEn(next.english);
                setIntroJa(next.japanese);
              }}
            >
              Reset to Default
            </button>
            <button type="button" onClick={() => playIntro(false)}>
              Play
            </button>
            <button type="button" className="btn-secondary" onClick={pauseHookPlayback}>
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn-secondary" onClick={restartIntro}>
              Restart
            </button>
            <button
              type="button"
              onClick={() => {
                bilingualPlayback.abort();
                speechService.stop();
                clearSpeechUi();
                if (flowActive) advanceFlow();
                else openTocItem("word-1-10");
              }}
            >
              Next Section
            </button>
          </div>
        </div>
      ) : null}

      {screen === "ending" ? (
        <div className="production-panel">
          <div className="production-panel-title">Customizable Ending CTA</div>
          <div className="production-fields">
            <label className="production-field">
              <span>Japanese CTA</span>
              <textarea
                rows={2}
                value={ctaJa}
                onChange={(e) => setCtaJa(e.target.value)}
              />
            </label>
            <label className="production-field">
              <span>English CTA</span>
              <textarea
                rows={2}
                value={ctaEn}
                onChange={(e) => setCtaEn(e.target.value)}
              />
            </label>
          </div>
          <div className="production-actions">
            <button
              type="button"
              onClick={() => {
                saveEndingCta({ japanese: ctaJa, english: ctaEn });
              }}
            >
              Save CTA
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const next = resetEndingCta();
                setCtaJa(next.japanese);
                setCtaEn(next.english);
              }}
            >
              Reset to Default
            </button>
            <button type="button" onClick={() => playCta(false)}>
              Play
            </button>
            <button type="button" className="btn-secondary" onClick={pauseHookPlayback}>
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn-secondary" onClick={restartCta}>
              Restart
            </button>
          </div>
        </div>
      ) : null}

      {screen === "flow-setup" ? (
        <VideoFlowSetup
          config={flowConfig}
          onChange={setFlowConfig}
          onStart={startVideoFlow}
          onCancel={() => setScreen("toc")}
        />
      ) : null}

      {screen === "quiz" && quizItems.length > 0 ? (
        <div className="production-panel production-panel--compact">
          <div className="production-actions">
            <button
              type="button"
              disabled={quizIndex === 0}
              onClick={() => {
                stopAllAudio();
                setQuizIndex((i) => Math.max(0, i - 1));
                setQuizRevealed(false);
              }}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => {
                softStopAuto();
                const q = quizItems[quizIndex];
                if (!q) return;
                void speakPromise("en", q.meaning);
              }}
            >
              Play Prompt
            </button>
            <button
              type="button"
              onClick={() => {
                setQuizRevealed(true);
                const q = quizItems[quizIndex];
                if (!q) return;
                void speakPromise("ja", q.word);
              }}
            >
              Reveal + JP
            </button>
            <button
              type="button"
              disabled={quizIndex >= quizItems.length - 1}
              onClick={() => {
                stopAllAudio();
                setQuizIndex((i) => Math.min(quizItems.length - 1, i + 1));
                setQuizRevealed(false);
              }}
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}

      <div className="step-indicator" aria-hidden="true">
        {screen === "lesson" && items.length > 0
          ? `Step ${stepIndex + 1} of ${STEPS.length} — ${step}`
          : screen === "toc"
            ? "Table of Contents"
            : tocItem?.label ?? screen}
        {" · "}
        {speechHint}
      </div>

      <div className="nav-bar">
        <button
          type="button"
          className={
            screen === "toc" || screen === "flow-setup"
              ? "toc-nav-btn toc-nav-btn--active"
              : "toc-nav-btn"
          }
          tabIndex={-1}
          onClick={goToToc}
        >
          Table of Contents
        </button>

        {showBackToToc ? (
          <button type="button" className="btn-secondary" tabIndex={-1} onClick={goToToc}>
            Back to Table of Contents
          </button>
        ) : null}

        {screen === "toc" ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setScreen("flow-setup")}
          >
            Start Video Flow
          </button>
        ) : null}

        {showLessonChrome ? (
          <>
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
          </>
        ) : null}
      </div>
    </>
  );
}
