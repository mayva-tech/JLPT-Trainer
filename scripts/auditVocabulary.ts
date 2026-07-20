import { lessons } from "../src/data/lessons";
import { vocabulary } from "../src/data/vocabulary";
import { quizIds } from "../src/data/toc";
import { getLessonById } from "../src/data/lessons";
import { getVocabularyLessonIdForQuiz } from "../src/utils/quizVocabLesson";
import { getVocabularyItemsForQuiz } from "../src/utils/vocabularyQuiz";

const ALLOWED_CATEGORIES = new Set([
  "Daily Life",
  "Work & Business",
  "Society & Public Affairs",
  "Academic & Abstract",
  "Technology & Science",
]);

type WarningGroup = Record<string, string[]>;

function push(group: WarningGroup, key: string, message: string) {
  group[key] ??= [];
  group[key].push(message);
}

function main() {
  const warnings: WarningGroup = {};
  const errors: WarningGroup = {};
  let exitCode = 0;

  const n1 = vocabulary.filter((v) => v.jlpt === "N1");
  const n2 = vocabulary.filter((v) => v.jlpt === "N2");

  console.log("Vocabulary audit summary");
  console.log("======================");
  console.log(`Total vocabulary records: ${vocabulary.length}`);
  console.log(`N2 records: ${n2.length}`);
  console.log(`N1 records: ${n1.length}`);

  const ids = vocabulary.map((v) => v.id);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length) {
    push(errors, "duplicate-ids", `Duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);
  }

  const expectedIds = new Set(
    Array.from({ length: 750 }, (_, i) => 4001 + i)
  );
  const presentIds = new Set(ids);
  const missingIds = [...expectedIds].filter((id) => !presentIds.has(id));
  if (missingIds.length) {
    push(errors, "missing-ids", `Missing ids: ${missingIds.join(", ")}`);
  }

  const headlineWords = vocabulary.map((v) => v.word);
  const duplicateHeadlines = headlineWords.filter(
    (word, i) => headlineWords.indexOf(word) !== i
  );
  if (duplicateHeadlines.length) {
    push(
      warnings,
      "duplicate-headlines",
      [...new Set(duplicateHeadlines)].join(", ")
    );
  }

  const wordReadingPairs = vocabulary.map((v) => `${v.word}|${v.reading}`);
  const duplicatePairs = wordReadingPairs.filter(
    (pair, i) => wordReadingPairs.indexOf(pair) !== i
  );
  if (duplicatePairs.length) {
    push(
      warnings,
      "duplicate-word-reading",
      [...new Set(duplicatePairs)].join("; ")
    );
  }

  const n2Lessons = lessons.filter((l) => l.id.startsWith("lesson-"));
  const referencedIds = new Set<number>();

  for (const lesson of n2Lessons) {
    if (lesson.vocabularyIds.length !== 10) {
      push(
        errors,
        "lesson-size",
        `${lesson.id} has ${lesson.vocabularyIds.length} vocabulary ids`
      );
    }

    if (!ALLOWED_CATEGORIES.has(lesson.category)) {
      push(errors, "invalid-category", `${lesson.id}: ${lesson.category}`);
    }

    if (lesson.youtubeTitle.includes("Daily Life Vocabulary")) {
      push(errors, "youtube-title", lesson.id);
    }

    if (/Vocabulary Vocabulary/i.test(lesson.title)) {
      push(errors, "lesson-title", lesson.id);
    }

    for (const vocabId of lesson.vocabularyIds) {
      referencedIds.add(vocabId);
      if (!vocabulary.some((v) => v.id === vocabId)) {
        push(errors, "missing-vocab-ref", `${lesson.id} -> ${vocabId}`);
      }
      const item = vocabulary.find((v) => v.id === vocabId);
      if (item?.jlpt === "N1") {
        push(
          warnings,
          "n1-in-n2-lesson",
          `${lesson.id} includes N1 word ${vocabId} (${item.word})`
        );
      }
    }

    const n2QuizCount = getVocabularyItemsForQuiz({
      lesson,
      quizLevel: "N2",
    }).length;
    if (n2QuizCount === 0) {
      push(errors, "empty-n2-quiz", lesson.id);
    } else if (n2QuizCount < 10) {
      push(
        warnings,
        "reduced-n2-quiz",
        `${lesson.id}: ${n2QuizCount} N2 quiz questions`
      );
    }
  }

  for (const item of vocabulary) {
    if (!referencedIds.has(item.id) && !n1.some((n) => n.id === item.id)) {
      push(warnings, "unreferenced-vocab", String(item.id));
    }

    if (!item.reading.trim()) push(errors, "missing-reading", String(item.id));
    if (!item.phraseReading.trim())
      push(errors, "missing-phrase-reading", String(item.id));
    if (!item.sentenceReading.trim())
      push(errors, "missing-sentence-reading", String(item.id));
    if (!item.meaning.trim()) push(errors, "missing-meaning", String(item.id));
    if (!item.phraseMeaning.trim())
      push(errors, "missing-phrase-meaning", String(item.id));
    if (!item.sentenceMeaning.trim())
      push(errors, "missing-sentence-meaning", String(item.id));
    if (!item.audioWord || !item.audioPhrase || !item.audioSentence) {
      push(errors, "missing-audio", String(item.id));
    }
  }

  for (const quizId of quizIds) {
    if (!quizId.startsWith("quiz-vocab-")) continue;
    const lessonId = getVocabularyLessonIdForQuiz(quizId);
    if (!lessonId || !getLessonById(lessonId)) {
      push(errors, "quiz-lesson-map", quizId);
    }
  }

  const printGroup = (title: string, group: WarningGroup) => {
    const keys = Object.keys(group);
    if (!keys.length) return;
    console.log(`\n${title}`);
    for (const key of keys.sort()) {
      console.log(`- ${key} (${group[key]!.length})`);
      for (const line of group[key]!) console.log(`  · ${line}`);
    }
  };

  printGroup("Warnings", warnings);
  printGroup("Errors", errors);

  if (Object.keys(errors).length) exitCode = 1;

  console.log(`\nAudit finished with exit code ${exitCode}`);
  process.exit(exitCode);
}

main();
