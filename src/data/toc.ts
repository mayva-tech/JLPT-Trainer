/** Table of Contents for video production navigation. */

import { buildN2VocabularyLessonTocItems, buildN2VocabularyQuizTocItems } from "./tocVocabularyItems";
import { buildN2GrammarLessonTocItems, buildN2GrammarQuizTocItems } from "./tocGrammarItems";
import { N2_VOCAB_LESSON_COUNT } from "../config/vocabularyCourse";
import { formatN2VocabularyTocQuizId } from "../utils/vocabularyDisplay";
import { registerSections } from "./registerPairs";
export type TocItemId =
  | "intro-hook"
  | `word-${number}-${number}`
  | "word-n1-01"
  | "word-n1-02"
  | "word-n1-03"
  | `grammar-f${number}-${number}`
  | "n1-grammar-01"
  | "n1-grammar-02"
  | "n1-grammar-03"
  | "n1-grammar-04"
  | "n1-grammar-05"
  | "n1-grammar-06"
  | "n1-grammar-07"
  | "n1-grammar-08"
  | "n1-grammar-09"
  | "quiz-pre-comment"
  | `quiz-vocab-${number}-${number}`
  | "quiz-vocab-n1-01"
  | "quiz-vocab-n1-02"
  | "quiz-vocab-n1-03"
  | `quiz-grammar-${number}-${number}`
  | "quiz-mixed"
  | "quiz-final"
  | "quiz-after-comment"
  | "ending-cta"
  | "interview-01"
  | "interview-02"
  | "interview-03"
  | "interview-04"
  | "interview-05"
  | "interview-06"
  | "interview-07"
  | "interview-08"
  | "interview-09"
  | "interview-10"
  | "interview-11"
  | "interview-12"
  | "interview-13"
  | "interview-14"
  | "interview-15"
  | "interview-16"
  | "interview-17"
  | "interview-mix-01"
  | "interview-mix-02"
  | "interview-mix-03"
  | "interview-mix-04"
  | "interview-mix-05"
  | "interview-mix-06"
  | "interview-mix-07"
  | "interview-mix-08"
  | "interview-mix-09"
  | "interview-mix-10"
  | "interview-mix-11"
  | "interview-mix-12"
  | "interview-mix-13"
  | "interview-mix-14"
  | "interview-mix-15"
  | "interview-mix-16"
  | "interview-mix-17"
  | `register-${number}`
  | "glossary";

export type TocItemKind =
  | "intro"
  | "word"
  | "grammar"
  | "quiz"
  | "quiz-pre"
  | "quiz-after"
  | "ending"
  | "interview"
  | "interview-mix"
  | "register"
  | "glossary";

export type TocItem = {
  id: TocItemId;
  label: string;
  kind: TocItemKind;
  /** Lesson id when this item opens vocabulary lesson playback. */
  lessonId?: string;
  /** Quiz id when this item opens a quiz screen. */
  quizId?: string;
  /** Interview prep section id when this item opens interview practice. */
  interviewSectionId?: string;
  /** Register section id when this item opens casual ⇄ formal practice. */
  registerSectionId?: string;
};

export type TocGroup = {
  id: string;
  title: string;
  items: TocItem[];
};

