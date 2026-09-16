import { describe, expect, it } from "vitest";
import {
  ENGLISH_TTS_LANG,
  JAPANESE_TTS_LANG,
  JAPANESE_TTS_VOICE_HINTS,
  getTtsVoiceName,
  isJapaneseTtsLanguage,
  isResolvedVoiceNanami,
  normalizeTtsLanguage,
  resolveEnglishVoice,
  resolveJapaneseVoice,
  resolveTtsVoice,
  utteranceLangFor,
} from "./ttsVoices";

function voice(
  name: string,
  lang: string,
  extras?: Partial<SpeechSynthesisVoice>
): SpeechSynthesisVoice {
  return {
    name,
    lang,
    localService: false,
    default: false,
    voiceURI: name,
    ...extras,
  } as SpeechSynthesisVoice;
}

describe("ttsVoices Japanese Nanami policy", () => {
  it("normalizes Japanese language aliases to ja", () => {
    expect(normalizeTtsLanguage("ja")).toBe("ja");
    expect(normalizeTtsLanguage("ja-JP")).toBe("ja");
    expect(normalizeTtsLanguage("ja_JP")).toBe("ja");
    expect(normalizeTtsLanguage("JP")).toBe("ja");
    expect(normalizeTtsLanguage("en-US")).toBe("en");
    expect(normalizeTtsLanguage("fr-FR")).toBeNull();
    expect(isJapaneseTtsLanguage("ja-JP")).toBe(true);
    expect(isJapaneseTtsLanguage("en")).toBe(false);
    expect(utteranceLangFor("ja")).toBe(JAPANESE_TTS_LANG);
    expect(utteranceLangFor("en")).toBe(ENGLISH_TTS_LANG);
  });

  it("resolves ja-JP to Microsoft Nanami when available", () => {
    const voices = [
      voice("Microsoft Haruka", "ja-JP"),
      voice("Google 日本語", "ja-JP"),
      voice("Microsoft Nanami Online (Natural) - Japanese (Japan)", "ja-JP"),
      voice("Microsoft Andrew Online", "en-US"),
      voice("Kyoko", "ja-JP", { localService: true }),
    ];
    const resolved = resolveJapaneseVoice(voices);
    expect(resolved?.name).toMatch(/Nanami/i);
    expect(isResolvedVoiceNanami(resolved)).toBe(true);
    expect(getTtsVoiceName("ja-JP", voices)).toMatch(/Nanami/i);
    expect(getTtsVoiceName("ja", voices)).toMatch(/Nanami/i);
    expect(resolveTtsVoice("ja-JP", voices)?.name).toMatch(/Nanami/i);
  });

  it("prefers 七海 Nanami spelling", () => {
    const voices = [
      voice("Microsoft Haruka Online", "ja-JP"),
      voice("Microsoft 七海 Online", "ja-JP"),
    ];
    expect(resolveJapaneseVoice(voices)?.name).toContain("七海");
  });

  it("does not pick another Japanese voice when Nanami exists", () => {
    const voices = [
      voice("Microsoft Sayaka Online (Natural)", "ja-JP"),
      voice("Microsoft Nanami", "ja-JP"),
      voice("Google Japanese", "ja"),
    ];
    const resolved = resolveJapaneseVoice(voices)!;
    expect(isResolvedVoiceNanami(resolved)).toBe(true);
    expect(resolved.name).not.toMatch(/Sayaka|Google/i);
  });

  it("falls back only when Nanami is unavailable", () => {
    const microsoftNeural = resolveJapaneseVoice([
      voice("Kyoko", "ja-JP", { localService: true }),
      voice("Microsoft Haruka Online (Natural)", "ja-JP"),
    ]);
    expect(microsoftNeural?.name).toMatch(/Haruka/i);

    const anyJa = resolveJapaneseVoice([
      voice("Kyoko", "ja-JP", { localService: true }),
    ]);
    expect(anyJa?.name).toBe("Kyoko");

    expect(resolveJapaneseVoice([voice("Andrew", "en-US")])).toBeNull();
  });

  it("keeps English on Andrew, never Nanami", () => {
    const voices = [
      voice("Microsoft Nanami Online", "ja-JP"),
      voice("Microsoft Andrew Online (Natural) - English (United States)", "en-US"),
      voice("Google US English", "en-US"),
    ];
    const en = resolveEnglishVoice(voices);
    expect(en?.name).toMatch(/Andrew/i);
    expect(isResolvedVoiceNanami(en)).toBe(false);
    expect(getTtsVoiceName("en-US", voices)).toMatch(/Andrew/i);
    expect(getTtsVoiceName("en", voices)).not.toMatch(/Nanami/i);
  });

  it("documents Nanami identity hints used by the resolver", () => {
    expect(JAPANESE_TTS_VOICE_HINTS.join(" ")).toMatch(/Nanami/);
    expect(JAPANESE_TTS_LANG).toBe("ja-JP");
  });
});
