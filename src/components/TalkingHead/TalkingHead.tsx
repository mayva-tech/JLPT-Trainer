import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useSpeechFace } from "../../hooks/useSpeechFace";
import type { Viseme } from "../../utils/visemes";
import type { HeadLook } from "./looks";
import { useHeadLook } from "./useHeadLook";
import { useHeadReaction } from "./useHeadReaction";
import { AroundFx, ExpressionMouth, HeadFx } from "./reactionFx";
import {
  REACTION_STYLE,
  browTransform,
  reactionLine,
  type Expression,
  type ReactionFx,
} from "./reactionStyle";
import "./talking-head.css";

/**
 * Talking heads for the two voices: Nanami (ja) and Andrew (en).
 *
 * Mounted once, near the app root — it listens to the global speech bus, so it
 * animates for every trainer, the player and the quest without any of them
 * wiring it up. It renders nothing at all while nothing is speaking.
 *
 * Drawn as flat vector portraits rather than attempts at realism: a stylised
 * face reads clearly at 120px and, unlike a realistic one, does not fall into
 * the uncanny valley when the mouth timing is approximate — which, for
 * English, it unavoidably is.
 *
 * Each voice has twenty looks (see ./looks). The face shape, eyes, nose and
 * mouth belong to the head and never change; a look only restyles hair,
 * facial hair, clothing and accessories. Double-click the head (or press
 * Enter) for the next look, Shift for the previous one — remembered per voice.
 *
 * Reactions: answer checks report through services/reactionBus, and the head
 * answers with an expression (brows, a held mouth, happy eyes), a small head
 * motion, manga-style effects and a one-line speech bubble. Focus the head
 * and press R to switch reactions off/on (remembered).
 */

/**
 * Mouth geometry per shape: width and height in viewBox units, plus how far
 * the lower lip drops. Values are relative to a neutral closed mouth.
 */
const MOUTH: Record<Viseme, { rx: number; ry: number; round: number }> = {
  rest: { rx: 7, ry: 0.9, round: 0.2 },
  A: { rx: 8, ry: 7, round: 0.5 }, // wide open
  I: { rx: 10, ry: 2.2, round: 0.15 }, // spread thin
  U: { rx: 4, ry: 4, round: 1 }, // small round
  E: { rx: 9, ry: 4, round: 0.3 }, // mid spread
  O: { rx: 6, ry: 6.5, round: 1 }, // rounded open
  MBP: { rx: 7, ry: 0.7, round: 0.2 }, // pressed shut
  FV: { rx: 7.5, ry: 1.8, round: 0.2 }, // lip to teeth
  TH: { rx: 7, ry: 3, round: 0.25 }, // tongue visible
};

function Mouth({
  viseme,
  lipColor,
  cy = 70,
}: {
  viseme: Viseme;
  lipColor: string;
  cy?: number;
}) {
  const shape = MOUTH[viseme];
  const showTeeth = shape.ry > 3;
  const showTongue = viseme === "TH";

  return (
    <g className="th-mouth">
      <ellipse
        cx="50"
        cy={cy}
        rx={shape.rx}
        ry={Math.max(shape.ry, 0.7)}
        fill={shape.ry > 1.5 ? "#3b1f26" : lipColor}
        stroke={lipColor}
        strokeWidth="1.6"
        className="th-mouth-shape"
      />
      {showTeeth && (
        <rect
          x={50 - shape.rx * 0.62}
          y={cy - shape.ry + 0.4}
          width={shape.rx * 1.24}
          height={Math.min(2.2, shape.ry * 0.45)}
          rx="0.6"
          fill="#fdfdfa"
        />
      )}
      {showTongue && (
        <ellipse
          cx="50"
          cy={cy + shape.ry * 0.35}
          rx={shape.rx * 0.45}
          ry="1.2"
          fill="#c96b74"
        />
      )}
    </g>
  );
}

/** Eyes blink on their own timer — a still face reads as frozen, not calm. */
function useBlink(active: boolean): boolean {
  const [closed, setClosed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setClosed(false);
      return;
    }
    let cancelled = false;

    const schedule = () => {
      // Irregular interval: a metronomic blink is its own kind of uncanny.
      const delay = 2600 + Math.random() * 3200;
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        setClosed(true);
        timer.current = window.setTimeout(() => {
          if (cancelled) return;
          setClosed(false);
          schedule();
        }, 120);
      }, delay);
    };
    schedule();

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);

  return closed;
}

