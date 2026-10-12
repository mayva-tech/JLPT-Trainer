import { firstSense, stableHash } from "../components/Retention/retentionQuiz";
import { isReadingTrap, shortAngle } from "../pages/Shorts/shortAngle";
import type { GrammarItem } from "../types/grammar";
import type { VocabularyItem } from "../types/vocabulary";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import type { HookContext, HookKind, HookVoice, ItemHook } from "./itemHookSpeech";

export type { HookContext, HookKind, HookVoice, ItemHook, ItemHookState } from "./itemHookSpeech";
export { hookHoldMs, hookSpeech } from "./itemHookSpeech";

/**
 * Per-item intro and outro hooks for the Player's Auto Mode videos — a short
 * line before each word / pattern / quiz question ("Most learners misread
 * this!", "How do you say 'only' in Japanese?", "Last question!") and one
 * after it ("Make your own sentence with 〜！", "Got it? Give yourself a
 * point!").
 *
 * Lines are picked from the item's own data (reading traps, sound-alike
 * twins and kanji math reuse the Shorts angles; grammar uses its level,
 * theme, nuance and variants; quizzes use the question's position), varied
 * by a stable hash so a re-take says the same thing, and never the same line
 * twice in a row. Some are said by Andrew (English, Japanese shown under
 * it), some by Nanami (Japanese, English subtitle), so the voices alternate.
 */

interface Template<T> {
  id: string;
  voice: HookVoice;
  /** First / last / angle lines win when they apply. */
  priority?: boolean;
  when?: (item: T, ctx: HookContext) => boolean;
  make: (item: T, ctx: HookContext) => Omit<ItemHook, "id" | "kind" | "voice" | "tag"> & { tag?: string };
}

const KANJI_RE = /[一-鿿㐀-䶿々]/u;
const isFirst = (_: unknown, c: HookContext) => c.index === 0;
const isLast = (_: unknown, c: HookContext) => c.total > 1 && c.index === c.total - 1;
const notEnds = (_: unknown, c: HookContext) => c.index > 0 && c.index < c.total - 1;
/** Comment prompts are kept for every 4th item, so a video doesn't nag. */
const commentSlot = (_: unknown, c: HookContext) => c.index % 4 === 3 && c.index < c.total - 1;

function pick<T>(
  pool: readonly Template<T>[],
  item: T,
  ctx: HookContext,
  seed: string,
  kind: HookKind,
  defaultTag: string,
): ItemHook {
  const fits = pool.filter((t) => !t.when || t.when(item, ctx));
  const fresh = (list: Template<T>[]) => list.filter((t) => t.id !== ctx.prevId);
  const top = fresh(fits.filter((t) => t.priority));
  const rest = fresh(fits.filter((t) => !t.priority));
  const candidates = top.length ? top : rest.length ? rest : fits;
  const t = candidates[stableHash(seed) % candidates.length]!;
  const made = t.make(item, ctx);
  return { id: t.id, kind, voice: t.voice, tag: made.tag ?? defaultTag, ...made };
}

/* ── Vocabulary ─────────────────────────────────────────────────── */

type V = VocabularyItem;

