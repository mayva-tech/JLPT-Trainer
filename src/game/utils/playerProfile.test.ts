import { describe, expect, it } from "vitest";
import {
  applyQuestCompletion,
  createDefaultProfile,
  parsePlayerProfile,
} from "./playerProfile";
import { calcJapanesePower, emptyLanguageStats } from "./languageStats";
import { resolveAdventureRank } from "../data/ranks";

describe("parsePlayerProfile", () => {
  it("returns a safe default for corrupt payloads", () => {
    const profile = parsePlayerProfile("{nope");
    expect(profile.version).toBe(1);
    expect(profile.unlockedLocationIds).toContain("city-hall");
    expect(profile.xp).toBe(0);
    expect(profile.flags).toEqual({});
  });

  it("parses flags from saved profiles", () => {
    const profile = parsePlayerProfile({
      version: 1,
      playerName: "A",
      xp: 10,
      currentChapter: 1,
      completedQuestIds: [],
      unlockedLocationIds: ["home", "city-hall"],
      activeQuestId: null,
      languageStats: emptyLanguageStats(),
      completedQuests: [],
      metNpcIds: [],
      rewardedQuestIds: [],
      flags: { chapter1Complete: true },
      createdAt: 1,
      updatedAt: 1,
    });
    expect(profile.flags.chapter1Complete).toBe(true);
    // Migrates Chapter 1 clearers into Chapter 2 availability.
    expect(profile.currentChapter).toBe(2);
  });

  it("migrates first-week-challenge clears into Chapter 2 without breaking old saves", () => {
    const profile = parsePlayerProfile({
      version: 1,
      playerName: "Traveler",
      xp: 900,
      currentChapter: 1,
      completedQuestIds: [
        "city-hall-register",
        "convenience-first-shop",
        "meet-neighbor",
        "station-master",
        "cafe-order",
        "first-week-challenge",
      ],
      unlockedLocationIds: [
        "home",
        "city-hall",
        "convenience-store",
        "train-station",
        "cafe",
        "clinic",
        "phone-center",
        "office",
        "training-dojo",
        "weak-word-dungeon",
      ],
      activeQuestId: null,
      languageStats: emptyLanguageStats(),
      completedQuests: [],
      metNpcIds: ["tanaka-city-hall"],
      rewardedQuestIds: ["first-week-challenge"],
      flags: {},
      createdAt: 1,
      updatedAt: 1,
    });
    expect(profile.flags.chapter1Complete).toBe(true);
    expect(profile.currentChapter).toBe(2);
    expect(profile.completedQuestIds).toContain("first-week-challenge");
  });
});

describe("applyQuestCompletion", () => {
  it("grants rewards once and ignores refresh replays for full XP", () => {
    const base = createDefaultProfile(null);
    const first = applyQuestCompletion(base, {
      questId: "city-hall-register",
      accuracy: 90,
      confidenceLeft: 4,
      xpGained: 150,
      skillRewards: { conversation: 3, politeness: 3 },
      unlockLocationIds: ["convenience-store"],
      unlockQuestIds: ["convenience-first-shop"],
      metNpcIds: ["tanaka-city-hall"],
      at: 1_000,
    });
    expect(first.newlyRewarded).toBe(true);
    expect(first.xpGranted).toBe(150);
    expect(first.profile.xp).toBe(150);
    expect(first.profile.unlockedLocationIds).toContain("convenience-store");
    expect(first.profile.rewardedQuestIds).toContain("city-hall-register");
    expect(first.profile.languageStats.conversation).toBe(
      emptyLanguageStats().conversation + 3
    );

    const second = applyQuestCompletion(first.profile, {
      questId: "city-hall-register",
      accuracy: 100,
      confidenceLeft: 5,
      xpGained: 150,
      skillRewards: { conversation: 3 },
      replayXp: 20,
      replaySkillRewards: { conversation: 1 },
      unlockLocationIds: ["convenience-store"],
      at: 2_000,
    });
    expect(second.newlyRewarded).toBe(false);
    expect(second.replayRewarded).toBe(true);
    expect(second.profile.xp).toBe(170);
    expect(second.profile.languageStats.conversation).toBe(
      first.profile.languageStats.conversation + 1
    );

    const third = applyQuestCompletion(second.profile, {
      questId: "city-hall-register",
      accuracy: 100,
      confidenceLeft: 5,
      xpGained: 150,
      skillRewards: { conversation: 3 },
      replayXp: 20,
      replaySkillRewards: { conversation: 1 },
      at: 3_000,
    });
    expect(third.replayRewarded).toBe(false);
    expect(third.profile.xp).toBe(170);
  });
});

describe("calcJapanesePower", () => {
  it("averages language stats", () => {
    expect(
      calcJapanesePower({
        vocabulary: 60,
        grammar: 60,
        listening: 60,
        reading: 60,
        conversation: 60,
        politeness: 60,
      })
    ).toBe(60);
  });
});

describe("resolveAdventureRank", () => {
  it("keeps beginners at the first rank", () => {
    expect(
      resolveAdventureRank({
        completedQuests: 0,
        level: 1,
        japanesePower: 10,
      }).id
    ).toBe("kotoba-beginner");
  });

  it("requires quests, level, and power together", () => {
    expect(
      resolveAdventureRank({
        completedQuests: 1,
        level: 3,
        japanesePower: 25,
      }).id
    ).toBe("nihongo-adventurer");
    expect(
      resolveAdventureRank({
        completedQuests: 20,
        level: 30,
        japanesePower: 40,
      }).id
    ).not.toBe("pera-pera-master");
  });
});
