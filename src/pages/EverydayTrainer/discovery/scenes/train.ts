import type { DiscoveryScene } from "../types";

/**
 * Inside a Commuter Train — hotspots traced from art/TrainArt.tsx (see ../README.md):
 * each object's visible pixels, outlined and simplified. Normalized 0–1.
 * Order = guided-tour order and "next undiscovered" order.
 */
export const TRAIN_SCENE: DiscoveryScene = {
  id: "train",
  titleEnglish: "Inside a Commuter Train",
  titleJapanese: "電車(でんしゃ)の中(なか)",
  imagePath: "art:train",
  imageWidth: 1600,
  imageHeight: 1000,
  categoryId: "train",
  blurb: "Long bench seats, hand straps, the priority section and the door on a Tokyo-style commuter line.",
  credit: null,
  objects: [
    {
      id: "hand-strap",
      vocabularyId: "hand-strap",
      hotspot: { type: "polygon", points: [[0.1963, 0.254], [0.1919, 0.129], [0.195, 0.125], [0.6044, 0.125], [0.6075, 0.129], [0.5906, 0.254], [0.5875, 0.258], [0.1994, 0.258]] },
    },
    {
      id: "priority-seat",
      vocabularyId: "priority-seat",
      hotspot: { type: "polygon", points: [[0.8113, 0.512], [0.8125, 0.516], [0.8119, 0.731], [0.6262, 0.732], [0.6244, 0.73], [0.6244, 0.639], [0.6269, 0.516], [0.63, 0.509], [0.6344, 0.505], [0.805, 0.505]] },
    },
    {
      id: "seat",
      vocabularyId: "seat",
      hotspot: { type: "polygon", points: [[0.1694, 0.73], [0.1694, 0.685], [0.1806, 0.516], [0.1844, 0.508], [0.1881, 0.505], [0.6075, 0.505], [0.6112, 0.508], [0.615, 0.516], [0.6175, 0.639], [0.6175, 0.73], [0.61, 0.76], [0.6081, 0.762], [0.1875, 0.762]] },
    },
    {
      id: "handrail",
      vocabularyId: "handrail",
      hotspot: { type: "polygon", points: [[0.6288, 0.287], [0.6312, 0.29], [0.6312, 0.76], [0.6294, 0.762], [0.6125, 0.762], [0.6106, 0.76], [0.6106, 0.29], [0.6131, 0.287]] },
    },
    {
      id: "luggage-rack",
      vocabularyId: "luggage-rack",
      hotspot: { type: "polygon", points: [[0.1806, 0.291], [0.1806, 0.263], [0.1837, 0.232], [0.1856, 0.23], [0.8106, 0.23], [0.8125, 0.232], [0.8125, 0.293], [0.8106, 0.295], [0.1837, 0.295]] },
    },
    {
      id: "window",
      vocabularyId: "window",
      hotspot: { type: "polygon", points: [[0.605, 0.305], [0.605, 0.502], [0.5988, 0.51], [0.1894, 0.51], [0.1831, 0.502], [0.1831, 0.305], [0.1888, 0.297], [0.5994, 0.297]] },
    },
    {
      id: "door",
      vocabularyId: "door",
      hotspot: { type: "polygon", points: [[0.9994, 0.115], [0.9994, 0.762], [0.8363, 0.762], [0.8344, 0.76], [0.8344, 0.117], [0.8363, 0.115]] },
    },
    {
      id: "emergency-button",
      vocabularyId: "emergency-button",
      hotspot: { type: "polygon", points: [[0.8325, 0.376], [0.8356, 0.38], [0.8356, 0.455], [0.8325, 0.459], [0.8144, 0.459], [0.8113, 0.455], [0.8113, 0.38], [0.8144, 0.376]] },
    },
    {
      id: "hanging-ad",
      vocabularyId: "hanging-ad",
      hotspot: { type: "polygon", points: [[0.8075, 0.105], [0.8056, 0.221], [0.8037, 0.223], [0.6456, 0.223], [0.6438, 0.221], [0.6419, 0.105], [0.655, 0.093], [0.7944, 0.093]] },
    },
    {
      id: "passenger",
      vocabularyId: "passenger",
      hotspot: { type: "polygon", points: [[0.3944, 0.375], [0.3806, 0.387], [0.3756, 0.407], [0.3781, 0.439], [0.3906, 0.461], [0.3906, 0.47], [0.3638, 0.483], [0.3575, 0.506], [0.3569, 0.664], [0.3738, 0.668], [0.3762, 0.748], [0.3706, 0.76], [0.3794, 0.767], [0.3994, 0.76], [0.42, 0.767], [0.4288, 0.76], [0.4244, 0.749], [0.4269, 0.668], [0.4425, 0.664], [0.44, 0.579], [0.4444, 0.532], [0.4363, 0.484], [0.4088, 0.47], [0.4088, 0.461], [0.4181, 0.448], [0.4225, 0.431], [0.4206, 0.39], [0.41, 0.377]] },
    },
    {
      id: "mind-your-step",
      vocabularyId: "mind-your-step",
      prompt: {
        en: "Find the “mind your step” sign.",
        ja: "足元の注意書きを探してください。",
        jaReading: "あしもとのちゅういがきをさがしてください。",
      },
      hotspot: { type: "polygon", points: [[0.9994, 0.912], [0.9994, 0.929], [0.8387, 0.93], [0.8369, 0.928], [0.8469, 0.857], [0.8488, 0.855], [0.9881, 0.855], [0.99, 0.857]] },
    },
  ],
};
