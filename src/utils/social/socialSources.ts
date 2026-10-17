import type { TocItem, TocItemId, TocItemKind } from "../../data/toc";
import { findTocItemByLessonId, getTocItem, tocGroups } from "../../data/toc";
import { getLessonById } from "../../data/lessons";
import { getPlaylistWordRange, parsePlaylistLessonId, playlistLessons } from "../../data/playlists";
import { getVocabularyById, getVocabularyByIds } from "../../data/vocabulary";
import {
  getGrammarById,
  getGrammarItemsForLesson,
  getGrammarLessonById,
  grammarLessons,
} from "../../data/grammar";
import { n3GrammarLessons } from "../../data/n3/grammarN3";
import { formatGrammarCategorySuffix, grammarBatchRangeLabel } from "../../data/tocGrammarItems";
import {
  getRegisterPairById,
  getRegisterPairsForSection,
  getRegisterSectionById,
  registerSections,
} from "../../data/registerPairs";
import { getVocabularyLessonIdForQuiz } from "../quizVocabLesson";
import { getGrammarLessonIdForQuiz } from "../quizGrammarLesson";
import { getWordLevel } from "../wordLevel";
import { buildShortMeta } from "../../pages/Shorts/shortsMeta";
import type { HookStyle } from "../../pages/Shorts/shortMessage";
import type { GrammarLesson, Lesson } from "../../types/lesson";
import type { JlptLevel } from "../../types/level";
import type { VocabularyItem } from "../../types/vocabulary";
import {
  buildGrammarItemSocialMeta,
  buildGrammarLessonSocialMeta,
  buildQuizSocialMeta,
  buildRegisterPairSocialMeta,
  buildRegisterSectionSocialMeta,
  buildVocabularyItemSocialMeta,
  buildVocabularyLessonSocialMeta,
  grammarLessonName,
  type SocialMeta,
} from "./socialMeta";

/**
 * Where a post comes from: a TOC entry, or one word / pattern inside it.
 * New content types plug in as another TOC adapter below.
 */
export type SocialTarget =
  | { type: "toc"; id: TocItemId }
  | { type: "vocabulary-item"; id: number; parentTocId?: TocItemId }
  | { type: "grammar-item"; id: number; parentTocId?: TocItemId }
  /** One casual ⇄ formal pair. */
  | { type: "register-pair"; id: number; parentTocId?: TocItemId }
  /** One Shorts-studio Short: the word's post with the Short's own upload text. */
  | { type: "short"; id: number; strokeCredit?: boolean; hookStyle?: HookStyle };

/* ── Vocabulary context (level playlists number every word) ──────── */

interface PlaylistPlace {
  level: JlptLevel;
  lesson: Lesson;
  lessonNumber: number;
  wordNumber: number;
}

let placeByWord: Map<number, PlaylistPlace> | null = null;

function playlistPlace(id: number): PlaylistPlace | undefined {
  if (!placeByWord) {
    placeByWord = new Map();
    for (const lesson of playlistLessons) {
      const parsed = parsePlaylistLessonId(lesson.id);
      const range = getPlaylistWordRange(lesson.id);
      if (!parsed || !range) continue;
      lesson.vocabularyIds.forEach((wordId, i) => {
        if (!placeByWord!.has(wordId)) {
          placeByWord!.set(wordId, {
            level: parsed.level,
            lesson,
            lessonNumber: range.lessonNumber,
            wordNumber: range.firstWordNumber + i,
          });
        }
      });
    }
  }
  return placeByWord.get(id);
}

function vocabularyItemMeta(item: VocabularyItem): SocialMeta {
  const place = playlistPlace(item.id);
  if (place) {
    return buildVocabularyItemSocialMeta(item, {
      level: place.level,
      wordNumber: place.wordNumber,
      lessonNumber: place.lessonNumber,
      lessonTheme: place.lesson.subtitle,
    });
  }
  return buildVocabularyItemSocialMeta(item, { level: getWordLevel(item.id) ?? item.jlpt });
}

function shortMeta(item: VocabularyItem, strokeCredit: boolean, hookStyle?: HookStyle): SocialMeta {
  const base = vocabularyItemMeta(item);
  const place = playlistPlace(item.id);
  if (!place) return { ...base, contentId: `short-${item.id}` };
  const short = buildShortMeta(
    item,
    {
      level: place.level,
      wordNumber: place.wordNumber,
      lessonNumber: place.lessonNumber,
      lessonTheme: place.lesson.subtitle,
    },
    { strokeCredit, hookStyle }
  );
  return {
    ...base,
    contentId: `short-${item.id}`,
    heading: `Short · JLPT ${place.level} word #${place.wordNumber}`,
    badge: `Hook: ${short.hookLabel}`,
    pinnedComment: short.pinnedComment,
    shortsPost: { title: short.title, body: short.description, hashtags: short.hashtags },
  };
}

