import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useSpeechFace } from "../../hooks/useSpeechFace";
import type { Viseme } from "../../utils/visemes";
import type { HeadLook } from "./looks";
import { useHeadLook } from "./useHeadLook";
import { useHeadReaction } from "./useHeadReaction";
import { useAizuchi, useDuoAttention, useDuoMode } from "./useDuoMode";
import {
  DUO_ORDER,
  facingSign,
  gazeBias,
  seatRole,
  tiltBias,
  type SeatRole,
  type Voice,
} from "./duo";
import type { HeadReactionEvent } from "../../services/reactionBus";
import type { SceneProp } from "../../services/sceneBus";
import { useStageScene } from "./useStageScene";
import { useHeadCostume } from "./useHeadCostume";
import { costumeLookFor } from "./costumeLook";
import { costumeById } from "./costumes";
import { getHeadStyle, subscribeHeadStyle } from "./headStyleStore";
import { SceneBackdropArt } from "./backdrops";
import { CupProp, PhoneProp } from "./props";
import { SCENE_LABELS } from "./scenes";
import SenseiMascot from "../Sensei/SenseiMascot";
import { getSenseiSettings, setSenseiSettings } from "../../services/senseiBus";
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
 * facial hair, clothing and accessories. Separate Nanami / Andrew look buttons
 * sit in the Player's control bar (HeadStyleButtons; Shift-click: previous);
 * Enter on the head does the same for the speaker. Remembered per voice.
 *
 * Reactions: answer checks report through services/reactionBus, and the head
 * answers with an expression (brows, a held mouth, happy eyes), a small head
 * motion, manga-style effects and a one-line speech bubble. Focus the head
 * and press R to switch reactions off/on (remembered).
 *
 * Duo: when both voices speak within a short window (a JA line and its EN
 * translation), Nanami and Andrew share the stage and face each other — the
 * speaker animates, the listener turns toward them and nods (aizuchi).
 * Press D with the head focused to switch duo off/on (remembered).
 *
 * Scenes: a trainer declares where the conversation happens (useHeadScene);
 * the stage shows that backdrop with its name in Japanese, and the heads hold
 * the scene's prop (a phone to the ear, a coffee cup). B toggles scenes.
 *
 * The mascot sensei (tanuki / neko) is mounted alongside the head so it
 * rides on the same single shell mount. M toggles it from the head.
 *
 * Costumes: each head's hanger button in the Player bar opens a menu of six
 * original costumes (mecha suit, samurai armour, shinobi, idol stage outfit,
 * kigurumi, RPG hero), worn over the chosen look while the face keeps
 * lip-syncing. Mecha reveals with a face shutter, the others out of a poof
 * cloud, each with its own sound. On the head, A takes the speaker's costume
 * off / puts the last one back; Shift+A moves to the next. Remembered per
 * head; off by default.
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
        if (Math.random() < 0.25) {
          setGaze({ dx: 0, dy: 0 });
        } else {
          setGaze({
            dx: (Math.random() - 0.5) * 4.0,
            dy: (Math.random() - 0.5) * 2.6,
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
  /** Horizontal gaze bias toward the partner in duo; 0 when solo. */
  lookX?: number;
  /** Vertical gaze bias toward the partner when the pair is split apart. */
  lookY?: number;
  /** Hand-held prop from the scene, if any. */
  prop?: SceneProp;
  /** Which side the prop is held on (viewer's left/right). */
  propSide?: "l" | "r";
}

const NANAMI_SKIN = { skin: "#e0b894", shade: "#d4a07e" };
const ANDREW_SKIN = { skin: "#edd0b0", shade: "#e3b48f" };

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
  lookX = 0,
  lookY = 0,
}: {
  irisColor: string;
  active: boolean;
  happy?: boolean;
  /** Steady gaze bias (duo: look at the partner). */
  lookX?: number;
  lookY?: number;
}) {
  const closed = useLiveBlink(active);
  const gaze = useGaze(active);
  const dx = lookX ? gaze.dx * 0.5 + lookX : gaze.dx;
  const dy = lookY ? gaze.dy * 0.5 + lookY : gaze.dy;

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
  lookX = 0,
  lookY = 0,
  prop,
  propSide = "l",
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
        <NanamiEyes
          irisColor="#4a2c22"
          active
          happy={expression === "joy"}
          lookX={lookX}
          lookY={lookY}
        />
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
        {prop === "phone" && <PhoneProp side={propSide} earX={24} skin={NANAMI_SKIN} />}
        <HeadFx fx={fx} cheekY={62} cheekX={[34, 66]} />
      </g>
      <Layers layer="collar" />
      {prop === "cup" && <CupProp side={propSide} skin={NANAMI_SKIN} />}
      <AroundFx fx={fx} />
    </svg>
  );
}

