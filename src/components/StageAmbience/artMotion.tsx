import type { CSSProperties, ReactNode } from "react";
import { Art } from "./artKit";
import { Figure } from "./figure";
import { particles, pick, rock, seeded, spin, still } from "./scenery";
import type { SceneProps } from "./artJapan";

/*
 * Twenty motion scenes, each with its own colour palette (a tinted sky in
 * stageAmbience.css, dark at the top so the header stays readable).
 * Same rules as before: faint, at the edges and along the bottom, the centre
 * left open, no ids, motion off under prefers-reduced-motion.
 *
 * Kite faces, floating lanterns and the lucky cats' coins show the current
 * word's kanji.
 */

/** A moving group: CSS class drives the travel, style sets timing. */
export function Mover({
  cls,
  dur,
  delay = 0,
  children,
}: {
  cls: string;
  dur: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <g
      className={cls}
      style={
        {
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </g>
  );
}

/* ── Bicycle with a pedalling rider ───────────────────────────────── */

const CRANK = 17;
const THIGH = 46;
const SHIN = 50;

type P2 = readonly [number, number];

/** Knee position for hip → foot, bending forward (two-circle intersection). */
function knee(h: P2, f: P2): P2 {
  const dx = f[0] - h[0];
  const dy = f[1] - h[1];
  const d = Math.min(Math.hypot(dx, dy), THIGH + SHIN - 0.5);
  const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
  const hgt = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));
  const bx = h[0] + (a * dx) / d;
  const by = h[1] + (a * dy) / d;
  const k1: P2 = [bx - (hgt * dy) / d, by + (hgt * dx) / d];
  const k2: P2 = [bx + (hgt * dy) / d, by - (hgt * dx) / d];
  return k1[0] > k2[0] ? k1 : k2;
}

const f1 = (n: number) => n.toFixed(1);

/** Leg polyline keyframes over one crank turn, starting at `phase`. */
function pedalFrames(hip: P2, bb: P2, phase: number, n = 12): string {
  const frames: string[] = [];
  for (let k = 0; k <= n; k++) {
    const t = phase + (2 * Math.PI * k) / n;
    const foot: P2 = [bb[0] + CRANK * Math.cos(t), bb[1] + CRANK * Math.sin(t)];
    const kn = knee(hip, foot);
    frames.push(
      `${f1(hip[0])},${f1(hip[1])} ${f1(kn[0])},${f1(kn[1])} ${f1(foot[0])},${f1(foot[1])}`,
    );
  }
  return frames.join(";");
}

export function Wheel({
  cx,
  cy,
  r,
  dur,
}: {
  cx: number;
  cy: number;
  r: number;
  dur: number;
}) {
  return (
    <g>
      <circle
        className="ppl"
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={4}
        fill="none"
      />
      <g>
        <g className="ppl" strokeWidth={1.5}>
          {[0, 45, 90, 135].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={cx - r * Math.cos(rad)}
                y1={cy - r * Math.sin(rad)}
                x2={cx + r * Math.cos(rad)}
                y2={cy + r * Math.sin(rad)}
              />
            );
          })}
        </g>
        {spin(cx, cy, dur)}
      </g>
    </g>
  );
}

/** Rider on a bicycle, facing right, wheels on y = 34. */
function Cyclist({
  x,
  y,
  s = 1,
  flip,
  depth = "near",
  cadence = 0.9,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  depth?: "near" | "far";
  cadence?: number;
}) {
  const hip: P2 = [-26, -58];
  const bb: P2 = [-6, 6];
  const legA = pedalFrames(hip, bb, 0);
  const legB = pedalFrames(hip, bb, Math.PI);
  const first = (frames: string) => frames.split(";")[0]!;
  const animated = !still();
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className={`amb-person amb-person--${depth}`}>
        <polyline className="ppl" points={first(legB)} strokeWidth={9}>
          {animated && (
            <animate
              attributeName="points"
              values={legB}
              dur={`${cadence}s`}
              repeatCount="indefinite"
            />
          )}
        </polyline>
        <Wheel cx={-58} cy={0} r={34} dur={cadence * 0.7} />
        <Wheel cx={58} cy={0} r={34} dur={cadence * 0.7} />
        <g className="ppl" strokeWidth={5} fill="none">
          <path d="M -58 0 L -6 6 L -26 -52 Z M -26 -52 L 32 -48 L 58 0 M -6 6 L 32 -48 M 32 -48 L 36 -62 L 48 -62" />
        </g>
        <rect className="pp" x={-38} y={-60} width={24} height={6} rx={3} />
        <line
          className="ppl"
          x1={-26}
          y1={-58}
          x2={2}
          y2={-104}
          strokeWidth={22}
        />
        <circle className="pp" cx={14} cy={-124} r={13} />
        <polyline
          className="ppl"
          points="2,-100 24,-80 46,-62"
          strokeWidth={8}
        />
        <polyline className="ppl" points={first(legA)} strokeWidth={9}>
          {animated && (
            <animate
              attributeName="points"
              values={legA}
              dur={`${cadence}s`}
              repeatCount="indefinite"
            />
          )}
        </polyline>
      </g>
    </g>
  );
}

/* ── 1. 自転車 Riverside cycling at sunset ────────────────────────── */

export function Cycling() {
  return (
    <Art>
      <circle className="fc2" cx={1310} cy={700} r={170} />
      <circle className="fc3" cx={1310} cy={700} r={92} />
      <path
        className="fa2"
        d="M 0 660 L 120 630 L 260 650 L 420 600 L 520 640 L 640 660 L 0 660 Z"
      />
      <g className="sa2" fill="none" strokeWidth="3">
        <path d="M 40 660 L 40 560 M 130 660 L 130 540 M 40 580 L 130 560 M 40 620 L 130 600" />
        <path d="M -20 600 L 300 580" />
      </g>
      <rect className="fb2" x={0} y={700} width={1600} height={140} />
      <g className="amb-shimmer sb3" strokeWidth="3" strokeLinecap="round">
        <path d="M 1180 730 H 1300 M 1240 752 H 1420 M 1300 776 H 1380 M 120 740 H 260 M 600 790 H 760" />
      </g>
      <path className="fa3" d="M 0 840 H 1600 V 856 H 0 Z" />
      <path
        className="fa2"
        d="M 0 760 Q 400 774 800 762 T 1600 768 L 1600 778 L 0 778 Z"
      />
      <Mover cls="amb-ride" dur={17} delay={-5}>
        <Cyclist x={0} y={806} s={1.0} />
      </Mover>
      <Mover cls="amb-ride amb-ride--back" dur={26} delay={-11}>
        <Cyclist x={0} y={816} s={0.66} flip depth="far" cadence={1.1} />
      </Mover>
      <g
        className="amb-birds"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M 300 250 q 12 -10 24 0 q 12 -10 24 0" />
        <path d="M 352 228 q 9 -8 18 0 q 9 -8 18 0" />
      </g>
    </Art>
  );
}

/* ── 2. 凧揚げ Kite flying ─────────────────────────────────────────── */

