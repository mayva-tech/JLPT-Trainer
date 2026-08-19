import { useState, useEffect, useRef } from "react";
import { getLessonById } from "../data/lessons";
import { getVocabularyByIds } from "../data/vocabulary";
import { getGrammarItemsForLesson, getGrammarLessonById } from "../data/grammar";
import type { GrammarItem } from "../types/grammar";
import {
  findTocItemByLessonId,
  getOnomatopoeiaLevelForToc,
  getRegisterSectionIdForToc,
  getTocItem,
  type TocItemId,
} from "../data/toc";
import type { RegisterPair } from "../types/register";
import { getRegisterPairsForSection } from "../data/registerPairs";
import { getOnomatopoeiaForLevel } from "../data/onomatopoeia";
import type { OnomatopoeiaItem, OnomatopoeiaJlptLevel } from "../types/onomatopoeia";
import { grammarBatchCategorySuffix, grammarBatchRangeLabel } from "../data/tocGrammarItems";
import type { StepName } from "../types/player";
import { CategoryCard } from "../components/CategoryCard";
import { WordCard } from "../components/WordCard";
import { PhraseCard } from "../components/PhraseCard";
import { SentenceCard } from "../components/SentenceCard";
import { ShadowingCard } from "../components/ShadowingCard";
import { ReviewCard } from "../components/ReviewCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { VocabularyRangeLabel } from "../components/VocabularyRangeLabel";
import { TableOfContents } from "../components/TableOfContents";
import { IntroHookDisplay } from "../components/IntroHookDisplay";
import { EndingCtaDisplay } from "../components/EndingCtaDisplay";
import { InterviewPracticeDisplay } from "../components/InterviewPracticeDisplay";
import { SectionPlaceholder } from "../components/SectionPlaceholder";
import {
  RegisterSplitCard,
  type RegisterPlayPart,
  type RegisterSideName,
} from "../components/RegisterSplitCard";
import {
  OnomatopoeiaCard,
  type OnomatopoeiaPart,
} from "../components/OnomatopoeiaCard";
import { buildOnoPlaySteps } from "../utils/onomatopoeiaPlayback";
import { splitNuanceForSpeech } from "../utils/nuanceSpeech";
import { QuizCard } from "../components/QuizCard";
import { GrammarCategoryCard } from "../components/GrammarCategoryCard";
import { GrammarPatternCard } from "../components/GrammarPatternCard";
import { GrammarFormationCard } from "../components/GrammarFormationCard";
import { GrammarSentenceCard } from "../components/GrammarSentenceCard";
import { GrammarShadowingCard } from "../components/GrammarShadowingCard";
import { GrammarReviewCard } from "../components/GrammarReviewCard";
import { GrammarProgressIndicator } from "../components/GrammarProgressIndicator";
import {
  GlossaryView,
  type GlossaryNavigateTarget,
} from "../components/GlossaryView";
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
  SPEECH_RATE_INTERVIEW_EN,
  SPEECH_RATE_INTERVIEW_MIX,
  type SpeechHighlight,
} from "../services/speechService";
import { autoModeTiming } from "../config/autoModeTiming";
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
  loadInterviewSection,
  loadQuizAfterComment,
  loadQuizPreComment,
  resetEndingCta,
  resetIntroHook,
  resetInterviewSection,
  resetQuizAfterComment,
  resetQuizPreComment,
  saveEndingCta,
  saveIntroHook,
  saveInterviewSection,
  saveQuizAfterComment,
  saveQuizPreComment,
} from "../services/introCtaStorage";
import {
  getInterviewSectionById,
  interviewPrepSections,
  interviewTitleChip,
  interviewTitleSpeakEn,
  interviewTitleSpeakJa,
  type InterviewLine,
} from "../data/interviewPrep";
import {
  getInterviewMixSectionById,
  interviewMixSections,
  interviewMixTitleChip,
  interviewMixTitleSpeakJa,
  type InterviewMixLine,
} from "../data/interviewPrepMix";
import {
  quizAutoRunner,
  type QuizPhase,
} from "../services/quizAutoRunner";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import { getVocabularyLessonIdForQuiz } from "../utils/quizVocabLesson";
import { getGrammarLessonIdForQuiz } from "../utils/quizGrammarLesson";
import { getQuizExample } from "../utils/quizPresentation";
import {
  buildGrammarQuizQuestions,
  buildVocabularyQuizQuestions,
  getVocabularyItemsForQuiz,
  seededShuffle,
} from "../utils/vocabularyQuiz";

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
  | "interview"
  | "interview-mix"
  | "register"
  | "onomatopoeia"
  | "flow-setup";
type SpeechUiStatus = "idle" | "speaking" | "paused";

