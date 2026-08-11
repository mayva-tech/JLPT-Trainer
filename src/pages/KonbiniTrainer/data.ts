import type { Card, Deck, Script } from './types';

/* -------------------------------------------------------------------------
 * SEED DATA — replace with the full set from the artifact.
 *
 *   npm run konbini:import -- path/to/family_mart_trainer.jsx
 *
 * That script lifts CORE_PHRASES / VOCAB / SURVIVAL / SCRIPTS out of the
 * artifact file verbatim and rewrites this file, so none of the register or
 * furigana tuning has to be retyped. The entries below are only here so the
 * page runs before the import.
 * ---------------------------------------------------------------------- */

export const CORE_PHRASES: Card[] = [
  {
    id: 'c1',
    label: 'Welcome',
    formal: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
    friendly: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
  },
  {
    id: 'c2',
    label: 'Certainly / Got it',
    formal: { jp: 'かしこまりました', ro: 'Kashikomarimashita', en: 'Certainly' },
    friendly: { jp: 'はい、わかりました', ro: 'Hai, wakarimashita', en: 'Got it' },
  },
  {
    id: 'c3',
    label: 'One moment',
    formal: {
      jp: '少々(しょうしょう)お待(ま)ちください',
      ro: 'Shōshō omachi kudasai',
      en: 'One moment, please',
    },
    friendly: {
      jp: 'ちょっと待(ま)ってください',
      ro: 'Chotto matte kudasai',
      en: 'One moment, please',
    },
  },
  {
    id: 'c4',
    label: 'Sorry for the wait',
    formal: {
      jp: '大変(たいへん)お待(ま)たせいたしました',
      ro: 'Taihen omatase itashimashita',
      en: 'Sorry to have kept you waiting',
    },
    friendly: {
      jp: 'お待(ま)たせしました',
      ro: 'Omatase shimashita',
      en: 'Sorry for the wait',
    },
  },
  {
    id: 'c5',
    label: 'Apology',
    formal: {
      jp: '申(もう)し訳(わけ)ございません',
      ro: 'Mōshiwake gozaimasen',
      en: 'I am very sorry',
    },
    friendly: { jp: 'すみません', ro: 'Sumimasen', en: 'Sorry' },
  },
  {
    id: 'c6',
    label: 'Stating an amount',
    formal: { jp: '○○円(えん)でございます', ro: '~en de gozaimasu', en: 'That will be ~ yen' },
    friendly: { jp: '○○円(えん)です', ro: '~en desu', en: "That's ~ yen" },
  },
  {
    id: 'c7',
    label: 'Thank you',
    formal: {
      jp: 'ありがとうございました',
      ro: 'Arigatō gozaimashita',
      en: 'Thank you very much',
    },
    friendly: {
      jp: 'ありがとうございました',
      ro: 'Arigatō gozaimashita',
      en: 'Thank you very much',
    },
  },
];

export const VOCAB: Card[] = [
  {
    id: 'v1',
    label: 'Register',
    formal: { jp: 'レジ', ro: 'Reji', en: 'Register / checkout' },
    friendly: { jp: 'レジ', ro: 'Reji', en: 'Register / checkout' },
  },
  {
    id: 'v2',
    label: 'To warm up',
    formal: { jp: '温(あたた)める', ro: 'Atatameru', en: 'To warm up (food)' },
    friendly: { jp: '温(あたた)める', ro: 'Atatameru', en: 'To warm up (food)' },
  },
  {
    id: 'v3',
    label: 'Bag',
    formal: { jp: '袋(ふくろ)', ro: 'Fukuro', en: 'Bag' },
    friendly: { jp: '袋(ふくろ)', ro: 'Fukuro', en: 'Bag' },
  },
  {
    id: 'v4',
    label: 'Restocking',
    formal: { jp: '品出(しなだ)し', ro: 'Shinadashi', en: 'Restocking shelves' },
    friendly: { jp: '品出(しなだ)し', ro: 'Shinadashi', en: 'Restocking shelves' },
  },
];

