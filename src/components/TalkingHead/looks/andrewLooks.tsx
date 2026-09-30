import type { LookLayerProps } from "./types";

/**
 * Andrew's looks. The face shape, ears, neck, eyes, nose and mouth are drawn
 * by AndrewHead and never change — these only paint hair, facial hair,
 * clothing and accessories around them (see LookLayer for the paint order).
 *
 * Coordinates share AndrewHead's viewBox (0 0 100 110): face x30–70,
 * forehead y22, eyes y48, mouth y70, chin y90, collar from y90.
 */

/* ── shared pieces ──────────────────────────────────────────────── */

const BEARD_PATH =
  "M30 52 Q28 70 36 84 Q44 94 50 94 Q56 94 64 84 Q72 70 70 52 Q68 60 62 62 Q56 64 50 64 Q44 64 38 62 Q32 60 30 52 Z";

const MOUSTACHE_PATH =
  "M50 63 Q42 60 36 62 Q34 65 38 66.5 Q44 68 50 66.5 Q56 68 62 66.5 Q66 65 64 62 Q58 60 50 63 Z";

/** Full beard with the skin gap under the lower lip. */
function FullBeard({ color }: { color: string }) {
  return (
    <>
      <path d={BEARD_PATH} fill={color} />
      <path d="M46 72 Q50 69 54 72 Q50 76 46 72 Z" fill="#edd0b0" />
    </>
  );
}

/** A few days' growth: the beard area as a faint shadow. */
function Stubble({ color }: { color: string }) {
  return (
    <>
      <path d={BEARD_PATH} fill={color} opacity="0.22" />
      <path d={MOUSTACHE_PATH} fill={color} opacity="0.2" />
    </>
  );
}

/** Plain crew-neck tee/sweater body. */
function CrewNeck({ color, rib }: { color: string; rib: string }) {
  return (
    <>
      <path d="M24 110 Q27 96 40 92 Q50 97 60 92 Q73 96 76 110 Z" fill={color} />
      <path
        d="M40 92 Q50 97 60 92"
        stroke={rib}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

/** Crew-neck band that sits over the neck base. */
function CrewCollar({ rib }: { rib: string }) {
  return (
    <path
      d="M40 92.5 Q50 99 60 92.5"
      stroke={rib}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
  );
}

/* ── 1. Classic — the original portrait ─────────────────────────── */

export function AndrewClassic({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <path
          d="M30 108 Q32 96 42 92 Q50 97 58 92 Q68 96 70 108 Z"
          fill="#6b6560"
        />
      );
    case "face":
      return <FullBeard color="#c9a15e" />;
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#c9a15e" />;
    case "top":
      return (
        <>
          <path
            d="M68 38 C72 28, 70 16, 60 10 C50 3, 36 2, 28 10 C22 16, 24 26, 28 34 C32 28, 42 24, 52 26 C60 28, 65 33, 68 38 Z"
            fill="#c9a15e"
          />
          <path
            d="M60 16 Q50 10 38 12"
            stroke="#b8925a"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M62 24 Q50 18 34 22"
            stroke="#b8925a"
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M58 12 C50 5, 38 5, 30 12 C34 8, 44 7, 52 11 C55 12, 57 12, 58 12 Z"
            fill="#d4b06e"
          />
        </>
      );
    default:
      return null;
  }
}

/* ── 2. Side part — clean-shaven, blazer and tie ────────────────── */

export function AndrewSidePart({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 96 38 91 L50 102 L62 91 Q77 96 80 110 Z" fill="#26334d" />
          <path d="M42 91 L50 104 L58 91 Z" fill="#f4f4f0" />
          <g stroke="#1a2338" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M38 91.5 L46 103 L43 110" />
            <path d="M62 91.5 L54 103 L57 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M41 90 L50 97 L46 101 Z" fill="#ffffff" />
          <path d="M59 90 L50 97 L54 101 Z" fill="#ffffff" />
          <path d="M48 97 L52 97 L51.4 100 L48.6 100 Z" fill="#8a2a2a" />
          <path d="M48.6 100 L51.4 100 L53 110 L47 110 Z" fill="#9c3030" />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M29 42 C27 26 32 14 44 11 C56 8 68 13 71 26 C72 32 71 37 70 41 C68 32 64 27 56 26 C48 25 43 24 39 22 C36 28 32 33 29 42 Z"
            fill="#4a3222"
          />
          <path d="M30 40 L33 40 L33 50 L30.5 50 Z" fill="#4a3222" />
          <path d="M70 40 L67 40 L67 50 L69.5 50 Z" fill="#4a3222" />
          <path
            d="M41.5 14 Q40.5 18 39.5 22"
            stroke="#2e1f15"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M44 16 Q56 13 66 22"
            stroke="#5e4130"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return null;
  }
}

/* ── 3. Hoodie — messy black hair, stubble ──────────────────────── */

export function AndrewHoodie({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q22 94 36 89 Q50 95 64 89 Q78 94 80 110 Z" fill="#7d8590" />
          <path
            d="M33 93 Q34 80 50 79 Q66 80 67 93 Q58 88 50 88 Q42 88 33 93 Z"
            fill="#666d77"
          />
        </>
      );
    case "collar":
      return (
        <>
          <path
            d="M37 92 Q50 101 63 92"
            stroke="#5c626b"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          <g stroke="#ecebe6" strokeWidth="1.1" strokeLinecap="round">
            <path d="M46 97 L45 107" />
            <path d="M54 97 L55 107" />
          </g>
        </>
      );
    case "face":
      return <Stubble color="#3a302a" />;
    case "top":
      return (
        <path
          d="M28 42 C24 24 34 9 50 8 C66 9 76 24 72 42 L69 32 L65 37 L61 28 L56 34 L51 26 L46 34 L41 27 L37 36 L33 30 L31 37 Z"
          fill="#1f1b1a"
        />
      );
    default:
      return null;
  }
}