/** Build quiz questions for a TOC id (vocab or grammar). Choices are embedded. */
function buildQuizQuestions(
  quizTocId: TocItemId | null
): VocabularyQuizQuestion[] {
  const vocabLessonId = getVocabularyLessonIdForQuiz(quizTocId);
  if (vocabLessonId) {
    const lesson = getLessonById(vocabLessonId);
    if (!lesson) return [];
    const quizLevel = vocabLessonId.startsWith("n1-") ? "N1" : "N2";
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel });
    return buildVocabularyQuizQuestions(items, quizTocId ?? vocabLessonId);
  }
  // Mixed / final still use lesson 1 until a dedicated pool exists.
  if (quizTocId === "quiz-mixed" || quizTocId === "quiz-final") {
    const lesson = getLessonById("lesson-01");
    if (!lesson) return [];
    const items = getVocabularyItemsForQuiz({ lesson, quizLevel: "N2" });
    return buildVocabularyQuizQuestions(items, quizTocId);
  }
  const grammarLessonId = getGrammarLessonIdForQuiz(quizTocId);
  if (grammarLessonId) {
    const grammarLesson = getGrammarLessonById(grammarLessonId);
    const grammarItems = grammarLesson
      ? getGrammarItemsForLesson(grammarLesson)
      : [];
    return buildGrammarQuizQuestions(
      grammarItems,
      quizTocId ?? grammarLessonId
    );
  }
  return [];
}

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

  const [registerSectionId, setRegisterSectionId] = useState("register-01");
  const registerPairs = getRegisterPairsForSection(registerSectionId);
  const [registerIndex, setRegisterIndex] = useState(0);
  const [registerActiveSide, setRegisterActiveSide] =
    useState<RegisterPlayPart | null>(null);
  const [registerShowFurigana, setRegisterShowFurigana] = useState(true);
  const [registerDrillMode, setRegisterDrillMode] = useState(false);
  const [registerRevealed, setRegisterRevealed] = useState(false);
  const [registerPlayingAll, setRegisterPlayingAll] = useState(false);
  const [registerPlayingSection, setRegisterPlayingSection] = useState(false);
  const registerPlaySessionRef = useRef(0);
  const registerGapTimerRef = useRef<number | null>(null);

  const [onoLevel, setOnoLevel] = useState<OnomatopoeiaJlptLevel>("N5");
  const onoItems = getOnomatopoeiaForLevel(onoLevel);
  const [onoIndex, setOnoIndex] = useState(0);
  const [onoActivePart, setOnoActivePart] = useState<OnomatopoeiaPart | null>(
    null
  );
  const [onoShowFurigana, setOnoShowFurigana] = useState(true);
  const [onoPlayingAll, setOnoPlayingAll] = useState(false);
  const [onoPlayingLevel, setOnoPlayingLevel] = useState(false);
  const onoPlayLevelSessionRef = useRef(0);
  const onoGapTimerRef = useRef<number | null>(null);

  const [grammarLessonId, setGrammarLessonId] = useState("grammar-batch-001-010");
  const grammarLesson = getGrammarLessonById(grammarLessonId);
  const grammarItems: GrammarItem[] = grammarLesson
    ? getGrammarItemsForLesson(grammarLesson)
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
  const [interviewSectionId, setInterviewSectionId] = useState(
    () => interviewPrepSections[0]!.id
  );
  const [interviewLines, setInterviewLines] = useState<InterviewLine[]>(() => {
    const id = interviewPrepSections[0]!.id;
    return loadInterviewSection(id)?.lines ?? interviewPrepSections[0]!.lines;
  });
  const [interviewEn, setInterviewEn] = useState(() => {
    const id = interviewPrepSections[0]!.id;
    return loadInterviewSection(id)?.english ?? interviewPrepSections[0]!.english;
  });
  const [interviewAnnouncingTitle, setInterviewAnnouncingTitle] =
    useState(false);
  const [interviewPlayAll, setInterviewPlayAll] = useState(false);
  const interviewPlayAllSessionRef = useRef(0);
  const [mixSectionId, setMixSectionId] = useState(
    () => interviewMixSections[0]!.id
  );
  const [mixLines, setMixLines] = useState<InterviewMixLine[]>(
    () => interviewMixSections[0]!.lines
  );
  const [mixAnnouncingTitle, setMixAnnouncingTitle] = useState(false);
  const [mixPlayAll, setMixPlayAll] = useState(false);
  const mixPlayAllSessionRef = useRef(0);
  const [hookActiveLang, setHookActiveLang] = useState<"en" | "ja" | null>(
    null
  );
  const [enHighlight, setEnHighlight] = useState<SpeechHighlight | null>(null);
  const [jaHighlight, setJaHighlight] = useState<SpeechHighlight | null>(null);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState<number | null>(
    null
  );
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("asking");
  const [quizShowReading, setQuizShowReading] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAutoOn, setQuizAutoOn] = useState(false);
  const [quizDeck, setQuizDeck] = useState<VocabularyQuizQuestion[]>([]);

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
  const interviewLinesRef = useRef(interviewLines);
  const interviewEnRef = useRef(interviewEn);
  const interviewSectionIdRef = useRef(interviewSectionId);
  const mixLinesRef = useRef(mixLines);
  const mixSectionIdRef = useRef(mixSectionId);
  introEnRef.current = introEn;
  introJaRef.current = introJa;
  ctaEnRef.current = ctaEn;
  ctaJaRef.current = ctaJa;
  quizPreJaRef.current = quizPreJa;
  quizPreEnRef.current = quizPreEn;
  quizAfterJaRef.current = quizAfterJa;
  quizAfterEnRef.current = quizAfterEn;
  interviewLinesRef.current = interviewLines;
  interviewEnRef.current = interviewEn;
  interviewSectionIdRef.current = interviewSectionId;
  mixLinesRef.current = mixLines;
  mixSectionIdRef.current = mixSectionId;

  const quizItems: VocabularyQuizQuestion[] = buildQuizQuestions(activeTocId);

  const quizAutoOnRef = useRef(quizAutoOn);
  quizAutoOnRef.current = quizAutoOn;
  const quizScoreRef = useRef(quizScore);
  quizScoreRef.current = quizScore;
  const quizPhaseRef = useRef(quizPhase);
  quizPhaseRef.current = quizPhase;
  const quizItemsRef = useRef(quizItems);
  quizItemsRef.current = quizItems;
  const quizDeckRef = useRef(quizDeck);
  quizDeckRef.current = quizDeck;
  const quizIndexRef = useRef(quizIndex);
  quizIndexRef.current = quizIndex;

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

  function stopInterviewPlayAll() {
    interviewPlayAllSessionRef.current += 1;
    setInterviewPlayAll(false);
    setInterviewAnnouncingTitle(false);
    mixPlayAllSessionRef.current += 1;
    setMixPlayAll(false);
    setMixAnnouncingTitle(false);
  }

  function clearSpeechUi() {
    setSpeechStatus("idle");
    setSpeechLang(null);
    setHighlight(null);
    setHookActiveLang(null);
    setEnHighlight(null);
    setJaHighlight(null);
    setInterviewAnnouncingTitle(false);
    setMixAnnouncingTitle(false);
  }

  function stopAllAudio() {
    stopInterviewPlayAll();
    bilingualPlayback.abort();
    quizAutoRunner.abort();
    setQuizAutoOn(false);
    softStopAuto();
    grammarAutoModeRunner.abort();
    setGrammarAutoState("off");
    stopOnoAuto();
    stopRegisterAuto();
    speechService.stop();
    clearSpeechUi();
  }

  function resetQuizQuestion(index: number, itemsList = quizDeckRef.current) {
    if (itemsList.length === 0) {
      setQuizSelectedIndex(null);
      setQuizPhase("asking");
      setQuizShowReading(false);
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, itemsList.length - 1));
    setQuizIndex(safeIndex);
    setQuizSelectedIndex(null);
    setQuizPhase("asking");
    setQuizShowReading(false);
  }

  /**
   * Manual ←/→ browse: show the word/pattern with reading, correct meaning,
   * and example sentence (when present) for every quiz item.
   */
  function showQuizReview(index: number, itemsList = quizDeckRef.current) {
    if (itemsList.length === 0) {
      resetQuizQuestion(0, itemsList);
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, itemsList.length - 1));
    const question = itemsList[safeIndex]!;
    setQuizIndex(safeIndex);
    setQuizSelectedIndex(question.correctChoiceIndex);
    setQuizPhase("review");
    setQuizShowReading(true);
    setShowFurigana(true);
  }

  /** Fresh order of quiz items for this quiz session (deterministic). */
  function reshuffleQuizDeck(
    source = quizItemsRef.current,
    quizTocId: TocItemId | null = activeTocId
  ): VocabularyQuizQuestion[] {
    const deck = quizTocId
      ? seededShuffle(source, quizTocId)
      : [...source];
    setQuizDeck(deck);
    quizDeckRef.current = deck;
    return deck;
  }

  function buildQuizAutoUi() {
    return {
      setQuizIndex,
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

    const deck = reshuffleQuizDeck(source, activeTocId);

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

  /** Leave auto / comment screens and show a real quiz question for manual control. */
  function enterManualQuiz(index = quizIndex) {
    stopQuizAuto();
    const deck =
      quizDeckRef.current.length > 0
        ? quizDeckRef.current
        : reshuffleQuizDeck(quizItemsRef.current);
    if (deck.length === 0) return;
    resetQuizQuestion(index, deck);
  }

  function goQuizPrev() {
    if (quizAutoOnRef.current || quizAutoRunner.isActive()) {
      stopQuizAuto();
    }
    speechService.stop();
    clearSpeechUi();

    if (quizPhaseRef.current === "pre") {
      // Still on pre-comment — start at question 0 (unanswered)
      enterManualQuiz(0);
      return;
    }
    if (quizPhaseRef.current === "after" || quizPhaseRef.current === "finished") {
      const last = Math.max(0, (quizDeckRef.current.length || 1) - 1);
      const deck =
        quizDeckRef.current.length > 0
          ? quizDeckRef.current
          : reshuffleQuizDeck(quizItemsRef.current);
      if (deck.length === 0) return;
      showQuizReview(last, deck);
      return;
    }
    if (quizIndex <= 0) return;
    showQuizReview(quizIndex - 1);
  }

  function goQuizNext() {
    if (quizAutoOnRef.current || quizAutoRunner.isActive()) {
      stopQuizAuto();
    }
    speechService.stop();
    clearSpeechUi();

    if (quizPhaseRef.current === "pre") {
      enterManualQuiz(0);
      return;
    }
    if (quizPhaseRef.current === "after") {
      setQuizPhase("finished");
      return;
    }
    if (quizPhaseRef.current === "finished") return;

    const total = quizDeckRef.current.length || quizItemsRef.current.length;
    if (quizIndex >= total - 1) {
      setQuizPhase("finished");
      return;
    }
    showQuizReview(quizIndex + 1);
  }

  function toggleQuizAuto() {
    if (quizAutoOnRef.current || quizAutoRunner.isActive()) {
      // Stopping mid-pre/after leaves a usable manual quiz, not a stuck comment screen.
      const phase = quizPhaseRef.current;
      stopQuizAuto();
      if (phase === "pre") {
        enterManualQuiz(0);
      } else if (phase === "after") {
        setQuizPhase("finished");
      } else if (phase === "example") {
        setQuizPhase("revealed");
      }
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

    const question = quizDeckRef.current[quizIndexRef.current];
    const correct = question?.correctChoiceIndex ?? -1;
    if (choiceIndex === correct) {
      const next = quizScoreRef.current + 1;
      quizScoreRef.current = next;
      setQuizScore(next);
    }

    if (quizAutoRunner.isActive()) {
      quizAutoRunner.notifyAnswerSelected();
    } else {
      // Manual reveal without auto: speak the correct meaning, then — if
      // this item has one — the example sentence and its meaning. Mirrors
      // the auto-quiz reveal sequence exactly (see playRevealSequence).
      if (question) {
        void quizAutoRunner.playManualReveal(question, buildQuizAutoUi());
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

  function openTocItem(
    id: TocItemId,
    options?: {
      fromFlow?: boolean;
      /** Jump to this item within the lesson (glossary / deep link). */
      focusIndex?: number;
      /** Vocabulary step to show (default: start of lesson). */
      focusStep?: StepName;
      /** Grammar step to show (default: category / auto). */
      focusGrammarStep?: GrammarStep;
      /** Skip starting grammar auto mode (glossary deep links). */
      skipAuto?: boolean;
    }
  ) {
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
      case "interview": {
        const sectionId =
          item.interviewSectionId ?? interviewPrepSections[0]!.id;
        const section =
          getInterviewSectionById(sectionId) ?? interviewPrepSections[0]!;
        const copy = loadInterviewSection(section.id);
        setInterviewSectionId(section.id);
        setInterviewLines(copy?.lines ?? section.lines);
        setInterviewEn(copy?.english ?? section.english);
        setInterviewAnnouncingTitle(false);
        setScreen("interview");
        break;
      }
      case "interview-mix": {
        const sectionId =
          item.interviewSectionId ?? interviewMixSections[0]!.id;
        const section =
          getInterviewMixSectionById(sectionId) ?? interviewMixSections[0]!;
        setMixSectionId(section.id);
        setMixLines(section.lines);
        setMixAnnouncingTitle(false);
        setScreen("interview-mix");
        break;
      }
      case "quiz-pre":
        setScreen("quiz-pre");
        break;
      case "quiz-after":
        setScreen("quiz-after");
        break;
      case "word": {
        setLessonId(item.lessonId ?? "lesson-01");
        setScreen("lesson");
        const focusIndex = options?.focusIndex;
        if (typeof focusIndex === "number" && focusIndex >= 0) {
          setItemIndex(focusIndex);
          const stepName = options?.focusStep ?? "word";
          const stepIdx = STEPS.indexOf(stepName);
          setStepIndex(stepIdx >= 0 ? stepIdx : 1);
        }
        break;
      }
      case "grammar": {
        const gLessonId = item.lessonId ?? "grammar-batch-001-010";
        setGrammarLessonId(gLessonId);
        const gl = getGrammarLessonById(gLessonId);
        const list = gl ? getGrammarItemsForLesson(gl) : [];
        grammarItemsRef.current = list;
        const focusIndex =
          typeof options?.focusIndex === "number" && options.focusIndex >= 0
            ? Math.min(options.focusIndex, Math.max(0, list.length - 1))
            : 0;
        setGrammarItemIndex(focusIndex);
        grammarItemIndexRef.current = focusIndex;
        const gStep = options?.focusGrammarStep ?? "category";
        setGrammarStep(gStep);
        setGrammarShowFurigana(true);
        setScreen("grammar");
        if (!options?.fromFlow && !options?.skipAuto) {
          startGrammarAutoMode(false);
        }
        break;
      }
      case "quiz": {
        setShowFurigana(true);
        setQuizAutoOn(false);
        setQuizSelectedIndex(null);
        setQuizPhase("asking");
        setQuizShowReading(false);
        setQuizIndex(0);
        setScreen("quiz");
        const list = buildQuizQuestions(id);
        const deck = reshuffleQuizDeck(list, id);
        quizItemsRef.current = list;
        resetQuizQuestion(0, deck);
        break;
      }
      case "glossary":
        setScreen("glossary");
        break;
      case "register": {
        const sectionId =
          item.registerSectionId ??
          getRegisterSectionIdForToc(id) ??
          "register-01";
        setRegisterSectionId(sectionId);
        setRegisterIndex(0);
        setRegisterActiveSide(null);
        setRegisterRevealed(false);
        setRegisterPlayingAll(false);
        setRegisterPlayingSection(false);
        registerPlaySessionRef.current += 1;
        setScreen("register");
        break;
      }
      case "onomatopoeia": {
        const level =
          item.onomatopoeiaLevel ??
          getOnomatopoeiaLevelForToc(id) ??
          "N5";
        setOnoLevel(level);
        setOnoIndex(0);
        setOnoActivePart(null);
        setOnoShowFurigana(true);
        setOnoPlayingAll(false);
        setOnoPlayingLevel(false);
        onoPlayLevelSessionRef.current += 1;
        setScreen("onomatopoeia");
        break;
      }
    }
  }

  function openGlossaryEntry(target: GlossaryNavigateTarget) {
    const toc = findTocItemByLessonId(target.lessonId);
    if (!toc) return;

    if (target.kind === "word") {
      const lesson = getLessonById(target.lessonId);
      const idx = lesson?.vocabularyIds.indexOf(target.vocabularyId) ?? -1;
      if (idx < 0) return;
      openTocItem(toc.id, {
        focusIndex: idx,
        focusStep: "word",
        skipAuto: true,
      });
      return;
    }

    const gl = getGrammarLessonById(target.lessonId);
    const list = gl ? getGrammarItemsForLesson(gl) : [];
    const idx = list.findIndex((g) => g.id === target.grammarId);
    if (idx < 0) return;
    openTocItem(toc.id, {
      focusIndex: idx,
      focusGrammarStep: "pattern",
      skipAuto: true,
    });
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

  /** Speak one side of the current register pair with karaoke highlighting. */
  function playRegisterSide(side: RegisterSideName) {
    const pair = registerPairs[registerIndex] ?? null;
    if (!pair) return;
    if (side === "formal" && registerDrillMode && !registerRevealed) {
      setRegisterRevealed(true);
    }
    const source = side === "casual" ? pair.casual : pair.formal;
    if (!source.text.trim()) return;
    speechService.stop();
    stopRegisterAuto();
    setRegisterActiveSide(side);
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
          setRegisterActiveSide(null);
        },
        onError: () => {
          clearSpeechUi();
          setRegisterActiveSide(null);
        },
      },
      speechRateRef.current,
      { reading: source.reading }
    );
  }

  /** Casual then formal back to back — the core contrast drill. */
  function playRegisterBoth() {
    const pair = registerPairs[registerIndex] ?? null;
    if (!pair) return;
    if (registerDrillMode && !registerRevealed) setRegisterRevealed(true);
    speechService.stop();
    stopRegisterAuto();
    setRegisterActiveSide("casual");
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
          setRegisterActiveSide("formal");
          speechService.speakJapanese(
            pair.formal.text,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: () => {
                clearSpeechUi();
                setRegisterActiveSide(null);
              },
              onError: () => {
                clearSpeechUi();
                setRegisterActiveSide(null);
              },
            },
            speechRateRef.current,
            { reading: pair.formal.reading }
          );
        },
        onError: () => {
          clearSpeechUi();
          setRegisterActiveSide(null);
        },
      },
      speechRateRef.current,
      { reading: pair.casual.reading }
    );
  }

  function stopRegisterAuto() {
    registerPlaySessionRef.current += 1;
    if (registerGapTimerRef.current != null) {
      window.clearTimeout(registerGapTimerRef.current);
      registerGapTimerRef.current = null;
    }
    setRegisterPlayingAll(false);
    setRegisterPlayingSection(false);
    setRegisterActiveSide(null);
  }

  function playRegisterPairSequence(
    pair: RegisterPair,
    session: number,
    onComplete: () => void
  ) {
    const alive = () => session === registerPlaySessionRef.current;
    const finish = () => {
      if (!alive()) return;
      onComplete();
    };

    const speakJa = (side: RegisterSideName, onEnd: () => void) => {
      if (!alive()) return;
      const source = side === "casual" ? pair.casual : pair.formal;
      if (!source.text.trim()) {
        onEnd();
        return;
      }
      setHighlight(null);
      setRegisterActiveSide(side);
      setSpeechLang("ja");
      speechService.speakJapanese(
        source.text,
        {
          onStart: () => {
            if (alive()) setSpeechStatus("speaking");
          },
          onBoundary: (h) => {
            if (alive()) setHighlight(h);
          },
          onEnd,
          onError: finish,
        },
        speechRateRef.current,
        { reading: source.reading }
      );
    };

    const speakMeaning = (onEnd: () => void) => {
      if (!alive()) return;
      if (!pair.meaning.trim()) {
        onEnd();
        return;
      }
      setHighlight(null);
      setRegisterActiveSide("meaning");
      setSpeechLang("en");
      speechService.speakEnglish(
        pair.meaning,
        {
          onBoundary: (h) => {
            if (alive()) setHighlight(h);
          },
          onEnd,
          onError: finish,
        },
        speechRateRef.current
      );
    };

    const speakNote = (onEnd: () => void) => {
      if (!alive()) return;
      const note = pair.note?.trim() ?? "";
      if (!note) {
        onEnd();
        return;
      }
      const segments = splitNuanceForSpeech(note);
      if (segments.length === 0) {
        onEnd();
        return;
      }

      const run = (index: number) => {
        if (!alive()) return;
        const segment = segments[index];
        if (!segment) {
          onEnd();
          return;
        }
        const text = segment.text.trim();
        if (!text) {
          run(index + 1);
          return;
        }
        setHighlight(null);
        setRegisterActiveSide("note");
        setSpeechLang(segment.lang);
        const advance = () => run(index + 1);
        if (segment.lang === "ja") {
          speechService.speakJapanese(
            text,
            {
              onStart: () => {
                if (alive()) setSpeechStatus("speaking");
              },
              onBoundary: (h) => {
                if (alive()) setHighlight(h);
              },
              onEnd: advance,
              onError: finish,
            },
            speechRateRef.current
          );
        } else {
          speechService.speakEnglish(
            text,
            {
              onStart: () => {
                if (alive()) setSpeechStatus("speaking");
              },
              onBoundary: (h) => {
                if (alive()) setHighlight(h);
              },
              onEnd: advance,
              onError: finish,
            },
            speechRateRef.current
          );
        }
      };

      run(0);
    };

    speakJa("casual", () =>
      speakMeaning(() =>
        speakJa("casual", () =>
          speakJa("formal", () =>
            speakMeaning(() => speakJa("formal", () => speakNote(finish)))
          )
        )
      )
    );
  }

  function playRegisterPlay() {
    const pair = registerPairs[registerIndex] ?? null;
    if (!pair) return;
    if (registerDrillMode && !registerRevealed) setRegisterRevealed(true);
    speechService.stop();
    const session = ++registerPlaySessionRef.current;
    setRegisterPlayingSection(false);
    setRegisterPlayingAll(true);
    playRegisterPairSequence(pair, session, () => {
      if (session !== registerPlaySessionRef.current) return;
      clearSpeechUi();
      setRegisterActiveSide(null);
      setRegisterPlayingAll(false);
    });
  }

  function playRegisterSection() {
    if (registerPlayingSection) {
      speechService.stop();
      stopRegisterAuto();
      clearSpeechUi();
      return;
    }
    const pairs = registerPairs;
    if (pairs.length === 0) return;
    if (registerDrillMode) setRegisterRevealed(true);
    speechService.stop();
    const session = ++registerPlaySessionRef.current;
    setRegisterPlayingAll(false);
    setRegisterPlayingSection(true);
    setRegisterIndex(0);

    const run = (index: number) => {
      if (session !== registerPlaySessionRef.current) return;
      if (screenRef.current !== "register") {
        stopRegisterAuto();
        clearSpeechUi();
        return;
      }
      const pair = pairs[index];
      if (!pair) {
        stopRegisterAuto();
        clearSpeechUi();
        return;
      }
      setRegisterIndex(index);
      playRegisterPairSequence(pair, session, () => {
        if (session !== registerPlaySessionRef.current) return;
        const next = index + 1;
        if (next >= pairs.length) {
          stopRegisterAuto();
          clearSpeechUi();
          return;
        }
        clearSpeechUi();
        setRegisterActiveSide(null);
        registerGapTimerRef.current = window.setTimeout(() => {
          registerGapTimerRef.current = null;
          if (session !== registerPlaySessionRef.current) return;
          run(next);
        }, autoModeTiming.betweenItemsPause);
      });
    };

    run(0);
  }

  function goRegisterPrev() {
    speechService.stop();
    stopRegisterAuto();
    clearSpeechUi();
    setRegisterRevealed(false);
    setRegisterIndex((i) => Math.max(0, i - 1));
  }

  function goRegisterNext() {
    speechService.stop();
    stopRegisterAuto();
    clearSpeechUi();
    setRegisterRevealed(false);
    setRegisterIndex((i) => Math.min(registerPairs.length - 1, i + 1));
  }

  function playOnoWord() {
    const item = onoItems[onoIndex] ?? null;
    if (!item) return;
    speechService.stop();
    stopOnoAuto();
    setOnoActivePart("word");
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
          setOnoActivePart(null);
        },
        onError: () => {
          clearSpeechUi();
          setOnoActivePart(null);
        },
      },
      speechRateRef.current,
      { reading: item.reading }
    );
  }

  function playOnoEnglish() {
    const item = onoItems[onoIndex] ?? null;
    if (!item?.meaning.trim()) return;
    speechService.stop();
    stopOnoAuto();
    setOnoActivePart("meaning");
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
          setOnoActivePart("word");
          setSpeechLang("ja");
          speechService.speakJapanese(
            item.japanese,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: () => {
                clearSpeechUi();
                setOnoActivePart(null);
              },
              onError: () => {
                clearSpeechUi();
                setOnoActivePart(null);
              },
            },
            speechRateRef.current,
            { reading: item.reading }
          );
        },
        onError: () => {
          clearSpeechUi();
          setOnoActivePart(null);
        },
      },
      speechRateRef.current
    );
  }

  function playOnoExample() {
    const item = onoItems[onoIndex] ?? null;
    if (!item?.exampleJapanese.trim()) return;
    speechService.stop();
    stopOnoAuto();
    setOnoActivePart("example");
    setSpeechLang("ja");
    setHighlight(null);
    setSpeechStatus("speaking");

    const finishExample = () => {
      clearSpeechUi();
      setOnoActivePart(null);
    };

    const repeatExampleJa = () => {
      setHighlight(null);
      setOnoActivePart("example");
      setSpeechLang("ja");
      speechService.speakJapanese(
        item.exampleJapanese,
        {
          onBoundary: (h) => setHighlight(h),
          onEnd: finishExample,
          onError: finishExample,
        },
        speechRateRef.current,
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
          setOnoActivePart("exampleEn");
          setSpeechLang("en");
          speechService.speakEnglish(
            item.exampleEnglish,
            {
              onBoundary: (h) => setHighlight(h),
              onEnd: repeatExampleJa,
              onError: finishExample,
            },
            speechRateRef.current
          );
        },
        onError: finishExample,
      },
      speechRateRef.current,
      { reading: item.exampleReading }
    );
  }

  function stopOnoAuto() {
    onoPlayLevelSessionRef.current += 1;
    if (onoGapTimerRef.current != null) {
      window.clearTimeout(onoGapTimerRef.current);
      onoGapTimerRef.current = null;
    }
    setOnoPlayingAll(false);
    setOnoPlayingLevel(false);
    setOnoActivePart(null);
  }

  function playOnoCardSequence(
    item: OnomatopoeiaItem,
    session: number,
    onComplete: () => void
  ) {
    const alive = () => session === onoPlayLevelSessionRef.current;

    const finish = () => {
      if (!alive()) return;
      onComplete();
    };

    const steps = buildOnoPlaySteps(item);
    if (steps.length === 0) {
      finish();
      return;
    }

    const run = (index: number) => {
      if (!alive()) return;
      const step = steps[index];
      if (!step) {
        finish();
        return;
      }

      setHighlight(null);
      setOnoActivePart(step.part);
      setSpeechLang(step.lang);

      const advance = () => run(index + 1);
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
          speechRateRef.current,
          step.reading ? { reading: step.reading } : undefined
        );
      } else {
        speechService.speakEnglish(
          step.text,
          callbacks,
          speechRateRef.current
        );
      }
    };

    run(0);
  }

  /** Every visible line: category, word, meaning, collocation, nuance, example. */
  function playOnoAll() {
    const item = onoItems[onoIndex] ?? null;
    if (!item) return;
    speechService.stop();
    const session = ++onoPlayLevelSessionRef.current;
    setOnoPlayingLevel(false);
    setOnoPlayingAll(true);
    playOnoCardSequence(item, session, () => {
      if (session !== onoPlayLevelSessionRef.current) return;
      clearSpeechUi();
      setOnoActivePart(null);
      setOnoPlayingAll(false);
    });
  }

  /** Play every expression in the current JLPT band from the start. */
  function playOnoLevel() {
    if (onoPlayingLevel) {
      speechService.stop();
      stopOnoAuto();
      clearSpeechUi();
      return;
    }
    const items = onoItems;
    if (items.length === 0) return;
    speechService.stop();
    const session = ++onoPlayLevelSessionRef.current;
    setOnoPlayingAll(false);
    setOnoPlayingLevel(true);
    setOnoIndex(0);

    const run = (index: number) => {
      if (session !== onoPlayLevelSessionRef.current) return;
      if (screenRef.current !== "onomatopoeia") {
        stopOnoAuto();
        clearSpeechUi();
        return;
      }
      const item = items[index];
      if (!item) {
        stopOnoAuto();
        clearSpeechUi();
        return;
      }
      setOnoIndex(index);
      playOnoCardSequence(item, session, () => {
        if (session !== onoPlayLevelSessionRef.current) return;
        const next = index + 1;
        if (next >= items.length) {
          stopOnoAuto();
          clearSpeechUi();
          return;
        }
        clearSpeechUi();
        setOnoActivePart(null);
        onoGapTimerRef.current = window.setTimeout(() => {
          onoGapTimerRef.current = null;
          if (session !== onoPlayLevelSessionRef.current) return;
          run(next);
        }, autoModeTiming.betweenItemsPause);
      });
    };

    run(0);
  }

  function goOnoPrev() {
    speechService.stop();
    stopOnoAuto();
    clearSpeechUi();
    setOnoIndex((i) => Math.max(0, i - 1));
  }

  function goOnoNext() {
    speechService.stop();
    stopOnoAuto();
    clearSpeechUi();
    setOnoIndex((i) => Math.min(onoItems.length - 1, i + 1));
  }

  function playJapanese() {
    softStopAuto();
    if (screenRef.current === "quiz") {
      // Full quiz-auto owns the timeline; manual reveal may be interrupted.
      if (quizAutoOnRef.current) return;
      if (quizAutoRunner.isActive()) quizAutoRunner.abort();
      const question = quizDeckRef.current[quizIndex];
      if (!question) return;
      const phase = quizPhaseRef.current;
      if (
        phase !== "asking" &&
        phase !== "revealed" &&
        phase !== "example" &&
        phase !== "review"
      ) {
        return;
      }
      const example = getQuizExample(question);
      const useExample = phase === "example" && !!example;
      const text = useExample ? example!.text : question.item.word;
      const reading = useExample ? example!.reading : question.item.reading;
      if (!text.trim()) return;
      speechService.stop();
      setSpeechLang("ja");
      setJaHighlight(null);
      setEnHighlight(null);
      setSpeechStatus("speaking");
      speechService.speakJapanese(
        text,
        {
          onStart: () => setSpeechStatus("speaking"),
          onBoundary: (h) => setJaHighlight(h),
          onEnd: () => clearSpeechUi(),
          onError: () => clearSpeechUi(),
        },
        speechRateRef.current,
        { reading }
      );
      return;
    }
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
    if (screenRef.current === "quiz") {
      if (quizAutoOnRef.current) return;
      if (quizAutoRunner.isActive()) quizAutoRunner.abort();
      const question = quizDeckRef.current[quizIndex];
      if (!question) return;
      const phase = quizPhaseRef.current;
      let text: string | null = null;
      if (phase === "example") {
        const example = getQuizExample(question);
        text = example?.meaning?.trim()
          ? example.meaning
          : question.item.meaning;
      } else if (phase === "revealed" || phase === "review") {
        text = question.item.meaning;
      }
      // During "asking", English would spoil the answer — leave disabled.
      if (!text?.trim()) return;
      speechService.stop();
      setSpeechLang("en");
      setJaHighlight(null);
      setEnHighlight(null);
      setSpeechStatus("speaking");
      speechService.speakEnglish(
        text,
        {
          onStart: () => setSpeechStatus("speaking"),
          onBoundary: (h) => setEnHighlight(h),
          onEnd: () => clearSpeechUi(),
          onError: () => clearSpeechUi(),
        },
        speechRateRef.current
      );
      return;
    }
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

  /** Show the example sentence panel and play JA with karaoke. */
  function replayQuizExample() {
    if (quizAutoOnRef.current) return;
    if (quizAutoRunner.isActive()) quizAutoRunner.abort();
    const question = quizDeckRef.current[quizIndex];
    const example = question ? getQuizExample(question) : null;
    if (!example?.text.trim()) return;
    const phase = quizPhaseRef.current;
    if (
      phase !== "revealed" &&
      phase !== "example" &&
      phase !== "review"
    ) {
      return;
    }

    speechService.stop();
    clearSpeechUi();
    setQuizShowReading(true);
    setShowFurigana(true);
    setQuizPhase("example");
    setSpeechLang("ja");
    setJaHighlight(null);
    setEnHighlight(null);
    setSpeechStatus("speaking");
    speechService.speakJapanese(
      example.text,
      {
        onStart: () => setSpeechStatus("speaking"),
        onBoundary: (h) => setJaHighlight(h),
        onEnd: () => clearSpeechUi(),
        onError: () => clearSpeechUi(),
      },
      speechRateRef.current,
      { reading: example.reading }
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

  function playInterview() {
    softStopAuto();
    stopInterviewPlayAll();
    const idx = interviewPrepSections.findIndex(
      (s) => s.id === interviewSectionIdRef.current
    );
    void playInterviewSectionAt(idx >= 0 ? idx : 0, null);
  }

  function playInterviewAll() {
    softStopAuto();
    bilingualPlayback.abort();
    clearSpeechUi();
    const session = ++interviewPlayAllSessionRef.current;
    setInterviewPlayAll(true);

    void (async () => {
      try {
        for (let i = 0; i < interviewPrepSections.length; i += 1) {
          if (session !== interviewPlayAllSessionRef.current) return;
          const ok = await playInterviewSectionAt(i, session);
          if (!ok) return;
          if (i < interviewPrepSections.length - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 450));
          }
        }
      } finally {
        if (session === interviewPlayAllSessionRef.current) {
          setInterviewPlayAll(false);
          setInterviewAnnouncingTitle(false);
        }
      }
    })();
  }

  /** Play one interview section (title then content). Returns false if aborted. */
  async function playInterviewSectionAt(
    index: number,
    playAllSession: number | null
  ): Promise<boolean> {
    const section = interviewPrepSections[index];
    if (!section) return false;

    const stillActive = () =>
      playAllSession === null ||
      playAllSession === interviewPlayAllSessionRef.current;

    const copy =
      loadInterviewSection(section.id) ?? {
        lines: section.lines,
        english: section.english,
      };
    const tocId =
      `interview-${String(section.number).padStart(2, "0")}` as TocItemId;

    setActiveTocId(tocId);
    setInterviewSectionId(section.id);
    setInterviewLines(copy.lines);
    setInterviewEn(copy.english);
    interviewSectionIdRef.current = section.id;
    interviewLinesRef.current = copy.lines;
    interviewEnRef.current = copy.english;

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
    if (!stillActive()) return false;

    const japanese = copy.lines.map((line) => line.japanese).join("");

    setInterviewAnnouncingTitle(true);
    try {
      await bilingualPlayback.play(
        interviewTitleSpeakEn(section),
        interviewTitleSpeakJa(section),
        "ja-en",
        bilingualUi(),
        speechRateRef.current,
        undefined,
        { englishRate: SPEECH_RATE_INTERVIEW_EN }
      );
    } finally {
      if (stillActive()) setInterviewAnnouncingTitle(false);
    }
    if (!stillActive()) return false;

    await bilingualPlayback.play(
      copy.english,
      japanese,
      "ja-en",
      bilingualUi(),
      speechRateRef.current,
      undefined,
      { englishRate: SPEECH_RATE_INTERVIEW_EN }
    );
    return stillActive();
  }

  function openInterviewSectionByIndex(index: number) {
    const section = interviewPrepSections[index];
    if (!section) return;
    const tocId = `interview-${String(section.number).padStart(2, "0")}` as TocItemId;
    openTocItem(tocId);
  }

  function goInterviewPrev() {
    const idx = interviewPrepSections.findIndex(
      (s) => s.id === interviewSectionIdRef.current
    );
    if (idx <= 0) return;
    openInterviewSectionByIndex(idx - 1);
  }

  function goInterviewNext() {
    const idx = interviewPrepSections.findIndex(
      (s) => s.id === interviewSectionIdRef.current
    );
    if (idx < 0 || idx >= interviewPrepSections.length - 1) return;
    openInterviewSectionByIndex(idx + 1);
  }

  function speakJapaneseLine(
    text: string,
    rate: number,
    sessionCheck: () => boolean
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!sessionCheck() || !text.trim()) {
        resolve();
        return;
      }
      setHookActiveLang("ja");
      setJaHighlight(null);
      setSpeechStatus("speaking");
      speechService.speakJapanese(
        text,
        {
          onStart: () => {
            if (!sessionCheck()) return;
            setSpeechStatus("speaking");
          },
          onBoundary: (h) => {
            if (!sessionCheck()) return;
            setJaHighlight(h);
          },
          onEnd: () => {
            setJaHighlight(null);
            setHookActiveLang(null);
            setSpeechStatus("idle");
            resolve();
          },
          onError: () => {
            setJaHighlight(null);
            setHookActiveLang(null);
            setSpeechStatus("idle");
            resolve();
          },
        },
        rate
      );
    });
  }

  function playMix() {
    softStopAuto();
    stopInterviewPlayAll();
    const idx = interviewMixSections.findIndex(
      (s) => s.id === mixSectionIdRef.current
    );
    void playMixSectionAt(idx >= 0 ? idx : 0, null);
  }

  function playMixAll() {
    softStopAuto();
    stopInterviewPlayAll();
    bilingualPlayback.abort();
    speechService.stop();
    clearSpeechUi();
    const session = ++mixPlayAllSessionRef.current;
    setMixPlayAll(true);

    void (async () => {
      try {
        for (let i = 0; i < interviewMixSections.length; i += 1) {
          if (session !== mixPlayAllSessionRef.current) return;
          const ok = await playMixSectionAt(i, session);
          if (!ok) return;
          if (i < interviewMixSections.length - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 450));
          }
        }
      } finally {
        if (session === mixPlayAllSessionRef.current) {
          setMixPlayAll(false);
          setMixAnnouncingTitle(false);
        }
      }
    })();
  }

  async function playMixSectionAt(
    index: number,
    playAllSession: number | null
  ): Promise<boolean> {
    const section = interviewMixSections[index];
    if (!section) return false;

    const stillActive = () =>
      playAllSession === null ||
      playAllSession === mixPlayAllSessionRef.current;

    const tocId =
      `interview-mix-${String(section.number).padStart(2, "0")}` as TocItemId;

    setActiveTocId(tocId);
    setMixSectionId(section.id);
    setMixLines(section.lines);
    mixSectionIdRef.current = section.id;
    mixLinesRef.current = section.lines;

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
    if (!stillActive()) return false;

    const japanese = section.lines.map((line) => line.japanese).join("");

    setMixAnnouncingTitle(true);
    try {
      await speakJapaneseLine(
        interviewMixTitleSpeakJa(section),
        SPEECH_RATE_INTERVIEW_MIX,
        stillActive
      );
    } finally {
      if (stillActive()) setMixAnnouncingTitle(false);
    }
    if (!stillActive()) return false;

    await speakJapaneseLine(japanese, SPEECH_RATE_INTERVIEW_MIX, stillActive);
    return stillActive();
  }

  function openMixSectionByIndex(index: number) {
    const section = interviewMixSections[index];
    if (!section) return;
    const tocId =
      `interview-mix-${String(section.number).padStart(2, "0")}` as TocItemId;
    openTocItem(tocId);
  }

  function goMixPrev() {
    const idx = interviewMixSections.findIndex(
      (s) => s.id === mixSectionIdRef.current
    );
    if (idx <= 0) return;
    openMixSectionByIndex(idx - 1);
  }

  function goMixNext() {
    const idx = interviewMixSections.findIndex(
      (s) => s.id === mixSectionIdRef.current
    );
    if (idx < 0 || idx >= interviewMixSections.length - 1) return;
    openMixSectionByIndex(idx + 1);
  }

  function restartMix() {
    playMix();
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

  function restartInterview() {
    playInterview();
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

      if (screen === "quiz") {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (!quizAutoOnRef.current) goQuizPrev();
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          if (!quizAutoOnRef.current) goQuizNext();
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (!quizAutoOnRef.current) playJapanese();
          return;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!quizAutoOnRef.current) playEnglish();
          return;
        }
        if (event.key === "Shift") {
          if (event.repeat) return;
          event.preventDefault();
          setSpeechRate((r) =>
            r === SPEECH_RATE_NORMAL ? SPEECH_RATE_SLOW : SPEECH_RATE_NORMAL
          );
          return;
        }
        if (event.key === "e" || event.key === "E") {
          if (event.repeat) return;
          event.preventDefault();
          if (!quizAutoOnRef.current) replayQuizExample();
          return;
        }
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
        stopInterviewPlayAll();
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
  const quizItemForControls = quizDeck[quizIndex] ?? null;
  const quizExampleForControls = quizItemForControls
    ? getQuizExample(quizItemForControls)
    : null;
  const canJa =
    screen === "quiz"
      ? !!quizItemForControls &&
        (quizPhase === "example"
          ? !!quizExampleForControls?.text.trim()
          : quizPhase === "asking" ||
              quizPhase === "revealed" ||
              quizPhase === "review"
            ? !!quizItemForControls.item.word.trim()
            : false)
      : screen === "grammar"
        ? !!gItemForControls &&
          !!getGrammarSpeakableJapanese(grammarStep, gItemForControls)
        : item
          ? !!getSpeakableJapanese(step, item)
          : false;
  const canEn =
    screen === "quiz"
      ? !!quizItemForControls &&
        (quizPhase === "example"
          ? !!(
              quizExampleForControls?.meaning?.trim() ||
              quizItemForControls.item.meaning.trim()
            )
          : quizPhase === "revealed" || quizPhase === "review"
            ? !!quizItemForControls.item.meaning.trim()
            : false)
      : screen === "grammar"
        ? !!gItemForControls &&
          !!getGrammarSpeakableEnglish(grammarStep, gItemForControls)
        : item
          ? !!getSpeakableEnglish(step, item)
          : false;
  const canQuizExample =
    screen === "quiz" &&
    !!quizExampleForControls?.text.trim() &&
    (quizPhase === "revealed" ||
      quizPhase === "example" ||
      quizPhase === "review") &&
    !quizAutoOn;
  const jaLessonHighlight = speechLang === "ja" ? highlight : null;
  const enLessonHighlight = speechLang === "en" ? highlight : null;

  function renderStep() {
    if (!item) return null;
    switch (step) {
      case "category":
        return (
          <CategoryCard item={item} description={lesson?.subtitle} />
        );
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
        return <GlossaryView onNavigate={openGlossaryEntry} />;
      case "register": {
        const pair = registerPairs[registerIndex] ?? registerPairs[0] ?? null;
        if (!pair) {
          return (
            <SectionPlaceholder
              chip="Casual ⇄ Formal"
              title={tocItem?.label ?? "Register Practice"}
              subtitle="Expression pairs will appear here once data is added."
            />
          );
        }
        return (
          <>
            <div className="progress-label">
              {registerIndex + 1} / {registerPairs.length} · {pair.category}
            </div>
            <RegisterSplitCard
              pair={pair}
              activeSide={registerActiveSide}
              jaHighlight={jaLessonHighlight}
              enHighlight={enLessonHighlight}
              showFurigana={registerShowFurigana}
              formalHidden={registerDrillMode && !registerRevealed}
            />
          </>
        );
      }
      case "onomatopoeia": {
        const item = onoItems[onoIndex] ?? onoItems[0] ?? null;
        if (!item) {
          return (
            <SectionPlaceholder
              chip="オノマトペ"
              title={tocItem?.label ?? "Onomatopoeia"}
              subtitle="Expressions will appear here once data is added."
            />
          );
        }
        return (
          <>
            <div className="progress-label">
              {onoIndex + 1} / {onoItems.length} · {item.jlptLevel}
            </div>
            <OnomatopoeiaCard
              item={item}
              activePart={onoActivePart}
              jaHighlight={jaLessonHighlight}
              enHighlight={enLessonHighlight}
              showFurigana={onoShowFurigana}
            />
          </>
        );
      }
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
      case "interview": {
        const section =
          getInterviewSectionById(interviewSectionId) ??
          interviewPrepSections[0]!;
        return (
          <InterviewPracticeDisplay
            chip={interviewTitleChip(section)}
            titleJa={interviewTitleSpeakJa(section)}
            titleEn={interviewTitleSpeakEn(section)}
            announcingTitle={interviewAnnouncingTitle}
            lines={interviewLines}
            english={interviewEn}
            activeLang={hookActiveLang}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
          />
        );
      }
      case "interview-mix": {
        const section =
          getInterviewMixSectionById(mixSectionId) ?? interviewMixSections[0]!;
        return (
          <InterviewPracticeDisplay
            chip={interviewMixTitleChip(section)}
            titleJa={interviewMixTitleSpeakJa(section)}
            announcingTitle={mixAnnouncingTitle}
            nanamiOnly
            lines={mixLines}
            activeLang={hookActiveLang}
            jaHighlight={jaHighlight}
            enHighlight={enHighlight}
          />
        );
      }
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
                <GrammarCategoryCard
                  item={gItem}
                  rangeLabel={grammarBatchRangeLabel(grammarLessonId)}
                  description={grammarBatchCategorySuffix(grammarLessonId)}
                />
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
                  showFurigana={grammarShowFurigana}
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
            question={quizDeck[quizIndex] ?? null}
            index={quizIndex}
            total={Math.max(quizDeck.length || quizItems.length, 1)}
            selectedChoiceIndex={quizSelectedIndex}
            phase={quizPhase}
            showReading={quizShowReading}
            readingMode={
              getGrammarLessonIdForQuiz(activeTocId) ? "ruby" : "line"
            }
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
            <VocabularyRangeLabel lessonId={lessonId} kind="lesson" />
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
          ? quizPhase === "pre"
            ? "QUIZ AUTO OFF · Next or ←→ to start · Q for auto"
            : quizPhase === "after" || quizPhase === "finished"
              ? "Quiz done · Prev to review · Q to restart auto"
              : "←→ navigate · ↑ JP · ↓ EN · E Example · Shift rate · Q auto"
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
    screen === "interview" ||
    screen === "interview-mix" ||
    screen === "quiz-pre" ||
    screen === "quiz-after" ||
    screen === "flow-setup" ||
    (screen === "quiz" && quizItems.length > 0);

  return (
    <>
      <div
        className={
          showProductionPanel
            ? screen === "interview" || screen === "interview-mix"
              ? "stage-wrapper stage-wrapper--with-panel stage-wrapper--interview"
              : "stage-wrapper stage-wrapper--with-panel"
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

      {screen === "interview" ? (
        <div className="production-panel production-panel--interview">
          <div className="production-panel-title">
            Interview Prep · Section{" "}
            {(getInterviewSectionById(interviewSectionId)?.number ?? 1)} /{" "}
            {interviewPrepSections.length}
            {interviewPlayAll ? " · Playing all…" : ""}
          </div>
          <div className="production-fields production-fields--interview">
            <label className="production-field">
              <span>Japanese</span>
              <textarea
                rows={2}
                value={interviewLines.map((l) => l.japanese).join("\n")}
                onChange={(e) => {
                  const jaParts = e.target.value.split("\n");
                  setInterviewLines((prev) => {
                    const max = Math.max(jaParts.length, prev.length);
                    const next: InterviewLine[] = [];
                    for (let i = 0; i < max; i += 1) {
                      const japanese = (jaParts[i] ?? "").trimEnd();
                      const romaji = prev[i]?.romaji ?? "";
                      if (!japanese.trim() && !romaji.trim()) continue;
                      next.push({ japanese, romaji });
                    }
                    return next.length > 0
                      ? next
                      : [{ japanese: "", romaji: "" }];
                  });
                }}
              />
            </label>
            <label className="production-field">
              <span>Romaji</span>
              <textarea
                rows={2}
                value={interviewLines.map((l) => l.romaji).join("\n")}
                onChange={(e) => {
                  const roParts = e.target.value.split("\n");
                  setInterviewLines((prev) =>
                    prev.map((line, i) => ({
                      ...line,
                      romaji: roParts[i] ?? "",
                    }))
                  );
                }}
              />
            </label>
            <label className="production-field production-field--full">
              <span>Simple English (Andrew)</span>
              <textarea
                rows={2}
                value={interviewEn}
                onChange={(e) => setInterviewEn(e.target.value)}
              />
            </label>
          </div>
          <div className="production-actions">
            <button
              type="button"
              disabled={
                interviewPlayAll ||
                interviewPrepSections.findIndex(
                  (s) => s.id === interviewSectionId
                ) <= 0
              }
              onClick={goInterviewPrev}
            >
              ← Prev Section
            </button>
            <button
              type="button"
              disabled={
                interviewPlayAll ||
                interviewPrepSections.findIndex(
                  (s) => s.id === interviewSectionId
                ) >=
                  interviewPrepSections.length - 1
              }
              onClick={goInterviewNext}
            >
              Next Section →
            </button>
            <button
              type="button"
              onClick={() => {
                saveInterviewSection(interviewSectionId, {
                  lines: interviewLines,
                  english: interviewEn,
                });
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const next = resetInterviewSection(interviewSectionId);
                if (!next) return;
                setInterviewLines(next.lines);
                setInterviewEn(next.english);
              }}
            >
              Reset Section
            </button>
            <button
              type="button"
              onClick={() => {
                const a = document.createElement("a");
                a.href = "/interview-prep.pdf";
                a.download = "interview-prep-all.pdf";
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              title="Download all interview sections as one PDF"
            >
              Download All
            </button>
            <button type="button" onClick={playInterview} disabled={interviewPlayAll}>
              Play
            </button>
            <button
              type="button"
              className={
                interviewPlayAll
                  ? "quiz-auto-btn quiz-auto-btn--active"
                  : undefined
              }
              onClick={() => {
                if (interviewPlayAll) {
                  stopAllAudio();
                  return;
                }
                playInterviewAll();
              }}
            >
              {interviewPlayAll ? "Stop All" : "Play All"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={pauseHookPlayback}
            >
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={restartInterview}
              disabled={interviewPlayAll}
            >
              Restart
            </button>
          </div>
        </div>
      ) : null}

      {screen === "interview-mix" ? (
        <div className="production-panel production-panel--interview">
          <div className="production-panel-title">
            N3 JP+EN Mix · Section{" "}
            {(getInterviewMixSectionById(mixSectionId)?.number ?? 1)} /{" "}
            {interviewMixSections.length}
            {mixPlayAll ? " · Playing all…" : ""}
            {" · Nanami 0.88"}
          </div>
          <div className="production-actions">
            <button
              type="button"
              disabled={
                mixPlayAll ||
                interviewMixSections.findIndex((s) => s.id === mixSectionId) <=
                  0
              }
              onClick={goMixPrev}
            >
              ← Prev Section
            </button>
            <button
              type="button"
              disabled={
                mixPlayAll ||
                interviewMixSections.findIndex((s) => s.id === mixSectionId) >=
                  interviewMixSections.length - 1
              }
              onClick={goMixNext}
            >
              Next Section →
            </button>
            <button
              type="button"
              onClick={() => {
                const a = document.createElement("a");
                a.href = "/interview-prep-n3-mix.pdf";
                a.download = "interview-prep-n3-mix.pdf";
                a.rel = "noopener";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              title="Download all N3 mix sections as one PDF"
            >
              Download All
            </button>
            <button type="button" onClick={playMix} disabled={mixPlayAll}>
              Play
            </button>
            <button
              type="button"
              className={
                mixPlayAll ? "quiz-auto-btn quiz-auto-btn--active" : undefined
              }
              onClick={() => {
                if (mixPlayAll) {
                  stopAllAudio();
                  return;
                }
                playMixAll();
              }}
            >
              {mixPlayAll ? "Stop All" : "Play All"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={pauseHookPlayback}
            >
              {speechStatus === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={restartMix}
              disabled={mixPlayAll}
            >
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
              onClick={playJapanese}
              disabled={quizAutoOn || !canJa}
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
              type="button"
              onClick={playEnglish}
              disabled={quizAutoOn || !canEn}
              title="English — Microsoft Andrew Online Natural (↓)"
              className={
                speechStatus === "speaking" && speechLang === "en"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              ↓ EN
            </button>
            <button
              type="button"
              onClick={replayQuizExample}
              disabled={!canQuizExample}
              title="Play example sentence with karaoke (E)"
              className={
                quizPhase === "example" &&
                speechStatus === "speaking" &&
                speechLang === "ja"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              Example
            </button>
            <span className="rate-group">
              <button
                type="button"
                className={
                  speechRate === SPEECH_RATE_NORMAL
                    ? "rate-btn rate-btn--active"
                    : "rate-btn"
                }
                title="Normal speed (0.80) — Shift toggles"
                disabled={quizAutoOn}
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
                title="Slow speed (0.7) — Shift toggles"
                disabled={quizAutoOn}
                onClick={() => setSpeechRate(SPEECH_RATE_SLOW)}
              >
                Slow
              </button>
            </span>
            <button
              type="button"
              disabled={
                quizAutoOn ||
                (quizPhase !== "pre" &&
                  quizPhase !== "after" &&
                  quizPhase !== "finished" &&
                  quizIndex === 0)
              }
              onClick={goQuizPrev}
              title="Previous question (←)"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={quizAutoOn || quizPhase === "finished"}
              onClick={goQuizNext}
              title={
                quizPhase === "pre"
                  ? "Start quiz questions (→)"
                  : "Next question (→)"
              }
            >
              {quizPhase === "pre" ? "Start Quiz →" : "Next →"}
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

        {screen === "register" && registerPairs.length > 0 ? (
          <>
            <button
              onClick={goRegisterPrev}
              disabled={registerIndex === 0}
              tabIndex={-1}
            >
              ← Back
            </button>
            <button
              onClick={() => playRegisterSide("casual")}
              tabIndex={-1}
              title="Speak the casual form"
              className={
                registerActiveSide === "casual"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              ↑ Casual
            </button>
            <button
              onClick={() => playRegisterSide("formal")}
              tabIndex={-1}
              title="Speak the formal form"
              className={
                registerActiveSide === "formal"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              ↓ Formal
            </button>
            <button
              onClick={playRegisterBoth}
              tabIndex={-1}
              title="Play casual then formal back to back"
              className="register-btn"
            >
              ▶ Both
            </button>
            <button
              onClick={playRegisterPlay}
              tabIndex={-1}
              title="Play casual JP+EN, then formal JP+EN"
              className={
                registerPlayingAll
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
            >
              ▶ Play
            </button>
            <button
              onClick={playRegisterSection}
              tabIndex={-1}
              title="Play every pair in this section"
              className={
                registerPlayingSection
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
            >
              {registerPlayingSection ? "■ Stop All" : "▶ Play All"}
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
                onClick={() => setSpeechRate(SPEECH_RATE_SLOW)}
              >
                Slow
              </button>
            </span>
            <button
              type="button"
              className={
                registerShowFurigana ? "furi-btn furi-btn--active" : "furi-btn"
              }
              tabIndex={-1}
              title="Toggle hiragana readings"
              onClick={() => setRegisterShowFurigana((v) => !v)}
            >
              あ {registerShowFurigana ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              className={
                registerDrillMode
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
              tabIndex={-1}
              title="Hide the formal side and recall it yourself"
              onClick={() => {
                speechService.stop();
                stopRegisterAuto();
                clearSpeechUi();
                setRegisterDrillMode((v) => !v);
                setRegisterRevealed(false);
              }}
            >
              Drill {registerDrillMode ? "ON" : "OFF"}
            </button>
            {registerDrillMode && !registerRevealed ? (
              <button
                type="button"
                className="register-btn"
                tabIndex={-1}
                onClick={() => setRegisterRevealed(true)}
              >
                Reveal
              </button>
            ) : null}
            <button
              onClick={goRegisterNext}
              disabled={registerIndex >= registerPairs.length - 1}
              tabIndex={-1}
            >
              Forward →
            </button>
          </>
        ) : null}

        {screen === "onomatopoeia" && onoItems.length > 0 ? (
          <>
            <button
              onClick={goOnoPrev}
              disabled={onoIndex === 0}
              tabIndex={-1}
            >
              ← Back
            </button>
            <button
              onClick={playOnoWord}
              tabIndex={-1}
              title="Speak the expression"
              className={
                onoActivePart === "word"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              ↑ JP
            </button>
            <button
              onClick={playOnoEnglish}
              tabIndex={-1}
              title="Speak the English meaning"
              className={
                onoActivePart === "meaning"
                  ? "voice-btn voice-btn--active"
                  : "voice-btn"
              }
            >
              ↓ EN
            </button>
            <button
              onClick={playOnoExample}
              tabIndex={-1}
              title="Speak the example sentence, then English"
              className={
                onoActivePart === "example" || onoActivePart === "exampleEn"
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
            >
              ▶ Example
            </button>
            <button
              onClick={playOnoAll}
              tabIndex={-1}
              title="Play every line on this card, Japanese then English"
              className={
                onoPlayingAll
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
            >
              ▶ Play
            </button>
            <button
              onClick={playOnoLevel}
              tabIndex={-1}
              title="Play every expression in this level"
              className={
                onoPlayingLevel
                  ? "register-btn register-btn--active"
                  : "register-btn"
              }
            >
              {onoPlayingLevel ? "■ Stop All" : "▶ Play All"}
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
                onClick={() => setSpeechRate(SPEECH_RATE_SLOW)}
              >
                Slow
              </button>
            </span>
            <button
              type="button"
              className={
                onoShowFurigana ? "furi-btn furi-btn--active" : "furi-btn"
              }
              tabIndex={-1}
              title="Toggle hiragana readings"
              onClick={() => setOnoShowFurigana((v) => !v)}
            >
              あ {onoShowFurigana ? "ON" : "OFF"}
            </button>
            <button
              onClick={goOnoNext}
              disabled={onoIndex >= onoItems.length - 1}
              tabIndex={-1}
            >
              Forward →
            </button>
          </>
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
                title="Normal speed (0.80) — Shift toggles"
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
