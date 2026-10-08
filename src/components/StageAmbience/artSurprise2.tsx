import { Art } from "./artKit";
import { Figure } from "./figure";
import { Mover, Wheel } from "./artMotion";
import { Act, Puff } from "./artSurprise";
import { particles, pick, rock, seeded, spin, still } from "./scenery";
import type { SceneProps } from "./artJapan";

/*
 * Surprise scenes 11–20 (see artSurprise.tsx for the rules).
 * Ramen menu tags, omikuji ema and the kamishibai picture show the
 * current word's kanji.
 */

/* ── 11. 龍 Dragon in the storm clouds (jade & storm grey) ─────────── */

function dragonPath(phase: number): string {
  const pts: string[] = [];
  for (let x = -900; x <= 0; x += 30) {
    const env = Math.min(1, -x / 180);
    const y = 34 * env * Math.sin((x / 300) * Math.PI * 2 + phase);
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
}

function DragonHead() {
  return (
    <g>
      <path
        className="fa4"
        d="M -10 -20 Q 40 -30 70 -6 L 92 0 L 66 10 Q 40 24 -10 18 Z"
      />
      <path
        className="sa4"
        fill="none"
        strokeWidth={4}
        d="M 0 -18 Q -10 -50 -40 -60 M 14 -20 Q 10 -54 -14 -70"
      />
      <circle className="fc4" cx={36} cy={-8} r={5} />
      <path
        className="sc3"
        fill="none"
        strokeWidth={3}
        d="M 70 6 Q 110 30 150 10"
      >
        {!still() && (
          <animate
            attributeName="d"
            values="M 70 6 Q 110 30 150 10;M 70 6 Q 110 -10 150 20;M 70 6 Q 110 30 150 10"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </g>
  );
}

export function Dragon() {
  const phases = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 0].map(
    dragonPath,
  );
  const values = phases.join(";");
  const body = (cls: string, width: number, dash?: string) => (
    <path
      className={cls}
      fill="none"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash}
      d={phases[0]}
    >
      {!still() && (
        <animate
          attributeName="d"
          values={values}
          dur="3.2s"
          repeatCount="indefinite"
        />
      )}
    </path>
  );
  const cloud = (x: number, y: number, s: number, k: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <Act cls="amb-cloud" dur={18 + k * 4} delay={-k * 3}>
        <path
          className="fb2"
          d="M -160 40 q -10 -50 50 -50 q 20 -50 80 -30 q 40 -40 90 0 q 60 -10 70 40 q 40 20 10 40 Z"
        />
      </Act>
    </g>
  );
  return (
    <>
      <Art>
        <Act cls="amb-s-flash" dur={22}>
          <rect className="fc2" x={0} y={0} width={1600} height={900} />
        </Act>
        {cloud(70, 150, 1.0, 0)}
        {cloud(1520, 140, 1.1, 1)}
        {cloud(120, 860, 1.1, 2)}
        {cloud(1500, 860, 1.2, 3)}
        <Act cls="amb-s-flash" dur={22}>
          <path
            className="fc4"
            d="M 1530 0 L 1490 120 L 1530 120 L 1470 280 L 1550 100 L 1510 100 L 1560 0 Z"
          />
        </Act>
        {/* Temple roof and pine */}
        <path
          className="fa2"
          d="M 1360 830 Q 1420 810 1440 780 L 1580 780 Q 1600 810 1660 830 Z"
        />
        <rect className="fd" x={1400} y={830} width={220} height={70} />
        <path
          className="fd"
          d="M 60 900 Q 90 760 70 640 L 100 640 Q 120 760 130 900 Z"
        />
        <path
          className="fa3"
          d="M -10 660 q 50 -60 120 -40 q 70 0 90 40 q -80 30 -210 0 Z"
        />
        {/* The dragon swims low through the clouds, chasing its pearl */}
        <g transform="translate(0 852)">
          <Act cls="amb-s-dragon" dur={40} delay={-8}>
            {body("sa3", 30)}
            {body("sa2", 48, "5 20")}
            <DragonHead />
            <g transform="translate(190 0)">
              <g className="amb-glow">
                <circle className="fc3" r={18} />
              </g>
            </g>
          </Act>
        </g>
        {/* Surprise: thunder, and a dragon looks down from the corner */}
        <g transform="translate(1440 130) rotate(70) scale(1.6)">
          <Act cls="amb-s-dragonpeek" dur={22}>
            <path
              className="sa3"
              fill="none"
              strokeWidth={30}
              strokeLinecap="round"
              d="M -400 0 Q -200 -40 -10 0"
            />
            <DragonHead />
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 20,
          seed: 4101,
          className: "amb-p--drop fall-fast",
          duration: [1.2, 2],
          size: [0.15, 0.25],
          opacity: [0.14, 0.26],
        })}
      </div>
    </>
  );
}

/* ── 12. ラーメン屋 Ramen counter (tonkotsu cream & chili) ─────────── */

function Bowl() {
  return (
    <g>
      <path
        className="fb3"
        d="M -40 -26 L 40 -26 Q 36 4 0 4 Q -36 4 -40 -26 Z"
      />
      <ellipse className="fa3" cx={0} cy={-26} rx={40} ry={7} />
    </g>
  );
}

