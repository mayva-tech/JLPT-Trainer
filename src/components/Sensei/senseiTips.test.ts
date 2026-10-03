import { describe, expect, it } from "vitest";
import { SCENE_BACKDROPS } from "../TalkingHead/scenes";
import {
  CELEBRATE_TIPS,
  ENCOURAGE_TIPS,
  GENERAL_TIPS,
  SCENE_TIPS,
  pickTip,
  tipDurationMs,
} from "./senseiTips";

const ALL = [
  ...GENERAL_TIPS,
  ...ENCOURAGE_TIPS,
  ...CELEBRATE_TIPS,
  ...Object.values(SCENE_TIPS).flat(),
];

describe("sensei tips", () => {
  it("has unique ids", () => {
    const ids = ALL.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every scene with at least three tips", () => {
    for (const b of SCENE_BACKDROPS) expect(SCENE_TIPS[b].length).toBeGreaterThanOrEqual(3);
  });

  it("gives a kana reading whenever the phrase has kanji", () => {
    for (const t of ALL) {
      if (t.ja && /[\u4e00-\u9fff]/.test(t.ja)) {
        expect(t.reading, t.id).toMatch(/^[ぁ-ゖー〜・]+$/);
      }
      if (t.reading) expect(t.ja, t.id).toBeDefined();
    }
  });

  it("keeps notes bubble-sized", () => {
    for (const t of ALL) expect(t.en.length, t.id).toBeLessThanOrEqual(140);
  });

  it("avoids recent tips and falls back when all were shown", () => {
    const pool = GENERAL_TIPS.slice(0, 3);
    expect(pickTip(pool, [pool[0].id, pool[1].id], 0)?.id).toBe(pool[2].id);
    expect(pickTip(pool, pool.map((t) => t.id), 0)?.id).toBe(pool[0].id);
    expect(pickTip([], [], 0)).toBeNull();
  });

  it("scales reading time with length, within bounds", () => {
    expect(tipDurationMs({ id: "x", en: "hi" })).toBeGreaterThanOrEqual(5000);
    expect(tipDurationMs({ id: "y", en: "x".repeat(1000) })).toBe(15_000);
  });
});
