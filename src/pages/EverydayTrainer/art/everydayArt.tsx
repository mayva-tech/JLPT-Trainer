/**
 * Hand-drawn pictures for Everyday Japanese — mostly things emoji can't show
 * or would show wrongly (a Japanese ticket gate, つり革, a curve mirror at a
 * blind corner…). Same 64×64 flat style as the player's Illustration set
 * (src/components/Illustration/svgDrawings.tsx), drawn to be read on the
 * light picture frame of a flashcard.
 *
 * One picture per word: every drawing must show its own object only, so a
 * Picture Quiz never has two right answers. Registered by id in ./registry.ts.
 */

const INK = "#3a4350";
const BODY = "#f3f5f8";
const SHADE = "#d6dce4";
const STEEL = "#9aa6b5";
const WOOD = "#c9935a";
const WOOD_D = "#9c6a38";
const RED = "#d94c45";
const YELLOW = "#f2c84b";
const BLUE = "#5aa9e6";
const PAPER = "#fbf6ea";

const line = { stroke: INK, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ---------- Inside Train / Station ---------- */

export function HandStrap() {
  return (
    <>
      <rect x="2" y="5" width="60" height="5" rx="2.5" fill={STEEL} stroke={INK} strokeWidth="1.6" />
      <g opacity="0.45">
        <rect x="9" y="10" width="4" height="14" rx="1.5" fill={SHADE} />
        <path d="M11 24 L18 37 H4 Z" fill="none" stroke={SHADE} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="51" y="10" width="4" height="14" rx="1.5" fill={SHADE} />
        <path d="M53 24 L60 37 H46 Z" fill="none" stroke={SHADE} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <rect x="28.5" y="10" width="7" height="20" rx="2.5" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M32 30 L45 54 H19 Z" fill="none" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M32 30 L45 54 H19 Z" fill="none" stroke={BODY} strokeWidth="4.4" strokeLinejoin="round" />
    </>
  );
}

export function TicketGate() {
  return (
    <>
      <path d="M2 58 H62" {...line} />
      <rect x="4" y="22" width="20" height="36" rx="3" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="40" y="22" width="20" height="36" rx="3" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M6 22 L10 15 H22 L24 22" fill={SHADE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="16" cy="18.5" rx="4" ry="2" fill={BLUE} />
      <rect x="44" y="27" width="12" height="5" rx="1" fill="#2d3644" />
      <path d="M47 29.5 H53 M51 27.8 L53 29.5 L51 31.2" stroke="#7ee0a0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <rect x="8" y="30" width="12" height="3" rx="1.5" fill={SHADE} />
      <rect x="24" y="36" width="8" height="9" rx="2" fill="#f08a3c" stroke={INK} strokeWidth="1.6" />
      <rect x="32" y="36" width="8" height="9" rx="2" fill="#f08a3c" stroke={INK} strokeWidth="1.6" />
    </>
  );
}

export function TicketMachine() {
  return (
    <>
      <rect x="10" y="4" width="44" height="56" rx="4" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="14" y="9" width="36" height="24" rx="2" fill={BLUE} stroke={INK} strokeWidth="1.6" />
      <g fill="#e6f2fc">
        <rect x="17" y="12" width="9" height="5" rx="1" />
        <rect x="27.5" y="12" width="9" height="5" rx="1" />
        <rect x="38" y="12" width="9" height="5" rx="1" />
        <rect x="17" y="19" width="9" height="5" rx="1" />
        <rect x="27.5" y="19" width="9" height="5" rx="1" />
        <rect x="38" y="19" width="9" height="5" rx="1" />
      </g>
      <rect x="17" y="26.5" width="30" height="4" rx="1" fill="#f2c84b" />
      <rect x="15" y="38" width="12" height="3" rx="1.5" fill={INK} />
      <rect x="35" y="38" width="14" height="3" rx="1.5" fill={INK} />
      <circle cx="21" cy="47" r="3" fill={SHADE} stroke={INK} strokeWidth="1.4" />
      <rect x="31" y="51" width="18" height="4" rx="1" fill={INK} />
      <rect x="35" y="48" width="10" height="7" rx="1" fill="#f08a3c" stroke={INK} strokeWidth="1.2" />
    </>
  );
}

export function LuggageRack() {
  return (
    <>
      <rect x="4" y="38" width="56" height="20" rx="3" fill="#cfe6f6" stroke={INK} strokeWidth="2" />
      <path d="M32 38 V58" stroke={INK} strokeWidth="2" />
      <path d="M8 14 L16 26 M56 14 L48 26" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
      <path d="M4 26 H60" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
      <path d="M4 32 H60" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
      <path d="M10 26 V32 M18 26 V32 M26 26 V32 M34 26 V32 M42 26 V32 M50 26 V32 M58 26 V32" stroke={STEEL} strokeWidth="1.4" />
      <rect x="22" y="12" width="22" height="14" rx="3" fill="#6b8bd6" stroke={INK} strokeWidth="2" />
      <path d="M28 12 Q33 6 38 12" fill="none" stroke={INK} strokeWidth="2" />
    </>
  );
}

export function Escalator() {
  return (
    <>
      <path d="M4 56 H18 L46 16 H60 V24 H50 L22 60 H4 Z" fill={SHADE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 56 V50 H22 V45 H26 V40 H30 V35 H34 V30 H38 V25 H42 V20 H46" fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M2 46 H14 L42 6 H58" fill="none" stroke="#2d3644" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export function CoinLocker() {
  const doors = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 8 + c * 16;
      const y = 6 + r * 17;
      doors.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width="14" height="15" rx="1.5" fill="#8fbde6" stroke={INK} strokeWidth="1.4" />
          <rect x={x + 9} y={y + 3} width="2.4" height="4" rx="0.8" fill={INK} />
          <rect x={x + 8.5} y={y + 7} width="3.4" height="3" rx="1" fill="#f08a3c" />
        </g>,
      );
    }
  }
  return (
    <>
      <rect x="5" y="3" width="54" height="57" rx="3" fill={BODY} stroke={INK} strokeWidth="2" />
      {doors}
    </>
  );
}

/* ---------- Street ---------- */

export function Guardrail() {
  return (
    <>
      <path d="M2 58 H62" {...line} />
      <rect x="10" y="30" width="5" height="28" fill={STEEL} stroke={INK} strokeWidth="1.6" />
      <rect x="49" y="30" width="5" height="28" fill={STEEL} stroke={INK} strokeWidth="1.6" />
      <path
        d="M3 24 Q32 21 61 24 V40 Q32 37 3 40 Z"
        fill={BODY}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M3 29.5 Q32 26.5 61 29.5 M3 34.5 Q32 31.5 61 34.5" fill="none" stroke={SHADE} strokeWidth="2" />
      <circle cx="12.5" cy="32" r="1.4" fill={INK} />
      <circle cx="51.5" cy="32" r="1.4" fill={INK} />
    </>
  );
}

export function Manhole() {
  const spokes = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    spokes.push(
      <path
        key={i}
        d={`M${32 + Math.cos(a) * 8} ${32 + Math.sin(a) * 8} L${32 + Math.cos(a) * 21} ${32 + Math.sin(a) * 21}`}
        stroke="#5d6676"
        strokeWidth="2"
      />,
    );
  }
  return (
    <>
      <circle cx="32" cy="32" r="27" fill="#7b8494" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="32" r="22" fill="#8c95a4" stroke="#5d6676" strokeWidth="1.6" />
      {spokes}
      <circle cx="32" cy="32" r="14" fill="none" stroke="#5d6676" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="8" fill="#a3acb9" stroke="#5d6676" strokeWidth="1.6" />
      <path d="M27 32 Q32 26 37 32 Q32 38 27 32 Z" fill="#5d6676" />
    </>
  );
}