export function Ramen({ glyphs }: SceneProps) {
  const tags = pick(glyphs, "醤油味噌塩豚", 6);
  const strainer = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={30} y2={-12} strokeWidth={4} />
      <path className="ppa" d="M 26 -24 L 56 -24 L 42 4 Z" />
    </g>
  );
  const chopsticks = (
    <g className="ppl" strokeWidth={2.5}>
      <line x1={0} y1={0} x2={24} y2={-22} />
      <line x1={4} y1={2} x2={30} y2={-16} />
    </g>
  );
  return (
    <>
      <Art>
        {/* Noren */}
        <Act cls="amb-curtain">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                className="fb3"
                x={10 + i * 92}
                y={0}
                width={86}
                height={150}
              />
              {i === 1 && <circle className="fa3" cx={145} cy={84} r={26} />}
            </g>
          ))}
        </Act>
        {/* Menu tags on the wall, with the word's kanji */}
        {tags.map((g, i) => (
          <g key={i} transform={`translate(${1340 + i * 44} 190)`}>
            <rect className="fa3" x={-19} y={0} width={38} height={150} />
            <text className="amb-glyph gink" x={0} y={42} fontSize={26}>
              {g}
            </text>
            <text className="amb-glyph gink" x={0} y={100} fontSize={18}>
              {i % 2 ? "円" : "麺"}
            </text>
          </g>
        ))}
        {/* Pots, chef */}
        <g transform="translate(70 830)">
          <rect
            className="fa3"
            x={-70}
            y={-90}
            width={140}
            height={90}
            rx={8}
          />
          <ellipse className="fa2" cx={0} cy={-90} rx={70} ry={12} />
        </g>
        <Figure
          x={170}
          y={860}
          s={1}
          pose="stand"
          headwear={
            <path className="ppb" d="M -16 -8 L 16 -8 L 14 -16 L -14 -16 Z" />
          }
          hand={strainer}
          arms={{ which: "R", values: [-70, -30, -70], dur: 0.7 }}
        />
        {/* Counter */}
        <rect className="fa3" x={0} y={830} width={1600} height={20} />
        <rect className="fa1" x={0} y={850} width={1600} height={50} />
        <g transform="translate(1440 830)">
          <Bowl />
        </g>
        <g transform="translate(1550 830)">
          <Bowl />
        </g>
        {/* Customers slurping */}
        <Figure
          x={1420}
          y={900}
          s={0.9}
          pose="chair"
          flip
          upper={{ values: [0, 14, 0, 14], dur: 1.6 }}
          hand={chopsticks}
        />
        <Figure
          x={1530}
          y={900}
          s={0.9}
          pose="chair"
          flip
          upper={{ values: [10, 0], dur: 1.3 }}
          hand={chopsticks}
        />
        {/* Surprise: the big noodle toss, then a naruto rolls down the counter */}
        <g transform="translate(220 690)">
          <Act cls="amb-s-noodle" dur={20}>
            <g
              className="sa4"
              fill="none"
              strokeWidth={4}
              strokeLinecap="round"
            >
              {[0, 10, 20, 30].map((d) => (
                <path
                  key={d}
                  d={`M ${-40 + d} 0 q 10 -40 0 -80 q -10 -40 10 -80`}
                />
              ))}
            </g>
          </Act>
        </g>
        <g transform="translate(230 812)">
          <Act cls="amb-s-naruto" dur={20}>
            <g>
              <circle className="fc3" r={18} />
              <path
                className="sb4"
                fill="none"
                strokeWidth={3}
                d="M 0 0 a 4 4 0 0 1 8 0 a 8 8 0 0 1 -16 0 a 12 12 0 0 1 24 0"
              />
              {spin(0, 0, 0.7)}
            </g>
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 6,
          seed: 4201,
          className: "amb-p--steam rise-slow",
          duration: [8, 13],
          size: [3, 5],
          opacity: [0.5, 0.8],
          left: [1, 9],
        })}
        {particles({
          count: 4,
          seed: 4202,
          className: "amb-p--steam rise-slow",
          duration: [8, 12],
          size: [2.5, 4],
          opacity: [0.45, 0.7],
          left: [88, 98],
        })}
      </div>
    </>
  );
}

/* ── 13. ロボット工場 Robot factory (safety yellow & graphite) ────────── */

function RobotArm({ dur, begin }: { dur: number; begin: number }) {
  const rk = (cx: number, cy: number, a: number, b: number) =>
    rock(cx, cy, a, b, dur, begin);
  return (
    <g>
      <rect className="fb3" x={-50} y={-30} width={100} height={30} />
      <circle className="fa3" cx={0} cy={-40} r={24} />
      <g>
        <rect
          className="fa3"
          x={-12}
          y={-240}
          width={24}
          height={200}
          rx={10}
        />
        <circle className="fb3" cx={0} cy={-240} r={18} />
        <g>
          <rect
            className="fa3"
            x={0}
            y={-252}
            width={170}
            height={22}
            rx={10}
          />
          <g transform="translate(176 -241)">
            <g>
              <rect className="fb4" x={0} y={-6} width={30} height={10} />
              {rock(0, 0, -20, 10, dur / 2, begin)}
            </g>
            <g>
              <rect className="fb4" x={0} y={-2} width={30} height={10} />
              {rock(0, 0, 20, -10, dur / 2, begin)}
            </g>
          </g>
          {rk(0, -240, -30, 30)}
        </g>
        {rk(0, -40, -18, 14)}
      </g>
    </g>
  );
}

function LittleRobot() {
  return (
    <g>
      <rect className="pp" x={-22} y={-56} width={44} height={40} rx={8} />
      <rect className="pp" x={-18} y={-14} width={36} height={18} rx={4} />
      <line className="ppl" x1={0} y1={-56} x2={0} y2={-72} strokeWidth={3} />
      <g className="amb-blink">
        <circle className="ppc" cx={0} cy={-76} r={5} />
      </g>
      <circle className="ppc" cx={-9} cy={-38} r={5} />
      <circle className="ppc" cx={9} cy={-38} r={5} />
      <g>
        <line
          className="ppl"
          x1={-22}
          y1={-10}
          x2={-44}
          y2={-34}
          strokeWidth={6}
        />
        {rock(-22, -10, -20, 20, 0.5)}
      </g>
    </g>
  );
}

