/**
 * Scene bus — which situation the talking head is "in".
 *
 * A trainer declares its scene with `useHeadScene` (src/hooks/useHeadScene);
 * the single mounted `<TalkingHead />` draws the matching backdrop behind the
 * head(s) and hands them the matching prop. Scenes stack, so the most
 * recently mounted declaration wins and unmounting restores the one below —
 * e.g. an interview panel inside the player page.
 */

export type SceneBackdrop =
  | "home"
  | "office"
  | "clinic"
  | "restaurant"
  | "hotel"
  | "station"
  | "konbini"
  | "street"
  | "cafe"
  | "counter";

export type SceneProp = "phone" | "cup";

export interface HeadScene {
  backdrop: SceneBackdrop;
  prop?: SceneProp;
}

type Listener = (scene: HeadScene | null) => void;

const listeners = new Set<Listener>();
let stack: { id: number; scene: HeadScene }[] = [];
let nextId = 1;

export function getCurrentScene(): HeadScene | null {
  return stack.length ? stack[stack.length - 1].scene : null;
}

function notify() {
  const scene = getCurrentScene();
  for (const listener of listeners) {
    try {
      listener(scene);
    } catch {
      // UI problem, not the caller's.
    }
  }
}

export function subscribeToScene(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Push a scene; returns a release function that removes exactly this one. */
export function pushScene(scene: HeadScene): () => void {
  const id = nextId++;
  stack = [...stack, { id, scene }];
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const before = getCurrentScene();
    stack = stack.filter((e) => e.id !== id);
    if (getCurrentScene() !== before) notify();
  };
}

/** Test seam. */
export function __resetSceneBus(): void {
  listeners.clear();
  stack = [];
  nextId = 1;
}
