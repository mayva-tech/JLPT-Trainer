import type { CSSProperties } from "react";
import type { VocabularyItem } from "../../types/vocabulary";
import type { SpeechHighlight } from "../../services/speechService";
import { FuriganaWrapText } from "../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../components/HighlightedEnglish";
import { PitchAccentLine } from "../../components/PitchAccent/PitchAccentLine";
import { Illustration } from "../../components/Illustration/Illustration";
import { vocabPicture } from "../../components/Illustration/pictures";
import { StageAmbience } from "../../components/StageAmbience/StageAmbience";
import {
  ambienceForVocab,
  ambienceGlyphs,
} from "../../components/StageAmbience/themes";
import type { JlptLevel } from "../../types/level";
import { hookLineFor, phaseProgress, reached, type ShortPhase } from "./shortScript";
import { ShortSentence } from "./ShortSentence";
import { KanjiStrokes } from "../../components/KanjiStrokes/KanjiStrokes";

export interface ShortStageProps {
  item: VocabularyItem;
  level: JlptLevel;
  wordNumber: number;
  seriesLabel: string;
  phase: ShortPhase;
  cue: { kind: "countdown" | "repeat"; ms: number; key: number } | null;
  highlight: SpeechHighlight | null;
  activeLang: "ja" | "en" | null;
  /** Next word, teased blurred at the end. */
  next?: VocabularyItem | null;
  ambience: boolean;
  /** Slow camera pan across the backdrop while playing. */
  pan: boolean;
  /** Seconds the pan takes (≈ the Short's length). */
  panSeconds: number;
  /** Dashed overlay of YouTube's Shorts UI (preview only). */
  showSafeZones?: boolean;
  /** Fade to black between batch Shorts. */
  blackout?: boolean;
  /** Write the word in stroke order (draw phase) instead of popping it in. */
  brush?: boolean;
  /** Changes on every play, so a replay redraws the strokes. */
  runKey?: number;
}

/** Word size: big for short words, shrinking so long words stay on one line. */
function wordSize(word: string): string {
  const n = Math.max(1, [...word].length);
  return `${Math.min(17, 70 / n).toFixed(2)}cqw`;
}

export function ShortStage(props: ShortStageProps) {
  const { item, phase, cue, highlight, activeLang } = props;
  const theme = ambienceForVocab(item);
  const glyphs = ambienceGlyphs(item.word);
  const hook = phase === "hook" || phase === "idle";
  const hookLine = hookLineFor(item);
  const ja = activeLang === "ja" ? highlight : null;
  const en = activeLang === "en" ? highlight : null;
  const sentenceShown = Boolean(item.sentence?.trim()) && reached(phase, "example");

  return (
    <div
      className={`sh-stage${props.blackout ? " sh-stage--blackout" : ""}`}
      data-phase={phase}
      data-theme={props.ambience ? theme : "none"}
    >
      {props.ambience && (
        <div
          className={`sh-amb${props.pan && phase !== "idle" ? " sh-amb--pan" : ""}`}
          style={{ "--sh-pan": `${props.panSeconds}s` } as CSSProperties}
        >
          <div className="sh-amb-frame">
            <StageAmbience theme={theme} glyphs={glyphs} panButtons={false} />
          </div>
        </div>
      )}
      <div className="sh-scrim" />

      <div className="sh-top">
        <div className="sh-progress">
          <span style={{ transform: `scaleX(${phaseProgress(phase)})` }} />
        </div>
        <div className="sh-chips">
          <span className="sh-chip sh-chip--level">JLPT {props.level}</span>
          <span className="sh-chip">Word #{props.wordNumber}</span>
        </div>
        {props.seriesLabel.trim() && <div className="sh-series">{props.seriesLabel}</div>}
      </div>

      <div className="sh-col">
        <div className={`sh-hook${hook ? " sh-hook--on" : ""}`}>
          <div className="sh-hook-en">{hookLine.en}</div>
          <div className="sh-hook-ja" lang="ja">
            {hookLine.ja}
          </div>
        </div>

        <div className={`sh-picture${reached(phase, "reveal") ? " sh-picture--on" : ""}`}>
          <Illustration picture={vocabPicture(item.id)} className="sh-picture-art" />
        </div>

        {props.brush && !hook ? (
          <div className="sh-word sh-word--brush" style={{ fontSize: wordSize(item.word) }} lang="ja">
            <div className={`sh-reading${reached(phase, "reveal") ? " sh-reading--on" : ""}`}>
              {item.reading}
            </div>
            <KanjiStrokes
              word={item.word}
              state={phase === "draw" ? "draw" : "done"}
              runKey={props.runKey}
              className="sh-strokes"
            />
          </div>
        ) : (
          <div
            className={`sh-word${hook ? " sh-word--hook" : " sh-word--pop"}${props.brush ? " sh-word--ink" : ""}`}
            style={{ fontSize: wordSize(item.word) }}
            lang="ja"
          >
            <FuriganaWrapText
              surface={item.word}
              reading={item.reading}
              className="sh-word-text"
              highlight={phase === "reveal" ? ja : null}
              showFurigana={!hook}
            />
          </div>
        )}

        {cue?.kind === "countdown" && (
          <div className="sh-count" key={cue.key} aria-hidden="true">
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>
        )}

        {reached(phase, "reveal") && (
          <PitchAccentLine
            word={item.word}
            reading={item.reading}
            speaking={phase === "reveal" && activeLang === "ja"}
            className="sh-pitch"
          />
        )}

        <div className={`sh-meaning${reached(phase, "meaning") ? " sh-meaning--on" : ""}`}>
          <HighlightedEnglish
            text={item.meaning}
            className="sh-meaning-text"
            highlight={phase === "meaning" ? en : null}
          />
        </div>

        {sentenceShown && (
          <div className={`sh-sentence${phase === "shadow" ? " sh-sentence--shadow" : ""}`}>
            {phase === "shadow" && <div className="sh-turn">🗣 Your turn — say it!</div>}
            <ShortSentence
              surface={item.sentence}
              reading={item.sentenceReading}
              highlight={phase === "example" || phase === "shadow" ? ja : null}
            />
            <HighlightedEnglish
              text={item.sentenceMeaning}
              className="sh-sentence-en"
              highlight={phase === "example" ? en : null}
            />
            {cue?.kind === "repeat" && (
              <div className="sh-repeat" key={cue.key}>
                <span style={{ animationDuration: `${cue.ms}ms` }} />
              </div>
            )}
          </div>
        )}

        {reached(phase, "outro") && (
          <div className="sh-outro">
            <div className="sh-outro-prompt">
              💬 Make a sentence with <span lang="ja">「{item.word}」</span>
            </div>
            <div className="sh-outro-follow">Follow for a new word every day</div>
            {props.next && (
              <div className="sh-next">
                Next: <span className="sh-next-word" lang="ja">{props.next.word}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {props.showSafeZones && (
        <div className="sh-safe" aria-hidden="true">
          <div className="sh-safe-right">YouTube buttons</div>
          <div className="sh-safe-bottom">Title · channel · caption</div>
        </div>
      )}
      <div className="sh-black" aria-hidden="true" />
    </div>
  );
}
