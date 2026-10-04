import type { ComponentType } from "react";
import {
  Appliances,
  Broken,
  Fridge,
  Heater,
  PressureCooker,
  RiceCooker,
  Vacuum,
  VentFan,
  Washer,
} from "./svgDrawings";

/**
 * Hand-drawn pictures by id, for `svg:<id>` in scripts/illustrations/*.tsv.
 * Keys must match SVG_IDS in scripts/generateIllustrations.mjs.
 */
export const SVG_ART: Readonly<Record<string, ComponentType>> = {
  washer: Washer,
  fridge: Fridge,
  vacuum: Vacuum,
  heater: Heater,
  ventfan: VentFan,
  ricecooker: RiceCooker,
  pressurecooker: PressureCooker,
  appliances: Appliances,
  broken: Broken,
};
