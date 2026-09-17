import { useEffect, useMemo, useRef, useState } from "react";
import { HighlightedJapanese } from "../../components/HighlightedJapanese";
import { useTrainerSpeech } from "../../hooks/useTrainerSpeech";
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
import {
  hasSpeakableFeedback,
  parseBilingualSpeakSegments,
} from "../utils/questFeedbackSpeech";
import {
  nodeCountsTowardSocialFit,
  socialFitFromQualities,
} from "../utils/socialFit";
import { ConfidenceHearts } from "./ConfidenceHearts";
import { CommunicationMeter } from "./CommunicationMeter";
import { NpcPortrait } from "./NpcPortrait";
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
};

const SETTLE_MS = 280;

function nodeSpeechEnabled(node: ConversationNode): boolean {
  return node.speech?.enabled !== false;
}

export function ConversationQuestRunner({
  questId,
  onQuit,
  onFinished,
  immersionEnabled = false,
  relationships = [],
  showContextHint = false,
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
  const [pendingNextId, setPendingNextId] = useState<string | null>(null);
  const [choiceHighlightId, setChoiceHighlightId] = useState<string | null>(null);
  const [feedbackJaFocus, setFeedbackJaFocus] = useState<string | null>(null);
  const [nodePlayKey, setNodePlayKey] = useState(0);
  const [firstListenOk, setFirstListenOk] = useState(true);
  const [listeningSeen, setListeningSeen] = useState(0);
  const autoPlayTokenRef = useRef(0);

  const node = useMemo(() => {
    if (!conversation || !nodeId) return null;
    return getConversationNode(conversation, nodeId) ?? null;
  }, [conversation, nodeId]);

  const npc = node?.npcId ? getNpcById(node.npcId) : undefined;
  const location = quest ? getLocationById(quest.locationId) : undefined;
  const isInteractive = Boolean(node?.choices && node.choices.length > 0);
  const immersionBlocksEn = immersionEnabled && !showHelp && !revealed;
  const hideTranscript =
    Boolean(node?.listenOnly) &&
    (node?.speech?.karaokeMode === "after-answer" || node?.listenOnly) &&
    !revealed &&
    !showHelp;

  // Track listening nodes for first-listen bonus.
  useEffect(() => {
    if (!node) return;
    if (node.objectiveType === "listening" || node.listenOnly) {
      setListeningSeen((n) => n + 1);
    }
  }, [node?.id]);

  // Auto-play NPC line + choices (Immersion-aware).
  useEffect(() => {
    if (!node || !quest) return;
    let cancelled = false;
    speech.stop();
    setChoiceHighlightId(null);
    setFeedbackJaFocus(null);
    autoPlayTokenRef.current += 1;
    const token = autoPlayTokenRef.current;

    if (!speech.autoVoice || !nodeSpeechEnabled(node)) {
      return () => {
        cancelled = true;
      };
    }

    const forceSlow = Boolean(node.forceSlowSpeech);
    const prevMode = speech.rateMode;
    if (forceSlow && speech.rateMode !== "slow") {
      speech.setRateMode("slow");
    }

    type QueueItem =
      | { kind: "ja"; text: string; reading?: string; choiceId?: string }
      | { kind: "en"; text: string }
      | { kind: "bilingual"; text: string };

    const queue: QueueItem[] = [];
    if (node.japanese.trim()) {
      queue.push({
        kind: "ja",
        text: node.japanese,
        reading: node.reading,
      });
    }
    if (showHelp && node.english?.trim() && !immersionBlocksEn) {
      queue.push({ kind: "en", text: node.english });
    }
    if (!revealed && node.choices) {
      for (const c of node.choices) {
        queue.push({ kind: "ja", text: c.japanese, reading: c.reading, choiceId: c.id });
        if (showHelp && c.english?.trim() && !immersionBlocksEn) {
          queue.push({ kind: "en", text: c.english });
        }
      }
    }
    if (showHelp && node.helpHint?.trim()) {
      queue.push({ kind: "bilingual", text: node.helpHint });
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
        const next = () => playSeg(index + 1);
        if (seg.language === "ja") {
          setFeedbackJaFocus(seg.text);
          speech.speakJapanese(seg.text, { karaoke: true, onEnded: next });
        } else {
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
        if (forceSlow && prevMode !== "slow") speech.setRateMode(prevMode);
        return;
      }
      const next = () => playItem(index + 1);
      if (item.kind === "ja") {
        if (item.choiceId) setChoiceHighlightId(item.choiceId);
        else setChoiceHighlightId(null);
        speech.speakJapanese(item.text, {
          reading: item.reading,
          karaoke: true,
          onEnded: () => {
            if (item.choiceId) setChoiceHighlightId(null);
            next();
          },
        });
      } else if (item.kind === "en") {
        setChoiceHighlightId(null);
        speech.speakEnglish(item.text, { karaoke: true, onEnded: next });
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
      if (forceSlow && prevMode !== "slow") speech.setRateMode(prevMode);
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
  ]);

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

  function finish(success: boolean) {
    speech.stop();
    const answered = Math.max(answeredCount, 1);
    const rawAccuracy = Math.round((correctCount / answered) * 100);
    const accuracy = Math.max(0, rawAccuracy - Math.min(5, helpUses));
    const immersionNoEnglish =
      immersionEnabled && !usedEnglishAssist && helpUses === 0;
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
      firstListenSuccess: listeningSeen === 0 ? false : firstListenOk,
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
    };
    onFinished(outcome);
  }

  function goToNode(nextId: string) {
    let targetId = nextId;
    // Auto-resolve relationship routers (no choices / no speech).
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
    setNodeId(targetId);
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setQualityLabel(null);
    setContextHint(null);
    setPendingNextId(null);
    setShowHelp(false);
    setNodePlayKey((k) => k + 1);
  }

  function onSelectChoice(choiceId: string) {
    if (revealed) return;
    const choice = getConversationChoice(activeNode, choiceId);
    if (!choice) return;
    speech.stop();

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

    if (applied.isRepair) setRepairedConversation(true);

    if (
      (activeNode.objectiveType === "listening" || activeNode.listenOnly) &&
      applied.quality === "incorrect"
    ) {
      setFirstListenOk(false);
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

    if (choice.feedback && hasSpeakableFeedback(choice.feedback)) {
      const segments = parseBilingualSpeakSegments(choice.feedback);
      const play = (i: number) => {
        const seg = segments[i];
        if (!seg) {
          setFeedbackJaFocus(null);
          return;
        }
        const next = () => play(i + 1);
        if (seg.language === "ja") {
          setFeedbackJaFocus(seg.text);
          speech.speakJapanese(seg.text, { karaoke: true, onEnded: next });
        } else {
          setFeedbackJaFocus(null);
          speech.speakEnglish(seg.text, { karaoke: true, onEnded: next });
        }
      };
      play(0);
    }
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
    }
    setShowHelp((v) => !v);
  }

  function handleQuit() {
    speech.stop();
    onQuit();
  }

  // Immersion: hide EN until Help / reveal.
  const showPromptEn =
    Boolean(node.english) &&
    !immersionBlocksEn &&
    (showHelp || (!immersionEnabled && (!isInteractive || revealed)));

  const continueLabel =
    node.endState === "success"
      ? "Finish"
      : node.endState === "failure"
        ? "Leave"
        : !isInteractive
          ? node.id === "arrive"
            ? "Begin"
            : "Continue"
          : revealed
            ? "Continue"
            : null;

  return (
    <div className="ppq-quest ppq-quest-enter">
      <div className="ppq-quest-banner">
        <p style={{ margin: 0, fontSize: 12, color: "var(--ppq-muted)" }}>
          {location?.icon ?? "📍"} {location?.name ?? quest.locationId} · Conversation
          {quest.difficulty === "boss" ? " · Boss" : ""}
        </p>
        <h1 lang="ja">{quest.japaneseTitle}</h1>
        <p>{quest.title}</p>
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
            className="ppq-btn ppq-btn--ghost"
            aria-pressed={speech.rateMode === "normal"}
            onClick={() => speech.setRateMode("normal")}
          >
            1.0×
          </button>
          <button
            type="button"
            className="ppq-btn ppq-btn--ghost"
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
        {npc ? <NpcPortrait npc={npc} /> : null}

        <div className="ppq-line-row">
          {hideTranscript ? (
            <div className="ppq-listen-hidden">
              <p className="ppq-prompt-en" style={{ margin: 0 }}>
                {immersionBlocksEn
                  ? "よく聞いてください。"
                  : (node.english ?? "Listen carefully, then choose.")}
              </p>
              <p className="ppq-listen-hint">Transcript hidden until you answer.</p>
            </div>
          ) : (
            <HighlightedJapanese
              text={activeNode.japanese}
              className="ppq-prompt-ja"
              highlight={choiceHighlightId ? null : speech.highlight}
            />
          )}
          {activeNode.japanese.trim() ? (
            <button
              type="button"
              className="ppq-speak-btn"
              aria-label="Play Japanese dialogue"
              onClick={() =>
                speech.speakJapanese(activeNode.japanese, {
                  reading: activeNode.reading,
                  karaoke: true,
                })
              }
            >
              🔊
            </button>
          ) : null}
        </div>

        {showHelp && activeNode.reading && !hideTranscript ? (
          <div className="ppq-reading-hint">{activeNode.reading}</div>
        ) : null}

        {showPromptEn && activeNode.english && !hideTranscript ? (
          <div className="ppq-prompt-en-row">
            <div className="ppq-prompt-en">{activeNode.english}</div>
            <button
              type="button"
              className="ppq-speak-btn"
              aria-label="Play English narration"
              onClick={() =>
                speech.speakEnglish(activeNode.english!, { karaoke: true })
              }
            >
              🔊
            </button>
          </div>
        ) : null}

        {showHelp && activeNode.helpHint ? (
          <p className="ppq-help-hint">💡 {activeNode.helpHint}</p>
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
                highlight={speech.highlight}
                speaking={speech.status === "speaking"}
                onSelect={() => onSelectChoice(choice.id)}
                onReplay={() =>
                  speech.speakJapanese(choice.japanese, {
                    reading: choice.reading,
                    karaoke: true,
                  })
                }
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
            <div className="ppq-feedback-text">
              {feedback.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {feedbackJaFocus && line.includes(feedbackJaFocus) ? (
                    <HighlightedJapanese
                      text={line}
                      className="ppq-feedback-ja"
                      highlight={speech.highlight}
                    />
                  ) : (
                    line
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {continueLabel ? (
          <div className="ppq-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="ppq-btn ppq-btn--primary"
              onClick={onContinue}
            >
              {continueLabel}
            </button>
          </div>
        ) : null}

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
      >
        <span className="ppq-choice-index">{index + 1}.</span>{" "}
        {choiceHighlightId === choice.id ? (
          <HighlightedJapanese
            text={choice.japanese}
            className="ppq-choice-ja"
            highlight={highlight}
          />
        ) : (
          <span lang="ja">{choice.japanese}</span>
        )}
        {showHelp && !immersionBlocksEn && choice.english ? (
          <span className="ppq-choice-en">{choice.english}</span>
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
