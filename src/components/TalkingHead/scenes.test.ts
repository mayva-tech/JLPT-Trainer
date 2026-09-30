import { describe, expect, it } from "vitest";
import { PHONE_CATEGORIES } from "../../data/phoneCalls";
import { SCENE_BACKDROPS, SCENE_LABELS, phoneBackdrop, tripBackdrop } from "./scenes";

describe("scene catalog", () => {
  it("labels every backdrop with kanji/kana, a kana reading and English", () => {
    expect(SCENE_BACKDROPS).toHaveLength(10);
    for (const b of SCENE_BACKDROPS) {
      expect(SCENE_LABELS[b].ja.length).toBeGreaterThan(0);
      expect(SCENE_LABELS[b].reading).toMatch(/^[ぁ-ゖー]+$/);
      expect(SCENE_LABELS[b].en.length).toBeGreaterThan(0);
    }
  });

  it("maps every phone category to a known backdrop explicitly", () => {
    for (const c of PHONE_CATEGORIES) {
      expect(SCENE_BACKDROPS).toContain(phoneBackdrop(c.id));
    }
    expect(phoneBackdrop("transport")).toBe("station");
    expect(phoneBackdrop("unknown-category")).toBe("home");
  });

  it("maps trip scripts, defaulting to the street", () => {
    expect(tripBackdrop("tr2")).toBe("station");
    expect(tripBackdrop("tr7")).toBe("hotel");
    expect(tripBackdrop(null)).toBe("street");
    expect(tripBackdrop("nope")).toBe("street");
  });
});
