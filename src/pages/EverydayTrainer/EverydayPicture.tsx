import "../../components/Illustration/illustration.css";
import { resolveArt } from "./art/registry";
import { pictureAlt } from "./everydayData";
import { PHOTO_CREDITS } from "./data.generated";
import type { EverydayWord } from "./types";

/**
 * The picture for a word: a hand-drawn SVG, an emoji, or a photo served from
 * public/everyday/ (lazy-loaded, never bundled). Returns null for words with
 * no verified picture — callers show the word on its own instead of a
 * stand-in image.
 */
export function EverydayPicture({
  word,
  decorative = false,
  avoidHead = false,
}: {
  word: EverydayWord;
  decorative?: boolean;
  /** Keep the talking heads off this picture (TalkingHead's `data-head-avoid`). */
  avoidHead?: boolean;
}) {
  const src = word.picture;
  if (!src) return null;
  const label = decorative ? undefined : pictureAlt(word);
  const a11y = {
    ...(decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": label }),
    ...(avoidHead ? { "data-head-avoid": "" } : {}),
  };

  if (src.startsWith("svg:")) {
    const Art = resolveArt(src.slice(4));
    if (!Art) return null;
    return (
      <svg className="ev-pic ev-pic--svg pic-svg" viewBox="0 0 64 64" {...a11y}>
        <Art />
      </svg>
    );
  }

  if (src.startsWith("photo:")) {
    const file = src.slice(6);
    const credit = PHOTO_CREDITS[file];
    return (
      <figure className="ev-pic ev-pic--photo" {...(avoidHead ? { "data-head-avoid": "" } : {})}>
        <img src={`${import.meta.env.BASE_URL}everyday/${file}`} alt={label ?? ""} loading="lazy" decoding="async" />
        {credit && !decorative ? (
          <figcaption>
            <a href={credit.source} target="_blank" rel="noreferrer">
              {credit.author}
            </a>{" "}
            · {credit.license}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <span className="ev-pic ev-pic--emoji" {...a11y}>
      {src}
    </span>
  );
}
