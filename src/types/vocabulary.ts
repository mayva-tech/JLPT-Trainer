export type KanjiDetail = {
  character: string;
  meaning: string;
  onyomi?: string[];
  kunyomi?: string[];
};

export type VocabularyItem = {
  id: number;
  jlpt: "N1" | "N2" | "N3";
  category: string; // e.g. "Daily Life"
  subcategory: string; // e.g. "Apartment"

  word: string;
  reading: string;
  meaning: string;
  /** Short usage note for the word — only when something is worth noting. */
  wordNuance?: string;

  phrase: string;
  phraseReading: string;
  phraseMeaning: string;
  /** Short usage note for the phrase — only when something is worth noting. */
  phraseNuance?: string;

  sentence: string;
  sentenceReading: string;
  sentenceMeaning: string;
  /** Short usage note for the example sentence — only when something is worth noting. */
  sentenceNuance?: string;

  kanjiDetails: KanjiDetail[];
  wordType: string;

  audioWord: string; // path to /audio/...mp3
  audioPhrase: string;
  audioSentence: string;
};
