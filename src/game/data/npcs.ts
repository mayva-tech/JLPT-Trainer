import type { NpcDefinition } from "../types";

export const NPCS: readonly NpcDefinition[] = [
  {
    id: "tanaka-city-hall",
    name: "Tanaka",
    japaneseName: "田中さん",
    role: "City Hall Staff",
    locationId: "city-hall",
    portrait: "田",
    dialogueStyle: "formal",
  },
  {
    id: "sato-clerk",
    name: "Sato",
    japaneseName: "佐藤さん",
    role: "Convenience Store Clerk",
    locationId: "convenience-store",
    portrait: "佐",
    dialogueStyle: "polite",
  },
  {
    id: "haruka",
    name: "Haruka",
    japaneseName: "はるか",
    role: "Neighbor",
    locationId: "home",
    portrait: "遥",
    dialogueStyle: "casual",
  },
  {
    id: "yamamoto-station",
    name: "Yamamoto",
    japaneseName: "山本さん",
    role: "Station Staff",
    locationId: "train-station",
    portrait: "山",
    dialogueStyle: "formal",
  },
  {
    id: "ken",
    name: "Ken",
    japaneseName: "ケン",
    role: "Café Owner",
    locationId: "cafe",
    portrait: "ケ",
    dialogueStyle: "casual",
  },
] as const;

export function getNpcById(id: string): NpcDefinition | undefined {
  return NPCS.find((npc) => npc.id === id);
}
