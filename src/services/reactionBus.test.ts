import { afterEach, describe, expect, it } from "vitest";
import {
  __resetReactionBus,
  emitReaction,
  isStreakMilestone,
  reportAnswer,
  reportSessionEnd,
  subscribeToReactions,
  type HeadReactionEvent,
} from "./reactionBus";

function collect(): HeadReactionEvent[] {
  const seen: HeadReactionEvent[] = [];
  subscribeToReactions((e) => seen.push(e));
  return seen;
}

afterEach(() => __resetReactionBus());

describe("reactionBus", () => {
  it("marks streak milestones at 3 and every 5", () => {
    expect([1, 2, 3, 4, 5, 6, 10, 15].map(isStreakMilestone)).toEqual([
      false, false, true, false, true, false, true, true,
    ]);
  });

  it("emits correct, then a streak at the third in a row", () => {
    const seen = collect();
    reportAnswer(true);
    reportAnswer(true);
    reportAnswer(true);
    reportAnswer(true);
    expect(seen.map((e) => e.kind)).toEqual(["correct", "correct", "streak", "correct"]);
    expect(seen[2].count).toBe(3);
  });

  it("a wrong or almost answer resets the streak", () => {
    const seen = collect();
    reportAnswer(true);
    reportAnswer(true);
    reportAnswer("almost");
    reportAnswer(true);
    reportAnswer(true);
    reportAnswer(false);
    reportAnswer(true);
    expect(seen.map((e) => e.kind)).toEqual([
      "correct", "correct", "almost", "correct", "correct", "wrong", "correct",
    ]);
  });

  it("turns every third miss in a row into encouragement", () => {
    const seen = collect();
    for (let i = 0; i < 6; i++) reportAnswer(false);
    expect(seen.map((e) => e.kind)).toEqual([
      "wrong", "wrong", "encourage", "wrong", "wrong", "encourage",
    ]);
  });

  it("grades session ends and resets counters", () => {
    const seen = collect();
    reportAnswer(true);
    reportAnswer(true);
    reportSessionEnd(0.9);
    reportAnswer(true);
    reportSessionEnd(0.6);
    reportSessionEnd(0.2);
    reportSessionEnd(Number.NaN);
    expect(seen.map((e) => e.kind)).toEqual([
      "correct", "correct", "celebrate", "correct", "correct", "encourage",
    ]);
  });

  it("gives every event a fresh id and survives a throwing listener", () => {
    subscribeToReactions(() => {
      throw new Error("boom");
    });
    const seen = collect();
    emitReaction("correct");
    emitReaction("correct");
    expect(seen).toHaveLength(2);
    expect(seen[1].id).toBeGreaterThan(seen[0].id);
  });
});
