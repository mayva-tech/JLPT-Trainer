import { describe, expect, it } from "vitest";
import {
  bumpLivingWeight,
  easeLivingWeight,
  encounterReinforcementWeight,
  selectWeakConcepts,
} from "./livingJapanese";
import { createDefaultProfile } from "./playerProfile";

describe("Living Japanese", () => {
  it("bumps and eases concept weights", () => {
    let w = bumpLivingWeight({}, "せっかく", 2);
    expect(w["せっかく"]).toBe(2);
    w = easeLivingWeight(w, "せっかく", 1);
    expect(w["せっかく"]).toBe(1);
    w = easeLivingWeight(w, "せっかく", 5);
    expect(w["せっかく"]).toBeUndefined();
  });

  it("selects weak concepts by weight then name", () => {
    const profile = {
      ...createDefaultProfile(null),
      livingJapanese: { 改札: 3, せっかく: 5, 袋: 5 },
      recentFailConcepts: ["提出"],
    };
    expect(selectWeakConcepts(profile, 3)).toEqual([
      "せっかく",
      "袋",
      "改札",
    ]);
  });

  it("raises encounter weight for tagged weak concepts", () => {
    const profile = {
      ...createDefaultProfile(null),
      livingJapanese: { 改札: 4 },
    };
    expect(encounterReinforcementWeight(profile, ["改札"])).toBe(5);
    expect(encounterReinforcementWeight(profile, ["袋"])).toBe(1);
  });
});
