/** Table of Contents for video production navigation. */

import { buildN2VocabularyLessonTocItems, buildN2VocabularyQuizTocItems } from "./tocVocabularyItems";
export type TocItemId =
  | "intro-hook"
  | "word-1-10"
  | "word-11-20"
  | "word-21-30"
  | "word-31-40"
  | "word-41-50"
  | "word-51-60"
  | "word-61-70"
  | "word-71-80"
  | "word-81-90"
  | "word-91-100"
  | "word-101-110"
  | "word-111-120"
  | "word-121-130"
  | "word-131-140"
  | "word-141-150"
  | "word-151-160"
  | "word-161-170"
  | "word-171-180"
  | "word-181-190"
  | "word-191-200"
  | "word-201-210"
  | "word-211-220"
  | "word-221-230"
  | "word-231-240"
  | "word-241-250"
  | "word-251-260"
  | "word-261-270"
  | "word-271-280"
  | "word-281-290"
  | "word-291-300"
  | "word-301-310"
  | "word-311-320"
  | "word-321-330"
  | "word-331-340"
  | "word-341-350"
  | "word-351-360"
  | "word-361-370"
  | "word-371-380"
  | "word-381-390"
  | "word-391-400"
  | "word-401-410"
  | "word-411-420"
  | "word-421-430"
  | "word-431-440"
  | "word-441-450"
  | "word-451-460"
  | "word-461-470"
  | "word-471-480"
  | "word-481-490"
  | "word-491-500"
