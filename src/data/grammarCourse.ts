/**
 * Curated JLPT grammar course layer: families, normalization, and selectors.
 * Raw inventory stays in grammar.ts; this module is the teaching/quiz view.
 */
import type {
  GrammarCourseLevel,
  GrammarFamily,
  GrammarItem,
} from "../types/grammar";
import type { GrammarLesson } from "../types/lesson";
import { grammar, grammarLessons, getGrammarByIds } from "./grammar";

const KANJI_ALIASES: Array<[string, string]> = [
  ["挙句", "あげく"],
  ["挙げ句", "あげく"],
  ["過ぎない", "すぎない"],
  ["関わらず", "かかわらず"],
  ["当たって", "あたって"],
  ["基づ", "もとづ"],
  ["応じて", "おうじて"],
  ["応えて", "こたえて"],
  ["伴って", "ともなって"],
  ["従って", "したがって"],
  ["対して", "たいして"],
  ["関して", "かんして"],
  ["比べ", "くらべ"],
  ["限り", "かぎり"],
  ["限って", "かぎって"],
  ["限る", "かぎる"],
  ["限らず", "かぎらず"],
  ["他ない", "ほかない"],
  ["他なら", "ほかなら"],
  ["相違ない", "そういない"],
  ["違いない", "ちがいない"],
  ["決まって", "きまって"],
  ["等しい", "ひとしい"],
  ["恐れ", "おそれ"],
  ["得ない", "えない"],
  ["得る", "える"],
  ["済む", "すむ"],
  ["済まない", "すまない"],
  ["契機", "けいき"],
];

/** Normalize pattern text for alias / duplicate comparison. */
export function normalizeGrammarPattern(pattern: string): string {
  let p = pattern.replace(/〜/g, "～").replace(/~/g, "～").replace(/／/g, "/");
  p = p.replace(/\s+/g, "").replace(/^～+/, "");
  for (const [from, to] of KANJI_ALIASES) {
    p = p.split(from).join(to);
  }
  return p;
}

function buildFamilies(): GrammarFamily[] {
  const byFamily = new Map<string, GrammarItem[]>();
  for (const item of grammar) {
    const list = byFamily.get(item.familyId) ?? [];
    list.push(item);
    byFamily.set(item.familyId, list);
  }

  const families: GrammarFamily[] = [];
  for (const [id, members] of byFamily) {
    const sorted = [...members].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.id - b.id;
    });
    const primary = sorted.find((m) => m.isPrimary) ?? sorted[0]!;
    families.push({
      id,
      title: primary.pattern,
      courseLevel: primary.courseLevel,
      primaryId: primary.id,
      memberIds: sorted.map((m) => m.id),
    });
  }
  return families;
}

const FAMILY_CACHE = buildFamilies();

export function getAllGrammarFamilies(): GrammarFamily[] {
  return FAMILY_CACHE;
}

export function getGrammarFamiliesByCourseLevel(
  level: GrammarCourseLevel
): GrammarFamily[] {
  return FAMILY_CACHE.filter((f) => f.courseLevel === level);
}

export function getN2CoreGrammarFamilies(): GrammarFamily[] {
  return getGrammarFamiliesByCourseLevel("N2_CORE");
}

export function getN2SecondaryGrammarFamilies(): GrammarFamily[] {
  return getGrammarFamiliesByCourseLevel("N2_SECONDARY");
}

export function getN3PrerequisiteFamilies(): GrammarFamily[] {
  return getGrammarFamiliesByCourseLevel("N3_REVIEW");
}

export function getN1GrammarFamilies(): GrammarFamily[] {
  return getGrammarFamiliesByCourseLevel("N1");
}

export function getGrammarFamilyById(
  familyId: string
): GrammarFamily | undefined {
  return FAMILY_CACHE.find((f) => f.id === familyId);
}

export function getGrammarItemsByFamily(familyId: string): GrammarItem[] {
  const family = getGrammarFamilyById(familyId);
  if (!family) return [];
  return getGrammarByIds(family.memberIds);
}

/** Individual patterns eligible for quizzes at a course level. */
export function getGrammarQuizPool(
  courseLevel: GrammarCourseLevel | "N2"
): GrammarItem[] {
  if (courseLevel === "N2") {
    return grammar.filter(
      (g) => g.courseLevel === "N2_CORE" || g.courseLevel === "N2_SECONDARY"
    );
  }
  return grammar.filter((g) => g.courseLevel === courseLevel);
}

export function getN2CourseLessons(): GrammarLesson[] {
  return grammarLessons.filter(
    (l) =>
      l.id.startsWith("grammar-lesson-") &&
      !l.id.startsWith("n1-") &&
      !l.id.startsWith("n3-")
  );
}

export function getGrammarCourseReport(): {
  rawN2: number;
  rawN1: number;
  rawN3: number;
  coreFamilies: number;
  secondaryFamilies: number;
  totalN2Families: number;
  n3Families: number;
  n1Families: number;
  unassigned: number;
  duplicateNormalizedPatterns: string[];
} {
  const rawN2 = grammar.filter((g) => g.jlpt === "N2").length;
  const rawN1 = grammar.filter((g) => g.jlpt === "N1").length;
  const rawN3 = grammar.filter((g) => g.jlpt === "N3").length;
  const coreFamilies = getN2CoreGrammarFamilies().length;
  const secondaryFamilies = getN2SecondaryGrammarFamilies().length;
  const n3Families = getN3PrerequisiteFamilies().length;
  const n1Families = getN1GrammarFamilies().length;
  const unassigned = grammar.filter((g) => !g.familyId).length;

  const seen = new Map<string, string[]>();
  for (const g of grammar) {
    if (g.jlpt !== "N2") continue;
    const key = normalizeGrammarPattern(g.pattern);
    const list = seen.get(key) ?? [];
    list.push(g.pattern);
    seen.set(key, list);
  }
  const duplicateNormalizedPatterns = [...seen.entries()]
    .filter(([, pats]) => pats.length > 1)
    .map(([key, pats]) => `${key} ← ${pats.join(" | ")}`);

  return {
    rawN2,
    rawN1,
    rawN3,
    coreFamilies,
    secondaryFamilies,
    totalN2Families: coreFamilies + secondaryFamilies,
    n3Families,
    n1Families,
    unassigned,
    duplicateNormalizedPatterns,
  };
}
