import type { ReactNode } from "react";
import { Art } from "./artKit";
import { particles, seeded } from "./scenery";

/*
 * Twenty Japan scenes for the stage ambience.
 *
 * Same rules as the first ten themes: faint tints only, shapes at the
 * edges and along the bottom, the centre left open for the lesson text,
 * no ids. Colours come from three per-theme tints (--a, --b, --c in
 * stageAmbience.css) through the fill / stroke utility classes:
 *   fa1..fa4 = fill with tint A at rising strength, sb2 = stroke B, …
 *
 * Four scenes write the current word's kanji into the scenery (neon signs,
 * tanabata strips, ramen-stall noren, townhouse lanterns). Without kanji
 * they show their own stock characters.
 */

export interface SceneProps {
  /** Up to three kanji from the word on screen; may be empty. */
  glyphs?: string;
}

/** Characters for a scene: the word's kanji first, then the stock ones. */
function pick(
  glyphs: string | undefined,
  stock: string,
  count: number,
): string[] {
  const chars = [...(glyphs ?? "")];
  const fill = [...stock];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(
      chars[i] ?? fill[(i - chars.length + fill.length) % fill.length] ?? "",
    );
  }
  return out;
}

function reducedMotion(): boolean {
  try {
    return (
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
      false
    );
  } catch {
    return false;
  }
}

/* ── 富士山 Red Fuji at dawn ─────────────────────────────────────── */

export function Fuji() {
  return (
    <Art>
      <circle className="fc1" cx={1330} cy={600} r={150} />
      <circle className="fc3" cx={1330} cy={600} r={66} />
      <path
        className="fa3"
        d="M 800 900 L 1050 650 Q 1140 560 1196 524 L 1254 522 Q 1310 556 1400 646 L 1600 836 L 1600 900 Z"
      />
      <path
        className="fb3"
        d="M 1146 566 Q 1176 538 1196 524 L 1254 522 Q 1276 536 1304 562 L 1284 584 L 1264 568 L 1242 590 L 1220 568 L 1198 588 L 1176 570 Z"
      />
      <path
        className="fd"
        d="M 0 862 Q 300 800 640 848 Q 700 860 760 900 L 0 900 Z"
      />
      <g
        className="amb-cloud sb2"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M 900 716 H 1180 M 960 742 H 1320 M 1220 716 H 1420" />
        <path d="M 60 652 H 300 M 120 678 H 400" />
      </g>
    </Art>
  );
}

/* ── 千本鳥居 Torii tunnel ───────────────────────────────────────── */

function ToriiSide({ mirror }: { mirror: boolean }) {
  const pillars: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const w = 44 - i * 5;
    const x = 12 + i * 56 - i * i * 2;
    const op = 0.15 - i * 0.017;
    const beamY = 130 + i * 22;
    const px = mirror ? 1600 - x - w : x;
    pillars.push(
      <g key={i} opacity={op.toFixed(3)}>
        <rect
          className="pillar"
          x={px}
          y={beamY}
          width={w}
          height={900 - beamY}
        />
        <rect className="pillar-foot" x={px} y={836} width={w} height={64} />
        <path
          className="pillar"
          d={
            mirror
              ? `M ${px + w + 40} ${beamY - 4} Q ${px - 10} ${beamY + 6} ${px - 70} ${beamY - 14} L ${px - 70} ${beamY + 6} L ${px + w + 40} ${beamY + 18} Z`
              : `M ${px - 40} ${beamY - 4} Q ${px + w + 10} ${beamY + 6} ${px + w + 70} ${beamY - 14} L ${px + w + 70} ${beamY + 6} L ${px - 40} ${beamY + 18} Z`
          }
        />
        <rect
          className="pillar"
          x={mirror ? px - 30 : px - 10}
          y={beamY + 44}
          width={w + 40}
          height={10}
        />
      </g>,
    );
  }
  return <g>{pillars}</g>;
}

export function Torii() {
  return (
    <Art>
      <ToriiSide mirror={false} />
      <ToriiSide mirror />
      <g className="fb2">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={700 - i * 30}
            y={866 - i * 14}
            width={200 + i * 60}
            height={6}
            rx={3}
          />
        ))}
      </g>
    </Art>
  );
}

/* ── 海の鳥居 Torii standing in the sea ─────────────────────────── */

function SeaToriiGate() {
  return (
    <g className="fc3">
      <path d="M 1264 404 Q 1410 380 1556 404 L 1550 424 Q 1410 404 1270 424 Z" />
      <rect x={1300} y={424} width={220} height={12} />
      <rect x={1308} y={470} width={204} height={14} />
      <rect x={1332} y={424} width={26} height={340} />
      <rect x={1462} y={424} width={26} height={340} />
    </g>
  );
}

export function SeaTorii() {
  return (
    <Art>
      <path className="fa2" d="M 0 650 Q 140 560 300 600 Q 420 622 540 650 Z" />
      <rect className="fb1" x={0} y={650} width={1600} height={250} />
      <SeaToriiGate />
      <g transform="translate(0 1528) scale(1 -1)" opacity="0.35">
        <SeaToriiGate />
      </g>
      <g className="amb-shimmer sb2" strokeWidth="2" strokeLinecap="round">
        <path d="M 1240 790 H 1320 M 1370 806 H 1470 M 1500 790 H 1580 M 1280 830 H 1400 M 1440 852 H 1560" />
        <path d="M 80 720 H 220 M 300 760 H 460 M 140 810 H 300 M 560 840 H 760 M 860 872 H 1020" />
      </g>
    </Art>
  );
}

