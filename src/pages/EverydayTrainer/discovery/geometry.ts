import type { DiscoveryObject, Hotspot, NormPoint } from "./types";

/**
 * Geometry for the scene engine. Pure functions, picture pixels in and out:
 *
 *   normalized hotspot (0–1)  ×  picture size  →  picture pixels
 *   pointer (client px)  →  clientToScene  →  picture pixels  →  hitTest
 *
 * The scene is one <svg> whose viewBox is the visible part of the picture
 * (`View`) with preserveAspectRatio "xMidYMid meet". Zoom and pan only change
 * the viewBox, so hotspots drawn in the same svg can never drift from their
 * objects; `clientToScene` mirrors the browser's letterbox math so a tap maps
 * to the same point the svg shows.
 */

export type Point = readonly [number, number];

/** The visible part of the picture, in picture pixels (the svg viewBox). */
export interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Furthest zoom-in (picture shown at 4× its fitted size). */
export const MAX_ZOOM = 4;

export function hotspotPoints(h: Hotspot): NormPoint[] {
  if (h.type === "polygon") return [...h.points];
  return [
    [h.x, h.y],
    [h.x + h.width, h.y],
    [h.x + h.width, h.y + h.height],
    [h.x, h.y + h.height],
  ];
}

/** Normalized hotspot → picture pixels. */
export function hotspotToScene(h: Hotspot, width: number, height: number): Point[] {
  return hotspotPoints(h).map(([x, y]) => [x * width, y * height] as const);
}

