import { describe, expect, it } from "vitest";
import { tocGroups } from "../../data/toc";
import { getPlaylistLessonById } from "../../data/playlists";
import { getVocabularyByIds } from "../../data/vocabulary";
import { getGrammarItemsForLesson, getGrammarLessonById } from "../../data/grammar";
import { buildShortMeta, shortHashtags } from "../../pages/Shorts/shortsMeta";
import { MESSAGE_HOOK_LABEL, messageFor } from "../../pages/Shorts/shortMessage";
import {
  buildGrammarItemSocialMeta,
  buildVocabularyItemSocialMeta,
  formatAllPosts,
  formatSocialPost,
  SHORT_CAPTION_MAX,
  SOCIAL_PLATFORMS,
} from "./socialMeta";
import { buildSocialMetaForTarget, buildSocialMetaForTocItem, parentTocIdFor, tocItemHasSocial } from "./socialSources";
import { getSocialStatus, setSocialStatus } from "./socialStatus";
import {
  AUDIENCE_LINE,
  AUDIENCE_LINE_SHORT,
  buildHashtags,
  charLength,
  firstSense,
  fitTitle,
  TITLE_MAX,
} from "./socialText";

const n5Lesson = getPlaylistLessonById("pl-n5-03")!;
const n5Words = getVocabularyByIds(n5Lesson.vocabularyIds);
const n2Grammar = getGrammarLessonById("grammar-batch-001-010")!;
const n2Patterns = getGrammarItemsForLesson(n2Grammar);

