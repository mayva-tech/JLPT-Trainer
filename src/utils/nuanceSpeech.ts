export type NuanceSpeechSegment = {
  lang: "ja" | "en";
  text: string;
};

const JP_CHAR =
  /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u3005\u3006\u30fc]/u;

function isJapaneseChar(ch: string): boolean {
  return JP_CHAR.test(ch);
}

/**
 * Splits a nuance note into alternating Japanese and English runs so each can
 * use the correct TTS voice (Nanami vs English).
 */
export function splitNuanceForSpeech(text: string): NuanceSpeechSegment[] {
  const segments: NuanceSpeechSegment[] = [];
  let index = 0;

  while (index < text.length) {
    const japanese = isJapaneseChar(text[index]!);
    let end = index + 1;
    while (end < text.length && isJapaneseChar(text[end]!) === japanese) {
      end += 1;
    }

    const slice = text.slice(index, end);
    if (slice.trim()) {
      const lang = japanese ? "ja" : "en";
      const last = segments[segments.length - 1];
      if (last?.lang === lang) {
        last.text += slice;
      } else {
        segments.push({ lang, text: slice });
      }
    }

    index = end;
  }

  return segments;
}
