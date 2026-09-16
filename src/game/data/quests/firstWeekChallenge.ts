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
          labelJa: "転入届を出したいんですが。",
          labelEn: "I’d like to submit a moving-in notification.",
          correct: false,
          feedbackWrong:
            "❌ You already registered. Today you need a 住民票の写し.",
        },
        {
          id: "b",
          labelJa: "住民票の写しをいただきたいんですが。",
          labelEn: "I’d like a copy of my residence record.",
          correct: true,
          feedbackCorrect:
            "✅ Clear purpose.\n\n「〜たいんですが」softens a counter request.",
        },
        {
          id: "c",
          labelJa: "印鑑登録をしたいんですが。",
          labelEn: "I’d like to register my personal seal.",
          correct: false,
          feedbackWrong:
            "❌ Also City Hall, but today’s errand is a 住民票の写し.",
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
          labelJa: "はい、申請書の控えを持っています。",
          labelEn: "Yes, I have a copy of my application form.",
          correct: false,
          feedbackWrong:
            "❌ A form copy isn’t ID. Use a residence card or passport.",
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
        { id: "purpose", labelJa: "使用目的", meaningEn: "Purpose of use" },
        { id: "address", labelJa: "現住所", meaningEn: "Current address" },
      ],
      choices: [
        {
          id: "name",
          labelJa: "氏名",
          correct: false,
          feedbackWrong: "❌ 氏名 = full name. Current address is 「現住所」.",
        },
        {
          id: "purpose",
          labelJa: "使用目的",
          correct: false,
          feedbackWrong: "❌ 使用目的 = why you need the document.",
        },
        {
          id: "address",
          labelJa: "現住所",
          correct: true,
          feedbackCorrect: "✅ 「現住所」= current address.",
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
      speech: { karaokeMode: "after-answer", autoPlay: true },
      skillHint: "listening",
      vocabHint: "温める",
      choices: [
        {
          id: "a",
          labelJa: "袋が必要かどうか聞いている。",
          correct: false,
          feedbackWrong: "❌ That would be 「袋はご利用ですか？」",
        },
        {
          id: "b",
          labelJa: "ポイントを付けるか聞いている。",
          correct: false,
          feedbackWrong: "❌ That would mention ポイントカード.",
        },
        {
          id: "c",
          labelJa: "お弁当を温めるかどうか聞いている。",
          correct: true,
          feedbackCorrect: "✅ 「温めますか？」= Shall I heat this up?",
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
          labelJa: "後払いでお願いします。",
          correct: false,
          feedbackWrong:
            "❌ Konbini checkout needs payment now. Choose カード.",
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
          labelJa: "ううん、今日は特に予定ないよ。",
          correct: false,
          feedbackWrong:
            "❌ She asked about plans — you’ve got the station this afternoon.",
        },
        {
          id: "b",
          labelJa: "うん、午後ちょっと駅まで行く予定。",
          correct: true,
          feedbackCorrect:
            "✅ Casual and clear. 「予定」fits her question naturally.",
        },
        {
          id: "c",
          labelJa: "うん、この辺もう慣れたよ。",
          correct: false,
          feedbackWrong:
            "❌ That answers a different question. Tell her your afternoon plan.",
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
      speech: { karaokeMode: "after-answer", autoPlay: true },
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
          labelJa: "一人で行って、あとで合流しようと言っている。",
          correct: false,
          feedbackWrong:
            "❌ She said 「一緒に行こう」— she’s offering to go with you.",
        },
        {
          id: "c",
          labelJa: "今日の予定は全部キャンセルしようと言っている。",
          correct: false,
          feedbackWrong:
            "❌ She’s adding a café stop, not canceling plans.",
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
          labelJa: "左手のトイレの先が改札です。",
          labelEn: "The gates are past the restrooms on your left.",
          correct: false,
          feedbackWrong:
            "❌ Wrong landmark. Listen for the yellow line on the right.",
        },
        {
          id: "b",
          labelJa: "地下の出口の先が改札です。",
          labelEn: "The gates are past the underground exit.",
          correct: false,
          feedbackWrong:
            "❌ Exits and 改札 are different. Follow the yellow line right.",
        },
        {
          id: "c",
          labelJa: "右手の黄色い線の先が改札です。",
          labelEn: "The gates are past the yellow line on your right.",
          correct: true,
          feedbackCorrect: "✅ 「改札」= ticket gates.",
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
          labelJa: "1番線に乗れば中央線になる。",
          correct: false,
          feedbackWrong: "❌ 1番線 is Yamanote, not Chūō.",
        },
        {
          id: "b",
          labelJa: "改札を通って2番線へ行く。",
          correct: true,
          feedbackCorrect:
            "✅ 中央線 is platform 2. 「乗り換え」happens inside after the gates.",
        },
        {
          id: "c",
          labelJa: "改札を通らずに3番線へ行く。",
          correct: false,
          feedbackWrong: "❌ You need the gates first, and 3 is the wrong line.",
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
          labelJa: "いつもどおり全線平常運転している。",
          correct: false,
          feedbackWrong: "❌ 「見合わせております」means service is stopped.",
        },
        {
          id: "b",
          labelJa: "人身事故があったが、もう運転を再開した。",
          correct: false,
          feedbackWrong:
            "❌ It says service is suspended now — not that it already resumed.",
        },
        {
          id: "c",
          labelJa: "事故の影響で、しばらく電車が動いていない。",
          correct: true,
          feedbackCorrect:
            "✅ 「運転を見合わせる」= pause / suspend service for now.",
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
          labelJa: "遅延証明書はいつまでもらえますか。",
          correct: false,
          feedbackWrong:
            "❌ Related, but you’re asking when service might resume.",
        },
        {
          id: "b",
          labelJa: "再開はいつ頃になりますか。",
          correct: true,
          feedbackCorrect: "✅ Polite and on-topic.",
        },
        {
          id: "c",
          labelJa: "何番線から出発しますか。",
          correct: false,
          feedbackWrong:
            "❌ Platform talk. Ask about 再開 (when trains start again).",
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
        { nameJa: "ブレンドコーヒー", priceYen: 400 },
        { nameJa: "トーストセット", priceYen: 650 },
      ],
      skillHint: "conversation",
      choices: [
        {
          id: "a",
          labelJa: "ホットコーヒーを一つお願いします。",
          correct: false,
          feedbackWrong: "❌ That’s the hot one — you wanted iced.",
        },
        {
          id: "b",
          labelJa: "ブレンドコーヒーを一つお願いします。",
          correct: false,
          feedbackWrong: "❌ Close, but you wanted アイスコーヒー.",
        },
        {
          id: "c",
          labelJa: "アイスコーヒーを一つお願いします。",
          correct: true,
          feedbackCorrect: "✅ Clear order with 「〜を一つお願いします」.",
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
          feedbackWrong: "❌ That’s takeout. You want to stay.",
        },
        {
          id: "c",
          labelJa: "どちらでも大丈夫です。",
          correct: false,
          feedbackWrong:
            "❌ Staff need a clear choice. Say 「店内でお願いします。」",
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
      speech: { karaokeMode: "off", autoPlay: false },
      bodyJa:
        "【お知らせ】中央線は信号点検のため、本日22時以降、一部列車の運転を見合わせる場合があります。お乗り換えの際は、改札内の案内表示をご確認ください。",
      bodyEn:
        "Notice: Due to signal inspection, some Chūō Line trains may be suspended after 10 p.m. today. When transferring, please check the information boards inside the ticket gates.",
      skillHint: "reading",
      vocabHint: "運転見合わせ",
      choices: [
        {
          id: "a",
          labelJa: "終日、全線が完全に止まっている。",
          correct: false,
          feedbackWrong:
            "❌ Only after 22:00, and only some trains — not all day / all lines.",
        },
        {
          id: "b",
          labelJa: "改札の外で乗り換えるように書いてある。",
          correct: false,
          feedbackWrong: "❌ It says to check boards 改札内 (inside the gates).",
        },
        {
          id: "c",
          labelJa: "夜遅く、中央線の一部が止まる可能性がある。",
          correct: true,
          feedbackCorrect:
            "✅ 「22時以降」「一部列車」「運転を見合わせる場合」→ possible late suspensions.",
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
          labelJa: "別の申請書も書いてほしいと言っている。",
          correct: false,
          feedbackWrong:
            "❌ No extra form — they’re asking you to wait for 交付.",
        },
        {
          id: "b",
          labelJa: "発行まで少し待ってほしいと丁寧に頼んでいる。",
          correct: true,
          feedbackCorrect:
            "✅ 「恐れ入りますが」softens the request; 「お待ちいただけますでしょうか」= could you wait?",
        },
        {
          id: "c",
          labelJa: "別の窓口へ移動してほしいと言っている。",
          correct: false,
          feedbackWrong:
            "❌ No window change — they’re asking you to wait for 交付.",
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
          labelJa: "うん、まだ全然だめだったよ。",
          correct: false,
          feedbackWrong:
            "❌ Contradicts her 「なんとかなった」check-in.",
        },
        {
          id: "c",
          labelJa: "うん、明日もう一回最初からやるよ。",
          correct: false,
          feedbackWrong:
            "❌ Sounds like a restart, not agreeing you got through it.",
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
    unlockLocationIds: ["clinic"],
    unlockQuestIds: ["clinic-visit"],
    nextQuestTeaser: {
      id: "clinic-visit",
      title: "Visit the Clinic",
      japaneseTitle: "クリニックを受診",
    },
  },
  unlocks: {
    locationIds: ["clinic"],
    questIds: ["clinic-visit"],
  },
};
