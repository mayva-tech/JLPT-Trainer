import type { VocabularyItem } from "../../types/vocabulary";
import type { JlptLevel } from "../../types/level";
import { wordRelations } from "../../data/wordRelations";
import { kanaToRomaji } from "../../lib/japanese/romaji";
import { getWordLevel, isWordLevelAssumed } from "../../utils/wordLevel";

/**
 * Outro variety for Shorts: the comment challenge, the follow line and the
 * "Next" label change from word to word, so a viewer binge-watching a
 * playlist never hears the same ending twice in a row.
 *
 * Every challenge is built from the word's own data (type, meaning, example,
 * synonym / antonym pairs, JLPT level), and is only offered when it fits —
 * a past-tense challenge only for verbs, "the opposite of…" only when the
 * app knows the opposite. The pick is stable per word id, so a re-take
 * matches its upload text, and neighbouring ids land on different
 * challenges.
 *
 * Display text may use 「word」 (the outro puts the word on its own line).
 * Spoken text is for Andrew's English voice: no emoji, no Japanese.
 */

export interface OutroChallenge {
  /** Short id for analytics ("emoji", "opposite", …). */
  id: string;
  /** Shown big in the outro and used in the description. */
  bait: string;
  /** Said by Andrew. */
  baitSpoken: string;
  pinnedComment: string;
}

/** Word data a challenge can draw on. */
interface Ctx {
  item: VocabularyItem;
  w: string;
  sense: string;
  level: JlptLevel | undefined;
  kind: "verb" | "i-adj" | "na-adj" | "noun" | "adverb" | "other";
  hasKanji: boolean;
  kanaOnly: boolean;
  antonym: { japanese: string; reading: string } | null;
  synonym: { japanese: string; reading: string } | null;
  feeling: boolean;
}

type Builder = (c: Ctx) => OutroChallenge | null | false | undefined;

const KANJI_RE = /[一-龯々]/;
const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;

/** First sense, without "to " for verbs: "to eat; to have" → "eat". */
function firstSense(meaning: string): string {
  const first = meaning.split(/[;；,]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*/g, " ").trim() || meaning.trim();
}

function wordKind(type: string | undefined): Ctx["kind"] {
  const t = (type ?? "").toLowerCase();
  if (t.startsWith("verb")) return "verb";
  if (t.includes("i-adjective")) return "i-adj";
  if (t.includes("na-adjective")) return "na-adj";
  if (t.startsWith("adverb")) return "adverb";
  if (t.startsWith("noun") || t.startsWith("pronoun")) return "noun";
  return "other";
}

const FEELING_RE =
  /\b(happy|glad|sad|lonely|angry|scared|afraid|nervous|tired|bored|boring|surprised|worried|relieved|embarrass|fun|enjoy|regret|jealous|excited|disappoint|frustrat|proud|moved|grateful|thankful|anxious|uneasy)/i;

let relationIndex: Map<string, { syn?: Ctx["synonym"]; ant?: Ctx["antonym"] }> | null = null;

function relationsFor(word: string) {
  if (!relationIndex) {
    relationIndex = new Map();
    const add = (a: string, b: { japanese: string; reading: string }, type: "synonym" | "antonym") => {
      const entry = relationIndex!.get(a) ?? {};
      if (type === "synonym" && !entry.syn) entry.syn = b;
      if (type === "antonym" && !entry.ant) entry.ant = b;
      relationIndex!.set(a, entry);
    };
    for (const r of wordRelations) {
      add(r.word1.japanese, r.word2, r.type);
      add(r.word2.japanese, r.word1, r.type);
    }
  }
  return relationIndex.get(word) ?? {};
}

function context(item: VocabularyItem): Ctx {
  const sense = firstSense(item.meaning);
  const rel = relationsFor(item.word);
  return {
    item,
    w: item.word,
    sense,
    // Only list-confirmed levels: an assumed level would give a wrong answer.
    level: isWordLevelAssumed(item.id) ? undefined : getWordLevel(item.id),
    kind: wordKind(item.wordType),
    hasKanji: KANJI_RE.test(item.word),
    kanaOnly: KANA_ONLY.test(item.word),
    antonym: rel.ant ?? null,
    synonym: rel.syn ?? null,
    feeling: FEELING_RE.test(sense),
  };
}

