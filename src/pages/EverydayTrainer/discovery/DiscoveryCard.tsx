import { Furigana, stripFurigana } from "../../../lib/japanese/furigana";
import type { TrainerSpeechLang } from "../../../hooks/useTrainerSpeech";
import { plainJapanese, plainReading, showsReading, wordRomaji } from "../everydayData";
import type { EverydayWord } from "../types";
import { IconCheck, IconSpeaker, IconStar } from "../components/icons";

type Props = {
  word: EverydayWord;
  /** Just discovered with this tap. */
  isNew: boolean;
  activeLang: TrainerSpeechLang | null;
  nuanceActive: boolean;
  onSay: (lang: TrainerSpeechLang) => void;
  onSayNuance: () => void;
  known: boolean;
  saved: boolean;
  onToggleKnown: () => void;
  onToggleSaved: () => void;
  /** "Next undiscovered object" — hidden when everything is found. */
  onNext?: () => void;
  onClose?: () => void;
  /** Play all in a narrow window: the word and its meaning only (a Short-shaped frame). */
  compact?: boolean;
};

/** Long words (カーブミラー, 自動販売機) step down so they stay on one line. */
function sizeClass(text: string): string {
  if (text.length > 7) return " vd-card-jp--longer";
  if (text.length > 4) return " vd-card-jp--long";
  return "";
}

/**
 * The compact vocabulary card for a tapped object — word, reading, romaji,
 * meaning, then audio and progress controls; the usage note folds away so
 * the scene stays the main thing on screen. On phones it is a bottom sheet.
 */
export function DiscoveryCard({
  word,
  isNew,
  activeLang,
  nuanceActive,
  onSay,
  onSayNuance,
  known,
  saved,
  onToggleKnown,
  onToggleSaved,
  onNext,
  onClose,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <article className="vd-card vd-card--compact" aria-live="polite" aria-label={`${plainJapanese(word)} — ${word.english}`}>
        <div className="vd-card-words" data-head-avoid>
          <p className={`vd-card-jp${sizeClass(plainJapanese(word))}${activeLang === "ja" ? " vd-speaking" : ""}`} lang="ja">
            {plainJapanese(word)}
          </p>
          <p className="vd-card-reading">
            {showsReading(word) ? <span lang="ja">{plainReading(word)}</span> : null}
            {showsReading(word) ? " · " : null}
            {wordRomaji(word)}
          </p>
          <p className={`vd-card-en${activeLang === "en" ? " vd-speaking" : ""}`}>{word.english}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="vd-card" aria-live="polite" aria-label={`${plainJapanese(word)} — ${word.english}`} data-head-avoid>
      <div className="vd-card-top">
        <div className="vd-card-words">
          <div className="vd-card-line">
            <button
              type="button"
              className={`vd-card-jp${sizeClass(plainJapanese(word))}${activeLang === "ja" ? " vd-speaking" : ""}`}
              lang="ja"
              onClick={() => onSay("ja")}
              aria-label={`Hear ${word.english} in Japanese`}
            >
              {plainJapanese(word)}
            </button>
            {isNew ? <span className="vd-new">New!</span> : null}
            {word.jlptLevel !== "unclassified" ? (
              <span className="ev-level" title="Level from the tanos.co.uk JLPT list — a guide; there is no official list">
                {word.jlptLevel}
              </span>
            ) : null}
          </div>
          <p className="vd-card-reading">
            {showsReading(word) ? <span lang="ja">{plainReading(word)}</span> : null}
            {showsReading(word) ? " · " : null}
            {wordRomaji(word)}
          </p>
          <button
            type="button"
            className={`vd-card-en${activeLang === "en" ? " vd-speaking" : ""}`}
            onClick={() => onSay("en")}
            aria-label={`Hear the English: ${word.english}`}
          >
            {word.english}
          </button>
        </div>
        <div className="vd-card-audio">
          <button type="button" className="vd-audio" onClick={() => onSay("ja")} aria-label="Japanese audio (Nanami)">
            <IconSpeaker size={22} />
            <span>JP</span>
          </button>
          <button type="button" className="vd-audio" onClick={() => onSay("en")} aria-label="English audio (Andrew)">
            <IconSpeaker size={22} />
            <span>EN</span>
          </button>
          {onClose ? (
            <button type="button" className="vd-card-close" onClick={onClose} aria-label="Close the card">
              ×
            </button>
          ) : null}
        </div>
      </div>

      {word.nuance ? (
        <details className="vd-nuance">
          <summary>Usage note</summary>
          <button
            type="button"
            className={`vd-nuance-text${nuanceActive ? " vd-speaking" : ""}`}
            onClick={onSayNuance}
            aria-label={`Hear the note: ${stripFurigana(word.nuance)}`}
          >
            <Furigana text={word.nuance} />
          </button>
        </details>
      ) : null}

      <div className="vd-card-actions">
        <button
          type="button"
          className={`ev-toggle ev-toggle--learn${known ? " ev-toggle--on" : ""}`}
          aria-pressed={known}
          onClick={onToggleKnown}
        >
          <IconCheck /> {known ? "Learned" : "Mark learned"}
        </button>
        <button
          type="button"
          className={`ev-toggle${saved ? " ev-toggle--on" : ""}`}
          aria-pressed={saved}
          onClick={onToggleSaved}
        >
          <IconStar filled={saved} /> {saved ? "Saved" : "Save for review"}
        </button>
        {onNext ? (
          <button type="button" className="ev-btn vd-next" onClick={onNext}>
            Next undiscovered →
          </button>
        ) : null}
      </div>
    </article>
  );
}