/* ── 五重塔 Five-storey pagoda ───────────────────────────────────── */

export function Pagoda() {
  const cx = 220;
  const tiers: ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const yBase = 860 - i * 104;
    const W = 270 - i * 30;
    const bw = W * 0.5;
    const yr = yBase - 58;
    tiers.push(
      <g key={i}>
        <rect className="fa2" x={cx - bw / 2} y={yr} width={bw} height={58} />
        <path
          className="fa3"
          d={`M ${cx - W / 2} ${yr + 8} Q ${cx - W / 4} ${yr - 4} ${cx - bw / 2} ${yr - 22} L ${cx + bw / 2} ${yr - 22} Q ${cx + W / 4} ${yr - 4} ${cx + W / 2} ${yr + 8} L ${cx + W / 2 - 16} ${yr + 12} L ${cx - W / 2 + 16} ${yr + 12} Z`}
        />
        <rect
          className="fa2"
          x={cx - bw / 2 + 10}
          y={yr - 46}
          width={bw - 20}
          height={24}
        />
      </g>,
    );
  }
  return (
    <>
      <Art>
        {tiers}
        <g className="sa3" strokeWidth="5" strokeLinecap="round">
          <path d="M 220 382 V 236" />
        </g>
        <g className="fa3">
          {[360, 342, 324, 306, 288, 270].map((y) => (
            <rect key={y} x={208} y={y} width={24} height={5} rx={2} />
          ))}
          <circle cx={220} cy={232} r={8} />
        </g>
        <g className="fb2">
          <ellipse cx={420} cy={846} rx={90} ry={60} />
          <ellipse cx={500} cy={872} rx={70} ry={40} />
          <ellipse cx={40} cy={860} rx={70} ry={50} />
        </g>
        <path
          className="fa2"
          d="M 1180 900 L 1230 800 Q 1400 770 1570 800 L 1600 806 L 1600 900 Z"
        />
        <path
          className="fa3"
          d="M 1190 806 Q 1400 760 1600 790 L 1600 778 Q 1400 742 1210 790 Z"
        />
      </Art>
      <div className="amb-mist" />
    </>
  );
}

/* ── 城 Castle and pine ──────────────────────────────────────────── */

function Roof({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <path
      className="fa3"
      d={`M ${x - 22} ${y + 6} Q ${x + w * 0.2} ${y - 6} ${x + 18} ${y - 26} L ${x + w - 18} ${y - 26} Q ${x + w * 0.8} ${y - 6} ${x + w + 22} ${y + 6} Z`}
    />
  );
}

export function Castle() {
  const tiers: [number, number, number, number][] = [
    [1218, 604, 264, 96],
    [1252, 520, 196, 84],
    [1286, 444, 128, 76],
    [1312, 378, 76, 66],
  ];
  return (
    <Art>
      <path
        className="fa2"
        d="M 1170 900 Q 1196 800 1206 700 L 1494 700 Q 1504 800 1530 900 Z"
      />
      {tiers.map(([x, y, w, h]) => (
        <g key={y}>
          <rect className="fb2" x={x} y={y} width={w} height={h} />
          <Roof x={x} y={y} w={w} />
          <g className="fa3">
            {Array.from({ length: Math.floor(w / 46) }, (_, i) => (
              <rect
                key={i}
                x={x + 18 + i * 46}
                y={y + h * 0.45}
                width={14}
                height={12}
              />
            ))}
          </g>
        </g>
      ))}
      <path className="fa3" d="M 1328 380 L 1350 344 L 1372 380 Z" />
      <path className="fa3" d="M 1300 448 L 1350 414 L 1400 448 Z" />
      <path
        className="sa3"
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        d="M 120 900 C 140 800, 110 720, 170 640 S 300 560, 360 590"
      />
      <g className="fb3">
        <ellipse cx={360} cy={580} rx={92} ry={22} />
        <ellipse cx={210} cy={620} rx={110} ry={24} />
        <ellipse cx={120} cy={690} rx={90} ry={20} />
        <ellipse cx={270} cy={548} rx={70} ry={16} />
      </g>
    </Art>
  );
}

/* ── 京町家 Kyoto townhouses with lanterns ───────────────────────── */

function Lantern({
  x,
  y,
  ch,
  s = 1,
}: {
  x: number;
  y: number;
  ch: string;
  s?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="amb-sway-soft">
        <line className="sa2" x1={0} y1={-70} x2={0} y2={-36} strokeWidth={2} />
        <ellipse className="fc1" cx={0} cy={0} rx={60} ry={64} />
        <ellipse className="fc4" cx={0} cy={0} rx={28} ry={36} />
        <rect className="fd" x={-16} y={-40} width={32} height={8} rx={2} />
        <rect className="fd" x={-16} y={32} width={32} height={8} rx={2} />
        <g className="sc3" strokeWidth={1.5} fill="none">
          <path d="M -27 -14 Q 0 -10 27 -14 M -28 4 Q 0 8 28 4 M -25 20 Q 0 24 25 20" />
        </g>
        <text className="amb-glyph gink" x={0} y={1} fontSize={30}>
          {ch}
        </text>
      </g>
    </g>
  );
}

