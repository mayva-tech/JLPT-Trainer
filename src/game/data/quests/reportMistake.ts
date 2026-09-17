import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 · Report a Mistake
 * ミスを報告 — wrong attachment sent to a client; report with recovery, not excuses.
 */
export const REPORT_MISTAKE_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  resultSummaryTitle: "REPORT QUALITY",
  nodes: [
    {
      id: "arrive",
      japanese: "クライアントに送った添付ファイルが間違っていました。",
      english:
        "You sent the wrong attachment to a client.\n\nOwn it: state the issue, apologize, explain impact, say what you already fixed, then prevent a repeat.",
      nextNodeId: "realize",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "realize",
      npcId: "suzuki-manager",
      japanese: "吉田様から連絡がありましたが、何かありましたか。",
      reading: "よしださま から れんらく が ありました が なにか ありました か",
      english: "Yoshida-sama contacted us — did something happen?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint:
        "Lead with the conclusion. Hiding or excuse-first reports damage trust.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "own-it",
          japanese: "はい。添付ファイルを間違えて送ってしまいました。",
          reading: "はい てんぷ ファイル を まちがえて おくって しまいました",
          english: "Yes. I accidentally sent the wrong attachment.",
          quality: "excellent",
          nextNodeId: "apologize",
          reportingTags: ["conclusion-first", "clear"],
          relationshipDelta: 1,
          feedback:
            "🌟 Conclusion-first\n\nYou named the mistake immediately — classic 報告.",
          vocabHint: "添付ファイル",
        },
        {
          id: "vague",
          japanese: "少し問題がありまして…",
          reading: "すこし もんだい が ありまして",
          english: "There was a small problem…",
          quality: "acceptable",
          nextNodeId: "push-clear",
          reportingTags: ["too-much-detail"],
          feedback:
            "✓ Soft open, but vague\n\nBosses want the conclusion first: what went wrong.",
        },
        {
          id: "hide",
          japanese: "特に問題はないと思います。",
          reading: "とくに もんだい は ない と おもいます",
          english: "I don't think there's anything wrong.",
          quality: "incorrect",
          nextNodeId: "hide-pressure",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Hiding it\n\nThe client already called. Covering up makes it worse.",
        },
        {
          id: "excuse-spam",
          japanese:
            "昨日忙しくて、ファイル名が似ていて、確認する時間がなくて…",
          reading:
            "きのう いそがしくて ファイルめい が にていて かくにん する じかん が なくて",
          english:
            "I was busy yesterday, the filenames looked similar, I didn't have time to check…",
          quality: "awkward",
          nextNodeId: "push-clear",
          reportingTags: ["excuse-heavy"],
          relationshipDelta: -1,
          feedback:
            "△ Excuse-heavy\n\nReasons can come later. Start with what happened.",
        },
      ],
    },
    {
      id: "hide-pressure",
      npcId: "suzuki-manager",
      japanese:
        "吉田様は『別の資料が届いた』とおっしゃっています。正直に話してください。",
      reading:
        "よしださま は べつ の しりょう が とどいた と おっしゃっています しょうじき に はなして ください",
      english:
        "Yoshida-sama said a different document arrived. Please be honest.",
      objectiveType: "repair",
      socialContext: "boss",
      register: "business",
      countsTowardSocialFit: false,
      speech: { autoPlay: true },
      choices: [
        {
          id: "confess",
          japanese:
            "申し訳ありません。私が添付を間違えて送ってしまいました。",
          reading:
            "もうしわけ ありません わたし が てんぷ を まちがえて おくって しまいました",
          english: "I'm very sorry. I sent the wrong attachment.",
          quality: "excellent",
          nextNodeId: "apologize",
          isRepair: true,
          reportingTags: ["conclusion-first", "clear"],
          relationshipDelta: 1,
          feedback: "🌟 Owned it after pressure — still recoverable.",
        },
      ],
    },
    {
      id: "push-clear",
      npcId: "suzuki-manager",
      japanese: "結論からお願いします。何が起きましたか。",
      reading: "けつろん から おねがい します なに が おきました か",
      english: "Lead with the conclusion. What happened?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "結論から: name the mistake in one clear sentence.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "clear",
          japanese: "添付ファイルを間違えてクライアントに送ってしまいました。",
          reading:
            "てんぷ ファイル を まちがえて クライアント に おくって しまいました",
          english: "I sent the wrong attachment to the client.",
          quality: "excellent",
          nextNodeId: "apologize",
          reportingTags: ["conclusion-first", "clear"],
          relationshipDelta: 1,
          feedback: "🌟 Clear conclusion — now apologize properly.",
        },
        {
          id: "more-excuses",
          japanese: "忙しかったので仕方なかったと思います。",
          reading: "いそがしかった ので しかた なかった と おもいます",
          english: "I was busy, so it couldn't be helped.",
          quality: "incorrect",
          nextNodeId: "apologize-forced",
          reportingTags: ["excuse-heavy"],
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Excuse-spam\n\n「仕方なかった」sounds like you're not owning it.",
        },
      ],
    },
    {
      id: "apologize",
      npcId: "suzuki-manager",
      japanese: "そうですか。まず、どう対応しますか。",
      reading: "そう です か まず どう たいおう します か",
      english: "I see. First — how will you handle this?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "A sincere 申し訳ございません before diving into details.",
      vocabHint: "申し訳ございません",
      speech: { autoPlay: true },
      choices: [
        {
          id: "formal-sorry",
          japanese: "申し訳ございません。すぐに対応いたします。",
          reading: "もうしわけ ございません すぐ に たいおう いたします",
          english: "I'm deeply sorry. I'll handle it immediately.",
          quality: "excellent",
          nextNodeId: "impact",
          relationshipDelta: 2,
          feedback:
            "🌟 申し訳ございません\n\nBusiness-register apology + action intent.",
          vocabHint: "申し訳ございません",
        },
        {
          id: "casual-sorry",
          japanese: "すみませんでした。",
          reading: "すみません でした",
          english: "Sorry about that.",
          quality: "acceptable",
          nextNodeId: "impact",
          feedback:
            "✓ Understandable\n\n「すみません」works, but 申し訳ございません fits a client-impact mistake better.",
        },
        {
          id: "apology-only",
          japanese: "本当に申し訳ございません。もう二度としません。",
          reading: "ほんとう に もうしわけ ございません もう にどと しません",
          english: "I'm truly sorry. It will never happen again.",
          quality: "awkward",
          nextNodeId: "impact-nudge",
          feedback:
            "△ Apology-only\n\nSincere, but your boss needs impact + recovery steps, not just guilt.",
        },
        {
          id: "blame",
          japanese: "ファイル名が紛らわしかったのが原因です。",
          reading: "ファイルめい が まぎらわしかった の が げんいん です",
          english: "The confusing filename is the cause.",
          quality: "incorrect",
          nextNodeId: "impact-nudge",
          reportingTags: ["excuse-heavy"],
          relationshipDelta: -1,
          feedback: "✕ Sounds like blame-shifting. Own the send action.",
        },
      ],
    },
    {
      id: "apologize-forced",
      npcId: "suzuki-manager",
      japanese: "言い訳は結構です。まず謝罪と事実をはっきりさせてください。",
      reading:
        "いいわけ は けっこう です まず しゃざい と じじつ を はっきり させて ください",
      english: "No more excuses. Clarify the apology and the facts first.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      speech: { autoPlay: true },
      choices: [
        {
          id: "reset",
          japanese:
            "申し訳ございません。間違った添付を送ってしまいました。",
          reading:
            "もうしわけ ございません まちがった てんぷ を おくって しまいました",
          english: "I'm deeply sorry. I sent the wrong attachment.",
          quality: "excellent",
          nextNodeId: "impact",
          reportingTags: ["conclusion-first", "clear"],
          relationshipDelta: 1,
          feedback: "🌟 Reset with apology + fact.",
        },
      ],
    },
    {
      id: "impact-nudge",
      npcId: "suzuki-manager",
      japanese: "謝罪はわかりました。影響はどうなっていますか。",
      reading: "しゃざい は わかりました えいきょう は どう なっています か",
      english: "The apology is noted. What's the impact?",
      nextNodeId: "impact",
      speech: { autoPlay: true },
    },
    {
      id: "impact",
      npcId: "suzuki-manager",
      japanese: "クライアントへの影響を教えてください。",
      reading: "クライアント へ の えいきょう を おしえて ください",
      english: "Tell me the impact on the client.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "State impact calmly — what they received / what risk exists.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "impact-clear",
          japanese:
            "別案件の資料が届いており、先方が混乱されている状況です。",
          reading:
            "べつあんけん の しりょう が とどいて おり せんぽう が こんらん されて いる じょうきょう です",
          english:
            "They received materials from another project and are confused.",
          quality: "excellent",
          nextNodeId: "recovery",
          reportingTags: ["clear"],
          relationshipDelta: 1,
          feedback: "🌟 Clear impact without drama.",
          vocabHint: "先方",
        },
        {
          id: "impact-min",
          japanese: "大きな問題にはなっていないと思います。",
          reading: "おおきな もんだい に は なって いない と おもいます",
          english: "I don't think it's a big problem.",
          quality: "awkward",
          nextNodeId: "recovery",
          feedback:
            "△ Minimizing\n\nEven if recoverable, state the actual impact honestly.",
        },
        {
          id: "impact-panic",
          japanese: "大変なことになりました。どうしましょう…",
          reading: "たいへん な こと に なりました どう しましょう",
          english: "This is a disaster. What should we do…",
          quality: "acceptable",
          nextNodeId: "recovery",
          reportingTags: ["too-much-detail"],
          feedback:
            "✓ Emotion is human, but managers prefer facts + your next action.",
        },
      ],
    },
    {
      id: "recovery",
      npcId: "suzuki-manager",
      japanese: "すでに対応はしましたか。",
      reading: "すでに たいおう は しました か",
      english: "Have you already taken action?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Best reports include what you already fixed — e.g. 再送.",
      vocabHint: "再送",
      speech: { autoPlay: true },
      choices: [
        {
          id: "resent",
          japanese:
            "正しい資料を再送し、先方にも誤りをお詫びするメールを送りました。",
          reading:
            "ただしい しりょう を さいそう し せんぽう に も あやまり を おわび する メール を おくりました",
          english:
            "I resent the correct file and emailed an apology to the client.",
          quality: "excellent",
          nextNodeId: "prevention",
          reportingTags: ["action-stated", "clear"],
          relationshipDelta: 2,
          feedback:
            "🌟 Recovery stated\n\n再送 + apology mail — action already done.",
          vocabHint: "再送",
        },
        {
          id: "will-do",
          japanese: "これから正しいファイルを送ります。",
          reading: "これから ただしい ファイル を おくります",
          english: "I'll send the correct file now.",
          quality: "natural",
          nextNodeId: "prevention",
          reportingTags: ["action-stated"],
          relationshipDelta: 1,
          feedback: "✓ Good — stating next action. Even better if already resent.",
        },
        {
          id: "wait",
          japanese: "ご指示をいただけますか。",
          reading: "ごしじ を いただけます か",
          english: "Could I get your instructions?",
          quality: "awkward",
          nextNodeId: "prevention",
          feedback:
            "△ Passive\n\nFor a clear send-error, propose / report your fix; don't only wait.",
        },
        {
          id: "nothing",
          japanese: "まだ何もしていません。",
          reading: "まだ なにも して いません",
          english: "I haven't done anything yet.",
          quality: "incorrect",
          nextNodeId: "prevention",
          confidenceDelta: -1,
          feedback: "✕ No recovery step — bosses expect action with the report.",
        },
      ],
    },
    {
      id: "prevention",
      npcId: "suzuki-manager",
      japanese: "再発防止はどうしますか。短くで結構です。",
      reading: "さいはつ ぼうし は どう します か みじかく で けっこう です",
      english: "How will you prevent a repeat? Keep it short.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "A short checklist: verify filename, preview attachment, dual-check.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "checklist",
          japanese:
            "送信前にファイル名と宛先をチェックリストで確認します。",
          reading:
            "そうしんまえ に ファイルめい と あてさき を チェックリスト で かくにん します",
          english:
            "Before sending, I'll verify the filename and recipient with a checklist.",
          quality: "excellent",
          nextNodeId: "manager-ok",
          reportingTags: ["action-stated", "clear"],
          relationshipDelta: 2,
          feedback:
            "🌟 Prevention checklist\n\nConcrete, short, and future-facing.",
          vocabHint: "再発防止",
        },
        {
          id: "careful",
          japanese: "今後はもっと注意します。",
          reading: "こんご は もっと ちゅうい します",
          english: "I'll be more careful from now on.",
          quality: "acceptable",
          nextNodeId: "manager-ok",
          feedback:
            "✓ Common line, but weak\n\nPrefer a concrete check (filename / preview).",
        },
        {
          id: "never",
          japanese: "二度とミスはしません。",
          reading: "にどと ミス は しません",
          english: "I'll never make a mistake again.",
          quality: "awkward",
          nextNodeId: "manager-ok",
          feedback: "△ Absolute promise — process beats bravado.",
        },
      ],
    },
    {
      id: "manager-ok",
      npcId: "suzuki-manager",
      japanese:
        "わかりました。次からは結論・対応・防止をセットで報告してください。",
      reading:
        "わかりました つぎ から は けつろん たいおう ぼうし を セット で ほうこく して ください",
      english:
        "Understood. Next time, report conclusion, action, and prevention as a set.",
      nextNodeId: "success",
      speech: { autoPlay: true },
    },
    {
      id: "success",
      npcId: "suzuki-manager",
      japanese: "報告、お疲れ様でした。信頼は正直さから始まります。",
      reading:
        "ほうこく おつかれさま でした しんらい は しょうじき さ から はじまります",
      english: "Good report. Trust starts with honesty.",
      endState: "success",
      speech: { autoPlay: true },
    },
  ],
};

