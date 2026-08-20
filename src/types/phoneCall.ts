/**
 * Phone Conversation Scripts (電話会話) content types.
 *
 * A fifth INDEPENDENT content database, alongside grammar, vocabulary,
 * onomatopoeia and word relations. Nothing here feeds those counts.
 */

export type PhoneLevel = "N5" | "N4" | "N3" | "N2";

export type PhoneCategoryId =
  | "phone-skills"
  | "messages"
  | "appointments"
  | "reservations"
  | "school-work"
  | "delivery"
  | "utilities"
  | "finance"
  | "government"
  | "transport"
  | "shopping"
  | "business"
  | "emergency";

export interface PhoneCategory {
  id: PhoneCategoryId;
  japanese: string;
  english: string;
  description: string;
}

/** Who is speaking. `learner` marks the side the user practises. */
export type PhoneSpeaker = "A" | "B";

export interface PhoneLine {
  speaker: PhoneSpeaker;
  japanese: string;
  /** Full kana reading of the line, punctuation kept. */
  reading: string;
  english: string;
}

export interface PhonePhrase {
  japanese: string;
  reading: string;
  english: string;
  /** When to reach for it, and how polite it sounds. */
  note: string;
}

export interface PhoneVocab {
  japanese: string;
  reading: string;
  english: string;
  partOfSpeech: string;
}

export interface PhoneScenario {
  id: string;
  jlptLevel: PhoneLevel;
  category: PhoneCategoryId;
  /** Japanese scenario title, e.g. 歯医者の予約を変更する. */
  title: string;
  titleEn: string;
  /** What is happening and why you are calling. */
  situation: string;
  /** Label for speaker A, e.g. 受付 (clinic receptionist). */
  roleA: string;
  /** Label for speaker B. */
  roleB: string;
  /** Which side the learner plays in role-play mode. */
  learner: PhoneSpeaker;
  /** Register notes: keigo used, what to avoid, how it would sound casually. */
  politeness: string;
  dialogue: PhoneLine[];
  keyPhrases: PhonePhrase[];
  vocabulary: PhoneVocab[];
  tags: string[];
}

/** Not started → practised → mastered, on the shared two-list progress model. */
export type PhoneStatus = "new" | "practised" | "mastered";
