import type { GrammarItem } from "../../types/grammar";
import type { GrammarLesson } from "../../types/lesson";
import type { GrammarNuanceEntry } from "../grammarNuances/types";

/**
 * JLPT N3 grammar course.
 *
 * Two sources, no duplicates:
 *  - the 18 N3 patterns already in the main corpus (grammar.ts, courseLevel
 *    N3_REVIEW, ids 5017 … 5367) — referenced by id, never copied;
 *  - new N3 patterns below (ids 9001+), checked against every pattern in
 *    the corpus with normalizeGrammarPattern (grammarN3.test.ts).
 *
 * New items use courseLevel N3_REVIEW, so getGrammarItemsForLesson keeps
 * them in `n3-` lessons, exactly like the existing N3 items.
 */

type GrammarN3Seed = Omit<GrammarItem, "jlpt" | "courseLevel" | "category" | "audioSentence">;

const seeds: GrammarN3Seed[] = [
  {
    id: 9001,
    familyId: "n3-ことにする",
    isPrimary: true,
    subcategory: "Volition & Effort",
    pattern: "〜ことにする",
    patternReading: "〜ことにする",
    meaning: "to decide to do; to make it a rule to",
    formation: "V dict / V ない + ことにする",
    sentence: "健康のために、毎朝歩くことにした。",
    sentenceReading: "けんこう の ため に、まいあさ あるく こと に した。",
    sentenceMeaning: "For my health, I decided to walk every morning.",
  },
  {
    id: 9002,
    familyId: "n3-ことになる",
    isPrimary: true,
    subcategory: "Result & Consequence",
    pattern: "〜ことになる",
    patternReading: "〜ことになる",
    meaning: "it has been decided that; it turns out that",
    formation: "V dict / V ない + ことになる",
    sentence: "来月から大阪に転勤することになった。",
    sentenceReading: "らいげつ から おおさか に てんきん する こと に なった。",
    sentenceMeaning: "It has been decided that I'll transfer to Osaka from next month.",
  },
  {
    id: 9003,
    familyId: "n3-たばかり",
    isPrimary: true,
    subcategory: "Time & Sequence",
    pattern: "〜たばかり",
    patternReading: "〜たばかり",
    meaning: "have just done",
    formation: "V た-form + ばかり",
    sentence: "日本に来たばかりなので、まだ友達がいない。",
    sentenceReading: "にほん に きた ばかり なので、まだ ともだち が いない。",
    sentenceMeaning: "I've only just come to Japan, so I don't have friends yet.",
  },
  {
    id: 9004,
    familyId: "n3-ところだ",
    isPrimary: true,
    subcategory: "Time & Sequence",
    pattern: "〜ところだ",
    patternReading: "〜ところだ",
    meaning: "about to; in the middle of; just finished",
    formation: "V dict / V ている / V た + ところだ",
    sentence: "今、駅に着いたところです。",
    sentenceReading: "いま、えき に ついた ところ です。",
    sentenceMeaning: "I've just arrived at the station.",
  },
  {
    id: 9005,
    familyId: "n3-かわりに",
    isPrimary: true,
    subcategory: "Selection & Preference",
    pattern: "〜かわりに",
    patternReading: "〜かわりに",
    meaning: "instead of; in exchange for",
    formation: "N の / V plain + かわりに",
    sentence: "部長のかわりに、私が会議に出ます。",
    sentenceReading: "ぶちょう の かわり に、わたし が かいぎ に でます。",
    sentenceMeaning: "I'll attend the meeting instead of the manager.",
  },
  {
    id: 9006,
    familyId: "n3-まま",
    isPrimary: true,
    subcategory: "State & Condition",
    pattern: "〜まま",
    patternReading: "〜まま",
    meaning: "as it is; leaving something unchanged",
    formation: "V た / V ない / N の / い-adj / な-adj な + まま",
    sentence: "電気をつけたまま寝てしまった。",
    sentenceReading: "でんき を つけた まま ねて しまった。",
    sentenceMeaning: "I fell asleep with the light on.",
  },
  {
    id: 9007,
    familyId: "n3-みたいだ",
    isPrimary: true,
    subcategory: "Appearance & Impression",
    pattern: "〜みたいだ",
    patternReading: "〜みたいだ",
    meaning: "seems like; looks like (casual)",
    formation: "V plain / い-adj / な-adj / N + みたいだ",
    sentence: "外は雨が降っているみたいだ。",
    sentenceReading: "そと は あめ が ふって いる みたい だ。",
    sentenceMeaning: "It seems to be raining outside.",
  },
  {
    id: 9008,
    familyId: "n3-とおりに",
    isPrimary: true,
    subcategory: "Manner & Method",
    pattern: "〜とおりに",
    patternReading: "〜とおりに",
    meaning: "just as; in the way that",
    formation: "V dict / V た / N の + とおりに; N + どおりに",
    sentence: "先生が言ったとおりに書いてください。",
    sentenceReading: "せんせい が いった とおり に かいて ください。",
    sentenceMeaning: "Please write it exactly as the teacher said.",
  },
  {
    id: 9009,
    familyId: "n3-ずに",
    isPrimary: true,
    subcategory: "Manner & Method",
    pattern: "〜ずに",
    patternReading: "〜ずに",
    meaning: "without doing",
    formation: "V ない-stem + ずに (する → せずに)",
    sentence: "朝ご飯を食べずに家を出た。",
    sentenceReading: "あさごはん を たべずに いえ を でた。",
    sentenceMeaning: "I left home without eating breakfast.",
  },
  {
    id: 9010,
    familyId: "n3-ば〜ほど",
    isPrimary: true,
    subcategory: "Change & Progression",
    pattern: "〜ば〜ほど",
    patternReading: "〜ば〜ほど",
    meaning: "the more … the more",
    formation: "V ば + V dict + ほど; い-adj ければ + い-adj + ほど",
    sentence: "練習すればするほど上手になる。",
    sentenceReading: "れんしゅう すれば する ほど じょうず に なる。",
    sentenceMeaning: "The more you practice, the better you get.",
  },
  {
    id: 9011,
    familyId: "n3-わけがない",
    isPrimary: true,
    subcategory: "Confirmation & Certainty",
    pattern: "〜わけがない",
    patternReading: "〜わけがない",
    meaning: "there is no way that; cannot possibly",
    formation: "V plain / い-adj / な-adj な / N の + わけがない",
    sentence: "こんなに難しい問題が、私に解けるわけがない。",
    sentenceReading: "こんな に むずかしい もんだい が、わたし に とける わけ が ない。",
    sentenceMeaning: "There's no way I can solve such a difficult problem.",
  },
  {
    id: 9012,
    familyId: "n3-っけ",
    isPrimary: true,
    subcategory: "Confirmation & Certainty",
    pattern: "〜っけ",
    patternReading: "〜っけ",
    meaning: "was it …? (checking something you forgot)",
    formation: "V た / N だった / plain form + っけ",
    sentence: "会議は何時からだったっけ。",
    sentenceReading: "かいぎ は なんじ から だった っけ。",
    sentenceMeaning: "What time did the meeting start again?",
  },
];

