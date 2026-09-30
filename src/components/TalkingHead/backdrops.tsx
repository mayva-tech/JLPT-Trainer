import type { SceneBackdrop } from "../../services/sceneBus";

/**
 * Situation backdrops drawn behind the head(s). One shared viewBox
 * (0 0 200 110) sliced to the stage: solo shows roughly the middle
 * (x 50–150), duo shows the full width — so key details sit in the middle
 * and extras live at the sides. Colours are kept soft so faces stay in front.
 */

function Home() {
  return (
    <g>
      <rect width="200" height="110" fill="#eadfcb" />
      <rect y="92" width="200" height="18" fill="#b98b5e" />
      <path d="M0 92 L200 92" stroke="#9c7248" strokeWidth="1.2" />
      <rect x="66" y="10" width="68" height="46" rx="2" fill="#f7f3ea" />
      <rect x="69" y="13" width="62" height="40" fill="#bfe0f0" />
      <path d="M69 44 Q86 36 100 42 Q116 34 131 40 L131 53 L69 53 Z" fill="#9ccf9a" />
      <path d="M100 13 L100 53 M69 33 L131 33" stroke="#f7f3ea" strokeWidth="2" />
      <path d="M60 8 Q64 32 58 60 L68 60 Q70 32 68 8 Z" fill="#d88a6a" />
      <path d="M140 8 Q136 32 142 60 L132 60 Q130 32 132 8 Z" fill="#d88a6a" />
      <rect x="56" y="6" width="88" height="3" rx="1.5" fill="#8a6a4a" />
      <path d="M160 92 L168 44 L176 92" stroke="#6a5a4a" strokeWidth="1.4" fill="none" />
      <path d="M160 44 L176 44 L172 30 L164 30 Z" fill="#f2d49a" />
      <rect x="18" y="74" width="16" height="18" rx="2" fill="#c8704a" />
      <circle cx="26" cy="66" r="10" fill="#6aa86a" />
      <circle cx="20" cy="60" r="6" fill="#7ab87a" />
      <circle cx="32" cy="58" r="6" fill="#5a985a" />
      <rect x="182" y="30" width="14" height="18" rx="1" fill="#f7f3ea" stroke="#a88a6a" />
      <circle cx="189" cy="39" r="4.5" fill="#e8c46a" />
    </g>
  );
}