function Kite({
  hand,
  at,
  ch,
  tone,
  swing,
  shape,
}: {
  hand: P2;
  at: P2;
  ch: string;
  tone: string;
  swing: number;
  shape: "box" | "diamond";
}) {
  const [hx, hy] = hand;
  const [kx, ky] = at;
  const body =
    shape === "box" ? (
      <rect className={tone} x={-46} y={-56} width={92} height={112} rx={4} />
    ) : (
      <path className={tone} d="M 0 -70 L 56 0 L 0 70 L -56 0 Z" />
    );
  return (
    <g
      className="amb-kite"
      style={
        {
          transformOrigin: `${hx}px ${hy}px`,
          animationDuration: `${swing}s`,
        } as CSSProperties
      }
    >
      <path
        className="sb2"
        fill="none"
        strokeWidth="1.5"
        d={`M ${hx} ${hy} Q ${(hx + kx) / 2} ${(hy + ky) / 2 + 80} ${kx} ${ky + 56}`}
      />
      <g
        transform={`translate(${kx} ${ky}) rotate(${shape === "box" ? 8 : -6})`}
      >
        <g className="amb-kite-wobble">
          {body}
          <g className="sa3" strokeWidth="2.5">
            {shape === "box" ? (
              <path d="M -46 -56 L 46 56 M 46 -56 L -46 56" />
            ) : (
              <path d="M 0 -70 V 70 M -56 0 H 56" />
            )}
          </g>
          <text
            className="amb-glyph gink"
            x={0}
            y={2}
            fontSize={shape === "box" ? 58 : 46}
          >
            {ch}
          </text>
          <g
            className="amb-tail sb3"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M -14 60 q -16 30 0 60 t 0 60" />
            <path d="M 14 60 q 16 30 0 60 t 0 60" />
          </g>
        </g>
      </g>
    </g>
  );
}

export function KiteFlying({ glyphs }: SceneProps) {
  const [a, b] = pick(glyphs, "凧空", 2);
  return (
    <Art>
      <g className="amb-cloud fb1">
        <rect x={60} y={420} width={300} height={34} rx={17} />
        <rect x={1240} y={460} width={320} height={30} rx={15} />
      </g>
      <path
        className="fa2"
        d="M 0 860 Q 400 820 800 850 T 1600 830 L 1600 900 L 0 900 Z"
      />
      <Kite
        hand={[262, 726]}
        at={[170, 170]}
        ch={a!}
        tone="fc3"
        swing={7}
        shape="box"
      />
      <Kite
        hand={[1338, 734]}
        at={[1440, 210]}
        ch={b!}
        tone="fb3"
        swing={9}
        shape="diamond"
      />
      <Figure x={250} y={880} s={0.8} pose="armsUp" />
      <Figure x={1350} y={884} s={0.8} pose="armsUp" flip />
      <Mover cls="amb-ride" dur={14} delay={-3}>
        <Figure
          x={0}
          y={890}
          s={0.62}
          pose="walk"
          stride={{ deg: 24, dur: 0.5 }}
        />
        <path
          className="sb2"
          fill="none"
          strokeWidth="1.5"
          d="M 6 830 Q -40 800 -90 760"
        />
        <path
          className="fc3 amb-kite-wobble"
          d="M -90 742 L -66 760 L -90 778 L -114 760 Z"
        />
      </Mover>
    </Art>
  );
}

/* ── 3. 江ノ電 Seaside tram ────────────────────────────────────────── */

function TramCar({ x }: { x: number }) {
  return (
    <g>
      <rect className="fa3" x={x} y={0} width={360} height={30} rx={12} />
      <rect className="fc3" x={x} y={30} width={360} height={44} />
      <rect className="fa3" x={x} y={70} width={360} height={6} />
      <g className="fb3">
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={x + 22 + i * 56}
            y={8}
            width={38}
            height={18}
            rx={3}
          />
        ))}
      </g>
      <g className="fd">
        <circle cx={x + 70} cy={84} r={10} />
        <circle cx={x + 290} cy={84} r={10} />
      </g>
    </g>
  );
}

export function Enoden() {
  return (
    <>
      <Art>
        <circle className="fc2" cx={300} cy={620} r={120} />
        <rect className="fb2" x={0} y={640} width={1600} height={260} />
        <path
          className="fa2"
          d="M 1240 640 Q 1300 580 1380 590 Q 1460 560 1540 600 L 1600 610 L 1600 640 Z"
        />
        <rect className="fa2" x={1440} y={500} width={10} height={70} />
        <circle className="fc4 amb-blink" cx={1445} cy={496} r={7} />
        <g className="amb-shimmer sb3" strokeWidth="3" strokeLinecap="round">
          <path d="M 200 690 H 360 M 260 714 H 440 M 900 700 H 1060 M 1100 730 H 1240" />
        </g>
        <rect className="fa3" x={0} y={846} width={1600} height={10} />
        <g className="fa2">
          {Array.from({ length: 34 }, (_, i) => (
            <rect key={i} x={i * 48} y={856} width={30} height={8} />
          ))}
        </g>
        <Mover cls="amb-pass" dur={26} delay={-6}>
          <g transform="translate(0 762)">
            <TramCar x={0} />
            <TramCar x={368} />
            <path
              className="fa3"
              d="M 728 0 Q 760 4 760 40 L 760 76 L 728 76 Z"
            />
          </g>
        </Mover>
        <g>
          <rect className="fa3" x={120} y={660} width={8} height={190} />
          <path
            className="sa3"
            strokeWidth="8"
            d="M 92 670 L 156 702 M 156 670 L 92 702"
          />
          <circle className="fc4 amb-blink" cx={106} cy={724} r={9} />
          <circle
            className="fc4 amb-blink amb-blink--alt"
            cx={142}
            cy={724}
            r={9}
          />
        </g>
      </Art>
      <div className="amb-particles">
        <svg
          className="amb-art"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <g
            className="amb-birds"
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M 300 200 q 12 -10 24 0 q 12 -10 24 0" />
          </g>
        </svg>
      </div>
    </>
  );
}

/* ── 4. 灯籠流し Floating lanterns ─────────────────────────────────── */