/**
 * Livelier blinks (with occasional double-blinks) so the face feels alive
 * while on screen — including idle waits between lines.
 */
function useLiveBlink(active: boolean): boolean {
  const [closed, setClosed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setClosed(false);
      return;
    }
    let cancelled = false;

    const blinkOnce = (afterClose: () => void) => {
      setClosed(true);
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        setClosed(false);
        afterClose();
      }, 110 + Math.random() * 40);
    };

    const schedule = () => {
      const delay = 1400 + Math.random() * 2800;
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        blinkOnce(() => {
          if (cancelled) return;
          // Roughly one in four blinks is a quick double-blink.
          if (Math.random() < 0.25) {
            timer.current = window.setTimeout(() => {
              if (cancelled) return;
              blinkOnce(schedule);
            }, 90 + Math.random() * 80);
          } else {
            schedule();
          }
        });
      }, delay);
    };
    schedule();

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);

  return closed;
}

type GazeOffset = { dx: number; dy: number };

/** Random gaze drifts within the sclera, often returning to center — idle too. */
function useGaze(active: boolean): GazeOffset {
  const [gaze, setGaze] = useState<GazeOffset>({ dx: 0, dy: 0 });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setGaze({ dx: 0, dy: 0 });
      return;
    }
    let cancelled = false;

    const schedule = () => {
      const delay = 700 + Math.random() * 2400;
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        if (Math.random() < 0.32) {
          setGaze({ dx: 0, dy: 0 });
        } else {
          setGaze({
            dx: (Math.random() - 0.5) * 3.0,
            dy: (Math.random() - 0.5) * 2.2,
          });
        }
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);

  return gaze;
}

/** Soft left/right head tilts — irregular so it reads as idle motion, not a metronome. */
function useHeadTilt(active: boolean): number {
  const [tilt, setTilt] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active || reduced) {
      setTilt(0);
      return;
    }
    let cancelled = false;

    const schedule = () => {
      const delay = 900 + Math.random() * 2200;
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        if (Math.random() < 0.28) {
          setTilt(0);
        } else {
          // Prefer alternating sides; keep the angle small so it stays natural.
          const side = Math.random() < 0.5 ? -1 : 1;
          setTilt(side * (2.2 + Math.random() * 3.8));
        }
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);

  return tilt;
}

interface HeadProps {
  viseme: Viseme;
  blinking: boolean;
  speaking: boolean;
  /** Degrees — applied only to the head group, not the shoulders. */
  tiltDeg: number;
  /** Hair, clothing and accessories; the face itself is fixed. */
  look: HeadLook;
  /** Reaction expression; "neutral" when idle. */
  expression: Expression;
  /** Reaction effects to overlay. */
  fx: readonly ReactionFx[];
}

/** Brow wrapper: the brow path is unchanged, only nudged/rotated per mood. */
function Brow({
  expression,
  side,
  children,
}: {
  expression: Expression;
  side: "l" | "r";
  children: ReactNode;
}) {
  return (
    <g className="th-brow" style={{ transform: browTransform(expression, side) }}>
      {children}
    </g>
  );
}

