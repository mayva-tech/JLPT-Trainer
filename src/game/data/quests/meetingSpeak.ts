import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 · Speaking in a Meeting
 * 会議で意見を言う — soft disagreement at N2 business register.
 *
 * Target patterns: そうですね / おっしゃる通り / 確かにそうですが一点気になる /
 * 〜かと思います / 確認ですが〜という理解で — avoid blunt それは違います.
 */
export const MEETING_SPEAK_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  nodes: [
    {
      id: "arrive",
      japanese: "午後の定例会議です。意見を求められます。",
      english:
        "Afternoon stand-up meeting.\n\nAcknowledge → hedge → soft concern → tentative suggestion. Blunt contradiction is the trap.",
      nextNodeId: "open",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "open",
      npcId: "suzuki-manager",
      japanese:
        "では議題に入ります。来週の納品スケジュールについて、意見があればお願いします。",
      reading:
        "では ぎだい に はいります らいしゅう の のうひん スケジュール に ついて いけん が あれば おねがい します",
      english:
        "Let's begin. Any thoughts on next week's delivery schedule?",
      objectiveType: "listening",
      socialContext: "boss",
      register: "business",
      listenOnly: true,
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      nextNodeId: "sato-pitch",
    },
    {
      id: "sato-pitch",
      npcId: "sato-senpai",
      japanese:
        "私は前倒しで一気に仕上げるのがいいと思います。リスクは低いでしょう。",
      reading:
        "わたし は まえだおし で いっき に しあげる の が いい と おもいます リスク は ひくい でしょう",
      english:
        "I think we should finish it early in one push. The risk should be low.",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "business",
      helpHint: "Start with aizuchi — そうですね / おっしゃる通り — before any pushback.",
      vocabHint: "おっしゃる通り",
      speech: { autoPlay: true },
      choices: [
        {
          id: "aizuchi-ossharu",
          japanese: "おっしゃる通りだと思います。",
          reading: "おっしゃる とおり だ と おもいます",
          english: "I think that's exactly right.",
          quality: "excellent",
          nextNodeId: "mika-agree",
          relationshipDelta: 2,
          feedback:
            "🌟 おっしゃる通り\n\nRespectful acknowledgment before you add nuance.",
          vocabHint: "おっしゃる通り",
        },
        {
          id: "aizuchi-soudesu",
          japanese: "そうですね。方向性は理解できます。",
          reading: "そう です ね ほうこうせい は りかい できます",
          english: "Right. I understand the direction.",
          quality: "natural",
          nextNodeId: "mika-agree",
          relationshipDelta: 1,
          feedback: "✓ そうですね — classic meeting aizuchi.",
          vocabHint: "そうですね",
        },
        {
          id: "blunt",
          japanese: "それは違います。",
          reading: "それ は ちがいます",
          english: "That's wrong.",
          quality: "awkward",
          nextNodeId: "blunt-react",
          relationshipDelta: -1,
          confidenceDelta: -1,
          feedback:
            "△ Blunt\n\n「それは違います」shuts people down in Japanese meetings.",
        },
        {
          id: "silent",
          japanese: "…特にありません。",
          reading: "とくに ありません",
          english: "…Nothing in particular.",
          quality: "incorrect",
          nextNodeId: "prompt-opinion",
          confidenceDelta: -1,
          feedback: "✕ You need to raise the concern — staying silent fails the beat.",
        },
      ],
    },
    {
      id: "blunt-react",
      npcId: "sato-senpai",
      japanese: "…どこが違うんでしょう。",
      reading: "どこ が ちがう ん でしょう",
      english: "…Which part is wrong?",
      objectiveType: "repair",
      socialContext: "senpai",
      register: "business",
      countsTowardSocialFit: false,
      speech: { autoPlay: true },
      choices: [
        {
          id: "soften",
          japanese:
            "言い方がよくありませんでした。おっしゃる通りですが、一点だけ気になる点がございます。",
          reading:
            "いいかた が よく ありません でした おっしゃる とおり です が いってん だけ き に なる てん が ございます",
          english:
            "That came out poorly. You're right, but there's one point that concerns me.",
          quality: "excellent",
          nextNodeId: "concern",
          isRepair: true,
          relationshipDelta: 1,
          feedback: "🌟 Softened into acknowledgment + hedge.",
        },
      ],
    },
    {
      id: "prompt-opinion",
      npcId: "suzuki-manager",
      japanese: "新しい視点も聞きたいです。率直にどうぞ。",
      reading: "あたらしい してん も ききたい です そっちょく に どうぞ",
      english: "I'd like another perspective. Please speak candidly.",
      nextNodeId: "mika-agree",
      speech: { autoPlay: true },
    },
    {
      id: "mika-agree",
      npcId: "mika-coworker",
      japanese:
        "私も前倒し賛成です。確認ですが、来週金曜納品という理解で合っていますか。",
      reading:
        "わたし も まえだおし さんせい です かくにん です が らいしゅう きんよう のうひん と いう りかい で あっています か",
      english:
        "I also support finishing early. Just to confirm — delivery next Friday, is that right?",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "business",
      helpHint:
        "Mirror Mika's confirm pattern, or pivot to your soft concern.",
      vocabHint: "確認ですが〜という理解で",
      speech: { autoPlay: true },
      setsFacts: {
        deliveryDay: "金曜",
      },
      factLabels: {
        deliveryDay: "Delivery day",
      },
      choices: [
        {
          id: "confirm-echo",
          japanese:
            "確認ですが、来週金曜までに完成という理解でよろしいでしょうか。",
          reading:
            "かくにん です が らいしゅう きんよう まで に かんせい と いう りかい で よろしい でしょう か",
          english:
            "Just to confirm — completing by next Friday is the correct understanding?",
          quality: "excellent",
          nextNodeId: "concern-prompt",
          relationshipDelta: 1,
          feedback:
            "🌟 確認ですが〜という理解で\n\nLocks shared understanding before disagreeing.",
          vocabHint: "〜という理解で",
          checksFact: "deliveryDay",
          expectedFactValue: "金曜",
        },
        {
          id: "pivot-concern",
          japanese: "確かにそうですが、一点気になることがありまして…",
          reading: "たしかに そう です が いってん き に なる こと が ありまして",
          english: "That's true, but there's one point that concerns me…",
          quality: "natural",
          nextNodeId: "concern",
          relationshipDelta: 1,
          feedback: "✓ 確かにそうですが一点気になる — soft disagreement opener.",
          vocabHint: "確かにそうですが",
        },
        {
          id: "blunt-again",
          japanese: "金曜は無理です。",
          reading: "きんよう は むり です",
          english: "Friday is impossible.",
          quality: "awkward",
          nextNodeId: "concern",
          feedback: "△ Absolute rejection — hedge first in meetings.",
        },
      ],
    },
    {
      id: "concern-prompt",
      npcId: "sato-senpai",
      japanese: "はい、金曜納品の想定です。何かありますか。",
      reading: "はい きんよう のうひん の そうてい です なにか あります か",
      english: "Yes — Friday delivery is the plan. Anything on your mind?",
      nextNodeId: "concern",
      speech: { autoPlay: true },
    },
    {
      id: "concern",
      npcId: "suzuki-manager",
      japanese: "気になる点があれば、遠慮なく。",
      reading: "き に なる てん が あれば えんりょ なく",
      english: "If something concerns you, please speak up.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint:
        "確かにそうですが一点… then a tentative 〜かと思います suggestion.",
      vocabHint: "〜かと思います",
      speech: { autoPlay: true },
      choices: [
        {
          id: "hedge-concern",
          japanese:
            "確かにそうですが、一点気になるのは品質確認の時間が足りない点です。",
          reading:
            "たしかに そう です が いってん き に なる の は ひんしつ かくにん の じかん が たりない てん です",
          english:
            "That's true, but one concern is that there isn't enough time for quality checks.",
          quality: "excellent",
          nextNodeId: "suggest",
          relationshipDelta: 2,
          feedback:
            "🌟 Soft disagree\n\nAcknowledge + 一点気になる + specific risk.",
          vocabHint: "一点気になる",
        },
        {
          id: "direct-risk",
          japanese: "品質が落ちる可能性があります。",
          reading: "ひんしつ が おちる かのうせい が あります",
          english: "Quality might drop.",
          quality: "acceptable",
          nextNodeId: "suggest",
          feedback: "✓ Clear, but colder — pair with acknowledgment next time.",
        },
        {
          id: "wrong-register",
          japanese: "それ、やばくない？",
          reading: "それ やばく ない",
          english: "Isn't that kinda sketchy?",
          quality: "incorrect",
          nextNodeId: "suggest",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Casual slang — wrong register for a business meeting.",
        },
      ],
    },
    {
      id: "suggest",
      npcId: "mika-coworker",
      japanese: "なるほど。代案はありますか。",
      reading: "なるほど だいあん は あります か",
      english: "I see. Do you have an alternative?",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "business",
      helpHint: "Offer a tentative alternative with 〜かと思います.",
      vocabHint: "〜かと思います",
      speech: { autoPlay: true },
      choices: [
        {
          id: "tentative",
          japanese:
            "段階的に進めて、水曜時点で一度確認する形が安全かと思います。",
          reading:
            "だんかいてき に すすめて すいよう じてん で いちど かくにん する かたち が あんぜん か と おもいます",
          english:
            "I think a phased approach with a Wednesday checkpoint might be safer.",
          quality: "excellent",
          nextNodeId: "manager-weigh",
          relationshipDelta: 2,
          feedback:
            "🌟 〜かと思います\n\nTentative suggestion — N2 meeting gold.",
          vocabHint: "〜かと思います",
        },
        {
          id: "soft-alt",
          japanese: "少し余裕を見たスケジュールも考えられると思います。",
          reading:
            "すこし よゆう を みた スケジュール も かんがえられる と おもいます",
          english: "I think a schedule with a bit more buffer could also work.",
          quality: "natural",
          nextNodeId: "manager-weigh",
          relationshipDelta: 1,
          feedback: "✓ Soft alternative with 〜と思います.",
        },
        {
          id: "order",
          japanese: "私の案で進めてください。",
          reading: "わたし の あん で すすめて ください",
          english: "Please proceed with my plan.",
          quality: "awkward",
          nextNodeId: "manager-weigh",
          relationshipDelta: -1,
          feedback: "△ Sounds like an order — meetings prefer proposals.",
        },
      ],
    },
    {
      id: "manager-weigh",
      npcId: "suzuki-manager",
      japanese:
        "段階確認、検討に値しますね。佐藤さんの前倒し案と合わせて調整しましょう。",
      reading:
        "だんかい かくにん けんとう に あたい します ね さとうさん の まえだおしあん と あわせて ちょうせい しましょう",
      english:
        "A staged check is worth considering. Let's adjust alongside Sato's early-finish idea.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Close collaboratively — おっしゃる通り / 承知しました.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "align",
          japanese: "おっしゃる通りです。調整案をまとめます。",
          reading: "おっしゃる とおり です ちょうせいあん を まとめます",
          english: "You're right. I'll put together an adjusted plan.",
          quality: "excellent",
          nextNodeId: "close-sato",
          reportingTags: ["action-stated", "clear"],
          relationshipDelta: 2,
          feedback: "🌟 Align + own the next action.",
          vocabHint: "おっしゃる通り",
        },
        {
          id: "ack",
          japanese: "承知しました。",
          reading: "しょうち しました",
          english: "Understood.",
          quality: "natural",
          nextNodeId: "close-sato",
          relationshipDelta: 1,
          feedback: "✓ Clean business acknowledgment.",
        },
        {
          id: "smug",
          japanese: "最初からそうすべきでした。",
          reading: "さいしょ から そう すべき でした",
          english: "That's what we should have done from the start.",
          quality: "awkward",
          nextNodeId: "close-sato",
          relationshipDelta: -1,
          feedback: "△ Undermines Sato — win the point, not the person.",
        },
      ],
    },
    {
      id: "close-sato",
      npcId: "sato-senpai",
      japanese: "いい指摘でした。一緒に詰めましょう。",
      reading: "いい してき でした いっしょ に つめましょう",
      english: "Good point. Let's tighten it up together.",
      nextNodeId: "success",
      speech: { autoPlay: true },
    },
    {
      id: "success",
      npcId: "mika-coworker",
      japanese: "会議でちゃんと意見言えたね。次もよろしく！",
      reading: "かいぎ で ちゃんと いけん いえた ね つぎ も よろしく",
      english: "You spoke up properly in the meeting. Looking forward to next time!",
      endState: "success",
      speech: { autoPlay: true },
    },
  ],
};

