import type { LookLayerProps } from "../looks";
import { ANDREW_FIT, NANAMI_FIT, hairCapPath, shoulderY, type CostumeFit } from "./fit";
import { Poof } from "./parts";

/**
 * 勇者 (yūsha) — fantasy RPG hero: a winged circlet with a gem, silver
 * pauldrons, a tunic with a buckled strap and a cape. Nanami: long dark hair,
 * crimson cape, emerald gem. Andrew: short blond hair, navy cape, ruby gem.
 */

interface Pal {
  hair: string;
  hairShade: string;
  cape: string;
  capeShade: string;
  tunic: string;
  metal: string;
  metalShade: string;
  gold: string;
  gem: string;
}

const NANAMI: Pal = {
  hair: "#3d2b25",
  hairShade: "#2c1f1b",
  cape: "#b3262d",
  capeShade: "#86191f",
  tunic: "#2f4d9a",
  metal: "#d3dae2",
  metalShade: "#9aa6b3",
  gold: "#e2b84a",
  gem: "#22b98c",
};
const ANDREW: Pal = {
  hair: "#c9a15e",
  hairShade: "#a8823f",
  cape: "#26365f",
  capeShade: "#1a2644",
  tunic: "#6b4a2e",
  metal: "#d3dae2",
  metalShade: "#9aa6b3",
  gold: "#e2b84a",
  gem: "#d63a4c",
};

type Hair = "long" | "short";

function Back({ f, p, hair }: { f: CostumeFit; p: Pal; hair: Hair }) {
  const s = shoulderY(f);
  return (
    <g className="th-suit">
      {/* cape behind the shoulders */}
      <path d={`M16 ${s - 4} Q50 ${s - 12} 84 ${s - 4} L97 110 L3 110 Z`} fill={p.capeShade} />
      {hair === "long" ? (
        <path
          d={`M${50 - f.halfW - 8} ${f.earY + 30} Q${50 - f.halfW - 12} ${f.top - 8} 50 ${f.top - 12} Q${50 + f.halfW + 12} ${f.top - 8} ${50 + f.halfW + 8} ${f.earY + 30} Z`}
          fill={p.hairShade}
        />
      ) : (
        <ellipse cx="50" cy={(f.top + f.earY) / 2} rx={f.halfW + 3} ry={(f.earY - f.top) / 2 + 9} fill={p.hairShade} />
      )}
    </g>
  );
}

function Tunic({ f, p }: { f: CostumeFit; p: Pal }) {
  const s = shoulderY(f);
  return (
    <g className="th-suit th-suit-armor">
      <path d={`M14 110 Q18 ${s} 38 ${s - 3} L62 ${s - 3} Q82 ${s} 86 110 Z`} fill={p.tunic} />
      <path d={`M38 ${s - 3} L50 ${s + 8} L62 ${s - 3}`} stroke={p.gold} strokeWidth="1.2" fill="none" />
      {/* strap with buckle */}
      <path d={`M28 ${s - 1} L70 110 L63 110 L23 ${s + 3} Z`} fill="#6e4b2a" />
      <rect x="44" y={s + 13} width="7" height="6" rx="1" fill="none" stroke={p.gold} strokeWidth="1.4" transform={`rotate(38 47.5 ${s + 16})`} />
      {/* pauldrons */}
      {[17, 83].map((x) => (
        <g key={x}>
          <path d={`M${x - 13} ${s + 10} Q${x - 12} ${s - 9} ${x} ${s - 8} Q${x + 12} ${s - 9} ${x + 13} ${s + 10} Q${x} ${s + 5} ${x - 13} ${s + 10} Z`} fill={p.metal} />
          <path d={`M${x - 10} ${s + 4} Q${x} ${s - 1} ${x + 10} ${s + 4}`} stroke={p.metalShade} strokeWidth="1.4" fill="none" />
          <circle cx={x} cy={s - 3} r="1.4" fill={p.gold} />
        </g>
      ))}
    </g>
  );
}

