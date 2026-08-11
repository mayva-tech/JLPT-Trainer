import type { Card, Deck, Script } from '../../lib/japanese/types';

/* -------------------------------------------------------------------------
 * Konbini trainer content.
 *
 * Register pair: Formal (keigo — what you use with a customer) / Friendly (the
 * plainer polite form, for coworkers and for softening keigo that would sound
 * stiff). Friendly is never casual: a staff member on the floor stays polite,
 * it only drops the ございます-level humble forms.
 *
 * The scenarios run across the whole shift, not just the register: payments,
 * age checks, counter services, the hot snack case, backroom work, and talking
 * to a senpai.
 *
 * NOTE: `npm run konbini:import` overwrites this file. Only run it if you want
 * to replace this content with the original artifact's.
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
      jp: 'ちょっとお待(ま)ちください',
      ro: 'Chotto omachi kudasai',
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
    label: 'Softening what comes next',
    formal: {
      jp: '恐(おそ)れ入(い)りますが',
      ro: 'Osore irimasu ga',
      en: 'If I may trouble you —',
    },
    friendly: { jp: 'すみませんが', ro: 'Sumimasen ga', en: 'Sorry, but —' },
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
  {
    id: 'c8',
    label: 'Stating an amount',
    formal: { jp: '○○円(えん)でございます', ro: '~en de gozaimasu', en: 'That will be ~ yen' },
    friendly: { jp: '○○円(えん)です', ro: '~en desu', en: "That's ~ yen" },
  },
  {
    id: 'c9',
    label: 'Receiving money',
    formal: {
      jp: '千円(せんえん)お預(あず)かりいたします',
      ro: 'Sen-en oazukari itashimasu',
      en: 'Taking 1,000 yen',
    },
    friendly: {
      jp: '千円(せんえん)お預(あず)かりします',
      ro: 'Sen-en oazukari shimasu',
      en: 'Out of 1,000 yen',
    },
  },
  {
    id: 'c10',
    label: 'Seeing a customer off',
    formal: {
      jp: 'またお越(こ)しくださいませ',
      ro: 'Mata okoshi kudasaimase',
      en: 'Please come again',
    },
    friendly: {
      jp: 'またお越(こ)しください',
      ro: 'Mata okoshi kudasai',
      en: 'Please come again',
    },
  },
];

const word = (id: string, label: string, jp: string, ro: string, en: string): Card => ({
  id,
  label,
  formal: { jp, ro, en },
  friendly: { jp, ro, en },
});

export const VOCAB: Card[] = [
  word('v1', 'Register', 'レジ', 'Reji', 'Register / checkout'),
  word('v2', 'The bill', 'お会計(かいけい)', 'O-kaikei', 'The bill / checkout total'),
  word('v3', 'Customer', 'お客様(きゃくさま)', 'O-kyaku-sama', 'Customer'),
  word('v4', 'Store manager', '店長(てんちょう)', 'Tenchō', 'Store manager'),
  word('v5', 'Senior coworker', '先輩(せんぱい)', 'Senpai', 'Senior coworker'),
  word('v6', 'Restocking', '品出(しなだ)し', 'Shinadashi', 'Restocking shelves'),
  word(
    'v7',
    'Stock rotation',
    '先入(さきい)れ先出(さきだ)し',
    'Sakiire sakidashi',
    'Oldest stock to the front',
  ),
  word('v8', 'Use-by date', '消費期限(しょうひきげん)', 'Shōhi kigen', 'Use-by date'),
  word('v9', 'Disposal', '廃棄(はいき)', 'Haiki', 'Disposing of expired stock'),
  word('v10', 'To warm up', '温(あたた)める', 'Atatameru', 'To warm up (food)'),
  word('v11', 'Carrier bag', 'レジ袋(ぶくろ)', 'Reji-bukuro', 'Carrier bag — charged for'),
  word('v12', 'Chopsticks', 'お箸(はし)', 'O-hashi', 'Chopsticks'),
  word('v13', 'Spoon', 'スプーン', 'Supūn', 'Spoon'),
  word('v14', 'Wet towel', 'おしぼり', 'Oshibori', 'Wet towel'),
  word('v15', 'Point card', 'ポイントカード', 'Pointo kādo', 'Point card'),
  word('v16', 'E-money', '電子(でんし)マネー', 'Denshi manē', 'IC / e-money payment'),
  word('v17', 'Age verification', '年齢確認(ねんれいかくにん)', 'Nenrei kakunin', 'Age verification'),
  word(
    'v18',
    'Bill payment',
    '収納代行(しゅうのうだいこう)',
    'Shūnō daikō',
    'Paying utility bills at the counter',
  ),
  word(
    'v19',
    'Payment slip',
    '払込票(はらいこみひょう)',
    'Haraikomihyō',
    'The slip a customer brings in to pay',
  ),
  word('v20', 'Official receipt', '領収書(りょうしゅうしょ)', 'Ryōshūsho', 'Official receipt'),
  word('v21', 'Parcel service', '宅配便(たくはいびん)', 'Takuhaibin', 'Parcel delivery service'),
  word('v22', 'Shipping label', '送(おく)り状(じょう)', 'Okurijō', 'Shipping label'),
  word('v23', 'Hot snack counter', 'ホットスナック', 'Hotto sunakku', 'Hot snack counter'),
  word('v24', 'Fryer', 'フライヤー', 'Furaiyā', 'Fryer'),
  word('v25', 'Breaking a note', '両替(りょうがえ)', 'Ryōgae', 'Breaking a note into change'),
  word('v26', 'Change', '釣銭(つりせん)', 'Tsurisen', 'Change given back'),
  word('v27', 'Out of stock', '品切(しなぎ)れ', 'Shinagire', 'Out of stock'),
  word('v28', 'Stock', '在庫(ざいこ)', 'Zaiko', 'Stock in the back'),
  word('v29', 'Backroom', 'バックヤード', 'Bakkuyādo', 'Backroom'),
  word('v30', 'Checking a delivery', '検品(けんぴん)', 'Kenpin', 'Checking a delivery against the list'),
  word('v31', 'Shift', 'シフト', 'Shifuto', 'Shift'),
  word('v32', 'Break', '休憩(きゅうけい)', 'Kyūkei', 'Break'),
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
    label: "Saying you didn't catch it",
    formal: {
      jp: '申(もう)し訳(わけ)ございません、聞(き)き取(と)れませんでした',
      ro: 'Mōshiwake gozaimasen, kikitoremasen deshita',
      en: "I'm sorry, I didn't catch that",
    },
    friendly: {
      jp: 'すみません、聞(き)き取(と)れませんでした',
      ro: 'Sumimasen, kikitoremasen deshita',
      en: "Sorry, I didn't catch that",
    },
  },
  {
    id: 's4',
    label: 'Buy time to check',
    formal: {
      jp: '確認(かくにん)いたしますので、少々(しょうしょう)お待(ま)ちください',
      ro: 'Kakunin itashimasu node, shōshō omachi kudasai',
      en: 'Let me check — one moment, please',
    },
    friendly: {
      jp: '確認(かくにん)しますので、少々(しょうしょう)お待(ま)ちください',
      ro: 'Kakunin shimasu node, shōshō omachi kudasai',
      en: 'Let me check — one moment',
    },
  },
  {
    id: 's5',
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
  {
    id: 's6',
    label: 'Flagging your Japanese',
    formal: {
      jp: '申(もう)し訳(わけ)ございません、日本語(にほんご)がまだ不慣(ふな)れです',
      ro: 'Mōshiwake gozaimasen, nihongo ga mada funare desu',
      en: "I'm sorry, my Japanese is still new",
    },
    friendly: {
      jp: 'すみません、日本語(にほんご)がまだ不慣(ふな)れです',
      ro: 'Sumimasen, nihongo ga mada funare desu',
      en: 'Sorry, my Japanese is still new',
    },
  },
  {
    id: 's7',
    label: 'Ask a senpai to teach you',
    formal: {
      jp: 'やり方(かた)を教(おし)えていただけますか',
      ro: 'Yarikata o oshiete itadakemasu ka',
      en: 'Could you show me how it is done?',
    },
    friendly: {
      jp: 'やり方(かた)を教(おし)えてもらえますか',
      ro: 'Yarikata o oshiete moraemasu ka',
      en: 'Can you show me how?',
    },
  },
  {
    id: 's8',
    label: 'Ask where something goes',
    formal: {
      jp: 'こちらはどこに置(お)けばよろしいでしょうか',
      ro: 'Kochira wa doko ni okeba yoroshii deshō ka',
      en: 'Where should this go?',
    },
    friendly: {
      jp: 'これはどこに置(お)きますか',
      ro: 'Kore wa doko ni okimasu ka',
      en: 'Where does this go?',
    },
  },
  {
    id: 's9',
    label: 'Owning a mistake',
    formal: {
      jp: '申(もう)し訳(わけ)ございません、間違(まちが)えてしまいました',
      ro: 'Mōshiwake gozaimasen, machigaete shimaimashita',
      en: 'I am very sorry, I made a mistake',
    },
    friendly: {
      jp: 'すみません、間違(まちが)えました',
      ro: 'Sumimasen, machigaemashita',
      en: 'Sorry, I made a mistake',
    },
  },
  {
    id: 's10',
    label: 'Asking to double-check first',
    formal: {
      jp: 'まだ慣(な)れておりませんので、確認(かくにん)させてください',
      ro: 'Mada narete orimasen node, kakunin sasete kudasai',
      en: "I'm not used to it yet, so let me check",
    },
    friendly: {
      jp: 'まだ慣(な)れていないので、確認(かくにん)させてください',
      ro: 'Mada narete inai node, kakunin sasete kudasai',
      en: "I'm still new to it, so let me check",
    },
  },
  {
    id: 's11',
    label: 'Asking for a break',
    formal: {
      jp: '休憩(きゅうけい)に入(はい)ってもよろしいでしょうか',
      ro: 'Kyūkei ni haitte mo yoroshii deshō ka',
      en: 'May I take my break?',
    },
    friendly: {
      jp: '休憩(きゅうけい)に入(はい)ってもいいですか',
      ro: 'Kyūkei ni haitte mo ii desu ka',
      en: 'Can I take my break?',
    },
  },
  {
    id: 's12',
    label: 'Leaving at the end of a shift',
    formal: {
      jp: 'お先(さき)に失礼(しつれい)いたします',
      ro: 'Osaki ni shitsurei itashimasu',
      en: 'Excuse me for leaving before you',
    },
    friendly: {
      jp: 'お先(さき)に失礼(しつれい)します',
      ro: 'Osaki ni shitsurei shimasu',
      en: 'Excuse me for leaving first',
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
        who: 'self',
        formal: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
        friendly: { jp: 'いらっしゃいませ', ro: 'Irasshaimase', en: 'Welcome' },
      },
      {
        who: 'self',
        formal: {
          jp: '合(あ)わせて八百円(はっぴゃくえん)でございます',
          ro: 'Awasete happyaku-en de gozaimasu',
          en: 'That will be 800 yen altogether',
        },
        friendly: {
          jp: '合(あ)わせて八百円(はっぴゃくえん)です',
          ro: 'Awasete happyaku-en desu',
          en: "That's 800 yen altogether",
        },
      },
      {
        who: 'other',
        formal: { jp: '千円(せんえん)で', ro: 'Sen-en de', en: 'Out of 1,000' },
        friendly: { jp: '千円(せんえん)で', ro: 'Sen-en de', en: 'Out of 1,000' },
      },
      {
        who: 'self',
        formal: {
          jp: '千円(せんえん)お預(あず)かりいたします',
          ro: 'Sen-en oazukari itashimasu',
          en: 'Taking 1,000 yen',
        },
        friendly: {
          jp: '千円(せんえん)お預(あず)かりします',
          ro: 'Sen-en oazukari shimasu',
          en: 'Out of 1,000 yen',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '二百円(にひゃくえん)のお返(かえ)しでございます',
          ro: 'Nihyaku-en no okaeshi de gozaimasu',
          en: '200 yen is your change',
        },
        friendly: {
          jp: '二百円(にひゃくえん)のお返(かえ)しです',
          ro: 'Nihyaku-en no okaeshi desu',
          en: "Here's 200 yen change",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございました。またお越(こ)しくださいませ',
          ro: 'Arigatō gozaimashita. Mata okoshi kudasaimase',
          en: 'Thank you very much. Please come again',
        },
        friendly: {
          jp: 'ありがとうございました。またお越(こ)しください',
          ro: 'Arigatō gozaimashita. Mata okoshi kudasai',
          en: 'Thank you very much. Please come again',
        },
      },
    ],
  },
  {
    id: 'sc2',
    title: '温(あたた)めと袋(ふくろ)',
    titleEn: 'Warming food and bags',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'お弁当(べんとう)は温(あたた)めますか',
          ro: 'O-bentō wa atatamemasu ka',
          en: 'Shall I warm the bento?',
        },
        friendly: {
          jp: 'お弁当(べんとう)、温(あたた)めますか',
          ro: 'O-bentō, atatamemasu ka',
          en: 'Warm up the bento?',
        },
      },
      {
        who: 'other',
        formal: { jp: 'はい、お願(ねが)いします', ro: 'Hai, onegai shimasu', en: 'Yes, please' },
        friendly: { jp: 'はい、お願(ねが)いします', ro: 'Hai, onegai shimasu', en: 'Yes, please' },
      },
      {
        who: 'self',
        formal: {
          jp: 'レジ袋(ぶくろ)はご利用(りよう)でしょうか。五円(ごえん)いただいております',
          ro: 'Reji-bukuro wa goriyō deshō ka. Go-en itadaite orimasu',
          en: 'Would you like a bag? There is a five-yen charge',
        },
        friendly: {
          jp: 'レジ袋(ぶくろ)はご利用(りよう)ですか。五円(ごえん)かかります',
          ro: 'Reji-bukuro wa goriyō desu ka. Go-en kakarimasu',
          en: 'Do you need a bag? It costs five yen',
        },
      },
      {
        who: 'other',
        formal: { jp: '大丈夫(だいじょうぶ)です', ro: 'Daijōbu desu', en: "No, I'm fine" },
        friendly: { jp: '大丈夫(だいじょうぶ)です', ro: 'Daijōbu desu', en: "No, I'm fine" },
      },
      {
        who: 'self',
        formal: {
          jp: 'お箸(はし)はお付(つ)けいたしますか',
          ro: 'O-hashi wa otsuke itashimasu ka',
          en: 'Shall I include chopsticks?',
        },
        friendly: {
          jp: 'お箸(はし)はお付(つ)けしますか',
          ro: 'O-hashi wa otsuke shimasu ka',
          en: 'Would you like chopsticks?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '熱(あつ)くなっておりますので、お気(き)をつけください',
          ro: 'Atsuku natte orimasu node, oki o tsuke kudasai',
          en: 'It is hot, so please be careful',
        },
        friendly: {
          jp: '熱(あつ)いので、お気(き)をつけください',
          ro: 'Atsui node, oki o tsuke kudasai',
          en: "It's hot, so please be careful",
        },
      },
    ],
  },
  {
    id: 'sc3',
    title: 'お支払(しはら)い方法(ほうほう)',
    titleEn: 'Payment methods',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'お支払(しはら)い方法(ほうほう)はいかがなさいますか',
          ro: 'O-shiharai hōhō wa ikaga nasaimasu ka',
          en: 'How would you like to pay?',
        },
        friendly: {
          jp: 'お支払(しはら)いはどうされますか',
          ro: 'O-shiharai wa dō saremasu ka',
          en: 'How are you paying?',
        },
      },
      {
        who: 'other',
        formal: { jp: '電子(でんし)マネーで', ro: 'Denshi manē de', en: 'By e-money' },
        friendly: { jp: '電子(でんし)マネーで', ro: 'Denshi manē de', en: 'By e-money' },
      },
      {
        who: 'self',
        formal: {
          jp: 'かしこまりました。こちらにタッチをお願(ねが)いいたします',
          ro: 'Kashikomarimashita. Kochira ni tatchi o onegai itashimasu',
          en: 'Certainly. Please tap here',
        },
        friendly: {
          jp: 'はい。こちらにタッチをお願(ねが)いします',
          ro: 'Hai. Kochira ni tatchi o onegai shimasu',
          en: 'Sure. Please tap here',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'ポイントカードもあります',
          ro: 'Pointo kādo mo arimasu',
          en: 'I have a point card too',
        },
        friendly: {
          jp: 'ポイントカードもあります',
          ro: 'Pointo kādo mo arimasu',
          en: 'I have a point card too',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '先(さき)にポイントカードをお預(あず)かりいたします',
          ro: 'Saki ni pointo kādo o oazukari itashimasu',
          en: 'I will take the point card first',
        },
        friendly: {
          jp: '先(さき)にポイントカードをお願(ねが)いします',
          ro: 'Saki ni pointo kādo o onegai shimasu',
          en: 'The point card first, please',
        },
      },
    ],
  },
  {
    id: 'sc4',
    title: '年齢確認(ねんれいかくにん)',
    titleEn: 'Age verification',
    lines: [
      {
        who: 'self',
        formal: {
          jp: '年齢確認(ねんれいかくにん)のため、こちらのパネルにタッチをお願(ねが)いいたします',
          ro: 'Nenrei kakunin no tame, kochira no paneru ni tatchi o onegai itashimasu',
          en: 'For age verification, please touch this panel',
        },
        friendly: {
          jp: '年齢確認(ねんれいかくにん)のため、こちらのパネルにタッチをお願(ねが)いします',
          ro: 'Nenrei kakunin no tame, kochira no paneru ni tatchi o onegai shimasu',
          en: 'For age verification, please touch this panel',
        },
      },
      {
        who: 'other',
        formal: { jp: 'これですか', ro: 'Kore desu ka', en: 'This one?' },
        friendly: { jp: 'これですか', ro: 'Kore desu ka', en: 'This one?' },
      },
      {
        who: 'self',
        formal: {
          jp: 'はい、二十歳以上(はたちいじょう)のボタンをお願(ねが)いいたします',
          ro: 'Hai, hatachi ijō no botan o onegai itashimasu',
          en: 'Yes, the button for twenty and over, please',
        },
        friendly: {
          jp: 'はい、二十歳以上(はたちいじょう)のところをお願(ねが)いします',
          ro: 'Hai, hatachi ijō no tokoro o onegai shimasu',
          en: 'Yes, the twenty-and-over one, please',
        },
      },
      {
        who: 'other',
        formal: { jp: '押(お)しました', ro: 'Oshimashita', en: 'Pressed it' },
        friendly: { jp: '押(お)しました', ro: 'Oshimashita', en: 'Pressed it' },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございます。確認(かくにん)いたしました',
          ro: 'Arigatō gozaimasu. Kakunin itashimashita',
          en: 'Thank you. That is confirmed',
        },
        friendly: {
          jp: 'ありがとうございます。確認(かくにん)しました',
          ro: 'Arigatō gozaimasu. Kakunin shimashita',
          en: 'Thank you. Confirmed',
        },
      },
    ],
  },
  {
    id: 'sc5',
    title: 'たばこの注文(ちゅうもん)',
    titleEn: 'A cigarette order',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'たばこを一(ひと)つください',
          ro: 'Tabako o hitotsu kudasai',
          en: 'A pack of cigarettes, please',
        },
        friendly: {
          jp: 'たばこ、一(ひと)つください',
          ro: 'Tabako, hitotsu kudasai',
          en: 'One pack of cigarettes',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '恐(おそ)れ入(い)りますが、番号(ばんごう)をお願(ねが)いいたします',
          ro: 'Osore irimasu ga, bangō o onegai itashimasu',
          en: 'Sorry to trouble you — the number, please',
        },
        friendly: {
          jp: 'すみません、番号(ばんごう)をお願(ねが)いします',
          ro: 'Sumimasen, bangō o onegai shimasu',
          en: 'Sorry, which number?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '二十三番(にじゅうさんばん)を二(ふた)つ',
          ro: 'Nijūsan-ban o futatsu',
          en: 'Two of number 23',
        },
        friendly: {
          jp: '二十三番(にじゅうさんばん)を二(ふた)つ',
          ro: 'Nijūsan-ban o futatsu',
          en: 'Two of number 23',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '二十三番(にじゅうさんばん)を二(ふた)つ、承(うけたまわ)りました',
          ro: 'Nijūsan-ban o futatsu, uketamawarimashita',
          en: 'Two of number 23 — understood',
        },
        friendly: {
          jp: '二十三番(にじゅうさんばん)を二(ふた)つ、わかりました',
          ro: 'Nijūsan-ban o futatsu, wakarimashita',
          en: 'Two of number 23, got it',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '年齢確認(ねんれいかくにん)をお願(ねが)いいたします',
          ro: 'Nenrei kakunin o onegai itashimasu',
          en: 'Age verification, please',
        },
        friendly: {
          jp: '年齢確認(ねんれいかくにん)をお願(ねが)いします',
          ro: 'Nenrei kakunin o onegai shimasu',
          en: 'Age verification, please',
        },
      },
    ],
  },
  {
    id: 'sc6',
    title: '公共料金(こうきょうりょうきん)の支払(しはら)い',
    titleEn: 'Paying a utility bill',
    lines: [
      {
        who: 'other',
        formal: {
          jp: '支払(しはら)いをお願(ねが)いします',
          ro: 'Shiharai o onegai shimasu',
          en: 'I would like to pay this',
        },
        friendly: {
          jp: '支払(しはら)いお願(ねが)いします',
          ro: 'Shiharai onegai shimasu',
          en: 'Paying this, please',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '払込票(はらいこみひょう)をお預(あず)かりいたします',
          ro: 'Haraikomihyō o oazukari itashimasu',
          en: 'I will take the payment slip',
        },
        friendly: {
          jp: '払込票(はらいこみひょう)をお預(あず)かりします',
          ro: 'Haraikomihyō o oazukari shimasu',
          en: "I'll take the slip",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '合計(ごうけい)三千円(さんぜんえん)でございます。現金(げんきん)のみとなります',
          ro: 'Gōkei sanzen-en de gozaimasu. Genkin nomi to narimasu',
          en: 'The total is 3,000 yen. Cash only, I am afraid',
        },
        friendly: {
          jp: '合計(ごうけい)三千円(さんぜんえん)です。現金(げんきん)のみです',
          ro: 'Gōkei sanzen-en desu. Genkin nomi desu',
          en: "It's 3,000 yen. Cash only",
        },
      },
      {
        who: 'other',
        formal: { jp: 'はい、これで', ro: 'Hai, kore de', en: 'Here you go' },
        friendly: { jp: 'はい、これで', ro: 'Hai, kore de', en: 'Here you go' },
      },
      {
        who: 'self',
        formal: {
          jp: '領収書(りょうしゅうしょ)でございます。大切(たいせつ)に保管(ほかん)してください',
          ro: 'Ryōshūsho de gozaimasu. Taisetsu ni hokan shite kudasai',
          en: 'Here is your receipt. Please keep it somewhere safe',
        },
        friendly: {
          jp: '領収書(りょうしゅうしょ)です。なくさないようにお願(ねが)いします',
          ro: 'Ryōshūsho desu. Nakusanai yō ni onegai shimasu',
          en: "Here's your receipt. Please don't lose it",
        },
      },
    ],
  },
  {
    id: 'sc7',
    title: '宅配便(たくはいびん)の受付(うけつけ)',
    titleEn: 'Taking in a parcel',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'これを送(おく)りたいのですが',
          ro: 'Kore o okuritai no desu ga',
          en: 'I would like to send this',
        },
        friendly: {
          jp: 'これ、送(おく)りたいんですけど',
          ro: 'Kore, okuritain desu kedo',
          en: 'I want to send this',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '送(おく)り状(じょう)にご記入(きにゅう)をお願(ねが)いいたします',
          ro: 'Okurijō ni gokinyū o onegai itashimasu',
          en: 'Please fill in the shipping label',
        },
        friendly: {
          jp: '送(おく)り状(じょう)に書(か)いていただけますか',
          ro: 'Okurijō ni kaite itadakemasu ka',
          en: 'Could you fill in the shipping label?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '中身(なかみ)は何(なん)でしょうか',
          ro: 'Nakami wa nan deshō ka',
          en: 'What are the contents?',
        },
        friendly: {
          jp: '中身(なかみ)は何(なん)ですか',
          ro: 'Nakami wa nan desu ka',
          en: "What's inside?",
        },
      },
      {
        who: 'other',
        formal: { jp: '洋服(ようふく)です', ro: 'Yōfuku desu', en: 'Clothes' },
        friendly: { jp: '洋服(ようふく)です', ro: 'Yōfuku desu', en: 'Clothes' },
      },
      {
        who: 'self',
        formal: {
          jp: '送料(そうりょう)は九百円(きゅうひゃくえん)、明日(あした)のお届(とど)けになります',
          ro: 'Sōryō wa kyūhyaku-en, ashita no otodoke ni narimasu',
          en: 'Postage is 900 yen, and it arrives tomorrow',
        },
        friendly: {
          jp: '送料(そうりょう)は九百円(きゅうひゃくえん)で、明日(あした)届(とど)きます',
          ro: 'Sōryō wa kyūhyaku-en de, ashita todokimasu',
          en: "Postage is 900 yen and it'll arrive tomorrow",
        },
      },
    ],
  },
  {
    id: 'sc8',
    title: 'ATMとコピー機(き)の案内(あんない)',
    titleEn: 'The ATM and the copier',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'すみません、ATMはどこですか',
          ro: 'Sumimasen, ATM wa doko desu ka',
          en: 'Excuse me, where is the ATM?',
        },
        friendly: {
          jp: 'すみません、ATMはどこですか',
          ro: 'Sumimasen, ATM wa doko desu ka',
          en: 'Excuse me, where is the ATM?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'あちらの奥(おく)にございます',
          ro: 'Achira no oku ni gozaimasu',
          en: 'It is at the back over there',
        },
        friendly: {
          jp: 'あちらの奥(おく)にあります',
          ro: 'Achira no oku ni arimasu',
          en: "It's at the back over there",
        },
      },
      {
        who: 'other',
        formal: { jp: 'コピーもできますか', ro: 'Kopī mo dekimasu ka', en: 'Can I make copies too?' },
        friendly: { jp: 'コピーもできますか', ro: 'Kopī mo dekimasu ka', en: 'Can I copy too?' },
      },
      {
        who: 'self',
        formal: {
          jp: 'はい、その隣(となり)のコピー機(き)でご利用(りよう)いただけます',
          ro: 'Hai, sono tonari no kopī-ki de goriyō itadakemasu',
          en: 'Yes, on the copier next to it',
        },
        friendly: {
          jp: 'はい、その隣(となり)のコピー機(き)で使(つか)えます',
          ro: 'Hai, sono tonari no kopī-ki de tsukaemasu',
          en: 'Yes, the copier next to it',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '操作(そうさ)がご不明(ふめい)でしたら、お声(こえ)がけください',
          ro: 'Sōsa ga gofumei deshitara, okoegake kudasai',
          en: 'If you are unsure how to work it, please call me',
        },
        friendly: {
          jp: 'わからなければ、声(こえ)をかけてください',
          ro: 'Wakaranakereba, koe o kakete kudasai',
          en: "If you're not sure, just call me",
        },
      },
    ],
  },
  {
    id: 'sc9',
    title: '商品(しょうひん)の場所(ばしょ)を聞(き)かれる',
    titleEn: 'Being asked where something is',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'パンはどこにありますか',
          ro: 'Pan wa doko ni arimasu ka',
          en: 'Where is the bread?',
        },
        friendly: { jp: 'パンはどこですか', ro: 'Pan wa doko desu ka', en: "Where's the bread?" },
      },
      {
        who: 'self',
        formal: {
          jp: 'ご案内(あんない)いたします。こちらへどうぞ',
          ro: 'Goannai itashimasu. Kochira e dōzo',
          en: 'I will show you. This way, please',
        },
        friendly: {
          jp: 'ご案内(あんない)します。こちらへどうぞ',
          ro: 'Goannai shimasu. Kochira e dōzo',
          en: "I'll show you. This way",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'こちらの棚(たな)にございます',
          ro: 'Kochira no tana ni gozaimasu',
          en: 'It is on this shelf',
        },
        friendly: {
          jp: 'こちらの棚(たな)にあります',
          ro: 'Kochira no tana ni arimasu',
          en: "It's on this shelf",
        },
      },
      {
        who: 'other',
        formal: { jp: 'ありがとうございます', ro: 'Arigatō gozaimasu', en: 'Thank you' },
        friendly: { jp: 'ありがとう', ro: 'Arigatō', en: 'Thanks' },
      },
      {
        who: 'self',
        formal: {
          jp: '他(ほか)にお探(さが)しのものはございますか',
          ro: 'Hoka ni osagashi no mono wa gozaimasu ka',
          en: 'Is there anything else you are looking for?',
        },
        friendly: {
          jp: '他(ほか)に探(さが)しているものはありますか',
          ro: 'Hoka ni sagashite iru mono wa arimasu ka',
          en: 'Anything else you need?',
        },
      },
    ],
  },
  {
    id: 'sc10',
    title: '品切(しなぎ)れの対応(たいおう)',
    titleEn: 'When something is out of stock',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'おでんはまだありますか',
          ro: 'Oden wa mada arimasu ka',
          en: 'Do you still have oden?',
        },
        friendly: { jp: 'おでんはまだありますか', ro: 'Oden wa mada arimasu ka', en: 'Any oden left?' },
      },
      {
        who: 'self',
        formal: {
          jp: '在庫(ざいこ)を確認(かくにん)してまいりますので、少々(しょうしょう)お待(ま)ちください',
          ro: 'Zaiko o kakunin shite mairimasu node, shōshō omachi kudasai',
          en: 'I will check the stock — one moment, please',
        },
        friendly: {
          jp: '在庫(ざいこ)を確認(かくにん)しますので、少々(しょうしょう)お待(ま)ちください',
          ro: 'Zaiko o kakunin shimasu node, shōshō omachi kudasai',
          en: "I'll check the stock — one moment",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '申(もう)し訳(わけ)ございません、ただいま品切(しなぎ)れとなっております',
          ro: 'Mōshiwake gozaimasen, tadaima shinagire to natte orimasu',
          en: 'I am very sorry, we are out of stock at the moment',
        },
        friendly: {
          jp: 'すみません、今(いま)は品切(しなぎ)れです',
          ro: 'Sumimasen, ima wa shinagire desu',
          en: "Sorry, we're out at the moment",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '夕方(ゆうがた)には入荷(にゅうか)いたします',
          ro: 'Yūgata ni wa nyūka itashimasu',
          en: 'We will have more by the evening',
        },
        friendly: {
          jp: '夕方(ゆうがた)には入(はい)ります',
          ro: 'Yūgata ni wa hairimasu',
          en: 'More comes in by the evening',
        },
      },
      {
        who: 'other',
        formal: { jp: 'わかりました', ro: 'Wakarimashita', en: 'I see' },
        friendly: { jp: 'わかりました', ro: 'Wakarimashita', en: 'OK' },
      },
    ],
  },
  {
    id: 'sc11',
    title: 'ホットスナックの注文(ちゅうもん)',
    titleEn: 'An order at the hot snack counter',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'からあげを二(ふた)つください',
          ro: 'Karaage o futatsu kudasai',
          en: 'Two portions of karaage, please',
        },
        friendly: {
          jp: 'からあげ、二(ふた)つください',
          ro: 'Karaage, futatsu kudasai',
          en: 'Two karaage, please',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'かしこまりました。少々(しょうしょう)お待(ま)ちください',
          ro: 'Kashikomarimashita. Shōshō omachi kudasai',
          en: 'Certainly. One moment, please',
        },
        friendly: {
          jp: 'はい。少々(しょうしょう)お待(ま)ちください',
          ro: 'Hai. Shōshō omachi kudasai',
          en: 'Sure. One moment',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '温(あたた)かいものは袋(ふくろ)をお分(わ)けいたしますか',
          ro: 'Atatakai mono wa fukuro o owake itashimasu ka',
          en: 'Shall I bag the hot items separately?',
        },
        friendly: {
          jp: '温(あたた)かいものは袋(ふくろ)を分(わ)けますか',
          ro: 'Atatakai mono wa fukuro o wakemasu ka',
          en: 'Separate bag for the hot food?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '一緒(いっしょ)で大丈夫(だいじょうぶ)です',
          ro: 'Issho de daijōbu desu',
          en: 'Together is fine',
        },
        friendly: {
          jp: '一緒(いっしょ)で大丈夫(だいじょうぶ)です',
          ro: 'Issho de daijōbu desu',
          en: 'Together is fine',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'お待(ま)たせいたしました。熱(あつ)くなっておりますので、お気(き)をつけください',
          ro: 'Omatase itashimashita. Atsuku natte orimasu node, oki o tsuke kudasai',
          en: 'Thank you for waiting. It is hot, so please be careful',
        },
        friendly: {
          jp: 'お待(ま)たせしました。熱(あつ)いので、お気(き)をつけください',
          ro: 'Omatase shimashita. Atsui node, oki o tsuke kudasai',
          en: "Sorry for the wait. It's hot, so be careful",
        },
      },
    ],
  },
  {
    id: 'sc12',
    title: 'コーヒーマシンの説明(せつめい)',
    titleEn: 'Explaining the coffee machine',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'コーヒーの使(つか)い方(かた)がわからないのですが',
          ro: 'Kōhī no tsukaikata ga wakaranai no desu ga',
          en: 'I am not sure how the coffee machine works',
        },
        friendly: {
          jp: 'コーヒーの使(つか)い方(かた)がわからないんですけど',
          ro: 'Kōhī no tsukaikata ga wakaranain desu kedo',
          en: "I don't know how to use the coffee machine",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ご案内(あんない)いたします。カップをこちらに置(お)いてください',
          ro: 'Goannai itashimasu. Kappu o kochira ni oite kudasai',
          en: 'I will show you. Please set the cup here',
        },
        friendly: {
          jp: 'ご案内(あんない)します。カップをここに置(お)いてください',
          ro: 'Goannai shimasu. Kappu o koko ni oite kudasai',
          en: "I'll show you. Put the cup here",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'サイズをお選(えら)びいただき、こちらのボタンを押(お)してください',
          ro: 'Saizu o oerabi itadaki, kochira no botan o oshite kudasai',
          en: 'Choose the size, then press this button',
        },
        friendly: {
          jp: 'サイズを選(えら)んで、こちらのボタンを押(お)してください',
          ro: 'Saizu o erande, kochira no botan o oshite kudasai',
          en: 'Pick the size, then press this button',
        },
      },
      {
        who: 'other',
        formal: { jp: 'これでよろしいですか', ro: 'Kore de yoroshii desu ka', en: 'Like this?' },
        friendly: { jp: 'これでいいですか', ro: 'Kore de ii desu ka', en: 'Like this?' },
      },
      {
        who: 'self',
        formal: {
          jp: 'はい、そのままお待(ま)ちください',
          ro: 'Hai, sono mama omachi kudasai',
          en: 'Yes, just wait there',
        },
        friendly: {
          jp: 'はい、そのまま待(ま)っていてください',
          ro: 'Hai, sono mama matte ite kudasai',
          en: 'Yes, just wait there',
        },
      },
    ],
  },
  {
    id: 'sc13',
    title: 'お釣(つ)りの間違(まちが)い',
    titleEn: 'A mistake with the change',
    lines: [
      {
        who: 'other',
        formal: {
          jp: 'すみません、お釣(つ)りが足(た)りないと思(おも)うのですが',
          ro: 'Sumimasen, otsuri ga tarinai to omou no desu ga',
          en: 'Excuse me, I think the change is short',
        },
        friendly: {
          jp: 'すみません、お釣(つ)りが足(た)りないと思(おも)うんですけど',
          ro: 'Sumimasen, otsuri ga tarinai to omoun desu kedo',
          en: 'Excuse me, I think you shorted my change',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '大変(たいへん)申(もう)し訳(わけ)ございません。すぐに確認(かくにん)いたします',
          ro: 'Taihen mōshiwake gozaimasen. Sugu ni kakunin itashimasu',
          en: 'I am terribly sorry. I will check right away',
        },
        friendly: {
          jp: '申(もう)し訳(わけ)ございません。すぐに確認(かくにん)します',
          ro: 'Mōshiwake gozaimasen. Sugu ni kakunin shimasu',
          en: "I'm very sorry. I'll check right away",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '店長(てんちょう)を呼(よ)んでまいりますので、少々(しょうしょう)お待(ま)ちください',
          ro: 'Tenchō o yonde mairimasu node, shōshō omachi kudasai',
          en: 'I will fetch the manager — one moment, please',
        },
        friendly: {
          jp: '店長(てんちょう)を呼(よ)んできますので、少々(しょうしょう)お待(ま)ちください',
          ro: 'Tenchō o yonde kimasu node, shōshō omachi kudasai',
          en: "I'll get the manager — one moment",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'お待(ま)たせいたしました。こちら、不足分(ふそくぶん)でございます',
          ro: 'Omatase itashimashita. Kochira, fusokubun de gozaimasu',
          en: 'Thank you for waiting. Here is the difference',
        },
        friendly: {
          jp: 'お待(ま)たせしました。こちら、足(た)りない分(ぶん)です',
          ro: 'Omatase shimashita. Kochira, tarinai bun desu',
          en: "Sorry for the wait. Here's what was missing",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ご迷惑(めいわく)をおかけして申(もう)し訳(わけ)ございませんでした',
          ro: 'Gomeiwaku o okake shite mōshiwake gozaimasen deshita',
          en: 'I am very sorry for the trouble',
        },
        friendly: {
          jp: 'ご迷惑(めいわく)をおかけしてすみませんでした',
          ro: 'Gomeiwaku o okake shite sumimasen deshita',
          en: 'Sorry for the trouble',
        },
      },
    ],
  },
  {
    id: 'sc14',
    title: '落(お)とし物(もの)の対応(たいおう)',
    titleEn: 'A lost item',
    lines: [
      {
        who: 'other',
        formal: {
          jp: '財布(さいふ)を落(お)としたかもしれません',
          ro: 'Saifu o otoshita kamo shiremasen',
          en: 'I may have dropped my wallet',
        },
        friendly: {
          jp: '財布(さいふ)を落(お)としたかもしれません',
          ro: 'Saifu o otoshita kamo shiremasen',
          en: 'I might have dropped my wallet',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'お預(あず)かりしているものを確認(かくにん)いたします',
          ro: 'Oazukari shite iru mono o kakunin itashimasu',
          en: 'I will check what has been handed in',
        },
        friendly: {
          jp: '預(あず)かっているものを確認(かくにん)します',
          ro: 'Azukatte iru mono o kakunin shimasu',
          en: "I'll check what's been handed in",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '色(いろ)と特徴(とくちょう)を教(おし)えていただけますか',
          ro: 'Iro to tokuchō o oshiete itadakemasu ka',
          en: 'Could you tell me the colour and any distinguishing features?',
        },
        friendly: {
          jp: '色(いろ)と特徴(とくちょう)を教(おし)えてもらえますか',
          ro: 'Iro to tokuchō o oshiete moraemasu ka',
          en: 'Can you tell me the colour and what it looks like?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '黒(くろ)い長財布(ながざいふ)です',
          ro: 'Kuroi nagazaifu desu',
          en: 'It is a black long wallet',
        },
        friendly: {
          jp: '黒(くろ)い長財布(ながざいふ)です',
          ro: 'Kuroi nagazaifu desu',
          en: "It's a black long wallet",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'こちらでお間違(まちが)いないでしょうか',
          ro: 'Kochira de omachigai nai deshō ka',
          en: 'Is this the one?',
        },
        friendly: {
          jp: 'こちらで間違(まちが)いないですか',
          ro: 'Kochira de machigai nai desu ka',
          en: 'Is this it?',
        },
      },
    ],
  },
  {
    id: 'sc15',
    title: '品出(しなだ)しを教(おそ)わる',
    titleEn: 'Learning how to restock',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、品出(しなだ)しのやり方(かた)を教(おし)えていただけますか',
          ro: 'Sumimasen, shinadashi no yarikata o oshiete itadakemasu ka',
          en: 'Excuse me, could you show me how to restock?',
        },
        friendly: {
          jp: 'すみません、品出(しなだ)しのやり方(かた)を教(おし)えてもらえますか',
          ro: 'Sumimasen, shinadashi no yarikata o oshiete moraemasu ka',
          en: 'Excuse me, can you show me how to restock?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '古(ふる)いものを前(まえ)に出(だ)して、新(あたら)しいものを後(うし)ろに入(い)れてください',
          ro: 'Furui mono o mae ni dashite, atarashii mono o ushiro ni irete kudasai',
          en: 'Bring the older stock forward and put the new stock behind it',
        },
        friendly: {
          jp: '古(ふる)いものを前(まえ)に出(だ)して、新(あたら)しいものを後(うし)ろに入(い)れて',
          ro: 'Furui mono o mae ni dashite, atarashii mono o ushiro ni irete',
          en: 'Old stock to the front, new stock behind',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '先入(さきい)れ先出(さきだ)し、ということでしょうか',
          ro: 'Sakiire sakidashi, to iu koto deshō ka',
          en: 'So — first in, first out?',
        },
        friendly: {
          jp: '先入(さきい)れ先出(さきだ)しですか',
          ro: 'Sakiire sakidashi desu ka',
          en: 'First in, first out?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'そうです。日付(ひづけ)も必(かなら)ず確認(かくにん)してください',
          ro: 'Sō desu. Hizuke mo kanarazu kakunin shite kudasai',
          en: 'That is right. Always check the dates too',
        },
        friendly: {
          jp: 'そう。日付(ひづけ)も必(かなら)ず確認(かくにん)して',
          ro: 'Sō. Hizuke mo kanarazu kakunin shite',
          en: 'Right. Always check the dates too',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'わかりました。やってみます',
          ro: 'Wakarimashita. Yatte mimasu',
          en: 'Understood. I will give it a go',
        },
        friendly: {
          jp: 'わかりました。やってみます',
          ro: 'Wakarimashita. Yatte mimasu',
          en: "Got it. I'll try",
        },
      },
    ],
  },
  {
    id: 'sc16',
    title: '期限(きげん)チェックと廃棄(はいき)',
    titleEn: 'Checking dates and disposal',
    lines: [
      {
        who: 'other',
        formal: {
          jp: '期限(きげん)チェックをお願(ねが)いします',
          ro: 'Kigen chekku o onegai shimasu',
          en: 'Could you do the date check?',
        },
        friendly: {
          jp: '期限(きげん)チェックお願(ねが)い',
          ro: 'Kigen chekku onegai',
          en: 'Date check, please',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'はい。消費期限(しょうひきげん)の切(き)れたものを下(さ)げればよろしいでしょうか',
          ro: 'Hai. Shōhi kigen no kireta mono o sagereba yoroshii deshō ka',
          en: 'Yes. Should I pull anything past its use-by date?',
        },
        friendly: {
          jp: 'はい。消費期限(しょうひきげん)が切(き)れたものを下(さ)げますか',
          ro: 'Hai. Shōhi kigen ga kireta mono o sagemasu ka',
          en: 'Yes. Pull anything past its use-by date?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'そうです。廃棄(はいき)の記録(きろく)をつけてから捨(す)ててください',
          ro: 'Sō desu. Haiki no kiroku o tsukete kara sutete kudasai',
          en: 'Yes. Log the disposal before throwing it out',
        },
        friendly: {
          jp: 'そう。廃棄(はいき)の記録(きろく)をつけてから捨(す)てて',
          ro: 'Sō. Haiki no kiroku o tsukete kara sutete',
          en: 'Right. Log it before you bin it',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '記録(きろく)には何(なに)を書(か)けばよろしいでしょうか',
          ro: 'Kiroku ni wa nani o kakeba yoroshii deshō ka',
          en: 'What should I write in the log?',
        },
        friendly: {
          jp: '記録(きろく)には何(なに)を書(か)きますか',
          ro: 'Kiroku ni wa nani o kakimasu ka',
          en: 'What goes in the log?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '商品名(しょうひんめい)と個数(こすう)だけで大丈夫(だいじょうぶ)です',
          ro: 'Shōhinmei to kosū dake de daijōbu desu',
          en: 'Just the product name and the quantity',
        },
        friendly: {
          jp: '商品名(しょうひんめい)と個数(こすう)だけで大丈夫(だいじょうぶ)',
          ro: 'Shōhinmei to kosū dake de daijōbu',
          en: 'Just the product name and quantity',
        },
      },
    ],
  },
  {
    id: 'sc17',
    title: '休憩(きゅうけい)とシフトの相談(そうだん)',
    titleEn: 'Breaks and shift changes',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、休憩(きゅうけい)に入(はい)ってもよろしいでしょうか',
          ro: 'Sumimasen, kyūkei ni haitte mo yoroshii deshō ka',
          en: 'Excuse me, may I take my break?',
        },
        friendly: {
          jp: 'すみません、休憩(きゅうけい)に入(はい)ってもいいですか',
          ro: 'Sumimasen, kyūkei ni haitte mo ii desu ka',
          en: 'Excuse me, can I take my break?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'どうぞ。四十五分(よんじゅうごふん)までにお戻(もど)りください',
          ro: 'Dōzo. Yonjūgo-fun made ni omodori kudasai',
          en: 'Go ahead. Please be back by 45 past',
        },
        friendly: {
          jp: 'どうぞ。四十五分(よんじゅうごふん)までに戻(もど)って',
          ro: 'Dōzo. Yonjūgo-fun made ni modotte',
          en: 'Go ahead. Back by 45 past',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '来週(らいしゅう)の金曜日(きんようび)、シフトを代(か)わっていただけないでしょうか',
          ro: 'Raishū no kinyōbi, shifuto o kawatte itadakenai deshō ka',
          en: 'Would you be able to swap shifts with me next Friday?',
        },
        friendly: {
          jp: '来週(らいしゅう)の金曜日(きんようび)、シフトを代(か)わってもらえませんか',
          ro: 'Raishū no kinyōbi, shifuto o kawatte moraemasen ka',
          en: 'Could you swap shifts with me next Friday?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '大丈夫(だいじょうぶ)です。店長(てんちょう)に伝(つた)えておきます',
          ro: 'Daijōbu desu. Tenchō ni tsutaete okimasu',
          en: 'That is fine. I will let the manager know',
        },
        friendly: {
          jp: '大丈夫(だいじょうぶ)。店長(てんちょう)に伝(つた)えておく',
          ro: 'Daijōbu. Tenchō ni tsutaete oku',
          en: "That's fine. I'll tell the manager",
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございます、助(たす)かります',
          ro: 'Arigatō gozaimasu, tasukarimasu',
          en: 'Thank you, that helps a lot',
        },
        friendly: {
          jp: 'ありがとうございます、助(たす)かります',
          ro: 'Arigatō gozaimasu, tasukarimasu',
          en: 'Thank you, that really helps',
        },
      },
    ],
  },
  {
    id: 'sc18',
    title: '出勤(しゅっきん)と退勤(たいきん)',
    titleEn: 'Clocking in and out',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'おはようございます。本日(ほんじつ)もよろしくお願(ねが)いいたします',
          ro: 'Ohayō gozaimasu. Honjitsu mo yoroshiku onegai itashimasu',
          en: 'Good morning. I look forward to working with you today',
        },
        friendly: {
          jp: 'おはようございます。今日(きょう)もよろしくお願(ねが)いします',
          ro: 'Ohayō gozaimasu. Kyō mo yoroshiku onegai shimasu',
          en: 'Good morning. Looking forward to today',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'おはようございます。本日(ほんじつ)はレジをお願(ねが)いします',
          ro: 'Ohayō gozaimasu. Honjitsu wa reji o onegai shimasu',
          en: 'Good morning. You are on the register today',
        },
        friendly: {
          jp: 'おはよう。今日(きょう)はレジをお願(ねが)い',
          ro: 'Ohayō. Kyō wa reji o onegai',
          en: "Morning. You're on the register today",
        },
      },
      {
        who: 'self',
        formal: { jp: 'かしこまりました', ro: 'Kashikomarimashita', en: 'Certainly' },
        friendly: { jp: 'はい、わかりました', ro: 'Hai, wakarimashita', en: 'Got it' },
      },
      {
        who: 'self',
        formal: {
          jp: '本日(ほんじつ)の業務(ぎょうむ)は以上(いじょう)です。お先(さき)に失礼(しつれい)いたします',
          ro: 'Honjitsu no gyōmu wa ijō desu. Osaki ni shitsurei itashimasu',
          en: 'That is everything for today. Excuse me for leaving before you',
        },
        friendly: {
          jp: '今日(きょう)の分(ぶん)は終(お)わりました。お先(さき)に失礼(しつれい)します',
          ro: 'Kyō no bun wa owarimashita. Osaki ni shitsurei shimasu',
          en: "I'm done for today. Excuse me for leaving first",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'お疲(つか)れ様(さま)でした',
          ro: 'Otsukare-sama deshita',
          en: 'Thank you for your work today',
        },
        friendly: {
          jp: 'お疲(つか)れ様(さま)でした',
          ro: 'Otsukare-sama deshita',
          en: 'Good work today',
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
