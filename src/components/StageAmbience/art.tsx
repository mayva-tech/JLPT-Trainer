import type { ReactNode } from "react";
import type { AmbienceTheme } from "./themes";
import {
  Bamboo,
  Castle,
  Fuji,
  Gassho,
  Karesansui,
  Koi,
  Koinobori,
  Machiya,
  Neon,
  Onsen,
  Pagoda,
  SeaTorii,
  Shinkansen,
  Tanabata,
  Tanbo,
  Torii,
  Tsukimi,
  Ukiyoe,
  Washitsu,
  Yatai,
  type SceneProps,
} from "./artJapan";
import { Art } from "./artKit";
import { particles, seeded } from "./scenery";

/*
 * Artwork for the ten stage themes.
 *
 * Rules every theme follows so the lesson text always wins:
 *  - drawn in pale, low-alpha tints of the stage palette (never solid colour)
 *  - shapes live at the edges and along the bottom; the centre stays open
 *  - drifting particles are few, small and slow, and pass under a scrim
 *  - no ids (two layers can be mounted at once during a cross-fade)
 *
 * All positions come from a seeded generator so the art is identical on
 * every render and in every recording.
 */

/* ── 1. Spring — a cherry branch and drifting petals ─────────────── */

function Blossom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return (
      <ellipse
        key={deg}
        cx={x + Math.cos(rad) * 8 * s}
        cy={y + Math.sin(rad) * 8 * s}
        rx={6.5 * s}
        ry={5 * s}
        transform={`rotate(${deg} ${x + Math.cos(rad) * 8 * s} ${y + Math.sin(rad) * 8 * s})`}
      />
    );
  });
  return (
    <g>
      <g className="amb-fill-soft">{petals}</g>
      <circle className="amb-fill-core" cx={x} cy={y} r={2.6 * s} />
    </g>
  );
}

function Spring() {
  const blossoms: [number, number, number][] = [
    [70, 318, 1.1],
    [150, 292, 0.9],
    [232, 272, 1.2],
    [300, 252, 0.85],
    [372, 236, 1.1],
    [418, 214, 0.9],
    [196, 340, 0.95],
    [262, 372, 1.1],
    [330, 296, 0.8],
    [118, 360, 0.85],
    [1490, 760, 1.1],
    [1540, 712, 0.9],
  ];
  return (
    <>
      <Art>
        <g className="amb-stroke-branch" fill="none" strokeLinecap="round">
          <path
            d="M -30 340 C 90 316, 220 286, 330 258 S 410 226, 440 206"
            strokeWidth="9"
          />
          <path d="M 160 300 C 190 330, 220 352, 266 376" strokeWidth="5" />
          <path d="M 300 262 C 312 280, 322 290, 334 298" strokeWidth="4" />
          <path d="M 1620 800 C 1560 760, 1520 730, 1470 742" strokeWidth="6" />
        </g>
        {blossoms.map(([x, y, s]) => (
          <Blossom key={`${x}-${y}`} x={x} y={y} s={s} />
        ))}
        <path
          className="amb-fill-ground"
          d="M 860 900 Q 1240 770 1600 810 L 1600 900 Z"
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 12,
          seed: 11,
          className: "amb-p--petal fall",
          duration: [16, 24],
          size: [0.7, 1.1],
          opacity: [0.22, 0.38],
        })}
      </div>
    </>
  );
}

/* ── 2. Summer — fireworks over a lantern-lit riverbank ──────────── */

function Burst({
  x,
  y,
  r,
  tone,
  delay,
}: {
  x: number;
  y: number;
  r: number;
  tone: string;
  delay: number;
}) {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return (
      <g key={i}>
        <line
          x1={x + Math.cos(a) * r * 0.28}
          y1={y + Math.sin(a) * r * 0.28}
          x2={x + Math.cos(a) * r * 0.86}
          y2={y + Math.sin(a) * r * 0.86}
        />
        <circle cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={3.2} />
      </g>
    );
  });
  return (
    <g
      className={`amb-burst amb-tone-${tone}`}
      style={{ animationDelay: `${delay}s` }}
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      {rays}
    </g>
  );
}