function Fringe({ f, p, hair }: { f: CostumeFit; p: Pal; hair: Hair }) {
  const hw = f.halfW;
  const c = f.crown;
  const d =
    hair === "long"
      ? `M${50 - hw} ${f.earY + 2} Q${50 - hw - 1} ${f.top} 52 ${f.top - 5} Q${50 + hw + 2} ${f.top + 1} ${50 + hw} ${f.earY + 2} L${50 + hw - 3} ${c + 4} Q${58} ${c - 2} ${46} ${c + 1} Q${34} ${c + 2} ${50 - hw + 3} ${c + 10} Z`
      : `M${50 - hw} ${f.earY - 8} Q${50 - hw - 1} ${f.top - 2} 50 ${f.top - 7} Q${50 + hw + 1} ${f.top - 2} ${50 + hw} ${f.earY - 8} L${50 + hw - 3} ${c + 3} L${60} ${c - 1} L${54} ${c + 2} L${47} ${c - 2} L${41} ${c + 2} L${50 - hw + 4} ${c} L${50 - hw + 1} ${c + 5} Z`;
  return (
    <g className="th-suit">
      <path d={hairCapPath(f)} fill={p.hair} />
      <path d={d} fill={p.hair} />
    </g>
  );
}

function Circlet({ f, p }: { f: CostumeFit; p: Pal }) {
  const y = f.crown - 3;
  const l = 50 - f.halfW - 1;
  const r = 50 + f.halfW + 1;
  return (
    <g className="th-suit th-suit-helmet">
      <path d={`M${l} ${y + 4} Q50 ${y - 5} ${r} ${y + 4}`} stroke={p.gold} strokeWidth="1.8" fill="none" />
      {/* wings at the temples */}
      {[
        { x: l + 1, d: -1 },
        { x: r - 1, d: 1 },
      ].map(({ x, d }) => (
        <g key={x} fill={p.metal} stroke={p.metalShade} strokeWidth="0.5">
          <path d={`M${x} ${y + 3} Q${x + d * 6} ${y - 6} ${x + d * 12} ${y - 9} Q${x + d * 9} ${y - 2} ${x + d * 2} ${y + 5} Z`} />
          <path d={`M${x} ${y + 4} Q${x + d * 6} ${y - 1} ${x + d * 11} ${y - 2} Q${x + d * 8} ${y + 3} ${x + d * 1} ${y + 6} Z`} />
        </g>
      ))}
      {/* gem */}
      <path d={`M50 ${y - 5.5} L53 ${y - 1.5} L50 ${y + 2.5} L47 ${y - 1.5} Z`} fill={p.gold} />
      <path className="th-suit-core" d={`M50 ${y - 4} L51.8 ${y - 1.5} L50 ${y + 1} L48.2 ${y - 1.5} Z`} fill={p.gem} />
      <Poof f={f} color="#fffbea" spark={p.gold} />
    </g>
  );
}

/** Cape clasps at the collar, joined by a chain. */
function Clasp({ f, p }: { f: CostumeFit; p: Pal }) {
  const n = f.neck + 2;
  return (
    <g className="th-suit th-suit-collar">
      <path d={`M30 ${n} Q34 ${n + 14} 26 ${n + 22} L20 ${n + 18} Q26 ${n + 10} 24 ${n + 1} Z`} fill={p.cape} />
      <path d={`M70 ${n} Q66 ${n + 14} 74 ${n + 22} L80 ${n + 18} Q74 ${n + 10} 76 ${n + 1} Z`} fill={p.cape} />
      <path d={`M33 ${n + 1} Q50 ${n + 7} 67 ${n + 1}`} stroke={p.gold} strokeWidth="0.8" strokeDasharray="1.2 0.8" fill="none" />
      {[33, 67].map((x) => (
        <g key={x}>
          <circle cx={x} cy={n + 1} r="3" fill={p.gold} />
          <circle cx={x} cy={n + 1} r="1.6" fill={p.gem} />
        </g>
      ))}
    </g>
  );
}

function Layers({ layer, f, p, hair }: LookLayerProps & { f: CostumeFit; p: Pal; hair: Hair }) {
  switch (layer) {
    case "back":
      return <Back f={f} p={p} hair={hair} />;
    case "outfit":
      return <Tunic f={f} p={p} />;
    case "face":
      return <Fringe f={f} p={p} hair={hair} />;
    case "top":
      return <Circlet f={f} p={p} />;
    case "collar":
      return <Clasp f={f} p={p} />;
    default:
      return null;
  }
}

export function NanamiHero({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={NANAMI_FIT} p={NANAMI} hair="long" />;
}

export function AndrewHero({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={ANDREW_FIT} p={ANDREW} hair="short" />;
}
