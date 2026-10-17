import { useMemo, useRef, useState } from "react";
import type {
  RegisterPlayPart,
  RegisterSideName,
} from "../components/RegisterSplitCard";
import { checkpointIndices, firstSense } from "../components/Retention/retentionQuiz";
import { autoModeTiming } from "../config/autoModeTiming";
import { getRegisterPairsForSection, getRegisterSectionById } from "../data/registerPairs";
import type { CheckPhase, ReadHookState } from "../services/autoModeRunner";
import { speakNuance } from "../services/nuancePlayback";
import {
  resolveAutoModeSpeechRate,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  speechService,
  type SpeechHighlight,
} from "../services/speechService";
import type { RegisterPair } from "../types/register";
import { hookHoldMs, hookSpeech, type ItemHookState } from "../utils/itemHookSpeech";
import { buildRegisterPlaySteps } from "../utils/registerPlayback";
import {
  buildRegisterCheckCard,
  POLITE_HOOK_EN,
  registerCheckSpoken,
  registerClosingHook,
  type RegisterCheckCard,
} from "../utils/registerRetention";

export type RegisterSpeechLang = "ja" | "en" | "nuance";

export type UseRegisterSessionOptions = {
  getSpeechRate: () => number;
  setSpeechStatus: (status: "idle" | "speaking" | "paused") => void;
  setSpeechLang: (lang: RegisterSpeechLang | null) => void;
  setHighlight: (highlight: SpeechHighlight | null) => void;
  clearSpeechUi: () => void;
  isRegisterScreen: () => boolean;
  betweenItemsPause: number;
  /** Player's retention toggles (読 Hook / ⏸ Quiz / closing outro); all off when omitted. */
  getRetention?: () => { hook: boolean; check: boolean; outro?: boolean };
};

export type RegisterCheckView = { card: RegisterCheckCard; phase: CheckPhase };

const T = autoModeTiming;