/** First kana of a reading, as a hint that doesn't give the answer away. */
const hint = (reading: string) => [...reading.replace(/\s/g, "")][0] ?? "";

const verbBare = (sense: string) => sense.replace(/^to\s+/i, "");

/** Things a person chooses to do, so "Will you … this week?" makes sense. */
const ACTIVITY_RE =
  /^(eat|drink|buy|cook|read|write|study|meet|call|clean|wash|walk|run|swim|travel|visit|practice|practise|watch|listen|play|sing|dance|work|rest|go|come|learn|teach|make|use|send|borrow|lend|climb|draw|paint|exercise|shop|sell|pay|take a bath|take a walk|go out|return home|go home|sleep in|help|wait|look for|search|look|see|order|invite|cut|open|close)$/i;

/* ── The challenge bank ───────────────────────────────────────── */

const BUILDERS: readonly Builder[] = [
  // Write a sentence (three wordings, so even this one varies).
  ({ w, item }) => {
    const v = Math.trunc(item.id) % 3;
    if (v === 0) {
      return {
        id: "sentence",
        bait: `Make a sentence with 「${w}」 in the comments!`,
        baitSpoken: "Make your own sentence in the comments!",
        pinnedComment: `✍️ Your turn: write a sentence with 「${w}」 below 👇`,
      };
    }
    if (v === 1) {
      return {
        id: "sentence-day",
        bait: `Use 「${w}」 in a sentence about YOUR day!`,
        baitSpoken: "Use it in a sentence about your day!",
        pinnedComment: `☀️ Tell us about your day with 「${w}」 in it 👇`,
      };
    }
    return {
      id: "sentence-funny",
      bait: `Write the funniest sentence you can with 「${w}」!`,
      baitSpoken: "Write the funniest sentence you can with it!",
      pinnedComment: `😂 Funniest sentence with 「${w}」 gets pinned next time 👇`,
    };
  },

  // Emoji-only explanation.
  ({ w, sense }) => ({
    id: "emoji",
    bait: `Explain 「${w}」 using only emojis!`,
    baitSpoken: "Explain this word using only emojis!",
    pinnedComment: `🎨 Emoji challenge: show 「${w}」 (${sense}) with emojis only, no words 👇`,
  }),

  // The viewer's own language.
  ({ w, sense }) => ({
    id: "your-language",
    bait: `How do you say "${sense}" in YOUR language? 🌍`,
    baitSpoken: `How do you say ${sense} in your language?`,
    pinnedComment: `🌍 "${sense}" is 「${w}」 in Japanese. What is it where you live? 👇`,
  }),

  // Opposite, when the app knows it.
  ({ w, antonym }) =>
    antonym && {
      id: "opposite",
      bait: `What's the opposite of 「${w}」?`,
      baitSpoken: "What's the opposite of this word? Comment it!",
      pinnedComment: `↔️ Hint: the opposite of 「${w}」 starts with 「${hint(antonym.reading)}」… 👇`,
    },

  // Synonym, when the app knows one.
  ({ w, sense, synonym }) =>
    synonym && {
      id: "synonym",
      bait: `Know another word that means "${sense}"?`,
      baitSpoken: `Do you know another Japanese word that means ${sense}?`,
      pinnedComment: `≈ 「${w}」 has a close cousin that starts with 「${hint(synonym.reading)}」 — what is it? 👇`,
    },

  // Guess the JLPT level.
  ({ w, level }) =>
    level && {
      id: "level-guess",
      bait: `Guess the level: is 「${w}」 N5, N4, N3, N2 or N1?`,
      baitSpoken: "Guess the JLPT level of this word in the comments!",
      pinnedComment: `🎯 Answer: 「${w}」 is ${level}. Did you guess right? 👇`,
    },

  // Rate yourself.
  ({ w }) => ({
    id: "rate",
    bait: `Did you know 「${w}」? Rate yourself 1–5 ⭐`,
    baitSpoken: "Did you know it? Rate yourself from one to five!",
    pinnedComment: `⭐ 1 = never seen it · 5 = I use it every day. Where are you with 「${w}」? 👇`,
  }),

  // Recall the example sentence without scrolling back.
  ({ item }) => {
    const en = item.sentenceMeaning?.trim();
    if (!item.sentence?.trim() || !en || en.length > 40) return null;
    return {
      id: "recall",
      bait: `No peeking! Say "${en.replace(/[.!?]$/, "")}" in Japanese 🧠`,
      baitSpoken: "No peeking! Can you say the example sentence in Japanese?",
      pinnedComment: `🧠 Recall test: "${en}" → write it in Japanese without scrolling back 👇`,
    };
  },

  // Romaji spelling, for kana-only words.
  ({ w, item, kanaOnly }) =>
    kanaOnly && {
      id: "romaji",
      bait: `Spell 「${w}」 in romaji!`,
      baitSpoken: "Spell it in romaji in the comments!",
      pinnedComment: `🔤 Answer: 「${w}」 = ${kanaToRomaji(item.reading.replace(/\s/g, ""))}. Did you get it? 👇`,
    },

  // Write the kanji from memory.
  ({ w, hasKanji }) =>
    hasKanji && {
      id: "write",
      bait: `Close your eyes… can you write 「${w}」 from memory? ✍️`,
      baitSpoken: "Can you write it from memory? Try it on paper, then tell me how it went!",
      pinnedComment: `✍️ Write 「${w}」 from memory. Easy, or did a stroke get you? 👇`,
    },

  // Feelings: a real moment.
  ({ w, sense, feeling, kind }) =>
    feeling &&
    kind !== "verb" && {
      id: "feeling",
      bait: `When did you last feel 「${w}」? Tell me!`,
      baitSpoken: `When did you last feel ${sense}? Tell me in the comments!`,
      pinnedComment: `💭 Share a moment you felt 「${w}」 — in Japanese or English 👇`,
    },

  // Verbs: polite past form.
  ({ w, kind }) =>
    kind === "verb" && {
      id: "past-tense",
      bait: `Level up: what's the polite past form of 「${w}」?`,
      baitSpoken: "Level up! What's the polite past form of this verb?",
      pinnedComment: `⏪ Form check: 「${w}」 → 〜ました? Write it below 👇`,
    },

  // Verbs: a plan for this week.
  ({ w, sense, kind }) =>
    kind === "verb" &&
    ACTIVITY_RE.test(verbBare(sense)) && {
      id: "this-week",
      bait: `Will you ${verbBare(sense)} this week? Answer with 「${w}」!`,
      baitSpoken: `Will you ${verbBare(sense)} this week? Answer in Japanese!`,
      pinnedComment: `📅 Answer in Japanese: this week, will you 「${w}」? 👇`,
    },

  // い-adjectives: negative form.
  ({ w, kind }) =>
    kind === "i-adj" &&
    w !== "いい" && {
      id: "negative",
      bait: `Quick! What's the negative of 「${w}」?`,
      baitSpoken: "Quick! What's the negative form of this adjective?",
      pinnedComment: `🔁 「${w}」 → 〜くない. Write the full form below 👇`,
    },

  // Story chain.
  ({ w }) => ({
    id: "story",
    bait: `Start a story with 「${w}」 — the next person continues it!`,
    baitSpoken: "Start a story with this word, and the next person continues it!",
    pinnedComment: `📖 Story chain: the first line uses 「${w}」. Reply to keep it going 👇`,
  }),

  // Say it out loud.
  ({ w }) => ({
    id: "say-it",
    bait: `Say 「${w}」 out loud 3 times, then comment 言った！`,
    baitSpoken: "Say it out loud three times, then comment that you did it!",
    pinnedComment: `🗣 Did you say 「${w}」 out loud? Comment 言った！ 👇`,
  }),

  // Nouns: where you'd see it.
  ({ w, kind }) =>
    kind === "noun" && {
      id: "where",
      bait: `Where would you see or hear 「${w}」 in Japan?`,
      baitSpoken: "Where would you see or hear this word in Japan? Comment your guess!",
      pinnedComment: `📍 Station, shop, office, home…? Where does 「${w}」 show up? 👇`,
    },
];

