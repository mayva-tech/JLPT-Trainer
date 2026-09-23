import type { QuestDefinition } from "../../types";

/**
 * Chapter 1 · Train Station
 * 駅を攻略せよ — Navigate the Train Station
 */
export const STATION_MASTER_QUEST: QuestDefinition = {
  id: "station-master",
  title: "Navigate the Train Station",
  japaneseTitle: "駅を攻略せよ",
  japaneseTitleReading: "えき を こうりゃく せよ",
  locationId: "train-station",
  chapter: 1,
  description:
    "Find the right line to Central Station: read the map, decode announcements, ask staff, and handle a transfer — without losing all your Confidence.",
  difficulty: "hard",
  recommendedLevel: 3,
  startingConfidence: 5,
  requiresQuestIds: ["meet-neighbor"],
  icon: "🚉",
  meetNpcIds: ["yamamoto-station"],
  objectives: [
    { id: "read-map", label: "Read the Sakura Line map" },
    { id: "read-sign", label: "Read platform direction signs" },
    { id: "hear-delay", label: "Understand a delay announcement" },
    { id: "ask-platform", label: "Ask which track for Central" },
    { id: "transfer", label: "Handle a transfer" },
    { id: "station-vocab", label: "Master station vocabulary" },
    { id: "finish", label: "Reach the right home" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "ことば駅に着きました。中央駅へ向かいます。",
      promptReading: "ことばえき に つきました。ちゅうおうえき へ むかいます。",
      promptEn:
        "You arrive at Kotoba Station.\n\nYour mission: Get to Central Station (中央駅) — read signs, listen for delays, and ask staff when unsure.",
      costsConfidence: false,
    },
    {
      id: "sakura-map",
      kind: "map",
      objectiveType: "map",
      promptJa: "路線図を確認してください。",
      promptReading: "ろせんず を かくにん して ください。",
      promptEn: "Check the route map. Which station comes after Midori on the way to Central?",
      mapText: [
        "SAKURA LINE  さくら線",
        "",
        "  ことば (Kotoba)",
        "     │",
        "  みどり (Midori)",
        "     │",
        "  ひがし (Higashi)",
        "     │",
        "  中央  (Central)",
      ].join("\n"),
      skillHint: "reading",
      helpHint: "Read the line top → bottom toward 中央.",
      choices: [
        {
          id: "a",
          labelJa: "ことば",
          labelEn: "Kotoba",
          correct: false,
          feedbackWrong:
            "❌ ことば is before Midori, not after.\n\nOrder: ことば → みどり → ひがし → 中央.",
        },
        {
          id: "b",
          labelJa: "ひがし（東）",
          labelEn: "Higashi",
          reading: "ひがし",
          correct: true,
          feedbackCorrect:
            "✅ Kotoba → Midori → Higashi → Central.\n\nひがし is the stop between Midori and Central.",
        },
        {
          id: "c",
          labelJa: "中央",
          labelEn: "Central",
          reading: "ちゅうおう",
          correct: false,
          feedbackWrong:
            "❌ 中央 is the last stop. After Midori comes ひがし, then 中央.",
        },
      ],
    },
    {
      id: "direction-sign",
      kind: "reading",
      objectiveType: "reading",
      promptJa: "この案内板は何を示していますか。",
      promptReading: "この あんないばん は なに を しめして います か。",
      promptEn: "What does this sign tell you?",
      speech: { karaokeMode: "off", autoPlay: false },
      bodyJa: "【案内】中央方面　→　3番線",
      bodyEn: "Notice: Toward Central → Track 3",
      skillHint: "reading",
      vocabHint: "方面",
      helpHint: "〜方面 = toward / in the direction of …",
      choices: [
        {
          id: "a",
          labelJa: "中央へ行く電車は3番線から発車する。",
          labelEn: "Trains toward Central leave from track 3.",
          reading: "ちゅうおう へ いく でんしゃ は さんばんせん から はっしゃ する。",
          correct: true,
          feedbackCorrect:
            "✅ 「中央方面」= toward Central. The arrow points you to 3番線.",
        },
        {
          id: "b",
          labelJa: "中央方面の電車は2番線から発車する。",
          labelEn: "Trains toward Central leave from track 2.",
          reading: "ちゅうおう ほうめん の でんしゃ は にばんせん から はっしゃ する。",
          correct: false,
          feedbackWrong:
            "❌ Close track number — the sign says 3番線, not 2.",
        },
        {
          id: "c",
          labelJa: "改札は3番出口にある。",
          labelEn: "The ticket gate is at exit 3.",
          reading: "かいさつ は さんばん でぐち に ある。",
          correct: false,
          feedbackWrong:
            "❌ 番線 = platform/track number, not an exit number.",
        },
      ],
    },
    {
      id: "delay-announcement",
      kind: "listening",
      objectiveType: "listening",
      promptJa: "車内・駅の放送を聞いてください。",
      promptReading: "しゃない・えき の ほうそう を きいて ください。",
      promptEn: "Listen carefully. What is the announcement saying?",
      listenText:
        "ただいま人身事故の影響で、さくら線は運転を見合わせております。再開までしばらくお待ちください。",
      listenReading:
        "ただいま じんしん じこ の えいきょう で、さくらせん は うんてん を みあわせて おります。さいかい まで しばらく おまち ください。",
      skillHint: "listening",
      vocabHint: "運転見合わせ",
      speech: {
        karaokeMode: "after-answer",
        announcement: true,
        autoPlay: true,
      },
      helpHint:
        "運転を見合わせる = service is temporarily suspended. 人身事故 = accident involving a person.",
      choices: [
        {
          id: "a",
          labelJa: "人身事故のため、電車が少し遅れている。",
          labelEn: "Trains are running a little late because of an accident.",
          reading: "じんしん じこ の ため、 でんしゃ が すこし おくれて いる。",
          correct: false,
          feedbackWrong:
            "❌ Delay (遅延) vs suspension — 「運転見合わせ」means service is paused, not just late.",
        },
        {
          id: "b",
          labelJa: "人身事故のため、さくら線は本日運休になった。",
          labelEn: "The Sakura Line is canceled for the whole day.",
          reading: "じんしん じこ の ため、 さくらせん は ほんじつ うんきゅう に なった。",
          correct: false,
          feedbackWrong:
            "❌ Too final — 「再開までしばらく」means wait for restart, not all-day 運休.",
        },
        {
          id: "c",
          labelJa: "人身事故のため、電車の運転が一時止まっている。",
          labelEn: "Service is paused because of an accident involving a person.",
          reading: "じんしん じこ の ため、 でんしゃ の うんてん が いちじ とまって いる。",
          correct: true,
          feedbackCorrect:
            "✅ 「運転見合わせ」= trains are not running for now.\n\n「人身事故」is a common cause in station announcements.",
        },
      ],
    },
    {
      id: "ask-track",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "yamamoto-station",
      promptJa: "何かお探しですか。",
      promptReading: "なにか おさがし です か。",
      promptEn: "Looking for something? Ask for the track to Central Station.",
      skillHint: "conversation",
      helpHint:
        "Use 「〜たいんですが」+ a clear question. 何番線 = which track/platform?",
      choices: [
        {
          id: "a",
          labelJa: "すみません、中央駅の切符はいくらですか？",
          labelEn: "Excuse me — how much is a ticket to Central?",
          reading: "すみません、 ちゅうおうえき の きっぷ は いくら です か？",
          correct: false,
          feedbackWrong:
            "❌ Polite, but you need the track number (何番線), not the fare.",
        },
        {
          id: "b",
          labelJa: "すみません、中央駅に行きたいんですが、何番線ですか？",
          labelEn: "Excuse me — I’d like to go to Central Station. Which track is it?",
          reading: "すみません、 ちゅうおうえき に いきたいん です が、 なんばんせん です か？",
          correct: true,
          feedbackCorrect:
            "✅ Soft request + clear question.\n\n「何番線ですか？」is the natural way to ask for a platform number.",
        },
        {
          id: "c",
          labelJa: "すみません、乗り換えは何分ですか？",
          labelEn: "Excuse me — how many minutes for the transfer?",
          reading: "すみません、 のりかえ は なんぷん です か？",
          correct: false,
          feedbackWrong:
            "❌ Transfer time isn’t the question yet. Ask 「何番線ですか？」",
        },
      ],
    },
    {
      id: "staff-reply",
      kind: "dialogue",
      objectiveType: "listening",
      npcId: "yamamoto-station",
      promptJa: "中央方面は3番線です。まもなく発車します。",
      promptReading: "ちゅうおう ほうめん は さんばんせん です。まもなく はっしゃ します。",
      promptEn: "What should you do based on the staff’s reply?",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "3番線のホームへ急ぐ。",
          labelEn: "Hurrying to platform 3.",
          reading: "さんばんせん の ホーム へ いそぐ。",
          correct: true,
          feedbackCorrect:
            "✅ 「まもなく発車」= departing soon. Head to 3番線 right away.",
        },
        {
          id: "b",
          labelJa: "2番線のホームで待つ。",
          labelEn: "Waiting on platform 2.",
          reading: "にばんせん の ホーム で まつ。",
          correct: false,
          feedbackWrong:
            "❌ Close track number — staff said 3番線, not 2.",
        },
        {
          id: "c",
          labelJa: "終電までベンチで待つ。",
          labelEn: "Waiting on a bench until the last train.",
          reading: "しゅうでん まで ベンチ で まつ。",
          correct: false,
          feedbackWrong:
            "❌ Timing — 「まもなく発車」means leave soon, not wait for 終電.",
        },
      ],
    },
    {
      id: "transfer-challenge",
      kind: "dialogue",
      objectiveType: "multiple-choice",
      npcId: "yamamoto-station",
      promptJa:
        "ひがし駅でグリーン線に乗り換えてください。乗り換えは同じホームです。",
      promptReading:
        "ひがしえき で グリーンせん に のりかえて ください。のりかえ は おなじ ホーム です。",
      promptEn: "What does the transfer instruction mean?",
      skillHint: "listening",
      vocabHint: "乗り換え",
      helpHint: "乗り換える = to transfer. 同じホーム = same platform (no stairs needed).",
      choices: [
        {
          id: "a",
          labelJa: "ひがし駅でグリーン線に乗り換えるが、別ホームへ移動する。",
          labelEn: "Transfer to the Green Line at Higashi, but change platforms.",
          reading: "ひがしえき で グリーンせん に のりかえる が、 べつ ホーム へ いどう する。",
          correct: false,
          feedbackWrong:
            "❌ Station is right, but 「同じホーム」means stay put — no platform change.",
        },
        {
          id: "b",
          labelJa: "ことば駅でグリーン線に乗り換える。ホームはそのままでよい。",
          labelEn: "Transfer to the Green Line at Kotoba; stay on the same platform.",
          reading: "ことばえき で グリーンせん に のりかえる。ホーム は その まま で よい。",
          correct: false,
          feedbackWrong:
            "❌ Wrong station — transfer is at ひがし駅, not ことば駅.",
        },
        {
          id: "c",
          labelJa: "東駅でグリーン線に乗り換える。ホームはそのままでよい。",
          labelEn: "Transfer to the Green Line at Higashi; stay on the same platform.",
          reading: "ひがしえき で グリーンせん に のりかえる。ホーム は その まま で よい。",
          correct: true,
          feedbackCorrect:
            "✅ 「乗り換え」= transfer. 「同じホーム」means you don’t change platforms.",
        },
      ],
    },
    {
      id: "vocab-kaisatsu",
      kind: "dialogue",
      objectiveType: "vocabulary",
      promptJa: "「改札」の意味はどれですか。",
      promptReading: "「かいさつ」 の いみ は どれ です か。",
      promptEn: "What does 改札 mean?",
      skillHint: "vocabulary",
      vocabHint: "改札",
      choices: [
        {
          id: "a",
          labelJa: "電車が止まるホーム",
          labelEn: "The platform where trains stop",
          reading: "でんしゃ が とまる ホーム",
          correct: false,
          feedbackWrong: "❌ That’s ホーム. 改札 is the ticket gate area.",
        },
        {
          id: "b",
          labelJa: "切符を確認して通るゲート",
          labelEn: "The gate where tickets are checked",
          reading: "きっぷ を かくにん して とおる ゲート",
          correct: true,
          feedbackCorrect:
            "✅ 改札 / 改札口 = ticket gate. You 改札を通る before reaching the platforms.",
        },
        {
          id: "c",
          labelJa: "別の線に乗り換えること",
          labelEn: "Changing to another line",
          reading: "べつ の せん に のりかえる こと",
          correct: false,
          feedbackWrong: "❌ That’s 乗り換え. 改札 = ticket gate.",
        },
      ],
    },
    {
      id: "vocab-train-types",
      kind: "dialogue",
      objectiveType: "vocabulary",
      promptJa: "「各駅停車」と「快速」の違いは？",
      promptReading: "「かくえきていしゃ」 と 「かいそく」 の ちがい は？",
      promptEn: "How do 各駅停車 and 快速 differ?",
      skillHint: "vocabulary",
      vocabHint: "各駅停車",
      helpHint: "各駅停車 stops at every station; 快速 skips some for speed.",
      choices: [
        {
          id: "a",
          labelJa: "各駅停車はすべての駅に止まる。快速は一部の駅を通過する。",
          labelEn: "Locals stop everywhere; rapids skip some stations.",
          reading: "かくえきていしゃ は すべて の えき に とまる。かいそく は いちぶ の えき を つうか する。",
          correct: true,
          feedbackCorrect:
            "✅ Core station vocab.\n\n各駅停車 = local. 快速 = rapid (fewer stops).",
        },
        {
          id: "b",
          labelJa: "各駅停車は有料特急で、快速は無料の普通列車だ。",
          labelEn: "Locals are paid limited expresses; rapids are free locals.",
          reading: "かくえきていしゃ は ゆうりょう とっきゅう で、 かいそく は むりょう の ふつう れっしゃ だ。",
          correct: false,
          feedbackWrong:
            "❌ 特急 is the limited express. 各駅停車 / 快速 are regular service types.",
        },
        {
          id: "c",
          labelJa: "快速は各駅に止まり、各駅停車は一部の駅を通過する。",
          labelEn: "Rapids stop everywhere; locals skip some stations.",
          reading: "かいそく は かくえき に とまり、 かくえきていしゃ は いちぶ の えき を つうか する。",
          correct: false,
          feedbackWrong:
            "❌ Reversed — 各駅停車 stops at every station; 快速 skips some.",
        },
      ],
    },
    {
      id: "vocab-home-delay",
      kind: "dialogue",
      objectiveType: "vocabulary",
      promptJa: "「ホーム」と「遅延」の組み合わせで正しいのは？",
      promptReading: "「ホーム」 と 「ちえん」 の くみあわせ で ただしい の は？",
      promptEn: "Which statement uses ホーム and 遅延 correctly?",
      skillHint: "vocabulary",
      vocabHint: "遅延",
      choices: [
        {
          id: "a",
          labelJa: "遅延は改札の出口の名前だ。",
          labelEn: "遅延 is the name of a ticket-gate exit.",
          reading: "ちえん は かいさつ の でぐち の なまえ だ。",
          correct: false,
          feedbackWrong: "❌ 遅延 means delay, not an exit name.",
        },
        {
          id: "b",
          labelJa: "ホームは切符売り場のことだ。",
          labelEn: "ホーム means the ticket counter.",
          reading: "ホーム は きっぷうりば の こと だ。",
          correct: false,
          feedbackWrong:
            "❌ Ticket windows are みどりの窓口 / 切符売り場. ホーム = platform.",
        },
        {
          id: "c",
          labelJa: "電車が遅延しているので、ホームでしばらく待つ。",
          labelEn: "The train is delayed, so I wait on the platform for a while.",
          reading: "でんしゃ が ちえん して いる ので、 ホーム で しばらく まつ。",
          correct: true,
          feedbackCorrect:
            "✅ ホーム = platform. 遅延 = delay.\n\nNatural combo when announcements mention late arrivals.",
        },
      ],
    },
    {
      id: "board-confirm",
      kind: "dialogue",
      objectiveType: "reading",
      promptJa: "車内の表示を見てください。",
      promptReading: "しゃない の ひょうじ を みて ください。",
      promptEn: "Read the onboard display. Is this the right train?",
      bodyJa: "次は　ひがし　です。　各駅停車　中央行き",
      bodyEn: "Next: Higashi. Local train bound for Central.",
      skillHint: "reading",
      helpHint: "〜行き = bound for …",
      choices: [
        {
          id: "a",
          labelJa: "いいえ。これは反対方面の快速だ。",
          labelEn: "No — this is a rapid going the other way.",
          reading: "いいえ。これ は はんたい ほうめん の かいそく だ。",
          correct: false,
          feedbackWrong: "❌ The display clearly says 中央行き and 各駅停車.",
        },
        {
          id: "b",
          labelJa: "はい。中央行きの各駅停車に乗っている。",
          labelEn: "Yes — I’m on a local bound for Central.",
          reading: "はい。ちゅうおういき の かくえきていしゃ に のって いる。",
          correct: true,
          feedbackCorrect:
            "✅ 「中央行き」+「各駅停車」matches your plan (stop at Higashi to transfer if needed).",
        },
        {
          id: "c",
          labelJa: "特急券が必要な列車だ。",
          labelEn: "This train requires a limited-express ticket.",
          reading: "とっきゅうけん が ひつよう な れっしゃ だ。",
          correct: false,
          feedbackWrong: "❌ 各駅停車 is a regular local — no 特急券.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      npcId: "yamamoto-station",
      promptJa:
        "中央駅に到着しました。改札を出て、駅近くのカフェへ向かいましょう。",
      promptReading:
        "ちゅうおうえき に とうちゃく しました。かいさつ を でて、 えき ちかく の カフェ へ むかいましょう。",
      promptEn:
        "You’ve reached Central Station. Exit the gates — Haruka’s café tip is nearby.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 170,
    replayXp: 20,
    skillRewards: {
      listening: 3,
      reading: 3,
      vocabulary: 2,
    },
    replaySkillRewards: { listening: 1 },
    unlockLocationIds: ["cafe"],
    unlockQuestIds: ["cafe-order"],
    nextQuestTeaser: {
      id: "cafe-order",
      title: "Order at the Café",
      japaneseTitle: "カフェで注文",
    },
  },
  unlocks: {
    locationIds: ["cafe"],
    questIds: ["cafe-order"],
  },
};
