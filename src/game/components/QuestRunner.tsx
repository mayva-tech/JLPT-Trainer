import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HighlightedEnglish } from "../../components/HighlightedEnglish";
import { HighlightedJapanese } from "../../components/HighlightedJapanese";
import { useTrainerSpeech } from "../../hooks/useTrainerSpeech";
import { getLocationById } from "../data/locations";
import { getNpcById } from "../data/npcs";
import { getQuestById } from "../data/quests";
import type { QuestDefinition, QuestRunMistake, QuestStep } from "../types";
import { filterStepsForProfile } from "../utils/chapterProgress";
import {
  canRetryStep,
  canStepBack,
  pushHistoryClearingForward,
  stepBackNav,
  stepForwardNav,
} from "../utils/conversationNav";
import {
  accuracyFromCounts,
  buildStepAnswerDelta,
  evaluateChoiceAnswer,
  noteQuestVocabMiss,
  undoStepAnswer,
  type QuestStepAnswerDelta,
  type QuestStepRunStats,
} from "../utils/questEngine";
import { buildQuestAutoPlayQueue, type KaraokeSurface } from "../utils/questAutoPlay";
import {
  hasSpeakableFeedback,
  parseBilingualSpeakSegments,
  type FeedbackSpeakSegment,
} from "../utils/questFeedbackSpeech";
import { scheduleAfterLanguageHandoff } from "../../utils/jpEnHandoff";
import {
  resolveQuestSpeech,
  type ResolvedQuestSpeech,
} from "../utils/questSpeech";
import { ConfidenceHearts } from "./ConfidenceHearts";
import { CommunicationMeter } from "./CommunicationMeter";
import { ConversationQuestRunner } from "./ConversationQuestRunner";
import { NpcPortrait } from "./NpcPortrait";
import { QuestStepNav } from "./QuestStepNav";
import { communicationFromConfidence } from "../utils/communicationMeter";

export type QuestRunOutcome = {
  success: boolean;
  accuracy: number;
  confidenceLeft: number;
  correct: number;
  answered: number;
  mistakes: QuestRunMistake[];
  monsters: string[];
  vocabDiscovered: string[];
  helpUses: number;
  /** 0–100 conversation smoothness. */
  communicationPercent: number;
  immersionNoEnglish: boolean;
  firstListenSuccess: boolean;
  repairedConversation: boolean;
  conceptsLearned: string[];
  /** Linear V1 vs branching Conversation V2. */
  engine?: "v1" | "v2";
  naturalResponseStreak?: number;
  maxNaturalStreak?: number;
  needsReview?: string[];
  relationshipDeltas?: { npcId: string; delta: number }[];
  repairUsed?: boolean;
  qualityCounts?: Partial<
    Record<
      "excellent" | "natural" | "acceptable" | "awkward" | "incorrect",
      number
    >
  >;
  /** Chapter 3 social appropriateness (result screen only). */
  socialFitPercent?: number;
  /** Chapter 4 business-register appropriateness (result screen only). */
  professionalFitPercent?: number;
  /** Reporting / 報連相 quality tags for mission result. */
  reportingQuality?: {
    conclusionFirst: boolean;
    clear: boolean;
    actionStated: boolean;
    notes: string[];
  };
  /** Functional repair tallies (phone / V2 reusable). */
  repairCounts?: {
    repeat: number;
    slow: number;
    meaning: number;
    confirm: number;
  };
  /** Facts remembered during the conversation (for Call Report). */
  summaryFacts?: { key: string; label: string; value: string; understood: boolean }[];
  /** Listening nodes answered correctly before help/replay. */
  firstListenCorrect?: number;
  firstListenTotal?: number;
  /** First-listen + after-replay tallies (Chapter 5 motivational). */
  firstListenWithReplayCorrect?: number;
  /** Highest listening assist used: 0 audio … 4 English. */
  highestAssistLevel?: number;
  /** Chapter 5 Native Listening adaptation (result-only). */
  nativeListeningPercent?: number;
  /** Optional result panel title (e.g. CALL REPORT). */
  resultSummaryTitle?: string;
};

type Props = {
  questId: string;
  metNpcIds: string[];
  onQuit: () => void;
  onFinished: (outcome: QuestRunOutcome) => void;
  /** Immersion Mode: hide EN until Help / answer. */
  immersionEnabled?: boolean;
  /** Skill: Conversation Repair — first miss of a step is free. */
  extraRepair?: boolean;
  relationships?: import("../types").NpcRelationship[];
  showContextHint?: boolean;
  showReportingHint?: boolean;
  showKeigoSenseHint?: boolean;
  showListeningAdaptationHint?: boolean;
};

const STEP_SETTLE_MS = 280;

type LinearNavCheckpoint = {
  stepIndex: number;
  stats: QuestStepRunStats;
  freeRepairLeft: number;
  helpUses: number;
  usedEnglishAssist: boolean;
  firstListenOk: boolean;
  listeningStepsSeen: number;
  repairedConversation: boolean;
};