/** Stable spread over ids: neighbours land on different challenges. */
function pick<T>(list: readonly T[], id: number, salt: number): T {
  const n = list.length;
  const h = Math.abs(Math.imul(Math.trunc(id) + salt, 2654435761) >>> 0);
  return list[h % n]!;
}

/** All challenges that fit this word, in bank order. */
export function outroChallengesFor(item: VocabularyItem): OutroChallenge[] {
  const c = context(item);
  return BUILDERS.map((b) => b(c)).filter((x): x is OutroChallenge => Boolean(x));
}

/**
 * Challenges that only fit some words (opposite, past tense, feelings…) are
 * the most interesting, so they get three tickets in the draw.
 */
const SPECIFIC = new Set(["opposite", "synonym", "recall", "romaji", "feeling", "past-tense", "this-week", "negative"]);

function draw(item: VocabularyItem): OutroChallenge {
  const tickets = outroChallengesFor(item).flatMap((ch) => (SPECIFIC.has(ch.id) ? [ch, ch, ch] : [ch]));
  return pick(tickets, item.id, 17);
}

/**
 * The challenge this word's Short ends with. `avoidSpoken` is the previous
 * Short's spoken line: when the draw lands on the same line, another fitting
 * challenge is used, so a playlist never repeats itself back to back.
 */
