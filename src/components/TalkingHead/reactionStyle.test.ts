import { describe, expect, it } from "vitest";
import type { HeadReactionKind } from "../../services/reactionBus";
import {
  REACTION_LINES,
  REACTION_STYLE,
  browTransform,
  reactionLine,
} from "./reactionStyle";

const KINDS: HeadReactionKind[] = [
  "correct",
  "wrong",
  "almost",
  "streak",
  "celebrate",
  "encourage",
];

describe("reaction styles", () => {
  it("defines a style and lines in both languages for every reaction", () => {
    for (const kind of KINDS) {
      expect(REACTION_STYLE[kind].durationMs).toBeGreaterThanOrEqual(1200);
      expect(REACTION_LINES.ja[kind].length).toBeGreaterThan(0);
      expect(REACTION_LINES.en[kind].length).toBeGreaterThan(0);
    }
  });

  it("keeps bubble lines short enough for a 120px head", () => {
    for (const lang of ["ja", "en"] as const) {
      for (const kind of KINDS) {
        for (const line of REACTION_LINES[lang][kind]) {
          expect(line.replace("{n}", "10").length).toBeLessThanOrEqual(lang === "ja" ? 9 : 16);
        }
      }
    }
  });

  it("fills the streak count and clamps the pick", () => {
    expect(reactionLine("ja", "streak", 5, 0)).toBe("5連続！");
    expect(reactionLine("en", "streak", 10, 0)).toBe("10 in a row!");
    expect(reactionLine("en", "correct", 0, 1)).toBe(
      REACTION_LINES.en.correct[REACTION_LINES.en.correct.length - 1]
    );
  });

  it("mirrors worried brows and leaves neutral untouched", () => {
    expect(browTransform("neutral", "l")).toBe("none");
    expect(browTransform("sad", "l")).toContain("rotate(-12deg)");
    expect(browTransform("sad", "r")).toContain("rotate(12deg)");
  });
});