/** Andrew — the English voice (andrew2 portrait). */
function AndrewEyes({
  irisColor,
  active,
  happy = false,
  lookX = 0,
  lookY = 0,
}: {
  irisColor: string;
  active: boolean;
  happy?: boolean;
  /** Steady gaze bias (duo: look at the partner). */
  lookX?: number;
  lookY?: number;
}) {
  const closed = useLiveBlink(active);
  const gaze = useGaze(active);
  const dx = lookX ? gaze.dx * 0.5 + lookX : gaze.dx;
  const dy = lookY ? gaze.dy * 0.5 + lookY : gaze.dy;

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
  lookX = 0,
  lookY = 0,
  prop,
  propSide = "r",
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
        <AndrewEyes
          irisColor="#7a8f6a"
          active
          happy={expression === "joy"}
          lookX={lookX}
          lookY={lookY}
        />
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
        {prop === "phone" && <PhoneProp side={propSide} earX={27} skin={ANDREW_SKIN} />}
        <HeadFx fx={fx} cheekY={58} cheekX={[36, 64]} />
      </g>
      <Layers layer="collar" />
      {prop === "cup" && <CupProp side={propSide} skin={ANDREW_SKIN} />}
      <AroundFx fx={fx} />
    </svg>
  );
}

const VOICE_NAME: Record<Voice, string> = { ja: "Nanami", en: "Andrew" };

/** One head on the stage — solo, or one of the duo pair. */
function Seat({
  voice,
  role,
  look,
  viseme,
  speakingNow,
  idleTilt,
  reaction,
  toward,
  splitAt,
  prop,
  suitReveal = false,
  toast,
}: {
  voice: Voice;
  role: SeatRole;
  prop?: SceneProp;
  /** Just put on a costume: play its reveal (shutter or poof) once. */
  suitReveal?: boolean;
  /** This head's look / costume change, named just under it. */
  toast?: string;
  look: HeadLook;
  viseme: Viseme;
  speakingNow: boolean;
  idleTilt: number;
  reaction: HeadReactionEvent | null;
  /** Unit direction to the partner; defaults to side by side. */
  toward?: { x: number; y: number };
  /** Own fixed spot when the pair has split up to avoid text. */
  splitAt?: HeadPos;
}) {
  const nods = useAizuchi(role === "listening");
  const attending = useDuoAttention(role);
  const dir = toward ?? { x: facingSign(voice), y: 0 };
  const style = reaction ? REACTION_STYLE[reaction.kind] : null;
  const talking = role === "speaking" || (role === "solo" && speakingNow);
  const tilt = style?.tiltDeg
    ? style.tiltDeg * (role === "solo" ? 1 : dir.x < 0 ? -1 : 1)
    : idleTilt * (role === "listening" ? 0.4 : 1) +
      tiltBias(role, voice, dir.x) * (attending ? 1 : 0.4);
  const nodding = !reaction && role === "listening" && nods > 0;
  const motionKey = reaction ? `r${reaction.id}` : nodding ? `n${nods}` : "idle";
  const motionClass = style
    ? ` th-motion--${style.motion}`
    : nodding
      ? " th-motion--aizuchi"
      : "";
  const Head = voice === "ja" ? NanamiHead : AndrewHead;
  return (
    <div
      className={`th-seat th-seat--${role}${splitAt ? " th-seat--split" : ""}${suitReveal ? " th-seat--suit-reveal" : ""}`}
      style={splitAt ? { left: splitAt.x, top: splitAt.y } : undefined}
      data-voice={voice}
    >
      <div key={motionKey} className={`th-motion${motionClass}`}>
        <Head
          viseme={talking ? viseme : "rest"}
          blinking={false}
          speaking={talking}
          tiltDeg={tilt}
          look={look}
          expression={style?.expression ?? "neutral"}
          fx={style?.fx ?? []}
          lookX={attending ? gazeBias(role, voice, dir.x) : 0}
          lookY={attending ? gazeBias(role, voice, dir.y) * 0.7 : 0}
          prop={prop}
          propSide={voice === "ja" ? "l" : "r"}
        />
      </div>
      {toast && (
        <span className="th-look-toast" aria-live="polite">
          {toast}
        </span>
      )}
    </div>
  );
}

