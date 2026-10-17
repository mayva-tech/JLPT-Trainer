import { useCallback, useEffect, useRef, useState } from "react";
import { useTrainerSpeech } from "../../hooks/useTrainerSpeech";
import { SPEECH_RATE_SLOW } from "../../services/speechService";
import type { ShortPhase, ShortStep } from "./shortScript";
import { playSfx } from "./shortSfx";

/**
 * Plays a Short's script: speech steps wait for the voice to finish, wait
 * steps use timers. A generation counter makes Stop / word changes cancel
 * everything in flight. Speech errors still advance (see useTrainerSpeech),
 * so a recording never stalls.
 */
export function useShortPlayer(steps: readonly ShortStep[], onDone?: () => void) {
  const { speakLine, stop: stopSpeech, highlight, activeLang } = useTrainerSpeech();
  const [phase, setPhase] = useState<ShortPhase>("idle");
  const [cue, setCue] = useState<{ kind: "countdown" | "repeat"; ms: number; key: number } | null>(null);
  const gen = useRef(0);
  const timer = useRef<number | null>(null);
  /** Countdown ticks scheduled inside a wait step. */
  const ticks = useRef<number[]>([]);
  const stepsRef = useRef(steps);
  const onDoneRef = useRef(onDone);
  stepsRef.current = steps;
  onDoneRef.current = onDone;

  const clearTimer = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
    for (const t of ticks.current) window.clearTimeout(t);
    ticks.current = [];
  };

  const stop = useCallback(() => {
    gen.current += 1;
    clearTimer();
    stopSpeech();
    setCue(null);
    setPhase("idle");
  }, [stopSpeech]);

  const run = useCallback(
    (index: number, g: number) => {
      if (g !== gen.current) return;
      const step = stepsRef.current[index];
      if (!step) {
        setCue(null);
        setPhase("done");
        onDoneRef.current?.();
        return;
      }
      setPhase(step.phase);
      const next = () => run(index + 1, g);
      if (step.kind === "wait") {
        if (step.sfx) playSfx(step.sfx);
        setCue(step.cue ? { kind: step.cue, ms: step.ms, key: index } : null);
        const countdown = step.cue === "countdown";
        if (countdown) {
          // One tick per second (3 · 2 · 1), the last brighter, then time-up.
          const seconds = Math.max(1, Math.round(step.ms / 1000));
          for (let s = 0; s < seconds; s++) {
            const fire = () => g === gen.current && playSfx("tick", { last: s === seconds - 1 });
            if (s === 0) fire();
            else ticks.current.push(window.setTimeout(fire, s * 1000));
          }
        }
        timer.current = window.setTimeout(() => {
          if (g !== gen.current) return;
          if (countdown) playSfx("timeup");
          setCue(null);
          next();
        }, step.ms);
        return;
      }
      setCue(null);
      speakLine({
        text: step.text,
        language: step.lang,
        reading: step.reading ?? null,
        rate: step.slow ? SPEECH_RATE_SLOW : undefined,
        tone: step.tone ?? null,
        onEnded: () => {
          if (g !== gen.current) return;
          next();
        },
      });
    },
    [speakLine]
  );

  const play = useCallback(() => {
    gen.current += 1;
    clearTimer();
    stopSpeech();
    // Back to the idle pose first: restarts the backdrop pan on a replay and
    // gives recordings a clean opening frame.
    setCue(null);
    setPhase("idle");
    const g = gen.current;
    timer.current = window.setTimeout(() => run(0, g), 400);
  }, [run, stopSpeech]);

  // A new word (new script) resets to idle.
  useEffect(() => {
    gen.current += 1;
    clearTimer();
    setCue(null);
    setPhase("idle");
  }, [steps]);

  useEffect(
    () => () => {
      gen.current += 1;
      clearTimer();
    },
    []
  );

  return {
    phase,
    cue,
    highlight,
    activeLang,
    playing: phase !== "idle" && phase !== "done",
    play,
    stop,
  };
}
