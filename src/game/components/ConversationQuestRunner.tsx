import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HighlightedEnglish } from "../../components/HighlightedEnglish";
import { HighlightedJapanese } from "../../components/HighlightedJapanese";
import { useTrainerSpeech } from "../../hooks/useTrainerSpeech";
import type { SpeechHighlight } from "../../services/speechService";
import { getLocationById } from "../data/locations";
import { getNpcById } from "../data/npcs";
import { getQuestById } from "../data/quests";
import type {
  ConversationChoice,
  ConversationNode,
  NpcRelationship,
  QuestRunMistake,
  ResponseQuality,
} from "../types";
import {
  applyConversationChoice,
  defaultCommunicationStart,
  emptyQualityCounts,
  getConversationChoice,
  getConversationNode,
  resolveRelationshipBranch,
} from "../utils/conversationEngine";
import type { KaraokeSurface } from "../utils/questAutoPlay";
import {
  hasSpeakableFeedback,
  parseBilingualSpeakSegments,
} from "../utils/questFeedbackSpeech";
import {
  bumpRepairCount,
  emptyRepairCounts,
} from "../utils/repairCounts";
import {
  nodeCountsTowardSocialFit,
  socialFitFromQualities,
} from "../utils/socialFit";
import {
  nodeCountsTowardProfessionalFit,
  professionalFitFromQualities,
  summarizeReportingTags,
} from "../utils/professionalFit";
import {
  bumpAssistLevel,
  isListeningQualityOk,
  nativeListeningFromRun,
  nodeCountsTowardNativeListening,
  nodeSpokenFeatures,
  type ListeningAssistLevel,
} from "../utils/nativeListening";
import { resolveNodeSpeechRate } from "../utils/nodeSpeechRate";
import {
  canRetryStep,
  canStepBack,
  cloneConversationNavCheckpoint,
  emptyConversationNavCheckpoint,
  pushHistoryClearingForward,
  stepBackNav,
  stepForwardNav,
  type ConversationNavCheckpoint,
} from "../utils/conversationNav";
import { ConfidenceHearts } from "./ConfidenceHearts";
import { CommunicationMeter } from "./CommunicationMeter";
import { NpcPortrait } from "./NpcPortrait";
import { QuestStepNav } from "./QuestStepNav";
import type { QuestRunOutcome } from "./QuestRunner";

type Props = {
  questId: string;
  onQuit: () => void;
  onFinished: (outcome: QuestRunOutcome) => void;
  immersionEnabled?: boolean;
  /** Current NPC relationship levels for gated dialogue variants. */
  relationships?: NpcRelationship[];
  /** Skill: show a subtle context hint after an awkward response. */
  showContextHint?: boolean;
  /** Skill: after weak reporting, remind to lead with the conclusion. */
  showReportingHint?: boolean;
  /** Skill: after awkward keigo, remind internal vs external. */
  showKeigoSenseHint?: boolean;
  /** Skill: after failed fast listen, catch key nouns/time/place. */
  showListeningAdaptationHint?: boolean;
};

const SETTLE_MS = 280;

function nodeSpeechEnabled(node: ConversationNode): boolean {
  return node.speech?.enabled !== false;
}

function isListeningBeat(node: ConversationNode): boolean {
  return Boolean(
    node.audioFirst ||
      node.listenOnly ||
      node.objectiveType === "listening"
  );
}

function buildSummaryFacts(
  facts: Record<string, string>,
  labels: Record<string, string>,
  understood: Set<string>
): QuestRunOutcome["summaryFacts"] {
  return Object.entries(facts).map(([key, value]) => ({
    key,
    label: labels[key] ?? key,
    value,
    understood: understood.has(key),
  }));
}

