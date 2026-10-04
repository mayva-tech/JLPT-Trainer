/**
 * N3 course: the same corpus rules the N2 corpus is held to (field
 * completeness, kana readings, furigana alignment, karaoke units, speakable
 * nuance notes, kanji table, pictures), plus N3-specific layout and
 * no-duplicate checks against the N2 corpus.
 */
import { describe, expect, it } from "vitest";
import {
  N3_VOCAB_ID_END,
  N3_VOCAB_ID_START,
  N3_VOCAB_ITEM_COUNT,
  N3_VOCAB_LESSON_COUNT,
} from "../../config/vocabularyCourseN3";
import { alignFurigana } from "../../utils/alignFurigana";
import { activeHighlightUnits, buildJapaneseHighlightUnits } from "../../utils/speechHighlightUnits";
import { getVocabularyLessonIdForQuiz } from "../../utils/quizVocabLesson";
import { getGrammarLessonIdForQuiz } from "../../utils/quizGrammarLesson";
import { buildGrammarQuizQuestions, buildVocabularyQuizQuestions, getVocabularyItemsForQuiz } from "../../utils/vocabularyQuiz";
import { KANJI } from "../kanji";
import { vocabulary, getVocabularyById } from "../vocabulary";
import { grammar, getGrammarItemsForLesson, getGrammarLessonById } from "../grammar";
import { getLessonById } from "../lessons";
import { normalizeGrammarPattern } from "../grammarCourse";
import { getTocItem, quizIds, tocGroups } from "../toc";
import { grammarBatchCategorySuffix, grammarBatchRangeLabel } from "../tocGrammarItems";
import { formatVocabularyLessonHeader, formatVocabularyLessonSubheader } from "../../utils/vocabularyDisplay";
import { vocabPicture, grammarPicture } from "../../components/Illustration/pictures";
import { vocabularyN3 } from "./vocabularyN3";
import { n3Lessons } from "./lessonsN3";
import { grammarN3, n3GrammarLessons, n3GrammarNuances } from "./grammarN3";
import { n3VocabNuances } from "./vocabularyN3Nuances";

const KANJI_RE = /[\u4e00-\u9faf\u3400-\u4dbf々]/;
const KANA_READING = /^[\u3041-\u309f\u30a0-\u30ffー\s、。！？・〜～]+$/;