export function polygonArea(poly: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/** Even-odd ray casting; points on an edge count as inside. */
export function pointInPolygon(pt: Point, poly: readonly Point[]): boolean {
  if (distanceToEdges(pt, poly) < 1e-9) return true;
  const [px, py] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToSegment(pt: Point, a: Point, b: Point): number {
  const [px, py] = pt;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distanceToEdges(pt: Point, poly: readonly Point[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    best = Math.min(best, distanceToSegment(pt, poly[i]!, poly[(i + 1) % poly.length]!));
  }
  return best;
}

/** 0 inside the polygon, else the distance to its nearest edge. */
export function distanceToPolygon(pt: Point, poly: readonly Point[]): number {
  return pointInPolygon(pt, poly) ? 0 : distanceToEdges(pt, poly);
}

export function polygonBounds(poly: readonly Point[]): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of poly) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** Area-weighted centroid (falls back to the vertex mean for degenerate shapes). */
export function polygonCentroid(poly: readonly Point[]): Point {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(a) < 1e-9) {
    const n = poly.length || 1;
    return [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

/**
 * The object at a picture point.
 *
 * Inside several hotspots (the microwave sits on the fridge, the knife on the
 * cutting board) the smallest one wins — the one the eye is on. Outside every
 * hotspot, the nearest one within `tolerance` px wins, so a thin pole or a
 * small button still answers a slightly-off finger.
 */
export function hitTest(
  objects: readonly DiscoveryObject[],
  pt: Point,
  width: number,
  height: number,
  tolerance = 0,
): DiscoveryObject | null {
  let best: DiscoveryObject | null = null;
  let bestArea = Infinity;
  let near: DiscoveryObject | null = null;
  let nearDist = Infinity;
  for (const obj of objects) {
    const poly = hotspotToScene(obj.hotspot, width, height);
    const d = distanceToPolygon(pt, poly);
    if (d === 0) {
      const area = polygonArea(poly);
      if (area < bestArea) {
        best = obj;
        bestArea = area;
      }
    } else if (d <= tolerance && d < nearDist) {
      near = obj;
      nearDist = d;
    }
  }
  return best ?? near;
}

/** Hotspots largest first, so smaller ones paint (and focus-ring) on top. */
export function paintOrder(
  objects: readonly DiscoveryObject[],
  width: number,
  height: number,
): DiscoveryObject[] {
  return [...objects].sort(
    (a, b) =>
      polygonArea(hotspotToScene(b.hotspot, width, height)) -
      polygonArea(hotspotToScene(a.hotspot, width, height)),
  );
}

/* ── View (viewBox) ─────────────────────────────────────────────── */

export function fullView(width: number, height: number): View {
  return { x: 0, y: 0, w: width, h: height };
}

/** Zoom factor of a view (1 = whole picture). */
export function viewZoom(view: View, width: number): number {
  return width / view.w;
}

/** Keep the view inside the picture. */
export function clampView(view: View, width: number, height: number): View {
  const w = Math.min(width, Math.max(width / MAX_ZOOM, view.w));
  const h = (w / width) * height;
  return {
    w,
    h,
    x: Math.min(width - w, Math.max(0, view.x)),
    y: Math.min(height - h, Math.max(0, view.y)),
  };
}

/**
 * Zoom by `factor` (>1 = in) keeping `focal` (a picture point) where it is on
 * screen, within 1×–MAX_ZOOM.
 */
export function zoomView(
  view: View,
  factor: number,
  focal: Point,
  width: number,
  height: number,
): View {
  const w = Math.min(width, Math.max(width / MAX_ZOOM, view.w / factor));
  const h = (w / width) * height;
  const fx = (focal[0] - view.x) / view.w;
  const fy = (focal[1] - view.y) / view.h;
  return clampView({ x: focal[0] - fx * w, y: focal[1] - fy * h, w, h }, width, height);
}

/** Move the view by picture pixels. */
export function panView(view: View, dx: number, dy: number, width: number, height: number): View {
  return clampView({ ...view, x: view.x + dx, y: view.y + dy }, width, height);
}

/** Same zoom, centred on `b` (used to bring a selected object into view). */
export function centerOn(view: View, b: Bounds, width: number, height: number): View {
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return clampView({ ...view, x: cx - view.w / 2, y: cy - view.h / 2 }, width, height);
}

/** True when `b` lies entirely inside the view. */
export function viewContains(view: View, b: Bounds): boolean {
  return b.minX >= view.x && b.maxX <= view.x + view.w && b.minY >= view.y && b.maxY <= view.y + view.h;
}

/* ── Screen ⇄ picture ───────────────────────────────────────────── */

/** Screen px per picture px for an element showing `view` with "meet". */
export function screenScale(rect: Rect, view: View): number {
  return Math.min(rect.width / view.w, rect.height / view.h);
}

/**
 * A pointer position (client px) → picture pixels, honouring the letterbox
 * bars "meet" adds when the element's shape differs from the picture's.
 * `inside` is false on the bars.
 */
export function clientToScene(
  clientX: number,
  clientY: number,
  rect: Rect,
  view: View,
): { point: Point; inside: boolean } {
  const s = screenScale(rect, view);
  const ox = rect.left + (rect.width - view.w * s) / 2;
  const oy = rect.top + (rect.height - view.h * s) / 2;
  const x = view.x + (clientX - ox) / s;
  const y = view.y + (clientY - oy) / s;
  const inside = x >= view.x && x <= view.x + view.w && y >= view.y && y <= view.y + view.h;
  return { point: [x, y], inside };
}

/** Picture point → client px (inverse of clientToScene). */
export function sceneToClient(pt: Point, rect: Rect, view: View): Point {
  const s = screenScale(rect, view);
  const ox = rect.left + (rect.width - view.w * s) / 2;
  const oy = rect.top + (rect.height - view.h * s) / 2;
  return [ox + (pt[0] - view.x) * s, oy + (pt[1] - view.y) * s];
}

/** SVG `points` attribute for a polygon in picture pixels. */
export function svgPoints(poly: readonly Point[]): string {
  return poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

/**
 * A point inside the polygon for its marker: the centroid when it falls
 * inside (most shapes), else the inside grid point nearest to it (an L-shaped
 * pole, a curved lamp arm).
 */
export function labelPoint(poly: readonly Point[]): Point {
  const c = polygonCentroid(poly);
  if (pointInPolygon(c, poly)) return c;
  const b = polygonBounds(poly);
  let best: Point = poly[0] ?? c;
  let bestD = Infinity;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p: Point = [b.minX + ((b.maxX - b.minX) * i) / steps, b.minY + ((b.maxY - b.minY) * j) / steps];
      if (!pointInPolygon(p, poly)) continue;
      const d = Math.hypot(p[0] - c[0], p[1] - c[1]);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
  }
  return best;
}

/**
 * Marker positions for "Show objects": for each object a point inside its
 * own hotspot that is not inside a smaller hotspot on top of it (the sidewalk
 * marker must not land on the tactile paving) and, where possible, at least
 * `minGap` px from markers already placed. Smaller objects are placed first.
 */
export function markerPoints(
  objects: readonly DiscoveryObject[],
  width: number,
  height: number,
  minGap: number,
): Map<string, Point> {
  const polys = objects.map((o) => {
    const poly = hotspotToScene(o.hotspot, width, height);
    return { id: o.id, poly, area: polygonArea(poly) };
  });
  const bySize = [...polys].sort((a, b) => a.area - b.area);
  const out = new Map<string, Point>();
  for (const cur of bySize) {
    const smaller = polys.filter((p) => p.area < cur.area);
    const c = labelPoint(cur.poly);
    const b = polygonBounds(cur.poly);
    const steps = 32;
    let best: Point | null = null;
    let bestScore = Infinity;
    const consider = (p: Point) => {
      if (!pointInPolygon(p, cur.poly)) return;
      if (smaller.some((s) => pointInPolygon(p, s.poly))) return;
      const near = [...out.values()].reduce((m, q) => Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1])), Infinity);
      // Prefer clear of other markers, then close to the shape's centre.
      const score = (near < minGap ? 1e6 + (minGap - near) * 1e3 : 0) + Math.hypot(p[0] - c[0], p[1] - c[1]);
      if (score < bestScore) {
        best = p;
        bestScore = score;
      }
    };
    consider(c);
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        consider([b.minX + ((b.maxX - b.minX) * i) / steps, b.minY + ((b.maxY - b.minY) * j) / steps]);
      }
    }
    out.set(cur.id, best ?? c);
  }
  return out;
}
