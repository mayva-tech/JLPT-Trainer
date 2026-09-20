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
      {/* neck and shoulders */}
      <path d="M40 84 L40 96 Q50 101 60 96 L60 84 Z" fill="#dda87c" />
      <path d="M28 110 Q30 98 42 94 Q50 99 58 94 Q70 98 72 110 Z" fill="#e9dcc9" />
      {/* ears */}
      <ellipse cx="24" cy="60" rx="4" ry="5.4" fill="#e3ab7e" />
      <ellipse cx="76" cy="60" rx="4" ry="5.4" fill="#e3ab7e" />
      {/* face */}
      <path
        d="M26 50 Q26 25 50 25 Q74 25 74 50 L74 62 Q74 86 50 90 Q26 86 26 62 Z"
        fill="#eec096"
      />
      {/* beard — wraps the jaw and rises to meet the sideburns. The mouth is
          drawn after this, so the lips sit inside the beard rather than under it. */}
      <path
        d="M25 50 Q23 74 33 86 Q41 93 50 93 Q59 93 67 86 Q77 74 75 50
           Q72 62 64 64 Q57 66 50 66 Q43 66 36 64 Q28 62 25 50 Z"
        fill="#d79a44"
      />
      {/* beard shadow along the jaw edge, for depth */}
      <path
        d="M33 86 Q41 93 50 93 Q59 93 67 86 Q58 89 50 89 Q42 89 33 86 Z"
        fill="#bd8236"
        opacity="0.55"
      />
      {/* cheeks */}
      <ellipse cx="33" cy="58" rx="5" ry="3" fill="#e08a6e" opacity="0.32" />
      <ellipse cx="67" cy="58" rx="5" ry="3" fill="#e08a6e" opacity="0.32" />
      {/* brows */}
      <g stroke="#b8792d" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M32 42 q7 -4 13 -0.5" />
        <path d="M55 41.5 q6 -3.5 13 0.5" />
      </g>
      <Eyes closed={blinking} irisColor="#6d9464" />
      {/* nose */}
      <path
        d="M50 52 q3 7 -1 9"
        stroke="#d39a6e"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* moustache — sits above the mouth so the mouth stays fully visible */}
      <path
        d="M50 63 Q44 58 38 60 Q35 63 37 65 Q43 66 50 64.5 Q57 66 63 65 Q65 63 62 60 Q56 58 50 63 Z"
        fill="#c78c37"
      />
      <Mouth viseme={viseme} lipColor="#b35f57" />
      {/* hair — asymmetric on purpose: low at the left temple, rising across
          the head and flicking up to the right, which is what makes it read as
          a swept quiff rather than a rounded cap */}
      <path
        d="M26 50
           C24 37, 26 27, 33 21
           C42 13, 55 8, 65 11
           C73 14, 76 23, 75 37
           C75 42, 75 46, 75 50
           C72 36, 65 31, 55 30
           C46 29, 39 33, 35 39
           C33 42, 31 46, 26 50 Z"
        fill="#e0a845"
      />
      {/* the crest, lifted clear of the silhouette at the front */}
      <path
        d="M33 23
           C39 10, 55 3, 66 8
           C72 11, 75 17, 74 22
           C70 14, 58 10, 48 15
           C41 18, 36 21, 33 23 Z"
        fill="#e8b14e"
      />
      {/* lit edge riding the top of the sweep */}
      <path
        d="M38 19
           C44 10, 57 5, 66 10
           C70 12, 72 15, 72 18
           C66 12, 55 11, 47 16
           C43 17, 40 18, 38 19 Z"
        fill="#f2c76a"
      />
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