const VOCAB_INTRO: readonly Template<V>[] = [
  { id: "v-first", voice: "en", priority: true, when: isFirst, make: () => ({ en: "Let's start with this one!", ja: "まずはこの言葉(ことば)から！" }) },
  { id: "v-last", voice: "ja", priority: true, when: isLast, make: () => ({ en: "Last word of the lesson!", ja: "最後(さいご)の言葉(ことば)です！" }) },
  {
    id: "v-trap",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "trap",
    make: () => ({ en: "Most learners misread this!", ja: "読(よ)み間違(まちが)えやすい言葉(ことば)！" }),
  },
  {
    id: "v-twin",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "twin",
    make: () => ({ en: "This word has a sound-alike twin!", ja: "同(おな)じ読(よ)み方(かた)の言葉(ことば)がある！" }),
  },
  {
    id: "v-math",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "math",
    make: (it) => {
      const h = shortAngle(it).hook;
      return { en: h.en, ja: "漢字(かんじ)の足(た)し算(ざん)！", spokenEn: "Kanji math! Add the two meanings." };
    },
  },
  { id: "v-read", voice: "en", make: () => ({ en: "Can you read this?", ja: "読(よ)めますか？" }) },
  { id: "v-know", voice: "ja", make: () => ({ en: "Do you know this word?", ja: "この言葉(ことば)、知(し)ってる？" }) },
  { id: "v-guess", voice: "en", make: () => ({ en: "Guess the reading before I say it!", ja: "読(よ)みを当(あ)ててみて！" }) },
  { id: "v-loud", voice: "ja", make: () => ({ en: "Try reading it out loud!", ja: "声(こえ)に出(だ)して読(よ)んでみて！" }) },
  { id: "v-seen", voice: "en", make: () => ({ en: "Have you seen this word before?", ja: "見(み)たことある？" }) },
  {
    id: "v-topic",
    voice: "en",
    when: (it) => !!it.subcategory && !/^(general|misc|other)/i.test(it.subcategory),
    make: (it) => ({ en: `A useful word for ${it.subcategory.toLowerCase()}!`, ja: "使(つか)える言葉(ことば)！" }),
  },
  { id: "v-next", voice: "ja", make: () => ({ en: "Next word!", ja: "次(つぎ)の言葉(ことば)！" }) },
];

const VOCAB_OUTRO: readonly Template<V>[] = [
  {
    id: "v-o-last",
    voice: "en",
    priority: true,
    when: isLast,
    make: () => ({
      en: "That's the lesson! Which word was hardest? Tell us in the comments!",
      ja: "おつかれさまでした！",
    }),
  },
  {
    id: "v-o-trap",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "trap",
    make: () => ({ en: "Did you read it right the first time?", ja: "正(ただ)しく読(よ)めた？" }),
  },
  {
    id: "v-o-twin",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "twin",
    make: (it) => {
      const a = shortAngle(it);
      return { en: a.bait.replace(/\s*Comment.*$/, ""), spokenEn: a.baitSpoken.replace(/\s*Comment.*$/, ""), ja: "どっちかな？", choices: a.choices };
    },
  },
  {
    id: "v-o-math",
    voice: "en",
    priority: true,
    when: (it, c) => notEnds(it, c) && shortAngle(it).kind === "math",
    make: (it) => ({
      en: `Think of another word with 「${[...it.word][0]}」!`,
      spokenEn: "Can you think of another word with this kanji?",
      ja: "ほかの言葉(ことば)も考(かんが)えてみて！",
    }),
  },
  {
    id: "v-o-sentence",
    voice: "en",
    make: (it) => ({ en: `Make your own sentence with 「${it.word}」!`, spokenEn: "Make your own sentence with this word!", ja: "自分(じぶん)の文(ぶん)を作(つく)ってみよう！" }),
  },
  { id: "v-o-three", voice: "ja", make: (it) => ({ en: `Say 「${it.word}」 three times, out loud!`, ja: "三回(さんかい)言(い)ってみて！" }) },
  { id: "v-o-today", voice: "en", make: (it) => ({ en: `Try using 「${it.word}」 today!`, spokenEn: "Try using this word today!", ja: "今日(きょう)、使(つか)ってみよう！" }) },
  { id: "v-o-example", voice: "ja", make: () => ({ en: "Can you still say the example sentence?", ja: "例文(れいぶん)、覚(おぼ)えてる？" }) },
  {
    id: "v-o-write",
    voice: "en",
    when: (it) => KANJI_RE.test(it.word),
    make: (it) => ({ en: `Write 「${it.word}」 once from memory!`, spokenEn: "Write it once from memory!", ja: "書(か)いてみよう！" }),
  },
  {
    id: "v-o-comment",
    voice: "en",
    when: commentSlot,
    make: () => ({ en: "Where would you use this word? Tell us in the comments!", ja: "コメントで教(おし)えて！" }),
  },
];

export function vocabHook(kind: HookKind, item: VocabularyItem, ctx: HookContext): ItemHook {
  return kind === "intro"
    ? pick(VOCAB_INTRO, item, ctx, `vi:${item.id}`, kind, ctx.index === 0 ? "First word" : "Next word")
    : pick(VOCAB_OUTRO, item, ctx, `vo:${item.id}`, kind, "Your turn");
}

