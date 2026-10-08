import type { CSSProperties, ReactNode } from "react";
import { Art } from "./artKit";
import { Figure } from "./figure";
import { Mover, Wheel } from "./artMotion";
import { particles, pick, rock, seeded, spin, still } from "./scenery";
import type { SceneProps } from "./artJapan";

/*
 * Twenty "surprise" scenes, each with its own palette (stageAmbience.css),
 * steady motion, and one or two rare events that play a few seconds after
 * the scene appears and then come back on a long loop: a tanuki turning
 * into a teakettle, a UFO taking the scarecrow's hat, a whale surfacing,
 * a clock's dolls parading out, a meteor shower…
 *
 * Surprise layers are invisible in their resting state, so with reduced
 * motion (all animation off) they simply never appear. Same rules as the
 * other scenes: faint, at the edges and along the bottom, centre open,
 * no ids.
 */

/** A CSS-animated group with its own timing. */
export function Act({
  cls,
  dur,
  delay = 0,
  origin,
  children,
}: {
  cls: string;
  dur?: number;
  delay?: number;
  origin?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = {};
  if (dur != null) style.animationDuration = `${dur}s`;
  if (delay) style.animationDelay = `${delay}s`;
  if (origin) style.transformOrigin = origin;
  return (
    <g className={cls} style={style}>
      {children}
    </g>
  );
}

/** A soft "poof" cloud of smoke, centred on (0, 0). */
export function Puff({ cls = "fb4" }: { cls?: string }) {
  return (
    <path
      className={cls}
      d="M -60 10 q -20 -30 10 -40 q 0 -34 40 -30 q 20 -30 52 -6 q 36 -8 40 26 q 30 14 8 44 q -6 26 -40 18 q -24 22 -56 4 q -40 10 -54 -16 Z"
    />
  );
}

/* ── 1. 狸 Tanuki in the moonlit wood (moss & amber) ───────────────── */

function TanukiBody({ leaf = false }: { leaf?: boolean }) {
  return (
    <g>
      <g transform="rotate(-18 -44 -22)">
        <ellipse className="pp" cx={-44} cy={-22} rx={32} ry={13} />
        <g className="ppa">
          <rect x={-62} y={-34} width={6} height={24} />
          <rect x={-48} y={-35} width={6} height={26} />
        </g>
      </g>
      <ellipse className="pp" cx={0} cy={-42} rx={38} ry={42} />
      <ellipse className="ppb" cx={6} cy={-34} rx={20} ry={26} />
      <circle className="pp" cx={4} cy={-104} r={27} />
      <circle className="pp" cx={-14} cy={-126} r={9} />
      <circle className="pp" cx={22} cy={-128} r={9} />
      <ellipse className="ppa" cx={4} cy={-104} rx={23} ry={9} />
      <circle className="ppb" cx={-6} cy={-105} r={3.5} />
      <circle className="ppb" cx={14} cy={-105} r={3.5} />
      <ellipse className="pp" cx={26} cy={-94} rx={12} ry={8} />
      <circle className="ppa" cx={36} cy={-96} r={3.5} />
      {leaf && (
        <path className="ppc" d="M -8 -128 q 16 -32 42 -24 q -10 26 -42 24 Z" />
      )}
    </g>
  );
}

function Teakettle() {
  return (
    <g>
      <path className="pp" d="M -56 0 q -10 -52 20 -76 h 72 q 30 24 20 76 Z" />
      <rect className="ppa" x={-40} y={-90} width={80} height={14} rx={6} />
      <circle className="pp" cx={0} cy={-98} r={9} />
      <path className="ppl" strokeWidth={6} d="M -44 -78 q 44 -70 88 0" />
      <path className="pp" d="M 46 -40 l 44 -26 l 6 10 l -40 30 Z" />
      <circle className="pp" cx={-62} cy={-40} r={20} />
      <circle className="pp" cx={-70} cy={-58} r={7} />
      <ellipse className="ppa" cx={-64} cy={-40} rx={14} ry={6} />
      <path className="pp" d="M 40 -10 q 40 6 46 -26 q 10 30 -40 40 Z" />
    </g>
  );
}

export function Tanuki() {
  const trunk = (x: number, w: number) => (
    <path
      className="fd"
      d={`M ${x - w * 0.7} 900 Q ${x - w * 0.4} 400 ${x - w * 0.5} 0 L ${x + w * 0.5} 0 Q ${x + w * 0.4} 420 ${x + w * 0.7} 900 Z`}
    />
  );
  const canopy = (cx: number, cy: number, k: number) => (
    <Act cls="amb-s-leafy" delay={-k}>
      <path
        className="fa2"
        d={`M ${cx - 220} ${cy} q -30 -90 70 -110 q 40 -70 140 -40 q 90 -30 130 50 q 80 30 30 110 q -60 50 -150 20 q -80 40 -160 0 q -80 10 -60 -30 Z`}
      />
    </Act>
  );
  return (
    <>
      <Art>
        <circle className="fb1" cx={1380} cy={150} r={120} />
        <circle className="fb3" cx={1380} cy={150} r={62} />
        {trunk(46, 100)}
        {trunk(1566, 90)}
        {canopy(150, 90, 0)}
        {canopy(1480, 70, 3)}
        <path
          className="fa1"
          d="M 0 900 L 0 840 Q 400 800 800 836 T 1600 826 L 1600 900 Z"
        />
        {/* Owl on the left trunk — blinks. */}
        <g transform="translate(100 360)">
          <path className="fa3" d="M -26 0 q -6 -60 26 -66 q 32 6 26 66 Z" />
          <path
            className="fa3"
            d="M -22 -58 l -6 -18 l 16 10 Z M 22 -58 l 6 -18 l -16 10 Z"
          />
          <Act cls="amb-s-blink">
            <circle className="fb4" cx={-10} cy={-44} r={7} />
            <circle className="fb4" cx={10} cy={-44} r={7} />
          </Act>
        </g>
        {/* Shigaraki tanuki statue, sake flask swinging. */}
        <g transform="translate(1440 878)">
          <ellipse className="fc2" cx={0} cy={-6} rx={70} ry={12} />
          <ellipse className="fb3" cx={0} cy={-76} rx={62} ry={66} />
          <ellipse className="fb2" cx={6} cy={-60} rx={40} ry={42} />
          <circle className="fb3" cx={0} cy={-170} r={42} />
          <ellipse className="fc3" cx={0} cy={-206} rx={70} ry={14} />
          <path className="fc3" d="M -36 -210 q 36 -50 72 0 Z" />
          <circle className="fd" cx={-14} cy={-170} r={5} />
          <circle className="fd" cx={14} cy={-170} r={5} />
          <g>
            <path className="fc3" d="M 56 -110 q 30 4 30 30 v 40 h -30 Z" />
            {rock(60, -110, -6, 8, 3.2)}
          </g>
        </g>
        {/* Bush the surprise hides behind. */}
        <path
          className="fa3"
          d="M 90 884 q 0 -64 54 -64 q 20 -44 66 -22 q 54 -20 66 34 q 34 12 20 52 Z"
        />
        {/* Surprise: a tanuki pops up, leaf on its head — poof! — a teakettle. */}
        <g transform="translate(190 860)">
          <Act cls="amb-s-tanuki" dur={24}>
            <g className="amb-person amb-s-bold">
              <TanukiBody leaf />
            </g>
          </Act>
          <Act cls="amb-s-kettle" dur={24}>
            <g className="amb-person amb-s-bold">
              <Teakettle />
            </g>
          </Act>
          <g transform="translate(0 -70)">
            <Act cls="amb-s-puff" dur={24}>
              <Puff />
            </Act>
          </g>
        </g>
        {/* A tanuki family trots across the bottom. */}
        <Mover cls="amb-pass amb-pass--back" dur={34} delay={-6}>
          <g transform="translate(0 892) scale(-0.42 0.42)">
            <Act cls="amb-bobble" dur={0.5}>
              <g className="amb-person">
                <TanukiBody />
              </g>
            </Act>
          </g>
          <g transform="translate(110 892) scale(-0.26 0.26)">
            <Act cls="amb-bobble" dur={0.4} delay={-0.2}>
              <g className="amb-person">
                <TanukiBody />
              </g>
            </Act>
          </g>
          <g transform="translate(180 892) scale(-0.26 0.26)">
            <Act cls="amb-bobble" dur={0.4}>
              <g className="amb-person">
                <TanukiBody />
              </g>
            </Act>
          </g>
        </Mover>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 9,
          seed: 3101,
          className: "amb-p--leaf fall",
          duration: [12, 20],
          size: [0.9, 1.4],
          opacity: [0.25, 0.45],
        })}
        {particles({
          count: 7,
          seed: 3102,
          className: "amb-p--firefly firefly",
          duration: [5, 8],
          size: [0.35, 0.55],
          opacity: [0.35, 0.6],
          top: [62, 86],
        })}
      </div>
    </>
  );
}

