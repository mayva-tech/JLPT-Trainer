import type { HeadLook, HeadVoice } from "./types";
import {
  AndrewAfro,
  AndrewBeanie,
  AndrewBuzzCut,
  AndrewCaptain,
  AndrewChef,
  AndrewCowboy,
  AndrewFlatCap,
  AndrewGraduate,
  AndrewMohawk,
  AndrewPompadour,
  AndrewSurfer,
  AndrewViking,
  AndrewClassic,
  AndrewGinger,
  AndrewHeadphones,
  AndrewHoodie,
  AndrewManBun,
  AndrewScholar,
  AndrewSidePart,
  AndrewSilverFox,
} from "./andrewLooks";
import {
  NanamiBarista,
  NanamiBeret,
  NanamiBob,
  NanamiChignon,
  NanamiDoctor,
  NanamiFlowerCrown,
  NanamiHarajuku,
  NanamiMiko,
  NanamiRock,
  NanamiSideBraid,
  NanamiSnowDay,
  NanamiSporty,
  NanamiHaori,
  NanamiKimono,
  NanamiMariniere,
  NanamiOffice,
  NanamiPixie,
  NanamiTwinTails,
  NanamiWavy,
  NanamiYukata,
} from "./nanamiLooks";

export type { HeadLook, HeadVoice, LookLayer, LookLayerProps } from "./types";

/** Andrew (en). The first entry is the original portrait and the default. */
export const ANDREW_LOOKS: readonly HeadLook[] = [
  { id: "classic", label: "Classic", browColor: "#b8925a", Layers: AndrewClassic },
  { id: "side-part", label: "Side part", browColor: "#3a2618", Layers: AndrewSidePart },
  { id: "hoodie", label: "Hoodie", browColor: "#1f1b1a", Layers: AndrewHoodie },
  { id: "ginger", label: "Ginger", browColor: "#9a4522", Layers: AndrewGinger },
  { id: "scholar", label: "Scholar", browColor: "#5a3e28", Layers: AndrewScholar },
  { id: "beanie", label: "Beanie", browColor: "#b8985a", Layers: AndrewBeanie },
  { id: "silver-fox", label: "Silver fox", browColor: "#8c8c8c", Layers: AndrewSilverFox },
  { id: "man-bun", label: "Man bun", browColor: "#2e2018", Layers: AndrewManBun },
  { id: "buzz-cut", label: "Buzz cut", browColor: "#2a2522", Layers: AndrewBuzzCut },
  { id: "headphones", label: "Headphones", browColor: "#5e3820", Layers: AndrewHeadphones },
  // set 2
  { id: "chef", label: "Chef", browColor: "#3a2a20", Layers: AndrewChef },
  { id: "pompadour", label: "Pompadour", browColor: "#1a1a1f", Layers: AndrewPompadour },
  { id: "afro", label: "Afro", browColor: "#241a16", Layers: AndrewAfro },
  { id: "cowboy", label: "Cowboy", browColor: "#5a3e28", Layers: AndrewCowboy },
  { id: "surfer", label: "Surfer", browColor: "#c9a650", Layers: AndrewSurfer },
  { id: "mohawk", label: "Mohawk", browColor: "#2a2522", Layers: AndrewMohawk },
  { id: "captain", label: "Captain", browColor: "#c8c8c2", Layers: AndrewCaptain },
  { id: "graduate", label: "Graduate", browColor: "#5a3e28", Layers: AndrewGraduate },
  { id: "viking", label: "Viking", browColor: "#7a5a32", Layers: AndrewViking },
  { id: "flat-cap", label: "Flat cap", browColor: "#4a3222", Layers: AndrewFlatCap },
];

/** Nanami (ja). The first entry is the original portrait and the default. */
export const NANAMI_LOOKS: readonly HeadLook[] = [
  { id: "kimono", label: "Kimono", browColor: "#3a2a22", Layers: NanamiKimono },
  { id: "yukata", label: "Yukata", browColor: "#3a2a22", Layers: NanamiYukata },
  { id: "office", label: "Office", browColor: "#2e2428", Layers: NanamiOffice },
  { id: "bob", label: "Bob", browColor: "#4a3020", Layers: NanamiBob },
  { id: "twin-tails", label: "Twin tails", browColor: "#2a2230", Layers: NanamiTwinTails },
  { id: "wavy", label: "Wavy", browColor: "#553220", Layers: NanamiWavy },
  { id: "haori", label: "Haori", browColor: "#2a2226", Layers: NanamiHaori },
  { id: "mariniere", label: "Marinière", browColor: "#6a2e1c", Layers: NanamiMariniere },
  { id: "pixie", label: "Pixie", browColor: "#221c20", Layers: NanamiPixie },
  { id: "beret", label: "Beret", browColor: "#2e2428", Layers: NanamiBeret },
  // set 2
  { id: "miko", label: "Miko", browColor: "#221c22", Layers: NanamiMiko },
  { id: "barista", label: "Barista", browColor: "#4a3226", Layers: NanamiBarista },
  { id: "doctor", label: "Doctor", browColor: "#33262a", Layers: NanamiDoctor },
  { id: "harajuku", label: "Harajuku", browColor: "#c87898", Layers: NanamiHarajuku },
  { id: "rock", label: "Rock", browColor: "#18141a", Layers: NanamiRock },
  { id: "chignon", label: "Silver chignon", browColor: "#8c8c96", Layers: NanamiChignon },
  { id: "snow-day", label: "Snow day", browColor: "#3a2a22", Layers: NanamiSnowDay },
  { id: "sporty", label: "Sporty", browColor: "#3a2a22", Layers: NanamiSporty },
  { id: "flower-crown", label: "Flower crown", browColor: "#8a5e3c", Layers: NanamiFlowerCrown },
  { id: "side-braid", label: "Side braid", browColor: "#3a2a26", Layers: NanamiSideBraid },
];

export function looksFor(voice: HeadVoice): readonly HeadLook[] {
  return voice === "en" ? ANDREW_LOOKS : NANAMI_LOOKS;
}

/** The look with this id, falling back to the default (first) look. */
export function resolveLook(
  looks: readonly HeadLook[],
  id: string | null | undefined
): HeadLook {
  return looks.find((l) => l.id === id) ?? looks[0];
}

/** Id of the look `step` places after `id`, wrapping at either end. */
export function stepLookId(
  looks: readonly HeadLook[],
  id: string | null | undefined,
  step: number
): string {
  const n = looks.length;
  const at = Math.max(
    0,
    looks.findIndex((l) => l.id === id)
  );
  return looks[(((at + step) % n) + n) % n].id;
}
