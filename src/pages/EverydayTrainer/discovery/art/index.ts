import { lazy, type ComponentType } from "react";

/**
 * Original scene illustrations, one chunk each, loaded when first shown.
 * Each draws in a 1600 × 1000 coordinate space and marks every tappable
 * object with `data-obj="<object id>"`.
 */
export const SCENE_ART: Record<string, ComponentType> = {
  kitchen: lazy(() => import("./KitchenArt").then((m) => ({ default: m.KitchenArt }))),
  train: lazy(() => import("./TrainArt").then((m) => ({ default: m.TrainArt }))),
  street: lazy(() => import("./StreetArt").then((m) => ({ default: m.StreetArt }))),
};
