/**
 * Where a costume sits on each character. Both portraits share the viewBox
 * 0 0 100 110 but differ in face shape, so every costume is drawn from these
 * numbers rather than hard-coded coordinates.
 */
export interface CostumeFit {
  /** Top of the face. */
  top: number;
  /** Half the face width. */
  halfW: number;
  /** Ear centre height. */
  earY: number;
  /** Lowest a forehead piece may come at the centre (stays above the brows). */
  crown: number;
  /** Where the neck meets the collar. */
  neck: number;
  /** Bottom of the chin. */
  chin: number;
  /** Mouth centre height (keep it clear — it lip-syncs). */
  mouth: number;
}

export const NANAMI_FIT: CostumeFit = { top: 25, halfW: 25, earY: 56, crown: 34, neck: 81, chin: 83, mouth: 67 };
export const ANDREW_FIT: CostumeFit = { top: 22, halfW: 21, earY: 56, crown: 34, neck: 92, chin: 90, mouth: 70 };

/** Shoulder line under the collar. */
export const shoulderY = (f: CostumeFit) => f.neck + 3;

/** Left/right edges a helmet or hood reaches at the temples. */
export const sideL = (f: CostumeFit) => 50 - f.halfW - 6;
export const sideR = (f: CostumeFit) => 50 + f.halfW + 6;

/** Dome over the head, bottom edge arcing above the brows (helmets, hoods). */
export function domePath(f: CostumeFit, lift = 0): string {
  const l = sideL(f);
  const r = sideR(f);
  const side = f.crown + 7;
  return `M${l} ${side} Q${l} ${f.top - 12 - lift} 50 ${f.top - 13 - lift} Q${r} ${f.top - 12 - lift} ${r} ${side} Q50 ${f.crown - 7} ${l} ${side} Z`;
}

/**
 * Hood around the face: a closed shape with an oval opening for the face
 * (use with fillRule="evenodd"). `rim` widens the cloth around the opening.
 */
export function hoodPath(f: CostumeFit, rim = 0): string {
  const l = sideL(f) - rim;
  const r = sideR(f) + rim;
  const low = f.earY + 18;
  const outer = `M${l} ${low} Q${l - 2} ${f.top - 12 - rim} 50 ${f.top - 14 - rim} Q${r + 2} ${f.top - 12 - rim} ${r} ${low} Q50 ${f.chin + 12 + rim} ${l} ${low} Z`;
  const cy = (f.crown + f.chin) / 2 + 1;
  const rx = f.halfW - 1;
  const ry = (f.chin - f.crown) / 2 + 3;
  const hole = `M${50 - rx} ${cy} A${rx} ${ry} 0 1 0 ${50 + rx} ${cy} A${rx} ${ry} 0 1 0 ${50 - rx} ${cy} Z`;
  return `${outer} ${hole}`;
}

/** Simple hair cap framing the face down to the temples. */
export function hairCapPath(f: CostumeFit): string {
  const hw = f.halfW;
  return `M${50 - hw} ${f.earY - 6} Q${50 - hw - 3} ${f.top - 5} 50 ${f.top - 9} Q${50 + hw + 3} ${f.top - 5} ${50 + hw} ${f.earY - 6} Q${50 + hw - 7} ${f.crown} 50 ${f.crown - 2} Q${50 - hw + 7} ${f.crown} ${50 - hw} ${f.earY - 6} Z`;
}
