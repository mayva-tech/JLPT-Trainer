import type { QuestStep } from "../types";
import type { ResolvedQuestSpeech } from "./questSpeech";
import { parseBilingualSpeakSegments } from "./questFeedbackSpeech";

export type QuestAutoPlayItem =
  | {
      kind: "ja";
      text: string;
      reading?: string | null;
      karaoke: boolean;
      /** When set, highlight this MCQ row while speaking. */
      choiceId?: string;
    }
  | {
      kind: "en";
      text: string;
      karaoke: boolean;
    }
  | {
      kind: "bilingual";
      text: string;
    };

/**
 * Build the Auto Voice speak queue for a quest step.
 * Always: prompt (+ each MCQ choice when not yet answered).
 * When Help is on: English after each Japanese line, then the help hint.
 */
export function buildQuestAutoPlayQueue(options: {
  step: QuestStep;
  resolved: ResolvedQuestSpeech;
  showHelp: boolean;
  revealed: boolean;
}): QuestAutoPlayItem[] {
  const { step, resolved, showHelp, revealed } = options;
  if (!resolved.enabled || !resolved.autoPlay) return [];

  const queue: QuestAutoPlayItem[] = [];
  const hideKaraoke =
    resolved.karaokeMode === "off" ||
    (resolved.hideTranscriptUntilAnswer && !revealed);
  const promptKaraoke =
    !hideKaraoke && resolved.karaokeMode !== "off";

  if (resolved.speakText.trim()) {
    if (resolved.language === "en") {
      queue.push({
        kind: "en",
        text: resolved.speakText,
        karaoke: resolved.karaokeMode === "always",
      });
    } else {
      queue.push({
        kind: "ja",
        text: resolved.speakText,
        reading: resolved.reading,
        karaoke: promptKaraoke,
      });
      if (showHelp && resolved.englishText?.trim()) {
        queue.push({
          kind: "en",
          text: resolved.englishText.trim(),
          karaoke: true,
        });
      }
    }
  } else if (showHelp && resolved.englishText?.trim()) {
    queue.push({
      kind: "en",
      text: resolved.englishText.trim(),
      karaoke: true,
    });
  }

  // Multiple-choice answers — only before the learner commits an answer.
  if (!revealed && step.choices && step.choices.length > 0) {
    for (const choice of step.choices) {
      const ja = choice.labelJa?.trim() ?? "";
      if (ja) {
        queue.push({
          kind: "ja",
          text: ja,
          karaoke: true,
          choiceId: choice.id,
        });
      }
      if (showHelp) {
        const en = choice.labelEn?.trim() ?? "";
        if (en) {
          queue.push({ kind: "en", text: en, karaoke: true });
        }
      }
    }
  }

  if (showHelp && step.helpHint?.trim()) {
    const segments = parseBilingualSpeakSegments(step.helpHint);
    if (segments.length > 0) {
      queue.push({ kind: "bilingual", text: step.helpHint.trim() });
    }
  }

  return queue;
}
