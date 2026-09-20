import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useSpeechFace } from "../../hooks/useSpeechFace";
import type { Viseme } from "../../utils/visemes";
import "./talking-head.css";

/**
 * Talking heads for the two voices: Nanami (ja) and Andrew (en).
 *
 * Mounted once, near the app root — it listens to the global speech bus, so it
 * animates for every trainer, the player and the quest without any of them
 * wiring it up. It renders nothing at all while nothing is speaking.
 *
 * Drawn as flat vector portraits rather than attempts at realism: a stylised
 * face reads clearly at 96px and, unlike a realistic one, does not fall into
 * the uncanny valley when the mouth timing is approximate — which, for
 * English, it unavoidably is.
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
 * while speaking.
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

/** Random gaze drifts within the sclera, often returning to center. */
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
}

/** Nanami — the Japanese voice (kimono portrait). */
function NanamiEyes({ irisColor, active }: { irisColor: string; active: boolean }) {
  const closed = useLiveBlink(active);
  const { dx, dy } = useGaze(active);

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

function NanamiHead({ viseme, speaking, tiltDeg }: HeadProps) {
  const tiltStyle = { transform: `rotate(${tiltDeg.toFixed(2)}deg)` };
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label="Nanami, the Japanese voice"
    >
      {/* hair mass behind — tilts with the head, drawn under the kimono */}
      <g className="th-head-tilt" style={tiltStyle}>
        <ellipse cx="50" cy="42" rx="34" ry="36" fill="#2c252c" />
        <ellipse cx="50" cy="28" rx="28" ry="18" fill="#241e24" />
      </g>
      {/* kimono + collar stay planted */}
      <path
        d="M18 110 Q24 84 38 80 Q50 86 62 80 Q76 84 82 110 Z"
        fill="#c43a2f"
      />
      <g>
        <circle cx="32" cy="98" r="4.2" fill="#f7f2ea" />
        <circle cx="32" cy="98" r="1.6" fill="#e8c84a" />
        <circle cx="28" cy="94" r="1.8" fill="#f7f2ea" />
        <circle cx="36" cy="94" r="1.8" fill="#f7f2ea" />
        <circle cx="28" cy="102" r="1.6" fill="#f7f2ea" />
        <circle cx="36" cy="102" r="1.6" fill="#f7f2ea" />
      </g>
      <g>
        <circle cx="68" cy="97" r="3.6" fill="#7ec8d8" />
        <circle cx="68" cy="97" r="1.4" fill="#f7f2ea" />
        <circle cx="64" cy="93" r="1.5" fill="#7ec8d8" />
        <circle cx="72" cy="93" r="1.5" fill="#7ec8d8" />
      </g>
      <circle cx="54" cy="105" r="2.0" fill="#e8a0a8" />
      <circle cx="76" cy="106" r="1.6" fill="#e8a0a8" />
      <path
        d="M41 82 L44 94 Q50 100 56 94 L59 82 Q50 90 41 82 Z"
        fill="#f3eee6"
      />
      <path
        d="M39 80 L42 90 Q50 96 58 90 L61 80 Q50 88 39 80 Z"
        fill="#1a5c56"
      />
      <path
        d="M37 78 L40 86 Q50 92 60 86 L63 78 Q50 86 37 78 Z"
        fill="#b83228"
      />
      {/* face + neck tilt around the collar line */}
      <g className="th-head-tilt" style={tiltStyle}>
        <path d="M43 70 L43 86 Q50 90 57 86 L57 70 Z" fill="#d9ab86" />
        <ellipse cx="50" cy="80" rx="5.5" ry="1.8" fill="#c8946e" opacity="0.4" />
        <ellipse cx="24" cy="56" rx="3.2" ry="4.8" fill="#d4a07e" />
        <ellipse cx="76" cy="56" rx="3.2" ry="4.8" fill="#d4a07e" />
        <ellipse cx="50" cy="54" rx="25" ry="29" fill="#e0b894" />
        <ellipse cx="34" cy="62" rx="4.2" ry="2.4" fill="#e09080" opacity="0.4" />
        <ellipse cx="66" cy="62" rx="4.2" ry="2.4" fill="#e09080" opacity="0.4" />
        <path
          d="M25 50
             Q22 20 50 16
             Q78 20 75 50
             Q68 34 50 32
             Q32 34 25 50 Z"
          fill="#322b32"
        />
        <path
          d="M26 46
             Q38 30 56 28
             Q70 28 76 42
             Q64 36 48 38
             Q34 42 26 46 Z"
          fill="#2a232a"
        />
        <path
          d="M38 26 Q48 22 60 26"
          stroke="#1a151a"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <g stroke="#3a2a22" strokeWidth="1.9" strokeLinecap="round" fill="none">
          <path d="M32 40 q7 -2.6 14 0.2" />
          <path d="M54 40.2 q7 -2.6 14 0.2" />
        </g>
        <NanamiEyes irisColor="#4a2c22" active={speaking} />
        <path
          d="M48.5 58 q1.5 4 3 0"
          stroke="#c8946e"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <Mouth viseme={viseme} lipColor="#a84858" cy={67} />
      </g>
    </svg>
  );
}

