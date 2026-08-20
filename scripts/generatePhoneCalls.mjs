/**
 * Builds src/data/phoneCalls.ts from scripts/phone-calls/*.txt
 *
 *   node scripts/generatePhoneCalls.mjs
 *
 * Source format — one scenario per block:
 *
 *   === phone-n3-005
 *   level: N3
 *   category: appointments
 *   title: 歯医者の予約を変更する
 *   titleEn: Reschedule a dental appointment
 *   situation: ...
 *   roleA: 受付 (clinic receptionist)
 *   roleB: あなた (you)
 *   learner: B
 *   politeness: ...
 *   --dialogue
 *   A|japanese|reading|english
 *   --phrases
 *   japanese|reading|english|note
 *   --vocab
 *   japanese|reading|english|partOfSpeech
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(here, "phone-calls");
const OUT = join(here, "..", "src", "data", "phoneCalls.ts");

const LEVELS = ["N5", "N4", "N3", "N2"];
const CATEGORIES = [
  "phone-skills",
  "messages",
  "appointments",
  "reservations",
  "school-work",
  "delivery",
  "utilities",
  "finance",
  "government",
  "transport",
  "shopping",
  "business",
  "emergency",
];

function fail(where, message) {
  throw new Error(`${where}: ${message}`);
}

function parseBlock(raw, file) {
  const lines = raw.split("\n");
  const id = lines[0].trim();
  const where = `${file} [${id}]`;
  const meta = {};
  const dialogue = [];
  const phrases = [];
  const vocab = [];
  let section = "meta";

  for (const line of lines.slice(1)) {
    const text = line.trim();
    if (!text) continue;

    if (text === "--dialogue" || text === "--phrases" || text === "--vocab") {
      section = text.slice(2);
      continue;
    }

    if (section === "meta") {
      const at = text.indexOf(":");
      if (at === -1) fail(where, `expected "key: value", got "${text}"`);
      meta[text.slice(0, at).trim()] = text.slice(at + 1).trim();
      continue;
    }

    const parts = text.split("|").map((part) => part.trim());

    if (section === "dialogue") {
      if (parts.length !== 4) fail(where, `dialogue needs 4 fields: ${text}`);
      const [speaker, japanese, reading, english] = parts;
      if (speaker !== "A" && speaker !== "B") {
        fail(where, `speaker must be A or B, got "${speaker}"`);
      }
      dialogue.push({ speaker, japanese, reading, english });
    } else if (section === "phrases") {
      if (parts.length !== 4) fail(where, `phrase needs 4 fields: ${text}`);
      const [japanese, reading, english, note] = parts;
      phrases.push({ japanese, reading, english, note });
    } else {
      if (parts.length !== 4) fail(where, `vocab needs 4 fields: ${text}`);
      const [japanese, reading, english, partOfSpeech] = parts;
      vocab.push({ japanese, reading, english, partOfSpeech });
    }
  }

  const required = [
    "level",
    "category",
    "title",
    "titleEn",
    "situation",
    "roleA",
    "roleB",
    "learner",
    "politeness",
  ];
  for (const key of required) {
    if (!meta[key]) fail(where, `missing "${key}"`);
  }
  if (!LEVELS.includes(meta.level)) fail(where, `bad level "${meta.level}"`);
  if (!CATEGORIES.includes(meta.category)) {
    fail(where, `bad category "${meta.category}"`);
  }
  if (meta.learner !== "A" && meta.learner !== "B") {
    fail(where, `learner must be A or B`);
  }
  if (dialogue.length < 4) fail(where, "dialogue is too short");
  if (phrases.length === 0) fail(where, "no key phrases");
  if (vocab.length === 0) fail(where, "no vocabulary");
  if (!dialogue.some((line) => line.speaker === meta.learner)) {
    fail(where, `learner "${meta.learner}" never speaks`);
  }

  return {
    id,
    jlptLevel: meta.level,
    category: meta.category,
    title: meta.title,
    titleEn: meta.titleEn,
    situation: meta.situation,
    roleA: meta.roleA,
    roleB: meta.roleB,
    learner: meta.learner,
    politeness: meta.politeness,
    dialogue,
    keyPhrases: phrases,
    vocabulary: vocab,
    tags: [...new Set([meta.level, meta.category])],
  };
}

const scenarios = [];
for (const file of readdirSync(SOURCE_DIR).sort()) {
  if (!file.endsWith(".txt")) continue;
  const text = readFileSync(join(SOURCE_DIR, file), "utf8");
  for (const block of text.split(/^=== /m).slice(1)) {
    scenarios.push(parseBlock(block, file));
  }
}

scenarios.sort((a, b) => {
  const byLevel =
    LEVELS.indexOf(a.jlptLevel) - LEVELS.indexOf(b.jlptLevel);
  if (byLevel !== 0) return byLevel;
  return a.id.localeCompare(b.id);
});

const seen = new Set();
for (const scenario of scenarios) {
  if (seen.has(scenario.id)) throw new Error(`duplicate id ${scenario.id}`);
  seen.add(scenario.id);
}

const esc = (value) =>
  String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const field = (indent, key, value) => `${indent}${key}: "${esc(value)}",`;

const objectList = (indent, key, rows, keys) => {
  if (rows.length === 0) return `${indent}${key}: [],`;
  const body = rows
    .map(
      (row) =>
        `${indent}  {\n` +
        keys.map((k) => field(`${indent}    `, k, row[k])).join("\n") +
        `\n${indent}  },`
    )
    .join("\n");
  return `${indent}${key}: [\n${body}\n${indent}],`;
};

const body = scenarios
  .map((scenario) =>
    [
      "  {",
      field("    ", "id", scenario.id),
      field("    ", "jlptLevel", scenario.jlptLevel),
      field("    ", "category", scenario.category),
      field("    ", "title", scenario.title),
      field("    ", "titleEn", scenario.titleEn),
      field("    ", "situation", scenario.situation),
      field("    ", "roleA", scenario.roleA),
      field("    ", "roleB", scenario.roleB),
      field("    ", "learner", scenario.learner),
      field("    ", "politeness", scenario.politeness),
      objectList("    ", "dialogue", scenario.dialogue, [
        "speaker",
        "japanese",
        "reading",
        "english",
      ]),
      objectList("    ", "keyPhrases", scenario.keyPhrases, [
        "japanese",
        "reading",
        "english",
        "note",
      ]),
      objectList("    ", "vocabulary", scenario.vocabulary, [
        "japanese",
        "reading",
        "english",
        "partOfSpeech",
      ]),
      `    tags: [${scenario.tags.map((t) => `"${t}"`).join(", ")}],`,
      "  },",
    ].join("\n")
  )
  .join("\n");

const header = `import type {
  PhoneCategory,
  PhoneLevel,
  PhoneScenario,
} from "../types/phoneCall";

/**
 * Phone Conversation Scripts (電話会話) corpus — N5 through N2.
 *
 * GENERATED FILE — edit scripts/phone-calls/*.txt and re-run
 * \`node scripts/generatePhoneCalls.mjs\` instead of editing this by hand.
 *
 * Dialogue is written the way people actually speak on the phone: contractions,
 * aizuchi, trailing のですが, and the set formulas every call runs on.
 */