export function outroChallenge(item: VocabularyItem, avoidSpoken: string | null = null): OutroChallenge {
  const mine = draw(item);
  if (mine.baitSpoken !== avoidSpoken) return mine;
  const others = outroChallengesFor(item).filter((ch) => ch.baitSpoken !== avoidSpoken);
  return others.length ? pick(others, item.id, 53) : mine;
}

/* ── Follow line and "Next" label ─────────────────────────────── */

export const FOLLOW_LINES: readonly string[] = [
  "Follow for a new word every day",
  "One word a day adds up — follow!",
  "Tomorrow's word is waiting — follow",
  "Follow to build your Japanese, word by word",
  "Don't break the streak — follow for tomorrow",
  "365 words a year, one at a time. Follow!",
  "Follow so tomorrow's word finds you",
  "毎日ひとこと — follow for more!",
  "Your daily Japanese — follow to keep going",
  "Learned it? Follow for the next one",
];

export const NEXT_LABELS: readonly string[] = ["Next:", "Up next:", "Tomorrow:", "Coming up:", "Next word:"];

export function followLineFor(item: Pick<VocabularyItem, "id">): string {
  return pick(FOLLOW_LINES, item.id, 101);
}

export function nextLabelFor(item: Pick<VocabularyItem, "id">): string {
  return pick(NEXT_LABELS, item.id, 211);
}

/* ── Variations for the special hook types ────────────────────── */

export function trapBait(item: Pick<VocabularyItem, "id" | "word" | "reading">, avoidSpoken: string | null = null) {
  const r = item.reading.replace(/\s/g, "");
  const options = [
      {
        bait: "Did you read it right? Comment ✅ or ❌!",
        baitSpoken: "Did you read it right? Tell me in the comments!",
        pinnedComment: `Be honest — did you read 「${item.word}」 as ${r} on the first try? ✅ / ❌ 👇`,
      },
      {
        bait: "How did YOU read it at first? Be honest 👀",
        baitSpoken: "How did you read it at first? Be honest in the comments!",
        pinnedComment: `👀 First guess for 「${item.word}」 before the reveal? Real answer: ${r} 👇`,
      },
      {
        bait: "Know another word that tricks everyone? Drop it below!",
        baitSpoken: "Know another word that tricks everyone? Drop it in the comments!",
        pinnedComment: `🪤 「${item.word}」 is read ${r}. Share another sneaky reading 👇`,
      },
    ];
  const mine = pick(options, item.id, 307);
  if (mine.baitSpoken !== avoidSpoken) return mine;
  return pick(options.filter((o) => o.baitSpoken !== avoidSpoken), item.id, 311);
}

export function mathBait(item: Pick<VocabularyItem, "id">, c1: string, c2: string, avoidSpoken: string | null = null) {
  const options = [
      {
        bait: `Name another word with 「${c1}」 in the comments!`,
        baitSpoken: "Name another word with this kanji in the comments!",
      },
      {
        bait: `Find another word that uses 「${c2}」!`,
        baitSpoken: "Find another word that uses the second kanji!",
      },
      {
        bait: `Make your own kanji math with 「${c1}」! ➕`,
        baitSpoken: "Make your own kanji math with the first kanji!",
      },
    ];
  const mine = pick(options, item.id, 401);
  if (mine.baitSpoken !== avoidSpoken) return mine;
  return pick(options.filter((o) => o.baitSpoken !== avoidSpoken), item.id, 409);
}