/* ── Grammar ────────────────────────────────────────────────────── */

type G = GrammarItem;
const theme = (it: G) => !!it.category && it.category !== "Grammar";

const GRAMMAR_INTRO: readonly Template<G>[] = [
  { id: "g-first", voice: "en", priority: true, when: isFirst, make: () => ({ en: "First pattern — let's go!", ja: "最初(さいしょ)の文型(ぶんけい)です！" }) },
  { id: "g-last", voice: "ja", priority: true, when: isLast, make: () => ({ en: "Last pattern of the lesson!", ja: "最後(さいご)の文型(ぶんけい)です！" }) },
  {
    id: "g-say",
    voice: "en",
    make: (it) => ({ en: `How do you say “${firstSense(it.meaning)}” in Japanese?`, ja: "日本語(にほんご)で何(なん)と言(い)う？" }),
  },
  { id: "g-must", voice: "en", make: (it) => ({ en: `A must-know ${it.jlpt} pattern!`, ja: "大事(だいじ)な文法(ぶんぽう)！" }) },
  {
    id: "g-theme",
    voice: "en",
    when: theme,
    make: (it) => ({ en: `A pattern for ${it.category.toLowerCase()}.`, ja: "この文型(ぶんけい)に注目(ちゅうもく)！" }),
  },
  { id: "g-guess", voice: "ja", make: (it) => ({ en: `Can you guess what ${it.pattern} means?`, ja: "意味(いみ)、わかるかな？" }) },
  { id: "g-listen", voice: "ja", make: (it) => ({ en: `Listen for ${it.pattern} in the example!`, ja: "例文(れいぶん)で聞(き)いてみて！" }) },
  { id: "g-exam", voice: "en", make: (it) => ({ en: `This one shows up on the JLPT ${it.jlpt}!`, ja: "試験(しけん)によく出(で)る！" }) },
  {
    id: "g-twist",
    voice: "ja",
    when: (it) => !!it.nuance,
    make: () => ({ en: "Careful — this one has a twist!", ja: "ちょっと注意(ちゅうい)！" }),
  },
];

const GRAMMAR_OUTRO: readonly Template<G>[] = [
  {
    id: "g-o-last",
    voice: "en",
    priority: true,
    when: isLast,
    make: () => ({ en: "That's the lesson! Which pattern will you use first? Tell us in the comments!", ja: "おつかれさまでした！" }),
  },
  {
    id: "g-o-sentence",
    voice: "en",
    make: (it) => ({ en: `Make your own sentence with ${it.pattern}!`, spokenEn: "Make your own sentence with this pattern!", ja: "自分(じぶん)の文(ぶん)を作(つく)ってみよう！" }),
  },
  { id: "g-o-again", voice: "ja", make: () => ({ en: "Say the example again — without looking!", ja: "見(み)ないで言(い)ってみて！" }) },
  {
    id: "g-o-when",
    voice: "en",
    make: (it) => ({ en: `When would you use ${it.pattern}? Think of one moment today.`, spokenEn: "When would you use this pattern? Think of one moment today.", ja: "いつ使(つか)う？" }),
  },
  {
    id: "g-o-form",
    voice: "ja",
    when: (it) => !!it.formation && it.formation.length <= 60,
    make: (it) => ({ en: `Remember the form: ${it.formation}`, ja: "形(かたち)を覚(おぼ)えよう！" }),
  },
  {
    id: "g-o-alias",
    voice: "en",
    when: (it) => !!it.aliases?.length,
    make: (it) => ({ en: `Also seen as ${it.aliases![0]} — same idea.`, spokenEn: "You'll also see a variant of this pattern!", ja: "似(に)た形(かたち)もある！" }),
  },
  {
    id: "g-o-comment",
    voice: "en",
    when: commentSlot,
    make: () => ({ en: "Drop your own example in the comments!", ja: "コメントで書(か)いてみて！" }),
  },
];

