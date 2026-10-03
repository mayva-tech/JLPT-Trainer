import type { CSSProperties } from "react";
import type { OnoParticleKind } from "./onoFxData";
import { PARTICLES, type Shape } from "./onoParticleRecipes";

/**
 * Renders a particle recipe (see onoParticleRecipes.ts) around the word.
 * The outer span positions and rotates; the inner span animates, so the two
 * transforms never fight.
 */

/** Inner SVG for each shape, drawn in a -8..8 box, coloured with currentColor. */
function ShapeArt({ s }: { s: Shape }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (s) {
    case "heart":
      return <path d="M0 6 C-9 0 -7 -8 0 -3 C7 -8 9 0 0 6 Z" fill="currentColor" />;
    case "star4":
      return <path d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="currentColor" />;
    case "star5":
      return (
        <polygon
          points="0,-8 2.2,-2.5 7.6,-2.5 3.2,1 4.9,6.5 0,3.2 -4.9,6.5 -3.2,1 -7.6,-2.5 -2.2,-2.5"
          fill="currentColor"
        />
      );
    case "dot":
      return <circle r="6" fill="currentColor" />;
    case "square":
      return <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="currentColor" />;
    case "drop":
      return <path d="M0 -7 Q6 1 0 6 Q-6 1 0 -7 Z" fill="currentColor" />;
    case "line":
      return <path d="M-7 0 L7 0" {...stroke} strokeWidth={2.4} />;
    case "speed":
      return <path d="M-8 0 L8 0" {...stroke} strokeWidth={1.4} opacity="0.8" />;
    case "arc":
      return <path d="M-3 -7 Q5 0 -3 7" {...stroke} />;
    case "zig":
      return <path d="M-8 0 L-5 -3 L-2 3 L1 -3 L4 3 L7 -1" {...stroke} strokeWidth={1.6} />;
    case "wave":
      return <path d="M-8 0 Q-6 -3 -4 0 T0 0 T4 0 T8 0" {...stroke} strokeWidth={1.4} />;
    case "bolt":
      return <path d="M2 -8 L-4 1 L0 1 L-2 8 L4 -1 L0 -1 Z" fill="currentColor" />;
    case "arrow":
      return <path d="M0 -8 L6 -1 L2 -1 L2 7 L-2 7 L-2 -1 L-6 -1 Z" fill="currentColor" />;
    case "check":
      return <path d="M-6 0 L-1.5 5 L7 -6" {...stroke} strokeWidth={3} />;
    case "swirl":
      return <path d="M0 0 A2 2 0 1 1 2 2 A4 4 0 1 1 -3 -3 A6 6 0 1 1 6 4" {...stroke} strokeWidth={1.6} />;
    case "cloud":
      return (
        <path
          d="M-7 4 A3.5 3.5 0 0 1 -5 -2 A4.5 4.5 0 0 1 3 -3 A3.5 3.5 0 0 1 7 4 Z"
          fill="currentColor"
          opacity="0.75"
        />
      );
    case "crack":
      return <path d="M-7 -7 L-2 -1 L-4 2 L1 7 M-2 -1 L4 -3" {...stroke} strokeWidth={1.6} />;
    case "anger":
      return (
        <path
          d="M-6 -2 Q-2 -2 -2 -6 M2 -6 Q2 -2 6 -2 M6 2 Q2 2 2 6 M-2 6 Q-2 2 -6 2"
          {...stroke}
          strokeWidth={2.2}
        />
      );
    case "eye":
      return (
        <g>
          <path d="M-7 0 Q0 -6 7 0 Q0 6 -7 0 Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.2" />
          <circle r="2.4" fill="currentColor" />
        </g>
      );
    case "flower":
      return (
        <g fill="currentColor">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={Math.sin((a * Math.PI) / 180) * 4} r="3" />
          ))}
          <circle r="2" fill="#f8e070" />
        </g>
      );
    case "bubble":
      return <circle r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />;
    case "foot":
      return <ellipse rx="6" ry="3.4" fill="currentColor" opacity="0.7" />;
    case "blush":
      return <path d="M-6 3 L-3 -3 M-1 3 L2 -3 M4 3 L7 -3" {...stroke} strokeWidth={1.6} />;
    case "speech":
      return (
        <g>
          <path d="M-7 -5 H7 V3 H-1 L-4 7 L-4 3 H-7 Z" fill="currentColor" opacity="0.85" />
          <g fill="#ffffff">
            <circle cx="-3.5" cy="-1" r="1" />
            <circle cx="0" cy="-1" r="1" />
            <circle cx="3.5" cy="-1" r="1" />
          </g>
        </g>
      );
    default:
      return (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill="currentColor"
          fontFamily="system-ui, sans-serif"
        >
          {s}
        </text>
      );
  }
}

export function OnoParticles({ kind, color }: { kind: OnoParticleKind; color: string }) {
  const items = PARTICLES[kind];
  if (!items.length) return null;
  return (
    <span className="ono-particles" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="ono-p"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.k}em`,
              height: `${p.k}em`,
              marginLeft: `${-p.k / 2}em`,
              marginTop: `${-p.k / 2}em`,
              transform: p.r ? `rotate(${p.r}deg)` : undefined,
              color: p.c ?? color,
            } as CSSProperties
          }
        >
          <span
            className={`ono-p-i ono-a-${p.a}`}
            style={
              {
                animationDelay: `${p.d ?? 0}ms`,
                "--dx": `${p.dx ?? 0}em`,
                "--dy": `${p.dy ?? 0}em`,
              } as CSSProperties
            }
          >
            <svg viewBox="-8 -8 16 16" width="100%" height="100%" overflow="visible">
              <ShapeArt s={p.s} />
            </svg>
          </span>
        </span>
      ))}
    </span>
  );
}
