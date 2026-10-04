import { describe, expect, it } from "vitest";
import { GRAMMAR_PICTURE_ROWS, VOCAB_PICTURE_ROWS } from "./illustrations";
import { vocabulary } from "./vocabulary";
import { grammar } from "./grammar";
import { SVG_ART } from "../components/Illustration/svgArt";
import type { PictureRow } from "../types/illustration";

const MOTIONS = new Set(["bob", "float", "wiggle", "pulse", "spin", "shake", "drift", "bounce", "rain"]);

function checkRows(rows: readonly PictureRow[], corpus: Map<number, string>, what: string) {
  const ids = rows.map((r) => r[0]);
  expect(new Set(ids).size, `${what}: duplicate ids`).toBe(ids.length);

  const stale = rows.filter(([id, label]) => corpus.get(id) !== label);
  expect(
    stale.map(([id, label]) => `${id} ${label} (corpus: ${corpus.get(id) ?? "missing"})`),
    `${what}: rows that no longer match the corpus — fix scripts/illustrations/*.tsv`
  ).toEqual([]);

  const covered = new Set(ids);
  const missing = [...corpus.keys()].filter((id) => !covered.has(id));
  expect(missing, `${what}: items without a row in scripts/illustrations/*.tsv`).toEqual([]);

  for (const [id, , src, motion] of rows) {
    expect(Boolean(src), `${what} ${id}: picture and motion go together`).toBe(Boolean(motion));
    if (motion) expect(MOTIONS.has(motion), `${what} ${id}: motion ${motion}`).toBe(true);
    if (src?.startsWith("svg:")) expect(SVG_ART[src.slice(4)], `${what} ${id}: ${src}`).toBeDefined();
  }
}

describe("illustrations corpus", () => {
  it("vocabulary rows match the corpus, one per item", () => {
    checkRows(VOCAB_PICTURE_ROWS, new Map(vocabulary.map((v) => [v.id, v.word])), "vocabulary");
  });

  it("grammar rows match the corpus, one per item", () => {
    checkRows(GRAMMAR_PICTURE_ROWS, new Map(grammar.map((g) => [g.id, g.pattern])), "grammar");
  });

  it("almost every item has a picture", () => {
    const share = (rows: readonly PictureRow[]) => rows.filter((r) => r[2]).length / rows.length;
    expect(share(VOCAB_PICTURE_ROWS)).toBeGreaterThan(0.95);
    expect(share(GRAMMAR_PICTURE_ROWS)).toBe(1);
  });

  it("the washing machine words use the drawn washing machine", () => {
    const pic = (word: string) => VOCAB_PICTURE_ROWS.find((r) => r[1] === word)?.[2];
    expect(pic("洗濯")).toBe("svg:washer");
    expect(pic("洗濯機")).toBe("svg:washer");
  });

  it("every drawn picture is used somewhere", () => {
    const used = new Set(VOCAB_PICTURE_ROWS.map((r) => r[2]).filter((s) => s?.startsWith("svg:")));
    for (const id of Object.keys(SVG_ART)) expect(used.has(`svg:${id}`), id).toBe(true);
  });
});
