import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 5 · Train Announcement Challenge
 * 電車のアナウンス — compressed formal station announcements at native speed.
 *
 * Lock platform, destination, train type, and transfer details from fast-formal
 * PA speech; recall under pressure and repair with slow replay when needed.
 */
export const TRAIN_ANNOUNCEMENT_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  resultSummaryTitle: "PLATFORM BRIEF",
  nodes: [
    {
      id: "arrive",
      japanese: "ことば駅のホーム。アナウンスは速く、きちんとした敬語です。",
      reading: "ことばえき の ホーム アナウンス は はやく きちん と した けいご です",
      english:
        "Kotoba Station platform.\n\nAnnouncements are fast and formally worded — lock platform, destination, train type, and any changes.",
      nextNodeId: "platform-wait",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "platform-wait",
      japanese: "東京行きの電車を待っています。スピーカーが鳴ります…",
      reading: "とうきょうゆき の でんしゃ を まって います スピーカー が なります",
      english: "You're waiting for a train to Tokyo. The speakers crackle…",
      nextNodeId: "announce-1",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "announce-1",
      japanese:
        "まもなく3番線に、快速東京行きが参ります。番線の黄色い線の内側までお下がりください。",
      reading:
        "まもなく さんばんせん に かいそく とうきょうゆき が まいります ばんせん の きいろい せん の うちがわ まで おさがり ください",
      english:
        "A rapid service train bound for Tokyo will soon arrive on track 3. Please stand behind the yellow line.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      speechRate: "fast",
      spokenFeature: "fast-formal",
      socialContext: "stranger",
      register: "formal",
      helpHint:
        "Lock: 3番線 / 快速 / 東京行き. 参ります = arrives (formal PA wording).",
      vocabHint: "快速",
      setsFacts: {
        platform: "3",
        destination: "東京",
        trainType: "快速",
      },
      factLabels: {
        platform: "Platform",
        destination: "Destination",
        trainType: "Train type",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      choices: [
        {
          id: "a1-ex",
          japanese: "3番線、快速の東京行きですね。",
          reading: "さんばんせん かいそく の とうきょうゆき です ね",
          english: "Track 3 — rapid service to Tokyo.",
          quality: "excellent",
          nextNodeId: "announce-change",
          feedback:
            "🌟 Platform, train type, and destination locked.",
          checksFact: "platform",
          expectedFactValue: "3",
        },
        {
          id: "a1-nat",
          japanese: "東京行きの快速が来るんですね。",
          reading: "とうきょうゆき の かいそく が くる ん です ね",
          english: "The rapid to Tokyo is coming.",
          quality: "natural",
          nextNodeId: "announce-change",
          feedback: "✓ Destination and train type — platform was 3番線.",
        },
        {
          id: "a1-wrong",
          japanese: "2番線の各駅停車ですね。",
          reading: "にばんせん の かくえきていしゃ です ね",
          english: "Local train on track 2.",
          quality: "incorrect",
          nextNodeId: "announce-change",
          feedback: "✕ Wrong platform and train type — it was 快速 on 3番線.",
          communicationDelta: -8,
          checksFact: "trainType",
          expectedFactValue: "各駅停車",
        },
      ],
    },
    {
      id: "announce-change",
      japanese:
        "お客様にお知らせいたします。本日に限り、快速東京行きは4番線からの発車となります。",
      reading:
        "おきゃくさま に おしらせ いたします ほんじつ に かぎり かいそく とうきょうゆき は よんばんせん から の はっしゃ と なります",
      english:
        "Attention passengers: today only, the rapid service to Tokyo will depart from track 4.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      speechRate: "fast",
      spokenFeature: "fast-formal",
      socialContext: "stranger",
      register: "formal",
      helpHint:
        "本日に限り = today only. Platform changes 3 → 4.",
      vocabHint: "本日に限り",
      setsFacts: {
        platform: "4",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      choices: [
        {
          id: "ac-ex",
          japanese: "今日は4番線からですね。",
          reading: "きょう は よんばんせん から です ね",
          english: "Today it's from track 4.",
          quality: "excellent",
          nextNodeId: "recall-change",
          feedback: "🌟 Caught the platform change — 本日に限り.",
          checksFact: "platform",
          expectedFactValue: "4",
        },
        {
          id: "ac-nat",
          japanese: "4番線に移動します。",
          reading: "よんばんせん に いどう します",
          english: "I'll move to track 4.",
          quality: "natural",
          nextNodeId: "recall-change",
          feedback: "✓ Right action — today's departure is 4番線.",
        },
        {
          id: "ac-wrong",
          japanese: "3番線のままで大丈夫ですね。",
          reading: "さんばんせん の まま で だいじょうぶ です ね",
          english: "Track 3 is still fine.",
          quality: "incorrect",
          nextNodeId: "recall-change",
          feedback: "✕ Platform moved — 本日に限り、4番線です.",
          communicationDelta: -8,
          checksFact: "platform",
          expectedFactValue: "3",
        },
      ],
    },
    {
      id: "recall-change",
      japanese: "4番線へ向かいます。もう一度アナウンスが流れます…",
      reading: "よんばんせん へ むかいます もう いちど アナウンス が ながれます",
      english: "You head toward track 4. Another announcement plays…",
      nextNodeId: "announce-delay",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "announce-delay",
      japanese:
        "ただいま、快速東京行きは神田駅で十分公司の遅れが出ております。新宿駅で山手線東京方面へお乗り換えください。",
      reading:
        "ただいま かいそく とうきょうゆき は かんだえき で じっぷん かい の おくれ が でて おります しんじゅくえき で やまのてせん とうきょうほうめん へ おのりかえ ください",
      english:
        "The rapid service to Tokyo is currently running about ten minutes late at Kanda Station. Please transfer at Shinjuku to the Yamanote Line toward Tokyo.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      speechRate: "natural",
      spokenFeature: "fast-formal",
      socialContext: "stranger",
      register: "formal",
      helpHint:
        "Lock: 10分遅れ / 新宿で乗り換え / 山手線東京方面.",
      vocabHint: "お乗り換え",
      setsFacts: {
        delay: "10分",
        time: "10分遅れ",
        transferStation: "新宿",
        transferLine: "山手線",
      },
      factLabels: {
        delay: "Delay",
        time: "Delay time",
        transferStation: "Transfer at",
        transferLine: "Transfer line",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      choices: [
        {
          id: "ad-ex",
          japanese: "十分遅れ。新宿で山手線に乗り換えですね。",
          reading: "じっぷん おくれ しんじゅく で やまのてせん に のりかえ です ね",
          english: "Ten minutes late — transfer to the Yamanote at Shinjuku.",
          quality: "excellent",
          nextNodeId: "recall-delay",
          feedback: "🌟 Delay + transfer point locked.",
          checksFact: "transferStation",
          expectedFactValue: "新宿",
        },
        {
          id: "ad-nat",
          japanese: "新宿で山手線ですね。",
          reading: "しんじゅく で やまのてせん です ね",
          english: "Yamanote at Shinjuku.",
          quality: "natural",
          nextNodeId: "recall-delay",
          feedback: "✓ Transfer station and line — delay was 10分.",
        },
        {
          id: "ad-awk",
          japanese: "遅れているので、ここで待ちます。",
          reading: "おくれて いる ので ここ で まちます",
          english: "It's delayed, so I'll wait here.",
          quality: "awkward",
          nextNodeId: "recall-delay",
          feedback:
            "△ Delay noted — but they said to transfer at 新宿 on 山手線.",
          communicationDelta: -3,
        },
      ],
    },
    {
      id: "recall-delay",
      japanese: "遅延と乗り換え、覚えていますか？",
      reading: "ちえん と のりかえ おぼえて います か",
      english: "Do you have the delay and transfer details?",
      objectiveType: "listening",
      socialContext: "stranger",
      register: "formal",
      helpHint:
        "Recall: 10分遅れ / 新宿 / 山手線東京方面 — or ask for slow replay.",
      speech: { autoPlay: true, language: "en" },
      choices: [
        {
          id: "rd-ex",
          japanese:
            "神田で十分遅れ。新宿で山手線東京方面に乗り換えです。",
          reading:
            "かんだ で じっぷん おくれ しんじゅく で やまのてせん とうきょうほうめん に のりかえ です",
          english:
            "Ten minutes late at Kanda — transfer to Yamanote toward Tokyo at Shinjuku.",
          quality: "excellent",
          nextNodeId: "staff-help",
          feedback: "🌟 Full recall — delay, station, and line.",
          checksFact: "transferLine",
          expectedFactValue: "山手線",
        },
        {
          id: "rd-nat",
          japanese: "新宿で山手線に乗り換えれば東京方面ですね。",
          reading: "しんじゅく で やまのてせん に のりかえれば とうきょうほうめん です ね",
          english: "Transfer to Yamanote at Shinjuku for Tokyo.",
          quality: "natural",
          nextNodeId: "staff-help",
          feedback: "✓ Transfer path clear.",
          checksFact: "transferStation",
          expectedFactValue: "新宿",
        },
        {
          id: "rd-slow",
          japanese: "すみません、もう少しゆっくりお願いできますか。",
          reading: "すみません もう すこし ゆっくり おねがい できます か",
          english: "Sorry — could you say that a bit more slowly?",
          quality: "acceptable",
          nextNodeId: "announce-delay-slow",
          isRepair: true,
          repairKind: "slow",
          communicationDelta: 3,
          feedback: "✓ Repair — slow replay of the delay announcement.",
        },
        {
          id: "rd-wrong",
          japanese: "渋谷で中央線に乗り換えですね。",
          reading: "しぶや で ちゅうおうせん に のりかえ です ね",
          english: "Transfer to the Chuo Line at Shibuya.",
          quality: "incorrect",
          nextNodeId: "staff-help",
          feedback: "✕ Wrong station and line — it was 新宿 / 山手線.",
          communicationDelta: -8,
          checksFact: "transferStation",
          expectedFactValue: "渋谷",
        },
      ],
    },
    {
      id: "announce-delay-slow",
      japanese:
        "はい。快速東京行きは…神田駅で…十分公司の遅れが…出ております。新宿駅で…山手線…東京方面へ…お乗り換えください。",
      reading:
        "はい かいそく とうきょうゆき は かんだえき で じっぷん かい の おくれ が でて おります しんじゅくえき で やまのてせん とうきょうほうめん へ おのりかえ ください",
      english:
        "Yes. The rapid to Tokyo is… about ten minutes late at Kanda… Please transfer at Shinjuku… to the Yamanote Line… toward Tokyo.",
      objectiveType: "listening",
      audioFirst: true,
      listenOnly: true,
      forceSlowSpeech: true,
      socialContext: "stranger",
      register: "formal",
      spokenFeature: "fast-formal",
      helpHint: "Slow replay — 10分 / 新宿 / 山手線東京方面.",
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      nextNodeId: "staff-help",
    },
    {
      id: "staff-help",
      npcId: "yamamoto-station",
      japanese: "お待たせしました。快速東京行きは本日4番線です。何かお困りですか？",
      reading:
        "おまたせ しました かいそく とうきょうゆき は ほんじつ よんばんせん です なにか おこまり です か",
      english:
        "Sorry for the wait. Today's rapid to Tokyo is on track 4. Need any help?",
      objectiveType: "social-choice",
      socialContext: "stranger",
      register: "polite",
      helpHint:
        "Confirm: 4番線 / 快速 / 東京 — staff register is polite, not PA formal.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "sh-ex",
          japanese:
            "4番線の快速東京行きですね。新宿で山手線に乗り換えと伺いました。",
          reading:
            "よんばんせん の かいそく とうきょうゆき です ね しんじゅく で やまのてせん に のりかえ と うかがい ました",
          english:
            "Rapid to Tokyo on track 4 — I heard transfer to Yamanote at Shinjuku.",
          quality: "excellent",
          nextNodeId: "board-check",
          relationshipDelta: 1,
          feedback: "🌟 Staff confirm + your recall — platform and transfer match.",
          checksFact: "platform",
          expectedFactValue: "4",
        },
        {
          id: "sh-nat",
          japanese: "4番線で大丈夫です。ありがとうございます。",
          reading: "よんばんせん で だいじょうぶ です ありがとう ございます",
          english: "Track 4 is fine. Thank you.",
          quality: "natural",
          nextNodeId: "board-check",
          feedback: "✓ Polite confirm — transfer details still yours to track.",
        },
        {
          id: "sh-awk",
          japanese: "電車をください。",
          reading: "でんしゃ を ください",
          english: "Give me a train, please.",
          quality: "awkward",
          nextNodeId: "board-check",
          feedback: "△ Unclear — staff asked if anything's wrong.",
          communicationDelta: -3,
        },
      ],
    },
    {
      id: "board-check",
      japanese: "4番線のホーム。黄色い線の内側まで下がって待ちます。",
      reading: "よんばんせん の ホーム きいろい せん の うちがわ まで さがって まちます",
      english:
        "Track 4 platform. You step behind the yellow line and wait.",
      nextNodeId: "final-recall",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "final-recall",
      japanese: "出発前に、覚えた情報を確認しましょう。",
      reading: "しゅっぱつまえ に おぼえた じょうほう を かくにん しましょう",
      english: "Before departure — lock in what you caught from the announcements.",
      objectiveType: "listening",
      socialContext: "stranger",
      register: "formal",
      helpHint:
        "Brief: 4番線 / 快速 / 東京 / 新宿で山手線 / 10分遅れ.",
      speech: { autoPlay: true, language: "en" },
      choices: [
        {
          id: "fr-ex",
          japanese:
            "4番線、快速東京行き。神田で十分遅れ、新宿で山手線東京方面。",
          reading:
            "よんばんせん かいそく とうきょうゆき かんだ で じっぷん おくれ しんじゅく で やまのてせん とうきょうほうめん",
          english:
            "Track 4, rapid to Tokyo. Ten minutes late at Kanda — Yamanote toward Tokyo at Shinjuku.",
          quality: "excellent",
          nextNodeId: "success",
          feedback: "🌟 Platform brief complete — every fact chained.",
          checksFact: "destination",
          expectedFactValue: "東京",
        },
        {
          id: "fr-nat",
          japanese: "4番線の快速。新宿で山手線に乗り換えです。",
          reading: "よんばんせん の かいそく しんじゅく で やまのてせん に のりかえ です",
          english: "Rapid on track 4 — transfer to Yamanote at Shinjuku.",
          quality: "natural",
          nextNodeId: "success",
          feedback: "✓ Core route clear — delay was 10分 at 神田.",
        },
        {
          id: "fr-wrong",
          japanese: "3番線の各駅停車、渋谷で乗り換え。",
          reading: "さんばんせん の かくえきていしゃ しぶや で のりかえ",
          english: "Local on track 3 — transfer at Shibuya.",
          quality: "incorrect",
          nextNodeId: "success",
          feedback:
            "✕ Stale facts — platform changed to 4, train is 快速, transfer is 新宿/山手線.",
          communicationDelta: -8,
        },
      ],
    },
    {
      id: "success",
      japanese:
        "アナウンス突破。番線変更・遅延・乗り換えを、速い敬語のまま聞き取れました。",
      reading:
        "アナウンス とっぱ ばんせん へんこう ちえん のりかえ を はやい けいご の まま ききとれました",
      english:
        "Announcement clear. You caught platform changes, delays, and transfer info at compressed formal speed.",
      endState: "success",
      speech: { autoPlay: true, language: "en" },
    },
  ],
};

