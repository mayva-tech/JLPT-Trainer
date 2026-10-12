/**
 * Inside a commuter train (電車の中) — original illustration, 1600 × 1000.
 *
 * The view across the car of a typical long-bench commuter train: hand
 * straps over the seats, the luggage rack, the priority-seat section with its
 * own colour and sticker, a hanging ad, the door with the next-station
 * display, the emergency button on the door pillar, and the 足元 warning on
 * the floor. Every tappable object is one `<g data-obj="…">`.
 */
export function TrainArt() {
  const seatDividers = [388, 486, 584, 682, 780, 878];
  const strapXs = [345, 440, 535, 630, 725, 820, 915];
  const priorityStrapXs = [1060, 1150, 1240];
  return (
    <g>
      <defs>
        <linearGradient id="t-ceiling" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5f3" />
          <stop offset="1" stopColor="#e3e6e4" />
        </linearGradient>
        <linearGradient id="t-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0ed" />
          <stop offset="1" stopColor="#dfe3df" />
        </linearGradient>
        <linearGradient id="t-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a968c" />
          <stop offset="1" stopColor="#7e7a71" />
        </linearGradient>
        <linearGradient id="t-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3577a3" />
          <stop offset="1" stopColor="#245a7f" />
        </linearGradient>
        <linearGradient id="t-seat-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a8cb8" />
          <stop offset="1" stopColor="#2f6f99" />
        </linearGradient>
        <linearGradient id="t-prio" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b4554" />
          <stop offset="1" stopColor="#77303d" />
        </linearGradient>
        <linearGradient id="t-prio-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b15666" />
          <stop offset="1" stopColor="#8e3d4b" />
        </linearGradient>
        <linearGradient id="t-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9d8ee" />
          <stop offset="1" stopColor="#e3eef4" />
        </linearGradient>
        <linearGradient id="t-pole" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f979e" />
          <stop offset="0.45" stopColor="#f2f4f5" />
          <stop offset="1" stopColor="#868e95" />
        </linearGradient>
        <linearGradient id="t-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9cdd0" />
          <stop offset="0.5" stopColor="#e2e5e7" />
          <stop offset="1" stopColor="#c4c8cb" />
        </linearGradient>
        <linearGradient id="t-ad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7d9a8" />
          <stop offset="1" stopColor="#e8935a" />
        </linearGradient>
        <pattern id="t-moq" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="none" />
          <circle cx="3" cy="3" r="1.4" fill="#ffffff" opacity="0.12" />
          <circle cx="10" cy="10" r="1.4" fill="#000000" opacity="0.1" />
        </pattern>
      </defs>

      {/* ── car body ── */}
      <rect width="1600" height="1000" fill="url(#t-wall)" />
      <rect width="1600" height="96" fill="url(#t-ceiling)" />
      <rect x="160" y="26" width="1120" height="18" rx="9" fill="#fffef6" />
      <rect x="160" y="26" width="1120" height="18" rx="9" fill="none" stroke="#d9dcd6" strokeWidth="2" />
      <rect y="92" width="1600" height="6" fill="#cdd2cf" />
      <rect y="760" width="1600" height="240" fill="url(#t-floor)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="0" y1={800 + i * 48} x2="1600" y2={800 + i * 48} stroke="#6f6b63" strokeWidth="1.5" opacity="0.25" />
      ))}

      {/* ── left door (next car side), not tappable ── */}
      <g>
        <rect x="0" y="118" width="262" height="642" fill="url(#t-door)" />
        <rect x="40" y="226" width="180" height="330" rx="10" fill="url(#t-out)" stroke="#aeb4b8" strokeWidth="6" />
        <rect x="248" y="118" width="18" height="642" fill="#3a3d40" />
        <rect x="262" y="96" width="30" height="664" fill="#d5d9d6" />
      </g>

      {/* ── 窓 window over the seats ── */}
      <g data-obj="window">
        <rect x="296" y="300" width="670" height="208" rx="10" fill="#b8bec2" />
        <rect x="306" y="310" width="650" height="188" rx="6" fill="url(#t-out)" />
        {/* passing town, motion-blurred */}
        <path d="M306 430 L360 430 L360 392 L410 392 L410 418 L470 418 L470 370 L520 370 L520 410 L600 410 L600 384 L660 384 L660 422 L730 422 L730 360 L790 360 L790 404 L870 404 L870 380 L956 380 L956 498 L306 498 Z" fill="#a7b9c4" opacity="0.75" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="306" y1={448 + i * 12} x2="956" y2={448 + i * 12} stroke="#8fa2ad" strokeWidth="3" opacity="0.4" />
        ))}
        <path d="M330 316 L420 316 L360 490 L310 490 Z" fill="#ffffff" opacity="0.18" />
        <rect x="626" y="310" width="10" height="188" fill="#b8bec2" />
      </g>

      {/* priority-section window (part of the car, not a separate object) */}
      <g>
        <rect x="1008" y="300" width="286" height="208" rx="10" fill="#b8bec2" />
        <rect x="1018" y="310" width="266" height="188" rx="6" fill="url(#t-out)" />
        <path d="M1018 420 L1070 420 L1070 386 L1130 386 L1130 410 L1190 410 L1190 372 L1284 372 L1284 498 L1018 498 Z" fill="#a7b9c4" opacity="0.75" />
        {/* 優先席 sticker */}
        <rect x="1200" y="318" width="76" height="34" rx="4" fill="#f08c2b" />
        <text x="1238" y="342" textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">優先席</text>
      </g>

      {/* ── 網棚 luggage rack ── */}
      <g data-obj="luggage-rack">
        <rect x="292" y="262" width="1010" height="10" rx="5" fill="url(#t-pole)" />
        <rect x="292" y="284" width="1010" height="9" rx="4.5" fill="url(#t-pole)" />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1={304 + i * 25} y1="270" x2={304 + i * 25} y2="286" stroke="#a2a9af" strokeWidth="3" />
        ))}
        {[300, 640, 980, 1290].map((x) => (
          <path key={x} d={`M${x} 262 L${x} 236 L${x + 10} 236`} stroke="#9aa2a8" strokeWidth="6" fill="none" />
        ))}
      </g>

      {/* ── つり革 hand straps (regular section) ── */}
      <g data-obj="hand-strap">
        <rect x="310" y="128" width="660" height="10" rx="5" fill="url(#t-pole)" />
        {strapXs.map((x) => (
          <g key={x}>
            <rect x={x - 7} y="136" width="14" height="74" rx="3" fill="#e9ebe8" stroke="#c6cac6" strokeWidth="1.5" />
            <path d={`M${x} 206 L${x - 24} 252 L${x + 24} 252 Z`} fill="none" stroke="#f6f6f2" strokeWidth="9" strokeLinejoin="round" />
            <path d={`M${x} 206 L${x - 24} 252 L${x + 24} 252 Z`} fill="none" stroke="#c9ccc8" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        ))}
      </g>

      {/* priority-section straps (yellow) — part of the scenery */}
      <g>
        <rect x="1030" y="128" width="250" height="10" rx="5" fill="url(#t-pole)" />
        {priorityStrapXs.map((x) => (
          <g key={x}>
            <rect x={x - 7} y="136" width="14" height="74" rx="3" fill="#f2c94c" />
            <circle cx={x} cy="230" r="21" fill="none" stroke="#f2c94c" strokeWidth="8" />
          </g>
        ))}
      </g>

      {/* ── 中吊り広告 hanging ad ── */}
      <g data-obj="hanging-ad">
        <line x1="1050" y1="96" x2="1050" y2="108" stroke="#8d959b" strokeWidth="3" />
        <line x1="1270" y1="96" x2="1270" y2="108" stroke="#8d959b" strokeWidth="3" />
        <rect x="1030" y="106" width="260" height="8" rx="2" fill="#9aa1a7" />
        <rect x="1034" y="112" width="252" height="108" fill="url(#t-ad)" stroke="#d7d1c4" strokeWidth="2" />
        <circle cx="1252" cy="146" r="22" fill="#c8402e" opacity="0.85" />
        <path d="M1236 190 q16 -30 32 0 Z" fill="#7a4a2a" />
        <path d="M1150 216 L1196 180 L1242 216 Z" fill="#a85a2e" opacity="0.55" />
        <text x="1050" y="146" fontSize="24" fontWeight="800" fill="#5a2a16" fontFamily="'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif">秋の京都へ</text>
        <text x="1050" y="172" fontSize="14" fill="#5a2a16" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">紅葉の旅 はじまる</text>
      </g>

      {/* ── 座席 seat (long bench) ── */}
      <g data-obj="seat">
        <rect x="292" y="508" width="690" height="134" rx="14" fill="url(#t-seat)" />
        <rect x="292" y="508" width="690" height="134" rx="14" fill="url(#t-moq)" />
        {seatDividers.map((x) => (
          <line key={x} x1={x} y1="516" x2={x} y2="636" stroke="#1f4d6e" strokeWidth="2" opacity="0.6" />
        ))}
        <path d="M286 640 L988 640 L1000 690 L274 690 Z" fill="url(#t-seat-top)" />
        <path d="M286 640 L988 640 L1000 690 L274 690 Z" fill="url(#t-moq)" />
        <rect x="274" y="690" width="726" height="40" fill="#1d3f59" />
        <rect x="300" y="730" width="674" height="30" fill="#4e5257" opacity="0.5" />
      </g>

      {/* ── 優先席 priority seat ── */}
      <g data-obj="priority-seat">
        <rect x="1006" y="508" width="292" height="134" rx="14" fill="url(#t-prio)" />
        <rect x="1006" y="508" width="292" height="134" rx="14" fill="url(#t-moq)" />
        <line x1="1103" y1="516" x2="1103" y2="636" stroke="#5e2430" strokeWidth="2" opacity="0.6" />
        <line x1="1200" y1="516" x2="1200" y2="636" stroke="#5e2430" strokeWidth="2" opacity="0.6" />
        <path d="M1000 640 L1304 640 L1312 690 L992 690 Z" fill="url(#t-prio-top)" />
        <path d="M1000 640 L1304 640 L1312 690 L992 690 Z" fill="url(#t-moq)" />
        <rect x="992" y="690" width="320" height="40" fill="#55222c" />
      </g>

      {/* ── 乗客 a passenger on the bench ── */}
      <g data-obj="passenger">
        {/* legs and shoes */}
        <path d="M600 650 L606 752 L632 752 L630 676 L648 676 L650 752 L676 752 L682 650 Z" fill="#2f3440" />
        <ellipse cx="616" cy="758" rx="20" ry="7" fill="#1b1d22" />
        <ellipse cx="664" cy="758" rx="20" ry="7" fill="#1b1d22" />
        {/* coat */}
        <path d="M584 486 Q640 462 696 486 L706 664 L574 664 Z" fill="#6b7a5e" />
        <path d="M640 474 L640 664" stroke="#57654b" strokeWidth="3" />
        <path d="M606 488 L640 520 L674 488" fill="none" stroke="#e8e2d6" strokeWidth="10" />
        {/* arms holding a phone */}
        <path d="M590 504 Q570 580 620 604" stroke="#6b7a5e" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M690 504 Q710 580 660 604" stroke="#6b7a5e" strokeWidth="26" fill="none" strokeLinecap="round" />
        <rect x="624" y="578" width="32" height="44" rx="5" fill="#22252b" transform="rotate(-12 640 600)" />
        <rect x="628" y="582" width="24" height="34" rx="3" fill="#9fd3f0" opacity="0.8" transform="rotate(-12 640 600)" />
        <circle cx="622" cy="606" r="9" fill="#e8c4a2" />
        <circle cx="658" cy="606" r="9" fill="#e8c4a2" />
        {/* head */}
        <rect x="628" y="444" width="24" height="26" fill="#e3bb98" />
        <ellipse cx="640" cy="424" rx="34" ry="38" fill="#ecc8a6" />
        <path d="M604 420 Q604 378 640 378 Q678 378 676 420 Q664 400 640 402 Q616 402 604 420 Z" fill="#2d241f" />
        <path d="M624 436 q6 4 12 0 M644 436 q6 4 12 0" stroke="#5a4334" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M632 452 q8 4 16 0" stroke="#b77d66" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* ── 手すり grab pole between the sections ── */}
      <g data-obj="handrail">
        <rect x="986" y="292" width="16" height="470" rx="8" fill="url(#t-pole)" />
        <rect x="980" y="290" width="28" height="10" rx="4" fill="#8d959b" />
        <rect x="980" y="752" width="28" height="10" rx="4" fill="#8d959b" />
      </g>

      {/* door pillar with the emergency button */}
      <rect x="1298" y="96" width="40" height="664" fill="#d5d9d6" />
      <g data-obj="emergency-button">
        <rect x="1302" y="380" width="32" height="76" rx="4" fill="#f4d23f" stroke="#c9a514" strokeWidth="2" />
        <circle cx="1318" cy="404" r="11" fill="#d93a2b" stroke="#a52418" strokeWidth="2" />
        <text x="1318" y="442" textAnchor="middle" fontSize="13" fontWeight="800" fill="#3a2a00" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">非常</text>
      </g>

      {/* ── ドア door (with the next-station display above) ── */}
      <g data-obj="door">
        <rect x="1338" y="118" width="262" height="642" fill="#3a3d40" />
        <rect x="1342" y="118" width="128" height="642" fill="url(#t-door)" />
        <rect x="1474" y="118" width="126" height="642" fill="url(#t-door)" />
        <rect x="1366" y="226" width="86" height="330" rx="10" fill="url(#t-out)" stroke="#aeb4b8" strokeWidth="6" />
        <rect x="1492" y="226" width="86" height="330" rx="10" fill="url(#t-out)" stroke="#aeb4b8" strokeWidth="6" />
        <rect x="1468" y="118" width="8" height="642" fill="#25272a" />
        <path d="M1372 240 L1400 240 L1376 330 Z" fill="#ffffff" opacity="0.3" />
        <path d="M1498 240 L1526 240 L1502 330 Z" fill="#ffffff" opacity="0.3" />
      </g>
      <g>
        <rect x="1360" y="62" width="218" height="46" rx="6" fill="#1d2126" />
        <rect x="1366" y="68" width="206" height="34" rx="3" fill="#0d1014" />
        <text x="1376" y="93" fontSize="20" fontWeight="700" fill="#ffb347" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">次は</text>
        <text x="1426" y="94" fontSize="22" fontWeight="700" fill="#f4f4f4" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">新宿</text>
        <text x="1484" y="93" fontSize="14" fill="#9fd0ff" fontFamily="sans-serif">Shinjuku</text>
      </g>

      {/* ── 足元 floor warning in front of the door ── */}
      <rect x="1338" y="760" width="262" height="14" fill="#f2c94c" opacity="0.9" />
      <g data-obj="mind-your-step">
        <path d="M1360 860 L1580 860 L1596 926 L1344 926 Z" fill="#f2c94c" />
        <path d="M1360 860 L1580 860 L1596 926 L1344 926 Z" fill="none" stroke="#2b2b2b" strokeWidth="3" />
        <text x="1470" y="904" textAnchor="middle" fontSize="27" fontWeight="800" fill="#2b2b2b" fontFamily="'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif">足元注意</text>
      </g>

      {/* soft shadow under the bench */}
      <rect x="274" y="758" width="1038" height="10" fill="#5d5a53" opacity="0.35" />
    </g>
  );
}