export const PHONE_LEVELS: readonly PhoneLevel[] = [
  "N5",
  "N4",
  "N3",
  "N2",
] as const;

export const PHONE_CATEGORIES: readonly PhoneCategory[] = [
  {
    id: "phone-skills",
    japanese: "電話の基本",
    english: "Phone basics",
    description: "Opening, closing, repeating, bad lines, wrong numbers.",
  },
  {
    id: "messages",
    japanese: "取次ぎ・伝言",
    english: "Messages",
    description: "Asking for someone, leaving and taking messages, callbacks.",
  },
  {
    id: "appointments",
    japanese: "予約・変更",
    english: "Appointments",
    description: "Clinics and dentists: booking, changing, cancelling.",
  },
  {
    id: "reservations",
    japanese: "店・宿の予約",
    english: "Reservations",
    description: "Restaurants and hotels.",
  },
  {
    id: "school-work",
    japanese: "学校・職場",
    english: "School & work",
    description: "Calling in sick, running late, asking for leave.",
  },
  {
    id: "delivery",
    japanese: "配達",
    english: "Delivery",
    description: "Redelivery, delivery windows, missing parcels.",
  },
  {
    id: "utilities",
    japanese: "ライフライン",
    english: "Utilities",
    description: "Electricity, gas, water, internet and mobile providers.",
  },
  {
    id: "finance",
    japanese: "銀行・カード",
    english: "Banking",
    description: "Banks and credit cards, including lost cards and fraud.",
  },
  {
    id: "government",
    japanese: "役所・警察",
    english: "Public offices",
    description: "City hall procedures, police and lost property.",
  },
  {
    id: "transport",
    japanese: "駅・交通",
    english: "Transport",
    description: "Station enquiries, delays, items left on trains.",
  },
  {
    id: "shopping",
    japanese: "買い物・サポート",
    english: "Shopping & support",
    description: "Orders, customer support, complaints and refunds.",
  },
  {
    id: "business",
    japanese: "ビジネス",
    english: "Business",
    description: "Client calls, recruiters, interviews, apologies.",
  },
  {
    id: "emergency",
    japanese: "緊急",
    english: "Emergency",
    description: "119 and 110 calls.",
  },
] as const;

export const phoneScenarios: readonly PhoneScenario[] = [
`;

writeFileSync(OUT, header + body + "\n];\n", "utf8");

const byLevel = {};
const byCategory = {};
let lines = 0;
for (const scenario of scenarios) {
  byLevel[scenario.jlptLevel] = (byLevel[scenario.jlptLevel] ?? 0) + 1;
  byCategory[scenario.category] = (byCategory[scenario.category] ?? 0) + 1;
  lines += scenario.dialogue.length;
}

console.log(`wrote ${scenarios.length} scenarios (${lines} lines) to ${OUT}`);
console.log("by level:", byLevel);
console.log("categories covered:", Object.keys(byCategory).length, "of", CATEGORIES.length);
if (Object.keys(byCategory).length < CATEGORIES.length) {
  const missing = CATEGORIES.filter((c) => !byCategory[c]);
  console.log("  missing:", missing.join(", "));
}
