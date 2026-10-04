import type { LookLayerProps } from "../looks";
import { ANDREW_FIT, NANAMI_FIT, domePath, shoulderY, sideL, sideR, type CostumeFit } from "./fit";
import { Poof } from "./parts";

/**
 * 鎧 (yoroi) — samurai armour: a lacquered kabuto with a crescent crest and
 * a tiered neck guard, laced shoulder plates and a chest plate. The face
 * stays open under the brim. Nanami in crimson, Andrew in black lacquer.
 */

interface Pal {
  lacquer: string;
  shade: string;
  gold: string;
  lace: string;
  under: string;
}

const NANAMI: Pal = { lacquer: "#a8282c", shade: "#7d1c20", gold: "#d9b24c", lace: "#2c3a6b", under: "#1f2433" };
const ANDREW: Pal = { lacquer: "#2b2b31", shade: "#1a1a1f", gold: "#d4ab45", lace: "#d2692a", under: "#3a2a22" };

/** Tiered neck guard (shikoro) flaring out behind the head. */
function NeckGuard({ f, p }: { f: CostumeFit; p: Pal }) {
  const tiers = [2, 1, 0].map((i) => {
    const w = f.halfW + 10 + i * 4;
    const y = f.earY - 4 + i * 8;
    return { i, w, y };
  });
  return (
    <g className="th-suit">
      <ellipse cx="50" cy={(f.top + f.earY) / 2 + 4} rx={f.halfW + 7} ry={(f.earY - f.top) / 2 + 14} fill={p.under} />
      {tiers.map(({ i, w, y }) => (
        <g key={i}>
          <path
            d={`M${50 - w} ${y} Q50 ${y - 12} ${50 + w} ${y} L${50 + w + 3} ${y + 9} Q50 ${y - 2} ${50 - w - 3} ${y + 9} Z`}
            fill={i % 2 ? p.shade : p.lacquer}
          />
          {[-1, 1].map((side) =>
            [0.55, 0.8].map((k) => (
              <line
                key={`${side}${k}`}
                x1={50 + side * w * k}
                y1={y - 1}
                x2={50 + side * (w * k + 1.5)}
                y2={y + 6}
                stroke={p.lace}
                strokeWidth="1.2"
              />
            ))
          )}
        </g>
      ))}
    </g>
  );
}

function Body({ f, p }: { f: CostumeFit; p: Pal }) {
  const s = shoulderY(f);
  return (
    <g className="th-suit th-suit-armor">
      <path d={`M10 110 Q14 ${s} 38 ${s - 3} L62 ${s - 3} Q86 ${s} 90 110 Z`} fill={p.under} />
      {/* chest plate (dō) with laced rows */}
      <path d={`M31 ${s - 1} Q50 ${s + 4} 69 ${s - 1} L66 110 L34 110 Z`} fill={p.lacquer} />
      {[5, 10, 15].map((dy) => (
        <path
          key={dy}
          d={`M${32 + dy * 0.15} ${s + dy} Q50 ${s + dy + 3} ${68 - dy * 0.15} ${s + dy}`}
          stroke={p.gold}
          strokeWidth="0.9"
          fill="none"
        />
      ))}
      {/* shoulder plates (sode): three laced lames */}
      {[3, 71].map((x) => (
        <g key={x}>
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x} y={s - 6 + k * 7} width="26" height="7.5" rx="1.5" fill={k % 2 ? p.shade : p.lacquer} />
          ))}
          {[0, 1, 2].map((k) =>
            [7, 13, 19].map((dx) => (
              <path
                key={`${k}${dx}`}
                d={`M${x + dx - 1.4} ${s - 3.5 + k * 7} l2.8 2.6 M${x + dx + 1.4} ${s - 3.5 + k * 7} l-2.8 2.6`}
                stroke={p.lace}
                strokeWidth="0.9"
              />
            ))
          )}
          <rect x={x} y={s - 6} width="26" height="1.8" fill={p.gold} />
        </g>
      ))}
    </g>
  );
}

function Helmet({ f, p }: { f: CostumeFit; p: Pal }) {
  const l = sideL(f);
  const r = sideR(f);
  const side = f.crown + 7;
  return (
    <g className="th-suit th-suit-helmet">
      {/* side flaps turned back (fukigaeshi) */}
      {[
        { x: l, d: -1 },
        { x: r, d: 1 },
      ].map(({ x, d }) => (
        <path
          key={x}
          d={`M${x} ${side - 9} Q${x + d * 9} ${side - 13} ${x + d * 10} ${side - 2} Q${x + d * 6} ${side + 5} ${x} ${side + 3} Z`}
          fill={p.lacquer}
          stroke={p.gold}
          strokeWidth="1"
        />
      ))}
      {/* bowl (hachi) with ribs */}
      <path d={domePath(f)} fill={p.lacquer} />
      {[-0.7, -0.35, 0, 0.35, 0.7].map((k) => (
        <path
          key={k}
          d={`M${50 + k * (r - 50)} ${side - 4 + Math.abs(k) * 4 - 6} Q${50 + k * (r - 50) * 0.8} ${f.top - 6} 50 ${f.top - 12}`}
          stroke={p.shade}
          strokeWidth="1"
          fill="none"
        />
      ))}
      <circle cx="50" cy={f.top - 12} r="2" fill={p.gold} />
      {/* brim (mabisashi) */}
      <path d={`M${l} ${side} Q50 ${f.crown - 7} ${r} ${side}`} stroke={p.shade} strokeWidth="3.4" fill="none" />
      <path d={`M${l} ${side - 1.8} Q50 ${f.crown - 8.8} ${r} ${side - 1.8}`} stroke={p.gold} strokeWidth="0.8" fill="none" />
      {/* crescent crest (maedate) */}
      <path
        d={`M${36} ${f.top - 15} Q50 ${f.crown + 1} 64 ${f.top - 15} Q50 ${f.crown - 9} 36 ${f.top - 15} Z`}
        fill={p.gold}
      />
      <circle cx="50" cy={f.crown - 6.5} r="2.2" fill={p.gold} stroke={p.shade} strokeWidth="0.6" />
      <Poof f={f} color="#f4efe6" spark={p.gold} />
    </g>
  );
}

/** Throat guard over the kimono collar. */
function Collar({ f, p }: { f: CostumeFit; p: Pal }) {
  const n = f.neck;
  return (
    <g className="th-suit th-suit-collar">
      <path d={`M42 ${n - 1} L50 ${n + 9} L58 ${n - 1} Z`} fill="#f2ede4" />
      <path
        d={`M35 ${n - 2} Q50 ${n + 6} 65 ${n - 2} L67 ${n + 4} Q50 ${n + 13} 33 ${n + 4} Z`}
        fill={p.lace}
      />
      <circle cx="50" cy={n + 6} r="1.6" fill={p.gold} />
    </g>
  );
}

function Layers({ layer, f, p }: LookLayerProps & { f: CostumeFit; p: Pal }) {
  switch (layer) {
    case "back":
      return <NeckGuard f={f} p={p} />;
    case "outfit":
      return <Body f={f} p={p} />;
    case "top":
      return <Helmet f={f} p={p} />;
    case "collar":
      return <Collar f={f} p={p} />;
    default:
      return null;
  }
}

export function NanamiSamurai({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={NANAMI_FIT} p={NANAMI} />;
}

export function AndrewSamurai({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={ANDREW_FIT} p={ANDREW} />;
}