/** Nanami — the Japanese voice (kimono portrait). */
function NanamiEyes({
  irisColor,
  active,
  happy = false,
}: {
  irisColor: string;
  active: boolean;
  happy?: boolean;
}) {
  const closed = useLiveBlink(active);
  const { dx, dy } = useGaze(active);

  if (happy) {
    return (
      <g stroke="#2a1810" strokeWidth="1.9" strokeLinecap="round" fill="none">
        <path d="M33 49.5 q6 -5.2 12 0" />
        <path d="M55 49.5 q6 -5.2 12 0" />
      </g>
    );
  }

  if (closed) {
    return (
      <g stroke="#2a1810" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M32 48 q7 2.6 14 0" />
        <path d="M54 48 q7 2.6 14 0" />
      </g>
    );
  }

  return (
    <g>
      <defs>
        <clipPath id="th-nanami-eye-l">
          <ellipse cx="39" cy="48" rx="5.6" ry="5.0" />
        </clipPath>
        <clipPath id="th-nanami-eye-r">
          <ellipse cx="61" cy="48" rx="5.6" ry="5.0" />
        </clipPath>
      </defs>
      <ellipse cx="39" cy="48" rx="5.6" ry="5.0" fill="#fdfcfa" />
      <ellipse cx="61" cy="48" rx="5.6" ry="5.0" fill="#fdfcfa" />
      {/* upper lash line */}
      <path
        d="M33.5 45.2 Q39 42.8 44.5 45.2"
        stroke="#1a1210"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M55.5 45.2 Q61 42.8 66.5 45.2"
        stroke="#1a1210"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <g clipPath="url(#th-nanami-eye-l)">
        <g
          className="th-gaze"
          transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
        >
          <ellipse cx="39.2" cy="48.3" rx="3.4" ry="3.5" fill={irisColor} />
          <circle cx="39.2" cy="48.3" r="1.7" fill="#1a1210" />
          <circle cx="37.6" cy="46.6" r="1.0" fill="#fff" />
          <circle cx="40.2" cy="49.4" r="0.45" fill="#fff" opacity="0.85" />
        </g>
      </g>
      <g clipPath="url(#th-nanami-eye-r)">
        <g
          className="th-gaze"
          transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
        >
          <ellipse cx="61.2" cy="48.3" rx="3.4" ry="3.5" fill={irisColor} />
          <circle cx="61.2" cy="48.3" r="1.7" fill="#1a1210" />
          <circle cx="59.6" cy="46.6" r="1.0" fill="#fff" />
          <circle cx="62.2" cy="49.4" r="0.45" fill="#fff" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

export function NanamiHead({
  viseme,
  speaking,
  tiltDeg,
  look,
  expression,
  fx,
}: HeadProps) {
  const tiltStyle = { transform: `rotate(${tiltDeg.toFixed(2)}deg)` };
  const { Layers } = look;
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label={`Nanami, the Japanese voice — ${look.label}`}
    >
      {/* hair mass behind — tilts with the head, drawn under the outfit */}
      <g className="th-head-tilt" style={tiltStyle}>
        <Layers layer="back" />
      </g>
      {/* outfit + collar stay planted */}
      <Layers layer="outfit" />
      {/* face + neck tilt around the collar line */}
      <g className="th-head-tilt" style={tiltStyle}>
        <path d="M43 70 L43 86 Q50 90 57 86 L57 70 Z" fill="#d9ab86" />
        <ellipse cx="50" cy="80" rx="5.5" ry="1.8" fill="#c8946e" opacity="0.4" />
        <ellipse cx="24" cy="56" rx="3.2" ry="4.8" fill="#d4a07e" />
        <ellipse cx="76" cy="56" rx="3.2" ry="4.8" fill="#d4a07e" />
        <ellipse cx="50" cy="54" rx="25" ry="29" fill="#e0b894" />
        <ellipse cx="34" cy="62" rx="4.2" ry="2.4" fill="#e09080" opacity="0.4" />
        <ellipse cx="66" cy="62" rx="4.2" ry="2.4" fill="#e09080" opacity="0.4" />
        <Layers layer="face" />
        <g stroke={look.browColor} strokeWidth="1.9" strokeLinecap="round" fill="none">
          <Brow expression={expression} side="l">
            <path d="M32 40 q7 -2.6 14 0.2" />
          </Brow>
          <Brow expression={expression} side="r">
            <path d="M54 40.2 q7 -2.6 14 0.2" />
          </Brow>
        </g>
        <NanamiEyes irisColor="#4a2c22" active happy={expression === "joy"} />
        <path
          d="M48.5 58 q1.5 4 3 0"
          stroke="#c8946e"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <Layers layer="lip" />
        {!speaking && expression !== "neutral" ? (
          <ExpressionMouth expression={expression} lipColor="#a84858" cy={67} />
        ) : (
          <Mouth viseme={viseme} lipColor="#a84858" cy={67} />
        )}
        <Layers layer="top" />
        <HeadFx fx={fx} cheekY={62} cheekX={[34, 66]} />
      </g>
      <Layers layer="collar" />
      <AroundFx fx={fx} />
    </svg>
  );
}

/** Andrew — the English voice (andrew2 portrait). */
function AndrewEyes({
  irisColor,
  active,
  happy = false,
}: {
  irisColor: string;
  active: boolean;
  happy?: boolean;
}) {
  const closed = useLiveBlink(active);
  const { dx, dy } = useGaze(active);

  if (happy) {
    return (
      <g stroke="#5a4632" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M33.5 49.5 q5.5 -4.8 11 0" />
        <path d="M55.5 49.5 q5.5 -4.8 11 0" />
      </g>
    );
  }

  if (closed) {
    return (
      <g stroke="#5a4632" strokeWidth="1.7" strokeLinecap="round" fill="none">
        <path d="M33 48 q6 2.8 12 0" />
        <path d="M55 48 q6 2.8 12 0" />
      </g>
    );
  }

  return (
    <g>
      <defs>
        <clipPath id="th-andrew-eye-l">
          <ellipse cx="39" cy="48" rx="5.2" ry="4.1" />
        </clipPath>
        <clipPath id="th-andrew-eye-r">
          <ellipse cx="61" cy="48" rx="5.2" ry="4.1" />
        </clipPath>
      </defs>
      {/* almond sclera */}
      <ellipse cx="39" cy="48" rx="5.2" ry="4.1" fill="#fdfcfa" />
      <ellipse cx="61" cy="48" rx="5.2" ry="4.1" fill="#fdfcfa" />
      {/* iris + pupil look around together; clipped so they stay in the eye */}
      <g clipPath="url(#th-andrew-eye-l)">
        <g
          className="th-gaze"
          transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
        >
          <ellipse cx="39.3" cy="48.2" rx="3.1" ry="2.9" fill={irisColor} />
          <circle cx="39.3" cy="48.2" r="1.55" fill="#2a241c" />
          <circle cx="40.5" cy="46.9" r="0.85" fill="#fff" />
        </g>
      </g>
      <g clipPath="url(#th-andrew-eye-r)">
        <g
          className="th-gaze"
          transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
        >
          <ellipse cx="61.3" cy="48.2" rx="3.1" ry="2.9" fill={irisColor} />
          <circle cx="61.3" cy="48.2" r="1.55" fill="#2a241c" />
          <circle cx="62.5" cy="46.9" r="0.85" fill="#fff" />
        </g>
      </g>
    </g>
  );
}

export function AndrewHead({
  viseme,
  speaking,
  tiltDeg,
  look,
  expression,
  fx,
}: HeadProps) {
  const tiltStyle = { transform: `rotate(${tiltDeg.toFixed(2)}deg)` };
  const { Layers } = look;
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label={`Andrew, the English voice — ${look.label}`}
    >
      {/* anything behind the head (buns, long hair) tilts with it */}
      <g className="th-head-tilt" style={tiltStyle}>
        <Layers layer="back" />
      </g>
      {/* clothing + shoulders stay planted */}
      <Layers layer="outfit" />
      {/* head + neck tilt around the collar */}
      <g className="th-head-tilt" style={tiltStyle}>
        <path d="M42 78 L42 94 Q50 98 58 94 L58 78 Z" fill="#e8c4a4" />
        <ellipse cx="50" cy="86" rx="7" ry="2.2" fill="#d4a888" opacity="0.45" />
        <ellipse cx="27" cy="56" rx="3.6" ry="5.2" fill="#e3b48f" />
        <ellipse cx="73" cy="56" rx="3.6" ry="5.2" fill="#e3b48f" />
        <path
          d="M30 42
             Q30 24 50 22
             Q70 24 70 42
             L70 68
             Q70 86 50 90
             Q30 86 30 68 Z"
          fill="#edd0b0"
        />
        <path
          d="M58 28 Q68 32 68 48 L68 70 Q64 82 52 86 Q60 72 60 48 Q60 34 58 28 Z"
          fill="#dcb896"
          opacity="0.35"
        />
        <Layers layer="face" />
        <ellipse cx="36" cy="58" rx="4.5" ry="2.8" fill="#e8a090" opacity="0.4" />
        <ellipse cx="64" cy="58" rx="4.5" ry="2.8" fill="#e8a090" opacity="0.4" />
        <g stroke={look.browColor} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <Brow expression={expression} side="l">
            <path d="M32 40 q7 -3.5 13 0.2" />
          </Brow>
          <Brow expression={expression} side="r">
            <path d="M55 40.2 q6 -3.5 13 0.2" />
          </Brow>
        </g>
        <AndrewEyes irisColor="#7a8f6a" active happy={expression === "joy"} />
        <path
          d="M50 46 L50 58"
          stroke="#e0b898"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M50 48 q3.2 8 -0.5 11"
          stroke="#d4a07e"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="50.5" cy="59.5" rx="2.1" ry="1.5" fill="#e8b4a0" opacity="0.55" />
        <Layers layer="lip" />
        {!speaking && expression !== "neutral" ? (
          <ExpressionMouth expression={expression} lipColor="#b56860" cy={70} />
        ) : (
          <Mouth viseme={viseme} lipColor="#b56860" />
        )}
        <Layers layer="top" />
        <HeadFx fx={fx} cheekY={58} cheekX={[36, 64]} />
      </g>
      <Layers layer="collar" />
      <AroundFx fx={fx} />
    </svg>
  );
}