export function useRegisterSession({
  getSpeechRate,
  setSpeechStatus,
  setSpeechLang,
  setHighlight,
  clearSpeechUi,
  isRegisterScreen,
  betweenItemsPause,
  getRetention,
}: UseRegisterSessionOptions) {
  const [sectionId, setSectionId] = useState("register-01");
  const pairs = useMemo(() => getRegisterPairsForSection(sectionId), [sectionId]);
  const section = getRegisterSectionById(sectionId);
  const [index, setIndex] = useState(0);
  const [activeSide, setActiveSide] = useState<RegisterPlayPart | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [drillMode, setDrillMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [playingSection, setPlayingSection] = useState(false);
  /** During Play, the note waits until the slow passes with furigana are over. */
  const [noteShown, setNoteShown] = useState(true);
  /** "Can you say it politely?" — formal side hidden with a countdown. */
  const [hook, setHook] = useState<ReadHookState | null>(null);
  /** "Pause & answer" checkpoint card. */
  const [check, setCheck] = useState<RegisterCheckView | null>(null);
  /** Closing remark after the last pair of Play All. */
  const [closing, setClosing] = useState<ItemHookState | null>(null);
  const playSessionRef = useRef(0);
  const timersRef = useRef(new Set<number>());
  const hookKeyRef = useRef(0);

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current.clear();
  }

  function stop() {
    playSessionRef.current += 1;
    clearTimers();
    setPlayingAll(false);
    setPlayingSection(false);
    setActiveSide(null);
    setNoteShown(true);
    setHook(null);
    setCheck(null);
    setClosing(null);
  }

  function open(nextSectionId: string) {
    setSectionId(nextSectionId);
    setIndex(0);
    setActiveSide(null);
    setRevealed(false);
    setPlayingAll(false);
    setPlayingSection(false);
    setNoteShown(true);
    setHook(null);
    setCheck(null);
    setClosing(null);
    clearTimers();
    playSessionRef.current += 1;
  }

  /* ── Promise helpers: every one settles, even when cancelled ───── */

  function wait(ms: number, session: number): Promise<void> {
    return new Promise((resolve) => {
      if (session !== playSessionRef.current) {
        resolve();
        return;
      }
      const id = window.setTimeout(() => {
        timersRef.current.delete(id);
        resolve();
      }, ms);
      timersRef.current.add(id);
    });
  }

  /** Auto Mode rate: the scripted pace unless the user picked 1.25×. */
  function scriptedRate(pace: "normal" | "slow"): number {
    return resolveAutoModeSpeechRate(
      getSpeechRate(),
      pace === "slow" ? SPEECH_RATE_SLOW : SPEECH_RATE_NORMAL
    );
  }

  function pauseMs(kind: "none" | "short" | "normal"): number {
    return kind === "short" ? T.shortPause : kind === "normal" ? T.normalPause : 0;
  }

  /** Clear the highlight as each line ends so it never lingers into a pause. */
  function endLine(session: number) {
    if (session !== playSessionRef.current) return;
    setHighlight(null);
    setSpeechLang(null);
  }

  function say(
    lang: "ja" | "en",
    text: string,
    session: number,
    reading?: string,
    rate: number = getSpeechRate()
  ): Promise<void> {
    return new Promise((resolve) => {
      const alive = () => session === playSessionRef.current;
      if (!alive() || !text.trim()) {
        resolve();
        return;
      }
      setHighlight(null);
      setSpeechLang(lang);
      setSpeechStatus("speaking");
      const done = () => {
        endLine(session);
        resolve();
      };
      const callbacks = {
        onStart: () => {
          if (alive()) setSpeechStatus("speaking");
        },
        onBoundary: (h: SpeechHighlight) => {
          if (alive()) setHighlight(h);
        },
        onEnd: done,
        onError: done,
      };
      if (lang === "ja") {
        speechService.speakJapanese(text, callbacks, rate, reading ? { reading } : undefined);
      } else {
        speechService.speakEnglish(text, callbacks, rate);
      }
    });
  }

  /** Mixed JA/EN note — offsets rebased onto the whole note (Player rule). */
  function sayNote(note: string, session: number, rate: number): Promise<void> {
    return new Promise((resolve) => {
      const alive = () => session === playSessionRef.current;
      if (!alive()) {
        resolve();
        return;
      }
      setHighlight(null);
      setSpeechLang("nuance");
      setSpeechStatus("speaking");
      speakNuance(note, rate, {
        isAlive: alive,
        onHighlight: (h) => {
          if (alive()) setHighlight(h);
        },
        onEnd: () => {
          endLine(session);
          resolve();
        },
      });
    });
  }

  /* ── Manual buttons ─────────────────────────────────────────────── */

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
    const session = playSessionRef.current;
    setActiveSide(side);
    void say("ja", source.text, session, source.reading).then(() => {
      if (session !== playSessionRef.current) return;
      clearSpeechUi();
      setActiveSide(null);
    });
  }

  function playBoth() {
    const pair = pairs[index] ?? null;
    if (!pair) return;
    if (drillMode && !revealed) setRevealed(true);
    speechService.stop();
    stop();
    const session = playSessionRef.current;
    const alive = () => session === playSessionRef.current;
    void (async () => {
      setActiveSide("casual");
      await say("ja", pair.casual.text, session, pair.casual.reading);
      if (!alive()) return;
      setActiveSide("formal");
      await say("ja", pair.formal.text, session, pair.formal.reading);
      if (!alive()) return;
      clearSpeechUi();
      setActiveSide(null);
    })();
  }

  /* ── Sequenced playback (Play / Play All) ──────────────────────── */

  /**
   * One pair: casual JP, meaning EN, casual JP slow, [hook], formal JP,
   * formal JP slow, note — rates and pauses as in the Player's Auto Mode.
   * The hook only runs in Play All (the recorded video), like the Player's
   * Auto Mode; `speakHook` says the line aloud (first pair only). With the
   * hook on, the formal side is hidden from the start of the pair.
   */
  async function playPairSequence(
    pair: RegisterPair,
    session: number,
    hookMode: "off" | "silent" | "spoken"
  ): Promise<void> {
    const alive = () => session === playSessionRef.current;
    const steps = buildRegisterPlaySteps(pair);
    let hooked = hookMode === "off";
    setNoteShown(false);
    // The formal side stays behind the banner while the casual lines play.
    if (!hooked) setHook({ ms: 0, key: ++hookKeyRef.current });

    for (const step of steps) {
      if (!alive()) return;
      await wait(pauseMs(step.pauseBefore), session);
      if (!alive()) return;
      if (!hooked && step.part === "formal") {
        hooked = true;
        await runPoliteHook(session, hookMode === "spoken");
        if (!alive()) return;
      }
      setActiveSide(step.part);
      if (step.part === "note") setNoteShown(true);
      const rate = scriptedRate(step.pace);
      if (step.lang === "nuance") {
        await sayNote(step.text, session, rate);
      } else {
        await say(step.lang, step.text, session, step.reading, rate);
      }
    }
    if (alive()) setNoteShown(true);
  }

  /** "Can you say it politely?" — formal hidden, banner, countdown. */
  async function runPoliteHook(session: number, speak: boolean): Promise<void> {
    const alive = () => session === playSessionRef.current;
    setHighlight(null);
    setActiveSide(null);
    if (speak) {
      setHook({ ms: 0, key: ++hookKeyRef.current });
      await say("en", POLITE_HOOK_EN, session, undefined, scriptedRate("normal"));
      if (!alive()) return;
      setHighlight(null);
    }
    setHook({ ms: T.readHookMs, key: ++hookKeyRef.current });
    await wait(T.readHookMs, session);
    if (!alive()) return;
    setHook(null);
  }

  /** "Pause & answer": ask (spoken) → think (countdown) → reveal. */
  async function runCheck(
    sectionPairs: readonly RegisterPair[],
    pairIndex: number,
    checkpoints: readonly number[],
    session: number
  ): Promise<void> {
    const alive = () => session === playSessionRef.current;
    const n = checkpoints.indexOf(pairIndex);
    const windowStart = n > 0 ? checkpoints[n - 1]! + 1 : 0;
    const card = buildRegisterCheckCard(
      sectionPairs.slice(windowStart, pairIndex + 1),
      sectionPairs,
      n + 1
    );
    if (!card) return;

    const rate = scriptedRate("normal");
    await wait(T.shortPause, session);
    if (!alive()) return;
    setActiveSide(null);
    setCheck({ card, phase: "ask" });
    await say("en", registerCheckSpoken(card), session, undefined, rate);
    if (!alive()) return;
    // The formal line asked about in a meaning question doesn't give the
    // answer away; saying it on a polite question would.
    if (card.kind === "meaning") {
      await say("ja", card.pair.formal.text, session, card.pair.formal.reading, rate);
      if (!alive()) return;
    }

    setCheck({ card, phase: "think" });
    await wait(T.checkThinkMs, session);
    if (!alive()) return;

    setCheck({ card, phase: "reveal" });
    await say("ja", card.pair.formal.text, session, card.pair.formal.reading, rate);
    if (!alive()) return;
    // A polite question already said the English line when it asked.
    if (card.kind === "meaning") {
      await say("en", firstSense(card.pair.meaning), session, undefined, rate);
      if (!alive()) return;
    }
    clearSpeechUi();
    await wait(T.checkRevealHold, session);
    if (!alive()) return;
    setCheck(null);
  }

  /** Wrap-up card over the stage, said by Andrew, held to be read. */
  async function runClosing(session: number): Promise<void> {
    const alive = () => session === playSessionRef.current;
    const hook = registerClosingHook(section);
    await wait(T.shortPause, session);
    if (!alive()) return;
    setActiveSide(null);
    setClosing({ hook, key: ++hookKeyRef.current });
    const line = hookSpeech(hook);
    await say(line.lang, line.text, session, line.reading, scriptedRate("normal"));
    if (!alive()) return;
    await wait(hookHoldMs(hook), session);
    if (!alive()) return;
    setClosing(null);
  }

  function play() {
    const pair = pairs[index] ?? null;
    if (!pair) return;
    if (drillMode && !revealed) setRevealed(true);
    speechService.stop();
    clearTimers();
    const session = ++playSessionRef.current;
    setHook(null);
    setCheck(null);
    setPlayingSection(false);
    setPlayingAll(true);
    void playPairSequence(pair, session, "off").then(() => {
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
    clearTimers();
    const session = ++playSessionRef.current;
    const alive = () => session === playSessionRef.current;
    setHook(null);
    setCheck(null);
    setPlayingAll(false);
    setPlayingSection(true);
    setIndex(0);

    const retention = getRetention?.() ?? { hook: false, check: false };
    const checkpoints = retention.check
      ? checkpointIndices(sectionPairs.length, T.checkEvery)
      : [];

    const finish = () => {
      stop();
      clearSpeechUi();
    };

    void (async () => {
      for (let pairIndex = 0; pairIndex < sectionPairs.length; pairIndex++) {
        if (!alive()) return;
        if (!isRegisterScreen()) {
          finish();
          return;
        }
        const pair = sectionPairs[pairIndex]!;
        setIndex(pairIndex);
        const hookMode = !retention.hook ? "off" : pairIndex === 0 ? "spoken" : "silent";
        await playPairSequence(pair, session, hookMode);
        if (!alive()) return;
        clearSpeechUi();
        setActiveSide(null);

        if (checkpoints.includes(pairIndex)) {
          await runCheck(sectionPairs, pairIndex, checkpoints, session);
          if (!alive()) return;
        }
        if (pairIndex < sectionPairs.length - 1) {
          await wait(betweenItemsPause, session);
        }
      }
      if (retention.outro && alive() && isRegisterScreen()) {
        await runClosing(session);
      }
      if (alive()) finish();
    })();
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
    section,
    pairs,
    index,
    activeSide,
    showFurigana,
    drillMode,
    revealed,
    playingAll,
    playingSection,
    noteShown,
    hook,
    check,
    closing,
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
