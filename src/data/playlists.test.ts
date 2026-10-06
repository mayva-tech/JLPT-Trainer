/**
 * Real-level tags and level playlists: every word has a level, every word sits
 * in exactly one level-pure playlist lesson, and the lessons, quizzes and
 * table-of-contents entries resolve through the same player paths as N2 / N3.
 */
import { describe, expect, it } from "vitest";
import { ASSUMED_LEVEL_IDS, LISTED_LEVEL_IDS } from "./wordLevels";
import { vocabulary } from "./vocabulary";
import { vocabularyN3 } from "./n3/vocabularyN3";
import { getLessonById, lessons } from "./lessons";
import {
  PLAYLIST_LEVEL_INFO,
  formatPlaylistLessonId,
  getPlaylistWordRange,
  parsePlaylistLessonId,
  playlistLessons,
  playlistLessonsForLevel,
} from "./playlists";
import { getTocItem, lessonGroupIds, quizIds, tocGroups } from "./toc";
import { JLPT_LEVELS, getWordLevel, isWordLevelAssumed } from "../utils/wordLevel";
import { getVocabularyLessonIdForQuiz } from "../utils/quizVocabLesson";
import { buildVocabularyQuizQuestions, getVocabularyItemsForQuiz } from "../utils/vocabularyQuiz";
import { formatVocabularyLessonSubheader } from "../utils/vocabularyDisplay";

const ALL_WORDS = [...vocabulary, ...vocabularyN3];

describe("real JLPT level tags", () => {
  it("gives every vocabulary item exactly one level, and nothing else", () => {
    const missing = ALL_WORDS.filter((v) => getWordLevel(v.id) === undefined).map((v) => `${v.id} ${v.word}`);
    expect(missing, "run: node scripts/levels/generateLevels.mjs").toEqual([]);
    const known = new Set(ALL_WORDS.map((v) => v.id));
    const tagged = [
      ...JLPT_LEVELS.flatMap((l) => LISTED_LEVEL_IDS[l]),
      ...JLPT_LEVELS.flatMap((l) => ASSUMED_LEVEL_IDS[l] ?? []),
    ];
    expect(tagged.filter((id) => !known.has(id))).toEqual([]);
    expect(new Set(tagged).size).toBe(tagged.length);
    expect(tagged.length).toBe(ALL_WORDS.length);
  });

  it("tags basic Core 2000 words as N5, not N2", () => {
    const watashi = vocabulary.find((v) => v.word === "私")!;
    expect(getWordLevel(watashi.id)).toBe("N5");
    expect(isWordLevelAssumed(watashi.id)).toBe(false);
  });

  it("keeps the curated N1 words N1 and marks words on no list as assumed", () => {
    for (const v of vocabulary.filter((x) => x.jlpt === "N1")) expect(getWordLevel(v.id), v.word).toBe("N1");
    const assumed = ALL_WORDS.filter((v) => isWordLevelAssumed(v.id));
    expect(assumed.length).toBeGreaterThan(0);
    for (const v of assumed) expect(["N2", "N3"]).toContain(getWordLevel(v.id));
  });

  it("covers every level", () => {
    for (const level of JLPT_LEVELS) expect(ALL_WORDS.some((v) => getWordLevel(v.id) === level), level).toBe(true);
  });
});

