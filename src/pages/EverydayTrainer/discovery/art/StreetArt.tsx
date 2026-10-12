/**
 * A Japanese side street (街中) — original illustration, 1600 × 1000.
 *
 * Seen from the near pavement: houses and a small shop across the road, a
 * concrete utility pole, a curve mirror at the corner, a vending machine, a
 * crossing with its horizontal traffic light, the gutter grating, a manhole,
 * a cone, and on the near side the guardrail, tactile paving, a postbox and a
 * bus stop. Every tappable object is one `<g data-obj="…">`.
 */
export function StreetArt() {
  const jp = "'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif";
  // Crosswalk bars, far → near: they widen and thicken towards the viewer.
  const bars = [
    { y: 514, h: 12, x0: 1180, x1: 1460 },
    { y: 540, h: 15, x0: 1172, x1: 1470 },
    { y: 570, h: 18, x0: 1163, x1: 1481 },
    { y: 606, h: 21, x0: 1153, x1: 1493 },
    { y: 648, h: 24, x0: 1142, x1: 1506 },
    { y: 694, h: 26, x0: 1130, x1: 1520 },
  ];
  return (
    <g>
      <defs>
        <linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc4ea" />
          <stop offset="1" stopColor="#e4f1f9" />
        </linearGradient>
        <linearGradient id="s-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a6d72" />
          <stop offset="1" stopColor="#4f5257" />
        </linearGradient>
        <linearGradient id="s-walk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfc8bb" />
          <stop offset="1" stopColor="#b9b1a3" />
        </linearGradient>
        <linearGradient id="s-concrete" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a9a96" />
          <stop offset="0.45" stopColor="#d6d5d0" />
          <stop offset="1" stopColor="#8e8e8a" />
        </linearGradient>
        <linearGradient id="s-orange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9601e" />
          <stop offset="0.5" stopColor="#f58a3c" />
          <stop offset="1" stopColor="#c9551a" />
        </linearGradient>
        <linearGradient id="s-red" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b5221c" />
          <stop offset="0.45" stopColor="#e5463a" />
          <stop offset="1" stopColor="#a41d18" />
        </linearGradient>
        <linearGradient id="s-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8f2f8" />
          <stop offset="1" stopColor="#9fb4c2" />
        </linearGradient>
        <linearGradient id="s-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f979e" />
          <stop offset="0.45" stopColor="#e9ecee" />
          <stop offset="1" stopColor="#868e95" />
        </linearGradient>
        <pattern id="s-tiles" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="none" />
          <path d="M0 29.5 H60 M30 0 V15 M0 15 H60 M0 0 V15 M60 15 V30" stroke="#a49c8e" strokeWidth="1.5" opacity="0.5" />
        </pattern>
      </defs>

      {/* ── sky and town across the road ── */}
      <rect width="1600" height="1000" fill="url(#s-sky)" />
      <g opacity="0.85">
        <ellipse cx="260" cy="90" rx="90" ry="22" fill="#ffffff" />
        <ellipse cx="320" cy="74" rx="60" ry="22" fill="#ffffff" />
        <ellipse cx="1180" cy="58" rx="80" ry="18" fill="#ffffff" />
      </g>

      {/* two-storey house with a tiled roof */}
      <g>
        <rect x="0" y="246" width="270" height="232" fill="#efe6d4" />
        <path d="M-20 252 L135 160 L290 252 Z" fill="#545b66" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={-20 + i * 26} y1="252" x2={135} y2="160" stroke="#3e444d" strokeWidth="1.5" opacity="0.5" />
        ))}
        <rect x="30" y="290" width="70" height="56" fill="#9cb7c6" stroke="#7a6a55" strokeWidth="4" />
        <rect x="160" y="290" width="70" height="56" fill="#9cb7c6" stroke="#7a6a55" strokeWidth="4" />
        <rect x="160" y="384" width="80" height="94" fill="#7a5a3e" />
        <rect x="30" y="384" width="90" height="70" fill="#9cb7c6" stroke="#7a6a55" strokeWidth="4" />
        <rect x="0" y="456" width="270" height="22" fill="#b9b2a4" />
      </g>

      {/* small shop with an awning */}
      <g>
        <rect x="610" y="268" width="420" height="210" fill="#e7ddc9" />
        <rect x="600" y="252" width="440" height="22" fill="#6b5a48" />
        <rect x="640" y="282" width="190" height="40" rx="4" fill="#24476b" />
        <text x="735" y="311" textAnchor="middle" fontSize="24" fontWeight="700" fill="#ffffff" fontFamily={jp}>山田商店</text>
        <path d="M612 330 L1028 330 L1040 362 L600 362 Z" fill="#2f7d55" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={612 + i * 54} y="330" width="27" height="32" fill="#f2f0e8" opacity="0.9" />
        ))}
        <rect x="630" y="370" width="200" height="108" fill="#a9c1cf" stroke="#6b5a48" strokeWidth="4" />
        <rect x="630" y="370" width="200" height="108" fill="#ffffff" opacity="0.15" />
      </g>

      {/* apartment block */}
      <g>
        <rect x="1090" y="110" width="510" height="368" fill="#d8d4cc" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <g key={`${r}-${c}`}>
              <rect x={1110 + c * 122} y={130 + r * 112} width="96" height="60" fill="#8fa9b8" />
              <rect x={1104 + c * 122} y={192 + r * 112} width="108" height="26" fill="#c3beb4" />
              <line x1={1104 + c * 122} y1={198 + r * 112} x2={1212 + c * 122} y2={198 + r * 112} stroke="#a59f93" strokeWidth="2" />
            </g>
          )),
        )}
        <rect x="1090" y="446" width="510" height="32" fill="#b4afa5" />
      </g>

      {/* power lines (scenery; the pole itself is tappable) */}
      <g stroke="#2f3236" strokeWidth="2.5" fill="none" opacity="0.85">
        <path d="M0 108 Q150 128 300 96 Q760 150 1600 92" />
        <path d="M0 126 Q150 146 300 116 Q760 170 1600 112" />
        <path d="M0 74 Q150 92 300 64 Q760 116 1600 58" />
      </g>

      {/* far pavement */}
      <rect x="0" y="478" width="1600" height="30" fill="#c4bdb0" />
      <rect x="0" y="504" width="1600" height="6" fill="#a39b8d" />

      {/* ── 電柱 utility pole ── */}
      <g data-obj="utility-pole">
        <path d="M290 36 L314 36 L320 482 L284 482 Z" fill="url(#s-concrete)" />
        <rect x="250" y="80" width="104" height="10" rx="3" fill="#7d7d79" />
        {[260, 300, 340].map((x) => (
          <rect key={x} x={x - 4} y="64" width="8" height="18" rx="3" fill="#e9e7e1" />
        ))}
        <rect x="318" y="150" width="36" height="58" rx="10" fill="#8d9296" />
        <rect x="320" y="146" width="32" height="8" rx="3" fill="#6f7478" />
        {/* yellow-black guard sleeve at the foot */}
        <path d="M285 400 L319 400 L320 482 L284 482 Z" fill="#f2c94c" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M284 ${410 + i * 20} L320 ${398 + i * 20} L320 ${408 + i * 20} L284 ${420 + i * 20} Z`} fill="#2b2b2b" />
        ))}
      </g>

      {/* ── 街灯 streetlight ── */}
      <g data-obj="streetlight">
        <rect x="552" y="140" width="10" height="342" rx="4" fill="url(#s-steel)" />
        <path d="M557 144 Q560 108 600 108 L640 108" stroke="#9aa2a8" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M618 102 L678 102 L670 122 L626 122 Z" fill="#5d646b" />
        <rect x="628" y="120" width="40" height="5" rx="2" fill="#fffbe0" />
        <rect x="548" y="472" width="18" height="10" rx="2" fill="#7e868d" />
      </g>

      {/* ── 自動販売機 vending machine ── */}
      <g data-obj="vending-machine">
        <rect x="856" y="296" width="132" height="186" rx="6" fill="#f3f3ef" stroke="#c3c5c2" strokeWidth="2" />
        <rect x="864" y="304" width="116" height="94" rx="3" fill="#dfe9ef" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4, 5].map((c) => {
            const colors = ["#d43b2f", "#2e7bc4", "#f0b429", "#3a9d5d", "#7a4ea3", "#e07a2f"];
            return (
              <g key={`${r}-${c}`}>
                <rect x={869 + c * 18.5} y={309 + r * 30} width="12" height="22" rx="4" fill={colors[(r * 2 + c) % colors.length]} />
                <rect x={869 + c * 18.5} y={332 + r * 30} width="12" height="4" rx="1" fill="#2a2d31" />
              </g>
            );
          }),
        )}
        <rect x="864" y="404" width="116" height="10" fill="#d43b2f" />
        <rect x="944" y="420" width="28" height="22" rx="3" fill="#c9cbc8" />
        <rect x="954" y="424" width="8" height="12" rx="2" fill="#5d6166" />
        <rect x="876" y="450" width="92" height="22" rx="3" fill="#2e3237" />
      </g>

      {/* ── カーブミラー curve mirror ── */}
      <g data-obj="curve-mirror">
        <rect x="1060" y="226" width="12" height="256" fill="url(#s-orange)" />
        <circle cx="1066" cy="196" r="44" fill="url(#s-orange)" />
        <circle cx="1066" cy="196" r="36" fill="url(#s-mirror)" />
        <path d="M1042 214 Q1066 196 1092 214" stroke="#7d8f9b" strokeWidth="5" fill="none" opacity="0.6" />
        <ellipse cx="1054" cy="182" rx="10" ry="6" fill="#ffffff" opacity="0.8" />
        <rect x="1044" y="250" width="44" height="18" rx="3" fill="#ffffff" stroke="#d9601e" strokeWidth="2" />
        <text x="1066" y="264" textAnchor="middle" fontSize="12" fontWeight="700" fill="#d9601e" fontFamily={jp}>注意</text>
      </g>

      {/* ── 車道 roadway ── */}
      <g data-obj="roadway">
        <rect x="0" y="510" width="1600" height="210" fill="url(#s-road)" />
        <rect x="0" y="520" width="1600" height="4" fill="#e9e9e4" opacity="0.8" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={20 + i * 130} y="612" width="80" height="6" fill="#f2f1ea" />
        ))}
      </g>

      {/* ── 横断歩道 crosswalk ── */}
      <g data-obj="crosswalk">
        {bars.map((b) => (
          <path key={b.y} d={`M${b.x0} ${b.y} L${b.x1} ${b.y} L${b.x1 + 4} ${b.y + b.h} L${b.x0 - 4} ${b.y + b.h} Z`} fill="#f4f3ee" />
        ))}
      </g>

      {/* ── マンホール manhole ── */}
      <g data-obj="manhole">
        <ellipse cx="520" cy="664" rx="70" ry="18" fill="#3f4246" />
        <ellipse cx="520" cy="662" rx="62" ry="15" fill="#5c6065" />
        <ellipse cx="520" cy="662" rx="44" ry="10" fill="none" stroke="#3f4246" strokeWidth="3" />
        <path d="M486 662 Q520 650 554 662 Q520 674 486 662 Z" fill="#4c5055" />
        <circle cx="520" cy="662" r="4" fill="#3f4246" />
      </g>

      {/* ── カラーコーン traffic cone ── */}
      <g data-obj="traffic-cone">
        <rect x="878" y="640" width="70" height="12" rx="3" fill="#c9551a" />
        <path d="M902 560 L924 560 L942 642 L884 642 Z" fill="url(#s-orange)" />
        <path d="M896 590 L930 590 L934 606 L892 606 Z" fill="#f4f3ee" />
        <path d="M889 620 L937 620 L939 630 L887 630 Z" fill="#f4f3ee" />
        <rect x="904" y="554" width="18" height="8" rx="3" fill="#c9551a" />
      </g>

      {/* ── 排水溝 gutter grating ── */}
      <g data-obj="drainage-channel">
        <rect x="0" y="718" width="1110" height="24" fill="#8f8d86" />
        <rect x="0" y="721" width="1110" height="18" fill="#3c3e40" />
        {Array.from({ length: 74 }, (_, i) => (
          <rect key={i} x={4 + i * 15} y="722" width="9" height="16" fill="#76797c" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={`j${i}`} x={i * 140} y="720" width="4" height="20" fill="#9a9890" />
        ))}
      </g>

      {/* curb + near pavement */}
      <rect x="0" y="742" width="1600" height="20" fill="#d9d4ca" />
      <rect x="0" y="760" width="1600" height="4" fill="#a8a093" />
      <path d="M1110 718 L1130 718 L1130 742 L1110 742 Z" fill="#9c988f" />

      {/* ── 歩道 pavement ── */}
      <g data-obj="sidewalk">
        <rect x="0" y="764" width="1600" height="236" fill="url(#s-walk)" />
        <rect x="0" y="764" width="1600" height="236" fill="url(#s-tiles)" />
      </g>

      {/* ── 点字ブロック tactile paving ── */}
      <g data-obj="tactile-paving">
        <rect x="0" y="880" width="1600" height="46" fill="#f2c430" />
        {Array.from({ length: 53 }, (_, i) => (
          <g key={i}>
            <rect x={6 + i * 30} y="886" width="22" height="5" rx="2.5" fill="#d9a915" />
            <rect x={6 + i * 30} y="900" width="22" height="5" rx="2.5" fill="#d9a915" />
            <rect x={6 + i * 30} y="914" width="22" height="5" rx="2.5" fill="#d9a915" />
          </g>
        ))}
        <rect x="0" y="880" width="1600" height="46" fill="none" stroke="#c99a0c" strokeWidth="2" />
      </g>

      {/* ── ガードレール guardrail ── */}
      <g data-obj="guardrail">
        {[156, 436, 716, 996].map((x) => (
          <g key={x}>
            <rect x={x} y="776" width="14" height="92" fill="url(#s-steel)" />
            <ellipse cx={x + 7} cy="868" rx="11" ry="4" fill="#77706a" opacity="0.6" />
          </g>
        ))}
        <path d="M124 778 L1034 778 L1034 822 L124 822 Z" fill="#f5f5f2" />
        <path d="M124 792 L1034 792 M124 808 L1034 808" stroke="#c9cbc9" strokeWidth="3" />
        <path d="M124 778 L1034 778" stroke="#dcdfe0" strokeWidth="2" />
        <rect x="118" y="776" width="10" height="48" rx="4" fill="#e1e3e2" />
        <rect x="1030" y="776" width="10" height="48" rx="4" fill="#e1e3e2" />
      </g>

      {/* ── ポスト postbox ── */}
      <g data-obj="postbox">
        <ellipse cx="1150" cy="944" rx="54" ry="10" fill="#7d7468" opacity="0.5" />
        <rect x="1110" y="900" width="80" height="44" fill="#7a1612" />
        <path d="M1104 790 Q1104 752 1150 752 Q1196 752 1196 790 L1196 904 L1104 904 Z" fill="url(#s-red)" />
        <rect x="1118" y="800" width="64" height="9" rx="3" fill="#3a0c09" />
        <rect x="1120" y="824" width="60" height="34" rx="3" fill="#f7f2ea" />
        <text x="1150" y="848" textAnchor="middle" fontSize="18" fontWeight="800" fill="#b5221c" fontFamily={jp}>〒 郵便</text>
        <rect x="1100" y="784" width="100" height="8" rx="3" fill="#a41d18" />
      </g>

      {/* ── バス停 bus stop ── */}
      <g data-obj="bus-stop">
        <ellipse cx="66" cy="984" rx="44" ry="9" fill="#7d7468" opacity="0.5" />
        <rect x="34" y="956" width="64" height="30" rx="6" fill="#6f747a" />
        <rect x="61" y="592" width="10" height="368" fill="url(#s-steel)" />
        <circle cx="66" cy="560" r="46" fill="#ffffff" stroke="#2d6db3" strokeWidth="8" />
        <rect x="42" y="534" width="48" height="26" rx="6" fill="#2d6db3" />
        <rect x="46" y="538" width="16" height="10" rx="2" fill="#dbeafa" />
        <rect x="68" y="538" width="16" height="10" rx="2" fill="#dbeafa" />
        <circle cx="52" cy="562" r="4" fill="#2d6db3" />
        <circle cx="80" cy="562" r="4" fill="#2d6db3" />
        <text x="66" y="588" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1d3f6b" fontFamily={jp}>市役所前</text>
        <rect x="40" y="620" width="52" height="70" rx="3" fill="#f7f7f2" stroke="#9aa1a8" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="46" y1={634 + i * 14} x2="86" y2={634 + i * 14} stroke="#9aa1a8" strokeWidth="2" />
        ))}
      </g>

      {/* traffic-light pole on the near corner (scenery) */}
      <rect x="1556" y="70" width="18" height="884" fill="url(#s-steel)" />
      <rect x="1360" y="112" width="200" height="10" rx="4" fill="#8d959b" />
      <ellipse cx="1565" cy="956" rx="30" ry="8" fill="#7d7468" opacity="0.5" />
      {/* pedestrian signal on the pole */}
      <rect x="1514" y="430" width="42" height="96" rx="6" fill="#3a3f45" />
      <rect x="1520" y="436" width="30" height="40" rx="3" fill="#2a2e33" />
      <rect x="1520" y="480" width="30" height="40" rx="3" fill="#2a2e33" />
      <path d="M1535 488 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M1535 494 L1535 508 M1528 500 L1542 500 M1535 508 L1529 518 M1535 508 L1541 518" stroke="#3ad4a0" strokeWidth="3" fill="none" />

      {/* ── 信号 traffic light (horizontal, Japanese style) ── */}
      <g data-obj="traffic-light">
        <rect x="1250" y="92" width="196" height="64" rx="14" fill="#3a3f45" />
        <rect x="1250" y="88" width="196" height="10" rx="4" fill="#4a5057" />
        {[
          { cx: 1284, color: "#2fd59a", lit: true },
          { cx: 1348, color: "#f6c33b", lit: false },
          { cx: 1412, color: "#ef4b3f", lit: false },
        ].map((l) => (
          <g key={l.cx}>
            <path d={`M${l.cx - 28} 104 L${l.cx + 28} 104 L${l.cx + 24} 96 L${l.cx - 24} 96 Z`} fill="#2b2f34" />
            <circle cx={l.cx} cy="126" r="22" fill={l.lit ? l.color : "#23272b"} />
            {l.lit ? <circle cx={l.cx} cy="126" r="30" fill={l.color} opacity="0.25" /> : null}
            <circle cx={l.cx} cy="126" r="22" fill="none" stroke="#1d2024" strokeWidth="3" />
          </g>
        ))}
      </g>
    </g>
  );
}
