import { phoneScenarios } from "../data/phoneCalls";
import { shufflePhone } from "./phoneCalls";
import type { PhoneLine, PhoneScenario } from "../types/phoneCall";

/**
 * Role-play mode replays a scenario one line at a time. Lines spoken by the
 * other side are shown; on the learner's turn the correct line is offered
 * alongside distractors and the learner has to pick.
 *
 * Distractors are drawn from learner-side lines in OTHER scenarios at the same
 * JLPT level. They are grammatical, natural Japanese that simply does not fit
 * this moment in this call — which is the skill being tested. Very short or
 * purely formulaic lines are excluded from the pool, because those (はい,
 * ありがとうございます) fit almost anywhere and would make ambiguous questions.
 */

export interface RolePlayOption {
  id: string;
  japanese: string;
  reading: string;
  english: string;
  correct: boolean;
}

export interface RolePlayStep {
  /** Index of the line in the scenario's dialogue array. */
  lineIndex: number;
  line: PhoneLine;
  /** True when the learner must choose; false when the line is just shown. */
  isLearnerTurn: boolean;
  /** Present only on learner turns. */
  options?: RolePlayOption[];
}

export interface RolePlayConfig {
  scenario: PhoneScenario;
  random?: () => number;
  /** Total choices per learner turn, including the correct one. */
  choices?: number;
}

/** Formulaic lines that would fit too many contexts to be fair distractors. */
const TOO_GENERIC = [
  "はい",
  "いいえ",
  "はい、どうぞ",
  "ありがとうございます",
  "よろしくお願いします",
  "失礼します",
  "わかりました",
  "お世話になっております",
];

function isUsableDistractor(line: PhoneLine): boolean {
  const text = line.japanese.trim();
  if (text.length < 10) return false;
  return !TOO_GENERIC.some((generic) => text.startsWith(generic) && text.length < 16);
}

/** Learner-side lines from every scenario, grouped by level. */
const poolByLevel = new Map<string, PhoneLine[]>();
for (const scenario of phoneScenarios) {
  const lines = scenario.dialogue.filter(
    (line) => line.speaker === scenario.learner && isUsableDistractor(line)
  );
  const existing = poolByLevel.get(scenario.jlptLevel) ?? [];
  poolByLevel.set(scenario.jlptLevel, [...existing, ...lines]);
}

/** Same level first, then anything, so small levels still fill their choices. */
function distractorPool(scenario: PhoneScenario): PhoneLine[] {
  const own = new Set(scenario.dialogue.map((line) => line.japanese));
  const sameLevel = (poolByLevel.get(scenario.jlptLevel) ?? []).filter(
    (line) => !own.has(line.japanese)
  );
  const everything = [...poolByLevel.values()]
    .flat()
    .filter((line) => !own.has(line.japanese));

  const seen = new Set<string>();
  const merged: PhoneLine[] = [];
  for (const line of [...sameLevel, ...everything]) {
    if (seen.has(line.japanese)) continue;
    seen.add(line.japanese);
    merged.push(line);
  }
  return merged;
}

export function buildRolePlay({
  scenario,
  random = Math.random,
  choices = 3,
}: RolePlayConfig): RolePlayStep[] {
  const pool = distractorPool(scenario);

  return scenario.dialogue.map((line, lineIndex) => {
    if (line.speaker !== scenario.learner) {
      return { lineIndex, line, isLearnerTurn: false };
    }

    const wanted = Math.max(0, choices - 1);
    const picked = shufflePhone(pool, random).slice(0, wanted);

    const options = shufflePhone(
      [
        { line, correct: true },
        ...picked.map((distractor) => ({ line: distractor, correct: false })),
      ],
      random
    ).map((entry, index) => ({
      id: `opt-${lineIndex}-${index}`,
      japanese: entry.line.japanese,
      reading: entry.line.reading,
      english: entry.line.english,
      correct: entry.correct,
    }));

    return { lineIndex, line, isLearnerTurn: true, options };
  });
}

export interface RolePlayResult {
  turns: number;
  correct: number;
  percentage: number;
}

export function scoreRolePlay(
  steps: readonly RolePlayStep[],
  picks: Readonly<Record<number, string>>
): RolePlayResult {
  const learnerSteps = steps.filter((step) => step.isLearnerTurn);
  let correct = 0;

  for (const step of learnerSteps) {
    const chosenId = picks[step.lineIndex];
    const chosen = step.options?.find((option) => option.id === chosenId);
    if (chosen?.correct) correct += 1;
  }

  return {
    turns: learnerSteps.length,
    correct,
    percentage:
      learnerSteps.length === 0
        ? 0
        : Math.round((correct / learnerSteps.length) * 100),
  };
}
