import type { CommunicationSealId, LocationId } from "../types";

export type { CommunicationSealId };

export type CommunicationSeal = {
  id: CommunicationSealId;
  japaneseName: string;
  englishName: string;
  icon: string;
  /** Quest that awards this seal on first clear. */
  awardQuestId?: string;
  /** Optional location affiliation for hub display. */
  locationId?: LocationId;
};

export const COMMUNICATION_SEALS: readonly CommunicationSeal[] = [
  {
    id: "city-hall",
    japaneseName: "市役所の証",
    englishName: "City Hall Seal",
    icon: "🏛️",
    awardQuestId: "city-hall-register",
    locationId: "city-hall",
  },
  {
    id: "transportation",
    japaneseName: "交通の証",
    englishName: "Transportation Seal",
    icon: "🚃",
    awardQuestId: "station-master",
    locationId: "train-station",
  },
  {
    id: "daily-life",
    japaneseName: "生活の証",
    englishName: "Daily Life Seal",
    icon: "🏪",
    awardQuestId: "convenience-first-shop",
    locationId: "convenience-store",
  },
  {
    id: "communication",
    japaneseName: "会話の証",
    englishName: "Communication Seal",
    icon: "💬",
    awardQuestId: "first-week-challenge",
  },
  {
    id: "workplace",
    japaneseName: "職場の証",
    englishName: "Workplace Seal",
    icon: "🏢",
    awardQuestId: "first-day-office",
    locationId: "office",
  },
  {
    id: "social",
    japaneseName: "社会の証",
    englishName: "Social Seal",
    icon: "🤝",
    awardQuestId: "relationships-challenge",
  },
  {
    id: "fluency",
    japaneseName: "流暢の証",
    englishName: "Fluency Seal",
    icon: "✨",
    // Future Chapter 4+ license path.
  },
] as const;

export function getSealById(id: CommunicationSealId): CommunicationSeal | undefined {
  return COMMUNICATION_SEALS.find((s) => s.id === id);
}

export function sealAwardedByQuest(questId: string): CommunicationSeal | undefined {
  return COMMUNICATION_SEALS.find((s) => s.awardQuestId === questId);
}