export function Machiya({ glyphs }: SceneProps) {
  const r = seeded(131);
  const houses: ReactNode[] = [];
  let x = -10;
  let i = 0;
  while (x < 1610) {
    const w = 150 + Math.round(r() * 60);
    const top = 700 + Math.round(r() * 20);
    houses.push(
      <g key={i}>
        <rect className="fa2" x={x} y={top + 22} width={w} height={900 - top} />
        <path
          className="fa3"
          d={`M ${x - 8} ${top + 26} L ${x + 10} ${top} L ${x + w - 10} ${top} L ${x + w + 8} ${top + 26} Z`}
        />
        <g className="sb1" strokeWidth={2}>
          {Array.from({ length: Math.floor((w - 30) / 9) }, (_, k) => (
            <line
              key={k}
              x1={x + 14 + k * 9}
              y1={top + 50}
              x2={x + 14 + k * 9}
              y2={top + 108}
            />
          ))}
        </g>
        <rect
          className="fc2"
          x={x + w * 0.6}
          y={top + 116}
          width={w * 0.3}
          height={44}
        />
      </g>,
    );
    x += w + 4;
    i++;
  }
  const [a, b, c] = pick(glyphs, "祭灯和", 3);
  return (
    <Art>
      {houses}
      <Lantern x={120} y={640} ch={a!} />
      <Lantern x={1350} y={630} ch={b!} />
      <Lantern x={1500} y={650} ch={c!} s={0.85} />
    </Art>
  );
}

/* ── 温泉 Hot spring ─────────────────────────────────────────────── */

export function Onsen() {
  return (
    <>
      <Art>
        <ellipse className="fb2" cx={800} cy={890} rx={760} ry={70} />
        <g className="fa2">
          <ellipse cx={90} cy={850} rx={130} ry={70} />
          <ellipse cx={240} cy={880} rx={110} ry={50} />
          <ellipse cx={1500} cy={850} rx={140} ry={80} />
          <ellipse cx={1360} cy={884} rx={100} ry={44} />
        </g>
        <g className="fb3">
          <ellipse cx={80} cy={796} rx={84} ry={16} />
          <ellipse cx={1510} cy={786} rx={96} ry={18} />
        </g>
        <g className="sc3" fill="none" strokeWidth="5" strokeLinecap="round">
          <ellipse cx={150} cy={720} rx={40} ry={16} />
          <path
            className="amb-steam-line"
            d="M 130 696 q -12 -20 0 -40 q 12 -20 0 -40"
          />
          <path
            className="amb-steam-line"
            d="M 150 696 q -12 -24 0 -48 q 12 -24 0 -48"
          />
          <path
            className="amb-steam-line"
            d="M 170 696 q -12 -20 0 -40 q 12 -20 0 -40"
          />
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 9,
          seed: 151,
          className: "amb-p--steam rise-slow",
          duration: [14, 22],
          size: [7, 13],
          opacity: [0.45, 0.8],
          left: [6, 90],
        })}
      </div>
    </>
  );
}

/* ── 枯山水 Zen rock garden ──────────────────────────────────────── */

export function Karesansui() {
  const rocks = [
    { cx: 250, cy: 818, rx: 150, ry: 46 },
    { cx: 1380, cy: 810, rx: 170, ry: 50 },
  ];
  const lines: ReactNode[] = [];
  for (let y = 752; y < 900; y += 14) {
    const cuts: [number, number][] = [];
    for (const k of rocks) {
      const dy = (y - k.cy) / k.ry;
      if (Math.abs(dy) < 1) {
        const hw = k.rx * Math.sqrt(1 - dy * dy);
        cuts.push([k.cx - hw, k.cx + hw]);
      }
    }
    let from = 0;
    for (const [a, b] of cuts) {
      lines.push(<line key={`${y}-${a}`} x1={from} y1={y} x2={a} y2={y} />);
      from = b;
    }
    lines.push(<line key={`${y}-end`} x1={from} y1={y} x2={1600} y2={y} />);
  }
  return (
    <Art>
      <path className="fa1" d="M 0 700 H 1600 V 900 H 0 Z" />
      <rect className="fa2" x={0} y={690} width={1600} height={10} />
      <g className="sb2" strokeWidth="2">
        {lines}
      </g>
      {rocks.map((k) => (
        <g key={k.cx} className="sb2" fill="none" strokeWidth="2">
          {[1, 0.78, 0.56].map((s) => (
            <ellipse key={s} cx={k.cx} cy={k.cy} rx={k.rx * s} ry={k.ry * s} />
          ))}
        </g>
      ))}
      <g className="fa3">
        <path d="M 200 820 Q 214 770 250 766 Q 296 770 306 812 Z" />
        <path d="M 1326 812 Q 1340 752 1392 748 Q 1440 756 1446 808 Z" />
        <path d="M 1442 822 Q 1452 800 1474 800 Q 1494 806 1496 824 Z" />
      </g>
      <g className="fc2">
        <ellipse cx={250} cy={818} rx={70} ry={12} />
        <ellipse cx={1394} cy={812} rx={84} ry={13} />
      </g>
    </Art>
  );
}

/* ── 竹林 Bamboo grove ───────────────────────────────────────────── */

function Stalks({ xs, seed }: { xs: number[]; seed: number }) {
  const r = seeded(seed);
  return (
    <g className="amb-sway">
      {xs.map((x, i) => {
        const w = 16 + Math.round(r() * 8);
        const nodes: ReactNode[] = [];
        for (let y = 60 + r() * 60; y < 900; y += 110 + r() * 40) {
          nodes.push(
            <rect
              key={y}
              className="fb3"
              x={x - 2}
              y={y}
              width={w + 4}
              height={4}
              rx={2}
            />,
          );
        }
        return (
          <g key={x} opacity={(0.9 - i * 0.12).toFixed(2)}>
            <rect className="fb2" x={x} y={0} width={w} height={900} />
            {nodes}
          </g>
        );
      })}
    </g>
  );
}

