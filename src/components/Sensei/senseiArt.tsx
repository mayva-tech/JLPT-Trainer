import type { SenseiCharacter } from "../../services/senseiBus";

/**
 * The two mascots, drawn in a 0 0 80 80 viewBox, sitting at the bottom edge.
 * Both wear the sensei's round glasses. `.sensei-eyes` blinks via CSS and
 * `.sensei-mouth` switches to an open mouth while a tip is showing.
 */

function Tanuki({ talking }: { talking: boolean }) {
  return (
    <g>
      {/* leaf on the head — the classic shape-shifting tanuki */}
      <path d="M40 8 Q48 2 52 8 Q46 14 40 8 Z" fill="#6cb05a" />
      <path d="M40 8 L50 6" stroke="#4a8a3a" strokeWidth="0.8" />
      {/* ears */}
      <circle cx="21" cy="21" r="7" fill="#5a4030" />
      <circle cx="59" cy="21" r="7" fill="#5a4030" />
      <circle cx="21" cy="22" r="3.6" fill="#3a2a22" />
      <circle cx="59" cy="22" r="3.6" fill="#3a2a22" />
      {/* body + head */}
      <ellipse cx="40" cy="80" rx="28" ry="16" fill="#8a6a4a" />
      <ellipse cx="40" cy="80" rx="16" ry="10" fill="#e8d6b8" />
      <ellipse cx="40" cy="42" rx="25" ry="23" fill="#9a7650" />
      <path d="M17 46 Q40 30 63 46 Q60 64 40 66 Q20 64 17 46 Z" fill="#f0e2c8" />
      {/* eye mask */}
      <ellipse cx="29" cy="44" rx="8.5" ry="6.4" fill="#3a2a22" transform="rotate(-12 29 44)" />
      <ellipse cx="51" cy="44" rx="8.5" ry="6.4" fill="#3a2a22" transform="rotate(12 51 44)" />
      <g className="sensei-eyes">
        <circle cx="30" cy="44" r="2.6" fill="#ffffff" />
        <circle cx="50" cy="44" r="2.6" fill="#ffffff" />
        <circle cx="30.6" cy="44.4" r="1.4" fill="#1a1412" />
        <circle cx="50.6" cy="44.4" r="1.4" fill="#1a1412" />
      </g>
      {/* glasses */}
      <g stroke="#c8a040" strokeWidth="1.3" fill="none">
        <circle cx="30" cy="44" r="6.6" />
        <circle cx="50" cy="44" r="6.6" />
        <path d="M36.6 43.6 Q40 42 43.4 43.6" />
      </g>
      <ellipse cx="40" cy="52.5" rx="3" ry="2.2" fill="#2a1e1a" />
      <Mouth talking={talking} y={56} color="#2a1e1a" />
      <ellipse cx="25" cy="54" rx="3.4" ry="2" fill="#e8a08a" opacity="0.5" />
      <ellipse cx="55" cy="54" rx="3.4" ry="2" fill="#e8a08a" opacity="0.5" />
    </g>
  );
}

function Neko({ talking }: { talking: boolean }) {
  return (
    <g>
      {/* ears */}
      <path d="M17 32 L20 10 L35 22 Z" fill="#f8f4ee" />
      <path d="M63 32 L60 10 L45 22 Z" fill="#2a2628" />
      <path d="M20.5 26 L21.6 14.5 L30 22 Z" fill="#f2b0b8" />
      <path d="M59.5 26 L58.4 14.5 L50 22 Z" fill="#f2b0b8" />
      {/* body + head */}
      <ellipse cx="40" cy="80" rx="26" ry="16" fill="#f8f4ee" />
      <ellipse cx="40" cy="42" rx="25" ry="22" fill="#f8f4ee" />
      <path d="M46 21 Q60 20 64 36 Q58 30 50 32 Q47 27 46 21 Z" fill="#2a2628" />
      <path d="M16 38 Q18 26 30 22 Q28 30 22 36 Z" fill="#e8943a" />
      {/* collar + bell */}
      <path d="M22 62 Q40 70 58 62 L58 66 Q40 74 22 66 Z" fill="#c8322e" />
      <circle cx="40" cy="70" r="3.6" fill="#e8c040" stroke="#b8902a" strokeWidth="0.6" />
      <path d="M38 70 L42 70" stroke="#8a6a1a" strokeWidth="0.7" />
      <g className="sensei-eyes">
        <ellipse cx="30" cy="43" rx="2.6" ry="3.2" fill="#3a8a4a" />
        <ellipse cx="50" cy="43" rx="2.6" ry="3.2" fill="#3a8a4a" />
        <ellipse cx="30" cy="43" rx="1" ry="2.6" fill="#1a1412" />
        <ellipse cx="50" cy="43" rx="1" ry="2.6" fill="#1a1412" />
      </g>
      <g stroke="#3a3a44" strokeWidth="1.3" fill="none">
        <circle cx="30" cy="43" r="6.4" />
        <circle cx="50" cy="43" r="6.4" />
        <path d="M36.4 42.6 Q40 41 43.6 42.6" />
      </g>
      <path d="M38.4 51 L41.6 51 L40 53 Z" fill="#e88a9a" />
      <Mouth talking={talking} y={54} color="#6a4a4a" />
      <g stroke="#b8b0a8" strokeWidth="0.7" strokeLinecap="round">
        <path d="M22 51 L10 49 M22 54 L10 55" />
        <path d="M58 51 L70 49 M58 54 L70 55" />
      </g>
      <ellipse cx="24" cy="53" rx="3.2" ry="1.8" fill="#f2a0a8" opacity="0.45" />
      <ellipse cx="56" cy="53" rx="3.2" ry="1.8" fill="#f2a0a8" opacity="0.45" />
    </g>
  );
}

function Mouth({ talking, y, color }: { talking: boolean; y: number; color: string }) {
  return talking ? (
    <g className="sensei-mouth sensei-mouth--talking">
      <path d={`M36.5 ${y} Q40 ${y + 5.5} 43.5 ${y} Z`} fill="#7a3040" />
      <path d={`M36.5 ${y} Q38.2 ${y + 1.2} 40 ${y} Q41.8 ${y + 1.2} 43.5 ${y}`} stroke={color} strokeWidth="1.1" fill="none" />
    </g>
  ) : (
    <path
      className="sensei-mouth"
      d={`M36.5 ${y} Q38.2 ${y + 2} 40 ${y} Q41.8 ${y + 2} 43.5 ${y}`}
      stroke={color}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
  );
}

export function SenseiArt({
  character,
  talking,
}: {
  character: SenseiCharacter;
  talking: boolean;
}) {
  return (
    <svg viewBox="0 0 80 80" className="sensei-svg" aria-hidden="true" focusable="false">
      {character === "neko" ? <Neko talking={talking} /> : <Tanuki talking={talking} />}
    </svg>
  );
}

/** Tiny leaf tab shown while the mascot is switched off. */
export function SenseiLeaf() {
  return (
    <svg viewBox="0 0 20 20" className="sensei-leaf-svg" aria-hidden="true" focusable="false">
      <path d="M3 17 Q2 6 16 3 Q18 14 6 16 Z" fill="#6cb05a" />
      <path d="M3 17 L14 5" stroke="#3a7a2a" strokeWidth="1" />
    </svg>
  );
}
