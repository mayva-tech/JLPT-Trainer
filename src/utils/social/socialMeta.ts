import type { GrammarItem, GrammarCourseLevel } from "../../types/grammar";
import type { GrammarLesson, Lesson } from "../../types/lesson";
import type { JlptLevel } from "../../types/level";
import type { RegisterPair, RegisterSection, RegisterSide } from "../../types/register";
import type { VocabularyItem } from "../../types/vocabulary";
import { shortAngle } from "../../pages/Shorts/shortAngle";
import {
  AUDIENCE_KEYWORDS,
  AUDIENCE_LINE,
  AUDIENCE_LINE_SHORT,
  buildHashtags,
  charLength,
  clip,
  firstSense,
  fitTitle,
  formatTags,
  wordWithReading,
  type HashtagKind,
} from "./socialText";

/**
 * Social publishing text for anything the creator records: a title,
 * a YouTube description, one universal short-form caption and a fixed
 * hashtag set — all derived from the lesson data, so editing a word or a
 * grammar note updates its post too. Platform posts are formatted from
 * this one model (formatSocialPost) instead of six separate texts.
 */

export type SocialPlatform =
  | "youtube"
  | "youtube-shorts"
  | "tiktok"
  | "facebook-reels"
  | "instagram-reels"
  | "universal";

