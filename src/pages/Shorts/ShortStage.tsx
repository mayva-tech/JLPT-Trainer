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
import { phaseProgress, reached, type ShortPhase } from "./shortScript";
import { followLineFor, nextLabelFor } from "./outroVariety";
import { shortAngle } from "./shortAngle";
import { ShortSentence } from "./ShortSentence";
import { KanjiStrokes } from "../../components/KanjiStrokes/KanjiStrokes";
import { ASK_SHOWN, BAIT_SHOWN, LETTERS, REPLY_BANNER, SENDER, messageFor, type HookStyle, type MessageHook } from "./shortMessage";

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
  /** Opener style (default classic). */
  hookStyle?: HookStyle;
}

/** Word size: big for short words, shrinking so long words stay on one line. */
function wordSize(word: string): string {
  const n = Math.max(1, [...word].length);
  return `${Math.min(17, 70 / n).toFixed(2)}cqw`;
}

/** The outro question with its 「word」 unbracketed, whole, and starting line two. */
function OutroPrompt({ text }: { text: string }) {
  const m = /^(.*?)\s*「(.+?)」\s*(.*)$/u.exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
      <br />
      <span className="sh-outro-word">{m[2]}</span>
      {/^[?!？！、。,.]/.test(m[3] ?? "") ? "" : " "}
      {m[3]}
    </>
  );
}

/**
 * The 3-2-1: a ring that drains over the countdown (gold → red in the last
 * second) around big numbers. Paired with a tick per second and a time-up
 * sound (useShortPlayer), so the wait builds a little urgency.
 */