export const SURVIVAL: Card[] = [
  {
    id: 's1',
    label: 'Ask for a repeat',
    formal: {
      jp: 'もう一度(いちど)お願(ねが)いいたします',
      ro: 'Mō ichido onegai itashimasu',
      en: 'Could you say that again, please',
    },
    friendly: {
      jp: 'もう一度(いちど)お願(ねが)いします',
      ro: 'Mō ichido onegai shimasu',
      en: 'Could you say that again',
    },
  },
  {
    id: 's2',
    label: 'Ask them to slow down',
    formal: {
      jp: 'ゆっくりお願(ねが)いいたします',
      ro: 'Yukkuri onegai itashimasu',
      en: 'A little slower, please',
    },
    friendly: {
      jp: 'ゆっくりお願(ねが)いします',
      ro: 'Yukkuri onegai shimasu',
      en: 'A little slower, please',
    },
  },
  {
    id: 's3',
    label: 'Buy time to check',
    formal: {
      jp: '確認(かくにん)いたしますので、少々(しょうしょう)お待(ま)ちください',
      ro: 'Kakunin itashimasu node, shōshō omachi kudasai',
      en: 'Let me check — one moment, please',
    },
    friendly: {
      jp: 'ちょっと確認(かくにん)します',
      ro: 'Chotto kakunin shimasu',
      en: 'Let me check',
    },
  },
  {
    id: 's4',
    label: 'Fetch a coworker',
    formal: {
      jp: '担当者(たんとうしゃ)を呼(よ)んでまいります',
      ro: 'Tantōsha o yonde mairimasu',
      en: 'I will fetch someone who can help',
    },
    friendly: {
      jp: '先輩(せんぱい)を呼(よ)んできます',
      ro: 'Senpai o yonde kimasu',
      en: "I'll get a coworker",
    },
  },
];

export const SCRIPTS: Script[] = [
  {
    id: 'sc1',
    title: '会計(かいけい)の基本(きほん)',
    titleEn: 'Basic checkout',
    lines: [
      {
        who: 'staff',
        formal: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
        friendly: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
      },
      {
        who: 'staff',
        formal: {
          jp: '合(あ)わせて八百(はっぴゃく)円(えん)でございます',
          ro: 'Awasete happyaku-en de gozaimasu',
          en: 'That will be 800 yen altogether',
        },
        friendly: {
          jp: '合(あ)わせて八百(はっぴゃく)円(えん)です',
          ro: 'Awasete happyaku-en desu',
          en: "That's 800 yen altogether",
        },
      },
      {
        who: 'customer',
        formal: { jp: 'カードで', ro: 'Kādo de', en: 'By card' },
        friendly: { jp: 'カードで', ro: 'Kādo de', en: 'By card' },
      },
      {
        who: 'staff',
        formal: {
          jp: 'かしこまりました。こちらにお願(ねが)いいたします',
          ro: 'Kashikomarimashita. Kochira ni onegai itashimasu',
          en: 'Certainly. Here, please',
        },
        friendly: {
          jp: 'はい。こちらにお願(ねが)いします',
          ro: 'Hai. Kochira ni onegai shimasu',
          en: 'Sure. Here, please',
        },
      },
      {
        who: 'staff',
        formal: {
          jp: 'ありがとうございました',
          ro: 'Arigatō gozaimashita',
          en: 'Thank you very much',
        },
        friendly: {
          jp: 'ありがとうございました',
          ro: 'Arigatō gozaimashita',
          en: 'Thank you very much',
        },
      },
    ],
  },
];

export const DECKS: Deck[] = [
  { id: 'core', label: 'Core Phrases', cards: CORE_PHRASES },
  { id: 'vocab', label: 'Vocabulary', cards: VOCAB },
  { id: 'survival', label: 'Survival Phrases', cards: SURVIVAL },
];
