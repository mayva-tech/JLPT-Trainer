/**
 * Builds src/data/speechStyles.ts from scripts/speech-styles/*.tsv
 *
 *   node scripts/generateSpeechStyles.mjs
 *
 * Source format — 17 pipe-delimited fields per line:
 *
 *   level|category|group|japanese|reading|romaji|english|strength|politeness|
 *   speakers|relationships|naturalness|warning|exampleJp|exampleReading|
 *   exampleEn|alternative
 *
 * Codes
 *   strength     ff = strongly feminine, f = somewhat feminine, n = neutral,
 *                m = somewhat masculine, mm = strongly masculine
 *   politeness   formal, polite, casual, vcasual, rough
 *   speakers     yw, aw, ym, am, older, any   (comma-separated)
 *   relations    stranger, coworker, friend, close, partner, family
 *   naturalness  verycommon, common, situational, oldfashioned, anime, rough
 *
 * `warning` and `alternative` may be empty.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(here, "speech-styles");
const OUT = join(here, "..", "src", "data", "speechStyles.ts");

const LEVELS = ["N5", "N4", "N3", "N2", "beyond"];

const CATEGORIES = [
  "pronouns-first",
  "pronouns-second",
  "particles",
  "questions",
  "commands",
  "negatives",
  "sound-changes",
  "reactions",
  "agreement",
  "apologies",
  "regional",
  "character",
];

const STRENGTH = {
  ff: "strongly-feminine",
  f: "somewhat-feminine",
  n: "neutral",
  m: "somewhat-masculine",
  mm: "strongly-masculine",
};

const GENDER = {
  "strongly-feminine": "feminine",
  "somewhat-feminine": "feminine",
  neutral: "neutral",
  "somewhat-masculine": "masculine",
  "strongly-masculine": "masculine",
};

const POLITENESS = {
  formal: "formal",
  polite: "polite",
  casual: "casual",
  vcasual: "very-casual",
  rough: "rough",
};

const SPEAKERS = {
  yw: "young-woman",
  aw: "adult-woman",
  ym: "young-man",
  am: "adult-man",
  older: "older-speaker",
  any: "anyone",
};

const RELATIONSHIPS = {
  stranger: "stranger",
  coworker: "coworker",
  friend: "friend",
  close: "close-friend",
  partner: "partner",
  family: "family",
};

const NATURALNESS = {
  verycommon: "very-common",
  common: "common",
  situational: "situational",
  oldfashioned: "old-fashioned",
  anime: "anime-drama",
  rough: "rough",
};

function mapList(raw, table, where, what) {
  const values = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((code) => {
      const mapped = table[code];
      if (!mapped) throw new Error(`${where}: unknown ${what} code "${code}"`);
      return mapped;
    });
  if (values.length === 0) throw new Error(`${where}: empty ${what}`);
  return [...new Set(values)];
}

const rows = [];
for (const file of readdirSync(SOURCE_DIR).sort()) {
  if (!file.endsWith(".tsv")) continue;
  const text = readFileSync(join(SOURCE_DIR, file), "utf8");

  text.split("\n").forEach((line, index) => {
    if (!line.trim() || line.startsWith("#")) return;
    const where = `${file}:${index + 1}`;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 17) {
      throw new Error(`${where}: expected 17 fields, got ${parts.length}`);
    }

    const [
      level,
      category,
      group,
      japanese,
      reading,
      romaji,
      english,
      strengthCode,
      politenessCode,
      speakersRaw,
      relationshipsRaw,
      naturalnessCode,
      warning,
      exampleJp,
      exampleReading,
      exampleEn,
      alternative,
    ] = parts;

    if (!LEVELS.includes(level)) throw new Error(`${where}: bad level ${level}`);
    if (!CATEGORIES.includes(category)) {
      throw new Error(`${where}: bad category ${category}`);
    }
    const strength = STRENGTH[strengthCode];
    if (!strength) throw new Error(`${where}: bad strength ${strengthCode}`);
    const politeness = POLITENESS[politenessCode];
    if (!politeness) throw new Error(`${where}: bad politeness ${politenessCode}`);
    const naturalness = NATURALNESS[naturalnessCode];
    if (!naturalness) {
      throw new Error(`${where}: bad naturalness ${naturalnessCode}`);
    }
    for (const [value, name] of [
      [japanese, "japanese"],
      [reading, "reading"],
      [romaji, "romaji"],
      [english, "english"],
      [group, "group"],
      [exampleJp, "exampleJp"],
      [exampleReading, "exampleReading"],
      [exampleEn, "exampleEn"],
    ]) {
      if (!value) throw new Error(`${where}: missing ${name}`);
    }

    rows.push({
      level,
      category,
      group,
      japanese,
      reading,
      romaji,
      english,
      gender: GENDER[strength],
      strength,
      politeness,
      speakers: mapList(speakersRaw, SPEAKERS, where, "speaker"),
      relationships: mapList(
        relationshipsRaw,
        RELATIONSHIPS,
        where,
        "relationship"
      ),
      naturalness,
      warning: warning || undefined,
      example: {
        japanese: exampleJp,
        reading: exampleReading,
        english: exampleEn,
      },
      alternative: alternative || undefined,
    });
  });
}

const counters = {};
const items = rows.map((row) => {
  const key = row.category;
  counters[key] = (counters[key] ?? 0) + 1;
  const id = `sty-${key}-${String(counters[key]).padStart(3, "0")}`;
  const tags = [
    row.level,
    row.category,
    row.gender,
    row.strength,
    row.politeness,
    row.naturalness,
    row.group,
  ];
  return { id, ...row, tags: [...new Set(tags)] };
});

const seen = new Set();
for (const item of items) {
  if (seen.has(item.japanese + item.category)) {
    throw new Error(`duplicate expression: ${item.japanese} (${item.category})`);
  }
  seen.add(item.japanese + item.category);
}

const esc = (value) =>
  String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const list = (values) => `[${values.map((v) => `"${v}"`).join(", ")}]`;

const body = items
  .map((item) =>
    [
      "  {",
      `    id: "${item.id}",`,
      `    jlptLevel: "${item.level}",`,
      `    category: "${item.category}",`,
      `    group: "${esc(item.group)}",`,
      `    japanese: "${esc(item.japanese)}",`,
      `    reading: "${esc(item.reading)}",`,
      `    romaji: "${esc(item.romaji)}",`,
      `    english: "${esc(item.english)}",`,
      `    gender: "${item.gender}",`,
      `    strength: "${item.strength}",`,
      `    politeness: "${item.politeness}",`,
      `    speakers: ${list(item.speakers)},`,
      `    relationships: ${list(item.relationships)},`,
      `    naturalness: "${item.naturalness}",`,
      item.warning ? `    warning: "${esc(item.warning)}",` : null,
      "    example: {",
      `      japanese: "${esc(item.example.japanese)}",`,
      `      reading: "${esc(item.example.reading)}",`,
      `      english: "${esc(item.example.english)}",`,
      "    },",
      item.alternative ? `    alternative: "${esc(item.alternative)}",` : null,
      `    tags: ${list(item.tags)},`,
      "  },",
    ]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");

const header = `import type {
  StyleCategory,
  StyleExpression,
  StyleLevel,
  StyleNaturalness,
  StylePoliteness,
  StyleStrength,
} from "../types/speechStyle";

/**
 * Masculine / feminine / neutral speech styles — N5 to N2 and beyond.
 *
 * GENERATED FILE — edit scripts/speech-styles/*.tsv and re-run
 * \`node scripts/generateSpeechStyles.mjs\` instead of editing this by hand.
 *
 * The corpus is deliberately majority-neutral. Gendered speech in modern Japan
 * is a lean, not a rule: 僕 is not childish, 俺 is not rude, and あたし is not
 * the default for a woman. Expressions that only survive in fiction are marked
 * \`anime-drama\`, and regional forms are marked as such rather than presented
 * as standard Tokyo Japanese.
 */

