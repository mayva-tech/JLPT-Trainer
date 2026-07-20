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
      {
        id: "word-501-510",
        label: "Word Lesson 501–510",
        kind: "word",
        lessonId: "lesson-51",
      },
      {
        id: "word-511-520",
        label: "Word Lesson 511–520",
        kind: "word",
        lessonId: "lesson-52",
      },
      {
        id: "word-521-530",
        label: "Word Lesson 521–530",
        kind: "word",
        lessonId: "lesson-53",
      },
      {
        id: "word-531-540",
        label: "Word Lesson 531–540",
        kind: "word",
        lessonId: "lesson-54",
      },
      {
        id: "word-541-550",
        label: "Word Lesson 541–550",
        kind: "word",
        lessonId: "lesson-55",
      },
      {
        id: "word-551-560",
        label: "Word Lesson 551–560",
        kind: "word",
        lessonId: "lesson-56",
      },
      {
        id: "word-561-570",
        label: "Word Lesson 561–570",
        kind: "word",
        lessonId: "lesson-57",
      },
      {
        id: "word-571-580",
        label: "Word Lesson 571–580",
        kind: "word",
        lessonId: "lesson-58",
      },
      {
        id: "word-581-590",
        label: "Word Lesson 581–590",
        kind: "word",
        lessonId: "lesson-59",
      },
      {
        id: "word-591-600",
        label: "Word Lesson 591–600",
        kind: "word",
        lessonId: "lesson-60",
      },
      {
        id: "word-601-610",
        label: "Word Lesson 601–610",
        kind: "word",
        lessonId: "lesson-61",
      },
      {
        id: "word-611-620",
        label: "Word Lesson 611–620",
        kind: "word",
        lessonId: "lesson-62",
      },
      {
        id: "word-621-630",
        label: "Word Lesson 621–630",
        kind: "word",
        lessonId: "lesson-63",
      },
      {
        id: "word-631-640",
        label: "Word Lesson 631–640",
        kind: "word",
        lessonId: "lesson-64",
      },
      {
        id: "word-641-650",
        label: "Word Lesson 641–650",
        kind: "word",
        lessonId: "lesson-65",
      },
      {
        id: "word-651-660",
        label: "Word Lesson 651–660",
        kind: "word",
        lessonId: "lesson-66",
      },
      {
        id: "word-661-670",
        label: "Word Lesson 661–670",
        kind: "word",
        lessonId: "lesson-67",
      },
      {
        id: "word-671-680",
        label: "Word Lesson 671–680",
        kind: "word",
        lessonId: "lesson-68",
      },
      {
        id: "word-681-690",
        label: "Word Lesson 681–690",
        kind: "word",
        lessonId: "lesson-69",
      },
      {
        id: "word-691-700",
        label: "Word Lesson 691–700",
        kind: "word",
        lessonId: "lesson-70",
      },
      {
        id: "word-701-710",
        label: "Word Lesson 701–710",
        kind: "word",
        lessonId: "lesson-71",
      },
      {
        id: "word-711-720",
        label: "Word Lesson 711–720",
        kind: "word",
        lessonId: "lesson-72",
      },
      {
        id: "word-721-730",
        label: "Word Lesson 721–730",
        kind: "word",
        lessonId: "lesson-73",
      },
      {
        id: "word-731-740",
        label: "Word Lesson 731–740",
        kind: "word",
        lessonId: "lesson-74",
      },
      {
        id: "word-741-750",
        label: "Word Lesson 741–750",
        kind: "word",
        lessonId: "lesson-75",
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
      { id: "grammar-201-210", label: "Grammar Lesson 201–210", kind: "grammar", lessonId: "grammar-lesson-21" },
      { id: "grammar-211-220", label: "Grammar Lesson 211–220", kind: "grammar", lessonId: "grammar-lesson-22" },
      { id: "grammar-221-230", label: "Grammar Lesson 221–230", kind: "grammar", lessonId: "grammar-lesson-23" },
      { id: "grammar-231-240", label: "Grammar Lesson 231–240", kind: "grammar", lessonId: "grammar-lesson-24" },
      { id: "grammar-241-250", label: "Grammar Lesson 241–250", kind: "grammar", lessonId: "grammar-lesson-25" },
      { id: "grammar-251-260", label: "Grammar Lesson 251–260", kind: "grammar", lessonId: "grammar-lesson-26" },
      { id: "grammar-261-270", label: "Grammar Lesson 261–270", kind: "grammar", lessonId: "grammar-lesson-27" },
      { id: "grammar-271-280", label: "Grammar Lesson 271–280", kind: "grammar", lessonId: "grammar-lesson-28" },
      { id: "grammar-281-290", label: "Grammar Lesson 281–290", kind: "grammar", lessonId: "grammar-lesson-29" },
      { id: "grammar-291-300", label: "Grammar Lesson 291–300", kind: "grammar", lessonId: "grammar-lesson-30" },
      { id: "grammar-301-310", label: "Grammar Lesson 301–310", kind: "grammar", lessonId: "grammar-lesson-31" },
      { id: "grammar-311-320", label: "Grammar Lesson 311–320", kind: "grammar", lessonId: "grammar-lesson-32" },
      { id: "grammar-321-330", label: "Grammar Lesson 321–330", kind: "grammar", lessonId: "grammar-lesson-33" },
      { id: "grammar-331-340", label: "Grammar Lesson 331–340", kind: "grammar", lessonId: "grammar-lesson-34" },
      { id: "grammar-341-350", label: "Grammar Lesson 341–350", kind: "grammar", lessonId: "grammar-lesson-35" },
      { id: "grammar-351-360", label: "Grammar Lesson 351–360", kind: "grammar", lessonId: "grammar-lesson-36" },
      { id: "grammar-361-370", label: "Grammar Lesson 361–370", kind: "grammar", lessonId: "grammar-lesson-37" },
      { id: "grammar-371-380", label: "Grammar Lesson 371–380", kind: "grammar", lessonId: "grammar-lesson-38" },
      { id: "grammar-381-390", label: "Grammar Lesson 381–390", kind: "grammar", lessonId: "grammar-lesson-39" },
      { id: "grammar-391-400", label: "Grammar Lesson 391–400", kind: "grammar", lessonId: "grammar-lesson-40" },
      { id: "grammar-401-410", label: "Grammar Lesson 401–410", kind: "grammar", lessonId: "grammar-lesson-41" },
      { id: "grammar-411-420", label: "Grammar Lesson 411–420", kind: "grammar", lessonId: "grammar-lesson-42" },
      { id: "grammar-421-430", label: "Grammar Lesson 421–430", kind: "grammar", lessonId: "grammar-lesson-43" },
      { id: "grammar-431-440", label: "Grammar Lesson 431–440", kind: "grammar", lessonId: "grammar-lesson-44" },
      { id: "grammar-441-450", label: "Grammar Lesson 441–450", kind: "grammar", lessonId: "grammar-lesson-45" },
      { id: "grammar-451-460", label: "Grammar Lesson 451–460", kind: "grammar", lessonId: "grammar-lesson-46" },
      { id: "grammar-461-470", label: "Grammar Lesson 461–470", kind: "grammar", lessonId: "grammar-lesson-47" },
      { id: "grammar-471-480", label: "Grammar Lesson 471–480", kind: "grammar", lessonId: "grammar-lesson-48" },
      { id: "grammar-481-490", label: "Grammar Lesson 481–490", kind: "grammar", lessonId: "grammar-lesson-49" },
      { id: "grammar-491-500", label: "Grammar Lesson 491–500", kind: "grammar", lessonId: "grammar-lesson-50" },
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
    title: "4. Word Quizzes",
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
        id: "quiz-vocab-501-510",
        label: "Word Quiz 501–510",
        kind: "quiz",
        quizId: "quiz-vocab-501-510",
      },
      {
        id: "quiz-vocab-511-520",
        label: "Word Quiz 511–520",
        kind: "quiz",
        quizId: "quiz-vocab-511-520",
      },
      {
        id: "quiz-vocab-521-530",
        label: "Word Quiz 521–530",
        kind: "quiz",
        quizId: "quiz-vocab-521-530",
      },
      {
        id: "quiz-vocab-531-540",
        label: "Word Quiz 531–540",
        kind: "quiz",
        quizId: "quiz-vocab-531-540",
      },
      {
        id: "quiz-vocab-541-550",
        label: "Word Quiz 541–550",
        kind: "quiz",
        quizId: "quiz-vocab-541-550",
      },
      {
        id: "quiz-vocab-551-560",
        label: "Word Quiz 551–560",
        kind: "quiz",
        quizId: "quiz-vocab-551-560",
      },
      {
        id: "quiz-vocab-561-570",
        label: "Word Quiz 561–570",
        kind: "quiz",
        quizId: "quiz-vocab-561-570",
      },
      {
        id: "quiz-vocab-571-580",
        label: "Word Quiz 571–580",
        kind: "quiz",
        quizId: "quiz-vocab-571-580",
      },
      {
        id: "quiz-vocab-581-590",
        label: "Word Quiz 581–590",
        kind: "quiz",
        quizId: "quiz-vocab-581-590",
      },
      {
        id: "quiz-vocab-591-600",
        label: "Word Quiz 591–600",
        kind: "quiz",
        quizId: "quiz-vocab-591-600",
      },
      {
        id: "quiz-vocab-601-610",
        label: "Word Quiz 601–610",
        kind: "quiz",
        quizId: "quiz-vocab-601-610",
      },
      {
        id: "quiz-vocab-611-620",
        label: "Word Quiz 611–620",
        kind: "quiz",
        quizId: "quiz-vocab-611-620",
      },
      {
        id: "quiz-vocab-621-630",
        label: "Word Quiz 621–630",
        kind: "quiz",
        quizId: "quiz-vocab-621-630",
      },
      {
        id: "quiz-vocab-631-640",
        label: "Word Quiz 631–640",
        kind: "quiz",
        quizId: "quiz-vocab-631-640",
      },
      {
        id: "quiz-vocab-641-650",
        label: "Word Quiz 641–650",
        kind: "quiz",
        quizId: "quiz-vocab-641-650",
      },
      {
        id: "quiz-vocab-651-660",
        label: "Word Quiz 651–660",
        kind: "quiz",
        quizId: "quiz-vocab-651-660",
      },
      {
        id: "quiz-vocab-661-670",
        label: "Word Quiz 661–670",
        kind: "quiz",
        quizId: "quiz-vocab-661-670",
      },
      {
        id: "quiz-vocab-671-680",
        label: "Word Quiz 671–680",
        kind: "quiz",
        quizId: "quiz-vocab-671-680",
      },
      {
        id: "quiz-vocab-681-690",
        label: "Word Quiz 681–690",
        kind: "quiz",
        quizId: "quiz-vocab-681-690",
      },
      {
        id: "quiz-vocab-691-700",
        label: "Word Quiz 691–700",
        kind: "quiz",
        quizId: "quiz-vocab-691-700",
      },
      {
        id: "quiz-vocab-701-710",
        label: "Word Quiz 701–710",
        kind: "quiz",
        quizId: "quiz-vocab-701-710",
      },
      {
        id: "quiz-vocab-711-720",
        label: "Word Quiz 711–720",
        kind: "quiz",
        quizId: "quiz-vocab-711-720",
      },
      {
        id: "quiz-vocab-721-730",
        label: "Word Quiz 721–730",
        kind: "quiz",
        quizId: "quiz-vocab-721-730",
      },
      {
        id: "quiz-vocab-731-740",
        label: "Word Quiz 731–740",
        kind: "quiz",
        quizId: "quiz-vocab-731-740",
      },
      {
        id: "quiz-vocab-741-750",
        label: "Word Quiz 741–750",
        kind: "quiz",
        quizId: "quiz-vocab-741-750",
      },
    ],
  },
  {
    id: "quiz-grammar",
    title: "5. Grammar Quizzes",
    items: [
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
        id: "quiz-grammar-51-60",
        label: "Grammar Quiz 51–60",
        kind: "quiz",
        quizId: "quiz-grammar-51-60",
      },
      {
        id: "quiz-grammar-61-70",
        label: "Grammar Quiz 61–70",
        kind: "quiz",
        quizId: "quiz-grammar-61-70",
      },
      {
        id: "quiz-grammar-71-80",
        label: "Grammar Quiz 71–80",
        kind: "quiz",
        quizId: "quiz-grammar-71-80",
      },
      {
        id: "quiz-grammar-81-90",
        label: "Grammar Quiz 81–90",
        kind: "quiz",
        quizId: "quiz-grammar-81-90",
      },
      {
        id: "quiz-grammar-91-100",
        label: "Grammar Quiz 91–100",
        kind: "quiz",
        quizId: "quiz-grammar-91-100",
      },
      {
        id: "quiz-grammar-101-110",
        label: "Grammar Quiz 101–110",
        kind: "quiz",
        quizId: "quiz-grammar-101-110",
      },
      {
        id: "quiz-grammar-111-120",
        label: "Grammar Quiz 111–120",
        kind: "quiz",
        quizId: "quiz-grammar-111-120",
      },
      {
        id: "quiz-grammar-121-130",
        label: "Grammar Quiz 121–130",
        kind: "quiz",
        quizId: "quiz-grammar-121-130",
      },
      {
        id: "quiz-grammar-131-140",
        label: "Grammar Quiz 131–140",
        kind: "quiz",
        quizId: "quiz-grammar-131-140",
      },
      {
        id: "quiz-grammar-141-150",
        label: "Grammar Quiz 141–150",
        kind: "quiz",
        quizId: "quiz-grammar-141-150",
      },
      {
        id: "quiz-grammar-151-160",
        label: "Grammar Quiz 151–160",
        kind: "quiz",
        quizId: "quiz-grammar-151-160",
      },
      {
        id: "quiz-grammar-161-170",
        label: "Grammar Quiz 161–170",
        kind: "quiz",
        quizId: "quiz-grammar-161-170",
      },
      {
        id: "quiz-grammar-171-180",
        label: "Grammar Quiz 171–180",
        kind: "quiz",
        quizId: "quiz-grammar-171-180",
      },
      {
        id: "quiz-grammar-181-190",
        label: "Grammar Quiz 181–190",
        kind: "quiz",
        quizId: "quiz-grammar-181-190",
      },
      {
        id: "quiz-grammar-191-200",
        label: "Grammar Quiz 191–200",
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