export function Robot() {
  const box = (
    <g>
      <rect className="fa3" x={-34} y={-50} width={68} height={50} />
      <rect className="fb3" x={-4} y={-50} width={8} height={50} />
    </g>
  );
  return (
    <>
      <Art>
        <g className="sb2" fill="none" strokeWidth={3}>
          <path d="M 0 30 L 1600 30" />
          <path
            d={Array.from(
              { length: 21 },
              (_, i) => `${i ? "L" : "M"} ${i * 80} ${i % 2 ? 0 : 30}`,
            ).join(" ")}
          />
        </g>
        {/* Beacon */}
        <g transform="translate(1520 170)">
          <g>
            <path className="fc2" d="M 0 0 L 120 -40 L 120 40 Z" />
            {spin(0, 0, 2)}
          </g>
          <g className="amb-glow">
            <circle className="fa4" r={18} />
          </g>
          <rect className="fb3" x={-24} y={14} width={48} height={14} />
        </g>
        {/* Status panel */}
        <rect className="fd" x={20} y={220} width={100} height={160} rx={6} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} className={`amb-blink${i % 2 ? " amb-blink--alt" : ""}`}>
            <circle
              className={i % 3 ? "fc4" : "fa4"}
              cx={45 + (i % 3) * 25}
              cy={260 + Math.floor(i / 3) * 40}
              r={7}
            />
          </g>
        ))}
        <g transform="translate(150 836) scale(0.85)">
          <RobotArm dur={4} begin={0} />
        </g>
        <g transform="translate(1410 836) scale(-0.85 0.85)">
          <RobotArm dur={5} begin={-1.5} />
        </g>
        {/* Conveyor */}
        <rect className="fb2" x={0} y={836} width={1600} height={18} />
        <Act cls="amb-s-belt" dur={1.2}>
          <line
            className="sa3"
            x1={0}
            y1={836}
            x2={1600}
            y2={836}
            strokeWidth={4}
            strokeDasharray="20 20"
          />
        </Act>
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i}>
            <circle className="fb3" cx={40 + i * 80} cy={846} r={8} />
            <line
              className="sb4"
              x1={34 + i * 80}
              y1={846}
              x2={46 + i * 80}
              y2={846}
              strokeWidth={2}
            />
          </g>
        ))}
        {[0, -6, -12, -18].map((d) => (
          <Mover key={d} cls="amb-ride" dur={24} delay={d}>
            <g transform="translate(0 836)">{box}</g>
          </Mover>
        ))}
        {/* Hazard stripes */}
        <g>
          {Array.from({ length: 34 }, (_, i) => (
            <path
              key={i}
              className={i % 2 ? "fa3" : "fd"}
              d={`M ${i * 50 - 20} 900 L ${i * 50 + 10} 870 L ${i * 50 + 40} 870 L ${i * 50 + 10} 900 Z`}
            />
          ))}
        </g>
        {/* Surprise: a box opens and a little robot waves hello */}
        <g transform="translate(1550 836)">
          <Act cls="amb-s-popbot" dur={24}>
            <g className="amb-person amb-s-bold">
              <LittleRobot />
            </g>
            <path
              className="fc4"
              d="M -30 -110 c -10 -14 -30 0 -14 16 l 14 12 l 14 -12 c 16 -16 -4 -30 -14 -16 Z"
            />
          </Act>
          <rect className="fa3" x={-40} y={-56} width={80} height={56} />
          <g transform="translate(-40 -56)">
            <Act cls="amb-s-lid" dur={24}>
              <rect className="fa4" x={0} y={-8} width={80} height={8} />
            </Act>
          </g>
        </g>
      </Art>
    </>
  );
}

/* ── 14. おみくじ Fortune slips at the shrine (plum & gold) ─────────── */

export function Omikuji({ glyphs }: SceneProps) {
  const ema = pick(glyphs, "合格健康恋", 6);
  const r = seeded(4401);
  const box = (
    <g transform="rotate(-20)">
      <rect className="ppa" x={-10} y={-40} width={20} height={44} />
    </g>
  );
  return (
    <>
      <Art>
        {/* Roof corners with rope and paper streamers */}
        <path className="fa3" d="M -20 70 Q 120 100 280 60 L 280 0 L -20 0 Z" />
        <path
          className="fa3"
          d="M 1320 60 Q 1480 100 1620 70 L 1620 0 L 1320 0 Z"
        />
        <path
          className="sb3"
          fill="none"
          strokeWidth={12}
          strokeLinecap="round"
          d="M -10 110 Q 120 150 260 100 M 1340 100 Q 1480 150 1610 110"
        />
        {[90, 200, 1400, 1530].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 3 ? 132 : 124})`}>
            <Act cls="amb-flutter" dur={2.6 + i * 0.3} delay={-i}>
              <path
                className="fc3"
                d="M 0 0 L 16 0 L 6 22 L 22 22 L 10 48 L 26 48 L 12 76 L -2 76 L 10 48 L -6 48 L 6 22 L -10 22 Z"
              />
            </Act>
          </g>
        ))}
        {/* Bell rope on the right */}
        <g>
          <path
            className="sc3"
            fill="none"
            strokeWidth={8}
            d="M 1470 140 Q 1480 330 1470 520"
          />
          <circle className="fb4" cx={1470} cy={176} r={28} />
          {rock(1470, 130, -5, 5, 2.8)}
        </g>
        {/* Omikuji tying rack on the left */}
        <g className="sc3" strokeWidth={3}>
          <line x1={14} y1={600} x2={206} y2={600} />
          <line x1={14} y1={660} x2={206} y2={660} />
        </g>
        {[600, 660].map((y) =>
          Array.from({ length: 8 }, (_, i) => (
            <g key={`${y}-${i}`} transform={`translate(${26 + i * 24} ${y})`}>
              <Act cls="amb-flutter" dur={1.6 + r()} delay={-r() * 2}>
                <rect className="fc4" x={-5} y={-4} width={10} height={20} />
              </Act>
            </g>
          )),
        )}
        <rect className="fa3" x={8} y={580} width={10} height={310} />
        <rect className="fa3" x={202} y={580} width={10} height={310} />
        {/* Ema rack with the word's kanji */}
        <rect className="fa3" x={1390} y={580} width={210} height={10} />
        <rect className="fa3" x={1390} y={700} width={210} height={10} />
        <rect className="fa3" x={1396} y={580} width={10} height={310} />
        {ema.map((g, i) => {
          const x = 1440 + (i % 3) * 62;
          const y = i < 3 ? 594 : 714;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Act cls="amb-sway-soft" dur={4 + r() * 3} delay={-r() * 4}>
                <g transform="translate(0 70)">
                  <path
                    className="fb3"
                    d="M -26 0 L -26 -46 L 0 -62 L 26 -46 L 26 0 Z"
                  />
                  <text className="amb-glyph gink" x={0} y={-24} fontSize={24}>
                    {g}
                  </text>
                </g>
              </Act>
            </g>
          );
        })}
        {/* A visitor shakes the omikuji box */}
        <Figure
          x={120}
          y={890}
          s={0.85}
          pose="stand"
          robe
          hand={box}
          arms={{ which: "R", values: [-60, -30], dur: 0.32 }}
        />
        {/* Surprise: the slip flies out, opens — 大吉! */}
        <g transform="translate(150 760)">
          <g transform="translate(20 -420)">
            <Act cls="amb-s-burst" dur={22}>
              <g className="sb4" strokeWidth={4} strokeLinecap="round">
                {Array.from({ length: 12 }, (_, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={-90}
                    x2={0}
                    y2={-118}
                    transform={`rotate(${i * 30})`}
                  />
                ))}
              </g>
            </Act>
          </g>
          <Act cls="amb-s-slipfly" dur={22}>
            <Act cls="amb-s-slipopen" dur={22}>
              <rect className="fc4" x={-30} y={-80} width={60} height={160} />
              <rect
                className="sb3"
                fill="none"
                strokeWidth={3}
                x={-24}
                y={-74}
                width={48}
                height={148}
              />
              <text className="amb-glyph gc" x={0} y={-34} fontSize={44}>
                大
              </text>
              <text className="amb-glyph gc" x={0} y={24} fontSize={44}>
                吉
              </text>
            </Act>
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 10,
          seed: 4402,
          className: "amb-p--petal fall",
          duration: [11, 18],
          size: [0.6, 1],
          opacity: [0.3, 0.55],
        })}
      </div>
    </>
  );
}

/* ── 15. ひまわり畑 Sunflower field (sunflower & cobalt) ────────────── */

function Sunflower({ h, r }: { h: number; r: number }) {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `${i ? "L" : "M"} ${(Math.cos(a) * r * 1.7).toFixed(1)} ${(Math.sin(a) * r * 1.7 - h).toFixed(1)} L ${(Math.cos(a + Math.PI / 12) * r).toFixed(1)} ${(Math.sin(a + Math.PI / 12) * r - h).toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <line className="sc3" x1={0} y1={0} x2={0} y2={-h} strokeWidth={6} />
      <ellipse
        className="fc2"
        cx={-18}
        cy={-h * 0.45}
        rx={20}
        ry={9}
        transform={`rotate(-30 -18 ${-h * 0.45})`}
      />
      <ellipse
        className="fc2"
        cx={18}
        cy={-h * 0.62}
        rx={20}
        ry={9}
        transform={`rotate(30 18 ${-h * 0.62})`}
      />
      <path className="fa3" d={`${petals} Z`} />
      <circle className="fd" cx={0} cy={-h} r={r} />
    </g>
  );
}

