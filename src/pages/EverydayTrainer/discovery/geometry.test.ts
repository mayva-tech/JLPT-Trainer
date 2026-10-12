import { describe, expect, it } from "vitest";
import {
  centerOn,
  clampView,
  clientToScene,
  distanceToPolygon,
  fullView,
  hitTest,
  hotspotPoints,
  labelPoint,
  markerPoints,
  MAX_ZOOM,
  panView,
  pointInPolygon,
  polygonArea,
  polygonCentroid,
  sceneToClient,
  viewZoom,
  zoomView,
  type Point,
} from "./geometry";
import type { DiscoveryObject } from "./types";

const W = 1600;
const H = 1000;
const rect = (x: number, y: number, w: number, h: number): DiscoveryObject["hotspot"] => ({
  type: "rectangle",
  x: x / W,
  y: y / H,
  width: w / W,
  height: h / H,
});
const obj = (id: string, hotspot: DiscoveryObject["hotspot"]): DiscoveryObject => ({ id, vocabularyId: id, hotspot });

/** An L shape (concave), in picture px. */
const L: Point[] = [
  [0, 0],
  [100, 0],
  [100, 20],
  [20, 20],
  [20, 100],
  [0, 100],
];

describe("polygons", () => {
  it("area, inside / outside / on the edge, concave shapes", () => {
    expect(polygonArea([[0, 0], [10, 0], [10, 10], [0, 10]])).toBe(100);
    expect(polygonArea(L)).toBe(100 * 20 + 20 * 80);
    expect(pointInPolygon([10, 10], L)).toBe(true);
    expect(pointInPolygon([60, 60], L)).toBe(false); // the notch of the L
    expect(pointInPolygon([100, 10], L)).toBe(true); // on an edge
    expect(distanceToPolygon([60, 30], L)).toBeCloseTo(10);
    expect(distanceToPolygon([5, 5], L)).toBe(0);
  });

  it("rectangle hotspots become four corners", () => {
    expect(hotspotPoints({ type: "rectangle", x: 0.1, y: 0.2, width: 0.3, height: 0.4 })).toEqual([
      [0.1, 0.2],
      [0.4, 0.2],
      [0.4, 0.6000000000000001],
      [0.1, 0.6000000000000001],
    ]);
  });

  it("label point is inside even when the centroid is not (concave)", () => {
    const c = polygonCentroid(L);
    expect(pointInPolygon(c, L)).toBe(false);
    expect(pointInPolygon(labelPoint(L), L)).toBe(true);
  });
});

describe("hitTest", () => {
  const fridge = obj("fridge", rect(1100, 350, 300, 500));
  const freezer = obj("freezer", rect(1110, 750, 280, 90)); // drawn on the fridge
  const microwave = obj("microwave", rect(1150, 240, 230, 110));
  const pole = obj("pole", rect(300, 40, 8, 440)); // thin
  const objects = [fridge, freezer, microwave, pole];

  it("the smallest hotspot under the point wins (overlaps)", () => {
    expect(hitTest(objects, [1200, 790], W, H)?.id).toBe("freezer");
    expect(hitTest(objects, [1200, 500], W, H)?.id).toBe("fridge");
    expect(hitTest(objects, [1200, 300], W, H)?.id).toBe("microwave");
  });

  it("order in the list does not matter", () => {
    expect(hitTest([...objects].reverse(), [1200, 790], W, H)?.id).toBe("freezer");
  });

  it("a slightly-off tap reaches a thin object only within the tolerance", () => {
    expect(hitTest(objects, [318, 200], W, H, 0)).toBeNull();
    expect(hitTest(objects, [318, 200], W, H, 12)?.id).toBe("pole");
    expect(hitTest(objects, [340, 200], W, H, 12)).toBeNull();
  });

  it("empty space selects nothing", () => {
    expect(hitTest(objects, [700, 900], W, H, 14)).toBeNull();
  });
});

