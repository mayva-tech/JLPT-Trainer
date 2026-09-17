import type { RepairCounts, RepairKind } from "../types";

export function emptyRepairCounts(): RepairCounts {
  return { repeat: 0, slow: 0, meaning: 0, confirm: 0 };
}

export function bumpRepairCount(
  counts: RepairCounts,
  kind: RepairKind | undefined
): RepairCounts {
  if (!kind) return counts;
  return { ...counts, [kind]: counts[kind] + 1 };
}

export function totalRepairs(counts: RepairCounts): number {
  return counts.repeat + counts.slow + counts.meaning + counts.confirm;
}
