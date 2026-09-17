import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 boss — Workday Survival
 * 一日仕事サバイバル — connected office day: greet → status → phone → client →
 * mistake → report → meeting → urgent request → leave politely.
 *
 * Requires ≥3 register shifts, ≥2 audio-first beats, fact recall, and a repair.
 */
export const WORKDAY_SURVIVAL_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  presentation: "default",
  resultSummaryTitle: "WORKDAY REPORT",
  nodes: [
    // 1 — morning framing
    {
      id: "arrive",
      japanese: "一日仕事サバイバル開始。朝から退勤まで、場面に合わせて敬語を切り替えてください。",
      english:
        "Workday Survival. Morning to clock-out — switch register with each scene. Help is costly.",
      nextNodeId: "morning-greet",
      speech: { autoPlay: true, language: "en" },
    },
    // 2 — morning greet (coworker, polite)
    {
      id: "morning-greet",
      npcId: "mika-coworker",
      japanese: "あ、おはよう！今日もよろしくね。",
      reading: "あ おはよう きょう も よろしく ね",
      english: "Oh — morning! Looking forward to working with you today.",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint: "Coworker morning: warm polite, not full boss keigo.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "おはようございます。今日もよろしくお願いします。",
          reading: "おはよう ございます きょう も よろしく おねがい します",
          english: "Good morning. Looking forward to working with you today.",
          quality: "excellent",
          nextNodeId: "boss-status",
          relationshipDelta: 1,
          feedback: "🌟 Solid office morning greeting.",
        },
        {
          id: "cas",
          japanese: "おはよう！",
          reading: "おはよう",
          english: "Morning!",
          quality: "acceptable",
          nextNodeId: "boss-status",
          feedback: "✓ Fine with Mika; keep fuller keigo ready for the boss.",
        },
        {
          id: "overformal",
          japanese: "謹んでご挨拶申し上げます。",
          reading: "つつしんで ごあいさつ もうしあげます",
          english: "I humbly offer my greetings.",
          quality: "awkward",
          nextNodeId: "boss-status",
          feedback: "△ Over-formal for a coworker hello.",
        },
      ],
    },
    // 3 — boss status (business / manager)
    {
      id: "boss-status",
      npcId: "suzuki-manager",
      japanese: "今朝の進捗を短くください。結論からお願いします。",
      reading:
        "けさ の しんちょく を みじかく ください けつろん から おねがい します",
      english: "Brief morning status — conclusion first, please.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "報連相: conclusion → status → next action.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "資料はほぼ完成しています。午前中に最終確認して共有します。",
          reading:
            "しりょう は ほぼ かんせい して います ごぜんちゅう に さいしゅう かくにん して きょうゆう します",
          english:
            "The materials are nearly done. I'll do a final check this morning and share them.",
          quality: "excellent",
          nextNodeId: "phone-bridge",
          reportingTags: ["conclusion-first", "clear", "action-stated"],
          relationshipDelta: 2,
          feedback: "🌟 Clear status + next action.",
        },
        {
          id: "ramble",
          japanese:
            "昨日の夜遅くまで作業していて、細かいところを直していて…",
          reading:
            "きのう の よる おそく まで さぎょう して いて こまかい ところ を なおして いて",
          english: "I was working late last night fixing small details…",
          quality: "awkward",
          nextNodeId: "phone-bridge",
          reportingTags: ["too-much-detail", "excuse-heavy"],
          feedback: "△ Detail-first — lead with completion status.",
        },
        {
          id: "vague",
          japanese: "やっています。",
          reading: "やって います",
          english: "I'm working on it.",
          quality: "incorrect",
          nextNodeId: "phone-bridge",
          confidenceDelta: -1,
          feedback: "✕ Too vague for a boss status check.",
        },
      ],
    },
    // 4 — bridge to phone
    {
      id: "phone-bridge",
      japanese: "外線電話です。取引先からの着信に出てください。",
      english: "External line. Answer the business call — listen first.",
      nextNodeId: "phone-identify",
      speech: { autoPlay: true, language: "en" },
    },
    // 5 — audio-first identify
    {
      id: "phone-identify",
      npcId: "yoshida-client",
      japanese:
        "お忙しいところ失礼いたします。株式会社みらいの吉田と申しますが、担当の方でいらっしゃいますか。",
      reading:
        "おいそがしい ところ しつれい いたします かぶしきがいしゃ みらい の よしだ と もうします が たんとう の かた で いらっしゃいます か",
      english:
        "Sorry to disturb you. This is Yoshida from Mirai Corp — am I speaking with the person in charge?",
      objectiveType: "listening",
      socialContext: "external-caller",
      register: "formal",
      audioFirst: true,
      listenOnly: true,
      helpHint: "Company → name → role check. Listen for 吉田 and みらい.",
      vocabHint: "と申します",
      setsFacts: {
        callerName: "吉田",
        callerCompany: "みらい",
      },
      factLabels: {
        callerName: "Caller",
        callerCompany: "Company",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      choices: [
        {
          id: "ex",
          japanese:
            "はい、担当のものです。みらいの吉田様でいらっしゃいますね。",
          reading:
            "はい たんとう の もの です みらい の よしださま で いらっしゃいます ね",
          english: "Yes, I'm the person in charge. Yoshida-sama from Mirai, correct?",
          quality: "excellent",
          nextNodeId: "phone-purpose",
          relationshipDelta: 1,
          feedback: "🌟 Identity confirmed with company + name.",
        },
        {
          id: "ok",
          japanese: "はい、私です。",
          reading: "はい わたし です",
          english: "Yes, that's me.",
          quality: "natural",
          nextNodeId: "phone-purpose",
          feedback: "✓ Clear confirmation.",
        },
        {
          id: "wrong",
          japanese: "クリニックですか。",
          reading: "クリニック です か",
          english: "Is this the clinic?",
          quality: "incorrect",
          nextNodeId: "phone-purpose",
          communicationDelta: -8,
          feedback: "✕ Wrong context — this is a business client call.",
        },
        {
          id: "repeat",
          japanese: "恐れ入りますが、もう一度お願いできますか。",
          reading: "おそれいります が もう いちど おねがい できます か",
          english: "Pardon me — could you say that once more?",
          quality: "acceptable",
          nextNodeId: "phone-identify",
          isRepair: true,
          repairKind: "repeat",
          replayCurrent: true,
          communicationDelta: 3,
          feedback: "✓ Repair — replay at normal speed.",
        },
      ],
    },
    // 6 — audio-first purpose + fact lock
    {
      id: "phone-purpose",
      npcId: "yoshida-client",
      japanese:
        "来週の火曜日、午後二時の打ち合わせの件で確認したくお電話しました。",
      reading:
        "らいしゅう の かようび ごご にじ の うちあわせ の けん で かくにん したく おでんわ しました",
      english:
        "I'm calling to confirm the meeting next Tuesday at 2:00 p.m.",
      objectiveType: "listening",
      socialContext: "client",
      register: "formal",
      audioFirst: true,
      listenOnly: true,
      helpHint: "Lock 火曜日 + 午後二時 — you will recall this later.",
      vocabHint: "打ち合わせ",
      setsFacts: {
        meetingDay: "火曜日",
        meetingTime: "午後二時",
      },
      factLabels: {
        meetingDay: "Tuesday",
        meetingTime: "2:00 PM",
      },
      speech: { autoPlay: true, karaokeMode: "after-answer" },
      nextNodeId: "phone-confirm",
    },
    // 7 — confirm schedule
    {
      id: "phone-confirm",
      npcId: "yoshida-client",
      japanese: "火曜日の午後二時でよろしいでしょうか。",
      reading: "かようび の ごご にじ で よろしい でしょう か",
      english: "Tuesday at 2:00 p.m. — is that alright?",
      objectiveType: "social-choice",
      socialContext: "client",
      register: "formal",
      helpHint: "Restate day + time, or ask for a slower replay.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "はい、火曜日の午後二時で承知いたしました。",
          reading: "はい かようび の ごご にじ で しょうち いたしました",
          english: "Yes — Tuesday at 2 p.m., understood.",
          quality: "excellent",
          nextNodeId: "phone-close",
          isRepair: true,
          repairKind: "confirm",
          communicationDelta: 6,
          relationshipDelta: 1,
          feedback: "🌟 Restated 火曜日の午後二時 + 承知いたしました.",
        },
        {
          id: "ok",
          japanese: "はい、大丈夫です。",
          reading: "はい だいじょうぶ です",
          english: "Yes, that's fine.",
          quality: "natural",
          nextNodeId: "phone-close",
          feedback: "✓ Clear acceptance.",
        },
        {
          id: "slow",
          japanese: "すみません、もう少しゆっくりお願いできますか。",
          reading: "すみません もう すこし ゆっくり おねがい できます か",
          english: "Sorry — a little more slowly, please?",
          quality: "acceptable",
          nextNodeId: "phone-purpose",
          isRepair: true,
          repairKind: "slow",
          replayCurrent: true,
          communicationDelta: 3,
          feedback: "✓ Slow repair — listening skill, not failure.",
        },
      ],
    },
    // 8 — phone close
    {
      id: "phone-close",
      npcId: "yoshida-client",
      japanese: "では、よろしくお願いいたします。失礼いたします。",
      reading: "では よろしく おねがい いたします しつれい いたします",
      english: "Thank you. Goodbye.",
      objectiveType: "social-choice",
      socialContext: "client",
      register: "formal",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "かしこまりました。失礼いたします。",
          reading: "かしこまりました しつれい いたします",
          english: "Certainly. Goodbye.",
          quality: "excellent",
          nextNodeId: "customer-visit",
          relationshipDelta: 1,
          feedback: "🌟 Formal phone close.",
        },
        {
          id: "cas",
          japanese: "じゃあね！",
          reading: "じゃあ ね",
          english: "See ya!",
          quality: "incorrect",
          nextNodeId: "customer-visit",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Far too casual for an external client.",
        },
      ],
    },
    // 9 — customer / client in person
    {
      id: "customer-visit",
      japanese: "午後、吉田様が来社されました。応対してください。",
      english: "Yoshida-sama visits the office. Switch to client-facing keigo.",
      nextNodeId: "customer-greet",
      speech: { autoPlay: true, language: "en" },
    },
    // 10
    {
      id: "customer-greet",
      npcId: "yoshida-client",
      japanese: "本日はお時間をいただき、ありがとうございます。",
      reading: "ほんじつ は おじかん を いただき ありがとう ございます",
      english: "Thank you for your time today.",
      objectiveType: "social-choice",
      socialContext: "client",
      register: "formal",
      helpHint: "Welcome the client; offer a seat / thanks for visiting.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "お忙しい中お越しいただき、ありがとうございます。どうぞおかけください。",
          reading:
            "おいそがしい なか おこし いただき ありがとう ございます どうぞ おかけ ください",
          english:
            "Thank you for coming despite your busy schedule. Please have a seat.",
          quality: "excellent",
          nextNodeId: "customer-ask",
          relationshipDelta: 2,
          feedback: "🌟 Warm formal hospitality.",
        },
        {
          id: "ok",
          japanese: "ようこそいらっしゃいました。",
          reading: "ようこそ いらっしゃいました",
          english: "Welcome.",
          quality: "natural",
          nextNodeId: "customer-ask",
          relationshipDelta: 1,
          feedback: "✓ Polite welcome.",
        },
        {
          id: "cas",
          japanese: "やっほー、どうぞー。",
          reading: "やっほー どうぞー",
          english: "Yoo-hoo, come on in!",
          quality: "incorrect",
          nextNodeId: "customer-ask",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Catastrophic register for a client visit.",
        },
      ],
    },
    // 11 — customer request + sets up mistake
    {
      id: "customer-ask",
      npcId: "yoshida-client",
      japanese:
        "先日の見積書の最新版をいただけますか。メールで結構です。",
      reading:
        "せんじつ の みつもりしょ の さいしんばん を いただけます か メール で けっこう です",
      english:
        "Could I have the latest quote? Email is fine.",
      objectiveType: "social-choice",
      socialContext: "client",
      register: "formal",
      helpHint: "Promise a prompt send — you will later discover the wrong file went out.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "かしこまりました。本日中に最新版をお送りします。",
          reading: "かしこまりました ほんじつちゅう に さいしんばん を おおくり します",
          english: "Certainly. I'll send the latest version today.",
          quality: "excellent",
          nextNodeId: "mistake-discover",
          reportingTags: ["action-stated", "clear"],
          relationshipDelta: 1,
          feedback: "🌟 Clear commitment with timing.",
        },
        {
          id: "ok",
          japanese: "承知しました。すぐにご準備します。",
          reading: "しょうち しました すぐ に ごじゅんび します",
          english: "Understood. I'll prepare it right away.",
          quality: "natural",
          nextNodeId: "mistake-discover",
          feedback: "✓ Natural business reply.",
        },
        {
          id: "delay",
          japanese: "たぶん送れます。",
          reading: "たぶん おくれます",
          english: "I can probably send it.",
          quality: "awkward",
          nextNodeId: "mistake-discover",
          feedback: "△ 「たぶん」sounds unreliable to a client.",
        },
      ],
    },
    // 12 — mistake discovered (coworker notice)
    {
      id: "mistake-discover",
      npcId: "mika-coworker",
      japanese:
        "ちょっと見て。吉田様に送ったの、古い見積になってない？",
      reading:
        "ちょっと みて よしださま に おくった の ふるい みつもり に なって ない",
      english:
        "Look — didn't the file you sent Yoshida-sama become the old quote?",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint: "Don't panic-hide. Confirm, then prepare to report upward.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "本当だ…間違えて古い版を送ってしまった。すぐ報告する。",
          reading:
            "ほんとう だ まちがえて ふるい ばん を おくって しまった すぐ ほうこく する",
          english:
            "You're right… I sent the old version by mistake. I'll report it now.",
          quality: "excellent",
          nextNodeId: "report-boss",
          relationshipDelta: 1,
          feedback: "🌟 Own it fast with a coworker, then escalate.",
        },
        {
          id: "hide",
          japanese: "黙って正しいのを送り直せばいいよ。",
          reading: "だまって ただしい の を おくりなおせば いい よ",
          english: "Just quietly resend the right one.",
          quality: "incorrect",
          nextNodeId: "report-forced",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Hiding from the manager risks trust — report it.",
        },
        {
          id: "panic",
          japanese: "どうしよう、終わった…",
          reading: "どう しよう おわった",
          english: "What do I do, I'm done for…",
          quality: "awkward",
          nextNodeId: "report-boss",
          feedback: "△ Panic helps nobody — move to a clear report.",
        },
      ],
    },
    // 13 — forced path if hide
    {
      id: "report-forced",
      npcId: "mika-coworker",
      japanese: "それは危ないよ。鈴木さんに先に言った方がいい。",
      reading: "それ は あぶない よ すずきさん に さき に いった ほう が いい",
      english: "That's risky. Better tell Suzuki first.",
      objectiveType: "repair",
      socialContext: "coworker",
      register: "polite",
      countsTowardSocialFit: false,
      speech: { autoPlay: true },
      choices: [
        {
          id: "fix",
          japanese: "うん、そうだね。すぐ報告する。",
          reading: "うん そう だ ね すぐ ほうこく する",
          english: "Yeah, you're right. I'll report it now.",
          quality: "excellent",
          nextNodeId: "report-boss",
          isRepair: true,
          relationshipDelta: 1,
          feedback: "🌟 Course-corrected — go report.",
        },
      ],
    },
    // 14 — report to boss
    {
      id: "report-boss",
      npcId: "suzuki-manager",
      japanese: "どうしましたか。",
      reading: "どう しました か",
      english: "What is it?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Conclusion → apology → recovery (再送) → prevention.",
      vocabHint: "申し訳ございません",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "申し訳ございません。吉田様に古い見積を送ってしまいました。ただいま正しい版を再送します。",
          reading:
            "もうしわけ ございません よしださま に ふるい みつもり を おくって しまいました ただいま ただしい ばん を さいそう します",
          english:
            "I'm deeply sorry. I sent Yoshida-sama the old quote. I'm resending the correct version now.",
          quality: "excellent",
          nextNodeId: "report-ok",
          reportingTags: ["conclusion-first", "clear", "action-stated"],
          relationshipDelta: 2,
          feedback: "🌟 Apology + fact + 再送 action in one report.",
        },
        {
          id: "excuse",
          japanese: "忙しくて確認できませんでした。すみません。",
          reading: "いそがしくて かくにん できません でした すみません",
          english: "I was busy and couldn't check. Sorry.",
          quality: "awkward",
          nextNodeId: "report-ok",
          reportingTags: ["excuse-heavy"],
          relationshipDelta: -1,
          feedback: "△ Excuse-first — lead with the mistake and the fix.",
        },
        {
          id: "minimize",
          japanese: "ちょっとしたミスなので大丈夫です。",
          reading: "ちょっとした ミス なので だいじょうぶ です",
          english: "It's a small mistake, so it's fine.",
          quality: "incorrect",
          nextNodeId: "report-ok",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Minimizing client-facing errors erodes trust.",
        },
      ],
    },
    // 15
    {
      id: "report-ok",
      npcId: "suzuki-manager",
      japanese: "再送を先に。その後、会議で共有してください。",
      reading: "さいそう を さき に そのご かいぎ で きょうゆう して ください",
      english: "Resend first. Then share it in the meeting.",
      nextNodeId: "meeting-bridge",
      speech: { autoPlay: true },
    },
    // 16 — meeting disagreement
    {
      id: "meeting-bridge",
      japanese: "定例会議。納期案に少し違和感があります。",
      english: "Stand-up meeting. Soft-disagree without shutting anyone down.",
      nextNodeId: "meeting-pitch",
      speech: { autoPlay: true, language: "en" },
    },
    // 17
    {
      id: "meeting-pitch",
      npcId: "sato-senpai",
      japanese:
        "この件は明日までに全部仕上げましょう。問題ないはずです。",
      reading:
        "この けん は あした まで に ぜんぶ しあげましょう もんだい ない はず です",
      english: "Let's finish everything on this by tomorrow. Should be fine.",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "business",
      helpHint: "そうですね / おっしゃる通り → 確かにそうですが一点…",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "おっしゃる通りです。ただ、確かにそうですが一点気になるのは確認時間です。",
          reading:
            "おっしゃる とおり です ただ たしかに そう です が いってん き に なる の は かくにん じかん です",
          english:
            "You're right. Still — one concern is the time needed for checks.",
          quality: "excellent",
          nextNodeId: "meeting-alt",
          relationshipDelta: 2,
          feedback: "🌟 Acknowledge + soft concern.",
          vocabHint: "おっしゃる通り",
        },
        {
          id: "blunt",
          japanese: "それは違います。",
          reading: "それ は ちがいます",
          english: "That's wrong.",
          quality: "awkward",
          nextNodeId: "meeting-repair",
          relationshipDelta: -1,
          feedback: "△ Blunt meeting rejection.",
        },
        {
          id: "silent",
          japanese: "はい…",
          reading: "はい",
          english: "Yes…",
          quality: "incorrect",
          nextNodeId: "meeting-alt",
          confidenceDelta: -1,
          feedback: "✕ You needed to raise the concern.",
        },
      ],
    },
    // 18 — meeting repair
    {
      id: "meeting-repair",
      npcId: "sato-senpai",
      japanese: "…どの点が違うんでしょう。",
      reading: "どの てん が ちがう ん でしょう",
      english: "…Which point is wrong?",
      objectiveType: "repair",
      socialContext: "senpai",
      register: "business",
      countsTowardSocialFit: false,
      speech: { autoPlay: true },
      choices: [
        {
          id: "fix",
          japanese:
            "言い方が良くありませんでした。段階確認を入れる方が安全かと思います。",
          reading:
            "いいかた が よく ありません でした だんかい かくにん を いれる ほう が あんぜん か と おもいます",
          english:
            "That came out poorly. I think adding a checkpoint would be safer.",
          quality: "excellent",
          nextNodeId: "meeting-alt",
          isRepair: true,
          relationshipDelta: 1,
          feedback: "🌟 Softened into 〜かと思います.",
        },
      ],
    },
    // 19 — alternative
    {
      id: "meeting-alt",
      npcId: "suzuki-manager",
      japanese: "代案があればどうぞ。",
      reading: "だいあん が あれば どうぞ",
      english: "If you have an alternative, please share it.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "確認ですが、主要部分を明日、残りを水曜という理解で進められるかと思います。",
          reading:
            "かくにん です が しゅよう ぶぶん を あした のこり を すいよう と いう りかい で すすめられる か と おもいます",
          english:
            "Just to confirm — I think we could do the main parts tomorrow and the rest Wednesday.",
          quality: "excellent",
          nextNodeId: "urgent-bridge",
          relationshipDelta: 2,
          feedback: "🌟 確認ですが〜 + 〜かと思います.",
          vocabHint: "〜かと思います",
        },
        {
          id: "ok",
          japanese: "少し余裕を見た方がよいかと思います。",
          reading: "すこし よゆう を みた ほう が よい か と おもいます",
          english: "I think a little more buffer would be better.",
          quality: "natural",
          nextNodeId: "urgent-bridge",
          relationshipDelta: 1,
          feedback: "✓ Tentative suggestion.",
        },
      ],
    },
    // 20 — urgent request from senpai
    {
      id: "urgent-bridge",
      japanese: "会議の直後、急ぎの依頼が入ります。",
      english: "Right after the meeting — an urgent request.",
      nextNodeId: "urgent-ask",
      speech: { autoPlay: true, language: "en" },
    },
    // 21
    {
      id: "urgent-ask",
      npcId: "sato-senpai",
      japanese:
        "悪い、今日中にこの表を更新してもらえる？吉田様の件も関係ある。",
      reading:
        "わるい きょうじゅう に この ひょう を こうしん して もらえる よしださま の けん も かんけい ある",
      english:
        "Sorry — can you update this sheet today? It relates to Yoshida-sama too.",
      objectiveType: "social-choice",
      socialContext: "senpai",
      register: "polite",
      helpHint: "Accept with capacity, or soft-negotiate timing.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese:
            "はい、承知しました。優先して今日中に更新します。",
          reading:
            "はい しょうち しました ゆうせん して きょうじゅう に こうしん します",
          english: "Understood. I'll prioritize updating it today.",
          quality: "excellent",
          nextNodeId: "fact-recall",
          relationshipDelta: 2,
          reportingTags: ["action-stated", "clear"],
          feedback: "🌟 Ready acceptance with timing.",
        },
        {
          id: "soft-no",
          japanese:
            "今日は再送対応がありまして、夕方以降でもよろしいでしょうか。",
          reading:
            "きょう は さいそう たいおう が ありまして ゆうがた いこう でも よろしい でしょう か",
          english:
            "I'm handling the resend today — would this evening work?",
          quality: "natural",
          nextNodeId: "fact-recall",
          relationshipDelta: 1,
          feedback: "✓ Soft negotiate with a reason — still helpful.",
        },
        {
          id: "rude",
          japanese: "無理。自分でやって。",
          reading: "むり じぶん で やって",
          english: "No. Do it yourself.",
          quality: "incorrect",
          nextNodeId: "fact-recall",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Too blunt to a senpai.",
        },
      ],
    },
    // 22 — fact recall from morning phone
    {
      id: "fact-recall",
      npcId: "mika-coworker",
      japanese:
        "ねえ、さっきの電話——吉田様との打ち合わせ、いつだっけ？",
      reading:
        "ねえ さっき の でんわ よしださま と の うちあわせ いつ だっけ",
      english:
        "Hey — that call earlier — when's the meeting with Yoshida-sama?",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint: "Recall 火曜日 / 午後二時 from the audio-first call.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "来週の火曜日、午後二時です。",
          reading: "らいしゅう の かようび ごご にじ です",
          english: "Next week, Tuesday at 2:00 p.m.",
          quality: "excellent",
          nextNodeId: "eod-bridge",
          checksFact: "meetingDay",
          expectedFactValue: "火曜日",
          relationshipDelta: 1,
          feedback: "🌟 Fact recall — 火曜日の午後二時 locked.",
        },
        {
          id: "partial",
          japanese: "火曜日だったと思います。",
          reading: "かようび だった と おもいます",
          english: "I think it was Tuesday.",
          quality: "acceptable",
          nextNodeId: "eod-bridge",
          checksFact: "meetingDay",
          expectedFactValue: "火曜日",
          feedback: "✓ Day correct — time was 午後二時 too.",
        },
        {
          id: "wrong",
          japanese: "水曜日の午後三時です。",
          reading: "すいようび の ごご さんじ です",
          english: "Wednesday at 3:00 p.m.",
          quality: "incorrect",
          nextNodeId: "eod-bridge",
          checksFact: "meetingDay",
          expectedFactValue: "火曜日",
          confidenceDelta: -1,
          communicationDelta: -8,
          feedback: "✕ Mixed up with another schedule — it was 火曜日の午後二時.",
        },
      ],
    },
    // 23 — end of day
    {
      id: "eod-bridge",
      japanese: "退勤の時間です。上司と同僚に適切に挨拶して帰りましょう。",
      english:
        "End of day. Leave with お先に失礼します / お疲れ様です — register matters.",
      nextNodeId: "eod-boss",
      speech: { autoPlay: true, language: "en" },
    },
    // 24
    {
      id: "eod-boss",
      npcId: "suzuki-manager",
      japanese: "今日はここまでで大丈夫です。お疲れでした。",
      reading: "きょう は ここ まで で だいじょうぶ です おつかれ でした",
      english: "That's enough for today. Good work.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Leaving before the boss: お先に失礼します.",
      vocabHint: "お先に失礼します",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "お先に失礼します。お疲れさまでした。",
          reading: "おさき に しつれい します おつかれさま でした",
          english: "Excuse me for leaving first. Thank you for your hard work.",
          quality: "excellent",
          nextNodeId: "eod-mika",
          relationshipDelta: 2,
          feedback:
            "🌟 お先に失礼します — classic leave-before-boss line.",
          vocabHint: "お先に失礼します",
        },
        {
          id: "ok",
          japanese: "お疲れさまでした。失礼します。",
          reading: "おつかれさま でした しつれい します",
          english: "Thank you for your hard work. Excuse me.",
          quality: "natural",
          nextNodeId: "eod-mika",
          relationshipDelta: 1,
          feedback: "✓ Polite close.",
        },
        {
          id: "cas",
          japanese: "じゃ、帰るね！",
          reading: "じゃ かえる ね",
          english: "I'm heading out!",
          quality: "incorrect",
          nextNodeId: "eod-mika",
          confidenceDelta: -1,
          relationshipDelta: -1,
          feedback: "✕ Too casual when leaving past your manager.",
        },
      ],
    },
    // 25
    {
      id: "eod-mika",
      npcId: "mika-coworker",
      japanese: "今日も一日おつかれ！また明日ね。",
      reading: "きょう も いちにち おつかれ また あした ね",
      english: "Good work today! See you tomorrow.",
      objectiveType: "social-choice",
      socialContext: "coworker",
      register: "polite",
      helpHint: "With a peer: お疲れ様です is the everyday closer.",
      vocabHint: "お疲れ様です",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex",
          japanese: "お疲れ様です！また明日。",
          reading: "おつかれさま です また あした",
          english: "Thanks for your hard work! See you tomorrow.",
          quality: "excellent",
          nextNodeId: "finale",
          relationshipDelta: 1,
          feedback: "🌟 Everyday お疲れ様です with a coworker.",
        },
        {
          id: "stiff",
          japanese: "お先に失礼いたします。",
          reading: "おさき に しつれい いたします",
          english: "Excuse me for leaving first (very formal).",
          quality: "acceptable",
          nextNodeId: "finale",
          feedback:
            "✓ Grammatically fine, a bit stiff if Mika is still working beside you.",
        },
        {
          id: "cold",
          japanese: "さようなら。",
          reading: "さようなら",
          english: "Goodbye.",
          quality: "awkward",
          nextNodeId: "finale",
          feedback: "△ Sounds final/distant for office peers.",
        },
      ],
    },
    // 26
    {
      id: "finale",
      japanese:
        "朝の挨拶から退勤まで、敬語を切り替え続けました。仕事の日本語は一日単位で育ちます。",
      english:
        "From morning greetings to clock-out, you kept switching keigo. Workplace Japanese grows one full day at a time.",
      nextNodeId: "success",
      speech: { autoPlay: true, language: "en" },
    },
    // 27
    {
      id: "success",
      japanese: "第4章クリア！一日仕事サバイバル成功。プロのコミュニケーション徽章を獲得。",
      english:
        "Chapter 4 clear — Workday Survival complete. Professional Communication Seal earned.",
      endState: "success",
      speech: { autoPlay: true },
    },
  ],
};

