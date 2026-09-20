/**
 * Global speech event bus.
 *
 * `SpeakCallbacks` are passed per call by whichever page is speaking, so there
 * is no way for a shared component to observe speech without every page
 * threading callbacks down to it. This bus lets `speechService` announce what
 * it is doing once, so a single mounted `<TalkingHead />` covers every trainer,
 * the player, and the quest without any of them knowing it exists.
 *
 * It is deliberately separate from `speechService` so that the service only
 * gains a handful of emit lines, and so this can be imported by UI without
 * pulling the whole synthesis module into a component's dependency graph.
 */

export type SpeechBusEvent =
  | {
      type: "start";
      lang: "ja" | "en";
      /** Playback rate, so listeners can scale their own animation timing. */
      rate: number;
    }
  | {
      type: "unit";
      lang: "ja" | "en";
      /** Visible text of the unit being spoken. */
      text: string;
      /** Kana reading when the karaoke path has one — needed for JA vowels. */
      spokenText: string | null;
      /** Estimated spoken length of this unit in ms, already rate-scaled — same value that drives karaoke. */
      durationMs: number;
    }
  | { type: "end" };

type Listener = (event: SpeechBusEvent) => void;

const listeners = new Set<Listener>();

/** Subscribe to speech events. Returns an unsubscribe function. */
export function subscribeToSpeech(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Announce a speech event. Never throws into the speech path: a listener that
 * fails must not be able to interrupt audio playback.
 */
export function emitSpeechEvent(event: SpeechBusEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A broken listener is a UI problem, not a reason to stop speaking.
    }
  }
}

/** Test seam — drops all listeners. */
export function __resetSpeechBus(): void {
  listeners.clear();
}
