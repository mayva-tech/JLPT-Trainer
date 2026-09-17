import { COMMUNICATION } from "../data/rpgConfig";

/** Map confidence hearts → Communication % for the encounter meter. */
export function communicationFromConfidence(
  confidence: number,
  maxConfidence: number
): number {
  if (maxConfidence <= 0) return 0;
  return Math.max(
    0,
    Math.min(
      COMMUNICATION.maxPercent,
      Math.round((confidence / maxConfidence) * COMMUNICATION.maxPercent)
    )
  );
}

export function applyRepairBonus(percent: number): number {
  return Math.min(
    COMMUNICATION.maxPercent,
    percent + COMMUNICATION.repairBonus
  );
}