export const SOCIAL_PLATFORMS: readonly { id: SocialPlatform; label: string }[] = [
  { id: "youtube", label: "YouTube" },
  { id: "youtube-shorts", label: "Shorts" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook-reels", label: "Facebook" },
  { id: "instagram-reels", label: "Instagram" },
  { id: "universal", label: "Universal" },
];

export type SocialContentType =
  | "vocabulary-item"
  | "vocabulary-lesson"
  | "grammar-item"
  | "grammar-lesson"
  | "quiz"
  | "register-section"
  | "register-pair"
  | "topic";

/** Something inside a lesson that has its own post (one word, pattern or pair). */
export interface SocialChild {
  type: "vocabulary-item" | "grammar-item" | "register-pair";
  id: number;
  label: string;
  sub: string;
}

export interface SocialMeta {
  contentId: string;
  contentType: SocialContentType;
  level?: JlptLevel;
  /** Panel header: "JLPT N2 Vocabulary #14". */
  heading: string;
  /** Panel sub-header: the theme. */
  subheading?: string;
  title: string;
  shortTitle: string;
  youtubeDescription: string;
  /** Compact caption that works on Shorts, TikTok and Reels. */
  universalCaption: string;
  /** One-line opener for TikTok / Reels. */
  hook: string;
  /** Hashtags without #shorts; short-form platforms add it. */
  hashtags: string[];
  pinnedComment?: string;
  /** YouTube tags (the comma-separated Tags field). */
  keywords: string[];
  /** Words or patterns in a lesson / quiz, each with its own post. */
  children?: SocialChild[];
  /** A Shorts-studio upload (hook title, credit) used as the YouTube Shorts post. */
  shortsPost?: SocialPost;
  /** Small label beside the heading ("Hook: Kanji math"). */
  badge?: string;
}

/* ── Vocabulary ─────────────────────────────────────────────────── */

export interface VocabularyItemContext {
  level: JlptLevel;
  /** Word number across the level (N5 word #23). */
  wordNumber?: number;
  lessonNumber?: number;
  lessonTheme?: string;
}

function lessonRef(level: JlptLevel, lessonNumber?: number, theme?: string): string {
  const base = lessonNumber ? `JLPT ${level} Vocabulary #${lessonNumber}` : `JLPT ${level} Vocabulary`;
  return theme ? `${base} | ${theme}` : base;
}

export function buildVocabularyItemSocialMeta(
  item: VocabularyItem,
  ctx: VocabularyItemContext
): SocialMeta {
  const { level } = ctx;
  const sense = firstSense(item.meaning);
  const written = wordWithReading(item.word, item.reading);
  const title = fitTitle(
    [`${written} — ${sense}`, `${item.word} — ${sense}`],
    ` | JLPT ${level} Japanese Vocabulary`
  );
  const hasSentence = Boolean(item.sentence?.trim());
  const hasPhrase = Boolean(item.phrase?.trim()) && item.phrase !== item.word;

  const desc: string[] = [`🇯🇵 Japanese vocabulary: ${written}`, "", "Meaning:", item.meaning, ""];
  if (hasSentence) desc.push("Example:", item.sentence, item.sentenceMeaning, "");
  if (hasPhrase) desc.push("Phrase:", `${item.phrase} — ${item.phraseMeaning}`, "");
  if (item.wordNuance?.trim()) desc.push("Note:", clip(item.wordNuance, 240), "");
  const where = [`JLPT ${level} vocabulary`];
  if (ctx.wordNumber) where.push(`word #${ctx.wordNumber}`);
  desc.push(where.join(" · "));
  if (ctx.lessonNumber || ctx.lessonTheme) {
    desc.push(`Full lesson: ${lessonRef(level, ctx.lessonNumber, ctx.lessonTheme)}`);
  }

  const caption = [`${written} = ${sense}`];
  if (hasSentence) caption.push(item.sentence, item.sentenceMeaning);
  caption.push(`JLPT ${level} Japanese vocabulary`);

  const heading = ctx.wordNumber ? `JLPT ${level} Vocabulary · word #${ctx.wordNumber}` : `JLPT ${level} Vocabulary`;
  return {
    contentId: `vocab-${item.id}`,
    contentType: "vocabulary-item",
    level,
    heading,
    subheading: `${written} — ${sense}`,
    title,
    shortTitle: `${written} = ${sense}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook: `Do you know this JLPT ${level} word? ${item.word}`,
    hashtags: buildHashtags({ level, kind: "vocabulary" }),
    pinnedComment: shortAngle(item).pinnedComment,
    keywords: unique([...AUDIENCE_KEYWORDS, item.word, item.reading, sense, `JLPT ${level}`, item.subcategory, "Japanese vocabulary"]),
  };
}

export interface VocabularyLessonContext {
  level: JlptLevel;
  lessonNumber?: number;
  firstWordNumber?: number;
  lastWordNumber?: number;
}

const LESSON_LIST_MAX = 12;

function vocabChildren(items: readonly VocabularyItem[]): SocialChild[] {
  return items.map((v) => ({
    type: "vocabulary-item",
    id: v.id,
    label: v.word,
    sub: firstSense(v.meaning),
  }));
}

function wordList(items: readonly VocabularyItem[]): string[] {
  const lines = items
    .slice(0, LESSON_LIST_MAX)
    .map((v) => `${wordWithReading(v.word, v.reading)} — ${firstSense(v.meaning)}`);
  if (items.length > LESSON_LIST_MAX) lines.push(`…and ${items.length - LESSON_LIST_MAX} more`);
  return lines;
}

function rangeText(first?: number, last?: number): string {
  if (!first || !last) return "";
  return first === last ? `word ${first}` : `words ${first}–${last}`;
}

export function buildVocabularyLessonSocialMeta(
  lesson: Lesson,
  items: readonly VocabularyItem[],
  ctx: VocabularyLessonContext
): SocialMeta {
  const { level } = ctx;
  const theme = lesson.subtitle;
  const n = items.length;
  const ref = lessonRef(level, ctx.lessonNumber, theme);
  const range = rangeText(ctx.firstWordNumber, ctx.lastWordNumber);

  const desc = [
    `Learn ${n} JLPT ${level} Japanese vocabulary words: ${theme}.`,
    "",
    "In this lesson:",
    ...wordList(items),
    "",
    "Each word comes with its reading, an example phrase and an example sentence.",
    "",
    [ref, range ? `JLPT ${level} ${range}` : ""].filter(Boolean).join(" · "),
  ];
  const sample = items
    .slice(0, 5)
    .map((v) => `${v.word} ${firstSense(v.meaning)}`)
    .join(" · ");
  const hook = `Learn ${n} JLPT ${level} Japanese words: ${theme}`;
  const caption = [hook, sample, range ? `JLPT ${level} ${range}` : ""].filter(Boolean);

  return {
    contentId: `vocab-lesson-${lesson.id}`,
    contentType: "vocabulary-lesson",
    level,
    heading: ctx.lessonNumber ? `JLPT ${level} Vocabulary #${ctx.lessonNumber}` : `JLPT ${level} Vocabulary`,
    subheading: theme,
    title: fitTitle([`${ref} | ${n} Japanese Words`, ref], ""),
    shortTitle: `${n} JLPT ${level} words: ${theme}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook,
    hashtags: buildHashtags({ level, kind: "vocabulary" }),
    pinnedComment: "Which word from this lesson was new to you? 👇",
    keywords: unique([...AUDIENCE_KEYWORDS, `JLPT ${level}`, "Japanese vocabulary", theme, ...items.slice(0, 5).map((v) => v.word)]),
    children: vocabChildren(items),
  };
}

/* ── Grammar ────────────────────────────────────────────────────── */

const LEVEL_OF_TRACK: Record<GrammarCourseLevel, JlptLevel> = {
  N2_CORE: "N2",
  N2_SECONDARY: "N2",
  N3_REVIEW: "N3",
  N1: "N1",
};

/** The course track the pattern is taught in (not the raw inventory label). */
export function grammarLevel(item: GrammarItem): JlptLevel {
  return LEVEL_OF_TRACK[item.courseLevel] ?? item.jlpt;
}

export interface GrammarItemContext {
  level?: JlptLevel;
  /** "JLPT N2 Grammar 1–10 · Degree & Limit". */
  lessonLabel?: string;
}

export function buildGrammarItemSocialMeta(item: GrammarItem, ctx: GrammarItemContext = {}): SocialMeta {
  const level = ctx.level ?? grammarLevel(item);
  const sense = firstSense(item.meaning);
  const written = wordWithReading(item.pattern, item.patternReading);
  const title = fitTitle(
    [`${item.pattern} — ${sense}`, item.pattern],
    ` | JLPT ${level} Japanese Grammar`
  );
  const hasSentence = Boolean(item.sentence?.trim());

  const desc: string[] = [`🇯🇵 JLPT ${level} Grammar: ${written}`, "", "Meaning:", item.meaning, ""];
  if (item.formation?.trim()) desc.push("Formation:", item.formation, "");
  if (hasSentence) desc.push("Example:", item.sentence, item.sentenceMeaning, "");
  if (item.nuance?.trim()) desc.push("Use:", clip(item.nuance, 240), "");
  if (ctx.lessonLabel) desc.push(`Lesson: ${ctx.lessonLabel}`);
  desc.push(`JLPT ${level} grammar · ${item.subcategory}`);

  const caption = [`${item.pattern} = ${sense}`];
  if (item.formation?.trim()) caption.push(`Form: ${item.formation}`);
  if (hasSentence) caption.push(item.sentence, item.sentenceMeaning);
  caption.push(`JLPT ${level} Japanese grammar`);

  return {
    contentId: `grammar-${item.id}`,
    contentType: "grammar-item",
    level,
    heading: `JLPT ${level} Grammar`,
    subheading: `${item.pattern} — ${sense}`,
    title,
    shortTitle: `${item.pattern} = ${sense}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook: `Do you know this JLPT ${level} grammar? ${item.pattern}`,
    hashtags: buildHashtags({ level, kind: "grammar" }),
    pinnedComment: `Try your own sentence with ${item.pattern} below 👇`,
    keywords: unique([...AUDIENCE_KEYWORDS, item.pattern, item.patternReading, sense, `JLPT ${level}`, item.subcategory, "Japanese grammar"]),
  };
}

export interface GrammarLessonContext {
  level: JlptLevel;
  /** "1–10" for numbered batches. */
  rangeLabel?: string;
  /** Up to two themes: "Degree & Limit, Judgement & Evaluation". */
  themes?: string;
}

function patternList(items: readonly GrammarItem[]): string[] {
  const lines = items.slice(0, LESSON_LIST_MAX).map((g) => `${g.pattern} — ${firstSense(g.meaning)}`);
  if (items.length > LESSON_LIST_MAX) lines.push(`…and ${items.length - LESSON_LIST_MAX} more`);
  return lines;
}

function grammarChildren(items: readonly GrammarItem[]): SocialChild[] {
  return items.map((g) => ({ type: "grammar-item", id: g.id, label: g.pattern, sub: firstSense(g.meaning) }));
}

/** "Degree & Limit, Judgement & Evaluation" → "Degree & Limit and Judgement & Evaluation". */
function themesProse(themes: string): string {
  const parts = themes.split(", ").filter(Boolean);
  return parts.length === 2 ? `${parts[0]} and ${parts[1]}` : parts.join(", ");
}

export function grammarLessonName(level: JlptLevel, ctx: { rangeLabel?: string; themes?: string }): string {
  const base = `JLPT ${level} Grammar${ctx.rangeLabel ? ` ${ctx.rangeLabel}` : ""}`;
  return ctx.themes ? `${base} · ${ctx.themes}` : base;
}

export function buildGrammarLessonSocialMeta(
  lesson: GrammarLesson,
  items: readonly GrammarItem[],
  ctx: GrammarLessonContext
): SocialMeta {
  const { level } = ctx;
  const n = items.length;
  const noun = n === 1 ? "pattern" : "patterns";
  const themes = ctx.themes ?? "";
  const name = grammarLessonName(level, ctx);
  const covering = themes ? ` covering ${themesProse(themes)}` : "";
  const few = items.length <= 3 ? items.map((g) => g.pattern).join("・") : "";

  const desc = [
    `Learn ${n} JLPT ${level} Japanese grammar ${noun}${covering}.`,
    "",
    n === 1 ? "Pattern in this lesson:" : "Patterns in this lesson:",
    ...patternList(items),
    "",
    `${n === 1 ? "It comes" : "Each pattern comes"} with its meaning, how to form it and an example sentence.`,
    "",
    name,
  ];
  const hook = `${n} JLPT ${level} grammar ${noun}${themes ? `: ${themes}` : ""}`;
  const caption = [
    hook,
    items
      .slice(0, 5)
      .map((g) => g.pattern)
      .join(" · "),
    `JLPT ${level} Japanese grammar`,
  ];

  const titleBase = `JLPT ${level} Grammar${ctx.rangeLabel ? ` ${ctx.rangeLabel}` : ""}`;
  return {
    contentId: `grammar-lesson-${lesson.id}`,
    contentType: "grammar-lesson",
    level,
    heading: titleBase,
    subheading: themes || few || undefined,
    title: fitTitle(
      [
        few ? `${titleBase}: ${few}${themes ? ` | ${themes}` : ""}` : "",
        themes ? `${titleBase} | ${themes} — ${n} ${noun}` : "",
        themes ? `${titleBase} | ${themes}` : "",
        few ? `${titleBase}: ${few}` : titleBase,
      ].filter(Boolean),
      ""
    ),
    shortTitle: few ? `JLPT ${level} grammar: ${few}` : `${n} JLPT ${level} grammar ${noun}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook,
    hashtags: buildHashtags({ level, kind: "grammar" }),
    pinnedComment: "Which pattern do you find hardest to use? 👇",
    keywords: unique([...AUDIENCE_KEYWORDS, `JLPT ${level}`, "Japanese grammar", ...themes.split(", "), ...items.slice(0, 5).map((g) => g.pattern)]),
    children: grammarChildren(items),
  };
}

/* ── Quizzes ────────────────────────────────────────────────────── */

export type QuizSocialInput =
  | {
      subject: "vocabulary";
      quizId: string;
      level: JlptLevel;
      /** Lesson the quiz checks; null for review quizzes across lessons. */
      lesson: { name: string; theme: string; number?: number } | null;
      items: readonly VocabularyItem[];
      /** Review quizzes: how many questions, when there is no fixed lesson. */
      label?: string;
    }
  | {
      subject: "grammar";
      quizId: string;
      level: JlptLevel;
      lesson: { name: string; theme: string; rangeLabel?: string };
      items: readonly GrammarItem[];
    };

export function buildQuizSocialMeta(input: QuizSocialInput): SocialMeta {
  const { level } = input;
  const grammarQuiz = input.subject === "grammar";
  const kind: HashtagKind = grammarQuiz ? "grammar-quiz" : "vocabulary-quiz";
  const what = grammarQuiz ? "grammar" : "vocabulary";
  const n = input.items.length;
  const unit = grammarQuiz ? (n === 1 ? "grammar pattern" : "grammar patterns") : n === 1 ? "Japanese word" : "Japanese words";
  const theme = input.lesson?.theme ?? "";
  const from = input.lesson ? ` from ${input.lesson.theme}` : "";
  const headline =
    input.subject === "vocabulary" && !input.lesson && input.label
      ? `JLPT ${level} ${input.label}`
      : `JLPT ${level} ${grammarQuiz ? "Grammar" : "Vocabulary"} Quiz${
          input.subject === "vocabulary" && input.lesson?.number ? ` #${input.lesson.number}` : ""
        }${input.subject === "grammar" && input.lesson.rangeLabel ? ` ${input.lesson.rangeLabel}` : ""}`;

  const desc = [`Can you pass this JLPT ${level} ${what} quiz?`, ""];
  desc.push(n > 0 ? `Test yourself on ${n} ${unit}${from}.` : `Test yourself on JLPT ${level} ${what}.`);
  desc.push("Pause before each answer and see how many you get right.");
  if (input.lesson) desc.push("", `Review the lesson first: ${input.lesson.name}`);

  const caption = [
    `Can you pass this JLPT ${level} ${what} quiz?`,
    n > 0 ? `${n} ${unit}${theme ? ` · ${theme}` : ""}` : "",
    "Pause before each answer and count your score.",
  ].filter(Boolean);

  return {
    contentId: `quiz-${input.quizId}`,
    contentType: "quiz",
    level,
    heading: headline,
    subheading: theme || undefined,
    title: fitTitle(
      theme
        ? [`${headline} | ${theme} — Can You Pass?`, `${headline} | ${theme}`]
        : [`${headline} — Can You Pass?`, headline],
      ""
    ),
    shortTitle: `JLPT ${level} ${what} quiz${theme ? `: ${theme}` : ""}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook: `Can you pass this JLPT ${level} ${what} quiz?`,
    hashtags: buildHashtags({ level, kind }),
    pinnedComment: "How many did you get right? Comment your score 👇",
    keywords: unique([...AUDIENCE_KEYWORDS, `JLPT ${level}`, `JLPT ${what} quiz`, theme]),
    children:
      input.subject === "grammar" ? grammarChildren(input.items) : vocabChildren(input.items),
  };
}

/* ── Casual ⇄ formal (register) ─────────────────────────────────── */

/** The register course sits in the N2 track. */
const REGISTER_LEVEL: JlptLevel = "N2";
const REGISTER_KEYWORDS = [
  "casual vs formal Japanese",
  "polite Japanese",
  "Japanese keigo",
  "keigo",
  "敬語",
  "business Japanese",
  "how to speak politely in Japanese",
];

/** 誰？ with its kana: 誰？（だれ）. Kana-only sides stay as they are. */
function sideWithReading(side: RegisterSide): string {
  const bare = (t: string) => t.replace(/[\s、。？！?!,.]+/gu, "");
  const reading = bare(side.reading);
  return reading && reading !== bare(side.text) ? `${side.text}（${reading}）` : side.text;
}

/** "1. 質問・依頼" → "質問・依頼". */
function sectionJa(section: RegisterSection): string {
  return section.title.replace(/^\d+\.\s*/, "");
}

export interface RegisterSectionContext {
  /** 1-based place in the course ("Casual ⇄ Formal #1"). */
  number: number;
}

function registerRef(section: RegisterSection, ctx: RegisterSectionContext): string {
  return `Casual ⇄ Formal #${ctx.number} · ${sectionJa(section)} (${section.subtitle})`;
}

export function buildRegisterPairSocialMeta(
  pair: RegisterPair,
  section: RegisterSection | undefined,
  ctx: RegisterSectionContext | undefined
): SocialMeta {
  const level = REGISTER_LEVEL;
  const casual = sideWithReading(pair.casual);
  const formal = sideWithReading(pair.formal);
  const quoted = `“${pair.meaning.replace(/[.。]$/u, "")}”`;
  const title = fitTitle(
    [
      `${quoted} in Japanese: ${pair.casual.text} vs ${pair.formal.text}`,
      `${pair.casual.text} vs ${pair.formal.text}`,
    ],
    " | Casual vs Formal Japanese"
  );

  const desc = [
    `🇯🇵 Casual vs formal Japanese: ${quoted}`,
    "",
    "Casual (friends, family):",
    `${casual} — ${pair.casual.romaji}`,
    "",
    "Formal (work, strangers, customers):",
    `${formal} — ${pair.formal.romaji}`,
    "",
  ];
  if (pair.note?.trim()) desc.push("When to use which:", pair.note, "");
  if (section && ctx) desc.push(`Lesson: ${registerRef(section, ctx)}`);
  desc.push(`Japanese keigo · JLPT ${level}`);

  const caption = [
    `${quoted} in Japanese`,
    `Casual: ${pair.casual.text}`,
    `Formal: ${pair.formal.text}`,
  ];
  if (pair.note?.trim()) caption.push(clip(pair.note, 160));
  caption.push("Casual vs formal Japanese (keigo)");

  return {
    contentId: `register-pair-${pair.id}`,
    contentType: "register-pair",
    level,
    heading: ctx ? `Casual ⇄ Formal #${ctx.number}` : "Casual ⇄ Formal",
    subheading: `${pair.casual.text} → ${pair.formal.text}`,
    title,
    shortTitle: `${quoted}: ${pair.casual.text} → ${pair.formal.text}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook: `Casual or polite? How to say ${quoted} in Japanese`,
    hashtags: buildHashtags({ level, kind: "register" }),
    pinnedComment: `Which one would you say to your boss? Try the formal one out loud 👇`,
    keywords: unique([
      `${pair.meaning.replace(/[.。?？!！]$/u, "")} in Japanese`,
      pair.casual.text,
      pair.formal.text,
      pair.formal.romaji,
      ...REGISTER_KEYWORDS,
      section?.subtitle,
      `JLPT ${level}`,
      ...AUDIENCE_KEYWORDS,
    ]),
  };
}

function registerChildren(pairs: readonly RegisterPair[]): SocialChild[] {
  return pairs.map((p) => ({
    type: "register-pair",
    id: p.id,
    label: `${p.casual.text} → ${p.formal.text}`,
    sub: p.meaning,
  }));
}

export function buildRegisterSectionSocialMeta(
  section: RegisterSection,
  pairs: readonly RegisterPair[],
  ctx: RegisterSectionContext
): SocialMeta {
  const level = REGISTER_LEVEL;
  const n = pairs.length;
  const noun = n === 1 ? "phrase" : "phrases";
  const ja = sectionJa(section);
  const head = `Casual vs Formal Japanese #${ctx.number}`;

  const list = pairs
    .slice(0, LESSON_LIST_MAX)
    .map((p) => `${p.meaning} — ${p.casual.text} → ${p.formal.text}`);
  if (n > LESSON_LIST_MAX) list.push(`…and ${n - LESSON_LIST_MAX} more`);

  const desc = [
    `Learn to switch between casual and polite Japanese (keigo): ${section.subtitle.toLowerCase()}.`,
    "",
    "In this lesson:",
    ...list,
    "",
    "Each pair shows the casual form, the formal form, and when to use which.",
    "",
    registerRef(section, ctx),
  ];
  const hook = `Casual or polite? ${n} Japanese ${noun}: ${section.subtitle}`;
  const caption = [
    hook,
    pairs
      .slice(0, 4)
      .map((p) => `${p.casual.text} → ${p.formal.text}`)
      .join(" · "),
    `${ja} · Japanese keigo`,
  ];

  return {
    contentId: `register-section-${section.id}`,
    contentType: "register-section",
    level,
    heading: `Casual ⇄ Formal #${ctx.number}`,
    subheading: `${ja} — ${section.subtitle}`,
    title: fitTitle(
      [
        `${head} | ${section.subtitle} (${ja}) — ${n} Keigo ${noun === "phrase" ? "Phrase" : "Phrases"}`,
        `${head} | ${section.subtitle} (${ja})`,
        `${head} | ${section.subtitle}`,
      ],
      ""
    ),
    shortTitle: `Casual vs formal Japanese: ${section.subtitle}`,
    youtubeDescription: withAudience(desc),
    universalCaption: [...caption, AUDIENCE_LINE_SHORT].join("\n"),
    hook,
    hashtags: buildHashtags({ level, kind: "register" }),
    pinnedComment: "Which formal phrase was new to you? 👇",
    keywords: unique([
      ...REGISTER_KEYWORDS,
      section.subtitle,
      ja,
      `JLPT ${level}`,
      ...pairs.slice(0, 6).map((p) => p.formal.text),
      ...AUDIENCE_KEYWORDS,
    ]),
    children: registerChildren(pairs),
  };
}

/* ── Platform formatting ────────────────────────────────────────── */

export interface SocialPost {
  title?: string;
  body: string;
  /** The hashtags in `body`, for the separate Copy Hashtags field. */
  hashtags: string[];
}

/** TikTok / Reels captions stay readable on a phone. */
export const SHORT_CAPTION_MAX = 600;

function withTags(lines: readonly string[], tags: readonly string[]): string {
  return [...lines, "", tags.join(" ")].join("\n");
}

function shortFormTitle(meta: SocialMeta): string {
  return fitTitle([meta.shortTitle], " #shorts");
}

/** One platform's post, all from the same meta. */
export function formatSocialPost(meta: SocialMeta, platform: SocialPlatform): SocialPost {
  const tags = meta.hashtags;
  switch (platform) {
    case "youtube":
      return { title: meta.title, body: withTags([meta.youtubeDescription], tags), hashtags: tags };
    case "youtube-shorts": {
      if (meta.shortsPost) return meta.shortsPost;
      const shortTags = [...tags, "#shorts"];
      return { title: shortFormTitle(meta), body: withTags([meta.universalCaption], shortTags), hashtags: shortTags };
    }
    case "tiktok":
      return {
        body: fitCaption(
          meta.universalCaption.startsWith(meta.hook) ? [meta.universalCaption] : [meta.hook, "", meta.universalCaption],
          tags
        ),
        hashtags: tags,
      };
    case "facebook-reels":
    case "instagram-reels": {
      const single =
        meta.contentType === "vocabulary-item" || meta.contentType === "grammar-item" || meta.contentType === "register-pair";
      const context = meta.subheading && !single
        ? [`${meta.heading} · ${meta.subheading}`]
        : [meta.heading];
      return { body: fitCaption([meta.universalCaption, "", ...context], tags), hashtags: tags };
    }
    case "universal":
      return { body: fitCaption([meta.universalCaption], tags), hashtags: tags };
  }
}

/** Drop trailing caption lines until the caption fits SHORT_CAPTION_MAX. */
function fitCaption(lines: readonly string[], tags: readonly string[]): string {
  const all = lines.flatMap((l) => l.split("\n"));
  let text = withTags(all, tags);
  for (let keep = all.length - 1; charLength(text) > SHORT_CAPTION_MAX && keep > 1; keep--) {
    text = withTags(all.slice(0, keep), tags);
  }
  return text;
}

/** Title, description and hashtags as one block (YouTube "Copy All"). */
export function formatYoutubeFull(meta: SocialMeta): string {
  return [meta.title, "", meta.youtubeDescription, "", meta.hashtags.join(" ")].join("\n");
}

/** Every platform in one paste, for keeping a record of the post. */
export function formatAllPosts(meta: SocialMeta): string {
  const blocks = SOCIAL_PLATFORMS.map(({ id, label }) => {
    const post = formatSocialPost(meta, id);
    return [`=== ${label} ===`, post.title ? `Title: ${post.title}` : "", post.body].filter(Boolean).join("\n");
  });
  const tags = formatYoutubeTags(meta);
  if (tags) blocks.push(`=== YouTube tags ===\n${tags}`);
  if (meta.pinnedComment) blocks.push(`=== Pinned comment ===\n${meta.pinnedComment}`);
  return blocks.join("\n\n");
}

/** The YouTube Tags field: keywords, comma-separated, within 500 characters. */
export function formatYoutubeTags(meta: SocialMeta): string {
  return formatTags(meta.keywords);
}

function withAudience(lines: readonly string[]): string {
  return [...lines, "", AUDIENCE_LINE].join("\n");
}

function unique(values: readonly (string | undefined)[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    const t = v?.trim();
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}
