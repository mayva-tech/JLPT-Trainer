export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  youtubeTitle: string; // the searchable YouTube title
  category: string;
  subcategories: string[]; // e.g. ["Apartment", "Grocery", "Weather"]
  vocabularyIds: number[];
};

export type GrammarLesson = {
  id: string;
  title: string;
  subtitle: string;
  youtubeTitle: string;
  category: string;
  subcategories: string[];
  grammarIds: number[];
};