| "word-501-510"
  | "word-511-520"
  | "word-521-530"
  | "word-531-540"
  | "word-541-550"
  | "word-551-560"
  | "word-561-570"
  | "word-571-580"
  | "word-581-590"
  | "word-591-600"
  | "word-601-610"
  | "word-611-620"
  | "word-621-630"
  | "word-631-640"
  | "word-641-650"
  | "word-651-660"
  | "word-661-670"
  | "word-671-680"
  | "word-681-690"
  | "word-691-700"
  | "word-701-710"
  | "word-711-720"
  | "word-721-730"
  | "word-731-740"
  | "word-741-750"
  | "word-n1-01"
  | "word-n1-02"
  | "word-n1-03"
  | "grammar-1-10"
  | "grammar-11-20"
  | "grammar-21-30"
  | "grammar-31-40"
  | "grammar-41-50"
  | "grammar-51-60"
  | "grammar-61-70"
  | "grammar-71-80"
  | "grammar-81-90"
  | "grammar-91-100"
  | "grammar-101-110"
  | "grammar-111-120"
  | "grammar-121-130"
  | "grammar-131-140"
  | "grammar-141-150"
  | "grammar-151-160"
  | "grammar-161-170"
  | "grammar-171-180"
  | "grammar-181-190"
  | "grammar-191-200"
  | "grammar-201-210"
  | "grammar-211-220"
  | "grammar-221-230"
  | "grammar-231-240"
  | "grammar-241-250"
  | "grammar-251-260"
  | "grammar-261-270"
  | "grammar-271-280"
  | "grammar-281-290"
  | "grammar-291-300"
  | "grammar-301-310"
  | "grammar-311-320"
  | "grammar-321-330"
  | "grammar-331-340"
  | "grammar-341-350"
  | "grammar-351-360"
  | "grammar-361-370"
  | "grammar-371-380"
  | "grammar-381-390"
  | "grammar-391-400"
  | "grammar-401-410"
  | "grammar-411-420"
  | "grammar-421-430"
  | "grammar-431-440"
  | "grammar-441-450"
  | "grammar-451-460"
  | "grammar-461-470"
  | "grammar-471-480"
  | "grammar-481-490"
  | "grammar-491-500"
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
  | "quiz-vocab-1-10"
  | "quiz-vocab-11-20"
  | "quiz-vocab-21-30"
  | "quiz-vocab-31-40"
  | "quiz-vocab-41-50"
  | "quiz-vocab-51-60"
  | "quiz-vocab-61-70"
  | "quiz-vocab-71-80"
  | "quiz-vocab-81-90"
  | "quiz-vocab-91-100"
  | "quiz-vocab-101-110"
  | "quiz-vocab-111-120"
  | "quiz-vocab-121-130"
  | "quiz-vocab-131-140"
  | "quiz-vocab-141-150"
  | "quiz-vocab-151-160"
  | "quiz-vocab-161-170"
  | "quiz-vocab-171-180"
  | "quiz-vocab-181-190"
  | "quiz-vocab-191-200"
  | "quiz-vocab-201-210"
  | "quiz-vocab-211-220"
  | "quiz-vocab-221-230"
  | "quiz-vocab-231-240"
  | "quiz-vocab-241-250"
  | "quiz-vocab-251-260"
  | "quiz-vocab-261-270"
  | "quiz-vocab-271-280"
  | "quiz-vocab-281-290"
  | "quiz-vocab-291-300"
  | "quiz-vocab-301-310"
  | "quiz-vocab-311-320"
  | "quiz-vocab-321-330"
  | "quiz-vocab-331-340"
  | "quiz-vocab-341-350"
  | "quiz-vocab-351-360"
  | "quiz-vocab-361-370"
  | "quiz-vocab-371-380"
  | "quiz-vocab-381-390"
  | "quiz-vocab-391-400"
  | "quiz-vocab-401-410"
  | "quiz-vocab-411-420"
  | "quiz-vocab-421-430"
  | "quiz-vocab-431-440"
  | "quiz-vocab-441-450"
  | "quiz-vocab-451-460"
  | "quiz-vocab-461-470"
  | "quiz-vocab-471-480"
  | "quiz-vocab-481-490"
  | "quiz-vocab-491-500"
  | "quiz-vocab-501-510"
  | "quiz-vocab-511-520"
  | "quiz-vocab-521-530"
  | "quiz-vocab-531-540"
  | "quiz-vocab-541-550"
  | "quiz-vocab-551-560"
  | "quiz-vocab-561-570"
  | "quiz-vocab-571-580"
  | "quiz-vocab-581-590"
  | "quiz-vocab-591-600"
  | "quiz-vocab-601-610"
  | "quiz-vocab-611-620"
  | "quiz-vocab-621-630"
  | "quiz-vocab-631-640"
  | "quiz-vocab-641-650"
  | "quiz-vocab-651-660"
  | "quiz-vocab-661-670"
  | "quiz-vocab-671-680"
  | "quiz-vocab-681-690"
  | "quiz-vocab-691-700"
  | "quiz-vocab-701-710"
  | "quiz-vocab-711-720"
  | "quiz-vocab-721-730"
  | "quiz-vocab-731-740"
  | "quiz-vocab-741-750"
  | "quiz-vocab-n1-01"
  | "quiz-vocab-n1-02"
  | "quiz-vocab-n1-03"
  | "quiz-grammar-1-10"
  | "quiz-grammar-11-20"
  | "quiz-grammar-21-30"
  | "quiz-grammar-31-40"
  | "quiz-grammar-41-50"
  | "quiz-grammar-51-60"
  | "quiz-grammar-61-70"
  | "quiz-grammar-71-80"
  | "quiz-grammar-81-90"
  | "quiz-grammar-91-100"
  | "quiz-grammar-101-110"
  | "quiz-grammar-111-120"
  | "quiz-grammar-121-130"
  | "quiz-grammar-131-140"
  | "quiz-grammar-141-150"
  | "quiz-grammar-151-160"
  | "quiz-grammar-161-170"
  | "quiz-grammar-171-180"
  | "quiz-grammar-181-190"
  | "quiz-grammar-191-200"
  | "quiz-mixed"
  | "quiz-final"
  | "quiz-after-comment"
  | "ending-cta"
  | "glossary";