/* ── 2. 狐の嫁入り Fox wedding in a sunshower (foxfire & sunset) ──────── */

function FoxMask() {
  return (
    <path
      className="pp"
      d="M -12 -8 L -9 -28 L -1 -12 Z M 3 -12 L 11 -28 L 14 -8 Z M 9 -3 L 26 2 L 9 7 Z"
    />
  );
}

function Fox() {
  return (
    <g>
      <path
        className="pp"
        d="M -20 0 q -6 -44 10 -60 l -2 -26 l 12 16 l 14 -2 l 12 -14 l 0 26 q 16 10 26 4 l -22 14 q 10 22 4 42 Z"
      />
      <path
        className="pp"
        d="M -14 -4 q -60 6 -56 -40 q 4 -26 26 -18 q -16 22 30 34 Z"
      />
      <path className="ppb" d="M -66 -36 q 2 -18 18 -18 q -10 10 -6 22 Z" />
    </g>
  );
}

export function Kitsune() {
  const walker = (x: number, kind: "lantern" | "bride" | "umbrella") => {
    const lantern = (
      <g>
        <line className="ppl" x1={0} y1={0} x2={18} y2={-30} strokeWidth={3} />
        <g className="amb-glow">
          <ellipse className="ppc" cx={22} cy={-12} rx={10} ry={14} />
        </g>
      </g>
    );
    const umbrella = (
      <g>
        <line className="ppl" x1={0} y1={0} x2={-30} y2={-90} strokeWidth={3} />
        <path className="ppc" d="M -96 -82 Q -30 -150 36 -82 Z" />
      </g>
    );
    return (
      <Figure
        key={x}
        x={x}
        y={0}
        s={0.62}
        pose="walk"
        robe
        stride={{ deg: 9, dur: 1.5 }}
        headwear={
          kind === "bride" ? (
            <circle className="ppb" cx={0} cy={-6} r={16} />
          ) : (
            <FoxMask />
          )
        }
        hand={
          kind === "lantern"
            ? lantern
            : kind === "umbrella"
              ? umbrella
              : undefined
        }
      />
    );
  };
  const orbs = (pts: [number, number][], base: number) =>
    pts.map(([x, y], i) => (
      <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
        <Act cls="amb-s-foxfire" dur={26} delay={base + i * 0.4}>
          <circle className="fa2" r={30} />
          <circle className="fa4" r={10} />
        </Act>
      </g>
    ));
  return (
    <>
      <Art>
        <g>
          <g className="fb3">
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={216}
                y={40}
                width={6}
                height={40}
                transform={`rotate(${i * 30} 220 150)`}
              />
            ))}
          </g>
          {spin(220, 150, 60)}
        </g>
        <circle className="fb3" cx={220} cy={150} r={46} />
        <path
          className="fa1"
          d="M 0 900 L 0 740 Q 300 660 620 730 T 1200 700 T 1600 690 L 1600 900 Z"
        />
        <path
          className="fa2"
          d="M 0 900 L 0 846 Q 400 820 800 842 T 1600 830 L 1600 900 Z"
        />
        {[40, 92, 1500, 1556].map((x, i) => (
          <path
            key={x}
            className="fd"
            d={`M ${x} ${i % 2 ? 860 : 840} l -36 0 l 36 -${i % 2 ? 190 : 240} l 36 ${i % 2 ? 190 : 240} Z`}
          />
        ))}
        <g transform="translate(1480 760)">
          <rect className="fc3" x={-50} y={-90} width={10} height={90} />
          <rect className="fc3" x={40} y={-90} width={10} height={90} />
          <path
            className="fc4"
            d="M -76 -100 Q 0 -112 76 -100 L 72 -90 L -72 -90 Z"
          />
          <rect className="fc3" x={-60} y={-78} width={120} height={8} />
        </g>
        {orbs(
          [
            [1330, 560],
            [1380, 520],
            [1430, 490],
            [1480, 470],
            [1530, 462],
            [1580, 470],
          ],
          0,
        )}
        {orbs(
          [
            [300, 540],
            [240, 500],
            [180, 476],
            [120, 466],
            [60, 470],
          ],
          1.2,
        )}
        <g transform="translate(1400 846) scale(0.7)">
          <Act cls="amb-s-show" dur={26}>
            <g className="amb-person amb-s-bold">
              <Fox />
            </g>
          </Act>
        </g>
        {/* The procession walks the ridge. */}
        <g transform="translate(0 852)">
          <Act cls="amb-s-procession" dur={80} delay={-26}>
            {walker(0, "lantern")}
            {walker(90, "umbrella")}
            {walker(150, "bride")}
            {walker(240, "lantern")}
            {walker(330, "lantern")}
            {walker(420, "lantern")}
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 26,
          seed: 3201,
          className: "amb-p--drop fall-fast",
          duration: [1.4, 2.2],
          size: [0.15, 0.25],
          opacity: [0.14, 0.28],
        })}
      </div>
    </>
  );
}

