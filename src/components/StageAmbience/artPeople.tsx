import { Art } from "./artKit";
import { Figure } from "./figure";
import { particles, seeded } from "./scenery";
import type { SceneProps } from "./artJapan";

/*
 * Twenty scenes with people in them — the background is busy with daily
 * Japanese life, but quietly: figures stay at the edges and along the
 * bottom, faint (see .amb-person), and move slowly.
 *
 * Shodō paper, the classroom blackboard, sushi menu tags and the konbini
 * window poster show the current word's kanji.
 */

/** The word's kanji first, then stock characters. */
function pick(
  glyphs: string | undefined,
  stock: string,
  count: number,
): string[] {
  const chars = [...(glyphs ?? "")];
  const fill = [...stock];
  return Array.from(
    { length: count },
    (_, i) => chars[i] ?? fill[i % fill.length] ?? "",
  );
}

function Lanterns({
  x0,
  y0,
  x1,
  y1,
  n,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  n: number;
}) {
  const sag = 50;
  const at = (t: number): [number, number] => [
    x0 + (x1 - x0) * t,
    y0 + (y1 - y0) * t + sag * Math.sin(Math.PI * t),
  ];
  return (
    <g>
      <path
        className="sa2"
        fill="none"
        strokeWidth="2"
        d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag * 2} ${x1} ${y1}`}
      />
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = at((i + 0.5) / n);
        return (
          <g
            key={i}
            className="amb-lantern"
            style={{ animationDelay: `${-i * 0.6}s` }}
          >
            <circle className="fc1" cx={x} cy={y + 18} r={26} />
            <ellipse className="fc4" cx={x} cy={y + 18} rx={11} ry={14} />
          </g>
        );
      })}
    </g>
  );
}

/* ── 花見の宴 Hanami party ─────────────────────────────────────────── */

export function Hanami() {
  const r = seeded(301);
  const blossoms = Array.from({ length: 14 }, (_, i) => (
    <circle
      key={i}
      className={i % 3 ? "fb2" : "fb3"}
      cx={(20 + r() * 400).toFixed(0)}
      cy={(250 + r() * 230).toFixed(0)}
      r={(40 + r() * 44).toFixed(0)}
    />
  ));
  const cup = <rect className="ppa" x={-4} y={-14} width={8} height={12} />;
  return (
    <>
      <Art>
        <path
          className="sa3"
          fill="none"
          strokeWidth="26"
          strokeLinecap="round"
          d="M 70 900 C 90 760, 80 600, 150 470"
        />
        <path
          className="sa3"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          d="M 140 500 C 220 420, 300 380, 380 360 M 120 560 C 80 480, 60 420, 30 380"
        />
        {blossoms}
        <circle className="fb2" cx={1540} cy={260} r={90} />
        <circle className="fb3" cx={1480} cy={330} r={60} />
        <path
          className="sa3"
          fill="none"
          strokeWidth="18"
          strokeLinecap="round"
          d="M 1560 900 C 1540 760, 1550 520, 1520 360"
        />
        <path className="fc3" d="M 40 828 L 540 808 L 590 900 L 0 900 Z" />
        <g className="fa3">
          <rect x={300} y={846} width={40} height={20} />
          <rect x={348} y={850} width={30} height={16} />
        </g>
        <Figure x={150} y={866} s={0.95} pose="sit" />
        <Figure x={250} y={870} s={0.85} pose="seiza" robe />
        <Figure
          x={470}
          y={866}
          s={0.95}
          pose="sit"
          flip
          hand={cup}
          arms={{ which: "R", values: [0, -55, -55, 0], dur: 6 }}
        />
        <Figure x={1360} y={884} s={1.05} pose="walk" flip />
        <Figure
          x={1440}
          y={888}
          s={0.95}
          pose="stand"
          flip
          arms={{ which: "R", values: [0, -150, -150, 0], dur: 9, begin: -3 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 12,
          seed: 311,
          className: "amb-p--petal fall",
          duration: [16, 24],
          size: [0.7, 1.1],
          opacity: [0.2, 0.34],
        })}
      </div>
    </>
  );
}

/* ── 盆踊り Bon dance ──────────────────────────────────────────────── */

export function BonOdori() {
  const dancers = [70, 170, 270, 370, 470];
  return (
    <Art>
      <Lanterns x0={-10} y0={150} x1={430} y1={230} n={5} />
      <Lanterns x0={1610} y0={150} x1={1170} y1={230} n={5} />
      <g className="fa2">
        <rect x={1300} y={640} width={300} height={22} />
        <rect x={1320} y={662} width={14} height={238} />
        <rect x={1570} y={662} width={14} height={238} />
        <path d="M 1290 640 L 1450 590 L 1610 640 Z" />
      </g>
      <circle className="fc3" cx={1420} cy={612} r={24} />
      <Figure
        x={1490}
        y={640}
        s={0.75}
        pose="kamae"
        robe
        arms={{ which: "both", values: [10, -50, 10, -40], dur: 1.6 }}
      />
      {dancers.map((x, i) => (
        <g
          key={x}
          className="amb-dance-bob"
          style={{ animationDelay: `${-i * 0.5}s` }}
        >
          <Figure
            x={x}
            y={882}
            s={0.9}
            pose="stand"
            robe
            flip={i % 2 === 1}
            arms={{
              which: "both",
              values: [-30, -120, -60, -150],
              dur: 4,
              begin: -i * 0.8,
            }}
          />
        </g>
      ))}
      {[1240, 1150].map((x, i) => (
        <g
          key={x}
          className="amb-dance-bob"
          style={{ animationDelay: `${-i * 0.7}s` }}
        >
          <Figure
            x={x}
            y={890}
            s={0.85}
            pose="stand"
            robe
            flip
            arms={{
              which: "both",
              values: [-30, -120, -60, -150],
              dur: 4,
              begin: -2 - i,
            }}
          />
        </g>
      ))}
      <path className="fd" d="M 0 890 H 1600 V 900 H 0 Z" />
    </Art>
  );
}

/* ── 通勤ラッシュ Rush-hour platform ───────────────────────────────── */

export function RushHour() {
  const phone = (
    <rect className="ppc" x={-2} y={-22} width={10} height={16} rx={2} />
  );
  const bag = (
    <rect className="ppa" x={-14} y={0} width={30} height={22} rx={3} />
  );
  return (
    <Art>
      <g className="amb-commuter">
        <rect
          className="fb2"
          x={-1300}
          y={600}
          width={1200}
          height={200}
          rx={14}
        />
        <g className="fb3">
          {Array.from({ length: 14 }, (_, i) => (
            <rect
              key={i}
              x={-1270 + i * 84}
              y={630}
              width={60}
              height={56}
              rx={6}
            />
          ))}
        </g>
        <rect className="fc3" x={-1300} y={720} width={1200} height={10} />
      </g>
      <rect className="fa2" x={0} y={812} width={1600} height={88} />
      <g className="fc4">
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 40} y={812} width={30} height={6} />
        ))}
      </g>
      <rect className="fa1" x={300} y={140} width={22} height={672} />
      <rect className="fa1" x={1280} y={140} width={22} height={672} />
      <g className="sa3" fill="none" strokeWidth="4">
        <circle cx={311} cy={220} r={34} />
        <path d="M 311 220 V 196 M 311 220 L 330 228" />
      </g>
      {[60, 120, 186, 246].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={830}
          s={1.12 - i * 0.02}
          pose="stand"
          hand={i === 1 ? phone : i === 3 ? bag : undefined}
          depth={i === 0 ? "far" : "near"}
        />
      ))}
      {[1340, 1410, 1480, 1550].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={832}
          s={1.1}
          pose="stand"
          flip
          hand={i === 0 ? phone : i === 2 ? bag : undefined}
          arms={
            i === 0
              ? { which: "R", values: [-40, -46, -40], dur: 3 }
              : undefined
          }
        />
      ))}
      <g className="amb-hurry">
        <Figure x={0} y={834} s={1.05} pose="walk" hand={bag} />
      </g>
    </Art>
  );
}

/* ── 書道 Calligraphy ───────────────────────────────────────────────── */

export function Shodo({ glyphs }: SceneProps) {
  const word = pick(
    glyphs,
    "書道",
    Math.max(2, Math.min(3, [...(glyphs ?? "")].length)),
  );
  const brush = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={10} y2={34} strokeWidth={4} />
      <path className="pp" d="M 7 30 L 15 30 L 12 44 Z" />
    </g>
  );
  const step = 380 / word.length;
  return (
    <Art>
      <g className="sa1" strokeWidth="3">
        <line x1={0} y1={770} x2={1600} y2={770} />
        <line x1={0} y1={836} x2={1600} y2={836} />
      </g>
      <path className="fb3" d="M 360 772 L 760 772 L 800 892 L 330 892 Z" />
      {word.map((ch, i) => (
        <text
          key={i}
          className="amb-glyph gink amb-ink"
          style={{ animationDelay: `${i * 0.6}s` }}
          x={380 + step * (i + 0.5)}
          y={834}
          fontSize={86}
        >
          {ch}
        </text>
      ))}
      <rect className="fa3" x={820} y={856} width={60} height={24} rx={4} />
      <ellipse className="fd" cx={850} cy={866} rx={18} ry={6} />
      <Figure
        x={250}
        y={884}
        s={1.25}
        pose="seiza"
        robe
        hand={brush}
        arms={{ which: "R", values: [0, 10, -4, 8, 2], dur: 5 }}
      />
      {[
        [1420, 170, "心"],
        [1512, 210, "和"],
      ].map(([x, y, ch]) => (
        <g key={x as number}>
          <rect
            className="fa3"
            x={(x as number) - 4}
            y={(y as number) - 14}
            width={78}
            height={8}
          />
          <rect
            className="fb3"
            x={x as number}
            y={y as number}
            width={70}
            height={360}
          />
          <text
            className="amb-glyph gink"
            x={(x as number) + 35}
            y={(y as number) + 150}
            fontSize={56}
          >
            {ch as string}
          </text>
        </g>
      ))}
    </Art>
  );
}

/* ── 茶道 Tea ceremony ──────────────────────────────────────────────── */

export function Sado() {
  const whisk = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={4} y2={20} strokeWidth={3} />
      <path className="pp" d="M -2 18 L 10 18 L 8 30 L 0 30 Z" />
    </g>
  );
  return (
    <Art>
      <g className="sa1" strokeWidth="3">
        <line x1={0} y1={790} x2={1600} y2={790} />
        <line x1={600} y1={790} x2={480} y2={900} />
        <line x1={1000} y1={790} x2={1120} y2={900} />
      </g>
      <rect className="fa1" x={1380} y={150} width={220} height={640} />
      <rect className="fb3" x={1450} y={190} width={76} height={380} />
      {["一", "期", "一", "会"].map((ch, i) => (
        <text
          key={i}
          className="amb-glyph gink"
          x={1488}
          y={250 + i * 80}
          fontSize={46}
        >
          {ch}
        </text>
      ))}
      <path
        className="fa3"
        d="M 1470 760 Q 1460 700 1488 690 Q 1516 700 1506 760 Z"
      />
      <path
        className="sb3"
        fill="none"
        strokeWidth="3"
        d="M 1488 690 Q 1460 620 1430 600 M 1488 690 Q 1500 630 1540 610"
      />
      <path
        className="fa3"
        d="M 150 860 Q 150 800 200 796 Q 250 800 250 860 Z"
      />
      <rect className="fa3" x={190} y={776} width={20} height={20} />
      <g className="sb2" fill="none" strokeWidth="3" strokeLinecap="round">
        <path
          className="amb-steam-line"
          d="M 192 770 q -10 -18 0 -36 q 10 -18 0 -36"
        />
        <path
          className="amb-steam-line"
          d="M 210 770 q -10 -22 0 -44 q 10 -22 0 -44"
        />
      </g>
      <path
        className="fc3"
        d="M 420 852 Q 420 880 450 882 Q 480 880 480 852 Z"
      />
      <Figure
        x={330}
        y={884}
        s={1.15}
        pose="seiza"
        robe
        hand={whisk}
        arms={{ which: "R", values: [-4, 6], dur: 1.2 }}
      />
      <Figure
        x={1270}
        y={884}
        s={1.15}
        pose="seiza"
        robe
        flip
        upper={{ values: [0, 0, 38, 38], dur: 9, begin: -2 }}
      />
    </Art>
  );
}

/* ── 相撲 Sumo bout ─────────────────────────────────────────────────── */

export function Sumo() {
  const topknot = <ellipse className="pp" cx={-6} cy={-14} rx={9} ry={6} />;
  const belt = (
    <rect className="ppc" x={-40} y={-74} width={48} height={22} rx={4} />
  );
  const fan = <path className="ppc" d="M 0 0 L -10 -40 Q 0 -54 10 -40 Z" />;
  const hat = <path className="pp" d="M -10 -10 L 6 -34 L 14 -8 Z" />;
  return (
    <Art>
      <path className="fa2" d="M 160 900 L 260 812 L 1340 812 L 1440 900 Z" />
      <path
        className="sb3"
        fill="none"
        strokeWidth="6"
        d="M 330 830 Q 800 790 1270 830"
      />
      {[
        [60, "fc3"],
        [1540, "fa3"],
      ].map(([x, tone]) => (
        <g key={x as number} className="amb-sway-soft-tassel">
          <line
            className="sa2"
            x1={x as number}
            y1={140}
            x2={x as number}
            y2={260}
            strokeWidth={3}
          />
          <path
            className={tone as string}
            d={`M ${(x as number) - 22} 260 L ${(x as number) + 22} 260 L ${(x as number) + 14} 380 L ${(x as number) - 14} 380 Z`}
          />
        </g>
      ))}
      <g className="amb-rock">
        <Figure
          x={420}
          y={830}
          s={1.35}
          pose="crouch"
          heavy
          headwear={topknot}
          front={belt}
        />
      </g>
      <g className="amb-rock" style={{ animationDelay: "-1.4s" }}>
        <Figure
          x={1180}
          y={830}
          s={1.35}
          pose="crouch"
          heavy
          flip
          headwear={topknot}
          front={belt}
        />
      </g>
      <Figure
        x={1470}
        y={880}
        s={1.05}
        pose="stand"
        robe
        flip
        headwear={hat}
        hand={fan}
        arms={{ which: "R", values: [-60, -90, -60], dur: 5 }}
      />
    </Art>
  );
}

/* ── 神輿 Mikoshi carriers ──────────────────────────────────────────── */

export function Mikoshi() {
  const carriers = [80, 160, 240, 320, 400, 480];
  return (
    <Art>
      <Lanterns x0={1610} y0={160} x1={1160} y1={250} n={5} />
      <g className="amb-bounce">
        <g className="fa3">
          <rect x={210} y={642} width={250} height={34} />
          <rect x={240} y={560} width={190} height={82} />
          <path d="M 190 566 Q 335 500 480 566 L 470 544 Q 335 470 200 544 Z" />
          <path d="M 322 486 L 335 452 L 348 486 Z" />
        </g>
        <g className="fc3">
          <rect x={256} y={576} width={30} height={50} />
          <rect x={384} y={576} width={30} height={50} />
        </g>
        <rect className="fb3" x={40} y={692} width={600} height={10} rx={5} />
        {carriers.map((x, i) => (
          <Figure
            key={x}
            x={x}
            y={880}
            s={1.0}
            pose="carry"
            depth={i % 2 ? "far" : "near"}
          />
        ))}
      </g>
      <Figure
        x={1380}
        y={884}
        s={1.05}
        pose="armsUp"
        flip
        arms={{ which: "both", values: [0, 40, 0], dur: 1.4 }}
      />
      <Figure x={1480} y={888} s={1.0} pose="stand" robe flip />
    </Art>
  );
}

/* ── 車窓 Train window ──────────────────────────────────────────────── */

export function TrainWindow() {
  const poles = Array.from({ length: 8 }, (_, i) => (
    <g key={i}>
      <rect x={i * 400 + 40} y={420} width={8} height={240} />
      <rect x={i * 400 + 20} y={436} width={48} height={5} />
    </g>
  ));
  const houses = Array.from({ length: 6 }, (_, i) => (
    <path
      key={i}
      d={`M ${i * 533 + 120} 660 L ${i * 533 + 120} 620 L ${i * 533 + 160} 590 L ${i * 533 + 200} 620 L ${i * 533 + 200} 660 Z`}
    />
  ));
  return (
    <Art>
      <path
        className="fa1"
        d="M 0 640 Q 200 560 420 610 Q 700 650 960 600 Q 1260 540 1600 620 L 1600 660 L 0 660 Z"
      />
      <path className="fb2" d="M 1180 600 L 1250 556 L 1280 556 L 1350 600 Z" />
      <g className="amb-scroll-fast">
        <g className="fa2">{poles}</g>
        <g className="fa2">{houses}</g>
      </g>
      <rect className="fb1" x={0} y={660} width={1600} height={80} />
      <rect
        className="sa2"
        fill="none"
        strokeWidth="22"
        x={-6}
        y={110}
        width={1612}
        height={780}
        rx={40}
      />
      <g className="amb-train-sway">
        {[90, 230, 1370, 1510].map((x, i) => (
          <g
            key={x}
            className="amb-strap"
            style={{ animationDelay: `${-i * 0.4}s` }}
          >
            <line
              className="sa3"
              x1={x}
              y1={128}
              x2={x}
              y2={196}
              strokeWidth={4}
            />
            <ellipse
              className="sa3"
              fill="none"
              strokeWidth={6}
              cx={x}
              cy={214}
              rx={16}
              ry={20}
            />
          </g>
        ))}
        {/* Passengers in the seats ahead: heads and shoulders above the seat backs. */}
        <Figure x={180} y={1010} s={1.3} pose="stand" depth="far" />
        <Figure x={320} y={1016} s={1.25} pose="stand" depth="far" />
        <Figure x={1300} y={1012} s={1.3} pose="stand" depth="far" flip />
        <Figure x={1450} y={1010} s={1.3} pose="stand" depth="far" flip />
        <rect className="fa3" x={0} y={826} width={1600} height={74} rx={18} />
      </g>
    </Art>
  );
}

/* ── コンビニ Konbini at night ───────────────────────────────────────── */

function Cat({
  x,
  y,
  s = 1,
  flip,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
      className="amb-cat"
    >
      <ellipse className="fa3" cx={0} cy={-22} rx={24} ry={22} />
      <circle className="fa3" cx={18} cy={-50} r={14} />
      <path
        className="fa3"
        d="M 8 -60 L 12 -76 L 20 -62 Z M 20 -62 L 28 -76 L 30 -58 Z"
      />
      <path
        className="sa3 amb-cat-tail"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        d="M -20 -10 Q -46 -14 -40 -44"
      />
    </g>
  );
}

export function Konbini({ glyphs }: SceneProps) {
  const poster = pick(glyphs, "新発売", 3);
  const bag = (
    <g>
      <rect className="ppb" x={-14} y={0} width={28} height={30} rx={4} />
      <path className="ppl" d="M -8 0 Q 0 -12 8 0" strokeWidth={3} />
    </g>
  );
  return (
    <Art>
      <circle className="fa1" cx={150} cy={520} r={150} />
      <rect className="fa2" x={140} y={520} width={12} height={380} />
      <path
        className="fa3"
        d="M 146 520 Q 150 500 190 504 L 190 514 Q 160 512 152 524 Z"
      />
      <Cat x={300} y={890} s={0.95} />
      <ellipse className="fb1" cx={1480} cy={890} rx={200} ry={24} />
      <rect className="fa2" x={1380} y={560} width={220} height={340} />
      <rect className="fb2" x={1380} y={560} width={220} height={36} />
      <rect className="fc3" x={1380} y={596} width={220} height={8} />
      <rect className="fb1" x={1394} y={624} width={196} height={196} />
      <g className="sb2" strokeWidth="3">
        {[680, 740, 800].map((y) => (
          <line key={y} x1={1490} y1={y} x2={1588} y2={y} />
        ))}
      </g>
      <g className="fb2">
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={1496 + (i % 4) * 22}
            y={i < 4 ? 660 : 720}
            width={14}
            height={18}
          />
        ))}
      </g>
      <rect className="fc2" x={1402} y={640} width={78} height={150} />
      {poster.map((ch, i) => (
        <text
          key={i}
          className="amb-glyph glit"
          x={1441}
          y={672 + i * 44}
          fontSize={36}
        >
          {ch}
        </text>
      ))}
      <Figure x={1330} y={888} s={0.95} pose="walk" flip hand={bag} />
    </Art>
  );
}

/* ── 自販機 Vending machine on a country road ───────────────────────── */

export function Jihanki() {
  const r = seeded(331);
  const stars = Array.from({ length: 50 }, (_, i) => (
    <circle
      key={i}
      cx={(r() * 1600).toFixed(0)}
      cy={(r() * 420).toFixed(0)}
      r={(0.8 + r() * 1.2).toFixed(1)}
    />
  ));
  const drinks = (x0: number, y0: number) =>
    Array.from({ length: 18 }, (_, i) => (
      <rect
        key={i}
        className={["fc4", "fa4", "fb4"][i % 3]}
        x={x0 + 14 + (i % 6) * 36}
        y={y0 + 30 + Math.floor(i / 6) * 60}
        width={20}
        height={40}
        rx={4}
      />
    ));
  return (
    <>
      <Art>
        <g className="amb-fill-star-soft">{stars}</g>
        <path
          className="fa1"
          d="M 0 640 Q 400 580 800 630 Q 1200 680 1600 600 L 1600 700 L 0 700 Z"
        />
        <path className="fb1" d="M 600 900 L 760 700 L 840 700 L 1000 900 Z" />
        <ellipse className="fc1" cx={290} cy={880} rx={260} ry={40} />
        <rect className="fb2" x={150} y={560} width={250} height={320} rx={8} />
        <rect className="fb1" x={164} y={576} width={222} height={196} />
        {drinks(164, 576)}
        <rect className="fd" x={180} y={800} width={80} height={30} rx={4} />
        <Figure
          x={90}
          y={884}
          s={1.05}
          pose="stand"
          arms={{ which: "R", values: [-70, -80, -70], dur: 4 }}
        />
        <rect className="fa2" x={1490} y={300} width={14} height={600} />
        <rect className="fa2" x={1440} y={330} width={110} height={8} />
        <path
          className="sa2"
          fill="none"
          strokeWidth="2"
          d="M 1600 330 Q 1540 350 1497 336 Q 1300 380 1100 340"
        />
        <circle className="fc1" cx={1460} cy={360} r={60} />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 7,
          seed: 337,
          className: "amb-p--moth twinkle",
          duration: [1.6, 3.2],
          size: [0.3, 0.5],
          opacity: [0.35, 0.6],
          top: [58, 70],
          left: [9, 26],
        })}
      </div>
    </>
  );
}

/* ── 雨の交差点 Rainy crossing ──────────────────────────────────────── */

function Umbrella({ tone }: { tone: string }) {
  return (
    <g>
      <path
        className={tone}
        d="M -60 -16 Q 0 -78 60 -16 Q 40 -24 20 -16 Q 0 -24 -20 -16 Q -40 -24 -60 -16 Z"
      />
      <line className="ppl" x1={0} y1={-20} x2={0} y2={30} strokeWidth={3} />
    </g>
  );
}

export function Scramble() {
  const tones = ["ppc", "ppa", "ppb"];
  const walkers = Array.from({ length: 7 }, (_, i) => i);
  return (
    <>
      <Art>
        <g className="fb2">
          {Array.from({ length: 16 }, (_, i) => (
            <path
              key={i}
              d={`M ${i * 104} 832 L ${i * 104 + 64} 832 L ${i * 104 + 78} 900 L ${i * 104 + 6} 900 Z`}
            />
          ))}
        </g>
        <rect className="fa2" x={1520} y={480} width={12} height={420} />
        <rect className="fa3" x={1490} y={470} width={72} height={110} rx={8} />
        <circle className="fb3" cx={1526} cy={500} r={14} />
        <circle className="fc4" cx={1526} cy={548} r={14} />
        {walkers.map((i) => {
          const right = i % 2 === 0;
          return (
            <g
              key={i}
              className={right ? "amb-cross-r" : "amb-cross-l"}
              style={{ animationDelay: `${(-i * 6.3).toFixed(1)}s` }}
            >
              <Figure
                x={0}
                y={884 - (i % 3) * 10}
                s={0.95 - (i % 3) * 0.06}
                pose="walk"
                flip={!right}
                depth={i % 3 === 2 ? "far" : "near"}
                hand={
                  <g transform="translate(-6 -40)">
                    <Umbrella tone={tones[i % 3]!} />
                  </g>
                }
              />
            </g>
          );
        })}
        <g className="amb-puddle">
          <ellipse className="fc1" cx={300} cy={888} rx={140} ry={12} />
          <ellipse className="fb1" cx={1200} cy={892} rx={160} ry={10} />
        </g>
      </Art>
      <div className="amb-particles amb-particles--slant">
        {particles({
          count: 22,
          seed: 347,
          className: "amb-p--drop fall-fast",
          duration: [1.6, 2.6],
          size: [0.08, 0.1],
          opacity: [0.1, 0.2],
          left: [-10, 110],
        })}
      </div>
    </>
  );
}

/* ── 剣道 Kendo dojo ────────────────────────────────────────────────── */

export function Kendo() {
  const men = (
    <g>
      <circle className="pp" cx={0} cy={0} r={19} />
      <g className="ppl" strokeWidth={2}>
        <line x1={8} y1={-10} x2={8} y2={10} />
        <line x1={14} y1={-8} x2={14} y2={8} />
      </g>
    </g>
  );
  const shinai = (
    <line className="ppl" x1={0} y1={0} x2={100} y2={-150} strokeWidth={5} />
  );
  return (
    <Art>
      <g className="sa1" strokeWidth="2">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={0} y1={800 + i * 18} x2={1600} y2={800 + i * 18} />
        ))}
      </g>
      <rect className="fb3" x={60} y={190} width={250} height={80} />
      <text className="amb-glyph gink" x={185} y={232} fontSize={50}>
        剣心
      </text>
      <rect className="fa1" x={1300} y={160} width={260} height={8} />
      <Figure
        x={360}
        y={860}
        s={1.3}
        pose="kamae"
        robe
        headwear={men}
        hand={shinai}
        arms={{ which: "both", values: [0, 0, 0, -60, 10, 0], dur: 6 }}
      />
      <Figure
        x={1240}
        y={860}
        s={1.3}
        pose="kamae"
        robe
        flip
        headwear={men}
        hand={shinai}
        arms={{ which: "both", values: [0, 0, 0, 0, -60, 10], dur: 6 }}
      />
    </Art>
  );
}

/* ── 教室 Classroom ─────────────────────────────────────────────────── */

export function Classroom({ glyphs }: SceneProps) {
  const chalk = pick(
    glyphs,
    "勉強",
    Math.max(2, Math.min(3, [...(glyphs ?? "")].length)),
  );
  return (
    <Art>
      <rect className="fb2" x={40} y={170} width={260} height={360} />
      <g className="sb2" strokeWidth="4">
        <line x1={170} y1={170} x2={170} y2={530} />
        <line x1={40} y1={350} x2={300} y2={350} />
      </g>
      <circle className="fc2" cx={120} cy={260} r={50} />
      <circle className="fc2" cx={230} cy={300} r={60} />
      <rect
        className="fc1 sa3"
        strokeWidth={10}
        x={1220}
        y={180}
        width={360}
        height={380}
      />
      {chalk.map((ch, i) => (
        <text
          key={i}
          className="amb-glyph gchalk"
          x={1400}
          y={180 + (380 / (chalk.length + 1)) * (i + 1)}
          fontSize={chalk.length > 2 ? 86 : 110}
        >
          {ch}
        </text>
      ))}
      <rect className="fa3" x={1220} y={560} width={360} height={10} />
      <Figure
        x={1160}
        y={880}
        s={1.25}
        pose="stand"
        hand={<rect className="ppb" x={-3} y={-6} width={6} height={12} />}
        arms={{ which: "R", values: [-120, -132, -116, -130], dur: 3.2 }}
      />
      {[
        [80, 850],
        [220, 860],
        [360, 850],
        [150, 900],
        [300, 905],
      ].map(([x, y], i) => (
        <g key={i}>
          <Figure
            x={x!}
            y={y! + 110}
            s={1.0}
            pose="stand"
            depth={y! > 880 ? "near" : "far"}
            arms={
              i === 2
                ? { which: "R", values: [-170, -165, -170], dur: 4 }
                : undefined
            }
          />
          <rect
            className="fa3"
            x={x! - 50}
            y={y! - 6}
            width={100}
            height={14}
          />
        </g>
      ))}
    </Art>
  );
}

/* ── 川釣り River fishing ────────────────────────────────────────────── */

export function Fishing() {
  return (
    <>
      <Art>
        <rect className="fb1" x={0} y={690} width={1600} height={210} />
        <g className="amb-shimmer sb2" strokeWidth="2" strokeLinecap="round">
          <path d="M 500 740 H 640 M 700 780 H 900 M 980 750 H 1100 M 560 830 H 760 M 900 860 H 1080" />
        </g>
        <path
          className="fa2"
          d="M 0 650 Q 200 660 380 690 Q 420 760 400 900 L 0 900 Z"
        />
        <path
          className="fa2"
          d="M 1600 640 Q 1420 650 1260 690 Q 1240 760 1260 900 L 1600 900 Z"
        />
        <g className="sa3" strokeWidth="3">
          {[40, 70, 100, 1520, 1550, 1580].map((x) => (
            <path
              key={x}
              fill="none"
              d={`M ${x} 700 q ${x < 800 ? 10 : -10} -60 ${x < 800 ? 4 : -4} -110`}
            />
          ))}
        </g>
        <rect className="fa3" x={210} y={640} width={40} height={30} />
        <Figure
          x={240}
          y={660}
          s={1.0}
          pose="chair"
          headwear={
            <path className="pp" d="M -22 -6 L 22 -6 L 6 -22 L -6 -22 Z" />
          }
        />
        <path
          className="sa3"
          fill="none"
          strokeWidth="3"
          d="M 276 568 Q 420 470 560 560"
        />
        <path
          className="sb2"
          fill="none"
          strokeWidth="1.5"
          d="M 560 560 L 590 770"
        />
        <g className="amb-float">
          <circle className="fc4" cx={590} cy={772} r={7} />
        </g>
        <Figure
          x={1440}
          y={680}
          s={1.0}
          pose="stand"
          flip
          arms={{ which: "R", values: [-60, -64, -60], dur: 6 }}
        />
        <path
          className="sa3"
          fill="none"
          strokeWidth="3"
          d="M 1404 588 Q 1300 520 1200 600"
        />
        <path
          className="sb2"
          fill="none"
          strokeWidth="1.5"
          d="M 1200 600 L 1180 790"
        />
        {[0, 1].map((i) => (
          <g key={i} className={`amb-tombo amb-tombo--${i}`}>
            <g className="fc3">
              <rect x={-10} y={-1.5} width={22} height={3} rx={1.5} />
              <ellipse
                cx={-1}
                cy={-6}
                rx={3}
                ry={8}
                transform="rotate(-70 -1 -6)"
              />
              <ellipse
                cx={-1}
                cy={6}
                rx={3}
                ry={8}
                transform="rotate(70 -1 6)"
              />
            </g>
          </g>
        ))}
      </Art>
    </>
  );
}

/* ── 回転寿司 Conveyor sushi ─────────────────────────────────────────── */

export function KaitenSushi({ glyphs }: SceneProps) {
  const tags = pick(glyphs, "鮪鯛鮭鰻", 5);
  const tops = ["fc4", "fa4", "fb3", "fc3"];
  const plates = Array.from({ length: 20 }, (_, i) => (
    <g key={i} transform={`translate(${i * 160 + 40} 802)`}>
      <ellipse className="fb2" cx={0} cy={0} rx={44} ry={10} />
      <rect className="fb3" x={-26} y={-16} width={52} height={14} rx={6} />
      <rect
        className={tops[i % 4]}
        x={-28}
        y={-24}
        width={56}
        height={10}
        rx={5}
      />
    </g>
  ));
  const hachimaki = (
    <rect className="ppb" x={-14} y={-8} width={28} height={6} />
  );
  return (
    <Art>
      {tags.map((ch, i) => (
        <g key={i}>
          <rect
            className="fa2"
            x={50 + i * 70}
            y={170}
            width={56}
            height={150}
          />
          <text
            className="amb-glyph glit"
            x={78 + i * 70}
            y={245}
            fontSize={40}
          >
            {ch}
          </text>
        </g>
      ))}
      <Figure
        x={1420}
        y={900}
        s={1.3}
        pose="stand"
        flip
        headwear={hachimaki}
        arms={{ which: "both", values: [-50, -60, -50, -64], dur: 2.4 }}
      />
      <rect className="fa2" x={0} y={812} width={1600} height={14} />
      <g className="amb-belt">{plates}</g>
      <rect className="fa3" x={0} y={826} width={1600} height={74} />
      <Figure
        x={110}
        y={950}
        s={1.2}
        pose="stand"
        depth="far"
        arms={{ which: "R", values: [-30, -70, -30], dur: 7 }}
      />
    </Art>
  );
}

/* ── かまくら Snow huts ──────────────────────────────────────────────── */

function SnowHut({ x, w, kids }: { x: number; w: number; kids: number }) {
  const h = w * 0.7;
  const base = 880;
  return (
    <g>
      <path
        className="fb3"
        d={`M ${x} ${base} Q ${x} ${base - h * 1.3} ${x + w / 2} ${base - h} Q ${x + w} ${base - h * 1.3} ${x + w} ${base} Z`}
      />
      <path
        className="fc2"
        d={`M ${x + w * 0.3} ${base} Q ${x + w * 0.3} ${base - h * 0.7} ${x + w / 2} ${base - h * 0.7} Q ${x + w * 0.7} ${base - h * 0.7} ${x + w * 0.7} ${base} Z`}
      />
      <circle className="fc4 amb-candle" cx={x + w / 2} cy={base - 24} r={6} />
      {Array.from({ length: kids }, (_, i) => (
        <Figure
          key={i}
          x={x + w * (0.4 + i * 0.2)}
          y={base - 2}
          s={0.55}
          pose="seiza"
          flip={i === 1}
        />
      ))}
    </g>
  );
}

export function Kamakura() {
  return (
    <>
      <Art>
        <path
          className="fb2"
          d="M 0 860 Q 400 830 800 852 T 1600 846 L 1600 900 L 0 900 Z"
        />
        <SnowHut x={20} w={380} kids={2} />
        <SnowHut x={1300} w={280} kids={1} />
        <g className="fb3">
          <circle cx={1220} cy={866} r={26} />
          <circle cx={1220} cy={826} r={18} />
        </g>
        <Figure
          x={470}
          y={890}
          s={0.75}
          pose="stand"
          hand={<circle className="ppb" cx={0} cy={0} r={6} />}
          arms={{ which: "R", values: [20, -160, -160, 20], dur: 3 }}
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 16,
          seed: 353,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.5],
          opacity: [0.22, 0.4],
        })}
      </div>
    </>
  );
}

/* ── 金魚すくい Goldfish scooping ────────────────────────────────────── */

function Goldfish({ path, dur }: { path: string; dur: number }) {
  const reduced = (() => {
    try {
      return (
        globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false
      );
    } catch {
      return false;
    }
  })();
  const m = /M\s*(-?[\d.]+)\s+(-?[\d.]+)/.exec(path);
  return (
    <g transform={reduced && m ? `translate(${m[1]} ${m[2]})` : undefined}>
      <ellipse className="fc4" cx={0} cy={0} rx={10} ry={5} />
      <path className="fc3" d="M -8 0 L -18 -6 L -16 0 L -18 6 Z" />
      {!reduced && (
        <animateMotion
          dur={`${dur}s`}
          repeatCount="indefinite"
          rotate="auto"
          path={path}
        />
      )}
    </g>
  );
}

export function Kingyo() {
  const poi = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={22} y2={12} strokeWidth={3} />
      <circle
        className="ppl"
        cx={34}
        cy={18}
        r={12}
        strokeWidth={3}
        fill="none"
      />
    </g>
  );
  const fishBag = (
    <g>
      <line className="ppl" x1={0} y1={0} x2={0} y2={12} strokeWidth={2} />
      <path
        className="ppb"
        d="M -12 12 L 12 12 Q 18 40 0 44 Q -18 40 -12 12 Z"
      />
      <ellipse className="ppc" cx={0} cy={30} rx={6} ry={3} />
    </g>
  );
  return (
    <Art>
      <Lanterns x0={1610} y0={150} x1={1170} y1={240} n={5} />
      <path className="fa3" d="M 40 520 L 540 520 L 560 560 L 20 560 Z" />
      <rect className="fc3" x={160} y={566} width={260} height={56} />
      <text className="amb-glyph glit" x={290} y={594} fontSize={40}>
        金魚
      </text>
      <rect className="fa2" x={40} y={560} width={10} height={240} />
      <rect className="fa2" x={520} y={560} width={10} height={240} />
      <rect className="fb2" x={40} y={790} width={500} height={90} rx={10} />
      <rect className="fb3" x={52} y={800} width={476} height={70} rx={8} />
      <Goldfish path="M 120 836 a 60 18 0 1 1 0.1 0" dur={7} />
      <Goldfish path="M 300 830 a 90 22 0 1 0 0.1 0" dur={9} />
      <Goldfish path="M 440 840 a 50 16 0 1 1 0.1 0" dur={6} />
      <Goldfish path="M 230 846 a 70 14 0 1 0 0.1 0" dur={8} />
      <Figure
        x={600}
        y={892}
        s={0.85}
        pose="squat"
        flip
        hand={poi}
        arms={{ which: "R", values: [0, 18, 0], dur: 3 }}
      />
      <Figure x={1360} y={886} s={0.95} pose="walk" robe flip hand={fishBag} />
      <Figure x={1470} y={890} s={1.25} pose="walk" flip depth="far" />
    </Art>
  );
}

/* ── ラジオ体操 Radio exercises ──────────────────────────────────────── */

export function RadioTaiso() {
  const sync = {
    which: "both" as const,
    values: [0, -170, -170, 0, 0],
    dur: 4.8,
  };
  return (
    <Art>
      <circle className="fc1" cx={1400} cy={300} r={140} />
      <circle className="fc3" cx={1400} cy={300} r={52} />
      {[
        [40, 0.9],
        [1560, 1],
      ].map(([x, k]) => (
        <g key={x}>
          <rect className="fa2" x={x - 10} y={500} width={20} height={400} />
          <circle className="fb2" cx={x} cy={460} r={110 * k} />
          <circle className="fb3" cx={x + 40} cy={420} r={70 * k} />
        </g>
      ))}
      <rect className="fa2" x={1420} y={830} width={160} height={14} />
      <rect className="fa2" x={1430} y={844} width={10} height={44} />
      <rect className="fa2" x={1560} y={844} width={10} height={44} />
      <rect className="fa3" x={1460} y={800} width={50} height={30} rx={4} />
      <line
        className="sa3"
        x1={1500}
        y1={800}
        x2={1518}
        y2={770}
        strokeWidth={2}
      />
      {[110, 200, 290, 380].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={890 - (i % 2) * 14}
          s={0.95 - (i % 2) * 0.06}
          pose="stand"
          arms={sync}
          depth={i % 2 ? "far" : "near"}
        />
      ))}
      {[1180, 1270].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={888 - i * 12}
          s={0.95 - i * 0.05}
          pose="stand"
          arms={sync}
          depth={i ? "far" : "near"}
        />
      ))}
      <Figure x={1360} y={890} s={1.05} pose="stand" flip arms={sync} />
    </Art>
  );
}

/* ── 名刺交換 Business-card bow ───────────────────────────────────────── */

export function Meishi() {
  const card = <rect className="ppb" x={-2} y={-6} width={20} height={12} />;
  const tie = (
    <path className="ppc" d="M -3 -126 L 3 -126 L 4 -96 L 0 -90 L -4 -96 Z" />
  );
  return (
    <Art>
      <rect className="fa1" x={1180} y={140} width={420} height={560} />
      <g className="fa2">
        {[1200, 1270, 1330, 1410, 1470, 1540].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={700 - (120 + ((i * 53) % 160))}
            width={52}
            height={120 + ((i * 53) % 160)}
          />
        ))}
      </g>
      <g className="sb2" strokeWidth="6">
        <line x1={1390} y1={140} x2={1390} y2={700} />
        <line x1={1180} y1={420} x2={1600} y2={420} />
      </g>
      <rect className="fa2" x={0} y={880} width={1600} height={20} />
      <Figure
        x={170}
        y={880}
        s={1.2}
        pose="stand"
        hand={card}
        front={tie}
        arms={{ which: "both", values: [-60, -60], dur: 1 }}
        upper={{ values: [0, 0, 32, 32, 0], dur: 8 }}
      />
      <Figure
        x={430}
        y={880}
        s={1.2}
        pose="stand"
        flip
        hand={card}
        front={tie}
        arms={{ which: "both", values: [-60, -60], dur: 1 }}
        upper={{ values: [0, 0, 26, 26, 0], dur: 8, begin: -0.4 }}
      />
      <rect className="fa3" x={1280} y={800} width={260} height={14} />
      <rect className="fa2" x={1300} y={814} width={12} height={66} />
      <rect className="fa2" x={1508} y={814} width={12} height={66} />
      <path className="fc2" d="M 1360 800 L 1440 800 L 1452 750 L 1372 750 Z" />
      <Figure x={1480} y={880} s={1.1} pose="chair" flip />
    </Art>
  );
}

/* ── 縁側 Veranda afternoon ──────────────────────────────────────────── */

export function Engawa() {
  const cup = <path className="ppb" d="M -6 -10 L 6 -10 L 4 2 L -4 2 Z" />;
  const bun = <circle className="pp" cx={-12} cy={-8} r={7} />;
  return (
    <Art>
      <path className="fa2" d="M 0 120 L 440 120 L 420 150 L 0 150 Z" />
      <path className="fa2" d="M 1600 120 L 1160 120 L 1180 150 L 1600 150 Z" />
      <g className="fb1">
        <rect x={0} y={150} width={330} height={630} />
      </g>
      <g className="sb1" strokeWidth="3">
        {[80, 160, 240].map((x) => (
          <line key={x} x1={x} y1={150} x2={x} y2={780} />
        ))}
        {[300, 450, 600].map((y) => (
          <line key={y} x1={0} y1={y} x2={330} y2={y} />
        ))}
      </g>
      <rect className="fa3" x={0} y={780} width={1600} height={22} />
      <rect className="fa2" x={0} y={802} width={1600} height={98} />
      <rect className="fa3" x={340} y={150} width={18} height={630} />
      <g className="amb-strip" style={{ transformOrigin: "50% 0" }}>
        <line
          className="sa2"
          x1={1450}
          y1={150}
          x2={1450}
          y2={200}
          strokeWidth={2}
        />
        <path
          className="fb3"
          d="M 1426 230 Q 1426 200 1450 198 Q 1474 200 1474 230 Z"
        />
        <line
          className="sa2"
          x1={1450}
          y1={230}
          x2={1450}
          y2={260}
          strokeWidth={2}
        />
        <rect className="fc3" x={1440} y={260} width={20} height={70} />
      </g>
      <g>
        <path
          className="sb2"
          fill="none"
          strokeWidth="3"
          d="M 1300 780 C 1320 700, 1280 640, 1330 580 S 1400 520, 1380 460"
        />
        {[
          [1310, 690],
          [1336, 590],
          [1392, 500],
        ].map(([x, y]) => (
          <circle key={x} className="fc3" cx={x} cy={y} r={18} />
        ))}
      </g>
      <Figure
        x={110}
        y={782}
        s={1.1}
        pose="seiza"
        robe
        headwear={bun}
        hand={cup}
        arms={{ which: "R", values: [0, 0, -40, -40, 0], dur: 11 }}
      />
      <Cat x={232} y={782} s={0.8} />
      <path className="fc3" d="M 290 782 L 324 782 L 307 762 Z" />
    </Art>
  );
}
