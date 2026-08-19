import { speechService, SPEECH_RATE_NORMAL } from "../../services/speechService";
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
  onComplete: () => void
): void {
  const finish = () => {
    if (!isAlive()) return;
    onPart(null);
    onComplete();
  };

  const speakJa = (
    text: string,
    part: RelationPlayPart,
    onEnd: () => void
  ) => {
    if (!isAlive()) return;
    if (!text.trim()) {
      onEnd();
      return;
    }
    onPart(part);
    speechService.speakJapanese(
      text,
      { onEnd, onError: finish },
      SPEECH_RATE_NORMAL
    );
  };

  const speakEn = (
    text: string,
    part: RelationPlayPart,
    onEnd: () => void
  ) => {
    if (!isAlive()) return;
    if (!text.trim()) {
      onEnd();
      return;
    }
    onPart(part);
    speechService.speakEnglish(
      text,
      { onEnd, onError: finish },
      SPEECH_RATE_NORMAL
    );
  };

  const speakNuance = (nuance: string, onEnd: () => void) => {
    const segments = splitNuanceForSpeech(nuance);
    if (segments.length === 0) {
      onEnd();
      return;
    }

    const run = (index: number) => {
      if (!isAlive()) return;
      if (index >= segments.length) {
        onEnd();
        return;
      }

      const segment = segments[index]!;
      const text = segment.text.trim();
      if (!text) {
        run(index + 1);
        return;
      }

      onPart("nuance");
      const advance = () => run(index + 1);
      if (segment.lang === "ja") {
        speechService.speakJapanese(
          text,
          { onEnd: advance, onError: finish },
          SPEECH_RATE_NORMAL
        );
      } else {
        speechService.speakEnglish(
          text,
          { onEnd: advance, onError: finish },
          SPEECH_RATE_NORMAL
        );
      }
    };

    run(0);
  };

  speakJa(
    relation.word1.reading || relation.word1.japanese,
    "word1-jp",
    () =>
      speakEn(relation.word1.meaning, "word1-en", () =>
        speakJa(
          relation.word2.reading || relation.word2.japanese,
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