function Summer() {
  const lanterns = [140, 260, 380, 500, 1100, 1220, 1340, 1460];
  return (
    <Art>
      <Burst x={230} y={200} r={95} tone="gold" delay={-1.5} />
      <Burst x={1430} y={300} r={105} tone="rose" delay={-4.8} />
      <Burst x={1310} y={520} r={62} tone="teal" delay={-7.2} />
      <Burst x={150} y={520} r={60} tone="rose" delay={-3.1} />
      <path
        className="amb-fill-shadow"
        d="M 0 822 Q 400 792 800 814 T 1600 802 L 1600 900 L 0 900 Z"
      />
      <path
        className="amb-stroke-line"
        fill="none"
        d="M 0 822 Q 400 792 800 814 T 1600 802"
      />
      {lanterns.map((x, i) => (
        <g
          key={x}
          className="amb-lantern"
          style={{ animationDelay: `${-i * 0.7}s` }}
        >
          <circle
            cx={x}
            cy={806 - Math.sin(x / 260) * 8}
            r={14}
            className="amb-fill-glow"
          />
          <ellipse
            cx={x}
            cy={806 - Math.sin(x / 260) * 8}
            rx={5}
            ry={6.5}
            className="amb-fill-lamp"
          />
        </g>
      ))}
    </Art>
  );
}

/* ── 3. Autumn — a maple branch and falling leaves ───────────────── */

const MAPLE =
  "M0,-20 L4,-9 L12,-13 L9,-4 L19,-3 L11,3 L14,10 L4,7 L1,18 L-1,18 L-4,7 L-14,10 L-11,3 L-19,-3 L-9,-4 L-12,-13 L-4,-9 Z";

function Autumn() {
  const leaves: [number, number, number, number, string][] = [
    [1560, 302, 1.3, 20, "rust"],
    [1490, 286, 1.0, -15, "amber"],
    [1420, 266, 1.2, 35, "rust"],
    [1350, 250, 0.9, -30, "amber"],
    [1290, 236, 1.15, 10, "rust"],
    [1230, 226, 0.95, -5, "amber"],
    [1180, 214, 1.05, 25, "rust"],
    [1404, 330, 0.85, -40, "amber"],
  ];
  return (
    <>
      <Art>
        <g className="amb-stroke-branch" fill="none" strokeLinecap="round">
          <path
            d="M 1630 320 C 1520 300, 1420 270, 1320 246 S 1210 222, 1160 206"
            strokeWidth="8"
          />
          <path d="M 1430 276 C 1420 296, 1412 312, 1404 330" strokeWidth="4" />
        </g>
        {leaves.map(([x, y, s, rot, tone]) => (
          <path
            key={`${x}-${y}`}
            d={MAPLE}
            className={`amb-tone-${tone}`}
            transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
          />
        ))}
        <path
          className="amb-fill-ground"
          d="M 0 900 L 0 800 Q 260 760 620 830 Q 760 860 820 900 Z"
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 10,
          seed: 23,
          className: "amb-p--leaf fall",
          duration: [17, 26],
          size: [1.0, 1.6],
          opacity: [0.2, 0.34],
        })}
      </div>
    </>
  );
}

/* ── 4. Winter — snowy hills and slow snowfall ───────────────────── */

function Winter() {
  const pines = [180, 230, 300, 1180, 1240, 1300, 1380, 1440];
  return (
    <>
      <Art>
        <path
          className="amb-fill-far"
          d="M 0 752 Q 300 690 620 734 T 1200 716 T 1600 736 L 1600 900 L 0 900 Z"
        />
        {pines.map((x, i) => {
          const h = 46 + ((i * 37) % 28);
          const base = x < 800 ? 718 : 722;
          return (
            <path
              key={x}
              className="amb-fill-far"
              d={`M ${x} ${base - h} L ${x + h * 0.32} ${base} L ${x - h * 0.32} ${base} Z`}
            />
          );
        })}
        <path
          className="amb-fill-near"
          d="M 0 832 Q 500 772 900 818 T 1600 798 L 1600 900 L 0 900 Z"
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 18,
          seed: 37,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.55],
          opacity: [0.22, 0.42],
        })}
      </div>
    </>
  );
}

/* ── 5. Rain — fine rain, ripples, hydrangea in the corner ───────── */

function Hydrangea({ x, y, tone }: { x: number; y: number; tone: string }) {
  const r = seeded(x * 7 + y);
  const florets = Array.from({ length: 22 }, (_, i) => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 58;
    const cx = x + Math.cos(a) * d;
    const cy = y + Math.sin(a) * d * 0.8;
    return (
      <g
        key={i}
        transform={`translate(${cx} ${cy}) rotate(${Math.round(r() * 90)})`}
      >
        <rect x={-7} y={-2.5} width={14} height={5} rx={2.5} />
        <rect x={-2.5} y={-7} width={5} height={14} rx={2.5} />
      </g>
    );
  });
  return <g className={`amb-tone-${tone}`}>{florets}</g>;
}

