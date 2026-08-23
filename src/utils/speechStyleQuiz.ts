import { buildComparisons, shuffleStyles } from "./speechStyles";
import type { StyleExpression, StyleGender } from "../types/speechStyle";

/**
 * Three quiz shapes, matching the three things a learner actually gets wrong:
 *
 *   who-says      — "Who would naturally say this?"  (register recognition)
 *   more-natural  — "Which sounds more natural here?" (situation matching)
 *   rewrite       — "Say this as masculine/feminine/neutral Japanese"
 */
export type StyleQuestionKind = "who-says" | "more-natural" | "rewrite";

export interface StyleQuizOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface StyleQuizQuestion {
  id: string;
  expressionId: string;
  kind: StyleQuestionKind;
  prompt: string;
  /** The Japanese under discussion, displayed large. */
  focus: string;
  focusReading?: string;
  options: StyleQuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface StyleQuizConfig {
  pool: readonly StyleExpression[];
  count: number;
  random?: () => number;
}

const SPEAKER_LABELS: Record<string, string> = {
  "young-woman": "A young woman",
  "adult-woman": "An adult woman",
  "young-man": "A young man",
  "adult-man": "An adult man",
  "older-speaker": "An older speaker",
  anyone: "Anyone, regardless of gender",
};

const STRENGTH_LABELS: Record<string, string> = {
  "strongly-feminine": "Strongly feminine",
  "somewhat-feminine": "Somewhat feminine",
  neutral: "Neutral — anyone",
  "somewhat-masculine": "Somewhat masculine",
  "strongly-masculine": "Strongly masculine",
};

const GENDER_LABELS: Record<StyleGender, string> = {
  feminine: "feminine-leaning",
  neutral: "neutral",
  masculine: "masculine-leaning",
};

const SITUATIONS: Record<string, string> = {
  formal: "in a meeting with a client you have never met",
  polite: "talking to a colleague you do not know well",
  casual: "chatting with a friend",
  "very-casual": "messaging a close friend",
  rough: "venting to your closest friend",
};

/**
 * "Who would naturally say this?" — the answer is the strength label, so the
 * neutral option is always available and is frequently correct. That matters:
 * a quiz that only ever rewards "masculine" or "feminine" would teach the
 * stereotype this page exists to undo.
 */
function buildWhoSays(
  item: StyleExpression,
  index: number,
  random: () => number
): StyleQuizQuestion {
  const wrong = Object.keys(STRENGTH_LABELS).filter(
    (key) => key !== item.strength
  );
  const picked = shuffleStyles(wrong, random).slice(0, 3);

  const options = shuffleStyles(
    [item.strength, ...picked].map((strength, i) => ({
      id: `opt-${i}-${strength}`,
      label: STRENGTH_LABELS[strength],
    })),
    random
  );

  const correct = options.find(
    (option) => option.label === STRENGTH_LABELS[item.strength]
  )!;

  const speakers = item.speakers
    .map((speaker) => SPEAKER_LABELS[speaker])
    .join(", ");

  return {
    id: `q-${index}`,
    expressionId: item.id,
    kind: "who-says",
    prompt: "Who would naturally say this?",
    focus: item.japanese,
    focusReading: item.reading,
    options,
    correctOptionId: correct.id,
    explanation: `${item.japanese}（${item.reading}）— ${item.english}. ${STRENGTH_LABELS[item.strength]}. Typical speakers: ${speakers}.${item.warning ? ` ${item.warning}` : ""}`,
  };
}

/**
 * "Which sounds more natural?" — a situation is described, and the choices are
 * the members of one comparison group. The correct answer is the member whose
 * politeness matches the situation.
 */
function buildMoreNatural(
  members: StyleExpression[],
  index: number,
  random: () => number
): StyleQuizQuestion | null {
  const byPoliteness = new Map<string, StyleExpression>();
  for (const member of members) {
    if (!byPoliteness.has(member.politeness)) {
      byPoliteness.set(member.politeness, member);
    }
  }
  if (byPoliteness.size < 2) return null;

  const politeness = shuffleStyles([...byPoliteness.keys()], random)[0];
  const answer = byPoliteness.get(politeness)!;
  const distractors = members
    .filter((member) => member.politeness !== politeness)
    .slice(0, 3);
  if (distractors.length === 0) return null;

  const options = shuffleStyles(
    [answer, ...distractors].map((member, i) => ({
      id: `opt-${i}-${member.id}`,
      label: member.japanese,
      sublabel: member.reading,
      isAnswer: member.id === answer.id,
    })),
    random
  );

  const correct = options.find((option) => option.isAnswer)!;

  return {
    id: `q-${index}`,
    expressionId: answer.id,
    kind: "more-natural",
    prompt: `Which sounds most natural ${SITUATIONS[politeness] ?? "in this situation"}?`,
    focus: answer.english,
    options: options.map(({ id, label, sublabel }) => ({
      id,
      label,
      sublabel,
    })),
    correctOptionId: correct.id,
    explanation: `${answer.japanese}（${answer.reading}）is ${answer.politeness.replace("-", " ")} and ${GENDER_LABELS[answer.gender]}.${answer.warning ? ` ${answer.warning}` : ""}`,
  };
}

/**
 * "Rewrite this as masculine / feminine / neutral Japanese" — pick the variant
 * from the same comparison group with the requested lean.
 */
function buildRewrite(
  members: StyleExpression[],
  index: number,
  random: () => number
): StyleQuizQuestion | null {
  const genders = new Set(members.map((member) => member.gender));
  if (genders.size < 2) return null;

  const target = shuffleStyles([...genders], random)[0] as StyleGender;
  const answer = members.find((member) => member.gender === target)!;
  const source = shuffleStyles(
    members.filter((member) => member.gender !== target),
    random
  )[0];
  if (!source) return null;

  const distractors = members
    .filter((member) => member.id !== answer.id)
    .slice(0, 3);
  if (distractors.length === 0) return null;

  const options = shuffleStyles(
    [answer, ...distractors].map((member, i) => ({
      id: `opt-${i}-${member.id}`,
      label: member.japanese,
      sublabel: member.reading,
      isAnswer: member.id === answer.id,
    })),
    random
  );

  const correct = options.find((option) => option.isAnswer)!;

  return {
    id: `q-${index}`,
    expressionId: answer.id,
    kind: "rewrite",
    prompt: `Rewrite this as ${GENDER_LABELS[target]} Japanese.`,
    focus: source.japanese,
    focusReading: source.reading,
    options: options.map(({ id, label, sublabel }) => ({
      id,
      label,
      sublabel,
    })),
    correctOptionId: correct.id,
    explanation: `${source.japanese} → ${answer.japanese}（${answer.reading}）. ${STRENGTH_LABELS[answer.strength]}.${answer.warning ? ` ${answer.warning}` : ""}`,
  };
}

export function buildStyleQuiz({
  pool,
  count,
  random = Math.random,
}: StyleQuizConfig): StyleQuizQuestion[] {
  if (pool.length === 0 || count <= 0) return [];

  const comparisons = buildComparisons(pool);
  const shuffledItems = shuffleStyles(pool, random);
  const shuffledGroups = shuffleStyles(comparisons, random);

  const questions: StyleQuizQuestion[] = [];
  let itemCursor = 0;
  let groupCursor = 0;

  while (questions.length < count) {
    const slot = questions.length % 3;
    let question: StyleQuizQuestion | null = null;

    if (slot === 1 && shuffledGroups.length > 0) {
      const group = shuffledGroups[groupCursor % shuffledGroups.length];
      groupCursor += 1;
      question = buildMoreNatural(group.members, questions.length, random);
    } else if (slot === 2 && shuffledGroups.length > 0) {
      const group = shuffledGroups[groupCursor % shuffledGroups.length];
      groupCursor += 1;
      question = buildRewrite(group.members, questions.length, random);
    }

    // Slot 0, and any group-based slot that could not produce a question,
    // fall back to who-says, which works for every single expression.
    if (!question) {
      if (itemCursor >= shuffledItems.length) break;
      question = buildWhoSays(
        shuffledItems[itemCursor],
        questions.length,
        random
      );
      itemCursor += 1;
    }

    questions.push(question);
  }

  return questions;
}

export interface StyleQuizAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
}

export interface StyleQuizResult {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  missed: StyleQuizQuestion[];
}

export function scoreStyleQuiz(
  questions: readonly StyleQuizQuestion[],
  answers: readonly StyleQuizAnswer[]
): StyleQuizResult {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const missed = questions.filter((question) => !byId.get(question.id)?.correct);
  const correct = questions.length - missed.length;

  return {
    total: questions.length,
    correct,
    incorrect: missed.length,
    percentage:
      questions.length === 0
        ? 0
        : Math.round((correct / questions.length) * 100),
    missed,
  };
}