export const tocGroups: TocGroup[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    items: [{ id: "intro-hook", label: "Intro Hook", kind: "intro" }],
  },
  {
    id: "vocabulary",
    title: "2. N2 Vocabulary Lessons",
    items: buildN2VocabularyLessonTocItems(),
  },
  {
    id: "vocabulary-n1",
    title: "2b. N1 Vocabulary Lessons (curated)",
    items: [
      { id: "word-n1-01", label: "N1 Vocabulary 1: Legal, Financial & Administrative", kind: "word", lessonId: "n1-lesson-01" },
      { id: "word-n1-02", label: "N1 Vocabulary 2: Formal Ceremonies & Mourning", kind: "word", lessonId: "n1-lesson-02" },
      { id: "word-n1-03", label: "N1 Vocabulary 3: Specialized Register", kind: "word", lessonId: "n1-lesson-03" },
    ],
  },
  {
    id: "grammar",
    title: "3. N2 Grammar Lessons",
    items: buildN2GrammarLessonTocItems(),
  },
  {
    id: "grammar-n1",
    title: "3b. N1 Grammar Lessons (curated)",
    items: [
      { id: "n1-grammar-01", label: "N1 Grammar 1: 〜とはいえ", kind: "grammar", lessonId: "n1-grammar-lesson-171" },
      { id: "n1-grammar-02", label: "N1 Grammar 2: 〜てみせる", kind: "grammar", lessonId: "n1-grammar-lesson-172" },
      { id: "n1-grammar-03", label: "N1 Grammar 3: 〜を余儀なくされる", kind: "grammar", lessonId: "n1-grammar-lesson-173" },
      { id: "n1-grammar-04", label: "N1 Grammar 4: 〜ないとも限らない", kind: "grammar", lessonId: "n1-grammar-lesson-174" },
      { id: "n1-grammar-05", label: "N1 Grammar 5: 〜ないではおかない", kind: "grammar", lessonId: "n1-grammar-lesson-175" },
      { id: "n1-grammar-06", label: "N1 Grammar 6: 〜をもって", kind: "grammar", lessonId: "n1-grammar-lesson-176" },
      { id: "n1-grammar-07", label: "N1 Grammar 7: 〜に即して", kind: "grammar", lessonId: "n1-grammar-lesson-177" },
      { id: "n1-grammar-08", label: "N1 Grammar 8: 〜てからというもの", kind: "grammar", lessonId: "n1-grammar-lesson-178" },
      { id: "n1-grammar-09", label: "N1 Grammar 9: 〜極まりない", kind: "grammar", lessonId: "n1-grammar-lesson-179" },
    ],
  },
  {
    id: "quiz-word",
    title: "4. N2 Word Quizzes",
    items: [
      {
        id: "quiz-pre-comment",
        label: "Pre Quiz Comment",
        kind: "quiz-pre",
      },
      ...buildN2VocabularyQuizTocItems(),
    ],
  },
  {
    id: "quiz-vocab-n1",
    title: "4b. N1 Word Quizzes (curated)",
    items: [
      { id: "quiz-vocab-n1-01", label: "N1 Word Quiz 1: Legal, Financial & Administrative", kind: "quiz", quizId: "quiz-vocab-n1-01" },
      { id: "quiz-vocab-n1-02", label: "N1 Word Quiz 2: Formal Ceremonies & Mourning", kind: "quiz", quizId: "quiz-vocab-n1-02" },
      { id: "quiz-vocab-n1-03", label: "N1 Word Quiz 3: Specialized Register", kind: "quiz", quizId: "quiz-vocab-n1-03" },
    ],
  },
  {
    id: "quiz-grammar",
    title: "5. N2 Grammar Quizzes",
    items: [
      ...buildN2GrammarQuizTocItems(),
      {
        id: "quiz-mixed",
        label: "Mixed Quiz",
        kind: "quiz",
        quizId: "quiz-mixed",
      },
      {
        id: "quiz-final",
        label: "Final Review Quiz",
        kind: "quiz",
        quizId: "quiz-final",
      },
      {
        id: "quiz-after-comment",
        label: "After Quiz Comment",
        kind: "quiz-after",
      },
    ],
  },
  {
    id: "ending",
    title: "Ending",
    items: [{ id: "ending-cta", label: "Custom Ending CTA", kind: "ending" }],
  },
  {
    id: "practice",
    title: "Practice · Interview Prep",
    items: [
      {
        id: "interview-01",
        label: "1. Zoom接続・開始",
        kind: "interview",
        interviewSectionId: "01-join",
      },
      {
        id: "interview-02",
        label: "2. 最初のあいさつ",
        kind: "interview",
        interviewSectionId: "02-greeting",
      },
      {
        id: "interview-03",
        label: "3. 自己紹介",
        kind: "interview",
        interviewSectionId: "03-self-intro",
      },
      {
        id: "interview-04",
        label: "4. 現在の仕事内容",
        kind: "interview",
        interviewSectionId: "04-current-job",
      },
      {
        id: "interview-05",
        label: "5. Imatestの経験",
        kind: "interview",
        interviewSectionId: "05-imatest",
      },
      {
        id: "interview-06",
        label: "6. Pythonの経験",
        kind: "interview",
        interviewSectionId: "06-python",
      },
      {
        id: "interview-07",
        label: "7. なぜ転職を考えているか",
        kind: "interview",
        interviewSectionId: "07-why-change",
      },
      {
        id: "interview-08",
        label: "8. なぜQuest Globalか",
        kind: "interview",
        interviewSectionId: "08-why-quest",
      },
      {
        id: "interview-09",
        label: "9. あなたの強み",
        kind: "interview",
        interviewSectionId: "09-strengths",
      },
      {
        id: "interview-10",
        label: "10. あなたの弱み",
        kind: "interview",
        interviewSectionId: "10-weaknesses",
      },
      {
        id: "interview-11",
        label: "11. 日本語について",
        kind: "interview",
        interviewSectionId: "11-japanese",
      },
      {
        id: "interview-12",
        label: "12. 年収について",
        kind: "interview",
        interviewSectionId: "12-salary",
      },
      {
        id: "interview-13",
        label: "13. 入社可能時期",
        kind: "interview",
        interviewSectionId: "13-start-date",
      },
      {
        id: "interview-14",
        label: "14. ビザについて",
        kind: "interview",
        interviewSectionId: "14-visa",
      },
      {
        id: "interview-15",
        label: "15. 転勤は可能か",
        kind: "interview",
        interviewSectionId: "15-relocation",
      },
      {
        id: "interview-16",
        label: "16. こちらからの質問",
        kind: "interview",
        interviewSectionId: "16-questions",
      },
      {
        id: "interview-17",
        label: "17. 面接の最後",
        kind: "interview",
        interviewSectionId: "17-closing",
      },
    ],
  },
  {
    id: "practice-mix",
    title: "Practice · N3 JP+EN Mix",
    items: [
      {
        id: "interview-mix-01",
        label: "1. Zoomの最初",
        kind: "interview-mix",
        interviewSectionId: "01-zoom",
      },
      {
        id: "interview-mix-02",
        label: "2. 自己紹介",
        kind: "interview-mix",
        interviewSectionId: "02-intro",
      },
      {
        id: "interview-mix-03",
        label: "3. 今の仕事内容",
        kind: "interview-mix",
        interviewSectionId: "03-job",
      },
      {
        id: "interview-mix-04",
        label: "4. Imatestの経験",
        kind: "interview-mix",
        interviewSectionId: "04-imatest",
      },
      {
        id: "interview-mix-05",
        label: "5. Pythonの経験",
        kind: "interview-mix",
        interviewSectionId: "05-python",
      },
      {
        id: "interview-mix-06",
        label: "6. なぜ転職したいですか",
        kind: "interview-mix",
        interviewSectionId: "06-why-change",
      },
      {
        id: "interview-mix-07",
        label: "7. なぜQuest Globalですか",
        kind: "interview-mix",
        interviewSectionId: "07-why-quest",
      },
      {
        id: "interview-mix-08",
        label: "8. 強み",
        kind: "interview-mix",
        interviewSectionId: "08-strengths",
      },
      {
        id: "interview-mix-09",
        label: "9. 弱み",
        kind: "interview-mix",
        interviewSectionId: "09-weaknesses",
      },
      {
        id: "interview-mix-10",
        label: "10. 日本語について",
        kind: "interview-mix",
        interviewSectionId: "10-japanese",
      },
      {
        id: "interview-mix-11",
        label: "11. 年収",
        kind: "interview-mix",
        interviewSectionId: "11-salary",
      },
      {
        id: "interview-mix-12",
        label: "12. 入社時期",
        kind: "interview-mix",
        interviewSectionId: "12-start",
      },
      {
        id: "interview-mix-13",
        label: "13. ビザ",
        kind: "interview-mix",
        interviewSectionId: "13-visa",
      },
      {
        id: "interview-mix-14",
        label: "14. 転勤",
        kind: "interview-mix",
        interviewSectionId: "14-relocation",
      },
      {
        id: "interview-mix-15",
        label: "15. 分からない質問が来たとき",
        kind: "interview-mix",
        interviewSectionId: "15-clarify",
      },
      {
        id: "interview-mix-16",
        label: "16. こちらからの質問",
        kind: "interview-mix",
        interviewSectionId: "16-questions",
      },
      {
        id: "interview-mix-17",
        label: "17. 最後",
        kind: "interview-mix",
        interviewSectionId: "17-closing",
      },
    ],
  },
  {
    id: "register",
    title: "Practice · Casual ⇄ Formal",
    items: registerSections.map((section, index) => ({
      id: `register-${index + 1}` as TocItemId,
      label: `${section.title} — ${section.subtitle}`,
      kind: "register" as const,
      registerSectionId: section.id,
    })),
  },
  {
    id: "reference",
    title: "Reference",
    items: [
      { id: "glossary", label: "Content Glossary", kind: "glossary" },
    ],
  },
];

