import type { Card, Deck, Script } from '../../lib/japanese/types';

/* -------------------------------------------------------------------------
 * Japan trip trainer content.
 *
 * The register pair is Polite (formal) / Casual (friendly). Polite is what a
 * traveller should use with a stranger on the street; Casual is the shorter
 * form they will hear back, and can use with people their own age.
 *
 * Vocabulary cards carry the same string in both registers — a noun does not
 * change register — so the toggle stays consistent across every deck.
 * ---------------------------------------------------------------------- */

export const CORE_PHRASES: Card[] = [
  {
    id: 't1',
    label: "Getting someone's attention",
    formal: { jp: 'すみません', ro: 'Sumimasen', en: 'Excuse me' },
    friendly: { jp: 'すみません', ro: 'Sumimasen', en: 'Excuse me' },
  },
  {
    id: 't2',
    label: 'Thank you',
    formal: { jp: 'ありがとうございます', ro: 'Arigatō gozaimasu', en: 'Thank you' },
    friendly: { jp: 'ありがとう', ro: 'Arigatō', en: 'Thanks' },
  },
  {
    id: 't3',
    label: 'Asking about English',
    formal: {
      jp: '英語(えいご)は話(はな)せますか',
      ro: 'Eigo wa hanasemasu ka',
      en: 'Do you speak English?',
    },
    friendly: {
      jp: '英語(えいご)、わかりますか',
      ro: 'Eigo, wakarimasu ka',
      en: 'Do you understand English?',
    },
  },
  {
    id: 't4',
    label: 'Your own Japanese',
    formal: {
      jp: '日本語(にほんご)は少(すこ)しだけ話(はな)せます',
      ro: 'Nihongo wa sukoshi dake hanasemasu',
      en: 'I speak only a little Japanese',
    },
    friendly: {
      jp: '日本語(にほんご)は少(すこ)しだけです',
      ro: 'Nihongo wa sukoshi dake desu',
      en: 'Only a little Japanese',
    },
  },
  {
    id: 't5',
    label: "Saying you didn't follow",
    formal: {
      jp: 'すみません、よくわかりません',
      ro: 'Sumimasen, yoku wakarimasen',
      en: "Sorry, I don't quite follow",
    },
    friendly: { jp: 'わかりません', ro: 'Wakarimasen', en: "I don't understand" },
  },
  {
    id: 't6',
    label: 'Asking where something is',
    formal: {
      jp: '〜はどちらでしょうか',
      ro: '~ wa dochira deshō ka',
      en: 'Where would ~ be?',
    },
    friendly: { jp: '〜はどこですか', ro: '~ wa doko desu ka', en: 'Where is ~?' },
  },
  {
    id: 't7',
    label: 'Asking the price',
    formal: { jp: 'おいくらですか', ro: 'O-ikura desu ka', en: 'How much is it?' },
    friendly: { jp: 'いくらですか', ro: 'Ikura desu ka', en: 'How much?' },
  },
  {
    id: 't8',
    label: 'Choosing something',
    formal: {
      jp: 'これをお願(ねが)いします',
      ro: 'Kore o onegai shimasu',
      en: "I'll have this one, please",
    },
    friendly: { jp: 'これください', ro: 'Kore kudasai', en: "I'll take this" },
  },
  {
    id: 't9',
    label: 'Declining politely',
    formal: {
      jp: '大丈夫(だいじょうぶ)です、ありがとうございます',
      ro: 'Daijōbu desu, arigatō gozaimasu',
      en: "I'm fine, thank you",
    },
    friendly: { jp: '大丈夫(だいじょうぶ)です', ro: 'Daijōbu desu', en: "I'm fine" },
  },
  {
    id: 't10',
    label: 'Accepting an offer',
    formal: {
      jp: 'はい、お願(ねが)いします',
      ro: 'Hai, onegai shimasu',
      en: 'Yes, please',
    },
    friendly: { jp: 'はい、お願(ねが)いします', ro: 'Hai, onegai shimasu', en: 'Yes, please' },
  },
];

const word = (id: string, label: string, jp: string, ro: string, en: string): Card => ({
  id,
  label,
  formal: { jp, ro, en },
  friendly: { jp, ro, en },
});