function Leaves({ x, y, flip }: { x: number; y: number; flip: boolean }) {
  const r = seeded(x + y);
  return (
    <g
      className="fb2"
      transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const a = -30 + r() * 80;
        const d = 20 + r() * 120;
        return (
          <ellipse
            key={i}
            cx={d}
            cy={i * 8 - 30}
            rx={46}
            ry={7}
            transform={`rotate(${a.toFixed(1)} ${d} ${i * 8 - 30})`}
          />
        );
      })}
    </g>
  );
}

export function Bamboo() {
  return (
    <>
      <div className="amb-beam amb-beam--1" />
      <div className="amb-beam amb-beam--2" />
      <Art>
        <Stalks xs={[30, 92, 150, 212, 268]} seed={163} />
        <Stalks xs={[1314, 1372, 1432, 1492, 1556]} seed={167} />
        <Leaves x={280} y={180} flip={false} />
        <Leaves x={220} y={420} flip={false} />
        <Leaves x={1310} y={220} flip />
        <Leaves x={1370} y={470} flip />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 6,
          seed: 171,
          className: "amb-p--bamboo-leaf fall",
          duration: [18, 28],
          size: [1.2, 1.8],
          opacity: [0.16, 0.26],
        })}
      </div>
    </>
  );
}

/* ── 新幹線 Bullet train on a viaduct ───────────────────────────── */

