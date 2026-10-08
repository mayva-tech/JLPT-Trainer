import type { CSSProperties, ReactNode } from "react";
import { Art } from "./artKit";
import { Figure } from "./figure";
import { Mover, Wheel } from "./artMotion";
import { particles, pick, rock, seeded, spin, still } from "./scenery";
import type { SceneProps } from "./artJapan";

/*
 * Twenty festival, craft and everyday scenes, each with its own palette
 * (stageAmbience.css) and plenty of motion. Same rules as the others:
 * faint, at the edges and along the bottom, centre open, no ids, still
 * under prefers-reduced-motion.
 *
 * Shogi pieces and library book spines show the current word's kanji.
 */

/** A CSS-animated group with its own timing. */
function Anim({
  cls,
  dur,
  delay = 0,
  children,
  origin,
}: {
  cls: string;
  dur?: number;
  delay?: number;
  children: ReactNode;
  origin?: string;
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

/* ── 1. 餅つき Mochi pounding (kohaku red & white) ─────────────────── */

export function Mochitsuki() {
  const kine = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={46} y2={-70} strokeWidth={5} />
      <rect
        className="pp"
        x={30}
        y={-104}
        width={44}
        height={30}
        rx={8}
        transform="rotate(-34 52 -89)"
      />
    </g>
  );
  const kohaku = (x0: number, w: number) => (
    <Anim cls="amb-curtain">
      {Array.from({ length: Math.ceil(w / 40) }, (_, i) => (
        <rect
          key={i}
          className={i % 2 ? "fb3" : "fc3"}
          x={x0 + i * 40}
          y={0}
          width={40}
          height={44}
        />
      ))}
    </Anim>
  );
  return (
    <>
      <Art>
        {kohaku(0, 360)}
        {kohaku(1240, 360)}
        <path className="fa1" d="M 0 840 H 1600 V 900 H 0 Z" />
        <g transform="translate(330 860)">
          <path className="fa3" d="M -70 -60 L 70 -60 L 54 0 L -54 0 Z" />
          <Anim cls="amb-squash">
            <ellipse className="fb4" cx={0} cy={-66} rx={56} ry={18} />
          </Anim>
        </g>
        <Figure
          x={210}
          y={884}
          s={1.0}
          pose="kamae"
          robe
          hand={kine}
          arms={{ which: "both", values: [-70, 34], dur: 1.2 }}
        />
        <Figure
          x={440}
          y={890}
          s={0.9}
          pose="crouch"
          flip
          robe
          arms={{ which: "R", values: [10, -30, 10], dur: 1.2, begin: -0.6 }}
        />
        <g transform="translate(1370 860)">
          <rect className="fa3" x={-60} y={-30} width={120} height={30} />
          <ellipse className="fb3" cx={0} cy={-44} rx={58} ry={20} />
          <ellipse className="fb3" cx={0} cy={-76} rx={42} ry={16} />
          <circle className="fc4" cx={0} cy={-102} r={16} />
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 5,
          seed: 2101,
          className: "amb-p--steam rise-slow",
          duration: [9, 14],
          size: [3, 5],
          opacity: [0.5, 0.8],
          left: [18, 24],
        })}
      </div>
    </>
  );
}

/* ── 2. 獅子舞 Lion dance (jade & lacquer red) ──────────────────────── */

export function Shishimai() {
  const swirl = (x: number, y: number) => (
    <path
      key={`${x}-${y}`}
      className="sb4"
      fill="none"
      strokeWidth="4"
      strokeLinecap="round"
      d={`M ${x} ${y} a 14 14 0 1 1 14 14 a 8 8 0 1 0 -8 -8`}
    />
  );
  return (
    <Art>
      <g transform="translate(1250 760)">
        <Anim cls="amb-lion-body">
          <path
            className="fa3"
            d="M 40 -60 Q 160 -110 290 -60 L 300 80 L 30 80 Z"
          />
          {swirl(110, -40)}
          {swirl(190, -20)}
          {swirl(250, 20)}
          {swirl(120, 30)}
        </Anim>
        <Figure
          x={120}
          y={124}
          s={0.55}
          pose="walk"
          stride={{ deg: 14, dur: 0.8 }}
        />
        <Figure
          x={230}
          y={124}
          s={0.55}
          pose="walk"
          stride={{ deg: 14, dur: 0.8 }}
        />
        <Anim cls="amb-lion-head">
          <path
            className="fc3"
            d="M -70 -60 Q -60 -120 10 -118 Q 70 -110 64 -50 L 50 -10 L -60 -10 Z"
          />
          <g className="fb4">
            <circle cx={-26} cy={-80} r={10} />
            <circle cx={22} cy={-80} r={10} />
          </g>
          <path
            className="sa4"
            fill="none"
            strokeWidth="5"
            d="M -50 -110 q 20 -20 40 0 M 0 -112 q 20 -20 40 0"
          />
          <g>
            <path className="fc3" d="M -62 -10 L 54 -10 L 46 28 L -54 28 Z" />
            <g className="fb4">
              {[-40, -20, 0, 20, 38].map((x) => (
                <rect key={x} x={x - 5} y={-10} width={10} height={10} />
              ))}
            </g>
            {rock(-60, -10, 0, 22, 0.8)}
          </g>
        </Anim>
      </g>
      <Figure
        x={140}
        y={884}
        s={0.85}
        pose="stand"
        hand={
          <line
            className="ppl"
            x1={-30}
            y1={-4}
            x2={40}
            y2={-8}
            strokeWidth={4}
          />
        }
        arms={{ which: "both", values: [-80, -84, -80], dur: 0.5 }}
      />
      <Figure
        x={300}
        y={888}
        s={0.6}
        pose="armsUp"
        arms={{ which: "both", values: [0, 30, 0], dur: 0.9 }}
      />
      <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
    </Art>
  );
}

/* ── 3. 鵜飼 Cormorant fishing by firelight (ink & fire) ───────────── */