/** Pattern / sentence notes — same speakable rules as the N2 grammar notes. */
export const n3GrammarNuances: Readonly<Record<number, GrammarNuanceEntry>> = {
  9001: {
    pattern: "Your own decision; ことにしている means a personal rule you keep, like a daily habit.",
    sentence: "ことにした in the past shows the decision is made; the walking itself starts now.",
  },
  9002: {
    pattern: "A decision made by others or by circumstances, not by you; ことになっている means an existing rule.",
    sentence: "Transfers are decided by the company, so ことになった fits better than ことにした.",
  },
  9003: {
    pattern: "The speaker feels little time has passed, even if it was weeks ago; ところ is strictly just now.",
    sentence: "ばかりなので gives the recent arrival as the reason for having no friends yet.",
  },
  9004: {
    pattern: "Dictionary form means about to, ている means in the middle of, and た means just finished.",
    sentence: "たところ marks the very moment of arrival, more precise than たばかり.",
  },
  9005: {
    pattern: "Replaces one person or thing with another, or trades one point against another.",
    sentence: "のかわりに after a person means standing in for them, here at a meeting.",
  },
  9006: {
    pattern: "Something stays in the same state while something else happens, often by mistake.",
    sentence: "つけたまま means the light was left on; てしまった adds that this was unintended.",
  },
  9007: {
    pattern: "Casual version of ようだ, used in speech; it can also compare, as in 夢みたい.",
    sentence: "Based on sounds or signs from outside, the speaker guesses it is raining.",
  },
  9008: {
    pattern: "Do something in exactly the same way as shown or said; after a noun it becomes どおり.",
    sentence: "言ったとおりに asks for the writing to follow the teacher's words exactly.",
  },
  9009: {
    pattern: "A written or slightly formal version of ないで; する becomes せずに.",
    sentence: "食べずに means leaving without eating, the same as 食べないで in speech.",
  },
  9010: {
    pattern: "Repeat the same word, first in ば form and then in plain form before ほど.",
    sentence: "Practice and skill grow together; すればするほど is the natural rhythm.",
  },
  9011: {
    pattern: "A strong denial based on your judgment; it is more emotional than はずがない.",
    sentence: "こんなに stresses how hard the problem is, which makes the denial stronger.",
  },
  9012: {
    pattern: "Casual check of something you once knew, said half to yourself or to a friend.",
    sentence: "だったっけ uses the past even for a future meeting, because you are recalling.",
  },
};

