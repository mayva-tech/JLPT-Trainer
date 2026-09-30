/**
 * Hand-held props. Drawn for the viewer's-left side of a head and mirrored
 * for the right, so each head holds its prop on the outer side of the stage.
 *
 * - phone: held to the ear — tilts with the head (render inside the tilt group)
 * - cup: held at chest height — planted (render after the collar)
 */

export interface PropSkin {
  skin: string;
  shade: string;
}

function mirror(side: "l" | "r") {
  return side === "r" ? "translate(100 0) scale(-1 1)" : undefined;
}

/** Phone to the ear. `earX` is the head's left ear centre (Nanami 24, Andrew 27). */
export function PhoneProp({
  side,
  earX,
  skin,
}: {
  side: "l" | "r";
  earX: number;
} & { skin: PropSkin }) {
  const dx = earX - 24;
  return (
    <g transform={mirror(side)} pointerEvents="none">
      <g transform={`translate(${dx} 0)`}>
        <path d="M13 72 Q10 90 4 110 L20 110 Q22 92 21 74 Z" fill={skin.skin} />
        <path d="M13 72 Q10 90 4 110 L8 110 Q13 92 16 74 Z" fill={skin.shade} opacity="0.6" />
        <g transform="rotate(-14 19 55)">
          <rect x="14.6" y="43" width="8.6" height="18" rx="2" fill="#2b2d33" />
          <rect x="15.6" y="44.2" width="6.6" height="15.6" rx="1.4" fill="#3a3e48" />
          <circle cx="18.9" cy="46.4" r="0.8" fill="#6a707c" />
        </g>
        <ellipse cx="17.6" cy="64" rx="5.4" ry="6.2" fill={skin.skin} />
        <g fill={skin.skin} stroke={skin.shade} strokeWidth="0.5">
          <rect x="18.6" y="50" width="5.4" height="3.2" rx="1.6" transform="rotate(-14 21 51.6)" />
          <rect x="19.2" y="53.6" width="5.6" height="3.2" rx="1.6" transform="rotate(-14 22 55.2)" />
          <rect x="19.4" y="57.2" width="5.4" height="3.2" rx="1.6" transform="rotate(-14 22 58.8)" />
        </g>
        <path d="M12.8 60 Q12 54 15.4 50" stroke={skin.skin} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

/** Steaming mug held at chest height. */
export function CupProp({ side, skin }: { side: "l" | "r"; skin: PropSkin }) {
  return (
    <g transform={mirror(side)} pointerEvents="none">
      <path d="M14 110 Q18 102 26 100 L30 106 Q24 108 22 110 Z" fill={skin.skin} />
      <rect x="24" y="92" width="12" height="13" rx="2" fill="#f7f4ec" />
      <rect x="24" y="96" width="12" height="4" fill="#c86a4a" />
      <path d="M36 95 q4.5 0 4.5 4 q0 4 -4.5 4" stroke="#f7f4ec" strokeWidth="1.8" fill="none" />
      <ellipse cx="30" cy="92.2" rx="6" ry="1.4" fill="#6a4a32" />
      <g fill={skin.skin} stroke={skin.shade} strokeWidth="0.5">
        <rect x="21.4" y="96" width="5" height="3" rx="1.5" />
        <rect x="21.2" y="99.2" width="5.2" height="3" rx="1.5" />
        <rect x="21.6" y="102.4" width="4.8" height="3" rx="1.5" />
      </g>
      <g stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.75">
        <path className="th-steam" d="M28 89 q-1.6 -2.4 0 -4.8 q1.6 -2.4 0 -4.8" />
        <path className="th-steam th-steam--late" d="M32 89 q-1.6 -2.4 0 -4.8 q1.6 -2.4 0 -4.8" />
      </g>
    </g>
  );
}
