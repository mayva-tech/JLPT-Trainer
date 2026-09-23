import type { QuestDefinition } from "../../types";

export const MEET_NEIGHBOR_QUEST: QuestDefinition = {
  id: "meet-neighbor",
  title: "Meet Your Neighbor",
  japaneseTitle: "隣の人にあいさつ",
  japaneseTitleReading: "となり の ひと に あいさつ",
  locationId: "home",
  chapter: 1,
  description:
    "Haruka notices you while you’re unpacking. Practice casual greetings and self-introductions.",
  difficulty: "normal",
  recommendedLevel: 2,
  startingConfidence: 5,
  requiresQuestIds: ["convenience-first-shop"],
  icon: "🏠",
  meetNpcIds: ["haruka"],
  objectives: [
    { id: "greet", label: "Respond to Haruka" },
    { id: "intro", label: "Introduce yourself" },
    { id: "move", label: "Explain you just moved" },
    { id: "casual", label: "Handle casual Japanese" },
    { id: "cafe-hint", label: "Hear about the café" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "荷物を下ろしていると、隣の部屋の人が声をかけてきました。",
      promptReading:
        "にもつ を おろして いる と、 となり の へや の ひと が こえ を かけて きました。",
      promptEn:
        "While unpacking, someone from next door calls out to you.",
      costsConfidence: false,
    },
    {
      id: "first-meet",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      when: { notMetNpc: "haruka" },
      promptJa: "あ、新しく引っ越してきた人ですよね？",
      promptReading: "あ、あたらしく ひっこして きた ひと です よ ね？",
      promptEn: "Oh — you’re the one who just moved in, right?",
      skillHint: "conversation",
      helpHint: "〜よね？ softens confirmation in casual talk.",
      choices: [
        {
          id: "a",
          labelJa: "いえ、ずっと前からここに住んでいます。",
          labelEn: "No, I’ve lived here for a long time.",
          reading: "いえ、 ずっと まえ から ここ に すんで います。",
          correct: false,
          feedbackWrong:
            "❌ Wrong detail — she guessed you just moved, and that’s true.",
        },
        {
          id: "b",
          labelJa: "はい、昨日引っ越してきたばかりなんです。",
          labelEn: "Yes, I just moved in yesterday.",
          reading: "はい、 きのう ひっこして きた ばかり なん です。",
          correct: true,
          feedbackCorrect:
            "✅ Natural.\n\n「〜ばかり」= just (recently). 「んです」softens the explanation.",
        },
        {
          id: "c",
          labelJa: "恐れ入りますが、初めてお目にかかります。",
          labelEn: "Excuse me, but this is the first time we’ve met.",
          reading: "おそれいります が、 はじめて おめ に かかります。",
          correct: false,
          feedbackWrong:
            "❌ Over-formal for a hallway chat with a neighbor.",
        },
      ],
    },
    {
      id: "already-met",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      when: { metNpc: "haruka" },
      promptJa: "あ、また会ったね。元気？",
      promptReading: "あ、 また あった ね。げんき？",
      promptEn: "Oh, we meet again. How’s it going?",
      skillHint: "conversation",
      costsConfidence: false,
      choices: [
        {
          id: "a",
          labelJa: "うん、おかげさまで。",
          labelEn: "Yeah, thanks — I’m doing well.",
          correct: true,
          feedbackCorrect: "✅ Friendly and natural with someone you know.",
        },
        {
          id: "b",
          labelJa: "初めてお会いします。よろしくお願いいたします。",
          labelEn: "Nice to meet you for the first time.",
          reading: "はじめて おあい します。よろしく おねがい いたします。",
          correct: false,
          feedbackWrong:
            "❌ First-meeting phrase — you already know each other.",
        },
        {
          id: "c",
          labelJa: "大変ご無沙汰しております。お変わりありませんか。",
          labelEn: "It’s been far too long. How have you been?",
          reading: "たいへん ごぶさた して おります。おかわり ありません か。",
          correct: false,
          feedbackWrong:
            "❌ Too stiff for a casual hallway “how’s it going?”",
        },
      ],
    },
    {
      id: "name",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      promptJa: "私、はるか。よろしくね。",
      promptReading: "わたし、 はるか。よろしく ね。",
      promptEn: "I’m Haruka. Nice to meet you.",
      skillHint: "conversation",
      choices: [
        {
          id: "a",
          labelJa: "ああ、そう。じゃあね。",
          labelEn: "Oh, okay. See you.",
          correct: false,
          feedbackWrong:
            "❌ Too cold — she just introduced herself and said よろしく.",
        },
        {
          id: "b",
          labelJa: "はるかさんのお仕事は何ですか。",
          labelEn: "What do you do for work, Haruka?",
          reading: "はるか さん の おしごと は なん です か。",
          correct: false,
          feedbackWrong:
            "❌ Wrong question answered — reply to her greeting first.",
        },
        {
          id: "c",
          labelJa: "こちらこそ、よろしくお願いします。",
          labelEn: "Nice to meet you too.",
          reading: "こちら こそ、 よろしく おねがい します。",
          correct: true,
          feedbackCorrect:
            "✅ Polite-but-warm reply. Fine even if Haruka is casual.",
        },
      ],
    },
    {
      id: "when-moved",
      kind: "dialogue",
      objectiveType: "grammar",
      npcId: "haruka",
      promptJa: "いつ引っ越してきたんですか？",
      promptReading: "いつ ひっこして きたん です か？",
      promptEn: "When did you move in?",
      skillHint: "grammar",
      helpHint: "〜てきた + んですか = casual/explanatory question.",
      choices: [
        {
          id: "a",
          labelJa: "昨日引っ越してきたばかりなんです。",
          labelEn: "I just moved in yesterday.",
          reading: "きのう ひっこして きた ばかり なん です。",
          correct: true,
          feedbackCorrect:
            "✅ 「ばかり」+「んです」sounds natural for a recent move.",
        },
        {
          id: "b",
          labelJa: "来週引っ越す予定なんです。",
          labelEn: "I’m planning to move next week.",
          reading: "らいしゅう ひっこす よてい なん です。",
          correct: false,
          feedbackWrong:
            "❌ Timing — she asked about a completed move, not a future one.",
        },
        {
          id: "c",
          labelJa: "大阪から来ました。",
          labelEn: "I came from Osaka.",
          reading: "おおさか から きました。",
          correct: false,
          feedbackWrong:
            "❌ That answers “where from,” not “when did you move.”",
        },
      ],
    },
    {
      id: "from-where",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      promptJa: "どちらから来たの？",
      promptReading: "どちら から きた の？",
      promptEn: "Where did you come from? (casual)",
      skillHint: "conversation",
      choices: [
        {
          id: "a",
          labelJa: "昨日引っ越してきたばかりなんです。",
          labelEn: "I just moved in yesterday.",
          reading: "きのう ひっこして きた ばかり なん です。",
          correct: false,
          feedbackWrong:
            "❌ That’s when you moved — she asked where you came from.",
        },
        {
          id: "b",
          labelJa: "こちら方面から参りました。",
          labelEn: "I came from this direction.",
          reading: "こちら ほうめん から まいりました。",
          correct: false,
          feedbackWrong:
            "❌ Vague and stiff — she wants a hometown/place, not “this direction.”",
        },
        {
          id: "c",
          labelJa: "大阪から来ました。",
          labelEn: "I came from Osaka.",
          reading: "おおさか から きました。",
          correct: true,
          feedbackCorrect: "✅ Simple, natural answer. Polite form is fine.",
        },
      ],
    },
    {
      id: "casual-vs-polite",
      kind: "dialogue",
      objectiveType: "grammar",
      npcId: "haruka",
      promptJa: "この辺、まだよく分かんないでしょ？",
      promptReading: "この へん、 まだ よく わかんない でしょ？",
      promptEn: "You still don’t know this area well, right? (casual)",
      skillHint: "conversation",
      helpHint: "分かんない = casual spoken form of 分からない.",
      choices: [
        {
          id: "a",
          labelJa: "いえ、もうこの辺は全部知っています。",
          labelEn: "No, I already know this whole area.",
          reading: "いえ、 もう この へん は ぜんぶ しって います。",
          correct: false,
          feedbackWrong:
            "❌ Wrong detail — you just moved; agreeing you’re still new fits better.",
        },
        {
          id: "b",
          labelJa: "うん、まだ全然で…。",
          labelEn: "Yeah, not at all yet…",
          reading: "うん、 まだ ぜんぜん で…。",
          correct: true,
          feedbackCorrect:
            "✅ Matching her casual tone a bit is natural between neighbors.",
        },
        {
          id: "c",
          labelJa: "はい、全く存じ上げません。ご案内お願い申し上げます。",
          labelEn: "Yes, I know nothing at all. Please show me around.",
          reading:
            "はい、 まったく ぞんじあげません。ごあんない おねがい もうしあげます。",
          correct: false,
          feedbackWrong:
            "❌ Far too formal for her casual 「分かんないでしょ？」",
        },
      ],
    },
    {
      id: "natural-choice",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "haruka",
      promptJa: "困ったことがあったら言ってね。",
      promptReading: "こまった こと が あったら いって ね。",
      promptEn: "Tell me if anything comes up.",
      skillHint: "politeness",
      choices: [
        {
          id: "a",
          labelJa: "ありがとう。助かります。",
          labelEn: "Thanks. That helps.",
          reading: "ありがとう。たすかります。",
          correct: true,
          feedbackCorrect: "✅ Warm and natural.",
        },
        {
          id: "b",
          labelJa: "ありがとうございません。",
          labelEn: "Thank you not.",
          correct: false,
          feedbackWrong: "❌ Wrong polarity — that flips thanks into the opposite.",
        },
        {
          id: "c",
          labelJa: "承知いたしました。何かあればご連絡いたします。",
          labelEn: "Understood. I’ll contact you if anything comes up.",
          reading: "しょうち いたしました。なにか あれば ごれんらく いたします。",
          correct: false,
          feedbackWrong:
            "❌ Business-register reply — too stiff for a neighbor’s kindness.",
        },
      ],
    },
    {
      id: "cafe-foreshadow",
      kind: "dialogue",
      objectiveType: "listening",
      npcId: "haruka",
      promptJa: "駅の近くにいいカフェがあるよ。今度行ってみたら？",
      promptReading: "えき の ちかく に いい カフェ が ある よ。こんど いって みたら？",
      promptEn: "What is Haruka suggesting?",
      skillHint: "listening",
      choices: [
        {
          id: "a",
          labelJa: "今すぐ荷物を一緒に運べと言っている。",
          labelEn: "She’s saying to help carry your bags right now.",
          reading: "いま すぐ にもつ を いっしょ に はこべ と いって いる。",
          correct: false,
          feedbackWrong:
            "❌ Wrong offer — she’s recommending a place to visit later, not helping unpack.",
        },
        {
          id: "b",
          labelJa: "駅の近くにいいスーパーがあると言っている。",
          labelEn: "She’s saying there’s a good supermarket near the station.",
          reading: "えき の ちかく に いい スーパー が ある と いって いる。",
          correct: false,
          feedbackWrong:
            "❌ Close, but she said カフェ, not スーパー.",
        },
        {
          id: "c",
          labelJa: "駅近くのカフェに行ってみたらどうかと勧めている。",
          labelEn: "She’s suggesting you try a café near the station.",
          reading: "えき ちかく の カフェ に いって みたら どう か と すすめて いる。",
          correct: true,
          feedbackCorrect: "✅ Foreshadowing Café Kotonoha.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      npcId: "haruka",
      promptJa: "じゃ、またね。何かあったらノックして。",
      promptReading: "じゃ、 また ね。なにか あったら ノック して。",
      promptEn: "See you around. Knock if you need anything.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 150,
    replayXp: 15,
    skillRewards: { conversation: 4, politeness: 2, grammar: 2 },
    replaySkillRewards: { conversation: 1 },
    unlockLocationIds: ["train-station"],
    unlockQuestIds: ["station-master"],
    nextQuestTeaser: {
      id: "station-master",
      title: "Navigate the Train Station",
      japaneseTitle: "駅を攻略せよ",
    },
  },
  unlocks: {
    locationIds: ["train-station"],
    questIds: ["station-master"],
  },
};