export function grammarHook(kind: HookKind, item: GrammarItem, ctx: HookContext): ItemHook {
  return kind === "intro"
    ? pick(GRAMMAR_INTRO, item, ctx, `gi:${item.id}`, kind, ctx.index === 0 ? "First pattern" : "Next pattern")
    : pick(GRAMMAR_OUTRO, item, ctx, `go:${item.id}`, kind, "Your turn");
}

/* ── Quizzes (vocabulary and grammar) ───────────────────────────── */

type Q = VocabularyQuizQuestion;
/** Vocabulary questions only (grammar questions show a 〜 pattern). */
const quizTrap = (q: Q) => !q.item.word.includes("〜") && KANJI_RE.test(q.item.word) && isReadingTrap(q.item);

const QUIZ_INTRO: readonly Template<Q>[] = [
  { id: "q-first", voice: "en", priority: true, when: isFirst, make: () => ({ en: "First question — ready?", ja: "最初(さいしょ)の問題(もんだい)！" }) },
  { id: "q-last", voice: "ja", priority: true, when: isLast, make: () => ({ en: "Last question!", ja: "最後(さいご)の問題(もんだい)！" }) },
  {
    id: "q-half",
    voice: "en",
    priority: true,
    when: (_, c) => c.total >= 6 && c.index === Math.floor(c.total / 2),
    make: () => ({ en: "Halfway there — keep going!", ja: "あと半分(はんぶん)！" }),
  },
  { id: "q-trap", voice: "en", when: (q, c) => notEnds(q, c) && quizTrap(q), make: () => ({ en: "Careful — this one's a reading trap!", ja: "ひっかけ注意(ちゅうい)！" }) },
  { id: "q-next", voice: "ja", make: () => ({ en: "Next question!", ja: "次(つぎ)の問題(もんだい)！" }) },
  { id: "q-fast", voice: "en", make: () => ({ en: "Think fast — three seconds!", ja: "三秒(さんびょう)で答(こた)えて！" }) },
  { id: "q-can", voice: "ja", make: () => ({ en: "Can you get this one?", ja: "わかるかな？" }) },
  { id: "q-gut", voice: "en", make: () => ({ en: "Don't overthink it — go with your gut!", ja: "直感(ちょっかん)で！" }) },
];

const QUIZ_OUTRO: readonly Template<Q>[] = [
  {
    id: "q-o-last",
    voice: "en",
    priority: true,
    when: isLast,
    make: () => ({ en: "How many did you get? Tell us in the comments!", ja: "何問(なんもん)できた？" }),
  },
  { id: "q-o-point", voice: "en", make: () => ({ en: "Got it? Give yourself a point!", ja: "正解(せいかい)したら一点(いってん)！" }) },
  { id: "q-o-count", voice: "ja", make: () => ({ en: "Keep count — how many so far?", ja: "何問(なんもん)できた？" }) },
  { id: "q-o-miss", voice: "en", make: () => ({ en: "Missed it? No worries — it'll come back.", ja: "まちがえても大丈夫(だいじょうぶ)！" }) },
  { id: "q-o-say", voice: "ja", make: () => ({ en: "Say it out loud once more!", ja: "もう一度(いちど)言(い)ってみて！" }) },
  { id: "q-o-keep", voice: "ja", make: () => ({ en: "Keep it up!", ja: "その調子(ちょうし)！" }) },
];

export function quizHook(kind: HookKind, q: VocabularyQuizQuestion, ctx: HookContext): ItemHook {
  const tag = `Question ${ctx.index + 1} / ${ctx.total}`;
  return kind === "intro"
    ? pick(QUIZ_INTRO, q, ctx, `qi:${q.item.id}:${ctx.index}`, kind, tag)
    : pick(QUIZ_OUTRO, q, ctx, `qo:${q.item.id}:${ctx.index}`, kind, "Answer");
}

/** All templates (tests). */
export const HOOK_TEMPLATES = {
  vocabIntro: VOCAB_INTRO,
  vocabOutro: VOCAB_OUTRO,
  grammarIntro: GRAMMAR_INTRO,
  grammarOutro: GRAMMAR_OUTRO,
  quizIntro: QUIZ_INTRO,
  quizOutro: QUIZ_OUTRO,
} as const;