/** Andrew — the English voice (andrew2 portrait). */
function AndrewEyes({ irisColor, active }: { irisColor: string; active: boolean }) {
  const closed = useLiveBlink(active);
  const { dx, dy } = useGaze(active);

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

function AndrewHead({ viseme, speaking, tiltDeg }: HeadProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label="Andrew, the English voice"
    >
      {/* charcoal crew-neck + shoulders stay planted */}
      <path
        d="M30 108 Q32 96 42 92 Q50 97 58 92 Q68 96 70 108 Z"
        fill="#6b6560"
      />
      {/* head + neck tilt around the collar */}
      <g
        className="th-head-tilt"
        style={{ transform: `rotate(${tiltDeg.toFixed(2)}deg)` }}
      >
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
        <path
          d="M30 52
             Q28 70 36 84
             Q44 94 50 94
             Q56 94 64 84
             Q72 70 70 52
             Q68 60 62 62
             Q56 64 50 64
             Q44 64 38 62
             Q32 60 30 52 Z"
          fill="#c9a15e"
        />
        <path
          d="M46 72 Q50 69 54 72 Q50 76 46 72 Z"
          fill="#edd0b0"
        />
        <ellipse cx="36" cy="58" rx="4.5" ry="2.8" fill="#e8a090" opacity="0.4" />
        <ellipse cx="64" cy="58" rx="4.5" ry="2.8" fill="#e8a090" opacity="0.4" />
        <g stroke="#b8925a" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M32 40 q7 -3.5 13 0.2" />
          <path d="M55 40.2 q6 -3.5 13 0.2" />
        </g>
        <AndrewEyes irisColor="#7a8f6a" active={speaking} />
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
        <path
          d="M50 63
             Q42 60 36 62
             Q34 65 38 66.5
             Q44 68 50 66.5
             Q56 68 62 66.5
             Q66 65 64 62
             Q58 60 50 63 Z"
          fill="#c9a15e"
        />
        <Mouth viseme={viseme} lipColor="#b56860" />
        <path
          d="M68 38
             C72 28, 70 16, 60 10
             C50 3, 36 2, 28 10
             C22 16, 24 26, 28 34
             C32 28, 42 24, 52 26
             C60 28, 65 33, 68 38 Z"
          fill="#c9a15e"
        />
        <path
          d="M60 16 Q50 10 38 12"
          stroke="#b8925a"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M62 24 Q50 18 34 22"
          stroke="#b8925a"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M58 12
             C50 5, 38 5, 30 12
             C34 8, 44 7, 52 11
             C55 12, 57 12, 58 12 Z"
          fill="#d4b06e"
        />
      </g>
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

export default function TalkingHead({ enabled = true }: TalkingHeadProps) {
  const { lang, viseme, speaking } = useSpeechFace();
  const blinking = useBlink(speaking);
  // Tilt whenever the head is on screen — keeps idle motion after speech too.
  const tiltDeg = useHeadTilt(Boolean(lang));
  const rootRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<HeadPos | null>(() => loadHeadPos());
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

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

  if (!enabled || !lang) return null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const start: HeadPos = pos ?? { x: rect.left, y: rect.top };
    if (!pos) {
      setPos(start);
    }
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
        pos ? "th-placed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        pos
          ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
          : undefined
      }
      role="button"
      tabIndex={0}
      aria-label={`${lang === "ja" ? "Nanami" : "Andrew"} talking head — drag to move`}
      aria-grabbed={dragging}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {lang === "ja" ? (
        <NanamiHead
          viseme={viseme}
          blinking={blinking}
          speaking={speaking}
          tiltDeg={tiltDeg}
        />
      ) : (
        <AndrewHead
          viseme={viseme}
          blinking={blinking}
          speaking={speaking}
          tiltDeg={tiltDeg}
        />
      )}
    </div>
  );
}
