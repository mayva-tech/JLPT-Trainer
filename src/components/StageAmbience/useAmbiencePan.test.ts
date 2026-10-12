import { describe, expect, it } from "vitest";
import { DRIFT_PER_SEC, stepDrift } from "./useAmbiencePan";

describe("stepDrift", () => {
  it("glides slowly the chosen way", () => {
    const { pan, direction } = stepDrift(0.5, 1, 1);
    expect(pan).toBeCloseTo(0.5 + DRIFT_PER_SEC);
    expect(direction).toBe(1);
    expect(stepDrift(0.5, -1, 1).pan).toBeCloseTo(0.5 - DRIFT_PER_SEC);
  });

  it("turns round at the right edge", () => {
    const { pan, direction } = stepDrift(0.99, 1, 1);
    expect(direction).toBe(-1);
    expect(pan).toBeCloseTo(1 - (0.99 + DRIFT_PER_SEC - 1));
  });

  it("turns round at the left edge", () => {
    const { pan, direction } = stepDrift(0.01, -1, 1);
    expect(direction).toBe(1);
    expect(pan).toBeCloseTo(DRIFT_PER_SEC - 0.01);
  });

  it("crosses the whole scene in about 40 seconds", () => {
    expect(1 / DRIFT_PER_SEC).toBe(40);
  });
});
