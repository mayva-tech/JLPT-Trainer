import { describe, expect, it } from "vitest";
import { boxesIntersect, candidateSpots, pickSpot, type Box } from "./senseiSpots";

const stage: Box = { left: 0, top: 0, right: 800, bottom: 600 };
const nuance: Box = { left: 100, top: 400, right: 700, bottom: 500 };
const box = (s: { x: number; y: number; w: number; h: number }): Box => ({
  left: s.x,
  top: s.y,
  right: s.x + s.w,
  bottom: s.y + s.h,
});

describe("senseiSpots", () => {
  it("offers spots on the stage sides, the bottom and the Nuance panel's top, all inside the stage", () => {
    const cands = candidateSpots(stage, nuance, false);
    expect(new Set(cands.map((s) => s.edge))).toEqual(new Set(["left", "right", "bottom", "nuance"]));
    for (const s of cands) {
      const b = box(s);
      expect(b.left).toBeGreaterThanOrEqual(stage.left);
      expect(b.right).toBeLessThanOrEqual(stage.right);
      expect(b.top).toBeGreaterThanOrEqual(stage.top);
      expect(b.bottom).toBeLessThanOrEqual(stage.bottom);
    }
    for (const s of cands.filter((c) => c.edge === "nuance")) expect(s.y + s.h).toBe(nuance.top);
  });

  it("never picks a spot over text, and varies the edge", () => {
    const cands = candidateSpots(stage, nuance, false);
    const text: Box[] = [
      { left: 0, top: 0, right: 800, bottom: 120 },
      { left: 0, top: 560, right: 400, bottom: 600 },
    ];
    const edges = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const seq = [i / 40, (i * 7 % 40) / 40];
      const s = pickSpot(cands, text, () => seq.shift() ?? 0);
      expect(s).not.toBeNull();
      expect(text.some((t) => boxesIntersect(box(s!), t))).toBe(false);
      edges.add(s!.edge);
    }
    expect(edges.size).toBe(4);
  });

  it("returns null when every spot is covered", () => {
    expect(pickSpot(candidateSpots(stage, null, false), [stage])).toBeNull();
  });

  it("opens the bubble toward the stage's middle", () => {
    const cands = candidateSpots(stage, null, false);
    expect(cands.find((s) => s.edge === "left")?.inward).toBe("right");
    expect(cands.find((s) => s.edge === "right")?.inward).toBe("left");
    const bottoms = cands.filter((s) => s.edge === "bottom");
    expect(bottoms[0].inward).toBe("right");
    expect(bottoms[bottoms.length - 1].inward).toBe("left");
  });
});
