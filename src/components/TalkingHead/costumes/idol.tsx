import type { LookLayerProps } from "../looks";
import { ANDREW_FIT, NANAMI_FIT, hairCapPath, shoulderY, type CostumeFit } from "./fit";
import { Poof, Sparkle } from "./parts";

/**
 * アイドル衣装 — anime idol stage outfit: pastel anime hair, a stage headset
 * with a boom mic (kept clear of the mouth), sparkles that twinkle while
 * speaking. Nanami: pink twin tails with bows and a frilly
 * white top. Andrew: lavender-silver swept hair and a navy stage jacket.
 */

interface Pal {
  hair: string;
  hairShade: string;
  top: string;
  topShade: string;
  accent: string;
  gold: string;
  spark: string;
}

const NANAMI: Pal = {
  hair: "#f39bc3",
  hairShade: "#d9779f",
  top: "#fbf7fb",
  topShade: "#e8dcea",
  accent: "#ef5f9c",
  gold: "#f2c84b",
  spark: "#ffe27a",
};
const ANDREW: Pal = {
  hair: "#c8c2ea",
  hairShade: "#a198cf",
  top: "#2a3466",
  topShade: "#1d2550",
  accent: "#7fd3ff",
  gold: "#e9c45a",
  spark: "#bff0ff",
};

type Style = "tails" | "swept";

function HairBack({ f, p, style }: { f: CostumeFit; p: Pal; style: Style }) {
  const cy = (f.top + f.earY) / 2 - 2;
  if (style === "swept") {
    return (
      <g className="th-suit">
        <ellipse cx="50" cy={cy} rx={f.halfW + 5} ry={(f.earY - f.top) / 2 + 12} fill={p.hairShade} />
      </g>
    );
  }
  const l = 50 - f.halfW;
  const r = 50 + f.halfW;
  return (
    <g className="th-suit">
      <ellipse cx="50" cy={cy} rx={f.halfW + 6} ry={(f.earY - f.top) / 2 + 13} fill={p.hairShade} />
      {/* twin tails */}
      <path d={`M${l + 2} ${f.top + 2} Q${l - 22} ${f.top + 10} ${l - 16} ${f.earY + 34} Q${l - 8} ${f.earY + 14} ${l + 2} ${f.top + 12} Z`} fill={p.hair} />
      <path d={`M${r - 2} ${f.top + 2} Q${r + 22} ${f.top + 10} ${r + 16} ${f.earY + 34} Q${r + 8} ${f.earY + 14} ${r - 2} ${f.top + 12} Z`} fill={p.hair} />
      <path d={`M${l - 6} ${f.top + 14} Q${l - 14} ${f.earY} ${l - 13} ${f.earY + 22}`} stroke={p.hairShade} strokeWidth="1.2" fill="none" />
      <path d={`M${r + 6} ${f.top + 14} Q${r + 14} ${f.earY} ${r + 13} ${f.earY + 22}`} stroke={p.hairShade} strokeWidth="1.2" fill="none" />
    </g>
  );
}

