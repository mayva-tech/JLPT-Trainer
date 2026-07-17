import { useState, useEffect, useRef } from "react";
import { getLessonById } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import { getGrammarByIds, getGrammarLessonById } from "../data/grammar";
import type { GrammarItem } from "../types/grammar";
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
import { GrammarCategoryCard } from "../components/GrammarCategoryCard";
import { GrammarPatternCard } from "../components/GrammarPatternCard";
import { GrammarFormationCard } from "../components/GrammarFormationCard";
import { GrammarSentenceCard } from "../components/GrammarSentenceCard";
import { GrammarShadowingCard } from "../components/GrammarShadowingCard";
import { GrammarReviewCard } from "../components/GrammarReviewCard";
import { GrammarProgressIndicator } from "../components/GrammarProgressIndicator";
import { GlossaryView } from "../components/GlossaryView";
import {
  VideoFlowSetup,
  type VideoFlowConfig,
} from "../components/VideoFlowSetup";
import {
  getSpeakableEnglish,
  getSpeakableJapanese,
  getGrammarSpeakableEnglish,
  getGrammarSpeakableJapanese,
  getJapaneseSpeechInput,
  getGrammarJapaneseSpeechInput,
  speechService,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  type SpeechHighlight,
} from "../services/speechService";
import {
  autoModeRunner,
  type AutoModeUi,
} from "../services/autoModeRunner";
import {
  grammarAutoModeRunner,
  type GrammarAutoModeUi,
  type GrammarStep,
  GRAMMAR_STEPS,
} from "../services/grammarAutoModeRunner";
import { bilingualPlayback } from "../services/bilingualPlayback";
import {
  loadEndingCta,
  loadIntroHook,
  loadQuizAfterComment,
  loadQuizPreComment,
  resetEndingCta,
  resetIntroHook,
  resetQuizAfterComment,
  resetQuizPreComment,
  saveEndingCta,
  saveIntroHook,
  saveQuizAfterComment,
  saveQuizPreComment,
} from "../services/introCtaStorage";
import {
  quizAutoRunner,
  buildQuizChoices,
  shuffle,
  type QuizPhase,
} from "../services/quizAutoRunner";
import type { VocabularyItem } from "../types/vocabulary";

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
  | "glossary"
  | "quiz"
  | "quiz-pre"
  | "quiz-after"
  | "ending"
  | "flow-setup";
type SpeechUiStatus = "idle" | "speaking" | "paused";

const QUIZ_VOCAB_LESSON = "lesson-01";

