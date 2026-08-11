import { useCallback, useMemo, useState } from 'react';
import './trip-trainer.css';
import { DECKS, SCRIPTS } from './data';
import { Furigana } from '../../lib/japanese/furigana';
import { useJapaneseVoice } from '../../lib/japanese/useJapaneseVoice';
import { useProgress } from '../../lib/japanese/useProgress';
import type { Register, Variant } from '../../lib/japanese/types';

const STORAGE_KEY = 'jlpt-trainer:trip:v1';

const REGISTER_LABELS: Record<Register, string> = {
  formal: 'Polite',
  friendly: 'Casual',
};

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

  const { progress, toggle } = useProgress(STORAGE_KEY);
  const { speak, voiceName, supported } = useJapaneseVoice();

  const deck = useMemo(() => DECKS.find((d) => d.id === deckId) ?? DECKS[0], [deckId]);
  const card = deck.cards[Math.min(index, deck.cards.length - 1)];
  const variant: Variant = card[register];
  const isKnown = progress.known.includes(card.id);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + deck.cards.length) % deck.cards.length);
      setReveal(0);
    },
    [deck.cards.length],
  );

  const selectDeck = (id: string) => {
    setDeckId(id);
    setIndex(0);
    setReveal(0);
  };

  const jumpTo = (i: number) => {
    setIndex(i);
    setReveal(0);
  };

  const script = SCRIPTS.find((s) => s.id === openScript) ?? null;

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
          onClick={() => setTab('cards')}
        >
          <Cards /> Phrases
        </button>
        <button
          type="button"
          className={`jt-tab-btn ${tab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setTab('scenarios')}
        >
          <Route /> Scenarios
        </button>
      </nav>

      <div className="jt-registerrow">
        {(['formal', 'friendly'] as const).map((r) => (
          <button
            type="button"
            key={r}
            className={`jt-register ${register === r ? 'active' : ''}`}
            onClick={() => setRegister(r)}
          >
            {REGISTER_LABELS[r]}
          </button>
        ))}
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
            <button type="button" className="jt-listen" onClick={() => speak(variant.jp)}>
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
            <span className="jt-jp">
              <Furigana text={variant.jp} />
            </span>
            {reveal >= 1 && <span className="jt-ro">{variant.ro}</span>}
            {reveal >= 2 && <span className="jt-en">{variant.en}</span>}
            {reveal < 2 && (
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
              onClick={() => setOpenScript(s.id)}
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
          <button type="button" className="jt-backbtn" onClick={() => setOpenScript(null)}>
            <ChevronLeft size={12} /> all scenarios
          </button>

          <div className="jt-thread">
            {script.lines.map((line, i) => {
              const text = line[register];
              return (
                <div key={i} className={`jt-bubblewrap ${line.who === 'self' ? 'right' : 'left'}`}>
                  <button type="button" className="jt-bubble" onClick={() => speak(text.jp)}>
                    <span className="jt-who">{line.who === 'self' ? 'you' : 'them'}</span>
                    <span className="jt-jp">
                      <Furigana text={text.jp} />
                    </span>
                    <span className="jt-ro">{text.ro}</span>
                    <span className="jt-en">{text.en}</span>
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
