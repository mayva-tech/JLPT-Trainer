import {
  CTA_STORAGE_KEY,
  DEFAULT_CTA,
  DEFAULT_INTRO,
  INTRO_STORAGE_KEY,
} from "../config/introCtaDefaults";

export type IntroHookCopy = {
  english: string;
  japanese: string;
};

export type EndingCtaCopy = {
  japanese: string;
  english: string;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadIntroHook(): IntroHookCopy {
  const saved = readJson<Partial<IntroHookCopy>>(INTRO_STORAGE_KEY);
  return {
    english: saved?.english?.trim() ? saved.english : DEFAULT_INTRO.english,
    japanese: saved?.japanese?.trim()
      ? saved.japanese
      : DEFAULT_INTRO.japanese,
  };
}

export function saveIntroHook(copy: IntroHookCopy): void {
  localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify(copy));
}

export function resetIntroHook(): IntroHookCopy {
  localStorage.removeItem(INTRO_STORAGE_KEY);
  return { ...DEFAULT_INTRO };
}

export function loadEndingCta(): EndingCtaCopy {
  const saved = readJson<Partial<EndingCtaCopy>>(CTA_STORAGE_KEY);
  return {
    japanese: saved?.japanese?.trim() ? saved.japanese : DEFAULT_CTA.japanese,
    english: saved?.english?.trim() ? saved.english : DEFAULT_CTA.english,
  };
}

export function saveEndingCta(copy: EndingCtaCopy): void {
  localStorage.setItem(CTA_STORAGE_KEY, JSON.stringify(copy));
}

export function resetEndingCta(): EndingCtaCopy {
  localStorage.removeItem(CTA_STORAGE_KEY);
  return { ...DEFAULT_CTA };
}