export function Toro({ glyphs }: SceneProps) {
  const r = seeded(401);
  const chars = pick(glyphs, "祈灯和心", 4);
  const lanterns = Array.from({ length: 11 }, (_, i) => {
    const depth = r();
    const y = 640 + depth * 220;
    const s = 0.55 + depth * 0.65;
    return {
      y,
      s,
      dur: 70 - depth * 30,
      delay: -r() * 70,
      ch: chars[i % chars.length]!,
    };
  }).sort((a, b) => a.y - b.y);
  return (
    <Art>
      <path
        className="fa2"
        d="M 0 590 Q 200 560 420 580 Q 640 600 800 586 Q 1000 568 1200 584 Q 1400 600 1600 580 L 1600 620 L 0 620 Z"
      />
      <path className="fa3" d="M 1300 584 L 1360 550 L 1420 584 Z" />
      <rect className="fb1" x={0} y={620} width={1600} height={280} />
      <g className="amb-shimmer sb2" strokeWidth="2" strokeLinecap="round">
        <path d="M 120 680 H 260 M 520 720 H 700 M 1000 690 H 1140 M 1260 780 H 1460 M 300 840 H 520" />
      </g>
      {lanterns.map((l, i) => (
        <Mover key={i} cls="amb-drift" dur={l.dur} delay={l.delay}>
          <g transform={`translate(0 ${l.y}) scale(${l.s})`}>
            <g
              className="amb-bobble"
              style={{ animationDelay: `${-i * 0.7}s` }}
            >
              <ellipse className="fc1" cx={0} cy={-20} rx={70} ry={50} />
              <rect className="fa3" x={-26} y={-4} width={52} height={8} />
              <rect className="fc3" x={-22} y={-46} width={44} height={42} />
              <path className="fa3" d="M -26 -46 L 0 -60 L 26 -46 Z" />
              <text className="amb-glyph gink" x={0} y={-24} fontSize={26}>
                {l.ch}
              </text>
              <ellipse className="fc2" cx={0} cy={22} rx={20} ry={30} />
            </g>
          </g>
        </Mover>
      ))}
      <Figure x={80} y={640} s={0.62} pose="crouch" robe depth="far" />
      <Figure x={1520} y={636} s={0.6} pose="stand" robe flip depth="far" />
    </Art>
  );
}

/* ── 5. 蛍 Fireflies over the rice field ───────────────────────────── */

export function Hotaru() {
  const reeds = (x0: number, flip: boolean, seed: number) => {
    const r = seeded(seed);
    return (
      <g className="amb-sway">
        {Array.from({ length: 9 }, (_, i) => {
          const x = x0 + (flip ? -1 : 1) * i * 22;
          const top = 560 + r() * 160;
          return (
            <path
              key={i}
              className="sa2"
              fill="none"
              strokeWidth="3"
              d={`M ${x} 900 Q ${x + (flip ? -1 : 1) * 10} ${(top + 900) / 2} ${x + (flip ? -1 : 1) * (20 + r() * 30)} ${top}`}
            />
          );
        })}
      </g>
    );
  };
  const net = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={60} y2={-90} strokeWidth={3} />
      <ellipse
        className="ppl"
        cx={70}
        cy={-104}
        rx={18}
        ry={14}
        fill="none"
        strokeWidth={3}
      />
    </g>
  );
  return (
    <>
      <Art>
        <path
          className="fb2"
          d="M 1440 120 A 40 40 0 1 0 1480 190 A 32 32 0 1 1 1440 120 Z"
        />
        <path
          className="fa1"
          d="M 0 760 Q 400 720 800 750 T 1600 740 L 1600 900 L 0 900 Z"
        />
        <g className="sa2" strokeWidth="2">
          {Array.from({ length: 5 }, (_, i) => (
            <path
              key={i}
              fill="none"
              d={`M 0 ${790 + i * 22} Q 800 ${770 + i * 22} 1600 ${786 + i * 22}`}
            />
          ))}
        </g>
        {reeds(20, false, 501)}
        {reeds(1580, true, 503)}
        <Figure
          x={300}
          y={884}
          s={0.82}
          pose="stand"
          robe
          hand={net}
          arms={{ which: "R", values: [-40, -90, -40], dur: 5 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 24,
          seed: 509,
          className: "amb-p--firefly firefly",
          duration: [5, 9],
          size: [0.45, 0.75],
          opacity: [0.55, 0.9],
          top: [44, 92],
        })}
      </div>
    </>
  );
}

/* ── 6. 観覧車 Ferris wheel by the bay ─────────────────────────────── */

export function Kanransha() {
  const cx = 1460;
  const cy = 430;
  const R = 250;
  const n = 16;
  const tones = ["fa4", "fb4", "fc4", "fb3"];
  return (
    <Art>
      <g className="fa2">
        {[30, 110, 170, 250, 330, 410].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={640 - ((i * 61) % 150)}
            width={64}
            height={260}
          />
        ))}
      </g>
      <path
        className="sa3"
        fill="none"
        strokeWidth="10"
        d={`M ${cx - 150} 900 L ${cx} ${cy} L ${cx + 150} 900`}
      />
      <g>
        <circle
          className="sa3"
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          strokeWidth="6"
        />
        <g className="sa2" strokeWidth="2">
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + R * Math.cos(a)}
                y2={cy + R * Math.sin(a)}
              />
            );
          })}
        </g>
        <g className="amb-hue">
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return (
              <circle
                key={i}
                className={tones[i % tones.length]}
                cx={cx + R * Math.cos(a)}
                cy={cy + R * Math.sin(a)}
                r={17}
              />
            );
          })}
        </g>
        {spin(cx, cy, 70)}
      </g>
      <circle className="fc3" cx={cx} cy={cy} r={16} />
      <rect className="fb1" x={0} y={760} width={1600} height={140} />
      <ellipse className="fc1 amb-shimmer" cx={cx} cy={820} rx={240} ry={40} />
      <g className="amb-shimmer sb3" strokeWidth="2" strokeLinecap="round">
        <path d="M 60 800 H 200 M 280 830 H 420 M 1200 790 H 1340" />
      </g>
      <Mover cls="amb-pass" dur={34} delay={-14}>
        <path className="fa3" d="M 0 780 L 160 780 L 140 806 L 20 806 Z" />
        <rect className="fa3" x={50} y={758} width={70} height={22} />
        <circle className="fc4" cx={90} cy={769} r={4} />
      </Mover>
    </Art>
  );
}

/* ── 7. 水族館 Aquarium tunnel ─────────────────────────────────────── */

function Jelly({
  x,
  y,
  s,
  dur,
  delay,
}: {
  x: number;
  y: number;
  s: number;
  dur: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="amb-jelly-drift"
        style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
      >
        <g className="amb-jelly">
          <path
            className="fb3"
            d="M -50 0 Q -50 -60 0 -62 Q 50 -60 50 0 Q 25 -10 0 0 Q -25 -10 -50 0 Z"
          />
          <g
            className="amb-tentacles sb3"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          >
            {[-30, -10, 10, 30].map((tx) => (
              <path key={tx} d={`M ${tx} -2 q 10 30 0 60 t 0 60`} />
            ))}
          </g>
        </g>
      </g>
    </g>
  );
}

