/** Table of Contents for video production navigation. */

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
  | "quiz-grammar-1-10"
  | "quiz-grammar-11-20"
  | "quiz-grammar-21-30"
  | "quiz-grammar-31-40"
  | "quiz-grammar-41-50"
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
      {
        id: "word-41-50",
        label: "Word Lesson 41–50",
        kind: "word",
        lessonId: "lesson-05",
      },
      {
        id: "word-51-60",
        label: "Word Lesson 51–60",
        kind: "word",
        lessonId: "lesson-06",
      },
      {
        id: "word-61-70",
        label: "Word Lesson 61–70",
        kind: "word",
        lessonId: "lesson-07",
      },
      {
        id: "word-71-80",
        label: "Word Lesson 71–80",
        kind: "word",
        lessonId: "lesson-08",
      },
      {
        id: "word-81-90",
        label: "Word Lesson 81–90",
        kind: "word",
        lessonId: "lesson-09",
      },
      {
        id: "word-91-100",
        label: "Word Lesson 91–100",
        kind: "word",
        lessonId: "lesson-10",
      },
      {
        id: "word-101-110",
        label: "Word Lesson 101–110",
        kind: "word",
        lessonId: "lesson-11",
      },
      {
        id: "word-111-120",
        label: "Word Lesson 111–120",
        kind: "word",
        lessonId: "lesson-12",
      },
      {
        id: "word-121-130",
        label: "Word Lesson 121–130",
        kind: "word",
        lessonId: "lesson-13",
      },
      {
        id: "word-131-140",
        label: "Word Lesson 131–140",
        kind: "word",
        lessonId: "lesson-14",
      },
      {
        id: "word-141-150",
        label: "Word Lesson 141–150",
        kind: "word",
        lessonId: "lesson-15",
      },
      {
        id: "word-151-160",
        label: "Word Lesson 151–160",
        kind: "word",
        lessonId: "lesson-16",
      },
      {
        id: "word-161-170",
        label: "Word Lesson 161–170",
        kind: "word",
        lessonId: "lesson-17",
      },
      {
        id: "word-171-180",
        label: "Word Lesson 171–180",
        kind: "word",
        lessonId: "lesson-18",
      },
      {
        id: "word-181-190",
        label: "Word Lesson 181–190",
        kind: "word",
        lessonId: "lesson-19",
      },
      {
        id: "word-191-200",
        label: "Word Lesson 191–200",
        kind: "word",
        lessonId: "lesson-20",
      },
      {
        id: "word-201-210",
        label: "Word Lesson 201–210",
        kind: "word",
        lessonId: "lesson-21",
      },
      {
        id: "word-211-220",
        label: "Word Lesson 211–220",
        kind: "word",
        lessonId: "lesson-22",
      },
      {
        id: "word-221-230",
        label: "Word Lesson 221–230",
        kind: "word",
        lessonId: "lesson-23",
      },
      {
        id: "word-231-240",
        label: "Word Lesson 231–240",
        kind: "word",
        lessonId: "lesson-24",
      },
      {
        id: "word-241-250",
        label: "Word Lesson 241–250",
        kind: "word",
        lessonId: "lesson-25",
      },
      {
        id: "word-251-260",
        label: "Word Lesson 251–260",
        kind: "word",
        lessonId: "lesson-26",
      },
      {
        id: "word-261-270",
        label: "Word Lesson 261–270",
        kind: "word",
        lessonId: "lesson-27",
      },
      {
        id: "word-271-280",
        label: "Word Lesson 271–280",
        kind: "word",
        lessonId: "lesson-28",
      },
      {
        id: "word-281-290",
        label: "Word Lesson 281–290",
        kind: "word",
        lessonId: "lesson-29",
      },
      {
        id: "word-291-300",
        label: "Word Lesson 291–300",
        kind: "word",
        lessonId: "lesson-30",
      },
      {
        id: "word-301-310",
        label: "Word Lesson 301–310",
        kind: "word",
        lessonId: "lesson-31",
      },
      {
        id: "word-311-320",
        label: "Word Lesson 311–320",
        kind: "word",
        lessonId: "lesson-32",
      },
      {
        id: "word-321-330",
        label: "Word Lesson 321–330",
        kind: "word",
        lessonId: "lesson-33",
      },
      {
        id: "word-331-340",
        label: "Word Lesson 331–340",
        kind: "word",
        lessonId: "lesson-34",
      },
      {
        id: "word-341-350",
        label: "Word Lesson 341–350",
        kind: "word",
        lessonId: "lesson-35",
      },
      {
        id: "word-351-360",
        label: "Word Lesson 351–360",
        kind: "word",
        lessonId: "lesson-36",
      },
      {
        id: "word-361-370",
        label: "Word Lesson 361–370",
        kind: "word",
        lessonId: "lesson-37",
      },
      {
        id: "word-371-380",
        label: "Word Lesson 371–380",
        kind: "word",
        lessonId: "lesson-38",
      },
      {
        id: "word-381-390",
        label: "Word Lesson 381–390",
        kind: "word",
        lessonId: "lesson-39",
      },
      {
        id: "word-391-400",
        label: "Word Lesson 391–400",
        kind: "word",
        lessonId: "lesson-40",
      },
      {
        id: "word-401-410",
        label: "Word Lesson 401–410",
        kind: "word",
        lessonId: "lesson-41",
      },
      {
        id: "word-411-420",
        label: "Word Lesson 411–420",
        kind: "word",
        lessonId: "lesson-42",
      },
      {
        id: "word-421-430",
        label: "Word Lesson 421–430",
        kind: "word",
        lessonId: "lesson-43",
      },
      {
        id: "word-431-440",
        label: "Word Lesson 431–440",
        kind: "word",
        lessonId: "lesson-44",
      },
      {
        id: "word-441-450",
        label: "Word Lesson 441–450",
        kind: "word",
        lessonId: "lesson-45",
      },
      {
        id: "word-451-460",
        label: "Word Lesson 451–460",
        kind: "word",
        lessonId: "lesson-46",
      },
      {
        id: "word-461-470",
        label: "Word Lesson 461–470",
        kind: "word",
        lessonId: "lesson-47",
      },
      {
        id: "word-471-480",
        label: "Word Lesson 471–480",
        kind: "word",
        lessonId: "lesson-48",
      },
      {
        id: "word-481-490",
        label: "Word Lesson 481–490",
        kind: "word",
        lessonId: "lesson-49",
      },
      {
        id: "word-491-500",
        label: "Word Lesson 491–500",
        kind: "word",
        lessonId: "lesson-50",
      },
    ],
  },
  {
    id: "grammar",
    title: "3. Grammar Lessons",
    items: [
      { id: "grammar-1-10",   label: "Grammar Lesson 1–10",   kind: "grammar", lessonId: "grammar-lesson-01" },
      { id: "grammar-11-20",  label: "Grammar Lesson 11–20",  kind: "grammar", lessonId: "grammar-lesson-02" },
      { id: "grammar-21-30",  label: "Grammar Lesson 21–30",  kind: "grammar", lessonId: "grammar-lesson-03" },
      { id: "grammar-31-40",  label: "Grammar Lesson 31–40",  kind: "grammar", lessonId: "grammar-lesson-04" },
      { id: "grammar-41-50",  label: "Grammar Lesson 41–50",  kind: "grammar", lessonId: "grammar-lesson-05" },
      { id: "grammar-51-60",  label: "Grammar Lesson 51–60",  kind: "grammar", lessonId: "grammar-lesson-06" },
      { id: "grammar-61-70",  label: "Grammar Lesson 61–70",  kind: "grammar", lessonId: "grammar-lesson-07" },
      { id: "grammar-71-80",  label: "Grammar Lesson 71–80",  kind: "grammar", lessonId: "grammar-lesson-08" },
      { id: "grammar-81-90",  label: "Grammar Lesson 81–90",  kind: "grammar", lessonId: "grammar-lesson-09" },
      { id: "grammar-91-100", label: "Grammar Lesson 91–100", kind: "grammar", lessonId: "grammar-lesson-10" },
      { id: "grammar-101-110", label: "Grammar Lesson 101–110", kind: "grammar", lessonId: "grammar-lesson-11" },
      { id: "grammar-111-120", label: "Grammar Lesson 111–120", kind: "grammar", lessonId: "grammar-lesson-12" },
      { id: "grammar-121-130", label: "Grammar Lesson 121–130", kind: "grammar", lessonId: "grammar-lesson-13" },
      { id: "grammar-131-140", label: "Grammar Lesson 131–140", kind: "grammar", lessonId: "grammar-lesson-14" },
      { id: "grammar-141-150", label: "Grammar Lesson 141–150", kind: "grammar", lessonId: "grammar-lesson-15" },
      { id: "grammar-151-160", label: "Grammar Lesson 151–160", kind: "grammar", lessonId: "grammar-lesson-16" },
      { id: "grammar-161-170", label: "Grammar Lesson 161–170", kind: "grammar", lessonId: "grammar-lesson-17" },
      { id: "grammar-171-180", label: "Grammar Lesson 171–180", kind: "grammar", lessonId: "grammar-lesson-18" },
      { id: "grammar-181-190", label: "Grammar Lesson 181–190", kind: "grammar", lessonId: "grammar-lesson-19" },
      { id: "grammar-191-200", label: "Grammar Lesson 191–200", kind: "grammar", lessonId: "grammar-lesson-20" },
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
        label: "Word Quiz 1–10",
        kind: "quiz",
        quizId: "quiz-vocab-1-10",
      },
      {
        id: "quiz-vocab-11-20",
        label: "Word Quiz 11–20",
        kind: "quiz",
        quizId: "quiz-vocab-11-20",
      },
      {
        id: "quiz-vocab-21-30",
        label: "Word Quiz 21–30",
        kind: "quiz",
        quizId: "quiz-vocab-21-30",
      },
      {
        id: "quiz-vocab-31-40",
        label: "Word Quiz 31–40",
        kind: "quiz",
        quizId: "quiz-vocab-31-40",
      },
      {
        id: "quiz-vocab-41-50",
        label: "Word Quiz 41–50",
        kind: "quiz",
        quizId: "quiz-vocab-41-50",
      },
      {
        id: "quiz-vocab-51-60",
        label: "Word Quiz 51–60",
        kind: "quiz",
        quizId: "quiz-vocab-51-60",
      },
      {
        id: "quiz-vocab-61-70",
        label: "Word Quiz 61–70",
        kind: "quiz",
        quizId: "quiz-vocab-61-70",
      },
      {
        id: "quiz-vocab-71-80",
        label: "Word Quiz 71–80",
        kind: "quiz",
        quizId: "quiz-vocab-71-80",
      },
      {
        id: "quiz-vocab-81-90",
        label: "Word Quiz 81–90",
        kind: "quiz",
        quizId: "quiz-vocab-81-90",
      },
      {
        id: "quiz-vocab-91-100",
        label: "Word Quiz 91–100",
        kind: "quiz",
        quizId: "quiz-vocab-91-100",
      },
      {
        id: "quiz-vocab-101-110",
        label: "Word Quiz 101–110",
        kind: "quiz",
        quizId: "quiz-vocab-101-110",
      },
      {
        id: "quiz-vocab-111-120",
        label: "Word Quiz 111–120",
        kind: "quiz",
        quizId: "quiz-vocab-111-120",
      },
      {
        id: "quiz-vocab-121-130",
        label: "Word Quiz 121–130",
        kind: "quiz",
        quizId: "quiz-vocab-121-130",
      },
      {
        id: "quiz-vocab-131-140",
        label: "Word Quiz 131–140",
        kind: "quiz",
        quizId: "quiz-vocab-131-140",
      },
      {
        id: "quiz-vocab-141-150",
        label: "Word Quiz 141–150",
        kind: "quiz",
        quizId: "quiz-vocab-141-150",
      },
      {
        id: "quiz-vocab-151-160",
        label: "Word Quiz 151–160",
        kind: "quiz",
        quizId: "quiz-vocab-151-160",
      },
      {
        id: "quiz-vocab-161-170",
        label: "Word Quiz 161–170",
        kind: "quiz",
        quizId: "quiz-vocab-161-170",
      },
      {
        id: "quiz-vocab-171-180",
        label: "Word Quiz 171–180",
        kind: "quiz",
        quizId: "quiz-vocab-171-180",
      },
      {
        id: "quiz-vocab-181-190",
        label: "Word Quiz 181–190",
        kind: "quiz",
        quizId: "quiz-vocab-181-190",
      },
      {
        id: "quiz-vocab-191-200",
        label: "Word Quiz 191–200",
        kind: "quiz",
        quizId: "quiz-vocab-191-200",
      },
      {
        id: "quiz-vocab-201-210",
        label: "Word Quiz 201–210",
        kind: "quiz",
        quizId: "quiz-vocab-201-210",
      },
      {
        id: "quiz-vocab-211-220",
        label: "Word Quiz 211–220",
        kind: "quiz",
        quizId: "quiz-vocab-211-220",
      },
      {
        id: "quiz-vocab-221-230",
        label: "Word Quiz 221–230",
        kind: "quiz",
        quizId: "quiz-vocab-221-230",
      },
      {
        id: "quiz-vocab-231-240",
        label: "Word Quiz 231–240",
        kind: "quiz",
        quizId: "quiz-vocab-231-240",
      },
      {
        id: "quiz-vocab-241-250",
        label: "Word Quiz 241–250",
        kind: "quiz",
        quizId: "quiz-vocab-241-250",
      },
      {
        id: "quiz-vocab-251-260",
        label: "Word Quiz 251–260",
        kind: "quiz",
        quizId: "quiz-vocab-251-260",
      },
      {
        id: "quiz-vocab-261-270",
        label: "Word Quiz 261–270",
        kind: "quiz",
        quizId: "quiz-vocab-261-270",
      },
      {
        id: "quiz-vocab-271-280",
        label: "Word Quiz 271–280",
        kind: "quiz",
        quizId: "quiz-vocab-271-280",
      },
      {
        id: "quiz-vocab-281-290",
        label: "Word Quiz 281–290",
        kind: "quiz",
        quizId: "quiz-vocab-281-290",
      },
      {
        id: "quiz-vocab-291-300",
        label: "Word Quiz 291–300",
        kind: "quiz",
        quizId: "quiz-vocab-291-300",
      },
      {
        id: "quiz-vocab-301-310",
        label: "Word Quiz 301–310",
        kind: "quiz",
        quizId: "quiz-vocab-301-310",
      },
      {
        id: "quiz-vocab-311-320",
        label: "Word Quiz 311–320",
        kind: "quiz",
        quizId: "quiz-vocab-311-320",
      },
      {
        id: "quiz-vocab-321-330",
        label: "Word Quiz 321–330",
        kind: "quiz",
        quizId: "quiz-vocab-321-330",
      },
      {
        id: "quiz-vocab-331-340",
        label: "Word Quiz 331–340",
        kind: "quiz",
        quizId: "quiz-vocab-331-340",
      },
      {
        id: "quiz-vocab-341-350",
        label: "Word Quiz 341–350",
        kind: "quiz",
        quizId: "quiz-vocab-341-350",
      },
      {
        id: "quiz-vocab-351-360",
        label: "Word Quiz 351–360",
        kind: "quiz",
        quizId: "quiz-vocab-351-360",
      },
      {
        id: "quiz-vocab-361-370",
        label: "Word Quiz 361–370",
        kind: "quiz",
        quizId: "quiz-vocab-361-370",
      },
      {
        id: "quiz-vocab-371-380",
        label: "Word Quiz 371–380",
        kind: "quiz",
        quizId: "quiz-vocab-371-380",
      },
      {
        id: "quiz-vocab-381-390",
        label: "Word Quiz 381–390",
        kind: "quiz",
        quizId: "quiz-vocab-381-390",
      },
      {
        id: "quiz-vocab-391-400",
        label: "Word Quiz 391–400",
        kind: "quiz",
        quizId: "quiz-vocab-391-400",
      },
      {
        id: "quiz-vocab-401-410",
        label: "Word Quiz 401–410",
        kind: "quiz",
        quizId: "quiz-vocab-401-410",
      },
      {
        id: "quiz-vocab-411-420",
        label: "Word Quiz 411–420",
        kind: "quiz",
        quizId: "quiz-vocab-411-420",
      },
      {
        id: "quiz-vocab-421-430",
        label: "Word Quiz 421–430",
        kind: "quiz",
        quizId: "quiz-vocab-421-430",
      },
      {
        id: "quiz-vocab-431-440",
        label: "Word Quiz 431–440",
        kind: "quiz",
        quizId: "quiz-vocab-431-440",
      },
      {
        id: "quiz-vocab-441-450",
        label: "Word Quiz 441–450",
        kind: "quiz",
        quizId: "quiz-vocab-441-450",
      },
      {
        id: "quiz-vocab-451-460",
        label: "Word Quiz 451–460",
        kind: "quiz",
        quizId: "quiz-vocab-451-460",
      },
      {
        id: "quiz-vocab-461-470",
        label: "Word Quiz 461–470",
        kind: "quiz",
        quizId: "quiz-vocab-461-470",
      },
      {
        id: "quiz-vocab-471-480",
        label: "Word Quiz 471–480",
        kind: "quiz",
        quizId: "quiz-vocab-471-480",
      },
      {
        id: "quiz-vocab-481-490",
        label: "Word Quiz 481–490",
        kind: "quiz",
        quizId: "quiz-vocab-481-490",
      },
      {
        id: "quiz-vocab-491-500",
        label: "Word Quiz 491–500",
        kind: "quiz",
        quizId: "quiz-vocab-491-500",
      },
      {
        id: "quiz-grammar-1-10",
        label: "Grammar Quiz 1–10",
        kind: "quiz",
        quizId: "quiz-grammar-1-10",
      },
      {
        id: "quiz-grammar-11-20",
        label: "Grammar Quiz 11–20",
        kind: "quiz",
        quizId: "quiz-grammar-11-20",
      },
      {
        id: "quiz-grammar-21-30",
        label: "Grammar Quiz 21–30",
        kind: "quiz",
        quizId: "quiz-grammar-21-30",
      },
      {
        id: "quiz-grammar-31-40",
        label: "Grammar Quiz 31–40",
        kind: "quiz",
        quizId: "quiz-grammar-31-40",
      },
      {
        id: "quiz-grammar-41-50",
        label: "Grammar Quiz 41–50",
        kind: "quiz",
        quizId: "quiz-grammar-41-50",
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
  {
    id: "reference",
    title: "6. Reference",
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
  "quiz-grammar-1-10",
  "quiz-grammar-11-20",
  "quiz-grammar-21-30",
  "quiz-grammar-31-40",
  "quiz-grammar-41-50",
  "quiz-mixed",
  "quiz-final",
];
