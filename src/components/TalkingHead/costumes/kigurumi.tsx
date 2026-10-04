import type { LookLayerProps } from "../looks";
import { ANDREW_FIT, NANAMI_FIT, hoodPath, shoulderY, sideL, sideR, type CostumeFit } from "./fit";
import { Poof } from "./parts";

/**
 * 着ぐるみ (kigurumi) — a fluffy animal onesie with the animal's face on the
 * hood. Nanami is a cat (ねこ) with a bell collar; Andrew is a bear (くま).
 */

interface Pal {
  fur: string;
  furShade: string;
  light: string;
  inner: string;
  dark: string;
}

const CAT: Pal = { fur: "#f5e6cc", furShade: "#e2cba8", light: "#fffaf0", inner: "#f3aebd", dark: "#3b2c2a" };
const BEAR: Pal = { fur: "#9b6b43", furShade: "#7f5535", light: "#dcb88e", inner: "#c48e66", dark: "#2c1e16" };

type Animal = "cat" | "bear";

function HoodBack({ f, p }: { f: CostumeFit; p: Pal }) {
  return (
    <g className="th-suit">
      <ellipse cx="50" cy={(f.top + f.earY) / 2 + 5} rx={f.halfW + 11} ry={(f.earY - f.top) / 2 + 19} fill={p.furShade} />
    </g>
  );
}

function Onesie({ f, p, animal }: { f: CostumeFit; p: Pal; animal: Animal }) {
  const s = shoulderY(f);
  return (
    <g className="th-suit th-suit-armor">
      <path d={`M8 110 Q8 ${s - 2} 36 ${s - 4} L64 ${s - 4} Q92 ${s - 2} 92 110 Z`} fill={p.fur} />
      <ellipse cx="50" cy={s + 16} rx="15" ry="12" fill={p.light} />
      {animal === "cat" && (
        <>
          <path d={`M14 ${s + 4} q6 -3 9 2`} stroke={p.furShade} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M78 ${s + 6} q6 -3 9 2`} stroke={p.furShade} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="22" cy={s + 12} rx="6" ry="4" fill="#e9a35a" opacity="0.7" />
        </>
      )}
      {[s + 8, s + 14].map((y) => (
        <circle key={y} cx="50" cy={y} r="1.3" fill={p.furShade} />
      ))}
    </g>
  );
}

function Hood({ f, p, animal }: { f: CostumeFit; p: Pal; animal: Animal }) {
  const l = sideL(f);
  const r = sideR(f);
  const eyeY = f.top - 6;
  return (
    <g className="th-suit th-suit-helmet">
      {/* ears */}
      {animal === "cat"
        ? [
            { x: l + 4, d: -1 },
            { x: r - 4, d: 1 },
          ].map(({ x, d }) => (
            <g key={x}>
              <path d={`M${x - d * 2} ${f.top - 6} L${x + d * 4} ${f.top - 26} L${x + d * 13} ${f.top - 12} Z`} fill={p.fur} />
              <path d={`M${x + d * 1} ${f.top - 9} L${x + d * 4.5} ${f.top - 20} L${x + d * 10} ${f.top - 12} Z`} fill={p.inner} />
            </g>
          ))
        : [l + 7, r - 7].map((x) => (
            <g key={x}>
              <circle cx={x} cy={f.top - 14} r="8" fill={p.fur} />
              <circle cx={x} cy={f.top - 14} r="4.5" fill={p.inner} />
            </g>
          ))}
      {/* hood with fluffy rim */}
      <path d={hoodPath(f, 1)} fill={p.fur} fillRule="evenodd" />
      <path
        d={hoodPath(f, 1).split(" M").slice(1).map((d) => `M${d}`).join(" ")}
        stroke={p.furShade}
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeDasharray="1.2 1.6"
        fill="none"
      />
      {/* the animal's face on the hood */}
      {animal === "bear" && <ellipse cx="50" cy={eyeY + 6} rx="6.5" ry="4" fill={p.light} />}
      {[-8, 8].map((dx) => (
        <g key={dx}>
          <circle cx={50 + dx} cy={eyeY} r="2.6" fill={p.dark} />
          <circle cx={50 + dx + 0.8} cy={eyeY - 0.9} r="0.9" fill="#fff" />
        </g>
      ))}
      <ellipse cx="50" cy={eyeY + 4.5} rx="1.9" ry="1.3" fill={animal === "cat" ? p.inner : p.dark} />
      {animal === "cat" &&
        [-1, 1].map((d) => (
          <g key={d} stroke={p.furShade} strokeWidth="0.9" strokeLinecap="round">
            <line x1={50 + d * 10} y1={eyeY + 4} x2={50 + d * 19} y2={eyeY + 2} />
            <line x1={50 + d * 10} y1={eyeY + 6} x2={50 + d * 19} y2={eyeY + 7} />
          </g>
        ))}
      <Poof f={f} color="#fff8ee" spark="#ffd36b" />
    </g>
  );
}

function Collar({ f, p, animal }: { f: CostumeFit; p: Pal; animal: Animal }) {
  const n = f.neck;
  if (animal === "bear") {
    return (
      <g className="th-suit th-suit-collar">
        <path d={`M34 ${n - 1} Q50 ${n + 7} 66 ${n - 1} L66 ${n + 3} Q50 ${n + 11} 34 ${n + 3} Z`} fill={p.furShade} />
      </g>
    );
  }
  return (
    <g className="th-suit th-suit-collar">
      <path d={`M35 ${n - 1} Q50 ${n + 6} 65 ${n - 1} L65 ${n + 2.5} Q50 ${n + 9.5} 35 ${n + 2.5} Z`} fill="#d6403a" />
      <circle className="th-suit-core" cx="50" cy={n + 8} r="3" fill="#f2c84b" />
      <path d={`M47.5 ${n + 8} h5`} stroke="#a8862a" strokeWidth="0.8" />
      <circle cx="50" cy={n + 9.4} r="0.7" fill="#a8862a" />
    </g>
  );
}

function Layers({ layer, f, p, animal }: LookLayerProps & { f: CostumeFit; p: Pal; animal: Animal }) {
  switch (layer) {
    case "back":
      return <HoodBack f={f} p={p} />;
    case "outfit":
      return <Onesie f={f} p={p} animal={animal} />;
    case "top":
      return <Hood f={f} p={p} animal={animal} />;
    case "collar":
      return <Collar f={f} p={p} animal={animal} />;
    default:
      return null;
  }
}

export function NanamiKigurumi({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={NANAMI_FIT} p={CAT} animal="cat" />;
}

export function AndrewKigurumi({ layer }: LookLayerProps) {
  return <Layers layer={layer} f={ANDREW_FIT} p={BEAR} animal="bear" />;
}
