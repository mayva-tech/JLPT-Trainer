/**
 * Where the mascot peeks from: a clipped slot on an edge — the stage's left,
 * right or bottom side, or the top of the Nuance panel (so it seems to be
 * hiding behind it). Each peek picks a random edge, then a random spot on it,
 * among the spots that cover no text.
 */

export type Box = { left: number; top: number; right: number; bottom: number };
export type SpotEdge = "left" | "right" | "bottom" | "nuance";
export type Spot = {
  edge: SpotEdge;
  /** Slot box (fixed position, px). The mascot shows only inside it. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Side the bubble opens toward, so it stays on the stage. */
  inward: "left" | "right";
  /** Bubble grows down from the slot's top instead of up from its bottom. */
  dropBubble: boolean;
};

const STEP = 24;
const EDGE_INSET = 8;
/** Gap kept between the slot and any text. */
const PAD = 6;
/** Slot size: depth into the stage × length along the edge (phones smaller). */
const SLOT = { big: { depth: 66, length: 74 }, small: { depth: 52, length: 58 } };

export function boxesIntersect(a: Box, b: Box): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

const spotBox = (s: Spot): Box => ({ left: s.x, top: s.y, right: s.x + s.w, bottom: s.y + s.h });

export function spotIsClear(s: Spot, obstacles: Box[]): boolean {
  const b = spotBox(s);
  return !obstacles.some((o) => boxesIntersect(b, o));
}

/** Every slot position along the stage edges and the Nuance panel's top. */
export function candidateSpots(stage: Box, nuance: Box | null, small: boolean): Spot[] {
  const { depth, length } = small ? SLOT.small : SLOT.big;
  const midX = (stage.left + stage.right) / 2;
  const midY = (stage.top + stage.bottom) / 2;
  const out: Spot[] = [];
  const along = (from: number, to: number, add: (p: number) => void) => {
    for (let p = from; p <= to; p += STEP) add(p);
  };
  const vertical = (edge: SpotEdge, x: number, y: number): Spot => ({
    edge,
    x,
    y,
    w: length,
    h: depth,
    inward: x + length / 2 > midX ? "left" : "right",
    dropBubble: false,
  });

  along(stage.left + EDGE_INSET, stage.right - length - EDGE_INSET, (x) =>
    out.push(vertical("bottom", x, stage.bottom - depth))
  );
  along(stage.top + EDGE_INSET, stage.bottom - length - EDGE_INSET, (y) => {
    const dropBubble = y + length / 2 < midY;
    out.push({ edge: "left", x: stage.left, y, w: depth, h: length, inward: "right", dropBubble });
    out.push({ edge: "right", x: stage.right - depth, y, w: depth, h: length, inward: "left", dropBubble });
  });
  if (nuance && nuance.top - depth > stage.top) {
    along(Math.max(nuance.left, stage.left) + 12, Math.min(nuance.right, stage.right) - length - 12, (x) =>
      out.push(vertical("nuance", x, nuance.top - depth))
    );
  }
  return out;
}

/** A random clear spot: random edge first (so short edges get their turn), then a random spot on it. */
export function pickSpot(cands: Spot[], obstacles: Box[], rng: () => number = Math.random): Spot | null {
  const byEdge = new Map<SpotEdge, Spot[]>();
  for (const s of cands) {
    if (!spotIsClear(s, obstacles)) continue;
    byEdge.set(s.edge, [...(byEdge.get(s.edge) ?? []), s]);
  }
  const edges = [...byEdge.values()];
  if (!edges.length) return null;
  const list = edges[Math.floor(rng() * edges.length)];
  return list[Math.floor(rng() * list.length)];
}

/** The area the mascot lives in: the Player stage, else the visible trainer view, else the window. */
export function findStageBox(): { el: HTMLElement | null; box: Box } {
  const viewRight = document.documentElement.clientWidth || window.innerWidth;
  const viewBottom = document.documentElement.clientHeight || window.innerHeight;
  const stage = document.querySelector<HTMLElement>(".stage");
  const el =
    stage && stage.getBoundingClientRect().width > 0
      ? stage
      : document.querySelector<HTMLElement>(".app-view:not(.app-view--hidden)");
  const r = el?.getBoundingClientRect();
  if (!el || !r || r.width < 1 || r.height < 1) {
    return { el: null, box: { left: 0, top: 0, right: viewRight, bottom: viewBottom } };
  }
  return {
    el,
    box: {
      left: Math.max(0, r.left),
      top: Math.max(0, r.top),
      right: Math.min(viewRight, r.left + (el.clientWidth || r.width)),
      bottom: Math.min(viewBottom, r.top + (el.clientHeight || r.height)),
    },
  };
}

const padded = (r: Box): Box => ({
  left: r.left - PAD,
  top: r.top - PAD,
  right: r.right + PAD,
  bottom: r.bottom + PAD,
});

/** Text line boxes on screen, plus the talking heads and control bars — everything the mascot must not cover. */
export function collectObstacles(root: HTMLElement | null): Box[] {
  const out: Box[] = [];
  const walker = document.createTreeWalker(root ?? document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || !node.textContent?.trim() || parent.closest(".sensei")) continue;
    range.selectNodeContents(node);
    for (const r of range.getClientRects?.() ?? []) {
      if (r.width >= 1 && r.height >= 1) out.push(padded(r));
    }
  }
  document
    .querySelectorAll<HTMLElement>(".nav-bar, .production-panel, .th-root, .th-seat--split")
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) out.push(padded(r));
    });
  return out;
}
