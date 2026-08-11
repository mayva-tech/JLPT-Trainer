import { useCallback, useEffect, useState } from 'react';
import { stripFurigana } from './furigana';

/** Preference order: Nanami first, then any other Japanese voice. */
const PREFERRED = ['nanami', 'ayumi', 'haruka', 'kyoko', 'google 日本語', 'japanese'];

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const japanese = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));
  if (japanese.length === 0) return null;

  for (const name of PREFERRED) {
    const hit = japanese.find((v) => v.name.toLowerCase().includes(name));
    if (hit) return hit;
  }
  return japanese[0];
}

export interface JapaneseVoice {
  /** Display name of the active voice, or null if the device has none. */
  voiceName: string | null;
  supported: boolean;
  speaking: boolean;
  speak: (text: string, rate?: number) => void;
  stop: () => void;
}

export function useJapaneseVoice(): JapaneseVoice {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;

    const load = () => setVoice(pickVoice(window.speechSynthesis.getVoices()));
    load();
    // Chrome populates the voice list asynchronously.
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(stripFurigana(text));
      utterance.lang = 'ja-JP';
      utterance.rate = rate;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported, voice],
  );

  return { voiceName: voice?.name ?? null, supported, speaking, speak, stop };
}
