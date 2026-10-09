/**
 * Brush geometry for one KanjiVG stroke.
 *
 * KanjiVG gives each stroke as a centre line (SVG path with M / C / S
 * commands). To look like a brush instead of a pen, the stroke is turned
 * into a filled outline whose width follows the brush: it lands heavy
 * (thick, with a pressed tip), then lifts as it travels and leaves thin.
 *
 * Pure TypeScript — no DOM — so it runs in tests and at plan time.
 */

export type Pt = readonly [number, number];

/** Parse KanjiVG path data into a dense polyline (absolute coordinates). */
export function strokePoints(d: string): Pt[] {
  const tokens = d.match(/[MmCcSsLl]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let lastCtrl: Pt | null = null;
  const num = () => parseFloat(tokens[i++] ?? "0");
  const cubic = (c1: Pt, c2: Pt, end: Pt) => {
    const p0: Pt = [x, y];
    for (let k = 1; k <= 12; k++) {
      const t = k / 12;
      const a = (1 - t) ** 3;
      const b = 3 * (1 - t) ** 2 * t;
      const c = 3 * (1 - t) * t ** 2;
      const e = t ** 3;
      pts.push([
        a * p0[0] + b * c1[0] + c * c2[0] + e * end[0],
        a * p0[1] + b * c1[1] + c * c2[1] + e * end[1],
      ]);
    }
    lastCtrl = c2;
    [x, y] = end;
  };
  while (i < tokens.length) {
    const tk = tokens[i]!;
    if (/[A-Za-z]/.test(tk)) {
      cmd = tk;
      i++;
    }
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M": {
        x = ox + num();
        y = oy + num();
        pts.push([x, y]);
        lastCtrl = null;
        cmd = rel ? "l" : "L"; // extra pairs after M are line-tos
        break;
      }
      case "L": {
        x = ox + num();
        y = oy + num();
        pts.push([x, y]);
        lastCtrl = null;
        break;
      }
      case "C": {
        const c1: Pt = [ox + num(), oy + num()];
        const c2: Pt = [ox + num(), oy + num()];
        const end: Pt = [ox + num(), oy + num()];
        cubic(c1, c2, end);
        break;
      }
      case "S": {
        const c1: Pt = lastCtrl
          ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]]
          : [x, y];
        const c2: Pt = [ox + num(), oy + num()];
        const end: Pt = [ox + num(), oy + num()];
        cubic(c1, c2, end);
        break;
      }
      default:
        i++; // unknown token: skip it
    }
  }
  return pts;
}

export function polylineLength(pts: readonly Pt[]): number {
  let len = 0;
  for (let k = 1; k < pts.length; k++) {
    len += Math.hypot(pts[k]![0] - pts[k - 1]![0], pts[k]![1] - pts[k - 1]![1]);
  }
  return len;
}

/** Length of a stroke's centre line, in KanjiVG units (box is 109). */
export function strokeLength(d: string): number {
  return polylineLength(strokePoints(d));
}

/** Even spacing along the line (so the outline is smooth). */
function resample(pts: readonly Pt[], step: number): Pt[] {
  if (pts.length < 2) return [...pts];
  const out: Pt[] = [pts[0]!];
  let carry = 0;
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1]!;
    const [bx, by] = pts[k]!;
    const seg = Math.hypot(bx - ax, by - ay);
    let pos = step - carry;
    while (pos <= seg) {
      const t = pos / seg;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      pos += step;
    }
    carry = seg - (pos - step);
  }
  const last = pts[pts.length - 1]!;
  const tail = out[out.length - 1]!;
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > step * 0.25) out.push(last);
  return out;
}

/**
 * Brush width along the stroke, as a share of the base width:
 * lands heavy (1.35), lifts gradually, leaves thin (0.4).
 */
export function brushProfile(u: number): number {
  return 1.35 - 0.95 * Math.pow(Math.min(1, Math.max(0, u)), 1.35);
}

export interface BrushShape {
  /** Filled outline of the stroke body. */
  body: string;
  /** Where the brush lands: a pressed, slightly tilted tip. */
  tip: { cx: number; cy: number; rx: number; ry: number; angle: number };
  /** Widest point, for sizing the reveal mask. */
  maxWidth: number;
}

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Outline of one stroke drawn with a brush of base width `width`. */
export function brushShape(d: string, width: number): BrushShape {
  const raw = strokePoints(d);
  const pts = resample(raw, 1.2);
  const n = pts.length;
  const maxWidth = width * brushProfile(0);
  if (n < 2) {
    const [cx, cy] = raw[0] ?? [0, 0];
    return {
      body: "",
      tip: { cx, cy, rx: maxWidth / 2, ry: maxWidth / 2, angle: 0 },
      maxWidth,
    };
  }
  // Running arc length → 0..1 along the stroke.
  const s: number[] = [0];
  for (let k = 1; k < n; k++) {
    s.push(s[k - 1]! + Math.hypot(pts[k]![0] - pts[k - 1]![0], pts[k]![1] - pts[k - 1]![1]));
  }
  const total = s[n - 1]! || 1;
  // Tangents smoothed over a small window so corners round off softly.
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const a = pts[Math.max(0, k - 2)]!;
    const b = pts[Math.min(n - 1, k + 2)]!;
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const half = Math.max(0.45, (width * brushProfile(s[k]! / total)) / 2);
    const [px, py] = pts[k]!;
    left.push([px - ty * half, py + tx * half]);
    right.push([px + ty * half, py - tx * half]);
  }
  // Round the thin end.
  const endHalf = Math.max(0.45, (width * brushProfile(1)) / 2);
  const body =
    `M ${f(left[0]![0])} ${f(left[0]![1])} ` +
    left.slice(1).map(([px, py]) => `L ${f(px)} ${f(py)}`).join(" ") +
    ` A ${f(endHalf)} ${f(endHalf)} 0 0 0 ${f(right[n - 1]![0])} ${f(right[n - 1]![1])} ` +
    right
      .slice(0, -1)
      .reverse()
      .map(([px, py]) => `L ${f(px)} ${f(py)}`)
      .join(" ") +
    " Z";
  // The landing: an oval pressed slightly across the stroke direction.
  const [x0, y0] = pts[0]!;
  const [x1, y1] = pts[Math.min(n - 1, 3)]!;
  const dir = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return {
    body,
    tip: {
      cx: x0 + (x1 - x0) * 0.35,
      cy: y0 + (y1 - y0) * 0.35,
      rx: maxWidth * 0.56,
      ry: maxWidth * 0.44,
      angle: Math.round(dir + 35),
    },
    maxWidth,
  };
}

/**
 * Base brush width for a kanji: lighter as the stroke count grows, so a
 * busy kanji (議, 響) keeps every stroke readable instead of blotting.
 */
export function brushWidth(strokeCount: number): number {
  return Math.min(5.6, Math.max(2.6, 6.4 - 0.16 * strokeCount));
}
