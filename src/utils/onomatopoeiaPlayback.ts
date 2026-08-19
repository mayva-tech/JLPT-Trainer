import { getOnomatopoeiaCategory } from "../data/onomatopoeia";
import type { OnomatopoeiaItem, OnomatopoeiaPart } from "../types/onomatopoeia";
import { splitNuanceForSpeech } from "./nuanceSpeech";

export type OnoPlayStep = {
  part: OnomatopoeiaPart;
  lang: "ja" | "en";
  text: string;
  reading?: string;
};

function splitCategoryJapanese(japanese: string): string[] {
  return japanese
    .split(/[・･]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function speakableCollocation(text: string): string {
  return text.replace(/\s*\/\s*/g, "、").replace(/\s*\+\s*/g, " ").trim();
}

/** Top-to-bottom voiceover for every visible line on an onomatopoeia card. */
export function buildOnoPlaySteps(item: OnomatopoeiaItem): OnoPlayStep[] {
  const steps: OnoPlayStep[] = [];
  const category = getOnomatopoeiaCategory(item.category);

  if (category) {
    for (const part of splitCategoryJapanese(category.japanese)) {
      steps.push({ part: "categoryJa", lang: "ja", text: part });
    }
    if (category.english.trim()) {
      steps.push({
        part: "categoryEn",
        lang: "en",
        text: category.english.trim(),
      });
    }
  }

  if (item.japanese.trim()) {
    steps.push({
      part: "word",
      lang: "ja",
      text: item.japanese,
      reading: item.reading,
    });
  }

  if (item.meaning.trim()) {
    steps.push({ part: "meaning", lang: "en", text: item.meaning.trim() });
  }

  if (item.collocation.trim()) {
    steps.push({
      part: "collocation",
      lang: "ja",
      text: speakableCollocation(item.collocation),
    });
  }

  if (item.nuance.trim()) {
    for (const segment of splitNuanceForSpeech(item.nuance)) {
      const text = segment.text.trim();
      if (!text) continue;
      steps.push({ part: "nuance", lang: segment.lang, text });
    }
  }

  if (item.exampleJapanese.trim()) {
    steps.push({
      part: "example",
      lang: "ja",
      text: item.exampleJapanese,
      reading: item.exampleReading,
    });
  }

  if (item.exampleEnglish.trim()) {
    steps.push({
      part: "exampleEn",
      lang: "en",
      text: item.exampleEnglish.trim(),
    });
  }

  if (item.exampleJapanese.trim() && item.exampleEnglish.trim()) {
    steps.push({
      part: "example",
      lang: "ja",
      text: item.exampleJapanese,
      reading: item.exampleReading,
    });
  }

  return steps;
}
