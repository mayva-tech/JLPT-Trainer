export type GrammarItem = {
  id: number; // 5001–5050
  jlpt: "N2";
  category: string; // "Grammar"
  subcategory: string; // e.g. "Concession & Contrast"

  pattern: string; // e.g. "〜にもかかわらず"
  patternReading: string; // kana reading of the pattern token
  meaning: string; // short English meaning

  formation: string; // e.g. "V dict / N + にもかかわらず"

  sentence: string;
  sentenceReading: string; // space-separated by word, same convention as vocabulary
  sentenceMeaning: string;

  audioSentence: string; // /audio/n2/grammar/{id}-sentence.mp3
};
