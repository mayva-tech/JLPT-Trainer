import { describe, expect, it } from "vitest";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";

describe("buildJapaneseSpeakText", () => {
  it("reads 間に as まに (not あいだに)", () => {
    const surface = "終電に間に合いませんでした。";
    const reading = "しゅうでん に ま に あいません でした。";
    const spoken = buildJapaneseSpeakText(surface, reading);
    expect(spoken).toContain("まに");
    expect(spoken).not.toContain("あいだ");
    expect(spoken.startsWith("しゅうでんにまに")).toBe(true);
  });

  it("returns surface when reading is missing", () => {
    expect(buildJapaneseSpeakText("終電", null)).toBe("終電");
    expect(buildJapaneseSpeakText("終電", "  ")).toBe("終電");
  });

  it("keeps もと reading as もと", () => {
    const surface = "焦りは失敗のもとだとよく言われる。";
    const reading = "あせり は しっぱい の もと だ と よく いわれる。";
    const spoken = buildJapaneseSpeakText(surface, reading);
    expect(spoken).toContain("もと");
  });
});
