import type { LookLayerProps } from "./looks";

/**
 * Mecha suit artwork — an original piloted-armour outfit both heads can wear.
 *
 * Painted into the same layer slots as a look (see LookLayer), so the face,
 * eyes, mouth and lip-sync are untouched: the helmet is open-faced with a
 * glass bubble visor, and the head talks from inside it. Each voice has its
 * own fit (face geometry differs) and colours: Nanami in pearl / teal /
 * coral, Andrew in gunmetal / amber / cyan.
 *
 * The `th-suit-shutter` plate covers the face and slides up into the crown —
 * shown only while the root carries `th-root--suit-reveal` (just after the
 * suit is switched on), so remounts during nods and reactions never replay it.
 */

interface SuitFit {
  /** Top of the face. */
  top: number;
  /** Half the face width. */
  halfW: number;
  /** Ear centre height — the comm pods sit here. */
  earY: number;
  /** Bottom edge of the crown plate at the centre (stays above the brows). */
  crown: number;
  /** Where the neck meets the collar ring. */
  neck: number;
  /** Bottom of the chin. */
  chin: number;
}

interface SuitPalette {
  shell: string;
  shellShade: string;
  trim: string;
  glow: string;
  dark: string;
}

const NANAMI_FIT: SuitFit = { top: 25, halfW: 25, earY: 56, crown: 34, neck: 81, chin: 83 };
const ANDREW_FIT: SuitFit = { top: 22, halfW: 21, earY: 56, crown: 34, neck: 92, chin: 90 };

const NANAMI_PALETTE: SuitPalette = {
  shell: "#e8ecef",
  shellShade: "#c3ccd3",
  trim: "#2a9d92",
  glow: "#ff7d6b",
  dark: "#34404c",
};

const ANDREW_PALETTE: SuitPalette = {
  shell: "#5d6872",
  shellShade: "#46505a",
  trim: "#e08a2e",
  glow: "#7fe0ff",
  dark: "#23282f",
};

/** Open helmet shell seen from the front: rim outside, lining inside. */
function HelmetBack({ f, p }: { f: SuitFit; p: SuitPalette }) {
  const cy = (f.top + f.earY) / 2 + 2;
  const rx = f.halfW + 10;
  const ry = (f.earY - f.top) / 2 + 19;
  return (
    <g className="th-suit th-suit-helmet-back">
      <ellipse cx="50" cy={cy} rx={rx} ry={ry} fill={p.shell} />
      <ellipse cx="50" cy={cy + 3} rx={rx - 3.5} ry={ry - 3.5} fill={p.dark} />
      <ellipse cx="50" cy={cy + 3} rx={rx - 6} ry={ry - 6} fill="#000" opacity="0.18" />
    </g>
  );
}