function Office() {
  return (
    <g>
      <rect width="200" height="110" fill="#dfe4ea" />
      <rect x="10" y="6" width="180" height="70" rx="2" fill="#cfe2f3" />
      <g fill="#a6b6c8">
        <rect x="14" y="40" width="18" height="36" />
        <rect x="34" y="28" width="14" height="48" />
        <rect x="50" y="46" width="22" height="30" />
        <rect x="74" y="22" width="16" height="54" />
        <rect x="92" y="38" width="20" height="38" />
        <rect x="114" y="30" width="14" height="46" />
        <rect x="130" y="48" width="22" height="28" />
        <rect x="154" y="26" width="16" height="50" />
        <rect x="172" y="42" width="16" height="34" />
      </g>
      <g fill="#dbe7f3" opacity="0.8">
        <rect x="37" y="33" width="3" height="3" />
        <rect x="42" y="33" width="3" height="3" />
        <rect x="37" y="40" width="3" height="3" />
        <rect x="77" y="28" width="3" height="3" />
        <rect x="83" y="28" width="3" height="3" />
        <rect x="77" y="36" width="3" height="3" />
        <rect x="117" y="36" width="3" height="3" />
        <rect x="122" y="36" width="3" height="3" />
        <rect x="157" y="32" width="3" height="3" />
        <rect x="163" y="40" width="3" height="3" />
      </g>
      <path d="M70 6 L70 76 M130 6 L130 76" stroke="#eef2f6" strokeWidth="2.4" />
      <rect x="10" y="6" width="180" height="70" rx="2" fill="none" stroke="#b8c2cc" strokeWidth="2" />
      <rect y="86" width="200" height="24" fill="#8a6a4a" />
      <rect y="84" width="200" height="3" fill="#a07a56" />
      <rect x="150" y="68" width="30" height="18" rx="1.5" fill="#3a3f48" />
      <rect x="152" y="70" width="26" height="13" fill="#7ab0d8" />
      <rect x="163" y="86" width="4" height="4" fill="#3a3f48" />
      <rect x="22" y="72" width="10" height="14" rx="1.5" fill="#f2f2f2" />
      <path d="M32 76 q4 0 4 4 q0 3 -4 3" stroke="#f2f2f2" strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Clinic() {
  return (
    <g>
      <rect width="200" height="110" fill="#eaf4f1" />
      <rect y="0" width="200" height="8" fill="#cfe6df" />
      <circle cx="100" cy="24" r="11" fill="#ffffff" stroke="#bcd8cf" />
      <path d="M96.5 16 h7 v4.5 h4.5 v7 h-4.5 v4.5 h-7 v-4.5 h-4.5 v-7 h4.5 Z" fill="#3aa87a" />
      <rect x="36" y="44" width="128" height="4" rx="2" fill="#bcd8cf" />
      <rect y="84" width="200" height="26" fill="#cfe3de" />
      <rect y="82" width="200" height="3" fill="#b0d0c6" />
      <g fill="#8ac0d8">
        <rect x="8" y="56" width="22" height="16" rx="3" />
        <rect x="170" y="56" width="22" height="16" rx="3" />
      </g>
      <g fill="#6aa0b8">
        <rect x="8" y="70" width="22" height="4" rx="1.5" />
        <rect x="170" y="70" width="22" height="4" rx="1.5" />
      </g>
      <circle cx="160" cy="24" r="8" fill="#ffffff" stroke="#9ab8b0" strokeWidth="1.2" />
      <path d="M160 24 L160 19 M160 24 L164 26" stroke="#4a5a58" strokeWidth="1.1" strokeLinecap="round" />
      <rect x="30" y="16" width="20" height="22" rx="1" fill="#ffffff" stroke="#bcd8cf" />
      <path d="M34 22 h12 M34 26 h12 M34 30 h8" stroke="#9ab8b0" strokeWidth="1" />
    </g>
  );
}

function Restaurant() {
  return (
    <g>
      <rect width="200" height="110" fill="#5a3a2a" />
      <g stroke="#4a2e22" strokeWidth="1.2">
        <path d="M0 30 L200 30 M0 60 L200 60" />
      </g>
      <g fill="#e8d8b0">
        <rect x="44" y="40" width="9" height="18" rx="1" />
        <rect x="56" y="40" width="9" height="18" rx="1" />
        <rect x="135" y="40" width="9" height="18" rx="1" />
        <rect x="147" y="40" width="9" height="18" rx="1" />
      </g>
      <g stroke="#6a4a3a" strokeWidth="0.8">
        <path d="M46 44 h5 M46 48 h5 M58 44 h5 M58 48 h5 M137 44 h5 M137 48 h5 M149 44 h5 M149 48 h5" />
      </g>
      <g fill="#243a5e">
        <rect x="40" y="0" width="38" height="30" />
        <rect x="80" y="0" width="40" height="30" />
        <rect x="122" y="0" width="38" height="30" />
      </g>
      <rect x="40" y="0" width="120" height="3" fill="#1a2a46" />
      <circle cx="100" cy="16" r="7" fill="none" stroke="#f2ead8" strokeWidth="1.4" />
      <g>
        <ellipse cx="20" cy="38" rx="10" ry="13" fill="#d8403a" />
        <rect x="13" y="24" width="14" height="3" fill="#2a1a16" />
        <rect x="13" y="49" width="14" height="3" fill="#2a1a16" />
        <path d="M11 34 h18 M11 42 h18" stroke="#b8302a" strokeWidth="0.8" />
        <ellipse cx="180" cy="38" rx="10" ry="13" fill="#d8403a" />
        <rect x="173" y="24" width="14" height="3" fill="#2a1a16" />
        <rect x="173" y="49" width="14" height="3" fill="#2a1a16" />
        <path d="M171 34 h18 M171 42 h18" stroke="#b8302a" strokeWidth="0.8" />
      </g>
      <rect y="84" width="200" height="26" fill="#8a5a36" />
      <rect y="82" width="200" height="3" fill="#a06a42" />
      <ellipse cx="100" cy="0" rx="120" ry="40" fill="#f2c870" opacity="0.08" />
    </g>
  );
}

function Hotel() {
  return (
    <g>
      <rect width="200" height="110" fill="#e8dcc6" />
      <g stroke="#d8c8a8" strokeWidth="1">
        <path d="M0 20 L200 20 M0 40 L200 40 M0 60 L200 60" />
      </g>
      <g fill="#8a6038">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}-${c}`} x={146 + c * 14} y={12 + r * 14} width="12" height="12" rx="1" />
          ))
        )}
      </g>
      <g fill="#d4a840">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => (
            <circle key={`${r}-${c}`} cx={152 + c * 14} cy={20 + r * 14} r="1.2" />
          ))
        )}
      </g>
      <path d="M100 0 L100 8" stroke="#b8963a" strokeWidth="1" />
      <path d="M86 8 L114 8 L108 18 L92 18 Z" fill="#f2d68a" />
      <g fill="#fff4c8" opacity="0.9">
        <circle cx="90" cy="20" r="1.4" />
        <circle cx="100" cy="21" r="1.4" />
        <circle cx="110" cy="20" r="1.4" />
      </g>
      <rect x="10" y="30" width="30" height="40" rx="2" fill="#6a8a5a" opacity="0.35" />
      <rect y="84" width="200" height="26" fill="#7a5230" />
      <rect y="82" width="200" height="3" fill="#946640" />
      <path d="M22 82 Q27 74 32 82 Z" fill="#d4a840" />
      <rect x="21" y="81.5" width="12" height="1.5" rx="0.6" fill="#b8902a" />
      <circle cx="27" cy="74.5" r="1" fill="#d4a840" />
    </g>
  );
}

function Station() {
  return (
    <g>
      <rect width="200" height="110" fill="#d6dde4" />
      <rect y="0" width="200" height="10" fill="#b8c2cc" />
      <rect y="30" width="200" height="46" fill="#cfd6de" />
      <rect y="62" width="200" height="5" fill="#3a9a5a" />
      <g fill="#8aa8c0">
        <rect x="6" y="36" width="26" height="20" rx="2" />
        <rect x="40" y="36" width="26" height="20" rx="2" />
        <rect x="134" y="36" width="26" height="20" rx="2" />
        <rect x="168" y="36" width="26" height="20" rx="2" />
      </g>
      <rect x="84" y="34" width="32" height="42" rx="1" fill="#b8c2cc" />
      <path d="M100 34 L100 76" stroke="#9aa6b2" strokeWidth="1.2" />
      <path d="M78 10 L78 16 M122 10 L122 16" stroke="#6a747e" strokeWidth="1" />
      <rect x="70" y="16" width="60" height="16" rx="2" fill="#ffffff" stroke="#8a949e" />
      <text
        x="100"
        y="27.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#2a3440"
        fontFamily="'Hiragino Sans','Yu Gothic','Meiryo',sans-serif"
      >
        さくら
      </text>
      <path d="M73 24 l-2.4 0 l1.6 -1.6 M127 24 l2.4 0 l-1.6 -1.6" stroke="#3a9a5a" strokeWidth="1" fill="none" />
      <rect y="76" width="200" height="34" fill="#9aa0a6" />
      <rect y="80" width="200" height="6" fill="#f2c230" />
      <g fill="#d8a820">
        {Array.from({ length: 25 }, (_, i) => (
          <circle key={i} cx={4 + i * 8} cy="83" r="0.9" />
        ))}
      </g>
    </g>
  );
}

function Konbini() {
  const colours = ["#e86a5a", "#f2c84a", "#5aa8e0", "#6cc070", "#f08ab4", "#f29a4a"];
  return (
    <g>
      <rect width="200" height="110" fill="#f4f4f0" />
      <rect y="0" width="200" height="4" fill="#3aa86a" />
      <rect y="4" width="200" height="3" fill="#f29a4a" />
      <rect y="7" width="200" height="3" fill="#4a8ad8" />
      {[26, 48, 70].map((y, r) => (
        <g key={y}>
          <rect x="0" y={y} width="200" height="2.5" fill="#b8bcc2" />
          {Array.from({ length: 22 }, (_, i) => (
            <rect
              key={i}
              x={3 + i * 9}
              y={y - 11 + ((i + r) % 3)}
              width="7"
              height={11 - ((i + r) % 3)}
              rx="1"
              fill={colours[(i * 5 + r * 2) % colours.length]}
              opacity="0.85"
            />
          ))}
        </g>
      ))}
      <rect y="86" width="200" height="24" fill="#d8dce0" />
      <rect y="84" width="200" height="3" fill="#c0c6cc" />
      <rect x="150" y="72" width="22" height="14" rx="2" fill="#3a3f48" />
      <rect x="153" y="75" width="16" height="7" fill="#7ad0a0" />
    </g>
  );
}

function Street() {
  return (
    <g>
      <rect width="200" height="110" fill="#c4e4f4" />
      <rect x="0" y="22" width="36" height="66" fill="#d8c8b0" />
      <rect x="38" y="36" width="30" height="52" fill="#e8d8c0" />
      <rect x="132" y="30" width="30" height="58" fill="#d0c0a8" />
      <rect x="164" y="18" width="36" height="70" fill="#e0d0b8" />
      <g>
        <rect x="26" y="28" width="7" height="34" fill="#d8403a" />
        <rect x="140" y="36" width="7" height="30" fill="#3a6ab0" />
        <rect x="168" y="24" width="7" height="30" fill="#f2c84a" />
      </g>
      <g fill="#ffffff" opacity="0.85">
        <rect x="28" y="32" width="3" height="3" />
        <rect x="28" y="38" width="3" height="3" />
        <rect x="28" y="44" width="3" height="3" />
        <rect x="142" y="40" width="3" height="3" />
        <rect x="142" y="46" width="3" height="3" />
        <rect x="170" y="28" width="3" height="3" />
        <rect x="170" y="34" width="3" height="3" />
      </g>
      <g fill="#9cb8d0">
        <rect x="42" y="42" width="8" height="8" />
        <rect x="56" y="42" width="8" height="8" />
        <rect x="178" y="30" width="8" height="8" />
        <rect x="188" y="30" width="8" height="8" />
      </g>
      <rect x="80" y="10" width="3" height="78" fill="#8a8f96" />
      <path d="M72 16 L92 16 M74 22 L90 22" stroke="#6a6f76" strokeWidth="1.4" />
      <path d="M0 14 Q40 22 81 16 Q140 24 200 12" stroke="#3a3f46" strokeWidth="0.7" fill="none" />
      <path d="M0 19 Q40 27 81 21 Q140 30 200 18" stroke="#3a3f46" strokeWidth="0.7" fill="none" />
      <rect x="112" y="54" width="16" height="34" rx="1.5" fill="#d8403a" />
      <rect x="114" y="57" width="12" height="16" fill="#f4f4f0" />
      <g fill="#5aa8e0">
        <rect x="115" y="58" width="2.5" height="6" />
        <rect x="119" y="58" width="2.5" height="6" fill="#f2c84a" />
        <rect x="123" y="58" width="2.5" height="6" fill="#6cc070" />
        <rect x="115" y="66" width="2.5" height="6" fill="#e86a5a" />
        <rect x="119" y="66" width="2.5" height="6" />
        <rect x="123" y="66" width="2.5" height="6" fill="#8a5a36" />
      </g>
      <rect y="88" width="200" height="22" fill="#8a8f96" />
      <g fill="#f4f4f0" opacity="0.9">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={6 + i * 20} y="96" width="10" height="14" />
        ))}
      </g>
    </g>
  );
}

function Cafe() {
  return (
    <g>
      <rect width="200" height="110" fill="#c98a62" />
      <g stroke="#b77a54" strokeWidth="0.8">
        {[12, 24, 36, 48, 60, 72].map((y, r) => (
          <g key={y}>
            <path d={`M0 ${y} L200 ${y}`} />
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M${(r % 2) * 10 + i * 20} ${y - 12} L${(r % 2) * 10 + i * 20} ${y}`} />
            ))}
          </g>
        ))}
      </g>
      <rect x="140" y="14" width="44" height="40" rx="2" fill="#2e3a32" stroke="#6a4a32" strokeWidth="2" />
      <g stroke="#e8e4d8" strokeWidth="0.9" strokeLinecap="round" opacity="0.85">
        <path d="M146 22 h18 M146 29 h26 M146 36 h14 M146 43 h22" />
      </g>
      <g stroke="#e8e4d8" strokeWidth="0.9" fill="none" opacity="0.85">
        <path d="M170 21 q3 -3 6 0 q0 4 -3 6 q-3 -2 -3 -6 Z" />
      </g>
      <path d="M100 0 L100 10" stroke="#3a2a22" strokeWidth="0.8" />
      <path d="M92 16 Q100 6 108 16 Z" fill="#2e2a26" />
      <ellipse cx="100" cy="17" rx="3" ry="1.4" fill="#fff0b8" />
      <path d="M40 0 L40 10" stroke="#3a2a22" strokeWidth="0.8" />
      <path d="M32 16 Q40 6 48 16 Z" fill="#2e2a26" />
      <ellipse cx="40" cy="17" rx="3" ry="1.4" fill="#fff0b8" />
      <rect x="8" y="44" width="40" height="3" fill="#6a4a32" />
      <g fill="#f4efe4">
        <rect x="12" y="36" width="7" height="8" rx="1" />
        <rect x="22" y="37" width="6" height="7" rx="1" />
        <rect x="31" y="36" width="7" height="8" rx="1" />
      </g>
      <rect y="84" width="200" height="26" fill="#6a4a32" />
      <rect y="82" width="200" height="3" fill="#80583c" />
    </g>
  );
}