export function Aquarium() {
  const fish = Array.from({ length: 9 }, (_, i) => (
    <g
      key={i}
      transform={`translate(${(i % 3) * 46 + (i > 5 ? 20 : 0)} ${Math.floor(i / 3) * 26})`}
    >
      <ellipse className="fb3" cx={0} cy={0} rx={16} ry={6} />
      <path className="fb3" d="M -14 0 L -26 -7 L -26 7 Z" />
    </g>
  ));
  return (
    <>
      <div className="amb-ray amb-ray--1" />
      <div className="amb-ray amb-ray--2" />
      <Art>
        <path
          className="sa3"
          fill="none"
          strokeWidth="26"
          d="M -20 900 L -20 300 Q 0 -40 800 -60 Q 1600 -40 1620 300 L 1620 900"
        />
        <Jelly x={170} y={420} s={1.1} dur={12} delay={0} />
        <Jelly x={1450} y={330} s={0.9} dur={15} delay={-5} />
        <Jelly x={1330} y={560} s={0.6} dur={11} delay={-8} />
        <Mover cls="amb-pass amb-pass--slow" dur={30} delay={-10}>
          <g transform="translate(0 700)">{fish}</g>
        </Mover>
        <Mover cls="amb-pass amb-pass--back" dur={38} delay={-22}>
          <g transform="translate(0 220) scale(-0.8 0.8)">{fish}</g>
        </Mover>
        <path
          className="fa2"
          d="M 0 900 L 0 840 Q 200 820 400 846 L 400 900 Z M 1600 900 L 1600 830 Q 1400 816 1240 846 L 1240 900 Z"
        />
        <Figure x={120} y={890} s={0.95} pose="stand" depth="far" />
        <Figure
          x={200}
          y={892}
          s={0.62}
          pose="stand"
          arms={{ which: "R", values: [-100, -110, -100], dur: 3 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 9,
          seed: 701,
          className: "amb-p--bubble rise",
          duration: [14, 22],
          size: [0.4, 0.8],
          opacity: [0.2, 0.32],
          left: [4, 96],
        })}
      </div>
    </>
  );
}

/* ── 8. 波乗り Surfing ─────────────────────────────────────────────── */

export function Surf() {
  const surfer = (
    <g>
      <path
        className="ppc"
        d="M -70 6 Q 0 -6 70 6 Q 0 16 -70 6 Z"
        opacity={0.9}
      />
      <Figure x={0} y={0} s={0.62} pose="crouch" />
    </g>
  );
  return (
    <Art>
      <circle className="fc2" cx={1420} cy={170} r={60} />
      <g transform="translate(-120 120) scale(0.92)">
        <g className="amb-wave-roll">
          <path
            className="fb2"
            d="M -40 900 L -40 620 Q 120 470 330 520 Q 470 560 480 640 Q 420 600 360 620 Q 300 650 340 720 Q 420 820 760 860 L 900 900 Z"
          />
          <path
            className="fb3"
            d="M -40 900 L -40 700 Q 160 620 330 700 Q 460 780 700 860 L 820 900 Z"
          />
          <g className="fa3">
            {Array.from({ length: 10 }, (_, i) => (
              <circle
                key={i}
                cx={360 + Math.cos(Math.PI * (1.1 + i * 0.09)) * 120}
                cy={600 + Math.sin(Math.PI * (1.1 + i * 0.09)) * 80}
                r={7 - i * 0.4}
              />
            ))}
          </g>
        </g>
        <g className="amb-surfer">
          <g transform="translate(420 720) rotate(-14)">{surfer}</g>
        </g>
      </g>
      <path className="fa2" d="M 1000 900 Q 1200 820 1600 810 L 1600 900 Z" />
      <g transform="translate(1380 790)">
        <line className="sa3" x1={0} y1={0} x2={0} y2={-120} strokeWidth={5} />
        <path className="fc3" d="M -90 -110 Q 0 -170 90 -110 Z" />
      </g>
      <g
        className="amb-birds"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M 300 240 q 14 -12 28 0 q 14 -12 28 0" />
        <path d="M 360 210 q 10 -8 20 0 q 10 -8 20 0" />
      </g>
    </Art>
  );
}

/* ── 9. 熱気球 Hot-air balloons at dawn ─────────────────────────────── */

function Balloon({
  tone,
  stripe,
  s,
}: {
  tone: string;
  stripe: string;
  s: number;
}) {
  return (
    <g transform={`scale(${s})`}>
      <path
        className={tone}
        d="M 0 -150 C 80 -150 92 -60 40 0 L -40 0 C -92 -60 -80 -150 0 -150 Z"
      />
      <path
        className={stripe}
        d="M 0 -150 C 30 -150 36 -60 14 0 L -14 0 C -36 -60 -30 -150 0 -150 Z"
      />
      <g className="sa3" strokeWidth="1.5">
        <line x1={-36} y1={0} x2={-14} y2={34} />
        <line x1={36} y1={0} x2={14} y2={34} />
      </g>
      <rect className="fa3" x={-16} y={34} width={32} height={22} rx={3} />
      <path className="fc4 amb-flame" d="M -6 2 Q 0 -18 6 2 Z" />
    </g>
  );
}

export function Balloons() {
  const list = [
    { x: 110, s: 0.9, tone: "fc3", stripe: "fa3", dur: 46, delay: -6 },
    { x: 300, s: 0.6, tone: "fb3", stripe: "fc3", dur: 58, delay: -30 },
    { x: 1300, s: 1.0, tone: "fa3", stripe: "fb3", dur: 52, delay: -18 },
    { x: 1490, s: 0.65, tone: "fc3", stripe: "fb3", dur: 64, delay: -44 },
    { x: 200, s: 0.45, tone: "fa3", stripe: "fc3", dur: 70, delay: -52 },
  ];
  return (
    <Art>
      <circle className="fc2" cx={800} cy={930} r={260} />
      <path
        className="fa2"
        d="M 0 820 Q 260 760 520 800 Q 800 840 1080 790 Q 1340 750 1600 800 L 1600 900 L 0 900 Z"
      />
      <path
        className="fa3"
        d="M 0 870 Q 400 840 800 860 T 1600 850 L 1600 900 L 0 900 Z"
      />
      {list.map((b, i) => (
        <g key={i} transform={`translate(${b.x} 1000)`}>
          <Mover cls="amb-rise-balloon" dur={b.dur} delay={b.delay}>
            <Balloon tone={b.tone} stripe={b.stripe} s={b.s} />
          </Mover>
        </g>
      ))}
    </Art>
  );
}

/* ── 10. 駅伝 Ekiden relay ─────────────────────────────────────────── */

export function Ekiden() {
  const sash = (
    <path className="ppc" d="M -10 -134 L 12 -132 L -6 -90 L -16 -94 Z" />
  );
  const flag = <rect className="ppa" x={-2} y={-24} width={22} height={14} />;
  const crowd = (x0: number, flip: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <Figure
        key={i}
        x={x0 + (flip ? -1 : 1) * i * 52}
        y={760 + (i % 2) * 10}
        s={0.62}
        pose="stand"
        flip={flip}
        depth="far"
        hand={i % 2 === 0 ? flag : undefined}
        arms={
          i % 2 === 0
            ? { which: "R", values: [-150, -110, -150], dur: 0.9 + i * 0.1 }
            : undefined
        }
      />
    ));
  return (
    <Art>
      <path
        className="fa2"
        d="M 0 770 Q 800 740 1600 770 L 1600 900 L 0 900 Z"
      />
      <path
        className="sb2"
        fill="none"
        strokeWidth="4"
        strokeDasharray="40 30"
        d="M 0 840 Q 800 812 1600 840"
      />
      {crowd(40, false)}
      {crowd(1560, true)}
      <Mover cls="amb-ride" dur={12} delay={-2}>
        <Figure
          x={0}
          y={880}
          s={1.0}
          pose="walk"
          stride={{ deg: 30, dur: 0.55 }}
          front={sash}
        />
      </Mover>
      <Mover cls="amb-ride" dur={12} delay={-8}>
        <Figure
          x={0}
          y={884}
          s={0.96}
          pose="walk"
          stride={{ deg: 30, dur: 0.5 }}
          depth="far"
        />
      </Mover>
    </Art>
  );
}

