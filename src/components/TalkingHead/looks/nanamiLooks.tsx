import type { LookLayerProps } from "./types";

/**
 * Nanami's looks. The face shape, ears, neck, eyes, nose and mouth are drawn
 * by NanamiHead and never change — these only paint hair, clothing and
 * accessories around them (see LookLayer for the paint order).
 *
 * Coordinates share NanamiHead's viewBox (0 0 100 110): face ellipse
 * x25–75 / y25–83, eyes y48, brows y40, mouth y67, collar from y78.
 */

/* ── shared pieces ──────────────────────────────────────────────── */

/** The original long hair mass behind the head. */
function LongBack({ color, shade }: { color: string; shade: string }) {
  return (
    <>
      <ellipse cx="50" cy="42" rx="34" ry="36" fill={color} />
      <ellipse cx="50" cy="28" rx="28" ry="18" fill={shade} />
    </>
  );
}

/** Hair cap framing the face down to the temples. */
function HairCap({ color }: { color: string }) {
  return (
    <path
      d="M25 50 Q22 20 50 16 Q78 20 75 50 Q68 34 50 32 Q32 34 25 50 Z"
      fill={color}
    />
  );
}

/** The original soft side-swept fringe. */
function SweptFringe({ color }: { color: string }) {
  return (
    <path
      d="M26 46 Q38 30 56 28 Q70 28 76 42 Q64 36 48 38 Q34 42 26 46 Z"
      fill={color}
    />
  );
}

/** The three-layer kimono collar V (inner, middle, outer). */
function KimonoCollar({
  inner,
  middle,
  outer,
}: {
  inner: string;
  middle: string;
  outer: string;
}) {
  return (
    <>
      <path d="M41 82 L44 94 Q50 100 56 94 L59 82 Q50 90 41 82 Z" fill={inner} />
      <path d="M39 80 L42 90 Q50 96 58 90 L61 80 Q50 88 39 80 Z" fill={middle} />
      <path d="M37 78 L40 86 Q50 92 60 86 L63 78 Q50 86 37 78 Z" fill={outer} />
    </>
  );
}

const WIDE_BODY = "M16 110 Q21 86 37 81 Q50 88 63 81 Q79 86 84 110 Z";

/* ── 1. Kimono — the original portrait ──────────────────────────── */

export function NanamiKimono({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return <LongBack color="#2c252c" shade="#241e24" />;
    case "outfit":
      return (
        <>
          <path
            d="M18 110 Q24 84 38 80 Q50 86 62 80 Q76 84 82 110 Z"
            fill="#c43a2f"
          />
          <g>
            <circle cx="32" cy="98" r="4.2" fill="#f7f2ea" />
            <circle cx="32" cy="98" r="1.6" fill="#e8c84a" />
            <circle cx="28" cy="94" r="1.8" fill="#f7f2ea" />
            <circle cx="36" cy="94" r="1.8" fill="#f7f2ea" />
            <circle cx="28" cy="102" r="1.6" fill="#f7f2ea" />
            <circle cx="36" cy="102" r="1.6" fill="#f7f2ea" />
          </g>
          <g>
            <circle cx="68" cy="97" r="3.6" fill="#7ec8d8" />
            <circle cx="68" cy="97" r="1.4" fill="#f7f2ea" />
            <circle cx="64" cy="93" r="1.5" fill="#7ec8d8" />
            <circle cx="72" cy="93" r="1.5" fill="#7ec8d8" />
          </g>
          <circle cx="54" cy="105" r="2.0" fill="#e8a0a8" />
          <circle cx="76" cy="106" r="1.6" fill="#e8a0a8" />
          <KimonoCollar inner="#f3eee6" middle="#1a5c56" outer="#b83228" />
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#322b32" />
          <SweptFringe color="#2a232a" />
          <path
            d="M38 26 Q48 22 60 26"
            stroke="#1a151a"
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      );
    default:
      return null;
  }
}

/* ── 2. Yukata — hair up in a bun with a kanzashi ───────────────── */

function Asagao({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#f4f1ea" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#b9c8ea" />
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#f4f1ea" />
    </g>
  );
}

export function NanamiYukata({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <>
          <ellipse cx="50" cy="15" rx="14" ry="10" fill="#241e24" />
          <path d="M40 12 Q50 6 60 12" stroke="#3a323a" strokeWidth="1" fill="none" />
        </>
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#2a3f6e" />
          <Asagao cx={29} cy={97} r={4.4} />
          <Asagao cx={71} cy={99} r={4} />
          <Asagao cx={57} cy={106} r={2.8} />
          <g stroke="#6f8a5a" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <path d="M33 101 q4 3 7 1" />
            <path d="M67 103 q-4 3 -8 1" />
          </g>
          <KimonoCollar inner="#f3eee6" middle="#f3eee6" outer="#1f2f55" />
        </>
      );
    case "face":
      return (
        <>
          <path
            d="M26 46 Q23 20 50 17 Q77 20 74 46 Q70 32 50 30 Q30 32 26 46 Z"
            fill="#322b32"
          />
          <SweptFringe color="#2a232a" />
        </>
      );
    case "top":
      return (
        <>
          <path d="M58 13 L77 5" stroke="#c8a040" strokeWidth="1.4" strokeLinecap="round" />
          <g fill="#f0a0b4">
            <circle cx="60" cy="10" r="2" />
            <circle cx="63.4" cy="11.8" r="2" />
            <circle cx="62.6" cy="15.4" r="2" />
            <circle cx="58.8" cy="16" r="2" />
            <circle cx="57" cy="12.8" r="2" />
          </g>
          <circle cx="60.2" cy="13.2" r="1.2" fill="#e8c84a" />
          <path d="M62 16 L63 22 M64.5 15 L66 21" stroke="#c8a040" strokeWidth="0.6" />
          <circle cx="63" cy="22.4" r="0.9" fill="#e84a5a" />
          <circle cx="66" cy="21.4" r="0.9" fill="#e84a5a" />
        </>
      );
    default:
      return null;
  }
}