export function Shinkansen() {
  return (
    <>
      <Art>
        <path className="fa1" d="M 30 800 L 200 680 L 250 680 L 430 800 Z" />
        <path
          className="fb2"
          d="M 168 703 L 200 680 L 250 680 L 282 703 L 262 714 L 240 702 L 224 716 L 206 702 Z"
        />
        <rect className="fa2" x={0} y={796} width={1600} height={16} />
        <g className="fa2">
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={40 + i * 160} y={812} width={20} height={88} />
          ))}
        </g>
        <g className="sa2" strokeWidth="3">
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={80 + i * 320}
              y1={796}
              x2={80 + i * 320}
              y2={718}
            />
          ))}
          <path
            fill="none"
            d="M 0 726 Q 160 738 320 726 T 640 726 T 960 726 T 1280 726 T 1600 726"
          />
        </g>
      </Art>
      <div className="amb-bullet">
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none">
          <path
            className="fb3"
            d="M 0 14 H 760 Q 900 18 1000 52 L 1000 58 H 0 Z"
          />
          <rect className="fc3" x={0} y={40} width={930} height={5} />
          <g className="fa3">
            {Array.from({ length: 34 }, (_, i) => (
              <rect
                key={i}
                x={14 + i * 21}
                y={24}
                width={12}
                height={9}
                rx={2}
              />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}

/* ── 七夕 Wish strips under the Milky Way ───────────────────────── */

function Strips({
  x0,
  y0,
  x1,
  y1,
  chars,
  seed,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  chars: string[];
  seed: number;
}) {
  const tones = ["fc3", "fa3", "fb3", "fc4", "fa4"];
  const r = seeded(seed);
  return (
    <g>
      <path
        className="sb3"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${y0 + 40} ${x1} ${y1}`}
      />
      {chars.map((ch, i) => {
        const t = (i + 0.6) / (chars.length + 0.4);
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t + 30 * Math.sin(Math.PI * t);
        const h = 92 + Math.round(r() * 26);
        return (
          <g
            key={i}
            className="amb-strip"
            style={{ animationDelay: `${(-r() * 5).toFixed(2)}s` }}
          >
            <line
              className="sb2"
              x1={x}
              y1={y}
              x2={x}
              y2={y + 16}
              strokeWidth={1.5}
            />
            <rect
              className={tones[i % tones.length]}
              x={x - 15}
              y={y + 16}
              width={30}
              height={h}
            />
            <text
              className="amb-glyph gink"
              x={x}
              y={y + 16 + h / 2}
              fontSize={22}
            >
              {ch}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function Tanabata({ glyphs }: SceneProps) {
  const r = seeded(181);
  const band: ReactNode[] = [];
  for (let i = 0; i < 90; i++) {
    const t = r();
    const x = 880 + t * 760;
    const y = -20 + t * 460 + (r() - 0.5) * 120;
    band.push(
      <circle
        key={i}
        cx={x.toFixed(1)}
        cy={y.toFixed(1)}
        r={(0.7 + r() * 1.5).toFixed(2)}
      />,
    );
  }
  const left = pick(glyphs, "願星夢", 4);
  const right = pick(glyphs, "夢願星", 3).reverse();
  return (
    <>
      <Art>
        <path
          className="sb1"
          fill="none"
          strokeWidth="90"
          strokeLinecap="round"
          d="M 900 0 L 1640 430"
        />
        <g className="amb-fill-star-soft">{band}</g>
        <Strips x0={-20} y0={150} x1={430} y1={300} chars={left} seed={191} />
        <Strips
          x0={1620}
          y0={560}
          x1={1260}
          y1={650}
          chars={right}
          seed={193}
        />
        <g className="fb2">
          <ellipse
            cx={120}
            cy={170}
            rx={50}
            ry={9}
            transform="rotate(20 120 170)"
          />
          <ellipse
            cx={300}
            cy={244}
            rx={44}
            ry={8}
            transform="rotate(-16 300 244)"
          />
          <ellipse
            cx={1500}
            cy={576}
            rx={48}
            ry={9}
            transform="rotate(-12 1500 576)"
          />
        </g>
      </Art>
      <div className="amb-particles">
        {particles({
          count: 6,
          seed: 197,
          className: "amb-p--twinkle twinkle",
          duration: [4, 7],
          size: [0.35, 0.55],
          opacity: [0.3, 0.5],
          top: [4, 40],
          left: [56, 98],
        })}
      </div>
    </>
  );
}

/* ── 鯉の池 Koi pond ─────────────────────────────────────────────── */

function KoiFish({
  path,
  dur,
  tone,
}: {
  path: string;
  dur: number;
  tone: string;
}) {
  const still = reducedMotion();
  const [, x, y] = /M\s*(-?[\d.]+)\s+(-?[\d.]+)/.exec(path) ?? ["", "0", "0"];
  return (
    <g transform={still ? `translate(${x} ${y})` : undefined}>
      <g>
        <path className="fb3" d="M -26 0 L -50 -13 L -44 0 L -50 13 Z" />
        <ellipse className="fb3" cx={0} cy={0} rx={34} ry={11} />
        <ellipse className={tone} cx={6} cy={-1} rx={14} ry={7} />
        <ellipse className={tone} cx={-14} cy={2} rx={8} ry={5} />
        <ellipse
          className="fb2"
          cx={4}
          cy={-14}
          rx={9}
          ry={4}
          transform="rotate(-30 4 -14)"
        />
        <ellipse
          className="fb2"
          cx={4}
          cy={14}
          rx={9}
          ry={4}
          transform="rotate(30 4 14)"
        />
      </g>
      {!still && (
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

function LilyPad({
  x,
  y,
  r,
  rot,
}: {
  x: number;
  y: number;
  r: number;
  rot: number;
}) {
  return (
    <path
      className="fb2"
      transform={`translate(${x} ${y}) rotate(${rot})`}
      d={`M 0 0 L ${r} -6 A ${r} ${r} 0 1 1 ${r} 6 Z`}
    />
  );
}

export function Koi() {
  return (
    <Art>
      <LilyPad x={90} y={140} r={70} rot={20} />
      <LilyPad x={210} y={90} r={44} rot={140} />
      <LilyPad x={1510} y={820} r={80} rot={-60} />
      <LilyPad x={1390} y={860} r={50} rot={70} />
      <LilyPad x={70} y={820} r={60} rot={200} />
      <g className="fc3">
        {[0, 72, 144, 216, 288].map((d) => (
          <ellipse
            key={d}
            cx={1510}
            cy={806}
            rx={20}
            ry={8}
            transform={`rotate(${d} 1510 806) translate(16 0)`}
          />
        ))}
      </g>
      {[
        [400, 820],
        [1200, 140],
        [140, 470],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          className="amb-ripple"
          style={{ animationDelay: `${-i * 1.6}s` }}
          cx={x}
          cy={y}
          rx={70}
          ry={22}
          fill="none"
        />
      ))}
      <KoiFish tone="fc4" dur={26} path="M 260 610 a 200 110 0 1 1 0.1 0" />
      <KoiFish tone="fa4" dur={32} path="M 1350 640 a 220 100 0 1 0 0.1 0" />
      <KoiFish tone="fc3" dur={30} path="M 140 230 a 110 200 0 1 0 0.1 0" />
    </Art>
  );
}

/* ── 屋台 Ramen stall ─────────────────────────────────────────────── */

export function Yatai({ glyphs }: SceneProps) {
  const noren = pick(glyphs, "拉麺屋", 3);
  return (
    <>
      <Art>
        {/* Stall drawn at full size, then tucked into the bottom-left corner. */}
        <g transform="translate(0 288) scale(0.68)">
          <path className="fa3" d="M 50 560 L 440 560 L 460 592 L 30 592 Z" />
          <rect className="fa2" x={70} y={592} width={10} height={260} />
          <rect className="fa2" x={410} y={592} width={10} height={260} />
          {noren.map((ch, i) => (
            <g
              key={i}
              className="amb-noren"
              style={{ animationDelay: `${-i * 0.8}s` }}
            >
              <rect
                className="fc3"
                x={92 + i * 104}
                y={594}
                width={96}
                height={86}
              />
              <text
                className="amb-glyph glit"
                x={140 + i * 104}
                y={634}
                fontSize={40}
              >
                {ch}
              </text>
            </g>
          ))}
          <rect className="fa3" x={60} y={714} width={370} height={16} />
          <rect className="fa2" x={70} y={730} width={350} height={120} />
          <g className="sa3" fill="none" strokeWidth="5">
            <circle cx={130} cy={862} r={30} />
            <circle cx={370} cy={862} r={30} />
          </g>
          <g className="fa2">
            <rect x={470} y={800} width={44} height={10} />
            <rect x={486} y={810} width={10} height={60} />
          </g>
          <path
            className="fb3"
            d="M 300 714 Q 300 690 330 690 L 380 690 Q 410 690 410 714 Z"
          />
        </g>
        <Lantern
          x={1440}
          y={640}
          ch={noren[0] === "拉" ? "酒" : noren[0]!}
          s={0.8}
        />
        <Lantern x={1540} y={720} ch="灯" s={0.6} />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 5,
          seed: 211,
          className: "amb-p--steam rise-slow",
          duration: [10, 16],
          size: [3.5, 6],
          opacity: [0.5, 0.8],
          left: [11, 17],
        })}
      </div>
    </>
  );
}

/* ── 和室 Tatami room — shoji and a tea bowl ────────────────────── */

function Shoji({ x, w }: { x: number; w: number }) {
  const cols = 4;
  const rows = 9;
  const cw = w / cols;
  const rh = (900 - 150) / rows;
  return (
    <g>
      <rect className="fc1" x={x} y={150} width={w} height={750} />
      <g className="sb1" strokeWidth="2">
        {Array.from({ length: cols - 1 }, (_, i) => (
          <line
            key={`c${i}`}
            x1={x + cw * (i + 1)}
            y1={150}
            x2={x + cw * (i + 1)}
            y2={900}
          />
        ))}
        {Array.from({ length: rows - 1 }, (_, i) => (
          <line
            key={`r${i}`}
            x1={x}
            y1={150 + rh * (i + 1)}
            x2={x + w}
            y2={150 + rh * (i + 1)}
          />
        ))}
      </g>
      <rect
        className="sb2"
        fill="none"
        strokeWidth="8"
        x={x}
        y={150}
        width={w}
        height={750}
      />
    </g>
  );
}

export function Washitsu() {
  return (
    <Art>
      <Shoji x={-8} w={300} />
      <Shoji x={1308} w={300} />
      <path className="fa1" d="M 0 830 H 1600 V 900 H 0 Z" />
      <g className="sa2" strokeWidth="6">
        <line x1={0} y1={830} x2={1600} y2={830} />
        <line x1={560} y1={830} x2={420} y2={900} />
        <line x1={1040} y1={830} x2={1180} y2={900} />
      </g>
      <path
        className="fc3"
        d="M 1360 800 Q 1360 846 1404 850 Q 1448 846 1448 800 Z"
      />
      <ellipse className="fb3" cx={1404} cy={800} rx={44} ry={8} />
      <g className="sa3" strokeWidth="2">
        {[-10, -5, 0, 5, 10].map((d) => (
          <line key={d} x1={1490 + d} y1={812} x2={1490 + d * 0.4} y2={850} />
        ))}
      </g>
      <rect className="fa3" x={1484} y={850} width={12} height={22} />
      <g className="sb2" fill="none" strokeWidth="3" strokeLinecap="round">
        <path
          className="amb-steam-line"
          d="M 1394 786 q -10 -18 0 -36 q 10 -18 0 -36"
        />
        <path
          className="amb-steam-line"
          d="M 1414 786 q -10 -22 0 -44 q 10 -22 0 -44"
        />
      </g>
    </Art>
  );
}

/* ── 田んぼ Rice terraces with dragonflies ──────────────────────── */

export function Tanbo() {
  const bands = [
    [700, 0.05, "fb1"],
    [740, 0.08, "fb2"],
    [784, 0.08, "fb1"],
    [828, 0.1, "fb2"],
    [866, 0.1, "fb1"],
  ] as const;
  return (
    <Art>
      <path
        className="fa1"
        d="M 0 690 Q 300 610 640 660 Q 1000 700 1300 630 Q 1480 600 1600 640 L 1600 900 L 0 900 Z"
      />
      {bands.map(([y, , tone], i) => (
        <g key={y}>
          <path
            className={tone}
            d={`M 0 ${y} Q 400 ${y - 26 + i * 4} 800 ${y + 6} T 1600 ${y - 4} L 1600 900 L 0 900 Z`}
          />
          <path
            className="sa2"
            fill="none"
            strokeWidth="2"
            d={`M 0 ${y} Q 400 ${y - 26 + i * 4} 800 ${y + 6} T 1600 ${y - 4}`}
          />
        </g>
      ))}
      <g className="sa3" strokeWidth="2">
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1={20 + i * 40} y1={884} x2={22 + i * 40} y2={872} />
        ))}
      </g>
      <path className="fa3" d="M 120 640 L 190 590 L 260 640 Z" />
      <rect className="fa2" x={140} y={640} width={100} height={40} />
      <g className="sa3" strokeWidth="5" strokeLinecap="round">
        <line x1={1430} y1={700} x2={1430} y2={800} />
        <line x1={1390} y1={730} x2={1470} y2={730} />
      </g>
      <path className="fa3" d="M 1400 702 L 1430 680 L 1460 702 Z" />
      {[0, 1, 2].map((i) => (
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
            <ellipse cx={-1} cy={6} rx={3} ry={8} transform="rotate(70 -1 6)" />
            <ellipse
              cx={4}
              cy={-6}
              rx={3}
              ry={7}
              transform="rotate(-110 4 -6)"
            />
            <ellipse cx={4} cy={6} rx={3} ry={7} transform="rotate(110 4 6)" />
          </g>
        </g>
      ))}
    </Art>
  );
}

/* ── 合掌造り Snowy thatched village ─────────────────────────────── */

export function Gassho() {
  const houses: [number, number, number][] = [
    [80, 300, 560],
    [1240, 220, 600],
    [1420, 260, 580],
  ];
  return (
    <>
      <Art>
        <path
          className="fa1"
          d="M 0 640 Q 260 520 520 610 Q 800 700 1100 590 Q 1350 500 1600 600 L 1600 900 L 0 900 Z"
        />
        {houses.map(([x, w, peak]) => {
          const base = 790;
          const cx = x + w / 2;
          return (
            <g key={x}>
              <rect
                className="fa3"
                x={x + 14}
                y={base}
                width={w - 28}
                height={80}
              />
              <path
                className="fa2"
                d={`M ${x} ${base} L ${cx} ${peak} L ${x + w} ${base} Z`}
              />
              <path
                className="fb3"
                d={`M ${x + 6} ${base - 6} L ${cx} ${peak} L ${x + w - 6} ${base - 6} L ${x + w - 30} ${base - 6} L ${cx} ${peak + 40} L ${x + 30} ${base - 6} Z`}
              />
              <g className="fc4">
                <rect x={cx - 40} y={base + 24} width={18} height={16} />
                <rect x={cx + 22} y={base + 24} width={18} height={16} />
                <rect x={cx - 9} y={base - 70} width={18} height={14} />
              </g>
            </g>
          );
        })}
        <path
          className="fb2"
          d="M 0 862 Q 400 836 800 858 T 1600 850 L 1600 900 L 0 900 Z"
        />
      </Art>
      <div className="amb-particles">
        {particles({
          count: 16,
          seed: 223,
          className: "amb-p--snow fall",
          duration: [14, 24],
          size: [0.25, 0.5],
          opacity: [0.22, 0.4],
        })}
      </div>
    </>
  );
}

/* ── 横丁 Neon alley ─────────────────────────────────────────────── */

function Sign({
  x,
  y,
  h,
  chars,
  tone,
  flicker,
}: {
  x: number;
  y: number;
  h: number;
  chars: string[];
  tone: "a" | "b" | "c";
  flicker?: boolean;
}) {
  const step = h / (chars.length + 0.6);
  return (
    <g className={flicker ? "amb-flicker" : undefined}>
      <rect
        className={`f${tone}1 s${tone}3`}
        x={x}
        y={y}
        width={64}
        height={h}
        rx={6}
        strokeWidth={3}
      />
      {chars.map((ch, i) => (
        <text
          key={i}
          className={`amb-glyph g${tone}`}
          x={x + 32}
          y={y + step * (i + 0.8)}
          fontSize={38}
        >
          {ch}
        </text>
      ))}
    </g>
  );
}

export function Neon({ glyphs }: SceneProps) {
  const word = pick(glyphs, "夢", Math.max(1, [...(glyphs ?? "")].length || 1));
  return (
    <Art>
      <rect className="fd" x={0} y={0} width={280} height={900} />
      <rect className="fd" x={1320} y={0} width={280} height={900} />
      <Sign
        x={60}
        y={180}
        h={300}
        chars={word.length >= 2 ? word : ["夢", "横", "丁"]}
        tone="c"
      />
      <Sign
        x={170}
        y={330}
        h={250}
        chars={["居", "酒", "屋"]}
        tone="a"
        flicker
      />
      <Sign
        x={1356}
        y={210}
        h={330}
        chars={["カ", "ラ", "オ", "ケ"]}
        tone="b"
      />
      <Sign
        x={1470}
        y={170}
        h={260}
        chars={word.length >= 2 ? ["喫", "茶"] : [word[0]!, "灯"]}
        tone="c"
      />
      <g className="sa2" fill="none" strokeWidth="2">
        <path d="M 0 140 Q 140 180 280 150 M 0 120 Q 160 150 300 110" />
        <path d="M 1300 120 Q 1460 160 1600 130 M 1320 150 Q 1460 190 1600 160" />
      </g>
      <g className="amb-puddle">
        <ellipse className="fc1" cx={130} cy={872} rx={110} ry={16} />
        <ellipse className="fa1" cx={210} cy={884} rx={70} ry={10} />
        <ellipse className="fb1" cx={1400} cy={876} rx={120} ry={16} />
        <ellipse className="fc1" cx={1500} cy={888} rx={60} ry={9} />
      </g>
    </Art>
  );
}

/* ── 鯉のぼり Carp streamers ──────────────────────────────────────── */

function Streamer({ y, len, tone }: { y: number; len: number; tone: string }) {
  const x1 = 1520;
  const x0 = x1 - len;
  const h = len * 0.2;
  return (
    <g
      className="amb-flutter"
      style={{ animationDelay: `${(-y / 90).toFixed(2)}s` }}
    >
      <path
        className={tone}
        d={`M ${x1} ${y - h / 2} Q ${x0 + len * 0.5} ${y - h * 0.62} ${x0 + 24} ${y - h * 0.3} L ${x0} ${y - h * 0.5} L ${x0 + 14} ${y} L ${x0} ${y + h * 0.5} L ${x0 + 24} ${y + h * 0.3} Q ${x0 + len * 0.5} ${y + h * 0.62} ${x1} ${y + h / 2} Z`}
      />
      <g className="sb2" fill="none" strokeWidth="2">
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d={`M ${x0 + 60 + (i * (len - 120)) / 5} ${y - h * 0.35} q 14 ${h * 0.35} 0 ${h * 0.7}`}
          />
        ))}
      </g>
      <circle className="fb3" cx={x1 - 30} cy={y - h * 0.12} r={h * 0.16} />
      <circle className="fd" cx={x1 - 30} cy={y - h * 0.12} r={h * 0.07} />
    </g>
  );
}

export function Koinobori() {
  return (
    <Art>
      <g className="fb1">
        <ellipse cx={160} cy={300} rx={180} ry={30} />
        <ellipse cx={260} cy={350} rx={140} ry={22} />
      </g>
      <rect className="fb3" x={1520} y={140} width={8} height={760} />
      <g className="amb-pinwheel" transform="translate(1524 134)">
        <g className="sb3" strokeWidth="4">
          <line x1={-22} y1={0} x2={22} y2={0} />
          <line x1={0} y1={-22} x2={0} y2={22} />
          <line x1={-16} y1={-16} x2={16} y2={16} />
          <line x1={-16} y1={16} x2={16} y2={-16} />
        </g>
      </g>
      <g className="amb-flutter">
        <path
          className="fc2"
          d="M 1520 160 Q 1430 156 1340 172 L 1340 184 Q 1430 170 1520 176 Z"
        />
        <path
          className="fa2"
          d="M 1520 176 Q 1440 174 1360 192 L 1360 202 Q 1440 188 1520 190 Z"
        />
      </g>
      <Streamer y={250} len={250} tone="fa3" />
      <Streamer y={360} len={220} tone="fc3" />
      <Streamer y={460} len={190} tone="fb3" />
      <path className="fa2" d="M 0 860 L 80 820 L 520 820 L 600 860 Z" />
      <path className="fa2" d="M 600 900 L 640 870 L 900 870 L 940 900 Z" />
      <rect className="fa2" x={20} y={860} width={560} height={40} />
    </Art>
  );
}

/* ── 月見 Moon viewing ────────────────────────────────────────────── */

function Susuki({ x, flip, seed }: { x: number; flip: boolean; seed: number }) {
  const r = seeded(seed);
  return (
    <g transform={flip ? `translate(${x * 2} 0) scale(-1 1)` : undefined}>
      <g className="amb-sway">
        {Array.from({ length: 7 }, (_, i) => {
          const bx = x + i * 14;
          const top = 560 + r() * 140;
          const bend = 50 + r() * 80;
          const tx = bx + bend;
          return (
            <g key={i}>
              <path
                className="sa2"
                fill="none"
                strokeWidth="2.5"
                d={`M ${bx} 900 Q ${bx + 6} ${(top + 900) / 2} ${tx} ${top}`}
              />
              <g className="sb3" strokeWidth="2" strokeLinecap="round">
                {Array.from({ length: 6 }, (_, k) => (
                  <line
                    key={k}
                    x1={tx - k * 5}
                    y1={top + k * 9}
                    x2={tx - k * 5 + 16}
                    y2={top + k * 9 - 14}
                  />
                ))}
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export function Tsukimi() {
  return (
    <Art>
      <circle className="fb1" cx={1380} cy={270} r={175} />
      <circle className="fb3" cx={1380} cy={270} r={92} />
      <g className="fa1">
        <ellipse cx={1356} cy={256} rx={22} ry={14} />
        <ellipse cx={1404} cy={292} rx={16} ry={10} />
      </g>
      <g className="amb-cloud fa1">
        <rect x={1200} y={318} width={300} height={16} rx={8} />
        <rect x={1290} y={344} width={240} height={12} rx={6} />
      </g>
      <Susuki x={40} flip={false} seed={241} />
      <Susuki x={1440} flip seed={243} />
      <path className="fa3" d="M 300 870 L 440 870 L 430 846 L 310 846 Z" />
      <rect className="fa2" x={320} y={870} width={100} height={30} />
      <g className="fb3">
        {[
          [330, 830],
          [358, 830],
          [386, 830],
          [414, 830],
          [344, 806],
          [372, 806],
          [400, 806],
          [358, 782],
          [386, 782],
          [372, 758],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={13} />
        ))}
      </g>
      <g className="fa2">
        <ellipse cx={1250} cy={870} rx={34} ry={22} />
        <circle cx={1276} cy={842} r={14} />
        <ellipse
          cx={1272}
          cy={812}
          rx={5}
          ry={20}
          transform="rotate(-10 1272 812)"
        />
        <ellipse
          cx={1284}
          cy={814}
          rx={5}
          ry={18}
          transform="rotate(14 1284 814)"
        />
      </g>
    </Art>
  );
}

/* ── 浮世絵 Woodblock wave (original design) ─────────────────────── */

export function Ukiyoe() {
  const foam: ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const a = Math.PI * (1.05 + t * 0.95);
    foam.push(
      <circle
        key={i}
        cx={(330 + Math.cos(a) * 150).toFixed(1)}
        cy={(640 + Math.sin(a) * 120).toFixed(1)}
        r={8 - t * 3}
      />,
    );
  }
  return (
    <Art>
      <g className="amb-bob">
        <path
          className="fb3"
          d="M 0 900 L 0 700 Q 60 560 230 520 Q 400 490 470 600 Q 500 650 470 690 Q 430 640 380 650 Q 330 670 360 740 Q 420 820 600 860 L 640 900 Z"
        />
        <path
          className="fb1"
          d="M 40 900 Q 120 760 260 700 Q 300 690 320 720 Q 260 780 280 900 Z"
        />
        <g className="fa3">{foam}</g>
        <path
          className="sa3"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          d="M 470 690 q -14 -24 -36 -30 M 452 672 q -6 -16 -20 -22 M 470 640 q -10 -10 -24 -10"
        />
      </g>
      <g className="fb2">
        <path d="M 700 900 Q 760 846 820 860 Q 860 870 850 900 Z" />
        <path d="M 900 900 Q 980 830 1060 850 Q 1110 868 1096 900 Z" />
      </g>
      <path className="fa2" d="M 1250 840 L 1360 750 L 1400 750 L 1520 840 Z" />
      <path
        className="fa3"
        d="M 1328 776 L 1360 750 L 1400 750 L 1432 776 L 1414 786 L 1396 774 L 1380 788 L 1364 774 L 1346 786 Z"
      />
      <g
        className="amb-cloud sa2"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <rect x={1160} y={196} width={300} height={26} rx={13} />
        <rect x={1260} y={236} width={260} height={22} rx={11} />
      </g>
    </Art>
  );
}
