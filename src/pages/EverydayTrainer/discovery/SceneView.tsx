import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { SCENE_ART } from "./art";
import {
  centerOn,
  clientToScene,
  fullView,
  hitTest,
  hotspotToScene,
  markerPoints,
  MAX_ZOOM,
  paintOrder,
  panView,
  polygonBounds,
  screenScale,
  svgPoints,
  viewContains,
  viewZoom,
  zoomView,
  type Point,
  type View,
} from "./geometry";
import type { DiscoveryObject, DiscoveryScene, NormPoint } from "./types";

export type FlashKind = "correct" | "wrong" | "hint" | "new";
export interface Flash {
  id: string;
  kind: FlashKind;
  /** Changes on every flash so the same object can flash twice in a row. */
  key: number;
}

type Props = {
  scene: DiscoveryScene;
  selectedId: string | null;
  onSelect: (obj: DiscoveryObject) => void;
  /** Accessible name of an object (generic in quizzes, so it doesn't give the answer away). */
  labelFor: (obj: DiscoveryObject, index: number) => string;
  showObjects: boolean;
  foundIds: ReadonlySet<string>;
  flash?: Flash | null;
  /** Darken everything but the selected object. */
  spotlight?: boolean;
  disabled?: boolean;
  /** Editor: taps give picture points (0–1) instead of selecting objects. */
  onScenePoint?: (pt: NormPoint) => void;
  /** Editor drawing, in picture pixels. */
  overlay?: ReactNode;
  /** Captions and banners laid over the scene (the show). */
  caption?: ReactNode;
  /**
   * Where the ± buttons go: undefined = over the scene, an element = there
   * (the narrow window's controls panel), null = hidden.
   */
  zoomTarget?: HTMLElement | null;
};

/** A tap moves less than this (screen px) — more is a pan. */
const TAP_SLOP = 8;
/** Finger tolerance around a hotspot edge (screen px). */
const TAP_TOLERANCE = 14;
/** Marker radius (screen px) when objects are shown. */
const MARKER_R = 11;
/** Double-tap / double-click: second tap this soon (ms) and this close (px) zooms. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_PX = 12;

/**
 * The interactive scene: one <svg> showing the picture with the hotspots
 * drawn over it in the same coordinates. Zoom and pan change the viewBox
 * only, so a hotspot can't drift from its object at any size or zoom; the
 * letterbox bars that "meet" adds on odd-shaped screens are handled by
 * clientToScene.
 *
 * Input: tap / click → hitTest (smallest hotspot wins, with a finger
 * tolerance), drag → pan (when zoomed), pinch / Ctrl+wheel / double-click /
 * the ± buttons → zoom. Every hotspot is also a focusable button (Tab, Enter).
 */