/* ── 3. Office — sleek ponytail, blazer, pearl studs ────────────── */

export function NanamiOffice({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M60 26 Q86 34 82 66 Q80 84 70 94 Q74 72 68 52 Q66 38 60 26 Z"
          fill="#2e2428"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#25304a" />
          <path d="M40 81 L50 99 L60 81 Q50 88 40 81 Z" fill="#f7f5f0" />
          <g stroke="#19213a" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M37 82 L46 100 L44 110" />
            <path d="M63 82 L54 100 L56 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M41 80.5 L49 90 L44.5 92.5 L38.5 84 Z" fill="#ffffff" />
          <path d="M59 80.5 L51 90 L55.5 92.5 L61.5 84 Z" fill="#ffffff" />
        </>
      );
    case "face":
      return (
        <>
          <path
            d="M26 45 Q23 19 50 17 Q77 19 74 45 Q70 30 50 28.5 Q30 30 26 45 Z"
            fill="#382c32"
          />
          <path
            d="M26 45 Q32 28 58 27 Q46 31 40 39 Q32 40 26 45 Z"
            fill="#2e2428"
          />
          <path
            d="M44 21 Q56 19 68 26"
            stroke="#4a3c42"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "top":
      return (
        <>
          <circle cx="24" cy="62" r="1.4" fill="#f6f2ea" />
          <circle cx="76" cy="62" r="1.4" fill="#f6f2ea" />
        </>
      );
    default:
      return null;
  }
}

/* ── 4. Bob — brown bob with blunt bangs, mustard cardigan ──────── */