describe("level playlists", () => {
  it("puts every word in exactly one lesson of its own level", () => {
    const placed = new Map<number, string>();
    for (const lesson of playlistLessons) {
      const parsed = parsePlaylistLessonId(lesson.id)!;
      for (const id of lesson.vocabularyIds) {
        expect(placed.has(id), `id ${id} in two lessons`).toBe(false);
        placed.set(id, lesson.id);
        expect(getWordLevel(id), `${lesson.id} holds ${id}`).toBe(parsed.level);
      }
    }
    const missing = ALL_WORDS.filter((v) => !placed.has(v.id)).map((v) => `${v.id} ${v.word}`);
    expect(missing, "run: node scripts/levels/generateLevels.mjs").toEqual([]);
  });

  it("numbers lessons 1…n per level with sensible sizes", () => {
    for (const level of JLPT_LEVELS) {
      const list = playlistLessonsForLevel(level);
      expect(list.length, level).toBeGreaterThan(0);
      list.forEach((lesson, i) => {
        expect(lesson.id).toBe(formatPlaylistLessonId(level, i + 1));
        expect(lesson.vocabularyIds.length).toBeGreaterThanOrEqual(3);
        expect(lesson.vocabularyIds.length).toBeLessThanOrEqual(14);
        expect(lesson.title).toBe(`JLPT ${level} Vocabulary #${i + 1} | ${lesson.subtitle}`);
        expect(lesson.category).toBe(PLAYLIST_LEVEL_INFO[level].name);
      });
    }
  });

  it("resolves through getLessonById and leaves the N2 course lessons alone", () => {
    for (const lesson of playlistLessons) expect(getLessonById(lesson.id)).toBe(lesson);
    expect(lessons.some((l) => l.id.startsWith("pl-"))).toBe(false);
  });

  it("counts words continuously across a level", () => {
    for (const level of JLPT_LEVELS) {
      let expectedFirst = 1;
      for (const lesson of playlistLessonsForLevel(level)) {
        const range = getPlaylistWordRange(lesson.id)!;
        expect(range.firstWordNumber).toBe(expectedFirst);
        expect(range.lastWordNumber).toBe(expectedFirst + lesson.vocabularyIds.length - 1);
        expectedFirst = range.lastWordNumber + 1;
      }
    }
    const first = playlistLessonsForLevel("N5")[0];
    expect(formatVocabularyLessonSubheader(first.id)).toBe("Words 1–10");
  });
});

describe("level playlists in the table of contents and quizzes", () => {
  it("has a lessons group and a quizzes group for every level, with one entry per lesson", () => {
    for (const level of JLPT_LEVELS) {
      const lower = level.toLowerCase();
      const lessonGroup = tocGroups.find((g) => g.id === `playlist-lessons-${lower}`)!;
      const quizGroup = tocGroups.find((g) => g.id === `playlist-quizzes-${lower}`)!;
      const list = playlistLessonsForLevel(level);
      expect(lessonGroup.items).toHaveLength(list.length);
      expect(quizGroup.items).toHaveLength(list.length);
      lessonGroup.items.forEach((item, i) => {
        expect(item.kind).toBe("word");
        expect(item.lessonId).toBe(list[i].id);
        expect(getTocItem(item.id)).toBe(item);
        expect(lessonGroupIds).toContain(item.id);
      });
      quizGroup.items.forEach((item) => {
        expect(item.kind).toBe("quiz");
        expect(quizIds).toContain(item.id);
      });
    }
    for (const old of ["vocabulary", "vocabulary-n1", "vocabulary-n3", "quiz-word", "quiz-vocab-n1", "quiz-vocab-n3"]) {
      expect(tocGroups.some((g) => g.id === old), `mixed-level group ${old} should be gone`).toBe(false);
    }
    const ids = tocGroups.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps each level quiz to its lesson and builds questions from every word type", () => {
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-pl-n5-01" as never)).toBe("pl-n5-01");
    expect(getVocabularyLessonIdForQuiz("quiz-vocab-pl-n5-99" as never)).toBeNull();
    for (const level of JLPT_LEVELS) {
      const lesson = playlistLessonsForLevel(level)[0];
      const quizId = `quiz-vocab-pl-${level.toLowerCase()}-01`;
      const words = getVocabularyItemsForQuiz({ lesson, quizLevel: "ANY" });
      expect(words).toHaveLength(lesson.vocabularyIds.length);
      expect(buildVocabularyQuizQuestions(words, quizId).length).toBeGreaterThan(0);
    }
  });
});
