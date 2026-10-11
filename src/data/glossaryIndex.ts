import type { GrammarItem } from "../types/grammar";
import type { JlptLevel } from "../types/level";
import type { VocabularyItem } from "../types/vocabulary";
import type { WordRelation } from "../types/wordRelation";
import { grammar, getGrammarById, getGrammarItemsForLesson, getGrammarLessonById } from "./grammar";
import { grammarN3 } from "./n3/grammarN3";
import { playlistLessons, parsePlaylistLessonId } from "./playlists";
import { tocGroups } from "./toc";
import { getVocabularyByIds } from "./vocabulary";
import { wordRelations } from "./wordRelations";

/**
 * Everything the Content Glossary lists, N5 → N1.
 *
 * Words come from the level playlists (every vocabulary word sits in exactly
 * one), so each row opens the Player slide of its own playlist lesson.
 * Grammar comes from every grammar corpus; each pattern is filed under the
 * Table-of-Contents lesson that teaches it. A pattern that is a variant of a
 * taught family opens its family's slide; patterns with no lesson yet are
 * still listed, just not tappable.
 */

export const GLOSSARY_LEVELS: readonly JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export type GlossaryWordGroup = {
  level: JlptLevel;
  lessonId: string;
  title: string;
  items: VocabularyItem[];
};

export type GlossaryGrammarRow = {
  item: GrammarItem;
  /** Lesson to open in the Player, or null when no lesson teaches it yet. */
  lessonId: string | null;
  /** The slide shown is the family's main pattern, not this variant. */
  viaFamily: boolean;
  /** Grammar id of the slide to open (this pattern, or its family's main one). */
  openId: number;
};

export type GlossaryGrammarGroup = {
  level: JlptLevel;
  /** Lesson id, or "unassigned-<level>" for patterns without a lesson. */
  id: string;
  title: string;
  rows: GlossaryGrammarRow[];
};

export function buildWordGroups(): GlossaryWordGroup[] {
  return playlistLessons.flatMap((lesson) => {
    const level = parsePlaylistLessonId(lesson.id)?.level;
    if (!level) return [];
    return [{ level, lessonId: lesson.id, title: lesson.title, items: getVocabularyByIds(lesson.vocabularyIds) }];
  });
}

function allGrammar(): GrammarItem[] {
  const seen = new Set<number>();
  return [...grammar, ...grammarN3].filter((g) => !seen.has(g.id) && seen.add(g.id));
}

const NUMBERED_LEVEL: Readonly<Record<GrammarItem["jlpt"], JlptLevel>> = { N3: "N3", N2: "N2", N1: "N1" };

export function buildGrammarGroups(): GlossaryGrammarGroup[] {
  const groups: GlossaryGrammarGroup[] = [];
  const lessonOf = new Map<number, string>();

  for (const group of tocGroups) {
    for (const entry of group.items) {
      if (entry.kind !== "grammar" || !entry.lessonId) continue;
      const lesson = getGrammarLessonById(entry.lessonId);
      if (!lesson) continue;
      const items = getGrammarItemsForLesson(lesson);
      if (items.length === 0) continue;
      const level = NUMBERED_LEVEL[items[0]!.jlpt];
      const rows: GlossaryGrammarRow[] = [];
      for (const item of items) {
        if (lessonOf.has(item.id)) continue;
        lessonOf.set(item.id, entry.lessonId);
        rows.push({ item, lessonId: entry.lessonId, viaFamily: false, openId: item.id });
      }
      groups.push({ level, id: entry.lessonId, title: entry.label, rows });
    }
  }

  // Variants of a taught family open that family's slide; the rest are unassigned.
  const byGroup = new Map(groups.map((g) => [g.id, g]));
  const familyLesson = new Map<string, { lessonId: string; openId: number }>();
  for (const [id, lessonId] of lessonOf) {
    const item = getGrammarById(id);
    if (item && !familyLesson.has(item.familyId)) familyLesson.set(item.familyId, { lessonId, openId: id });
  }
  const unassigned = new Map<JlptLevel, GlossaryGrammarGroup>();
  for (const item of allGrammar()) {
    if (lessonOf.has(item.id)) continue;
    const level = NUMBERED_LEVEL[item.jlpt];
    const family = familyLesson.get(item.familyId);
    const home = family ? byGroup.get(family.lessonId) : undefined;
    if (home && family) {
      home.rows.push({ item, lessonId: family.lessonId, viaFamily: true, openId: family.openId });
      continue;
    }
    let bucket = unassigned.get(level);
    if (!bucket) {
      bucket = { level, id: `unassigned-${level}`, title: `${level} · More patterns (no lesson yet)`, rows: [] };
      unassigned.set(level, bucket);
    }
    bucket.rows.push({ item, lessonId: null, viaFamily: false, openId: item.id });
  }
  return [...groups, ...unassigned.values()];
}

export type GlossaryRelation = WordRelation;

/** Synonym / antonym pairs by level. Kept separate from the word and grammar counts. */
export function buildRelations(): readonly GlossaryRelation[] {
  return wordRelations;
}
