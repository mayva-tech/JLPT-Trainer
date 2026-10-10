import { Furigana, stripFurigana } from "../../../lib/japanese/furigana";
import type { TrainerSpeechLang } from "../../../hooks/useTrainerSpeech";
import { EverydayPicture } from "../EverydayPicture";
import { hasPicture, wordRomaji } from "../everydayData";
import type { EverydayWord } from "../types";
import { IconCheck, IconSpeaker, IconStar } from "./icons";

interface WordCardProps {
  word: EverydayWord;
  /** Recognition mode: picture first, words hidden until revealed. */
  hidden: boolean;
  onReveal: () => void;
  activeLang: TrainerSpeechLang | null;
  onSay: (lang: TrainerSpeechLang) => void;
  /** The usage note is being read aloud. */
  nuanceActive: boolean;
  onSayNuance: () => void;
  known: boolean;
  favorite: boolean;
  onToggleKnown: () => void;
  onToggleFavorite: () => void;
}

/**
 * One visual flashcard: the object, then its name. Kept short on purpose —
 * picture, word, romaji, meaning and one nuance line — so it reads at a
 * glance in a two-minute session.
 */
export function WordCard({
  word,
  hidden,
  onReveal,
  activeLang,
  onSay,
  nuanceActive,
  onSayNuance,
  known,
  favorite,
  onToggleKnown,
  onToggleFavorite,
}: WordCardProps) {
  const pictured = hasPicture(word);

  return (
    <article className={`ev-card${pictured ? "" : " ev-card--text"}`} aria-label={hidden ? "Hidden word" : word.english}>
      {pictured ? (
        <button
          type="button"
          className="ev-card-picture"
          onClick={() => (hidden ? onReveal() : onSay("ja"))}
          aria-label={hidden ? "Show the word" : "Hear it in Japanese"}
        >
          <EverydayPicture word={word} avoidHead />
        </button>
      ) : null}

      <div className="ev-card-panel">
        {hidden ? (
          <button type="button" className="ev-reveal" onClick={onReveal}>
            What is this? <span>Tap to show</span>
          </button>
        ) : (
          <div className="ev-card-words">
            <div className="ev-card-meta">
              {word.jlptLevel !== "unclassified" ? (
                <span className="ev-level" title="Level from the tanos.co.uk JLPT list — a guide; there is no official list">
                  {word.jlptLevel}
                </span>
              ) : null}
              {!pictured ? <span className="ev-nopic">Picture coming</span> : null}
            </div>

            <button
              type="button"
              className={`ev-jp${activeLang === "ja" ? " ev-speaking" : ""}`}
              lang="ja"
              data-head-avoid
              onClick={() => onSay("ja")}
              aria-label={`Hear ${word.english} in Japanese`}
            >
              <Furigana text={word.japanese} />
            </button>
            <p className="ev-romaji">{wordRomaji(word)}</p>
            <button
              type="button"
              className={`ev-en${activeLang === "en" ? " ev-speaking" : ""}`}
              onClick={() => onSay("en")}
              aria-label={`Hear the English: ${word.english}`}
            >
              {word.english}
            </button>
            {word.nuance ? (
              <button
                type="button"
                className={`ev-nuance ev-nuance--btn${nuanceActive ? " ev-speaking" : ""}`}
                onClick={onSayNuance}
                aria-label={`Hear the note: ${stripFurigana(word.nuance)}`}
                {...(nuanceActive ? { "data-head-avoid": "" } : {})}
              >
                <Furigana text={word.nuance} />
              </button>
            ) : null}
          </div>
        )}

        <div className="ev-card-actions">
          <button type="button" className="ev-say ev-say--jp" onClick={() => onSay("ja")} aria-label="Japanese audio">
            <IconSpeaker /> 日本語
          </button>
          <button type="button" className="ev-say ev-say--en" onClick={() => onSay("en")} aria-label="English audio">
            <IconSpeaker /> EN
          </button>
          <button
            type="button"
            className={`ev-toggle${favorite ? " ev-toggle--on" : ""}`}
            aria-pressed={favorite}
            onClick={onToggleFavorite}
            title="Save to review"
          >
            <IconStar filled={favorite} /> {favorite ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            className={`ev-toggle ev-toggle--learn${known ? " ev-toggle--on" : ""}`}
            aria-pressed={known}
            onClick={onToggleKnown}
          >
            <IconCheck /> {known ? "Learned" : "Learn"}
          </button>
        </div>
      </div>
    </article>
  );
}
