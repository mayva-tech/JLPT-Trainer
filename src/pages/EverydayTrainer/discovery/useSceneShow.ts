import { useCallback, useEffect, useRef, useState } from "react";
import { autoModeTiming } from "../../../config/autoModeTiming";
import type { CheckPhase, ReadHookState } from "../../../services/autoModeRunner";
import type { EverydaySpeech } from "../useEverydaySpeech";
import { buildSceneCheck, checkpointIndices, sceneCheckSpoken, type SceneCheck } from "./sceneShow";
import { fillCount, HOOK_EN, lineReading, linePlain, scriptFor, type ShowLine } from "./sceneScripts";
import { objectWord } from "./scenes";
import type { DiscoveryObject, DiscoveryScene } from "./types";

const T = autoModeTiming;

export type ShowPhase = "idle" | "intro" | "hook" | "object" | "check" | "outro" | "done";

export interface ShowOptions {
  /** "Can you name it?" before each object. */
  hook: boolean;
  /** "Pause & answer" every few objects. */
  check: boolean;
  /** Nanami & Andrew's intro and outro. */
  introOutro: boolean;
}

type Args = {
  scene: DiscoveryScene;
  speech: EverydaySpeech;
  getOptions: () => ShowOptions;
  /** An object's name was revealed (counts as discovered). */
  onReveal: (obj: DiscoveryObject) => void;
};

/**
 * The scene show behind Play all / Guided — one hands-free sequence for
 * recording a video:
 *
 *   intro (Nanami ⇄ Andrew)
 *   → for each object: [hook: lit, name hidden, "What's this called?" +
 *     countdown] → name revealed, Japanese (Nanami) then English (Andrew)
 *     → [Pause & answer after every 5th object]
 *   → outro (recap + comment line)
 *
 * Same rules as the Player's Auto Mode hooks: the hook line is spoken on the
 * first object only (the banner and ring carry it after), checks use the
 * Player's timings, and every step waits for the voice before moving on.
 * Pause cancels cleanly; Play resumes from the current object.
 */
