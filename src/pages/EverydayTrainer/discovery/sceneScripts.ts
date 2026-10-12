import { parseFurigana, stripFurigana } from "../../../lib/japanese/furigana";

/**
 * Intro and outro for each scene's show (Play all / Guided): a short
 * exchange between Nanami (Japanese) and Andrew (English) about the place.
 *
 * Japanese lines are kept short and beginner-friendly, written in furigana
 * notation (台所(だいどころ)) so the screen shows the readings and the voice gets
 * them; each has an English subtitle. `{n}` in an English line becomes the
 * number of objects in the scene, in words.
 */

export type Speaker = "nanami" | "andrew";

export interface ShowLine {
  speaker: Speaker;
  /** Japanese in furigana notation (Nanami) or English (Andrew). */
  text: string;
  /** English subtitle under a Japanese line. */
  sub?: string;
}

export interface SceneScript {
  intro: readonly ShowLine[];
  /** The last Andrew line is the call to comment (comment bait). */
  outro: readonly ShowLine[];
}

export const SPEAKER_NAME: Record<Speaker, { en: string; ja: string }> = {
  nanami: { en: "Nanami", ja: "七海" },
  andrew: { en: "Andrew", ja: "アンドリュー" },
};

export const SCENE_SCRIPTS: Readonly<Record<string, SceneScript>> = {
  kitchen: {
    intro: [
      { speaker: "andrew", text: "Welcome to a typical Japanese apartment kitchen." },
      { speaker: "nanami", text: "ここは台所(だいどころ)です。", sub: "This is the kitchen." },
      { speaker: "andrew", text: "It's small, but it's full of useful words. Let's find all {n}!" },
      { speaker: "nanami", text: "いっしょに見(み)てみましょう！", sub: "Let's take a look together!" },
    ],
    outro: [
      { speaker: "nanami", text: "台所(だいどころ)の言葉(ことば)、全部(ぜんぶ)見(み)つけました！", sub: "We found every word in the kitchen!" },
      { speaker: "andrew", text: "That's {n} kitchen words. Nice work!" },
      { speaker: "nanami", text: "おつかれさまでした！", sub: "Great job today!" },
      { speaker: "andrew", text: "Which word was new to you? Tell us in the comments!" },
    ],
  },
  train: {
    intro: [
      { speaker: "andrew", text: "All aboard! We're inside a Tokyo commuter train." },
      { speaker: "nanami", text: "電車(でんしゃ)の中(なか)です。", sub: "We're on the train." },
      { speaker: "andrew", text: "Straps, priority seats, the luggage rack. Let's learn all {n}!" },
      { speaker: "nanami", text: "出発(しゅっぱつ)します！", sub: "We're departing!" },
    ],
    outro: [
      { speaker: "nanami", text: "次(つぎ)は、終点(しゅうてん)です。", sub: "Next stop, the end of the line." },
      { speaker: "andrew", text: "That's {n} words from the train. Great ride!" },
      { speaker: "nanami", text: "ご乗車(じょうしゃ)ありがとうございました。", sub: "Thank you for riding with us." },
      { speaker: "andrew", text: "Which word will you use on your next train ride? Tell us in the comments!" },
    ],
  },
  street: {
    intro: [
      { speaker: "andrew", text: "Let's take a walk down a Japanese side street." },
      { speaker: "nanami", text: "町(まち)を歩(ある)いてみましょう。", sub: "Let's walk around town." },
      { speaker: "andrew", text: "Poles, mirrors, vending machines. {N} words to find!" },
      { speaker: "nanami", text: "さあ、行(い)きましょう！", sub: "Come on, let's go!" },
    ],
    outro: [
      { speaker: "nanami", text: "町(まち)の言葉(ことば)、全部(ぜんぶ)見(み)つけました！", sub: "We found every word on the street!" },
      { speaker: "andrew", text: "That's {n} street words. Now you can read a Japanese street like a local." },
      { speaker: "nanami", text: "また歩(ある)きましょうね。", sub: "Let's go for a walk again." },
      { speaker: "andrew", text: "Which one surprised you most? Tell us in the comments!" },
    ],
  },
};

/** The "Can you name it?" hook before each object (Player rule: spoken once, then the banner carries it). */
export const HOOK_EN = "What's this called in Japanese?";
export const HOOK_JA = "これは何(なん)ですか？";

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** `{n}` → "fifteen", `{N}` → "Fifteen" (digits above twenty). */
export function fillCount(text: string, count: number): string {
  const word = NUMBER_WORDS[count] ?? String(count);
  return text.replaceAll("{n}", word).replaceAll("{N}", word.charAt(0).toUpperCase() + word.slice(1));
}

/** Kana reading of a furigana-notation line, for the voice: 台所(だいどころ)です → だいどころです. */
export function lineReading(text: string): string {
  return parseFurigana(text)
    .map((s) => s.reading ?? s.base)
    .join("");
}

/** Plain Japanese of a line (what Nanami's line shows without readings). */
export function linePlain(text: string): string {
  return stripFurigana(text);
}

export function scriptFor(sceneId: string): SceneScript | null {
  return SCENE_SCRIPTS[sceneId] ?? null;
}
