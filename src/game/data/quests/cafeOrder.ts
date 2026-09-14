import type { QuestDefinition } from "../../types";

/**
 * Chapter 1 · Café
 * カフェで注文 — Order at the Café
 */
export const CAFE_ORDER_QUEST: QuestDefinition = {
  id: "cafe-order",
  title: "Order at the Café",
  japaneseTitle: "カフェで注文",
  locationId: "cafe",
  chapter: 1,
  description:
    "Haruka recommended Café Kotonoha. Order politely, choose dine-in or takeout, and chat briefly with the owner Ken.",
  difficulty: "normal",
  recommendedLevel: 3,
  startingConfidence: 5,
  requiresQuestIds: ["station-master"],
  icon: "☕",
  meetNpcIds: ["ken"],
  objectives: [
    { id: "ready-order", label: "Say you’re ready to order" },
    { id: "dine-in", label: "Choose dine-in or takeout" },
    { id: "read-menu", label: "Read the menu" },
    { id: "order-drink", label: "Order a matcha latte" },
    { id: "modify", label: "Ask for no sugar" },
    { id: "recommend", label: "Ask for a recommendation" },
    { id: "budget", label: "Check if ¥1000 is enough" },
    { id: "small-talk", label: "Handle Ken’s small talk" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "はるかが勧めてくれたカフェ琴の葉に入りました。",
      promptEn:
        "You step into Café Kotonoha — the place Haruka recommended near the station.\n\nOrder something, keep it polite, and don’t empty your Confidence.",
      costsConfidence: false,
    },
    {
      id: "order-ready",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "ご注文はお決まりですか。",
      promptReading: "ごちゅうもん は おきまり です か。",
      promptEn: "Have you decided on your order?",
      skillHint: "conversation",
      vocabHint: "ご注文",
      helpHint: "お決まりですか = Have you decided? Reply when you’re ready — or ask for more time.",
      choices: [
        {
          id: "a",
          labelJa: "はい、お願いします。",
          labelEn: "Yes, please (I’m ready).",
          correct: true,
          feedbackCorrect:
            "✅ Clear and polite.\n\n「お決まりですか」expects a ready-to-order signal.",
        },
        {
          id: "b",
          labelJa: "すみません、中央駅に行きたいんですが。",
          labelEn: "Excuse me — I’d like to go to Central Station.",
          correct: false,
          feedbackWrong:
            "❌ Station language. Here you’re ordering at a café.",
        },
        {
          id: "c",
          labelJa: "改札はどこですか。",
          labelEn: "Where is the ticket gate?",
          correct: false,
          feedbackWrong: "❌ Wrong place. Answer whether your order is decided.",
        },
        {
          id: "d",
          labelJa: "運転見合わせです。",
          labelEn: "Service is suspended.",
          correct: false,
          feedbackWrong: "❌ Announcement phrasing — not a café reply.",
        },
      ],
    },
    {
      id: "dine-or-takeout",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "店内でお召し上がりですか、お持ち帰りですか。",
      promptReading:
        "てんない で おめしあがり です か、おもちかえり です か。",
      promptEn: "For here, or to go?",
      skillHint: "listening",
      vocabHint: "お持ち帰り",
      helpHint:
        "店内でお召し上がり = dine in. お持ち帰り = takeout.",
      choices: [
        {
          id: "a",
          labelJa: "店内でお願いします。",
          labelEn: "For here, please.",
          correct: true,
          feedbackCorrect:
            "✅ Natural dine-in reply.\n\n「店内で」pairs with 「お召し上がりですか」.",
        },
        {
          id: "b",
          labelJa: "各駅停車でお願いします。",
          labelEn: "Local train, please.",
          correct: false,
          feedbackWrong: "❌ Train type — not dine-in vs takeout.",
        },
        {
          id: "c",
          labelJa: "ホームでお願いします。",
          labelEn: "On the platform, please.",
          correct: false,
          feedbackWrong:
            "❌ ホーム is a train platform. Choose 店内 or お持ち帰り.",
        },
        {
          id: "d",
          labelJa: "乗り換えでお願いします。",
          labelEn: "Transfer, please.",
          correct: false,
          feedbackWrong: "❌ Station vocab. Here: 店内 / お持ち帰り.",
        },
      ],
    },
    {
      id: "menu-board",
      kind: "menu",
      objectiveType: "menu",
      npcId: "ken",
      promptJa: "メニューをご覧ください。抹茶ラテはいくらですか。",
      promptEn: "Look at the menu. How much is the matcha latte?",
      menuItems: [
        { nameJa: "ブレンドコーヒー", priceYen: 420 },
        { nameJa: "カフェラテ", priceYen: 480 },
        { nameJa: "抹茶ラテ", priceYen: 520 },
        { nameJa: "チーズケーキ", priceYen: 550 },
        { nameJa: "トーストセット", priceYen: 680 },
      ],
      skillHint: "reading",
      choices: [
        {
          id: "a",
          labelJa: "520円",
          correct: true,
          feedbackCorrect: "✅ 抹茶ラテ is ¥520 on the board.",
        },
        {
          id: "b",
          labelJa: "420円",
          correct: false,
          feedbackWrong: "❌ That’s ブレンドコーヒー. 抹茶ラテ is ¥520.",
        },
        {
          id: "c",
          labelJa: "480円",
          correct: false,
          feedbackWrong: "❌ That’s カフェラテ. 抹茶ラテ is ¥520.",
        },
        {
          id: "d",
          labelJa: "680円",
          correct: false,
          feedbackWrong: "❌ That’s トーストセット. 抹茶ラテ is ¥520.",
        },
      ],
    },
    {
      id: "order-matcha",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "何になさいますか。",
      promptReading: "なに に なさいます か。",
      promptEn: "What will you have?",
      skillHint: "conversation",
      helpHint: "〜を一つ is a common counter pattern when ordering one item.",
      choices: [
        {
          id: "a",
          labelJa: "抹茶ラテを一つお願いします。",
          labelEn: "One matcha latte, please.",
          correct: true,
          feedbackCorrect:
            "✅ Clear order.\n\n「〜を一つ」+「お願いします」is café-ready Japanese.",
        },
        {
          id: "b",
          labelJa: "抹茶ラテに行きたいんですが、何番線ですか。",
          labelEn: "I’d like to go to the matcha latte — which track?",
          correct: false,
          feedbackWrong: "❌ Station ask pattern. Just order the drink.",
        },
        {
          id: "c",
          labelJa: "遅延証明書をください。",
          labelEn: "Please give me a delay certificate.",
          correct: false,
          feedbackWrong: "❌ Station document — wrong counter.",
        },
        {
          id: "d",
          labelJa: "転入届を出したいんですが。",
          labelEn: "I’d like to submit a moving-in notification.",
          correct: false,
          feedbackWrong: "❌ City Hall line. Order a drink here.",
        },
      ],
    },
    {
      id: "no-sugar",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "砂糖やシロップはいかがですか。",
      promptReading: "さとう や シロップ は いかが です か。",
      promptEn: "Would you like sugar or syrup?",
      skillHint: "conversation",
      vocabHint: "砂糖なし",
      helpHint: "〜なしで = without …",
      choices: [
        {
          id: "a",
          labelJa: "砂糖なしでお願いします。",
          labelEn: "No sugar, please.",
          correct: true,
          feedbackCorrect:
            "✅ Natural modification.\n\n「なしで」= without (that option).",
        },
        {
          id: "b",
          labelJa: "砂糖快速でお願いします。",
          labelEn: "Sugar rapid, please.",
          correct: false,
          feedbackWrong: "❌ 快速 is a train type. Use 「砂糖なしで」.",
        },
        {
          id: "c",
          labelJa: "お持ち帰りなしでお願いします。",
          labelEn: "No takeout, please.",
          correct: false,
          feedbackWrong:
            "❌ They’re asking about sugar/syrup, not dine-in vs takeout.",
        },
        {
          id: "d",
          labelJa: "改札なしでお願いします。",
          labelEn: "No ticket gate, please.",
          correct: false,
          feedbackWrong: "❌ Station vocab. Reply about 砂糖.",
        },
      ],
    },
    {
      id: "recommendation",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "ほかにご注文はありますか。",
      promptReading: "ほか に ごちゅうもん は あります か。",
      promptEn: "Anything else? Ask what he recommends.",
      skillHint: "conversation",
      helpHint: "おすすめは何ですか？ is a safe, polite ask.",
      choices: [
        {
          id: "a",
          labelJa: "おすすめは何ですか。",
          labelEn: "What do you recommend?",
          correct: true,
          feedbackCorrect:
            "✅ Everyday café Japanese.\n\nStaff often answer with today’s popular item.",
        },
        {
          id: "b",
          labelJa: "何番線がおすすめですか。",
          labelEn: "Which track do you recommend?",
          correct: false,
          feedbackWrong: "❌ Platform talk. Ask about food/drinks: 「おすすめは何ですか。」",
        },
        {
          id: "c",
          labelJa: "人身事故はありますか。",
          labelEn: "Is there an accident involving a person?",
          correct: false,
          feedbackWrong: "❌ Station announcement topic — inappropriate here.",
        },
        {
          id: "d",
          labelJa: "本人確認書類はありますか。",
          labelEn: "Do you have ID documents?",
          correct: false,
          feedbackWrong: "❌ City Hall vocabulary.",
        },
      ],
    },
    {
      id: "ken-recommend",
      kind: "dialogue",
      objectiveType: "listening",
      npcId: "ken",
      promptJa: "今日はチーズケーキが人気ですよ。ラテとセットでお得です。",
      promptReading:
        "きょう は チーズケーキ が にんき です よ。ラテ と セット で おとく です。",
      promptEn: "What is Ken recommending?",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "今日はチーズケーキが人気で、ラテと一緒だとお得だと言っている。",
          labelEn: "Cheesecake is popular today and pairs well with a latte.",
          correct: true,
          feedbackCorrect:
            "✅ 「人気」= popular. 「セットでお得」= a good deal as a set.",
        },
        {
          id: "b",
          labelJa: "トーストセットだけが売り切れたと言っている。",
          labelEn: "He’s saying only the toast set is sold out.",
          correct: false,
          feedbackWrong: "❌ He highlighted cheesecake, not a sell-out.",
        },
        {
          id: "c",
          labelJa: "ブレンドコーヒーが値上がりしたと言っている。",
          labelEn: "He’s saying blend coffee got more expensive.",
          correct: false,
          feedbackWrong: "❌ No price-increase talk — he’s pushing today’s popular cake.",
        },
        {
          id: "d",
          labelJa: "抹茶ラテは注文できないと言っている。",
          labelEn: "He’s saying you can’t order matcha latte.",
          correct: false,
          feedbackWrong: "❌ You already ordered one; he’s suggesting cake as an add-on.",
        },
      ],
    },
    {
      id: "affordability",
      kind: "dialogue",
      objectiveType: "multiple-choice",
      npcId: "ken",
      promptJa: "抹茶ラテ520円ですね。お会計は千円札で大丈夫ですか。",
      promptReading:
        "まっちゃラテ ごひゃくにじゅうえん です ね。おかいけい は せんえんさつ で だいじょうぶ です か。",
      promptEn:
        "You have a ¥1000 bill. Is that enough for a ¥520 matcha latte? (Comprehension — not hard math.)",
      skillHint: "listening",
      helpHint: "千円札 = a 1000-yen bill. Compare to the drink price.",
      choices: [
        {
          id: "a",
          labelJa: "はい、千円で足ります。お釣りがもらえます。",
          labelEn: "Yes — ¥1000 is enough; you’ll get change.",
          correct: true,
          feedbackCorrect:
            "✅ 520 < 1000, so the bill covers it and you receive お釣り.",
        },
        {
          id: "b",
          labelJa: "いいえ、千円では足りないので払えない。",
          labelEn: "No — ¥1000 isn’t enough, so you can’t pay.",
          correct: false,
          feedbackWrong:
            "❌ The latte is ¥520. A ¥1000 bill is more than enough.",
        },
        {
          id: "c",
          labelJa: "トーストセットと同じ金額になる。",
          labelEn: "It costs the same as the toast set.",
          correct: false,
          feedbackWrong:
            "❌ Toast set is ¥680; your drink is ¥520.",
        },
        {
          id: "d",
          labelJa: "遅延証明書が必要になる。",
          labelEn: "You’ll need a delay certificate.",
          correct: false,
          feedbackWrong: "❌ Payment question, not trains.",
        },
      ],
    },
    {
      id: "small-talk",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "この辺にはもう慣れました？",
      promptReading: "この へん に は もう なれました？",
      promptEn: "Have you gotten used to this area yet?",
      skillHint: "conversation",
      helpHint: "慣れる = to get used to. Soft yes/no + a short reason works.",
      choices: [
        {
          id: "a",
          labelJa: "ええ、少しずつです。駅もだいぶ分かってきました。",
          labelEn: "Yeah, little by little. I’m starting to understand the station too.",
          correct: true,
          feedbackCorrect:
            "✅ Friendly and natural.\n\nTies your station quest into light café chat.",
        },
        {
          id: "b",
          labelJa: "はい、転入届を出したいんですが。",
          labelEn: "Yes — I’d like to submit a moving-in notification.",
          correct: false,
          feedbackWrong: "❌ City Hall purpose statement — wrong tone for small talk.",
        },
        {
          id: "c",
          labelJa: "人身事故の影響で運転見合わせです。",
          labelEn: "Service is suspended due to an accident.",
          correct: false,
          feedbackWrong: "❌ Announcement reply — not a personal answer.",
        },
        {
          id: "d",
          labelJa: "お持ち帰りですか。",
          labelEn: "Is it takeout?",
          correct: false,
          feedbackWrong: "❌ That’s Ken’s earlier question, not your reply.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      npcId: "ken",
      promptJa: "抹茶ラテ、お待ちくださいね。また来てください。",
      promptEn:
        "Ken starts your matcha latte. First café clear — Kotoba Town feels a little more like home.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 160,
    replayXp: 15,
    skillRewards: {
      conversation: 3,
      listening: 2,
      politeness: 2,
    },
    replaySkillRewards: { conversation: 1 },
    unlockQuestIds: ["first-week-challenge"],
    nextQuestTeaser: {
      id: "first-week-challenge",
      title: "First Week Challenge",
      japaneseTitle: "最初の一週間",
    },
  },
  unlocks: {
    questIds: ["first-week-challenge"],
  },
};