/* ── 3. 忍者 Ninja over the rooftops (plum night) ─────────────────── */

function Hood() {
  return (
    <g>
      <circle className="pp" r={15} />
      <path
        className="ppl"
        strokeWidth={4}
        d="M -12 -2 q -22 -6 -30 6 M -12 2 q -20 4 -26 16"
      />
    </g>
  );
}

export function Ninja() {
  const shuriken = (
    <g>
      <path
        className="fc4"
        d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z"
      />
      {spin(0, 0, 0.4)}
    </g>
  );
  return (
    <>
      <Art>
        <circle className="fc1" cx={150} cy={210} r={190} />
        <circle className="fc3" cx={150} cy={210} r={118} />
        <Act cls="amb-cloud" dur={24}>
          <path
            className="fb2"
            d="M -40 260 q 30 -40 90 -20 q 40 -30 90 0 q 60 -10 70 30 Z"
          />
        </Act>
        {/* Left roof */}
        <path
          className="fa3"
          d="M -40 720 Q 40 700 70 650 L 230 650 Q 260 700 330 720 L 300 740 L -10 740 Z"
        />
        <g className="sa2" strokeWidth={3}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={20 + i * 34} y1={662} x2={10 + i * 36} y2={734} />
          ))}
        </g>
        <rect className="fd" x={-10} y={740} width={310} height={160} />
        {/* Right watchtower */}
        <path
          className="fa3"
          d="M 1360 560 Q 1410 540 1430 500 L 1580 500 Q 1600 540 1660 560 Z"
        />
        <rect className="fd" x={1400} y={560} width={220} height={340} />
        <rect className="fa2" x={1430} y={620} width={50} height={50} />
        <g className="amb-glow">
          <rect className="fc3" x={1520} y={620} width={50} height={50} />
        </g>
        {/* Wall along the bottom */}
        <rect className="fa2" x={0} y={858} width={1600} height={42} />
        <path className="fa3" d="M -10 862 L 1610 862 L 1600 846 L 0 846 Z" />
        {/* Post the shuriken stick in */}
        <rect className="fb3" x={1236} y={740} width={18} height={110} />
        <g transform="translate(300 820)">
          <Act cls="amb-s-shuriken" dur={8}>
            {shuriken}
          </Act>
        </g>
        {/* A runner along the wall top */}
        <Mover cls="amb-pass" dur={12} delay={-2}>
          <Figure
            x={0}
            y={846}
            s={0.62}
            pose="walk"
            stride={{ deg: 30, dur: 0.42 }}
            headwear={<Hood />}
          />
        </Mover>
        {/* Surprise A: a leap across the moon */}
        <Act cls="amb-s-leap amb-s-boldfig" dur={20}>
          <Figure x={20} y={650} s={0.8} pose="crouch" headwear={<Hood />} />
        </Act>
        <g transform="translate(240 690) scale(0.6)">
          <Act cls="amb-s-puff-late" dur={20}>
            <Puff cls="fb3" />
          </Act>
        </g>
        {/* Surprise B: drops in on a rope, upside down */}
        <Act cls="amb-s-rope amb-s-boldfig" dur={20}>
          <line
            className="sb3"
            x1={1470}
            y1={-500}
            x2={1470}
            y2={300}
            strokeWidth={3}
          />
          <g transform="rotate(180 1470 300)">
            <Figure
              x={1470}
              y={300}
              s={0.62}
              pose="stand"
              headwear={<Hood />}
              arms={{ which: "both", values: [-20, 20], dur: 1.2 }}
            />
          </g>
        </Act>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 12,
          seed: 3301,
          className: "amb-p--twinkle twinkle",
          duration: [4, 8],
          size: [0.2, 0.35],
          opacity: [0.3, 0.6],
          top: [4, 34],
          left: [45, 98],
        })}
      </div>
    </>
  );
}

/* ── 4. 田舎の夜 UFO over the rice fields (ultraviolet & lime) ───────── */