export function SceneView({
  scene,
  selectedId,
  onSelect,
  labelFor,
  showObjects,
  foundIds,
  flash = null,
  spotlight = true,
  disabled = false,
  onScenePoint,
  overlay,
  caption,
  zoomTarget,
}: Props) {
  const W = scene.imageWidth;
  const H = scene.imageHeight;
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>(() => fullView(W, H));
  const [box, setBox] = useState({ width: W, height: H });
  const [imageFailed, setImageFailed] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;

  const polys = useMemo(
    () =>
      new Map(
        scene.objects.map((o) => {
          const poly = hotspotToScene(o.hotspot, W, H);
          return [o.id, { poly, bounds: polygonBounds(poly) }] as const;
        }),
      ),
    [scene, W, H],
  );
  const ordered = useMemo(() => paintOrder(scene.objects, W, H), [scene, W, H]);

  const indexOf = useMemo(() => new Map(scene.objects.map((o, i) => [o.id, i])), [scene]);

  // A new scene starts unzoomed.
  useEffect(() => {
    setView(fullView(W, H));
    setImageFailed(false);
  }, [scene.id, W, H]);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ width: r.width, height: r.height });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = screenScale({ left: 0, top: 0, ...box }, view);
  // Markers about two marker-widths apart on screen; re-placed when the
  // on-screen size changes a lot (phone vs laptop, zoom), not on every pan.
  const gapBucket = Math.round(Math.log2((2.4 * MARKER_R) / scale) * 2) / 2;
  const markers = useMemo(() => markerPoints(scene.objects, W, H, 2 ** gapBucket), [scene, W, H, gapBucket]);
  const zoom = viewZoom(view, W);
  const zoomed = zoom > 1.001;

  // Bring the selected object into view when zoomed in.
  useEffect(() => {
    if (!selectedId) return;
    const b = polys.get(selectedId)?.bounds;
    if (!b) return;
    setView((v) => (viewZoom(v, W) > 1.001 && !viewContains(v, b) ? centerOn(v, b, W, H) : v));
  }, [selectedId, polys, W, H]);

  const rect = () => {
    const r = svgRef.current?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  };

  const zoomBy = useCallback(
    (factor: number, focal?: Point) => {
      setView((v) => zoomView(v, factor, focal ?? [v.x + v.w / 2, v.y + v.h / 2], W, H));
    },
    [W, H],
  );

  /* ── pointer: tap, pan, pinch ───────────────────────────────── */

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
    startView: View;
    pinch: { dist: number; focal: Point } | null;
    multi: boolean;
  } | null>(null);

  const lastTap = useRef<{ x: number; y: number; t: number } | null>(null);

  const zoomToggleAt = (clientX: number, clientY: number) => {
    const r = rect();
    if (!r) return;
    const v = viewRef.current;
    if (viewZoom(v, W) >= MAX_ZOOM - 0.01) setView(fullView(W, H));
    else zoomBy(2, clientToScene(clientX, clientY, r, v).point);
  };

  const tapAt = (clientX: number, clientY: number) => {
    // A second tap on the same spot zooms (taps on two nearby objects don't).
    const now = Date.now();
    const prev = lastTap.current;
    if (!onScenePoint && prev && now - prev.t < DOUBLE_TAP_MS && Math.hypot(clientX - prev.x, clientY - prev.y) < DOUBLE_TAP_PX) {
      lastTap.current = null;
      zoomToggleAt(clientX, clientY);
      return;
    }
    lastTap.current = { x: clientX, y: clientY, t: now };
    const r = rect();
    if (!r) return;
    const v = viewRef.current;
    const { point, inside } = clientToScene(clientX, clientY, r, v);
    if (!inside) return;
    if (onScenePoint) {
      onScenePoint([+(point[0] / W).toFixed(4), +(point[1] / H).toFixed(4)]);
      return;
    }
    if (disabled || imageFailed) return;
    const s = screenScale(r, v);
    if (showObjects) {
      // Markers are generous touch targets for small objects; the nearest wins.
      let best: DiscoveryObject | null = null;
      let bestD = (MARKER_R + 4) / s;
      for (const o of scene.objects) {
        const lp = markers.get(o.id)!;
        const d = Math.hypot(point[0] - lp[0], point[1] - lp[1]);
        if (d <= bestD) {
          best = o;
          bestD = d;
        }
      }
      if (best) {
        onSelect(best);
        return;
      }
    }
    const hit = hitTest(scene.objects, point, W, H, TAP_TOLERANCE / s);
    if (hit) onSelect(hit);
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = viewRef.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const r = rect();
      if (a && b && r) {
        const mid = clientToScene((a.x + b.x) / 2, (a.y + b.y) / 2, r, v).point;
        gesture.current = {
          startX: e.clientX,
          startY: e.clientY,
          moved: true,
          startView: v,
          pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, focal: mid },
          multi: true,
        };
      }
      return;
    }
    gesture.current = { startX: e.clientX, startY: e.clientY, moved: false, startView: v, pinch: null, multi: false };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.pinch && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      setView(zoomView(g.startView, dist / g.pinch.dist, g.pinch.focal, W, H));
      return;
    }
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (!g.moved && Math.hypot(dx, dy) > TAP_SLOP) g.moved = true;
    if (g.moved && viewZoom(g.startView, W) > 1.001) {
      const r = rect();
      if (!r) return;
      const s = screenScale(r, g.startView);
      setView(panView(g.startView, -dx / s, -dy / s, W, H));
    }
  };

  const endPointer = (e: PointerEvent<SVGSVGElement>, cancelled: boolean) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0) {
      // One finger of a pinch lifted: continue as a pan from here.
      const [rest] = [...pointers.current.values()];
      if (rest) {
        gesture.current = { startX: rest.x, startY: rest.y, moved: true, startView: viewRef.current, pinch: null, multi: true };
      }
      return;
    }
    gesture.current = null;
    if (!cancelled && g && !g.moved && !g.multi) tapAt(e.clientX, e.clientY);
  };

  // Ctrl/⌘ + wheel (and trackpad pinch) zooms; a plain wheel still scrolls the page.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const v = viewRef.current;
      const { point } = clientToScene(e.clientX, e.clientY, r, v);
      setView(zoomView(v, Math.exp(-e.deltaY * 0.002), point, W, H));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [W, H]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "+" || e.key === "=") zoomBy(1.5);
    else if (e.key === "-" || e.key === "_") zoomBy(1 / 1.5);
    else if (e.key === "0") setView(fullView(W, H));
    else if (zoomed && e.key.startsWith("Arrow") && e.target === e.currentTarget) {
      const step = view.w * 0.12;
      const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
      const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
      setView((v) => panView(v, dx, dy, W, H));
    } else return;
    e.preventDefault();
  };

  const selected = selectedId ? polys.get(selectedId) : undefined;
  const Art = scene.imagePath.startsWith("art:") ? SCENE_ART[scene.imagePath.slice(4)] : undefined;
  const photo = scene.imagePath.startsWith("photo:") ? scene.imagePath.slice(6) : null;
  const maskId = `vd-dim-${scene.id}`;
  const px = 1 / scale; // one screen pixel, in picture pixels

  const zoomButtons = (
    <div className={zoomTarget ? "vd-zoom vd-zoom--outside" : "vd-zoom"} aria-label="Zoom">
      <button type="button" onClick={() => zoomBy(1.5)} disabled={zoom >= MAX_ZOOM - 0.01} aria-label="Zoom in" title="Zoom in (+)">
        +
      </button>
      <button type="button" onClick={() => zoomBy(1 / 1.5)} disabled={!zoomed} aria-label="Zoom out" title="Zoom out (−)">
        −
      </button>
      {zoomed ? (
        <button type="button" onClick={() => setView(fullView(W, H))} aria-label="Show the whole scene" title="Whole scene (0)">
          ⤢
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={zoomed ? "vd-frame vd-frame--zoomed" : "vd-frame"}
      style={{ aspectRatio: `${W} / ${H}` }}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      data-head-avoid
    >
      <svg
        ref={svgRef}
        className="vd-svg"
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={`${scene.titleEnglish} — ${scene.objects.length} objects to discover`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endPointer(e, false)}
        onPointerCancel={(e) => endPointer(e, true)}
        style={{ touchAction: zoomed ? "none" : "pan-y" }}
      >
        <rect width={W} height={H} fill="#1b2433" />
        {Art ? (
          <Suspense fallback={null}>
            <g aria-hidden="true">
              <Art />
            </g>
          </Suspense>
        ) : null}
        {photo ? (
          <image
            href={`${import.meta.env.BASE_URL}discovery/${photo}`}
            width={W}
            height={H}
            preserveAspectRatio="none"
            onError={() => setImageFailed(true)}
          />
        ) : null}

        {selected && spotlight ? (
          <>
            <defs>
              <mask id={maskId}>
                <rect width={W} height={H} fill="white" />
                <polygon points={svgPoints(selected.poly)} fill="black" />
              </mask>
            </defs>
            <rect className="vd-dim" width={W} height={H} mask={`url(#${maskId})`} />
          </>
        ) : null}

        {ordered.map((o) => {
          const p = polys.get(o.id)!;
          const cls = [
            "vd-hs",
            showObjects ? "vd-hs--shown" : "",
            showObjects && foundIds.has(o.id) ? "vd-hs--found" : "",
            o.id === selectedId ? "vd-hs--selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <polygon
              key={o.id}
              className={cls}
              points={svgPoints(p.poly)}
              vectorEffect="non-scaling-stroke"
              role="button"
              tabIndex={disabled || imageFailed || onScenePoint ? -1 : 0}
              aria-label={labelFor(o, indexOf.get(o.id) ?? 0)}
              aria-pressed={o.id === selectedId}
              data-hotspot={o.id}
              onKeyDown={(e) => {
                if (disabled || imageFailed) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(o);
                }
              }}
              onFocus={() => {
                setView((v) => (viewZoom(v, W) > 1.001 && !viewContains(v, p.bounds) ? centerOn(v, p.bounds, W, H) : v));
              }}
            />
          );
        })}

        {flash && polys.get(flash.id) ? (
          <polygon
            key={flash.key}
            className={`vd-flash vd-flash--${flash.kind}`}
            points={svgPoints(polys.get(flash.id)!.poly)}
            vectorEffect="non-scaling-stroke"
            aria-hidden="true"
          />
        ) : null}

        {showObjects
          ? scene.objects.map((o) => {
              const [cx, cy] = markers.get(o.id)!;
              const found = foundIds.has(o.id);
              return (
                <g key={`m-${o.id}`} className={found ? "vd-marker vd-marker--found" : "vd-marker"} data-marker={o.id} aria-hidden="true">
                  <circle cx={cx} cy={cy} r={MARKER_R * px} strokeWidth={2 * px} />
                  {found ? (
                    <path
                      d={`M${cx - 4.5 * px} ${cy} l${3 * px} ${3.5 * px} l${6 * px} ${-7 * px}`}
                      strokeWidth={2.4 * px}
                      fill="none"
                    />
                  ) : (
                    <circle cx={cx} cy={cy} r={3 * px} className="vd-marker-dot" />
                  )}
                </g>
              );
            })
          : null}

        {overlay}
      </svg>

      {caption}

      {imageFailed ? (
        <div className="vd-frame-error" role="alert">
          The picture for this scene could not be loaded.
        </div>
      ) : null}

      {zoomTarget === undefined ? zoomButtons : zoomTarget ? createPortal(zoomButtons, zoomTarget) : null}
    </div>
  );
}
