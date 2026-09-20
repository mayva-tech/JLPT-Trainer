import { useEffect, useRef, useState } from "react";
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

function Mouth({ viseme, lipColor }: { viseme: Viseme; lipColor: string }) {
  const shape = MOUTH[viseme];
  const showTeeth = shape.ry > 3;
  const showTongue = viseme === "TH";

  return (
    <g className="th-mouth">
      <ellipse
        cx="50"
        cy="70"
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
          y={70 - shape.ry + 0.4}
          width={shape.rx * 1.24}
          height={Math.min(2.2, shape.ry * 0.45)}
          rx="0.6"
          fill="#fdfdfa"
        />
      )}
      {showTongue && (
        <ellipse cx="50" cy={70 + shape.ry * 0.35} rx={shape.rx * 0.45} ry="1.2" fill="#c96b74" />
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

function Eyes({ closed, irisColor }: { closed: boolean; irisColor: string }) {
  if (closed) {
    return (
      <g stroke="#2b2118" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M34 50 q5 3 10 0" />
        <path d="M56 50 q5 3 10 0" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="39" cy="50" rx="4.6" ry="5.2" fill="#fdfdfa" />
      <ellipse cx="61" cy="50" rx="4.6" ry="5.2" fill="#fdfdfa" />
      <circle cx="39.5" cy="50.4" r="2.7" fill={irisColor} />
      <circle cx="61.5" cy="50.4" r="2.7" fill={irisColor} />
      <circle cx="40.4" cy="49.3" r="0.9" fill="#fff" />
      <circle cx="62.4" cy="49.3" r="0.9" fill="#fff" />
    </g>
  );
}

interface HeadProps {
  viseme: Viseme;
  blinking: boolean;
  speaking: boolean;
}

/** Nanami — the Japanese voice. */
function NanamiHead({ viseme, blinking, speaking }: HeadProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label="Nanami, the Japanese voice"
    >
      {/* hair back */}
      <path d="M20 58 Q18 20 50 18 Q82 20 80 58 L80 92 Q66 84 50 84 Q34 84 20 92 Z" fill="#2f2a33" />
      {/* face */}
      <ellipse cx="50" cy="58" rx="27" ry="31" fill="#f6d9c4" />
      {/* fringe */}
      <path d="M23 46 Q26 22 50 21 Q74 22 77 46 Q66 34 50 35 Q34 34 23 46 Z" fill="#3a333f" />
      <Eyes closed={blinking} irisColor="#5b3a2e" />
      {/* brows */}
      <g stroke="#3a333f" strokeWidth="1.7" strokeLinecap="round" fill="none">
        <path d="M34 42 q5 -2 10 0" />
        <path d="M56 42 q5 -2 10 0" />
      </g>
      {/* nose */}
      <path d="M50 57 q1.5 4 -1 5.5" stroke="#d9ab92" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* blush */}
      <ellipse cx="33" cy="64" rx="4" ry="2.4" fill="#f0a8a0" opacity="0.5" />
      <ellipse cx="67" cy="64" rx="4" ry="2.4" fill="#f0a8a0" opacity="0.5" />
      <Mouth viseme={viseme} lipColor="#c2586a" />
    </svg>
  );
}

/** Andrew — the English voice. */
function AndrewHead({ viseme, blinking, speaking }: HeadProps) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={`th-svg ${speaking ? "th-speaking" : ""}`}
      role="img"
      aria-label="Andrew, the English voice"
    >
      {/* jaw slightly squarer than Nanami's oval */}
      <path
        d="M24 52 Q24 26 50 26 Q76 26 76 52 L76 64 Q76 88 50 90 Q24 88 24 64 Z"
        fill="#f4d8c6"
      />
      {/* hair */}
      <path d="M22 48 Q22 20 50 20 Q78 20 78 48 Q72 36 50 37 Q28 36 22 48 Z" fill="#6b4c33" />
      {/* ears */}
      <ellipse cx="23" cy="60" rx="3.2" ry="4.6" fill="#eec4ad" />
      <ellipse cx="77" cy="60" rx="3.2" ry="4.6" fill="#eec4ad" />
      <Eyes closed={blinking} irisColor="#4a7ba7" />
      {/* heavier brows */}
      <g stroke="#6b4c33" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M33 41 q6 -2.5 11 0.5" />
        <path d="M56 41.5 q5 -3 11 -0.5" />
      </g>
      {/* nose */}
      <path d="M50 56 q2 5 -1.5 6.5" stroke="#dda488" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* warmth at the cheeks — a fair complexion reads flat without it */}
      <ellipse cx="32" cy="63" rx="4" ry="2.2" fill="#e8907f" opacity="0.18" />
      <ellipse cx="68" cy="63" rx="4" ry="2.2" fill="#e8907f" opacity="0.18" />
      <Mouth viseme={viseme} lipColor="#b25f64" />
    </svg>
  );
}

export interface TalkingHeadProps {
  /** Hide entirely — for users who find the animation distracting. */
  enabled?: boolean;
}

export default function TalkingHead({ enabled = true }: TalkingHeadProps) {
  const { lang, viseme, speaking } = useSpeechFace();
  const blinking = useBlink(speaking);

  if (!enabled || !lang) return null;

  return (
    <div className="th-root" aria-hidden={!speaking}>
      {lang === "ja" ? (
        <NanamiHead viseme={viseme} blinking={blinking} speaking={speaking} />
      ) : (
        <AndrewHead viseme={viseme} blinking={blinking} speaking={speaking} />
      )}
      <span className="th-name">{lang === "ja" ? "ナナミ" : "Andrew"}</span>
    </div>
  );
}
