import {
  CHECK_LABELS,
  checkpointIndices,
  seeded,
  shuffle,
  stableHash,
} from "../../../components/Retention/retentionQuiz";
import { plainJapanese } from "../everydayData";
import { objectWord } from "./scenes";
import type { DiscoveryObject } from "./types";

/**
 * "Pause & answer" checkpoints for a scene show — the Player's retention rule
 * (a check every 5 items, about one item since the last check, same cards
 * on every re-recording) adapted to a picture:
 *   odd checks  — "What's this in Japanese?" the object lit, three words
 *   even checks — "Where is the 〇〇?" the word shown, the object found on reveal
 */

export type SceneCheckKind = "name" | "where";

export interface SceneCheckOption {
  label: "A" | "B" | "C";
  /** Japanese word. */
  text: string;
  correct: boolean;
}

export interface SceneCheck {
  kind: SceneCheckKind;
  object: DiscoveryObject;
  /** Three options for "name"; empty for "where". */
  options: SceneCheckOption[];
  /** 1-based. */
  number: number;
}

export { checkpointIndices };

export function buildSceneCheck(
  window: readonly DiscoveryObject[],
  pool: readonly DiscoveryObject[],
  number: number,
): SceneCheck | null {
  if (window.length === 0) return null;
  const rand = seeded(stableHash(window.map((o) => o.id).join(",") + `#scene${number}`));
  const object = window[Math.floor(rand() * window.length)]!;
  const kind: SceneCheckKind = number % 2 === 1 ? "name" : "where";
  if (kind === "where") return { kind, object, options: [], number };

  const answer = plainJapanese(objectWord(object));
  const wrong: string[] = [];
  for (const o of shuffle(pool.filter((p) => p.id !== object.id), rand)) {
    const text = plainJapanese(objectWord(o));
    if (text === answer || wrong.includes(text)) continue;
    wrong.push(text);
    if (wrong.length === 2) break;
  }
  if (wrong.length < 2) return null;
  const texts = shuffle([answer, ...wrong], rand);
  return {
    kind,
    object,
    number,
    options: texts.map((text, i) => ({ label: CHECK_LABELS[i]!, text, correct: text === answer })),
  };
}

export function sceneCheckQuestion(check: SceneCheck): string {
  return check.kind === "name"
    ? "What's this in Japanese?"
    : `Where is the ${plainJapanese(objectWord(check.object))}?`;
}

/** What Andrew says (for "where", Nanami then says the word). */
export function sceneCheckSpoken(check: SceneCheck): string {
  return check.kind === "name" ? "Pause and answer! What's this in Japanese?" : "Pause and answer! Where is this one?";
}
