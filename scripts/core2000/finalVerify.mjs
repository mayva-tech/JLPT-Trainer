import fs from "fs";
import { vocabulary } from "../../src/data/vocabulary";
import { lessons } from "../../src/data/lessons";
import { quizIds, getTocItem } from "../../src/data/toc";
import { getVocabularyLessonIdForQuiz } from "../../src/utils/quizVocabLesson";

const n2 = lessons.filter((l) => l.id.startsWith("lesson-"));
const ids = vocabulary.map((v) => v.id).sort((a, b) => a - b);
const words = new Set(vocabulary.map((v) => v.word.normalize("NFC")));

console.log(
  JSON.stringify(
    {
      vocab: vocabulary.length,
      uniqueIds: new Set(ids).size,
      uniqueWords: words.size,
      idMin: ids[0],
      idMax: ids[ids.length - 1],
      lessons: n2.length,
      quizVocab: quizIds.filter((id) => /^quiz-vocab-\d+-\d+$/.test(id)).length,
      lesson200: Boolean(lessons.find((l) => l.id === "lesson-200")),
      quiz200: getVocabularyLessonIdForQuiz("quiz-vocab-1991-2000"),
      tocLesson200: getTocItem("word-1991-2000")?.kind,
      tocQuiz200: getTocItem("quiz-vocab-1991-2000")?.kind,
      missingKanjiFileBytes: fs.statSync("scripts/core2000/missing-kanji.txt")
        .size,
    },
    null,
    2
  )
);