function UkaiBoat() {
  return (
    <g>
      <path
        className="fa3"
        d="M -260 0 L 140 0 L 220 -24 L 200 10 L -250 14 Z"
      />
      <line
        className="sa3"
        x1={170}
        y1={-14}
        x2={270}
        y2={-110}
        strokeWidth={5}
      />
      <g transform="translate(276 -116)">
        <circle className="fc1 amb-glow" cx={0} cy={0} r={70} />
        <path
          className="sa3"
          fill="none"
          strokeWidth="3"
          d="M -16 -10 L -12 14 L 12 14 L 16 -10"
        />
        <path
          className="fc4 amb-flame"
          d="M -16 -10 Q -12 -46 0 -60 Q 12 -46 16 -10 Z"
        />
      </g>
      <Figure
        x={100}
        y={0}
        s={0.7}
        pose="stand"
        hand={
          <path
            className="ppl"
            fill="none"
            strokeWidth={2}
            d="M 0 0 Q 80 60 160 70"
          />
        }
      />
      <Figure
        x={-160}
        y={0}
        s={0.62}
        pose="stand"
        depth="far"
        hand={
          <line
            className="ppl"
            x1={0}
            y1={0}
            x2={-40}
            y2={-90}
            strokeWidth={4}
          />
        }
      />
    </g>
  );
}

function Cormorant({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Anim cls="amb-dive" delay={delay}>
        <ellipse className="pp-ink" cx={0} cy={0} rx={22} ry={9} />
        <path
          className="pp-ink"
          d="M 18 -4 Q 30 -26 22 -34 L 30 -34 Q 40 -24 26 -2 Z"
        />
      </Anim>
    </g>
  );
}

export function Ukai() {
  return (
    <>
      <Art>
        <path
          className="fa2"
          d="M 0 640 Q 300 600 600 630 Q 900 660 1200 620 Q 1400 600 1600 630 L 1600 680 L 0 680 Z"
        />
        <rect className="fb1" x={0} y={680} width={1600} height={220} />
        <ellipse
          className="fc2 amb-shimmer"
          cx={420}
          cy={800}
          rx={160}
          ry={30}
        />
        <ellipse
          className="fc2 amb-shimmer"
          cx={1300}
          cy={830}
          rx={140}
          ry={26}
        />
        <Mover cls="amb-pass amb-pass--slow" dur={70} delay={-18}>
          <g transform="translate(0 760)">
            <UkaiBoat />
          </g>
        </Mover>
        <Mover cls="amb-pass amb-pass--slow" dur={90} delay={-62}>
          <g transform="translate(0 820) scale(0.8)">
            <UkaiBoat />
          </g>
        </Mover>
        <Cormorant x={300} y={840} delay={0} />
        <Cormorant x={520} y={860} delay={-1.3} />
        <Cormorant x={1220} y={870} delay={-2.1} />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 2301,
          className: "amb-p--spark fall",
          duration: [3, 5],
          size: [0.15, 0.3],
          opacity: [0.4, 0.8],
        })}
      </div>
    </>
  );
}

/* ── 4. 雪猿の湯 Snow monkeys in the hot spring ─────────────────────── */

function Monkey({
  x,
  y,
  s,
  flip,
  delay,
}: {
  x: number;
  y: number;
  s: number;
  flip?: boolean;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <Anim cls="amb-bobble" delay={delay}>
        <ellipse className="fa3" cx={0} cy={-20} rx={40} ry={30} />
        <circle className="fa3" cx={6} cy={-66} r={26} />
        <ellipse className="fc3" cx={12} cy={-62} rx={15} ry={13} />
        <g className="fd">
          <circle cx={6} cy={-66} r={3} />
          <circle cx={18} cy={-66} r={3} />
        </g>
        <circle className="fa3" cx={-18} cy={-70} r={7} />
        <circle className="fa3" cx={30} cy={-70} r={7} />
      </Anim>
    </g>
  );
}

export function SnowMonkey() {
  return (
    <>
      <Art>
        <g className="fb2">
          <ellipse cx={80} cy={790} rx={150} ry={70} />
          <ellipse cx={1520} cy={780} rx={160} ry={76} />
          <ellipse cx={1380} cy={830} rx={110} ry={50} />
        </g>
        <g className="fb3">
          <ellipse cx={80} cy={740} rx={120} ry={22} />
          <ellipse cx={1520} cy={726} rx={130} ry={24} />
        </g>
        <ellipse className="fc1" cx={800} cy={880} rx={760} ry={66} />
        <Monkey x={260} y={880} s={0.9} delay={0} />
        <Monkey x={400} y={884} s={0.7} flip delay={-1.2} />
        <Monkey x={1200} y={882} s={0.85} flip delay={-0.6} />
        <g transform="translate(120 760)">
          <ellipse className="fa3" cx={0} cy={-26} rx={34} ry={28} />
          <circle className="fa3" cx={8} cy={-64} r={22} />
          <ellipse className="fc3" cx={14} cy={-60} rx={12} ry={11} />
          <path
            className="fb3"
            d="M -16 -82 Q 8 -96 30 -80 L 26 -74 Q 8 -84 -12 -76 Z"
          />
        </g>
        <g className="sb2" fill="none" strokeWidth="5" strokeLinecap="round">
          <path
            className="amb-steam-line"
            d="M 500 830 q -16 -30 0 -60 q 16 -30 0 -60"
          />
          <path
            className="amb-steam-line"
            d="M 1040 830 q -16 -30 0 -60 q 16 -30 0 -60"
          />
          <path
            className="amb-steam-line"
            d="M 760 840 q -16 -30 0 -60 q 16 -30 0 -60"
          />
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 18,
          seed: 2401,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.5],
          opacity: [0.24, 0.42],
        })}
      </div>
    </>
  );
}

/* ── 5. 丹頂鶴の舞 Dancing red-crowned cranes ───────────────────────── */