export function useSceneShow({ scene, speech, getOptions, onReveal }: Args) {
  const [phase, setPhase] = useState<ShowPhase>("idle");
  const [index, setIndex] = useState(0);
  const [line, setLine] = useState(0);
  const [hook, setHook] = useState<ReadHookState | null>(null);
  const [check, setCheck] = useState<{ card: SceneCheck; phase: CheckPhase } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const sessionRef = useRef(0);
  const pending = useRef(new Set<() => void>());
  const timers = useRef(new Set<number>());
  const hookKey = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const indexRef = useRef(index);
  indexRef.current = index;
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;
  // The speech API object is new each render; read it through a ref so
  // cancel() stays stable (an unstable cancel would stop the show on re-render).
  const speechRef = useRef(speech);
  speechRef.current = speech;
  const optionsRef = useRef(getOptions);
  optionsRef.current = getOptions;

  const script = scriptFor(scene.id);
  const n = scene.objects.length;

  /** Stop everything; any awaited step resolves so the sequence can exit. */
  const cancel = useCallback(() => {
    sessionRef.current += 1;
    for (const id of timers.current) window.clearTimeout(id);
    timers.current.clear();
    for (const resolve of pending.current) resolve();
    pending.current.clear();
    speechRef.current.stop();
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  const settle = (start: (done: () => void) => void) =>
    new Promise<void>((resolve) => {
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        pending.current.delete(done);
        resolve();
      };
      pending.current.add(done);
      start(done);
    });

  const wait = (ms: number) =>
    settle((done) => {
      const id = window.setTimeout(() => {
        timers.current.delete(id);
        done();
      }, ms);
      timers.current.add(id);
    });

  const sayLine = (l: ShowLine) =>
    settle((done) => {
      if (l.speaker === "nanami") speechRef.current.sayLine(linePlain(l.text), "ja", lineReading(l.text), done);
      else speechRef.current.sayLine(fillCount(l.text, n), "en", null, done);
    });
  const sayEn = (text: string) => settle((done) => speechRef.current.sayLine(text, "en", null, done));
  const sayWord = (obj: DiscoveryObject, lang: "jp" | "en") =>
    settle((done) => speechRef.current.playSequence(objectWord(obj), lang, done));

  const runLines = async (lines: readonly ShowLine[], alive: () => boolean) => {
    for (let k = 0; k < lines.length; k++) {
      if (!alive()) return;
      setLine(k);
      await sayLine(lines[k]!);
      if (!alive()) return;
      await wait(T.shortPause / 2);
    }
  };

  const runCheck = async (i: number, checkpoints: readonly number[], alive: () => boolean) => {
    const c = checkpoints.indexOf(i);
    const start = c > 0 ? checkpoints[c - 1]! + 1 : 0;
    const card = buildSceneCheck(scene.objects.slice(start, i + 1), scene.objects, c + 1);
    if (!card) return;
    await wait(T.shortPause);
    if (!alive()) return;
    setPhase("check");
    setFocusId(card.kind === "name" ? card.object.id : null);
    setCheck({ card, phase: "ask" });
    await sayEn(sceneCheckSpoken(card));
    if (!alive()) return;
    if (card.kind === "where") {
      await sayWord(card.object, "jp");
      if (!alive()) return;
    }
    setCheck({ card, phase: "think" });
    await wait(T.checkThinkMs);
    if (!alive()) return;
    setCheck({ card, phase: "reveal" });
    setFocusId(card.object.id);
    await sayWord(card.object, "jp");
    if (!alive()) return;
    await sayWord(card.object, "en");
    if (!alive()) return;
    await wait(T.checkRevealHold);
    if (!alive()) return;
    setCheck(null);
  };

  const runOutro = async (alive: () => boolean) => {
    if (!script || !optionsRef.current().introOutro) return;
    setPhase("outro");
    setFocusId(null);
    await runLines(script.outro, alive);
  };

  /** Play from object `from` (with the intro when starting at the top). */
  const run = useCallback(
    async (from: number, withIntro: boolean, outroOnly = false) => {
      cancel();
      const session = sessionRef.current;
      const alive = () => session === sessionRef.current;
      const opts = optionsRef.current();
      setPlaying(true);
      setHook(null);
      setCheck(null);

      if (!outroOnly) {
        if (withIntro && opts.introOutro && script) {
          setPhase("intro");
          setFocusId(null);
          await runLines(script.intro, alive);
          if (!alive()) return;
          await wait(T.shortPause);
        }

        const checkpoints = opts.check ? checkpointIndices(n, T.checkEvery) : [];
        let hookSpoken = false;
        for (let i = from; i < n; i++) {
          if (!alive()) return;
          const obj = scene.objects[i]!;
          setIndex(i);
          setFocusId(obj.id);
          if (opts.hook) {
            setPhase("hook");
            if (!hookSpoken) {
              hookSpoken = true;
              setHook({ ms: 0, key: ++hookKey.current });
              await sayEn(HOOK_EN);
              if (!alive()) return;
            }
            setHook({ ms: T.readHookMs, key: ++hookKey.current });
            await wait(T.readHookMs);
            if (!alive()) return;
            setHook(null);
          }
          setPhase("object");
          revealRef.current(obj);
          await sayWord(obj, "jp");
          if (!alive()) return;
          await wait(T.shortPause);
          if (!alive()) return;
          await sayWord(obj, "en");
          if (!alive()) return;
          if (checkpoints.includes(i)) {
            await runCheck(i, checkpoints, alive);
            if (!alive()) return;
            setPhase("object");
            setFocusId(obj.id);
          }
          if (i < n - 1) await wait(T.betweenItemsPause);
        }
        if (!alive()) return;
        await wait(T.shortPause);
        if (!alive()) return;
      }

      await runOutro(alive);
      if (!alive()) return;
      setPhase("done");
      setPlaying(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the step helpers only read refs
    [cancel, n, scene, script],
  );

  const pause = useCallback(() => {
    cancel();
    setPlaying(false);
    setHook(null);
    setCheck(null);
    if (phaseRef.current === "hook" || phaseRef.current === "check") setPhase("object");
  }, [cancel]);

  /** Play: from the top, or resume where it was paused. */
  const play = useCallback(() => {
    const p = phaseRef.current;
    if (p === "idle" || p === "done" || p === "intro") void run(0, true);
    else if (p === "outro") void run(n, false, true);
    else void run(indexRef.current, false);
  }, [run, n]);

  /** Show one object (from prev / next / a tap). Keeps playing if it was. */
  const goTo = useCallback(
    (i: number, keepPlaying: boolean) => {
      const k = Math.max(0, Math.min(n - 1, i));
      if (keepPlaying) {
        void run(k, false);
        return;
      }
      cancel();
      setPlaying(false);
      setHook(null);
      setCheck(null);
      setIndex(k);
      setPhase("object");
      const obj = scene.objects[k]!;
      setFocusId(obj.id);
      revealRef.current(obj);
    },
    [run, cancel, n, scene],
  );

  const reset = useCallback(() => {
    cancel();
    setPlaying(false);
    setPhase("idle");
    setIndex(0);
    setLine(0);
    setHook(null);
    setCheck(null);
    setFocusId(null);
  }, [cancel]);

  return { phase, index, line, hook, check, focusId, playing, script, play, pause, goTo, reset, start: () => run(0, true) };
}

export type SceneShow = ReturnType<typeof useSceneShow>;