export function Himawari() {
  const r = seeded(4501);
  const row = (
    x0: number,
    x1: number,
    y: number,
    n: number,
    h: number,
    rad: number,
  ) => (
    <Act cls="amb-s-gust" dur={22}>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + r() * 0.6)) / n;
        return (
          <g key={i} transform={`translate(${x.toFixed(0)} ${y})`}>
            <Act cls="amb-s-sunsway" dur={3.4} delay={-x / 400}>
              <Sunflower h={h * (0.85 + r() * 0.3)} r={rad} />
            </Act>
          </g>
        );
      })}
    </Act>
  );
  const bee = (path: string, dur: number, k: number) => (
    <g key={k}>
      <g>
        <ellipse className="fa4" cx={0} cy={0} rx={9} ry={6} />
        <g className="sd" strokeWidth={2}>
          <line x1={-2} y1={-6} x2={-2} y2={6} />
          <line x1={3} y1={-6} x2={3} y2={6} />
        </g>
        <Act cls="amb-s-buzz" dur={0.06}>
          <ellipse className="fb2" cx={0} cy={-9} rx={6} ry={4} />
        </Act>
      </g>
      {!still() && (
        <animateMotion path={path} dur={`${dur}s`} repeatCount="indefinite" />
      )}
    </g>
  );
  return (
    <>
      <Art>
        <circle className="fa1" cx={1560} cy={50} r={170} />
        <circle className="fa2" cx={1560} cy={50} r={80} />
        {[
          [110, 230, 0],
          [720, -10, 1],
          [1470, 300, 2],
        ].map(([x, y, k]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <Act cls="amb-cloud" dur={20 + k! * 6} delay={-k! * 4}>
              <path
                className="fb2"
                d="M -150 30 q -10 -50 50 -50 q 10 -60 80 -50 q 40 -40 90 0 q 70 -10 70 50 q 30 20 0 50 Z"
              />
            </Act>
          </g>
        ))}
        {row(0, 210, 770, 3, 150, 14)}
        {row(1390, 1600, 770, 3, 150, 14)}
        {row(-20, 200, 900, 2, 300, 24)}
        {row(1400, 1620, 900, 2, 300, 24)}
        {row(240, 1360, 902, 9, 70, 9)}
        {bee(
          "M 60 560 C 120 500 200 600 140 640 C 80 680 20 600 60 560 Z",
          5,
          1,
        )}
        {bee(
          "M 1460 560 C 1540 480 1600 600 1540 640 C 1460 690 1400 600 1460 560 Z",
          6,
          2,
        )}
        {bee(
          "M 900 850 C 980 820 1040 880 960 886 C 880 892 840 870 900 850 Z",
          4,
          3,
        )}
        <path
          className="fc1"
          d="M 0 900 L 0 870 Q 800 856 1600 870 L 1600 900 Z"
        />
        {/* A kid runs through the field */}
        <Mover cls="amb-pass" dur={14} delay={-3}>
          <Figure
            x={0}
            y={892}
            s={0.55}
            pose="walk"
            stride={{ deg: 26, dur: 0.46 }}
            headwear={
              <g>
                <ellipse className="ppa" cx={0} cy={-8} rx={26} ry={6} />
                <path className="ppa" d="M -12 -8 Q 0 -30 12 -8 Z" />
              </g>
            }
          />
        </Mover>
        {/* Surprise: a gust — the field leans, a straw hat sails away */}
        <Act cls="amb-s-windlines" dur={22}>
          <g className="sb3" fill="none" strokeWidth={3} strokeLinecap="round">
            <path d="M 0 40 q 200 -24 400 0 t 400 0" />
            <path d="M 600 20 q 200 -20 400 0" />
            <path d="M 200 870 q 200 -16 400 0 t 400 0" />
          </g>
        </Act>
        <g transform="translate(160 700)">
          <Act cls="amb-s-hatfly" dur={22}>
            <ellipse className="fa4" cx={0} cy={0} rx={44} ry={11} />
            <path className="fa4" d="M -22 0 Q 0 -36 22 0 Z" />
            <rect className="fc3" x={-22} y={-6} width={44} height={6} />
          </Act>
        </g>
      </Art>
    </>
  );
}

