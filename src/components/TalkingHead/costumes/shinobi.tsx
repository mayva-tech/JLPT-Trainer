import type { LookLayerProps } from "../looks";
import { ANDREW_FIT, NANAMI_FIT, hoodPath, shoulderY, sideR, type CostumeFit } from "./fit";
import { Poof } from "./parts";

/**
 * 忍び装束 (shinobi shōzoku) — a ninja outfit: cloth hood open at the face,
 * a knotted headband with flying tails, a dark gi with a chest strap, and a
 * scarf pulled down around the neck so the mouth stays visible.
 * Nanami in indigo with a crimson scarf, Andrew in charcoal with mustard.
 */

interface Pal {
  cloth: string;
  shade: string;
  band: string;
  scarf: string;
  scarfShade: string;
  steel: string;
}

const NANAMI: Pal = {
  cloth: "#2c3058",
  shade: "#1f2242",
  band: "#11132a",
  scarf: "#c23b31",
  scarfShade: "#922a23",
  steel: "#b9c2cc",
};
const ANDREW: Pal = {
  cloth: "#3b3e44",
  shade: "#26282c",
  band: "#141517",
  scarf: "#c9a227",
  scarfShade: "#9a7a1a",
  steel: "#b9c2cc",
};

function HoodBack({ f, p }: { f: CostumeFit; p: Pal }) {
  const r = sideR(f);
  const y = f.crown - 2;
  return (
    <g className="th-suit">
      <ellipse cx="50" cy={(f.top + f.earY) / 2 + 4} rx={f.halfW + 9} ry={(f.earY - f.top) / 2 + 17} fill={p.shade} />
      {/* headband tails flying out to the right */}
      <path className="th-shinobi-tail" d={`M${r - 2} ${y} Q${r + 8} ${y - 6} ${r + 17} ${y - 2} L${r + 15} ${y + 2} Q${r + 7} ${y - 1} ${r - 1} ${y + 4} Z`} fill={p.band} />
      <path className="th-shinobi-tail" d={`M${r - 2} ${y + 2} Q${r + 6} ${y + 4} ${r + 13} ${y + 11} L${r + 10} ${y + 13} Q${r + 4} ${y + 7} ${r - 2} ${y + 6} Z`} fill={p.band} />
    </g>
  );
}

function Gi({ f, p }: { f: CostumeFit; p: Pal }) {
  const s = shoulderY(f);
  return (
    <g className="th-suit th-suit-armor">
      <path d={`M12 110 Q16 ${s} 38 ${s - 3} L62 ${s - 3} Q84 ${s} 88 110 Z`} fill={p.cloth} />
      <path d={`M24 110 Q22 ${s + 6} 30 ${s + 2}`} stroke={p.shade} strokeWidth="1.2" fill="none" />
      <path d={`M76 110 Q78 ${s + 6} 70 ${s + 2}`} stroke={p.shade} strokeWidth="1.2" fill="none" />
      {/* crossed collar */}
      <path d={`M40 ${s - 3} L58 110 L52 110 L36 ${s - 1} Z`} fill={p.shade} />
      <path d={`M60 ${s - 3} L46 110 L40 110 L64 ${s - 1} Z`} fill={p.band} />
      {/* chest strap with a small throwing star */}
      <path d={`M22 ${s + 1} L72 110 L66 110 L18 ${s + 4} Z`} fill="#5a4636" />
      <g transform={`translate(${34} ${s + 9}) rotate(20)`}>
        <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill={p.steel} />
        <circle r="0.8" fill="#5a4636" />
      </g>
    </g>
  );
}

function Hood({ f, p }: { f: CostumeFit; p: Pal }) {
  const y = f.crown - 2;
  const l = 50 - f.halfW - 4;
  const r = 50 + f.halfW + 4;
  return (
    <g className="th-suit th-suit-helmet">
      <path d={hoodPath(f)} fill={p.cloth} fillRule="evenodd" />
      <path d={`M${l - 2} ${f.earY + 4} Q${l} ${f.earY + 14} ${l + 6} ${f.chin}`} stroke={p.shade} strokeWidth="1.2" fill="none" />
      <path d={`M${r + 2} ${f.earY + 4} Q${r} ${f.earY + 14} ${r - 6} ${f.chin}`} stroke={p.shade} strokeWidth="1.2" fill="none" />
      {/* knotted headband */}
      <path d={`M${l} ${y + 3} Q50 ${y - 8} ${r} ${y + 3} L${r} ${y - 2} Q50 ${y - 13} ${l} ${y - 2} Z`} fill={p.band} />
      <circle cx={r - 1} cy={y + 1} r="2.6" fill={p.band} />
      <Poof f={f} color="#e6e8ee" spark={p.scarf} />
    </g>
  );
}

/** Scarf pulled down, wrapped around the neck, tail over one shoulder. */
function Scarf({ f, p }: { f: CostumeFit; p: Pal }) {
  const n = f.neck;
  return (
    <g className="th-suit th-suit-collar">
      <path d={`M60 ${n + 4} Q66 ${n + 12} 64 ${n + 22} L58 ${n + 21} Q60 ${n + 12} 55 ${n + 6} Z`} fill={p.scarfShade} />
      <path
        d={`M33 ${n - 3} Q50 ${n + 6} 67 ${n - 3} L68 ${n + 5} Q50 ${n + 15} 32 ${n + 5} Z`}
        fill={p.scarf}
      />
      <path d={`M36 ${n + 1} Q50 ${n + 9} 64 ${n + 1}`} stroke={p.scarfShade} strokeWidth="1" fill="none" />
    </g>
  );
}

function Layers({ layer, f, p }: LookLayerProps & { f: CostumeFit; p: Pal }) {
  switch (layer) {
    case "back":
      return <HoodBack f={f} p={p} />;
    case "outfit":
      return <Gi f={f} p={p} />;
    case "top":
      return <Hood f={f} p={p} />;
    case "collar":
      return <Scarf f={f} p={p} />;
    default:
      return null;
  }
}

export function NanamiShinobi({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={NANAMI_FIT} p={NANAMI} />;
}

export function AndrewShinobi({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={ANDREW_FIT} p={ANDREW} />;
}