/** Undersuit, chest plate with the core light, and shoulder pods. */
function Armor({ f, p }: { f: SuitFit; p: SuitPalette }) {
  const s = f.neck + 3; // shoulder line
  const core = Math.min(s + 11, 103);
  const hex = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${(50 + r * Math.cos(a)).toFixed(2)},${(core + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
  return (
    <g className="th-suit th-suit-armor">
      {/* undersuit */}
      <path d={`M10 110 Q14 ${s} 38 ${s - 3} L62 ${s - 3} Q86 ${s} 90 110 Z`} fill={p.dark} />
      {/* chest plate */}
      <path
        d={`M33 ${s - 1} Q50 ${s + 3} 67 ${s - 1} L64 110 L36 110 Z`}
        fill={p.shell}
      />
      <path d={`M36 110 L33 ${s - 1} Q41 ${s + 1.5} 45 ${s + 1.8} L43 110 Z`} fill={p.shellShade} opacity="0.55" />
      <path
        d={`M38 ${s + 4} L46 ${core} M62 ${s + 4} L54 ${core}`}
        stroke={p.trim}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <polygon points={hex(5.4)} fill={p.dark} />
      <polygon className="th-suit-core" points={hex(3.6)} fill={p.glow} />
      <circle cx="49" cy={core - 1.2} r="0.9" fill="#fff" opacity="0.8" />
      {/* shoulder pods */}
      {[
        { x: 5, flip: false },
        { x: 71, flip: true },
      ].map(({ x, flip }) => (
        <g key={x}>
          <rect x={x} y={s - 7} width="24" height="20" rx="8" fill={p.shell} />
          <rect x={x} y={s + 3} width="24" height="10" rx="5" fill={p.shellShade} opacity="0.7" />
          <rect x={x} y={s - 1} width="24" height="3" fill={p.trim} />
          <circle cx={flip ? x + 18 : x + 6} cy={s - 3} r="1.5" fill={p.glow} />
        </g>
      ))}
    </g>
  );
}

/** Crown plate, bubble visor, comm pods and the headset antenna. */
function HelmetFront({ f, p }: { f: SuitFit; p: SuitPalette }) {
  const l = 50 - f.halfW - 6;
  const r = 50 + f.halfW + 6;
  const side = f.crown + 7;
  const crownPath = `M${l} ${side} Q${l} ${f.top - 12} 50 ${f.top - 13} Q${r} ${f.top - 12} ${r} ${side} Q50 ${f.crown - 7} ${l} ${side} Z`;
  const visorCy = (f.top + f.chin) / 2 + 3;
  const visorRx = f.halfW + 6;
  const visorRy = (f.chin - f.top) / 2 + 7;
  const podL = 50 - f.halfW - 1;
  const podR = 50 + f.halfW + 1;
  return (
    <g className="th-suit th-suit-helmet">
      {/* glass bubble */}
      <ellipse
        cx="50"
        cy={visorCy}
        rx={visorRx}
        ry={visorRy}
        fill={p.glow}
        fillOpacity="0.06"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="0.8"
      />
      <path
        d={`M${50 - visorRx + 5} ${visorCy - 6} Q${50 - visorRx + 8} ${visorCy - visorRy + 8} ${50 - 8} ${visorCy - visorRy + 2}`}
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      {/* crown plate */}
      <path d={crownPath} fill={p.shell} />
      <path
        d={`M${l + 4} ${side - 1} Q${l + 3} ${f.top - 8} 50 ${f.top - 9}`}
        stroke={p.shellShade}
        strokeWidth="2.2"
        fill="none"
        opacity="0.6"
      />
      <path
        d={`M${l} ${side} Q50 ${f.crown - 7} ${r} ${side}`}
        stroke={p.trim}
        strokeWidth="2"
        fill="none"
      />
      <rect x="47" y={f.top - 12} width="6" height={f.crown - f.top + 6} rx="3" fill={p.shellShade} />
      <circle cx="50" cy={f.crown - 6} r="2.3" fill={p.dark} />
      <circle className="th-suit-core" cx="50" cy={f.crown - 6} r="1.4" fill={p.glow} />
      {/* comm pods over the ears */}
      {[podL, podR].map((cx) => (
        <g key={cx}>
          <rect x={cx - 5} y={f.earY - 11} width="10" height="22" rx="5" fill={p.shell} />
          <circle cx={cx} cy={f.earY} r="3.6" fill={p.dark} />
          <circle cx={cx} cy={f.earY} r="1.7" fill={p.trim} />
        </g>
      ))}
      {/* headset antenna off the left pod */}
      <path
        d={`M${podL - 2} ${f.earY - 10} L${podL - 9} ${f.top - 8}`}
        stroke={p.dark}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx={podL - 9} cy={f.top - 8} r="1.9" fill={p.glow} />
      {/* reveal shutter — hidden except just after the suit goes on */}
      <g className="th-suit-shutter">
        <rect
          x={50 - visorRx}
          y={f.crown - 4}
          width={visorRx * 2}
          height={f.chin - f.crown + 10}
          rx="9"
          fill={p.shell}
        />
        <rect x={50 - visorRx} y={(f.crown + f.chin) / 2} width={visorRx * 2} height="2.4" fill={p.trim} />
        <rect x="44" y={f.crown + 8} width="12" height="3" rx="1.5" fill={p.glow} />
      </g>
    </g>
  );
}

/** Gorget ring over the neck, painted last. */
function Collar({ f, p }: { f: SuitFit; p: SuitPalette }) {
  const n = f.neck;
  return (
    <g className="th-suit th-suit-collar">
      <path
        d={`M35 ${n - 2} Q50 ${n + 6} 65 ${n - 2} L67 ${n + 4} Q50 ${n + 13} 33 ${n + 4} Z`}
        fill={p.trim}
      />
      <path
        d={`M36 ${n + 1} Q50 ${n + 9} 64 ${n + 1}`}
        stroke={p.dark}
        strokeWidth="0.9"
        fill="none"
        opacity="0.6"
      />
    </g>
  );
}

function SuitLayers({ layer, f, p }: LookLayerProps & { f: SuitFit; p: SuitPalette }) {
  switch (layer) {
    case "back":
      return <HelmetBack f={f} p={p} />;
    case "outfit":
      return <Armor f={f} p={p} />;
    case "top":
      return <HelmetFront f={f} p={p} />;
    case "collar":
      return <Collar f={f} p={p} />;
    default:
      return null; // no hair, no moustache — it's all under the helmet
  }
}

/** Nanami's suit, as a look's Layers component. */
export function NanamiSuit({ layer }: LookLayerProps) {
  return <SuitLayers layer={layer} f={NANAMI_FIT} p={NANAMI_PALETTE} />;
}

/** Andrew's suit, as a look's Layers component. */
export function AndrewSuit({ layer }: LookLayerProps) {
  return <SuitLayers layer={layer} f={ANDREW_FIT} p={ANDREW_PALETTE} />;
}