function expectSpeakable(label: string, note: string) {
  expect(note.trim(), label).toBe(note);
  expect(note.length, `${label}: ${note}`).toBeLessThanOrEqual(140);
  expect(note, label).toMatch(/[.!?]$/);
  expect(note, `${label} has brackets`).not.toMatch(/[()（）[\]"]/);
  expect(note, `${label} has digits`).not.toMatch(/[0-9０-９]/);
}

const n3Grammar = n3GrammarLessons.flatMap((l) => getGrammarItemsForLesson(l));

describe("N3 vocabulary course layout", () => {
  it("has contiguous ids from 7001 in their own block", () => {
    const ids = vocabularyN3.map((v) => v.id);
    expect(ids).toHaveLength(N3_VOCAB_ITEM_COUNT);
    expect(ids).toEqual(Array.from({ length: N3_VOCAB_ITEM_COUNT }, (_, i) => N3_VOCAB_ID_START + i));
    expect(ids[ids.length - 1]).toBe(N3_VOCAB_ID_END);
    for (const id of ids) expect(vocabulary.some((v) => v.id === id), `N2 corpus has ${id}`).toBe(false);
  });

  it("has ten-word lessons covering every N3 item once", () => {
    expect(n3Lessons).toHaveLength(N3_VOCAB_LESSON_COUNT);
    const seen = new Set<number>();
    for (const lesson of n3Lessons) {
      expect(lesson.vocabularyIds).toHaveLength(10);
      expect(getLessonById(lesson.id)).toBe(lesson);
      for (const id of lesson.vocabularyIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
        expect(getVocabularyById(id)?.jlpt).toBe("N3");
      }
    }
    expect(seen.size).toBe(vocabularyN3.length);
  });

  it("leaves the N2 vocabulary corpus at 2000 items", () => {
    expect(vocabulary).toHaveLength(2000);
  });
});

describe("N3 vocabulary content rules", () => {
  it("fills every core field and keeps readings in kana", () => {
    for (const v of vocabularyN3) {
      for (const field of ["word", "reading", "meaning", "phrase", "phraseReading", "phraseMeaning", "sentence", "sentenceReading", "sentenceMeaning", "wordType"] as const) {
        expect(v[field].trim(), `${v.id}.${field}`).not.toBe("");
      }
      for (const field of ["reading", "phraseReading", "sentenceReading"] as const) {
        expect(v[field], `${v.id}.${field}`).toMatch(KANA_READING);
      }
    }
  });

  it("never repeats a word from the N2 corpus or within N3", () => {
    const n2Words = new Set(vocabulary.map((v) => v.word));
    const dupes = vocabularyN3.filter((v) => n2Words.has(v.word)).map((v) => `${v.id} ${v.word}`);
    expect(dupes).toEqual([]);
    const words = vocabularyN3.map((v) => v.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("gives every phrase a nuance note and keeps all notes speakable", () => {
    for (const v of vocabularyN3) expect(v.phraseNuance, `phrase ${v.id}`).toBeTruthy();
    for (const [id, entry] of Object.entries(n3VocabNuances)) {
      expect(getVocabularyById(Number(id))?.jlpt, `unknown N3 id ${id}`).toBe("N3");
      for (const [field, note] of Object.entries(entry)) expectSpeakable(`vocab ${id}.${field}`, note as string);
    }
  });

  it("has every kanji in the shared KANJI table", () => {
    const missing = new Set<string>();
    for (const v of vocabularyN3) {
      for (const c of v.word + v.phrase + v.sentence) if (KANJI_RE.test(c) && c !== "々" && !KANJI[c]) missing.add(c);
    }
    for (const g of grammarN3) {
      for (const c of g.pattern + g.sentence) if (KANJI_RE.test(c) && c !== "々" && !KANJI[c]) missing.add(c);
    }
    expect([...missing]).toEqual([]);
  });
});

describe("N3 furigana and karaoke", () => {
  const cases = [
    ...vocabularyN3.flatMap((v) => [
      [`v${v.id}.word`, v.word, v.reading],
      [`v${v.id}.phrase`, v.phrase, v.phraseReading],
      [`v${v.id}.sentence`, v.sentence, v.sentenceReading],
    ]),
    ...grammarN3.flatMap((g) => [
      [`g${g.id}.pattern`, g.pattern, g.patternReading],
      [`g${g.id}.sentence`, g.sentence, g.sentenceReading],
    ]),
  ] as const;

  it("aligns every reading and puts ruby on every kanji", () => {
    const bad: string[] = [];
    for (const [label, surface, reading] of cases) {
      const segs = alignFurigana(surface, reading);
      if (segs.map((s) => s.text).join("") !== surface) bad.push(`${label} rebuild: ${surface}`);
      for (const seg of segs) {
        if ([...seg.text].some((ch) => KANJI_RE.test(ch)) && !seg.reading) bad.push(`${label} no ruby: ${seg.text}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("has no lone だ / です / ます karaoke units or split katakana", () => {
    const bad: string[] = [];
    for (const [label, surface] of cases) {
      const units = activeHighlightUnits(buildJapaneseHighlightUnits(surface)).map((u) => u.text);
      units.forEach((u, i) => {
        const core = u.replace(/[、。！？．，!?.]+$/u, "");
        const next = units[i + 1]?.replace(/[、。！？．，!?.]+$/u, "");
        if ((core === "だ" || core === "です" || core === "ます") && !(core === "だ" && next === "と")) {
          bad.push(`${label}: ${units.join("|")}`);
        }
        if (/^[\u30a0-\u30ffー]+$/.test(u) && /^[\u30a0-\u30ffー]+$/.test(units[i + 1] ?? "")) {
          bad.push(`${label} katakana split: ${u}+${units[i + 1]}`);
        }
      });
    }
    expect(bad).toEqual([]);
  });
});

describe("N3 grammar course", () => {
  it("reuses all 18 existing N3 items and adds new ones without duplicates", () => {
    const existing = grammar.filter((g) => g.courseLevel === "N3_REVIEW").map((g) => g.id);
    expect(existing).toHaveLength(18);
    const inLessons = n3GrammarLessons.flatMap((l) => l.grammarIds);
    for (const id of existing) expect(inLessons, `existing N3 item ${id}`).toContain(id);
    for (const g of grammarN3) expect(inLessons, `new N3 item ${g.id}`).toContain(g.id);
    expect(new Set(inLessons).size).toBe(inLessons.length);
  });

  it("never re-adds a pattern that is already in the corpus", () => {
    const known = new Map(grammar.map((g) => [normalizeGrammarPattern(g.pattern), g.id]));
    for (const g of grammarN3) {
      expect(known.get(normalizeGrammarPattern(g.pattern)), `${g.id} ${g.pattern}`).toBeUndefined();
      expect(grammar.some((x) => x.id === g.id), `id clash ${g.id}`).toBe(false);
    }
  });

  it("resolves every lesson to ten N3 items in order", () => {
    for (const lesson of n3GrammarLessons) {
      expect(getGrammarLessonById(lesson.id)).toBe(lesson);
      const items = getGrammarItemsForLesson(lesson);
      expect(items.map((g) => g.id)).toEqual(lesson.grammarIds);
      expect(items.every((g) => g.jlpt === "N3" && g.courseLevel === "N3_REVIEW")).toBe(true);
    }
    expect(n3Grammar).toHaveLength(30);
  });

  it("gives every new item speakable pattern and sentence notes", () => {
    for (const g of grammarN3) {
      expect(g.nuance, `${g.id} pattern note`).toBeTruthy();
      expect(g.sentenceNuance, `${g.id} sentence note`).toBeTruthy();
      expect(g.patternReading).toMatch(KANA_READING);
      expect(g.sentenceReading).toMatch(KANA_READING);
    }
    for (const [id, entry] of Object.entries(n3GrammarNuances)) {
      for (const [field, note] of Object.entries(entry)) expectSpeakable(`grammar ${id}.${field}`, note as string);
    }
  });
});

describe("N3 table of contents and quizzes", () => {
  it("adds N3 lesson and quiz sections that open the right lessons", () => {
    const group = (id: string) => tocGroups.find((g) => g.id === id)!;
    expect(group("vocabulary-n3").items).toHaveLength(n3Lessons.length);
    expect(group("grammar-n3").items).toHaveLength(n3GrammarLessons.length);
    for (const item of group("vocabulary-n3").items) expect(getLessonById(item.lessonId!)).toBeDefined();
    for (const item of group("grammar-n3").items) expect(getGrammarLessonById(item.lessonId!)).toBeDefined();
  });

  it("builds every N3 word quiz from that lesson's N3 words", () => {
    for (const item of tocGroups.find((g) => g.id === "quiz-vocab-n3")!.items) {
      const lessonId = getVocabularyLessonIdForQuiz(item.quizId!);
      const lesson = lessonId ? getLessonById(lessonId) : undefined;
      expect(lesson, item.id).toBeDefined();
      const words = getVocabularyItemsForQuiz({ lesson: lesson!, quizLevel: "N3" });
      expect(words).toHaveLength(10);
      expect(buildVocabularyQuizQuestions(words, item.quizId!).length).toBeGreaterThan(0);
      expect(quizIds).toContain(item.id);
      expect(getTocItem(item.id)?.kind).toBe("quiz");
    }
  });

  it("builds every N3 grammar quiz", () => {
    for (const item of tocGroups.find((g) => g.id === "quiz-grammar-n3")!.items) {
      const lessonId = getGrammarLessonIdForQuiz(item.quizId!);
      expect(lessonId, item.id).not.toBeNull();
      const items = getGrammarItemsForLesson(getGrammarLessonById(lessonId!)!);
      expect(buildGrammarQuizQuestions(items, item.quizId!).length).toBeGreaterThan(0);
      expect(quizIds).toContain(item.id);
    }
  });
});

describe("N3 stage headers", () => {
  it("numbers N3 vocabulary lessons like N2: Vocabulary Lesson n, Words a–b", () => {
    expect(formatVocabularyLessonHeader("n3-lesson-02")).toBe("Vocabulary Lesson 2");
    expect(formatVocabularyLessonSubheader("n3-lesson-02")).toBe("Words 11–20");
    expect(formatVocabularyLessonSubheader("lesson-06")).toBe("Words 51–60");
  });

  it("gives N3 grammar lessons a range like N2: Grammar 11–20", () => {
    expect(grammarBatchRangeLabel("n3-grammar-batch-01")).toBe("1–10");
    expect(grammarBatchRangeLabel("n3-grammar-batch-02")).toBe("11–20");
    expect(grammarBatchCategorySuffix("n3-grammar-batch-01")).not.toBe("");
  });
});

describe("N3 pictures", () => {
  it("gives every N3 word and grammar item a picture", () => {
    for (const v of vocabularyN3) expect(vocabPicture(v.id), `${v.id} ${v.word}`).not.toBeNull();
    for (const g of n3Grammar) expect(grammarPicture(g.id), `${g.id} ${g.pattern}`).not.toBeNull();
  });
});