export const STREETS: Card[] = [
  word('st1', 'Station', '駅(えき)', 'Eki', 'Train station'),
  word('st2', 'Ticket gate', '改札(かいさつ)', 'Kaisatsu', 'Ticket gate'),
  word('st3', 'Exit', '出口(でぐち)', 'Deguchi', 'Exit'),
  word('st4', 'North exit', '北口(きたぐち)', 'Kitaguchi', 'North exit'),
  word('st5', 'Ticket', '切符(きっぷ)', 'Kippu', 'Ticket'),
  word('st6', 'Transfer', '乗(の)り換(か)え', 'Norikae', 'Changing trains'),
  word('st7', 'Local train', '各駅停車(かくえきていしゃ)', 'Kakueki teisha', 'Local train — stops everywhere'),
  word('st8', 'Express', '急行(きゅうこう)', 'Kyūkō', 'Express train — skips stops'),
  word('st9', 'Platform 3', '三番線(さんばんせん)', 'Sanbansen', 'Platform 3'),
  word('st10', 'Police box', '交番(こうばん)', 'Kōban', 'Police box — the place to ask when lost'),
  word('st11', 'Right', '右(みぎ)', 'Migi', 'Right'),
  word('st12', 'Left', '左(ひだり)', 'Hidari', 'Left'),
  word('st13', 'Straight ahead', 'まっすぐ', 'Massugu', 'Straight ahead'),
  word('st14', 'Traffic light', '信号(しんごう)', 'Shingō', 'Traffic light'),
  word('st15', 'Corner', '角(かど)', 'Kado', 'Corner'),
  word('st16', 'Map', '地図(ちず)', 'Chizu', 'Map'),
  word('st17', 'Five minutes on foot', '徒歩(とほ)五分(ごふん)', 'Toho gofun', 'Five minutes on foot'),
  word('st18', 'Bus stop', 'バス停(てい)', 'Basu-tei', 'Bus stop'),
  word('st19', 'Coin locker', 'コインロッカー', 'Koin rokkā', 'Coin locker'),
  word('st20', 'Money exchange', '両替(りょうがえ)', 'Ryōgae', 'Money exchange'),
];

