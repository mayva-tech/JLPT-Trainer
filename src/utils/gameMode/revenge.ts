import type { VocabularyItem } from "../../types/vocabulary";
import {
  getVocabQuizItemStats,
  isWeakVocabItem,
  loadVocabQuizStats,
  recordVocabQuizAnswer,
  type VocabQuizStore,
} from "../vocabQuizStats";
import { getWeakVocabularyReviewItems } from "../weakVocabularyReview";
import { seededShuffle } from "../vocabularyQuiz";
import { vocabQuestion, type GameContentPools } from "./questions";
import type { GameQuestion } from "./types";

export const REVENGE_ENEMY_HP = 2;

export type RevengeEnemy = {
  item: VocabularyItem;
  hp: number;
  maxHp: number;
  attempted: boolean;
  hits: number;
  misses: number;
};

export function createRevengeEnemies(
  items: VocabularyItem[] = getWeakVocabularyReviewItems(),
  seed = "revenge"
): RevengeEnemy[] {
  return seededShuffle(items, seed).map((item) => ({
    item,
    hp: REVENGE_ENEMY_HP,
    maxHp: REVENGE_ENEMY_HP,
    attempted: false,
    hits: 0,
    misses: 0,
  }));
}

export function livingRevengeEnemies(enemies: RevengeEnemy[]): RevengeEnemy[] {
  return enemies.filter((enemy) => enemy.hp > 0);
}

export function rotateRevengeQueue(
  enemies: RevengeEnemy[],
  justPlayedId: number
): RevengeEnemy[] {
  const living = livingRevengeEnemies(enemies);
  const rest = living.filter((enemy) => enemy.item.id !== justPlayedId);
  const played = living.filter((enemy) => enemy.item.id === justPlayedId);
  const defeated = enemies.filter((enemy) => enemy.hp === 0);
  return [...rest, ...played, ...defeated];
}

export function applyRevengeAnswer(
  enemies: RevengeEnemy[],
  itemId: number,
  correct: boolean
): { enemies: RevengeEnemy[]; defeated: boolean; remainingHp: number } {
  let defeated = false;
  let remainingHp = 0;
  const next = enemies.map((enemy) => {
    if (enemy.item.id !== itemId) return enemy;
    const hits = enemy.hits + (correct ? 1 : 0);
    const hp = correct ? Math.max(0, enemy.hp - 1) : enemy.hp;
    defeated = correct && hp === 0;
    remainingHp = hp;
    return {
      ...enemy,
      attempted: true,
      hits,
      misses: enemy.misses + (correct ? 0 : 1),
      hp,
    };
  });
  return { enemies: next, defeated, remainingHp };
}

export function revengeSummary(
  enemies: RevengeEnemy[],
  store?: VocabQuizStore | null
) {
  const attempted = enemies.filter((enemy) => enemy.attempted);
  const defeated = enemies.filter((enemy) => enemy.hp === 0);
  const hits = enemies.reduce((sum, enemy) => sum + enemy.hits, 0);
  const misses = enemies.reduce((sum, enemy) => sum + enemy.misses, 0);
  const file = loadVocabQuizStats(store === undefined ? undefined : store);
  const stillNeedingReview: string[] = [];
  const improved: string[] = [];
  for (const enemy of attempted) {
    const stats = getVocabQuizItemStats(enemy.item.id, file);
    if (stats && isWeakVocabItem(stats)) {
      stillNeedingReview.push(enemy.item.word);
    } else {
      improved.push(enemy.item.word);
    }
  }
  return {
    attempted: attempted.length,
    defeated: defeated.length,
    correct: hits,
    incorrect: misses,
    improved,
    stillNeedingReview,
  };
}

export function recordRevengeVocabAnswer(
  itemId: number,
  correct: boolean,
  store?: VocabQuizStore | null
) {
  return recordVocabQuizAnswer(
    { itemId, correct },
    store === undefined ? undefined : store
  );
}

export function nextRevengeQuestion(
  enemies: RevengeEnemy[],
  pools: GameContentPools,
  seed: string
): GameQuestion | null {
  const living = livingRevengeEnemies(enemies);
  if (living.length === 0) return null;
  const pick = living[0];
  if (!pick) return null;
  const distractorPool =
    pools.n2Vocab.length >= 4 ? pools.n2Vocab : [...pools.weakVocab, ...pools.n2Vocab];
  const question = vocabQuestion(
    pick.item,
    distractorPool.length > 0 ? distractorPool : pools.weakVocab,
    "weak",
    `${seed}:${pick.item.id}:${pick.hp}`
  );
  if (!question) return null;
  return {
    ...question,
    sourceKey: `revenge:${pick.item.id}:${pick.hp}`,
    enemyHp: { current: pick.hp, max: pick.maxHp },
  };
}
