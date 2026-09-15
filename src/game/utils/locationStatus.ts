import { LOCATIONS, getLocationById } from "../data/locations";
import { getQuestById } from "../data/quests";
import type {
  LocationDefinition,
  LocationId,
  LocationStatus,
  PlayerRpgProfile,
} from "../types";
import { getProfileLevel } from "./playerProfile";

export function isLocationUnlocked(
  location: LocationDefinition,
  profile: PlayerRpgProfile
): boolean {
  if (profile.flags.developerMode) return true;
  if (profile.unlockedLocationIds.includes(location.id)) return true;
  if (getProfileLevel(profile) < location.requiredLevel) return false;
  return location.requiredQuestIds.every((questId) =>
    profile.completedQuestIds.includes(questId)
  );
}

export function getLocationStatus(
  locationId: LocationId,
  profile: PlayerRpgProfile
): LocationStatus {
  const location = getLocationById(locationId);
  if (!location) return "locked";
  if (!isLocationUnlocked(location, profile)) return "locked";
  return "unlocked";
}

export function unlockConditionText(
  location: LocationDefinition,
  profile?: PlayerRpgProfile
): string {
  if (profile) {
    const missingQuests = location.requiredQuestIds.filter(
      (questId) => !profile.completedQuestIds.includes(questId)
    );
    if (missingQuests.length > 0) {
      const quest = getQuestById(missingQuests[0]!);
      if (quest) {
        return `🔒 Unlock after completing ${quest.japaneseTitle}`;
      }
    }
    if (getProfileLevel(profile) < location.requiredLevel) {
      return `🔒 Unlock at adventure level ${location.requiredLevel}`;
    }
  } else if (location.requiredQuestIds.length > 0) {
    const quest = getQuestById(location.requiredQuestIds[0]!);
    if (quest) {
      return `🔒 Unlock after completing ${quest.japaneseTitle}`;
    }
  } else if (location.requiredLevel > 1) {
    return `🔒 Unlock at adventure level ${location.requiredLevel}`;
  }
  return "🔒 Locked";
}

export function listLocationsWithStatus(profile: PlayerRpgProfile) {
  return LOCATIONS.map((location) => ({
    location,
    status: getLocationStatus(location.id, profile),
    unlockText: unlockConditionText(location, profile),
  }));
}
