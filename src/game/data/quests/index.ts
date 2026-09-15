import type { QuestDefinition } from "../../types";
import { CAFE_ORDER_QUEST } from "./cafeOrder";
import { CITY_HALL_REGISTER_QUEST } from "./cityHallRegister";
import { CLINIC_VISIT_QUEST } from "./clinicVisit";
import { CONVENIENCE_FIRST_SHOP_QUEST } from "./convenienceFirstShop";
import { FIRST_DAY_OFFICE_QUEST } from "./firstDayOffice";
import { FIRST_WEEK_CHALLENGE_QUEST } from "./firstWeekChallenge";
import { MEET_NEIGHBOR_QUEST } from "./meetNeighbor";
import { PHONE_CALL_QUEST } from "./phoneCall";
import { SOCIAL_LIFE_CHALLENGE_QUEST } from "./socialLifeChallenge";
import { STATION_MASTER_QUEST } from "./stationMaster";

export const QUESTS: readonly QuestDefinition[] = [
  // Chapter 1
  CITY_HALL_REGISTER_QUEST,
  CONVENIENCE_FIRST_SHOP_QUEST,
  MEET_NEIGHBOR_QUEST,
  STATION_MASTER_QUEST,
  CAFE_ORDER_QUEST,
  FIRST_WEEK_CHALLENGE_QUEST,
  // Chapter 2
  CLINIC_VISIT_QUEST,
  PHONE_CALL_QUEST,
  FIRST_DAY_OFFICE_QUEST,
  SOCIAL_LIFE_CHALLENGE_QUEST,
];

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUESTS.find((quest) => quest.id === id);
}

export function getPlayableQuests(): QuestDefinition[] {
  return QUESTS.filter((quest) => quest.steps.length > 0);
}

export function getQuestsForLocation(locationId: string): QuestDefinition[] {
  return QUESTS.filter((quest) => quest.locationId === locationId);
}

/**
 * Prefer the earliest incomplete quest at a location; fall back to any
 * quest there (for replay). Caller should still check playability.
 */
export function getPrimaryQuestForLocation(
  locationId: string,
  completedQuestIds: readonly string[] = []
): QuestDefinition | undefined {
  const atLoc = getQuestsForLocation(locationId).filter(
    (quest) => quest.steps.length > 0
  );
  if (atLoc.length === 0) return undefined;
  const incomplete = atLoc.find((q) => !completedQuestIds.includes(q.id));
  return incomplete ?? atLoc[0];
}