describe("vocabulary item post", () => {
  const word = n5Words[0]!;
  const meta = buildSocialMetaForTarget({ type: "vocabulary-item", id: word.id })!;

  it("comes from the word's own data and its playlist place", () => {
    expect(meta.level).toBe("N5");
    expect(meta.title).toContain(word.word);
    expect(meta.title).toContain(firstSense(word.meaning));
    expect(meta.title).toContain("JLPT N5");
    expect(meta.youtubeDescription).toContain(word.meaning);
    expect(meta.youtubeDescription).toContain(word.sentence);
    expect(meta.youtubeDescription).toContain(word.sentenceMeaning);
    expect(meta.youtubeDescription).toContain(`Full lesson: JLPT N5 Vocabulary #3 | ${n5Lesson.subtitle}`);
    expect(meta.heading).toMatch(/word #\d+/);
  });

  it("adds the nuance only when the word has one, and skips a missing example", () => {
    const plain = buildVocabularyItemSocialMeta({ ...word, wordNuance: undefined, sentence: "" }, { level: "N5" });
    expect(plain.youtubeDescription).not.toContain("Note:");
    expect(plain.youtubeDescription).not.toContain("Example:");
    const noted = buildVocabularyItemSocialMeta({ ...word, wordNuance: "A short usage note." }, { level: "N5" });
    expect(noted.youtubeDescription).toContain("Note:\nA short usage note.");
  });

  it("keeps the reading out when the word is kana", () => {
    const kana = buildVocabularyItemSocialMeta({ ...word, word: "ある", reading: "ある" }, { level: "N5" });
    expect(kana.title.startsWith("ある — ")).toBe(true);
  });

  it("fits very long meanings into the YouTube title limit", () => {
    const long = buildVocabularyItemSocialMeta({ ...word, meaning: "x".repeat(300) }, { level: "N5" });
    expect(charLength(long.title)).toBeLessThanOrEqual(TITLE_MAX);
    expect(long.title.endsWith("| JLPT N5 Japanese Vocabulary")).toBe(true);
  });
});

describe("vocabulary lesson post", () => {
  const meta = buildSocialMetaForTarget({ type: "toc", id: "word-pl-n5-03" })!;

  it("lists the lesson's real words with level, number and theme", () => {
    expect(meta.contentType).toBe("vocabulary-lesson");
    expect(meta.heading).toBe("JLPT N5 Vocabulary #3");
    expect(meta.youtubeDescription).toContain(`Learn ${n5Words.length} JLPT N5 Japanese vocabulary words: ${n5Lesson.subtitle}.`);
    for (const w of n5Words.slice(0, 10)) expect(meta.youtubeDescription).toContain(w.word);
    expect(meta.children?.map((c) => c.id)).toEqual(n5Words.map((w) => w.id));
  });
});

describe("grammar posts", () => {
  it("builds a pattern post from the GrammarItem only", () => {
    const g = n2Patterns[0]!;
    const meta = buildSocialMetaForTarget({ type: "grammar-item", id: g.id })!;
    expect(meta.level).toBe("N2");
    expect(meta.title).toContain(g.pattern);
    expect(meta.youtubeDescription).toContain(`Formation:\n${g.formation}`);
    expect(meta.youtubeDescription).toContain(g.sentence);
    expect(meta.youtubeDescription).toContain("Lesson: JLPT N2 Grammar 1–10");
    const bare = buildGrammarItemSocialMeta({ ...g, nuance: undefined });
    expect(bare.youtubeDescription).not.toContain("Use:");
  });

  it("lists every pattern of a batch with its themes", () => {
    const meta = buildSocialMetaForTarget({ type: "toc", id: "grammar-f1-10" })!;
    expect(meta.heading).toBe("JLPT N2 Grammar 1–10");
    for (const g of n2Patterns) expect(meta.youtubeDescription).toContain(g.pattern);
    expect(meta.children).toHaveLength(n2Patterns.length);
  });

  it("uses the course track for N3 and N1 lessons", () => {
    expect(buildSocialMetaForTarget({ type: "toc", id: "n3-grammar-01" })?.level).toBe("N3");
    const n1 = buildSocialMetaForTarget({ type: "toc", id: "n1-grammar-01" })!;
    expect(n1.level).toBe("N1");
    expect(n1.title).toContain("〜とはいえ");
  });

  it("links an N3 pattern to its N3 TOC lesson", () => {
    const lesson = buildSocialMetaForTarget({ type: "toc", id: "n3-grammar-01" })!;
    const child = lesson.children![0]!;
    const meta = buildSocialMetaForTarget({ type: child.type, id: child.id })!;
    expect(meta.youtubeDescription).toContain("Lesson: JLPT N3 Grammar 1–10");
    expect(parentTocIdFor({ type: child.type, id: child.id })).toBe("n3-grammar-01");
  });
});

describe("quiz posts", () => {
  it("describes a vocabulary quiz by its lesson", () => {
    const meta = buildSocialMetaForTarget({ type: "toc", id: "quiz-vocab-pl-n5-03" })!;
    expect(meta.contentType).toBe("quiz");
    expect(meta.title).toContain("JLPT N5 Vocabulary Quiz #3");
    expect(meta.youtubeDescription).toContain(`Test yourself on ${n5Words.length} Japanese words from ${n5Lesson.subtitle}.`);
    expect(meta.hashtags).toContain("#jlptquiz");
  });

  it("describes a grammar quiz by its range and themes", () => {
    const meta = buildSocialMetaForTarget({ type: "toc", id: "quiz-grammar-1-10" })!;
    expect(meta.title).toContain("JLPT N2 Grammar Quiz 1–10");
    expect(meta.hashtags).toContain("#japanesegrammar");
  });
});

describe("hashtags", () => {
  it("are a fixed, content-based set of 5–10 tags", () => {
    for (const kind of ["vocabulary", "grammar", "vocabulary-quiz", "grammar-quiz", "topic"] as const) {
      for (const shortForm of [false, true]) {
        const tags = buildHashtags({ level: "N3", kind, shortForm });
        expect(tags.length).toBeGreaterThanOrEqual(5);
        expect(tags.length).toBeLessThanOrEqual(10);
        expect(new Set(tags).size).toBe(tags.length);
        expect(tags).toContain("#jlptn3");
        expect(tags.includes("#shorts")).toBe(shortForm);
      }
    }
  });

  it("keeps the Shorts studio set, with the English-learner tags before #shorts", () => {
    expect(shortHashtags("N5")).toEqual([
      "#learnjapanese",
      "#japanese",
      "#jlpt",
      "#jlptn5",
      "#japanesevocabulary",
      "#nihongo",
      "#learnenglish",
      "#英語学習",
      "#shorts",
    ]);
  });

  it("names both audiences in every description and caption", () => {
    const targets = [
      { type: "toc", id: "word-pl-n5-03" },
      { type: "vocabulary-item", id: n5Words[0]!.id },
      { type: "short", id: n5Words[0]!.id },
    ] as const;
    for (const target of targets) {
      const meta = buildSocialMetaForTarget(target)!;
      expect(meta.hashtags).toContain("#learnenglish");
      expect(formatSocialPost(meta, "youtube").body).toContain(AUDIENCE_LINE);
      expect(formatSocialPost(meta, "tiktok").body).toContain(AUDIENCE_LINE_SHORT);
    }
    const short = formatSocialPost(buildSocialMetaForTarget(targets[2])!, "youtube-shorts");
    expect(short.body).toContain(AUDIENCE_LINE);
  });
});

describe("platform formatting", () => {
  const meta = buildSocialMetaForTarget({ type: "toc", id: "word-pl-n5-03" })!;

  it("adds #shorts only on YouTube Shorts", () => {
    for (const { id } of SOCIAL_PLATFORMS) {
      const post = formatSocialPost(meta, id);
      expect(post.body.includes("#shorts")).toBe(id === "youtube-shorts");
    }
  });

  it("does not repeat the hook on TikTok", () => {
    const body = formatSocialPost(meta, "tiktok").body;
    expect(body.split(meta.hook).length - 1).toBe(1);
  });

  it("puts every platform and the pinned comment in Copy All", () => {
    const all = formatAllPosts(meta);
    for (const { label } of SOCIAL_PLATFORMS) expect(all).toContain(`=== ${label} ===`);
    expect(all).toContain(meta.pinnedComment!);
  });

  it("fitTitle falls back to a shorter head, then clips", () => {
    expect(fitTitle(["a".repeat(95), "short"], " | tail")).toBe("short | tail");
    expect(charLength(fitTitle(["b".repeat(200)], " | tail"))).toBeLessThanOrEqual(TITLE_MAX);
  });
});

describe("TOC → post", () => {
  const items = tocGroups.flatMap((g) => g.items);

  it("resolves every vocabulary lesson, grammar lesson and quiz entry", () => {
    const missing = items
      .filter((i) => i.kind === "word" || i.kind === "grammar" || i.kind === "quiz")
      .filter((i) => !buildSocialMetaForTocItem(i))
      .map((i) => i.id);
    expect(missing).toEqual([]);
  });

  it("matches the playlist level and stays within title and caption limits", () => {
    for (const item of items.filter(tocItemHasSocial)) {
      const meta = buildSocialMetaForTocItem(item)!;
      const pl = /-pl-(n[1-5])-/.exec(item.id);
      if (pl) expect(meta.level).toBe(pl[1]!.toUpperCase());
      expect(charLength(meta.title), item.id).toBeLessThanOrEqual(TITLE_MAX);
      for (const p of ["tiktok", "universal", "instagram-reels"] as const) {
        expect(charLength(formatSocialPost(meta, p).body), `${item.id} ${p}`).toBeLessThanOrEqual(SHORT_CAPTION_MAX);
      }
    }
  });

  it("offers no post for entries without an adapter yet", () => {
    for (const item of items.filter((i) => i.kind === "register" || i.kind === "intro" || i.kind === "glossary")) {
      expect(tocItemHasSocial(item)).toBe(false);
    }
  });
});

describe("Shorts studio post", () => {
  const word = n5Words[0]!;
  const short = buildShortMeta(
    word,
    { level: "N5", wordNumber: 23, lessonNumber: 3, lessonTheme: n5Lesson.subtitle },
    { strokeCredit: true }
  );
  const meta = buildSocialMetaForTarget({ type: "short", id: word.id, strokeCredit: true })!;

  it("keeps the Short's own title, description and pinned comment on the Shorts tab", () => {
    expect(formatSocialPost(meta, "youtube-shorts")).toEqual({
      title: short.title,
      body: short.description,
      hashtags: short.hashtags,
    });
    expect(meta.pinnedComment).toBe(short.pinnedComment);
    expect(meta.badge).toBe(`Hook: ${short.hookLabel}`);
    expect(meta.heading).toBe("Short · JLPT N5 word #23");
  });

  it("formats the other platforms from the word's post, with its own status id", () => {
    const item = buildSocialMetaForTarget({ type: "vocabulary-item", id: word.id })!;
    expect(formatSocialPost(meta, "tiktok")).toEqual(formatSocialPost(item, "tiktok"));
    expect(meta.contentId).toBe(`short-${word.id}`);
    expect(parentTocIdFor({ type: "short", id: word.id })).toBeNull();
  });

  it("carries the studio's hook style into the upload text", () => {
    const texted = n5Words.find((w) => messageFor(w, "message"))!;
    const post = buildSocialMetaForTarget({ type: "short", id: texted.id, hookStyle: "message" })!;
    expect(post.badge).toBe(`Hook: ${MESSAGE_HOOK_LABEL}`);
    expect(post.shortsPost?.title).toMatch(/texted you/);
    const classic = buildSocialMetaForTarget({ type: "short", id: texted.id, hookStyle: "classic" })!;
    expect(classic.badge).not.toBe(`Hook: ${MESSAGE_HOOK_LABEL}`);
  });
});

describe("production status", () => {
  it("persists per content id in localStorage", () => {
    setSocialStatus("vocab-1", "recorded");
    expect(getSocialStatus("vocab-1")).toBe("recorded");
    setSocialStatus("vocab-1", "none");
    expect(getSocialStatus("vocab-1")).toBe("none");
  });
});