export function QuestRunner({
  questId,
  metNpcIds,
  onQuit,
  onFinished,
  immersionEnabled = false,
  extraRepair = false,
  relationships = [],
  showContextHint = false,
  showReportingHint = false,
  showKeigoSenseHint = false,
  showListeningAdaptationHint = false,
}: Props) {
  const baseQuest = getQuestById(questId);

  if (baseQuest?.conversation) {
    return (
      <ConversationQuestRunner
        questId={questId}
        onQuit={onQuit}
        onFinished={onFinished}
        immersionEnabled={immersionEnabled}
        relationships={relationships}
        showContextHint={showContextHint}
        showReportingHint={showReportingHint}
        showKeigoSenseHint={showKeigoSenseHint}
        showListeningAdaptationHint={showListeningAdaptationHint}
      />
    );
  }

  return (
    <LinearQuestRunner
      questId={questId}
      metNpcIds={metNpcIds}
      onQuit={onQuit}
      onFinished={onFinished}
      immersionEnabled={immersionEnabled}
      extraRepair={extraRepair}
    />
  );
}

function LinearQuestRunner({
  questId,
  metNpcIds,
  onQuit,
  onFinished,
  immersionEnabled = false,
  extraRepair = false,
}: Props) {
  const baseQuest = getQuestById(questId);
  const steps = useMemo(() => {
    if (!baseQuest) return [];
    return filterStepsForProfile(baseQuest, metNpcIds);
  }, [baseQuest, metNpcIds]);

  const quest: QuestDefinition | undefined = baseQuest
    ? { ...baseQuest, steps }
    : undefined;

  const speech = useTrainerSpeech({ stopOnUnmount: true });

  const [stepIndex, setStepIndex] = useState(0);
  const [confidence, setConfidence] = useState(
    baseQuest?.startingConfidence ?? 5
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackGood, setFeedbackGood] = useState(true);
  const [monsterFlash, setMonsterFlash] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [mistakes, setMistakes] = useState<QuestRunMistake[]>([]);
  const [monsters, setMonsters] = useState<string[]>([]);
  const [vocabDiscovered, setVocabDiscovered] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [helpUses, setHelpUses] = useState(0);
  const [choiceHighlightId, setChoiceHighlightId] = useState<string | null>(
    null
  );
  /** Last MCQ scoring delta — cleared when advancing or retrying the step. */
  const [lastAnswerDelta, setLastAnswerDelta] =
    useState<QuestStepAnswerDelta | null>(null);
  /** Bumped on Try again so autoplay re-speaks the same step. */
  const [stepPlayKey, setStepPlayKey] = useState(0);
  /** Japanese phrase currently spoken from feedback/help (for karaoke). */
  const [feedbackJaFocus, setFeedbackJaFocus] = useState<string | null>(null);
  /** Free repair charges remaining this step (skill-gated). */
  const [freeRepairLeft, setFreeRepairLeft] = useState(extraRepair ? 1 : 0);
  const [repairedConversation, setRepairedConversation] = useState(false);
  const [usedEnglishAssist, setUsedEnglishAssist] = useState(false);
  const [firstListenOk, setFirstListenOk] = useState(true);
  const [listeningStepsSeen, setListeningStepsSeen] = useState(0);
  const [navHistory, setNavHistory] = useState<LinearNavCheckpoint[]>([]);
  const [navForward, setNavForward] = useState<LinearNavCheckpoint[]>([]);
  const [arrivalCheckpoint, setArrivalCheckpoint] =
    useState<LinearNavCheckpoint | null>(null);
  const autoPlayTokenRef = useRef(0);
  /** Speak quest title JP→EN once per Auto Voice session. */
  const titleSpokenRef = useRef(false);
  /** Play/Quiz-style: only the active surface receives karaoke. */
  const [karaokeSurface, setKaraokeSurface] = useState<KaraokeSurface | null>(
    null
  );

  const step = quest
    ? quest.steps[Math.min(stepIndex, quest.steps.length - 1)]!
    : null;
  const resolved = step ? resolveQuestSpeech(step) : null;

  // Each quest page opens with Auto Voice OFF (user can turn it on).
  useEffect(() => {
    titleSpokenRef.current = false;
    setNavHistory([]);
    setNavForward([]);
    setArrivalCheckpoint(null);
    if (speech.autoVoice) speech.setAutoVoice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId]);

  useEffect(() => {
    if (!speech.autoVoice) titleSpokenRef.current = false;
  }, [speech.autoVoice]);

  // Capture pre-answer arrival while the step is unanswered.
  useEffect(() => {
    if (revealed) return;
    setArrivalCheckpoint({
      stepIndex,
      stats: {
        confidence,
        correctCount,
        answeredCount,
        mistakes: mistakes.map((m) => ({ ...m })),
        monsters: [...monsters],
        vocabDiscovered: [...vocabDiscovered],
      },
      freeRepairLeft,
      helpUses,
      usedEnglishAssist,
      firstListenOk,
      listeningStepsSeen,
      repairedConversation,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stepIndex,
    revealed,
    confidence,
    correctCount,
    answeredCount,
    freeRepairLeft,
    helpUses,
    listeningStepsSeen,
    repairedConversation,
  ]);

  // Auto-play: title JP→EN (once) → subject JP→EN → each MCQ JP→EN → help.
  useEffect(() => {
    if (!step || !resolved || !quest) return;
    let cancelled = false;
    speech.stop();
    setChoiceHighlightId(null);
    setFeedbackJaFocus(null);
    setKaraokeSurface(null);
    autoPlayTokenRef.current += 1;
    const token = autoPlayTokenRef.current;

    if (!speech.autoVoice) {
      return () => {
        cancelled = true;
      };
    }

    const immersionBlocksEn = immersionEnabled && !showHelp;
    const includeTitle = !titleSpokenRef.current;
    if (includeTitle) titleSpokenRef.current = true;

    const queue = buildQuestAutoPlayQueue({
      step,
      resolved,
      showHelp,
      revealed,
      includeEnglish: !immersionBlocksEn,
      includeTitle,
      titleJa: quest.japaneseTitle,
      titleEn: quest.title,
    });
    if (queue.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const playBilingual = (raw: string, onDone: () => void) => {
      const segments = parseBilingualSpeakSegments(raw);
      if (segments.length === 0) {
        onDone();
        return;
      }
      const playSeg = (index: number) => {
        if (cancelled || token !== autoPlayTokenRef.current) return;
        const seg = segments[index];
        if (!seg) {
          setFeedbackJaFocus(null);
          onDone();
          return;
        }
        const next = () =>
          scheduleAfterLanguageHandoff(
            seg.language,
            segments[index + 1]?.language,
            () => playSeg(index + 1)
          );
        if (seg.language === "ja") {
          setKaraokeSurface("feedback");
          setFeedbackJaFocus(seg.text);
          speech.speakJapanese(seg.text, { karaoke: true, onEnded: next });
        } else {
          setKaraokeSurface("feedback");
          setFeedbackJaFocus(null);
          speech.speakEnglish(seg.text, { karaoke: true, onEnded: next });
        }
      };
      playSeg(0);
    };

    const playItem = (index: number) => {
      if (cancelled || token !== autoPlayTokenRef.current) return;
      const item = queue[index];
      if (!item) {
        setChoiceHighlightId(null);
        setFeedbackJaFocus(null);
        setKaraokeSurface(null);
        return;
      }
      const upcoming = queue[index + 1];
      const toLang =
        upcoming?.kind === "en"
          ? ("en" as const)
          : upcoming?.kind === "ja"
            ? ("ja" as const)
            : undefined;
      const advance = () => {
        if (item.kind === "ja" || item.kind === "en") {
          scheduleAfterLanguageHandoff(item.kind, toLang, () =>
            playItem(index + 1)
          );
        } else {
          playItem(index + 1);
        }
      };
      setKaraokeSurface(item.surface);
      if (item.kind === "ja") {
        setFeedbackJaFocus(null);
        if (item.choiceId) setChoiceHighlightId(item.choiceId);
        else setChoiceHighlightId(null);
        speech.speakJapanese(item.text, {
          reading: item.reading,
          karaoke: item.karaoke,
          onEnded: () => {
            if (item.choiceId) setChoiceHighlightId(null);
            advance();
          },
        });
      } else if (item.kind === "en") {
        if (item.choiceId) setChoiceHighlightId(item.choiceId);
        else setChoiceHighlightId(null);
        setFeedbackJaFocus(null);
        speech.speakEnglish(item.text, {
          karaoke: item.karaoke,
          onEnded: () => {
            if (item.choiceId) setChoiceHighlightId(null);
            advance();
          },
        });
      } else {
        setChoiceHighlightId(null);
        playBilingual(item.text, () => playItem(index + 1));
      }
    };

    const timer = window.setTimeout(() => {
      if (cancelled || token !== autoPlayTokenRef.current) return;
      playItem(0);
    }, STEP_SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      speech.stop();
    };
    // Re-run on step / retry / Auto Voice / Help — not on reveal (answer stops speech).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    questId,
    stepIndex,
    step?.id,
    stepPlayKey,
    speech.autoVoice,
    speech.rateMode,
    showHelp,
    immersionEnabled,
  ]);

  // Stop when leaving the runner via quit path handled by unmount; also on reveal
  // we do NOT auto-replay.

  if (!quest || steps.length === 0 || !step || !resolved) {
    return (
      <div className="ppq-quest">
        <p>Quest not found.</p>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onQuit}>
          Back
        </button>
      </div>
    );
  }

  const currentStep = step;
  const currentResolved = resolved;
  const npc = currentStep.npcId ? getNpcById(currentStep.npcId) : undefined;
  const location = getLocationById(quest.locationId);
  const isInteractive = Boolean(currentStep.choices && currentStep.choices.length > 0);
  const progressLabel = `Step ${stepIndex + 1} / ${steps.length}`;

  function finish(
    success: boolean,
    conf: number,
    correct: number,
    answered: number,
    miss: QuestRunMistake[],
    mons: string[],
    vocab: string[],
    helps: number
  ) {
    speech.stop();
    const raw = accuracyFromCounts(correct, answered);
    const penalized = Math.max(0, raw - Math.min(5, helps));
    const maxConf = baseQuest?.startingConfidence ?? 5;
    const communicationPercent = communicationFromConfidence(conf, maxConf);
    onFinished({
      success,
      accuracy: penalized,
      confidenceLeft: conf,
      correct,
      answered,
      mistakes: miss,
      monsters: mons,
      vocabDiscovered: vocab,
      helpUses: helps,
      communicationPercent,
      immersionNoEnglish: immersionEnabled && !usedEnglishAssist && helps === 0,
      firstListenSuccess: listeningStepsSeen > 0 && firstListenOk,
      repairedConversation,
      conceptsLearned: vocab,
      engine: "v1",
    });
  }

  function applyLinearCheckpoint(checkpoint: LinearNavCheckpoint) {
    setStepIndex(checkpoint.stepIndex);
    setConfidence(checkpoint.stats.confidence);
    setCorrectCount(checkpoint.stats.correctCount);
    setAnsweredCount(checkpoint.stats.answeredCount);
    setMistakes(checkpoint.stats.mistakes.map((m) => ({ ...m })));
    setMonsters([...checkpoint.stats.monsters]);
    setVocabDiscovered([...checkpoint.stats.vocabDiscovered]);
    setFreeRepairLeft(checkpoint.freeRepairLeft);
    setHelpUses(checkpoint.helpUses);
    setUsedEnglishAssist(checkpoint.usedEnglishAssist);
    setFirstListenOk(checkpoint.firstListenOk);
    setListeningStepsSeen(checkpoint.listeningStepsSeen);
    setRepairedConversation(checkpoint.repairedConversation);
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setMonsterFlash(null);
    setShowHelp(false);
    setChoiceHighlightId(null);
    setLastAnswerDelta(null);
    setFeedbackJaFocus(null);
    setArrivalCheckpoint(checkpoint);
    setStepPlayKey((k) => k + 1);
  }

  function goNext(
    conf: number,
    correct: number,
    answered: number,
    miss: QuestRunMistake[],
    mons: string[],
    vocab: string[],
    helps: number
  ) {
    speech.stop();
    if (conf <= 0) {
      finish(false, 0, correct, answered, miss, mons, vocab, helps);
      return;
    }
    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      finish(true, conf, correct, answered, miss, mons, vocab, helps);
      return;
    }
    if (arrivalCheckpoint) {
      const pushed = pushHistoryClearingForward(navHistory, arrivalCheckpoint);
      setNavHistory(pushed.history);
      setNavForward(pushed.forward);
    }
    setStepIndex(nextIndex);
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setMonsterFlash(null);
    setShowHelp(false);
    setChoiceHighlightId(null);
    setLastAnswerDelta(null);
    setFeedbackJaFocus(null);
    setFreeRepairLeft(extraRepair ? 1 : 0);
  }

  function onContinueIntro() {
    goNext(
      confidence,
      correctCount,
      answeredCount,
      mistakes,
      monsters,
      vocabDiscovered,
      helpUses
    );
  }

  function onSelectChoice(choiceId: string) {
    if (!isInteractive || revealed) return;
    speech.stop();
    const result = evaluateChoiceAnswer(currentStep, choiceId);
    setSelectedId(choiceId);
    setRevealed(true);
    setFeedback(result.feedback);
    setFeedbackGood(result.correct);

    const isListening =
      currentStep.kind === "listening" ||
      currentStep.objectiveType === "listening" ||
      Boolean(currentStep.listenText);
    if (isListening) {
      setListeningStepsSeen((n) => n + 1);
      if (!result.correct) setFirstListenOk(false);
    }

    let nextCorrect = correctCount;
    let nextAnswered = answeredCount + 1;
    let nextConf = confidence;
    let nextMistakes = mistakes;
    let nextMonsters = monsters;
    let nextVocab = vocabDiscovered;
    let vocabAdded: string | null = null;
    let monsterAdded: string | null = null;
    let spentFreeRepair = false;

    if (result.correct) {
      nextCorrect += 1;
      if (currentStep.vocabHint && !nextVocab.includes(currentStep.vocabHint)) {
        vocabAdded = currentStep.vocabHint;
        nextVocab = [...nextVocab, currentStep.vocabHint];
      }
    } else {
      if (result.costsConfidence) {
        if (freeRepairLeft > 0) {
          spentFreeRepair = true;
          setFreeRepairLeft((n) => Math.max(0, n - 1));
          setRepairedConversation(true);
          setFeedback(
            `${result.feedback}\n\n🛠️ Conversation repair: 「すみません、もう一度お願いします。」— try again without losing Confidence.`
          );
        } else {
          nextConf = Math.max(0, confidence - 1);
        }
      }
      if (result.mistake) nextMistakes = [...mistakes, result.mistake];
      const hook = noteQuestVocabMiss({
        vocabHint: currentStep.vocabHint,
        correct: false,
      });
      if (hook.monsterLabel && !nextMonsters.includes(hook.monsterLabel)) {
        monsterAdded = hook.monsterLabel;
        nextMonsters = [...nextMonsters, hook.monsterLabel];
        setMonsterFlash(hook.monsterLabel);
      }
    }

    setCorrectCount(nextCorrect);
    setAnsweredCount(nextAnswered);
    setConfidence(nextConf);
    setMistakes(nextMistakes);
    setMonsters(nextMonsters);
    setVocabDiscovered(nextVocab);
    setLastAnswerDelta(
      buildStepAnswerDelta(result, {
        confidenceBefore: confidence,
        confidenceAfter: nextConf,
        vocabAdded,
        monsterAdded,
        // Free repair: no confidence cost recorded for undo.
        ...(spentFreeRepair ? {} : {}),
      })
    );
  }

  function onContinueAfterAnswer() {
    goNext(
      confidence,
      correctCount,
      answeredCount,
      mistakes,
      monsters,
      vocabDiscovered,
      helpUses
    );
  }

  function onRetryStep() {
    if (!canRetryStep(revealed, isInteractive)) return;
    speech.stop();
    if (lastAnswerDelta) {
      const restored = undoStepAnswer(
        {
          confidence,
          correctCount,
          answeredCount,
          mistakes,
          monsters,
          vocabDiscovered,
        },
        lastAnswerDelta
      );
      setConfidence(restored.confidence);
      setCorrectCount(restored.correctCount);
      setAnsweredCount(restored.answeredCount);
      setMistakes(restored.mistakes);
      setMonsters(restored.monsters);
      setVocabDiscovered(restored.vocabDiscovered);
    }
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setFeedbackGood(true);
    setMonsterFlash(null);
    setChoiceHighlightId(null);
    setLastAnswerDelta(null);
    setFeedbackJaFocus(null);
    setStepPlayKey((k) => k + 1);
  }

  function onNavBack() {
    if (!arrivalCheckpoint || !canStepBack(navHistory.length)) return;
    const moved = stepBackNav(navHistory, navForward, arrivalCheckpoint);
    if (!moved) return;
    speech.stop();
    setNavHistory(moved.history);
    setNavForward(moved.forward);
    applyLinearCheckpoint(moved.current);
  }

  function onNavForward() {
    if (navForward.length > 0 && arrivalCheckpoint) {
      const moved = stepForwardNav(navHistory, navForward, arrivalCheckpoint);
      if (!moved) return;
      speech.stop();
      setNavHistory(moved.history);
      setNavForward(moved.forward);
      applyLinearCheckpoint(moved.current);
      return;
    }
    if (currentStep.kind === "intro" || currentStep.kind === "outro") {
      onContinueIntro();
      return;
    }
    if (revealed) {
      onContinueAfterAnswer();
      return;
    }
    if (!isInteractive) {
      onContinueIntro();
    }
  }

  function onToggleHelp() {
    if (!showHelp) {
      setHelpUses((n) => n + 1);
      setUsedEnglishAssist(true);
    }
    setShowHelp((v) => !v);
  }

  function replayNpcLine() {
    if (!currentResolved.enabled || !currentResolved.speakText) return;
    setKaraokeSurface("prompt");
    setChoiceHighlightId(null);
    const allowKaraoke =
      currentResolved.karaokeMode === "always" ||
      (currentResolved.karaokeMode === "after-answer" && revealed);
    if (currentResolved.language === "en") {
      speech.speakEnglish(currentResolved.speakText, { karaoke: allowKaraoke });
    } else {
      speech.speakJapanese(currentResolved.speakText, {
        reading: currentResolved.reading,
        karaoke: allowKaraoke && currentResolved.karaokeMode !== "off",
      });
    }
  }

  function replayEnglish(text: string) {
    setFeedbackJaFocus(null);
    setKaraokeSurface("prompt");
    setChoiceHighlightId(null);
    speech.speakEnglish(text, { karaoke: true });
  }

  function replayChoice(choiceId: string, labelJa: string) {
    setFeedbackJaFocus(null);
    setKaraokeSurface("choice");
    setChoiceHighlightId(choiceId);
    speech.speakJapanese(labelJa, {
      karaoke: true,
      onEnded: () => setChoiceHighlightId(null),
    });
  }

  function speakBilingualSegments(segments: FeedbackSpeakSegment[]) {
    if (segments.length === 0) return;
    setChoiceHighlightId(null);
    setKaraokeSurface("feedback");

    const play = (index: number) => {
      const seg = segments[index];
      if (!seg) {
        setFeedbackJaFocus(null);
        setKaraokeSurface(null);
        return;
      }
      const next = () => {
        const upcoming = segments[index + 1];
        scheduleAfterLanguageHandoff(seg.language, upcoming?.language, () =>
          play(index + 1)
        );
      };
      if (seg.language === "ja") {
        setFeedbackJaFocus(seg.text);
        speech.speakJapanese(seg.text, {
          karaoke: true,
          onEnded: next,
        });
      } else {
        setFeedbackJaFocus(null);
        speech.speakEnglish(seg.text, {
          karaoke: true,
          onEnded: next,
        });
      }
    };

    play(0);
  }

  function replayFeedback(text: string) {
    speakBilingualSegments(parseBilingualSpeakSegments(text));
  }

  function replayHelpHint(text: string) {
    speakBilingualSegments(parseBilingualSpeakSegments(text));
  }

  function handleQuit() {
    speech.stop();
    onQuit();
  }

  const continueLabel =
    currentStep.kind === "outro"
      ? "Finish"
      : currentStep.kind === "intro"
        ? "Begin"
        : "Forward";

  const canForward =
    navForward.length > 0 ||
    currentStep.kind === "intro" ||
    currentStep.kind === "outro" ||
    !isInteractive ||
    revealed;

  const showJaTranscript =
    !currentResolved.hideTranscriptUntilAnswer ||
    revealed ||
    currentResolved.karaokeMode === "always" ||
    !(immersionEnabled && currentResolved.hideTranscriptUntilAnswer);

  /** Immersion hides EN until Help or after the answer is revealed. */
  const immersionBlocksEn =
    immersionEnabled && !showHelp && !revealed;

  return (
    <div className="ppq-quest ppq-quest-enter">
      <div className="ppq-quest-banner">
        <p style={{ margin: 0, fontSize: 12, color: "var(--ppq-muted)" }}>
          {location?.icon ?? "📍"} {location?.name ?? quest.locationId} ·{" "}
          {progressLabel}
          {quest.difficulty === "boss" ? " · Boss" : ""}
          {currentResolved.announcement ? " · Announcement" : ""}
        </p>
        <h1 lang="ja">
          <HighlightedJapanese
            text={quest.japaneseTitle}
            className="ppq-quest-title-ja"
            highlight={
              karaokeSurface === "title" && speech.activeLang === "ja"
                ? speech.highlight
                : null
            }
          />
        </h1>
        <HighlightedEnglish
          text={quest.title}
          className="ppq-quest-title-en"
          highlight={
            karaokeSurface === "title" && speech.activeLang === "en"
              ? speech.highlight
              : null
          }
        />
      </div>

      <div className="ppq-quest-toolbar">
        <div className="ppq-quest-meters">
          <ConfidenceHearts
            confidence={confidence}
            max={quest.startingConfidence}
          />
          <CommunicationMeter
            percent={communicationFromConfidence(
              confidence,
              quest.startingConfidence
            )}
          />
        </div>
        <div className="ppq-speech-controls">
          {immersionEnabled ? (
            <span className="ppq-immersion-badge" title="Immersion Mode on">
              🎧 Immersion
            </span>
          ) : null}
          <button
            type="button"
            className={
              speech.autoVoice
                ? "ppq-btn ppq-btn--ghost ppq-btn--speech-on"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={speech.autoVoice}
            onClick={() => speech.setAutoVoice(!speech.autoVoice)}
          >
            {speech.autoVoice ? "🔊 Auto Voice" : "🔇 Auto Voice"}
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "normal"
                ? "ppq-btn ppq-btn--ghost ppq-btn--speech-on"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={speech.rateMode === "normal"}
            onClick={() => {
              speech.setRateMode("normal");
            }}
          >
            1.0×
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "fast"
                ? "ppq-btn ppq-btn--ghost ppq-btn--speech-on"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={speech.rateMode === "fast"}
            onClick={() => {
              speech.setRateMode("fast");
            }}
          >
            1.25×
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "slow"
                ? "ppq-btn ppq-btn--ghost ppq-btn--speech-on"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={speech.rateMode === "slow"}
            onClick={() => {
              speech.setRateMode("slow");
            }}
          >
            0.75×
          </button>
          {(currentStep.helpHint ||
            currentStep.promptReading ||
            currentStep.promptEn) &&
          (isInteractive || immersionEnabled) ? (
            <button
              type="button"
              className="ppq-btn ppq-btn--ghost"
              onClick={onToggleHelp}
            >
              {showHelp ? "Hide Help" : "Show Help"}
            </button>
          ) : null}
          <button
            type="button"
            className="ppq-btn ppq-btn--ghost"
            onClick={handleQuit}
          >
            Leave quest
          </button>
        </div>
      </div>

      <DialogueStep
        step={currentStep}
        resolved={currentResolved}
        npc={npc}
        selectedId={selectedId}
        revealed={revealed}
        feedback={feedback}
        feedbackGood={feedbackGood}
        monsterFlash={monsterFlash}
        showHelp={showHelp}
        forceHideEn={immersionBlocksEn}
        showJaTranscript={showJaTranscript}
        highlight={
          speech.activeLang === "ja" &&
          karaokeSurface === "prompt" &&
          choiceHighlightId === null &&
          feedbackJaFocus === null
            ? speech.highlight
            : null
        }
        enHighlight={
          speech.activeLang === "en" && karaokeSurface === "prompt"
            ? speech.highlight
            : null
        }
        speaking={speech.speaking}
        choiceHighlightId={choiceHighlightId}
        choiceHighlight={
          choiceHighlightId &&
          speech.activeLang === "ja" &&
          karaokeSurface === "choice"
            ? speech.highlight
            : null
        }
        feedbackJaFocus={feedbackJaFocus}
        feedbackJaHighlight={
          feedbackJaFocus &&
          speech.activeLang === "ja" &&
          karaokeSurface === "feedback"
            ? speech.highlight
            : null
        }
        onSelect={onSelectChoice}
        onReplayLine={currentResolved.enabled ? replayNpcLine : undefined}
        onReplayEnglish={
          currentResolved.englishText
            ? () => replayEnglish(currentResolved.englishText!)
            : undefined
        }
        onReplayChoice={replayChoice}
        onReplayFeedback={
          feedback && hasSpeakableFeedback(feedback)
            ? () => replayFeedback(feedback)
            : undefined
        }
        onReplayHelpHint={
          currentStep.helpHint && hasSpeakableFeedback(currentStep.helpHint)
            ? () => replayHelpHint(currentStep.helpHint!)
            : undefined
        }
        onRetry={onRetryStep}
        onBack={onNavBack}
        onForward={onNavForward}
        canBack={canStepBack(navHistory.length)}
        canRetry={canRetryStep(revealed, isInteractive)}
        canForward={canForward}
        continueLabel={continueLabel}
      />
    </div>
  );
}

function DialogueStep({
  step,
  resolved,
  npc,
  selectedId,
  revealed,
  feedback,
  feedbackGood,
  monsterFlash,
  showHelp,
  forceHideEn = false,
  showJaTranscript,
  highlight,
  enHighlight,
  speaking,
  choiceHighlightId,
  choiceHighlight,
  feedbackJaFocus,
  feedbackJaHighlight,
  onSelect,
  onReplayLine,
  onReplayEnglish,
  onReplayChoice,
  onReplayFeedback,
  onReplayHelpHint,
  onRetry,
  onBack,
  onForward,
  canBack,
  canRetry,
  canForward,
  continueLabel,
}: {
  step: QuestStep;
  resolved: ResolvedQuestSpeech;
  npc: ReturnType<typeof getNpcById>;
  selectedId: string | null;
  revealed: boolean;
  feedback: string | null;
  feedbackGood: boolean;
  monsterFlash: string | null;
  showHelp: boolean;
  forceHideEn?: boolean;
  showJaTranscript: boolean;
  highlight: import("../../services/speechService").SpeechHighlight | null;
  enHighlight: import("../../services/speechService").SpeechHighlight | null;
  speaking: boolean;
  choiceHighlightId: string | null;
  choiceHighlight: import("../../services/speechService").SpeechHighlight | null;
  feedbackJaFocus: string | null;
  feedbackJaHighlight: import("../../services/speechService").SpeechHighlight | null;
  onSelect: (id: string) => void;
  onReplayLine?: () => void;
  onReplayEnglish?: () => void;
  onReplayChoice: (id: string, labelJa: string) => void;
  onReplayFeedback?: () => void;
  onReplayHelpHint?: () => void;
  onRetry: () => void;
  onBack: () => void;
  onForward: () => void;
  canBack: boolean;
  canRetry: boolean;
  canForward: boolean;
  continueLabel: string;
}) {
  const showInstructionEn =
    !forceHideEn && shouldShowPromptEn(step, showHelp);
  const jaForHighlight =
    resolved.hideTranscriptUntilAnswer && revealed
      ? resolved.displayJa
      : step.promptJa;

  return (
    <section className="ppq-dialogue">
      {npc ? <NpcPortrait npc={npc} /> : null}

      {resolved.announcement ? (
        <p className="ppq-announce-label">📢 Station announcement</p>
      ) : null}

      <div className="ppq-line-row">
        {showJaTranscript && resolved.language === "ja" && resolved.displayJa ? (
          <HighlightedJapanese
            text={
              resolved.hideTranscriptUntilAnswer
                ? resolved.displayJa
                : jaForHighlight
            }
            className="ppq-prompt-ja"
            highlight={highlight}
          />
        ) : resolved.hideTranscriptUntilAnswer && !revealed ? (
          <div className="ppq-listen-hidden">
            <p className="ppq-prompt-en" style={{ margin: 0 }}>
              {step.promptEn ?? "Listen carefully, then choose."}
            </p>
            <p className="ppq-listen-hint">Transcript hidden until you answer.</p>
          </div>
        ) : resolved.language === "en" && resolved.speakText ? (
          <HighlightedEnglish
            text={resolved.speakText}
            className="ppq-prompt-en"
            highlight={enHighlight}
          />
        ) : (
          <div className="ppq-prompt-ja" lang="ja">
            {step.promptJa}
          </div>
        )}

        {onReplayLine ? (
          <button
            type="button"
            className={
              speaking && !choiceHighlightId
                ? "ppq-speak-btn ppq-speak-btn--active"
                : "ppq-speak-btn"
            }
            aria-label={
              speaking ? "Replay Japanese dialogue" : "Play Japanese dialogue"
            }
            title="Play / replay"
            onClick={onReplayLine}
          >
            🔊
          </button>
        ) : null}
      </div>

      {showHelp && step.promptReading && showJaTranscript ? (
        <div className="ppq-reading-hint">{step.promptReading}</div>
      ) : null}

      {showInstructionEn &&
      step.promptEn &&
      !(resolved.hideTranscriptUntilAnswer && !revealed) ? (
        <div className="ppq-prompt-en-row">
          <HighlightedEnglish
            text={step.promptEn}
            className="ppq-prompt-en"
            highlight={enHighlight}
          />
          {onReplayEnglish &&
          (step.kind === "intro" || step.kind === "outro") ? (
            <button
              type="button"
              className="ppq-speak-btn"
              aria-label="Play English narration"
              onClick={onReplayEnglish}
            >
              🔊
            </button>
          ) : null}
        </div>
      ) : null}

      {showHelp && step.helpHint ? (
        <div className="ppq-help-hint-row">
          <p className="ppq-help-hint">
            💡{" "}
            <BilingualHintText
              text={step.helpHint}
              jaFocus={feedbackJaFocus}
              jaHighlight={feedbackJaHighlight}
            />
          </p>
          {onReplayHelpHint ? (
            <button
              type="button"
              className="ppq-speak-btn"
              aria-label="Play help hint"
              onClick={onReplayHelpHint}
            >
              🔊
            </button>
          ) : null}
        </div>
      ) : null}

      {step.bodyJa ? (
        <div className="ppq-reading-body" lang="ja">
          {step.bodyJa}
        </div>
      ) : null}

      {step.mapText ? (
        <pre className="ppq-map-diagram" aria-label="Route map">
          {step.mapText}
        </pre>
      ) : null}

      {step.menuItems && step.menuItems.length > 0 ? (
        <div className="ppq-menu-card" aria-label="Menu">
          {step.menuItems.map((item) => (
            <div className="ppq-menu-row" key={item.nameJa}>
              <span lang="ja">{item.nameJa}</span>
              <span>¥{item.priceYen}</span>
            </div>
          ))}
        </div>
      ) : null}

      {step.formFields ? (
        <div className="ppq-form-preview" aria-label="Form">
          {step.formAskEn ? (
            <p className="ppq-prompt-en" style={{ marginBottom: 8 }}>
              {step.formAskEn}
            </p>
          ) : null}
          {step.formFields.map((field) => (
            <div className="ppq-form-row" key={field.id}>
              <strong lang="ja">{field.labelJa}</strong>
              <span>{field.meaningEn}</span>
            </div>
          ))}
        </div>
      ) : null}

      {step.choices && step.choices.length > 0 ? (
        <div className="ppq-choices" role="list">
          {step.choices.map((choice, index) => {
            let className = "ppq-choice";
            if (revealed) {
              if (choice.correct) className += " ppq-choice--correct";
              else if (choice.id === selectedId) className += " ppq-choice--wrong";
              else className += " ppq-choice--dim";
            }
            return (
              <div key={choice.id} className="ppq-choice-row">
                <button
                  type="button"
                  className={className}
                  disabled={revealed}
                  onClick={() => onSelect(choice.id)}
                >
                  <span className="ppq-choice-index">{index + 1}.</span>{" "}
                  {choiceHighlightId === choice.id ? (
                    <HighlightedJapanese
                      text={choice.labelJa}
                      className="ppq-choice-ja"
                      highlight={choiceHighlight}
                    />
                  ) : (
                    <span lang="ja">{choice.labelJa}</span>
                  )}
                  {showHelp && !forceHideEn && choice.labelEn ? (
                    <span className="ppq-choice-en">{choice.labelEn}</span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="ppq-speak-btn ppq-speak-btn--choice"
                  aria-label={`Play answer choice: ${choice.labelJa}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplayChoice(choice.id, choice.labelJa);
                  }}
                >
                  🔊
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {feedback ? (
        <div
          className={
            feedbackGood
              ? "ppq-feedback ppq-feedback--good"
              : "ppq-feedback ppq-feedback--bad"
          }
          role="status"
        >
          <div className="ppq-feedback-row">
            <div className="ppq-feedback-text">
              <BilingualHintText
                text={feedback}
                jaFocus={feedbackJaFocus}
                jaHighlight={feedbackJaHighlight}
                preserveNewlines
              />
            </div>
            {onReplayFeedback ? (
              <button
                type="button"
                className="ppq-speak-btn"
                aria-label="Play explanation"
                onClick={onReplayFeedback}
              >
                🔊
              </button>
            ) : null}
          </div>
          {monsterFlash ? (
            <div className="ppq-monster">
              👾 Weak Word detected: {monsterFlash}
            </div>
          ) : null}
        </div>
      ) : null}

      <QuestStepNav
        canBack={canBack}
        canRetry={canRetry}
        canForward={canForward}
        forwardLabel={continueLabel}
        onBack={onBack}
        onRetry={onRetry}
        onForward={onForward}
      />
    </section>
  );
}

/** @deprecated Use QuestRunner — kept for import compatibility. */
export { QuestRunner as CityHallQuestRunner };

function shouldShowPromptEn(step: QuestStep, showHelp: boolean): boolean {
  if (!step.promptEn) return false;
  if (step.kind === "intro" || step.kind === "outro") return true;
  if (showHelp) return true;
  const type = step.objectiveType;
  return (
    type === "listening" ||
    type === "reading" ||
    type === "vocabulary" ||
    type === "map" ||
    type === "menu" ||
    type === "form-label" ||
    type === "multiple-choice" ||
    step.kind === "map" ||
    step.kind === "menu" ||
    step.kind === "form-label" ||
    step.kind === "reading" ||
    step.kind === "listening"
  );
}

/**
 * Render feedback/help with 「日本語」 spans karaoke-highlighted while spoken.
 */
function BilingualHintText({
  text,
  jaFocus,
  jaHighlight,
  preserveNewlines = false,
}: {
  text: string;
  jaFocus: string | null;
  jaHighlight: import("../../services/speechService").SpeechHighlight | null;
  preserveNewlines?: boolean;
}) {
  const nodes: ReactNode[] = [];
  const quoteRe = /「([^」]+)」/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = quoteRe.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <HintPlain key={`t-${key++}`} text={text.slice(cursor, match.index)} />
      );
    }
    const ja = match[1] ?? "";
    const focused = jaFocus !== null && ja.replace(/\s+/g, "") === jaFocus;
    nodes.push(
      <span key={`q-${key++}`} className="ppq-feedback-ja" lang="ja">
        「
        {focused ? (
          <HighlightedJapanese
            text={ja}
            className="ppq-feedback-ja-inner"
            highlight={jaHighlight}
          />
        ) : (
          ja
        )}
        」
      </span>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(<HintPlain key={`t-${key++}`} text={text.slice(cursor)} />);
  }

  if (preserveNewlines) {
    return <div className="ppq-feedback-rich">{nodes}</div>;
  }
  return <>{nodes}</>;
}

function HintPlain({ text }: { text: string }) {
  if (!text.includes("\n")) return <>{text}</>;
  const parts = text.split("\n");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}