/* ── 11. 運動会 Sports day ──────────────────────────────────────────── */

function Bunting({
  x0,
  y0,
  x1,
  y1,
  seed,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  seed: number;
}) {
  const r = seeded(seed);
  const tones = ["fa4", "fb4", "fc4", "fa3", "fc3"];
  const n = 9;
  return (
    <g>
      <path
        className="sb2"
        fill="none"
        strokeWidth="2"
        d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2 + 70} ${x1} ${y1}`}
      />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t + 70 * Math.sin(Math.PI * t) * 0.9;
        return (
          <rect
            key={i}
            className={`amb-strip ${tones[Math.floor(r() * tones.length)]}`}
            style={{ animationDelay: `${(-r() * 4).toFixed(2)}s` }}
            x={x - 14}
            y={y}
            width={28}
            height={20}
          />
        );
      })}
    </g>
  );
}

export function Undokai() {
  return (
    <Art>
      <Bunting x0={-10} y0={110} x1={460} y1={190} seed={1101} />
      <Bunting x0={1610} y0={110} x1={1140} y1={190} seed={1103} />
      <path className="fa1" d="M 0 760 H 1600 V 900 H 0 Z" />
      <g className="sb2" fill="none" strokeWidth="3">
        <path d="M 0 800 Q 800 770 1600 800 M 0 860 Q 800 830 1600 860" />
      </g>
      <g className="amb-tug">
        <line
          className="sa3"
          x1={40}
          y1={820}
          x2={560}
          y2={820}
          strokeWidth={5}
        />
        <rect className="fc4" x={294} y={820} width={12} height={22} />
        {[60, 130, 200].map((x, i) => (
          <Figure
            key={x}
            x={x}
            y={880}
            s={0.72}
            pose="kamae"
            upper={{ values: [-18, -24], dur: 1.2, begin: -i * 0.2 }}
          />
        ))}
        {[400, 470, 540].map((x, i) => (
          <Figure
            key={x}
            x={x}
            y={880}
            s={0.72}
            pose="kamae"
            flip
            upper={{ values: [-18, -24], dur: 1.2, begin: -i * 0.3 }}
          />
        ))}
      </g>
      <rect className="fa3" x={1360} y={520} width={8} height={300} />
      <path
        className="sa3"
        fill="none"
        strokeWidth="4"
        d="M 1336 520 Q 1364 560 1392 520"
      />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className={i % 2 ? "fb4 amb-toss" : "fc4 amb-toss"}
          style={{ animationDelay: `${-i * 0.9}s` }}
          cx={1290 + i * 40}
          cy={820}
          r={9}
        />
      ))}
      <Figure
        x={1290}
        y={884}
        s={0.62}
        pose="armsUp"
        arms={{ which: "both", values: [10, -20, 10], dur: 2.7 }}
      />
      <Figure
        x={1450}
        y={884}
        s={0.62}
        pose="armsUp"
        flip
        arms={{ which: "both", values: [10, -20, 10], dur: 2.7, begin: -1.3 }}
      />
    </Art>
  );
}

/* ── 12. 洗濯物 Laundry day ────────────────────────────────────────── */

function Shirt({
  x,
  y,
  tone,
  delay,
}: {
  x: number;
  y: number;
  tone: string;
  delay: number;
}) {
  return (
    <g className="amb-strip" style={{ animationDelay: `${delay}s` }}>
      <path
        className={tone}
        d={`M ${x - 34} ${y} L ${x - 12} ${y} Q ${x} ${y + 8} ${x + 12} ${y} L ${x + 34} ${y} L ${x + 50} ${y + 26} L ${x + 30} ${y + 34} L ${x + 28} ${y + 96} L ${x - 28} ${y + 96} L ${x - 30} ${y + 34} L ${x - 50} ${y + 26} Z`}
      />
    </g>
  );
}

export function Laundry() {
  return (
    <Art>
      <rect className="fa2" x={0} y={0} width={110} height={900} />
      <rect className="fa1" x={1490} y={0} width={110} height={900} />
      <line
        className="sa3"
        x1={90}
        y1={240}
        x2={470}
        y2={240}
        strokeWidth={5}
      />
      <Shirt x={170} y={244} tone="fc3" delay={0} />
      <g className="amb-strip" style={{ animationDelay: "-1.2s" }}>
        <rect className="fb3" x={250} y={244} width={70} height={130} />
        <g className="sb2" strokeWidth="3">
          <line x1={250} y1={350} x2={320} y2={350} />
          <line x1={250} y1={360} x2={320} y2={360} />
        </g>
      </g>
      <Shirt x={400} y={244} tone="fa3" delay={-2.3} />
      <g className="sa3" strokeWidth="5">
        <line x1={0} y1={520} x2={480} y2={520} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 56 + 10} y1={520} x2={i * 56 + 10} y2={620} />
        ))}
        <line x1={0} y1={620} x2={480} y2={620} />
      </g>
      <g className="amb-flutter" style={{ animationDuration: "5s" }}>
        <path
          className="fb3"
          d="M 1140 520 L 1490 520 L 1490 660 Q 1310 680 1140 660 Z"
        />
        <path
          className="fc3"
          d="M 1140 520 L 1490 520 L 1490 548 L 1140 548 Z"
        />
      </g>
      <line
        className="sa3"
        x1={1110}
        y1={520}
        x2={1500}
        y2={520}
        strokeWidth={6}
      />
      <Figure
        x={1250}
        y={520}
        s={0.8}
        pose="stand"
        flip
        depth="far"
        hand={
          <path
            className="ppl"
            d="M 0 0 L 18 -50 M 6 -54 Q 18 -74 30 -54"
            strokeWidth={3}
            fill="none"
          />
        }
        arms={{ which: "R", values: [-40, -120, -40], dur: 0.9 }}
      />
      <Mover cls="amb-pass amb-pass--slow" dur={60} delay={-20}>
        <g transform="translate(0 130)">
          <path className="fb3" d="M 0 0 L 40 -4 L 46 0 L 40 4 Z" />
          <line
            className="sb2"
            x1={-400}
            y1={0}
            x2={0}
            y2={0}
            strokeWidth={3}
          />
        </g>
      </Mover>
    </Art>
  );
}

/* ── 13. 出前 Delivery scooter ─────────────────────────────────────── */

export function Demae() {
  const houses = Array.from({ length: 7 }, (_, i) => {
    const x = i * 240 - 20;
    return (
      <g key={i}>
        <rect className="fa2" x={x} y={620} width={220} height={280} />
        <path
          className="fa3"
          d={`M ${x - 10} 626 L ${x + 110} 576 L ${x + 230} 626 Z`}
        />
        <rect
          className={i % 2 ? "fc2" : "fb2"}
          x={x + 60}
          y={700}
          width={100}
          height={80}
        />
        <g className="amb-strip" style={{ animationDelay: `${-i * 0.6}s` }}>
          <rect className="fc3" x={x + 60} y={700} width={100} height={34} />
        </g>
      </g>
    );
  });
  const helmet = (
    <path className="pp" d="M -16 -2 Q -16 -22 0 -22 Q 16 -22 16 -2 Z" />
  );
  return (
    <Art>
      {houses}
      <g className="sa2" strokeWidth="2" fill="none">
        <path d="M 0 420 Q 400 470 800 430 T 1600 440 M 0 450 Q 400 500 800 460 T 1600 470" />
      </g>
      <rect className="fa3" x={380} y={380} width={10} height={520} />
      <rect className="fa3" x={1180} y={380} width={10} height={520} />
      <rect className="fa1" x={0} y={850} width={1600} height={50} />
      <Mover cls="amb-pass" dur={18} delay={-4}>
        <g transform="translate(0 862)">
          <path className="fc1" d="M 70 -30 L 300 -60 L 300 0 L 70 -8 Z" />
          <Wheel cx={-40} cy={-22} r={22} dur={0.35} />
          <Wheel cx={60} cy={-22} r={22} dur={0.35} />
          <path className="fc3" d="M -60 -40 L 30 -44 L 64 -22 L -20 -22 Z" />
          <rect className="fb3" x={-82} y={-96} width={50} height={46} rx={4} />
          <line
            className="sa3"
            x1={40}
            y1={-44}
            x2={50}
            y2={-78}
            strokeWidth={5}
          />
          <circle className="fc4" cx={64} cy={-56} r={7} />
          <Figure x={-10} y={-40} s={0.62} pose="chair" headwear={helmet} />
        </g>
      </Mover>
      <g transform="translate(1440 850)">
        <ellipse className="fa3" cx={0} cy={-22} rx={24} ry={20} />
        <circle className="fa3" cx={18} cy={-46} r={13} />
        <path
          className="fa3"
          d="M 8 -54 L 12 -70 L 19 -57 Z M 19 -57 L 27 -70 L 29 -53 Z"
        />
      </g>
    </Art>
  );
}

/* ── 14. 奈良の鹿 Nara deer ──────────────────────────────────────────── */

function Deer({
  x,
  y,
  s,
  flip,
  antlers,
  bow,
  begin,
}: {
  x: number;
  y: number;
  s: number;
  flip?: boolean;
  antlers?: boolean;
  bow: [number, number];
  begin: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="amb-person">
        <g className="ppl" strokeWidth={8}>
          <line x1={-40} y1={-70} x2={-44} y2={0} />
          <line x1={-24} y1={-70} x2={-20} y2={0} />
          <line x1={30} y1={-70} x2={26} y2={0} />
          <line x1={46} y1={-70} x2={50} y2={0} />
        </g>
        <ellipse className="pp" cx={0} cy={-84} rx={62} ry={30} />
        <path className="pp" d="M -60 -96 L -76 -110 L -62 -84 Z" />
        <g>
          <path className="pp" d="M 40 -100 L 64 -160 L 82 -154 L 62 -94 Z" />
          <ellipse
            className="pp"
            cx={84}
            cy={-164}
            rx={26}
            ry={14}
            transform="rotate(20 84 -164)"
          />
          <path className="pp" d="M 70 -176 L 62 -196 L 80 -180 Z" />
          {antlers && (
            <path
              className="ppl"
              fill="none"
              strokeWidth={4}
              d="M 76 -178 L 70 -222 M 72 -206 L 56 -214 M 86 -176 L 96 -218 M 92 -200 L 108 -206"
            />
          )}
          {rock(52, -100, bow[0], bow[1], 3.6, begin)}
        </g>
      </g>
    </g>
  );
}

export function NaraDeer() {
  return (
    <>
      <Art>
        <g className="fc2">
          <circle cx={60} cy={260} r={150} />
          <circle cx={200} cy={180} r={110} />
          <circle cx={1540} cy={240} r={150} />
          <circle cx={1420} cy={170} r={100} />
        </g>
        <rect className="fa3" x={80} y={300} width={22} height={600} />
        <rect className="fa3" x={1500} y={300} width={22} height={600} />
        <path
          className="fa1"
          d="M 0 800 Q 800 770 1600 800 L 1600 900 L 0 900 Z"
        />
        <g className="fa3">
          <rect x={250} y={760} width={60} height={14} />
          <rect x={262} y={690} width={36} height={70} />
          <path d="M 236 690 L 280 660 L 324 690 Z" />
          <rect x={270} y={774} width={20} height={70} />
        </g>
        <Deer x={470} y={876} s={0.85} bow={[0, 34]} begin={0} />
        <Deer
          x={1240}
          y={880}
          s={0.95}
          flip
          antlers
          bow={[0, 30]}
          begin={-1.8}
        />
        <Figure
          x={1090}
          y={880}
          s={0.95}
          pose="stand"
          hand={<circle className="ppa" cx={6} cy={0} r={9} />}
          upper={{ values: [0, 0, 30, 30, 0], dur: 3.6, begin: -1.6 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 9,
          seed: 1401,
          className: "amb-p--leaf fall",
          duration: [16, 24],
          size: [0.9, 1.4],
          opacity: [0.2, 0.34],
        })}
      </div>
    </>
  );
}

/* ── 15. 雲海 Sea of clouds at dawn ────────────────────────────────── */

function CloudBand({
  y,
  h,
  tone,
  dur,
  reverse,
}: {
  y: number;
  h: number;
  tone: string;
  dur: number;
  reverse?: boolean;
}) {
  const bumps = Array.from(
    { length: 16 },
    () => `a ${h} ${h * 0.55} 0 0 1 ${h * 2} 0`,
  ).join(" ");
  return (
    <g
      className={reverse ? "amb-band amb-band--back" : "amb-band"}
      style={{ animationDuration: `${dur}s` }}
    >
      <path
        className={tone}
        d={`M -400 ${y} ${bumps} L ${-400 + 16 * h * 2} 900 L -400 900 Z`}
      />
    </g>
  );
}

export function Unkai() {
  return (
    <Art>
      <g className="amb-sunrise">
        <circle className="fc2" cx={800} cy={720} r={200} />
        <circle className="fc3" cx={800} cy={720} r={80} />
      </g>
      <path
        className="fa3"
        d="M -20 900 L -20 560 L 80 470 L 150 520 L 240 430 L 330 600 L 420 900 Z"
      />
      <path
        className="fa3"
        d="M 1620 900 L 1620 520 L 1520 440 L 1440 520 L 1380 480 L 1270 620 L 1200 900 Z"
      />
      <CloudBand y={700} h={70} tone="fb1" dur={90} />
      <CloudBand y={760} h={60} tone="fb2" dur={70} reverse />
      <CloudBand y={830} h={50} tone="fb3" dur={55} />
      <Figure
        x={240}
        y={436}
        s={0.6}
        pose="stand"
        hand={
          <line className="ppl" x1={0} y1={0} x2={10} y2={84} strokeWidth={3} />
        }
      />
      <g
        className="amb-birds"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M 300 300 q 12 -10 24 0 q 12 -10 24 0" />
        <path d="M 340 280 q 9 -8 18 0 q 9 -8 18 0" />
      </g>
    </Art>
  );
}

/* ── 16. 星空キャンプ Starry campsite ───────────────────────────────── */

export function Camping() {
  const r = seeded(1601);
  const stars = Array.from({ length: 70 }, (_, i) => (
    <circle
      key={i}
      cx={(r() * 1600).toFixed(0)}
      cy={(r() * 520).toFixed(0)}
      r={(0.8 + r() * 1.3).toFixed(1)}
      opacity={(0.2 + r() * 0.4).toFixed(2)}
    />
  ));
  const stick = (
    <line className="ppl" x1={0} y1={0} x2={70} y2={-20} strokeWidth={3} />
  );
  return (
    <>
      <Art>
        <g className="amb-fill-star-soft">{stars}</g>
        <g className="fa2">
          {[20, 70, 120, 1480, 1530, 1580].map((x, i) => (
            <path
              key={x}
              d={`M ${x} ${520 + (i % 3) * 30} L ${x + 50} 840 L ${x - 50} 840 Z`}
            />
          ))}
        </g>
        <path
          className="fa1"
          d="M 0 820 Q 800 800 1600 820 L 1600 900 L 0 900 Z"
        />
        <g transform="translate(1260 860)">
          <path className="fa3" d="M -150 0 L 0 -170 L 150 0 Z" />
          <path className="fc2 amb-glow" d="M -60 0 L 0 -110 L 60 0 Z" />
          <line
            className="sa3"
            x1={0}
            y1={-170}
            x2={0}
            y2={-190}
            strokeWidth={4}
          />
        </g>
        <g transform="translate(330 870)">
          <circle className="fc1 amb-glow" cx={0} cy={-30} r={120} />
          <g className="fa3">
            <rect
              x={-50}
              y={-12}
              width={100}
              height={12}
              rx={6}
              transform="rotate(14)"
            />
            <rect
              x={-50}
              y={-12}
              width={100}
              height={12}
              rx={6}
              transform="rotate(-14)"
            />
          </g>
          <path
            className="fc4 amb-flame"
            d="M -26 -6 Q -30 -60 0 -96 Q 30 -60 26 -6 Z"
          />
          <path
            className="fa4 amb-flame amb-flame--b"
            d="M -14 -6 Q -14 -40 0 -62 Q 14 -40 14 -6 Z"
          />
        </g>
        <Figure
          x={180}
          y={870}
          s={0.82}
          pose="sit"
          hand={stick}
          arms={{ which: "R", values: [-20, -10, -20], dur: 4 }}
        />
        <Figure x={500} y={870} s={0.82} pose="sit" flip />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 1609,
          className: "amb-p--spark spark",
          duration: [2.5, 4.5],
          size: [0.2, 0.35],
          opacity: [0.5, 0.85],
          left: [19, 23],
          top: [84, 88],
        })}
        <span className="amb-shooting" />
      </div>
    </>
  );
}

/* ── 17. スキー場 Ski slope and lift ────────────────────────────────── */

export function SkiSlope() {
  const cable = "M 40 880 L 330 330";
  const chairs = Array.from({ length: 5 }, (_, i) => i);
  const animated = !still();
  return (
    <>
      <Art>
        <path
          className="fb2"
          d="M 1600 300 Q 1400 420 1300 640 Q 1220 820 1100 900 L 1600 900 Z"
        />
        <path
          className="fb1"
          d="M 0 840 Q 600 800 1200 860 L 1200 900 L 0 900 Z"
        />
        <g className="fa2">
          {[1500, 1560, 1420].map((x, i) => (
            <path
              key={x}
              d={`M ${x} ${330 + i * 60} L ${x + 34} ${430 + i * 60} L ${x - 34} ${430 + i * 60} Z`}
            />
          ))}
        </g>
        <path className="sb3" fill="none" strokeWidth="3" d={cable} />
        <g className="fb3">
          <rect x={130} y={690} width={10} height={200} />
          <rect x={290} y={410} width={10} height={480} />
        </g>
        {chairs.map((i) => (
          <g key={i}>
            <g>
              <line
                className="sb3"
                x1={0}
                y1={0}
                x2={0}
                y2={40}
                strokeWidth={3}
              />
              <path className="fb4" d="M -24 40 L 24 40 L 24 52 L -24 52 Z" />
              <circle className="pp" cx={-6} cy={26} r={8} />
              {animated && (
                <animateMotion
                  dur="24s"
                  begin={`${-i * 4.8}s`}
                  repeatCount="indefinite"
                  path={cable}
                />
              )}
            </g>
          </g>
        ))}
        <g>
          <g className="amb-person">
            <line
              className="ppl"
              x1={-30}
              y1={4}
              x2={30}
              y2={-4}
              strokeWidth={4}
            />
            <Figure x={0} y={0} s={0.5} pose="squat" />
          </g>
          {animated && (
            <animateMotion
              dur="9s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 1560 360 C 1420 420 1560 520 1430 580 C 1320 640 1480 720 1360 780 C 1280 820 1340 880 1260 940"
            />
          )}
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 18,
          seed: 1701,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.5],
          opacity: [0.22, 0.4],
        })}
      </div>
    </>
  );
}

/* ── 18. 犬の散歩 Dog walk in the park ─────────────────────────────── */

function Dog({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="amb-person">
      {[-28, -16, 18, 30].map((lx, i) => (
        <g key={lx}>
          <line
            className="ppl"
            x1={lx}
            y1={-30}
            x2={lx}
            y2={0}
            strokeWidth={6}
          />
          {rock(lx, -30, i % 2 ? 18 : -18, i % 2 ? -18 : 18, 0.36)}
        </g>
      ))}
      <ellipse className="pp" cx={0} cy={-38} rx={40} ry={16} />
      <circle className="pp" cx={44} cy={-56} r={14} />
      <path className="pp" d="M 46 -68 L 40 -84 L 54 -70 Z" />
      <ellipse className="pp" cx={58} cy={-52} rx={10} ry={6} />
      <g>
        <path
          className="ppl"
          fill="none"
          strokeWidth={5}
          d="M -38 -42 Q -56 -60 -50 -76"
        />
        {rock(-38, -42, -20, 25, 0.4)}
      </g>
    </g>
  );
}

export function DogWalk() {
  return (
    <Art>
      <g className="fb2">
        <circle cx={70} cy={360} r={140} />
        <circle cx={190} cy={300} r={100} />
        <circle cx={1530} cy={340} r={140} />
      </g>
      <rect className="fa3" x={90} y={420} width={20} height={480} />
      <rect className="fa3" x={1520} y={420} width={20} height={480} />
      <path
        className="fa1"
        d="M 0 800 Q 800 780 1600 800 L 1600 900 L 0 900 Z"
      />
      <path
        className="sb2"
        fill="none"
        strokeWidth="40"
        strokeLinecap="round"
        d="M -40 870 Q 800 836 1640 870"
        opacity="0.6"
      />
      <g className="fa3">
        <rect x={1240} y={790} width={180} height={12} />
        <rect x={1240} y={760} width={180} height={10} />
        <rect x={1252} y={802} width={10} height={60} />
        <rect x={1398} y={802} width={10} height={60} />
      </g>
      <Figure
        x={1300}
        y={800}
        s={0.8}
        pose="chair"
        flip
        arms={{ which: "R", values: [-60, -30, -60], dur: 2.6 }}
      />
      {[1160, 1196, 1130].map((x, i) => (
        <g
          key={x}
          className="amb-peck"
          style={{ animationDelay: `${-i * 0.5}s` }}
        >
          <ellipse className="fa3" cx={x} cy={852} rx={12} ry={8} />
          <circle className="fa3" cx={x + 10} cy={844} r={6} />
        </g>
      ))}
      <Mover cls="amb-ride" dur={24} delay={-7}>
        <Figure
          x={0}
          y={880}
          s={0.95}
          pose="walk"
          stride={{ deg: 16, dur: 0.9 }}
        />
        <path
          className="sb3"
          fill="none"
          strokeWidth="2"
          d="M 8 800 Q 60 840 108 842"
        />
        <Dog x={130} y={882} s={0.8} />
      </Mover>
    </Art>
  );
}

/* ── 19. 招き猫 Lucky cats ──────────────────────────────────────────── */

function LuckyCat({
  x,
  y,
  s,
  ch,
  dur,
  begin,
}: {
  x: number;
  y: number;
  s: number;
  ch: string;
  dur: number;
  begin: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="fb3" cx={0} cy={-44} rx={38} ry={44} />
      <circle className="fb3" cx={0} cy={-104} r={34} />
      <path
        className="fb3"
        d="M -30 -124 L -24 -152 L -8 -134 Z M 30 -124 L 24 -152 L 8 -134 Z"
      />
      <g className="sa3" fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M -16 -108 q 6 -6 12 0 M 4 -108 q 6 -6 12 0 M -6 -94 q 6 6 12 0" />
      </g>
      <path
        className="fc3"
        d="M -26 -76 Q 0 -64 26 -76 L 24 -68 Q 0 -56 -24 -68 Z"
      />
      <circle className="fa4" cx={0} cy={-62} r={7} />
      <g transform="translate(16 -36)">
        <ellipse className="fa4" cx={0} cy={0} rx={22} ry={30} />
        <text className="amb-glyph gink" x={0} y={1} fontSize={24}>
          {ch}
        </text>
      </g>
      <g>
        <path
          className="fb3"
          d="M -30 -72 Q -52 -100 -46 -132 Q -32 -142 -24 -128 Q -26 -100 -14 -76 Z"
        />
        {rock(-24, -74, 0, -26, dur, begin)}
      </g>
    </g>
  );
}

export function ManekiNeko({ glyphs }: SceneProps) {
  const chars = pick(glyphs, "福招金", 5);
  return (
    <>
      <Art>
        <path className="fc2" d="M 0 0 H 420 V 80 Q 210 110 0 80 Z" />
        <path className="fc2" d="M 1600 0 H 1180 V 80 Q 1390 110 1600 80 Z" />
        <rect className="fa3" x={0} y={560} width={430} height={14} />
        <rect className="fa3" x={1170} y={560} width={430} height={14} />
        <rect className="fa3" x={0} y={850} width={1600} height={14} />
        <LuckyCat x={100} y={560} s={0.8} ch={chars[0]!} dur={1.6} begin={0} />
        <LuckyCat
          x={260}
          y={560}
          s={0.6}
          ch={chars[1]!}
          dur={2.1}
          begin={-0.7}
        />
        <LuckyCat
          x={180}
          y={850}
          s={1.0}
          ch={chars[2]!}
          dur={1.8}
          begin={-1.1}
        />
        <LuckyCat
          x={1330}
          y={560}
          s={0.7}
          ch={chars[3]!}
          dur={2.3}
          begin={-0.4}
        />
        <LuckyCat
          x={1470}
          y={850}
          s={1.05}
          ch={chars[4]!}
          dur={1.5}
          begin={-0.9}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 1901,
          className: "amb-p--twinkle twinkle",
          duration: [3, 5],
          size: [0.35, 0.55],
          opacity: [0.35, 0.6],
          top: [20, 95],
          left: [2, 28],
        })}
        {particles({
          count: 6,
          seed: 1903,
          className: "amb-p--twinkle twinkle",
          duration: [3, 5],
          size: [0.35, 0.55],
          opacity: [0.35, 0.6],
          top: [20, 95],
          left: [74, 98],
        })}
      </div>
    </>
  );
}

/* ── 20. 雨上がり After the rain ───────────────────────────────────── */

export function Rainbow() {
  const colors = [
    "#e56b6f",
    "#f4a259",
    "#f6d55c",
    "#7bc67e",
    "#5ab0d6",
    "#7d7fd6",
    "#b58bd6",
  ];
  const hood = (
    <path className="pp" d="M -16 4 Q -18 -20 0 -22 Q 18 -20 16 4 Z" />
  );
  return (
    <>
      <Art>
        <g fill="none" strokeWidth="16" opacity="0.11">
          {colors.map((c, i) => (
            <circle key={c} cx={-300} cy={980} r={760 - i * 16} stroke={c} />
          ))}
        </g>
        <path
          className="fa2"
          d="M 1180 140 L 1600 140 L 1600 180 L 1180 180 Z"
        />
        <g className="fc3">
          {[1240, 1360, 1480].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={186}
              r={5}
              className="amb-drip"
              style={{ animationDelay: `${-i * 0.9}s` }}
            />
          ))}
        </g>
        <g className="fb2">
          {[1420, 1470, 1520, 1560].map((x, i) => (
            <circle key={x} cx={x} cy={800 - (i % 2) * 30} r={46} />
          ))}
        </g>
        <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
        <ellipse className="fb2" cx={380} cy={876} rx={130} ry={14} />
        <ellipse
          className="sb3 amb-ripple"
          cx={380}
          cy={876}
          rx={60}
          ry={9}
          fill="none"
        />
        <ellipse className="fb2" cx={1180} cy={882} rx={100} ry={11} />
        <g className="amb-jump">
          <Figure x={380} y={870} s={0.72} pose="armsUp" headwear={hood} />
        </g>
        <g className="amb-splash fc4">
          <circle cx={340} cy={856} r={5} />
          <circle cx={420} cy={852} r={6} />
          <circle cx={380} cy={846} r={4} />
        </g>
        <Mover cls="amb-pass amb-pass--slow" dur={80} delay={-30}>
          <g transform="translate(0 852)">
            <circle className="fa3" cx={0} cy={0} r={11} />
            <path className="fa3" d="M -6 8 L 30 8 L 30 4 L -6 4 Z" />
          </g>
        </Mover>
      </Art>
    </>
  );
}