/** New N3 items (ids 9001+), shaped exactly like the main corpus. */
export const grammarN3: GrammarItem[] = seeds.map((seed) => {
  const notes = n3GrammarNuances[seed.id];
  return {
    ...seed,
    jlpt: "N3" as const,
    courseLevel: "N3_REVIEW" as const,
    category: "Grammar",
    audioSentence: `/audio/n3/grammar/${seed.id}-sentence.mp3`,
    ...(notes?.pattern ? { nuance: notes.pattern } : {}),
    ...(notes?.sentence ? { sentenceNuance: notes.sentence } : {}),
  };
});

/** `n3-grammar-batch-01` for lesson 1. */
export function formatN3GrammarLessonId(lessonNumber: number): string {
  return `n3-grammar-batch-${String(lessonNumber).padStart(2, "0")}`;
}

function n3GrammarLesson(n: number, theme: string, grammarIds: number[]): GrammarLesson {
  const first = (n - 1) * 10 + 1;
  const last = first + grammarIds.length - 1;
  return {
    id: formatN3GrammarLessonId(n),
    title: `JLPT N3 Grammar — ${first}–${last}`,
    subtitle: theme,
    youtubeTitle: `JLPT N3 Grammar | ${first}–${last} | ${theme}`,
    category: "Grammar",
    subcategories: ["N3_REVIEW", `n3-batch-${n}`],
    grammarIds,
  };
}

/** N3 course lessons: ten patterns each, mixing existing and new N3 items. */
export const n3GrammarLessons: GrammarLesson[] = [
  n3GrammarLesson(1, "Time & Decisions", [5137, 5131, 9003, 9004, 5344, 9006, 9009, 9001, 9002, 5367]),
  n3GrammarLesson(2, "Seeming & Change", [5031, 5032, 9007, 5125, 9012, 9011, 5073, 5074, 5075, 9008]),
  n3GrammarLesson(3, "Degree & Intention", [5017, 5021, 9010, 5143, 5145, 9005, 5081, 5082, 5089, 5111]),
];