/* ── 16. 紙芝居 Picture-card show (sepia & teal) ────────────────────── */

export function Kamishibai({ glyphs }: SceneProps) {
  const [main] = pick(glyphs, "昔", 1);
  const kids: [number, number][] = [
    [1150, 0],
    [1260, 1],
    [1370, 2],
    [1480, 3],
  ];
  const clapper = (
    <g>
      <rect className="ppc" x={-4} y={-30} width={8} height={30} />
      <rect className="ppc" x={6} y={-30} width={8} height={30} />
    </g>
  );
  return (
    <>
      <Art>
        {/* Telephone pole and a crow */}
        <rect className="fa3" x={1570} y={0} width={14} height={880} />
        <path
          className="sa2"
          fill="none"
          strokeWidth={2}
          d="M 1576 120 Q 1600 140 1620 130 M 1576 160 Q 1600 180 1620 170"
        />
        <g
          className="amb-birds"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M 300 60 q 12 -10 24 0 q 12 -10 24 0" />
        </g>
        <path className="fa1" d="M 0 900 L 0 870 L 1600 870 L 1600 900 Z" />
        {/* Bicycle with the wooden stage */}
        <g transform="translate(230 884)">
          <circle
            className="sa3"
            fill="none"
            strokeWidth={5}
            cx={-80}
            cy={-36}
            r={36}
          />
          <circle
            className="sa3"
            fill="none"
            strokeWidth={5}
            cx={80}
            cy={-36}
            r={36}
          />
          <path
            className="sa3"
            fill="none"
            strokeWidth={6}
            d="M -80 -36 L -18 -36 L 26 -98 L 80 -36 M -18 -36 L -44 -98 L 26 -98 M -44 -98 L -54 -116 M 26 -98 L 36 -124"
          />
          <rect className="fa3" x={-130} y={-118} width={100} height={12} />
        </g>
        <g transform="translate(170 640)">
          <rect className="fa2" x={-6} y={0} width={12} height={130} />
          <rect
            className="fa3"
            x={-100}
            y={-150}
            width={200}
            height={150}
            rx={6}
          />
          <rect className="fa2" x={-156} y={-150} width={52} height={150} />
          <rect className="fa2" x={104} y={-150} width={52} height={150} />
          <path className="fc3" d="M -110 -150 L 0 -194 L 110 -150 Z" />
          {/* Three cards take turns */}
          <Act cls="amb-s-panel" dur={18} delay={0}>
            <path
              className="fb3"
              d="M -84 -20 L -40 -110 L 0 -50 L 30 -90 L 84 -20 Z"
            />
            <circle className="fc3" cx={50} cy={-110} r={16} />
          </Act>
          <Act cls="amb-s-panel" dur={18} delay={-6}>
            <circle className="fb3" cx={0} cy={-74} r={44} />
            <circle className="fd" cx={14} cy={-84} r={34} />
          </Act>
          <Act cls="amb-s-panel" dur={18} delay={-12}>
            <text className="amb-glyph gb" x={0} y={-72} fontSize={86}>
              {main}
            </text>
          </Act>
          <Act cls="amb-s-on" dur={24}>
            <path
              className="fc4"
              d="M 0 -140 L 16 -100 L 60 -120 L 36 -80 L 84 -70 L 36 -54 L 56 -14 L 12 -38 L 0 -4 L -12 -38 L -56 -14 L -36 -54 L -84 -70 L -36 -80 L -60 -120 L -16 -100 Z"
            />
            <text className="amb-glyph gb" x={0} y={-70} fontSize={56}>
              ！
            </text>
          </Act>
        </g>
        {/* Storyteller */}
        <Figure
          x={50}
          y={886}
          s={0.9}
          pose="stand"
          headwear={<path className="ppa" d="M -18 -4 Q 0 -24 18 -4 Z" />}
          hand={clapper}
          arms={{ which: "R", values: [-80, -20], dur: 2.2 }}
        />
        <g transform="translate(90 760)">
          <Act cls="amb-s-on" dur={24}>
            {[0, 0.3].map((d) => (
              <Act key={d} cls="amb-s-clack" dur={0.6} delay={-d}>
                <circle className="sc3" fill="none" strokeWidth={3} r={26} />
              </Act>
            ))}
          </Act>
        </g>
        {/* Kids watching — they jump up at the big moment */}
        {kids.map(([x, k]) => (
          <g key={x}>
            <Act cls="amb-s-off" dur={24}>
              <Figure
                x={x}
                y={886}
                s={0.56}
                pose="seiza"
                flip
                upper={{ values: [0, 6], dur: 2 + k * 0.4, begin: -k }}
              />
            </Act>
            <Act cls="amb-s-on" dur={24}>
              <Act cls="amb-s-jump" dur={0.5} delay={-k * 0.12}>
                <Figure x={x} y={886} s={0.5} pose="armsUp" flip />
              </Act>
            </Act>
          </g>
        ))}
      </Art>
    </>
  );
}

/* ── 17. 強風 A windy day (storm teal & mustard) ───────────────────── */

function UmbrellaOpen() {
  return (
    <g>
      <line className="ppl" x1={0} y1={0} x2={0} y2={-80} strokeWidth={3} />
      <path className="ppb" d="M -60 -70 Q 0 -140 60 -70 Z" />
    </g>
  );
}

function UmbrellaInside() {
  return (
    <g>
      <line className="ppl" x1={0} y1={0} x2={0} y2={-80} strokeWidth={3} />
      <path className="ppb" d="M -50 -150 Q 0 -60 50 -150 L 6 -80 L -6 -80 Z" />
    </g>
  );
}

