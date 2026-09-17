import { getChapterByNumber } from "../data/chapters";
import { getQuestById } from "../data/quests";
import type { ChapterDefinition, PlayerRpgProfile, QuestDefinition } from "../types";
import { questHasPlayableContent } from "./questContent";

export type ChapterQuestRow = {
  quest: QuestDefinition;
  status: "completed" | "active" | "locked";
  playable: boolean;
};

export function isQuestRequirementMet(
  quest: QuestDefinition,
  profile: PlayerRpgProfile
): boolean {
  if (isDeveloperMode(profile)) return true;
  const reqs = quest.requiresQuestIds ?? [];
  return reqs.every((id) => profile.completedQuestIds.includes(id));
}

export function isQuestPlayable(
  quest: QuestDefinition,
  profile: PlayerRpgProfile
): boolean {
  if (!questHasPlayableContent(quest)) return false;
  if (isDeveloperMode(profile)) return true;
  return isQuestRequirementMet(quest, profile);
}

export function isDeveloperMode(profile: PlayerRpgProfile): boolean {
  return Boolean(profile.flags.developerMode);
}

export function getChapterQuestRows(
  profile: PlayerRpgProfile,
  chapter: ChapterDefinition
): ChapterQuestRow[] {
  return chapter.questIds.map((questId) => {
    const quest = getQuestById(questId);
    if (!quest) {
      return {
        quest: {
          id: questId,
          title: questId,
          japaneseTitle: questId,
          locationId: "home",
          chapter: chapter.number,
          description: "",
          difficulty: "easy",
          recommendedLevel: 1,
          startingConfidence: 5,
          objectives: [],
          steps: [],
          rewards: { xp: 0, skillRewards: {} },
          unlocks: {},
        },
        status: "locked" as const,
        playable: false,
      };
    }
    const done = profile.completedQuestIds.includes(quest.id);
    const playable = isQuestPlayable(quest, profile);
    let status: ChapterQuestRow["status"] = "locked";
    if (done) status = "completed";
    else if (playable) status = "active";
    return { quest, status, playable };
  });
}

export function chapterCompletionCounts(profile: PlayerRpgProfile, chapterNumber = 1) {
  const chapter = getChapterByNumber(chapterNumber);
  if (!chapter) return { done: 0, total: 0, percent: 0 };
  const total = chapter.questIds.length;
  const done = chapter.questIds.filter((id) =>
    profile.completedQuestIds.includes(id)
  ).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function isChapterComplete(
  profile: PlayerRpgProfile,
  chapterNumber = 1
): boolean {
  const { done, total } = chapterCompletionCounts(profile, chapterNumber);
  return total > 0 && done >= total;
}

export function shortChapterObjectiveLabel(quest: QuestDefinition): string {
  switch (quest.id) {
    case "city-hall-register":
      return "Register at City Hall";
    case "convenience-first-shop":
      return "Buy Essentials";
    case "meet-neighbor":
      return "Meet Your Neighbor";
    case "station-master":
      return "Navigate the Station";
    case "cafe-order":
      return "Order at Café";
    case "first-week-challenge":
      return "First Week Challenge";
    case "clinic-visit":
      return "Visit the Clinic";
    case "phone-call":
      return "Handle a Phone Call";
    case "first-day-office":
      return "First Day at Work";
    case "social-life-challenge":
      return "Social Life Challenge";
    case "friend-invitation":
      return "Friend Invitation";
    case "senpai-favor":
      return "Ask a Senpai";
    case "saying-no":
      return "How to Say No";
    case "awkward-apology":
      return "Awkward Apology";
    case "workplace-discussion":
      return "Workplace Discussion";
    case "relationships-challenge":
      return "Social Intelligence Challenge";
    case "morning-office":
      return "Morning at the Office";
    case "reporting-to-boss":
      return "Reporting to Your Boss";
    case "business-phone":
      return "Business Phone Call";
    case "customer-service":
      return "Customer Interaction";
    case "report-mistake":
      return "Reporting a Mistake";
    case "meeting-speak":
      return "Speaking in a Meeting";
    case "workday-survival":
      return "Workday Survival";
    case "fast-convenience":
      return "Fast Convenience Store";
    case "train-announcement":
      return "Train Announcement Challenge";
    case "friend-real-meaning":
      return "What Your Friend Really Means";
    default:
      return quest.title;
  }
}

export function filterStepsForProfile(
  quest: QuestDefinition,
  metNpcIds: string[]
): QuestDefinition["steps"] {
  const met = new Set(metNpcIds);
  return quest.steps.filter((step) => {
    const when = step.when;
    if (!when) return true;
    if (when.metNpc && !met.has(when.metNpc)) return false;
    if (when.notMetNpc && met.has(when.notMetNpc)) return false;
    return true;
  });
}
