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
 *
 * Order when Auto Voice is ON:
 * 1. Quest title Japanese → English (optional, once per open)
 * 2. Subject / prompt Japanese → English
 * 3. Each MCQ choice Japanese → English (before answer)
 * 4. Help hint (when Help is on)
 *
 * English after Japanese is always included when `includeEnglish` is true
 * (Auto Voice ON and English not immersion-blocked). Listening / hidden
 * transcript beats skip English until revealed.
 */
export function buildQuestAutoPlayQueue(options: {
  step: QuestStep;
  resolved: ResolvedQuestSpeech;
  showHelp: boolean;
  revealed: boolean;
  /** Speak English after each Japanese line (Auto Voice full bilingual). */
  includeEnglish?: boolean;
  /** Optional quest banner title (spoken once by the runner). */
  titleJa?: string | null;
  titleEn?: string | null;
  includeTitle?: boolean;
}): QuestAutoPlayItem[] {
  const {
    step,
    resolved,
    showHelp,
    revealed,
    includeEnglish = false,
    titleJa,
    titleEn,
    includeTitle = false,
  } = options;
  if (!resolved.enabled) return [];

  const queue: QuestAutoPlayItem[] = [];
  const hideKaraoke =
    resolved.karaokeMode === "off" ||
    (resolved.hideTranscriptUntilAnswer && !revealed);
  const promptKaraoke =
    !hideKaraoke && resolved.karaokeMode !== "off";
  const speakEn =
    includeEnglish &&
    !(resolved.hideTranscriptUntilAnswer && !revealed);
  const speakEnTitle = includeEnglish;

  if (includeTitle) {
    const ja = titleJa?.trim() ?? "";
    const en = titleEn?.trim() ?? "";
    if (ja) {
      queue.push({ kind: "ja", text: ja, karaoke: true });
    }
    if (speakEnTitle && en) {
      queue.push({ kind: "en", text: en, karaoke: true });
    }
  }

  if (resolved.speakText.trim()) {
    if (resolved.language === "en") {
      // Authored EN-only narration: still prefer JA prompt first when present.
      const jaPrompt = step.promptJa?.trim() ?? "";
      if (jaPrompt) {
        queue.push({
          kind: "ja",
          text: jaPrompt,
          reading: step.promptReading?.trim() || null,
          karaoke: promptKaraoke,
        });
      }
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
      if (speakEn && resolved.englishText?.trim()) {
        queue.push({
          kind: "en",
          text: resolved.englishText.trim(),
          karaoke: true,
        });
      } else if (showHelp && resolved.englishText?.trim()) {
        queue.push({
          kind: "en",
          text: resolved.englishText.trim(),
          karaoke: true,
        });
      }
    }
  } else if (
    (speakEn || showHelp) &&
    resolved.englishText?.trim()
  ) {
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
      if (speakEn || showHelp) {
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
