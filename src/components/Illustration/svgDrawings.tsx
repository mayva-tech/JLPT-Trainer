/**
 * Hand-drawn pictures for words emoji can't show — mostly home appliances
 * (there is no washing-machine emoji). Each is a 64×64 drawing whose moving
 * parts carry a `pic-anim-*` class, animated in illustration.css:
 *
 *   pic-anim-spin    turns around its own centre (drums, fan blades)
 *   pic-anim-rise    steam / bubbles / heat drifting up and fading
 *   pic-anim-glow    gentle brightness pulse (heater fins, fridge light)
 *   pic-anim-jiggle  quick small rattle (pressure valve, sparks)
 *   pic-anim-suck    dust drifting into a nozzle
 *
 * Registered by id in ./svgArt.ts.
 */

const INK = "#3a4350";
const BODY = "#f3f5f8";
const SHADE = "#d6dce4";

export function Washer() {
  return (
    <>
      <rect x="10" y="6" width="44" height="52" rx="7" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M10 18 H54" stroke={INK} strokeWidth="2" />
      <circle cx="18" cy="12" r="2.4" fill="#5cc0b5" />
      <rect x="26" y="10" width="16" height="4" rx="2" fill={SHADE} />
      <circle cx="47" cy="12" r="2.6" fill="none" stroke={INK} strokeWidth="1.6" />
      <circle cx="32" cy="38" r="15" fill={SHADE} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="38" r="11" fill="#bfe6f5" />
      <g className="pic-anim-spin">
        <circle cx="32" cy="38" r="11" fill="none" />
        <path d="M25 33 q4 -3 8 0 q-2 4 -8 0 Z" fill="#f08a7e" />
        <path d="M33 43 q5 -2 7 2 q-4 3 -7 -2 Z" fill="#7aa6e8" />
        <path d="M26 42 q2 -3 5 -1 q-1 3 -5 1 Z" fill="#f2c84b" />
      </g>
      <g className="pic-anim-rise">
        <circle cx="38" cy="32" r="1.6" fill="#fff" />
        <circle cx="28" cy="36" r="1.1" fill="#fff" />
        <circle cx="35" cy="40" r="1.3" fill="#fff" />
      </g>
      <path d="M24 31 a11 11 0 0 1 9 -4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  );
}

export function Fridge() {
  return (
    <>
      <rect x="15" y="4" width="34" height="56" rx="6" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M15 24 H49" stroke={INK} strokeWidth="2" />
      <rect x="20" y="10" width="2.6" height="9" rx="1.3" fill={INK} />
      <rect x="20" y="29" width="2.6" height="14" rx="1.3" fill={INK} />
      <g className="pic-anim-glow">
        <path
          d="M38 11 v8 M34.5 13 l7 4 M34.5 17 l7 -4"
          stroke="#5aa9e6"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
      <g className="pic-anim-rise" stroke="#9fd3f2" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M52 30 q3 -2 6 0" />
        <path d="M53 36 q3 -2 6 0" />
      </g>
      <rect x="17" y="56" width="5" height="4" fill={INK} />
      <rect x="42" y="56" width="5" height="4" fill={INK} />
    </>
  );
}

export function Vacuum() {
  return (
    <>
      <g className="pic-anim-suck" fill="#a89a88">
        <circle cx="6" cy="54" r="1.6" />
        <circle cx="10" cy="50" r="1.2" />
        <circle cx="4" cy="48" r="1" />
      </g>
      <path d="M44 34 C40 20 22 18 20 30 L19 50" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M11 51 h16 l-2 5 h-12 z" fill="#5cc0b5" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="32" width="24" height="18" rx="9" fill="#f08a7e" stroke={INK} strokeWidth="2" />
      <circle cx="40" cy="52" r="5" fill={SHADE} stroke={INK} strokeWidth="2" />
      <circle cx="54" cy="52" r="4" fill={SHADE} stroke={INK} strokeWidth="2" />
      <rect x="44" y="36" width="9" height="4" rx="2" fill="#fff" opacity="0.6" />
    </>
  );
}

export function Heater() {
  return (
    <>
      <g className="pic-anim-rise" stroke="#f08a5c" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M22 12 q-3 -4 0 -8" />
        <path d="M32 12 q-3 -4 0 -8" />
        <path d="M42 12 q-3 -4 0 -8" />
      </g>
      <rect x="10" y="16" width="44" height="36" rx="6" fill={BODY} stroke={INK} strokeWidth="2" />
      <g className="pic-anim-glow">
        {[18, 26, 34, 42].map((x) => (
          <rect key={x} x={x} y="22" width="4" height="24" rx="2" fill="#ff8d5c" />
        ))}
      </g>
      <rect x="14" y="52" width="6" height="6" rx="1" fill={INK} />
      <rect x="44" y="52" width="6" height="6" rx="1" fill={INK} />
      <circle cx="49" cy="20" r="1.6" fill="#ff6b4a" />
    </>
  );
}

export function VentFan() {
  return (
    <>
      <rect x="8" y="8" width="48" height="48" rx="6" fill={BODY} stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="32" r="19" fill={SHADE} stroke={INK} strokeWidth="1.6" />
      <g className="pic-anim-spin">
        <circle cx="32" cy="32" r="18" fill="none" />
        {[0, 90, 180, 270].map((a) => (
          <path
            key={a}
            d="M32 32 C30 24 33 17 39 16 C40 22 37 28 32 32 Z"
            fill="#7aa6e8"
            transform={`rotate(${a} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="3.4" fill={INK} />
      </g>
    </>
  );
}

export function RiceCooker() {
  return (
    <>
      <g className="pic-anim-rise" stroke="#c9d3de" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M30 14 q-4 -4 0 -9" />
        <path d="M37 15 q-4 -4 0 -9" />
      </g>
      <path d="M10 30 q0 -12 22 -12 q22 0 22 12 z" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="27" y="17" width="10" height="4" rx="2" fill={INK} />
      <path d="M10 30 h44 v18 q0 8 -8 8 h-28 q-8 0 -8 -8 z" fill="#f6f1e7" stroke={INK} strokeWidth="2" />
      <rect x="25" y="38" width="14" height="8" rx="2" fill={SHADE} stroke={INK} strokeWidth="1.4" />
      <circle cx="29" cy="42" r="1.4" className="pic-anim-glow" fill="#ff8d5c" />
      <path d="M33 42 h4" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

export function PressureCooker() {
  return (
    <>
      <g className="pic-anim-rise" stroke="#c9d3de" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M30 10 q-4 -3 0 -7" />
        <path d="M35 11 q4 -3 0 -7" />
      </g>
      <g className="pic-anim-jiggle">
        <rect x="28" y="13" width="8" height="7" rx="2" fill={INK} />
      </g>
      <path d="M12 26 q0 -6 20 -6 q20 0 20 6 z" fill="#c7cfd8" stroke={INK} strokeWidth="2" />
      <path d="M2 24 h12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 24 h12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M12 26 h40 v22 q0 8 -8 8 h-24 q-8 0 -8 -8 z" fill="#dfe4ea" stroke={INK} strokeWidth="2" />
      <path d="M16 34 h32" stroke="#fff" strokeWidth="2" opacity="0.7" />
    </>
  );
}

export function Appliances() {
  return (
    <>
      {/* small fridge */}
      <rect x="4" y="14" width="20" height="44" rx="4" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M4 30 H24" stroke={INK} strokeWidth="2" />
      <rect x="8" y="19" width="2" height="7" rx="1" fill={INK} />
      {/* tv */}
      <rect x="28" y="6" width="32" height="22" rx="3" fill="#2f3a4a" stroke={INK} strokeWidth="2" />
      <rect x="31" y="9" width="26" height="16" rx="2" fill="#7aa6e8" className="pic-anim-glow" />
      <path d="M44 28 v4 M38 32 h12" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* washer */}
      <rect x="30" y="36" width="26" height="22" rx="4" fill={BODY} stroke={INK} strokeWidth="2" />
      <circle cx="43" cy="48" r="6.5" fill="#bfe6f5" stroke={INK} strokeWidth="1.6" />
      <g className="pic-anim-spin">
        <circle cx="43" cy="48" r="6" fill="none" />
        <path d="M40 46 q3 -2 5 0 q-2 3 -5 0 Z" fill="#f08a7e" />
      </g>
    </>
  );
}

export function Broken() {
  return (
    <>
      <g className="pic-anim-rise" fill="#b9c2cc">
        <circle cx="44" cy="8" r="4" />
        <circle cx="49" cy="5" r="3" />
      </g>
      <rect x="10" y="12" width="40" height="46" rx="6" fill={BODY} stroke={INK} strokeWidth="2" />
      <circle cx="30" cy="38" r="12" fill={SHADE} stroke={INK} strokeWidth="2" />
      <path d="M22 14 L27 24 L23 30 L30 40" stroke={INK} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <g className="pic-anim-jiggle" fill="#f2c84b" stroke="#e08a2e" strokeWidth="0.8">
        <path d="M50 22 l6 -3 l-3 6 l6 -1 l-7 7 l2 -6 l-5 1 z" />
      </g>
      <path d="M17 18 h8" stroke="#ff6b4a" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}
