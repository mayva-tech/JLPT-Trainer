import type { GrammarItem } from "../types/grammar";
import type { StepName } from "../types/player";
import type { VocabularyItem } from "../types/vocabulary";
import type { GrammarStep } from "../services/grammarAutoModeRunner";

/** Nuance note shown on a vocabulary step, if any. */
export function vocabStepNuance(
  step: StepName,
  item: VocabularyItem
): string | undefined {
  const note =
    step === "word"
      ? item.wordNuance
      : step === "phrase"
        ? item.phraseNuance
        : step === "sentence"
          ? item.sentenceNuance
          : undefined;
  return note?.trim() || undefined;
}

/** Nuance note shown on a grammar step, if any. */
export function grammarStepNuance(
  step: GrammarStep,
  item: GrammarItem
): string | undefined {
  const note =
    step === "pattern"
      ? item.nuance
      : step === "sentence"
        ? item.sentenceNuance
        : undefined;
  return note?.trim() || undefined;
}
