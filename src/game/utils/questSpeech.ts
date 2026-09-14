import type { QuestStep } from "../types";

export type KaraokeMode = "always" | "after-answer" | "off";

export type QuestStepSpeech = {
  /** Default true when the step has speakable content. */
  enabled?: boolean;
  language?: "ja" | "en";
  /** Override global Auto Voice for this line (still requires global ON). */
  autoPlay?: boolean;
  karaokeMode?: KaraokeMode;
  /** Station-announcement style flag (presentation only; same Nanami voice). */
  announcement?: boolean;
};

export type ResolvedQuestSpeech = {
  enabled: boolean;
  language: "ja" | "en";
  /** Whether this line may auto-play when global Auto Voice is ON. */
  autoPlay: boolean;
  karaokeMode: KaraokeMode;
  announcement: boolean;
  /** Japanese surface for karaoke (transcript). */
  displayJa: string;
  /** Text sent to TTS. */
  speakText: string;
  reading: string | null;
  hideTranscriptUntilAnswer: boolean;
  /** Separate English field for manual EN TTS (never mixed into JA utterance). */
  englishText: string | null;
};

/**
 * Resolve per-step speech behavior from quest data + defaults.
 * Listening challenges hide the transcript until the learner answers.
 * Reading challenges default to karaoke off (no auto speech of the notice body).
 */
export function resolveQuestSpeech(step: QuestStep): ResolvedQuestSpeech {
  const speech = step.speech;
  const listen = step.listenText?.trim() ?? "";
  const promptJa = step.promptJa?.trim() ?? "";
  const englishText = step.promptEn?.trim() || null;
  const reading =
    step.listenReading?.trim() || step.promptReading?.trim() || null;

  // Prefer dedicated listen audio when present; otherwise NPC/prompt Japanese.
  const speakJa = listen || promptJa;
  const displayJa = listen && listen !== promptJa ? listen : promptJa;

  // Intro: keep Japanese visible; English narration is separate + manual by default.
  if (step.kind === "intro") {
    return {
      enabled: Boolean(promptJa || englishText),
      language: promptJa ? "ja" : "en",
      autoPlay: speech?.autoPlay ?? false,
      karaokeMode: speech?.karaokeMode ?? "always",
      announcement: false,
      displayJa: promptJa,
      speakText: promptJa || englishText || "",
      reading: step.promptReading?.trim() || null,
      hideTranscriptUntilAnswer: false,
      englishText,
    };
  }

  // Reading: transcript stays visible; karaoke off; no autoplay unless opted in.
  if (step.kind === "reading") {
    const karaokeMode: KaraokeMode = speech?.karaokeMode ?? "off";
    return {
      enabled: speech?.enabled !== false && Boolean(promptJa),
      language: "ja",
      autoPlay: speech?.autoPlay ?? false,
      karaokeMode,
      announcement: false,
      displayJa: promptJa,
      speakText: promptJa,
      reading: step.promptReading?.trim() || null,
      hideTranscriptUntilAnswer: false,
      englishText,
    };
  }

  // Listening: always after-answer (even when listenText === promptJa).
  // Also treat listen≠prompt as a listening challenge when content declares audio.
  const listeningChallenge =
    speech?.karaokeMode === "after-answer" ||
    step.kind === "listening" ||
    (Boolean(listen) && listen !== promptJa);

  const karaokeMode: KaraokeMode =
    speech?.karaokeMode ??
    (listeningChallenge ? "after-answer" : "always");

  const language: "ja" | "en" = speech?.language ?? "ja";
  const isJaLine = language === "ja" && Boolean(speakJa);

  const enabled = speech?.enabled !== false && isJaLine;

  const autoPlay =
    speech?.autoPlay ??
    (isJaLine &&
      (Boolean(step.npcId) ||
        Boolean(listen) ||
        step.kind === "listening" ||
        step.kind === "outro"));

  return {
    enabled,
    language,
    autoPlay,
    karaokeMode,
    announcement:
      Boolean(speech?.announcement) ||
      step.id.includes("announcement") ||
      step.id.includes("delay"),
    displayJa,
    speakText: speakJa,
    reading,
    hideTranscriptUntilAnswer: karaokeMode === "after-answer",
    englishText,
  };
}