export function Crosswalk() {
  const bars = [];
  for (let i = 0; i < 6; i++) bars.push(<rect key={i} x={7 + i * 9} y="15" width="5.5" height="34" rx="0.8" fill="#f7f7f2" />);
  return (
    <>
      <rect x="2" y="10" width="60" height="44" rx="4" fill="#5b6472" stroke={INK} strokeWidth="2" />
      {bars}
    </>
  );
}

export function UtilityPole() {
  return (
    <>
      <path d="M2 18 Q17 26 32 15 Q47 26 62 18" fill="none" stroke={INK} strokeWidth="1.2" />
      <path d="M2 24 Q17 32 32 21 Q47 32 62 24" fill="none" stroke={INK} strokeWidth="1.2" />
      <rect x="29" y="4" width="6" height="56" rx="1.5" fill="#b8bfc9" stroke={INK} strokeWidth="1.8" />
      <rect x="16" y="13" width="32" height="3.5" rx="1" fill="#8d96a3" stroke={INK} strokeWidth="1.2" />
      <circle cx="18" cy="12" r="1.8" fill={BODY} stroke={INK} strokeWidth="1" />
      <circle cx="46" cy="12" r="1.8" fill={BODY} stroke={INK} strokeWidth="1" />
      <rect x="35" y="24" width="10" height="12" rx="2" fill={SHADE} stroke={INK} strokeWidth="1.6" />
      <rect x="28" y="44" width="8" height="16" rx="1" fill={YELLOW} stroke={INK} strokeWidth="1.6" />
      <path d="M28 48 L36 44 M28 53 L36 49 M28 58 L36 54" stroke={INK} strokeWidth="1.8" />
    </>
  );
}

export function TactilePaving() {
  const dots = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      dots.push(<circle key={`a${r}${c}`} cx={10.5 + c * 7} cy={38.5 + r * 7} r="2.4" fill="#ffe48a" stroke="#b88f16" strokeWidth="1" />);
      dots.push(<circle key={`b${r}${c}`} cx={39.5 + c * 7} cy={38.5 + r * 7} r="2.4" fill="#ffe48a" stroke="#b88f16" strokeWidth="1" />);
    }
  }
  return (
    <>
      <rect x="4" y="4" width="27" height="27" rx="2" fill={YELLOW} stroke="#b88f16" strokeWidth="1.6" />
      <rect x="33" y="4" width="27" height="27" rx="2" fill={YELLOW} stroke="#b88f16" strokeWidth="1.6" />
      <rect x="4" y="33" width="27" height="27" rx="2" fill={YELLOW} stroke="#b88f16" strokeWidth="1.6" />
      <rect x="33" y="33" width="27" height="27" rx="2" fill={YELLOW} stroke="#b88f16" strokeWidth="1.6" />
      {[9, 15.5, 22, 38, 44.5, 51].map((x) => (
        <rect key={x} x={x} y="7" width="3.6" height="21" rx="1.8" fill="#ffe48a" stroke="#b88f16" strokeWidth="1" />
      ))}
      {dots}
    </>
  );
}