function Crane({
  x,
  y,
  s,
  flip,
  delay,
}: {
  x: number;
  y: number;
  s: number;
  flip?: boolean;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <Anim cls="amb-crane-hop" delay={delay}>
        <g className="sa3" strokeWidth="4">
          <line x1={-6} y1={-60} x2={-12} y2={0} />
          <line x1={8} y1={-60} x2={14} y2={0} />
        </g>
        <ellipse className="fb4" cx={0} cy={-84} rx={50} ry={26} />
        <path
          className="fd"
          d="M -48 -90 Q -70 -80 -62 -66 Q -50 -74 -40 -76 Z"
        />
        <g>
          <path
            className="fb4"
            d="M -10 -96 Q -60 -170 -120 -150 Q -70 -130 -30 -84 Z"
          />
          {rock(-10, -92, 10, -30, 1.6, delay)}
        </g>
        <g>
          <path
            className="fb4"
            d="M 10 -96 Q 40 -170 100 -170 Q 60 -130 30 -84 Z"
          />
          {rock(10, -92, -10, 30, 1.6, delay)}
        </g>
        <path
          className="sd"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          d="M 36 -96 Q 60 -140 54 -170"
        />
        <circle className="fb4" cx={56} cy={-176} r={9} />
        <circle className="fc4" cx={56} cy={-182} r={5} />
        <path className="sa3" strokeWidth="3" d="M 62 -176 L 84 -170" />
      </Anim>
    </g>
  );
}

export function Tsurumai() {
  return (
    <>
      <Art>
        <g className="sa2" strokeWidth="8">
          {[40, 90, 1500, 1560].map((x) => (
            <line key={x} x1={x} y1={300} x2={x - 6} y2={840} />
          ))}
        </g>
        <path
          className="fb2"
          d="M 0 830 Q 800 790 1600 830 L 1600 900 L 0 900 Z"
        />
        <Crane x={300} y={866} s={0.95} delay={0} />
        <Crane x={470} y={872} s={0.85} flip delay={-0.8} />
        <Crane x={1290} y={870} s={0.8} flip delay={-0.4} />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 12,
          seed: 2501,
          className: "amb-p--snow fall",
          duration: [16, 26],
          size: [0.2, 0.45],
          opacity: [0.2, 0.36],
        })}
      </div>
    </>
  );
}

/* ── 6. 藤棚 Wisteria trellis ───────────────────────────────────────── */

function Raceme({
  x,
  y,
  len,
  delay,
}: {
  x: number;
  y: number;
  len: number;
  delay: number;
}) {
  const r = seeded(x * 3 + y);
  const dots = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    const w = (1 - t) * 18 + 3;
    return (
      <circle
        key={i}
        className={i % 3 ? "fb3" : "fc3"}
        cx={x + (r() - 0.5) * w * 2}
        cy={y + t * len}
        r={6 - t * 3}
      />
    );
  });
  return (
    <Anim cls="amb-strip" delay={delay} origin={`${x}px ${y}px`}>
      {dots}
    </Anim>
  );
}

export function Fujidana() {
  const beams = (x0: number, x1: number) => (
    <g className="sa3" strokeWidth="6">
      <line x1={x0} y1={70} x2={x1} y2={70} />
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={i}
          x1={x0 + ((x1 - x0) / 5) * i}
          y1={60}
          x2={x0 + ((x1 - x0) / 5) * i}
          y2={84}
        />
      ))}
    </g>
  );
  const parasol = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={-6} y2={-70} strokeWidth={3} />
      <path className="ppc" d="M -66 -64 Q -6 -110 54 -64 Z" />
    </g>
  );
  return (
    <>
      <Art>
        {beams(-10, 420)}
        {beams(1180, 1610)}
        {[30, 90, 150, 210, 270, 340, 400].map((x, i) => (
          <Raceme
            key={x}
            x={x}
            y={80}
            len={140 + ((i * 47) % 120)}
            delay={-i * 0.7}
          />
        ))}
        {[1200, 1260, 1330, 1400, 1460, 1520, 1580].map((x, i) => (
          <Raceme
            key={x}
            x={x}
            y={80}
            len={130 + ((i * 59) % 130)}
            delay={-i * 0.6}
          />
        ))}
        <path className="fa1" d="M 0 850 H 1600 V 900 H 0 Z" />
        <Mover cls="amb-ride" dur={30} delay={-9}>
          <Figure
            x={0}
            y={880}
            s={0.9}
            pose="walk"
            robe
            stride={{ deg: 12, dur: 1.1 }}
            hand={parasol}
          />
        </Mover>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 12,
          seed: 2601,
          className: "amb-p--petal fall",
          duration: [16, 24],
          size: [0.6, 1],
          opacity: [0.24, 0.4],
        })}
      </div>
    </>
  );
}

/* ── 7. 茶畑 Tea fields with frost fans ─────────────────────────────── */

export function Chabatake() {
  const rows = Array.from({ length: 6 }, (_, i) => {
    const y = 700 + i * 34;
    return (
      <path
        key={i}
        className={i % 2 ? "fa3" : "fa2"}
        d={`M -20 ${y} Q 400 ${y - 30 + i * 4} 800 ${y} T 1620 ${y - 10} L 1620 ${y + 26} Q 800 ${y + 20} -20 ${y + 26} Z`}
      />
    );
  });
  const fan = (x: number, y: number, dur: number) => (
    <g key={x}>
      <rect className="fb3" x={x - 3} y={y} width={6} height={900 - y} />
      <g>
        <ellipse className="fb3" cx={x} cy={y - 24} rx={6} ry={24} />
        <ellipse className="fb3" cx={x} cy={y + 24} rx={6} ry={24} />
        {spin(x, y, dur)}
      </g>
      <circle className="fb4" cx={x} cy={y} r={5} />
    </g>
  );
  const basket = (
    <rect className="ppa" x={-14} y={-6} width={28} height={20} rx={4} />
  );
  const hat = <path className="pp" d="M -26 -2 L 26 -2 L 0 -22 Z" />;
  return (
    <Art>
      <path className="fb1" d="M 900 700 L 1120 520 L 1180 520 L 1400 700 Z" />
      {rows}
      {fan(120, 480, 1.4)}
      {fan(1480, 470, 1.1)}
      <Figure
        x={330}
        y={760}
        s={0.7}
        pose="stand"
        headwear={hat}
        hand={basket}
        upper={{ values: [20, 40, 20], dur: 3 }}
      />
      <Figure
        x={1250}
        y={780}
        s={0.7}
        pose="stand"
        flip
        headwear={hat}
        upper={{ values: [24, 44, 24], dur: 3.4, begin: -1 }}
      />
    </Art>
  );
}

/* ── 8. 風鈴市 Wind-chime market ────────────────────────────────────── */

