import { useCallback, useEffect, useRef, useState } from "react";
import {
  isSpeechCancelled,
  speechService,
  SPEECH_RATE_NORMAL,
  SPEECH_RATE_SLOW,
  type SpeechHighlight,
  type SpeechStatus,
} from "../services/speechService";
import {
  loadSpeechPreferences,
  updateSpeechPreferences,
  type SpeechRateMode,
} from "../services/speechPreferences";

export type TrainerSpeechLang = "ja" | "en";

export type SpeakLineOptions = {
  text: string;
  language: TrainerSpeechLang;
  /** Space-separated kana reading for Japanese display→audio. */
  reading?: string | null;
  rate?: number;
  /** When false, karaoke highlight callbacks are skipped. */
  karaoke?: boolean;
  onEnded?: () => void;
};

/**
 * Shared Play/Quiz/RPG speech + karaoke layer on top of speechService.
 * One active stream; generation tokens ignore stale callbacks (Strict Mode safe).
 */
export function useTrainerSpeech(options?: { stopOnUnmount?: boolean }) {
  const stopOnUnmount = options?.stopOnUnmount !== false;
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [activeLang, setActiveLang] = useState<TrainerSpeechLang | null>(null);
  const [prefs, setPrefs] = useState(() => loadSpeechPreferences());
  const generationRef = useRef(0);

  const clearHighlight = useCallback(() => {
    setHighlight(null);
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    speechService.stop();
    setStatus("idle");
    setActiveLang(null);
    setHighlight(null);
  }, []);

  useEffect(() => {
    if (!stopOnUnmount) return;
    return () => {
      generationRef.current += 1;
      speechService.stop();
    };
  }, [stopOnUnmount]);

  const resolveRate = useCallback(
    (override?: number) => {
      if (typeof override === "number") return override;
      return prefs.rateMode === "slow" ? SPEECH_RATE_SLOW : SPEECH_RATE_NORMAL;
    },
    [prefs.rateMode]
  );

  const speakLine = useCallback(
    (line: SpeakLineOptions) => {
      const text = line.text?.trim() ?? "";
      if (!text) return;

      const gen = ++generationRef.current;
      speechService.stop();
      setHighlight(null);
      setActiveLang(line.language);
      setStatus("speaking");

      const rate = resolveRate(line.rate);
      const karaoke = line.karaoke !== false;

      const alive = () => gen === generationRef.current;

      const callbacks = {
        onStart: () => {
          if (!alive()) return;
          setStatus("speaking");
        },
        onBoundary: (h: SpeechHighlight) => {
          if (!alive() || !karaoke) return;
          setHighlight(h);
        },
        onEnd: () => {
          if (!alive()) return;
          setStatus("idle");
          setActiveLang(null);
          setHighlight(null);
          line.onEnded?.();
        },
        onError: (error?: unknown) => {
          if (!alive()) return;
          setStatus("idle");
          setActiveLang(null);
          setHighlight(null);
          if (!isSpeechCancelled(error)) {
            // TTS failed — keep UI playable.
            line.onEnded?.();
          }
        },
      };

      try {
        if (line.language === "ja") {
          speechService.speakJapanese(text, callbacks, rate, {
            reading: line.reading ?? null,
          });
        } else {
          speechService.speakEnglish(text, callbacks, rate);
        }
      } catch {
        if (!alive()) return;
        setStatus("idle");
        setActiveLang(null);
        setHighlight(null);
      }
    },
    [resolveRate]
  );

  const speakJapanese = useCallback(
    (
      text: string,
      opts?: { reading?: string | null; rate?: number; karaoke?: boolean; onEnded?: () => void }
    ) => {
      speakLine({
        text,
        language: "ja",
        reading: opts?.reading,
        rate: opts?.rate,
        karaoke: opts?.karaoke,
        onEnded: opts?.onEnded,
      });
    },
    [speakLine]
  );

  const speakEnglish = useCallback(
    (
      text: string,
      opts?: { rate?: number; karaoke?: boolean; onEnded?: () => void }
    ) => {
      speakLine({
        text,
        language: "en",
        rate: opts?.rate,
        karaoke: opts?.karaoke,
        onEnded: opts?.onEnded,
      });
    },
    [speakLine]
  );

  const setAutoVoice = useCallback((autoVoice: boolean) => {
    setPrefs(updateSpeechPreferences({ autoVoice }));
  }, []);

  const setRateMode = useCallback((rateMode: SpeechRateMode) => {
    // Changing speed must not keep stale karaoke timestamps.
    generationRef.current += 1;
    speechService.stop();
    setHighlight(null);
    setStatus("idle");
    setActiveLang(null);
    setPrefs(updateSpeechPreferences({ rateMode }));
  }, []);

  return {
    highlight,
    status,
    activeLang,
    speaking: status === "speaking",
    prefs,
    autoVoice: prefs.autoVoice,
    rateMode: prefs.rateMode,
    rate: resolveRate(),
    speakLine,
    speakJapanese,
    speakEnglish,
    stop,
    clearHighlight,
    setAutoVoice,
    setRateMode,
  };
}
