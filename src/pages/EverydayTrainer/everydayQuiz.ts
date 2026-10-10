/**
 * Question builders for Everyday Japanese (pure, seeded, testable).
 *
 *   picture  — picture → pick the Japanese word (Picture Quiz)
 *   listen   — Japanese audio → pick the picture (Listen & Identify)
 *   meaning  — English → pick the Japanese word (Quick Review, for words
 *              that have no picture yet)
 *
 * Distractors come from the same location first, so they are plausible
 * (a 改札口 question offers 券売機 and ホーム, not おでん). Words that could
 * honestly also be right — a hypernym (遊具 for a swing), a near-synonym
 * (時計 for an alarm clock) or the same sound (排水口 / 排水溝) — never share
 * a question.
 */

import { hasPicture, plainJapanese, plainReading, wordById, EVERYDAY_WORDS } from "./everydayData";
import type { EverydayWord } from "./types";

export type QuestionKind = "picture" | "listen" | "meaning";

export interface QuizQuestion {
  kind: QuestionKind;
  target: EverydayWord;
  /** Four options (fewer only if the pool is tiny), target included. */
  options: EverydayWord[];
  answerIndex: number;
}

export const OPTION_COUNT = 4;

/** Every pair inside a group overlaps in meaning or picture. */
const OVERLAP_GROUPS: readonly (readonly string[])[] = [
  ["clock", "alarm-clock"],
  ["futon", "futon-mattress", "comforter", "mattress"],
  ["curtain", "blackout-curtain"],
  ["toilet", "toilet-bowl", "bidet-seat", "accessible-toilet"],
  ["room-light", "light-bulb", "desk-lamp"],
  ["chopsticks", "disposable-chopsticks", "cooking-chopsticks"],
  ["receipt", "official-receipt", "bill-slip"],
  ["ticket", "commuter-pass", "ic-card", "boarding-pass"],
  ["hand-luggage", "checked-baggage", "suitcase"],
  ["platform", "platform-door", "yellow-line"],
  ["fridge", "freezer"],
  ["key", "spare-key"],
  ["kotatsu", "coffee-table"],
  ["bath-drain", "drainage-channel", "sink", "washbasin", "wash-bowl"],
  ["seat", "priority-seat", "counter-seat", "chair", "legless-chair", "bench", "zabuton"],
  ["mailbox", "postbox", "parcel-locker"],
  ["exit", "emergency-exit"],
  ["entrance", "genkan"],
  ["locker", "coin-locker", "parcel-locker", "shoe-cabinet"],
  ["ticket-machine", "meal-ticket-machine", "fare-adjustment", "checkin-kiosk", "vending-machine"],
  ["copy-machine", "printer"],
  ["intercom", "nurse-call", "call-button", "emergency-button", "auto-lock"],
  ["telephone", "extension"],
  ["notice-board", "whiteboard", "blackboard", "departure-board", "floor-guide", "route-map", "timetable"],
  ["window", "insect-screen", "storm-shutter", "shoji", "door", "fusuma"],
  ["tatami", "floor", "carpet", "floor-heating"],
  ["towel", "oshibori"],
  ["crosswalk", "intersection", "roadway", "sidewalk", "tactile-paving"],
  ["utility-pole", "power-line"],
  ["manhole", "fire-hydrant", "drainage-channel"],
  ["hanger", "laundry-pole", "closet"],
  ["curve-mirror", "mirror"],
  ["traffic-cone", "under-construction", "no-entry"],
  ["medicine", "prescription", "pharmacy"],
  ["injection", "iv-drip"],
  ["newspaper", "magazine-rack"],
  ["bento", "set-meal", "school-lunch"],
  ["sanitizer", "soap"],
  ["file-folder", "documents"],
  ["notebook", "textbook"],
  ["paper-bag", "plastic-bag", "eco-bag"],
  ["teacup", "rice-bowl"],
  ["oden", "meat-bun", "hot-snacks"],
  ["airplane", "in-flight", "runway"],
  ["immigration", "passport"],
  ["fountain", "drinking-fountain"],
  ["half-price", "discount-sticker", "special-sale", "sale"],
  ["register", "self-checkout", "payment"],
  ["information-desk", "reception"],
  ["checkin-counter", "checkin-kiosk"],
];

