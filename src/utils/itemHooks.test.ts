import { describe, expect, it } from "vitest";
import { grammar } from "../data/grammar";
import { playlistLessons } from "../data/playlists";
import { vocabulary } from "../data/vocabulary";
import type { VocabularyItem } from "../types/vocabulary";
import { buildGrammarQuizQuestions, buildVocabularyQuizQuestions } from "./vocabularyQuiz";
import {
  grammarHook,
  HOOK_TEMPLATES,
  hookSpeech,
  quizHook,
  vocabHook,
  type HookKind,
  type ItemHook,
} from "./itemHooks";

const JAPANESE = /[぀-ヿ㐀-䶿一-鿿]/u;
const KANA_LINE = /^[぀-ヿー、。！？・\s]+$/u;

/** Hooks for a whole list, chained like the runners do (prevId per kind). */
function chain<T>(list: readonly T[], make: (k: HookKind, item: T, ctx: { index: number; total: number; prevId: string | null }) => ItemHook) {
  const out: { intro: ItemHook; outro: ItemHook }[] = [];
  let pi: string | null = null;
  let po: string | null = null;
  list.forEach((item, index) => {
    const intro = make("intro", item, { index, total: list.length, prevId: pi });
    const outro = make("outro", item, { index, total: list.length, prevId: po });
    pi = intro.id;
    po = outro.id;
    out.push({ intro, outro });
  });
  return out;
}

/** Every hook speaks cleanly: Andrew says no Japanese, Nanami's reading is kana. */
function expectSpeakable(h: ItemHook, where: string) {
  const say = hookSpeech(h);
  if (say.lang === "en") {
    expect(JAPANESE.test(say.text), `${where} ${h.id}: "${say.text}"`).toBe(false);
  } else {
    expect(say.reading, `${where} ${h.id}`).toMatch(KANA_LINE);
  }
  expect(h.en.trim().length).toBeGreaterThan(3);
  expect(h.ja.trim().length).toBeGreaterThan(1);
}

const byId = new Map(vocabulary.map((v) => [v.id, v]));
const lessons = playlistLessons
  .map((l) => l.vocabularyIds.map((id) => byId.get(id)).filter((v): v is VocabularyItem => !!v))
  .filter((l) => l.length > 1);

describe("vocabulary hooks", () => {
  it("every lesson: speakable, first/last lines, no line twice in a row, both voices", () => {
    let total = 0;
    const ids = new Set<string>();
    const voices = new Set<string>();
    for (const lesson of lessons) {
      const hooks = chain(lesson, vocabHook);
      expect(hooks[0]!.intro.id).toBe("v-first");
      expect(hooks.at(-1)!.intro.id).toBe("v-last");
      expect(hooks.at(-1)!.outro.id).toBe("v-o-last");
      hooks.forEach((h, i) => {
        expectSpeakable(h.intro, `lesson word ${i}`);
        expectSpeakable(h.outro, `lesson word ${i}`);
        ids.add(h.intro.id);
        ids.add(h.outro.id);
        voices.add(h.intro.voice);
        if (i > 0) {
          expect(h.intro.id).not.toBe(hooks[i - 1]!.intro.id);
          expect(h.outro.id).not.toBe(hooks[i - 1]!.outro.id);
        }
        total++;
      });
    }
    expect(total).toBeGreaterThan(500);
    // Varied: most templates show up somewhere.
    expect(ids.size).toBeGreaterThanOrEqual(HOOK_TEMPLATES.vocabIntro.length + HOOK_TEMPLATES.vocabOutro.length - 3);
    expect(voices).toEqual(new Set(["en", "ja"]));
  });

  it("a re-take says the same lines", () => {
    const lesson = lessons[0]!;
    expect(chain(lesson, vocabHook)).toEqual(chain(lesson, vocabHook));
  });

  it("reading traps and sound-alike twins get their own hooks", () => {
    const hooks = lessons.flatMap((l) => chain(l, vocabHook));
    expect(hooks.some((h) => h.intro.id === "v-trap")).toBe(true);
    const twin = hooks.find((h) => h.outro.id === "v-o-twin");
    expect(twin?.outro.choices).toHaveLength(2);
  });

  it("comment prompts are rare (at most every 4th word, plus the last)", () => {
    for (const lesson of lessons) {
      const comments = chain(lesson, vocabHook).filter((h) => /comments/i.test(h.outro.en)).length;
      expect(comments).toBeLessThanOrEqual(Math.floor(lesson.length / 4) + 1);
    }
  });
});

describe("grammar hooks", () => {
  it("every grammar item: speakable, varied, never twice in a row", () => {
    const hooks = chain(grammar, grammarHook);
    hooks.forEach((h, i) => {
      expectSpeakable(h.intro, `grammar ${i}`);
      expectSpeakable(h.outro, `grammar ${i}`);
      if (i > 0) expect(h.intro.id).not.toBe(hooks[i - 1]!.intro.id);
    });
    const ids = new Set(hooks.flatMap((h) => [h.intro.id, h.outro.id]));
    expect(ids.size).toBeGreaterThanOrEqual(HOOK_TEMPLATES.grammarIntro.length + HOOK_TEMPLATES.grammarOutro.length - 2);
  });

  it("never names the generic 'Grammar' category as a theme", () => {
    for (const h of chain(grammar, grammarHook)) {
      expect(h.intro.en).not.toMatch(/pattern for grammar/i);
    }
  });
});

describe("quiz hooks", () => {
  const vocabQuiz = buildVocabularyQuizQuestions(lessons[3]!, "quiz-test");
  const grammarQuiz = buildGrammarQuizQuestions(grammar.slice(0, 10), "quiz-grammar-test");

  it("first, halfway and last questions get their own lines; tags count questions", () => {
    const hooks = chain(vocabQuiz, quizHook);
    expect(hooks[0]!.intro.id).toBe("q-first");
    expect(hooks.at(-1)!.intro.id).toBe("q-last");
    expect(hooks.at(-1)!.outro.en).toMatch(/comments/);
    if (vocabQuiz.length >= 6) expect(hooks[Math.floor(vocabQuiz.length / 2)]!.intro.id).toBe("q-half");
    expect(hooks[2]!.intro.tag).toBe(`Question 3 / ${vocabQuiz.length}`);
  });

  it("vocabulary and grammar quizzes: speakable, no repeats in a row, no 'reading trap' on grammar", () => {
    for (const quiz of [vocabQuiz, grammarQuiz]) {
      const hooks = chain(quiz, quizHook);
      hooks.forEach((h, i) => {
        expectSpeakable(h.intro, `quiz ${i}`);
        expectSpeakable(h.outro, `quiz ${i}`);
        if (i > 0) expect(h.outro.id).not.toBe(hooks[i - 1]!.outro.id);
      });
    }
    expect(chain(grammarQuiz, quizHook).some((h) => h.intro.id === "q-trap")).toBe(false);
  });
});
