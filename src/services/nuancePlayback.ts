import { splitNuanceForSpeech } from "../utils/nuanceSpeech";
import { speechService, type SpeechHighlight } from "./speechService";

type NuanceCallbacks = {
  isAlive: () => boolean;
  /** Offsets are into the full nuance text, across JA/EN voice switches. */
  onHighlight: (h: SpeechHighlight | null) => void;
  onEnd: () => void;
};

/** Speaks a mixed JA/EN note run by run with the matching voice. */
export function speakNuance(
  nuance: string,
  rate: number,
  { isAlive, onHighlight, onEnd }: NuanceCallbacks
): void {
  const segments = splitNuanceForSpeech(nuance);
  let cursor = 0;
  const located = segments.map((segment) => {
    const found = nuance.indexOf(segment.text, cursor);
    const start = found >= 0 ? found : cursor;
    cursor = start + segment.text.length;
    return { ...segment, start };
  });

  const run = (index: number) => {
    // Still settle when cancelled so awaiting sequencers never hang.
    if (!isAlive()) {
      onEnd();
      return;
    }
    const segment = located[index];
    if (!segment) {
      onHighlight(null);
      onEnd();
      return;
    }
    const text = segment.text.trim();
    if (!text) {
      run(index + 1);
      return;
    }
    const offset = segment.start + Math.max(0, segment.text.indexOf(text));
    const callbacks = {
      onBoundary: (h: SpeechHighlight) => {
        if (!isAlive()) return;
        onHighlight({ start: h.start + offset, end: h.end + offset });
      },
      onEnd: () => {
        onHighlight(null);
        run(index + 1);
      },
      onError: () => {
        onHighlight(null);
        onEnd();
      },
    };
    if (segment.lang === "ja") {
      speechService.speakJapanese(text, callbacks, rate, { followVoice: true });
    } else {
      speechService.speakEnglish(text, callbacks, rate, { followVoice: true });
    }
  };

  run(0);
}