/* ── 4. Ginger — curls, trimmed beard, flannel ──────────────────── */

export function AndrewGinger({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M22 110 Q25 95 38 91 Q50 97 62 91 Q75 95 78 110 Z" fill="#2f6b4a" />
          <path d="M44 92 L50 99 L56 92 Z" fill="#ecebe6" />
          <g stroke="#1f4a33" strokeWidth="1.6">
            <path d="M24 100 L76 100" />
            <path d="M23 106 L77 106" />
            <path d="M34 93 L32 110" />
            <path d="M66 93 L68 110" />
          </g>
          <g stroke="#b03a2e" strokeWidth="0.7" opacity="0.8">
            <path d="M24 103 L76 103" />
            <path d="M39 92 L38 110" />
            <path d="M61 92 L62 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M40 90 L50 98 L44 101 Z" fill="#265a3e" />
          <path d="M60 90 L50 98 L56 101 Z" fill="#265a3e" />
        </>
      );
    case "face":
      return <FullBeard color="#b5562c" />;
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#a84d26" />;
    case "top":
      return (
        <g>
          <g fill="#9a4522">
            <circle cx="31" cy="37" r="5" />
            <circle cx="69" cy="37" r="5" />
            <circle cx="50" cy="10" r="7" />
          </g>
          <g fill="#b5562c">
            <circle cx="32" cy="30" r="6" />
            <circle cx="35" cy="21" r="7" />
            <circle cx="44" cy="14" r="7" />
            <circle cx="56" cy="14" r="7" />
            <circle cx="65" cy="21" r="7" />
            <circle cx="68" cy="30" r="6" />
            <circle cx="41" cy="24" r="5.5" />
            <circle cx="50" cy="21" r="6" />
            <circle cx="59" cy="24" r="5.5" />
          </g>
          <g stroke="#8a3a1c" strokeWidth="0.9" fill="none" opacity="0.6">
            <path d="M38 22 q3 -3 6 0" />
            <path d="M52 16 q3 -3 6 0" />
            <path d="M47 24 q3 -3 6 0" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/* ── 5. Scholar — round glasses, moustache, turtleneck ──────────── */

export function AndrewScholar({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return <path d="M24 110 Q27 96 40 92 L60 92 Q73 96 76 110 Z" fill="#c9b08a" />;
    case "collar":
      return (
        <>
          <path d="M41 88.5 Q50 93 59 88.5 L60.5 97 Q50 101 39.5 97 Z" fill="#b89c74" />
          <g stroke="#a88c64" strokeWidth="0.6" opacity="0.8">
            <path d="M44 90.5 L43.6 98.5" />
            <path d="M47 91.4 L46.8 99.4" />
            <path d="M50 91.8 L50 99.8" />
            <path d="M53 91.4 L53.2 99.4" />
            <path d="M56 90.5 L56.4 98.5" />
          </g>
        </>
      );
    case "lip":
      return (
        <path
          d="M50 63.5 Q44 61 39 63 Q36 65.5 39.5 66 Q45 66.4 50 65.4 Q55 66.4 60.5 66 Q64 65.5 61 63 Q56 61 50 63.5 Z"
          fill="#6b4a30"
        />
      );
    case "top":
      return (
        <>
          <path
            d="M29 42 C27 22 38 11 51 11 C64 11 73 22 71 42 C69 34 66 30 62 29 Q56 25 48 27 Q40 29 36 26 C33 30 31 35 29 42 Z"
            fill="#6b4a30"
          />
          <path
            d="M40 17 Q50 12 62 18"
            stroke="#80593a"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
          <g stroke="#2c2622" strokeWidth="1.4" fill="none" strokeLinecap="round">
            <circle cx="39" cy="48" r="7" />
            <circle cx="61" cy="48" r="7" />
            <path d="M46 47 Q50 44.8 54 47" />
            <path d="M32 47 L29 45.5" />
            <path d="M68 47 L71 45.5" />
          </g>
          <g fill="#ffffff" opacity="0.25">
            <path d="M34.5 44 Q36 42.2 38.5 41.8 L36 47 Z" />
            <path d="M56.5 44 Q58 42.2 60.5 41.8 L58 47 Z" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 6. Beanie — knit hat, blond tufts, stubble, denim jacket ───── */

export function AndrewBeanie({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90 Q50 96 63 90 Q77 95 80 110 Z" fill="#4a6a90" />
          <path d="M43 92 L50 100 L57 92 Z" fill="#f2f0ea" />
          <g
            stroke="#c9a15e"
            strokeWidth="0.6"
            strokeDasharray="1.2 1"
            fill="none"
          >
            <path d="M28 102 L44 104" />
            <path d="M72 102 L56 104" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M38 89 L47 100 L41 103 L33 94 Z" fill="#3e5c80" />
          <path d="M62 89 L53 100 L59 103 L67 94 Z" fill="#3e5c80" />
        </>
      );
    case "face":
      return <Stubble color="#8a6a3a" />;
    case "top":
      return (
        <>
          <path d="M29 37 Q27 44 31 49 L33 37 Z" fill="#d8b870" />
          <path d="M71 37 Q73 44 69 49 L67 37 Z" fill="#d8b870" />
          <path d="M37 33 Q40 39 44 33 Q47 38 50 33 Z" fill="#d8b870" />
          <path d="M27 34 C26 16 38 7 50 7 C62 7 74 16 73 34 Z" fill="#d4a02a" />
          <g stroke="#bd8d20" strokeWidth="0.9" opacity="0.7">
            <path d="M38 11 L37 30" />
            <path d="M44 8.5 L44 29" />
            <path d="M50 7.5 L50 29" />
            <path d="M56 8.5 L56 29" />
            <path d="M62 11 L63 30" />
          </g>
          <path d="M26 29 Q50 23 74 29 L74.5 37 Q50 31 25.5 37 Z" fill="#b8871e" />
          <circle cx="50" cy="6" r="4" fill="#e8b84a" />
        </>
      );
    default:
      return null;
  }
}

/* ── 7. Silver fox — swept-back grey, goatee, open-collar suit ──── */

export function AndrewSilverFox({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 96 38 91 L50 104 L62 91 Q77 96 80 110 Z" fill="#2e2e36" />
          <path d="M42 91 L50 105 L58 91 Z" fill="#bcd4ea" />
          <path d="M44.5 91.5 L50 100 L55.5 91.5 Z" fill="#e8c4a4" />
          <g stroke="#1f1f26" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M38 91.5 L46 104 L43 110" />
            <path d="M62 91.5 L54 104 L57 110" />
          </g>
          <path d="M62 104 L68 104 L66 101 Z" fill="#f2efe6" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M41 89.5 L47.5 98 L43.5 100.5 Z" fill="#cfe0f0" />
          <path d="M59 89.5 L52.5 98 L56.5 100.5 Z" fill="#cfe0f0" />
        </>
      );
    case "face":
      return (
        <path d="M44 74 Q50 72 56 74 Q57 84 50 88 Q43 84 44 74 Z" fill="#9c9c9c" />
      );
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#a4a4a4" />;
    case "top":
      return (
        <>
          <path
            d="M29 41 C27 20 38 10 50 10 C62 10 73 20 71 41 C69 30 64 25 58 24 Q50 22 42 24 Q34 27 29 41 Z"
            fill="#b0b0b0"
          />
          <g stroke="#8c8c8c" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M36 24 Q44 14 58 13" />
            <path d="M42 23 Q50 16 64 17" />
            <path d="M32 31 Q36 20 48 15" />
          </g>
          <path d="M30 40 L32.5 40 L32.5 49 L30.3 49 Z" fill="#a0a0a0" />
          <path d="M70 40 L67.5 40 L67.5 49 L69.7 49 Z" fill="#a0a0a0" />
        </>
      );
    default:
      return null;
  }
}

/* ── 8. Man bun — dark full beard, white tee, cord necklace ─────── */

export function AndrewManBun({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return <CrewNeck color="#f2f0ea" rib="#dedbd2" />;
    case "collar":
      return (
        <>
          <CrewCollar rib="#dedbd2" />
          <path
            d="M43 94 Q50 104 57 94"
            stroke="#5a3a22"
            strokeWidth="0.8"
            fill="none"
          />
          <path d="M50 99.5 L48.6 103 L51.4 103 Z" fill="#9a8a70" />
        </>
      );
    case "face":
      return <FullBeard color="#3a2a20" />;
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#32241b" />;
    case "top":
      return (
        <>
          <path
            d="M29 41 C27 20 38 13 50 13 C62 13 73 20 71 41 C68 30 62 25 50 24 C38 25 32 30 29 41 Z"
            fill="#3a2a20"
          />
          <g stroke="#4e3a2c" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M34 28 Q40 17 49 14" />
            <path d="M66 28 Q60 17 51 14" />
            <path d="M42 24 Q46 17 50 14" />
          </g>
          <circle cx="50" cy="8" r="6.2" fill="#3a2a20" />
          <path d="M45 12.5 Q50 14.5 55 12.5" stroke="#6b4a30" strokeWidth="1.6" fill="none" />
          <path d="M46.5 6 Q50 3.5 53.5 6" stroke="#4e3a2c" strokeWidth="0.9" fill="none" />
        </>
      );
    default:
      return null;
  }
}

/* ── 9. Buzz cut — clean-shaven, olive bomber ───────────────────── */

export function AndrewBuzzCut({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 91 Q50 96 63 91 Q77 95 80 110 Z" fill="#5d6a3e" />
          <path d="M50 98 L50 110" stroke="#c9c2a8" strokeWidth="0.9" />
          <path d="M30 104 Q34 100 38 104" stroke="#4d5832" strokeWidth="1" fill="none" />
          <path d="M70 104 Q66 100 62 104" stroke="#4d5832" strokeWidth="1" fill="none" />
        </>
      );
    case "collar":
      return (
        <path d="M40 91 Q50 97 60 91 L61 95.5 Q50 101.5 39 95.5 Z" fill="#3f4a2a" />
      );
    case "top":
      return (
        <>
          <path
            d="M30 42 C28.5 25 38 19.5 50 19.5 C62 19.5 71.5 25 70 42 C68 33 60 28.5 50 28.5 C40 28.5 32 33 30 42 Z"
            fill="#2a2522"
            opacity="0.9"
          />
          <path d="M30.2 40 L32 40 L32 46 L30.4 46 Z" fill="#2a2522" opacity="0.85" />
          <path d="M69.8 40 L68 40 L68 46 L69.6 46 Z" fill="#2a2522" opacity="0.85" />
        </>
      );
    default:
      return null;
  }
}

/* ── 10. Headphones — tousled chestnut, stubble, teal tee ───────── */

export function AndrewHeadphones({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return <CrewNeck color="#2a8a8a" rib="#227474" />;
    case "collar":
      return <CrewCollar rib="#227474" />;
    case "face":
      return <Stubble color="#5e3820" />;
    case "top":
      return (
        <>
          <path
            d="M28 42 C26 22 36 10 50 10 C64 10 74 22 72 42 C70 35 68 31 64 30 L62 35 Q58 28 52 29 L50 34 Q46 28 40 30 L38 35 Q34 30 31 33 Z"
            fill="#7a4a2a"
          />
          <g stroke="#8e5a36" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M40 16 Q48 12 58 15" />
            <path d="M36 23 Q44 18 52 20" />
          </g>
          <path
            d="M25.5 50 C21 16 79 16 74.5 50"
            stroke="#2b2b30"
            strokeWidth="3.2"
            fill="none"
          />
          <rect x="20.5" y="47" width="8.5" height="14" rx="3.2" fill="#2b2b30" />
          <rect x="71" y="47" width="8.5" height="14" rx="3.2" fill="#2b2b30" />
          <rect x="22.5" y="50" width="4.5" height="8" rx="2" fill="#e0503a" />
          <rect x="73" y="50" width="4.5" height="8" rx="2" fill="#e0503a" />
        </>
      );
    default:
      return null;
  }
}

/* ════════════════ Set 2 (looks 11–20) ════════════════ */

/* ── 11. Chef — toque, double-breasted whites ───────────────────── */

export function AndrewChef({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90.5 Q50 96 63 90.5 Q77 95 80 110 Z" fill="#f7f7f4" />
          <path d="M57 96 Q56 104 55 110" stroke="#dcdcd4" strokeWidth="1.1" fill="none" />
          <g fill="#c4c4ba">
            <circle cx="44" cy="101" r="1.2" />
            <circle cx="44" cy="107" r="1.2" />
            <circle cx="61" cy="101" r="1.2" />
            <circle cx="61" cy="107" r="1.2" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M40 90.5 Q50 96 60 90.5 L60.5 95.5 Q50 101 39.5 95.5 Z" fill="#ecece5" />
          <path d="M45 96.8 L50 99 L55 96.8 L53 101 L47 101 Z" fill="#c8402e" />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M29.5 42 C29 34 31 30 34 30 L66 30 C69 30 71 34 70.5 42 C69 36 64 33 50 33 C36 33 31 36 29.5 42 Z"
            fill="#3a2a20"
          />
          <path d="M30 40 L32.5 40 L32.5 48 L30.3 48 Z" fill="#3a2a20" />
          <path d="M70 40 L67.5 40 L67.5 48 L69.7 48 Z" fill="#3a2a20" />
          <g fill="#f7f7f4">
            <circle cx="36" cy="15" r="9.5" />
            <circle cx="50" cy="9.5" r="10.5" />
            <circle cx="64" cy="15" r="9.5" />
            <rect x="31" y="14" width="38" height="14" />
          </g>
          <g stroke="#dcdcd4" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <path d="M42 8 Q41 16 42 24" />
            <path d="M58 8 Q59 16 58 24" />
          </g>
          <path d="M29 34 Q50 29.5 71 34 L71 26 Q50 22 29 26 Z" fill="#ecece5" />
        </>
      );
    default:
      return null;
  }
}

/* ── 12. Pompadour — black quiff, long sideburns, leather jacket ── */

export function AndrewPompadour({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90 L50 100 L63 90 Q77 95 80 110 Z" fill="#1e1e22" />
          <path d="M42 92 Q50 98 58 92 L57 110 L43 110 Z" fill="#b8322e" />
          <g stroke="#0e0e10" strokeWidth="1.2" fill="none">
            <path d="M42 94 L43 110" />
            <path d="M58 94 L57 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M37 89 L46 99 L40.5 104 L31 94 Z" fill="#2c2c32" />
          <path d="M63 89 L54 99 L59.5 104 L69 94 Z" fill="#2c2c32" />
          <circle cx="36" cy="95" r="0.8" fill="#c8c8c8" />
          <circle cx="64" cy="95" r="0.8" fill="#c8c8c8" />
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M29 42 C27 30 30 22 36 17 C40 8 54 2 66 6 C75 9 75 17 68 19 C72 23 72 32 71 42 C69 34 64 30 56 29 C48 28 40 30 36 33 C32 35 30 38 29 42 Z"
            fill="#1a1a1f"
          />
          <g stroke="#3e3e4a" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M40 14 Q52 5 66 8" />
            <path d="M38 22 Q50 13 66 15" />
          </g>
          <path d="M30 40 L32.4 40 L32.7 57 L30.7 57 Z" fill="#1a1a1f" />
          <path d="M70 40 L67.6 40 L67.3 57 L69.3 57 Z" fill="#1a1a1f" />
        </>
      );
    default:
      return null;
  }
}

