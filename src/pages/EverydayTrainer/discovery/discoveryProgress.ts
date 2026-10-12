/**
 * Visual Discovery progress — only what is scene-specific. Everything about
 * the WORD (explored, learned, saved for review, quiz stats, weak words) is
 * written to the shared Everyday Japanese progress (everydayProgress.ts), so a
 * word found in the kitchen counts everywhere and Quick Review picks it up.
 *
 * Here: which objects were found in which scene, find/listen rounds per
 * scene, the last scene, and the page's own preferences.
 * Discovering is not mastering: it only marks the word explored; "learned"
 * stays the learner's call (Mark learned) and the quiz rules.
 */

export const DISCOVERY_PROGRESS_KEY = "jlpt-trainer:everyday-discovery:v1";

export interface SceneQuizStats {
  /** Rounds finished (Find it + Listen). */
  rounds: number;
  /** Answers on the first try. */
  correct: number;
  /** Wrong taps. */
  incorrect: number;
  /** Best round, as a share of first-try answers (0–1); null before any. */
  best: number | null;
}

export type PromptLang = "en" | "ja";

export interface DiscoveryPrefs {
  /** Say the Japanese when an object is tapped (Explore). */
  autoSpeak: boolean;
  /** Language of the Find-it prompt. */
  promptLang: PromptLang;
  /** Read the Find-it prompt aloud. */
  speakPrompt: boolean;
  /** Find it / Listen: point the target out after a wrong tap. */
  hints: boolean;
  /** Outline every object (Show / Hide objects). */
  showObjects: boolean;
  /** Play all / Guided: Nanami & Andrew's intro and outro. */
  introOutro: boolean;
}

export interface DiscoveryProgress {
  /** scene id → object ids found, in the order found. */
  discovered: Record<string, string[]>;
  quiz: Record<string, SceneQuizStats>;
  lastSceneId: string | null;
  prefs: DiscoveryPrefs;
}

export const DEFAULT_DISCOVERY_PREFS: DiscoveryPrefs = {
  autoSpeak: true,
  promptLang: "en",
  speakPrompt: true,
  hints: false,
  showObjects: false,
  introOutro: true,
};

export const EMPTY_DISCOVERY: DiscoveryProgress = {
  discovered: {},
  quiz: {},
  lastSceneId: null,
  prefs: DEFAULT_DISCOVERY_PREFS,
};

type Store = Pick<Storage, "getItem" | "setItem">;

function browserStore(): Store | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function parsePrefs(v: unknown): DiscoveryPrefs {
  const p = (v ?? {}) as Partial<DiscoveryPrefs>;
  const bool = (x: unknown, d: boolean) => (typeof x === "boolean" ? x : d);
  return {
    autoSpeak: bool(p.autoSpeak, DEFAULT_DISCOVERY_PREFS.autoSpeak),
    promptLang: p.promptLang === "ja" ? "ja" : "en",
    speakPrompt: bool(p.speakPrompt, DEFAULT_DISCOVERY_PREFS.speakPrompt),
    hints: bool(p.hints, DEFAULT_DISCOVERY_PREFS.hints),
    showObjects: bool(p.showObjects, DEFAULT_DISCOVERY_PREFS.showObjects),
    introOutro: bool(p.introOutro, DEFAULT_DISCOVERY_PREFS.introOutro),
  };
}

function parseQuiz(v: unknown): Record<string, SceneQuizStats> {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, SceneQuizStats> = {};
  for (const [id, raw] of Object.entries(v as Record<string, unknown>)) {
    const s = (raw ?? {}) as Partial<SceneQuizStats>;
    out[id] = {
      rounds: Number(s.rounds) || 0,
      correct: Number(s.correct) || 0,
      incorrect: Number(s.incorrect) || 0,
      best: typeof s.best === "number" ? s.best : null,
    };
  }
  return out;
}

/** Never throws: a corrupt entry starts clean instead of breaking the page. */
export function loadDiscoveryProgress(store: Store | null = browserStore()): DiscoveryProgress {
  if (!store) return { ...EMPTY_DISCOVERY };
  try {
    const raw = store.getItem(DISCOVERY_PROGRESS_KEY);
    if (!raw) return { ...EMPTY_DISCOVERY };
    const p = JSON.parse(raw) as Record<string, unknown>;
    const discovered: Record<string, string[]> = {};
    if (p.discovered && typeof p.discovered === "object") {
      for (const [id, list] of Object.entries(p.discovered as Record<string, unknown>)) {
        discovered[id] = strings(list);
      }
    }
    return {
      discovered,
      quiz: parseQuiz(p.quiz),
      lastSceneId: typeof p.lastSceneId === "string" ? p.lastSceneId : null,
      prefs: parsePrefs(p.prefs),
    };
  } catch {
    return { ...EMPTY_DISCOVERY };
  }
}

export function saveDiscoveryProgress(p: DiscoveryProgress, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    store.setItem(DISCOVERY_PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // Private mode or a full quota: progress just won't persist.
  }
}

export function discoveredIn(p: DiscoveryProgress, sceneId: string): readonly string[] {
  return p.discovered[sceneId] ?? [];
}

/** Returns the same object when nothing changes (cheap re-render checks). */
export function markDiscovered(p: DiscoveryProgress, sceneId: string, objectId: string): DiscoveryProgress {
  const list = p.discovered[sceneId] ?? [];
  if (list.includes(objectId)) return p;
  return { ...p, discovered: { ...p.discovered, [sceneId]: [...list, objectId] } };
}

export function setLastScene(p: DiscoveryProgress, sceneId: string): DiscoveryProgress {
  return p.lastSceneId === sceneId ? p : { ...p, lastSceneId: sceneId };
}

const EMPTY_STATS: SceneQuizStats = { rounds: 0, correct: 0, incorrect: 0, best: null };

/** One tap in Find it / Listen: `firstTry` true = correct on the first tap. */
export function recordQuizTap(p: DiscoveryProgress, sceneId: string, correct: boolean): DiscoveryProgress {
  const s = p.quiz[sceneId] ?? EMPTY_STATS;
  const next = correct ? { ...s, correct: s.correct + 1 } : { ...s, incorrect: s.incorrect + 1 };
  return { ...p, quiz: { ...p.quiz, [sceneId]: next } };
}

export function recordQuizRound(
  p: DiscoveryProgress,
  sceneId: string,
  firstTry: number,
  total: number,
): DiscoveryProgress {
  if (total <= 0) return p;
  const s = p.quiz[sceneId] ?? EMPTY_STATS;
  const share = firstTry / total;
  return {
    ...p,
    quiz: { ...p.quiz, [sceneId]: { ...s, rounds: s.rounds + 1, best: Math.max(s.best ?? 0, share) } },
  };
}

export function updateDiscoveryPrefs(p: DiscoveryProgress, patch: Partial<DiscoveryPrefs>): DiscoveryProgress {
  return { ...p, prefs: { ...p.prefs, ...patch } };
}

/** Found / total for a scene, counting only objects the scene still has. */
export function sceneCompletion(
  p: DiscoveryProgress,
  scene: { id: string; objects: readonly { id: string }[] },
): { found: number; total: number; percent: number } {
  const ids = new Set(scene.objects.map((o) => o.id));
  const found = discoveredIn(p, scene.id).filter((id) => ids.has(id)).length;
  const total = scene.objects.length;
  return { found, total, percent: total ? Math.round((found / total) * 100) : 0 };
}