export function CurveMirror() {
  return (
    <>
      <rect x="30" y="36" width="4" height="24" fill="#e8813a" stroke={INK} strokeWidth="1.4" />
      <path d="M24 60 H40" {...line} />
      <circle cx="32" cy="22" r="18" fill="#e8813a" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="22" r="14" fill="#cfe8f5" stroke={INK} strokeWidth="1.4" />
      <path d="M20 26 Q32 30 44 26" fill="none" stroke="#9cb3c4" strokeWidth="2" />
      <rect x="27" y="20" width="10" height="5" rx="2" fill={RED} />
      <path d="M22 16 Q25 11 31 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

export function TrafficCone() {
  return (
    <>
      <path d="M28 6 H36 L48 52 H16 Z" fill="#e8603c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24.5 20 H39.5 L41.3 27 H22.7 Z" fill="#fbfbf6" />
      <path d="M21 34 H43 L44.8 41 H19.2 Z" fill="#fbfbf6" />
      <rect x="9" y="51" width="46" height="7" rx="2" fill="#c94a2a" stroke={INK} strokeWidth="2" />
    </>
  );
}

export function VendingMachine() {
  const bottles = ["#e06b5d", "#5aa9e6", "#f2c84b", "#62b37e", "#9b7bd6"];
  return (
    <>
      <rect x="11" y="3" width="42" height="58" rx="3" fill={RED} stroke={INK} strokeWidth="2" />
      <rect x="15" y="7" width="34" height="27" rx="1.5" fill="#eef6fc" stroke={INK} strokeWidth="1.4" />
      {[0, 1].map((row) =>
        bottles.map((color, i) => (
          <g key={`${row}-${i}`}>
            <rect x={17.5 + i * 6.3} y={9.5 + row * 12.5} width="4" height="8" rx="1.5" fill={color} />
            <circle cx={19.5 + i * 6.3} cy={19.5 + row * 12.5} r="1" fill={BLUE} />
          </g>
        )),
      )}
      <rect x="42" y="37" width="6" height="8" rx="1" fill="#f6f6f6" stroke={INK} strokeWidth="1.2" />
      <path d="M45 39 V43" stroke={INK} strokeWidth="1.2" />
      <rect x="16" y="49" width="32" height="8" rx="1.5" fill="#2d3644" />
    </>
  );
}

export function Streetlight() {
  return (
    <>
      <path d="M22 60 V18 Q22 9 31 9 H40" fill="none" stroke="#7f8a99" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M36 12 H54 Q54 17 45 17 Q36 17 36 12 Z" fill={SHADE} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M38 17 L28 50 H62 L52 17 Z" fill="#ffe28a" opacity="0.45" />
      <ellipse cx="45" cy="17.5" rx="5" ry="1.6" fill="#ffd34d" />
      <path d="M16 60 H28" {...line} />
    </>
  );
}

export function RailroadCrossing() {
  return (
    <>
      <rect x="30" y="8" width="4" height="52" fill={INK} />
      <path d="M24 60 H40" {...line} />
      <g transform="rotate(32 32 15)">
        <rect x="15" y="12" width="34" height="6" rx="1" fill={YELLOW} stroke={INK} strokeWidth="1.4" />
        <path d="M20 12 L17 18 M27 12 L24 18 M34 12 L31 18 M41 12 L38 18 M48 12 L45 18" stroke={INK} strokeWidth="2" />
      </g>
      <g transform="rotate(-32 32 15)">
        <rect x="15" y="12" width="34" height="6" rx="1" fill={YELLOW} stroke={INK} strokeWidth="1.4" />
        <path d="M20 12 L17 18 M27 12 L24 18 M34 12 L31 18 M41 12 L38 18 M48 12 L45 18" stroke={INK} strokeWidth="2" />
      </g>
      <rect x="16" y="28" width="32" height="12" rx="6" fill="#2d3644" />
      <circle cx="23" cy="34" r="4" fill="#ff5a4e" />
      <circle cx="41" cy="34" r="4" fill="#7a2a26" />
      <rect x="34" y="46" width="28" height="4" fill={YELLOW} stroke={INK} strokeWidth="1.2" />
      <path d="M39 46 V50 M46 46 V50 M53 46 V50" stroke={INK} strokeWidth="2.4" />
    </>
  );
}

/* ---------- Park ---------- */

export function Bench() {
  return (
    <>
      <path d="M2 58 H62" {...line} />
      <rect x="8" y="18" width="48" height="6" rx="2" fill={WOOD} stroke={INK} strokeWidth="1.6" />
      <rect x="8" y="26" width="48" height="6" rx="2" fill={WOOD} stroke={INK} strokeWidth="1.6" />
      <rect x="5" y="38" width="54" height="5" rx="2" fill={WOOD} stroke={INK} strokeWidth="1.6" />
      <rect x="8" y="44" width="52" height="5" rx="2" fill={WOOD_D} stroke={INK} strokeWidth="1.6" />
      <path d="M12 32 V58 M52 32 V58 M12 32 V38 M52 32 V38" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function Swing() {
  return (
    <>
      <path d="M2 60 H62" {...line} />
      <path d="M6 60 L12 8 L18 60 M46 60 L52 8 L58 60" fill="none" stroke="#4f7fd1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M8 8 H56" stroke={RED} strokeWidth="4" strokeLinecap="round" />
      <path d="M21 9 V42 M31 9 V42 M35 9 V36 M45 9 V36" stroke={STEEL} strokeWidth="1.6" />
      <rect x="18" y="42" width="16" height="4" rx="1.5" fill={YELLOW} stroke={INK} strokeWidth="1.4" />
      <rect x="32" y="36" width="16" height="4" rx="1.5" fill="#62b37e" stroke={INK} strokeWidth="1.4" />
    </>
  );
}

export function Slide() {
  return (
    <>
      <path d="M2 60 H62" {...line} />
      <path d="M8 60 V16 M18 60 V16" stroke="#4f7fd1" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8 24 H18 M8 32 H18 M8 40 H18 M8 48 H18 M8 56 H18" stroke="#4f7fd1" strokeWidth="2" />
      <rect x="6" y="13" width="18" height="4" rx="1" fill={RED} stroke={INK} strokeWidth="1.4" />
      <path d="M22 13 Q34 15 44 38 Q50 52 62 54 V60 Q48 58 41 42 Q32 22 22 19 Z" fill={YELLOW} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  );
}

export function Seesaw() {
  return (
    <>
      <path d="M2 58 H62" {...line} />
      <path d="M32 34 L40 58 H24 Z" fill={STEEL} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <g transform="rotate(-16 32 33)">
        <rect x="4" y="30" width="56" height="5" rx="2" fill={RED} stroke={INK} strokeWidth="1.8" />
        <path d="M13 30 V23 H17 M51 30 V23 H47" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="32" cy="33" r="2.4" fill={INK} />
    </>
  );
}

export function IronBar() {
  return (
    <>
      <path d="M2 60 H62" {...line} />
      <path d="M4 22 V60 M24 22 V60 M24 32 V60 M44 32 V60 M44 42 V60 M60 42 V60" stroke="#2f73c9" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M4 22 H24 M24 32 H44 M44 42 H60" stroke={STEEL} strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

/* ---------- Home / Apartment ---------- */

export function Outlet() {
  return (
    <>
      <rect x="14" y="5" width="36" height="54" rx="5" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="21" y="13" width="22" height="16" rx="5" fill={SHADE} stroke={INK} strokeWidth="1.4" />
      <rect x="21" y="35" width="22" height="16" rx="5" fill={SHADE} stroke={INK} strokeWidth="1.4" />
      <rect x="26.5" y="17" width="2.8" height="8" rx="1" fill={INK} />
      <rect x="34.7" y="17.5" width="2.8" height="7" rx="1" fill={INK} />
      <rect x="26.5" y="39" width="2.8" height="8" rx="1" fill={INK} />
      <rect x="34.7" y="39.5" width="2.8" height="7" rx="1" fill={INK} />
    </>
  );
}

export function LightSwitch() {
  return (
    <>
      <rect x="14" y="5" width="36" height="54" rx="4" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="19" y="11" width="26" height="42" rx="3" fill="#ffffff" stroke={INK} strokeWidth="1.6" />
      <path d="M20 32 H44" stroke={SHADE} strokeWidth="1.4" />
      <rect x="20" y="12" width="24" height="19" rx="2" fill="#eef1f5" />
      <circle cx="32" cy="46" r="2" fill="#7ad17a" stroke={INK} strokeWidth="0.8" />
    </>
  );
}

export function Stairs() {
  return (
    <>
      <path d="M4 60 V50 H16 V40 H28 V30 H40 V20 H52 V10 H60 V60 Z" fill={WOOD} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 50 H16 M16 40 H28 M28 30 H40 M40 20 H52 M52 10 H60" stroke={WOOD_D} strokeWidth="3" />
      <path d="M6 38 L54 4" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 34 V46 M28 23 V36 M44 12 V26" stroke={INK} strokeWidth="1.6" />
    </>
  );
}

export function Shoji() {
  return (
    <>
      <rect x="8" y="3" width="48" height="58" rx="1" fill={PAPER} stroke={WOOD_D} strokeWidth="3" />
      <path d="M20 4 V60 M32 4 V60 M44 4 V60" stroke={WOOD} strokeWidth="1.8" />
      <path d="M9 13 H55 M9 23 H55 M9 33 H55 M9 43 H55" stroke={WOOD} strokeWidth="1.8" />
      <rect x="9" y="49" width="46" height="11" fill={WOOD} opacity="0.85" />
      <rect x="47" y="30" width="5" height="8" rx="2.5" fill="none" stroke={WOOD_D} strokeWidth="1.4" />
    </>
  );
}

export function Tatami() {
  const weave = [];
  for (let y = 20; y <= 44; y += 3) weave.push(<path key={y} d={`M8 ${y} H56`} stroke="#aab35f" strokeWidth="0.9" />);
  return (
    <>
      <rect x="6" y="10" width="52" height="44" rx="1.5" fill="#c9d07f" stroke={INK} strokeWidth="2" />
      {weave}
      <rect x="6" y="10" width="52" height="6" fill="#2f5e4e" stroke={INK} strokeWidth="1.4" />
      <rect x="6" y="48" width="52" height="6" fill="#2f5e4e" stroke={INK} strokeWidth="1.4" />
      <path d="M6 13 H58 M6 51 H58" stroke="#5f8f74" strokeWidth="0.8" strokeDasharray="2 2" />
    </>
  );
}

export function Kotatsu() {
  return (
    <>
      <path d="M10 26 Q8 44 4 56 H60 Q56 44 54 26 Z" fill="#d9705a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 34 Q12 46 10 54 M50 34 Q52 46 54 54" fill="none" stroke="#b9533f" strokeWidth="1.4" />
      <g fill="#f0a58f">
        <circle cx="20" cy="40" r="2" />
        <circle cx="32" cy="46" r="2" />
        <circle cx="44" cy="40" r="2" />
        <circle cx="26" cy="51" r="2" />
        <circle cx="40" cy="52" r="2" />
      </g>
      <rect x="6" y="22" width="52" height="5" rx="1.5" fill={WOOD} stroke={INK} strokeWidth="1.8" />
      <circle cx="27" cy="17" r="4.6" fill="#f39a2e" stroke={INK} strokeWidth="1.4" />
      <circle cx="37" cy="17.5" r="4.2" fill="#f39a2e" stroke={INK} strokeWidth="1.4" />
      <path d="M27 12.5 q1.5 -2 3.5 -1.5" stroke="#3d8a4f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  );
}

export function Zabuton() {
  return (
    <>
      <ellipse cx="32" cy="50" rx="25" ry="4" fill="#000" opacity="0.12" />
      <path d="M8 26 Q6 18 14 16 H50 Q58 18 56 26 V40 Q58 48 50 49 H14 Q6 48 8 40 Z" fill="#7d5aa6" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 21 H52" stroke="#9a7bc0" strokeWidth="1.4" />
      <path d="M29 32.5 L35 32.5 M32 29.5 V35.5" stroke={YELLOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 26 l-4 -2 M56 26 l4 -2 M8 40 l-4 2 M56 40 l4 2" stroke={YELLOW} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

export function ElectricFan() {
  return (
    <>
      <ellipse cx="32" cy="57" rx="15" ry="4" fill={SHADE} stroke={INK} strokeWidth="1.8" />
      <rect x="30" y="38" width="4" height="18" fill={SHADE} stroke={INK} strokeWidth="1.4" />
      <circle cx="32" cy="23" r="19" fill="#eaf3fb" stroke={INK} strokeWidth="2" />
      <g className="pic-anim-spin">
        <circle cx="32" cy="23" r="16" fill="none" />
        <path d="M32 23 Q24 10 32 8 Q40 10 32 23 Z" fill={BLUE} />
        <path d="M32 23 Q46 22 45 31 Q38 36 32 23 Z" fill={BLUE} />
        <path d="M32 23 Q26 36 19 31 Q18 22 32 23 Z" fill={BLUE} />
      </g>
      <circle cx="32" cy="23" r="3" fill={INK} />
      <path d="M32 4 V42 M13 23 H51 M18.5 9.5 L45.5 36.5 M45.5 9.5 L18.5 36.5" stroke={INK} strokeWidth="0.6" opacity="0.45" />
    </>
  );
}

export function AirConditioner() {
  return (
    <>
      <rect x="4" y="10" width="56" height="24" rx="9" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M10 28 H54" stroke={SHADE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="17" r="1.6" fill="#7ad17a" />
      <path d="M12 42 q3 -3 6 0 t6 0 M28 46 q3 -3 6 0 t6 0 M42 42 q3 -3 6 0 t6 0" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 52 q3 -3 6 0 t6 0 M36 54 q3 -3 6 0 t6 0" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

export function UmbrellaStand() {
  return (
    <>
      <path d="M24 33 V10 Q24 5 19 5 Q15 5 15 9" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M33 33 V7 Q33 3 37 3 Q41 3 41 7" fill="none" stroke={WOOD_D} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M41 33 V14 Q41 10 45 10 Q49 10 49 14" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 33 L24 22 L28 33 Z" fill="#4f7fd1" />
      <path d="M29 33 L33 18 L37 33 Z" fill={RED} />
      <path d="M37 33 L41 24 L45 33 Z" fill="#62b37e" />
      <rect x="16" y="32" width="32" height="28" rx="3" fill={STEEL} stroke={INK} strokeWidth="2" />
      <path d="M16 40 H48" stroke={INK} strokeWidth="1.4" opacity="0.5" />
    </>
  );
}

export function Remote() {
  return (
    <>
      <path d="M26 6 q6 -4 12 0 M23 3 q9 -5 18 0" fill="none" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="21" y="9" width="22" height="52" rx="9" fill="#4a5566" stroke={INK} strokeWidth="2" />
      <circle cx="32" cy="17" r="3.2" fill="#e8584f" />
      <g fill="#c8d0dc">
        <rect x="25" y="25" width="5" height="3.5" rx="1.2" />
        <rect x="34" y="25" width="5" height="3.5" rx="1.2" />
        <rect x="25" y="31" width="5" height="3.5" rx="1.2" />
        <rect x="34" y="31" width="5" height="3.5" rx="1.2" />
        <rect x="25" y="37" width="5" height="3.5" rx="1.2" />
        <rect x="34" y="37" width="5" height="3.5" rx="1.2" />
      </g>
      <circle cx="32" cy="50" r="5" fill="#6b778a" stroke="#c8d0dc" strokeWidth="1.2" />
    </>
  );
}

export function Intercom() {
  return (
    <>
      <rect x="15" y="4" width="34" height="56" rx="5" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="20" y="10" width="24" height="19" rx="2" fill="#7fb6e0" stroke={INK} strokeWidth="1.4" />
      <circle cx="32" cy="17" r="3.4" fill="#3f6f9e" />
      <path d="M25 29 Q25 22 32 22 Q39 22 39 29 Z" fill="#3f6f9e" />
      <g fill={INK} opacity="0.5">
        <circle cx="27" cy="35" r="0.9" />
        <circle cx="30" cy="35" r="0.9" />
        <circle cx="33" cy="35" r="0.9" />
        <circle cx="36" cy="35" r="0.9" />
        <circle cx="28.5" cy="38" r="0.9" />
        <circle cx="31.5" cy="38" r="0.9" />
        <circle cx="34.5" cy="38" r="0.9" />
      </g>
      <rect x="20" y="43" width="11" height="10" rx="2.5" fill="#62b37e" stroke={INK} strokeWidth="1.2" />
      <rect x="33" y="43" width="11" height="10" rx="2.5" fill={SHADE} stroke={INK} strokeWidth="1.2" />
    </>
  );
}

export function ParcelLocker() {
  return (
    <>
      <rect x="3" y="3" width="44" height="57" rx="2" fill={SHADE} stroke={INK} strokeWidth="2" />
      <rect x="7" y="7" width="16" height="15" rx="1" fill={BODY} stroke={INK} strokeWidth="1.2" />
      <rect x="7" y="25" width="16" height="15" rx="1" fill={BODY} stroke={INK} strokeWidth="1.2" />
      <rect x="7" y="43" width="16" height="13" rx="1" fill={BODY} stroke={INK} strokeWidth="1.2" />
      <rect x="27" y="7" width="16" height="10" rx="1" fill="#2d3644" />
      <g fill={BODY}>
        <rect x="28" y="20" width="4" height="3" rx="0.6" />
        <rect x="33" y="20" width="4" height="3" rx="0.6" />
        <rect x="38" y="20" width="4" height="3" rx="0.6" />
        <rect x="28" y="25" width="4" height="3" rx="0.6" />
        <rect x="33" y="25" width="4" height="3" rx="0.6" />
        <rect x="38" y="25" width="4" height="3" rx="0.6" />
      </g>
      <rect x="27" y="32" width="16" height="24" rx="1" fill={BODY} stroke={INK} strokeWidth="1.2" />
      <path d="M19 12 V17 M19 30 V35 M19 47 V51" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="36" y="42" width="25" height="18" rx="1.5" fill="#d2a066" stroke={INK} strokeWidth="1.8" />
      <path d="M36 48 H61 M48.5 42 V60" stroke="#a87a43" strokeWidth="2" />
    </>
  );
}

export function InsectScreen() {
  const mesh = [];
  for (let x = 12; x < 52; x += 3) mesh.push(<path key={`v${x}`} d={`M${x} 8 V56`} stroke="#7e8a99" strokeWidth="0.55" />);
  for (let y = 10; y < 56; y += 3) mesh.push(<path key={`h${y}`} d={`M10 ${y} H52`} stroke="#7e8a99" strokeWidth="0.55" />);
  return (
    <>
      <rect x="8" y="6" width="46" height="52" fill="#cbd4de" opacity="0.6" />
      {mesh}
      <rect x="8" y="6" width="46" height="52" rx="1" fill="none" stroke="#8a95a5" strokeWidth="3.2" />
      <rect x="49" y="26" width="3" height="10" rx="1.5" fill={INK} />
    </>
  );
}

export function LaundryPole() {
  return (
    <>
      <path d="M6 6 V20 M58 6 V20" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M2 12 H62" stroke={STEEL} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M17 12 V16 M43 12 V16" stroke={INK} strokeWidth="1.4" />
      <path d="M10 22 L17 16 L24 22 L22 25 H22 V46 H12 V25 H12 Z" fill="#5aa9e6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 22 L7 28 L12 30 M24 22 L27 28 L22 30" fill="#5aa9e6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="35" y="16" width="16" height="30" rx="1" fill="#f6efe2" stroke={INK} strokeWidth="1.6" />
      <path d="M35 40 H51" stroke="#e8a54b" strokeWidth="2" />
      <rect x="38" y="13" width="3" height="5" rx="1" fill={RED} />
      <rect x="45" y="13" width="3" height="5" rx="1" fill={RED} />
    </>
  );
}

export function Hanger() {
  return (
    <>
      <path d="M32 18 V13 Q32 7 37 7 Q42 7 42 12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M32 18 L6 40 Q4 44 9 44 H55 Q60 44 58 40 Z" fill="none" stroke={STEEL} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M32 18 L6 40 Q4 44 9 44 H55 Q60 44 58 40 Z" fill="none" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
    </>
  );
}

/* ---------- Kitchen / Bathroom ---------- */

export function Microwave() {
  return (
    <>
      <rect x="4" y="12" width="56" height="40" rx="4" fill={BODY} stroke={INK} strokeWidth="2" />
      <rect x="9" y="17" width="34" height="30" rx="2" fill="#3e4a5c" stroke={INK} strokeWidth="1.4" />
      <rect x="11" y="19" width="30" height="26" rx="1.5" fill="#f7c86a" opacity="0.35" />
      <ellipse cx="26" cy="40" rx="10" ry="2.6" fill="#e5e9ef" />
      <rect x="20" y="33" width="12" height="6" rx="2" fill="#e8a54b" />
      <rect x="47" y="18" width="9" height="6" rx="1" fill="#2d3644" />
      <circle cx="51.5" cy="31" r="3" fill={SHADE} stroke={INK} strokeWidth="1.2" />
      <rect x="47" y="38" width="9" height="3" rx="1" fill={SHADE} />
      <rect x="47" y="43" width="9" height="3" rx="1" fill="#62b37e" />
    </>
  );
}

export function GasStove() {
  return (
    <>
      <rect x="3" y="26" width="58" height="24" rx="3" fill={SHADE} stroke={INK} strokeWidth="2" />
      <ellipse cx="16" cy="26" rx="10" ry="3.4" fill="#2d3644" />
      <ellipse cx="48" cy="26" rx="10" ry="3.4" fill="#2d3644" />
      <path d="M10 25 Q11 18 13 23 Q15 15 16 23 Q18 16 19 23 Q21 18 22 25 Z" fill={BLUE} />
      <path d="M42 25 Q43 18 45 23 Q47 15 48 23 Q50 16 51 23 Q53 18 54 25 Z" fill={BLUE} />
      <rect x="22" y="33" width="20" height="11" rx="1.5" fill="#2d3644" stroke={INK} strokeWidth="1.2" />
      <rect x="28" y="36" width="8" height="2" rx="1" fill={STEEL} />
      <circle cx="11" cy="40" r="3.4" fill={BODY} stroke={INK} strokeWidth="1.4" />
      <circle cx="53" cy="40" r="3.4" fill={BODY} stroke={INK} strokeWidth="1.4" />
    </>
  );
}

export function Faucet() {
  return (
    <>
      <rect x="2" y="24" width="10" height="14" rx="1.5" fill={SHADE} stroke={INK} strokeWidth="1.8" />
      <path d="M12 27 H34 Q44 27 44 37 V42" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 27 H34 Q44 27 44 37 V42" fill="none" stroke={STEEL} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 24 V14" stroke={INK} strokeWidth="2.4" />
      <path d="M17 14 H35 M26 8 V20" stroke={RED} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M44 49 Q41 54 44 56 Q47 54 44 49 Z" fill={BLUE} />
    </>
  );
}

export function Pot() {
  return (
    <>
      <path d="M8 31 H4 M56 31 H60" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M10 28 H54 V50 Q54 56 48 56 H16 Q10 56 10 50 Z" fill={SHADE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 36 H54" stroke={STEEL} strokeWidth="1.4" />
      <path d="M8 27 Q32 14 56 27 Z" fill={BODY} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="27" y="14" width="10" height="5" rx="2.5" fill={WOOD} stroke={INK} strokeWidth="1.6" />
    </>
  );
}

export function CuttingBoard() {
  return (
    <>
      <rect x="6" y="14" width="52" height="36" rx="4" fill="#ecd7ae" stroke={INK} strokeWidth="2" />
      <path d="M6 44 H58" stroke="#cdb382" strokeWidth="1.4" />
      <circle cx="51" cy="20" r="2.4" fill={BODY} stroke={INK} strokeWidth="1.2" />
      <g stroke={INK} strokeWidth="1">
        <circle cx="20" cy="31" r="4" fill="#f39a2e" />
        <circle cx="29" cy="32" r="4" fill="#f39a2e" />
        <circle cx="25" cy="38" r="4" fill="#f39a2e" />
      </g>
      <g fill="#9fd36b" stroke="#4e8a2f" strokeWidth="0.8">
        <circle cx="40" cy="30" r="2" />
        <circle cx="45" cy="33" r="2" />
        <circle cx="40" cy="36" r="2" />
        <circle cx="46" cy="39" r="2" />
      </g>
    </>
  );
}

export function Ladle() {
  return (
    <>
      <path d="M50 5 L30 39" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M50 5 L30 39" stroke={STEEL} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="51" cy="5" r="2.2" fill="none" stroke={INK} strokeWidth="1.4" />
      <path d="M12 40 H48 Q48 58 30 58 Q12 58 12 40 Z" fill={SHADE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="30" cy="40" rx="18" ry="3" fill={STEEL} stroke={INK} strokeWidth="1.6" />
    </>
  );
}

export function WashBowl() {
  return (
    <>
      <ellipse cx="32" cy="54" rx="18" ry="4" fill="#000" opacity="0.1" />
      <path d="M8 26 L14 50 Q16 54 22 54 H42 Q48 54 50 50 L56 26 Z" fill={YELLOW} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="32" cy="26" rx="24" ry="6" fill="#f7da73" stroke={INK} strokeWidth="2" />
      <ellipse cx="32" cy="27" rx="19" ry="3.6" fill="#bfe3f5" />
      <path d="M19 38 H45" stroke="#d8a92a" strokeWidth="1.6" />
    </>
  );
}

export function BathStool() {
  return (
    <>
      <path d="M2 56 H62" {...line} />
      <path d="M12 34 Q11 50 16 56 H24 Q22 46 24 40 H40 Q42 46 40 56 H48 Q53 50 52 34 Z" fill="#8fd1e8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="6" y="27" width="52" height="9" rx="4.5" fill="#bfe8f5" stroke={INK} strokeWidth="2" />
      <rect x="26" y="29.5" width="12" height="4" rx="2" fill="#6bb8d2" />
    </>
  );
}

/* ---------- School / Restaurant / Office ---------- */

export function Randoseru() {
  return (
    <>
      <path d="M22 12 Q22 4 32 4 Q42 4 42 12" fill="none" stroke={INK} strokeWidth="2.4" />
      <rect x="12" y="10" width="40" height="48" rx="9" fill="#b8322f" stroke={INK} strokeWidth="2" />
      <path d="M12 22 Q12 10 24 10 H40 Q52 10 52 22 V44 Q52 48 48 48 H16 Q12 48 12 44 Z" fill={RED} stroke={INK} strokeWidth="2" />
      <path d="M16 18 Q16 14 22 14 H42 Q48 14 48 18" fill="none" stroke="#f08a80" strokeWidth="1.4" strokeDasharray="2 2" />
      <rect x="28" y="40" width="8" height="10" rx="2" fill={YELLOW} stroke={INK} strokeWidth="1.6" />
      <rect x="30.5" y="43" width="3" height="4" rx="1" fill="#b8902a" />
    </>
  );
}

export function Blackboard() {
  return (
    <>
      <rect x="3" y="6" width="58" height="42" rx="2" fill="#2f6b4f" stroke={WOOD_D} strokeWidth="3" />
      <path d="M11 17 Q15 13 20 17 T29 17" fill="none" stroke="#f3f0e8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 27 H38 M11 35 H30" stroke="#f3f0e8" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <circle cx="47" cy="25" r="7" fill="none" stroke="#ffe48a" strokeWidth="1.6" />
      <rect x="3" y="48" width="58" height="5" rx="1" fill={WOOD} stroke={INK} strokeWidth="1.4" />
      <rect x="12" y="45" width="10" height="3" rx="1.5" fill="#f3f0e8" />
      <rect x="40" y="43" width="12" height="5" rx="1" fill="#556070" stroke={INK} strokeWidth="1" />
    </>
  );
}

export function NoticeBoard() {
  return (
    <>
      <rect x="3" y="6" width="58" height="46" rx="2" fill="#c9935a" stroke={WOOD_D} strokeWidth="3" />
      <g transform="rotate(-6 18 22)">
        <rect x="9" y="13" width="18" height="20" fill={BODY} stroke={INK} strokeWidth="1.2" />
        <path d="M12 19 H24 M12 23 H24 M12 27 H20" stroke={STEEL} strokeWidth="1.2" />
      </g>
      <rect x="31" y="11" width="22" height="14" fill="#fff4b8" stroke={INK} strokeWidth="1.2" />
      <path d="M34 16 H50 M34 20 H46" stroke={STEEL} strokeWidth="1.2" />
      <g transform="rotate(5 44 38)">
        <rect x="34" y="29" width="20" height="17" fill="#d8ecff" stroke={INK} strokeWidth="1.2" />
        <path d="M37 34 H51 M37 38 H47" stroke={STEEL} strokeWidth="1.2" />
      </g>
      <circle cx="18" cy="13" r="2" fill={RED} />
      <circle cx="42" cy="11" r="2" fill="#4f7fd1" />
      <circle cx="44" cy="29" r="2" fill="#62b37e" />
      <path d="M14 52 V60 M50 52 V60" stroke={WOOD_D} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function Noren() {
  return (
    <>
      <path d="M3 8 H61" stroke={WOOD_D} strokeWidth="4" strokeLinecap="round" />
      <path d="M6 10 H21 V50 H6 Z M24.5 10 H39.5 V50 H24.5 Z M43 10 H58 V50 H43 Z" fill="#2f4d7a" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 15 H58" stroke="#5574a3" strokeWidth="1.2" />
      <circle cx="32" cy="31" r="9" fill="none" stroke="#f3f0e8" strokeWidth="2.4" />
      <path d="M13 24 q2 4 0 8 t0 8 M50 24 q2 4 0 8 t0 8" fill="none" stroke="#f3f0e8" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

export function Thermometer() {
  return (
    <g transform="rotate(-38 32 32)">
      <rect x="9" y="25" width="44" height="14" rx="7" fill={BODY} stroke={INK} strokeWidth="2" />
      <path d="M53 29 H59 Q61 32 59 35 H53 Z" fill={STEEL} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="20" y="28" width="22" height="8" rx="1.5" fill="#cfd9c4" stroke={INK} strokeWidth="1" />
      <path d="M24 30.5 h3 v3 h-3 Z M29 30.5 h3 v3 h-3 Z" fill="none" stroke="#2d3644" strokeWidth="0.9" />
      <circle cx="33.5" cy="34" r="0.6" fill="#2d3644" />
      <path d="M35 30.5 h3 v3 h-3" fill="none" stroke="#2d3644" strokeWidth="0.9" />
      <circle cx="14" cy="32" r="2" fill="#4f7fd1" />
    </g>
  );
}

export function ShoppingBasket() {
  const holes = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      holes.push(<rect key={`${r}-${c}`} x={14 + c * 6.2 + r * 0.6} y={33 + r * 7} width="3.6" height="4.4" rx="1" fill="#a52e28" />);
    }
  }
  return (
    <>
      <path d="M16 28 Q16 8 32 8 Q48 8 48 28" fill="none" stroke={STEEL} strokeWidth="3.2" />
      <path d="M8 26 H56 L50 58 H14 Z" fill={RED} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="6" y="24" width="52" height="5" rx="1.5" fill="#e8655d" stroke={INK} strokeWidth="1.8" />
      {holes}
    </>
  );
}

export function EmergencyExit() {
  return (
    <>
      <rect x="2" y="12" width="60" height="40" rx="3" fill="#1f9d55" stroke={INK} strokeWidth="2" />
      <rect x="38" y="17" width="18" height="30" fill="#f7fbf8" />
      <rect x="41" y="20" width="12" height="27" fill="#1f9d55" opacity="0.18" />
      <circle cx="22" cy="20" r="3.4" fill="#f7fbf8" />
      <g stroke="#f7fbf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 25 L24 35" />
        <path d="M15 28 L21 25 L28 27" />
        <path d="M24 35 L31 40 L36 39" />
        <path d="M24 35 L18 41 L12 41" />
      </g>
    </>
  );
}