export const MEETING_SPEAK_QUEST: QuestDefinition = {
  id: "meeting-speak",
  title: "Speaking in a Meeting",
  japaneseTitle: "会議で意見を言う",
  locationId: "office",
  chapter: 4,
  description:
    "Practice N2-level meeting Japanese: acknowledge with そうですね / おっしゃる通り, soft-disagree with 確かにそうですが一点…, suggest with 〜かと思います, and confirm with 確認ですが〜という理解で. Avoid blunt それは違います.",
  difficulty: "hard",
  recommendedLevel: 8,
  startingConfidence: 5,
  requiresQuestIds: ["report-mistake"],
  icon: "🗣️",
  meetNpcIds: ["sato-senpai", "suzuki-manager", "mika-coworker"],
  objectives: [
    { id: "aizuchi", label: "Acknowledge with meeting aizuchi" },
    { id: "confirm", label: "Confirm shared understanding" },
    { id: "hedge", label: "Raise a soft concern" },
    { id: "suggest", label: "Offer a tentative alternative" },
  ],
  conversation: MEETING_SPEAK_CONVERSATION,
  steps: [],
  rewards: {
    xp: 220,
    replayXp: 28,
    skillRewards: {
      conversation: 4,
      politeness: 3,
      grammar: 3,
      vocabulary: 2,
    },
    coins: 55,
    unlockQuestIds: ["workday-survival"],
    nextQuestTeaser: {
      id: "workday-survival",
      title: "Workday Survival",
      japaneseTitle: "一日仕事サバイバル",
    },
    relationshipNpcIds: [
      "sato-senpai",
      "suzuki-manager",
      "mika-coworker",
    ],
  },
  unlocks: {
    questIds: ["workday-survival"],
  },
};
