import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISCOVERY_PREFS,
  DISCOVERY_PROGRESS_KEY,
  EMPTY_DISCOVERY,
  loadDiscoveryProgress,
  markDiscovered,
  recordQuizRound,
  recordQuizTap,
  saveDiscoveryProgress,
  sceneCompletion,
  setLastScene,
  updateDiscoveryPrefs,
} from "./discoveryProgress";
import { promptNoun, answerTap, currentTarget, newRound, roundDone, skipTarget } from "./discoveryQuiz";
import { wordById } from "../everydayData";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  };
}

describe("discovery progress", () => {
  it("round-trips through storage and survives corrupt or missing data", () => {
    const store = memoryStore();
    expect(loadDiscoveryProgress(store)).toEqual(EMPTY_DISCOVERY);
    let p = markDiscovered(EMPTY_DISCOVERY, "kitchen", "fridge");
    p = setLastScene(p, "kitchen");
    p = updateDiscoveryPrefs(p, { promptLang: "ja", hints: true });
    saveDiscoveryProgress(p, store);
    expect(loadDiscoveryProgress(store)).toEqual(p);
    store.setItem(DISCOVERY_PROGRESS_KEY, "{not json");
    expect(loadDiscoveryProgress(store)).toEqual(EMPTY_DISCOVERY);
    store.setItem(DISCOVERY_PROGRESS_KEY, JSON.stringify({ discovered: { kitchen: ["fridge", 3] }, prefs: { promptLang: "xx" } }));
    const loaded = loadDiscoveryProgress(store);
    expect(loaded.discovered.kitchen).toEqual(["fridge"]);
    expect(loaded.prefs).toEqual(DEFAULT_DISCOVERY_PREFS);
  });

  it("discovering is idempotent and per scene", () => {
    const p1 = markDiscovered(EMPTY_DISCOVERY, "kitchen", "fridge");
    expect(markDiscovered(p1, "kitchen", "fridge")).toBe(p1);
    const p2 = markDiscovered(p1, "train", "fridge");
    expect(p2.discovered).toEqual({ kitchen: ["fridge"], train: ["fridge"] });
  });

  it("completion counts only objects the scene has", () => {
    const scene = { id: "kitchen", objects: [{ id: "fridge" }, { id: "sink" }, { id: "pot" }, { id: "faucet" }] };
    let p = markDiscovered(EMPTY_DISCOVERY, "kitchen", "fridge");
    p = markDiscovered(p, "kitchen", "removed-object");
    expect(sceneCompletion(p, scene)).toEqual({ found: 1, total: 4, percent: 25 });
  });

  it("quiz taps and rounds", () => {
    let p = recordQuizTap(EMPTY_DISCOVERY, "kitchen", true);
    p = recordQuizTap(p, "kitchen", false);
    p = recordQuizRound(p, "kitchen", 12, 15);
    p = recordQuizRound(p, "kitchen", 9, 15);
    expect(p.quiz.kitchen).toEqual({ rounds: 2, correct: 1, incorrect: 1, best: 12 / 15 });
    expect(recordQuizRound(p, "kitchen", 0, 0)).toBe(p);
  });
});

describe("Find it / Listen rounds", () => {
  const ids = ["fridge", "sink", "pot", "faucet"];

  it("a round is a stable shuffle of all objects", () => {
    const a = newRound(ids, "seed-1");
    expect([...a.queue].sort()).toEqual([...ids].sort());
    expect(newRound(ids, "seed-1").queue).toEqual(a.queue);
  });

  it("first-try answers count; a wrong tap keeps the target and marks it missed", () => {
    let r = newRound(ids, "s");
    const t1 = currentTarget(r)!;
    let res = answerTap(r, t1);
    expect(res.result).toBe("correct");
    r = res.state;
    expect(r.firstTry).toBe(1);

    const t2 = currentTarget(r)!;
    const wrong = ids.find((i) => i !== t2)!;
    res = answerTap(r, wrong);
    expect(res.result).toBe("wrong");
    expect(currentTarget(res.state)).toBe(t2);
    res = answerTap(res.state, wrong);
    expect(res.state.missed).toEqual([t2]);
    res = answerTap(res.state, t2);
    expect(res.result).toBe("correct");
    expect(res.state.firstTry).toBe(1);
    r = skipTarget(res.state);
    expect(r.missed).toEqual([t2, res.state.queue[2]]);
    r = answerTap(r, currentTarget(r)!).state;
    expect(roundDone(r)).toBe(true);
    expect(answerTap(r, "fridge").result).toBe("ignored");
  });

  it("prompt nouns read as plain English", () => {
    expect(promptNoun(wordById("stove")!)).toBe("stove burner");
    expect(promptNoun(wordById("faucet")!)).toBe("faucet");
    expect(promptNoun(wordById("fridge")!)).toBe("refrigerator");
    expect(promptNoun(wordById("roadway")!)).toBe("roadway");
  });
});