export type TocItemKind =
  | "intro"
  | "word"
  | "grammar"
  | "quiz"
  | "quiz-pre"
  | "quiz-after"
  | "ending"
  | "glossary";

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
    items: [
      { id: "grammar-1-10",   label: "N2 Grammar Lesson 1–10",   kind: "grammar", lessonId: "grammar-lesson-01" },
      { id: "grammar-11-20",  label: "N2 Grammar Lesson 11–20",  kind: "grammar", lessonId: "grammar-lesson-02" },
      { id: "grammar-21-30",  label: "N2 Grammar Lesson 21–30",  kind: "grammar", lessonId: "grammar-lesson-03" },
      { id: "grammar-31-40",  label: "N2 Grammar Lesson 31–40",  kind: "grammar", lessonId: "grammar-lesson-04" },
      { id: "grammar-41-50",  label: "N2 Grammar Lesson 41–50",  kind: "grammar", lessonId: "grammar-lesson-05" },
      { id: "grammar-51-60",  label: "N2 Grammar Lesson 51–60",  kind: "grammar", lessonId: "grammar-lesson-06" },
      { id: "grammar-61-70",  label: "N2 Grammar Lesson 61–70",  kind: "grammar", lessonId: "grammar-lesson-07" },
      { id: "grammar-71-80",  label: "N2 Grammar Lesson 71–80",  kind: "grammar", lessonId: "grammar-lesson-08" },
      { id: "grammar-81-90",  label: "N2 Grammar Lesson 81–90",  kind: "grammar", lessonId: "grammar-lesson-09" },
      { id: "grammar-91-100", label: "N2 Grammar Lesson 91–100", kind: "grammar", lessonId: "grammar-lesson-10" },
      { id: "grammar-101-110", label: "N2 Grammar Lesson 101–110", kind: "grammar", lessonId: "grammar-lesson-11" },
      { id: "grammar-111-120", label: "N2 Grammar Lesson 111–120", kind: "grammar", lessonId: "grammar-lesson-12" },
      { id: "grammar-121-130", label: "N2 Grammar Lesson 121–130", kind: "grammar", lessonId: "grammar-lesson-13" },
      { id: "grammar-131-140", label: "N2 Grammar Lesson 131–140", kind: "grammar", lessonId: "grammar-lesson-14" },
      { id: "grammar-141-150", label: "N2 Grammar Lesson 141–150", kind: "grammar", lessonId: "grammar-lesson-15" },
      { id: "grammar-151-160", label: "N2 Grammar Lesson 151–160", kind: "grammar", lessonId: "grammar-lesson-16" },
      { id: "grammar-161-170", label: "N2 Grammar Lesson 161–170", kind: "grammar", lessonId: "grammar-lesson-17" },
      { id: "grammar-171-180", label: "N2 Grammar Lesson 171–180", kind: "grammar", lessonId: "grammar-lesson-18" },
      { id: "grammar-181-190", label: "N2 Grammar Lesson 181–190", kind: "grammar", lessonId: "grammar-lesson-19" },
      { id: "grammar-191-200", label: "N2 Grammar Lesson 191–200", kind: "grammar", lessonId: "grammar-lesson-20" },
      { id: "grammar-201-210", label: "N2 Grammar Lesson 201–210", kind: "grammar", lessonId: "grammar-lesson-21" },
      { id: "grammar-211-220", label: "N2 Grammar Lesson 211–220", kind: "grammar", lessonId: "grammar-lesson-22" },
      { id: "grammar-221-230", label: "N2 Grammar Lesson 221–230", kind: "grammar", lessonId: "grammar-lesson-23" },
      { id: "grammar-231-240", label: "N2 Grammar Lesson 231–240", kind: "grammar", lessonId: "grammar-lesson-24" },
      { id: "grammar-241-250", label: "N2 Grammar Lesson 241–250", kind: "grammar", lessonId: "grammar-lesson-25" },
      { id: "grammar-251-260", label: "N2 Grammar Lesson 251–260", kind: "grammar", lessonId: "grammar-lesson-26" },
      { id: "grammar-261-270", label: "N2 Grammar Lesson 261–270", kind: "grammar", lessonId: "grammar-lesson-27" },
      { id: "grammar-271-280", label: "N2 Grammar Lesson 271–280", kind: "grammar", lessonId: "grammar-lesson-28" },
      { id: "grammar-281-290", label: "N2 Grammar Lesson 281–290", kind: "grammar", lessonId: "grammar-lesson-29" },
      { id: "grammar-291-300", label: "N2 Grammar Lesson 291–300", kind: "grammar", lessonId: "grammar-lesson-30" },
      { id: "grammar-301-310", label: "N2 Grammar Lesson 301–310", kind: "grammar", lessonId: "grammar-lesson-31" },
      { id: "grammar-311-320", label: "N2 Grammar Lesson 311–320", kind: "grammar", lessonId: "grammar-lesson-32" },
      { id: "grammar-321-330", label: "N2 Grammar Lesson 321–330", kind: "grammar", lessonId: "grammar-lesson-33" },
      { id: "grammar-331-340", label: "N2 Grammar Lesson 331–340", kind: "grammar", lessonId: "grammar-lesson-34" },
      { id: "grammar-341-350", label: "N2 Grammar Lesson 341–350", kind: "grammar", lessonId: "grammar-lesson-35" },
      { id: "grammar-351-360", label: "N2 Grammar Lesson 351–360", kind: "grammar", lessonId: "grammar-lesson-36" },
      { id: "grammar-361-370", label: "N2 Grammar Lesson 361–370", kind: "grammar", lessonId: "grammar-lesson-37" },
      { id: "grammar-371-380", label: "N2 Grammar Lesson 371–380", kind: "grammar", lessonId: "grammar-lesson-38" },
      { id: "grammar-381-390", label: "N2 Grammar Lesson 381–390", kind: "grammar", lessonId: "grammar-lesson-39" },
      { id: "grammar-391-400", label: "N2 Grammar Lesson 391–400", kind: "grammar", lessonId: "grammar-lesson-40" },
      { id: "grammar-401-410", label: "N2 Grammar Lesson 401–410", kind: "grammar", lessonId: "grammar-lesson-41" },
      { id: "grammar-411-420", label: "N2 Grammar Lesson 411–420", kind: "grammar", lessonId: "grammar-lesson-42" },
      { id: "grammar-421-430", label: "N2 Grammar Lesson 421–430", kind: "grammar", lessonId: "grammar-lesson-43" },
      { id: "grammar-431-440", label: "N2 Grammar Lesson 431–440", kind: "grammar", lessonId: "grammar-lesson-44" },
      { id: "grammar-441-450", label: "N2 Grammar Lesson 441–450", kind: "grammar", lessonId: "grammar-lesson-45" },
      { id: "grammar-451-460", label: "N2 Grammar Lesson 451–460", kind: "grammar", lessonId: "grammar-lesson-46" },
      { id: "grammar-461-470", label: "N2 Grammar Lesson 461–470", kind: "grammar", lessonId: "grammar-lesson-47" },
      { id: "grammar-471-480", label: "N2 Grammar Lesson 471–480", kind: "grammar", lessonId: "grammar-lesson-48" },
      { id: "grammar-481-490", label: "N2 Grammar Lesson 481–490", kind: "grammar", lessonId: "grammar-lesson-49" },
      { id: "grammar-491-500", label: "N2 Grammar Lesson 491–500", kind: "grammar", lessonId: "grammar-lesson-50" },
    ],
  },
  {
    id: "grammar-n1",
    title: "3b. N1 Grammar Lessons (curated)",
    items: [
      { id: "n1-grammar-01", label: "N1 Grammar 1: Emphasis & Extremity", kind: "grammar", lessonId: "n1-grammar-lesson-01" },
      { id: "n1-grammar-02", label: "N1 Grammar 2: State, Condition & Manner", kind: "grammar", lessonId: "n1-grammar-lesson-02" },
      { id: "n1-grammar-03", label: "N1 Grammar 3: Perception, Reputation & Appearance", kind: "grammar", lessonId: "n1-grammar-lesson-03" },
      { id: "n1-grammar-04", label: "N1 Grammar 4: Simultaneity & Timing", kind: "grammar", lessonId: "n1-grammar-lesson-04" },
      { id: "n1-grammar-05", label: "N1 Grammar 5: Assumption, Concession & Contrast", kind: "grammar", lessonId: "n1-grammar-lesson-05" },
      { id: "n1-grammar-06", label: "N1 Grammar 6: Criticism, Reproach & Warning", kind: "grammar", lessonId: "n1-grammar-lesson-06" },
      { id: "n1-grammar-07", label: "N1 Grammar 7: Restriction, Exception & Prohibition", kind: "grammar", lessonId: "n1-grammar-lesson-07" },
      { id: "n1-grammar-08", label: "N1 Grammar 8: Formal & Written Expressions", kind: "grammar", lessonId: "n1-grammar-lesson-08" },
      { id: "n1-grammar-09", label: "N1 Grammar 9: Listing, Inference & Habitual", kind: "grammar", lessonId: "n1-grammar-lesson-09" },
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
      {
        id: "quiz-grammar-1-10",
        label: "N2 Grammar Quiz 1–10",
        kind: "quiz",
        quizId: "quiz-grammar-1-10",
      },
      {
        id: "quiz-grammar-11-20",
        label: "N2 Grammar Quiz 11–20",
        kind: "quiz",
        quizId: "quiz-grammar-11-20",
      },
      {
        id: "quiz-grammar-21-30",
        label: "N2 Grammar Quiz 21–30",
        kind: "quiz",
        quizId: "quiz-grammar-21-30",
      },
      {
        id: "quiz-grammar-31-40",
        label: "N2 Grammar Quiz 31–40",
        kind: "quiz",
        quizId: "quiz-grammar-31-40",
      },
      {
        id: "quiz-grammar-41-50",
        label: "N2 Grammar Quiz 41–50",
        kind: "quiz",
        quizId: "quiz-grammar-41-50",
      },
      {
        id: "quiz-grammar-51-60",
        label: "N2 Grammar Quiz 51–60",
        kind: "quiz",
        quizId: "quiz-grammar-51-60",
      },
      {
        id: "quiz-grammar-61-70",
        label: "N2 Grammar Quiz 61–70",
        kind: "quiz",
        quizId: "quiz-grammar-61-70",
      },
      {
        id: "quiz-grammar-71-80",
        label: "N2 Grammar Quiz 71–80",
        kind: "quiz",
        quizId: "quiz-grammar-71-80",
      },
      {
        id: "quiz-grammar-81-90",
        label: "N2 Grammar Quiz 81–90",
        kind: "quiz",
        quizId: "quiz-grammar-81-90",
      },
      {
        id: "quiz-grammar-91-100",
        label: "N2 Grammar Quiz 91–100",
        kind: "quiz",
        quizId: "quiz-grammar-91-100",
      },
      {
        id: "quiz-grammar-101-110",
        label: "N2 Grammar Quiz 101–110",
        kind: "quiz",
        quizId: "quiz-grammar-101-110",
      },
      {
        id: "quiz-grammar-111-120",
        label: "N2 Grammar Quiz 111–120",
        kind: "quiz",
        quizId: "quiz-grammar-111-120",
      },
      {
        id: "quiz-grammar-121-130",
        label: "N2 Grammar Quiz 121–130",
        kind: "quiz",
        quizId: "quiz-grammar-121-130",
      },
      {
        id: "quiz-grammar-131-140",
        label: "N2 Grammar Quiz 131–140",
        kind: "quiz",
        quizId: "quiz-grammar-131-140",
      },
      {
        id: "quiz-grammar-141-150",
        label: "N2 Grammar Quiz 141–150",
        kind: "quiz",
        quizId: "quiz-grammar-141-150",
      },
      {
        id: "quiz-grammar-151-160",
        label: "N2 Grammar Quiz 151–160",
        kind: "quiz",
        quizId: "quiz-grammar-151-160",
      },
      {
        id: "quiz-grammar-161-170",
        label: "N2 Grammar Quiz 161–170",
        kind: "quiz",
        quizId: "quiz-grammar-161-170",
      },
      {
        id: "quiz-grammar-171-180",
        label: "N2 Grammar Quiz 171–180",
        kind: "quiz",
        quizId: "quiz-grammar-171-180",
      },
      {
        id: "quiz-grammar-181-190",
        label: "N2 Grammar Quiz 181–190",
        kind: "quiz",
        quizId: "quiz-grammar-181-190",
      },
      {
        id: "quiz-grammar-191-200",
        label: "N2 Grammar Quiz 191–200",
        kind: "quiz",
        quizId: "quiz-grammar-191-200",
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
    title: "Ending",
    items: [{ id: "ending-cta", label: "Custom Ending CTA", kind: "ending" }],
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

export const lessonGroupIds: TocItemId[] = [
  "word-1-10",
  "word-11-20",
  "word-21-30",
  "word-31-40",
  "word-41-50",
  "word-51-60",
  "word-61-70",
  "word-71-80",
  "word-81-90",
  "word-91-100",
  "word-101-110",
  "word-111-120",
  "word-121-130",
  "word-131-140",
  "word-141-150",
  "word-151-160",
  "word-161-170",
  "word-171-180",
  "word-181-190",
  "word-191-200",
  "word-201-210",
  "word-211-220",
  "word-221-230",
  "word-231-240",
  "word-241-250",
  "word-251-260",
  "word-261-270",
  "word-271-280",
  "word-281-290",
  "word-291-300",
  "word-301-310",
  "word-311-320",
  "word-321-330",
  "word-331-340",
  "word-341-350",
  "word-351-360",
  "word-361-370",
  "word-371-380",
  "word-381-390",
  "word-391-400",
  "word-401-410",
  "word-411-420",
  "word-421-430",
  "word-431-440",
  "word-441-450",
  "word-451-460",
  "word-461-470",
  "word-471-480",
  "word-481-490",
  "word-491-500",
  "word-501-510",
  "word-511-520",
  "word-521-530",
  "word-531-540",
  "word-541-550",
  "word-551-560",
  "word-561-570",
  "word-571-580",
  "word-581-590",
  "word-591-600",
  "word-601-610",
  "word-611-620",
  "word-621-630",
  "word-631-640",
  "word-641-650",
  "word-651-660",
  "word-661-670",
  "word-671-680",
  "word-681-690",
  "word-691-700",
  "word-701-710",
  "word-711-720",
  "word-721-730",
  "word-731-740",
  "word-741-750",
  "word-n1-01",
  "word-n1-02",
  "word-n1-03",
  "grammar-1-10",
  "grammar-11-20",
  "grammar-21-30",
  "grammar-31-40",
  "grammar-41-50",
  "grammar-51-60",
  "grammar-61-70",
  "grammar-71-80",
  "grammar-81-90",
  "grammar-91-100",
  "grammar-101-110",
  "grammar-111-120",
  "grammar-121-130",
  "grammar-131-140",
  "grammar-141-150",
  "grammar-151-160",
  "grammar-161-170",
  "grammar-171-180",
  "grammar-181-190",
  "grammar-191-200",
  "grammar-201-210",
  "grammar-211-220",
  "grammar-221-230",
  "grammar-231-240",
  "grammar-241-250",
  "grammar-251-260",
  "grammar-261-270",
  "grammar-271-280",
  "grammar-281-290",
  "grammar-291-300",
  "grammar-301-310",
  "grammar-311-320",
  "grammar-321-330",
  "grammar-331-340",
  "grammar-341-350",
  "grammar-351-360",
  "grammar-361-370",
  "grammar-371-380",
  "grammar-381-390",
  "grammar-391-400",
  "grammar-401-410",
  "grammar-411-420",
  "grammar-421-430",
  "grammar-431-440",
  "grammar-441-450",
  "grammar-451-460",
  "grammar-461-470",
  "grammar-471-480",
  "grammar-481-490",
  "grammar-491-500",
  "n1-grammar-01",
  "n1-grammar-02",
  "n1-grammar-03",
  "n1-grammar-04",
  "n1-grammar-05",
  "n1-grammar-06",
  "n1-grammar-07",
  "n1-grammar-08",
  "n1-grammar-09",
];

export const quizIds: TocItemId[] = [
  "quiz-vocab-1-10",
  "quiz-vocab-11-20",
  "quiz-vocab-21-30",
  "quiz-vocab-31-40",
  "quiz-vocab-41-50",
  "quiz-vocab-51-60",
  "quiz-vocab-61-70",
  "quiz-vocab-71-80",
  "quiz-vocab-81-90",
  "quiz-vocab-91-100",
  "quiz-vocab-101-110",
  "quiz-vocab-111-120",
  "quiz-vocab-121-130",
  "quiz-vocab-131-140",
  "quiz-vocab-141-150",
  "quiz-vocab-151-160",
  "quiz-vocab-161-170",
  "quiz-vocab-171-180",
  "quiz-vocab-181-190",
  "quiz-vocab-191-200",
  "quiz-vocab-201-210",
  "quiz-vocab-211-220",
  "quiz-vocab-221-230",
  "quiz-vocab-231-240",
  "quiz-vocab-241-250",
  "quiz-vocab-251-260",
  "quiz-vocab-261-270",
  "quiz-vocab-271-280",
  "quiz-vocab-281-290",
  "quiz-vocab-291-300",
  "quiz-vocab-301-310",
  "quiz-vocab-311-320",
  "quiz-vocab-321-330",
  "quiz-vocab-331-340",
  "quiz-vocab-341-350",
  "quiz-vocab-351-360",
  "quiz-vocab-361-370",
  "quiz-vocab-371-380",
  "quiz-vocab-381-390",
  "quiz-vocab-391-400",
  "quiz-vocab-401-410",
  "quiz-vocab-411-420",
  "quiz-vocab-421-430",
  "quiz-vocab-431-440",
  "quiz-vocab-441-450",
  "quiz-vocab-451-460",
  "quiz-vocab-461-470",
  "quiz-vocab-471-480",
  "quiz-vocab-481-490",
  "quiz-vocab-491-500",
  "quiz-vocab-501-510",
  "quiz-vocab-511-520",
  "quiz-vocab-521-530",
  "quiz-vocab-531-540",
  "quiz-vocab-541-550",
  "quiz-vocab-551-560",
  "quiz-vocab-561-570",
  "quiz-vocab-571-580",
  "quiz-vocab-581-590",
  "quiz-vocab-591-600",
  "quiz-vocab-601-610",
  "quiz-vocab-611-620",
  "quiz-vocab-621-630",
  "quiz-vocab-631-640",
  "quiz-vocab-641-650",
  "quiz-vocab-651-660",
  "quiz-vocab-661-670",
  "quiz-vocab-671-680",
  "quiz-vocab-681-690",
  "quiz-vocab-691-700",
  "quiz-vocab-701-710",
  "quiz-vocab-711-720",
  "quiz-vocab-721-730",
  "quiz-vocab-731-740",
  "quiz-vocab-741-750",
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
  "quiz-grammar-151-160",
  "quiz-grammar-161-170",
  "quiz-grammar-171-180",
  "quiz-grammar-181-190",
  "quiz-grammar-191-200",
  "quiz-mixed",
  "quiz-final",
];
