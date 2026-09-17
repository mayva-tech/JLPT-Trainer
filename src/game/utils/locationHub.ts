import { COMMUNICATION_SEALS } from "../data/seals";
import { getQuestsForLocation } from "../data/quests";
import type { LocationId, PlayerRpgProfile } from "../types";
import { getLocationStatus } from "./locationStatus";
import { questHasPlayableContent } from "./questContent";

export type LocationHubCard = {
  locationId: LocationId;
  progressPercent: number;
  completedMissions: number;
  availableMissions: number;
  totalMissions: number;
  sealEarned: boolean;
  sealIcon: string | null;
  status: "unlocked" | "locked" | "completed-area";
};

export function getLocationHubCard(
  locationId: LocationId,
  profile: PlayerRpgProfile
): LocationHubCard {
  const quests = getQuestsForLocation(locationId).filter(questHasPlayableContent);
  const total = quests.length;
  const completed = quests.filter((q) =>
    profile.completedQuestIds.includes(q.id)
  ).length;
  const available = quests.filter(
    (q) =>
      !profile.completedQuestIds.includes(q.id) &&
      (q.requiresQuestIds ?? []).every((id) =>
        profile.completedQuestIds.includes(id)
      )
  ).length;
  const progressPercent =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  const seal = COMMUNICATION_SEALS.find((s) => s.locationId === locationId);
  const sealEarned = seal ? profile.seals.includes(seal.id) : false;
  let status = getLocationStatus(locationId, profile);
  if (status === "unlocked" && total > 0 && completed === total) {
    status = "completed-area";
  }
  return {
    locationId,
    progressPercent,
    completedMissions: completed,
    availableMissions: available,
    totalMissions: total,
    sealEarned,
    sealIcon: seal?.icon ?? null,
    status,
  };
}