export const SURVIVAL: Card[] = [
  {
    id: 'sv1',
    label: 'Ask for a repeat',
    formal: {
      jp: 'もう一度(いちど)お願(ねが)いします',
      ro: 'Mō ichido onegai shimasu',
      en: 'Once more, please',
    },
    friendly: {
      jp: 'もう一度(いちど)いいですか',
      ro: 'Mō ichido ii desu ka',
      en: 'Again, please?',
    },
  },
  {
    id: 'sv2',
    label: 'Ask them to slow down',
    formal: {
      jp: 'もう少(すこ)しゆっくりお願(ねが)いします',
      ro: 'Mō sukoshi yukkuri onegai shimasu',
      en: 'A little slower, please',
    },
    friendly: {
      jp: 'ゆっくりお願(ねが)いします',
      ro: 'Yukkuri onegai shimasu',
      en: 'Slowly, please',
    },
  },
  {
    id: 'sv3',
    label: 'Ask them to write it down',
    formal: {
      jp: 'ここに書(か)いていただけますか',
      ro: 'Koko ni kaite itadakemasu ka',
      en: 'Could you write it here?',
    },
    friendly: {
      jp: 'ここに書(か)いてもらえますか',
      ro: 'Koko ni kaite moraemasu ka',
      en: 'Can you write it here?',
    },
  },
  {
    id: 'sv4',
    label: "Saying you're lost",
    formal: {
      jp: '道(みち)に迷(まよ)ってしまいました',
      ro: 'Michi ni mayotte shimaimashita',
      en: "I've got lost",
    },
    friendly: {
      jp: '道(みち)に迷(まよ)いました',
      ro: 'Michi ni mayoimashita',
      en: "I'm lost",
    },
  },
  {
    id: 'sv5',
    label: 'Ask where you are',
    formal: {
      jp: '今(いま)いる場所(ばしょ)を教(おし)えていただけますか',
      ro: 'Ima iru basho o oshiete itadakemasu ka',
      en: 'Could you show me where I am?',
    },
    friendly: { jp: 'ここはどこですか', ro: 'Koko wa doko desu ka', en: 'Where is this?' },
  },
  {
    id: 'sv6',
    label: 'Ask for a photo',
    formal: {
      jp: '写真(しゃしん)を撮(と)っていただけますか',
      ro: 'Shashin o totte itadakemasu ka',
      en: 'Could you take a photo?',
    },
    friendly: {
      jp: '写真(しゃしん)、撮(と)ってもらえますか',
      ro: 'Shashin, totte moraemasu ka',
      en: 'Can you take a photo?',
    },
  },
  {
    id: 'sv7',
    label: 'Ask for an English menu',
    formal: {
      jp: '英語(えいご)のメニューはありますか',
      ro: 'Eigo no menyū wa arimasu ka',
      en: 'Do you have an English menu?',
    },
    friendly: {
      jp: '英語(えいご)のメニュー、ありますか',
      ro: 'Eigo no menyū, arimasu ka',
      en: 'English menu?',
    },
  },
  {
    id: 'sv8',
    label: 'Ask for the toilet',
    formal: {
      jp: 'お手洗(てあら)いはどちらですか',
      ro: 'O-tearai wa dochira desu ka',
      en: 'Where is the washroom?',
    },
    friendly: { jp: 'トイレはどこですか', ro: 'Toire wa doko desu ka', en: 'Where is the toilet?' },
  },
  {
    id: 'sv9',
    label: 'Ask for help',
    formal: {
      jp: 'すみません、助(たす)けていただけますか',
      ro: 'Sumimasen, tasukete itadakemasu ka',
      en: 'Excuse me, could you help me?',
    },
    friendly: { jp: '助(たす)けてください', ro: 'Tasukete kudasai', en: 'Please help me' },
  },
  {
    id: 'sv10',
    label: 'Ask what something is',
    formal: {
      jp: 'こちらは何(なん)でしょうか',
      ro: 'Kochira wa nan deshō ka',
      en: 'What is this, may I ask?',
    },
    friendly: { jp: 'これは何(なん)ですか', ro: 'Kore wa nan desu ka', en: 'What is this?' },
  },
  {
    id: 'sv11',
    label: 'Ask about card payment',
    formal: {
      jp: 'カードは使(つか)えますか',
      ro: 'Kādo wa tsukaemasu ka',
      en: 'Can I pay by card?',
    },
    friendly: { jp: 'カード、使(つか)えますか', ro: 'Kādo, tsukaemasu ka', en: 'Card OK?' },
  },
];