export function Ufo() {
  const meteor = (x: number, y: number, delay: number) => (
    <g key={x} transform={`translate(${x} ${y})`}>
      <Act cls="amb-s-meteor" dur={7} delay={delay}>
        <line
          className="sb4"
          x1={0}
          y1={0}
          x2={70}
          y2={-38}
          strokeWidth={2.5}
        />
        <circle className="fb4" r={4} />
      </Act>
    </g>
  );
  return (
    <>
      <Art>
        {meteor(560, 90, 0)}
        {meteor(1240, 60, -2.6)}
        {meteor(1500, 220, -5)}
        <path
          className="fa1"
          d="M 0 900 L 0 720 Q 260 650 520 700 T 1060 690 T 1600 700 L 1600 900 Z"
        />
        <g className="sc2" strokeWidth={2}>
          {[770, 800, 832, 866].map((y) => (
            <line key={y} x1={0} y1={y} x2={1600} y2={y + 6} />
          ))}
        </g>
        {/* Power line */}
        {[1180, 1380, 1580].map((x) => (
          <g key={x}>
            <rect className="fa3" x={x - 4} y={520} width={8} height={300} />
            <rect className="fa3" x={x - 30} y={540} width={60} height={6} />
          </g>
        ))}
        <path
          className="sa2"
          fill="none"
          strokeWidth={2}
          d="M 1150 545 Q 1280 600 1410 545 Q 1480 600 1610 545"
        />
        {/* Scarecrow */}
        <g transform="translate(150 872)">
          <g>
            <rect className="fc3" x={-5} y={-200} width={10} height={200} />
            <rect className="fc3" x={-80} y={-150} width={160} height={8} />
            <path
              className="fc2"
              d="M -50 -150 L 50 -150 L 40 -70 L -40 -70 Z"
            />
            <circle className="fc3" cx={0} cy={-178} r={24} />
            {rock(0, 0, -2, 2, 4)}
          </g>
          <g transform="translate(0 -196)">
            <Act cls="amb-s-hat" dur={26}>
              <ellipse className="fb3" cx={0} cy={0} rx={46} ry={10} />
              <path className="fb3" d="M -24 0 Q 0 -40 24 0 Z" />
            </Act>
          </g>
        </g>
        {/* Bus stop and someone waiting */}
        <g transform="translate(1420 880)">
          <rect className="fa3" x={-3} y={-170} width={6} height={170} />
          <circle className="fb3" cx={0} cy={-176} r={22} />
          <rect className="fa2" x={-110} y={-46} width={90} height={8} />
          <rect className="fa2" x={-104} y={-38} width={6} height={38} />
          <rect className="fa2" x={-32} y={-38} width={6} height={38} />
        </g>
        <Figure
          x={1350}
          y={880}
          s={0.66}
          pose="chair"
          flip
          upper={{ values: [0, 5], dur: 3 }}
        />
        {/* A kei truck rolls by, headlights on */}
        <Mover cls="amb-pass" dur={22} delay={-15}>
          <g transform="translate(0 878)">
            <path className="fb1" d="M 92 -26 L 330 -60 L 330 10 Z" />
            <rect className="fa3" x={-90} y={-46} width={110} height={34} />
            <path
              className="fa4"
              d="M 20 -62 L 70 -62 L 92 -36 L 92 -12 L 20 -12 Z"
            />
            <Wheel cx={-60} cy={-10} r={14} dur={0.6} />
            <Wheel cx={60} cy={-10} r={14} dur={0.6} />
          </g>
        </Mover>
        {/* Surprise: a UFO beams up the scarecrow's hat */}
        <g transform="translate(150 330)">
          <Act cls="amb-s-beam" dur={26}>
            <path className="fb2" d="M -34 0 L 34 0 L 130 520 L -130 520 Z" />
          </Act>
          <Act cls="amb-s-ufo" dur={26}>
            <ellipse className="fa4" cx={0} cy={-6} rx={100} ry={24} />
            <path className="fb3" d="M -44 -16 Q 0 -74 44 -16 Z" />
            <g className="amb-blink">
              <circle className="fb4" cx={-60} cy={-4} r={6} />
              <circle className="fb4" cx={60} cy={-4} r={6} />
            </g>
            <g className="amb-blink amb-blink--alt">
              <circle className="fc4" cx={0} cy={6} r={6} />
            </g>
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 22,
          seed: 3401,
          className: "amb-p--twinkle twinkle",
          duration: [3, 7],
          size: [0.18, 0.32],
          opacity: [0.35, 0.7],
          top: [3, 40],
        })}
      </div>
    </>
  );
}

/* ── 5. 鯨 Whale watching at dusk (teal & coral) ──────────────────── */

export function Whale() {
  const wave = (y: number, cls: string, dur: number) => {
    let d = `M -400 ${y}`;
    for (let x = -400; x < 2000; x += 100) d += ` q 25 -10 50 0 q 25 10 50 0`;
    return (
      <Act cls="amb-s-wave" dur={dur}>
        <path className={cls} fill="none" strokeWidth={2.5} d={d} />
      </Act>
    );
  };
  const dolphin = (delay: number, x: number) => (
    <g key={x} transform={`translate(${x} 900)`}>
      <Act cls="amb-s-dolphin" dur={28} delay={delay}>
        <g className="amb-person amb-s-bold">
          <path
            className="pp"
            d="M -50 0 Q -10 -26 40 -8 L 56 -4 L 40 4 Q 0 14 -40 6 L -64 -10 L -58 4 Z M -6 -16 l 10 -18 l 8 18 Z"
          />
        </g>
      </Act>
    </g>
  );
  return (
    <>
      <Art>
        <circle className="fb2" cx={1470} cy={640} r={140} />
        <circle className="fb3" cx={1470} cy={640} r={86} />
        <rect className="fa2" x={0} y={640} width={1600} height={260} />
        <g className="amb-shimmer">
          <g className="sb3" strokeWidth={3}>
            <line x1={1390} y1={672} x2={1550} y2={672} />
            <line x1={1416} y1={700} x2={1524} y2={700} />
            <line x1={1440} y1={730} x2={1500} y2={730} />
          </g>
        </g>
        {wave(690, "sc2", 9)}
        {wave(760, "sa3", 7)}
        {wave(840, "sc2", 5)}
        <Mover cls="amb-pass amb-pass--slow" dur={70} delay={-30}>
          <g transform="translate(0 634)">
            <path className="fc3" d="M -70 0 L 70 0 L 60 -14 L -60 -14 Z" />
            <rect className="fc3" x={-30} y={-28} width={50} height={14} />
            <rect className="fb3" x={-8} y={-40} width={8} height={12} />
          </g>
        </Mover>
        <g transform="translate(200 790)">
          <Act cls="amb-bobble" dur={3}>
            <path className="fc3" d="M -60 0 L 60 0 L 46 22 L -46 22 Z" />
            <path className="fc3" d="M 0 -4 L 0 -130 L 60 -12 Z" />
            <path className="fc2" d="M -6 -4 L -6 -110 L -50 -12 Z" />
          </Act>
        </g>
        <g
          className="amb-birds"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M 300 220 q 12 -10 24 0 q 12 -10 24 0" />
          <path d="M 352 196 q 9 -8 18 0 q 9 -8 18 0" />
          <path d="M 260 186 q 9 -8 18 0 q 9 -8 18 0" />
        </g>
        {/* Surprise: a whale surfaces, blows, and shows its tail */}
        <g transform="translate(1450 846)">
          <Act cls="amb-s-whaleback" dur={28}>
            <g className="amb-person amb-s-bold">
              <path className="pp" d="M -170 20 Q -60 -60 120 -10 L 150 20 Z" />
              <path className="pp" d="M 40 -32 l 18 -20 l 6 24 Z" />
            </g>
          </Act>
          <g transform="translate(-70 -36)">
            <Act cls="amb-s-spout" dur={28}>
              <g className="fb4">
                <path d="M 0 0 Q -30 -70 -70 -90 Q -20 -80 0 -30 Q 20 -80 70 -90 Q 30 -70 0 0 Z" />
                <circle cx={-60} cy={-100} r={8} />
                <circle cx={58} cy={-104} r={7} />
                <circle cx={0} cy={-110} r={9} />
              </g>
            </Act>
          </g>
        </g>
        <g transform="translate(1480 880)">
          <Act cls="amb-s-fluke" dur={28}>
            <g className="amb-person amb-s-bold">
              <path
                className="pp"
                d="M -12 30 L -10 -40 Q -70 -60 -96 -110 Q -40 -96 0 -64 Q 40 -96 96 -110 Q 70 -60 10 -40 L 12 30 Z"
              />
            </g>
            <g className="fb4">
              <circle cx={-60} cy={-70} r={4} />
              <circle cx={50} cy={-60} r={5} />
              <circle cx={-20} cy={-40} r={3} />
            </g>
          </Act>
        </g>
        {dolphin(0, 640)}
        {dolphin(-0.5, 720)}
        {dolphin(-1, 800)}
      </Art>
    </>
  );
}

