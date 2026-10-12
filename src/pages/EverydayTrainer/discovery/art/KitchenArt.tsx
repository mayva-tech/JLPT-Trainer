/**
 * Japanese apartment kitchen (台所) — original illustration, 1600 × 1000.
 *
 * A one-wall "system kitchen" as in most rental flats: range hood over a
 * two-burner gas hob with the fish-grill drawer under it, rice cooker on the
 * worktop, sink under the little window, fridge with the microwave on top,
 * and a dish cabinet by the door. Every tappable object is one
 * `<g data-obj="…">`; the hotspots in ../scenes/kitchen.ts were traced from
 * these groups (scripts note in ../scenes/README.md).
 */
export function KitchenArt() {
  return (
    <g>
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1ece2" />
          <stop offset="1" stopColor="#e2dacb" />
        </linearGradient>
        <linearGradient id="k-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8784c" />
          <stop offset="1" stopColor="#8a5f3b" />
        </linearGradient>
        <linearGradient id="k-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4e7ea" />
          <stop offset="1" stopColor="#a9b0b7" />
        </linearGradient>
        <linearGradient id="k-steel-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa2aa" />
          <stop offset="0.45" stopColor="#eef1f3" />
          <stop offset="1" stopColor="#8f979f" />
        </linearGradient>
        <linearGradient id="k-cream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ebe4d3" />
          <stop offset="0.35" stopColor="#f7f2e6" />
          <stop offset="1" stopColor="#ddd5c2" />
        </linearGradient>
        <linearGradient id="k-white" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ecebe6" />
          <stop offset="0.4" stopColor="#fafaf7" />
          <stop offset="1" stopColor="#e2e1db" />
        </linearGradient>
        <linearGradient id="k-hood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1c1e21" />
          <stop offset="0.6" stopColor="#34373b" />
          <stop offset="1" stopColor="#212326" />
        </linearGradient>
        <linearGradient id="k-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9b6e45" />
          <stop offset="0.5" stopColor="#b5875b" />
          <stop offset="1" stopColor="#946840" />
        </linearGradient>
        <linearGradient id="k-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9e8ec" stopOpacity="0.85" />
          <stop offset="1" stopColor="#b8cdd4" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="k-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8ee" />
          <stop offset="1" stopColor="#c3d0d8" />
        </linearGradient>
        <radialGradient id="k-light" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#fffbe8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="k-pan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b5513a" />
          <stop offset="1" stopColor="#7a2f22" />
        </linearGradient>
      </defs>

      {/* ── room ── */}
      <rect width="1600" height="1000" fill="url(#k-wall)" />
      <rect width="1600" height="56" fill="#f6f3ed" />
      <rect y="54" width="1600" height="6" fill="#d8cfbf" />
      <rect y="850" width="1600" height="150" fill="url(#k-floor)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={i * 230 - 40} y1="850" x2={i * 230 - 120} y2="1000" stroke="#7d5636" strokeWidth="2" opacity="0.45" />
      ))}
      <line x1="0" y1="905" x2="1600" y2="905" stroke="#7d5636" strokeWidth="1.5" opacity="0.3" />
      <line x1="0" y1="960" x2="1600" y2="960" stroke="#7d5636" strokeWidth="1.5" opacity="0.3" />
      <rect y="842" width="1600" height="12" fill="#7a5a3e" />

      {/* curtain by the balcony door */}
      <g>
        <rect x="0" y="62" width="96" height="790" fill="#f3eee2" />
        {[10, 30, 52, 74].map((x) => (
          <path key={x} d={`M${x} 62 C ${x + 8} 300, ${x - 6} 560, ${x + 6} 850`} stroke="#d9d0bd" strokeWidth="7" fill="none" opacity="0.8" />
        ))}
        <rect x="0" y="58" width="104" height="8" rx="3" fill="#b9ad97" />
      </g>

      {/* wall details: thermostat, outlet */}
      <circle cx="1452" cy="318" r="16" fill="#f7f5ef" stroke="#cfc7b6" strokeWidth="2" />
      <circle cx="1452" cy="318" r="5" fill="#cfc7b6" />
      <rect x="1440" y="372" width="24" height="34" rx="3" fill="#f7f5ef" stroke="#cfc7b6" strokeWidth="2" />

      {/* ── backsplash and window over the sink ── */}
      <rect x="365" y="372" width="752" height="222" fill="#d8d0c0" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <line key={i} x1={365 + i * 63} y1="372" x2={365 + i * 63} y2="594" stroke="#c9c0ae" strokeWidth="1.5" />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={i} x1="365" y1={428 + i * 56} x2="1117" y2={428 + i * 56} stroke="#c9c0ae" strokeWidth="1.5" />
      ))}
      <g>
        <rect x="930" y="402" width="172" height="138" fill="#5c4434" />
        <rect x="940" y="412" width="152" height="118" fill="url(#k-window)" />
        <line x1="1016" y1="412" x2="1016" y2="530" stroke="#5c4434" strokeWidth="6" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1="940" y1={420 + i * 20} x2="1092" y2={420 + i * 20} stroke="#a8b8c2" strokeWidth="1" opacity="0.7" />
        ))}
        <rect x="1052" y="460" width="10" height="22" rx="2" fill="#3a2c22" />
      </g>

      {/* ── upper cabinets and the under-cabinet light ── */}
      <g>
        <rect x="650" y="140" width="467" height="232" fill="url(#k-white)" stroke="#cfccc3" strokeWidth="2" />
        {[650, 806, 962].map((x) => (
          <g key={x}>
            <rect x={x + 6} y="146" width="144" height="220" fill="#f6f6f2" stroke="#d6d3ca" strokeWidth="2" />
            <rect x={x + 54} y="350" width="48" height="6" rx="3" fill="#b3b7bb" />
          </g>
        ))}
        <rect x="760" y="372" width="150" height="12" rx="3" fill="#fffdf2" />
        <path d="M740 384 L930 384 L1000 560 L670 560 Z" fill="url(#k-light)" opacity="0.6" />
      </g>

      {/* ── 換気扇 range hood ── */}
      <g data-obj="vent-fan">
        <path d="M440 140 L645 140 L645 300 L380 300 L380 236 Z" fill="url(#k-hood)" />
        <path d="M440 140 L380 236 L380 300 L392 300 L392 240 L450 148 Z" fill="#45494e" opacity="0.6" />
        <rect x="376" y="298" width="273" height="26" rx="3" fill="#2a2c30" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <line key={i} x1={396 + i * 19} y1="304" x2={396 + i * 19} y2="320" stroke="#4d5156" strokeWidth="3" />
        ))}
        <rect x="560" y="262" width="56" height="16" rx="3" fill="#191a1c" />
        <circle cx="574" cy="270" r="3" fill="#7cc89a" />
        <rect x="586" y="266" width="22" height="8" rx="2" fill="#3a3d41" />
      </g>

      {/* ── dish cabinet 食器棚 ── */}
      <g data-obj="dish-cabinet">
        <rect x="104" y="296" width="234" height="556" rx="4" fill="url(#k-wood)" />
        <rect x="116" y="310" width="210" height="246" fill="#6f4b2e" />
        {/* shelves behind glass: plates, bowls, cups */}
        <rect x="120" y="390" width="202" height="6" fill="#8b6340" />
        <rect x="120" y="470" width="202" height="6" fill="#8b6340" />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={`p${i}`} cx={146 + i * 9} cy="360" rx="6" ry="28" fill="#f4f1ea" stroke="#d5cfc2" strokeWidth="1.5" />
        ))}
        <path d="M222 388 q22 -36 44 0 Z" fill="#f2efe6" stroke="#cfc9bb" strokeWidth="1.5" />
        <path d="M262 388 q20 -32 40 0 Z" fill="#7d93b0" />
        <path d="M134 468 q20 -30 40 0 Z" fill="#e9d6b4" />
        <path d="M180 468 q20 -30 40 0 Z" fill="#e9d6b4" />
        <rect x="236" y="434" width="26" height="34" rx="4" fill="#f4f1ea" stroke="#cfc9bb" strokeWidth="1.5" />
        <rect x="272" y="438" width="26" height="30" rx="4" fill="#3f6b88" />
        <path d="M262 444 q10 2 10 12 q0 10 -10 10" stroke="#cfc9bb" strokeWidth="3" fill="none" />
        {[0, 1, 2].map((i) => (
          <rect key={`g${i}`} x={136 + i * 56} y="500" width="44" height="50" rx="3" fill="#e8edf0" opacity="0.8" />
        ))}
        {/* glass doors */}
        <rect x="116" y="310" width="104" height="246" fill="url(#k-glass)" opacity="0.38" />
        <rect x="222" y="310" width="104" height="246" fill="url(#k-glass)" opacity="0.38" />
        <line x1="221" y1="310" x2="221" y2="556" stroke="#8b6340" strokeWidth="4" />
        <rect x="208" y="420" width="5" height="34" rx="2" fill="#d7c9a9" />
        <rect x="229" y="420" width="5" height="34" rx="2" fill="#d7c9a9" />
        {/* open counter, drawers, lower doors */}
        <rect x="116" y="566" width="210" height="56" fill="#5a3c25" />
        <rect x="150" y="590" width="66" height="32" rx="5" fill="#d8d4cc" />
        <rect x="158" y="584" width="50" height="8" rx="3" fill="#bfbab0" />
        <rect x="116" y="630" width="210" height="58" fill="#a87a4f" stroke="#86603d" strokeWidth="2" />
        <rect x="200" y="652" width="42" height="7" rx="3" fill="#d7c9a9" />
        <rect x="116" y="694" width="104" height="146" fill="#a87a4f" stroke="#86603d" strokeWidth="2" />
        <rect x="222" y="694" width="104" height="146" fill="#a87a4f" stroke="#86603d" strokeWidth="2" />
        <rect x="206" y="740" width="5" height="34" rx="2" fill="#d7c9a9" />
        <rect x="231" y="740" width="5" height="34" rx="2" fill="#d7c9a9" />
      </g>

      {/* ── base cabinets ── */}
      <g>
        <rect x="365" y="640" width="752" height="206" fill="#f2f1ec" stroke="#d2cfc6" strokeWidth="2" />
        <rect x="365" y="838" width="752" height="12" fill="#2f3033" />
        {/* stove section doors */}
        <rect x="371" y="726" width="132" height="112" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="507" y="726" width="132" height="112" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="420" y="736" width="36" height="5" rx="2.5" fill="#b3b7bb" />
        <rect x="554" y="736" width="36" height="5" rx="2.5" fill="#b3b7bb" />
        {/* middle drawer + door */}
        <rect x="645" y="646" width="118" height="46" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="684" y="664" width="40" height="5" rx="2.5" fill="#b3b7bb" />
        <rect x="645" y="696" width="118" height="142" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="684" y="708" width="40" height="5" rx="2.5" fill="#b3b7bb" />
        {/* sink doors */}
        <rect x="769" y="646" width="170" height="192" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="943" y="646" width="168" height="192" fill="#f7f7f3" stroke="#d6d3ca" strokeWidth="2" />
        <rect x="834" y="660" width="40" height="5" rx="2.5" fill="#b3b7bb" />
        <rect x="1007" y="660" width="40" height="5" rx="2.5" fill="#b3b7bb" />
      </g>

      {/* ── worktop ── */}
      <path d="M352 588 L1130 588 L1117 614 L365 614 Z" fill="#cfd4d8" />
      <rect x="360" y="612" width="762" height="30" fill="url(#k-steel)" />
      <rect x="360" y="640" width="762" height="4" fill="#8d949b" />

      {/* ── コンロ gas hob ── */}
      <g data-obj="stove">
        <path d="M382 590 L640 590 L636 612 L378 612 Z" fill="#26282b" />
        <ellipse cx="446" cy="601" rx="44" ry="8" fill="none" stroke="#5c6066" strokeWidth="4" />
        <ellipse cx="580" cy="601" rx="44" ry="8" fill="none" stroke="#5c6066" strokeWidth="4" />
        <ellipse cx="446" cy="601" rx="16" ry="3.5" fill="#3d4146" />
        <ellipse cx="580" cy="601" rx="16" ry="3.5" fill="#3d4146" />
        <path d="M402 601 h88 M446 593 v16 M536 601 h88 M580 593 v16" stroke="#4b4f55" strokeWidth="4" />
        {/* control strip on the cabinet front */}
        <rect x="371" y="646" width="268" height="76" fill="#1f2124" />
        <circle cx="398" cy="684" r="13" fill="#3a3d42" stroke="#5a5e64" strokeWidth="2" />
        <rect x="395" y="673" width="6" height="12" rx="2" fill="#c9cdd2" />
        <circle cx="612" cy="684" r="13" fill="#3a3d42" stroke="#5a5e64" strokeWidth="2" />
        <rect x="609" y="673" width="6" height="12" rx="2" fill="#c9cdd2" />
      </g>

      {/* ── 魚焼きグリル fish-grill drawer ── */}
      <g data-obj="fish-grill">
        <rect x="428" y="654" width="166" height="56" rx="4" fill="#2b2e32" stroke="#4a4e54" strokeWidth="2" />
        <rect x="446" y="664" width="130" height="26" rx="3" fill="#121315" />
        <rect x="446" y="664" width="130" height="8" rx="3" fill="#3b4046" opacity="0.7" />
        <rect x="482" y="696" width="58" height="8" rx="3" fill="#8d939a" />
      </g>

      {/* ── フライパン frying pan (left burner) ── */}
      <g data-obj="frying-pan">
        <path d="M378 578 L352 568 L348 576 L374 588 Z" fill="#2b2b2d" />
        <rect x="342" y="564" width="16" height="12" rx="4" fill="#3a3a3d" transform="rotate(20 350 570)" />
        <path d="M378 580 Q380 600 446 602 Q512 600 514 580 Z" fill="#6d2b20" />
        <ellipse cx="446" cy="580" rx="68" ry="13" fill="url(#k-pan)" />
        <ellipse cx="446" cy="580" rx="58" ry="9" fill="#2f2c2a" />
        <ellipse cx="436" cy="578" rx="20" ry="3" fill="#4a4542" />
      </g>

      {/* ── 鍋 pot (right burner) ── */}
      <g data-obj="pot">
        <rect x="530" y="532" width="100" height="62" fill="url(#k-steel-h)" />
        <ellipse cx="580" cy="594" rx="50" ry="8" fill="#8a9199" />
        <rect x="516" y="546" width="16" height="8" rx="3" fill="#2b2b2d" />
        <rect x="628" y="546" width="16" height="8" rx="3" fill="#2b2b2d" />
        <path d="M528 534 Q580 504 632 534 Z" fill="#cdd3d8" stroke="#9aa2aa" strokeWidth="2" />
        <ellipse cx="580" cy="533" rx="52" ry="7" fill="#b9c0c6" />
        <rect x="570" y="506" width="20" height="10" rx="4" fill="#2b2b2d" />
        <rect x="574" y="514" width="12" height="6" fill="#55595e" />
      </g>

      {/* ── 炊飯器 rice cooker ── */}
      <g data-obj="rice-cooker">
        <ellipse cx="728" cy="608" rx="58" ry="7" fill="#b9b4aa" opacity="0.6" />
        <path d="M672 560 Q672 532 700 530 L758 530 Q786 532 786 560 L786 596 Q786 608 774 608 L684 608 Q672 608 672 596 Z" fill="url(#k-white)" stroke="#d4d1c8" strokeWidth="2" />
        <path d="M676 552 Q680 528 704 526 L754 526 Q778 528 782 552 Z" fill="#f5f4f0" stroke="#d4d1c8" strokeWidth="2" />
        <path d="M698 526 Q728 506 760 526" stroke="#cfccc3" strokeWidth="7" fill="none" strokeLinecap="round" />
        <rect x="696" y="562" width="66" height="26" rx="6" fill="#33383e" />
        <rect x="702" y="567" width="26" height="12" rx="2" fill="#8fd0c1" />
        <circle cx="740" cy="575" r="4" fill="#e7a24c" />
        <circle cx="752" cy="575" r="4" fill="#c9ced3" />
        <rect x="716" y="592" width="26" height="6" rx="3" fill="#cfccc3" />
      </g>

      {/* ── まな板 cutting board + 包丁 knife (at its far end) ── */}
      <g data-obj="cutting-board">
        <path d="M802 588 L936 588 L944 610 L796 610 Z" fill="#e6cc9f" />
        <path d="M812 593 L860 593 M808 600 L852 600" stroke="#d2b483" strokeWidth="2" />
        <rect x="796" y="609" width="148" height="8" fill="#c9a875" />
      </g>
      <g data-obj="kitchen-knife">
        <path d="M876 594 L922 589 L926 598 L882 601 Q872 599 876 594 Z" fill="#dfe4e8" stroke="#9aa2aa" strokeWidth="1.5" />
        <rect x="921" y="589" width="5" height="10" fill="#a9b0b7" />
        <rect x="925" y="590" width="34" height="8" rx="4" fill="#4a3426" />
        <circle cx="934" cy="594" r="1.6" fill="#c9b38c" />
        <circle cx="950" cy="594" r="1.6" fill="#c9b38c" />
      </g>

      {/* ── 流し sink ── */}
      <g data-obj="sink">
        <path d="M958 592 L1104 592 L1100 612 L952 612 Z" fill="#8c949b" />
        <path d="M966 595 L1096 595 L1093 610 L960 610 Z" fill="#6f777f" />
        <ellipse cx="1050" cy="606" rx="8" ry="2.5" fill="#3d4247" />
        <path d="M966 595 L1096 595 L1095 599 L965 599 Z" fill="#b6bdc3" opacity="0.8" />
      </g>

      {/* ── 蛇口 faucet ── */}
      <g data-obj="faucet">
        <rect x="1032" y="580" width="22" height="12" rx="3" fill="#a3abb3" />
        <rect x="1036" y="548" width="14" height="36" fill="url(#k-steel-h)" />
        <path d="M1043 552 Q1043 532 1022 532 Q1004 532 1004 552 L1004 562" stroke="#aeb5bc" strokeWidth="9" fill="none" strokeLinecap="round" />
        <rect x="999" y="558" width="11" height="9" rx="2" fill="#8d959d" />
        <path d="M1040 546 L1066 530" stroke="#c4cad0" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* ── 冷蔵庫 fridge, 冷凍庫 freezer drawer ── */}
      <g data-obj="fridge">
        <rect x="1128" y="356" width="268" height="494" rx="12" fill="url(#k-cream)" stroke="#cfc6b2" strokeWidth="2" />
        <rect x="1136" y="362" width="252" height="276" rx="8" fill="url(#k-cream)" stroke="#d9d0bc" strokeWidth="2" />
        <rect x="1230" y="438" width="112" height="10" rx="5" fill="#d8cfbb" stroke="#c6bca5" strokeWidth="1.5" />
        <rect x="1136" y="644" width="252" height="98" rx="8" fill="url(#k-cream)" stroke="#d9d0bc" strokeWidth="2" />
        <path d="M1220 652 Q1262 662 1304 652" stroke="#cbc1ab" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="1150" y="842" width="24" height="12" rx="3" fill="#bcb4a3" />
        <rect x="1350" y="842" width="24" height="12" rx="3" fill="#bcb4a3" />
      </g>
      <g data-obj="freezer">
        <rect x="1136" y="748" width="252" height="94" rx="8" fill="url(#k-cream)" stroke="#d9d0bc" strokeWidth="2" />
        <path d="M1220 756 Q1262 766 1304 756" stroke="#cbc1ab" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="1350" y="760" width="22" height="10" rx="3" fill="#cfe1ea" stroke="#a9c2cf" strokeWidth="1" />
      </g>

      {/* ── 電子レンジ microwave on the fridge ── */}
      <g data-obj="microwave">
        <rect x="1150" y="244" width="226" height="110" rx="8" fill="url(#k-white)" stroke="#d2cfc6" strokeWidth="2" />
        <rect x="1162" y="256" width="140" height="86" rx="5" fill="#2c3136" />
        <rect x="1170" y="264" width="124" height="70" rx="3" fill="#3b434a" />
        <path d="M1176 270 L1206 270 L1180 300 Z" fill="#5c6670" opacity="0.6" />
        <rect x="1312" y="262" width="54" height="18" rx="3" fill="#c7d7cf" />
        <circle cx="1339" cy="306" r="14" fill="#efeee9" stroke="#bcb9b0" strokeWidth="2" />
        <line x1="1339" y1="296" x2="1339" y2="306" stroke="#7d7a73" strokeWidth="3" />
        <rect x="1318" y="326" width="42" height="10" rx="3" fill="#d6d3cb" />
      </g>

      {/* ── ゴミ箱 pedal bin ── */}
      <g data-obj="trash-can">
        <ellipse cx="1476" cy="864" rx="58" ry="8" fill="#6d4c31" opacity="0.5" />
        <path d="M1428 752 L1524 752 L1516 860 L1436 860 Z" fill="#d9dcdf" stroke="#b5bbc1" strokeWidth="2" />
        <rect x="1422" y="736" width="108" height="20" rx="8" fill="#c3c9ce" stroke="#a9b0b7" strokeWidth="2" />
        <rect x="1466" y="728" width="20" height="10" rx="4" fill="#a9b0b7" />
        <rect x="1452" y="854" width="44" height="10" rx="3" fill="#7b838a" />
        <line x1="1436" y1="790" x2="1516" y2="790" stroke="#c6cbd0" strokeWidth="2" />
      </g>

      {/* shadows on the floor */}
      <rect x="104" y="852" width="234" height="8" fill="#5e412a" opacity="0.35" />
      <rect x="1128" y="852" width="268" height="8" fill="#5e412a" opacity="0.35" />
    </g>
  );
}