/** A general word and the specific things it also names. */
const HYPERNYMS: Readonly<Record<string, readonly string[]>> = {
  "playground-equipment": ["swing", "slide", "seesaw", "iron-bar", "jungle-gym", "sandbox"],
  "train-car": ["women-only-car", "mild-ac-car", "packed-train", "rapid-train", "local-train", "express"],
  "sales-floor": ["meat-section", "fish-section", "vegetable-section", "magazine-rack"],
};

const OVERLAPS = new Set<string>();
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
for (const group of OVERLAP_GROUPS) {
  for (const a of group) for (const b of group) if (a !== b) OVERLAPS.add(pairKey(a, b));
}
for (const [general, specifics] of Object.entries(HYPERNYMS)) {
  for (const s of specifics) OVERLAPS.add(pairKey(general, s));
}

/** Every word id named above — the corpus test checks they all exist. */
export const OVERLAP_IDS: readonly string[] = [
  ...new Set([...OVERLAP_GROUPS.flat(), ...Object.keys(HYPERNYMS), ...Object.values(HYPERNYMS).flat()]),
];

/** True when a and b must not appear in the same question. */
export function overlaps(a: EverydayWord, b: EverydayWord): boolean {
  if (a.id === b.id) return true;
  if (plainReading(a) === plainReading(b)) return true; // same sound: 排水口 / 排水溝
  if (plainJapanese(a) === plainJapanese(b)) return true;
  if (a.english.toLowerCase() === b.english.toLowerCase()) return true;
  return OVERLAPS.has(pairKey(a.id, b.id));
}

/* ---- seeded randomness, so a quiz can be rebuilt and tested ---- */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string): () => number {
  let a = hash(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/* ---- builders ---- */

/** The target plus up to three distractors, nearest location first. */
export function buildQuestion(
  kind: QuestionKind,
  target: EverydayWord,
  rand: () => number,
  pool: readonly EverydayWord[] = EVERYDAY_WORDS,
): QuizQuestion | null {
  if ((kind === "picture" || kind === "listen") && !hasPicture(target)) return null;

  const tiers: EverydayWord[][] = [[], [], []];
  for (const w of pool) {
    if (kind === "listen" && !hasPicture(w)) continue;
    if (overlaps(w, target)) continue;
    const sameHome = w.categoryIds[0] === target.categoryIds[0];
    const shared = w.categoryIds.some((c) => target.categoryIds.includes(c));
    tiers[sameHome ? 0 : shared ? 1 : 2]!.push(w);
  }

  const chosen: EverydayWord[] = [];
  for (const tier of tiers) {
    for (const w of shuffle(tier, rand)) {
      if (chosen.length === OPTION_COUNT - 1) break;
      if (chosen.some((c) => overlaps(c, w))) continue;
      chosen.push(w);
    }
  }
  if (chosen.length === 0) return null;

  const options = shuffle([target, ...chosen], rand);
  return { kind, target, options, answerIndex: options.indexOf(target) };
}

/** A round of `count` questions over `targets` (shuffled, no repeats). */
export function buildQuiz(
  kind: QuestionKind,
  targets: readonly EverydayWord[],
  count: number,
  seed: string,
): QuizQuestion[] {
  const rand = seededRandom(seed);
  const eligible = kind === "meaning" ? targets : targets.filter(hasPicture);
  const out: QuizQuestion[] = [];
  for (const w of shuffle(eligible, rand)) {
    if (out.length === count) break;
    const q = buildQuestion(kind, w, rand);
    if (q) out.push(q);
  }
  return out;
}

/**
 * Quick Review: words the learner has already met, in priority order
 * (see reviewCandidates). Pictured words alternate between picture and
 * listening questions; words without a picture are asked by meaning.
 */
export function buildReviewQuiz(ids: readonly string[], count: number, seed: string): QuizQuestion[] {
  const rand = seededRandom(seed);
  const out: QuizQuestion[] = [];
  let pictureTurn = 0;
  for (const id of ids) {
    if (out.length === count) break;
    const word = wordById(id);
    if (!word) continue;
    const kind: QuestionKind = hasPicture(word) ? (pictureTurn++ % 2 === 0 ? "picture" : "listen") : "meaning";
    const q = buildQuestion(kind, word, rand);
    if (q) out.push(q);
  }
  return shuffle(out, rand);
}