/* ── 6. からくり時計 Clock tower with mechanical dolls (brass & verdigris) */

function gear(cx: number, cy: number, r: number, teeth: number): string {
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i * Math.PI) / teeth;
    const rr = i % 2 ? r : r + r * 0.18;
    const a2 = ((i + 1) * Math.PI) / teeth;
    d += `${i ? "L" : "M"} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} L ${(cx + rr * Math.cos(a2)).toFixed(1)} ${(cy + rr * Math.sin(a2)).toFixed(1)} `;
  }
  return `${d}Z`;
}

export function Karakuri() {
  const doll = (x: number, k: number) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <Act cls="amb-s-bow" dur={1.6} delay={-k * 0.4}>
        <Figure
          x={0}
          y={0}
          s={0.36}
          pose={k === 1 ? "armsUp" : "stand"}
          robe
          headwear={<path className="ppc" d="M -16 -6 L 0 -24 L 16 -6 Z" />}
        />
      </Act>
    </g>
  );
  return (
    <>
      <Art>
        {/* Tower */}
        <g transform="translate(-100 0)">
          <path className="fb3" d="M 70 160 L 200 50 L 330 160 Z" />
          <rect className="fb3" x={196} y={14} width={8} height={40} />
          <rect className="fa2" x={84} y={160} width={232} height={740} />
          <g transform="translate(200 200)">
            <Act cls="amb-s-bell" dur={30} origin="0px -40px">
              <path
                className="fa4"
                d="M -18 -30 Q 0 -44 18 -30 L 24 4 L -24 4 Z"
              />
            </Act>
            {[0, 0.5, 1].map((d) => (
              <Act key={d} cls="amb-s-ring" dur={30} delay={d}>
                <circle className="sa3" fill="none" strokeWidth={3} r={40} />
              </Act>
            ))}
          </g>
          <circle className="fa2" cx={200} cy={330} r={92} />
          <circle
            className="sa3"
            fill="none"
            strokeWidth={4}
            cx={200}
            cy={330}
            r={92}
          />
          <g className="sa4" strokeWidth={4}>
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1={200}
                y1={250}
                x2={200}
                y2={262}
                transform={`rotate(${i * 30} 200 330)`}
              />
            ))}
          </g>
          <g>
            <line
              className="sc4"
              x1={200}
              y1={330}
              x2={200}
              y2={276}
              strokeWidth={6}
              strokeLinecap="round"
            />
            {spin(200, 330, 120)}
          </g>
          <g>
            <line
              className="sc4"
              x1={200}
              y1={330}
              x2={200}
              y2={256}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            {spin(200, 330, 10)}
          </g>
          <circle className="fc4" cx={200} cy={330} r={7} />
          {/* Gears */}
          <rect
            className="fd"
            x={110}
            y={450}
            width={180}
            height={130}
            rx={8}
          />
          <g>
            <path className="fa3" d={gear(170, 515, 40, 12)} />
            {spin(170, 515, 8)}
          </g>
          <g>
            <path className="fb3" d={gear(240, 492, 26, 8)} />
            {spin(240, 492, 5.3, true)}
          </g>
          {/* Pendulum */}
          <g>
            <line
              className="sa3"
              x1={200}
              y1={590}
              x2={200}
              y2={680}
              strokeWidth={4}
            />
            <circle className="fa4" cx={200} cy={686} r={18} />
            {rock(200, 590, -16, 16, 2.4)}
          </g>
          {/* Doll stage with doors */}
          <rect className="fd" x={110} y={720} width={180} height={110} />
          <g transform="translate(200 820)">
            <Act cls="amb-s-dolls" dur={30}>
              {doll(-56, 0)}
              {doll(0, 1)}
              {doll(56, 2)}
            </Act>
          </g>
          <Act cls="amb-s-door amb-s-door--l" dur={30}>
            <rect className="fb3" x={110} y={720} width={90} height={110} />
          </Act>
          <Act cls="amb-s-door amb-s-door--r" dur={30}>
            <rect className="fb3" x={200} y={720} width={90} height={110} />
          </Act>
        </g>
        {/* Plaza: lamp, bunting, a tourist and pigeons */}
        <rect className="fa3" x={1546} y={560} width={8} height={330} />
        <g className="amb-glow">
          <circle className="fb3" cx={1550} cy={546} r={22} />
        </g>
        <path
          className="sa2"
          fill="none"
          strokeWidth={2}
          d="M 1550 600 Q 1580 630 1610 616"
        />
        <g className="fc3">
          {[1566, 1590].map((x, i) => (
            <path
              key={x}
              d={`M ${x} ${614 + (i === 1 || i === 2 ? 12 : 4)} l 16 0 l -8 18 Z`}
            />
          ))}
        </g>
        <Figure
          x={1440}
          y={886}
          s={0.86}
          pose="stand"
          flip
          upper={{ values: [-6, -10], dur: 4 }}
          hand={
            <rect
              className="ppc"
              x={-8}
              y={-14}
              width={20}
              height={14}
              rx={3}
            />
          }
        />
        <g transform="translate(1220 886)">
          <Act cls="amb-s-pigeons" dur={30}>
            {[0, 50, 96, 150].map((x, i) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <Act cls="amb-s-peck" dur={1.4} delay={-i * 0.37}>
                  <path
                    className="fc3"
                    d="M -16 0 Q -20 -18 0 -20 L 8 -28 L 16 -22 L 10 -16 Q 14 -2 -16 0 Z"
                  />
                </Act>
              </g>
            ))}
          </Act>
        </g>
      </Art>
    </>
  );
}

/* ── 7. だるま市 Daruma market (vermilion & gold) ───────────────────── */

function DarumaDoll({ glyph }: { glyph: string }) {
  return (
    <g>
      <path
        className="fa3"
        d="M -40 0 Q -54 -62 -30 -88 Q 0 -112 30 -88 Q 54 -62 40 0 Z"
      />
      <ellipse className="fc3" cx={0} cy={-64} rx={22} ry={18} />
      <circle className="fc4" cx={-9} cy={-66} r={6} />
      <circle className="fc4" cx={9} cy={-66} r={6} />
      <path
        className="sb3"
        fill="none"
        strokeWidth={3}
        d="M -18 -54 q 18 12 36 0"
      />
      <text className="amb-glyph gb" x={0} y={-24} fontSize={26}>
        {glyph}
      </text>
    </g>
  );
}

