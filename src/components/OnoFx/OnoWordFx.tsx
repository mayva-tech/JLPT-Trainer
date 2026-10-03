import type { CSSProperties, ReactNode } from "react";
import { onoFxFor } from "./onoFxData";
import { OnoParticles } from "./onoParticles";
import "./onoFx.css";

/**
 * Wraps an onomatopoeia word with its effect: the word itself moves (beats,
 * shivers, droops, dashes…) and particles act out the meaning around it.
 * Change `playKey` to replay. Honours prefers-reduced-motion (no movement,
 * no particles — the colour accent stays).
 */
export function OnoWordFx({
  word,
  playKey,
  children,
}: {
  word: string;
  playKey: string | number;
  children?: ReactNode;
}) {
  const fx = onoFxFor(word);
  return (
    <span
      className="ono-fx"
      style={{ "--ono-c": fx.color } as CSSProperties}
      data-ono-motion={fx.motion}
      data-ono-particles={fx.particles}
    >
      <span key={`w-${playKey}`} className={`ono-fx-word ono-m-${fx.motion}`}>
        {children}
      </span>
      <OnoParticles key={`p-${playKey}`} kind={fx.particles} color={fx.color} />
    </span>
  );
}