function CountdownRing({ ms, className = "" }: { ms: number; className?: string }) {
  return (
    <div
      className={`sh-count${className ? ` ${className}` : ""}`}
      style={{ "--sh-cd": `${ms}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <svg className="sh-count-ring" viewBox="0 0 100 100">
        <circle className="sh-count-track" cx="50" cy="50" r="44" />
        <circle className="sh-count-arc" cx="50" cy="50" r="44" pathLength={100} />
      </svg>
      <span>3</span>
      <span>2</span>
      <span>1</span>
    </div>
  );
}

/**
 * The message hook's opening frame: Nanami's text with the word marked, the
 * question, and the A / B quick replies. Shown from the very first (idle)
 * frame, so the thumbnail and the loop frame already ask the question.
 */
function MessageHookPanel({
  msg,
  highlight,
  counting,
  cueKey,
  cueMs,
}: {
  msg: MessageHook;
  highlight: SpeechHighlight | null;
  counting: boolean;
  cueKey: number;
  cueMs: number;
}) {
  return (
    <div className={counting ? "sh-msg sh-msg--counting" : "sh-msg"}>
      <div className="sh-msg-title">
        <span className="sh-msg-bell" aria-hidden="true">
          🔔
        </span>
        {msg.opener.replace(/[.!]$/, "")}
      </div>
      <div className="sh-chat">
        <div className="sh-chat-head">
          <span className="sh-chat-avatar" lang="ja" aria-hidden="true">
            {SENDER.initial}
          </span>
          <span className="sh-chat-name">
            <span lang="ja">{SENDER.ja}</span> <small>{SENDER.en}</small>
          </span>
          <span className="sh-chat-time">now</span>
        </div>
        <div className="sh-bubble sh-bubble--in">
          <ShortSentence
            surface={msg.text}
            reading={msg.reading}
            highlight={highlight}
            mark={msg.mark}
            furigana={false}
            className="sh-bubble-text"
          />
        </div>
        {/* Always laid out (hidden when idle), so the countdown doesn't shift the frame:
            ring · draining bar across the card · "typing" dots. */}
        <div className={`sh-chat-timer${counting ? " sh-chat-timer--on" : ""}`} aria-hidden="true">
          {counting ? (
            <CountdownRing key={cueKey} ms={cueMs} className="sh-count--msg" />
          ) : (
            <span className="sh-count-slot" />
          )}
          <span className="sh-timer-bar">
            {counting && <span key={cueKey} style={{ animationDuration: `${cueMs}ms` }} />}
          </span>
          <div className={`sh-bubble sh-bubble--out sh-typing${counting ? " sh-typing--on" : ""}`}>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="sh-msg-ask">
        {ASK_SHOWN.before}
        <span className="sh-msg-ask-word" lang="ja">
          「{msg.word}」
        </span>
        {ASK_SHOWN.after}
      </div>
      <div className="sh-replies">
        {msg.choices.map((c, i) => (
          <span key={c} className="sh-reply">
            <b>{LETTERS[i]}</b>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShortStage(props: ShortStageProps) {
  const { item, cue, highlight, activeLang } = props;
  // The loop beat (and the finished state) show the opening frame again, so
  // the last frame of the Short is its first frame and a replay is seamless.
  const looping = props.phase === "loop" || props.phase === "done";
  const phase: ShortPhase = looping ? "idle" : props.phase;
  const angle = shortAngle(item);
  const msg = messageFor(item, props.hookStyle);
  const theme = ambienceForVocab(item);
  const glyphs = ambienceGlyphs(item.word);
  const hook = phase === "hook" || phase === "idle";
  const hookLine = angle.hook;
  const ja = activeLang === "ja" ? highlight : null;
  const en = activeLang === "en" ? highlight : null;
  const sentenceShown = Boolean(item.sentence?.trim()) && reached(phase, "example");

  return (
    <div
      className={`sh-stage${props.blackout ? " sh-stage--blackout" : ""}${props.phase === "loop" ? " sh-stage--loop" : ""}`}
      data-phase={props.phase}
      data-angle={msg ? "message" : angle.kind}
      data-theme={props.ambience ? theme : "none"}
    >
      {props.ambience && (
        <div
          className={`sh-amb${props.pan && props.phase !== "idle" ? " sh-amb--pan" : ""}`}
          // Finish the out-and-back pan a little before the loop beat.
          style={{ "--sh-pan": `${(props.panSeconds * 0.85).toFixed(1)}s` } as CSSProperties}
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
        {msg ? (
          hook && (
            <MessageHookPanel
              msg={msg}
              highlight={phase === "hook" ? ja : null}
              counting={cue?.kind === "countdown"}
              cueKey={cue?.key ?? 0}
              cueMs={cue?.ms ?? 3000}
            />
          )
        ) : (
          <div className={`sh-hook${hook ? " sh-hook--on" : ""}`}>
            <div className="sh-hook-en">{hookLine.en}</div>
            <div className="sh-hook-ja" lang="ja">
              {hookLine.ja}
            </div>
          </div>
        )}

        <div className={`sh-picture${reached(phase, "reveal") ? " sh-picture--on" : ""}`}>
          <Illustration picture={vocabPicture(item.id)} className="sh-picture-art" />
        </div>

        {msg && hook ? null : props.brush && !hook ? (
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

        {cue?.kind === "countdown" && !msg && <CountdownRing key={cue.key} ms={cue.ms} />}

        {reached(phase, "reveal") && (
          <PitchAccentLine
            word={item.word}
            reading={item.reading}
            speaking={phase === "reveal" && activeLang === "ja"}
            className="sh-pitch"
            reveal={phase === "reveal" ? {} : null}
          />
        )}

        {msg && reached(phase, "reveal") && !reached(phase, "example") && (
          <div className="sh-answer">
            <b>{LETTERS[msg.answer]}</b> ✓ <span>{msg.choices[msg.answer]}</span>
          </div>
        )}

        <div className={`sh-meaning${reached(phase, "meaning") ? " sh-meaning--on" : ""}`}>
          <HighlightedEnglish
            text={item.meaning}
            className="sh-meaning-text"
            highlight={phase === "meaning" ? en : null}
          />
        </div>

        {sentenceShown && (
          <div
            className={`sh-sentence${phase === "shadow" ? " sh-sentence--shadow" : ""}${
              msg ? (phase === "shadow" ? " sh-sentence--chat sh-sentence--reply" : " sh-sentence--chat") : ""
            }`}
          >
            {msg && phase !== "shadow" && (
              <div className="sh-sentence-from">
                <span lang="ja">{SENDER.ja}</span> {SENDER.en}
              </div>
            )}
            {phase === "shadow" && <div className="sh-turn">{msg ? REPLY_BANNER : "🗣 Your turn — say it!"}</div>}
            <ShortSentence
              surface={item.sentence}
              reading={item.sentenceReading}
              highlight={phase === "example" || phase === "shadow" ? ja : null}
              mark={msg && phase !== "shadow" ? msg.mark : null}
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
            <div className="sh-outro-prompt" lang="ja">
              💬 <OutroPrompt text={msg ? BAIT_SHOWN : angle.bait} />
            </div>
            {msg ? (
              <div className="sh-replies sh-replies--outro">
                {msg.choices.map((c, i) => (
                  <span key={c} className={i === msg.answer ? "sh-reply sh-reply--right" : "sh-reply"}>
                    <b>{LETTERS[i]}</b>
                    {c}
                  </span>
                ))}
              </div>
            ) : angle.choices && (
              <div className="sh-choices" lang="ja">
                {angle.choices.map((w, i) => (
                  <span key={w} className="sh-choice">
                    <b>{i + 1}</b>
                    {w}
                  </span>
                ))}
              </div>
            )}
            <div className="sh-outro-follow">{followLineFor(item)}</div>
            {props.next && (
              <div className="sh-next">
                {nextLabelFor(item)} <span className="sh-next-word" lang="ja">{props.next.word}</span>
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
