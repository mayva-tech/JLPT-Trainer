import { useMemo, useRef, useState } from 'react';
import './trip-trainer.css';
import { DECKS, SCRIPTS } from './data';
import { Furigana, stripFurigana } from '../../lib/japanese/furigana';
import { useJapaneseVoice } from '../../lib/japanese/useJapaneseVoice';
import { useProgress } from '../../lib/japanese/useProgress';
import type { Register, Script, Variant } from '../../lib/japanese/types';
import { speechService, SPEECH_RATE_NORMAL } from '../../services/speechService';

const STORAGE_KEY = 'jlpt-trainer:trip:v1';

const REGISTER_LABELS: Record<Register, string> = {
  formal: 'Polite',
  friendly: 'Casual',
};

type PlayPart = 'jp' | 'en';

/* ---- icons ---- */

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

const Cards = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <rect x="3" y="5" width="13" height="15" rx="2" />
    <path d="M8 2h11a2 2 0 0 1 2 2v12" />
  </svg>
);

const Route = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M9 19h5a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5" />
  </svg>
);

const ChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const Check = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Volume = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
  </svg>
);

/* ---- page ---- */

export default function TripTrainer() {
  const [tab, setTab] = useState<'cards' | 'scenarios'>('cards');
  const [deckId, setDeckId] = useState('core');
  const [register, setRegister] = useState<Register>('formal');
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [openScript, setOpenScript] = useState<string | null>(null);
  const [playingCard, setPlayingCard] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [playPart, setPlayPart] = useState<PlayPart | null>(null);
  const [playRegister, setPlayRegister] = useState<Register | null>(null);
  const [playLineIndex, setPlayLineIndex] = useState<number | null>(null);
  const playSessionRef = useRef(0);

  const { progress, toggle } = useProgress(STORAGE_KEY);
  const { speak, voiceName, supported } = useJapaneseVoice();

  const deck = useMemo(() => DECKS.find((d) => d.id === deckId) ?? DECKS[0], [deckId]);
  const card = deck.cards[Math.min(index, deck.cards.length - 1)];
  const shownRegister = playRegister ?? register;
  const variant: Variant = card[shownRegister];
  const isKnown = progress.known.includes(card.id);
  const script = SCRIPTS.find((s) => s.id === openScript) ?? null;
  const playDisabled = tab === 'scenarios' && !script;

  function stopAuto() {
    playSessionRef.current += 1;
    setPlayingCard(false);
    setPlayingAll(false);
    setPlayPart(null);
    setPlayRegister(null);
    setPlayLineIndex(null);
  }

  function go(delta: number) {
    speechService.stop();
    stopAuto();
    setIndex((i) => (i + delta + deck.cards.length) % deck.cards.length);
    setReveal(0);
  }

  function selectDeck(id: string) {
    speechService.stop();
    stopAuto();
    setDeckId(id);
    setIndex(0);
    setReveal(0);
  }

  function jumpTo(i: number) {
    speechService.stop();
    stopAuto();
    setIndex(i);
    setReveal(0);
  }

  function playVariantSequence(
    source: Variant,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;
    const finish = () => {
      if (!alive()) return;
      onComplete();
    };

    const speakJa = (onEnd: () => void) => {
      if (!alive()) return;
      const plain = stripFurigana(source.jp);
      if (!plain.trim()) {
        onEnd();
        return;
      }
      setPlayPart('jp');
      speechService.speakJapanese(
        plain,
        { onEnd, onError: finish },
        SPEECH_RATE_NORMAL,
      );
    };

    const speakEn = (onEnd: () => void) => {
      if (!alive()) return;
      if (!source.en.trim()) {
        onEnd();
        return;
      }
      setPlayPart('en');
      speechService.speakEnglish(
        source.en,
        { onEnd, onError: finish },
        SPEECH_RATE_NORMAL,
      );
    };

    speakJa(() => speakEn(() => speakJa(finish)));
  }

  function playBothRegisters(
    formal: Variant,
    friendly: Variant,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;
    const sameLine = formal.jp === friendly.jp && formal.en === friendly.en;
    if (sameLine) {
      setPlayRegister(null);
      playVariantSequence(formal, session, onComplete);
      return;
    }
    setPlayRegister('formal');
    playVariantSequence(formal, session, () => {
      if (!alive()) return;
      setPlayRegister('friendly');
      playVariantSequence(friendly, session, onComplete);
    });
  }

  function playScriptSequence(
    target: Script,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;

    const runLine = (lineIndex: number) => {
      if (!alive()) return;
      const line = target.lines[lineIndex];
      if (!line) {
        onComplete();
        return;
      }
      setPlayLineIndex(lineIndex);
      playBothRegisters(line.formal, line.friendly, session, () => {
        if (!alive()) return;
        runLine(lineIndex + 1);
      });
    };

    runLine(0);
  }

  function playCurrent() {
    if (playDisabled) return;
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(false);
    setPlayingCard(true);
    setPlayLineIndex(null);

    const done = () => {
      if (session !== playSessionRef.current) return;
      setPlayingCard(false);
      setPlayPart(null);
      setPlayRegister(null);
      setPlayLineIndex(null);
    };

    if (tab === 'cards') {
      setReveal(2);
      playBothRegisters(card.formal, card.friendly, session, done);
      return;
    }

    if (!script) {
      done();
      return;
    }
    playScriptSequence(script, session, done);
  }

  function playAll() {
    if (playingAll) {
      speechService.stop();
      stopAuto();
      return;
    }

    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingCard(false);
    setPlayingAll(true);
    const alive = () => session === playSessionRef.current;

    if (tab === 'cards') {
      const cards = deck.cards;
      if (cards.length === 0) {
        stopAuto();
        return;
      }
      setIndex(0);
      setReveal(2);

      const run = (cardIndex: number) => {
        if (!alive()) return;
        const item = cards[cardIndex];
        if (!item) {
          stopAuto();
          return;
        }
        setIndex(cardIndex);
        setReveal(2);
        playBothRegisters(item.formal, item.friendly, session, () => {
          if (!alive()) return;
          const next = cardIndex + 1;
          if (next >= cards.length) {
            stopAuto();
            return;
          }
          run(next);
        });
      };

      run(0);
      return;
    }

    if (SCRIPTS.length === 0) {
      stopAuto();
      return;
    }

    const runScript = (scriptIndex: number) => {
      if (!alive()) return;
      const item = SCRIPTS[scriptIndex];
      if (!item) {
        stopAuto();
        return;
      }
      setOpenScript(item.id);
      playScriptSequence(item, session, () => {
        if (!alive()) return;
        const next = scriptIndex + 1;
        if (next >= SCRIPTS.length) {
          stopAuto();
          return;
        }
        runScript(next);
      });
    };

    runScript(0);
  }

  return (
    <div className="jt-root" data-deck={deck.id}>
      <header className="jt-header">
        <h2 className="jt-title">
          <Furigana text="旅(たび)の日本語(にほんご)" />
        </h2>
        <p className="jt-sub">Japan Trip Trainer</p>
        <p className="jt-voice">
          {supported ? `voice: ${voiceName ?? 'no Japanese voice installed'}` : 'audio unavailable'}
        </p>
      </header>

      <nav className="jt-tabs">
        <button
          type="button"
          className={`jt-tab-btn ${tab === 'cards' ? 'active' : ''}`}
          onClick={() => {
            speechService.stop();
            stopAuto();
            setTab('cards');
          }}
        >
          <Cards /> Phrases
        </button>
        <button
          type="button"
          className={`jt-tab-btn ${tab === 'scenarios' ? 'active' : ''}`}
          onClick={() => {
            speechService.stop();
            stopAuto();
            setTab('scenarios');
          }}
        >
          <Route /> Scenarios
        </button>
      </nav>

      <div className="jt-registerrow">
        {(['formal', 'friendly'] as const).map((r) => (
          <button
            type="button"
            key={r}
            className={`jt-register jt-register--${r} ${shownRegister === r ? 'active' : ''}`}
            onClick={() => {
              speechService.stop();
              stopAuto();
              setRegister(r);
            }}
          >
            {REGISTER_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="jt-playrow">
        <button
          type="button"
          className={`jt-playbtn ${playingCard ? 'active' : ''}`}
          disabled={playDisabled}
          title={
            tab === 'cards'
              ? 'Play this card: polite, then casual'
              : script
                ? 'Play this scenario: polite, then casual on each line'
                : 'Open a scenario to play it'
          }
          onClick={playCurrent}
        >
          ▶ Play
        </button>
        <button
          type="button"
          className={`jt-playbtn ${playingAll ? 'active' : ''}`}
          title={
            tab === 'cards'
              ? 'Play every card in this deck from the start'
              : 'Play every scenario from the start'
          }
          onClick={playAll}
        >
          {playingAll ? '■ Stop All' : '▶ Play All'}
        </button>
      </div>

      {tab === 'cards' && (
        <>
          <div className="jt-chiprow">
            {DECKS.map((d) => (
              <button
                type="button"
                key={d.id}
                className={`jt-chip ${deckId === d.id ? 'active' : ''}`}
                onClick={() => selectDeck(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="jt-meta">
            <span>
              {index + 1} / {deck.cards.length}
            </span>
            <button
              type="button"
              className="jt-listen"
              onClick={() => {
                speechService.stop();
                stopAuto();
                speak(variant.jp);
              }}
            >
              <Volume /> listen
            </button>
          </div>

          <button
            type="button"
            className="jt-board"
            onClick={() => setReveal((r) => Math.min(r + 1, 2))}
            aria-label="Reveal the next part of this card"
          >
            <span className="jt-boardlabel">{card.label}</span>
            <span className={`jt-jp${playPart === 'jp' ? ' jt-speaking' : ''}`}>
              <Furigana text={variant.jp} />
            </span>
            {(reveal >= 1 || playingCard || playingAll) && (
              <span className="jt-ro">{variant.ro}</span>
            )}
            {(reveal >= 2 || playingCard || playingAll) && (
              <span className={`jt-en${playPart === 'en' ? ' jt-speaking' : ''}`}>
                {variant.en}
              </span>
            )}
            {reveal < 2 && !playingCard && !playingAll && (
              <span className="jt-hint">tap for {reveal === 0 ? 'romaji' : 'english'}</span>
            )}
          </button>

          <div className="jt-linebar">
            {deck.cards.map((c, i) => (
              <button
                type="button"
                key={c.id}
                className={`jt-stop ${progress.known.includes(c.id) ? 'known' : ''} ${
                  i === index ? 'current' : ''
                }`}
                onClick={() => jumpTo(i)}
                aria-label={`Go to card ${i + 1}: ${c.label}`}
                aria-current={i === index}
              />
            ))}
          </div>

          <div className="jt-nav">
            <button type="button" className="jt-navbtn" onClick={() => go(-1)} aria-label="Previous">
              <ChevronLeft />
            </button>
            <button
              type="button"
              className={`jt-knownbtn ${isKnown ? 'done' : ''}`}
              onClick={() => {
                toggle('known', card.id);
                if (!isKnown) go(1);
              }}
            >
              <Check /> {isKnown ? 'Known' : 'Mark as known'}
            </button>
            <button type="button" className="jt-navbtn" onClick={() => go(1)} aria-label="Next">
              <ChevronRight />
            </button>
          </div>
        </>
      )}

      {tab === 'scenarios' && !script && (
        <div className="jt-scriptlist">
          {SCRIPTS.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`jt-scriptitem ${progress.practiced.includes(s.id) ? 'done' : ''}`}
              onClick={() => {
                speechService.stop();
                stopAuto();
                setOpenScript(s.id);
              }}
            >
              <span className="jt-scriptname">
                <Furigana text={s.title} />
                <small>{s.titleEn}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'scenarios' && script && (
        <>
          <button
            type="button"
            className="jt-backbtn"
            onClick={() => {
              speechService.stop();
              stopAuto();
              setOpenScript(null);
            }}
          >
            <ChevronLeft size={12} /> all scenarios
          </button>

          <div className="jt-thread">
            {script.lines.map((line, i) => {
              const text = line[shownRegister];
              const lineActive = playLineIndex === i && (playingCard || playingAll);
              return (
                <div key={i} className={`jt-bubblewrap ${line.who === 'self' ? 'right' : 'left'}`}>
                  <button
                    type="button"
                    className={`jt-bubble${lineActive ? ' jt-line-active' : ''}`}
                    onClick={() => {
                      speechService.stop();
                      stopAuto();
                      speak(text.jp);
                    }}
                  >
                    <span className="jt-who">{line.who === 'self' ? 'you' : 'them'}</span>
                    <span className={`jt-jp${lineActive && playPart === 'jp' ? ' jt-speaking' : ''}`}>
                      <Furigana text={text.jp} />
                    </span>
                    <span className="jt-ro">{text.ro}</span>
                    <span className={`jt-en${lineActive && playPart === 'en' ? ' jt-speaking' : ''}`}>
                      {text.en}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={`jt-practicebtn ${progress.practiced.includes(script.id) ? 'done' : ''}`}
            onClick={() => toggle('practiced', script.id)}
          >
            <Check /> {progress.practiced.includes(script.id) ? 'Practiced' : 'Mark as practiced'}
          </button>
        </>
      )}
    </div>
  );
}
