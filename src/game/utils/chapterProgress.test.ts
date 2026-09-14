import { describe, expect, it } from "vitest";
import { CITY_HALL_REGISTER_QUEST } from "../data/quests/cityHallRegister";
import { CONVENIENCE_FIRST_SHOP_QUEST } from "../data/quests/convenienceFirstShop";
import { MEET_NEIGHBOR_QUEST } from "../data/quests/meetNeighbor";
import { QUESTS } from "../data/quests";
import { createDefaultProfile } from "./playerProfile";
import {
  chapterCompletionCounts,
  filterStepsForProfile,
  getChapterQuestRows,
  isQuestPlayable,
} from "./chapterProgress";
import { getChapterByNumber } from "../data/chapters";

describe("Chapter 1 quest chain", () => {
  it("registers all six playable quests", () => {
    expect(QUESTS).toHaveLength(6);
    expect(QUESTS.every((q) => q.steps.length > 0)).toBe(true);
  });

  it("unlocks convenience after city hall only", () => {
    const profile = createDefaultProfile(null);
    expect(isQuestPlayable(CITY_HALL_REGISTER_QUEST, profile)).toBe(true);
    expect(isQuestPlayable(CONVENIENCE_FIRST_SHOP_QUEST, profile)).toBe(false);

    const mid = {
      ...profile,
      completedQuestIds: ["city-hall-register"],
    };
    expect(isQuestPlayable(CONVENIENCE_FIRST_SHOP_QUEST, mid)).toBe(true);
    expect(isQuestPlayable(MEET_NEIGHBOR_QUEST, mid)).toBe(false);
  });

  it("filters Haruka meet vs already-met steps", () => {
    const first = filterStepsForProfile(MEET_NEIGHBOR_QUEST, []);
    expect(first.some((s) => s.id === "first-meet")).toBe(true);
    expect(first.some((s) => s.id === "already-met")).toBe(false);

    const again = filterStepsForProfile(MEET_NEIGHBOR_QUEST, ["haruka"]);
    expect(again.some((s) => s.id === "first-meet")).toBe(false);
    expect(again.some((s) => s.id === "already-met")).toBe(true);
  });

  it("tracks chapter panel progress", () => {
    const chapter = getChapterByNumber(1)!;
    const profile = {
      ...createDefaultProfile(null),
      completedQuestIds: ["city-hall-register", "convenience-first-shop"],
    };
    const rows = getChapterQuestRows(profile, chapter);
    expect(rows[0]!.status).toBe("completed");
    expect(rows[1]!.status).toBe("completed");
    expect(rows[2]!.status).toBe("active");
    expect(rows[3]!.status).toBe("locked");
    expect(chapterCompletionCounts(profile, 1)).toEqual({
      done: 2,
      total: 6,
      percent: 33,
    });
  });
});
