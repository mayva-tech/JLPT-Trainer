/**
 * Common casual ⇄ formal (敬語) expression pairs.
 *
 * Register is the N2 blind spot that raw vocabulary study misses: the words are
 * known, but the polite form is not automatic. Pairs are grouped by situation
 * so a whole section can be drilled in one sitting.
 */

import type { RegisterPair, RegisterSection } from "../types/register";

export const registerPairs: RegisterPair[] = [
  // ── 1. 質問・依頼 — Asking ────────────────────────────────
  {
    id: 1,
    category: "質問・依頼",
    meaning: "Who are you?",
    casual: { text: "誰？", reading: "だれ？", romaji: "Dare?" },
    formal: {
      text: "どちら様ですか？",
      reading: "どちらさまですか？",
      romaji: "Dochira sama desu ka?",
    },
    note: "誰 to a stranger at the door sounds openly suspicious. どちら様 is the safe default at work or on the phone.",
  },
  {
    id: 2,
    category: "質問・依頼",
    meaning: "What is this?",
    casual: { text: "これ、何？", reading: "これ、なに？", romaji: "Kore, nani?" },
    formal: {
      text: "こちらは何でしょうか？",
      reading: "こちらはなんでしょうか？",
      romaji: "Kochira wa nan deshou ka?",
    },
    note: "でしょうか softens a direct question — it invites rather than demands.",
  },
  {
    id: 3,
    category: "質問・依頼",
    meaning: "Where are you going?",
    casual: { text: "どこ行くの？", reading: "どこいくの？", romaji: "Doko iku no?" },
    formal: {
      text: "どちらへいらっしゃいますか？",
      reading: "どちらへいらっしゃいますか？",
      romaji: "Dochira e irasshaimasu ka?",
    },
    note: "いらっしゃる is the honorific for 行く・来る・いる all at once.",
  },
  {
    id: 4,
    category: "質問・依頼",
    meaning: "Can I ask you something?",
    casual: {
      text: "ちょっと聞いていい？",
      reading: "ちょっときいていい？",
      romaji: "Chotto kiite ii?",
    },
    formal: {
      text: "少々お伺いしてもよろしいでしょうか？",
      reading: "しょうしょうおうかがいしてもよろしいでしょうか？",
      romaji: "Shoushou oukagai shite mo yoroshii deshou ka?",
    },
    note: "伺う is humble 聞く — you lower yourself, which raises the listener.",
  },
  {
    id: 5,
    category: "質問・依頼",
    meaning: "Please wait a moment.",
    casual: {
      text: "ちょっと待って。",
      reading: "ちょっとまって。",
      romaji: "Chotto matte.",
    },
    formal: {
      text: "少々お待ちください。",
      reading: "しょうしょうおまちください。",
      romaji: "Shoushou omachi kudasai.",
    },
    note: "お+stem+ください is the everyday polite-request pattern worth over-learning.",
  },
  {
    id: 6,
    category: "質問・依頼",
    meaning: "Could you do this for me?",
    casual: {
      text: "これ、やってくれる？",
      reading: "これ、やってくれる？",
      romaji: "Kore, yatte kureru?",
    },
    formal: {
      text: "こちらをお願いできますでしょうか。",
      reading: "こちらをおねがいできますでしょうか。",
      romaji: "Kochira o onegai dekimasu deshou ka.",
    },
  },

  // ── 2. あいさつ・返事 — Greetings & replies ──────────────
  {
    id: 7,
    category: "あいさつ・返事",
    meaning: "Sorry.",
    casual: { text: "ごめん。", reading: "ごめん。", romaji: "Gomen." },
    formal: {
      text: "申し訳ございません。",
      reading: "もうしわけございません。",
      romaji: "Moushiwake gozaimasen.",
    },
    note: "すみません sits between the two and covers most daily situations.",
  },
  {
    id: 8,
    category: "あいさつ・返事",
    meaning: "Thank you.",
    casual: { text: "ありがとう。", reading: "ありがとう。", romaji: "Arigatou." },
    formal: {
      text: "ありがとうございます。",
      reading: "ありがとうございます。",
      romaji: "Arigatou gozaimasu.",
    },
    note: "For something already finished, ございました is the natural past form.",
  },
  {
    id: 9,
    category: "あいさつ・返事",
    meaning: "Got it. / Understood.",
    casual: { text: "分かった。", reading: "わかった。", romaji: "Wakatta." },
    formal: {
      text: "承知いたしました。",
      reading: "しょうちいたしました。",
      romaji: "Shouchi itashimashita.",
    },
    note: "了解しました is common but reads as casual to a superior — 承知 is safer upward.",
  },
  {
    id: 10,
    category: "あいさつ・返事",
    meaning: "Nice to meet you.",
    casual: {
      text: "よろしく。",
      reading: "よろしく。",
      romaji: "Yoroshiku.",
    },
    formal: {
      text: "よろしくお願いいたします。",
      reading: "よろしくおねがいいたします。",
      romaji: "Yoroshiku onegai itashimasu.",
    },
  },
  {
    id: 11,
    category: "あいさつ・返事",
    meaning: "Sorry to bother you.",
    casual: { text: "ごめんね、悪いんだけど。", reading: "ごめんね、わるいんだけど。", romaji: "Gomen ne, warui n da kedo." },
    formal: {
      text: "お忙しいところ恐れ入ります。",
      reading: "おいそがしいところおそれいります。",
      romaji: "Oisogashii tokoro osore irimasu.",
    },
    note: "A standard opener before interrupting someone at work.",
  },
  {
    id: 12,
    category: "あいさつ・返事",
    meaning: "See you later.",
    casual: { text: "またね。", reading: "またね。", romaji: "Mata ne." },
    formal: {
      text: "失礼いたします。",
      reading: "しつれいいたします。",
      romaji: "Shitsurei itashimasu.",
    },
    note: "Also the standard way to end a phone call or leave an office.",
  },

  // ── 3. 会社・ビジネス — Workplace ────────────────────────
  {
    id: 13,
    category: "会社・ビジネス",
    meaning: "I'll go / I'm coming.",
    casual: { text: "行くね。", reading: "いくね。", romaji: "Iku ne." },
    formal: {
      text: "伺います。",
      reading: "うかがいます。",
      romaji: "Ukagaimasu.",
    },
    note: "参ります is the neutral humble form; 伺う adds respect toward the destination's host.",
  },
  {
    id: 14,
    category: "会社・ビジネス",
    meaning: "I saw it. / I've looked at it.",
    casual: { text: "見たよ。", reading: "みたよ。", romaji: "Mita yo." },
    formal: {
      text: "拝見しました。",
      reading: "はいけんしました。",
      romaji: "Haiken shimashita.",
    },
    note: "拝見 is humble 見る — used for documents or work someone sent you.",
  },
  {
    id: 15,
    category: "会社・ビジネス",
    meaning: "Please take a look.",
    casual: { text: "見て。", reading: "みて。", romaji: "Mite." },
    formal: {
      text: "ご覧ください。",
      reading: "ごらんください。",
      romaji: "Goran kudasai.",
    },
    note: "ご覧 is honorific 見る — for the other person's action, never your own.",
  },
  {
    id: 16,
    category: "会社・ビジネス",
    meaning: "What do you think?",
    casual: { text: "どう思う？", reading: "どうおもう？", romaji: "Dou omou?" },
    formal: {
      text: "いかがお考えでしょうか。",
      reading: "いかがおかんがえでしょうか。",
      romaji: "Ikaga okangae deshou ka.",
    },
  },
  {
    id: 17,
    category: "会社・ビジネス",
    meaning: "Is that okay? / Is that alright?",
    casual: { text: "いい？", reading: "いい？", romaji: "Ii?" },
    formal: {
      text: "よろしいでしょうか。",
      reading: "よろしいでしょうか。",
      romaji: "Yoroshii deshou ka.",
    },
    note: "よろしい is the polite いい — appears constantly in service and office Japanese.",
  },
  {
    id: 18,
    category: "会社・ビジネス",
    meaning: "I received it.",
    casual: { text: "もらった。", reading: "もらった。", romaji: "Moratta." },
    formal: {
      text: "頂戴いたしました。",
      reading: "ちょうだいいたしました。",
      romaji: "Choudai itashimashita.",
    },
    note: "いただきました is the everyday humble version and fits most email replies.",
  },
  {
    id: 19,
    category: "会社・ビジネス",
    meaning: "I'll tell them. / I'll pass it on.",
    casual: { text: "言っとくね。", reading: "いっとくね。", romaji: "Ittoku ne." },
    formal: {
      text: "申し伝えます。",
      reading: "もうしつたえます。",
      romaji: "Moushi tsutaemasu.",
    },
    note: "Standard phone Japanese when taking a message for a colleague.",
  },
  {
    id: 20,
    category: "会社・ビジネス",
    meaning: "Sorry, I can't. / That won't work.",
    casual: { text: "無理。", reading: "むり。", romaji: "Muri." },
    formal: {
      text: "致しかねます。",
      reading: "いたしかねます。",
      romaji: "Itashi kanemasu.",
    },
    note: "〜かねる is an N2 grammar point: a soft, formal refusal without saying no outright.",
  },

  // ── 4. 買い物・外食 — Shops & restaurants ────────────────
  {
    id: 21,
    category: "買い物・外食",
    meaning: "Is this okay? / Will this do?",
    casual: {
      text: "これでいい？",
      reading: "これでいい？",
      romaji: "Kore de ii?",
    },
    formal: {
      text: "こちらでよろしいでしょうか。",
      reading: "こちらでよろしいでしょうか。",
      romaji: "Kochira de yoroshii deshou ka.",
    },
    note: "こちら replaces これ throughout service Japanese — worth hearing as a set.",
  },
  {
    id: 22,
    category: "買い物・外食",
    meaning: "Do you have this?",
    casual: { text: "これある？", reading: "これある？", romaji: "Kore aru?" },
    formal: {
      text: "こちらはございますか。",
      reading: "こちらはございますか。",
      romaji: "Kochira wa gozaimasu ka.",
    },
    note: "ございます is polite ある — the single most common word on a shop floor.",
  },
  {
    id: 23,
    category: "買い物・外食",
    meaning: "How much is it?",
    casual: { text: "いくら？", reading: "いくら？", romaji: "Ikura?" },
    formal: {
      text: "おいくらでしょうか。",
      reading: "おいくらでしょうか。",
      romaji: "Oikura deshou ka.",
    },
  },
  {
    id: 24,
    category: "買い物・外食",
    meaning: "I'll take this one.",
    casual: { text: "これにする。", reading: "これにする。", romaji: "Kore ni suru." },
    formal: {
      text: "こちらをお願いします。",
      reading: "こちらをおねがいします。",
      romaji: "Kochira o onegai shimasu.",
    },
  },
  {
    id: 25,
    category: "買い物・外食",
    meaning: "Can I try this on?",
    casual: { text: "着てみていい？", reading: "きてみていい？", romaji: "Kite mite ii?" },
    formal: {
      text: "試着してもよろしいでしょうか。",
      reading: "しちゃくしてもよろしいでしょうか。",
      romaji: "Shichaku shite mo yoroshii deshou ka.",
    },
  },

  // ── 5. 気持ち・意見 — Feelings & opinions ────────────────
  {
    id: 26,
    category: "気持ち・意見",
    meaning: "I think so too.",
    casual: { text: "俺もそう思う。", reading: "おれもそうおもう。", romaji: "Ore mo sou omou." },
    formal: {
      text: "私も同感でございます。",
      reading: "わたくしもどうかんでございます。",
      romaji: "Watakushi mo doukan de gozaimasu.",
    },
    note: "私 read as わたくし is markedly more formal than わたし.",
  },
  {
    id: 27,
    category: "気持ち・意見",
    meaning: "That's a problem. / That's troubling.",
    casual: { text: "困るよ。", reading: "こまるよ。", romaji: "Komaru yo." },
    formal: {
      text: "困惑しております。",
      reading: "こんわくしております。",
      romaji: "Konwaku shite orimasu.",
    },
    note: "おります is humble います — common in formal spoken reports.",
  },
  {
    id: 28,
    category: "気持ち・意見",
    meaning: "I'm happy about it.",
    casual: { text: "嬉しい。", reading: "うれしい。", romaji: "Ureshii." },
    formal: {
      text: "光栄に存じます。",
      reading: "こうえいにぞんじます。",
      romaji: "Kouei ni zonjimasu.",
    },
    note: "存じる is humble 思う・知る; 光栄 specifically means honoured.",
  },
  {
    id: 29,
    category: "気持ち・意見",
    meaning: "I don't know.",
    casual: { text: "知らない。", reading: "しらない。", romaji: "Shiranai." },
    formal: {
      text: "存じ上げません。",
      reading: "ぞんじあげません。",
      romaji: "Zonji agemasen.",
    },
    note: "存じ上げない is used about people; 存じません about things and facts.",
  },
  {
    id: 30,
    category: "気持ち・意見",
    meaning: "That's fine with me. / No objection.",
    casual: { text: "別にいいよ。", reading: "べつにいいよ。", romaji: "Betsu ni ii yo." },
    formal: {
      text: "差し支えございません。",
      reading: "さしつかえございません。",
      romaji: "Sashitsukae gozaimasen.",
    },
  },
];

