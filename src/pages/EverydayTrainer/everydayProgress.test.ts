import { describe, expect, it } from "vitest";
import { isWeakVocabItem } from "../../utils/vocabQuizStats";
import {
  DEFAULT_PREFS,
  EMPTY_PROGRESS,
  EVERYDAY_PROGRESS_KEY,
  isWeakStats,
  loadEverydayProgress,
  markExplored,
  recordAnswer,
  recordSession,
  reviewCandidates,
  saveEverydayProgress,
  setResume,
  toggleFavorite,
  toggleKnown,
  updatePrefs,
  weakWordIds,
  type WordStats,
} from "./everydayProgress";
import { computeBadges } from "./everydayBadges";
import { wordsInCategory } from "./everydayData";

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

describe("Everyday progress", () => {
  it("starts empty and survives corrupt storage", () => {
    expect(loadEverydayProgress(memoryStore())).toEqual(EMPTY_PROGRESS);
    expect(loadEverydayProgress(memoryStore({ [EVERYDAY_PROGRESS_KEY]: "{not json" }))).toEqual(EMPTY_PROGRESS);
    expect(loadEverydayProgress(null)).toEqual(EMPTY_PROGRESS);
  });

  it("round-trips through its own key only", () => {
    const store = memoryStore({ "jlpt-trainer:konbini:v1": '{"known":["k1"],"practiced":[]}' });
    let p = toggleKnown(EMPTY_PROGRESS, "door");
    p = toggleFavorite(p, "curb");
    p = markExplored(p, "door");
    p = setResume(p, "home", "door");
    p = updatePrefs(p, { order: "en-jp", imageOnly: true });
    saveEverydayProgress(p, store);
    expect(Object.keys(store.data).sort()).toEqual([EVERYDAY_PROGRESS_KEY, "jlpt-trainer:konbini:v1"]);
    expect(store.data["jlpt-trainer:konbini:v1"]).toBe('{"known":["k1"],"practiced":[]}');
    expect(loadEverydayProgress(store)).toEqual(p);
  });

  it("falls back to default prefs for unknown values", () => {
    const store = memoryStore({ [EVERYDAY_PROGRESS_KEY]: JSON.stringify({ prefs: { order: "loud" } }) });
    expect(loadEverydayProgress(store).prefs).toEqual(DEFAULT_PREFS);
  });

  it("toggles learned and saved words", () => {
    const once = toggleKnown(EMPTY_PROGRESS, "door");
    expect(once.known).toEqual(["door"]);
    expect(toggleKnown(once, "door").known).toEqual([]);
    expect(toggleFavorite(EMPTY_PROGRESS, "curb").favorites).toEqual(["curb"]);
  });

  it("records answers like the JLPT quiz stats and marks the word explored", () => {
    let p = recordAnswer(EMPTY_PROGRESS, "curb", false, 1000);
    expect(p.stats.curb).toEqual({ seenCount: 1, correctCount: 0, wrongCount: 1, lastResult: "incorrect", lastReviewedAt: 1000 });
    expect(p.practiced).toContain("curb");
    expect(weakWordIds(p)).toEqual(["curb"]);
    p = recordAnswer(p, "curb", true, 2000);
    p = recordAnswer(p, "curb", true, 3000);
    expect(weakWordIds(p)).toEqual([]);
  });

  it("uses exactly the existing weak-word rule (isWeakVocabItem)", () => {
    const cases: WordStats[] = [];
    for (const wrong of [0, 1, 2, 3]) {
      for (const right of [0, 1, 2, 3]) {
        for (const last of ["correct", "incorrect"] as const) {
          cases.push({ seenCount: wrong + right, correctCount: right, wrongCount: wrong, lastResult: last, lastReviewedAt: 0 });
        }
      }
    }
    for (const s of cases) expect(isWeakStats(s)).toBe(isWeakVocabItem({ ...s, itemId: 1 }));
  });

  it("keeps a capped, newest-first review history and skips empty rounds", () => {
    let p = EMPTY_PROGRESS;
    for (let i = 0; i < 60; i++) p = recordSession(p, { mode: "picture", categoryId: "street", total: 10, correct: i % 10 }, i);
    expect(p.history).toHaveLength(50);
    expect(p.history[0]!.at).toBe(59);
    expect(recordSession(p, { mode: "picture", categoryId: null, total: 0, correct: 0 })).toBe(p);
  });

  it("orders Quick Review: weak, then saved, then unlearned, then learned", () => {
    let p = markExplored(EMPTY_PROGRESS, "door");
    p = toggleKnown(p, "window");
    p = toggleFavorite(p, "curb");
    p = recordAnswer(p, "manhole", false, 5);
    const ids = new Set(["door", "window", "curb", "manhole"]);
    expect(reviewCandidates(p, ids)).toEqual(["manhole", "curb", "door", "window"]);
    // Never words the learner hasn't met, nor ids that no longer exist.
    expect(reviewCandidates(p, new Set(["door"]))).toEqual(["door"]);
  });

  it("derives badges from progress", () => {
    let p = EMPTY_PROGRESS;
    for (const w of wordsInCategory("home")) p = markExplored(p, w.id);
    const badges = computeBadges(p);
    const home = badges.find((b) => b.id === "home-explorer")!;
    expect(home.done).toBe(home.total);
    expect(badges.find((b) => b.id === "train-master")!.done).toBe(0);
  });
});