const HAS_KANJI = /[\u4e00-\u9fff]/;

/** Backdrop card behind the stage, with the place name as a mini vocab tag. */
function SceneCard({ backdrop }: { backdrop: keyof typeof SCENE_LABELS }) {
  const label = SCENE_LABELS[backdrop];
  return (
    <div key={backdrop} className={`th-backdrop th-backdrop--${backdrop}`} aria-hidden="true">
      <SceneBackdropArt backdrop={backdrop} />
      <span className="th-scene-tag" lang="ja" title={label.en}>
        {HAS_KANJI.test(label.ja) ? (
          <ruby>
            {label.ja}
            <rt>{label.reading}</rt>
          </ruby>
        ) : (
          label.ja
        )}
      </span>
    </div>
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
/**
 * Panels being read without karaoke marks. Naming them limits what the head
 * must keep clear to these plus Japanese, instead of every line on the page.
 */
const PRIORITY_SELECTOR =
  ".lesson-nuance--active, .ss-card--playing, .ss-mini--playing, .ss-shift-item--playing";
/** Karaoke marks inside the line being read; their whole line block is kept uncovered. */
const READING_MARK_SELECTOR = ".speech-active, .speech-spoken";
const READING_BLOCK_SELECTOR = ".jp-wrap, .speech-line";
const SENSEI_SPEAKING_SELECTOR = ".sensei-bubble--speaking";
/** The pitch line drawing itself along with the spoken word or phrase. */
const READING_PITCH_SELECTOR = ".pa-play";
/** Duo root width over a single head's (228/120, 164/85 on phones). */
const DUO_WIDTH_RATIO = 1.9;
/** Chance the pair splits up even when both would fit together. */
const SPLIT_CHANCE = 0.35;
/** Sizes tried, largest first, when no full-size spot clears Japanese and the line being read. */
const FIT_SCALES = [0.75, 0.6, 0.45] as const;

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

/** The panel the head must stay inside: the Player stage or Shorts frame, else the trainer view. */
function findAvoidPanel(): { el: HTMLElement; box: Box } | null {
  const stage = document.querySelector<HTMLElement>(".stage, .sh-stage");
  const el =
    stage && stage.getBoundingClientRect().width > 0
      ? stage
      : document.querySelector<HTMLElement>(".app-view:not(.app-view--hidden)");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  // Inner box, so the heads never sit under the panel's own scrollbars.
  const innerRight = el.clientWidth ? r.left + el.clientLeft + el.clientWidth : r.right;
  const innerBottom = el.clientHeight ? r.top + el.clientTop + el.clientHeight : r.bottom;
  const viewRight = document.documentElement.clientWidth || window.innerWidth;
  const viewBottom = document.documentElement.clientHeight || window.innerHeight;
  return {
    el,
    box: {
      left: Math.max(0, r.left),
      top: Math.max(0, r.top),
      right: Math.min(viewRight, innerRight),
      bottom: Math.min(viewBottom, innerBottom),
    },
  };
}

function padBox(b: Box): Box {
  return {
    left: b.left - AVOID_PAD,
    top: b.top - AVOID_PAD,
    right: b.right + AVOID_PAD,
    bottom: b.bottom + AVOID_PAD,
  };
}

function insidePanel(box: Box, panel: Box): boolean {
  return (
    box.left >= panel.left + 2 &&
    box.top >= panel.top + 2 &&
    box.right <= panel.right - 2 &&
    box.bottom <= panel.bottom - 2
  );
}

/** Kana, kanji (incl. 々〆), half-width katakana and the long-vowel mark. */
const JAPANESE_RUN = /[\u3005\u3006\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]+/gu;
/**
 * Never covered, like Japanese text: Japanese drawn as SVG (one word's pitch
 * drawing, each stroke-order kanji) and anything a page marks with
 * `data-head-avoid` — e.g. the object picture on an Everyday Japanese card.
 */
const PITCH_FIGURE_SELECTOR = ".pa-figure, .ks-char, [data-head-avoid]";

type Obstacles = {
  /** Every visible text line plus the fixed control bars (soft: least overlap). */
  all: Box[];
  /** Japanese characters and pitch drawings — never covered at any time. */
  japanese: Box[];
};

/** Visible text line boxes inside the panel, plus the fixed control bars. */
function collectObstacles(panelEl: HTMLElement, panel: Box): Obstacles {
  const all: Box[] = [];
  const japanese: Box[] = [];
  const keep = (r: DOMRect | Box, into: Box[]) => {
    if (r.right - r.left < 1 || r.bottom - r.top < 1 || !boxesIntersect(r, panel)) return;
    into.push(padBox(r));
  };

  const walker = document.createTreeWalker(panelEl, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const visibleCache = new Map<Element, boolean>();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    if (!text.trim()) continue;
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
    for (const r of range.getClientRects?.() ?? []) keep(r, all);
    // Only the Japanese runs of mixed text, so an English line quoting one
    // word doesn't wall off the whole line.
    for (const m of text.matchAll(JAPANESE_RUN)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      for (const r of range.getClientRects?.() ?? []) keep(r, japanese);
    }
  }

  panelEl.querySelectorAll(PITCH_FIGURE_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect();
    keep(r, all);
    keep(r, japanese);
  });
  // Typed answers and placeholders aren't text nodes.
  panelEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((el) => {
    const text = `${el.value} ${el.placeholder}`;
    if (!text.trim()) return;
    const r = el.getBoundingClientRect();
    keep(r, all);
    JAPANESE_RUN.lastIndex = 0;
    if (JAPANESE_RUN.test(text)) keep(r, japanese);
  });

  document
    .querySelectorAll<HTMLElement>(
      ".nav-bar, .production-panel, .lesson-picture, .sensei--peek .sensei-slot, .sensei--up .sensei-slot, .sensei-bubble, .sensei-tab"
    )
    .forEach((bar) => {
      const r = bar.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) all.push(padBox(r));
    });
  return { all, japanese };
}