export const STYLE_LEVELS: readonly StyleLevel[] = [
  "N5",
  "N4",
  "N3",
  "N2",
  "beyond",
] as const;

export const STYLE_STRENGTHS: readonly StyleStrength[] = [
  "strongly-feminine",
  "somewhat-feminine",
  "neutral",
  "somewhat-masculine",
  "strongly-masculine",
] as const;

export const STYLE_POLITENESS: readonly StylePoliteness[] = [
  "formal",
  "polite",
  "casual",
  "very-casual",
  "rough",
] as const;

export const STYLE_NATURALNESS: readonly StyleNaturalness[] = [
  "very-common",
  "common",
  "situational",
  "old-fashioned",
  "anime-drama",
  "rough",
] as const;

export const STYLE_CATEGORIES: readonly StyleCategory[] = [
  {
    id: "pronouns-first",
    japanese: "一人称",
    english: "First-person pronouns",
    description: "私・僕・俺・あたし and the rest of the I-words.",
  },
  {
    id: "pronouns-second",
    japanese: "二人称",
    english: "Second-person pronouns",
    description:
      "あなた・君・お前 — and why Japanese usually avoids all of them.",
  },
  {
    id: "particles",
    japanese: "終助詞",
    english: "Sentence-ending particles",
    description: "よ・ね・な・ぞ・ぜ・わ・の — where most of the lean lives.",
  },
  {
    id: "questions",
    japanese: "疑問",
    english: "Questions",
    description: "なの・かしら・かな・だろ・のか・かよ.",
  },
  {
    id: "commands",
    japanese: "命令・依頼",
    english: "Commands & requests",
    description: "From 〜てください down to 〜ろ and 〜んな.",
  },
  {
    id: "negatives",
    japanese: "否定・縮約",
    english: "Negatives & contractions",
    description: "わからない → わかんない → わかんねえ.",
  },
  {
    id: "sound-changes",
    japanese: "音変化",
    english: "Sound changes",
    description: "The ai → ee shift: すごい → すげえ.",
  },
  {
    id: "reactions",
    japanese: "感嘆",
    english: "Emotional reactions",
    description: "うそ・マジ・やべえ・きゃー and other reflexes.",
  },
  {
    id: "agreement",
    japanese: "相づち",
    english: "Agreement",
    description: "そうね・そうだね・そうだな・そうじゃん.",
  },
  {
    id: "apologies",
    japanese: "謝罪・感謝",
    english: "Apologies & thanks",
    description: "すみません・ごめん・悪い・ありがとう・サンキュー.",
  },
  {
    id: "regional",
    japanese: "方言・地域差",
    english: "Regional",
    description: "うち・わし・関西弁 — not standard Tokyo Japanese.",
  },
  {
    id: "character",
    japanese: "役割語",
    english: "Character language",
    description: "貴様・拙者・〜ですわ — fiction, not conversation.",
  },
] as const;

export const styleExpressions: readonly StyleExpression[] = [
`;

writeFileSync(OUT, header + body + "\n];\n", "utf8");

const byCategory = {};
const byGender = {};
const byNaturalness = {};
const groups = new Set();
for (const item of items) {
  byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  byGender[item.gender] = (byGender[item.gender] ?? 0) + 1;
  byNaturalness[item.naturalness] = (byNaturalness[item.naturalness] ?? 0) + 1;
  groups.add(item.group);
}

console.log(`wrote ${items.length} expressions to ${OUT}`);
console.log("by gender lean:", byGender);
console.log("by naturalness:", byNaturalness);
console.log("comparison groups:", groups.size);
const missing = CATEGORIES.filter((c) => !byCategory[c]);
console.log(
  `categories: ${Object.keys(byCategory).length}/${CATEGORIES.length}` +
    (missing.length ? ` — missing ${missing.join(", ")}` : "")
);
