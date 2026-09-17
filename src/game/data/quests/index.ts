import type { QuestDefinition } from "../../types";
import { questHasPlayableContent } from "../../utils/questContent";
import { CAFE_ORDER_QUEST } from "./cafeOrder";
import { CITY_HALL_REGISTER_QUEST } from "./cityHallRegister";
import { CLINIC_VISIT_QUEST } from "./clinicVisit";
import { CONVENIENCE_FIRST_SHOP_QUEST } from "./convenienceFirstShop";
import { FIRST_DAY_OFFICE_QUEST } from "./firstDayOffice";
import { FIRST_WEEK_CHALLENGE_QUEST } from "./firstWeekChallenge";
import { MEET_NEIGHBOR_QUEST } from "./meetNeighbor";
import { PHONE_CALL_QUEST } from "./phoneCall";
import {
  RANDOM_ENCOUNTER_QUESTS,
} from "./randomEncounters";
import { SOCIAL_LIFE_CHALLENGE_QUEST } from "./socialLifeChallenge";
import { STATION_MASTER_QUEST } from "./stationMaster";
import { FRIEND_INVITATION_QUEST } from "./friendInvitation";
import { SENPAI_FAVOR_QUEST } from "./senpaiFavor";
import { SAYING_NO_QUEST } from "./sayingNo";
import { AWKWARD_APOLOGY_QUEST } from "./awkwardApology";
import { WORKPLACE_DISCUSSION_QUEST } from "./workplaceDiscussion";
import { RELATIONSHIPS_CHALLENGE_QUEST } from "./relationshipsChallenge";

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
  // Chapter 3
  FRIEND_INVITATION_QUEST,
  SENPAI_FAVOR_QUEST,
  SAYING_NO_QUEST,
  AWKWARD_APOLOGY_QUEST,
  WORKPLACE_DISCUSSION_QUEST,
  RELATIONSHIPS_CHALLENGE_QUEST,
  // Short random street encounters
  ...RANDOM_ENCOUNTER_QUESTS,
];

export { RANDOM_ENCOUNTER_QUESTS };

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUESTS.find((quest) => quest.id === id);
}

export function getPlayableQuests(): QuestDefinition[] {
  return QUESTS.filter(questHasPlayableContent);
}

export function getQuestsForLocation(locationId: string): QuestDefinition[] {
  return QUESTS.filter(
    (quest) => quest.locationId === locationId && !quest.rewards.randomEncounter
  );
}

export function getRandomEncounters(): QuestDefinition[] {
  return QUESTS.filter((quest) => quest.rewards.randomEncounter);
}

/**
 * Prefer the earliest incomplete quest at a location; fall back to any
 * quest there (for replay). Caller should still check playability.
 */
export function getPrimaryQuestForLocation(
  locationId: string,
  completedQuestIds: readonly string[] = []
): QuestDefinition | undefined {
  const atLoc = getQuestsForLocation(locationId).filter(questHasPlayableContent);
  if (atLoc.length === 0) return undefined;
  const incomplete = atLoc.find((q) => !completedQuestIds.includes(q.id));
  return incomplete ?? atLoc[0];
}

/** Deterministic pick among unlocked random encounters. */
export function pickRandomEncounter(
  completedQuestIds: readonly string[],
  seed = Date.now()
): QuestDefinition | undefined {
  const eligible = getRandomEncounters().filter((q) =>
    (q.requiresQuestIds ?? []).every((id) => completedQuestIds.includes(id))
  );
  if (eligible.length === 0) return undefined;
  const idx = Math.abs(seed) % eligible.length;
  return eligible[idx];
}