export const SCRIPTS: Script[] = [
  {
    id: 'tr1',
    title: '道(みち)を聞(き)く',
    titleEn: 'Asking for directions',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、ちょっとよろしいですか',
          ro: 'Sumimasen, chotto yoroshii desu ka',
          en: 'Excuse me, do you have a moment?',
        },
        friendly: {
          jp: 'すみません、ちょっといいですか',
          ro: 'Sumimasen, chotto ii desu ka',
          en: 'Excuse me, got a second?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '東京駅(とうきょうえき)へ行(い)きたいのですが',
          ro: 'Tōkyō-eki e ikitai no desu ga',
          en: "I'd like to get to Tokyo Station",
        },
        friendly: {
          jp: '東京駅(とうきょうえき)に行(い)きたいんですけど',
          ro: 'Tōkyō-eki ni ikitain desu kedo',
          en: "I'm trying to get to Tokyo Station",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'この道(みち)をまっすぐ行(い)って、二(ふた)つ目(め)の信号(しんごう)を右(みぎ)です',
          ro: 'Kono michi o massugu itte, futatsu-me no shingō o migi desu',
          en: 'Straight down this road, then right at the second light',
        },
        friendly: {
          jp: 'この道(みち)まっすぐ行(い)って、二(ふた)つ目(め)の信号(しんごう)を右(みぎ)',
          ro: 'Kono michi massugu itte, futatsu-me no shingō o migi',
          en: 'Straight down this road, right at the second light',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '歩(ある)いてどのくらいかかりますか',
          ro: 'Aruite dono kurai kakarimasu ka',
          en: 'How long does it take on foot?',
        },
        friendly: {
          jp: '歩(ある)いてどのくらいですか',
          ro: 'Aruite dono kurai desu ka',
          en: 'How far is that walking?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '十分(じゅっぷん)くらいだと思(おも)います',
          ro: 'Juppun kurai da to omoimasu',
          en: 'About ten minutes, I think',
        },
        friendly: {
          jp: '十分(じゅっぷん)くらいですよ',
          ro: 'Juppun kurai desu yo',
          en: 'About ten minutes',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございます、助(たす)かりました',
          ro: 'Arigatō gozaimasu, tasukarimashita',
          en: 'Thank you, that helps a lot',
        },
        friendly: {
          jp: 'ありがとうございます',
          ro: 'Arigatō gozaimasu',
          en: 'Thank you',
        },
      },
    ],
  },
  {
    id: 'tr2',
    title: '駅(えき)で切符(きっぷ)を買(か)う',
    titleEn: 'Buying a ticket',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、渋谷(しぶや)までいくらでしょうか',
          ro: 'Sumimasen, Shibuya made ikura deshō ka',
          en: 'Excuse me, how much is it to Shibuya?',
        },
        friendly: {
          jp: 'すみません、渋谷(しぶや)までいくらですか',
          ro: 'Sumimasen, Shibuya made ikura desu ka',
          en: 'Excuse me, how much to Shibuya?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '二百円(にひゃくえん)です。あちらの券売機(けんばいき)で買(か)えます',
          ro: 'Nihyaku-en desu. Achira no kenbaiki de kaemasu',
          en: "It's 200 yen. You can buy it at that machine",
        },
        friendly: {
          jp: '二百円(にひゃくえん)です。あの券売機(けんばいき)で買(か)えますよ',
          ro: 'Nihyaku-en desu. Ano kenbaiki de kaemasu yo',
          en: "200 yen. You can buy it at that machine",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '使(つか)い方(かた)を教(おし)えていただけますか',
          ro: 'Tsukaikata o oshiete itadakemasu ka',
          en: 'Could you show me how to use it?',
        },
        friendly: {
          jp: '使(つか)い方(かた)を教(おし)えてもらえますか',
          ro: 'Tsukaikata o oshiete moraemasu ka',
          en: 'Can you show me how it works?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'まず、ここを押(お)して、お金(かね)を入(い)れてください',
          ro: 'Mazu, koko o oshite, o-kane o irete kudasai',
          en: 'First press here, then put the money in',
        },
        friendly: {
          jp: 'まず、ここ押(お)して、お金(かね)入(い)れて',
          ro: 'Mazu, koko oshite, o-kane irete',
          en: 'Press here first, then put the money in',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'わかりました。ありがとうございます',
          ro: 'Wakarimashita. Arigatō gozaimasu',
          en: 'I see. Thank you',
        },
        friendly: {
          jp: 'わかりました。ありがとうございます',
          ro: 'Wakarimashita. Arigatō gozaimasu',
          en: 'Got it. Thank you',
        },
      },
    ],
  },
  {
    id: 'tr3',
    title: '乗(の)り換(か)えを聞(き)く',
    titleEn: 'Asking about a transfer',
    lines: [
      {
        who: 'self',
        formal: {
          jp: '新宿(しんじゅく)へ行(い)くには、どの線(せん)に乗(の)ればいいでしょうか',
          ro: 'Shinjuku e iku ni wa, dono sen ni noreba ii deshō ka',
          en: 'Which line should I take to get to Shinjuku?',
        },
        friendly: {
          jp: '新宿(しんじゅく)に行(い)くには、どの線(せん)ですか',
          ro: 'Shinjuku ni iku ni wa, dono sen desu ka',
          en: 'Which line goes to Shinjuku?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '山手線(やまのてせん)です。三番線(さんばんせん)から出(で)ています',
          ro: 'Yamanote-sen desu. Sanbansen kara dete imasu',
          en: 'The Yamanote line. It leaves from platform 3',
        },
        friendly: {
          jp: '山手線(やまのてせん)。三番線(さんばんせん)ですよ',
          ro: 'Yamanote-sen. Sanbansen desu yo',
          en: 'The Yamanote line, platform 3',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '乗(の)り換(か)えは必要(ひつよう)ですか',
          ro: 'Norikae wa hitsuyō desu ka',
          en: 'Do I need to change trains?',
        },
        friendly: {
          jp: '乗(の)り換(か)えはいりますか',
          ro: 'Norikae wa irimasu ka',
          en: 'Do I have to transfer?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'いいえ、そのまま行(い)けます',
          ro: 'Iie, sono mama ikemasu',
          en: 'No, it goes straight through',
        },
        friendly: {
          jp: 'いいえ、そのままで大丈夫(だいじょうぶ)',
          ro: 'Iie, sono mama de daijōbu',
          en: "No, you're fine as you are",
        },
      },
      {
        who: 'self',
        formal: {
          jp: '助(たす)かりました。ありがとうございます',
          ro: 'Tasukarimashita. Arigatō gozaimasu',
          en: 'That helps. Thank you',
        },
        friendly: {
          jp: 'ありがとうございます',
          ro: 'Arigatō gozaimasu',
          en: 'Thank you',
        },
      },
    ],
  },
  {
    id: 'tr4',
    title: 'タクシーに乗(の)る',
    titleEn: 'Taking a taxi',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'このホテルまでお願(ねが)いします',
          ro: 'Kono hoteru made onegai shimasu',
          en: 'To this hotel, please',
        },
        friendly: {
          jp: 'このホテルまでお願(ねが)いします',
          ro: 'Kono hoteru made onegai shimasu',
          en: 'To this hotel, please',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'かしこまりました。三十分(さんじゅっぷん)ほどかかります',
          ro: 'Kashikomarimashita. Sanjuppun hodo kakarimasu',
          en: 'Certainly. It will take about thirty minutes',
        },
        friendly: {
          jp: 'はい。三十分(さんじゅっぷん)くらいかかりますよ',
          ro: 'Hai. Sanjuppun kurai kakarimasu yo',
          en: 'Sure. About thirty minutes',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'カードは使(つか)えますか',
          ro: 'Kādo wa tsukaemasu ka',
          en: 'Can I pay by card?',
        },
        friendly: {
          jp: 'カード、使(つか)えますか',
          ro: 'Kādo, tsukaemasu ka',
          en: 'Card OK?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'はい、お使(つか)いいただけます',
          ro: 'Hai, o-tsukai itadakemasu',
          en: 'Yes, you can',
        },
        friendly: { jp: 'はい、使(つか)えます', ro: 'Hai, tsukaemasu', en: 'Yes, you can' },
      },
      {
        who: 'self',
        formal: {
          jp: 'すみません、ここで降(お)ろしてください',
          ro: 'Sumimasen, koko de oroshite kudasai',
          en: 'Could you drop me here, please',
        },
        friendly: {
          jp: 'ここで大丈夫(だいじょうぶ)です',
          ro: 'Koko de daijōbu desu',
          en: 'Here is fine',
        },
      },
    ],
  },
  {
    id: 'tr5',
    title: 'レストランで注文(ちゅうもん)する',
    titleEn: 'Ordering at a restaurant',
    lines: [
      {
        who: 'other',
        formal: { jp: '何名様(なんめいさま)ですか', ro: 'Nanmei-sama desu ka', en: 'How many people?' },
        friendly: { jp: '何名様(なんめいさま)ですか', ro: 'Nanmei-sama desu ka', en: 'How many?' },
      },
      {
        who: 'self',
        formal: { jp: '二人(ふたり)です', ro: 'Futari desu', en: 'Two of us' },
        friendly: { jp: '二人(ふたり)です', ro: 'Futari desu', en: 'Two' },
      },
      {
        who: 'self',
        formal: {
          jp: 'おすすめは何(なん)でしょうか',
          ro: 'O-susume wa nan deshō ka',
          en: 'What would you recommend?',
        },
        friendly: {
          jp: 'おすすめは何(なん)ですか',
          ro: 'O-susume wa nan desu ka',
          en: "What's good here?",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'こちらの定食(ていしょく)が人気(にんき)でございます',
          ro: 'Kochira no teishoku ga ninki de gozaimasu',
          en: 'This set meal is popular',
        },
        friendly: {
          jp: 'この定食(ていしょく)が人気(にんき)です',
          ro: 'Kono teishoku ga ninki desu',
          en: 'This set meal is popular',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'アレルギーがあるのですが、卵(たまご)は入(はい)っていますか',
          ro: 'Arerugī ga aru no desu ga, tamago wa haitte imasu ka',
          en: 'I have an allergy — does it contain egg?',
        },
        friendly: {
          jp: 'アレルギーがあって、卵(たまご)は入(はい)っていますか',
          ro: 'Arerugī ga atte, tamago wa haitte imasu ka',
          en: 'I have an allergy — is there egg in it?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'では、これをお願(ねが)いします',
          ro: 'Dewa, kore o onegai shimasu',
          en: "Then I'll have this, please",
        },
        friendly: {
          jp: 'じゃあ、これください',
          ro: 'Jā, kore kudasai',
          en: "OK, I'll take this",
        },
      },
    ],
  },
  {
    id: 'tr6',
    title: 'お店(みせ)で買(か)い物(もの)をする',
    titleEn: 'Shopping',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、これを見(み)せていただけますか',
          ro: 'Sumimasen, kore o misete itadakemasu ka',
          en: 'Excuse me, could I see this?',
        },
        friendly: {
          jp: 'すみません、これ見(み)せてもらえますか',
          ro: 'Sumimasen, kore misete moraemasu ka',
          en: 'Excuse me, can I see this?',
        },
      },
      {
        who: 'other',
        formal: { jp: 'どうぞ、ご覧(らん)ください', ro: 'Dōzo, goran kudasai', en: 'Please, take a look' },
        friendly: { jp: 'どうぞ', ro: 'Dōzo', en: 'Go ahead' },
      },
      {
        who: 'self',
        formal: {
          jp: '他(ほか)の色(いろ)はございますか',
          ro: 'Hoka no iro wa gozaimasu ka',
          en: 'Do you have other colours?',
        },
        friendly: {
          jp: '他(ほか)の色(いろ)はありますか',
          ro: 'Hoka no iro wa arimasu ka',
          en: 'Any other colours?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '白(しろ)と黒(くろ)がございます',
          ro: 'Shiro to kuro ga gozaimasu',
          en: 'We have white and black',
        },
        friendly: {
          jp: '白(しろ)と黒(くろ)があります',
          ro: 'Shiro to kuro ga arimasu',
          en: 'White and black',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '試着(しちゃく)してもよろしいですか',
          ro: 'Shichaku shite mo yoroshii desu ka',
          en: 'May I try it on?',
        },
        friendly: {
          jp: '試着(しちゃく)してもいいですか',
          ro: 'Shichaku shite mo ii desu ka',
          en: 'Can I try it on?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'では、これをお願(ねが)いします',
          ro: 'Dewa, kore o onegai shimasu',
          en: "I'll take this one, please",
        },
        friendly: { jp: 'じゃあ、これください', ro: 'Jā, kore kudasai', en: "I'll take this" },
      },
    ],
  },
  {
    id: 'tr7',
    title: 'ホテルのチェックイン',
    titleEn: 'Checking in at a hotel',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'チェックインをお願(ねが)いします',
          ro: 'Chekkuin o onegai shimasu',
          en: "I'd like to check in, please",
        },
        friendly: {
          jp: 'チェックインお願(ねが)いします',
          ro: 'Chekkuin onegai shimasu',
          en: 'Checking in, please',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'お名前(なまえ)をお願(ねが)いいたします',
          ro: 'O-namae o onegai itashimasu',
          en: 'Your name, please',
        },
        friendly: {
          jp: 'お名前(なまえ)をお願(ねが)いします',
          ro: 'O-namae o onegai shimasu',
          en: 'Your name, please',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '予約(よやく)しております。マリアと申(もう)します',
          ro: 'Yoyaku shite orimasu. Maria to mōshimasu',
          en: 'I have a reservation. My name is Maria',
        },
        friendly: {
          jp: '予約(よやく)しています。マリアです',
          ro: 'Yoyaku shite imasu. Maria desu',
          en: "I have a reservation. I'm Maria",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'パスポートを拝見(はいけん)してもよろしいでしょうか',
          ro: 'Pasupōto o haiken shite mo yoroshii deshō ka',
          en: 'May I see your passport?',
        },
        friendly: {
          jp: 'パスポートを見(み)せていただけますか',
          ro: 'Pasupōto o misete itadakemasu ka',
          en: 'Could I see your passport?',
        },
      },
      {
        who: 'self',
        formal: { jp: 'はい、どうぞ', ro: 'Hai, dōzo', en: 'Yes, here you are' },
        friendly: { jp: 'はい、どうぞ', ro: 'Hai, dōzo', en: 'Here you go' },
      },
      {
        who: 'self',
        formal: {
          jp: '荷物(にもつ)を預(あず)かっていただけますか',
          ro: 'Nimotsu o azukatte itadakemasu ka',
          en: 'Could you hold my luggage?',
        },
        friendly: {
          jp: '荷物(にもつ)、預(あず)かってもらえますか',
          ro: 'Nimotsu, azukatte moraemasu ka',
          en: 'Can you keep my bags?',
        },
      },
    ],
  },
  {
    id: 'tr8',
    title: '写真(しゃしん)をお願(ねが)いする',
    titleEn: 'Asking someone to take your photo',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、写真(しゃしん)を撮(と)っていただけますか',
          ro: 'Sumimasen, shashin o totte itadakemasu ka',
          en: 'Excuse me, could you take a photo for us?',
        },
        friendly: {
          jp: 'すみません、写真(しゃしん)撮(と)ってもらえますか',
          ro: 'Sumimasen, shashin totte moraemasu ka',
          en: 'Excuse me, can you take a photo?',
        },
      },
      {
        who: 'other',
        formal: { jp: 'はい、いいですよ', ro: 'Hai, ii desu yo', en: 'Sure, of course' },
        friendly: { jp: 'いいですよ', ro: 'Ii desu yo', en: 'Sure' },
      },
      {
        who: 'self',
        formal: {
          jp: 'このボタンを押(お)すだけです',
          ro: 'Kono botan o osu dake desu',
          en: 'Just press this button',
        },
        friendly: {
          jp: 'このボタンを押(お)すだけです',
          ro: 'Kono botan o osu dake desu',
          en: 'Just press this button',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'では、撮(と)りますよ。一(いち)、二(に)、三(さん)',
          ro: 'Dewa, torimasu yo. Ichi, ni, san',
          en: "Right, here we go. One, two, three",
        },
        friendly: {
          jp: '撮(と)りますよ。一(いち)、二(に)、三(さん)',
          ro: 'Torimasu yo. Ichi, ni, san',
          en: 'Here we go. One, two, three',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございます',
          ro: 'Arigatō gozaimasu',
          en: 'Thank you very much',
        },
        friendly: { jp: 'ありがとうございます', ro: 'Arigatō gozaimasu', en: 'Thank you' },
      },
    ],
  },
  {
    id: 'tr9',
    title: '道(みち)に迷(まよ)った時(とき)',
    titleEn: 'When you are lost',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、道(みち)に迷(まよ)ってしまいました',
          ro: 'Sumimasen, michi ni mayotte shimaimashita',
          en: "Excuse me, I've got lost",
        },
        friendly: {
          jp: 'すみません、道(みち)に迷(まよ)いました',
          ro: 'Sumimasen, michi ni mayoimashita',
          en: "Excuse me, I'm lost",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'どちらへ行(い)かれますか',
          ro: 'Dochira e ikaremasu ka',
          en: 'Where are you heading?',
        },
        friendly: {
          jp: 'どこに行(い)きたいんですか',
          ro: 'Doko ni ikitain desu ka',
          en: 'Where are you trying to go?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'この住所(じゅうしょ)に行(い)きたいのですが',
          ro: 'Kono jūsho ni ikitai no desu ga',
          en: "I'm trying to reach this address",
        },
        friendly: {
          jp: 'この住所(じゅうしょ)に行(い)きたいんですけど',
          ro: 'Kono jūsho ni ikitain desu kedo',
          en: "I'm trying to get to this address",
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'それでしたら、この先(さき)の交番(こうばん)の角(かど)を左(ひだり)です',
          ro: 'Sore deshitara, kono saki no kōban no kado o hidari desu',
          en: "In that case, it's left at the corner by the police box ahead",
        },
        friendly: {
          jp: 'それなら、この先(さき)の交番(こうばん)の角(かど)を左(ひだり)',
          ro: 'Sore nara, kono saki no kōban no kado o hidari',
          en: 'Then go left at the corner by the police box',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'すみません、地図(ちず)に書(か)いていただけますか',
          ro: 'Sumimasen, chizu ni kaite itadakemasu ka',
          en: 'Sorry, could you mark it on the map?',
        },
        friendly: {
          jp: '地図(ちず)に書(か)いてもらえますか',
          ro: 'Chizu ni kaite moraemasu ka',
          en: 'Can you mark it on the map?',
        },
      },
      {
        who: 'self',
        formal: {
          jp: 'ありがとうございます、助(たす)かりました',
          ro: 'Arigatō gozaimasu, tasukarimashita',
          en: 'Thank you, you saved me',
        },
        friendly: {
          jp: 'ありがとうございます',
          ro: 'Arigatō gozaimasu',
          en: 'Thank you',
        },
      },
    ],
  },
  {
    id: 'tr10',
    title: '具合(ぐあい)が悪(わる)い時(とき)',
    titleEn: 'At the pharmacy',
    lines: [
      {
        who: 'self',
        formal: {
          jp: 'すみません、頭(あたま)が痛(いた)いのですが',
          ro: 'Sumimasen, atama ga itai no desu ga',
          en: 'Excuse me, I have a headache',
        },
        friendly: {
          jp: 'すみません、頭(あたま)が痛(いた)いんです',
          ro: 'Sumimasen, atama ga itain desu',
          en: 'Excuse me, my head hurts',
        },
      },
      {
        who: 'other',
        formal: { jp: 'いつからでしょうか', ro: 'Itsu kara deshō ka', en: 'Since when?' },
        friendly: { jp: 'いつからですか', ro: 'Itsu kara desu ka', en: 'Since when?' },
      },
      {
        who: 'self',
        formal: {
          jp: '昨日(きのう)の夜(よる)からです',
          ro: 'Kinō no yoru kara desu',
          en: 'Since last night',
        },
        friendly: {
          jp: '昨日(きのう)の夜(よる)からです',
          ro: 'Kinō no yoru kara desu',
          en: 'Since last night',
        },
      },
      {
        who: 'other',
        formal: {
          jp: 'こちらの薬(くすり)をお試(ため)しください',
          ro: 'Kochira no kusuri o o-tameshi kudasai',
          en: 'Please try this medicine',
        },
        friendly: {
          jp: 'この薬(くすり)を試(ため)してみてください',
          ro: 'Kono kusuri o tameshite mite kudasai',
          en: 'Try this medicine',
        },
      },
      {
        who: 'self',
        formal: {
          jp: '一日(いちにち)に何回(なんかい)飲(の)めばよろしいですか',
          ro: 'Ichinichi ni nankai nomeba yoroshii desu ka',
          en: 'How many times a day should I take it?',
        },
        friendly: {
          jp: '一日(いちにち)に何回(なんかい)飲(の)みますか',
          ro: 'Ichinichi ni nankai nomimasu ka',
          en: 'How many times a day do I take it?',
        },
      },
      {
        who: 'other',
        formal: {
          jp: '食後(しょくご)に一日(いちにち)三回(さんかい)です',
          ro: 'Shokugo ni ichinichi sankai desu',
          en: 'Three times a day, after meals',
        },
        friendly: {
          jp: '食後(しょくご)に一日(いちにち)三回(さんかい)です',
          ro: 'Shokugo ni ichinichi sankai desu',
          en: 'Three times a day, after meals',
        },
      },
    ],
  },
];

export const DECKS: Deck[] = [
  { id: 'core', label: 'Core Phrases', cards: CORE_PHRASES },
  { id: 'streets', label: 'On the Street', cards: STREETS },
  { id: 'survival', label: 'Survival Phrases', cards: SURVIVAL },
];
