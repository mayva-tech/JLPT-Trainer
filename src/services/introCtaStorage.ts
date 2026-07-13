import {
  CTA_STORAGE_KEY,
  DEFAULT_CTA,
  DEFAULT_INTRO,
  DEFAULT_QUIZ_AFTER,
  DEFAULT_QUIZ_PRE,
  INTRO_STORAGE_KEY,
  QUIZ_AFTER_STORAGE_KEY,
  QUIZ_PRE_STORAGE_KEY,
} from "../config/introCtaDefaults";

export type IntroHookCopy = {
  english: string;
  japanese: string;
};

export type EndingCtaCopy = {
  japanese: string;
  english: string;
};

export type QuizCommentCopy = {
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

export function loadQuizPreComment(): QuizCommentCopy {
  const saved = readJson<Partial<QuizCommentCopy>>(QUIZ_PRE_STORAGE_KEY);
  return {
    japanese: saved?.japanese?.trim()
      ? saved.japanese
      : DEFAULT_QUIZ_PRE.japanese,
    english: saved?.english?.trim()
      ? saved.english
      : DEFAULT_QUIZ_PRE.english,
  };
}

export function saveQuizPreComment(copy: QuizCommentCopy): void {
  localStorage.setItem(QUIZ_PRE_STORAGE_KEY, JSON.stringify(copy));
}

export function resetQuizPreComment(): QuizCommentCopy {
  localStorage.removeItem(QUIZ_PRE_STORAGE_KEY);
  return { ...DEFAULT_QUIZ_PRE };
}

export function loadQuizAfterComment(): QuizCommentCopy {
  const saved = readJson<Partial<QuizCommentCopy>>(QUIZ_AFTER_STORAGE_KEY);
  return {
    japanese: saved?.japanese?.trim()
      ? saved.japanese
      : DEFAULT_QUIZ_AFTER.japanese,
    english: saved?.english?.trim()
      ? saved.english
      : DEFAULT_QUIZ_AFTER.english,
  };
}

export function saveQuizAfterComment(copy: QuizCommentCopy): void {
  localStorage.setItem(QUIZ_AFTER_STORAGE_KEY, JSON.stringify(copy));
}

export function resetQuizAfterComment(): QuizCommentCopy {
  localStorage.removeItem(QUIZ_AFTER_STORAGE_KEY);
  return { ...DEFAULT_QUIZ_AFTER };
}