function Chime({
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
    <Anim cls="amb-chime" delay={delay} origin={`${x}px ${y}px`}>
      <line className="sb3" x1={x} y1={y} x2={x} y2={y + 24} strokeWidth={2} />
      <path
        className={tone}
        d={`M ${x - 22} ${y + 54} Q ${x - 22} ${y + 24} ${x} ${y + 24} Q ${x + 22} ${y + 24} ${x + 22} ${y + 54} Z`}
      />
      <line
        className="sb3"
        x1={x}
        y1={y + 54}
        x2={x}
        y2={y + 80}
        strokeWidth={1.5}
      />
      <rect className="fb3" x={x - 8} y={y + 80} width={16} height={56} />
    </Anim>
  );
}

export function Furin() {
  const tones = ["fa4", "fc4", "fb4", "fa3", "fc3"];
  const row = (x0: number, n: number, y: number, step: number) =>
    Array.from({ length: n }, (_, i) => (
      <Chime
        key={`${x0}-${i}`}
        x={x0 + i * step}
        y={y}
        tone={tones[(i + x0) % tones.length]!}
        delay={-i * 0.45}
      />
    ));
  return (
    <Art>
      <line
        className="sa3"
        x1={-10}
        y1={150}
        x2={430}
        y2={150}
        strokeWidth={5}
      />
      <line
        className="sa3"
        x1={1170}
        y1={150}
        x2={1610}
        y2={150}
        strokeWidth={5}
      />
      <line
        className="sa3"
        x1={-10}
        y1={380}
        x2={300}
        y2={380}
        strokeWidth={5}
      />
      <line
        className="sa3"
        x1={1300}
        y1={380}
        x2={1610}
        y2={380}
        strokeWidth={5}
      />
      {row(30, 5, 150, 70)}
      {row(1270, 5, 150, 70)}
      {row(40, 4, 380, 70)}
      {row(1340, 4, 380, 70)}
      <path className="fa1" d="M 0 850 H 1600 V 900 H 0 Z" />
      <Figure
        x={180}
        y={884}
        s={0.8}
        pose="stand"
        robe
        arms={{ which: "R", values: [-120, -140, -120], dur: 3 }}
      />
      <Figure
        x={1440}
        y={886}
        s={0.6}
        pose="stand"
        flip
        arms={{ which: "R", values: [-150, -170, -150], dur: 2 }}
      />
    </Art>
  );
}

/* ── 9. 歌舞伎 Kabuki stage ─────────────────────────────────────────── */

export function Kabuki() {
  const stripes = ["fd", "fc3", "fb3"];
  const curtain = (x0: number, flip: boolean) => (
    <Anim cls="amb-curtain">
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          className={stripes[i % 3]}
          d={
            flip
              ? `M ${x0 - i * 46} 0 L ${x0 - (i + 1) * 46} 0 L ${x0 - (i + 1) * 46 + 30} 900 L ${x0 - i * 46 + 30} 900 Z`
              : `M ${x0 + i * 46} 0 L ${x0 + (i + 1) * 46} 0 L ${x0 + (i + 1) * 46 - 30} 900 L ${x0 + i * 46 - 30} 900 Z`
          }
        />
      ))}
    </Anim>
  );
  return (
    <>
      <div className="amb-spot" />
      <Art>
        {curtain(-20, false)}
        {curtain(1620, true)}
        <path className="fa2" d="M 0 830 H 1600 V 900 H 0 Z" />
        <g className="fc2">
          {[380, 520, 1080, 1220].map((x) => (
            <ellipse key={x} cx={x} cy={44} rx={30} ry={38} />
          ))}
        </g>
        <Figure
          x={1180}
          y={830}
          s={1.15}
          pose="kamae"
          robe
          flip
          headwear={<path className="pp" d="M -6 -12 L 14 -40 L 18 -10 Z" />}
          arms={{ which: "both", values: [0, 0, -50, -50, 0], dur: 5 }}
          upper={{ values: [0, 0, -8, -8, 0], dur: 5 }}
        />
      </Art>
    </>
  );
}

/* ── 10. 和太鼓 Taiko drummers ──────────────────────────────────────── */

function Drum({
  x,
  y,
  r,
  beat,
  delay,
}: {
  x: number;
  y: number;
  r: number;
  beat: number;
  delay: number;
}) {
  return (
    <g>
      <rect
        className="fa3"
        x={x - r * 0.9}
        y={y - r * 0.7}
        width={r * 1.8}
        height={r * 1.4}
        rx={r * 0.4}
      />
      <ellipse
        className="fb3"
        cx={x + r * 0.9}
        cy={y}
        rx={r * 0.22}
        ry={r * 0.72}
      />
      <g className="sa3" strokeWidth="5">
        <line
          x1={x - r * 0.6}
          y1={y + r * 0.7}
          x2={x - r * 0.9}
          y2={y + r * 1.5}
        />
        <line
          x1={x + r * 0.6}
          y1={y + r * 0.7}
          x2={x + r * 0.9}
          y2={y + r * 1.5}
        />
      </g>
      {[0, 1].map((k) => (
        <ellipse
          key={k}
          className="sc3 amb-wave-ring"
          style={{
            animationDuration: `${beat}s`,
            animationDelay: `${delay - k * beat * 0.5}s`,
          }}
          cx={x + r * 0.9}
          cy={y}
          rx={r * 0.3}
          ry={r * 0.8}
          fill="none"
          strokeWidth="4"
        />
      ))}
    </g>
  );
}

export function Taiko() {
  const bachi = (
    <line className="ppl" x1={0} y1={0} x2={26} y2={-40} strokeWidth={5} />
  );
  const band = <rect className="ppc" x={-14} y={-6} width={28} height={6} />;
  return (
    <Art>
      <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
      <Drum x={190} y={730} r={110} beat={0.9} delay={0} />
      <Drum x={1460} y={740} r={100} beat={0.9} delay={-0.45} />
      <Figure
        x={360}
        y={880}
        s={1.05}
        pose="kamae"
        flip
        headwear={band}
        hand={bachi}
        arms={{ which: "both", values: [-110, 10], dur: 0.9 }}
      />
      <Figure
        x={1290}
        y={882}
        s={1.0}
        pose="kamae"
        headwear={band}
        hand={bachi}
        arms={{ which: "both", values: [-110, 10], dur: 0.9, begin: -0.45 }}
      />
    </Art>
  );
}

