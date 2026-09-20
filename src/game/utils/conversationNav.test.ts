import { describe, expect, it } from "vitest";
import {
  canRetryStep,
  canStepBack,
  canStepForward,
  cloneConversationNavCheckpoint,
  emptyConversationNavCheckpoint,
  pushHistoryClearingForward,
  stepBackNav,
  stepForwardNav,
} from "./conversationNav";

describe("conversationNav", () => {
  it("clones checkpoints so mutations do not leak", () => {
    const base = emptyConversationNavCheckpoint("n1", 5, 70);
    base.monsters.push("x");
    base.understoodFacts.push("time");
    const copy = cloneConversationNavCheckpoint(base);
    copy.monsters.push("y");
    copy.understoodFacts.push("place");
    expect(base.monsters).toEqual(["x"]);
    expect(base.understoodFacts).toEqual(["time"]);
    expect(copy.monsters).toEqual(["x", "y"]);
  });

  it("enables Back only with history, Retry only after reveal", () => {
    expect(canStepBack(0)).toBe(false);
    expect(canStepBack(1)).toBe(true);
    expect(canRetryStep(false, true)).toBe(false);
    expect(canRetryStep(true, false)).toBe(false);
    expect(canRetryStep(true, true)).toBe(true);
  });

  it("enables Forward from stack or Continue unlock", () => {
    expect(
      canStepForward({ forwardStackLength: 0, canContinue: false })
    ).toBe(false);
    expect(
      canStepForward({ forwardStackLength: 1, canContinue: false })
    ).toBe(true);
    expect(
      canStepForward({ forwardStackLength: 0, canContinue: true })
    ).toBe(true);
  });

  it("keeps Back/Forward stacks consistent", () => {
    const a = emptyConversationNavCheckpoint("a", 5, 70);
    const b = emptyConversationNavCheckpoint("b", 4, 75);
    const c = emptyConversationNavCheckpoint("c", 4, 80);

    const advanced = pushHistoryClearingForward([a], b);
    expect(advanced.history.map((x) => x.nodeId)).toEqual(["a", "b"]);
    expect(advanced.forward).toEqual([]);

    const back = stepBackNav(advanced.history, advanced.forward, c);
    expect(back).not.toBeNull();
    expect(back!.current.nodeId).toBe("b");
    expect(back!.history.map((x) => x.nodeId)).toEqual(["a"]);
    expect(back!.forward.map((x) => x.nodeId)).toEqual(["c"]);

    const forward = stepForwardNav(back!.history, back!.forward, back!.current);
    expect(forward).not.toBeNull();
    expect(forward!.current.nodeId).toBe("c");
    expect(forward!.history.map((x) => x.nodeId)).toEqual(["a", "b"]);
    expect(forward!.forward).toEqual([]);
  });
});
