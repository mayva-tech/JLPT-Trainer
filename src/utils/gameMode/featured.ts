import type { GameModeId } from "./types";

export type FeaturedChallenge = {
  mode: GameModeId;
  title: string;
  blurb: string;
};

const FEATURED: FeaturedChallenge[] = [
  {
    mode: "survival",
    title: "Survival gauntlet",
    blurb: "How long can you last with three lives and rising difficulty?",
  },
  {
    mode: "speed",
    title: "Sixty-second sprint",
    blurb: "Answer as many vocabulary and expression questions as you can.",
  },
  {
    mode: "revenge",
    title: "Weak Word hunt",
    blurb: "Take two hits at the words that keep tripping you up.",
  },
  {
    mode: "boss",
    title: "Face 語彙の鬼",
    blurb: "Chip away at the Vocabulary Demon before your hearts run out.",
  },
];

export function todaysFeaturedChallenge(at: number = Date.now()): FeaturedChallenge {
  const date = new Date(at);
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return FEATURED[((day % FEATURED.length) + FEATURED.length) % FEATURED.length]!;
}