/* ── 11. たこ焼き Takoyaki stall ────────────────────────────────────── */

export function Takoyaki() {
  const balls = Array.from({ length: 8 }, (_, i) => {
    const cx = 120 + (i % 4) * 56;
    const cy = 790 + Math.floor(i / 4) * 34;
    return (
      <g key={i}>
        <circle className="fc3" cx={cx} cy={cy} r={22} />
        <g>
          <path
            className="sa3"
            fill="none"
            strokeWidth="3"
            d={`M ${cx - 12} ${cy} q 12 -12 24 0`}
          />
          {spin(cx, cy, 1.6 + (i % 3) * 0.4, i % 2 === 1)}
        </g>
      </g>
    );
  });
  const picks = (
    <path className="ppl" d="M 0 0 L 22 30 M 6 -2 L 30 26" strokeWidth={3} />
  );
  const hachimaki = (
    <rect className="ppb" x={-14} y={-8} width={28} height={6} />
  );
  return (
    <>
      <Art>
        <path className="fc2" d="M 0 560 L 480 560 L 500 600 L -20 600 Z" />
        <g className="amb-noren">
          <rect className="fb3" x={40} y={600} width={420} height={60} />
        </g>
        <text className="amb-glyph gink" x={250} y={630} fontSize={40}>
          たこ焼
        </text>
        <rect className="fd" x={70} y={754} width={290} height={100} rx={10} />
        {balls}
        <rect className="fa3" x={60} y={850} width={320} height={50} />
        <Figure
          x={430}
          y={880}
          s={0.95}
          pose="stand"
          flip
          headwear={hachimaki}
          hand={picks}
          arms={{ which: "R", values: [-60, -80, -50, -70], dur: 1.4 }}
        />
        <Figure x={1380} y={884} s={0.9} pose="stand" flip depth="far" />
        <Figure
          x={1470}
          y={888}
          s={0.7}
          pose="stand"
          flip
          arms={{ which: "R", values: [-40, -60, -40], dur: 2 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 6,
          seed: 2701,
          className: "amb-p--steam rise-slow",
          duration: [9, 13],
          size: [3.5, 6],
          opacity: [0.5, 0.8],
          left: [8, 22],
        })}
      </div>
    </>
  );
}

/* ── 12. ガチャガチャ Capsule toys ──────────────────────────────────── */

function GachaMachine({ x, delay }: { x: number; delay: number }) {
  const r = seeded(x);
  const tones = ["fa4", "fb4", "fc4", "fa3", "fc3"];
  const caps = Array.from({ length: 12 }, (_, i) => (
    <circle
      key={i}
      className={tones[Math.floor(r() * tones.length)]}
      cx={x - 44 + (i % 4) * 29}
      cy={560 + Math.floor(i / 4) * 30}
      r={13}
    />
  ));
  return (
    <g>
      <rect
        className="fb2"
        x={x - 64}
        y={520}
        width={128}
        height={110}
        rx={14}
      />
      {caps}
      <rect className="fa3" x={x - 64} y={630} width={128} height={210} />
      <g>
        <circle className="fb3" cx={x} cy={690} r={22} />
        <rect className="fd" x={x - 4} y={672} width={8} height={36} />
        {spin(x, 690, 2.4)}
      </g>
      <rect className="fd" x={x - 26} y={760} width={52} height={36} rx={6} />
      <Anim cls="amb-capsule" delay={delay}>
        <circle className="fc4" cx={x} cy={776} r={11} />
      </Anim>
    </g>
  );
}

export function Gacha() {
  return (
    <Art>
      <GachaMachine x={90} delay={0} />
      <GachaMachine x={212} delay={-1.2} />
      <GachaMachine x={1388} delay={-0.6} />
      <GachaMachine x={1520} delay={-1.8} />
      <path className="fa1" d="M 0 840 H 1600 V 900 H 0 Z" />
      <Figure
        x={360}
        y={884}
        s={0.7}
        pose="squat"
        flip
        arms={{ which: "R", values: [0, 20, 0], dur: 2.4 }}
      />
      <Figure
        x={1230}
        y={884}
        s={0.62}
        pose="armsUp"
        arms={{ which: "both", values: [0, 20, 0], dur: 0.8 }}
      />
    </Art>
  );
}

/* ── 13. 将棋 Shogi match ───────────────────────────────────────────── */

