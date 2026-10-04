import type { CostumeFit } from "./fit";

/** Four-point sparkle centred on (x, y). */
export function Sparkle({
  x,
  y,
  r,
  fill,
  className,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  className?: string;
}) {
  const k = r * 0.28;
  return (
    <path
      className={className}
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`}
      fill={fill}
    />
  );
}

/**
 * Transformation cloud: covers the head, then bursts outward and fades to
 * show the costume. Hidden unless that head's seat has `th-seat--suit-reveal`.
 */
export function Poof({ f, color, spark }: { f: CostumeFit; color: string; spark: string }) {
  const cy = (f.top + f.chin) / 2;
  const puffs = Array.from({ length: 9 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 9;
    return { x: 50 + Math.cos(a) * (f.halfW - 4), y: cy + Math.sin(a) * (f.chin - f.top) * 0.42 };
  });
  return (
    <g className="th-costume-poof">
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={14} fill={color} />
      ))}
      <ellipse cx="50" cy={cy} rx={f.halfW + 2} ry={(f.chin - f.top) / 2 + 2} fill={color} />
      <ellipse cx="46" cy={cy - 6} rx={f.halfW * 0.6} ry="8" fill="#fff" opacity="0.6" />
      <Sparkle x={34} y={cy - 12} r={5} fill={spark} />
      <Sparkle x={66} y={cy + 4} r={6} fill={spark} />
      <Sparkle x={52} y={cy + 16} r={3.5} fill={spark} />
    </g>
  );
}