export function Gust() {
  const tree = (x: number, k: number) => (
    <g key={x}>
      <path
        className="fd"
        d={`M ${x - 26} 900 Q ${x - 10} 700 ${x} 520 L ${x + 18} 520 Q ${x + 20} 700 ${x + 30} 900 Z`}
      />
      <Act cls="amb-s-bend" dur={1.6 + k * 0.3} delay={-k * 0.5}>
        <path
          className="fa3"
          d={`M ${x - 140} 560 q -40 -120 80 -170 q 60 -110 170 -40 q 90 30 60 150 q 20 90 -110 90 q -120 30 -200 -30 Z`}
        />
      </Act>
    </g>
  );
  const streak = (y: number, x: number, w: number, d: number) => (
    <Act key={`${x}-${y}`} cls="amb-s-streak" dur={2.4} delay={d}>
      <path
        className="sc3"
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${w * 0.4} ${w * 1.6}`}
        d={`M ${x} ${y} q ${w / 2} -24 ${w} 0`}
      />
    </Act>
  );
  return (
    <>
      <Art>
        {tree(140, 0)}
        {tree(1480, 1)}
        {streak(40, 100, 500, 0)}
        {streak(30, 900, 600, -0.8)}
        {streak(860, 300, 600, -0.4)}
        {streak(880, 1000, 500, -1.9)}
        {streak(260, 1300, 240, -1.2)}
        {streak(300, 20, 200, -1.6)}
        {/* Nobori banner flapping */}
        <rect className="fa3" x={20} y={560} width={8} height={330} />
        <g transform="translate(28 580)">
          <Act cls="amb-s-banner" dur={0.9}>
            <rect className="fb3" x={0} y={0} width={56} height={220} />
          </Act>
        </g>
        {/* A-frame sign rocking */}
        <g>
          <path
            className="fb3"
            d="M 1420 880 L 1450 760 L 1510 760 L 1540 880 L 1520 880 L 1496 790 L 1464 790 L 1440 880 Z"
          />
          {rock(1480, 880, -4, 5, 1.1)}
        </g>
        <path className="fa1" d="M 0 900 L 0 870 L 1600 870 L 1600 900 Z" />
        {/* A walker leans into the wind */}
        <Mover cls="amb-pass amb-pass--back" dur={30} delay={-8}>
          <g transform="translate(0 892) scale(-0.55 0.55)">
            <g transform="rotate(10)">
              <Figure
                x={0}
                y={0}
                s={1}
                pose="walk"
                stride={{ deg: 10, dur: 1.4 }}
              />
              <g transform="translate(26 -96)">
                <Act cls="amb-s-off" dur={22}>
                  <g className="amb-person">
                    <UmbrellaOpen />
                  </g>
                </Act>
                <Act cls="amb-s-on" dur={22}>
                  <Act cls="amb-s-shake" dur={0.2}>
                    <g className="amb-person amb-s-bold">
                      <UmbrellaInside />
                    </g>
                  </Act>
                </Act>
              </g>
            </g>
          </g>
        </Mover>
        {/* Surprise 2: a cardboard box tumbles past */}
        <g transform="translate(0 840)">
          <Act cls="amb-s-tumble" dur={22}>
            <rect className="fb3" x={-30} y={-30} width={60} height={60} />
            <line
              className="sb4"
              x1={-30}
              y1={0}
              x2={30}
              y2={0}
              strokeWidth={3}
            />
          </Act>
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 16,
          seed: 4701,
          className: "amb-p--leaf blow",
          duration: [3, 6],
          size: [0.8, 1.3],
          opacity: [0.25, 0.45],
          top: [8, 92],
        })}
      </div>
    </>
  );
}

/* ── 18. 海女 Ama divers under the sea (aqua & pearl) ──────────────── */

function Fish({ cls }: { cls: string }) {
  return (
    <path
      className={cls}
      d="M -14 0 Q 0 -9 14 0 Q 0 9 -14 0 Z M -14 0 L -22 -7 L -22 7 Z"
    />
  );
}

export function Ama() {
  const r = seeded(4801);
  const school = (n: number, cls: string, h: number) =>
    Array.from({ length: n }, (_, i) => (
      <g
        key={i}
        transform={`translate(${(r() * 220).toFixed(0)} ${(r() * h).toFixed(0)})`}
      >
        <Fish cls={cls} />
      </g>
    ));
  const kelp = (x: number, h: number, k: number) => (
    <Act key={x} cls="amb-s-kelp" dur={4 + k} delay={-k}>
      <path
        className="fc3"
        d={`M ${x} 900 q -20 ${-h / 4} 0 ${-h / 2} q 20 ${-h / 4} 0 ${-h / 2} q 14 ${h / 4} 6 ${h / 2} q -14 ${h / 4} 6 ${h / 2} Z`}
      />
    </Act>
  );
  return (
    <>
      <Art>
        {/* Surface and the tub boat */}
        <Act cls="amb-s-wave" dur={6}>
          <path
            className="sb3"
            fill="none"
            strokeWidth={3}
            d={`M -400 96 ${Array.from({ length: 24 }, () => "q 25 -10 50 0 q 25 10 50 0").join(" ")}`}
          />
        </Act>
        <g transform="translate(150 90)">
          <Act cls="amb-bobble" dur={2.4}>
            <path
              className="fa3"
              d="M -50 -20 L 50 -20 Q 46 10 0 12 Q -46 10 -50 -20 Z"
            />
          </Act>
        </g>
        {/* Seabed */}
        <path
          className="fd"
          d="M 0 900 L 0 840 Q 120 800 240 840 Q 360 870 480 850 L 560 900 Z"
        />
        <path
          className="fd"
          d="M 1040 900 L 1120 850 Q 1280 800 1400 836 Q 1500 810 1600 830 L 1600 900 Z"
        />
        {kelp(40, 300, 0)}
        {kelp(250, 110, 1)}
        {kelp(1400, 200, 2)}
        {kelp(1500, 320, 0.5)}
        {kelp(1570, 240, 1.5)}
        <g className="fb3">
          <path d="M 300 870 q 10 -20 20 0 Z" />
          <path d="M 1230 860 q 12 -24 24 0 Z" />
        </g>
        <g className="sc3" strokeWidth={2}>
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={i}
              x1={380}
              y1={856}
              x2={380 + Math.cos((i * Math.PI) / 5) * 18}
              y2={856 + Math.sin((i * Math.PI) / 5) * 18}
            />
          ))}
        </g>
        {/* Fish schools: one along the surface, one along the bottom */}
        <Mover cls="amb-ride" dur={30} delay={-10}>
          <g transform="translate(0 4)">
            <Act cls="amb-bobble" dur={1.6}>
              {school(12, "fa4", 36)}
            </Act>
          </g>
        </Mover>
        <Mover cls="amb-ride amb-ride--back" dur={44} delay={-5}>
          <g transform="translate(0 836) scale(-1 1)">{school(8, "fb3", 30)}</g>
        </Mover>
        {/* The diver goes down for shells and comes back up */}
        <g transform="translate(120 180)">
          <Act cls="amb-s-dive" dur={20}>
            <Act cls="amb-s-diveturn" dur={20}>
              <Figure
                x={0}
                y={80}
                s={0.6}
                pose="armsUp"
                headwear={<circle className="ppb" cx={0} cy={-2} r={15} />}
              />
            </Act>
          </Act>
        </g>
        {/* Surprise A: a manta glides along the bottom */}
        <g transform="translate(0 846) scale(0.6)">
          <Act cls="amb-s-manta" dur={26}>
            <g className="amb-person amb-s-bold">
              <Act cls="amb-s-mantaflap" dur={2}>
                <path
                  className="pp"
                  d="M -10 0 Q -60 -90 -150 -100 Q -90 -40 -60 0 Q -90 40 -150 100 Q -60 90 -10 0 Z"
                />
              </Act>
              <ellipse className="pp" cx={0} cy={0} rx={40} ry={26} />
              <path
                className="ppl"
                strokeWidth={3}
                fill="none"
                d="M 40 0 L 150 6"
              />
            </g>
          </Act>
        </g>
        {/* Surprise B: an octopus inks and scoots */}
        <g transform="translate(1480 846)">
          <Act cls="amb-s-octopus" dur={26}>
            <g className="amb-person amb-s-bold">
              <ellipse className="ppc" cx={0} cy={-40} rx={26} ry={30} />
              <path
                className="ppc"
                d="M -26 -22 q -16 26 -40 26 q 18 -8 28 -30 Z M -12 -14 q -4 30 -22 34 q 12 -12 12 -34 Z M 12 -14 q 4 30 22 34 q -12 -12 -12 -34 Z M 26 -22 q 16 26 40 26 q -18 -8 -28 -30 Z"
              />
              <circle className="ppb" cx={-8} cy={-44} r={5} />
              <circle className="ppb" cx={10} cy={-44} r={5} />
            </g>
          </Act>
          <g transform="translate(-30 -40)">
            <Act cls="amb-s-ink" dur={26}>
              <Puff cls="fd" />
            </Act>
          </g>
        </g>
      </Art>
      <div className="amb-beam amb-beam--1" />
      <div className="amb-beam amb-beam--2" />
      <div className="amb-particles">
        {particles({
          count: 10,
          seed: 4802,
          className: "amb-p--bubble rise",
          duration: [7, 12],
          size: [0.4, 0.9],
          opacity: [0.3, 0.5],
          left: [5, 12],
        })}
        {particles({
          count: 6,
          seed: 4803,
          className: "amb-p--bubble rise",
          duration: [8, 14],
          size: [0.4, 0.8],
          opacity: [0.25, 0.45],
          left: [86, 98],
        })}
      </div>
    </>
  );
}

/* ── 19. 夜空の列車 Night train to the stars (deep blue & gold) ──────── */

function Train({ windows }: { windows: string }) {
  return (
    <g>
      <rect className="fa3" x={-60} y={-60} width={120} height={50} rx={18} />
      <rect className="fa3" x={30} y={-90} width={30} height={80} />
      <rect className="fa4" x={-50} y={-86} width={18} height={28} />
      <path className="fb3" d="M -64 -14 L -84 -2 L -60 -2 Z" />
      <Wheel cx={-30} cy={-6} r={14} dur={0.5} />
      <Wheel cx={20} cy={-6} r={14} dur={0.5} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${80 + i * 150} 0)`}>
          <rect className="fa3" x={0} y={-80} width={140} height={70} rx={8} />
          <g className={windows}>
            {[0, 1, 2, 3].map((w) => (
              <rect
                key={w}
                x={12 + w * 32}
                y={-68}
                width={22}
                height={24}
                rx={4}
              />
            ))}
          </g>
          <Wheel cx={26} cy={-6} r={12} dur={0.5} />
          <Wheel cx={114} cy={-6} r={12} dur={0.5} />
        </g>
      ))}
    </g>
  );
}

