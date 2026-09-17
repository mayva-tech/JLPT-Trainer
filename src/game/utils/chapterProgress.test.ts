import { describe, expect, it } from "vitest";
import { CITY_HALL_REGISTER_QUEST } from "../data/quests/cityHallRegister";
import { CLINIC_VISIT_QUEST } from "../data/quests/clinicVisit";
import { CONVENIENCE_FIRST_SHOP_QUEST } from "../data/quests/convenienceFirstShop";
import { FIRST_DAY_OFFICE_QUEST } from "../data/quests/firstDayOffice";
import { MEET_NEIGHBOR_QUEST } from "../data/quests/meetNeighbor";
import { PHONE_CALL_QUEST } from "../data/quests/phoneCall";
import { SOCIAL_LIFE_CHALLENGE_QUEST } from "../data/quests/socialLifeChallenge";
import { QUESTS } from "../data/quests";
import { createDefaultProfile } from "./playerProfile";
import {
  chapterCompletionCounts,
  filterStepsForProfile,
  getChapterQuestRows,
  isChapterComplete,
  isDeveloperMode,
  isQuestPlayable,
  shortChapterObjectiveLabel,
} from "./chapterProgress";
import { getChapterByNumber } from "../data/chapters";
import { getLocationById } from "../data/locations";
import { isLocationUnlocked } from "./locationStatus";