function Counter() {
  return (
    <g>
      <rect width="200" height="110" fill="#e4e8ee" />
      <rect x="74" y="6" width="52" height="22" rx="2" fill="#2a2e34" />
      <text
        x="100"
        y="15.5"
        textAnchor="middle"
        fontSize="6"
        fill="#c8ccd2"
        fontFamily="'Hiragino Sans','Yu Gothic','Meiryo',sans-serif"
      >
        お呼び出し番号
      </text>
      <text
        x="100"
        y="25"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#f0504a"
        fontFamily="ui-monospace,Consolas,monospace"
      >
        0123
      </text>
      {[18, 60, 140, 182].map((x, i) => (
        <g key={x}>
          <rect x={x - 14} y="36" width="28" height="44" fill="#d4dae2" />
          <rect x={x - 6} y="38" width="12" height="8" rx="1" fill="#3a6ab0" />
          <text
            x={x}
            y="44.5"
            textAnchor="middle"
            fontSize="6"
            fontWeight="700"
            fill="#ffffff"
            fontFamily="ui-monospace,Consolas,monospace"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <g fill="#c4ccd6">
        <rect x="37" y="36" width="2" height="48" />
        <rect x="81" y="36" width="2" height="48" />
        <rect x="117" y="36" width="2" height="48" />
        <rect x="161" y="36" width="2" height="48" />
      </g>
      <rect y="84" width="200" height="26" fill="#b8c2cc" />
      <rect y="82" width="200" height="3" fill="#a4aeb8" />
    </g>
  );
}

const BACKDROPS: Record<SceneBackdrop, () => React.JSX.Element> = {
  home: Home,
  office: Office,
  clinic: Clinic,
  restaurant: Restaurant,
  hotel: Hotel,
  station: Station,
  konbini: Konbini,
  street: Street,
  cafe: Cafe,
  counter: Counter,
};

/** Full backdrop SVG for one scene, sliced to whatever box it sits in. */
export function SceneBackdropArt({ backdrop }: { backdrop: SceneBackdrop }) {
  const Art = BACKDROPS[backdrop];
  return (
    <svg
      className="th-backdrop-art"
      viewBox="0 0 200 110"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <Art />
      <rect width="200" height="110" fill="url(#th-backdrop-fade)" />
      <defs>
        <linearGradient id="th-backdrop-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
    </svg>
  );
}
