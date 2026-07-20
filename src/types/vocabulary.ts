export type KanjiDetail = {
  character: string;
  meaning: string;
  onyomi?: string[];
  kunyomi?: string[];
};

export type VocabularyItem = {
  id: number;
  jlpt: "N1" | "N2";
  category: string; // e.g. "Daily Life"
  subcategory: string; // e.g. "Apartment"

  word: string;
  reading: string;
  meaning: string;

  phrase: string;
  phraseReading: string;
  phraseMeaning: string;

  sentence: string;
  sentenceReading: string;
  sentenceMeaning: string;

  kanjiDetails: KanjiDetail[];
  wordType: string;

  audioWord: string; // path to /audio/...mp3
  audioPhrase: string;
  audioSentence: string;
};