/* ── 13. Afro — rounded afro, chin-strap beard, mustard polo ────── */

export function AndrewAfro({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <g fill="#241a16">
          <circle cx="50" cy="30" r="27" />
          <circle cx="26" cy="36" r="9" />
          <circle cx="74" cy="36" r="9" />
          <circle cx="30" cy="16" r="9" />
          <circle cx="70" cy="16" r="9" />
          <circle cx="50" cy="5" r="9" />
          <circle cx="39" cy="7" r="8" />
          <circle cx="61" cy="7" r="8" />
          <circle cx="24" cy="46" r="7" />
          <circle cx="76" cy="46" r="7" />
        </g>
      );
    case "outfit":
      return (
        <>
          <path d="M22 110 Q25 95 38 91 Q50 97 62 91 Q75 95 78 110 Z" fill="#d9a13a" />
          <path d="M48.5 96 L51.5 96 L51.5 106 L48.5 106 Z" fill="#c68e2a" />
          <g fill="#f2e6c8">
            <circle cx="50" cy="99" r="0.8" />
            <circle cx="50" cy="103" r="0.8" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M40 90 L49 96 L44 101 L37 94 Z" fill="#e4b04a" />
          <path d="M60 90 L51 96 L56 101 L63 94 Z" fill="#e4b04a" />
        </>
      );
    case "face":
      return (
        <path
          d="M30 42 L32.6 42 L32.6 60 Q33.5 76 43 83 Q50 87 57 83 Q66.5 76 67.4 60 L67.4 42 L70 42 L70 62 Q70 80 58 88.5 Q50 93 42 88.5 Q30 80 30 62 Z"
          fill="#241a16"
        />
      );
    case "top":
      return (
        <>
          <path
            d="M30 42 C29 28 36 20 50 20 C64 20 71 28 70 42 C68 34 62 30 50 30 C38 30 32 34 30 42 Z"
            fill="#241a16"
          />
          <g fill="#3a2c24" opacity="0.8">
            <circle cx="30" cy="24" r="1.2" />
            <circle cx="44" cy="12" r="1.2" />
            <circle cx="60" cy="14" r="1.2" />
            <circle cx="70" cy="28" r="1.2" />
            <circle cx="52" cy="20" r="1.2" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 14. Cowboy — hat, handlebar moustache, bandana ─────────────── */

export function AndrewCowboy({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90.5 Q50 96 63 90.5 Q77 95 80 110 Z" fill="#c9a878" />
          <g fill="#b8966a">
            <path d="M28 100 L38 100 L38 104 L33 106 L28 104 Z" />
            <path d="M62 100 L72 100 L72 104 L67 106 L62 104 Z" />
          </g>
          <circle cx="50" cy="106" r="0.9" fill="#8a6a44" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M39 90 Q50 97 61 90 L50 106 Z" fill="#b8322e" />
          <g fill="#f2e6dc">
            <circle cx="45" cy="95" r="0.7" />
            <circle cx="55" cy="95" r="0.7" />
            <circle cx="50" cy="100" r="0.7" />
          </g>
          <circle cx="50" cy="94.5" r="2" fill="#9c2a26" />
        </>
      );
    case "lip":
      return (
        <path
          d="M50 63 Q43 60 37 62 Q33.5 64.5 31 61 Q29.5 66.5 36 67.2 Q44 68 50 66 Q56 68 64 67.2 Q70.5 66.5 69 61 Q66.5 64.5 63 62 Q57 60 50 63 Z"
          fill="#6b4a30"
        />
      );
    case "top":
      return (
        <>
          <path d="M29 34 Q27 44 30.5 50 L33 34 Z" fill="#6b4a30" />
          <path d="M71 34 Q73 44 69.5 50 L67 34 Z" fill="#6b4a30" />
          <path
            d="M30 31 C30 15 38 8 44 12 Q50 16 56 12 C62 8 70 15 70 31 Q50 25 30 31 Z"
            fill="#7a5230"
          />
          <path d="M30.5 28 Q50 22 69.5 28 L69.8 31.5 Q50 25.5 30.2 31.5 Z" fill="#4a3018" />
          <path
            d="M13 30 Q50 21 87 30 Q85 36.5 76 34 Q50 27.5 24 34 Q15 36.5 13 30 Z"
            fill="#8a6038"
          />
        </>
      );
    default:
      return null;
  }
}

/* ── 15. Surfer — long blond centre part, Hawaiian shirt ────────── */

function Hibiscus({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <g fill="#f8f2e8">
        <circle cx={cx} cy={cy - 2} r="1.8" />
        <circle cx={cx + 2} cy={cy - 0.4} r="1.8" />
        <circle cx={cx + 1.2} cy={cy + 2} r="1.8" />
        <circle cx={cx - 1.2} cy={cy + 2} r="1.8" />
        <circle cx={cx - 2} cy={cy - 0.4} r="1.8" />
      </g>
      <circle cx={cx} cy={cy} r="1" fill="#f2c84a" />
    </g>
  );
}

export function AndrewSurfer({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M24 42 Q20 70 26 94 L74 94 Q80 70 76 42 Q76 18 50 16 Q24 18 24 42 Z"
          fill="#d4b05e"
        />
      );
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90.5 L50 102 L63 90.5 Q77 95 80 110 Z" fill="#e0664a" />
          <path d="M42 92 L50 102 L58 92 Z" fill="#e8c4a4" />
          <Hibiscus cx={30} cy={100} />
          <Hibiscus cx={70} cy={102} />
          <Hibiscus cx={58} cy={108} />
          <g fill="#3a8a5a">
            <path d="M34 104 q3 1 4 4 q-3 -1 -4 -4 Z" />
            <path d="M66 106 q-3 1 -4 4 q3 -1 4 -4 Z" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M39 89.5 L48 100 L42 102 L34 93 Z" fill="#cc5438" />
          <path d="M61 89.5 L52 100 L58 102 L66 93 Z" fill="#cc5438" />
          <g fill="#f4ecdc">
            <circle cx="44" cy="93.5" r="0.9" />
            <circle cx="47" cy="95.5" r="0.9" />
            <circle cx="50" cy="96.2" r="1.1" />
            <circle cx="53" cy="95.5" r="0.9" />
            <circle cx="56" cy="93.5" r="0.9" />
          </g>
        </>
      );
    case "face":
      return <Stubble color="#b8904a" />;
    case "top":
      return (
        <>
          <path
            d="M29 46 C27 22 38 12 50 12 C62 12 73 22 71 46 C68 36 62 30 52 28 L50 24 L48 28 C38 30 32 36 29 46 Z"
            fill="#e0c070"
          />
          <g stroke="#c9a650" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M47 18 Q38 22 33 34" />
            <path d="M53 18 Q62 22 67 34" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 16. Mohawk — green crest, shaved sides, studded collar ─────── */

export function AndrewMohawk({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return <CrewNeck color="#18181c" rib="#2a2a30" />;
    case "collar":
      return (
        <>
          <path
            d="M40 92.5 Q50 99 60 92.5"
            stroke="#101012"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <g fill="#c8ccd2">
            <path d="M42.5 94.5 L43.5 91.5 L44.5 94.8 Z" />
            <path d="M46.5 96 L47.5 93 L48.5 96.3 Z" />
            <path d="M51.5 96.3 L52.5 93 L53.5 96 Z" />
            <path d="M55.5 94.8 L56.5 91.5 L57.5 94.5 Z" />
          </g>
        </>
      );
    case "top":
      return (
        <>
          <path
            d="M30 42 C29 28 36 22 50 21 C64 22 71 28 70 42 C68 34 62 30 50 30 C38 30 32 34 30 42 Z"
            fill="#2a2522"
            opacity="0.35"
          />
          <path
            d="M43.5 31 L41 6 L46.5 13 L50 1 L53.5 13 L59 6 L56.5 31 Q50 29 43.5 31 Z"
            fill="#3cb04a"
          />
          <path d="M47 28 L46 14 M53 28 L54 14" stroke="#2a8a38" strokeWidth="0.9" />
          <circle cx="27" cy="61.5" r="1.9" stroke="#c8ccd2" strokeWidth="0.9" fill="none" />
          <circle cx="73" cy="58" r="0.9" fill="#c8ccd2" />
        </>
      );
    default:
      return null;
  }
}

/* ── 17. Captain — peaked cap, white beard, pea coat ────────────── */

export function AndrewCaptain({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90 L50 101 L63 90 Q77 95 80 110 Z" fill="#1f2a44" />
          <path d="M43 91 L50 101 L57 91 Z" fill="#f2f0ea" />
          <g fill="#d4a840">
            <circle cx="41" cy="101" r="1.2" />
            <circle cx="41" cy="107" r="1.2" />
            <circle cx="59" cy="101" r="1.2" />
            <circle cx="59" cy="107" r="1.2" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M42 89.5 Q50 93.5 58 89.5 L58.5 94 Q50 98 41.5 94 Z" fill="#e8e6de" />
          <path d="M36 89 L46 100 L40 104 L30 94 Z" fill="#18213a" />
          <path d="M64 89 L54 100 L60 104 L70 94 Z" fill="#18213a" />
        </>
      );
    case "face":
      return <FullBeard color="#e2e2dc" />;
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#d4d4cc" />;
    case "top":
      return (
        <>
          <path d="M29.5 34 Q28 44 31 50 L33 34 Z" fill="#d8d8d2" />
          <path d="M70.5 34 Q72 44 69 50 L67 34 Z" fill="#d8d8d2" />
          <path d="M27 30 Q25 14 50 12 Q75 14 73 30 Z" fill="#f4f4f0" />
          <rect x="28" y="27" width="44" height="7" rx="1" fill="#1f2a44" />
          <path d="M31 30.5 L69 30.5" stroke="#d4a840" strokeWidth="0.8" />
          <circle cx="50" cy="29" r="3" fill="#d4a840" />
          <path d="M48.6 29 L50 27.4 L51.4 29 L50 30.6 Z" fill="#1f2a44" />
          <path d="M30 34 Q50 42 70 34 Q60 38.5 50 38.5 Q40 38.5 30 34 Z" fill="#121418" />
        </>
      );
    default:
      return null;
  }
}

/* ── 18. Graduate — mortarboard, tassel, gown with stole ────────── */

export function AndrewGraduate({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M18 110 Q22 94 37 90 L50 101 L63 90 Q78 94 82 110 Z" fill="#1c1c22" />
          <path d="M43 91 L50 101 L57 91 Z" fill="#f4f4f0" />
          <path d="M49 96 L51 96 L51.6 104 L50 106 L48.4 104 Z" fill="#26407a" />
        </>
      );
    case "collar":
      return (
        <>
          <path d="M42.5 90 L49 96.5 L45.5 99.5 Z" fill="#ffffff" />
          <path d="M57.5 90 L51 96.5 L54.5 99.5 Z" fill="#ffffff" />
          <path d="M39 90 L43.5 110 L38 110 L34.5 92.5 Z" fill="#d4a840" />
          <path d="M61 90 L56.5 110 L62 110 L65.5 92.5 Z" fill="#d4a840" />
        </>
      );
    case "top":
      return (
        <>
          <path d="M30 40 Q29 32 33 29 L33 40 Z" fill="#5a3e28" />
          <path d="M70 40 Q71 32 67 29 L67 40 Z" fill="#5a3e28" />
          <path d="M32 22 L32 30.5 Q50 37 68 30.5 L68 22 Q50 28 32 22 Z" fill="#26262c" />
          <path d="M16 19 L50 9 L84 19 L50 29 Z" fill="#1a1a1e" />
          <path d="M50 19 L77 21 L77 35" stroke="#d4a840" strokeWidth="1" fill="none" />
          <path d="M75.6 34 L78.4 34 L79 40 L75 40 Z" fill="#d4a840" />
          <circle cx="50" cy="19" r="1.4" fill="#d4a840" />
        </>
      );
    default:
      return null;
  }
}