export function NanamiBob({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M18 60 Q15 20 50 13 Q85 20 82 60 Q82 72 75 77 L25 77 Q18 72 18 60 Z"
          fill="#4f3322"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#d9a441" />
          <path d="M43 84 L50 110 L57 84 Z" fill="#fbfaf6" />
          <g stroke="#b88830" strokeWidth="1" fill="none">
            <path d="M43 84 L49.5 110" />
            <path d="M57 84 L50.5 110" />
          </g>
          <g fill="#8a6428">
            <circle cx="48.6" cy="98" r="0.9" />
            <circle cx="47.6" cy="105" r="0.9" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M50 86 Q41 94 36 84.5 Q43 80.5 50 86 Z" fill="#fbfaf6" />
          <path d="M50 86 Q59 94 64 84.5 Q57 80.5 50 86 Z" fill="#fbfaf6" />
        </>
      );
    case "face":
      return (
        <>
          <path
            d="M24.5 58 Q20 19 50 14.5 Q80 19 75.5 58 Q74 44 70 38 Q50 34 30 38 Q26 44 24.5 58 Z"
            fill="#5a3a28"
          />
          <path
            d="M26 40 Q29 21 50 19.5 Q71 21 74 40 L74 37.4 Q62 36.4 50 36.8 Q38 36.4 26 37.4 Z"
            fill="#4f3322"
          />
          <g stroke="#6a4832" strokeWidth="0.8" opacity="0.7">
            <path d="M36 25 L35 36.5" />
            <path d="M44 22 L43.6 36.6" />
            <path d="M56 22 L56.4 36.6" />
            <path d="M64 25 L65 36.5" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 5. Twin tails — ribbons, lavender sweater ──────────────────── */

function Ribbon({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M${cx} ${cy} L${cx - 6} ${cy - 3.5} L${cx - 6} ${cy + 3.5} Z`}
        fill="#e86a8a"
      />
      <path
        d={`M${cx} ${cy} L${cx + 6} ${cy - 3.5} L${cx + 6} ${cy + 3.5} Z`}
        fill="#e86a8a"
      />
      <circle cx={cx} cy={cy} r="1.8" fill="#d04e70" />
    </g>
  );
}

export function NanamiTwinTails({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <>
          <ellipse cx="50" cy="36" rx="28" ry="24" fill="#231d29" />
          <path d="M26 30 Q8 46 11 76 Q13 90 21 98 Q18 76 27 54 Z" fill="#2a2230" />
          <path d="M74 30 Q92 46 89 76 Q87 90 79 98 Q82 76 73 54 Z" fill="#2a2230" />
        </>
      );
    case "outfit":
      return (
        <>
          <path d="M18 110 Q22 88 38 83 Q50 89 62 83 Q78 88 82 110 Z" fill="#b9a6d9" />
          <g stroke="#a390c7" strokeWidth="0.8" opacity="0.8">
            <path d="M30 96 L30 110" />
            <path d="M70 96 L70 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <path d="M39.5 83.5 Q50 91 60.5 83.5 L61.5 87 Q50 95.5 38.5 87 Z" fill="#a390c7" />
      );
    case "face":
      return (
        <>
          <HairCap color="#2a2230" />
          <path
            d="M26 45 Q30 26 50 24 Q70 26 74 45 Q70 38 64 37 Q60 40 56 36 Q50 40 44 36 Q40 40 36 37 Q30 38 26 45 Z"
            fill="#231d29"
          />
        </>
      );
    case "top":
      return (
        <>
          <Ribbon cx={25} cy={30} />
          <Ribbon cx={75} cy={30} />
        </>
      );
    default:
      return null;
  }
}

/* ── 6. Wavy — long chestnut waves, glasses, cream turtleneck ───── */

export function NanamiWavy({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M18 50 Q14 16 50 12 Q86 16 82 50 Q88 68 81 84 Q86 94 79 104 L21 104 Q14 94 19 84 Q12 68 18 50 Z"
          fill="#5e3822"
        />
      );
    case "outfit":
      return <path d={WIDE_BODY} fill="#efe6d6" />;
    case "collar":
      return (
        <>
          <path d="M41.5 80 Q50 84.5 58.5 80 L59.5 90 Q50 94.5 40.5 90 Z" fill="#e2d6c0" />
          <g stroke="#d2c4aa" strokeWidth="0.55">
            <path d="M44.5 81.6 L44 91.6" />
            <path d="M47.3 82.3 L47.1 92.6" />
            <path d="M50 82.6 L50 93" />
            <path d="M52.7 82.3 L52.9 92.6" />
            <path d="M55.5 81.6 L56 91.6" />
          </g>
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#6b4028" />
          <path
            d="M25.5 49 Q28 30 44 26 Q62 23 73 34 Q76 40 75 49 Q71 38 60 35.5 Q48 35.5 40 41 Q31 44 25.5 49 Z"
            fill="#5e3822"
          />
          <g stroke="#80502f" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M40 22 Q50 18 60 21" />
            <path d="M28 44 Q30 36 36 32" />
          </g>
        </>
      );
    case "top":
      return (
        <>
          <g stroke="#7a2e2e" strokeWidth="1.2" fill="none">
            <rect x="32.3" y="42.6" width="13.4" height="10.8" rx="3.2" />
            <rect x="54.3" y="42.6" width="13.4" height="10.8" rx="3.2" />
            <path d="M45.7 46.6 Q50 45 54.3 46.6" />
            <path d="M32.3 45.5 L26 44.6" />
            <path d="M67.7 45.5 L74 44.6" />
          </g>
          <g fill="#ffffff" opacity="0.22">
            <path d="M34 44 L38 44 L35 51 L34 51 Z" />
            <path d="M56 44 L60 44 L57 51 L56 51 Z" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 7. Haori — purple kimono under a black haori, gold hair clip ── */

export function NanamiHaori({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return <LongBack color="#221c22" shade="#1b161b" />;
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#5b3a7a" />
          <KimonoCollar inner="#f3eee6" middle="#c8a040" outer="#4c2f68" />
          <path d="M16 110 Q21 86 35 81.5 L44 110 Z" fill="#2a2530" />
          <path d="M84 110 Q79 86 65 81.5 L56 110 Z" fill="#2a2530" />
          <g fill="#f3eee6">
            <circle cx="30" cy="94" r="2.4" />
            <circle cx="70" cy="94" r="2.4" />
          </g>
          <g stroke="#f3eee6" strokeWidth="0.5" fill="none">
            <circle cx="30" cy="94" r="1.4" />
            <circle cx="70" cy="94" r="1.4" />
          </g>
          <path d="M43 103 Q50 106 57 103" stroke="#f3eee6" strokeWidth="1.2" fill="none" />
          <circle cx="42.5" cy="103" r="1.6" fill="#f3eee6" />
          <circle cx="57.5" cy="103" r="1.6" fill="#f3eee6" />
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#2a2226" />
          <path
            d="M74 46 Q62 30 44 28 Q30 28 24.5 42 Q36 36 52 38 Q66 42 74 46 Z"
            fill="#221c22"
          />
        </>
      );
    case "top":
      return (
        <>
          <path d="M65 31 L74.5 35.5" stroke="#c8a040" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="64.5" cy="30.8" r="1.8" fill="#e8c84a" />
        </>
      );
    default:
      return null;
  }
}

/* ── 8. Marinière — auburn with headband, striped boat-neck ─────── */

export function NanamiMariniere({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M20 56 Q16 19 50 14 Q84 19 80 56 Q82 76 72 85 L28 85 Q18 76 20 56 Z"
          fill="#7a3220"
        />
      );
    case "outfit":
      return (
        <>
          <defs>
            <clipPath id="th-look-nanami-mariniere-body">
              <path d="M16 110 Q20 88 34 84 Q50 88 66 84 Q80 88 84 110 Z" />
            </clipPath>
          </defs>
          <path d="M16 110 Q20 88 34 84 Q50 88 66 84 Q80 88 84 110 Z" fill="#f5f3ee" />
          <g clipPath="url(#th-look-nanami-mariniere-body)" fill="#27365e">
            <rect x="10" y="90" width="80" height="2.6" />
            <rect x="10" y="96" width="80" height="2.6" />
            <rect x="10" y="102" width="80" height="2.6" />
            <rect x="10" y="108" width="80" height="2.6" />
          </g>
        </>
      );
    case "collar":
      return (
        <path
          d="M34 84 Q50 90 66 84"
          stroke="#e4e0d6"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "face":
      return (
        <>
          <HairCap color="#8a3a22" />
          <path
            d="M26 47 Q30 28 50 26 Q70 28 74 47 Q68 34 50 32 Q32 34 26 47 Z"
            fill="#7a3220"
          />
        </>
      );
    case "top":
      return (
        <path
          d="M25.2 44 Q23 17 50 15.5 Q77 17 74.8 44"
          stroke="#e9e2d2"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

/* ── 9. Pixie — short cut, gold hoops, black top with pendant ───── */

export function NanamiPixie({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return <path d="M17 110 Q21 88 36 83 Q50 90 64 83 Q79 88 83 110 Z" fill="#1c1c22" />;
    case "collar":
      return (
        <>
          <path
            d="M36 83.5 Q50 91 64 83.5"
            stroke="#2c2c34"
            strokeWidth="1.4"
            fill="none"
          />
          <path d="M41 84 Q50 97 59 84" stroke="#d4a840" strokeWidth="0.6" fill="none" />
          <circle cx="50" cy="93.6" r="1.5" fill="#d4a840" />
        </>
      );
    case "face":
      return (
        <>
          <path
            d="M24.5 52 Q20 17 50 14 Q80 17 75.5 52 Q74 41 70 37 Q60 31 50 34 Q42 31 34 38 Q28 42 24.5 52 Z"
            fill="#221c20"
          />
          <path d="M29 42 Q35 25 58 23 Q51 29 47 38.5 Q40 34 29 42 Z" fill="#1a1518" />
          <g stroke="#3a3036" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <path d="M40 19 Q50 16 60 19" />
            <path d="M66 24 Q71 30 72 38" />
          </g>
        </>
      );
    case "top":
      return (
        <g stroke="#d4a840" strokeWidth="1.1" fill="none">
          <circle cx="23.6" cy="64" r="3.2" />
          <circle cx="76.4" cy="64" r="3.2" />
        </g>
      );
    default:
      return null;
  }
}

/* ── 10. Beret — long dark hair, red beret, trench coat ─────────── */

export function NanamiBeret({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return <LongBack color="#2c252c" shade="#241e24" />;
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#c8a878" />
          <path d="M42 82 L50 100 L58 82 Q50 88 42 82 Z" fill="#26262c" />
          <g fill="#8a6c44">
            <circle cx="40" cy="100" r="1" />
            <circle cx="60" cy="100" r="1" />
            <circle cx="41" cy="107" r="1" />
            <circle cx="59" cy="107" r="1" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M37 81 L47 97 L41 101 L32 88 Z" fill="#b39364" />
          <path d="M63 81 L53 97 L59 101 L68 88 Z" fill="#b39364" />
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#322b32" />
          <SweptFringe color="#2a232a" />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M21 32 Q19 13 48 9 Q80 9 81 25 Q81 33 71 33 Q52 25 31 35 Q23 38 21 32 Z"
            fill="#b0282e"
          />
          <path
            d="M24 31 Q40 22 60 22 Q72 23 78 27"
            stroke="#8e1f24"
            strokeWidth="0.9"
            fill="none"
            opacity="0.7"
          />
          <path d="M47 9.5 L48 5.5 L50 9.3 Z" fill="#8e1f24" />
        </>
      );
    default:
      return null;
  }
}

/* ════════════════ Set 2 (looks 11–20) ════════════════ */

/* ── 11. Miko — hime cut, white kosode with red under-collar ────── */

export function NanamiMiko({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return <LongBack color="#1c171c" shade="#161216" />;
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#f7f5f0" />
          <path d="M16 110 Q17 106 18 104 L82 104 Q83 106 84 110 Z" fill="#c43a2f" />
          <g stroke="#e4e0d6" strokeWidth="0.8" fill="none">
            <path d="M30 88 Q28 96 27 104" />
            <path d="M70 88 Q72 96 73 104" />
          </g>
          <KimonoCollar inner="#c43a2f" middle="#f7f5f0" outer="#ebe6dc" />
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#221c22" />
          <path
            d="M26 42 Q28 22 50 20 Q72 22 74 42 L74 37.6 Q62 36.6 50 37 Q38 36.6 26 37.6 Z"
            fill="#1c171c"
          />
          <path d="M25 40 L30.5 40 L30.5 70 Q28 72 25.5 70 Z" fill="#1c171c" />
          <path d="M75 40 L69.5 40 L69.5 70 Q72 72 74.5 70 Z" fill="#1c171c" />
        </>
      );
    case "top":
      return (
        <>
          <rect x="25.3" y="60" width="4.6" height="5" rx="0.6" fill="#f7f5f0" />
          <rect x="70.1" y="60" width="4.6" height="5" rx="0.6" fill="#f7f5f0" />
          <path d="M25.3 62.5 L29.9 62.5 M70.1 62.5 L74.7 62.5" stroke="#c43a2f" strokeWidth="0.7" />
        </>
      );
    default:
      return null;
  }
}

/* ── 12. Barista — polka-dot headscarf, brown apron ─────────────── */

export function NanamiBarista({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M22 50 Q20 22 50 16 Q80 22 78 50 Q78 64 70 70 L30 70 Q22 64 22 50 Z"
          fill="#4a3226"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#f6f4ee" />
          <path d="M34 92 L66 92 L67 110 L33 110 Z" fill="#7a5236" />
          <g stroke="#7a5236" strokeWidth="2" fill="none">
            <path d="M36 92 L41 82" />
            <path d="M64 92 L59 82" />
          </g>
          <path d="M40 98 L48 98 L48 104 L40 104 Z" fill="#6a4630" />
          <path d="M44 98 L44 104" stroke="#5a3a26" strokeWidth="0.6" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M41 80.5 L49 90 L44.5 92.5 L38.5 84 Z" fill="#ffffff" />
          <path d="M59 80.5 L51 90 L55.5 92.5 L61.5 84 Z" fill="#ffffff" />
        </>
      );
    case "face":
      return (
        <>
          <path d="M25 40 Q23.5 52 27 60 L30.5 40 Z" fill="#4a3226" />
          <path d="M75 40 Q76.5 52 73 60 L69.5 40 Z" fill="#4a3226" />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M23.5 41 Q21.5 14 50 12 Q78.5 14 76.5 41 Q70 31 50 30 Q30 31 23.5 41 Z"
            fill="#2f7a6a"
          />
          <g fill="#f4efe2">
            <circle cx="34" cy="22" r="1.3" />
            <circle cx="44" cy="17" r="1.3" />
            <circle cx="56" cy="17" r="1.3" />
            <circle cx="66" cy="22" r="1.3" />
            <circle cx="39" cy="27" r="1.3" />
            <circle cx="50" cy="23" r="1.3" />
            <circle cx="61" cy="27" r="1.3" />
            <circle cx="28" cy="31" r="1.3" />
            <circle cx="72" cy="31" r="1.3" />
          </g>
          <path d="M50 12.5 L43 5 L47 12 Z" fill="#276a5c" />
          <path d="M50 12.5 L57 5 L53 12 Z" fill="#276a5c" />
          <circle cx="50" cy="12.5" r="2.2" fill="#276a5c" />
        </>
      );
    default:
      return null;
  }
}

/* ── 13. Doctor — centre part, white coat, stethoscope ──────────── */

export function NanamiDoctor({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M20 52 Q17 20 50 14 Q83 20 80 52 Q81 70 74 80 L26 80 Q19 70 20 52 Z"
          fill="#33262a"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#f5f6f7" />
          <path d="M41 81 L50 98 L59 81 Q50 88 41 81 Z" fill="#6fa8c8" />
          <g stroke="#d4d8dc" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M37 82 L46 100 L45 110" />
            <path d="M63 82 L54 100 L55 110" />
          </g>
          <rect x="60" y="99" width="9" height="5" rx="1" fill="#dfe6ee" />
          <path d="M61.5 101.5 L67.5 101.5" stroke="#6a8aa8" strokeWidth="0.8" />
        </>
      );
    case "collar":
      return (
        <>
          <g stroke="#3a3a44" strokeWidth="1.4" fill="none" strokeLinecap="round">
            <path d="M40 82 Q36 96 42 104" />
            <path d="M60 82 Q64 94 58 98" />
          </g>
          <circle cx="42.4" cy="105" r="2.4" fill="#c4c8cc" />
          <circle cx="42.4" cy="105" r="1.2" fill="#8a9096" />
          <circle cx="57.6" cy="98.6" r="1" fill="#3a3a44" />
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#3a2a2e" />
          <path
            d="M25 48 Q26 30 44 27 L50 30 L56 27 Q74 30 75 48 Q70 36 56 33 L50 31 L44 33 Q30 36 25 48 Z"
            fill="#33262a"
          />
        </>
      );
    default:
      return null;
  }
}

/* ── 14. Harajuku — pastel pink space buns, star pins, badges ───── */

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} />;
}

export function NanamiHarajuku({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <>
          <circle cx="30" cy="17" r="9" fill="#e088aa" />
          <circle cx="70" cy="17" r="9" fill="#e088aa" />
          <path d="M26 13 Q30 10 34 13 M66 13 Q70 10 74 13" stroke="#f2a0c0" strokeWidth="1" fill="none" />
          <path
            d="M21 54 Q18 24 50 17 Q82 24 79 54 Q80 66 74 72 L26 72 Q20 66 21 54 Z"
            fill="#e088aa"
          />
        </>
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#a8e0cc" />
          <circle cx="30" cy="98" r="3" fill="#f2c84a" />
          <circle cx="70" cy="100" r="3" fill="#8ab4f0" />
          <circle cx="36" cy="105" r="2.4" fill="#f08aa8" />
          <path d="M28.6 98 L31.4 98" stroke="#b08a20" strokeWidth="0.7" />
        </>
      );
    case "collar":
      return (
        <path
          d="M38 83 Q50 91 62 83"
          stroke="#8ccab4"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "face":
      return (
        <>
          <HairCap color="#f2a0c0" />
          <path
            d="M26 44 Q29 24 50 22 Q71 24 74 44 L70 36 L66 40 L62 34 L57 39 L52 33 L47 39 L42 34 L37 40 L33 35 L29 41 Z"
            fill="#e893b6"
          />
        </>
      );
    case "top":
      return (
        <>
          <Star cx={35} cy={29} r={3.2} fill="#f2d24a" />
          <Star cx={67} cy={27} r={2.6} fill="#8ad0f0" />
        </>
      );
    default:
      return null;
  }
}

/* ── 15. Rock — layered black with a violet streak, studded jacket ─ */

export function NanamiRock({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M17 46 Q14 16 50 12 Q86 16 83 46 L86 70 L80 66 L82 88 L74 80 L72 94 L28 94 L26 80 L18 88 L20 66 L14 70 Z"
          fill="#18141a"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#1e1e24" />
          <path d="M40 82 Q50 88 60 82 L58 110 L42 110 Z" fill="#6a6a72" />
          <path d="M58 88 L66 110" stroke="#c8ccd2" strokeWidth="0.9" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M37 81 L46 94 L40 98 L31 87 Z" fill="#2c2c34" />
          <path d="M63 81 L54 94 L60 98 L69 87 Z" fill="#2c2c34" />
          <g fill="#c8ccd2">
            <circle cx="36" cy="87" r="0.8" />
            <circle cx="39" cy="91" r="0.8" />
            <circle cx="64" cy="87" r="0.8" />
            <circle cx="61" cy="91" r="0.8" />
          </g>
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#221c24" />
          <path
            d="M24.5 52 Q26 26 52 22 Q70 22 75 36 Q66 30 56 32 Q46 36 40 42 Q32 46 24.5 52 Z"
            fill="#18141a"
          />
          <path
            d="M50 24 Q42 30 36 40"
            stroke="#8a4ac8"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "top":
      return (
        <>
          <path d="M76 51 Q79 53 77 57" stroke="#c8ccd2" strokeWidth="1.1" fill="none" />
          <circle cx="24" cy="61.8" r="1" fill="#c8ccd2" />
        </>
      );
    default:
      return null;
  }
}

/* ── 16. Silver chignon — swept-back silver, pussy-bow blouse ──── */

export function NanamiChignon({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <>
          <ellipse cx="50" cy="36" rx="28" ry="24" fill="#a4a4ae" />
        </>
      );
    case "outfit":
      return <path d={WIDE_BODY} fill="#1f6b52" />;
    case "collar":
      return (
        <>
          <path d="M40 81 Q50 88 60 81 L60 85 Q50 92 40 85 Z" fill="#1a5a45" />
          <path d="M50 88 Q42 82 41 90 Q44 94 50 90 Z" fill="#237a5e" />
          <path d="M50 88 Q58 82 59 90 Q56 94 50 90 Z" fill="#237a5e" />
          <path d="M48.5 89.5 L45 104 L48.5 102 Z" fill="#1a5a45" />
          <path d="M51.5 89.5 L55 104 L51.5 102 Z" fill="#1a5a45" />
          <circle cx="50" cy="89" r="1.9" fill="#1a5a45" />
        </>
      );
    case "face":
      return (
        <>
          <path
            d="M25.5 48 Q23 20 50 16 Q77 20 74.5 48 Q70 34 58 31 Q46 30 36 36 Q29 40 25.5 48 Z"
            fill="#b8b8c2"
          />
          <g stroke="#9a9aa6" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M30 38 Q40 26 56 25 Q66 25 72 32" />
            <path d="M36 22 Q48 18 62 21" />
          </g>
        </>
      );
    case "top":
      return (
        <>
          <circle cx="24" cy="62.4" r="1" fill="#e8e0d0" />
          <circle cx="24" cy="65.4" r="1.6" fill="#f6f2ea" />
          <circle cx="76" cy="62.4" r="1" fill="#e8e0d0" />
          <circle cx="76" cy="65.4" r="1.6" fill="#f6f2ea" />
        </>
      );
    default:
      return null;
  }
}

/* ── 17. Snow day — knit earflap hat with pompom, red puffer ────── */

export function NanamiSnowDay({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M20 54 Q18 30 50 22 Q82 30 80 54 Q82 76 74 90 L26 90 Q18 76 20 54 Z"
          fill="#3a2a22"
        />
      );
    case "outfit":
      return (
        <>
          <path d="M14 110 Q19 85 36 80 Q50 86 64 80 Q81 85 86 110 Z" fill="#c83a36" />
          <g stroke="#a82e2a" strokeWidth="1.1" fill="none">
            <path d="M18 98 Q50 94 82 98" />
            <path d="M16 105 Q50 101 84 105" />
          </g>
          <path d="M50 88 L50 110" stroke="#a82e2a" strokeWidth="1.2" />
        </>
      );
    case "collar":
      return (
        <g fill="#efe8dc">
          <circle cx="36" cy="82" r="4" />
          <circle cx="42" cy="86" r="3.8" />
          <circle cx="50" cy="88" r="3.8" />
          <circle cx="58" cy="86" r="3.8" />
          <circle cx="64" cy="82" r="4" />
          <circle cx="31" cy="85" r="3.4" />
          <circle cx="69" cy="85" r="3.4" />
        </g>
      );
    case "face":
      return <SweptFringe color="#3a2a22" />;
    case "top":
      return (
        <>
          <path d="M23.5 42 Q21 13 50 10.5 Q79 13 76.5 42 Z" fill="#efe8dc" />
          <path
            d="M25 30 L30 25 L35 30 L40 25 L45 30 L50 25 L55 30 L60 25 L65 30 L70 25 L75 30"
            stroke="#c83a36"
            strokeWidth="1.6"
            fill="none"
          />
          <path d="M23.5 36 Q50 32 76.5 36 L76.8 42 Q50 38 23.2 42 Z" fill="#c83a36" />
          <path d="M23.5 40 L31 40 Q30 52 26.5 60 Q23 52 23.5 40 Z" fill="#efe8dc" />
          <path d="M76.5 40 L69 40 Q70 52 73.5 60 Q77 52 76.5 40 Z" fill="#efe8dc" />
          <g stroke="#e0d8c8" strokeWidth="1.2" strokeLinecap="round">
            <path d="M26.5 60 L26 70" />
            <path d="M73.5 60 L74 70" />
          </g>
          <circle cx="26" cy="71" r="1.8" fill="#c83a36" />
          <circle cx="74" cy="71" r="1.8" fill="#c83a36" />
          <circle cx="50" cy="9" r="5" fill="#c83a36" />
        </>
      );
    default:
      return null;
  }
}

/* ── 18. Sporty — baseball cap, ponytail through the back, track top */

export function NanamiSporty({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M56 20 Q76 14 84 30 Q88 46 80 60 Q78 48 72 40 Q66 30 56 28 Z"
          fill="#3a2a22"
        />
      );
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#ececf0" />
          <path d="M20 96 L28 84 L31 85 L23.5 99 Z" fill="#c8322e" />
          <path d="M80 96 L72 84 L69 85 L76.5 99 Z" fill="#c8322e" />
          <path d="M50 90 L50 110" stroke="#9aa0a8" strokeWidth="1" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M40 79 Q50 84 60 79 L61 88 Q50 93 39 88 Z" fill="#26446e" />
          <path d="M50 83.6 L50 92.6" stroke="#c8ccd2" strokeWidth="0.9" />
          <rect x="49" y="89" width="2" height="3" rx="0.6" fill="#c8ccd2" />
        </>
      );
    case "face":
      return (
        <>
          <path d="M25 40 Q24 50 27 56 L30 40 Z" fill="#3a2a22" />
          <path d="M75 40 Q76 50 73 56 L70 40 Z" fill="#3a2a22" />
          <path d="M36 35 Q42 41 47 35 Z" fill="#3a2a22" />
        </>
      );
    case "top":
      return (
        <>
          <path d="M24.5 37 Q22.5 13 50 11.5 Q77.5 13 75.5 37 Q50 30 24.5 37 Z" fill="#26446e" />
          <g stroke="#1d3658" strokeWidth="0.8" fill="none">
            <path d="M50 12 L50 32" />
            <path d="M37 15 Q34 24 34 34" />
            <path d="M63 15 Q66 24 66 34" />
          </g>
          <circle cx="50" cy="12" r="1.4" fill="#1d3658" />
          <path d="M24 36 Q50 28.5 76 36 Q73 40 60 38.6 Q50 37 40 38.6 Q27 40 24 36 Z" fill="#1d3658" />
          <path d="M45 20 L55 20 L55 25 L45 25 Z" fill="#ececf0" />
          <path d="M47 22.5 L53 22.5" stroke="#c8322e" strokeWidth="1.2" />
        </>
      );
    default:
      return null;
  }
}

/* ── 19. Flower crown — loose light curls, embroidered blouse ───── */

function Bloom({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="3" fill={fill} />
      <circle cx={cx} cy={cy} r="1.1" fill="#f2c84a" />
    </g>
  );
}

export function NanamiFlowerCrown({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <g fill="#a0704a">
          <path d="M18 50 Q15 18 50 13 Q85 18 82 50 Q86 72 80 94 L20 94 Q14 72 18 50 Z" />
          <circle cx="17" cy="60" r="5" />
          <circle cx="16" cy="74" r="5" />
          <circle cx="19" cy="88" r="5" />
          <circle cx="83" cy="60" r="5" />
          <circle cx="84" cy="74" r="5" />
          <circle cx="81" cy="88" r="5" />
        </g>
      );
    case "outfit":
      return (
        <>
          <path d="M14 110 Q19 88 33 85 Q50 92 67 85 Q81 88 86 110 Z" fill="#f6efe2" />
          <g stroke="#e4dac8" strokeWidth="0.8" fill="none">
            <path d="M30 96 Q29 103 30 110" />
            <path d="M70 96 Q71 103 70 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path
            d="M33 85 Q50 93 67 85"
            stroke="#efe6d6"
            strokeWidth="1.6"
            fill="none"
          />
          <g>
            <circle cx="38" cy="89.4" r="0.9" fill="#c83a36" />
            <circle cx="43" cy="91.2" r="0.9" fill="#3a6ab0" />
            <circle cx="50" cy="92" r="1.1" fill="#c83a36" />
            <circle cx="57" cy="91.2" r="0.9" fill="#3a6ab0" />
            <circle cx="62" cy="89.4" r="0.9" fill="#c83a36" />
          </g>
        </>
      );
    case "face":
      return (
        <>
          <HairCap color="#ad7c54" />
          <path
            d="M25 48 Q26 30 44 27 L50 30 L56 27 Q74 30 75 48 Q70 36 56 33 L50 31 L44 33 Q30 36 25 48 Z"
            fill="#a0704a"
          />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M24 36 Q34 20 50 19 Q66 20 76 36"
            stroke="#5a8a4a"
            strokeWidth="1.4"
            fill="none"
          />
          <g fill="#6a9a58">
            <ellipse cx="31" cy="27" rx="2.6" ry="1.2" transform="rotate(-40 31 27)" />
            <ellipse cx="45" cy="19.6" rx="2.6" ry="1.2" transform="rotate(-10 45 19.6)" />
            <ellipse cx="62" cy="21.4" rx="2.6" ry="1.2" transform="rotate(20 62 21.4)" />
            <ellipse cx="72" cy="30" rx="2.6" ry="1.2" transform="rotate(50 72 30)" />
          </g>
          <Bloom cx={26} cy={33} fill="#f2a0b4" />
          <Bloom cx={36} cy={24} fill="#f8f4ec" />
          <Bloom cx={50} cy={19.5} fill="#e87a8e" />
          <Bloom cx={64} cy={24} fill="#f8f4ec" />
          <Bloom cx={74} cy={33} fill="#f2a0b4" />
        </>
      );
    default:
      return null;
  }
}

/* ── 20. Side braid — braid over the shoulder, denim dungarees ──── */

export function NanamiSideBraid({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return <ellipse cx="50" cy="38" rx="29" ry="26" fill="#3a2a26" />;
    case "outfit":
      return (
        <>
          <path d={WIDE_BODY} fill="#f2c84a" />
          <path d="M37 94 L63 94 L64 110 L36 110 Z" fill="#4a6a90" />
          <g stroke="#4a6a90" strokeWidth="3" strokeLinecap="round">
            <path d="M39 95 L34 83" />
            <path d="M61 95 L66 83" />
          </g>
          <g fill="#d4a840">
            <circle cx="39.5" cy="96" r="1.2" />
            <circle cx="60.5" cy="96" r="1.2" />
          </g>
          <path d="M44 99 L56 99 L56 105 L44 105 Z" fill="#3e5c80" />
          <path d="M44 99 L56 99" stroke="#c9a15e" strokeWidth="0.6" strokeDasharray="1 0.8" />
        </>
      );
    case "collar":
      return (
        <path
          d="M40 82 Q50 89 60 82"
          stroke="#dcb03a"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "face":
      return (
        <>
          <HairCap color="#443230" />
          <path
            d="M25.5 48 Q28 28 50 26 Q66 26 74 38 Q60 32 48 36 Q34 40 25.5 48 Z"
            fill="#3a2a26"
          />
        </>
      );
    case "top":
      return (
        <>
          <path d="M26 44 Q22 54 26 62 L31 60 Q28 52 31 44 Z" fill="#3a2a26" />
          <g fill="#3a2a26" stroke="#2a1e1c" strokeWidth="0.6">
            <ellipse cx="28" cy="64" rx="4" ry="3.4" />
            <ellipse cx="29" cy="70" rx="3.8" ry="3.3" />
            <ellipse cx="30" cy="76" rx="3.6" ry="3.2" />
            <ellipse cx="31" cy="82" rx="3.4" ry="3.1" />
            <ellipse cx="32" cy="88" rx="3.2" ry="3" />
            <ellipse cx="33" cy="94" rx="3" ry="2.9" />
          </g>
          <rect x="30" y="97" width="6.4" height="3" rx="1.4" fill="#e86a5a" />
          <path d="M31 100 Q33.2 105 35.4 100 Z" fill="#3a2a26" />
        </>
      );
    default:
      return null;
  }
}
