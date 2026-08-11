/**
 * Imports the konbini trainer content from the original artifact file.
 *
 *   npm run konbini:import -- ~/Downloads/family_mart_trainer.jsx
 *
 * It reads the CORE_PHRASES / VOCAB / SURVIVAL / SCRIPTS array literals out of
 * the .jsx, normalises the field names, and rewrites
 * src/pages/KonbiniTrainer/data.ts. Nothing is retyped, so the register and
 * furigana tuning carries over exactly as written.
 *
 * It then runs the same integrity check as before: every kanji run must carry a
 * reading, and no stray parentheses may survive.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve('src/pages/KonbiniTrainer/data.ts');

/** Array names to look for, and the export name each becomes. */
const WANTED: Record<string, string[]> = {
  CORE_PHRASES: ['CORE_PHRASES', 'CORE', 'PHRASES'],
  VOCAB: ['VOCAB', 'VOCABULARY', 'VOCAB_ITEMS'],
  SURVIVAL: ['SURVIVAL', 'SURVIVAL_PHRASES'],
  SCRIPTS: ['SCRIPTS', 'SCENARIOS', 'DIALOGUES'],
};

/** Finds `const NAME = [ ... ]` and returns the literal, brackets included. */
function extractArray(source: string, name: string): string | null {
  const declaration = new RegExp(`const\\s+${name}\\s*(?::[^=]+)?=\\s*\\[`);
  const start = source.search(declaration);
  if (start === -1) return null;

  const open = source.indexOf('[', start);
  let depth = 0;
  let quote: string | null = null;

  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

function evaluateArray(literal: string, name: string): unknown[] {
  try {
    // The data blocks are plain object/array literals — no JSX, no calls.
    return new Function(`return (${literal});`)() as unknown[];
  } catch (error) {
    throw new Error(`Could not evaluate ${name}: ${(error as Error).message}`);
  }
}

type Loose = Record<string, any>;

function variant(source: Loose | undefined, fallback?: Loose): Loose {
  const v = source ?? fallback ?? {};
  return {
    jp: v.jp ?? v.japanese ?? '',
    ro: v.ro ?? v.romaji ?? '',
    en: v.en ?? v.english ?? '',
  };
}

function normaliseCard(raw: Loose, index: number, prefix: string): Loose {
  const formal = raw.formal ?? (raw.jp ? raw : undefined);
  return {
    id: raw.id ?? `${prefix}${index + 1}`,
    label: raw.label ?? raw.title ?? raw.en ?? '',
    formal: variant(formal),
    friendly: variant(raw.friendly, formal),
  };
}

function normaliseScript(raw: Loose, index: number): Loose {
  const lines = (raw.lines ?? raw.dialogue ?? []) as Loose[];
  return {
    id: raw.id ?? `sc${index + 1}`,
    title: raw.title ?? raw.jp ?? '',
    titleEn: raw.titleEn ?? raw.en ?? raw.subtitle ?? '',
    lines: lines.map((line) => {
      const who = line.who ?? line.speaker ?? line.role ?? 'staff';
      const formal = line.formal ?? (line.jp ? line : undefined);
      return {
        // The artifact used staff/customer; the shared model uses self/other.
        who: who === 'customer' || who === 'client' || who === 'other' ? 'other' : 'self',
        formal: variant(formal),
        friendly: variant(line.friendly, formal),
      };
    }),
  };
}

/* ---- furigana integrity check ---- */

const KANJI = '\u4E00-\u9FAF\u3400-\u4DBF\u3005\u3006\u30F6';
const RUBY = new RegExp(`[${KANJI}]+\\([^()]+\\)`, 'g');
const BARE_KANJI = new RegExp(`[${KANJI}]`);

function checkJapanese(text: string, where: string, problems: string[]): void {
  const remainder = text.replace(RUBY, '');
  if (BARE_KANJI.test(remainder)) {
    problems.push(`missing furigana in ${where}: ${text}`);
  }
  if (remainder.includes('(') || remainder.includes(')')) {
    problems.push(`stray parenthesis in ${where}: ${text}`);
  }
}

function walkJapanese(value: unknown, path: string, problems: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkJapanese(item, `${path}[${i}]`, problems));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Loose)) {
      if ((key === 'jp' || key === 'title') && typeof child === 'string') {
        checkJapanese(child, `${path}.${key}`, problems);
      } else {
        walkJapanese(child, `${path}.${key}`, problems);
      }
    }
  }
}

/* ---- main ---- */

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run konbini:import -- path/to/family_mart_trainer.jsx');
  process.exit(1);
}

const source = readFileSync(resolve(inputPath), 'utf8');
const collected: Record<string, unknown[]> = {};

for (const [target, aliases] of Object.entries(WANTED)) {
  let literal: string | null = null;
  let found = '';
  for (const alias of aliases) {
    literal = extractArray(source, alias);
    if (literal) {
      found = alias;
      break;
    }
  }
  if (!literal) {
    console.error(`Could not find any of ${aliases.join(', ')} in ${inputPath}`);
    process.exit(1);
  }
  const parsed = evaluateArray(literal, found);
  collected[target] =
    target === 'SCRIPTS'
      ? parsed.map((raw, i) => normaliseScript(raw as Loose, i))
      : parsed.map((raw, i) =>
          normaliseCard(raw as Loose, i, target === 'VOCAB' ? 'v' : target === 'SURVIVAL' ? 's' : 'c'),
        );
  console.log(`${target}: ${collected[target].length} entries (from ${found})`);
}

const problems: string[] = [];
walkJapanese(collected, 'data', problems);
if (problems.length > 0) {
  console.warn(`\n${problems.length} furigana issue(s):`);
  for (const problem of problems.slice(0, 40)) console.warn('  ' + problem);
} else {
  console.log('\nFurigana check: clean.');
}

const body = `import type { Card, Deck, Script } from '../../lib/japanese/types';

// Generated by scripts/importKonbiniData.ts — edit the source artifact, not this file.

export const CORE_PHRASES: Card[] = ${JSON.stringify(collected.CORE_PHRASES, null, 2)};

export const VOCAB: Card[] = ${JSON.stringify(collected.VOCAB, null, 2)};

export const SURVIVAL: Card[] = ${JSON.stringify(collected.SURVIVAL, null, 2)};

export const SCRIPTS: Script[] = ${JSON.stringify(collected.SCRIPTS, null, 2)};

export const DECKS: Deck[] = [
  { id: 'core', label: 'Core Phrases', cards: CORE_PHRASES },
  { id: 'vocab', label: 'Vocabulary', cards: VOCAB },
  { id: 'survival', label: 'Survival Phrases', cards: SURVIVAL },
];
`;

writeFileSync(OUT, body, 'utf8');
console.log(`\nWrote ${OUT}`);