/* ── 19. Viking — braided long beard, swept-back hair, fur mantle ─ */

export function AndrewViking({ layer }: LookLayerProps) {
  switch (layer) {
    case "back":
      return (
        <path
          d="M25 40 Q22 70 28 92 L72 92 Q78 70 75 40 Q74 18 50 16 Q26 18 25 40 Z"
          fill="#7a5a32"
        />
      );
    case "outfit":
      return (
        <>
          <path d="M20 110 Q23 95 37 90.5 Q50 96 63 90.5 Q77 95 80 110 Z" fill="#6b4a30" />
          <path d="M22 108 L78 108" stroke="#4a3018" strokeWidth="1.5" />
        </>
      );
    case "collar":
      return (
        <g fill="#b8a080">
          <circle cx="30" cy="95" r="5" />
          <circle cx="37" cy="92" r="4.5" />
          <circle cx="63" cy="92" r="4.5" />
          <circle cx="70" cy="95" r="5" />
          <circle cx="24" cy="100" r="4.5" />
          <circle cx="76" cy="100" r="4.5" />
          <circle cx="34" cy="98" r="3.5" fill="#a08868" />
          <circle cx="66" cy="98" r="3.5" fill="#a08868" />
        </g>
      );
    case "face":
      return (
        <>
          <path
            d="M30 52 Q28 72 36 86 Q42 94 46 100 L48 108 L50 110 L52 108 L54 100 Q58 94 64 86 Q72 72 70 52 Q68 60 62 62 Q56 64 50 64 Q44 64 38 62 Q32 60 30 52 Z"
            fill="#8a6a3a"
          />
          <path d="M46 72 Q50 69 54 72 Q50 76 46 72 Z" fill="#edd0b0" />
          <g fill="#c8a040">
            <rect x="46.2" y="96" width="7.6" height="2.4" rx="1" />
            <rect x="47.2" y="102.5" width="5.6" height="2.2" rx="1" />
          </g>
          <g stroke="#6e5230" strokeWidth="0.8" fill="none">
            <path d="M48 92 L52 94 M48 94.5 L52 92" />
            <path d="M48.4 99.5 L51.6 101.5" />
          </g>
        </>
      );
    case "lip":
      return <path d={MOUSTACHE_PATH} fill="#7e5e32" />;
    case "top":
      return (
        <>
          <path
            d="M29 42 C27 20 38 11 50 11 C62 11 73 20 71 42 C69 32 63 26 50 25 C37 26 31 32 29 42 Z"
            fill="#8a6a3a"
          />
          <g stroke="#6e5230" strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M36 25 Q40 16 48 13" />
            <path d="M50 24.5 L50 12" />
            <path d="M64 25 Q60 16 52 13" />
          </g>
        </>
      );
    default:
      return null;
  }
}