export const REPORT_MISTAKE_QUEST: QuestDefinition = {
  id: "report-mistake",
  title: "Reporting a Mistake",
  japaneseTitle: "ミスを報告",
  locationId: "office",
  chapter: 4,
  description:
    "You sent the wrong file to a client. Report to your manager with clarity and recovery — not hiding, excuse-spam, or apology-only.",
  difficulty: "hard",
  recommendedLevel: 7,
  startingConfidence: 5,
  requiresQuestIds: ["customer-service"],
  icon: "📋",
  meetNpcIds: ["suzuki-manager"],
  objectives: [
    { id: "state", label: "State the issue clearly" },
    { id: "apologize", label: "Apologize with 申し訳ございません" },
    { id: "impact", label: "Explain client impact" },
    { id: "recover", label: "Report the resend (再送)" },
    { id: "prevent", label: "Give a prevention checklist" },
  ],
  conversation: REPORT_MISTAKE_CONVERSATION,
  steps: [],
  rewards: {
    xp: 200,
    replayXp: 25,
    skillRewards: {
      conversation: 3,
      politeness: 4,
      vocabulary: 2,
    },
    coins: 50,
    unlockQuestIds: ["meeting-speak"],
    nextQuestTeaser: {
      id: "meeting-speak",
      title: "Speaking in a Meeting",
      japaneseTitle: "会議で意見を言う",
    },
    relationshipNpcIds: ["suzuki-manager"],
  },
  unlocks: {
    questIds: ["meeting-speak"],
  },
};