function vocabularyLessonMeta(lesson: Lesson): SocialMeta | null {
  const items = getVocabularyByIds(lesson.vocabularyIds);
  if (items.length === 0) return null;
  const parsed = parsePlaylistLessonId(lesson.id);
  const range = getPlaylistWordRange(lesson.id);
  const level = parsed?.level ?? getWordLevel(items[0]!.id) ?? items[0]!.jlpt;
  return buildVocabularyLessonSocialMeta(lesson, items, {
    level,
    lessonNumber: range?.lessonNumber,
    firstWordNumber: range?.firstWordNumber,
    lastWordNumber: range?.lastWordNumber,
  });
}

/* ── Grammar context ─────────────────────────────────────────────── */

function grammarLessonLevel(lesson: GrammarLesson): JlptLevel {
  if (lesson.id.startsWith("n1-")) return "N1";
  if (lesson.id.startsWith("n3-")) return "N3";
  return "N2";
}

function grammarLessonParts(lesson: GrammarLesson) {
  const items = getGrammarItemsForLesson(lesson);
  const level = grammarLessonLevel(lesson);
  const rangeLabel = grammarBatchRangeLabel(lesson.id) || undefined;
  const themes = lesson.id.startsWith("n3-")
    ? lesson.subtitle
    : formatGrammarCategorySuffix(items.map((g) => g.subcategory)) || undefined;
  return { items, level, rangeLabel, themes };
}

function grammarLessonMeta(lesson: GrammarLesson): SocialMeta | null {
  const { items, level, rangeLabel, themes } = grammarLessonParts(lesson);
  if (items.length === 0) return null;
  return buildGrammarLessonSocialMeta(lesson, items, { level, rangeLabel, themes });
}

/** The lesson that teaches this pattern on its own track, preferring one in the TOC. */
function grammarLessonOf(id: number): GrammarLesson | undefined {
  const candidates = [...grammarLessons, ...n3GrammarLessons].filter(
    (lesson) => lesson.grammarIds.includes(id) && getGrammarItemsForLesson(lesson).some((g) => g.id === id)
  );
  return candidates.find((lesson) => findTocItemByLessonId(lesson.id)) ?? candidates[0];
}

function grammarItemMeta(id: number): SocialMeta | null {
  const item = getGrammarById(id);
  if (!item) return null;
  const lesson = grammarLessonOf(id);
  if (!lesson) return buildGrammarItemSocialMeta(item);
  const { level, rangeLabel, themes } = grammarLessonParts(lesson);
  return buildGrammarItemSocialMeta(item, {
    level,
    lessonLabel: grammarLessonName(level, { rangeLabel, themes }),
  });
}

/* ── Quizzes ─────────────────────────────────────────────────────── */

const REVIEW_QUIZZES: Record<string, string> = {
  "quiz-mixed": "Vocabulary Mixed Quiz",
  "quiz-final": "Vocabulary Final Review Quiz",
};

function quizMeta(quizId: string): SocialMeta | null {
  const vocabLessonId = getVocabularyLessonIdForQuiz(quizId);
  const vocabLesson = vocabLessonId ? getLessonById(vocabLessonId) : undefined;
  if (vocabLesson) {
    const lessonMeta = vocabularyLessonMeta(vocabLesson);
    if (!lessonMeta?.level) return null;
    const items = getVocabularyByIds(vocabLesson.vocabularyIds);
    const number = getPlaylistWordRange(vocabLesson.id)?.lessonNumber;
    return buildQuizSocialMeta({
      subject: "vocabulary",
      quizId,
      level: lessonMeta.level,
      lesson: { name: lessonMeta.title, theme: vocabLesson.subtitle, number },
      items,
    });
  }

  const grammarLessonId = getGrammarLessonIdForQuiz(quizId);
  const grammarLesson = grammarLessonId ? getGrammarLessonById(grammarLessonId) : undefined;
  if (grammarLesson) {
    const { items, level, rangeLabel, themes } = grammarLessonParts(grammarLesson);
    if (items.length === 0) return null;
    return buildQuizSocialMeta({
      subject: "grammar",
      quizId,
      level,
      lesson: { name: grammarLessonName(level, { rangeLabel, themes }), theme: themes ?? "", rangeLabel },
      items,
    });
  }

  const review = REVIEW_QUIZZES[quizId];
  if (review) {
    return buildQuizSocialMeta({ subject: "vocabulary", quizId, level: "N2", lesson: null, items: [], label: review });
  }
  return null;
}

