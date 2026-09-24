import {
  speechService,
  SPEECH_RATE_NORMAL,
  type SpeechHighlight,
} from "../../services/speechService";
import type { WordRelation } from "../../types/wordRelation";
import { splitNuanceForSpeech } from "../../utils/nuanceSpeech";

export type RelationPlayPart =
  | "word1-jp"
  | "word1-en"
  | "word2-jp"
  | "word2-en"
  | "nuance";

/** Speaks word1 JP → EN, word2 JP → EN, then the nuance note by language. */
export function playRelationSequence(
  relation: WordRelation,
  _session: number,
  isAlive: () => boolean,
  onPart: (part: RelationPlayPart | null) => void,
  onComplete: () => void,
  onHighlight: (h: SpeechHighlight | null) => void = () => {}
): void {
  const finish = () => {
    if (!isAlive()) return;
    onHighlight(null);
    onPart(null);
    onComplete();
  };

  const speakJa = (
    surface: string,
    reading: string | undefined,
    part: RelationPlayPart,
    onEnd: () => void
  ) => {
    if (!isAlive()) return;
    const text = surface.trim();
    if (!text) {
      onEnd();
      return;
    }
    onPart(part);
    onHighlight(null);
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => {
          if (!isAlive()) return;
          onHighlight(h);
        },
        onEnd: () => {
          onHighlight(null);
          onEnd();
        },
        onError: finish,
      },
      SPEECH_RATE_NORMAL,
      reading?.trim() ? { reading: reading.trim() } : undefined
    );
  };

  const speakEn = (
    text: string,
    part: RelationPlayPart,
    onEnd: () => void
  ) => {
    if (!isAlive()) return;
    const trimmed = text.trim();
    if (!trimmed) {
      onEnd();
      return;
    }
    onPart(part);
    onHighlight(null);
    speechService.speakEnglish(
      trimmed,
      {
        onBoundary: (h) => {
          if (!isAlive()) return;
          onHighlight(h);
        },
        onEnd: () => {
          onHighlight(null);
          onEnd();
        },
        onError: finish,
      },
      SPEECH_RATE_NORMAL
    );
  };

  const speakNuance = (nuance: string, onEnd: () => void) => {
    const segments = splitNuanceForSpeech(nuance);
    if (segments.length === 0) {
      onEnd();
      return;
    }

    let cursor = 0;
    const located = segments.map((segment) => {
      const start = nuance.indexOf(segment.text, cursor);
      const resolved = start >= 0 ? start : cursor;
      cursor = resolved + segment.text.length;
      return { ...segment, start: resolved };
    });

    const run = (index: number) => {
      if (!isAlive()) return;
      if (index >= located.length) {
        onEnd();
        return;
      }

      const segment = located[index]!;
      const text = segment.text.trim();
      if (!text) {
        run(index + 1);
        return;
      }

      onPart("nuance");
      onHighlight(null);
      const trimStart = segment.text.indexOf(text);
      const offset = segment.start + (trimStart >= 0 ? trimStart : 0);
      const advance = () => {
        onHighlight(null);
        run(index + 1);
      };
      const mapBoundary = (h: SpeechHighlight) => {
        if (!isAlive()) return;
        onHighlight({ start: h.start + offset, end: h.end + offset });
      };

      if (segment.lang === "ja") {
        speechService.speakJapanese(
          text,
          {
            onBoundary: mapBoundary,
            onEnd: advance,
            onError: finish,
          },
          SPEECH_RATE_NORMAL
        );
      } else {
        speechService.speakEnglish(
          text,
          {
            onBoundary: mapBoundary,
            onEnd: advance,
            onError: finish,
          },
          SPEECH_RATE_NORMAL
        );
      }
    };

    run(0);
  };

  speakJa(
    relation.word1.japanese,
    relation.word1.reading,
    "word1-jp",
    () =>
      speakEn(relation.word1.meaning, "word1-en", () =>
        speakJa(
          relation.word2.japanese,
          relation.word2.reading,
          "word2-jp",
          () =>
            speakEn(relation.word2.meaning, "word2-en", () => {
              if (relation.nuance?.trim()) {
                speakNuance(relation.nuance, finish);
              } else {
                finish();
              }
            })
        )
      )
  );
}
