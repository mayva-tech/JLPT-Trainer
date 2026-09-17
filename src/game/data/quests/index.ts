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
import { MORNING_OFFICE_QUEST } from "./morningOffice";
import { REPORTING_TO_BOSS_QUEST } from "./reportingToBoss";
import { BUSINESS_PHONE_QUEST } from "./businessPhone";
import { CUSTOMER_SERVICE_QUEST } from "./customerService";
import { REPORT_MISTAKE_QUEST } from "./reportMistake";
import { MEETING_SPEAK_QUEST } from "./meetingSpeak";
import { WORKDAY_SURVIVAL_QUEST } from "./workdaySurvival";
import { FAST_CONVENIENCE_QUEST } from "./fastConvenience";
import { TRAIN_ANNOUNCEMENT_QUEST } from "./trainAnnouncement";
import { FRIEND_REAL_MEANING_QUEST } from "./friendRealMeaning";
import { CONTRACTION_CITY_QUEST } from "./contractionCity";
import { IZAKAYA_LISTENING_QUEST } from "./izakayaListening";
import { READ_BETWEEN_LINES_QUEST } from "./readBetweenLines";
import { NATIVE_SPEED_SURVIVAL_QUEST } from "./nativeSpeedSurvival";

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
  // Chapter 4
  MORNING_OFFICE_QUEST,
  REPORTING_TO_BOSS_QUEST,
  BUSINESS_PHONE_QUEST,
  CUSTOMER_SERVICE_QUEST,
  REPORT_MISTAKE_QUEST,
  MEETING_SPEAK_QUEST,
  WORKDAY_SURVIVAL_QUEST,
  // Chapter 5
  FAST_CONVENIENCE_QUEST,
  TRAIN_ANNOUNCEMENT_QUEST,
  FRIEND_REAL_MEANING_QUEST,
  CONTRACTION_CITY_QUEST,
  IZAKAYA_LISTENING_QUEST,
  READ_BETWEEN_LINES_QUEST,
  NATIVE_SPEED_SURVIVAL_QUEST,
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
