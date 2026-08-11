import { useCallback, useEffect, useState } from 'react';
import {
  speechService,
  SPEECH_RATE_NORMAL,
} from '../../services/speechService';
import { stripFurigana } from './furigana';

export interface JapaneseVoice {
  /** Display name of the active voice, or null if the device has none. */
  voiceName: string | null;
  supported: boolean;
  speaking: boolean;
  speak: (text: string, rate?: number) => void;
  stop: () => void;
}

/**
 * Same Japanese voice + rate path as the JLPT player (`speechService` / Nanami).
 */
export function useJapaneseVoice(): JapaneseVoice {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;

    const load = () => {
      setVoiceName(speechService.getPreferredVoiceName('ja'));
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      speechService.stop();
      setSpeaking(false);
    };
  }, [supported]);

  const stop = useCallback(() => {
    speechService.stop();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string, rate = SPEECH_RATE_NORMAL) => {
    const plain = stripFurigana(text);
    if (!plain.trim()) return;
    speechService.speakJapanese(
      plain,
      {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      },
      rate,
    );
  }, []);

  return { voiceName, supported, speaking, speak, stop };
}
