import type { HeadReactionKind } from "../../services/reactionBus";

/** Face the head pulls; the eye/nose/mouth geometry itself never changes. */
export type Expression = "neutral" | "happy" | "sad" | "hmm" | "joy" | "cheer";

/** Whole-head motion played once per reaction. */
export type HeadMotion = "none" | "hop" | "hop2" | "shake" | "nod";

/** Overlay effects drawn around the head. */
export type ReactionFx =
  | "sparkle"
  | "sparkles"
  | "sweat"
  | "gloom"
  | "question"
  | "blush"
  | "confetti"
  | "heart";

export interface ReactionStyle {
  expression: Expression;
  motion: HeadMotion;
  fx: readonly ReactionFx[];
  /** How long the face holds the reaction, in ms. */
  durationMs: number;
  /** Extra head tilt in degrees while the reaction lasts (0 = idle tilt). */
  tiltDeg: number;
}

export const REACTION_STYLE: Record<HeadReactionKind, ReactionStyle> = {
  correct: { expression: "happy", motion: "hop", fx: ["sparkle"], durationMs: 1600, tiltDeg: 0 },
  wrong: { expression: "sad", motion: "shake", fx: ["sweat", "gloom"], durationMs: 1800, tiltDeg: 0 },
  almost: { expression: "hmm", motion: "none", fx: ["question"], durationMs: 1700, tiltDeg: 9 },
  streak: { expression: "joy", motion: "hop2", fx: ["sparkles", "blush"], durationMs: 2200, tiltDeg: 0 },
  celebrate: { expression: "joy", motion: "hop2", fx: ["confetti", "sparkles", "blush"], durationMs: 2800, tiltDeg: 0 },
  encourage: { expression: "cheer", motion: "nod", fx: ["heart"], durationMs: 2400, tiltDeg: 0 },
};

/**
 * Speech-bubble lines. Nanami's are Japanese on purpose — short, real
 * reactions a learner hears every day. Andrew's are the English equivalents.
 * `{n}` is replaced with the streak length.
 */
export const REACTION_LINES: Record<"ja" | "en", Record<HeadReactionKind, readonly string[]>> = {
  ja: {
    correct: ["正解！", "いいね！", "その通り！", "さすが！"],
    wrong: ["残念…", "あれれ？", "ちがうよ〜", "うーん…"],
    almost: ["おしい！", "もう少し！", "なるほど…？"],
    streak: ["{n}連続！", "{n}問連続正解！", "絶好調！"],
    celebrate: ["やったね！", "お疲れさま！", "すごい！"],
    encourage: ["ドンマイ！", "がんばって！", "大丈夫！"],
  },
  en: {
    correct: ["Nice!", "Correct!", "Exactly!", "Well done!"],
    wrong: ["Oops…", "Not quite…", "Hmm, no…"],
    almost: ["Close!", "Almost!", "Nearly there!"],
    streak: ["{n} in a row!", "On fire — {n}!", "Streak x{n}!"],
    celebrate: ["You did it!", "Great session!", "Amazing!"],
    encourage: ["Don't give up!", "You've got this!", "Keep going!"],
  },
};

/** Pick a line for this reaction; `pick` is 0–1 (Math.random in the app). */
export function reactionLine(
  lang: "ja" | "en",
  kind: HeadReactionKind,
  count: number,
  pick: number
): string {
  const lines = REACTION_LINES[lang][kind];
  const i = Math.min(lines.length - 1, Math.max(0, Math.floor(pick * lines.length)));
  return lines[i].replace("{n}", String(count));
}

/** Eyebrow transform per expression. `side` is the viewer's left/right brow. */
export function browTransform(expression: Expression, side: "l" | "r"): string {
  const inward = side === "l" ? -1 : 1;
  switch (expression) {
    case "happy":
      return "translateY(-1.4px)";
    case "joy":
      return "translateY(-2.2px)";
    case "cheer":
      return `translateY(-1.2px) rotate(${inward * -4}deg)`;
    case "sad":
      return `translateY(-0.4px) rotate(${inward * 12}deg)`;
    case "hmm":
      return side === "l" ? "translateY(-2.6px) rotate(-4deg)" : "translateY(0.8px) rotate(3deg)";
    default:
      return "none";
  }
}