export function PlayerPage() {
  const [screen, setScreen] = useState<Screen>("toc");
  const screenRef = useRef(screen);
  screenRef.current = screen;
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

  const [grammarLessonId, setGrammarLessonId] = useState("grammar-lesson-01");
  const grammarLesson = getGrammarLessonById(grammarLessonId);
  const grammarItems: GrammarItem[] = grammarLesson
    ? getGrammarByIds(grammarLesson.grammarIds)
    : [];

  const [grammarItemIndex, setGrammarItemIndex] = useState(0);
  const [grammarStep, setGrammarStep] = useState<GrammarStep>("category");
  const [grammarAutoState, setGrammarAutoState] = useState<AutoState>("off");
  const [grammarShowFurigana, setGrammarShowFurigana] = useState(true);

  const [introEn, setIntroEn] = useState(() => loadIntroHook().english);
  const [introJa, setIntroJa] = useState(() => loadIntroHook().japanese);
  const [ctaJa, setCtaJa] = useState(() => loadEndingCta().japanese);
  const [ctaEn, setCtaEn] = useState(() => loadEndingCta().english);
  const [quizPreJa, setQuizPreJa] = useState(
    () => loadQuizPreComment().japanese
  );
  const [quizPreEn, setQuizPreEn] = useState(
    () => loadQuizPreComment().english
  );
  const [quizAfterJa, setQuizAfterJa] = useState(
    () => loadQuizAfterComment().japanese
  );
  const [quizAfterEn, setQuizAfterEn] = useState(
    () => loadQuizAfterComment().english
  );
  const [hookActiveLang, setHookActiveLang] = useState<"en" | "ja" | null>(
    null
  );
  const [enHighlight, setEnHighlight] = useState<SpeechHighlight | null>(null);
  const [jaHighlight, setJaHighlight] = useState<SpeechHighlight | null>(null);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoices, setQuizChoices] = useState<string[]>([]);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState<number | null>(
    null
  );
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("asking");
  const [quizShowReading, setQuizShowReading] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAutoOn, setQuizAutoOn] = useState(false);
  const [quizDeck, setQuizDeck] = useState<VocabularyItem[]>([]);

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

  const grammarItemsRef = useRef(grammarItems);
  grammarItemsRef.current = grammarItems;
  const grammarItemIndexRef = useRef(grammarItemIndex);
  grammarItemIndexRef.current = grammarItemIndex;
  const grammarStepRef = useRef(grammarStep);
  grammarStepRef.current = grammarStep;
  const grammarAutoStateRef = useRef(grammarAutoState);
  grammarAutoStateRef.current = grammarAutoState;

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
  const quizPreJaRef = useRef(quizPreJa);
  const quizPreEnRef = useRef(quizPreEn);
  const quizAfterJaRef = useRef(quizAfterJa);
  const quizAfterEnRef = useRef(quizAfterEn);
  introEnRef.current = introEn;
  introJaRef.current = introJa;
  ctaEnRef.current = ctaEn;
  ctaJaRef.current = ctaJa;
  quizPreJaRef.current = quizPreJa;
  quizPreEnRef.current = quizPreEn;
  quizAfterJaRef.current = quizAfterJa;
  quizAfterEnRef.current = quizAfterEn;

  const quizItems =
    activeTocId === "quiz-vocab-1-10" ||
    activeTocId === "quiz-mixed" ||
    activeTocId === "quiz-final"
      ? getVocabularyByIds(
          getLessonById(QUIZ_VOCAB_LESSON)?.vocabularyIds ?? []
        )
      : [];

  const quizAutoOnRef = useRef(quizAutoOn);
  quizAutoOnRef.current = quizAutoOn;
  const quizScoreRef = useRef(quizScore);
  quizScoreRef.current = quizScore;
  const quizCorrectIndexRef = useRef(quizCorrectIndex);
  quizCorrectIndexRef.current = quizCorrectIndex;
  const quizPhaseRef = useRef(quizPhase);
  quizPhaseRef.current = quizPhase;
  const quizItemsRef = useRef(quizItems);
  quizItemsRef.current = quizItems;
  const quizDeckRef = useRef(quizDeck);
  quizDeckRef.current = quizDeck;

  const isFirst = itemIndex === 0 && stepIndex === 0;
  const isLast =
    items.length > 0 &&
    itemIndex === items.length - 1 &&
    stepIndex === STEPS.length - 1;
  const grammarIsFirst =
    grammarItemIndex === 0 && grammarStep === GRAMMAR_STEPS[0];
  const grammarIsLast =
    grammarItems.length > 0 &&
    grammarItemIndex === grammarItems.length - 1 &&
    grammarStep === GRAMMAR_STEPS[GRAMMAR_STEPS.length - 1];

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
    quizAutoRunner.abort();
    setQuizAutoOn(false);
    softStopAuto();
    grammarAutoModeRunner.abort();
    setGrammarAutoState("off");
    speechService.stop();
    clearSpeechUi();
  }

  function resetQuizQuestion(index: number, itemsList = quizDeckRef.current) {
    if (itemsList.length === 0) {
      setQuizChoices([]);
      setQuizCorrectIndex(0);
      setQuizSelectedIndex(null);
      setQuizPhase("asking");
      setQuizShowReading(false);
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, itemsList.length - 1));
    const built = buildQuizChoices(itemsList, safeIndex);
    setQuizIndex(safeIndex);
    setQuizChoices(built.choices);
    setQuizCorrectIndex(built.correctChoiceIndex);
    setQuizSelectedIndex(null);
    setQuizPhase("asking");
    setQuizShowReading(false);
  }

  /** Fresh random order of JA words for this quiz session. */
  function reshuffleQuizDeck(source = quizItemsRef.current): VocabularyItem[] {
    const deck = shuffle(source);
    setQuizDeck(deck);
    quizDeckRef.current = deck;
    return deck;
  }

  function buildQuizAutoUi() {
    return {
      setQuizIndex,
      setChoices: setQuizChoices,
      setCorrectChoiceIndex: setQuizCorrectIndex,
      setSelectedChoiceIndex: setQuizSelectedIndex,
      setPhase: setQuizPhase,
      setShowReading: setQuizShowReading,
      setShowFurigana,
      setSpeechRate,
      setSpeechLang,
      setSpeechStatus,
      setJaHighlight,
      setEnHighlight,
    };
  }

  function startQuizAuto() {
    const source = quizItemsRef.current;
    if (source.length === 0) return;
    if (quizAutoOnRef.current || quizAutoRunner.isActive()) return;

    softStopAuto();
    bilingualPlayback.abort();
    speechService.stop();
    clearSpeechUi();
    setQuizScore(0);
    quizScoreRef.current = 0;

    const deck = reshuffleQuizDeck(source);

    void (async () => {
      setQuizAutoOn(true);
      setScreen("quiz");

      // Pre quiz comment (JA → EN)
      setQuizPhase("pre");
      await playQuizPreComment();
      if (!quizAutoOnRef.current) return;

      const completed = await quizAutoRunner.start(
        deck,
        buildQuizAutoUi(),
        (state) => {
          if (state === "on") setQuizAutoOn(true);
        }
      );

      if (!completed || !quizAutoOnRef.current) {
        setQuizAutoOn(false);
        return;
      }

      // After quiz comment (JA → EN)
      setQuizPhase("after");
      setQuizAutoOn(true);
      await playQuizAfterComment();
      if (!quizAutoOnRef.current) return;

      setQuizPhase("finished");
      setQuizAutoOn(false);

      if (flowActiveRef.current) {
        advanceFlow();
      }
    })();
  }

  function stopQuizAuto() {
    quizAutoRunner.abort();
    bilingualPlayback.abort();
    setQuizAutoOn(false);
    speechService.stop();
    clearSpeechUi();
  }

  function toggleQuizAuto() {
    if (quizAutoOnRef.current || quizAutoRunner.isActive()) {
      stopQuizAuto();
      return;
    }
    startQuizAuto();
  }

  function onQuizSelectChoice(choiceIndex: number) {
    if (quizPhaseRef.current !== "asking") return;

    setQuizSelectedIndex(choiceIndex);
    setQuizPhase("revealed");
    setQuizShowReading(true);
    setShowFurigana(true);

    const correct = quizCorrectIndexRef.current;
    if (choiceIndex === correct) {
      const next = quizScoreRef.current + 1;
      quizScoreRef.current = next;
      setQuizScore(next);
    }

    if (quizAutoRunner.isActive()) {
      quizAutoRunner.notifyAnswerSelected();
    } else {
      // Manual reveal without auto: play English meaning once
      const item = quizDeckRef.current[quizIndex];
      if (item) {
        void speakPromise("en", item.meaning);
      }
    }
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
    if (grammarAutoStateRef.current === "on") {
      setGrammarAutoState("stopping");
      grammarAutoModeRunner.requestStopAfterCurrent();
    }
  }

  function buildGrammarAutoUi(): GrammarAutoModeUi {
    return {
      setItemIndex: setGrammarItemIndex,
      setStep: (step: GrammarStep) => setGrammarStep(step),
      setShowFurigana: setGrammarShowFurigana,
      setSpeechRate,
      setSpeechLang,
      setSpeechStatus,
      setHighlight,
    };
  }

  function startGrammarAutoMode(fromFlow = false) {
    const list = grammarItemsRef.current;
    if (list.length === 0) {
      if (fromFlow) advanceFlow();
      return;
    }
    const startAt = fromFlow ? 0 : grammarItemIndexRef.current;
    void grammarAutoModeRunner
      .start(list, startAt, buildGrammarAutoUi(), (state) => {
        setGrammarAutoState(state);
      })
      .then((completed) => {
        if (fromFlow && completed && flowActiveRef.current) {
          advanceFlow();
        }
      });
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
      if (grammarAutoStateRef.current !== "off") {
        grammarAutoModeRunner.abort();
        setGrammarAutoState("off");
      }
    }

    const item = getTocItem(id);
    if (!item) return;

    setActiveTocId(id);
    setItemIndex(0);
    setStepIndex(0);
    setQuizScore(0);
    quizScoreRef.current = 0;
    stopQuizAuto();
    setQuizIndex(0);
    setQuizSelectedIndex(null);
    setQuizPhase("asking");
    setQuizShowReading(false);

    switch (item.kind) {
      case "intro":
        setScreen("intro");
        break;
      case "ending":
        setScreen("ending");
        break;
      case "quiz-pre":
        setScreen("quiz-pre");
        break;
      case "quiz-after":
        setScreen("quiz-after");
        break;
      case "word":
        setLessonId(item.lessonId ?? "lesson-01");
        setScreen("lesson");
        break;
      case "grammar": {
        const gLessonId = item.lessonId ?? "grammar-lesson-01";
        setGrammarLessonId(gLessonId);
        setGrammarItemIndex(0);
        setGrammarStep("category");
        setGrammarShowFurigana(true);
        setScreen("grammar");
        if (!options?.fromFlow) {
          const gl = getGrammarLessonById(gLessonId);
          const list = gl ? getGrammarByIds(gl.grammarIds) : [];
          grammarItemsRef.current = list;
          grammarItemIndexRef.current = 0;
          startGrammarAutoMode(false);
        }
        break;
      }
      case "quiz": {
        setScreen("quiz");
        const list = getVocabularyByIds(
          getLessonById(QUIZ_VOCAB_LESSON)?.vocabularyIds ?? []
        );
        const deck = shuffle(list);
        setQuizDeck(deck);
        quizDeckRef.current = deck;
        resetQuizQuestion(0, deck);
        break;
      }
      case "glossary":
        setScreen("glossary");
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

  function toggleGrammarAutoMode() {
    const state = grammarAutoStateRef.current;
    if (state === "on") {
      setGrammarAutoState("stopping");
      grammarAutoModeRunner.requestStopAfterCurrent();
      return;
    }
    if (state === "stopping") {
      grammarAutoModeRunner.abort();
      clearSpeechUi();
      setGrammarAutoState("off");
      return;
    }
    startGrammarAutoMode(false);
  }

  function goNextStep() {
    if (screenRef.current === "grammar") {
      softStopAuto();
      speechService.stop();
      clearSpeechUi();
      const stepIdx = GRAMMAR_STEPS.indexOf(grammarStepRef.current);
      const list = grammarItemsRef.current;
      if (stepIdx < GRAMMAR_STEPS.length - 1) {
        setGrammarStep(GRAMMAR_STEPS[stepIdx + 1]!);
      } else if (grammarItemIndexRef.current < list.length - 1) {
        setGrammarItemIndex((i) => i + 1);
        // After Review, skip Category and continue at the next pattern
        setGrammarStep("pattern");
      }
      return;
    }
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
    if (screenRef.current === "grammar") {
      softStopAuto();
      speechService.stop();
      clearSpeechUi();
      const stepIdx = GRAMMAR_STEPS.indexOf(grammarStepRef.current);
      if (stepIdx > 0) {
        // From Pattern on items after the first, skip Category → previous Review
        if (
          grammarStepRef.current === "pattern" &&
          grammarItemIndexRef.current > 0
        ) {
          setGrammarItemIndex((i) => i - 1);
          setGrammarStep("review");
        } else {
          setGrammarStep(GRAMMAR_STEPS[stepIdx - 1]!);
        }
      } else if (grammarItemIndexRef.current > 0) {
        setGrammarItemIndex((i) => i - 1);
        setGrammarStep(GRAMMAR_STEPS[GRAMMAR_STEPS.length - 1]!);
      }
      return;
    }
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
    if (screenRef.current === "grammar") {
      const gItem =
        grammarItemsRef.current[grammarItemIndexRef.current] ?? null;
      const gStep = grammarStepRef.current;
      if (!gItem) return;
      const input = getGrammarJapaneseSpeechInput(gStep, gItem);
      if (!input) return;
      setSpeechLang("ja");
      setHighlight(null);
      setSpeechStatus("speaking");
      speechService.speakJapanese(
        input.text,
        {
          onStart: () => setSpeechStatus("speaking"),
          onBoundary: (h) => setHighlight(h),
          onEnd: () => clearSpeechUi(),
          onError: () => clearSpeechUi(),
        },
        speechRateRef.current,
        { reading: input.reading }
      );
      return;
    }
    const item = currentItem();
    const step = currentStep();
    if (!item || !step) return;
    const input = getJapaneseSpeechInput(step, item);
    if (!input) return;
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakJapanese(
      input.text,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => clearSpeechUi(),
        onError: () => clearSpeechUi(),
      },
      speechRateRef.current,
      { reading: input.reading }
    );
  }

  function playEnglish() {
    softStopAuto();
    if (screenRef.current === "grammar") {
      const gItem =
        grammarItemsRef.current[grammarItemIndexRef.current] ?? null;
      const gStep = grammarStepRef.current;
      if (!gItem) return;
      const text = getGrammarSpeakableEnglish(gStep, gItem);
      if (!text) return;
      setSpeechLang("en");
      setHighlight(null);
      setSpeechStatus("speaking");
      speechService.speakEnglish(
        text,
        {
          onStart: () => setSpeechStatus("speaking"),
          onBoundary: (h) => setHighlight(h),
          onEnd: () => clearSpeechUi(),
          onError: () => clearSpeechUi(),
        },
        speechRateRef.current
      );
      return;
    }
    const item = currentItem();
    const step = currentStep();
    if (!item || !step) return;
    const text = getSpeakableEnglish(step, item);
    if (!text) return;
    setSpeechLang("en");
    setHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakEnglish(
      text,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setHighlight(h),
        onEnd: () => clearSpeechUi(),
        onError: () => clearSpeechUi(),
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

  function playQuizPreComment(): Promise<void> {
    return new Promise((resolve) => {
      softStopAuto();
      void bilingualPlayback.play(
        quizPreEnRef.current,
        quizPreJaRef.current,
        "ja-en",
        bilingualUi(),
        speechRateRef.current,
        () => resolve()
      );
    });
  }

  function playQuizAfterComment(): Promise<void> {
    return new Promise((resolve) => {
      softStopAuto();
      void bilingualPlayback.play(
        quizAfterEnRef.current,
        quizAfterJaRef.current,
        "ja-en",
        bilingualUi(),
        speechRateRef.current,
        () => resolve()
      );
    });
  }

  function restartQuizPre() {
    void playQuizPreComment();
  }

  function restartQuizAfter() {
    void playQuizAfterComment();
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
      if (grammarItemsRef.current.length === 0) {
        const t = window.setTimeout(() => {
          if (!cancelled && flowActiveRef.current) advanceFlow();
        }, 1200);
        return () => {
          cancelled = true;
          window.clearTimeout(t);
        };
      }
      startGrammarAutoMode(true);
      return () => {
        cancelled = true;
      };
    }
    if (screen === "quiz") {
      if (quizItemsRef.current.length === 0) {
        const t = window.setTimeout(() => {
          if (!cancelled && flowActiveRef.current) advanceFlow();
        }, 1200);
        return () => {
          cancelled = true;
          window.clearTimeout(t);
        };
      }
      startQuizAuto();
      return () => {
        cancelled = true;
      };
    }

    return () => {
      cancelled = true;
    };
  }, [flowActive, screen, activeTocId, lessonId, items.length]);

  function speakPromise(lang: "en" | "ja", text: string): Promise<void> {
    return new Promise((resolve) => {
      setSpeechLang(lang);
      setEnHighlight(null);
      setJaHighlight(null);
      setSpeechStatus("speaking");
      if (lang === "en") {
        speechService.speakEnglish(
          text,
          {
            onStart: () => setSpeechStatus("speaking"),
            onBoundary: (h) => setEnHighlight(h),
            onEnd: () => {
              setEnHighlight(null);
              setSpeechStatus("idle");
              setSpeechLang(null);
              resolve();
            },
            onError: () => {
              setEnHighlight(null);
              setSpeechStatus("idle");
              setSpeechLang(null);
              resolve();
            },
          },
          speechRateRef.current
        );
      } else {
        speechService.speakJapanese(
          text,
          {
            onStart: () => setSpeechStatus("speaking"),
            onBoundary: (h) => setJaHighlight(h),
            onEnd: () => {
              setJaHighlight(null);
              setSpeechStatus("idle");
              setSpeechLang(null);
              resolve();
            },
            onError: () => {
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

  useEffect(() => {
    return () => {
      autoModeRunner.abort();
      grammarAutoModeRunner.abort();
      quizAutoRunner.abort();
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

      if (event.key === "q" || event.key === "Q") {
        if (event.repeat) return;
        if (screen !== "quiz") return;
        event.preventDefault();
        toggleQuizAuto();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (autoStateRef.current !== "off") {
          autoModeRunner.abort();
          setAutoState("off");
        }
        if (grammarAutoStateRef.current !== "off") {
          grammarAutoModeRunner.abort();
          setGrammarAutoState("off");
        }
        if (quizAutoOnRef.current || quizAutoRunner.isActive()) {
          stopQuizAuto();
        }
        bilingualPlayback.abort();
        speechService.stop();
        clearSpeechUi();
        return;
      }

      if (screen !== "lesson" && screen !== "grammar") return;

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
          if (screen === "grammar") {
            setGrammarShowFurigana((v) => !v);
          } else {
            setShowFurigana((v) => !v);
          }
          break;
        case "a":
        case "A":
          if (event.repeat) break;
          event.preventDefault();
          if (screen === "grammar") {
            toggleGrammarAutoMode();
          } else {
            toggleAutoMode();
          }
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
  const gItemForControls =
    grammarItems[grammarItemIndex] ?? grammarItems[0] ?? null;
  const canJa =
    screen === "grammar"
      ? !!gItemForControls &&
        !!getGrammarSpeakableJapanese(grammarStep, gItemForControls)
      : item
        ? !!getSpeakableJapanese(step, item)
        : false;
  const canEn =
    screen === "grammar"
      ? !!gItemForControls &&
        !!getGrammarSpeakableEnglish(grammarStep, gItemForControls)
      : item
        ? !!getSpeakableEnglish(step, item)
        : false;
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
      case "glossary":
        return <GlossaryView />;
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
      case "quiz-pre":
        return (
          <EndingCtaDisplay
            chip="Pre Quiz"
            japanese={quizPreJa}
            english={quizPreEn}
            activeLang={hookActiveLang}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
          />
        );
      case "quiz-after":
        return (
          <EndingCtaDisplay
            chip="After Quiz"
            japanese={quizAfterJa}
            english={quizAfterEn}
            activeLang={hookActiveLang}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
          />
        );
      case "grammar": {
        const gItem = grammarItems[grammarItemIndex] ?? grammarItems[0] ?? null;
        if (!gItem) {
          return (
            <SectionPlaceholder
              chip="Grammar"
              title={tocItem?.label ?? "Grammar Lesson"}
              subtitle="Grammar lesson content will appear here once data is added."
            />
          );
        }
        switch (grammarStep) {
          case "category":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarCategoryCard item={gItem} />
              </>
            );
          case "pattern":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarPatternCard
                  item={gItem}
                  showFurigana={grammarShowFurigana}
                  jaHighlight={jaLessonHighlight}
                  enHighlight={enLessonHighlight}
                />
              </>
            );
          case "formation":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarFormationCard item={gItem} />
              </>
            );
          case "sentence":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarSentenceCard
                  item={gItem}
                  showFurigana={grammarShowFurigana}
                  jaHighlight={jaLessonHighlight}
                  enHighlight={enLessonHighlight}
                />
              </>
            );
          case "shadowing":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarShadowingCard
                  item={gItem}
                  phase="repeat"
                  showFurigana={grammarShowFurigana}
                  highlight={jaLessonHighlight}
                />
              </>
            );
          case "review":
            return (
              <>
                <GrammarProgressIndicator
                  current={grammarItemIndex}
                  total={grammarItems.length}
                  step={grammarStep}
                />
                <GrammarReviewCard
                  item={gItem}
                  jaHighlight={jaLessonHighlight}
                  enHighlight={enLessonHighlight}
                />
              </>
            );
        }
      }
      case "quiz":
        return (
          <QuizCard
            title={tocItem?.label ?? "Quiz"}
            item={quizDeck[quizIndex] ?? null}
            index={quizIndex}
            total={Math.max(quizDeck.length || quizItems.length, 1)}
            choices={quizChoices}
            correctChoiceIndex={quizCorrectIndex}
            selectedChoiceIndex={quizSelectedIndex}
            phase={quizPhase}
            showReading={quizShowReading}
            score={quizScore}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
            onSelectChoice={onQuizSelectChoice}
            preJapanese={quizPreJa}
            preEnglish={quizPreEn}
            afterJapanese={quizAfterJa}
            afterEnglish={quizAfterEn}
            commentActiveLang={hookActiveLang}
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

  const hintAutoState =
    screen === "grammar"
      ? grammarAutoState
      : screen === "lesson"
        ? autoState
        : "off";

  const speechHint =
    flowActive
      ? `Video flow ${flowPos + 1}/${flowQueue.length} · controls stay live`
      : quizAutoOn
        ? "QUIZ AUTO ON · Q to stop"
        : screen === "quiz"
          ? "QUIZ AUTO OFF · Q to start · click a choice to answer"
      : hintAutoState === "on"
        ? "Auto ON · A to stop after current audio"
        : hintAutoState === "stopping"
          ? "Auto stopping after audio…"
          : speechStatus === "speaking" && speechLang === "ja"
            ? "JP Nanami… (Esc stop)"
            : speechStatus === "speaking" && speechLang === "en"
              ? "EN Andrew… (Esc stop)"
              : screen === "lesson" || screen === "grammar"
                ? `← → navigate · ↑ JP · ↓ EN · Shift rate · Ctrl あ · A Auto`
                : "TOC · Intro · Lessons · Quizzes · Ending CTA";

  const activeAutoState =
    screen === "grammar" ? grammarAutoState : autoState;

  const autoLabel =
    activeAutoState === "on"
      ? "Auto ON"
      : activeAutoState === "stopping"
        ? "Auto…"
        : "Auto OFF";

  const autoClass =
    activeAutoState === "on"
      ? "auto-btn auto-btn--active"
      : activeAutoState === "stopping"
        ? "auto-btn auto-btn--stopping"
        : "auto-btn";

  const showLessonChrome =
    (screen === "lesson" && items.length > 0) ||
    (screen === "grammar" && grammarItems.length > 0);
  const chromeIsFirst = screen === "grammar" ? grammarIsFirst : isFirst;
  const chromeIsLast = screen === "grammar" ? grammarIsLast : isLast;
  const chromeShowFurigana =
    screen === "grammar" ? grammarShowFurigana : showFurigana;
  const showBackToToc = screen !== "toc" && screen !== "flow-setup";

  const showProductionPanel =
    screen === "intro" ||
    screen === "ending" ||
    screen === "quiz-pre" ||
    screen === "quiz-after" ||
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

      {screen === "quiz-pre" ? (
        <div className="production-panel">
          <div className="production-panel-title">Pre Quiz Comment</div>
          <div className="production-fields">
            <label className="production-field">
              <span>Japanese</span>
              <textarea
                rows={2}
                value={quizPreJa}
                onChange={(e) => setQuizPreJa(e.target.value)}
              />
            </label>
            <label className="production-field">
              <span>English</span>
              <textarea
                rows={2}
                value={quizPreEn}
                onChange={(e) => setQuizPreEn(e.target.value)}
              />
            </label>
          </div>
          <div className="production-actions">
            <button
              type="button"
              onClick={() => {
                saveQuizPreComment({
                  japanese: quizPreJa,
                  english: quizPreEn,
                });
              }}
            >
              Save Comment
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const next = resetQuizPreComment();
                setQuizPreJa(next.japanese);
                setQuizPreEn(next.english);
              }}
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={() => {
                void playQuizPreComment();
              }}
            >
              Play
            </button>
            <button type="button" className="btn-secondary" onClick={pauseHookPlayback}>
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn-secondary" onClick={restartQuizPre}>
              Restart
            </button>
            <button
              type="button"
              onClick={() => {
                bilingualPlayback.abort();
                speechService.stop();
                clearSpeechUi();
                openTocItem("quiz-vocab-1-10");
              }}
            >
              Next Section
            </button>
          </div>
        </div>
      ) : null}

      {screen === "quiz-after" ? (
        <div className="production-panel">
          <div className="production-panel-title">After Quiz Comment</div>
          <div className="production-fields">
            <label className="production-field">
              <span>Japanese</span>
              <textarea
                rows={2}
                value={quizAfterJa}
                onChange={(e) => setQuizAfterJa(e.target.value)}
              />
            </label>
            <label className="production-field">
              <span>English</span>
              <textarea
                rows={2}
                value={quizAfterEn}
                onChange={(e) => setQuizAfterEn(e.target.value)}
              />
            </label>
          </div>
          <div className="production-actions">
            <button
              type="button"
              onClick={() => {
                saveQuizAfterComment({
                  japanese: quizAfterJa,
                  english: quizAfterEn,
                });
              }}
            >
              Save Comment
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const next = resetQuizAfterComment();
                setQuizAfterJa(next.japanese);
                setQuizAfterEn(next.english);
              }}
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={() => {
                void playQuizAfterComment();
              }}
            >
              Play
            </button>
            <button type="button" className="btn-secondary" onClick={pauseHookPlayback}>
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn-secondary" onClick={restartQuizAfter}>
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
              className={
                quizAutoOn
                  ? "quiz-auto-btn quiz-auto-btn--active"
                  : "quiz-auto-btn"
              }
              onClick={toggleQuizAuto}
              title="Toggle Quiz Auto (Q)"
            >
              {quizAutoOn ? "QUIZ AUTO ON" : "QUIZ AUTO OFF"}
            </button>
            <button
              type="button"
              disabled={quizIndex === 0 || quizAutoOn}
              onClick={() => {
                stopQuizAuto();
                speechService.stop();
                clearSpeechUi();
                resetQuizQuestion(quizIndex - 1);
              }}
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={
                quizIndex >= (quizDeck.length || quizItems.length) - 1 ||
                quizAutoOn ||
                quizPhase === "finished"
              }
              onClick={() => {
                stopQuizAuto();
                speechService.stop();
                clearSpeechUi();
                resetQuizQuestion(quizIndex + 1);
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
          : screen === "grammar" && grammarItems.length > 0
            ? `Step ${GRAMMAR_STEPS.indexOf(grammarStep) + 1} of ${GRAMMAR_STEPS.length} — ${grammarStep}`
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
            <button onClick={goPrevStep} disabled={chromeIsFirst} tabIndex={-1}>
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
              className={
                chromeShowFurigana ? "furi-btn furi-btn--active" : "furi-btn"
              }
              tabIndex={-1}
              title="Toggle hiragana readings (Ctrl)"
              onClick={() => {
                if (screen === "grammar") {
                  setGrammarShowFurigana((v) => !v);
                } else {
                  setShowFurigana((v) => !v);
                }
              }}
            >
              あ {chromeShowFurigana ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              className={autoClass}
              tabIndex={-1}
              title="Toggle Auto Mode (A) — stops after current audio"
              onClick={() => {
                if (screen === "grammar") {
                  toggleGrammarAutoMode();
                } else {
                  toggleAutoMode();
                }
              }}
            >
              {autoLabel}
            </button>
            <button onClick={goNextStep} disabled={chromeIsLast} tabIndex={-1}>
              Forward →
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}