/**
 * What is being read aloud right now — the active Nuance text, the JA or EN
 * line with karaoke marks, the pitch line drawing along — never cover these.
 */
function collectPriorityObstacles(panel: Box): Box[] {
  const blocks = new Set<Element>(document.querySelectorAll(PRIORITY_SELECTOR));
  document.querySelectorAll(READING_MARK_SELECTOR).forEach((mark) => {
    const block = mark.closest(READING_BLOCK_SELECTOR);
    if (block) blocks.add(block);
  });

  const out: Box[] = [];
  const add = (r: DOMRect | Box) => {
    if (r.right - r.left < 1 || r.bottom - r.top < 1 || !boxesIntersect(r, panel)) return;
    out.push(padBox(r));
  };
  document.querySelectorAll(READING_PITCH_SELECTOR).forEach((el) => add(el.getBoundingClientRect()));
  // A centred multi-line sentence or the wide Nuance box spans nearly the
  // whole stage, leaving no clear spot; guard their actual text line boxes so
  // the empty space beside shorter lines stays usable.
  const range = document.createRange();
  blocks.forEach((block) => {
    const before = out.length;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue;
      range.selectNodeContents(node);
      const rects = range.getClientRects?.();
      if (rects) for (const r of rects) add(r);
    }
    if (out.length === before) add(block.getBoundingClientRect());
  });
  return out;
}

function isClear(box: Box, obstacles: Box[]): boolean {
  return !obstacles.some((o) => boxesIntersect(box, o));
}

/**
 * Spot inside `panel` that covers no text: the nearest to `prefer`, or a
 * random clear one when `rng` is given. Falls back to the least-overlapping
 * spot when the panel is packed, always keeping `priority` boxes uncovered if
 * any spot allows it.
 */