export const TRAIN_ANNOUNCEMENT_QUEST: QuestDefinition = {
  id: "train-announcement",
  title: "Train Announcement Challenge",
  japaneseTitle: "電車のアナウンス",
  japaneseTitleReading: "でんしゃ の あなうんす",
  locationId: "train-station",
  chapter: 5,
  description:
    "Catch compressed formal station announcements: platform, destination, train type, last-minute platform changes, delays, and transfer instructions — with staff backup when needed.",
  difficulty: "normal",
  recommendedLevel: 10,
  startingConfidence: 5,
  requiresQuestIds: ["fast-convenience"],
  icon: "🚃",
  meetNpcIds: ["yamamoto-station"],
  objectives: [
    { id: "arrival", label: "Catch 快速東京行き on 3番線" },
    { id: "change", label: "Hear 本日に限り platform change to 4番線" },
    { id: "delay", label: "Lock delay and 新宿→山手線 transfer" },
    { id: "staff", label: "Confirm details with station staff" },
    { id: "brief", label: "Recall the full platform brief" },
  ],
  conversation: TRAIN_ANNOUNCEMENT_CONVERSATION,
  steps: [],
  rewards: {
    xp: 190,
    replayXp: 25,
    skillRewards: {
      listening: 5,
      vocabulary: 3,
      conversation: 2,
    },
    replaySkillRewards: {
      listening: 1,
      vocabulary: 1,
    },
    coins: 40,
    relationshipNpcIds: ["yamamoto-station"],
  },
  unlocks: {
    questIds: ["friend-real-meaning"],
  },
};
