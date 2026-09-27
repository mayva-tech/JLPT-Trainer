import type { RelationExample } from "../../types/wordRelation";
import { n5Examples } from "./n5";
import { n4Examples } from "./n4";
import { n3Examples } from "./n3";
import { n2aExamples } from "./n2a";
import { n2bExamples } from "./n2b";

/** One sentence per pair, keyed by relation id; every sentence uses both words. */
export const wordRelationExamples: Readonly<Record<string, RelationExample>> = {
  ...n5Examples,
  ...n4Examples,
  ...n3Examples,
  ...n2aExamples,
  ...n2bExamples,
};
