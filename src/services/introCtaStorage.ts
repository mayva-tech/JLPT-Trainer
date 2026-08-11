import {
  CTA_STORAGE_KEY,
  DEFAULT_CTA,
  DEFAULT_INTRO,
  DEFAULT_QUIZ_AFTER,
  DEFAULT_QUIZ_PRE,
  INTERVIEW_STORAGE_KEY,
  INTRO_STORAGE_KEY,
  QUIZ_AFTER_STORAGE_KEY,
  QUIZ_PRE_STORAGE_KEY,
} from "../config/introCtaDefaults";
import {
  getInterviewSectionById,
  interviewJapaneseText,
  type InterviewLine,
  type InterviewSection,
} from "../data/interviewPrep";

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

export type InterviewSectionCopy = {
  lines: InterviewLine[];
  english: string;
};

type InterviewOverrides = Record<string, Partial<InterviewSectionCopy>>;

function loadInterviewOverrides(): InterviewOverrides {
  return readJson<InterviewOverrides>(INTERVIEW_STORAGE_KEY) ?? {};
}

export function loadInterviewSection(
  sectionId: string
): InterviewSectionCopy | null {
  const base = getInterviewSectionById(sectionId);
  if (!base) return null;
  const override = loadInterviewOverrides()[sectionId];
  return {
    lines:
      override?.lines && override.lines.length > 0 ? override.lines : base.lines,
    english: override?.english?.trim() ? override.english : base.english,
  };
}

export function saveInterviewSection(
  sectionId: string,
  copy: InterviewSectionCopy
): void {
  const all = loadInterviewOverrides();
  all[sectionId] = copy;
  localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(all));
}

export function resetInterviewSection(
  sectionId: string
): InterviewSectionCopy | null {
  const base = getInterviewSectionById(sectionId);
  if (!base) return null;
  const all = loadInterviewOverrides();
  delete all[sectionId];
  if (Object.keys(all).length === 0) {
    localStorage.removeItem(INTERVIEW_STORAGE_KEY);
  } else {
    localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(all));
  }
  return { lines: base.lines, english: base.english };
}

export function resolveInterviewSection(
  section: InterviewSection
): InterviewSection {
  const copy = loadInterviewSection(section.id);
  if (!copy) return section;
  return { ...section, lines: copy.lines, english: copy.english };
}

export { interviewJapaneseText };