describe("view: zoom and pan", () => {
  it("zoom keeps the focal point fixed on screen and stays within 1×–MAX_ZOOM", () => {
    const v0 = fullView(W, H);
    const focal: Point = [400, 300];
    const v1 = zoomView(v0, 2, focal, W, H);
    expect(viewZoom(v1, W)).toBeCloseTo(2);
    expect((focal[0] - v1.x) / v1.w).toBeCloseTo((focal[0] - v0.x) / v0.w);
    expect((focal[1] - v1.y) / v1.h).toBeCloseTo((focal[1] - v0.y) / v0.h);
    expect(viewZoom(zoomView(v1, 100, focal, W, H), W)).toBeCloseTo(MAX_ZOOM);
    expect(zoomView(v1, 0.01, focal, W, H)).toEqual(v0);
  });

  it("keeps the picture's aspect ratio", () => {
    const v = zoomView(fullView(W, H), 3, [800, 500], W, H);
    expect(v.w / v.h).toBeCloseTo(W / H);
  });

  it("pan and centre never leave the picture", () => {
    const v = zoomView(fullView(W, H), 2, [800, 500], W, H);
    const p = panView(v, -5000, 9000, W, H);
    expect(p.x).toBe(0);
    expect(p.y).toBe(H - p.h);
    const c = centerOn(v, { minX: 1500, minY: 900, maxX: 1600, maxY: 1000 }, W, H);
    expect(c.x + c.w).toBe(W);
    expect(c.y + c.h).toBe(H);
    expect(clampView({ x: -10, y: -10, w: 99999, h: 1 }, W, H)).toEqual(fullView(W, H));
  });
});

describe("screen ⇄ picture with letterboxing", () => {
  const view = fullView(W, H);

  it("pillarbox (element wider than the picture)", () => {
    // 1000×400 element: picture shown at 640×400, centred → 180 px bars left/right.
    const r = { left: 0, top: 0, width: 1000, height: 400 };
    expect(clientToScene(180, 0, r, view).point).toEqual([0, 0]);
    expect(clientToScene(820, 400, r, view).point).toEqual([W, H]);
    expect(clientToScene(100, 200, r, view).inside).toBe(false); // on the bar
  });

  it("letterbox (element taller than the picture)", () => {
    // 400×600 element: picture 400×250, bars of 175 px top and bottom.
    const r = { left: 10, top: 20, width: 400, height: 600 };
    expect(clientToScene(10, 195, r, view).point).toEqual([0, 0]);
    expect(clientToScene(210, 320, r, view).point).toEqual([800, 500]);
    expect(clientToScene(210, 100, r, view).inside).toBe(false);
  });

  it("round-trips through sceneToClient at any zoom", () => {
    const r = { left: 37, top: 91, width: 777, height: 333 };
    const v = zoomView(view, 2.7, [1234, 321], W, H);
    for (const pt of [[1234, 321], [v.x, v.y], [v.x + v.w, v.y + v.h]] as Point[]) {
      const [cx, cy] = sceneToClient(pt, r, v);
      const back = clientToScene(cx, cy, r, v).point;
      expect(back[0]).toBeCloseTo(pt[0]);
      expect(back[1]).toBeCloseTo(pt[1]);
    }
  });
});

describe("markerPoints", () => {
  const sidewalk = obj("sidewalk", rect(0, 760, 1600, 240));
  const tactile = obj("tactile", rect(0, 880, 1600, 46));
  const postbox = obj("postbox", rect(1100, 750, 100, 190));

  it("puts each marker inside its own hotspot and outside smaller ones on top", () => {
    const m = markerPoints([sidewalk, tactile, postbox], W, H, 40);
    const s = m.get("sidewalk")!;
    expect(s[1] >= 760).toBe(true);
    expect(s[1] > 880 && s[1] < 926).toBe(false); // not on the tactile strip
    expect(s[0] > 1100 && s[0] < 1200 && s[1] < 940).toBe(false); // not on the postbox
    const t = m.get("tactile")!;
    expect(t[1] >= 880 && t[1] <= 926).toBe(true);
  });

  it("keeps markers apart when there is room", () => {
    const a = obj("a", rect(0, 0, 400, 100));
    const b = obj("b", rect(0, 0, 400, 101));
    const m = markerPoints([a, b], W, H, 60);
    const [pa, pb] = [m.get("a")!, m.get("b")!];
    expect(Math.hypot(pa[0] - pb[0], pa[1] - pb[1])).toBeGreaterThanOrEqual(60);
  });
});