function Rain() {
  return (
    <>
      <Art>
        <path
          className="amb-fill-leafy"
          d="M 0 900 L 0 770 Q 90 740 160 790 Q 240 720 320 800 Q 380 830 420 900 Z"
        />
        <Hydrangea x={110} y={760} tone="indigo" />
        <Hydrangea x={250} y={790} tone="violet" />
        <Hydrangea x={60} y={850} tone="violet" />
        {[520, 900, 1280].map((x, i) => (
          <ellipse
            key={x}
            className="amb-ripple"
            style={{ animationDelay: `${-i * 1.4}s` }}
            cx={x}
            cy={858 - i * 6}
            rx={60}
            ry={9}
            fill="none"
          />
        ))}
      </Art>
      <div className="amb-particles amb-particles--slant">
        {particles({
          count: 26,
          seed: 51,
          className: "amb-p--drop fall-fast",
          duration: [1.6, 2.6],
          size: [0.08, 0.1],
          opacity: [0.12, 0.24],
          left: [-10, 110],
        })}
      </div>
    </>
  );
}

/* ── 6. Outer space — stars, a ringed planet, a rare shooting star ── */

function Space() {
  const r = seeded(67);
  const stars = Array.from({ length: 80 }, (_, i) => {
    const x = r() * 1600;
    const y = r() * 900;
    return (
      <circle
        key={i}
        cx={x.toFixed(1)}
        cy={y.toFixed(1)}
        r={(0.8 + r() * 1.4).toFixed(2)}
        opacity={(0.18 + r() * 0.32).toFixed(2)}
      />
    );
  });
  return (
    <>
      <div className="amb-nebula" />
      <Art>
        <g className="amb-fill-star">{stars}</g>
      </Art>
      <div className="amb-planet" />
      <div className="amb-particles">
        {particles({
          count: 9,
          seed: 71,
          className: "amb-p--twinkle twinkle",
          duration: [3.5, 6.5],
          size: [0.35, 0.6],
          opacity: [0.35, 0.6],
          top: [4, 92],
        })}
        <span className="amb-shooting" />
      </div>
    </>
  );
}

/* ── 7. Ocean — layered waves and rising bubbles ─────────────────── */

function wavePath(y: number, amp: number, period: number): string {
  let d = `M 0 ${y}`;
  for (let x = 0; x < 3200; x += period) {
    d += ` q ${period / 4} ${-amp} ${period / 2} 0 t ${period / 2} 0`;
  }
  return `${d} L 3200 900 L 0 900 Z`;
}

function Ocean() {
  return (
    <>
      <div className="amb-wave amb-wave--far">
        <svg viewBox="0 0 3200 900" preserveAspectRatio="none">
          <path d={wavePath(760, 16, 400)} />
        </svg>
      </div>
      <div className="amb-wave amb-wave--mid">
        <svg viewBox="0 0 3200 900" preserveAspectRatio="none">
          <path d={wavePath(800, 20, 320)} />
        </svg>
      </div>
      <div className="amb-wave amb-wave--near">
        <svg viewBox="0 0 3200 900" preserveAspectRatio="none">
          <path d={wavePath(846, 14, 200)} />
        </svg>
      </div>
      <div className="amb-particles">
        {particles({
          count: 8,
          seed: 83,
          className: "amb-p--bubble rise",
          duration: [16, 26],
          size: [0.4, 0.9],
          opacity: [0.18, 0.3],
          left: [4, 96],
        })}
      </div>
    </>
  );
}

/* ── 8. City at night — skyline, lit windows, a passing train ────── */

function City() {
  const r = seeded(97);
  const buildings: ReactNode[] = [];
  const windows: ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < 1620) {
    const w = 60 + Math.round(r() * 70);
    // Lower in the middle third so the skyline frames, not crowds, the text.
    const middle = x > 520 && x < 1080;
    const h = Math.round((middle ? 70 : 120) + r() * (middle ? 60 : 170));
    const top = 870 - h;
    buildings.push(
      <rect key={`b${i}`} x={x} y={top} width={w} height={h + 40} />,
    );
    for (let wy = top + 16; wy < 850; wy += 26) {
      for (let wx = x + 12; wx < x + w - 14; wx += 20) {
        const roll = r();
        if (roll < 0.22) {
          windows.push(
            <rect
              key={`w${wx}-${wy}`}
              className={
                roll < 0.04 ? "amb-window amb-window--blink" : "amb-window"
              }
              style={
                roll < 0.04
                  ? { animationDelay: `${-(r() * 9).toFixed(2)}s` }
                  : undefined
              }
              x={wx}
              y={wy}
              width={7}
              height={9}
            />,
          );
        }
      }
    }
    x += w + 6;
    i++;
  }
  return (
    <>
      <Art>
        <circle className="amb-fill-moon" cx={1452} cy={150} r={34} />
        <circle className="amb-fill-halo" cx={1452} cy={150} r={70} />
        <g className="amb-stroke-tower" fill="none" strokeWidth="2">
          <path d="M 1250 870 L 1290 540 L 1302 470 L 1314 540 L 1354 870" />
          <path d="M 1268 720 L 1336 720 M 1281 620 L 1323 620 M 1294 540 L 1310 540" />
          <path d="M 1256 820 L 1348 820 L 1268 720 M 1336 720 L 1256 820" />
        </g>
        <g className="amb-fill-building">{buildings}</g>
        <g className="amb-fill-window">{windows}</g>
      </Art>
      <div className="amb-train">
        {Array.from({ length: 14 }, (_, k) => (
          <span key={k} />
        ))}
      </div>
    </>
  );
}