export function Daruma({ glyphs }: SceneProps) {
  const chars = pick(glyphs, "福必勝合格", 12);
  const r = seeded(3701);
  const tier = (x0: number, w: number, y: number) => (
    <rect className="fc2" x={x0} y={y} width={w} height={14} />
  );
  const row = (x0: number, y: number, n: number, s: number, k: number) =>
    Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${x0 + i * 92 * s} ${y}) scale(${s})`}>
        <Act cls="amb-s-wobble" dur={2.6 + r() * 1.8} delay={-r() * 3}>
          <DarumaDoll glyph={chars[(k + i) % chars.length]!} />
        </Act>
      </g>
    ));
  return (
    <>
      <Art>
        <path
          className="fb2"
          d="M 0 40 Q 400 90 800 50 Q 1200 90 1600 40"
          fill="none"
        />
        {[60, 180, 1420, 1540].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 3 === 1 ? 92 : 74})`}>
            <Act cls="amb-sway-soft" dur={5 + i * 0.4}>
              <ellipse
                className={i % 2 ? "fa3" : "fc3"}
                cx={0}
                cy={0}
                rx={20}
                ry={28}
              />
            </Act>
          </g>
        ))}
        {tier(0, 210, 560)}
        {tier(0, 210, 720)}
        {tier(0, 1600, 884)}
        {tier(1390, 210, 560)}
        {tier(1390, 210, 720)}
        {row(40, 560, 2, 0.85, 0)}
        {row(36, 720, 2, 0.95, 4)}
        {row(1430, 560, 2, 0.85, 8)}
        {row(1420, 720, 2, 0.95, 2)}
        {row(60, 884, 2, 0.9, 6)}
        {row(560, 884, 6, 0.62, 3)}
        {/* Buyer carrying a daruma home */}
        <Mover cls="amb-pass" dur={18} delay={-4}>
          <Figure
            x={0}
            y={890}
            s={0.8}
            pose="walk"
            stride={{ deg: 14, dur: 1 }}
            hand={
              <g transform="translate(0 4) scale(0.4)">
                <DarumaDoll glyph="" />
              </g>
            }
          />
        </Mover>
        {/* Surprise: the big one tips right over, bounces back up, and gets its eye */}
        <g transform="translate(1500 886) scale(1.5)">
          <Act cls="amb-s-okiagari" dur={22}>
            <DarumaDoll glyph={chars[0]!} />
            <Act cls="amb-s-eye" dur={22}>
              <circle className="fd" cx={-9} cy={-66} r={4.5} />
            </Act>
          </Act>
          <g transform="translate(0 -60)">
            <Act cls="amb-s-burst" dur={22}>
              <g className="sb4" strokeWidth={3} strokeLinecap="round">
                {Array.from({ length: 10 }, (_, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={-70}
                    x2={0}
                    y2={-92}
                    transform={`rotate(${i * 36})`}
                  />
                ))}
              </g>
            </Act>
          </g>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 3702,
          className: "amb-p--twinkle twinkle",
          duration: [3, 6],
          size: [0.25, 0.4],
          opacity: [0.35, 0.6],
          top: [40, 90],
        })}
      </div>
    </>
  );
}

/* ── 8. 百鬼夜行 Yokai night (violet & ember) ───────────────────────── */

export function Yokai() {
  const wisp = (cx: number, cy: number, rx: number, dur: number, k: number) => (
    <g key={cx} transform={`translate(${cx} ${cy})`}>
      <g>
        <path
          className="fa3"
          d="M 0 0 q -16 -10 -6 -40 q 4 20 18 26 q 6 10 -12 14 Z"
        />
        <circle className="fa4" cx={2} cy={-6} r={8} />
        {!still() && (
          <animateMotion
            path={`M 0 0 a ${rx} ${rx * 0.45} 0 1 ${k % 2} ${rx * 2} 0 a ${rx} ${rx * 0.45} 0 1 ${k % 2} ${-rx * 2} 0`}
            dur={`${dur}s`}
            repeatCount="indefinite"
          />
        )}
      </g>
    </g>
  );
  const strands = [30, 70, 110, 150, 190, 230];
  return (
    <>
      <Art>
        <circle className="fc3" cx={1340} cy={200} r={52} />
        <Act cls="amb-cloud" dur={20}>
          <path
            className="fa2"
            d="M 1240 230 q 30 -36 90 -20 q 40 -26 100 4 q 50 0 60 26 Z"
          />
        </Act>
        {/* Willow */}
        <path
          className="fd"
          d="M 40 900 Q 70 500 20 120 L 110 120 Q 150 520 140 900 Z"
        />
        {strands.map((x, i) => (
          <Act key={x} cls="amb-s-willow" dur={5 + (i % 3)} delay={-i * 0.7}>
            <path
              className="sa2"
              fill="none"
              strokeWidth={3}
              d={`M ${x} 110 Q ${x + 40} 300 ${x + 14} ${420 + (i % 3) * 60}`}
            />
          </Act>
        ))}
        {/* Stone lantern */}
        <g transform="translate(170 884)">
          <rect className="fc2" x={-30} y={-30} width={60} height={30} />
          <rect className="fc2" x={-12} y={-100} width={24} height={70} />
          <rect className="fc2" x={-40} y={-120} width={80} height={20} />
          <g className="amb-flame">
            <rect className="fb3" x={-22} y={-160} width={44} height={40} />
          </g>
          <path className="fc2" d="M -54 -160 L 0 -200 L 54 -160 Z" />
        </g>
        {/* Surprise 2: a one-eyed boy peeks from behind the lantern */}
        <g transform="translate(226 884)">
          <Act cls="amb-s-peekside" dur={24}>
            <Figure
              x={0}
              y={0}
              s={0.55}
              pose="stand"
              flip
              robe
              headwear={<circle className="ppb" cx={0} cy={0} r={6} />}
            />
          </Act>
        </g>
        {/* Gate */}
        <rect className="fa2" x={1420} y={620} width={20} height={280} />
        <rect className="fa2" x={1570} y={620} width={20} height={280} />
        <path
          className="fa3"
          d="M 1380 630 Q 1510 590 1640 630 L 1640 610 Q 1510 560 1380 610 Z"
        />
        {/* Chochin-obake: the lantern wakes up */}
        <line
          className="sc3"
          x1={1510}
          y1={0}
          x2={1510}
          y2={300}
          strokeWidth={3}
        />
        <g>
          <g transform="translate(1510 370)">
            <ellipse className="fb3" cx={0} cy={0} rx={52} ry={68} />
            <g className="sb2" strokeWidth={2} fill="none">
              {[-44, -24, 0, 24, 44].map((y) => (
                <path
                  key={y}
                  d={`M -${Math.sqrt(1 - (y / 68) ** 2) * 52} ${y} h ${Math.sqrt(1 - (y / 68) ** 2) * 104}`}
                />
              ))}
            </g>
            <rect className="fa3" x={-30} y={-76} width={60} height={12} />
            <rect className="fa3" x={-30} y={64} width={60} height={12} />
            <path
              className="sa3"
              fill="none"
              strokeWidth={3}
              d="M -26 30 q 26 10 52 0"
            />
            <Act cls="amb-s-lantern-eye" dur={24}>
              <ellipse className="fc4" cx={0} cy={-14} rx={20} ry={14} />
              <circle className="fa4" cx={4} cy={-14} r={7} />
            </Act>
            <g transform="translate(0 34)">
              <Act cls="amb-s-tongue" dur={24}>
                <path
                  className="fb4"
                  d="M -12 0 Q -14 50 0 70 Q 14 50 12 0 Z"
                />
              </Act>
            </g>
          </g>
          {rock(1510, 300, -4, 4, 4)}
        </g>
        {wisp(60, 560, 50, 9, 0)}
        {wisp(40, 300, 40, 7, 1)}
        {wisp(1300, 560, 50, 8, 1)}
        {wisp(1300, 200, 40, 10, 0)}
        {/* Kasa-obake hops along the bottom */}
        <Act cls="amb-s-hopx" dur={16} delay={-3}>
          <g transform="translate(0 896) scale(0.6)">
            <Act cls="amb-s-hop" dur={0.8}>
              <g className="amb-person amb-s-bold">
                <path
                  className="pp"
                  d="M -46 -60 L 0 -170 L 46 -60 Q 0 -48 -46 -60 Z"
                />
                <rect className="pp" x={-4} y={-62} width={8} height={46} />
                <rect className="pp" x={-16} y={-18} width={32} height={10} />
                <circle className="ppb" cx={0} cy={-120} r={10} />
                <circle className="ppa" cx={2} cy={-120} r={4} />
                <path
                  className="ppc"
                  d="M 4 -96 q 24 6 26 22 q -14 -4 -26 -14 Z"
                />
              </g>
            </Act>
          </g>
        </Act>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 3801,
          className: "amb-p--spark spark",
          duration: [5, 9],
          size: [0.25, 0.45],
          opacity: [0.3, 0.55],
          left: [10, 30],
        })}
      </div>
    </>
  );
}

