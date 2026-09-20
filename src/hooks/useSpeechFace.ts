import { useEffect, useRef, useState } from "react";
import { subscribeToSpeech } from "../services/speechBus";
import { visemesForUnit, type Viseme } from "../utils/visemes";

export interface SpeechFace {
  /** Which head should be visible, or null when nothing is speaking. */
  lang: "ja" | "en" | null;
  /** Current mouth shape. */
  viseme: Viseme;
  speaking: boolean;
}

/**
 * Tracks the current speaker and mouth shape from the global speech bus.
 *
 * Each unit arrives with its estimated duration, and its mouth shapes are
 * scheduled across that window. Timers are cleared on every new unit, so a
 * unit that arrives early (a native boundary overtaking the estimate) cancels
 * the previous unit's remaining frames instead of letting two units animate
 * over each other.
 */
export function useSpeechFace(): SpeechFace {
  const [face, setFace] = useState<SpeechFace>({
    lang: null,
    viseme: "rest",
    speaking: false,
  });
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      for (const id of timers.current) window.clearTimeout(id);
      timers.current = [];
    };

    const unsubscribe = subscribeToSpeech((event) => {
      if (event.type === "start") {
        clearTimers();
        setFace({ lang: event.lang, viseme: "rest", speaking: true });
        return;
      }

      if (event.type === "end") {
        clearTimers();
        setFace((prev) => ({ ...prev, viseme: "rest", speaking: false }));
        return;
      }

      // A unit: schedule its shapes, dropping whatever the last one had left.
      clearTimers();
      const frames = visemesForUnit(
        event.text,
        event.spokenText,
        event.lang,
        event.durationMs
      );
      if (frames.length === 0) {
        setFace({ lang: event.lang, viseme: "rest", speaking: true });
        return;
      }

      setFace({ lang: event.lang, viseme: frames[0]!.viseme, speaking: true });
      for (let i = 1; i < frames.length; i++) {
        const frame = frames[i]!;
        const id = window.setTimeout(() => {
          setFace({ lang: event.lang, viseme: frame.viseme, speaking: true });
        }, frame.atMs);
        timers.current.push(id);
      }
      // Close the mouth at the end of the unit so a gap before the next unit
      // is not held open on the final shape.
      const last = frames[frames.length - 1]!;
      const closeId = window.setTimeout(() => {
        setFace((prev) =>
          prev.speaking ? { ...prev, viseme: "rest" } : prev
        );
      }, last.atMs + last.durationMs);
      timers.current.push(closeId);
    });

    return () => {
      clearTimers();
      unsubscribe();
    };
  }, []);

  return face;
}
