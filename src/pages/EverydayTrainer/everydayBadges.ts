import { EVERYDAY_WORDS, categoryById, wordsInCategory } from "./everydayData";
import type { EverydayProgress } from "./everydayProgress";

/**
 * Achievements for this trainer, derived from progress (nothing extra is
 * stored, so they can never disagree with it). Pera Pera Quest keeps its own
 * achievement list tied to its RPG profile; these stay separate on purpose so
 * the two progress stores never conflict.
 */
export interface Badge {
  id: string;
  title: string;
  icon: string;
  /** What earns it, shown under the title. */
  goal: string;
  done: number;
  total: number;
}

type Measure = "explored" | "learned";

const DEFINITIONS: readonly {
  id: string;
  title: string;
  icon: string;
  categoryId: string | null;
  measure: Measure;
}[] = [
  { id: "home-explorer", title: "Home Explorer", icon: "🏠", categoryId: "home", measure: "explored" },
  { id: "street-smart", title: "Street Smart", icon: "🚥", categoryId: "street", measure: "learned" },
  { id: "train-master", title: "Train Master", icon: "🚃", categoryId: "train", measure: "learned" },
  { id: "airport-navigator", title: "Airport Navigator", icon: "✈️", categoryId: "airport", measure: "learned" },
  { id: "everyday-master", title: "Everyday Japanese Master", icon: "🏅", categoryId: null, measure: "learned" },
];

export function computeBadges(progress: EverydayProgress): Badge[] {
  const explored = new Set(progress.practiced);
  const learned = new Set(progress.known);
  return DEFINITIONS.map((d) => {
    const words = d.categoryId ? wordsInCategory(d.categoryId) : EVERYDAY_WORDS;
    const set = d.measure === "explored" ? explored : learned;
    const verb = d.measure === "explored" ? "Explore" : "Learn";
    const where = d.categoryId ? `${categoryById(d.categoryId)?.english ?? d.categoryId} ` : "";
    return {
      id: d.id,
      title: d.title,
      icon: d.icon,
      goal: `${verb} all ${words.length} ${where}words`,
      done: words.filter((w) => set.has(w.id)).length,
      total: words.length,
    };
  });
}