export function ConversationQuestRunner({
  questId,
  onQuit,
  onFinished,
  immersionEnabled = false,
  relationships = [],
  showContextHint = false,
  showReportingHint = false,
  showKeigoSenseHint = false,
  showListeningAdaptationHint = false,
}: Props) {
  const quest = getQuestById(questId);
  const conversation = quest?.conversation;
  const speech = useTrainerSpeech({ stopOnUnmount: true });

  const [nodeId, setNodeId] = useState(conversation?.startNodeId ?? "");
  const [confidence, setConfidence] = useState(quest?.startingConfidence ?? 5);
  const [communication, setCommunication] = useState(defaultCommunicationStart());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackGood, setFeedbackGood] = useState(true);
  const [qualityLabel, setQualityLabel] = useState<string | null>(null);
  const [contextHint, setContextHint] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpUses, setHelpUses] = useState(0);
  const [usedEnglishAssist, setUsedEnglishAssist] = useState(false);
  const [naturalStreak, setNaturalStreak] = useState(0);
  const [maxNaturalStreak, setMaxNaturalStreak] = useState(0);
  const [repairedConversation, setRepairedConversation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [mistakes, setMistakes] = useState<QuestRunMistake[]>([]);
  const [conceptsLearned, setConceptsLearned] = useState<string[]>([]);
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [vocabDiscovered, setVocabDiscovered] = useState<string[]>([]);
  const [monsters, setMonsters] = useState<string[]>([]);
  const [relationshipDeltas, setRelationshipDeltas] = useState<
    { npcId: string; delta: number }[]
  >([]);
  const [qualityCounts, setQualityCounts] = useState(emptyQualityCounts());
  const [socialFitQualities, setSocialFitQualities] = useState<ResponseQuality[]>(
    []
  );
  const [professionalFitQualities, setProfessionalFitQualities] = useState<
    ResponseQuality[]
  >([]);
  const [reportingTags, setReportingTags] = useState<string[]>([]);
  const [pendingNextId, setPendingNextId] = useState<string | null>(null);
  const [choiceHighlightId, setChoiceHighlightId] = useState<string | null>(null);
  const [feedbackJaFocus, setFeedbackJaFocus] = useState<string | null>(null);
  /** English gloss currently spoken from feedback/help (for karaoke). */
  const [feedbackEnFocus, setFeedbackEnFocus] = useState<string | null>(null);
  const feedbackSpeakTokenRef = useRef(0);
  const [nodePlayKey, setNodePlayKey] = useState(0);
  const [firstListenCorrect, setFirstListenCorrect] = useState(0);
  const [firstListenTotal, setFirstListenTotal] = useState(0);
  const [firstListenWithReplayCorrect, setFirstListenWithReplayCorrect] =
    useState(0);
  const [listenCompromised, setListenCompromised] = useState(false);
  const [highestAssistLevel, setHighestAssistLevel] =
    useState<ListeningAssistLevel>(0);
  const [reductionCorrect, setReductionCorrect] = useState(0);
  const [reductionTotal, setReductionTotal] = useState(0);
  const [inferenceCorrect, setInferenceCorrect] = useState(0);
  const [inferenceTotal, setInferenceTotal] = useState(0);
  const [repairCounts, setRepairCounts] = useState(emptyRepairCounts());
  const [facts, setFacts] = useState<Record<string, string>>({});
  const [factLabels, setFactLabels] = useState<Record<string, string>>({});
  const [understoodFacts, setUnderstoodFacts] = useState<Set<string>>(
    () => new Set()
  );
  const [repairFlash, setRepairFlash] = useState<string | null>(null);
  const autoPlayTokenRef = useRef(0);
  const countedListenNodesRef = useRef<Set<string>>(new Set());
  const countedReductionRef = useRef<Set<string>>(new Set());
  const countedInferenceRef = useRef<Set<string>>(new Set());
  const nodeReplayUsedRef = useRef(false);
  /** Speak quest title JP→EN once per Auto Voice session. */
  const titleSpokenRef = useRef(false);
  /** Play/Quiz-style: only the active surface receives karaoke. */
  const [karaokeSurface, setKaraokeSurface] = useState<KaraokeSurface | null>(
    null
  );
  /** Pre-answer checkpoints for Back / Try Again / Forward. */
  const [navHistory, setNavHistory] = useState<ConversationNavCheckpoint[]>(
    []
  );
  const [navForward, setNavForward] = useState<ConversationNavCheckpoint[]>(
    []
  );
  const [arrivalCheckpoint, setArrivalCheckpoint] =
    useState<ConversationNavCheckpoint | null>(null);

  // Each quest page opens with Auto Voice OFF (user can turn it on).
  useEffect(() => {
    titleSpokenRef.current = false;
    setKaraokeSurface(null);
    setNavHistory([]);
    setNavForward([]);
    setArrivalCheckpoint(
      conversation
        ? emptyConversationNavCheckpoint(
            conversation.startNodeId,
            quest?.startingConfidence ?? 5,
            defaultCommunicationStart()
          )
        : null
    );
    if (speech.autoVoice) speech.setAutoVoice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId]);

  useEffect(() => {
    if (!speech.autoVoice) {
      titleSpokenRef.current = false;
      setKaraokeSurface(null);
    }
  }, [speech.autoVoice]);

  const node = useMemo(() => {
    if (!conversation || !nodeId) return null;
    return getConversationNode(conversation, nodeId) ?? null;
  }, [conversation, nodeId]);

  const npc = node?.npcId ? getNpcById(node.npcId) : undefined;
  const location = quest ? getLocationById(quest.locationId) : undefined;
  const isInteractive = Boolean(node?.choices && node.choices.length > 0);
  const immersionBlocksEn = immersionEnabled && !showHelp && !revealed;
  const isPhone = conversation?.presentation === "phone";
  const isAudioFirst = Boolean(node?.audioFirst || node?.listenOnly);
  const hideTranscript =
    isAudioFirst &&
    (node?.speech?.karaokeMode === "after-answer" ||
      node?.audioFirst ||
      node?.listenOnly) &&
    !revealed &&
    !showHelp;
  const karaokeEnabled = !hideTranscript;

  // Track listening / audio-first nodes for first-listen metrics.
  useEffect(() => {
    if (!node) return;
    nodeReplayUsedRef.current = false;
    if (!isListeningBeat(node)) return;
    if (countedListenNodesRef.current.has(node.id)) return;
    if (!node.choices?.length) return;
    countedListenNodesRef.current.add(node.id);
    setFirstListenTotal((n) => n + 1);
    setListenCompromised(false);
  }, [node?.id]);

  // Count reduction / inference beats once when entered.
  useEffect(() => {
    if (!node?.choices?.length) return;
    const features = nodeSpokenFeatures(node);
    const isReduction = features.some(
      (f) =>
        f === "contraction" ||
        f === "reduced-sound" ||
        f === "omitted-particle" ||
        f === "casual-ending" ||
        f === "filler"
    );
    if (isReduction && !countedReductionRef.current.has(node.id)) {
      countedReductionRef.current.add(node.id);
      setReductionTotal((n) => n + 1);
    }
    if (
      (node.intendedMeaning ||
        node.contextMeaning ||
        features.includes("implied-meaning")) &&
      !countedInferenceRef.current.has(node.id)
    ) {
      countedInferenceRef.current.add(node.id);
      setInferenceTotal((n) => n + 1);
    }
  }, [node?.id]);

  // Merge authored facts when entering a node.
  useEffect(() => {
    if (!node?.setsFacts) return;
    setFacts((prev) => ({ ...prev, ...node.setsFacts }));
    if (node.factLabels) {
      setFactLabels((prev) => ({ ...prev, ...node.factLabels }));
    }
  }, [node?.id]);

  // Keep a pre-answer arrival checkpoint while the step is unanswered
  // (re-runs after listen/fact counters settle on the same node).
  useEffect(() => {
    if (!node || revealed) return;
    setArrivalCheckpoint(
      cloneConversationNavCheckpoint({
        nodeId: node.id,
        confidence,
        communication,
        naturalStreak,
        maxNaturalStreak,
        correctCount,
        answeredCount,
        mistakes,
        conceptsLearned,
        needsReview,
        vocabDiscovered,
        monsters,
        relationshipDeltas,
        qualityCounts,
        socialFitQualities,
        professionalFitQualities,
        reportingTags,
        repairedConversation,
        repairCounts,
        facts,
        factLabels,
        understoodFacts: [...understoodFacts],
        firstListenCorrect,
        firstListenTotal,
        firstListenWithReplayCorrect,
        listenCompromised,
        highestAssistLevel,
        reductionCorrect,
        reductionTotal,
        inferenceCorrect,
        inferenceTotal,
        helpUses,
        usedEnglishAssist,
        showHelp,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    node?.id,
    revealed,
    confidence,
    communication,
    naturalStreak,
    maxNaturalStreak,
    correctCount,
    answeredCount,
    firstListenTotal,
    reductionTotal,
    inferenceTotal,
    facts,
    helpUses,
    showHelp,
    listenCompromised,
    repairedConversation,
  ]);

  // Auto-play: title JP→EN (once) → subject JP→EN → choices JP→EN → help.
  // After an answer is revealed, skip — tip/feedback TTS owns that beat.
  useEffect(() => {
    if (!node || !quest) return;
    let cancelled = false;
    setChoiceHighlightId(null);
    setFeedbackJaFocus(null);
    setFeedbackEnFocus(null);
    setKaraokeSurface(null);
    autoPlayTokenRef.current += 1;
    const token = autoPlayTokenRef.current;

    if (revealed) {
      return () => {
        cancelled = true;
      };
    }

    speech.stop();

    if (!speech.autoVoice || !nodeSpeechEnabled(node)) {
      return () => {
        cancelled = true;
      };
    }

    const forceSlow = Boolean(node.forceSlowSpeech);
    const nodeRate = resolveNodeSpeechRate({
      nodeSpeechRate: node.speechRate,
      forceSlowSpeech: forceSlow,
      userRateMode: speech.rateMode,
    });

    type QueueItem =
      | {
          kind: "ja";
          text: string;
          reading?: string;
          choiceId?: string;
          surface: KaraokeSurface;
        }
      | {
          kind: "en";
          text: string;
          choiceId?: string;
          surface: KaraokeSurface;
        }
      | { kind: "bilingual"; text: string; surface: KaraokeSurface };

    const speakEnBody = !immersionBlocksEn && !(hideTranscript && !revealed);
    const includeTitle = !titleSpokenRef.current;
    if (includeTitle) titleSpokenRef.current = true;

    const queue: QueueItem[] = [];
    if (includeTitle) {
      const titleJa = quest.japaneseTitle?.trim() ?? "";
      const titleEn = quest.title?.trim() ?? "";
      if (titleJa) {
        queue.push({ kind: "ja", text: titleJa, surface: "title" });
      }
      if (!immersionBlocksEn && titleEn) {
        queue.push({ kind: "en", text: titleEn, surface: "title" });
      }
    }
    if (node.japanese.trim()) {
      queue.push({
        kind: "ja",
        text: node.japanese,
        reading: node.reading,
        surface: "prompt",
      });
    }
    if (speakEnBody && node.english?.trim()) {
      queue.push({ kind: "en", text: node.english, surface: "prompt" });
    } else if (showHelp && node.english?.trim() && !immersionBlocksEn) {
      queue.push({ kind: "en", text: node.english, surface: "prompt" });
    }
    if (!revealed && node.choices && !hideTranscript) {
      for (const c of node.choices) {
        queue.push({
          kind: "ja",
          text: c.japanese,
          reading: c.reading,
          choiceId: c.id,
          surface: "choice",
        });
        if (speakEnBody && c.english?.trim()) {
          queue.push({
            kind: "en",
            text: c.english,
            choiceId: c.id,
            surface: "choice",
          });
        } else if (showHelp && c.english?.trim() && !immersionBlocksEn) {
          queue.push({
            kind: "en",
            text: c.english,
            choiceId: c.id,
            surface: "choice",
          });
        }
      }
    }
    if (showHelp && node.helpHint?.trim()) {
      queue.push({
        kind: "bilingual",
        text: node.helpHint,
        surface: "feedback",
      });
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
          setFeedbackEnFocus(null);
          setKaraokeSurface(null);
          onDone();
          return;
        }
        const next = () => playSeg(index + 1);
        setKaraokeSurface("feedback");
        if (seg.language === "ja") {
          setFeedbackJaFocus(seg.text);
          setFeedbackEnFocus(null);
          speech.speakJapanese(seg.text, { karaoke: true, onEnded: next });
        } else {
          setFeedbackJaFocus(null);
          setFeedbackEnFocus(seg.text);
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
        setKaraokeSurface(null);
        return;
      }
      const next = () => playItem(index + 1);
      setKaraokeSurface(item.surface);
      if (item.kind === "ja") {
        if (item.choiceId) setChoiceHighlightId(item.choiceId);
        else setChoiceHighlightId(null);
        speech.speakJapanese(item.text, {
          reading: item.reading,
          rate: nodeRate,
          karaoke: karaokeEnabled,
          onEnded: () => {
            if (item.choiceId) setChoiceHighlightId(null);
            next();
          },
        });
      } else if (item.kind === "en") {
        if (item.choiceId) setChoiceHighlightId(item.choiceId);
        else setChoiceHighlightId(null);
        speech.speakEnglish(item.text, {
          karaoke: true,
          onEnded: () => {
            if (item.choiceId) setChoiceHighlightId(null);
            next();
          },
        });
      } else {
        playBilingual(item.text, next);
      }
    };

    const timer = window.setTimeout(() => {
      if (cancelled || token !== autoPlayTokenRef.current) return;
      playItem(0);
    }, SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    questId,
    nodeId,
    nodePlayKey,
    speech.autoVoice,
    speech.rateMode,
    showHelp,
    revealed,
    hideTranscript,
  ]);

  // Speak tip/feedback after an answer (Nanami for JP, Andrew for EN + karaoke).
  useEffect(() => {
    if (!revealed || !feedback) return;
    if (!hasSpeakableFeedback(feedback)) return;

    let cancelled = false;
    feedbackSpeakTokenRef.current += 1;
    const token = feedbackSpeakTokenRef.current;
    const segments = parseBilingualSpeakSegments(feedback);

    const playSeg = (index: number) => {
      if (cancelled || token !== feedbackSpeakTokenRef.current) return;
      const seg = segments[index];
      if (!seg) {
        setFeedbackJaFocus(null);
        setFeedbackEnFocus(null);
        setKaraokeSurface(null);
        return;
      }
      setKaraokeSurface("feedback");
      if (seg.language === "ja") {
        setFeedbackJaFocus(seg.text);
        setFeedbackEnFocus(null);
        speech.speakJapanese(seg.text, {
          karaoke: true,
          onEnded: () => playSeg(index + 1),
        });
      } else {
        setFeedbackJaFocus(null);
        setFeedbackEnFocus(seg.text);
        speech.speakEnglish(seg.text, {
          karaoke: true,
          onEnded: () => playSeg(index + 1),
        });
      }
    };

    const timer = window.setTimeout(() => {
      if (cancelled || token !== feedbackSpeakTokenRef.current) return;
      playSeg(0);
    }, SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, feedback, selectedId]);

  if (!quest || !conversation || !node) {
    return (
      <div className="ppq-quest">
        <p>Conversation not found.</p>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onQuit}>
          Back
        </button>
      </div>
    );
  }

  const activeConversation = conversation;
  const activeNode = node;

  function replayNodeUtterance(slow: boolean) {
    if (!activeNode.japanese.trim()) return;
    speech.stop();
    setListenCompromised(true);
    nodeReplayUsedRef.current = true;
    setHighestAssistLevel((lvl) => bumpAssistLevel(lvl, slow ? 2 : 1));
    setKaraokeSurface("prompt");
    setChoiceHighlightId(null);
    const rate = resolveNodeSpeechRate({
      nodeSpeechRate: activeNode.speechRate,
      forceSlowSpeech: activeNode.forceSlowSpeech,
      userRateMode: speech.rateMode,
      forceSlowReplay: slow,
    });
    speech.speakJapanese(activeNode.japanese, {
      reading: activeNode.reading,
      rate,
      karaoke: karaokeEnabled,
    });
  }

  function finish(success: boolean) {
    speech.stop();
    const answered = Math.max(answeredCount, 1);
    const rawAccuracy = Math.round((correctCount / answered) * 100);
    const accuracy = Math.max(0, rawAccuracy - Math.min(5, helpUses));
    const immersionNoEnglish =
      immersionEnabled && !usedEnglishAssist && helpUses === 0;
    const summaryFacts = buildSummaryFacts(facts, factLabels, understoodFacts);
    const nativeListeningPercent =
      firstListenTotal > 0 ||
      reductionTotal > 0 ||
      inferenceTotal > 0 ||
      repairedConversation
        ? nativeListeningFromRun({
            firstListenCorrect,
            firstListenTotal,
            reductionCorrect,
            reductionTotal,
            inferenceCorrect,
            inferenceTotal,
            repairSuccess: repairedConversation,
          })
        : undefined;
    const outcome: QuestRunOutcome = {
      success,
      accuracy,
      confidenceLeft: confidence,
      correct: correctCount,
      answered: answeredCount,
      mistakes,
      monsters,
      vocabDiscovered,
      helpUses,
      communicationPercent: communication,
      immersionNoEnglish,
      firstListenSuccess:
        firstListenTotal === 0 ? false : firstListenCorrect === firstListenTotal,
      repairedConversation,
      conceptsLearned: [...new Set(conceptsLearned)],
      engine: "v2",
      naturalResponseStreak: naturalStreak,
      maxNaturalStreak,
      needsReview: [...new Set(needsReview)],
      relationshipDeltas,
      repairUsed: repairedConversation,
      qualityCounts,
      socialFitPercent: socialFitFromQualities(socialFitQualities),
      professionalFitPercent:
        professionalFitQualities.length > 0
          ? professionalFitFromQualities(professionalFitQualities)
          : undefined,
      reportingQuality:
        reportingTags.length > 0
          ? summarizeReportingTags(reportingTags)
          : undefined,
      repairCounts,
      summaryFacts,
      firstListenCorrect,
      firstListenTotal,
      firstListenWithReplayCorrect,
      highestAssistLevel,
      nativeListeningPercent,
      resultSummaryTitle: activeConversation.resultSummaryTitle,
    };
    onFinished(outcome);
  }

  function restoreCheckpoint(checkpoint: ConversationNavCheckpoint) {
    setConfidence(checkpoint.confidence);
    setCommunication(checkpoint.communication);
    setNaturalStreak(checkpoint.naturalStreak);
    setMaxNaturalStreak(checkpoint.maxNaturalStreak);
    setCorrectCount(checkpoint.correctCount);
    setAnsweredCount(checkpoint.answeredCount);
    setMistakes(checkpoint.mistakes.map((m) => ({ ...m })));
    setConceptsLearned([...checkpoint.conceptsLearned]);
    setNeedsReview([...checkpoint.needsReview]);
    setVocabDiscovered([...checkpoint.vocabDiscovered]);
    setMonsters([...checkpoint.monsters]);
    setRelationshipDeltas(
      checkpoint.relationshipDeltas.map((r) => ({ ...r }))
    );
    setQualityCounts({ ...checkpoint.qualityCounts });
    setSocialFitQualities([...checkpoint.socialFitQualities]);
    setProfessionalFitQualities([...checkpoint.professionalFitQualities]);
    setReportingTags([...checkpoint.reportingTags]);
    setRepairedConversation(checkpoint.repairedConversation);
    setRepairCounts({ ...checkpoint.repairCounts });
    setFacts({ ...checkpoint.facts });
    setFactLabels({ ...checkpoint.factLabels });
    setUnderstoodFacts(new Set(checkpoint.understoodFacts));
    setFirstListenCorrect(checkpoint.firstListenCorrect);
    setFirstListenTotal(checkpoint.firstListenTotal);
    setFirstListenWithReplayCorrect(checkpoint.firstListenWithReplayCorrect);
    setListenCompromised(checkpoint.listenCompromised);
    setHighestAssistLevel(checkpoint.highestAssistLevel);
    setReductionCorrect(checkpoint.reductionCorrect);
    setReductionTotal(checkpoint.reductionTotal);
    setInferenceCorrect(checkpoint.inferenceCorrect);
    setInferenceTotal(checkpoint.inferenceTotal);
    setHelpUses(checkpoint.helpUses);
    setUsedEnglishAssist(checkpoint.usedEnglishAssist);
    setShowHelp(checkpoint.showHelp);
  }

  function clearStepRevealUi() {
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setQualityLabel(null);
    setContextHint(null);
    setPendingNextId(null);
    setRepairFlash(null);
    setFeedbackJaFocus(null);
    setFeedbackEnFocus(null);
    setChoiceHighlightId(null);
  }

  function applyCheckpointToStep(checkpoint: ConversationNavCheckpoint) {
    restoreCheckpoint(checkpoint);
    setNodeId(checkpoint.nodeId);
    clearStepRevealUi();
    setArrivalCheckpoint(cloneConversationNavCheckpoint(checkpoint));
    setNodePlayKey((k) => k + 1);
  }

  function goToNode(nextId: string) {
    let targetId = nextId;
    for (let guard = 0; guard < 8; guard += 1) {
      const candidate = getConversationNode(activeConversation, targetId);
      if (!candidate) break;
      const hasChoices = Boolean(candidate.choices?.length);
      const isTerminal =
        candidate.endState === "success" || candidate.endState === "failure";
      if (hasChoices || isTerminal || candidate.japanese.trim()) break;
      const routed = resolveRelationshipBranch(candidate, relationships);
      if (!routed || routed === targetId) break;
      targetId = routed;
    }
    const next = getConversationNode(activeConversation, targetId);
    if (!next) {
      finish(false);
      return;
    }
    if (arrivalCheckpoint) {
      const pushed = pushHistoryClearingForward(
        navHistory,
        arrivalCheckpoint
      );
      setNavHistory(pushed.history);
      setNavForward(pushed.forward);
    }
    setNodeId(targetId);
    clearStepRevealUi();
    setShowHelp(false);
    setListenCompromised(false);
    setNodePlayKey((k) => k + 1);
  }

  function onRetryStep() {
    if (!arrivalCheckpoint || !canRetryStep(revealed, isInteractive)) return;
    speech.stop();
    applyCheckpointToStep(arrivalCheckpoint);
  }

  function onNavBack() {
    if (!arrivalCheckpoint || !canStepBack(navHistory.length)) return;
    const moved = stepBackNav(navHistory, navForward, arrivalCheckpoint);
    if (!moved) return;
    speech.stop();
    setNavHistory(moved.history);
    setNavForward(moved.forward);
    applyCheckpointToStep(moved.current);
  }

  function onNavForward() {
    if (navForward.length > 0 && arrivalCheckpoint) {
      const moved = stepForwardNav(navHistory, navForward, arrivalCheckpoint);
      if (!moved) return;
      speech.stop();
      setNavHistory(moved.history);
      setNavForward(moved.forward);
      applyCheckpointToStep(moved.current);
      return;
    }
    onContinue();
  }

  function onSelectChoice(choiceId: string) {
    if (revealed) return;
    const choice = getConversationChoice(activeNode, choiceId);
    if (!choice) return;
    speech.stop();

    // In-place replay repairs (repeat / slow) — tip first, then replay the beat.
    if (choice.replayCurrent) {
      const applied = applyConversationChoice({
        choice,
        communication,
        confidence,
        naturalStreak,
        maxNaturalStreak,
      });
      setCommunication(applied.communication);
      setRepairCounts((c) => bumpRepairCount(c, choice.repairKind));
      setRepairedConversation(true);
      setListenCompromised(true);
      const tip = choice.feedback ?? applied.qualityLabel;
      setRepairFlash(tip);
      if (choice.vocabHint) {
        setConceptsLearned((prev) => [...prev, choice.vocabHint!]);
      }
      const slow = choice.repairKind === "slow";
      if (tip && hasSpeakableFeedback(tip)) {
        speakFeedbackTip(tip, () => replayNodeUtterance(slow));
      } else {
        replayNodeUtterance(slow);
      }
      return;
    }

    const applied = applyConversationChoice({
      choice,
      communication,
      confidence,
      naturalStreak,
      maxNaturalStreak,
    });

    setSelectedId(choiceId);
    setRevealed(true);
    setCommunication(applied.communication);
    setConfidence(applied.confidence);
    setNaturalStreak(applied.naturalStreak);
    setMaxNaturalStreak(applied.maxNaturalStreak);
    setAnsweredCount((n) => n + 1);
    setQualityCounts((prev) => ({
      ...prev,
      [applied.quality]: prev[applied.quality] + 1,
    }));
    if (nodeCountsTowardSocialFit(activeNode)) {
      setSocialFitQualities((prev) => [...prev, applied.quality]);
    }
    if (nodeCountsTowardProfessionalFit(activeNode)) {
      setProfessionalFitQualities((prev) => [...prev, applied.quality]);
    }
    if (choice.reportingTags?.length) {
      setReportingTags((prev) => [...prev, ...choice.reportingTags!]);
    }
    setQualityLabel(applied.qualityLabel);
    setFeedback(choice.feedback ?? applied.qualityLabel);
    setFeedbackGood(
      applied.quality === "excellent" ||
        applied.quality === "natural" ||
        applied.quality === "acceptable"
    );
    setPendingNextId(applied.nextNodeId);
    if (
      showContextHint &&
      (applied.quality === "awkward" || applied.quality === "incorrect")
    ) {
      setContextHint("Think about your relationship with this person.");
    } else if (
      showReportingHint &&
      (applied.quality === "awkward" || applied.quality === "incorrect") &&
      (activeNode.socialContext === "boss" ||
        activeNode.socialContext === "manager" ||
        choice.reportingTags?.includes("too-much-detail") ||
        choice.reportingTags?.includes("excuse-heavy"))
    ) {
      setContextHint("Lead with the conclusion.");
    } else if (
      showKeigoSenseHint &&
      (applied.quality === "awkward" || applied.quality === "incorrect") &&
      nodeCountsTowardProfessionalFit(activeNode)
    ) {
      setContextHint(
        "Think about whether this person is internal or external."
      );
    } else if (
      showListeningAdaptationHint &&
      (applied.quality === "awkward" || applied.quality === "incorrect") &&
      nodeCountsTowardNativeListening(activeNode)
    ) {
      setContextHint(
        "Listen for the key noun/time/place, not every word."
      );
    } else {
      setContextHint(null);
    }

    if (
      applied.quality === "excellent" ||
      applied.quality === "natural" ||
      applied.quality === "acceptable"
    ) {
      setCorrectCount((n) => n + 1);
    }

    if (applied.isRepair) {
      setRepairedConversation(true);
      setRepairCounts((c) => bumpRepairCount(c, choice.repairKind));
    }

    if (isListeningBeat(activeNode)) {
      const good = isListeningQualityOk(applied.quality);
      if (good && !listenCompromised && !showHelp) {
        setFirstListenCorrect((n) => n + 1);
        setFirstListenWithReplayCorrect((n) => n + 1);
      } else if (good && nodeReplayUsedRef.current) {
        setFirstListenWithReplayCorrect((n) => n + 1);
      }
    }

    const features = nodeSpokenFeatures(activeNode);
    if (
      features.some(
        (f) =>
          f === "contraction" ||
          f === "reduced-sound" ||
          f === "omitted-particle" ||
          f === "casual-ending" ||
          f === "filler"
      ) &&
      isListeningQualityOk(applied.quality)
    ) {
      setReductionCorrect((n) => n + 1);
    }
    if (
      (activeNode.intendedMeaning ||
        activeNode.contextMeaning ||
        features.includes("implied-meaning")) &&
      isListeningQualityOk(applied.quality)
    ) {
      setInferenceCorrect((n) => n + 1);
    }

    // Append contextual meaning to feedback when available.
    if (
      (activeNode.contextMeaning || activeNode.intendedMeaning) &&
      choice.feedback
    ) {
      const meaning = activeNode.contextMeaning ?? activeNode.intendedMeaning;
      if (meaning && !choice.feedback.includes(meaning)) {
        setFeedback(
          `${choice.feedback}\n\nIn this context, it most likely means: ${meaning}`
        );
      }
    }

    if (choice.checksFact && choice.expectedFactValue) {
      const actual = facts[choice.checksFact];
      if (
        actual === choice.expectedFactValue ||
        (applied.quality !== "incorrect" &&
          actual &&
          choice.japanese.includes(actual))
      ) {
        setUnderstoodFacts((prev) => new Set(prev).add(choice.checksFact!));
      }
    }
    // Successful answers on a fact-setting beat mark those facts understood.
    if (
      applied.quality === "excellent" ||
      applied.quality === "natural" ||
      applied.quality === "acceptable"
    ) {
      if (activeNode.setsFacts) {
        setUnderstoodFacts((prev) => {
          const next = new Set(prev);
          for (const key of Object.keys(activeNode.setsFacts!)) next.add(key);
          return next;
        });
      }
      for (const [key, value] of Object.entries(facts)) {
        if (choice.japanese.includes(value)) {
          setUnderstoodFacts((prev) => new Set(prev).add(key));
        }
      }
    }

    const npcId = activeNode.npcId;
    if (npcId && applied.relationshipDelta !== 0) {
      setRelationshipDeltas((prev) => {
        const existing = prev.find((r) => r.npcId === npcId);
        if (existing) {
          return prev.map((r) =>
            r.npcId === npcId
              ? { ...r, delta: r.delta + applied.relationshipDelta }
              : r
          );
        }
        return [...prev, { npcId, delta: applied.relationshipDelta }];
      });
    }

    const hints = [
      ...applied.conceptHints,
      activeNode.vocabHint,
      activeNode.grammarHint,
      choice.vocabHint,
      choice.grammarHint,
    ].filter((x): x is string => Boolean(x?.trim()));

    if (
      applied.quality === "excellent" ||
      applied.quality === "natural" ||
      applied.isClarification
    ) {
      setConceptsLearned((prev) => [...prev, ...hints]);
      setVocabDiscovered((prev) => [...prev, ...hints]);
    }

    if (applied.quality === "incorrect" || applied.quality === "awkward") {
      setNeedsReview((prev) => [...prev, ...hints]);
      for (const h of hints) {
        setMonsters((prev) => (prev.includes(h) ? prev : [...prev, h]));
      }
      const correct = activeNode.choices?.find(
        (c) => c.quality === "excellent" || c.quality === "natural"
      );
      setMistakes((prev) => [
        ...prev,
        {
          stepId: activeNode.id,
          promptJa: activeNode.japanese,
          selectedLabel: choice.japanese,
          correctLabel: correct?.japanese ?? "",
          feedback: choice.feedback ?? applied.qualityLabel,
          vocabHint: choice.vocabHint ?? activeNode.vocabHint,
        },
      ]);
    }
    // Feedback tip TTS is handled by the revealed+feedback effect (JP/EN mix).
  }

  /** Speak a tip/feedback string with Nanami→Andrew + karaoke, then optional next. */
  function speakFeedbackTip(raw: string, onDone?: () => void) {
    const segments = parseBilingualSpeakSegments(raw);
    if (segments.length === 0) {
      onDone?.();
      return;
    }
    feedbackSpeakTokenRef.current += 1;
    const token = feedbackSpeakTokenRef.current;
    const playSeg = (index: number) => {
      if (token !== feedbackSpeakTokenRef.current) return;
      const seg = segments[index];
      if (!seg) {
        setFeedbackJaFocus(null);
        setFeedbackEnFocus(null);
        setKaraokeSurface(null);
        onDone?.();
        return;
      }
      setKaraokeSurface("feedback");
      if (seg.language === "ja") {
        setFeedbackJaFocus(seg.text);
        setFeedbackEnFocus(null);
        speech.speakJapanese(seg.text, {
          karaoke: true,
          onEnded: () => playSeg(index + 1),
        });
      } else {
        setFeedbackJaFocus(null);
        setFeedbackEnFocus(seg.text);
        speech.speakEnglish(seg.text, {
          karaoke: true,
          onEnded: () => playSeg(index + 1),
        });
      }
    };
    playSeg(0);
  }

  function onContinue() {
    if (activeNode.endState === "success") {
      finish(true);
      return;
    }
    if (activeNode.endState === "failure") {
      finish(false);
      return;
    }
    if (confidence <= 0) {
      finish(false);
      return;
    }
    if (pendingNextId) {
      goToNode(pendingNextId);
      return;
    }
    if (activeNode.nextNodeId || activeNode.relationshipBranches?.length) {
      const next =
        resolveRelationshipBranch(activeNode, relationships) ??
        activeNode.nextNodeId;
      if (next) goToNode(next);
      return;
    }
  }

  function onToggleHelp() {
    if (!showHelp) {
      setHelpUses((n) => n + 1);
      setUsedEnglishAssist(true);
      setHighestAssistLevel((lvl) =>
        bumpAssistLevel(lvl, immersionEnabled ? 4 : 3)
      );
      if (isListeningBeat(activeNode) && !revealed) {
        setListenCompromised(true);
      }
    }
    setShowHelp((v) => !v);
  }

  function handleQuit() {
    speech.stop();
    onQuit();
  }

  const showPromptEn =
    Boolean(node.english) &&
    !immersionBlocksEn &&
    (showHelp || (!immersionEnabled && (!isInteractive || revealed)));

  const continueLabel =
    node.endState === "success"
      ? "Finish"
      : node.endState === "failure"
        ? "Leave"
        : !isInteractive &&
            (node.id === "incoming" || node.id === "arrive")
          ? "Begin"
          : "Forward";

  const canForward =
    navForward.length > 0 ||
    Boolean(node.endState) ||
    !isInteractive ||
    revealed;

  const callerKnown =
    isPhone && (Boolean(npc) || Boolean(facts.caller))
      ? facts.caller ?? npc?.japaneseName ?? "…"
      : null;

  return (
    <div
      className={
        isPhone ? "ppq-quest ppq-quest-enter ppq-quest--phone" : "ppq-quest ppq-quest-enter"
      }
    >
      <div className="ppq-quest-banner">
        <p style={{ margin: 0, fontSize: 12, color: "var(--ppq-muted)" }}>
          {isPhone ? "📞" : location?.icon ?? "📍"}{" "}
          {location?.name ?? quest.locationId} · Conversation
          {quest.difficulty === "boss" ? " · Boss" : ""}
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
        {isPhone ? (
          <div className="ppq-phone-status" role="status">
            <span className="ppq-phone-status__dot" aria-hidden />
            {node.id === "incoming" ? "Incoming Call" : "Call in progress"}
            {callerKnown && node.id !== "incoming" ? (
              <span className="ppq-phone-status__caller" lang="ja">
                {callerKnown}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ppq-quest-toolbar">
        <div className="ppq-quest-meters">
          <ConfidenceHearts
            confidence={confidence}
            max={quest.startingConfidence}
          />
          <CommunicationMeter percent={communication} />
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
            onClick={() => speech.setRateMode("normal")}
          >
            1.0×
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "slow"
                ? "ppq-btn ppq-btn--ghost ppq-btn--speech-on"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={speech.rateMode === "slow"}
            onClick={() => speech.setRateMode("slow")}
          >
            0.75×
          </button>
          {(node.helpHint || node.reading || node.english) &&
          (isInteractive || immersionEnabled || !isInteractive) ? (
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

      <section className="ppq-dialogue">
        {npc && !isPhone ? <NpcPortrait npc={npc} /> : null}
        {npc && isPhone ? (
          <div className="ppq-phone-avatar" aria-hidden>
            <span>{npc.portrait ?? "📞"}</span>
            <span lang="ja">{npc.japaneseName}</span>
          </div>
        ) : null}

        <div className="ppq-line-row">
          {hideTranscript ? (
            <div className="ppq-listen-hidden" data-testid="transcript-hidden">
              <p className="ppq-listening-state" style={{ margin: 0 }}>
                Listening
              </p>
              <p className="ppq-prompt-en" style={{ margin: "4px 0 0" }}>
                {immersionBlocksEn
                  ? "よく聞いてください。"
                  : "Transcript hidden"}
              </p>
              <p className="ppq-listen-hint">Transcript hidden until you answer or use Help.</p>
            </div>
          ) : (
            <HighlightedJapanese
              text={activeNode.japanese}
              className="ppq-prompt-ja"
              highlight={
                karaokeSurface === "prompt" &&
                speech.activeLang === "ja" &&
                !choiceHighlightId
                  ? speech.highlight
                  : null
              }
            />
          )}
          {activeNode.japanese.trim() ? (
            <div className="ppq-replay-group">
              <button
                type="button"
                className="ppq-speak-btn"
                aria-label="Replay Japanese dialogue"
                data-testid="replay-normal"
                onClick={() => {
                  replayNodeUtterance(false);
                }}
              >
                🔊
              </button>
              {isAudioFirst && !revealed ? (
                <button
                  type="button"
                  className="ppq-btn ppq-btn--ghost ppq-btn--slow-replay"
                  data-testid="replay-slow"
                  aria-label="Slow replay"
                  onClick={() => {
                    setRepairCounts((c) => bumpRepairCount(c, "slow"));
                    setRepairedConversation(true);
                    replayNodeUtterance(true);
                  }}
                >
                  Slow
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {showHelp && activeNode.reading && !hideTranscript ? (
          <div className="ppq-reading-hint">{activeNode.reading}</div>
        ) : null}

        {showPromptEn && activeNode.english && !hideTranscript ? (
          <div className="ppq-prompt-en-row">
            <HighlightedEnglish
              text={activeNode.english}
              className="ppq-prompt-en"
              highlight={
                karaokeSurface === "prompt" && speech.activeLang === "en"
                  ? speech.highlight
                  : null
              }
            />
            <button
              type="button"
              className="ppq-speak-btn"
              aria-label="Play English narration"
              onClick={() => {
                setKaraokeSurface("prompt");
                speech.speakEnglish(activeNode.english!, { karaoke: true });
              }}
            >
              🔊
            </button>
          </div>
        ) : null}

        {showHelp && activeNode.helpHint ? (
          <p className="ppq-help-hint">
            💡{" "}
            <FeedbackTipText
              text={activeNode.helpHint}
              jaFocus={
                karaokeSurface === "feedback" ? feedbackJaFocus : null
              }
              enFocus={
                karaokeSurface === "feedback" ? feedbackEnFocus : null
              }
              jaHighlight={
                karaokeSurface === "feedback" && speech.activeLang === "ja"
                  ? speech.highlight
                  : null
              }
              enHighlight={
                karaokeSurface === "feedback" && speech.activeLang === "en"
                  ? speech.highlight
                  : null
              }
            />
          </p>
        ) : null}

        {repairFlash && !revealed ? (
          <div className="ppq-repair-flash" role="status">
            <FeedbackTipText
              text={repairFlash}
              jaFocus={
                karaokeSurface === "feedback" ? feedbackJaFocus : null
              }
              enFocus={
                karaokeSurface === "feedback" ? feedbackEnFocus : null
              }
              jaHighlight={
                karaokeSurface === "feedback" && speech.activeLang === "ja"
                  ? speech.highlight
                  : null
              }
              enHighlight={
                karaokeSurface === "feedback" && speech.activeLang === "en"
                  ? speech.highlight
                  : null
              }
            />
          </div>
        ) : null}

        {activeNode.choices && activeNode.choices.length > 0 ? (
          <div className="ppq-choices" role="list">
            {activeNode.choices.map((choice, index) => (
              <ChoiceRow
                key={choice.id}
                choice={choice}
                index={index}
                revealed={revealed}
                selectedId={selectedId}
                showHelp={showHelp}
                immersionBlocksEn={immersionBlocksEn}
                choiceHighlightId={choiceHighlightId}
                highlight={
                  choiceHighlightId === choice.id &&
                  karaokeSurface === "choice" &&
                  speech.activeLang === "ja"
                    ? speech.highlight
                    : null
                }
                enHighlight={
                  choiceHighlightId === choice.id &&
                  karaokeSurface === "choice" &&
                  speech.activeLang === "en" &&
                  choice.english
                    ? speech.highlight
                    : null
                }
                speaking={speech.status === "speaking"}
                onSelect={() => onSelectChoice(choice.id)}
                onReplay={() => {
                  setKaraokeSurface("choice");
                  setChoiceHighlightId(choice.id);
                  speech.speakJapanese(choice.japanese, {
                    reading: choice.reading,
                    karaoke: true,
                  });
                }}
              />
            ))}
          </div>
        ) : null}

        {qualityLabel && revealed ? (
          <p className="ppq-quality-label" role="status">
            {qualityLabel}
          </p>
        ) : null}

        {contextHint ? (
          <p className="ppq-context-hint" role="note">
            💭 {contextHint}
          </p>
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
                <FeedbackTipText
                  text={feedback}
                  jaFocus={
                    karaokeSurface === "feedback" ? feedbackJaFocus : null
                  }
                  enFocus={
                    karaokeSurface === "feedback" ? feedbackEnFocus : null
                  }
                  jaHighlight={
                    karaokeSurface === "feedback" && speech.activeLang === "ja"
                      ? speech.highlight
                      : null
                  }
                  enHighlight={
                    karaokeSurface === "feedback" && speech.activeLang === "en"
                      ? speech.highlight
                      : null
                  }
                />
              </div>
              {hasSpeakableFeedback(feedback) ? (
                <button
                  type="button"
                  className="ppq-speak-btn"
                  aria-label="Play feedback tip"
                  onClick={() => {
                    speech.stop();
                    speakFeedbackTip(feedback);
                  }}
                >
                  🔊
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <QuestStepNav
          canBack={canStepBack(navHistory.length)}
          canRetry={canRetryStep(revealed, isInteractive)}
          canForward={canForward}
          forwardLabel={continueLabel}
          onBack={onNavBack}
          onRetry={onRetryStep}
          onForward={onNavForward}
        />

        {naturalStreak > 0 ? (
          <p style={{ fontSize: 12, color: "var(--ppq-muted)", marginTop: 8 }}>
            Natural streak: {naturalStreak}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function ChoiceRow({
  choice,
  index,
  revealed,
  selectedId,
  showHelp,
  immersionBlocksEn,
  choiceHighlightId,
  highlight,
  enHighlight,
  speaking,
  onSelect,
  onReplay,
}: {
  choice: ConversationChoice;
  index: number;
  revealed: boolean;
  selectedId: string | null;
  showHelp: boolean;
  immersionBlocksEn: boolean;
  choiceHighlightId: string | null;
  highlight: ReturnType<typeof useTrainerSpeech>["highlight"];
  enHighlight: ReturnType<typeof useTrainerSpeech>["highlight"];
  speaking: boolean;
  onSelect: () => void;
  onReplay: () => void;
}) {
  let className = "ppq-choice";
  if (revealed) {
    if (choice.id === selectedId) {
      className +=
        choice.quality === "incorrect"
          ? " ppq-choice--wrong"
          : " ppq-choice--correct";
    } else {
      className += " ppq-choice--dim";
    }
  }

  return (
    <div className="ppq-choice-row">
      <button
        type="button"
        className={className}
        disabled={revealed}
        onClick={onSelect}
        data-choice-id={choice.id}
        data-repair-kind={choice.repairKind ?? undefined}
      >
        <span className="ppq-choice-index">{index + 1}.</span>{" "}
        {choiceHighlightId === choice.id && highlight ? (
          <HighlightedJapanese
            text={choice.japanese}
            className="ppq-choice-ja"
            highlight={highlight}
          />
        ) : (
          <span lang="ja">{choice.japanese}</span>
        )}
        {showHelp && !immersionBlocksEn && choice.english ? (
          choiceHighlightId === choice.id && enHighlight ? (
            <HighlightedEnglish
              text={choice.english}
              className="ppq-choice-en"
              highlight={enHighlight}
            />
          ) : (
            <span className="ppq-choice-en">{choice.english}</span>
          )
        ) : null}
      </button>
      <button
        type="button"
        className={
          speaking && choiceHighlightId === choice.id
            ? "ppq-speak-btn ppq-speak-btn--choice ppq-speak-btn--active"
            : "ppq-speak-btn ppq-speak-btn--choice"
        }
        aria-label={`Play answer choice: ${choice.japanese}`}
        onClick={(e) => {
          e.stopPropagation();
          onReplay();
        }}
      >
        🔊
      </button>
    </div>
  );
}

/**
 * Tip/feedback with 「日本語」 + English gloss karaoke while Nanami/Andrew speak.
 */
function FeedbackTipText({
  text,
  jaFocus,
  enFocus,
  jaHighlight,
  enHighlight,
}: {
  text: string;
  jaFocus: string | null;
  enFocus: string | null;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
}) {
  const nodes: ReactNode[] = [];
  const quoteRe = /「([^」]+)」/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = quoteRe.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <FeedbackPlain
          key={`t-${key++}`}
          text={text.slice(cursor, match.index)}
          enFocus={enFocus}
          enHighlight={enHighlight}
        />
      );
    }
    const ja = match[1] ?? "";
    const focused =
      jaFocus !== null && ja.replace(/\s+/g, "") === jaFocus.replace(/\s+/g, "");
    nodes.push(
      <span key={`q-${key++}`} className="ppq-feedback-ja" lang="ja">
        「
        {focused && jaHighlight ? (
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
    nodes.push(
      <FeedbackPlain
        key={`t-${key++}`}
        text={text.slice(cursor)}
        enFocus={enFocus}
        enHighlight={enHighlight}
      />
    );
  }
  return <div className="ppq-feedback-rich">{nodes}</div>;
}

function FeedbackPlain({
  text,
  enFocus,
  enHighlight,
}: {
  text: string;
  enFocus: string | null;
  enHighlight: SpeechHighlight | null;
}) {
  if (!text) return null;
  const parts = text.split("\n");
  return (
    <>
      {parts.map((part, i) => {
        const trimmed = part.trim();
        const enActive =
          enFocus !== null &&
          enHighlight !== null &&
          trimmed.length > 0 &&
          (trimmed === enFocus || trimmed.includes(enFocus));
        return (
          <span key={i}>
            {enActive ? (
              <HighlightedEnglish
                text={enFocus!}
                className="ppq-feedback-en"
                highlight={enHighlight}
              />
            ) : (
              part
            )}
            {i < parts.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </>
  );
}
