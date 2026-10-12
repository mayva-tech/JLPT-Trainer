import { vocabulary } from "./vocabulary";
import { vocabularyN3 } from "./n3/vocabularyN3";
import { grammar } from "./grammar";
import { grammarN3 } from "./n3/grammarN3";
import { onomatopoeiaItems } from "./onomatopoeia";
import { registerPairs } from "./registerPairs";
import { wordRelations } from "./wordRelations";
import { styleExpressions } from "./speechStyles";
import { phoneScenarios } from "./phoneCalls";

const NOTE_KEY_RE = /nuance|^note$/i;

function collect(value: unknown, out: Set<string>, depth: number): void {
  if (depth > 6 || !value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out, depth + 1);
    return;
  }
  for (const [key, field] of Object.entries(value)) {
    if (typeof field === "string") {
      if (NOTE_KEY_RE.test(key)) out.add(field);
    } else {
      collect(field, out, depth + 1);
    }
  }
}

/** Every nuance / usage-note string shown in a nuance panel. */
export function allNuanceTexts(): string[] {
  const out = new Set<string>();
  for (const source of [
    vocabulary,
    vocabularyN3,
    grammar,
    grammarN3,
    onomatopoeiaItems,
    registerPairs,
    wordRelations,
    styleExpressions,
    phoneScenarios,
  ]) {
    collect(source, out, 0);
  }
  return [...out];
}