/** Pointed anime bangs; side tips stay outside the brows. */
function Bangs({ f, p, style }: { f: CostumeFit; p: Pal; style: Style }) {
  const hw = f.halfW;
  const c = f.crown;
  const d =
    style === "tails"
      ? `M${50 - hw} ${f.earY - 4} Q${50 - hw + 1} ${f.top + 2} 50 ${f.top - 3} Q${50 + hw - 1} ${f.top + 2} ${50 + hw} ${f.earY - 4} L${50 + hw - 3} ${c + 9} L${50 + hw - 9} ${c + 1} L${62} ${c + 5} L${55} ${c - 1} L${48} ${c + 4} L${41} ${c - 1} L${50 - hw + 9} ${c + 4} L${50 - hw + 3} ${c + 1} L${50 - hw + 2} ${c + 10} Z`
      : `M${50 - hw} ${f.earY - 8} Q${50 - hw} ${f.top} 52 ${f.top - 4} Q${50 + hw + 2} ${f.top + 2} ${50 + hw} ${f.earY - 6} L${50 + hw - 2} ${c + 6} Q${58} ${c - 4} ${44} ${c + 2} Q${40} ${c - 3} ${50 - hw + 6} ${c + 2} L${50 - hw + 1} ${c + 8} Z`;
  return (
    <g className="th-suit">
      <path d={hairCapPath(f)} fill={p.hair} />
      <path d={d} fill={p.hair} />
      <path d={`M${50 - hw + 6} ${f.top + 4} Q50 ${f.top - 1} ${50 + hw - 8} ${f.top + 4}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Stage({ f, p, style }: { f: CostumeFit; p: Pal; style: Style }) {
  const s = shoulderY(f);
  if (style === "swept") {
    return (
      <g className="th-suit th-suit-armor">
        <path d={`M12 110 Q16 ${s} 38 ${s - 3} L62 ${s - 3} Q84 ${s} 88 110 Z`} fill={p.top} />
        <path d={`M40 ${s - 3} L50 110 L60 ${s - 3} Z`} fill="#f4f2f8" />
        <path d={`M38 ${s - 3} L46 110 L42 110 L35 ${s} Z`} fill={p.topShade} />
        <path d={`M62 ${s - 3} L54 110 L58 110 L65 ${s} Z`} fill={p.topShade} />
        {[s + 7, s + 13].map((y) => (
          <g key={y}>
            <circle cx="39" cy={y} r="1.3" fill={p.gold} />
            <circle cx="61" cy={y} r="1.3" fill={p.gold} />
          </g>
        ))}
        {/* epaulettes */}
        {[14, 86].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={s + 1} rx="9" ry="3.5" fill={p.gold} />
            {[-6, -3, 0, 3, 6].map((dx) => (
              <line key={dx} x1={x + dx} y1={s + 3} x2={x + dx} y2={s + 8} stroke={p.gold} strokeWidth="1" />
            ))}
          </g>
        ))}
      </g>
    );
  }
  return (
    <g className="th-suit th-suit-armor">
      <path d={`M14 110 Q18 ${s} 38 ${s - 3} L62 ${s - 3} Q82 ${s} 86 110 Z`} fill={p.top} />
      {/* puff sleeves */}
      {[17, 83].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={s + 6} rx="11" ry="9" fill={p.top} />
          <path d={`M${x - 10} ${s + 10} Q${x} ${s + 15} ${x + 10} ${s + 10}`} stroke={p.accent} strokeWidth="2" fill="none" />
        </g>
      ))}
      {/* frill rows */}
      {[s + 8, s + 15].map((y) => (
        <path
          key={y}
          d={`M36 ${y} q2.3 2.5 4.6 0 q2.3 2.5 4.6 0 q2.3 2.5 4.6 0 q2.3 2.5 4.6 0 q2.3 2.5 4.6 0 q2.3 2.5 4.6 0`}
          stroke={p.accent}
          strokeWidth="1.2"
          fill="none"
        />
      ))}
      <Sparkle x={50} y={s + 12} r={2.6} fill={p.gold} className="th-suit-core" />
    </g>
  );
}

function Headset({ f, p, style }: { f: CostumeFit; p: Pal; style: Style }) {
  const hw = f.halfW;
  const earR = 50 + hw;
  const tipX = 50 + hw * 0.62;
  const l = 50 - hw;
  const r = 50 + hw;
  return (
    <g className="th-suit th-suit-helmet">
      {style === "tails" ? (
        <>
          {[l + 2, r - 2].map((x) => (
            <g key={x}>
              <path d={`M${x} ${f.top + 4} l-7 -6 l1 10 Z M${x} ${f.top + 4} l7 -6 l-1 10 Z`} fill={p.accent} />
              <circle cx={x} cy={f.top + 4} r="2" fill={p.gold} />
            </g>
          ))}
        </>
      ) : (
        <Sparkle x={l + 6} y={f.top + 6} r={3.4} fill={p.gold} />
      )}
      {/* headband over the top + earpiece + boom mic */}
      <path d={`M${l - 1} ${f.earY - 6} Q${l - 2} ${f.top - 12} 50 ${f.top - 12} Q${r + 2} ${f.top - 12} ${r + 1} ${f.earY - 6}`} stroke="#3a3d46" strokeWidth="1.3" fill="none" />
      <rect x={earR - 2.5} y={f.earY - 6} width="6" height="11" rx="3" fill="#3a3d46" />
      <path d={`M${earR} ${f.earY + 3} Q${earR - 2} ${f.mouth + 4} ${tipX} ${f.mouth + 3}`} stroke="#3a3d46" strokeWidth="1" fill="none" />
      <circle cx={tipX} cy={f.mouth + 3} r="1.6" fill="#3a3d46" />
      {/* floating sparkles */}
      <Sparkle x={50 - hw - 10} y={f.top + 18} r={3} fill={p.spark} className="th-idol-twinkle" />
      <Sparkle x={50 + hw + 11} y={f.top - 2} r={2.4} fill={p.spark} className="th-idol-twinkle th-idol-twinkle--b" />
      <Sparkle x={50 + hw + 9} y={f.earY + 16} r={2} fill={p.spark} className="th-idol-twinkle th-idol-twinkle--c" />
      <Poof f={f} color="#fff4fb" spark={p.spark} />
    </g>
  );
}

function Bow({ f, p, style }: { f: CostumeFit; p: Pal; style: Style }) {
  const n = f.neck;
  const color = style === "tails" ? p.accent : "#d9dde6";
  return (
    <g className="th-suit th-suit-collar">
      <path d={`M50 ${n + 3} L40 ${n - 2} L41 ${n + 9} Z M50 ${n + 3} L60 ${n - 2} L59 ${n + 9} Z`} fill={color} />
      <circle cx="50" cy={n + 3} r="2.4" fill={style === "tails" ? p.gold : p.accent} />
    </g>
  );
}

function Layers({ layer, f, p, style }: LookLayerProps & { f: CostumeFit; p: Pal; style: Style }) {
  switch (layer) {
    case "back":
      return <HairBack f={f} p={p} style={style} />;
    case "outfit":
      return <Stage f={f} p={p} style={style} />;
    case "face":
      return <Bangs f={f} p={p} style={style} />;
    case "top":
      return <Headset f={f} p={p} style={style} />;
    case "collar":
      return <Bow f={f} p={p} style={style} />;
    default:
      return null;
  }
}

export function NanamiIdol({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={NANAMI_FIT} p={NANAMI} style="tails" />;
}

export function AndrewIdol({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={ANDREW_FIT} p={ANDREW} style="swept" />;
}
