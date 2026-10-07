import type { ReactNode } from "react";

/*
 * A small posable person for the stage-ambience scenes.
 *
 * Figures are flat silhouettes: one colour (--p), drawn solid and faded as a
 * whole group, so overlapping limbs never show darker joints. Unit size is
 * about 160 px tall, facing right, feet at (0, 0). Arms and the upper body
 * can move with SVG animateTransform; motion is left out for people who
 * ask for reduced motion.
 */

type Pt = readonly [number, number];

interface Pose {
  head: Pt;
  neck: Pt;
  hip: Pt;
  /** Back arm and front arm: shoulder, elbow, hand. */
  armL: readonly Pt[];
  armR: readonly Pt[];
  /** Back leg and front leg: hip, knee, foot. */
  legL: readonly Pt[];
  legR: readonly Pt[];
}

const STAND_LEGS = {
  legL: [
    [0, -86],
    [-5, -44],
    [-7, 0],
  ],
  legR: [
    [0, -86],
    [5, -44],
    [7, 0],
  ],
} as const;

const POSES = {
  stand: {
    head: [2, -158],
    neck: [0, -140],
    hip: [0, -86],
    armL: [
      [0, -134],
      [-5, -108],
      [-6, -84],
    ],
    armR: [
      [0, -134],
      [6, -108],
      [8, -84],
    ],
    ...STAND_LEGS,
  },
  walk: {
    head: [5, -157],
    neck: [3, -140],
    hip: [0, -86],
    armL: [
      [3, -134],
      [-10, -110],
      [-18, -90],
    ],
    armR: [
      [3, -134],
      [14, -112],
      [24, -94],
    ],
    legL: [
      [0, -86],
      [-12, -44],
      [-26, 0],
    ],
    legR: [
      [0, -86],
      [14, -46],
      [20, 0],
    ],
  },
  bow: {
    head: [46, -122],
    neck: [32, -120],
    hip: [0, -86],
    armL: [
      [30, -118],
      [32, -94],
      [34, -72],
    ],
    armR: [
      [30, -118],
      [34, -94],
      [36, -72],
    ],
    ...STAND_LEGS,
  },
  seiza: {
    head: [4, -110],
    neck: [2, -92],
    hip: [-6, -34],
    armL: [
      [2, -88],
      [10, -62],
      [24, -46],
    ],
    armR: [
      [2, -88],
      [12, -62],
      [26, -48],
    ],
    legL: [
      [-6, -34],
      [26, -10],
      [-18, -2],
    ],
    legR: [
      [-6, -34],
      [26, -10],
      [-18, -2],
    ],
  },
  sit: {
    head: [2, -106],
    neck: [0, -88],
    hip: [-4, -28],
    armL: [
      [0, -84],
      [-14, -60],
      [-26, -34],
    ],
    armR: [
      [0, -84],
      [16, -64],
      [30, -52],
    ],
    legL: [
      [-4, -28],
      [26, -44],
      [40, -2],
    ],
    legR: [
      [-4, -28],
      [20, -20],
      [30, -2],
    ],
  },
  chair: {
    head: [4, -142],
    neck: [2, -124],
    hip: [-4, -68],
    armL: [
      [2, -118],
      [16, -94],
      [34, -90],
    ],
    armR: [
      [2, -118],
      [18, -96],
      [36, -92],
    ],
    legL: [
      [-4, -68],
      [28, -66],
      [28, 0],
    ],
    legR: [
      [-4, -68],
      [32, -66],
      [34, 0],
    ],
  },
  armsUp: {
    head: [2, -158],
    neck: [0, -140],
    hip: [0, -86],
    armL: [
      [0, -134],
      [-14, -160],
      [-18, -188],
    ],
    armR: [
      [0, -134],
      [14, -160],
      [18, -188],
    ],
    ...STAND_LEGS,
  },
  crouch: {
    head: [48, -110],
    neck: [32, -104],
    hip: [-12, -60],
    armL: [
      [30, -100],
      [38, -62],
      [44, -8],
    ],
    armR: [
      [30, -100],
      [42, -62],
      [50, -8],
    ],
    legL: [
      [-12, -60],
      [16, -44],
      [10, 0],
    ],
    legR: [
      [-12, -60],
      [-30, -36],
      [-36, 0],
    ],
  },
  squat: {
    head: [24, -108],
    neck: [16, -92],
    hip: [-6, -42],
    armL: [
      [14, -88],
      [30, -70],
      [46, -60],
    ],
    armR: [
      [14, -88],
      [32, -72],
      [50, -64],
    ],
    legL: [
      [-6, -42],
      [20, -48],
      [14, 0],
    ],
    legR: [
      [-6, -42],
      [12, -40],
      [2, 0],
    ],
  },
  kamae: {
    head: [4, -158],
    neck: [2, -140],
    hip: [0, -86],
    armL: [
      [2, -134],
      [16, -112],
      [30, -104],
    ],
    armR: [
      [2, -134],
      [18, -114],
      [34, -106],
    ],
    legL: [
      [0, -86],
      [-14, -44],
      [-22, 0],
    ],
    legR: [
      [0, -86],
      [14, -44],
      [22, 0],
    ],
  },
  carry: {
    head: [2, -158],
    neck: [0, -140],
    hip: [0, -86],
    armL: [
      [0, -134],
      [4, -156],
      [8, -176],
    ],
    armR: [
      [0, -134],
      [8, -156],
      [12, -176],
    ],
    ...STAND_LEGS,
  },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

const SEATED: ReadonlySet<PoseName> = new Set<PoseName>([
  "seiza",
  "sit",
  "chair",
]);

export interface Motion {
  /** Rotation keyframes in degrees (negative = forward / up for a right-facing figure). */
  values: readonly number[];
  /** Seconds per cycle. */
  dur: number;
  /** Seconds; negative starts mid-cycle. */
  begin?: number;
}

export interface FigureProps {
  x: number;
  y: number;
  s?: number;
  pose: PoseName;
  /** Face left instead of right. */
  flip?: boolean;
  /** Kimono / yukata / hakama over the legs. */
  robe?: boolean;
  /** Broader body (sumo). */
  heavy?: boolean;
  /** "far" figures are fainter, for depth. */
  depth?: "near" | "far";
  /** Animate the back arm, the front arm or both around the shoulder. */
  arms?: Motion & { which: "L" | "R" | "both" };
  /**
   * Walking / running: legs swing ±deg around the hip in opposite phase,
   * and (unless `arms` is set) the arms swing against them.
   */
  stride?: { deg: number; dur: number };
  /** Animate head, torso and arms around the hip (bowing). */
  upper?: Motion;
  /** Drawn in the front hand's group, so it moves with the arm. */
  hand?: ReactNode;
  /** Drawn on the head (hat, topknot, helmet). */
  headwear?: ReactNode;
  /** Drawn behind / in front of the whole body, in figure coordinates. */
  behind?: ReactNode;
  front?: ReactNode;
}

function still(): boolean {
  try {
    return (
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
      false
    );
  } catch {
    return false;
  }
}

function rotateAnim(m: Motion, cx: number, cy: number): ReactNode {
  if (still()) return null;
  const values = [...m.values, m.values[0]!]
    .map((a) => `${a} ${cx} ${cy}`)
    .join(";");
  return (
    <animateTransform
      attributeName="transform"
      type="rotate"
      values={values}
      dur={`${m.dur}s`}
      begin={`${m.begin ?? 0}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines={Array.from(
        { length: m.values.length },
        () => "0.45 0 0.55 1",
      ).join(";")}
    />
  );
}

const pts = (p: readonly Pt[]) => p.map(([x, y]) => `${x},${y}`).join(" ");

export function Figure(props: FigureProps) {
  const {
    x,
    y,
    s = 1,
    pose: poseName,
    flip,
    robe,
    heavy,
    depth = "near",
    stride,
  } = props;
  const p: Pose = POSES[poseName];
  const torso = heavy ? 44 : 26;
  const limb = heavy ? 17 : 11;
  const arm = heavy ? 14 : 9;
  const [sx, sy] = p.armR[0]!;
  const [lx, ly] = p.armL[0]!;
  const both = props.arms?.which === "both";
  const animL = props.arms && (both || props.arms.which === "L");
  const animR = props.arms && (both || props.arms.which === "R");
  const seated = SEATED.has(poseName);
  const [hx, hy] = p.hip;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className={`amb-person amb-person--${depth}`}>
        {props.behind}
        <g>
          <polyline className="ppl" points={pts(p.legL)} strokeWidth={limb} />
          {stride &&
            rotateAnim(
              { values: [stride.deg, -stride.deg], dur: stride.dur },
              hx,
              hy,
            )}
        </g>
        <g>
          <polyline className="ppl" points={pts(p.legR)} strokeWidth={limb} />
          {stride &&
            rotateAnim(
              { values: [-stride.deg, stride.deg], dur: stride.dur },
              hx,
              hy,
            )}
        </g>
        {robe && !seated && (
          <path
            className="pp"
            d={`M ${hx - 14} ${hy} L ${hx + 14} ${hy} L ${hx + 22} -4 L ${hx - 22} -4 Z`}
          />
        )}
        {robe && seated && (
          <path
            className="pp"
            d={`M ${hx - 16} ${hy - 6} L ${hx + 30} ${hy + 2} L ${hx + 32} 0 L ${hx - 22} 0 Z`}
          />
        )}
        <g>
          <g>
            <polyline className="ppl" points={pts(p.armL)} strokeWidth={arm} />
            {animL && rotateAnim(props.arms!, lx, ly)}
            {!props.arms &&
              stride &&
              rotateAnim(
                {
                  values: [-stride.deg * 0.8, stride.deg * 0.8],
                  dur: stride.dur,
                },
                lx,
                ly,
              )}
          </g>
          <line
            className="ppl"
            x1={p.neck[0]}
            y1={p.neck[1]}
            x2={hx}
            y2={hy}
            strokeWidth={torso}
          />
          <circle
            className="pp"
            cx={p.head[0]}
            cy={p.head[1]}
            r={heavy ? 15 : 13}
          />
          {props.headwear && (
            <g transform={`translate(${p.head[0]} ${p.head[1]})`}>
              {props.headwear}
            </g>
          )}
          <g>
            <polyline className="ppl" points={pts(p.armR)} strokeWidth={arm} />
            {props.hand && (
              <g transform={`translate(${p.armR[2]![0]} ${p.armR[2]![1]})`}>
                {props.hand}
              </g>
            )}
            {animR && rotateAnim(props.arms!, sx, sy)}
            {!props.arms &&
              stride &&
              rotateAnim(
                {
                  values: [stride.deg * 0.8, -stride.deg * 0.8],
                  dur: stride.dur,
                },
                sx,
                sy,
              )}
          </g>
          {props.upper && rotateAnim(props.upper, hx, hy)}
        </g>
        {props.front}
      </g>
    </g>
  );
}
