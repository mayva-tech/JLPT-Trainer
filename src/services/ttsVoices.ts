/**
 * Single source of truth for browser SpeechSynthesis voice selection.
 *
 * Policy: every Japanese utterance uses Microsoft Nanami (七海) when available.
 * English continues to prefer Microsoft Andrew. Callers should go through
 * `speechService.speakJapanese` / `speakEnglish` rather than picking voices.
 */

export const JAPANESE_TTS_LANG = "ja-JP";
export const ENGLISH_TTS_LANG = "en-US";

/** Display / identity hints for Nanami (browser voice `name` varies by OS). */
export const JAPANESE_TTS_VOICE_HINTS = [
  "Nanami",
  "七海",
  "ja-JP-NanamiNeural",
] as const;

export const ENGLISH_TTS_VOICE_HINTS = ["Andrew"] as const;

export type TtsLanguage = "ja" | "en";

/** Normalize caller language tags to the trainer's JA/EN buckets. */
export function normalizeTtsLanguage(
  language: string | null | undefined
): TtsLanguage | null {
  if (!language) return null;
  const lower = language.trim().toLowerCase().replace(/_/g, "-");
  if (
    lower === "ja" ||
    lower.startsWith("ja-") ||
    lower === "jp" ||
    lower.startsWith("jp-")
  ) {
    return "ja";
  }
  if (lower === "en" || lower.startsWith("en-")) {
    return "en";
  }
  return null;
}

export function isJapaneseTtsLanguage(
  language: string | null | undefined
): boolean {
  return normalizeTtsLanguage(language) === "ja";
}

export function utteranceLangFor(language: TtsLanguage): string {
  return language === "ja" ? JAPANESE_TTS_LANG : ENGLISH_TTS_LANG;
}

function voiceName(v: SpeechSynthesisVoice): string {
  return v.name ?? "";
}

function isJapaneseVoice(v: SpeechSynthesisVoice): boolean {
  return (v.lang ?? "").toLowerCase().startsWith("ja");
}

function isEnglishVoice(v: SpeechSynthesisVoice): boolean {
  return (v.lang ?? "").toLowerCase().startsWith("en");
}

function isNanamiVoice(v: SpeechSynthesisVoice): boolean {
  const n = voiceName(v);
  return /nanami/i.test(n) || /七海/.test(n) || /NanamiNeural/i.test(n);
}

function isAndrewVoice(v: SpeechSynthesisVoice): boolean {
  return /andrew/i.test(voiceName(v));
}

function isNeuralLike(v: SpeechSynthesisVoice): boolean {
  const n = voiceName(v);
  return /online|natural|neural/i.test(n);
}

function isMicrosoftVoice(v: SpeechSynthesisVoice): boolean {
  return /microsoft/i.test(voiceName(v));
}

/**
 * Resolve the Japanese TTS voice.
 *
 * Fallback order (only when Nanami is unavailable):
 * 1. Microsoft Nanami / 七海
 * 2. Other Microsoft neural/online Japanese voices
 * 3. Any other neural/online Japanese voice
 * 4. Any `ja-JP` / `ja*` voice
 * 5. null (caller uses system default)
 */
export function resolveJapaneseVoice(
  voices: readonly SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const ja = voices.filter(isJapaneseVoice);
  if (ja.length === 0) return null;

  const nanami = ja.filter(isNanamiVoice);
  if (nanami.length > 0) {
    // Prefer Online/Natural Nanami when several Nanami entries exist.
    return (
      [...nanami].sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) =>
          (isNeuralLike(v) ? 2 : 0) + (isMicrosoftVoice(v) ? 1 : 0);
        return score(b) - score(a);
      })[0] ?? null
    );
  }

  const microsoftNeural = ja.filter(
    (v) => isMicrosoftVoice(v) && isNeuralLike(v)
  );
  if (microsoftNeural.length > 0) return microsoftNeural[0] ?? null;

  const neural = ja.filter(isNeuralLike);
  if (neural.length > 0) return neural[0] ?? null;

  const jaJp = ja.filter((v) =>
    (v.lang ?? "").toLowerCase().startsWith("ja-jp")
  );
  if (jaJp.length > 0) return jaJp[0] ?? null;

  return ja[0] ?? null;
}

/**
 * Resolve the English TTS voice (Andrew preferred). Unrelated to Nanami.
 */
export function resolveEnglishVoice(
  voices: readonly SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const en = voices.filter(isEnglishVoice);
  if (en.length === 0) return null;

  const andrew = en.filter(isAndrewVoice);
  if (andrew.length > 0) {
    return (
      [...andrew].sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) =>
          (isNeuralLike(v) ? 2 : 0) +
          (isMicrosoftVoice(v) ? 1 : 0) +
          (/en-us/i.test(v.lang) || /United States/i.test(voiceName(v))
            ? 1
            : 0);
        return score(b) - score(a);
      })[0] ?? null
    );
  }

  const microsoftNeural = en.filter(
    (v) => isMicrosoftVoice(v) && isNeuralLike(v)
  );
  if (microsoftNeural.length > 0) return microsoftNeural[0] ?? null;

  const us = en.filter(
    (v) =>
      /en-us/i.test(v.lang) || /United States/i.test(voiceName(v))
  );
  if (us.length > 0) return us[0] ?? null;

  return en[0] ?? null;
}

/** Shared resolver used by speechService and tests. */
export function resolveTtsVoice(
  language: string,
  voices: readonly SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const normalized = normalizeTtsLanguage(language);
  if (normalized === "ja") return resolveJapaneseVoice(voices);
  if (normalized === "en") return resolveEnglishVoice(voices);
  return null;
}

export function getTtsVoiceName(
  language: string,
  voices: readonly SpeechSynthesisVoice[]
): string | null {
  return resolveTtsVoice(language, voices)?.name ?? null;
}

/** True when the resolved Japanese voice is Nanami (not a fallback). */
export function isResolvedVoiceNanami(
  voice: SpeechSynthesisVoice | null
): boolean {
  return voice != null && isNanamiVoice(voice);
}
