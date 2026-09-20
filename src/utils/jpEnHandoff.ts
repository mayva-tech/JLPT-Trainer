import { SPEECH_JP_EN_HANDOFF_MS } from "../config/speechTiming";

/**
 * After a Japanese utterance, briefly pause before Andrew when the next
 * segment is English. Same-language or EN→JA chains continue immediately.
 */
export function scheduleAfterLanguageHandoff(
  from: "ja" | "en",
  to: "ja" | "en" | undefined,
  next: () => void
): void {
  if (from === "ja" && to === "en") {
    window.setTimeout(next, SPEECH_JP_EN_HANDOFF_MS);
    return;
  }
  next();
}