function Piece({
  x,
  y,
  ch,
  s = 1,
  flip,
}: {
  x: number;
  y: number;
  ch: string;
  s?: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${flip ? 180 : 0})`}>
      <path className="fb3" d="M 0 -26 L 18 -16 L 22 22 L -22 22 L -18 -16 Z" />
      <text
        className="amb-glyph gink"
        x={0}
        y={4}
        fontSize={22}
        transform={flip ? "rotate(180)" : undefined}
      >
        {ch}
      </text>
    </g>
  );
}

export function Shogi({ glyphs }: SceneProps) {
  const chars = pick(glyphs, "王歩飛", 4);
  const bx = 1220;
  const by = 690;
  const cell = 40;
  return (
    <Art>
      <rect
        className="fa3"
        x={bx}
        y={by}
        width={cell * 9}
        height={cell * 4.6}
      />
      <g className="sa3" strokeWidth="1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={bx + i * cell}
            y1={by}
            x2={bx + i * cell}
            y2={by + cell * 4.6}
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={bx}
            y1={by + i * cell}
            x2={bx + cell * 9}
            y2={by + i * cell}
          />
        ))}
      </g>
      <Piece x={bx + 60} y={by + 30} ch={chars[1]!} s={0.9} flip />
      <Piece x={bx + 180} y={by + 30} ch="歩" s={0.9} flip />
      <Piece x={bx + 260} y={by + 110} ch={chars[2]!} s={0.9} />
      <Piece x={bx + 100} y={by + 150} ch="歩" s={0.9} />
      <Anim cls="amb-shogi-move">
        <Piece x={bx + 180} y={by + 150} ch={chars[0]!} />
      </Anim>
      <rect
        className="fa2"
        x={bx - 20}
        y={by + cell * 4.6}
        width={cell * 9 + 40}
        height={30}
      />
      <Figure
        x={1140}
        y={884}
        s={1.0}
        pose="seiza"
        robe
        arms={{ which: "R", values: [10, -40, -40, 10], dur: 4 }}
      />
      <g transform="translate(160 700)">
        <rect className="fb3" x={-70} y={0} width={140} height={60} rx={8} />
        <g>
          <line
            className="sa3"
            x1={-34}
            y1={30}
            x2={-34}
            y2={10}
            strokeWidth={3}
          />
          {spin(-34, 30, 12)}
        </g>
        <g>
          <line
            className="sa3"
            x1={34}
            y1={30}
            x2={34}
            y2={12}
            strokeWidth={3}
          />
          {spin(34, 30, 60)}
        </g>
      </g>
      <Figure
        x={260}
        y={884}
        s={0.85}
        pose="seiza"
        robe
        depth="far"
        upper={{ values: [10, 18, 10], dur: 5 }}
      />
    </Art>
  );
}

/* ── 14. 図書館 Library ─────────────────────────────────────────────── */

function Shelf({
  x0,
  w,
  seed,
  glyph,
}: {
  x0: number;
  w: number;
  seed: number;
  glyph: string;
}) {
  const r = seeded(seed);
  const tones = ["fa3", "fb3", "fc3", "fa2", "fc2"];
  const books: ReactNode[] = [];
  for (let row = 0; row < 5; row++) {
    const y = 140 + row * 150;
    let x = x0 + 8;
    let k = 0;
    while (x < x0 + w - 24) {
      const bw = 16 + Math.round(r() * 14);
      const bh = 90 + Math.round(r() * 40);
      books.push(
        <rect
          key={`${row}-${k}`}
          className={tones[Math.floor(r() * tones.length)]}
          x={x}
          y={y + 130 - bh}
          width={bw}
          height={bh}
        />,
      );
      if (row === 2 && k === 3) {
        books.push(
          <text
            key="g"
            className="amb-glyph glit"
            x={x + bw / 2}
            y={y + 130 - bh / 2}
            fontSize={16}
          >
            {glyph}
          </text>,
        );
      }
      x += bw + 2;
      k++;
    }
    books.push(
      <rect
        key={`s${row}`}
        className="fa3"
        x={x0}
        y={y + 130}
        width={w}
        height={10}
      />,
    );
  }
  return <g>{books}</g>;
}

export function Library({ glyphs }: SceneProps) {
  const [a, b] = pick(glyphs, "本読", 2);
  return (
    <>
      <div className="amb-beam amb-beam--1" />
      <Art>
        <Shelf x0={-10} w={300} seed={2801} glyph={a!} />
        <Shelf x0={1310} w={300} seed={2803} glyph={b!} />
        <g className="sa3" strokeWidth="5">
          <line x1={250} y1={300} x2={330} y2={880} />
          <line x1={300} y1={300} x2={380} y2={880} />
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1={258 + i * 10}
              y1={360 + i * 70}
              x2={308 + i * 10}
              y2={360 + i * 70}
            />
          ))}
        </g>
        <Figure
          x={320}
          y={640}
          s={0.62}
          pose="stand"
          depth="far"
          arms={{ which: "R", values: [-150, -130, -150], dur: 4 }}
        />
        <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
        <Mover cls="amb-ride" dur={40} delay={-12}>
          <g transform="translate(0 860)">
            <rect className="fa3" x={-80} y={-70} width={160} height={50} />
            <g className="fc3">
              {[-70, -50, -30, -10, 10, 30, 50].map((x) => (
                <rect key={x} x={x} y={-100} width={16} height={30} />
              ))}
            </g>
            <Wheel cx={-56} cy={-12} r={12} dur={0.9} />
            <Wheel cx={56} cy={-12} r={12} dur={0.9} />
          </g>
          <Figure
            x={-120}
            y={880}
            s={0.8}
            pose="walk"
            stride={{ deg: 12, dur: 1 }}
          />
        </Mover>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 14,
          seed: 2809,
          className: "amb-p--twinkle twinkle",
          duration: [5, 9],
          size: [0.2, 0.35],
          opacity: [0.3, 0.55],
          top: [10, 80],
          left: [20, 45],
        })}
      </div>
    </>
  );
}

/* ── 15. 喫茶店 Retro coffee shop ──────────────────────────────────── */

export function Kissaten() {
  const animated = !still();
  return (
    <>
      <Art>
        <g transform="translate(200 40)">
          <line className="sa3" x1={0} y1={0} x2={0} y2={60} strokeWidth={4} />
          <g>
            <ellipse className="fa3" cx={-70} cy={66} rx={70} ry={8} />
            <ellipse className="fa3" cx={70} cy={66} rx={70} ry={8} />
            {animated && (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1;0.15 1;1 1"
                dur="0.45s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </g>
          <circle className="fa4" cx={0} cy={66} r={10} />
        </g>
        <g transform="translate(1440 120)">
          <circle className="fb3" cx={0} cy={0} r={46} />
          <g className="sa3" strokeWidth="4" strokeLinecap="round">
            <g>
              <line x1={0} y1={0} x2={0} y2={-30} />
              {spin(0, 0, 60)}
            </g>
            <line x1={0} y1={0} x2={18} y2={6} />
          </g>
          <g>
            <line
              className="sa3"
              x1={0}
              y1={46}
              x2={0}
              y2={170}
              strokeWidth={3}
            />
            <circle className="fc3" cx={0} cy={176} r={16} />
            {rock(0, 46, -14, 14, 2)}
          </g>
        </g>
        <rect className="fa3" x={1080} y={780} width={540} height={20} />
        <rect className="fa2" x={1100} y={800} width={500} height={100} />
        <g transform="translate(1260 780)">
          <path className="fb3" d="M -24 0 L 24 0 L 20 -34 L -20 -34 Z" />
          <path
            className="sb3"
            fill="none"
            strokeWidth="5"
            d="M 22 -28 q 18 4 4 22"
          />
          <g className="sb2" fill="none" strokeWidth="3" strokeLinecap="round">
            <path
              className="amb-steam-line"
              d="M -8 -40 q -10 -18 0 -36 q 10 -18 0 -36"
            />
            <path
              className="amb-steam-line"
              d="M 8 -40 q -10 -22 0 -44 q 10 -22 0 -44"
            />
          </g>
        </g>
        <g transform="translate(1430 780)">
          <ellipse className="fb2" cx={0} cy={-30} rx={26} ry={30} />
          <rect className="fb2" x={-6} y={-110} width={12} height={56} />
          <ellipse className="fb3" cx={0} cy={-120} rx={22} ry={16} />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="fb4 amb-bubble-up"
              style={{ animationDelay: `${-i * 0.5}s` }}
              cx={-8 + i * 8}
              cy={-24}
              r={4}
            />
          ))}
        </g>
        <Figure
          x={260}
          y={880}
          s={0.95}
          pose="chair"
          hand={<rect className="ppb" x={-6} y={-46} width={50} height={60} />}
          arms={{ which: "R", values: [-10, -10, -30, -10], dur: 6 }}
        />
      </Art>
    </>
  );
}

/* ── 16. 公園の遊具 Playground ──────────────────────────────────────── */

export function Playground() {
  return (
    <Art>
      <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
      <g className="sa3" strokeWidth="7">
        <line x1={60} y1={860} x2={110} y2={560} />
        <line x1={380} y1={860} x2={330} y2={560} />
        <line x1={90} y1={560} x2={350} y2={560} />
      </g>
      {[170, 280].map((x, i) => (
        <g key={x}>
          <g className="sa2" strokeWidth="3">
            <line x1={x - 18} y1={560} x2={x - 18} y2={790} />
            <line x1={x + 18} y1={560} x2={x + 18} y2={790} />
          </g>
          <rect className="fa3" x={x - 26} y={790} width={52} height={8} />
          {i === 0 && <Figure x={x} y={800} s={0.6} pose="sit" />}
          {rock(x, 560, -24, 24, 2.4, i === 0 ? 0 : -1.2)}
        </g>
      ))}
      <g transform="translate(1340 820)">
        <path className="fa3" d="M -24 40 L 0 0 L 24 40 Z" />
        <g>
          <rect
            className="fa3"
            x={-200}
            y={-8}
            width={400}
            height={14}
            rx={6}
          />
          <Figure x={-180} y={-8} s={0.55} pose="sit" />
          <Figure x={180} y={-8} s={0.55} pose="sit" flip />
          {rock(0, 0, -12, 12, 2.8)}
        </g>
      </g>
      <g className="fb3">
        <path d="M 520 860 L 520 700 L 560 700 L 700 860 Z" />
      </g>
      <g>
        <Figure x={0} y={0} s={0.5} pose="sit" />
        {!still() && (
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path="M 540 700 L 680 856 L 760 862"
          />
        )}
      </g>
    </Art>
  );
}

/* ── 17. 稲刈り Rice harvest with a scarecrow ──────────────────────── */

export function Harvest() {
  const r = seeded(3001);
  const stalks = Array.from({ length: 70 }, (_, i) => {
    const x = i * 23 + r() * 10;
    const top = 760 + r() * 40;
    return (
      <path
        key={i}
        className="sa3"
        fill="none"
        strokeWidth="3"
        d={`M ${x} 900 Q ${x + 4} ${top + 40} ${x + 14} ${top}`}
      />
    );
  });
  const sickle = (
    <path
      className="ppl"
      fill="none"
      strokeWidth={3}
      d="M 0 0 L 10 20 M 10 20 q 20 -2 24 -20"
    />
  );
  return (
    <Art>
      <path
        className="fc1"
        d="M 0 760 Q 800 720 1600 760 L 1600 900 L 0 900 Z"
      />
      <Anim cls="amb-sway">{stalks}</Anim>
      <g transform="translate(1440 870)">
        <line className="sa3" x1={0} y1={0} x2={0} y2={-230} strokeWidth={8} />
        <line
          className="sa3"
          x1={-90}
          y1={-170}
          x2={90}
          y2={-170}
          strokeWidth={7}
        />
        <path className="fc3" d="M -40 -170 L 40 -170 L 30 -70 L -30 -70 Z" />
        <circle className="fb3" cx={0} cy={-200} r={26} />
        <path className="fa3" d="M -56 -214 L 56 -214 L 0 -248 Z" />
      </g>
      <g className="sa3" strokeWidth="5">
        <line x1={60} y1={880} x2={60} y2={700} />
        <line x1={360} y1={880} x2={360} y2={700} />
        <line x1={40} y1={720} x2={380} y2={720} />
      </g>
      <g className="fc3">
        {[90, 140, 190, 240, 290, 330].map((x) => (
          <path
            key={x}
            d={`M ${x} 720 L ${x + 20} 720 L ${x + 26} 800 L ${x - 6} 800 Z`}
          />
        ))}
      </g>
      <Figure
        x={560}
        y={890}
        s={0.8}
        pose="crouch"
        hand={sickle}
        arms={{ which: "R", values: [0, 26, 0], dur: 1.1 }}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <g className="fa3">
            <ellipse cx={0} cy={0} rx={9} ry={6} />
            <circle cx={8} cy={-5} r={4} />
          </g>
          {!still() && (
            <animateMotion
              dur={`${5 + i}s`}
              begin={`${-i * 1.7}s`}
              repeatCount="indefinite"
              path={`M ${1320 + i * 30} 650 q -60 -60 -120 0 t -120 20 q 60 60 240 -20`}
            />
          )}
        </g>
      ))}
    </Art>
  );
}

/* ── 18. 漁港 Fishing harbor ────────────────────────────────────────── */

function FishingBoat({ x, s, delay }: { x: number; s: number; delay: number }) {
  return (
    <g transform={`translate(${x} 800) scale(${s})`}>
      <Anim cls="amb-bobble" delay={delay}>
        <path className="fb3" d="M -130 0 L 130 0 L 100 44 L -110 44 Z" />
        <rect className="fb3" x={-30} y={-60} width={70} height={60} />
        <line
          className="sa3"
          x1={70}
          y1={0}
          x2={70}
          y2={-130}
          strokeWidth={4}
        />
        <Anim cls="amb-strip" origin="70px -130px">
          <path className="fc4" d="M 70 -130 L 116 -120 L 70 -108 Z" />
        </Anim>
        <g className="sa2" strokeWidth="2" fill="none">
          <path d="M 70 -126 L -120 -10 M 70 -126 L 128 -2" />
        </g>
      </Anim>
    </g>
  );
}

export function Harbor() {
  const animated = !still();
  return (
    <Art>
      <rect className="fb1" x={0} y={760} width={1600} height={140} />
      <g className="amb-shimmer sb2" strokeWidth="2" strokeLinecap="round">
        <path d="M 60 820 H 200 M 300 860 H 460 M 1100 830 H 1260 M 1300 870 H 1480" />
      </g>
      <FishingBoat x={190} s={0.95} delay={0} />
      <FishingBoat x={1420} s={0.8} delay={-1.3} />
      {[480, 560, 1180].map((x, i) => (
        <g
          key={x}
          className="amb-bobble"
          style={{ animationDelay: `${-i * 0.8}s` }}
        >
          <circle className="fc4" cx={x} cy={800} r={11} />
        </g>
      ))}
      <g transform="translate(1250 600)">
        <rect className="fa3" x={-10} y={0} width={20} height={160} />
        <g>
          <line
            className="sa3"
            x1={0}
            y1={0}
            x2={-180}
            y2={-120}
            strokeWidth={8}
          />
          <line
            className="sa2"
            x1={-180}
            y1={-120}
            x2={-180}
            y2={-30}
            strokeWidth={2}
          />
          <rect className="fc3" x={-206} y={-30} width={52} height={36} />
          {rock(0, 0, -6, 10, 9)}
        </g>
      </g>
      {[0, 1].map((i) => (
        <g key={i}>
          <path
            className="sb3"
            fill="none"
            strokeWidth="2.6"
            strokeLinecap="round"
            d="M -14 0 q 7 -7 14 0 q 7 -7 14 0"
          />
          {animated && (
            <animateMotion
              dur={`${9 + i * 3}s`}
              begin={`${-i * 4}s`}
              repeatCount="indefinite"
              path={
                i
                  ? "M 1420 300 a 120 50 0 1 1 0.1 0"
                  : "M 220 320 a 140 60 0 1 0 0.1 0"
              }
            />
          )}
        </g>
      ))}
    </Art>
  );
}

/* ── 19. 雪まつり Snow festival ─────────────────────────────────────── */

export function Yukimatsuri() {
  return (
    <>
      <Art>
        <path
          className="fb2"
          d="M 0 840 Q 800 810 1600 840 L 1600 900 L 0 900 Z"
        />
        <g className="amb-hue">
          <g transform="translate(220 840)">
            <rect className="fb3" x={-150} y={-120} width={300} height={120} />
            <rect className="fb3" x={-100} y={-220} width={200} height={100} />
            <path className="fb3" d="M -120 -220 L 0 -300 L 120 -220 Z" />
            <rect className="fc3" x={-30} y={-80} width={60} height={80} />
          </g>
          <g transform="translate(1400 840)">
            <path
              className="fb3"
              d="M -160 0 Q -140 -200 0 -260 Q 120 -220 160 0 Z"
            />
            <circle className="fc3" cx={-40} cy={-160} r={20} />
            <circle className="fc3" cx={40} cy={-160} r={20} />
          </g>
        </g>
        <Mover cls="amb-ride" dur={34} delay={-6}>
          <Figure
            x={0}
            y={884}
            s={0.8}
            pose="walk"
            stride={{ deg: 14, dur: 1 }}
          />
          <Figure
            x={-60}
            y={890}
            s={0.55}
            pose="walk"
            stride={{ deg: 16, dur: 0.8 }}
          />
        </Mover>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 20,
          seed: 3201,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.5],
          opacity: [0.24, 0.42],
        })}
      </div>
    </>
  );
}

/* ── 20. 折り鶴 Paper cranes ───────────────────────────────────────── */

function PaperCrane({ tone, s = 1 }: { tone: string; s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path className={tone} d="M -30 0 L 0 -8 L 30 0 L 0 8 Z" />
      <g>
        <path className={tone} d="M -6 -4 L 4 -40 L 14 -4 Z" />
        {rock(4, -4, -20, 20, 0.7)}
      </g>
      <path className={tone} d="M 26 -2 L 42 -24 L 34 -2 Z" />
      <path className={tone} d="M -26 -2 L -40 -18 L -34 0 Z" />
    </g>
  );
}

export function Origami() {
  const tones = ["fa4", "fb4", "fc4", "fa3", "fc3"];
  const animated = !still();
  const strand = (x: number, n: number, delay: number) => (
    <Anim cls="amb-strip" delay={delay} origin={`${x}px 0px`}>
      <line
        className="sb2"
        x1={x}
        y1={0}
        x2={x}
        y2={n * 46 + 20}
        strokeWidth={1.5}
      />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${x} ${30 + i * 46}) scale(0.6)`}>
          <path
            className={tones[(i + x) % tones.length]}
            d="M -30 0 L 0 -14 L 30 0 L 0 14 Z"
          />
          <path
            className={tones[(i + x + 1) % tones.length]}
            d="M -6 -6 L 0 -26 L 6 -6 Z"
          />
        </g>
      ))}
    </Anim>
  );
  return (
    <Art>
      {[40, 100, 160, 220].map((x, i) => strand(x, 7 + (i % 3) * 2, -i * 0.6))}
      {[1380, 1440, 1500, 1560].map((x, i) =>
        strand(x, 8 + (i % 2) * 3, -i * 0.5),
      )}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <PaperCrane tone={tones[i]!} s={1.2 - i * 0.2} />
          {animated && (
            <animateMotion
              dur={`${14 + i * 4}s`}
              begin={`${-i * 5}s`}
              repeatCount="indefinite"
              rotate="auto"
              path={
                i % 2
                  ? "M 1240 640 C 1100 560 1060 820 1240 780 C 1420 740 1380 600 1240 640"
                  : "M 360 640 C 500 560 540 820 360 780 C 180 740 220 600 360 640"
              }
            />
          )}
        </g>
      ))}
      <path className="fa1" d="M 0 860 H 1600 V 900 H 0 Z" />
    </Art>
  );
}