export const registerSections: RegisterSection[] = [
  {
    id: "register-01",
    title: "1. 質問・依頼",
    subtitle: "Asking & requesting",
    pairIds: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "register-02",
    title: "2. あいさつ・返事",
    subtitle: "Greetings & replies",
    pairIds: [7, 8, 9, 10, 11, 12],
  },
  {
    id: "register-03",
    title: "3. 会社・ビジネス",
    subtitle: "Workplace & keigo",
    pairIds: [13, 14, 15, 16, 17, 18, 19, 20],
  },
  {
    id: "register-04",
    title: "4. 買い物・外食",
    subtitle: "Shops & restaurants",
    pairIds: [21, 22, 23, 24, 25],
  },
  {
    id: "register-05",
    title: "5. 気持ち・意見",
    subtitle: "Feelings & opinions",
    pairIds: [26, 27, 28, 29, 30],
  },
];

export function getRegisterPairById(id: number): RegisterPair | undefined {
  return registerPairs.find((pair) => pair.id === id);
}

export function getRegisterSectionById(
  id: string
): RegisterSection | undefined {
  return registerSections.find((section) => section.id === id);
}

/** Ordered pairs for a section id; empty when the section is unknown. */
export function getRegisterPairsForSection(id: string): RegisterPair[] {
  const section = getRegisterSectionById(id);
  if (!section) return [];
  return section.pairIds
    .map((pairId) => getRegisterPairById(pairId))
    .filter((pair): pair is RegisterPair => !!pair);
}
