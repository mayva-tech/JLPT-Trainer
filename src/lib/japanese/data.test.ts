import { describe, expect, it } from "vitest";
import type { Card, Script } from "./types";
import {
  DECKS as konbiniDecks,
  SCRIPTS as konbiniScripts,
} from "../../pages/KonbiniTrainer/data";
import {
  DECKS as tripDecks,
  SCRIPTS as tripScripts,
} from "../../pages/TripTrainer/data";

const KANJI = "\\u4E00-\\u9FAF\\u3400-\\u4DBF\\u3005\\u3006\\u30F6";
const RUBY = new RegExp(`[${KANJI}]+\\([^()]+\\)`, "g");
const BARE_KANJI = new RegExp(`[${KANJI}]`);

function assertFuriganaCoverage(where: string, text: string) {
  const remainder = text.replace(RUBY, "");
  expect(
    BARE_KANJI.test(remainder),
    `${where}: missing furigana in «${text}» (remainder «${remainder}»)`
  ).toBe(false);
  expect(
    remainder.includes("(") || remainder.includes(")"),
    `${where}: stray parenthesis in «${text}» (remainder «${remainder}»)`
  ).toBe(false);
}

function walkJapanese(value: unknown, path: string, problems: string[]) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkJapanese(item, `${path}[${i}]`, problems));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if ((key === "jp" || key === "title") && typeof child === "string") {
        try {
          assertFuriganaCoverage(`${path}.${key}`, child);
        } catch (error) {
          problems.push(error instanceof Error ? error.message : String(error));
          throw error;
        }
      } else {
        walkJapanese(child, `${path}.${key}`, problems);
      }
    }
  }
}

function assertUniqueIds(page: string, cards: Card[], scripts: Script[]) {
  const cardIds = cards.map((c) => c.id);
  const scriptIds = scripts.map((s) => s.id);
  expect(new Set(cardIds).size, `${page}: duplicate card ids`).toBe(
    cardIds.length
  );
  expect(new Set(scriptIds).size, `${page}: duplicate script ids`).toBe(
    scriptIds.length
  );
}

describe("trainer page data integrity", () => {
  it.each([
    ["konbini", konbiniDecks.flatMap((d) => d.cards), konbiniScripts],
    ["trip", tripDecks.flatMap((d) => d.cards), tripScripts],
  ] as const)(
    "%s: every jp/title has full furigana and unique ids",
    (page, cards, scripts) => {
      assertUniqueIds(page, [...cards], scripts);
      walkJapanese(
        { cards: [...cards], scripts },
        page,
        []
      );
    }
  );
});