describe("Chapter 1 quest chain", () => {
  it("registers six Chapter 1 playable quests at the start of QUESTS", () => {
    const ch1 = QUESTS.filter(
      (q) => q.chapter === 1 && !q.rewards.randomEncounter
    );
    expect(ch1).toHaveLength(6);
    expect(ch1.every((q) => q.steps.length > 0)).toBe(true);
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

describe("Chapter 2 quest chain", () => {
  it("registers Chapter 1–5 story quests", () => {
    const story = QUESTS.filter((q) => !q.rewards.randomEncounter);
    expect(story).toHaveLength(30);
    const ch2 = story.filter((q) => q.chapter === 2);
    expect(ch2).toHaveLength(4);
    const ch3 = story.filter((q) => q.chapter === 3);
    expect(ch3).toHaveLength(6);
    const ch4 = story.filter((q) => q.chapter === 4);
    expect(ch4).toHaveLength(7);
    const ch5 = story.filter((q) => q.chapter === 5);
    expect(ch5).toHaveLength(7);
    expect(ch2.map((q) => q.id)).toEqual([
      "clinic-visit",
      "phone-call",
      "first-day-office",
      "social-life-challenge",
    ]);
    expect(ch2.every((q) => q.steps.length > 0 || q.conversation)).toBe(true);
  });

  it("keeps Chapter 2 locked until Chapter 1 is cleared", () => {
    const fresh = createDefaultProfile(null);
    expect(isQuestPlayable(CLINIC_VISIT_QUEST, fresh)).toBe(false);
    expect(isChapterComplete(fresh, 1)).toBe(false);

    const ch1Done = {
      ...fresh,
      completedQuestIds: [
        "city-hall-register",
        "convenience-first-shop",
        "meet-neighbor",
        "station-master",
        "cafe-order",
        "first-week-challenge",
      ],
      flags: { chapter1Complete: true },
      currentChapter: 2,
    };
    expect(isChapterComplete(ch1Done, 1)).toBe(true);
    expect(isQuestPlayable(CLINIC_VISIT_QUEST, ch1Done)).toBe(true);
    expect(isQuestPlayable(PHONE_CALL_QUEST, ch1Done)).toBe(false);
  });

  it("unlocks phone after clinic, office after phone, boss after office", () => {
    const base = {
      ...createDefaultProfile(null),
      completedQuestIds: [
        "city-hall-register",
        "convenience-first-shop",
        "meet-neighbor",
        "station-master",
        "cafe-order",
        "first-week-challenge",
      ],
    };

    expect(isQuestPlayable(CLINIC_VISIT_QUEST, base)).toBe(true);
    expect(isQuestPlayable(PHONE_CALL_QUEST, base)).toBe(false);

    const afterClinic = {
      ...base,
      completedQuestIds: [...base.completedQuestIds, "clinic-visit"],
    };
    expect(isQuestPlayable(PHONE_CALL_QUEST, afterClinic)).toBe(true);
    expect(isQuestPlayable(FIRST_DAY_OFFICE_QUEST, afterClinic)).toBe(false);

    const afterPhone = {
      ...base,
      completedQuestIds: [...afterClinic.completedQuestIds, "phone-call"],
    };
    expect(isQuestPlayable(FIRST_DAY_OFFICE_QUEST, afterPhone)).toBe(true);
    expect(isQuestPlayable(SOCIAL_LIFE_CHALLENGE_QUEST, afterPhone)).toBe(false);

    const afterOffice = {
      ...base,
      completedQuestIds: [...afterPhone.completedQuestIds, "first-day-office"],
    };
    expect(isQuestPlayable(SOCIAL_LIFE_CHALLENGE_QUEST, afterOffice)).toBe(true);
  });

  it("detects Chapter 2 completion only when all four quests are done", () => {
    const partial = {
      ...createDefaultProfile(null),
      completedQuestIds: [
        "clinic-visit",
        "phone-call",
        "first-day-office",
      ],
    };
    expect(isChapterComplete(partial, 2)).toBe(false);
    expect(chapterCompletionCounts(partial, 2)).toEqual({
      done: 3,
      total: 4,
      percent: 75,
    });

    const done = {
      ...partial,
      completedQuestIds: [
        ...partial.completedQuestIds,
        "social-life-challenge",
      ],
    };
    expect(isChapterComplete(done, 2)).toBe(true);
  });

  it("progressively gates Chapter 2 locations", () => {
    expect(getLocationById("clinic")?.requiredQuestIds).toEqual([
      "first-week-challenge",
    ]);
    expect(getLocationById("phone-center")?.requiredQuestIds).toEqual([
      "clinic-visit",
    ]);
    expect(getLocationById("office")?.requiredQuestIds).toEqual(["phone-call"]);
    expect(getLocationById("clinic")?.route).toBe("clinic");
    expect(getLocationById("phone-center")?.route).toBe("phone-center");
    expect(getLocationById("office")?.route).toBe("office");
  });

  it("exposes short objective labels for Chapter 2", () => {
    expect(shortChapterObjectiveLabel(CLINIC_VISIT_QUEST)).toBe(
      "Visit the Clinic"
    );
    expect(shortChapterObjectiveLabel(PHONE_CALL_QUEST)).toBe(
      "Handle a Phone Call"
    );
    expect(shortChapterObjectiveLabel(FIRST_DAY_OFFICE_QUEST)).toBe(
      "First Day at Work"
    );
    expect(shortChapterObjectiveLabel(SOCIAL_LIFE_CHALLENGE_QUEST)).toBe(
      "Social Life Challenge"
    );
  });

  it("marks the boss as difficulty boss with Confidence 5", () => {
    expect(SOCIAL_LIFE_CHALLENGE_QUEST.difficulty).toBe("boss");
    expect(SOCIAL_LIFE_CHALLENGE_QUEST.startingConfidence).toBe(5);
    expect(SOCIAL_LIFE_CHALLENGE_QUEST.rewards.xp).toBe(350);
  });

  it("unlocks every quest when developerMode is on", () => {
    const fresh = createDefaultProfile(null);
    expect(isQuestPlayable(CLINIC_VISIT_QUEST, fresh)).toBe(false);
    expect(isQuestPlayable(SOCIAL_LIFE_CHALLENGE_QUEST, fresh)).toBe(false);

    const dev = {
      ...fresh,
      flags: { ...fresh.flags, developerMode: true },
    };
    expect(isDeveloperMode(dev)).toBe(true);
    expect(isQuestPlayable(CLINIC_VISIT_QUEST, dev)).toBe(true);
    expect(isQuestPlayable(PHONE_CALL_QUEST, dev)).toBe(true);
    expect(isQuestPlayable(FIRST_DAY_OFFICE_QUEST, dev)).toBe(true);
    expect(isQuestPlayable(SOCIAL_LIFE_CHALLENGE_QUEST, dev)).toBe(true);

    const rows = getChapterQuestRows(dev, getChapterByNumber(2)!);
    expect(rows.every((row) => row.playable || row.status === "completed")).toBe(
      true
    );

    const phone = getLocationById("phone-center")!;
    const office = getLocationById("office")!;
    expect(isLocationUnlocked(phone, fresh)).toBe(false);
    expect(isLocationUnlocked(phone, dev)).toBe(true);
    expect(isLocationUnlocked(office, dev)).toBe(true);
  });
});