export interface TalkingHeadProps {
  /** Hide entirely — for users who find the animation distracting. */
  enabled?: boolean;
}

const HEAD_POS_KEY = "jlpt-trainer:talking-head-pos:v1";

type HeadPos = { x: number; y: number };

function loadHeadPos(): HeadPos | null {
  try {
    const raw = globalThis.localStorage?.getItem(HEAD_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HeadPos>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // private mode / quota
  }
  return null;
}

function saveHeadPos(pos: HeadPos) {
  try {
    globalThis.localStorage?.setItem(HEAD_POS_KEY, JSON.stringify(pos));
  } catch {
    // private mode / quota
  }
}

function clampHeadPos(x: number, y: number, el: HTMLElement): HeadPos {
  const { width, height } = el.getBoundingClientRect();
  const maxX = Math.max(4, window.innerWidth - width - 4);
  const maxY = Math.max(4, window.innerHeight - height - 4);
  return {
    x: Math.min(Math.max(4, x), maxX),
    y: Math.min(Math.max(4, y), maxY),
  };
}

type Box = { left: number; top: number; right: number; bottom: number };

/** Breathing room kept between the head and any text it steps aside for. */
const AVOID_PAD = 6;
const AVOID_INTERVAL_MS = 350;
const AVOID_GRID_STEP = 12;
const PRIORITY_SELECTOR = ".lesson-nuance--active";

function boxAt(pos: HeadPos, w: number, h: number): Box {
  return { left: pos.x, top: pos.y, right: pos.x + w, bottom: pos.y + h };
}

function boxesIntersect(a: Box, b: Box): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** The panel the head must stay inside: the Player stage, else the trainer view. */
function findAvoidPanel(): { el: HTMLElement; box: Box } | null {
  const stage = document.querySelector<HTMLElement>(".stage");
  const el =
    stage && stage.getBoundingClientRect().width > 0
      ? stage
      : document.querySelector<HTMLElement>(".app-view:not(.app-view--hidden)");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  return {
    el,
    box: {
      left: Math.max(0, r.left),
      top: Math.max(0, r.top),
      right: Math.min(window.innerWidth, r.right),
      bottom: Math.min(window.innerHeight, r.bottom),
    },
  };
}

/** Visible text line boxes inside the panel, plus the fixed control bars. */
function collectObstacles(panelEl: HTMLElement, panel: Box): Box[] {
  const out: Box[] = [];
  const pad = (r: DOMRect | Box): Box => ({
    left: r.left - AVOID_PAD,
    top: r.top - AVOID_PAD,
    right: r.right + AVOID_PAD,
    bottom: r.bottom + AVOID_PAD,
  });

  const walker = document.createTreeWalker(panelEl, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const visibleCache = new Map<Element, boolean>();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    let visible = visibleCache.get(parent);
    if (visible === undefined) {
      const cs = getComputedStyle(parent);
      visible = cs.visibility !== "hidden" && cs.opacity !== "0";
      visibleCache.set(parent, visible);
    }
    if (!visible) continue;
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      if (!boxesIntersect(r, panel)) continue;
      out.push(pad(r));
    }
  }

  document
    .querySelectorAll<HTMLElement>(".nav-bar, .production-panel")
    .forEach((bar) => {
      const r = bar.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) out.push(pad(r));
    });
  return out;
}

