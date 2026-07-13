/** Table of Contents for video production navigation. */

export type TocItemId =
  | "intro-hook"
  | "word-1-10"
  | "word-11-20"
  | "word-21-30"
  | "word-31-40"
  | "grammar-1-10"
  | "grammar-11-20"
  | "grammar-21-30"
  | "grammar-31-40"
  | "quiz-pre-comment"
  | "quiz-vocab-1-10"
  | "quiz-grammar-1-10"
  | "quiz-mixed"
  | "quiz-final"
  | "quiz-after-comment"
  | "ending-cta";

export type TocItemKind =
  | "intro"
  | "word"
  | "grammar"
  | "quiz"
  | "quiz-pre"
  | "quiz-after"
  | "ending";

export type TocItem = {
  id: TocItemId;
  label: string;
  kind: TocItemKind;
  /** Lesson id when this item opens vocabulary lesson playback. */
  lessonId?: string;
  /** Quiz id when this item opens a quiz screen. */
  quizId?: string;
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
    title: "2. Vocabulary Lessons",
    items: [
      {
        id: "word-1-10",
        label: "Word Lesson 1–10",
        kind: "word",
        lessonId: "lesson-01",
      },
      {
        id: "word-11-20",
        label: "Word Lesson 11–20",
        kind: "word",
        lessonId: "lesson-02",
      },
      {
        id: "word-21-30",
        label: "Word Lesson 21–30",
        kind: "word",
        lessonId: "lesson-03",
      },
      {
        id: "word-31-40",
        label: "Word Lesson 31–40",
        kind: "word",
        lessonId: "lesson-04",
      },
    ],
  },
  {
    id: "grammar",
    title: "3. Grammar Lessons",
    items: [
      { id: "grammar-1-10", label: "Grammar Lesson 1–10", kind: "grammar" },
      { id: "grammar-11-20", label: "Grammar Lesson 11–20", kind: "grammar" },
      { id: "grammar-21-30", label: "Grammar Lesson 21–30", kind: "grammar" },
      { id: "grammar-31-40", label: "Grammar Lesson 31–40", kind: "grammar" },
    ],
  },
  {
    id: "quizzes",
    title: "4. Quizzes",
    items: [
      {
        id: "quiz-pre-comment",
        label: "Pre Quiz Comment",
        kind: "quiz-pre",
      },
      {
        id: "quiz-vocab-1-10",
        label: "Vocabulary Quiz 1–10",
        kind: "quiz",
        quizId: "quiz-vocab-1-10",
      },
      {
        id: "quiz-grammar-1-10",
        label: "Grammar Quiz 1–10",
        kind: "quiz",
        quizId: "quiz-grammar-1-10",
      },
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
    title: "5. Ending",
    items: [{ id: "ending-cta", label: "Custom Ending CTA", kind: "ending" }],
  },
];

export function getTocItem(id: TocItemId): TocItem | undefined {
  for (const group of tocGroups) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

export const lessonGroupIds: TocItemId[] = [
  "word-1-10",
  "word-11-20",
  "word-21-30",
  "word-31-40",
  "grammar-1-10",
  "grammar-11-20",
  "grammar-21-30",
  "grammar-31-40",
];

export const quizIds: TocItemId[] = [
  "quiz-vocab-1-10",
  "quiz-grammar-1-10",
  "quiz-mixed",
  "quiz-final",
];
