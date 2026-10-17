import type { RegisterPair } from "../types/register";
import type { ItemHook } from "./itemHookSpeech";
import {
  CHECK_LABELS,
  firstSense,
  seeded,
  shuffle,
  stableHash,
} from "../components/Retention/retentionQuiz";

/**
 * Retention hooks for the Register (casual ⇄ formal) Play All video.
 *
 * Same rules as the Player's lesson hooks, adapted to a pair:
 *   - Hook: after the casual form, the formal side stays hidden behind
 *     "Can you say it politely?" with a countdown before it is revealed.
 *     The line is spoken on the first pair only; the banner carries it after.
 *   - Pause & answer: a three-choice check every `checkEvery` pairs
 *     (`checkpointIndices`), about one pair since the previous checkpoint.
 *     Odd checkpoints ask for the polite form, even ones for the meaning.
 * Everything comes from the section's own pairs and a stable hash, so a
 * re-recording produces the same questions.
 */

export const POLITE_HOOK_EN = "Can you say it politely?";
export const POLITE_HOOK_JA = "丁寧に言えますか？";

export type RegisterCheckKind = "polite" | "meaning";

export interface RegisterCheckOption {
  label: "A" | "B" | "C";
  text: string;
  /** Japanese options (polite questions) use the JP font and voice. */
  lang: "ja" | "en";
  correct: boolean;
}

export interface RegisterCheckCard {
  kind: RegisterCheckKind;
  pair: RegisterPair;
  options: RegisterCheckOption[];
  /** 1-based number of this checkpoint in the section. */
  number: number;
}

/**
 * One checkpoint question.
 *
 * @param window  pairs played since the previous checkpoint
 * @param pool    the whole section — wrong answers come from here first
 * @param number  1-based checkpoint number (odd: polite form, even: meaning)
 */
export function buildRegisterCheckCard(
  window: readonly RegisterPair[],
  pool: readonly RegisterPair[],
  number: number,
  fallback: readonly RegisterPair[] = []
): RegisterCheckCard | null {
  if (window.length === 0) return null;
  const rand = seeded(stableHash(window.map((p) => p.id).join(",") + `#reg${number}`));
  const target = window[Math.floor(rand() * window.length)]!;
  const kind: RegisterCheckKind = number % 2 === 1 ? "polite" : "meaning";

  const others = [
    ...shuffle(pool.filter((p) => p.id !== target.id), rand),
    ...shuffle(
      fallback.filter((p) => p.id !== target.id && !pool.some((q) => q.id === p.id)),
      rand
    ),
  ];

  let answer: string;
  const wrong: string[] = [];
  const lang: "ja" | "en" = kind === "polite" ? "ja" : "en";
  if (kind === "polite") {
    answer = target.formal.text;
    // The casual form of the same line is the real trap; then another
    // pair's formal form.
    const candidates = [target.casual.text, ...others.map((p) => p.formal.text)];
    for (const c of candidates) {
      if (!c.trim() || c === answer || wrong.includes(c)) continue;
      wrong.push(c);
      if (wrong.length === 2) break;
    }
  } else {
    answer = firstSense(target.meaning);
    const seen = new Set([answer.toLowerCase()]);
    for (const p of others) {
      const text = firstSense(p.meaning);
      if (!text || seen.has(text.toLowerCase())) continue;
      seen.add(text.toLowerCase());
      wrong.push(text);
      if (wrong.length === 2) break;
    }
  }
  if (wrong.length < 2) return null;

  const texts = shuffle([answer, ...wrong], rand);
  return {
    kind,
    pair: target,
    number,
    options: texts.map((text, i) => ({
      label: CHECK_LABELS[i]!,
      text,
      lang,
      correct: text === answer,
    })),
  };
}

interface RegisterSectionLike {
  id: string;
  subtitle?: string;
}

const CLOSING_LINES: readonly { id: string; en: (topic: string) => string; ja: string }[] = [
  {
    id: "r-o-comment",
    en: (t) => `That's ${t}! Which polite phrase will you use first? Tell us in the comments!`,
    ja: "おつかれさまでした！",
  },
  {
    id: "r-o-boss",
    en: (t) => `That's ${t}! Try one of these polite lines at work or in a shop this week!`,
    ja: "使(つか)ってみてください！",
  },
  {
    id: "r-o-replay",
    en: (t) => `That's ${t}! Replay it and say the polite side before Nanami does!`,
    ja: "もう一度(いちど)、練習(れんしゅう)しましょう！",
  },
];

/** Closing remark after the last pair of a section's Play All. */
export function registerClosingHook(section: RegisterSectionLike | undefined): ItemHook {
  const topic = section?.subtitle ? section.subtitle.toLowerCase() : "the section";
  const line = CLOSING_LINES[stableHash(`reg-close:${section?.id ?? ""}`) % CLOSING_LINES.length]!;
  const en = line.en(topic);
  return {
    id: line.id,
    kind: "outro",
    voice: "en",
    tag: "Wrap-up",
    en,
    spokenEn: en.replace(/\s*&\s*/g, " and "),
    ja: line.ja,
  };
}

/** The on-screen prompt. */
export function registerCheckQuestion(card: RegisterCheckCard): string {
  return card.kind === "polite"
    ? "Which is the polite way to say it?"
    : "What does this mean?";
}

/** The spoken prompt (the polite question also says the English line). */
export function registerCheckSpoken(card: RegisterCheckCard): string {
  return card.kind === "polite"
    ? `Pause and answer! Which is the polite way to say: ${card.pair.meaning}`
    : `Pause and answer! ${registerCheckQuestion(card)}`;
}
