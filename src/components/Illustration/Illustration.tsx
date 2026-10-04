import type { Picture } from "../../types/illustration";
import { SVG_ART } from "./svgArt";
import "./illustration.css";

/**
 * A small animated picture for a word or grammar pattern: an emoji in a soft
 * rounded tile, or one of the hand-drawn SVGs (svg:<id>). Decorative — the
 * word itself is the content — so it is hidden from screen readers.
 */
export function Illustration({ picture, className = "" }: { picture: Picture | null; className?: string }) {
  if (!picture) return null;
  const svgId = picture.src.startsWith("svg:") ? picture.src.slice(4) : null;
  const Art = svgId ? SVG_ART[svgId] : undefined;
  if (svgId && !Art) return null;
  // A drawing's own parts do the spinning; the tile itself just bobs.
  const motion = Art && picture.motion === "spin" ? "bob" : picture.motion;
  return (
    <div className={`pic-tile ${className}`.trim()} aria-hidden="true" data-picture={picture.src}>
      <div className={`pic-motion pic-motion--${motion}`}>
        {Art ? (
          <svg className="pic-svg" viewBox="0 0 64 64">
            <Art />
          </svg>
        ) : (
          <span className="pic-emoji">{picture.src}</span>
        )}
      </div>
    </div>
  );
}