export function getTocItem(id: TocItemId): TocItem | undefined {
  for (const group of tocGroups) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Resolve a TOC lesson/grammar entry from its underlying lesson id. */
export function findTocItemByLessonId(lessonId: string): TocItem | undefined {
  for (const group of tocGroups) {
    const found = group.items.find((item) => item.lessonId === lessonId);
    if (found) return found;
  }
  return undefined;
}

export const lessonGroupIds: TocItemId[] = tocGroups
  .filter((group) =>
    group.id === "vocabulary" ||
    group.id === "vocabulary-n1" ||
    group.id === "grammar" ||
    group.id === "grammar-n1"
  )
  .flatMap((group) => group.items.map((item) => item.id));

export const quizIds: TocItemId[] = [
  ...Array.from({ length: N2_VOCAB_LESSON_COUNT }, (_, index) =>
    formatN2VocabularyTocQuizId(index + 1) as TocItemId
  ),
  "quiz-vocab-n1-01",
  "quiz-vocab-n1-02",
  "quiz-vocab-n1-03",
  "quiz-grammar-1-10",
  "quiz-grammar-11-20",
  "quiz-grammar-21-30",
  "quiz-grammar-31-40",
  "quiz-grammar-41-50",
  "quiz-grammar-51-60",
  "quiz-grammar-61-70",
  "quiz-grammar-71-80",
  "quiz-grammar-81-90",
  "quiz-grammar-91-100",
  "quiz-grammar-101-110",
  "quiz-grammar-111-120",
  "quiz-grammar-121-130",
  "quiz-grammar-131-140",
  "quiz-grammar-141-150",
  "quiz-grammar-151-152",
  "quiz-mixed",
  "quiz-final",
];

/** Resolve the register section id backing a TOC entry. */
export function getRegisterSectionIdForToc(
  id: TocItemId | null
): string | null {
  if (!id) return null;
  return getTocItem(id)?.registerSectionId ?? null;
}