/* ── 20. Flat cap — tweed newsboy cap, striped scarf, camel coat ── */

export function AndrewFlatCap({ layer }: LookLayerProps) {
  switch (layer) {
    case "outfit":
      return (
        <>
          <path d="M18 110 Q22 94 37 90 L50 104 L63 90 Q78 94 82 110 Z" fill="#b88a58" />
          <g stroke="#9a7044" strokeWidth="1.1" fill="none">
            <path d="M37 91 L46 106 L44 110" />
            <path d="M63 91 L54 106 L56 110" />
          </g>
        </>
      );
    case "collar":
      return (
        <>
          <path d="M36 88 Q50 98 64 88 L66 96 Q50 106 34 96 Z" fill="#b8322e" />
          <g stroke="#efe6d4" strokeWidth="1.1" fill="none">
            <path d="M35 91 Q50 100.5 65 91" />
            <path d="M34.8 94 Q50 103.5 65.4 94" />
          </g>
          <path d="M54 99 L60.5 98 L62.5 110 L55.5 110 Z" fill="#b8322e" />
          <path d="M55 103 L61.2 102.2 M55.6 106.6 L61.8 105.8" stroke="#efe6d4" strokeWidth="1.1" />
        </>
      );
    case "face":
      return <Stubble color="#4a3222" />;
    case "top":
      return (
        <>
          <path d="M29.5 34 Q28 44 31 50 L33.5 34 Z" fill="#4a3222" />
          <path d="M70.5 34 Q72 44 69 50 L66.5 34 Z" fill="#4a3222" />
          <path
            d="M27 34 Q24 17 50 13 Q77 15 77 27 Q79 32 72 34 Q50 27 27 34 Z"
            fill="#7a6e60"
          />
          <g stroke="#6a5e50" strokeWidth="0.6" opacity="0.8">
            <path d="M34 20 L40 30 M42 16 L48 28 M52 15 L58 27 M62 17 L67 28" />
            <path d="M36 28 L48 18 M48 28 L60 18 M58 29 L70 21" />
          </g>
          <path d="M26 34 Q46 26 73 32 Q71 38.5 60 37.5 Q44 33 28 38.5 Q25 38 26 34 Z" fill="#62584c" />
          <circle cx="52" cy="14.5" r="1.2" fill="#62584c" />
        </>
      );
    default:
      return null;
  }
}
