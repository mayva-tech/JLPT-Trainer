import type { QuestDefinition } from "../../types";

/**
 * Chapter 1 · Boss (not a monster battle)
 * 最初の一週間 — First Week Challenge
 *
 * “Can you handle one full day in Kotoba Town?”
 * Mixes City Hall, convenience store, Haruka, station, and café skills.
 */
export const FIRST_WEEK_CHALLENGE_QUEST: QuestDefinition = {
  id: "first-week-challenge",
  title: "First Week Challenge",
  japaneseTitle: "最初の一週間",
  locationId: "home",
  chapter: 1,
  description:
    "Can you handle one full day in Kotoba Town? Prove you can use everything from Chapter 1 — City Hall, the store, casual talk, the station, and the café — without losing all your Confidence.",
  difficulty: "boss",
  recommendedLevel: 3,
  startingConfidence: 5,
  requiresQuestIds: ["cafe-order"],
  icon: "⭐",
  objectives: [
    { id: "morning-hall", label: "Handle a City Hall follow-up" },
    { id: "id-vocab", label: "Confirm ID documents" },
    { id: "form-read", label: "Read a form field" },
    { id: "konbini", label: "Shop without freezing" },
    { id: "neighbor", label: "Keep up with Haruka" },
    { id: "station-nav", label: "Navigate the station" },
    { id: "delay", label: "Understand a delay notice" },
    { id: "cafe", label: "Order at the café" },
    { id: "n2-finish", label: "Survive the harder afternoon" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "ことば町での最初の一週間。今日は一日中、日本語で乗り切れるか？",
      promptEn:
        "Your first week in Kotoba Town.\n\nBoss challenge: Can you handle one full day — City Hall, the convenience store, a chat with Haruka, the station, and the café — without running out of Confidence?",
      costsConfidence: false,
    },

    // ── Morning · City Hall ──────────────────────────────────────────
    {
      id: "hall-purpose",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "tanaka-city-hall",
      promptJa: "本日はどのようなご用件でしょうか。",
      promptReading: "ほんじつ は どの ような ごようけん でしょう か。",
      promptEn: "You’re back at City Hall for a resident-card copy. What do you say?",
      skillHint: "conversation",
      helpHint: "State your purpose softly with 「〜たいんですが」.",
      choices: [
        {
          id: "a",
          labelJa: "住民票の写しをいただきたいんですが。",
          labelEn: "I’d like a copy of my residence record.",
          correct: true,
          feedbackCorrect:
            "✅ Clear purpose.\n\n「〜たいんですが」softens a counter request.",
        },
        {
          id: "b",
          labelJa: "転入届を出したいんですが。",
          labelEn: "I’d like to submit a moving-in notification.",
          correct: false,
          feedbackWrong:
            "❌ You already registered. Today you need a 住民票の写し.",
        },
        {
          id: "c",
          labelJa: "袋はご利用ですか？",
          labelEn: "Would you like a bag?",
          correct: false,
          feedbackWrong: "❌ That’s a clerk’s line, not yours.",
        },
        {
          id: "d",
          labelJa: "おすすめは何ですか？",
          labelEn: "What do you recommend?",
          correct: false,
          feedbackWrong: "❌ Café language — wrong place.",
        },
      ],
    },
    {
      id: "hall-id",
      kind: "dialogue",
      objectiveType: "vocabulary",
      npcId: "tanaka-city-hall",
      promptJa: "本人確認書類をお持ちですか。",
      promptReading: "ほんにん かくにん しょるい を おもち です か。",
      promptEn: "Do you have identification documents?",
      skillHint: "vocabulary",
      vocabHint: "本人確認書類",
      helpHint: "本人確認書類 = papers that prove who you are.",
      choices: [
        {
          id: "a",
          labelJa: "はい、在留カードを持っています。",
          labelEn: "Yes, I have my residence card.",
          correct: true,
          feedbackCorrect:
            "✅ 「本人確認書類」includes a residence card, passport, etc.",
        },
        {
          id: "b",
          labelJa: "はい、ポイントカードを持っています。",
          labelEn: "Yes, I have a point card.",
          correct: false,
          feedbackWrong:
            "❌ A point card is not ID. Offer a passport or residence card.",
        },
        {
          id: "c",
          labelJa: "レシートで大丈夫ですか。",
          labelEn: "Is a receipt okay?",
          correct: false,
          feedbackWrong: "❌ Receipts don’t prove identity.",
        },
        {
          id: "d",
          labelJa: "乗車券を見せます。",
          labelEn: "I’ll show my train ticket.",
          correct: false,
          feedbackWrong: "❌ A ticket isn’t 本人確認書類.",
        },
      ],
    },
    {
      id: "hall-form",
      kind: "form-label",
      objectiveType: "form-label",
      npcId: "tanaka-city-hall",
      promptJa: "交付申請書にご記入ください。",
      promptReading: "こうふ しんせいしょ に ごきにゅう ください。",
      promptEn: "Please fill in the issuance application.",
      formAskEn: "Which field means “current address”?",
      formCorrectFieldId: "address",
      skillHint: "reading",
      formFields: [
        { id: "name", labelJa: "氏名", meaningEn: "Full name" },
        { id: "address", labelJa: "現住所", meaningEn: "Current address" },
        { id: "purpose", labelJa: "使用目的", meaningEn: "Purpose of use" },
        { id: "copies", labelJa: "交付部数", meaningEn: "Number of copies" },
      ],
      choices: [
        {
          id: "name",
          labelJa: "氏名",
          correct: false,
          feedbackWrong: "❌ 氏名 = full name. Current address is 「現住所」.",
        },
        {
          id: "address",
          labelJa: "現住所",
          correct: true,
          feedbackCorrect: "✅ 「現住所」= current address.",
        },
        {
          id: "purpose",
          labelJa: "使用目的",
          correct: false,
          feedbackWrong: "❌ 使用目的 = why you need the document.",
        },
        {
          id: "copies",
          labelJa: "交付部数",
          correct: false,
          feedbackWrong: "❌ 交付部数 = how many copies to issue.",
        },
      ],
    },

    // ── Mid-morning · Convenience store ──────────────────────────────
    {
      id: "konbini-heat",
      kind: "listening",
      objectiveType: "listening",
      npcId: "sato-clerk",
      promptJa: "温めますか？",
      promptReading: "あたためます か？",
      promptEn: "You bought a bento. What is the clerk asking?",
      listenText: "温めますか？",
      skillHint: "listening",
      vocabHint: "温める",
      choices: [
        {
          id: "a",
          labelJa: "お弁当を温めるかどうか聞いている。",
          correct: true,
          feedbackCorrect: "✅ 「温めますか？」= Shall I heat this up?",
        },
        {
          id: "b",
          labelJa: "袋が必要かどうか聞いている。",
          correct: false,
          feedbackWrong: "❌ That would be 「袋はご利用ですか？」",
        },
        {
          id: "c",
          labelJa: "ポイントを付けるか聞いている。",
          correct: false,
          feedbackWrong: "❌ That would mention ポイントカード.",
        },
        {
          id: "d",
          labelJa: "レシートが要るか聞いている。",
          correct: false,
          feedbackWrong: "❌ Receipt offers use 「レシート」.",
        },
      ],
    },
    {
      id: "konbini-payment",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "sato-clerk",
      promptJa: "お支払い方法は？",
      promptReading: "おしはらい ほうほう は？",
      promptEn: "How will you pay? You want to use a card.",
      skillHint: "conversation",
      vocabHint: "支払い",
      choices: [
        {
          id: "a",
          labelJa: "カードでお願いします。",
          correct: true,
          feedbackCorrect: "✅ Clear payment choice.",
        },
        {
          id: "b",
          labelJa: "現金で結構です。",
          correct: false,
          feedbackWrong:
            "❌ 「結構です」here sounds like declining — and you wanted card.",
        },
        {
          id: "c",
          labelJa: "各駅停車でお願いします。",
          correct: false,
          feedbackWrong: "❌ Train type, not payment.",
        },
        {
          id: "d",
          labelJa: "住民票でお願いします。",
          correct: false,
          feedbackWrong: "❌ City Hall document — wrong counter.",
        },
      ],
    },

    // ── Lunch break · Haruka ─────────────────────────────────────────
    {
      id: "haruka-plan",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      promptJa: "ねえ、今日これから何か予定ある？",
      promptReading: "ねえ、きょう これから なにか よてい ある？",
      promptEn: "Haruka catches you outside. She’s casual — keep up.",
      skillHint: "conversation",
      helpHint: "Match her casual tone; don’t jump to formal counter Japanese.",
      choices: [
        {
          id: "a",
          labelJa: "うん、午後ちょっと駅まで行く予定。",
          correct: true,
          feedbackCorrect:
            "✅ Casual and clear. 「予定」fits her question naturally.",
        },
        {
          id: "b",
          labelJa: "恐れ入りますが、ご用件をお伺いできますでしょうか。",
          correct: false,
          feedbackWrong: "❌ Way too formal for a neighbor chat.",
        },
        {
          id: "c",
          labelJa: "転入届を提出いたします。",
          correct: false,
          feedbackWrong: "❌ City Hall register language.",
        },
        {
          id: "d",
          labelJa: "温めますか？",
          correct: false,
          feedbackWrong: "❌ Clerk line — wrong speaker role.",
        },
      ],
    },
    {
      id: "haruka-listen",
      kind: "listening",
      objectiveType: "listening",
      npcId: "haruka",
      promptJa: "じゃあ一緒に行こうか？カフェ寄ってもいいし。",
      promptReading: "じゃあ いっしょ に いこう か？カフェ よっても いい し。",
      promptEn: "What is Haruka suggesting?",
      listenText: "じゃあ一緒に行こうか？カフェ寄ってもいいし。",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "一緒に行って、途中でカフェに寄ってもいいと言っている。",
          correct: true,
          feedbackCorrect: "✅ 「寄る」= stop by on the way.",
        },
        {
          id: "b",
          labelJa: "電車が止まったので家にいろと言っている。",
          correct: false,
          feedbackWrong: "❌ No delay is mentioned.",
        },
        {
          id: "c",
          labelJa: "市役所で書類を出せと言っている。",
          correct: false,
          feedbackWrong: "❌ Not City Hall.",
        },
        {
          id: "d",
          labelJa: "弁当を温めてほしいと言っている。",
          correct: false,
          feedbackWrong: "❌ Wrong scene.",
        },
      ],
    },

    // ── Afternoon · Station ──────────────────────────────────────────
    {
      id: "station-kaisatsu",
      kind: "dialogue",
      objectiveType: "vocabulary",
      npcId: "yamamoto-station",
      promptJa: "改札はどちらですか。",
      promptReading: "かいさつ は どちら です か。",
      promptEn: "You’re asking staff where the ticket gates are. Which reply helps?",
      skillHint: "vocabulary",
      vocabHint: "改札",
      helpHint: "改札 = ticket gate / fare gate area.",
      choices: [
        {
          id: "a",
          labelJa: "右手の黄色い線の先が改札です。",
          labelEn: "The gates are past the yellow line on your right.",
          correct: true,
          feedbackCorrect: "✅ 「改札」= ticket gates.",
        },
        {
          id: "b",
          labelJa: "改札はお弁当売り場です。",
          correct: false,
          feedbackWrong: "❌ Gates aren’t the bento shop.",
        },
        {
          id: "c",
          labelJa: "改札はご記入ください。",
          correct: false,
          feedbackWrong: "❌ Form language — wrong noun.",
        },
        {
          id: "d",
          labelJa: "改札は温めますか？",
          correct: false,
          feedbackWrong: "❌ Nonsense mix of store and station talk.",
        },
      ],
    },
    {
      id: "station-map",
      kind: "map",
      objectiveType: "map",
      npcId: "yamamoto-station",
      promptJa: "中央線に乗り換えてください。",
      promptReading: "ちゅうおうせん に のりかえて ください。",
      promptEn: "You need the Chūō Line. Which route matches the map?",
      mapText:
        "入口 → 改札 → [1番線 山手線] [2番線 中央線] [3番線 京浜東北]\n" +
        "              ↑ 乗り換えは改札内の通路",
      skillHint: "reading",
      vocabHint: "乗り換え",
      helpHint: "乗り換え = transfer / change trains.",
      choices: [
        {
          id: "a",
          labelJa: "改札を通って2番線へ行く。",
          correct: true,
          feedbackCorrect:
            "✅ 中央線 is platform 2. 「乗り換え」happens inside after the gates.",
        },
        {
          id: "b",
          labelJa: "改札を通らずに3番線へ行く。",
          correct: false,
          feedbackWrong: "❌ You need the gates first, and 3 is the wrong line.",
        },
        {
          id: "c",
          labelJa: "1番線に乗れば中央線になる。",
          correct: false,
          feedbackWrong: "❌ 1番線 is Yamanote, not Chūō.",
        },
        {
          id: "d",
          labelJa: "改札の前で待っていれば自動で乗る。",
          correct: false,
          feedbackWrong: "❌ You still choose the correct platform.",
        },
      ],
    },
    {
      id: "station-delay",
      kind: "listening",
      objectiveType: "listening",
      promptJa: "駅の放送を聞いてください。",
      promptEn: "What does this announcement mean?",
      listenText: "ただいま人身事故の影響で、運転を見合わせております。",
      listenReading:
        "ただいま じんしん じこ の えいきょう で、うんてん を みあわせて おります。",
      skillHint: "listening",
      vocabHint: "運転見合わせ",
      speech: {
        karaokeMode: "after-answer",
        announcement: true,
        autoPlay: true,
      },
      helpHint: "運転見合わせ = trains temporarily suspended / not running.",
      choices: [
        {
          id: "a",
          labelJa: "事故の影響で、しばらく電車が動いていない。",
          correct: true,
          feedbackCorrect:
            "✅ 「運転を見合わせる」= pause / suspend service for now.",
        },
        {
          id: "b",
          labelJa: "いつもどおり全線平常運転している。",
          correct: false,
          feedbackWrong: "❌ 「見合わせております」means service is stopped.",
        },
        {
          id: "c",
          labelJa: "カフェの営業時間を知らせている。",
          correct: false,
          feedbackWrong: "❌ This is a train announcement.",
        },
        {
          id: "d",
          labelJa: "改札の場所を案内している。",
          correct: false,
          feedbackWrong: "❌ No gate directions — it’s about suspended service.",
        },
      ],
    },
    {
      id: "station-staff-ask",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "yamamoto-station",
      promptJa: "運転再開の見込みはわかりますか。",
      promptReading: "うんてん さいかい の みこみ は わかります か。",
      promptEn: "You ask staff about when service might resume. Choose a natural question.",
      skillHint: "politeness",
      choices: [
        {
          id: "a",
          labelJa: "再開はいつ頃になりますか。",
          correct: true,
          feedbackCorrect: "✅ Polite and on-topic.",
        },
        {
          id: "b",
          labelJa: "温めますか？",
          correct: false,
          feedbackWrong: "❌ Convenience store line.",
        },
        {
          id: "c",
          labelJa: "おすすめは何ですか？",
          correct: false,
          feedbackWrong: "❌ Café question.",
        },
        {
          id: "d",
          labelJa: "生年月日を書いてください。",
          correct: false,
          feedbackWrong: "❌ Form instruction — wrong place.",
        },
      ],
    },

    // ── Late afternoon · Café ────────────────────────────────────────
    {
      id: "cafe-menu",
      kind: "menu",
      objectiveType: "menu",
      npcId: "ken",
      promptJa: "ご注文はお決まりですか？",
      promptReading: "ごちゅうもん は おきまり です か？",
      promptEn: "You want the iced coffee (¥420). What do you say?",
      menuItems: [
        { nameJa: "ホットコーヒー", priceYen: 380 },
        { nameJa: "アイスコーヒー", priceYen: 420 },
        { nameJa: "今日のカレー", priceYen: 850 },
        { nameJa: "トーストセット", priceYen: 650 },
      ],
      skillHint: "conversation",
      choices: [
        {
          id: "a",
          labelJa: "アイスコーヒーを一つお願いします。",
          correct: true,
          feedbackCorrect: "✅ Clear order with 「〜を一つお願いします」.",
        },
        {
          id: "b",
          labelJa: "ホットコーヒーを一つお願いします。",
          correct: false,
          feedbackWrong: "❌ That’s the hot one — you wanted iced.",
        },
        {
          id: "c",
          labelJa: "住民票の写しをお願いします。",
          correct: false,
          feedbackWrong: "❌ City Hall request.",
        },
        {
          id: "d",
          labelJa: "2番線に乗り換えます。",
          correct: false,
          feedbackWrong: "❌ Station language.",
        },
      ],
    },
    {
      id: "cafe-for-here",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "ken",
      promptJa: "店内でお召し上がりですか、それともお持ち帰りですか。",
      promptReading:
        "てんない で おめしあがり です か、それとも おもちかえり です か。",
      promptEn: "For here or to go? You want to stay.",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "店内でお願いします。",
          correct: true,
          feedbackCorrect: "✅ 「店内で」= for here.",
        },
        {
          id: "b",
          labelJa: "お持ち帰りでお願いします。",
          correct: false,
          feedbackWrong: "❌ That’s takeout.",
        },
        {
          id: "c",
          labelJa: "運転見合わせです。",
          correct: false,
          feedbackWrong: "❌ Station delay vocabulary.",
        },
        {
          id: "d",
          labelJa: "本人確認書類です。",
          correct: false,
          feedbackWrong: "❌ ID documents — wrong context.",
        },
      ],
    },

    // ── Harder stretch · N3 / N2 flavor ───────────────────────────────
    {
      id: "notice-reading",
      kind: "reading",
      objectiveType: "reading",
      promptJa: "駅の掲示を読んでください。",
      promptEn: "Read the station notice carefully.",
      bodyJa:
        "【お知らせ】中央線は信号点検のため、本日22時以降、一部列車の運転を見合わせる場合があります。お乗り換えの際は、改札内の案内表示をご確認ください。",
      bodyEn:
        "Notice: Due to signal inspection, some Chūō Line trains may be suspended after 10 p.m. today. When transferring, please check the information boards inside the ticket gates.",
      skillHint: "reading",
      vocabHint: "運転見合わせ",
      choices: [
        {
          id: "a",
          labelJa: "夜遅く、中央線の一部が止まる可能性がある。",
          correct: true,
          feedbackCorrect:
            "✅ 「22時以降」「一部列車」「運転を見合わせる場合」→ possible late suspensions.",
        },
        {
          id: "b",
          labelJa: "終日、全線が完全に止まっている。",
          correct: false,
          feedbackWrong:
            "❌ Only after 22:00, and only some trains — not all day / all lines.",
        },
        {
          id: "c",
          labelJa: "カフェが22時に閉店すると書いてある。",
          correct: false,
          feedbackWrong: "❌ This is a train notice.",
        },
        {
          id: "d",
          labelJa: "改札の外で乗り換えるように書いてある。",
          correct: false,
          feedbackWrong: "❌ It says to check boards 改札内 (inside the gates).",
        },
      ],
    },
    {
      id: "n2-service",
      kind: "dialogue",
      objectiveType: "vocabulary",
      npcId: "tanaka-city-hall",
      promptJa:
        "恐れ入りますが、交付まで少々お待ちいただけますでしょうか。",
      promptReading:
        "おそれいります が、こうふ まで しょうしょう おまち いただけます でしょう か。",
      promptEn: "What are they asking you to do?",
      skillHint: "politeness",
      vocabHint: "恐れ入りますが",
      choices: [
        {
          id: "a",
          labelJa: "発行まで少し待ってほしいと丁寧に頼んでいる。",
          correct: true,
          feedbackCorrect:
            "✅ 「恐れ入りますが」softens the request; 「お待ちいただけますでしょうか」= could you wait?",
        },
        {
          id: "b",
          labelJa: "今すぐ帰れと命じている。",
          correct: false,
          feedbackWrong: "❌ Soft request, not an order to leave.",
        },
        {
          id: "c",
          labelJa: "料金を払わずに帰れと言っている。",
          correct: false,
          feedbackWrong: "❌ They’re asking you to wait for issuance.",
        },
        {
          id: "d",
          labelJa: "乗り換え案内をしている。",
          correct: false,
          feedbackWrong: "❌ No transfer talk here.",
        },
      ],
    },
    {
      id: "final-mix",
      kind: "dialogue",
      objectiveType: "grammar",
      npcId: "haruka",
      promptJa:
        "一日中いろいろあったみたいだけど、なんとかなったんじゃない？",
      promptReading:
        "いちにちじゅう いろいろ あった みたい だけど、なんとか なったん じゃ ない？",
      promptEn: "End-of-day check-in. Choose the most natural reply.",
      skillHint: "grammar",
      helpHint: "「なんとかなる」= manage / get through somehow.",
      choices: [
        {
          id: "a",
          labelJa: "うん、なんとかなったよ。助かった。",
          correct: true,
          feedbackCorrect:
            "✅ Matches her casual tone and 「なんとかなった」.",
        },
        {
          id: "b",
          labelJa: "はい、本人確認書類を提出いたしました。",
          correct: false,
          feedbackWrong: "❌ Too formal / bureaucratic for this chat.",
        },
        {
          id: "c",
          labelJa: "運転見合わせですので諦めます。",
          correct: false,
          feedbackWrong: "❌ Wrong register and wrong mood for a wrap-up.",
        },
        {
          id: "d",
          labelJa: "アイスコーヒーを一つお願いします。",
          correct: false,
          feedbackWrong: "❌ Ordering — wrong moment.",
        },
      ],
    },

    {
      id: "outro",
      kind: "outro",
      promptJa:
        "最初の一週間、お疲れさま。ことば町の一日を乗り越えました。次は社会生活へ。",
      promptEn:
        "You made it through a full day in Kotoba Town.\n\nChapter 1 clear. Coming next: 社会生活 — life in society.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 250,
    replayXp: 30,
    skillRewards: {
      conversation: 2,
      listening: 2,
      reading: 2,
      vocabulary: 2,
      politeness: 2,
      grammar: 1,
    },
    unlockLocationIds: ["clinic", "phone-center", "office"],
    unlockQuestIds: [],
    nextQuestTeaser: {
      id: "chapter-2-preview",
      title: "Coming next",
      japaneseTitle: "社会生活",
    },
  },
  unlocks: {
    locationIds: ["clinic", "phone-center", "office"],
    questIds: [],
  },
};
