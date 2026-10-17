import type { RegisterPair } from "../types/register";

/**
 * A small animated icon for a register pair's opening beat — the first second
 * of each card moves instead of sitting still like a slide. Picked from the
 * meaning first (a walking figure for "I'll go / I'm coming", a ringing phone
 * for calls), then from the section, so every card has one.
 *
 * `motion` names the CSS animation the icon plays once as the card appears.
 */

export type IconMotion = "walk" | "ring" | "bow" | "wave" | "pop";

export interface RegisterIcon {
  emoji: string;
  motion: IconMotion;
}

const BY_MEANING: readonly [RegExp, RegisterIcon][] = [
  [/\b(call|phone|ring)\b/i, { emoji: "📞", motion: "ring" }],
  [/\b(go|going|come|coming|visit|leave|leaving|on my way|head out)\b/i, { emoji: "🚶", motion: "walk" }],
  [/\b(sorry|apolog|excuse|forgive)/i, { emoji: "🙇", motion: "bow" }],
  [/\b(thank|thanks|grateful|appreciate)/i, { emoji: "🙏", motion: "bow" }],
  [/\b(hello|hi|good morning|good evening|good night|bye|see you|welcome|nice to meet)\b/i, { emoji: "👋", motion: "wave" }],
  [/\b(eat|drink|meal|order|menu|food|restaurant)\b/i, { emoji: "🍽️", motion: "pop" }],
  [/\b(buy|pay|price|shop|receipt|bag)\b/i, { emoji: "🛍️", motion: "pop" }],
  [/\b(wait|moment|time|late|early|when)\b/i, { emoji: "⏰", motion: "ring" }],
  [/\b(think|opinion|agree|disagree|feel|believe|sure)\b/i, { emoji: "💭", motion: "pop" }],
  [/\b(ask|question|could you|can you|would you|please|may i|help)\b/i, { emoji: "🙋", motion: "wave" }],
  [/\b(understand|know|see)\b/i, { emoji: "💡", motion: "pop" }],
];

const BY_CATEGORY: Readonly<Record<string, RegisterIcon>> = {
  "質問・依頼": { emoji: "🙋", motion: "wave" },
  "あいさつ・返事": { emoji: "👋", motion: "wave" },
  "会社・ビジネス": { emoji: "💼", motion: "pop" },
  "買い物・外食": { emoji: "🛍️", motion: "pop" },
  "気持ち・意見": { emoji: "💭", motion: "pop" },
};

const FALLBACK: RegisterIcon = { emoji: "💬", motion: "pop" };

export function registerIcon(pair: Pick<RegisterPair, "meaning" | "category">): RegisterIcon {
  for (const [re, icon] of BY_MEANING) if (re.test(pair.meaning)) return icon;
  return BY_CATEGORY[pair.category] ?? FALLBACK;
}