function findClearSpot(
  panel: Box,
  w: number,
  h: number,
  obstacles: Box[],
  prefer: HeadPos,
  priority: Box[] = [],
  rng?: () => number
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
  const clear: HeadPos[] = [];
  for (const y of ys) {
    for (const x of xs) {
      const box = { left: x, top: y, right: x + w, bottom: y + h };
      let overlap = 0;
      for (const o of obstacles) overlap += overlapArea(box, o);
      let covered = 0;
      for (const p of priority) covered += overlapArea(box, p);
      if (rng && overlap === 0 && covered === 0) clear.push({ x, y });
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
  if (rng && clear.length) return clear[Math.floor(rng() * clear.length)];
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
  // Tilt whenever the head is on screen — keeps idle motion after speech too.
  const { reaction, toggleReactions } = useHeadReaction();
  /** Voice on screen: the speaker, else Nanami for a reaction before any speech. */
  const shownLang: "ja" | "en" | null = lang ?? (reaction ? "ja" : null);
  const idleTilt = useHeadTilt(Boolean(shownLang));
  const { duo, toggleDuo } = useDuoMode(lang, speaking);
  const { scene, toggleScenes } = useStageScene();
  const { lookFor: chosenLook, cycleLook } = useHeadLook();
  const { costume, revealing, toggle: toggleCostume, cycle: cycleCostume } = useHeadCostume();
  const lookFor = (voice: Voice) => {
    const worn = costumeById(costume[voice]);
    return worn ? costumeLookFor(worn, voice, chosenLook(voice)) : chosenLook(voice);
  };
  /** Name of a look just switched to — shown briefly under the head. */
  const [lookToast, setLookToast] = useState<{ text: string; voice: Voice | null } | null>(null);
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
  /** Andrew's own spot while the duo has split up; Nanami then uses autoPos. */
  const [split, setSplit] = useState<{ en: HeadPos } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const autoPosRef = useRef(autoPos);
  autoPosRef.current = autoPos;
  const splitRef = useRef(split);
  splitRef.current = split;
  /** A scene card is one picture behind the pair, so they stay together on it. */
  const canSplit = duo && !scene;
  const canSplitRef = useRef(canSplit);
  canSplitRef.current = canSplit;
  /** Scale while shrunk into a gap clear of Japanese / the line being read (1 = full size). */
  const [fit, setFit] = useState(1);
  const fitRef = useRef(fit);
  fitRef.current = fit;
  /** Faded out: no spot at any size keeps Japanese and the line being read uncovered. */
  const [yielding, setYielding] = useState(false);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useLayoutEffect(() => {
    if (!enabled || !shownLang) return;

    const tick = () => {
      if (dragRef.current) return;
      // The mascot reading its tip is not lesson text: keep the heads' size and spot.
      if (document.querySelector(SENSEI_SPEAKING_SELECTOR)) return;
      const el = rootRef.current;
      if (!el) return;
      const panel = findAvoidPanel();
      if (!panel) return;
      // Measure the full-size head even while it is shrunk to fit.
      const rect = el.getBoundingClientRect();
      const w = rect.width / fitRef.current;
      const h = rect.height / fitRef.current;
      if (w < 1 || h < 1) return;

      const { all: obstacles, japanese } = collectObstacles(panel.el, panel.box);
      const reading = collectPriorityObstacles(panel.box);
      /** Never covered when any spot allows: the line being read and all Japanese. */
      const priority = reading.length || japanese.length ? [...reading, ...japanese] : reading;
      const all = reading.length ? [...obstacles, ...reading] : obstacles;
      const fits = (p: HeadPos, bw: number, bh: number, extra?: Box) => {
        const b = boxAt(p, bw, bh);
        return (
          insidePanel(b, panel.box) &&
          isClear(b, all) &&
          (!extra || !boxesIntersect(b, extra))
        );
      };
      const current = autoPosRef.current;
      const apart = splitRef.current;

      if (apart && !canSplitRef.current) {
        setSplit(null);
        return;
      }

      // Japanese text and the line being read must stay uncovered — any
      // visible text while speech has no karaoke marks. Other text only
      // costs overlap. A full-size layout is used only when it keeps these
      // clear; otherwise the pair shrinks into a gap, and as a last resort
      // fades out until there is room.
      const guarded = reading.length
        ? priority
        : speakingRef.current
          ? obstacles
          : japanese;
      const covers = (p: HeadPos, bw: number, bh: number) => {
        const b = boxAt(p, bw, bh);
        return guarded.some((o) => boxesIntersect(b, o));
      };

      const placeFullSize = (): boolean => {
        // Split: the root holds Nanami alone (w = one head), Andrew sits apart.
        // Both heads are checked every tick, so one can't hide behind the other.
        if (apart) {
          const pairW = w * DUO_WIDTH_RATIO;
          const home = posRef.current ?? defaultHeadPos(pairW, h);
          if (fits(home, pairW, h)) {
            setSplit(null);
            setAutoPos(null);
            return true;
          }
          let ja = current ?? home;
          const enBox = padBox(boxAt(apart.en, w, h));
          if (!fits(ja, w, h, enBox)) {
            const spot = findClearSpot(panel.box, w, h, [...obstacles, enBox], ja, priority, Math.random);
            if (!spot || covers(spot, w, h)) return false;
            ja = spot;
            setAutoPos(spot);
          }
          const jaBox = padBox(boxAt(ja, w, h));
          if (!fits(apart.en, w, h, jaBox)) {
            const spot = findClearSpot(panel.box, w, h, [...obstacles, jaBox], apart.en, priority, Math.random);
            if (!spot || covers(spot, w, h)) return false;
            setSplit({ en: spot });
          }
          return true;
        }

        const home = posRef.current ?? defaultHeadPos(w, h);
        if (fits(home, w, h)) {
          if (current) setAutoPos(null);
          return true;
        }
        if (current && fits(current, w, h)) return true;

        const spot = findClearSpot(panel.box, w, h, obstacles, home, priority, Math.random);
        const pairFits = Boolean(spot && fits(spot, w, h));
        // Stuck, or now and then for variety: seat the two heads apart.
        if (canSplitRef.current && (!pairFits || Math.random() < SPLIT_CHANCE)) {
          const sw = w / DUO_WIDTH_RATIO;
          const ja = findClearSpot(panel.box, sw, h, obstacles, home, priority, Math.random);
          if (ja && fits(ja, sw, h)) {
            const jaBox = padBox(boxAt(ja, sw, h));
            const en = findClearSpot(panel.box, sw, h, [...obstacles, jaBox], home, priority, Math.random);
            if (en && fits(en, sw, h, jaBox)) {
              setAutoPos(ja);
              setSplit({ en });
              return true;
            }
          }
        }
        if (!spot || covers(spot, w, h)) return false;
        if (spot.x !== current?.x || spot.y !== current?.y) setAutoPos(spot);
        return true;
      };

      if (placeFullSize()) {
        if (fitRef.current !== 1) setFit(1);
        setYielding(false);
        return;
      }

      const prefer = current ?? posRef.current ?? defaultHeadPos(w, h);
      const fullW = apart ? w * DUO_WIDTH_RATIO : w;
      if (apart) setSplit(null);
      for (const s of FIT_SCALES) {
        const spot = findClearSpot(panel.box, fullW * s, h * s, obstacles, prefer, priority);
        if (spot && !covers(spot, fullW * s, h * s)) {
          setFit(s);
          setYielding(false);
          if (spot.x !== current?.x || spot.y !== current?.y) setAutoPos(spot);
          return;
        }
      }
      setYielding(true);
    };

    tick();
    const id = window.setInterval(tick, AVOID_INTERVAL_MS);
    // A new card can put text under the head; re-check on the next frame
    // instead of waiting for the interval. Karaoke class flips are attribute
    // changes, so they don't trigger this.
    let frame = 0;
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        tick();
      });
    };
    const observed = findAvoidPanel()?.el;
    const watcher = observed ? new MutationObserver(soon) : null;
    if (observed) watcher?.observe(observed, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearInterval(id);
      watcher?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled, shownLang]);

  // Look and costume changes come from the Player bar or the keyboard; name the
  // change under the head that changed (with whose it was, in duo or when that
  // head isn't on screen). Only changes made while mounted — not one left over
  // from before the head appeared.
  const styleChange = useSyncExternalStore(subscribeHeadStyle, () => getHeadStyle().change);
  const seenChange = useRef(styleChange?.id ?? 0);
  useEffect(() => {
    if (!styleChange || styleChange.id <= seenChange.current) return;
    seenChange.current = styleChange.id;
    const { voice, text } = styleChange;
    const named = duo || voice !== shownLang;
    setLookToast({ text: named ? `${VOICE_NAME[voice]}: ${text}` : text, voice });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setLookToast(null), 1400);
  }, [styleChange, duo, shownLang]);

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
  }, [lang, duo]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  if (!enabled) return null;
  // Same fragment shape as the full render, so the mascot keeps its state
  // (current tip, scenes already explained) when the head appears.
  if (!shownLang) {
    return (
      <>
        <SenseiMascot />
      </>
    );
  }

  const shown = autoPos ?? pos;
  const look = lookFor(shownLang);
  const seats: readonly Voice[] = duo ? DUO_ORDER : [shownLang];
  const apart = canSplit && shown ? split : null;
  /** When apart, each head looks along the real line to the other. */
  let toward: Record<Voice, { x: number; y: number }> | null = null;
  if (apart && shown) {
    const dx = apart.en.x - shown.x;
    const dy = apart.en.y - shown.y;
    const len = Math.hypot(dx, dy) || 1;
    toward = {
      ja: { x: dx / len, y: dy / len },
      en: { x: -dx / len, y: -dy / len },
    };
  }
  const bubble = reaction
    ? reactionLine(shownLang, reaction.kind, reaction.count, reaction.pick)
    : null;
  /** Near the top of the screen the bubble drops below the head instead. */
  const bubbleBelow = Boolean(shown && shown.y < 56);

  const flashToast = (text: string) => {
    setLookToast({ text, voice: null });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setLookToast(null), 1400);
  };

  const switchLook = (step: number) => cycleLook(shownLang, step);
  /** A: costume off / last one back on · Shift+A: next costume. */
  const changeCostume = (next: boolean) =>
    next ? cycleCostume(shownLang, 1) : toggleCostume(shownLang);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      const next = !getSenseiSettings().enabled;
      setSenseiSettings({ enabled: next });
      flashToast(next ? "Sensei on" : "Sensei off");
      return;
    }
    if (e.key === "b" || e.key === "B") {
      e.preventDefault();
      flashToast(toggleScenes() ? "Scenes on" : "Scenes off");
      return;
    }
    if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      flashToast(toggleDuo() ? "Duo on" : "Duo off");
      return;
    }
    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      changeCostume(e.shiftKey);
      return;
    }
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
    setSplit(null);
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
    <>
    <SenseiMascot />
    <div
      ref={rootRef}
      className={[
        "th-root",
        dragging ? "th-dragging" : "",
        shown ? "th-placed" : "",
        duo ? "th-root--duo" : "",
        apart ? "th-root--split" : "",
        scene ? "th-root--scene" : "",
        fit < 1 ? "th-root--fit" : "",
        yielding ? "th-root--yield" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        shown
          ? ({
              left: shown.x,
              top: shown.y,
              right: "auto",
              bottom: "auto",
              "--th-fit": fit,
            } as CSSProperties)
          : undefined
      }
      aria-hidden={yielding || undefined}
      role="group"
      tabIndex={0}
      aria-label={`${duo ? "Nanami and Andrew" : shownLang === "ja" ? "Nanami" : "Andrew"} talking head (${look.label}) — drag to move; Enter changes the speaker's look, A toggles the speaker's costume (Shift+A: next costume), R reactions, D duo, B scenes, M sensei`}
      title="Drag to move · Enter: the speaker's next look (Shift: previous) · A: the speaker's costume on/off (Shift: next costume) · R: reactions · D: duo · B: scenes · M: sensei"
      aria-grabbed={dragging}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="th-stage">
        {scene && <SceneCard backdrop={scene.backdrop} />}
        {seats.map((voice) => (
          <Seat
            key={voice}
            voice={voice}
            role={seatRole(duo, voice, lang, speaking)}
            look={lookFor(voice)}
            viseme={viseme}
            speakingNow={speaking}
            idleTilt={idleTilt}
            reaction={reaction}
            toward={toward?.[voice]}
            splitAt={apart && voice === "en" ? apart.en : undefined}
            prop={scene?.prop}
            suitReveal={Boolean(costume[voice]) && revealing[voice]}
            toast={lookToast?.voice === voice ? lookToast.text : undefined}
          />
        ))}
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
      {lookToast && !(lookToast.voice && seats.includes(lookToast.voice)) && (
        <span className="th-look-toast" aria-live="polite">
          {lookToast.text}
        </span>
      )}
    </div>
    </>
  );
}
