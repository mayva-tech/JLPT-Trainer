import { describe, expect, it } from "vitest";
import { registerPairs } from "../data/registerPairs";
import { registerIcon } from "./registerIcon";

describe("register opening icon", () => {
  it("follows the meaning: walking for go / come, a bow for sorry, a phone for calls", () => {
    expect(registerIcon({ meaning: "I'll go / I'm coming.", category: "会社・ビジネス" })).toEqual({ emoji: "🚶", motion: "walk" });
    expect(registerIcon({ meaning: "Sorry.", category: "あいさつ・返事" }).motion).toBe("bow");
    expect(registerIcon({ meaning: "I'll call you back.", category: "会社・ビジネス" }).emoji).toBe("📞");
  });

  it("falls back to the section, so every pair has one", () => {
    expect(registerIcon({ meaning: "Zzz", category: "会社・ビジネス" }).emoji).toBe("💼");
    expect(registerIcon({ meaning: "Zzz", category: "?" }).emoji).toBe("💬");
    for (const p of registerPairs) expect(registerIcon(p).emoji.length).toBeGreaterThan(0);
  });
});