/* ── Casual ⇄ formal ─────────────────────────────────────────────── */

function registerSectionMeta(sectionId: string): SocialMeta | null {
  const section = getRegisterSectionById(sectionId);
  const pairs = getRegisterPairsForSection(sectionId);
  if (!section || pairs.length === 0) return null;
  return buildRegisterSectionSocialMeta(section, pairs, { number: registerSections.indexOf(section) + 1 });
}

function registerSectionOf(pairId: number) {
  return registerSections.find((s) => s.pairIds.includes(pairId));
}

function registerPairMeta(id: number): SocialMeta | null {
  const pair = getRegisterPairById(id);
  if (!pair) return null;
  const section = registerSectionOf(id);
  return buildRegisterPairSocialMeta(
    pair,
    section,
    section ? { number: registerSections.indexOf(section) + 1 } : undefined
  );
}

function registerTocId(pairId: number): TocItemId | null {
  const section = registerSectionOf(pairId);
  if (!section) return null;
  return (
    tocGroups
      .flatMap((g) => g.items)
      .find((i) => i.kind === "register" && i.registerSectionId === section.id)?.id ?? null
  );
}

/* ── TOC adapters ────────────────────────────────────────────────── */

type TocAdapter = (item: TocItem) => SocialMeta | null;

const TOC_ADAPTERS: Partial<Record<TocItemKind, TocAdapter>> = {
  word: (item) => {
    const lesson = item.lessonId ? getLessonById(item.lessonId) : undefined;
    return lesson ? vocabularyLessonMeta(lesson) : null;
  },
  grammar: (item) => {
    const lesson = item.lessonId ? getGrammarLessonById(item.lessonId) : undefined;
    return lesson ? grammarLessonMeta(lesson) : null;
  },
  quiz: (item) => quizMeta(item.quizId ?? item.id),
  register: (item) => (item.registerSectionId ? registerSectionMeta(item.registerSectionId) : null),
};

const hasSocialCache = new Map<TocItemId, boolean>();

/** TOC kinds with a social post (others get one when an adapter is added). */
export function tocItemHasSocial(item: TocItem): boolean {
  if (!TOC_ADAPTERS[item.kind]) return false;
  let has = hasSocialCache.get(item.id);
  if (has === undefined) {
    has = buildSocialMetaForTocItem(item) !== null;
    hasSocialCache.set(item.id, has);
  }
  return has;
}

export function buildSocialMetaForTocItem(item: TocItem): SocialMeta | null {
  const meta = TOC_ADAPTERS[item.kind]?.(item) ?? null;
  return meta ? { ...meta, contentId: `toc-${item.id}` } : null;
}

export function buildSocialMetaForTarget(target: SocialTarget): SocialMeta | null {
  switch (target.type) {
    case "toc": {
      const item = getTocItem(target.id);
      return item ? buildSocialMetaForTocItem(item) : null;
    }
    case "vocabulary-item": {
      const item = getVocabularyById(target.id);
      return item ? vocabularyItemMeta(item) : null;
    }
    case "grammar-item":
      return grammarItemMeta(target.id);
    case "register-pair":
      return registerPairMeta(target.id);
    case "short": {
      const item = getVocabularyById(target.id);
      return item ? shortMeta(item, Boolean(target.strokeCredit), target.hookStyle) : null;
    }
  }
}

/** The lesson a single word / pattern belongs to, for "back to lesson". */
export function parentTocIdFor(target: SocialTarget): TocItemId | null {
  if (target.type === "toc" || target.type === "short") return null;
  if (target.parentTocId) return target.parentTocId;
  if (target.type === "register-pair") return registerTocId(target.id);
  if (target.type === "vocabulary-item") {
    const place = playlistPlace(target.id);
    return place ? findTocItemByLessonId(place.lesson.id)?.id ?? null : null;
  }
  const lesson = grammarLessonOf(target.id);
  return lesson ? findTocItemByLessonId(lesson.id)?.id ?? null : null;
}