export const WORKDAY_SURVIVAL_QUEST: QuestDefinition = {
  id: "workday-survival",
  title: "Workday Survival",
  japaneseTitle: "一日仕事サバイバル",
  locationId: "office",
  chapter: 4,
  description:
    "Survive a full connected workday: morning greetings, boss status, an external phone call, client hospitality, a mistake report, meeting disagreement, an urgent request, fact recall, and polite clock-out.",
  difficulty: "boss",
  recommendedLevel: 9,
  startingConfidence: 5,
  requiresQuestIds: ["meeting-speak"],
  objectives: [
    { id: "greet", label: "Morning office greeting" },
    { id: "status", label: "Report status to your boss" },
    { id: "phone", label: "Handle an external business call" },
    { id: "client", label: "Host a visiting client" },
    { id: "mistake", label: "Report a send mistake" },
    { id: "meeting", label: "Soft-disagree in a meeting" },
    { id: "urgent", label: "Handle an urgent senpai request" },
    { id: "recall", label: "Recall the meeting day/time" },
    { id: "eod", label: "Leave with お先に失礼します / お疲れ様です" },
  ],
  steps: [
    {
      id: "v2-shim",
      kind: "intro",
      promptJa: "一日仕事サバイバル",
      promptEn: "Conversation V2 boss quest.",
      costsConfidence: false,
    },
  ],
  conversation: WORKDAY_SURVIVAL_CONVERSATION,
  rewards: {
    xp: 350,
    replayXp: 40,
    skillRewards: {
      conversation: 5,
      politeness: 5,
      listening: 4,
      vocabulary: 3,
      grammar: 2,
    },
    coins: 80,
    sealId: "professional",
    nextQuestTeaser: {
      id: "chapter-5-preview",
      title: "Fluency Awaits",
      japaneseTitle: "第5章・流暢さへ",
    },
    relationshipNpcIds: [
      "mika-coworker",
      "suzuki-manager",
      "yoshida-client",
      "sato-senpai",
    ],
  },
  unlocks: {},
  meetNpcIds: [
    "mika-coworker",
    "suzuki-manager",
    "yoshida-client",
    "sato-senpai",
  ],
  icon: "🏢",
};
