import type { VocabularyItem } from "../../types/vocabulary";
import { kanjiDetailsFor } from "../kanjiDetails";
import { n3Lessons } from "./lessonsN3";
import { n3VocabNuances } from "./vocabularyN3Nuances";
import { n3VocabularySeeds } from "./vocabularyN3Seeds";

const audio = (folder: string, id: number) => ({
  audioWord: `/audio/n3/${folder}/${id}-word.mp3`,
  audioPhrase: `/audio/n3/${folder}/${id}-phrase.mp3`,
  audioSentence: `/audio/n3/${folder}/${id}-sentence.mp3`,
});

const CATEGORY_BY_ID = new Map<number, string>();
for (const lesson of n3Lessons) {
  for (const id of lesson.vocabularyIds) CATEGORY_BY_ID.set(id, lesson.category);
}

/**
 * JLPT N3 vocabulary course — a separate corpus from the N2 `vocabulary`
 * array (whose 2000-item count stays fixed). Items have the same shape, so
 * the player, TTS, furigana, pitch, nuance and picture rules apply as-is;
 * `getVocabularyById` in ../vocabulary resolves both corpora.
 */
export const vocabularyN3: VocabularyItem[] = n3VocabularySeeds.map(({ folder, ...seed }) => {
  const notes = n3VocabNuances[seed.id];
  return {
    ...seed,
    ...(notes?.word ? { wordNuance: notes.word } : {}),
    ...(notes?.phrase ? { phraseNuance: notes.phrase } : {}),
    ...(notes?.sentence ? { sentenceNuance: notes.sentence } : {}),
    jlpt: "N3" as const,
    category: CATEGORY_BY_ID.get(seed.id) ?? "Daily Life",
    kanjiDetails: kanjiDetailsFor(seed.word, seed.phrase, seed.sentence),
    ...audio(folder, seed.id),
  };
});