/* ── 9. Mountains — layered ridges, forest edge, drifting mist ───── */

function Mountains() {
  const r = seeded(109);
  const trees: ReactNode[] = [];
  for (let x = -10; x < 1620; x += 18 + Math.round(r() * 16)) {
    const middle = x > 560 && x < 1040;
    const h = (middle ? 26 : 44) + Math.round(r() * (middle ? 14 : 36));
    const base = 872 - Math.sin(x / 210) * 10;
    trees.push(
      <path
        key={x}
        d={`M ${x} ${(base - h).toFixed(1)} L ${(x + h * 0.3).toFixed(1)} ${base.toFixed(1)} L ${(x - h * 0.3).toFixed(1)} ${base.toFixed(1)} Z`}
      />,
    );
  }
  return (
    <>
      <Art>
        <path
          className="amb-fill-far"
          d="M 0 700 L 160 640 L 300 676 L 460 610 L 600 668 L 720 690 L 1020 690 L 1180 470 L 1240 452 L 1300 470 L 1460 640 L 1600 610 L 1600 900 L 0 900 Z"
        />
        <path
          className="amb-fill-cap"
          d="M 1180 470 L 1240 452 L 1300 470 L 1276 500 L 1256 486 L 1238 506 L 1218 488 L 1200 500 Z"
        />
        <path
          className="amb-fill-mid"
          d="M 0 770 Q 200 700 380 742 Q 520 772 700 752 Q 900 732 1100 760 Q 1300 790 1460 728 Q 1540 702 1600 716 L 1600 900 L 0 900 Z"
        />
        <g className="amb-fill-near">{trees}</g>
        <path
          className="amb-fill-near"
          d="M 0 868 Q 800 852 1600 866 L 1600 900 L 0 900 Z"
        />
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
      <div className="amb-mist" />
    </>
  );
}

/* ── 10. Washi — shippō pattern in the corners and an ink ensō ───── */

function Washi() {
  return (
    <>
      <div className="amb-pattern amb-pattern--tl" />
      <div className="amb-pattern amb-pattern--br" />
      <Art>
        <g className="amb-enso" fill="none" strokeLinecap="round">
          <path d="M 1484 640 A 150 150 0 1 0 1452 828" strokeWidth="20" />
          <path d="M 1452 828 Q 1470 812 1480 790" strokeWidth="9" />
        </g>
        <g className="amb-fill-ink">
          <circle cx={190} cy={792} r={7} />
          <circle cx={214} cy={806} r={3.5} />
          <circle cx={172} cy={812} r={2.5} />
        </g>
      </Art>
    </>
  );
}

const ART: Record<AmbienceTheme, (props: SceneProps) => ReactNode> = {
  spring: Spring,
  summer: Summer,
  autumn: Autumn,
  winter: Winter,
  rain: Rain,
  space: Space,
  ocean: Ocean,
  city: City,
  mountains: Mountains,
  washi: Washi,
  fuji: Fuji,
  torii: Torii,
  seaTorii: SeaTorii,
  pagoda: Pagoda,
  castle: Castle,
  machiya: Machiya,
  onsen: Onsen,
  karesansui: Karesansui,
  bamboo: Bamboo,
  shinkansen: Shinkansen,
  tanabata: Tanabata,
  koi: Koi,
  yatai: Yatai,
  washitsu: Washitsu,
  tanbo: Tanbo,
  gassho: Gassho,
  neon: Neon,
  koinobori: Koinobori,
  tsukimi: Tsukimi,
  ukiyoe: Ukiyoe,
};

/**
 * Draw one theme. `glyphs` (up to three kanji of the current word) are
 * written into the scenes that have signs, strips, noren or lanterns.
 */
export function AmbienceArt({
  theme,
  glyphs = "",
}: {
  theme: AmbienceTheme;
  glyphs?: string;
}) {
  const Draw = ART[theme];
  return <Draw glyphs={glyphs} />;
}