/* ── 9. 天体観測 Stargazing (midnight & rose gold) ──────────────────── */

export function Stargaze() {
  const constellation = (pts: [number, number][], key: string) => (
    <g key={key}>
      <Act cls="amb-s-draw" dur={14}>
        <polyline
          className="sc3"
          fill="none"
          strokeWidth={2}
          strokeDasharray="600"
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
        />
      </Act>
      <g className="fa4">
        {pts.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} />
        ))}
      </g>
    </g>
  );
  const meteors: [number, number, number][] = [
    [1480, 20, 0],
    [1420, 80, 0.5],
    [1540, 110, 0.9],
    [1380, 30, 1.3],
    [1500, 170, 1.8],
    [1580, 60, 2.3],
  ];
  return (
    <>
      <Art>
        <path
          className="fc1"
          d="M -100 420 Q 500 120 1700 -40 L 1700 120 Q 600 260 -100 560 Z"
        />
        {constellation(
          [
            [40, 200],
            [120, 250],
            [200, 230],
            [250, 310],
            [160, 380],
          ],
          "a",
        )}
        {constellation(
          [
            [1310, 330],
            [1380, 290],
            [1450, 330],
            [1470, 250],
            [1580, 360],
          ],
          "b",
        )}
        {/* Comet */}
        <path className="fb2" d="M 20 520 L 250 470 L 260 486 Z" />
        <circle className="fb4" cx={256} cy={478} r={7} />
        {/* Satellite */}
        <Mover cls="amb-drift" dur={60} delay={-20}>
          <g className="amb-blink">
            <circle className="fa4" cx={0} cy={240} r={3} />
          </g>
        </Mover>
        {/* Hill with an observatory */}
        <path className="fa2" d="M 1200 900 Q 1420 700 1650 720 L 1650 900 Z" />
        <rect className="fc2" x={1410} y={720} width={160} height={90} />
        <path className="fc3" d="M 1400 724 A 90 90 0 0 1 1580 724 Z" />
        <Act cls="amb-s-slit" dur={12}>
          <rect className="fd" x={1478} y={642} width={24} height={82} />
        </Act>
        {/* Parent and child at the telescope */}
        <path
          className="fa1"
          d="M 0 900 L 0 840 Q 300 820 560 860 L 600 900 Z"
        />
        <g>
          <g className="ppl" strokeWidth={3}>
            <line x1={270} y1={880} x2={290} y2={780} />
            <line x1={310} y1={880} x2={290} y2={780} />
          </g>
          <g>
            <rect
              className="fb3"
              x={250}
              y={758}
              width={110}
              height={20}
              rx={8}
            />
            {rock(290, 780, -36, -24, 7)}
          </g>
        </g>
        <Figure
          x={210}
          y={884}
          s={0.86}
          pose="stand"
          upper={{ values: [8, 14], dur: 6 }}
        />
        <Act cls="amb-s-off" dur={24}>
          <Figure
            x={100}
            y={886}
            s={0.56}
            pose="stand"
            arms={{ which: "R", values: [-150, -130], dur: 3 }}
          />
        </Act>
        <Act cls="amb-s-on" dur={24}>
          <Act cls="amb-s-jump" dur={0.6}>
            <Figure x={100} y={886} s={0.56} pose="armsUp" />
          </Act>
        </Act>
        {/* Surprise: a meteor shower */}
        {meteors.map(([x, y, d]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(-60)`}>
            <Act cls="amb-s-shower" dur={24} delay={d}>
              <line
                className="sc4"
                x1={0}
                y1={0}
                x2={90}
                y2={0}
                strokeWidth={4}
              />
              <circle className="fb4" r={5} />
            </Act>
          </g>
        ))}
      </Art>
      <div className="amb-particles">
        {particles({
          count: 30,
          seed: 3901,
          className: "amb-p--twinkle twinkle",
          duration: [3, 7],
          size: [0.18, 0.34],
          opacity: [0.35, 0.75],
          top: [3, 45],
        })}
      </div>
    </>
  );
}

/* ── 10. 昆虫採集 Bug hunting in the summer wood (lime & sap) ───────── */

function Butterfly({ cls }: { cls: string }) {
  return (
    <Act cls="amb-s-flap" dur={0.28}>
      <path
        className={cls}
        d="M 0 0 Q -24 -26 -30 -6 Q -26 10 0 2 Q 26 10 30 -6 Q 24 -26 0 0 Z"
      />
    </Act>
  );
}

function Kabuto() {
  return (
    <g>
      <Act cls="amb-s-buzz" dur={0.08}>
        <path
          className="ppb"
          d="M -10 -14 Q -60 -60 -90 -30 Q -40 -18 -10 -6 Z"
        />
        <path className="ppb" d="M 10 -14 Q 60 -60 90 -30 Q 40 -18 10 -6 Z" />
      </Act>
      <ellipse className="pp" cx={0} cy={0} rx={30} ry={20} />
      <circle className="pp" cx={-34} cy={-2} r={12} />
      <path
        className="ppl"
        strokeWidth={6}
        fill="none"
        d="M -44 -6 Q -70 -20 -66 -50 M -66 -50 l -10 -6 M -66 -50 l 8 -8"
      />
      <g className="ppl" strokeWidth={3}>
        <line x1={-14} y1={16} x2={-22} y2={32} />
        <line x1={4} y1={18} x2={0} y2={34} />
        <line x1={18} y1={14} x2={26} y2={30} />
      </g>
    </g>
  );
}

export function Beetle() {
  const flyer = (path: string, dur: number, cls: string, k: number) => (
    <g key={k}>
      <Butterfly cls={cls} />
      {!still() && (
        <animateMotion path={path} dur={`${dur}s`} repeatCount="indefinite" />
      )}
    </g>
  );
  const net = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={70} y2={-130} strokeWidth={4} />
      <circle
        className="ppl"
        cx={84}
        cy={-152}
        r={26}
        strokeWidth={3}
        fill="none"
      />
    </g>
  );
  return (
    <>
      <Art>
        <path
          className="fb3"
          d="M 40 900 Q 70 400 50 0 L 170 0 Q 190 420 190 900 Z"
        />
        <path
          className="fb3"
          d="M 1420 900 Q 1450 420 1430 0 L 1560 0 Q 1580 420 1580 900 Z"
        />
        <path
          className="fb4"
          d="M 1440 520 q 20 -10 40 0 q 6 30 -10 70 q -6 -40 -30 -70 Z"
        />
        {[
          [120, 60, 0],
          [380, 20, 2],
          [1200, 30, 1],
          [1500, 70, 3],
        ].map(([x, y, k]) => (
          <Act key={x} cls="amb-s-leafy" delay={-k!}>
            <path
              className="fa2"
              d={`M ${x! - 180} ${y} q -20 -80 70 -90 q 50 -50 130 -20 q 80 -10 110 50 q 50 40 0 90 q -80 40 -160 10 q -100 20 -150 -40 Z`}
            />
          </Act>
        ))}
        {/* Cicada on the left trunk */}
        <g transform="translate(176 430) rotate(90)">
          <ellipse className="fb4" cx={0} cy={0} rx={16} ry={8} />
          <Act cls="amb-s-buzz" dur={0.07}>
            <path
              className="fc3"
              d="M -6 -4 L 34 -16 L 30 0 Z M -6 4 L 34 16 L 30 0 Z"
            />
          </Act>
        </g>
        {flyer(
          "M 100 300 C 180 200 280 360 200 420 C 120 480 20 380 100 300 Z",
          11,
          "fa4",
          1,
        )}
        {flyer(
          "M 1420 360 C 1500 260 1580 420 1500 480 C 1420 540 1340 420 1420 360 Z",
          13,
          "fc4",
          2,
        )}
        {flyer(
          "M 600 850 C 700 820 800 880 700 890 C 600 900 520 870 600 850 Z",
          9,
          "fb4",
          3,
        )}
        {/* Dragonflies dart and hover */}
        {[
          [1500, 650, 0],
          [90, 640, -2],
        ].map(([x, y, d]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <Act cls="amb-s-dart" dur={6} delay={d}>
              <g className="fc4">
                <rect x={-30} y={-2} width={44} height={4} />
                <ellipse cx={0} cy={-8} rx={4} ry={14} />
                <ellipse cx={0} cy={8} rx={4} ry={14} />
              </g>
            </Act>
          </g>
        ))}
        <path
          className="fa1"
          d="M 0 900 L 0 850 Q 800 820 1600 850 L 1600 900 Z"
        />
        {/* Insect cage */}
        <g transform="translate(1500 884)">
          <rect
            className="fa3"
            x={-50}
            y={-70}
            width={100}
            height={70}
            rx={6}
          />
          <g className="sa3" strokeWidth={2}>
            {[-30, -10, 10, 30].map((x) => (
              <line key={x} x1={x} y1={-64} x2={x} y2={-6} />
            ))}
          </g>
          <path
            className="sa3"
            fill="none"
            strokeWidth={3}
            d="M -30 -70 q 30 -30 60 0"
          />
        </g>
        {/* Kid with a net */}
        <Act cls="amb-s-off" dur={24}>
          <Figure
            x={180}
            y={888}
            s={0.66}
            pose="stand"
            hand={net}
            headwear={<path className="ppa" d="M -18 -4 Q 0 -26 18 -4 Z" />}
            arms={{ which: "R", values: [-40, 20], dur: 2.4 }}
          />
        </Act>
        <Act cls="amb-s-on" dur={24}>
          <Act cls="amb-s-jump" dur={0.6}>
            <Figure
              x={180}
              y={888}
              s={0.66}
              pose="armsUp"
              hand={net}
              headwear={<path className="ppa" d="M -18 -4 Q 0 -26 18 -4 Z" />}
            />
          </Act>
        </Act>
        {/* Surprise A: a rhinoceros beetle flies across */}
        <g transform="translate(0 0)">
          <Act cls="amb-s-beetle" dur={24}>
            <g className="amb-person amb-s-bold">
              <Kabuto />
            </g>
          </Act>
        </g>
        {/* Surprise B: a stag beetle peeks out by the sap */}
        <g transform="translate(1426 560) rotate(-90)">
          <Act cls="amb-s-peek-late" dur={24}>
            <g className="amb-person amb-s-bold">
              <ellipse className="pp" cx={0} cy={0} rx={22} ry={14} />
              <path
                className="ppl"
                strokeWidth={5}
                fill="none"
                d="M -20 -6 q -20 -14 -30 0 M -20 6 q -20 14 -30 0"
              />
            </g>
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 6,
          seed: 4001,
          className: "amb-p--leaf fall",
          duration: [14, 22],
          size: [0.8, 1.2],
          opacity: [0.2, 0.35],
        })}
      </div>
    </>
  );
}
