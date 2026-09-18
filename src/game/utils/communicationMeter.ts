import { COMMUNICATION, COMMUNICATION_V2 } from "../data/rpgConfig";

/** Map confidence hearts → Communication % for the V1 linear quest meter. */
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

/** V2 independent Communication score helpers. */
export function clampCommunicationV2(value: number): number {
  return Math.max(
    COMMUNICATION_V2.minPercent,
    Math.min(COMMUNICATION_V2.maxPercent, Math.round(value))
  );
}

export function startingCommunicationV2(): number {
  return COMMUNICATION_V2.startPercent;
}
