import type { Expression, ReactionFx } from "./reactionStyle";

/**
 * Expression mouths and manga-style effects for the talking heads. Shapes are
 * drawn in the heads' shared viewBox (0 0 100 110); `mouthY` is each head's
 * mouth centre so the same art fits Andrew (70) and Nanami (67).
 */

/** Mouth for a held expression (only while not speaking — visemes win). */
export function ExpressionMouth({
  expression,
  lipColor,
  cy,
}: {
  expression: Expression;
  lipColor: string;
  cy: number;
}) {
  switch (expression) {
    case "happy":
    case "cheer":
      return (
        <path
          d={`M42.5 ${cy - 1} Q50 ${cy + 5.5} 57.5 ${cy - 1}`}
          stroke={lipColor}
          strokeWidth="1.9"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "joy":
      return (
        <g>
          <path
            d={`M41 ${cy - 1.8} Q50 ${cy - 0.6} 59 ${cy - 1.8} Q57 ${cy + 7.5} 50 ${cy + 7.8} Q43 ${cy + 7.5} 41 ${cy - 1.8} Z`}
            fill="#3b1f26"
            stroke={lipColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M43 ${cy - 0.9} Q50 ${cy + 0.1} 57 ${cy - 0.9} L56.4 ${cy + 1.1} Q50 ${cy + 2} 43.6 ${cy + 1.1} Z`}
            fill="#fdfdfa"
          />
          <ellipse cx="50" cy={cy + 5} rx="4" ry="1.7" fill="#c96b74" />
        </g>
      );
    case "sad":
      return (
        <path
          d={`M44 ${cy + 2.2} Q50 ${cy - 2.6} 56 ${cy + 2.2}`}
          stroke={lipColor}
          strokeWidth="1.9"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "hmm":
      return (
        <path
          d={`M44 ${cy + 0.6} Q47 ${cy - 1.2} 50 ${cy} Q53 ${cy + 1.2} 56.5 ${cy - 1}`}
          stroke={lipColor}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="th-fx-pop"
        style={{ animationDelay: `${delay}ms` }}
        d="M0 -5 Q0.9 -0.9 5 0 Q0.9 0.9 0 5 Q-0.9 0.9 -5 0 Q-0.9 -0.9 0 -5 Z"
        fill="#f5d04a"
        stroke="#fff6c8"
        strokeWidth="0.5"
      />
    </g>
  );
}

const CONFETTI = [
  { x: 14, c: "#e8505a", d: 0, r: 20 },
  { x: 24, c: "#f5d04a", d: 120, r: -30 },
  { x: 34, c: "#4aa8e0", d: 60, r: 45 },
  { x: 46, c: "#6cc070", d: 180, r: -15 },
  { x: 56, c: "#f08ab4", d: 30, r: 35 },
  { x: 66, c: "#f5d04a", d: 150, r: -40 },
  { x: 76, c: "#4aa8e0", d: 90, r: 10 },
  { x: 86, c: "#e8505a", d: 210, r: -25 },
] as const;

/**
 * Effects that tilt with the head (sweat, gloom lines, blush) — rendered
 * inside the head's tilt group.
 */
export function HeadFx({
  fx,
  cheekY,
  cheekX,
}: {
  fx: readonly ReactionFx[];
  /** Cheek centre y and the two cheek x positions of this head. */
  cheekY: number;
  cheekX: readonly [number, number];
}) {
  return (
    <g className="th-fx" pointerEvents="none">
      {fx.includes("blush") && (
        <g stroke="#e0707a" strokeWidth="0.9" strokeLinecap="round" opacity="0.8">
          {cheekX.map((x) => (
            <g key={x}>
              <path d={`M${x - 3} ${cheekY + 1.4} l1.6 -2.8`} />
              <path d={`M${x - 0.6} ${cheekY + 1.4} l1.6 -2.8`} />
              <path d={`M${x + 1.8} ${cheekY + 1.4} l1.6 -2.8`} />
            </g>
          ))}
        </g>
      )}
      {fx.includes("gloom") && (
        <g
          className="th-fx-fade"
          stroke="#6a5a9a"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.55"
        >
          <path d="M37 27 L37 33" />
          <path d="M41 26 L41 33.5" />
          <path d="M45 27 L45 32" />
        </g>
      )}
      {fx.includes("sweat") && (
        <path
          className="th-fx-drip"
          d="M73 30 Q77.5 36 75.2 39 Q73 41 70.8 39 Q68.5 36 73 30 Z"
          fill="#9cd4f4"
          stroke="#5aa8d8"
          strokeWidth="0.8"
        />
      )}
    </g>
  );
}

/** Effects floating around the head (sparkles, "?", heart, confetti). */
export function AroundFx({ fx }: { fx: readonly ReactionFx[] }) {
  return (
    <g className="th-fx" pointerEvents="none">
      {fx.includes("sparkle") && (
        <>
          <Sparkle x={84} y={24} s={0.9} delay={0} />
          <Sparkle x={15} y={36} s={0.65} delay={140} />
        </>
      )}
      {fx.includes("sparkles") && (
        <>
          <Sparkle x={86} y={20} s={1.1} delay={0} />
          <Sparkle x={13} y={28} s={0.9} delay={120} />
          <Sparkle x={88} y={56} s={0.7} delay={240} />
          <Sparkle x={11} y={62} s={0.6} delay={360} />
        </>
      )}
      {fx.includes("question") && (
        <g className="th-fx-pop" transform="translate(84 20)">
          <path
            d="M-3 -2.5 Q-3 -7 1 -7 Q5 -7 5 -3.5 Q5 -1 2 0.5 Q0.8 1.2 0.8 3.2"
            stroke="#f2c84a"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="0.8" cy="6.6" r="1.4" fill="#f2c84a" />
        </g>
      )}
      {fx.includes("heart") && (
        <path
          className="th-fx-float"
          d="M84 30 C84 26 79 25 79 29 C79 32 84 35 84 35 C84 35 89 32 89 29 C89 25 84 26 84 30 Z"
          fill="#f07a9a"
          stroke="#ffd6e2"
          strokeWidth="0.6"
        />
      )}
      {fx.includes("confetti") &&
        CONFETTI.map((p) => (
          <rect
            key={p.x}
            className="th-fx-confetti"
            style={{ animationDelay: `${p.d}ms` }}
            x={p.x}
            y="-4"
            width="3"
            height="4.6"
            rx="0.6"
            fill={p.c}
            transform={`rotate(${p.r} ${p.x + 1.5} -2)`}
          />
        ))}
    </g>
  );
}
