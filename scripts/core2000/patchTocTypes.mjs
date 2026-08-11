import fs from "fs";

const path = "src/data/toc.ts";
let s = fs.readFileSync(path, "utf8");

const typeStart = s.indexOf("export type TocItemId =");
const typeEnd = s.indexOf("export type TocItemKind");
if (typeStart < 0 || typeEnd < 0) throw new Error("TocItemId bounds not found");

const newType = `export type TocItemId =
  | "intro-hook"
  | \\\`word-\\\${number}-\\\${number}\\\`
  | "word-n1-01"
  | "word-n1-02"
  | "word-n1-03"
  | \\\`grammar-f\\\${number}-\\\${number}\\\`
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
  | \\\`quiz-vocab-\\\${number}-\\\${number}\\\`
  | "quiz-vocab-n1-01"
  | "quiz-vocab-n1-02"
  | "quiz-vocab-n1-03"
  | \\\`quiz-grammar-\\\${number}-\\\${number}\\\`
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
  | "glossary";

`;

// The escaping above is wrong for writing file - write raw template literals
const newTypeRaw = [
  'export type TocItemId =',
  '  | "intro-hook"',
  '  | `word-${number}-${number}`',
  '  | "word-n1-01"',
  '  | "word-n1-02"',
  '  | "word-n1-03"',
  '  | `grammar-f${number}-${number}`',
  '  | "n1-grammar-01"',
  '  | "n1-grammar-02"',
  '  | "n1-grammar-03"',
  '  | "n1-grammar-04"',
  '  | "n1-grammar-05"',
  '  | "n1-grammar-06"',
  '  | "n1-grammar-07"',
  '  | "n1-grammar-08"',
  '  | "n1-grammar-09"',
  '  | "quiz-pre-comment"',
  '  | `quiz-vocab-${number}-${number}`',
  '  | "quiz-vocab-n1-01"',
  '  | "quiz-vocab-n1-02"',
  '  | "quiz-vocab-n1-03"',
  '  | `quiz-grammar-${number}-${number}`',
  '  | "quiz-mixed"',
  '  | "quiz-final"',
  '  | "quiz-after-comment"',
  '  | "ending-cta"',
  '  | "interview-01"',
  '  | "interview-02"',
  '  | "interview-03"',
  '  | "interview-04"',
  '  | "interview-05"',
  '  | "interview-06"',
  '  | "interview-07"',
  '  | "interview-08"',
  '  | "interview-09"',
  '  | "interview-10"',
  '  | "interview-11"',
  '  | "interview-12"',
  '  | "interview-13"',
  '  | "interview-14"',
  '  | "interview-15"',
  '  | "interview-16"',
  '  | "interview-17"',
  '  | "interview-mix-01"',
  '  | "interview-mix-02"',
  '  | "interview-mix-03"',
  '  | "interview-mix-04"',
  '  | "interview-mix-05"',
  '  | "interview-mix-06"',
  '  | "interview-mix-07"',
  '  | "interview-mix-08"',
  '  | "interview-mix-09"',
  '  | "interview-mix-10"',
  '  | "interview-mix-11"',
  '  | "interview-mix-12"',
  '  | "interview-mix-13"',
  '  | "interview-mix-14"',
  '  | "interview-mix-15"',
  '  | "interview-mix-16"',
  '  | "interview-mix-17"',
  '  | "glossary";',
  '',
  '',
].join('\n');

s = s.slice(0, typeStart) + newTypeRaw + s.slice(typeEnd);

// Ensure imports for generated quiz ids
if (!s.includes('formatN2VocabularyTocQuizId')) {
  s = s.replace(
    'import { buildN2VocabularyLessonTocItems, buildN2VocabularyQuizTocItems } from "./tocVocabularyItems";\nimport { buildN2GrammarLessonTocItems, buildN2GrammarQuizTocItems } from "./tocGrammarItems";',
    'import { buildN2VocabularyLessonTocItems, buildN2VocabularyQuizTocItems } from "./tocVocabularyItems";\nimport { buildN2GrammarLessonTocItems, buildN2GrammarQuizTocItems } from "./tocGrammarItems";\nimport { N2_VOCAB_LESSON_COUNT } from "../config/vocabularyCourse";\nimport { formatN2VocabularyTocQuizId } from "../utils/vocabularyDisplay";'
  );
}

const quizStart = s.indexOf("export const quizIds: TocItemId[] = [");
const quizEnd = s.indexOf("];", quizStart);
if (quizStart < 0 || quizEnd < 0) throw new Error("quizIds bounds not found");

const newQuizIds = `export const quizIds: TocItemId[] = [
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
]`;

s = s.slice(0, quizStart) + newQuizIds + s.slice(quizEnd + 2);

fs.writeFileSync(path, s);
console.log("Updated TocItemId + quizIds in toc.ts");