/** Panels being read aloud right now (e.g. the active Nuance box) — never cover these. */
function collectPriorityObstacles(panel: Box): Box[] {
  const out: Box[] = [];
  document
    .querySelectorAll<HTMLElement>(PRIORITY_SELECTOR)
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || !boxesIntersect(r, panel)) return;
      out.push({
        left: r.left - AVOID_PAD,
        top: r.top - AVOID_PAD,
        right: r.right + AVOID_PAD,
        bottom: r.bottom + AVOID_PAD,
      });
    });
  return out;
}

function isClear(box: Box, obstacles: Box[]): boolean {
  return !obstacles.some((o) => boxesIntersect(box, o));
}

/**
 * Nearest spot to `prefer` inside `panel` that covers no text. Falls back to
 * the least-overlapping spot when the panel is packed, always keeping
 * `priority` boxes uncovered if any spot allows it.
 */
function findClearSpot(
  panel: Box,
  w: number,
  h: number,
  obstacles: Box[],
  prefer: HeadPos,
  priority: Box[] = []
): HeadPos | null {
  const minX = panel.left + 4;
  const minY = panel.top + 4;
  const maxX = panel.right - w - 4;
  const maxY = panel.bottom - h - 4;
  if (maxX < minX || maxY < minY) return null;

  const xs: number[] = [];
  for (let x = minX; x < maxX; x += AVOID_GRID_STEP) xs.push(x);
  xs.push(maxX);
  const ys: number[] = [];
  for (let y = minY; y < maxY; y += AVOID_GRID_STEP) ys.push(y);
  ys.push(maxY);

  let best: HeadPos | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const y of ys) {
    for (const x of xs) {
      const box = { left: x, top: y, right: x + w, bottom: y + h };
      let overlap = 0;
      for (const o of obstacles) overlap += overlapArea(box, o);
      let covered = 0;
      for (const p of priority) covered += overlapArea(box, p);
      // Covering a priority panel outweighs any other text, and any overlap
      // outweighs distance, so a clear spot always wins.
      const score =
        covered * 1e6 + overlap * 1000 + Math.hypot(x - prefer.x, y - prefer.y);
      if (score < bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
  }
  return best;
}

/** Where the CSS parks the head before the user has dragged it. */
function defaultHeadPos(w: number, h: number): HeadPos {
  const inset = window.innerWidth <= 480 ? 8 : 14;
  return {
    x: window.innerWidth - w - inset,
    y: window.innerHeight - h - inset,
  };
}

export default function TalkingHead({ enabled = true }: TalkingHeadProps) {
  const { lang, viseme, speaking } = useSpeechFace();
  const blinking = useBlink(speaking);
  // Tilt whenever the head is on screen — keeps idle motion after speech too.
  const { reaction, toggleReactions } = useHeadReaction();
  /** Voice on screen: the speaker, else Nanami for a reaction before any speech. */
  const shownLang: "ja" | "en" | null = lang ?? (reaction ? "ja" : null);
  const idleTilt = useHeadTilt(Boolean(shownLang));
  const reactionStyle = reaction ? REACTION_STYLE[reaction.kind] : null;
  const tiltDeg = reactionStyle?.tiltDeg ? reactionStyle.tiltDeg : idleTilt;
  const { lookFor, cycleLook } = useHeadLook();
  /** Name of a look just switched to — shown briefly under the head. */
  const [lookToast, setLookToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** User's chosen spot (drag); the head returns here whenever it is clear. */
  const [pos, setPos] = useState<HeadPos | null>(() => loadHeadPos());
  /** Temporary spot while the chosen one would cover text. */
  const [autoPos, setAutoPos] = useState<HeadPos | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const autoPosRef = useRef(autoPos);
  autoPosRef.current = autoPos;

  useLayoutEffect(() => {
    if (!enabled || !shownLang) return;

    const tick = () => {
      if (dragRef.current) return;
      const el = rootRef.current;
      if (!el) return;
      const panel = findAvoidPanel();
      if (!panel) return;
      const { width: w, height: h } = el.getBoundingClientRect();
      if (w < 1 || h < 1) return;

      const obstacles = collectObstacles(panel.el, panel.box);
      const priority = collectPriorityObstacles(panel.box);
      const all = priority.length ? [...obstacles, ...priority] : obstacles;
      const home = posRef.current ?? defaultHeadPos(w, h);
      if (isClear(boxAt(home, w, h), all)) {
        if (autoPosRef.current) setAutoPos(null);
        return;
      }
      const current = autoPosRef.current;
      if (current && isClear(boxAt(current, w, h), all)) return;

      const spot = findClearSpot(panel.box, w, h, obstacles, home, priority);
      if (spot && (spot.x !== current?.x || spot.y !== current?.y)) {
        setAutoPos(spot);
      }
    };

    tick();
    const id = window.setInterval(tick, AVOID_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [enabled, shownLang]);

  useEffect(() => {
    const onResize = () => {
      const el = rootRef.current;
      if (!el) return;
      setPos((prev) => {
        if (!prev) return prev;
        const clamped = clampHeadPos(prev.x, prev.y, el);
        saveHeadPos(clamped);
        return clamped;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !pos) return;
    const next = clampHeadPos(pos.x, pos.y, el);
    if (next.x !== pos.x || next.y !== pos.y) {
      setPos(next);
      saveHeadPos(next);
    }
  }, [lang]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  if (!enabled || !shownLang) return null;

  const shown = autoPos ?? pos;
  const look = lookFor(shownLang);
  const expression: Expression = reactionStyle?.expression ?? "neutral";
  const fx = reactionStyle?.fx ?? [];
  const bubble = reaction
    ? reactionLine(shownLang, reaction.kind, reaction.count, reaction.pick)
    : null;
  /** Near the top of the screen the bubble drops below the head instead. */
  const bubbleBelow = Boolean(shown && shown.y < 56);

  const flashToast = (text: string) => {
    setLookToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setLookToast(null), 1400);
  };

  const switchLook = (step: number) => {
    flashToast(cycleLook(shownLang, step).label);
  };

  const onDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    switchLook(e.shiftKey ? -1 : 1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      flashToast(toggleReactions() ? "Reactions on" : "Reactions off");
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    switchLook(e.shiftKey ? -1 : 1);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const start: HeadPos = shown ?? { x: rect.left, y: rect.top };
    setPos(start);
    setAutoPos(null);
    dragRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - start.x,
      offsetY: e.clientY - start.y,
    };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = rootRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !el) return;
    const next = clampHeadPos(
      e.clientX - drag.offsetX,
      e.clientY - drag.offsetY,
      el
    );
    setPos(next);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // already released
    }
    setPos((prev) => {
      if (!prev) return prev;
      saveHeadPos(prev);
      return prev;
    });
  };

  return (
    <div
      ref={rootRef}
      className={[
        "th-root",
        dragging ? "th-dragging" : "",
        shown ? "th-placed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        shown
          ? { left: shown.x, top: shown.y, right: "auto", bottom: "auto" }
          : undefined
      }
      role="button"
      tabIndex={0}
      aria-label={`${shownLang === "ja" ? "Nanami" : "Andrew"} talking head (${look.label}) — drag to move, double-click or Enter to change look, R to toggle reactions`}
      title="Drag to move · double-click for the next look (Shift: previous) · R: reactions on/off"
      aria-grabbed={dragging}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        key={reaction?.id ?? "idle"}
        className={`th-motion${reactionStyle ? ` th-motion--${reactionStyle.motion}` : ""}`}
      >
        {shownLang === "ja" ? (
          <NanamiHead
            viseme={viseme}
            blinking={blinking}
            speaking={speaking}
            tiltDeg={tiltDeg}
            look={look}
            expression={expression}
            fx={fx}
          />
        ) : (
          <AndrewHead
            viseme={viseme}
            blinking={blinking}
            speaking={speaking}
            tiltDeg={tiltDeg}
            look={look}
            expression={expression}
            fx={fx}
          />
        )}
      </div>
      {bubble && (
        <span
          key={`bubble-${reaction?.id}`}
          className={[
            "th-bubble",
            `th-bubble--${reaction?.kind}`,
            bubbleBelow ? "th-bubble--below" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          lang={shownLang}
          aria-live="polite"
        >
          {bubble}
        </span>
      )}
      {lookToast && (
        <span className="th-look-toast" aria-live="polite">
          {lookToast}
        </span>
      )}
    </div>
  );
}