export function StarTrain() {
  const skyPath =
    "M 1100 940 C 1220 720 1330 520 1370 390 S 1440 210 1560 190 S 1720 150 1840 40";
  const sky = !still() && (
    <g opacity={0}>
      <g transform="scale(-0.5 0.5)">
        <Train windows="fb4" />
        <g className="fb4">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={540 + i * 60}
              cy={-30 + (i % 2) * 16}
              r={6 - i}
            />
          ))}
        </g>
      </g>
      <animateMotion
        path={skyPath}
        dur="30s"
        repeatCount="indefinite"
        rotate="auto"
        keyTimes="0;0.3;0.56;1"
        keyPoints="0;0;1;1"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        values="0;0;1;1;0;0"
        keyTimes="0;0.3;0.32;0.54;0.56;1"
        dur="30s"
        repeatCount="indefinite"
      />
    </g>
  );
  return (
    <>
      <Art>
        <path
          className="fc1"
          d="M -100 300 Q 600 60 1700 160 L 1700 260 Q 600 160 -100 420 Z"
        />
        <circle className="fb1" cx={1490} cy={210} r={130} />
        <circle className="fb3" cx={1490} cy={210} r={72} />
        <path
          className="fd"
          d="M 0 900 L 0 760 Q 200 720 420 770 Q 700 740 1000 770 Q 1300 730 1600 760 L 1600 900 Z"
        />
        {/* Viaduct */}
        <rect className="fa2" x={0} y={860} width={1600} height={12} />
        <g className="fa1">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M ${i * 200} 872 L ${i * 200 + 200} 872 L ${i * 200 + 200} 900 L ${i * 200 + 170} 900 Q ${i * 200 + 100} 876 ${i * 200 + 30} 900 L ${i * 200} 900 Z`}
            />
          ))}
        </g>
        {/* Station lamp */}
        <rect className="fa3" x={120} y={700} width={8} height={160} />
        <g className="amb-s-flicker">
          <circle className="fb3" cx={124} cy={690} r={18} />
        </g>
        {/* The train crosses the viaduct, puffing */}
        <Mover cls="amb-pass" dur={26} delay={-4}>
          <g transform="translate(0 860) scale(0.7)">
            <Train windows="fb3" />
            <g transform="translate(45 -96)">
              {[0, 0.3, 0.6].map((d) => (
                <Act key={d} cls="amb-s-smoke" dur={0.9} delay={-d}>
                  <circle className="fc3" r={14} />
                </Act>
              ))}
            </g>
          </g>
        </Mover>
        {/* Surprise: a train lifts off and sails across the moon */}
        {sky}
      </Art>
      <div className="amb-particles">
        {particles({
          count: 34,
          seed: 4901,
          className: "amb-p--twinkle twinkle",
          duration: [3, 7],
          size: [0.18, 0.34],
          opacity: [0.35, 0.75],
          top: [3, 60],
        })}
      </div>
    </>
  );
}

/* ── 20. マグロの競り Tuna auction at dawn (ice blue & tuna red) ───────── */

function Tuna({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path
        className="fa3"
        d="M -90 0 Q -40 -40 50 -20 Q 80 -14 90 -4 L 120 -26 L 112 0 L 120 26 L 90 4 Q 70 18 -60 14 Q -96 10 -90 0 Z"
      />
      <ellipse className="fb3" cx={-82} cy={0} rx={10} ry={10} />
    </g>
  );
}

export function Seri() {
  const cap = <path className="ppa" d="M -16 -6 Q 0 -24 16 -6 L 26 -4 Z" />;
  return (
    <>
      <Art>
        {/* Roof trusses and lamps */}
        <g className="sc2" fill="none" strokeWidth={3}>
          <path d="M 0 36 L 1600 36" />
          <path
            d={Array.from(
              { length: 17 },
              (_, i) => `${i ? "L" : "M"} ${i * 100} ${i % 2 ? 0 : 36}`,
            ).join(" ")}
          />
        </g>
        {[110, 1490].map((x, i) => (
          <g key={x}>
            <g>
              <line
                className="sc3"
                x1={x}
                y1={36}
                x2={x}
                y2={150}
                strokeWidth={2}
              />
              <path
                className="fa3"
                d={`M ${x - 30} 170 L ${x + 30} 170 L ${x + 14} 150 L ${x - 14} 150 Z`}
              />
              <path
                className="fa1"
                d={`M ${x - 30} 170 L ${x + 30} 170 L ${x + 80} 360 L ${x - 80} 360 Z`}
              />
              {rock(x, 36, -3, 3, 4 + i * 0.6)}
            </g>
          </g>
        ))}
        {/* Auctioneer on a crate, ringing a hand bell */}
        <rect className="fc3" x={30} y={800} width={120} height={90} />
        <Figure
          x={90}
          y={800}
          s={0.95}
          pose="stand"
          headwear={cap}
          hand={<path className="ppb" d="M -4 -4 L 4 -4 L 12 14 L -12 14 Z" />}
          arms={{ which: "R", values: [-110, -60], dur: 0.45 }}
        />
        <g transform="translate(160 640)">
          {[0, 0.5].map((d) => (
            <Act key={d} cls="amb-s-clack" dur={1} delay={-d}>
              <circle className="sb3" fill="none" strokeWidth={3} r={26} />
            </Act>
          ))}
          <Act cls="amb-s-on" dur={20}>
            {[0, 0.2, 0.4].map((d) => (
              <Act key={d} cls="amb-s-clack" dur={0.6} delay={-d}>
                <circle className="sb4" fill="none" strokeWidth={4} r={40} />
              </Act>
            ))}
          </Act>
        </g>
        {/* Buyers flash their hand signs; all at once when the bid lands */}
        {[1410, 1480, 1550].map((x, i) => (
          <g key={x}>
            <Act cls="amb-s-off" dur={20}>
              <Figure
                x={x}
                y={886}
                s={0.75}
                pose="stand"
                flip
                headwear={cap}
                arms={{
                  which: "R",
                  values: [10, 10, -150, 10],
                  dur: 3 + i * 0.7,
                  begin: -i * 1.3,
                }}
              />
            </Act>
            <Act cls="amb-s-on" dur={20}>
              <Figure
                x={x}
                y={886}
                s={0.75}
                pose="armsUp"
                flip
                headwear={cap}
              />
            </Act>
          </g>
        ))}
        {/* Frozen tuna laid out along the floor */}
        {[420, 640, 860, 1080].map((x, i) => (
          <g key={x} transform={`translate(${x} ${878 - (i % 2) * 6})`}>
            <Tuna s={0.9} />
          </g>
        ))}
        {/* Turret truck */}
        <Mover cls="amb-pass amb-pass--back" dur={20} delay={-12}>
          <g transform="translate(0 866)">
            <rect className="fb2" x={-20} y={-20} width={180} height={18} />
            <g transform="translate(90 -34)">
              <Tuna s={0.7} />
            </g>
            <rect
              className="fb3"
              x={-40}
              y={-70}
              width={40}
              height={50}
              rx={14}
            />
            <Wheel cx={-20} cy={0} r={12} dur={0.5} />
            <Wheel cx={140} cy={0} r={12} dur={0.5} />
            <Figure x={-20} y={-20} s={0.45} pose="stand" flip headwear={cap} />
          </g>
        </Mover>
        {/* Surprise: the market cat dashes off with a fish */}
        <g transform="translate(0 892)">
          <Act cls="amb-s-catdash" dur={20}>
            <Act cls="amb-s-trot" dur={0.3}>
              <g className="amb-person amb-s-bold">
                <path
                  className="pp"
                  d="M -40 -8 Q -30 -34 20 -30 L 30 -44 L 36 -32 L 44 -42 L 46 -26 Q 52 -12 36 -10 L 30 0 L 20 -6 L -24 -6 L -32 0 Z"
                />
                <path
                  className="ppl"
                  strokeWidth={5}
                  fill="none"
                  d="M -38 -18 q -26 -6 -30 -28"
                />
                <path
                  className="ppb"
                  d="M 40 -14 L 70 -22 L 66 -14 L 74 -6 Z"
                />
              </g>
            </Act>
          </Act>
        </g>
      </Art>
      <div className="amb-mist" />
    </>
  );
}
