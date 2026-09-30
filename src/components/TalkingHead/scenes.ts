import type { SceneBackdrop } from "../../services/sceneBus";

/** Label shown on the scene card — a small vocabulary moment of its own. */
export const SCENE_LABELS: Record<
  SceneBackdrop,
  { ja: string; reading: string; en: string }
> = {
  home: { ja: "家", reading: "いえ", en: "Home" },
  office: { ja: "会社", reading: "かいしゃ", en: "Office" },
  clinic: { ja: "病院", reading: "びょういん", en: "Clinic" },
  restaurant: { ja: "居酒屋", reading: "いざかや", en: "Restaurant" },
  hotel: { ja: "ホテル", reading: "ほてる", en: "Hotel" },
  station: { ja: "駅", reading: "えき", en: "Station" },
  konbini: { ja: "コンビニ", reading: "こんびに", en: "Konbini" },
  street: { ja: "町", reading: "まち", en: "Town" },
  cafe: { ja: "喫茶店", reading: "きっさてん", en: "Café" },
  counter: { ja: "窓口", reading: "まどぐち", en: "Service counter" },
};

export const SCENE_BACKDROPS = Object.keys(SCENE_LABELS) as SceneBackdrop[];

/**
 * Phone-call category → where the call is about. The learner is on the phone
 * either way; the backdrop sets the situation.
 */
const PHONE_BACKDROP: Record<string, SceneBackdrop> = {
  "phone-skills": "home",
  messages: "office",
  appointments: "clinic",
  reservations: "restaurant",
  "school-work": "office",
  delivery: "home",
  utilities: "home",
  finance: "counter",
  government: "counter",
  transport: "station",
  shopping: "home",
  business: "office",
  emergency: "home",
};

export function phoneBackdrop(category: string): SceneBackdrop {
  return PHONE_BACKDROP[category] ?? "home";
}

/** Trip scenario id → scene; cards and unknown scripts are "out in town". */
const TRIP_BACKDROP: Record<string, SceneBackdrop> = {
  tr1: "street",
  tr2: "station",
  tr3: "station",
  tr4: "street",
  tr5: "restaurant",
  tr6: "street",
  tr7: "hotel",
  tr8: "street",
  tr9: "street",
  tr10: "clinic",
};

export function tripBackdrop(scriptId: string | null): SceneBackdrop {
  return (scriptId && TRIP_BACKDROP[scriptId]) || "street";
}
