import type { VocabNuanceEntry } from "./types";

/** Vocabulary nuance notes, part 1. */
export const vocabNuances1: Readonly<Record<number, VocabNuanceEntry>> = {
  4001: {
    word: "品切れ is the shop's word for out of stock; 売り切れ stresses that everything was bought up.",
    phrase: "品切れの商品 is notice language; online shops often write 在庫切れ for the same idea.",
  },
  4002: {
    word: "在庫 is stock kept on hand; 在庫がある means it's in stock, and 在庫切れ or 在庫なし means none left.",
    phrase: "在庫の確認 is standard shop talk; staff often say 在庫をお調べします when checking for you.",
  },
  4003: {
    word: "割引 is a set discount like 学生割引; 値引き often means a price cut agreed on the spot.",
  },
  4004: {
    word: "物価の値上がり is common news wording; 物価 means overall prices, so 物価が上がる says the same.",
    phrase: "値上がり is prices rising on their own; a seller deciding to raise prices is 値上げ.",
    sentence: "値上がりする takes the item as its subject, so 野菜が値上がりした means vegetables got pricier.",
  },
  4005: {
    word: "賞味 literally means savoring the taste, which is why the date marks flavor, not safety.",
  },
  4006: {
    word: "消費期限 uses 消費, consumption, as in 消費税; say 消費期限が切れる when the date has passed.",
  },
  4007: {
    word: "日用品 are everyday consumables like soap and tissues; 生活用品 is a near synonym on store signs.",
    phrase: "売り場 means a sales floor or section in a store, as in 食品売り場 or 日用品売り場.",
  },
  4008: {
    word: "まとめ買い contrasts with 衝動買い, impulse buying; in both, 買い is read がい.",
    phrase: "まとめ買い is buying a lot at once to save time or money; the verb form is まとめ買いする.",
  },
  4009: {
    word: "返品 is returning goods; shops that refuse returns post 返品不可, and 返金 is the refund itself.",
    phrase: "返品 is giving goods back for a refund; swapping for another item is 交換.",
    sentence: "At a counter, 返品したいんですが is the softer, more natural way to start a return request.",
  },
  4010: {
    word: "Cashiers hand it over saying レシートのお返しです; say 大丈夫です or 結構です to decline one.",
    phrase: "レシート is the printed register slip; the formal receipt for expense claims is 領収書.",
  },
  4011: {
    word: "家賃 is monthly rent; listings show it with 管理費 or 共益費, building fees paid on top.",
    phrase: "家賃 is rent for a home; contracts for offices or shops usually say 賃料 instead.",
    sentence: "家賃を払う is the basic collocation; with a bank transfer people say 家賃を振り込む.",
  },
  4012: {
    word: "敷金 is returned minus cleaning or repair costs, and many listings advertise 敷金なし.",
    sentence: "敷金が返ってくる treats the deposit as the subject; deductions are 敷金から引かれる.",
  },
  4013: {
    word: "契約 is a formal agreement; the document is 契約書, and cancelling it is 解約.",
    phrase: "契約の内容 is often compressed to 契約内容, and checking it is a standard step before signing.",
    sentence: "契約をする is the everyday way to say sign a contract; 契約を結ぶ is more formal.",
  },
  4014: {
    word: "大家 is the owner renting out a home; the 管理会社 is the agency that handles repairs and complaints.",
    sentence: "People add さん to 大家 when speaking to or about their landlord, as in 大家さん.",
  },
  4015: {
    word: "更新 is renewing something that expires, from leases and licenses to updating a website or app.",
  },
  4016: {
    word: "引っ越し is the noun and 引っ越す the verb; moving in is 入居 and moving out is 退去.",
    phrase: "準備 is general preparation; for moving you will also hear 荷造り, packing your belongings.",
    sentence: "引っ越しの費用 is estimate wording; the moving company is an 引っ越し業者.",
  },
  4017: {
    word: "騒音 is unwanted, annoying noise; a neutral sound is just 音.",
    phrase: "上の階の騒音 is a classic apartment complaint; the floor below is 下の階.",
    sentence: "気になる here means it bothers me, a softer way to complain than うるさい.",
  },
  4018: {
    word: "家具付き means furnished; 家電 is appliances, so listings often say 家具家電付き.",
    phrase: "新しい家具 often comes with 買い替える, to replace old pieces with new ones.",
    sentence: "置く is the usual verb for placing furniture; arranging it is 配置する.",
  },
  4019: {
    word: "収納 also works as a verb, 収納する, meaning to put away or store.",
    phrase: "Storage is described as 多い or 少ない, and 収納スペース is common in room listings.",
  },
  4020: {
    word: "光熱費 combines light and heat, and 費 means cost, as in 交通費 or 食費.",
    phrase: "光熱費 covers electricity and gas; bills that include water are called 水道光熱費.",
  },
  4021: {
    word: "予報 alone also means the forecast, and 予報が外れる means the forecast was wrong.",
    phrase: "To check it, say 天気予報を見る, even when using a phone app.",
    sentence: "によると is the natural way to cite a forecast, often closed with そうです.",
  },
  4022: {
    word: "気温 is outside air temperature; body temperature is 体温.",
    sentence: "下がる is the natural verb for falling temperatures; rising is 上がる.",
  },
  4023: {
    word: "湿度 is given in percent; when it is high, people complain that it feels ジメジメ.",
  },
  4024: {
    word: "Typhoons in Japan are numbered, as in 台風十号, rather than called by name.",
    phrase: "Typhoons are 大きな or 強い; reports rank them by size and strength, as in 大型で強い台風.",
    sentence: "台風が近づく is standard; making landfall is 上陸する.",
  },
  4025: {
    word: "降水確率 is forecast jargon; in conversation people just ask whether it will rain.",
  },
  4026: {
    word: "晴天 is formal, written wording; 快晴 means a completely clear sky.",
    phrase: "晴天 is a formal word from forecasts and writing; in conversation say 晴れ.",
  },
  4027: {
    word: "Forecasts say 曇りのち雨 for cloudy then rain, and 曇り時々晴れ for cloudy with sunny spells.",
    phrase: "曇り is a noun; to describe the sky right now, say 曇っている.",
  },
  4028: {
    word: "大雨 is heavy rain; the news calls a sudden, intense downpour 豪雨 or ゲリラ豪雨.",
    sentence: "で often marks weather as the cause of disruption, as in 大雨で電車が止まる or 台風で休校.",
  },
  4029: {
    word: "蒸し暑い is muggy heat; ムシムシする is the casual way to describe it.",
    phrase: "蒸し暑い is heat plus humidity; dry heat is simply 暑い.",
  },
  4030: {
    word: "猛暑 is fierce heat in news language; 酷暑 is an even stronger written word.",
    phrase: "猛暑 is news vocabulary; a 猛暑日 is officially a day of thirty-five degrees or more.",
    sentence: "猛暑が続く is set news phrasing for a lasting heat wave.",
  },
  4031: {
    word: "定期券 covers a fixed route, and the fare paid for it is 定期代.",
    phrase: "定期券 is usually shortened to 定期 in speech, as in 定期を忘れた.",
  },
  4032: {
    word: "満員 also works for venues, and 満員電車 is the standard term for packed rush-hour trains.",
  },
  4033: {
    word: "遅延 is the station word; railways hand out a 遅延証明書 so you can prove a delay at work.",
  },
  4034: {
    word: "乗り換え is the noun of 乗り換える; route apps show 乗り換え回数, the number of changes.",
  },
  4035: {
    word: "各駅停車 on train displays is often labeled 普通, which means the same stopping service.",
  },
  4036: {
    word: "改札 is the gate; passing through is 改札を通る, and 自動改札 is the automatic type.",
  },
  4037: {
    word: "渋滞 is for cars; getting caught in a jam is 渋滞に巻き込まれる.",
    sentence: "渋滞している describes the road's current state, typical traffic report phrasing.",
  },
  4038: {
    word: "終電 is short for 最終電車; missing it is 終電を逃す.",
    sentence: "間に合う means to make it in time and takes に, as in 終電に間に合う.",
  },
  4039: {
    word: "運賃 is for trains, buses, taxis and shipping; in speech taxi fares are also タクシー代.",
    sentence: "運賃が値上がりする is news phrasing; companies announce it as 運賃改定.",
  },
  4040: {
    word: "通勤 is the trip to work; 通勤ラッシュ is rush hour, and 通勤手当 is a commuting allowance.",
    phrase: "通勤 is for commuting to work; commuting to school is 通学.",
    sentence: "電車で通勤する uses で for the means; 通勤時間 is how long the commute takes.",
  },
  4041: {
    word: "症状 is the medical word for symptoms; 賞状, read the same way, is a certificate of merit.",
    phrase: "At a clinic you will often hear どんな症状ですか when staff ask you to describe symptoms.",
  },
  4042: {
    word: "Clinics issue a 診察券 patient card and post their 診察時間, consultation hours.",
  },
  4043: {
    word: "処方 is formal medical language; patients usually say 薬を出してもらう.",
    sentence: "医者が薬を処方する is the fixed pattern; from the patient side say 薬を処方してもらう.",
  },
  4044: {
    word: "保険証 is short for 健康保険証; many people now use the マイナ保険証 instead.",
    phrase: "提示 means showing a document, a formal word seen on signs like 保険証をご提示ください.",
  },
  4045: {
    word: "熱中症 covers heat illness in general, from dizziness to severe heatstroke.",
    phrase: "予防 means prevention; 熱中症対策 is another very common phrase on signs and in the news.",
    sentence: "に注意する means to watch out for something; 気をつけて is the softer everyday version.",
  },
  4046: {
    word: "花粉症 is extremely common in Japan, mostly caused by cedar pollen, スギ花粉.",
    phrase: "Say 花粉症の薬を飲む for tablets; eye drops take さす, as in 目薬をさす.",
  },
  4047: {
    word: "検査 is a check done by professionals; a school test is テスト or 試験.",
    phrase: "血液の検査 is usually shortened to 血液検査, and the patient 検査を受ける.",
    sentence: "検査を受ける is the patient's verb; the results come back as 検査結果.",
  },
  4048: {
    word: "入院 is being admitted to hospital; visiting someone there is お見舞い.",
    phrase: "一週間の入院 uses の to link a duration; the opposite of 入院 is 退院, leaving hospital.",
  },
  4049: {
    word: "疲労 appears in 疲労回復, a set phrase on energy drinks, and 疲労困憊 for utter exhaustion.",
    sentence: "疲労で sounds written; aloud people would say 疲れて体が重い.",
  },
  4050: {
    word: "副作用 is used for medicine, and figuratively for unwanted effects of a policy.",
  },
  4051: {
    word: "サービス残業 is unpaid overtime, a well-known workplace problem in Japan.",
    phrase: "Overtime is described as 多い or 少ない, and doing it is 残業する.",
  },
  4052: {
    word: "出張 is travel for work; a trip for pleasure is 旅行.",
    phrase: "へ marks the destination here; 大阪に出張 is equally natural.",
  },
  4053: {
    word: "上司 is anyone above you at work; your direct boss is 直属の上司.",
  },
  4054: {
    word: "部下 can sound hierarchical, so some managers say チームのメンバー instead.",
    phrase: "部下 is used from the boss's point of view; the opposite is 上司.",
    sentence: "任せる means to entrust, and に marks the person who takes over the work.",
  },
  4055: {
    word: "提出 is formal handing in; with teachers or bosses people also just say 出す.",
    phrase: "書類の提出 appears on notices, and deadlines are often written 提出期限.",
    sentence: "までに means by a deadline; まで alone means until, a common learner mix-up.",
  },
  4056: {
    word: "資料 is material for reference; 材料 is raw materials or ingredients.",
    phrase: "資料 covers handouts, slides and data, and 会議の資料 is often shortened to 会議資料.",
    sentence: "資料を準備する is standard; handing out printed copies is 資料を配る.",
  },
  4057: {
    word: "Taking it is 有給を取る, and the request is 有給申請.",
    sentence: "休暇を取る is the collocation; 有給を使う is also common in speech.",
  },
  4058: {
    word: "昇進 is rising in rank; a pay raise is 昇給.",
    phrase: "への lets a destination modify a noun; with the verb say 部長に昇進する.",
  },
  4059: {
    word: "転職 is changing employer; 就職 is getting a job, and 退職 is leaving one.",
    sentence: "転職を考える is a soft way to hint at quitting; the job hunt itself is 転職活動.",
  },
  4060: {
    word: "面接 is any face-to-face interview, including school admissions; a media interview is インタビュー.",
  },
  4061: {
    word: "口座 is used for banks and brokerages; the number is 口座番号, and 口座振替 is automatic debit.",
    phrase: "銀行の口座 is often shortened to 銀行口座; opening one is 口座を開く or 口座を作る.",
  },
  4062: {
    word: "The verb is 振り込む; beware 振り込め詐欺, a common phone scam demanding transfers.",
  },
  4063: {
    word: "手数料 is a service charge, and 手数料無料 means no fee.",
    phrase: "手数料 is a charge for handling a service, like bank transfer or cancellation fees.",
    sentence: "かかる is the verb for costs being incurred, used for both money and time.",
  },
  4064: {
    word: "残高 is the remaining balance; checking it at an ATM is 残高照会.",
    phrase: "A short balance is 残高不足, a message you may see at ticket gates or ATMs.",
  },
  4065: {
    word: "貯金 is money saved, and 貯金する is to save; a piggy bank is 貯金箱.",
    phrase: "貯金 is personal saving; 預金 is the bank's word for deposits.",
  },
  4066: {
    word: "支払い is the act of paying; 支払い方法 is the payment method, and 分割払い is installments.",
    phrase: "支払い is the noun from 支払う and appears politely on bills as お支払い.",
    sentence: "Payments left unpaid, like rent or taxes, are called 滞納.",
  },
  4067: {
    word: "家計 is household finances; 家計が苦しい means money is tight at home.",
    phrase: "A 家計簿 is the household account book people keep for 家計の管理.",
    sentence: "家計を見直す is set phrasing for reviewing spending to cut costs.",
  },
  4068: {
    word: "節約 is cutting waste in spending or use; 貯金 is keeping money saved.",
    phrase: "Resource-specific words also exist: 節電 for electricity and 節水 for water.",
    sentence: "を marks what you cut back on, so 食費を節約する means spending less on food.",
  },
  4069: {
    word: "Paying tax is 税金を払う, or formally 納める; tax-free shopping is 免税.",
    phrase: "税金 is tax in everyday talk; specific taxes drop 金, as in 消費税 or 所得税.",
  },
  4070: {
    word: "現金 is cash; paying without it is キャッシュレス.",
    phrase: "用意 means getting something ready in advance, often money or tools.",
    sentence: "しか with a negative means only, so 現金しか使えません means only cash is accepted.",
  },
  4071: {
    word: "材料 is ingredients or raw material; 食材 focuses on the food items themselves.",
    phrase: "Recipes list ingredients under the heading 材料, and the word also means building materials.",
  },
  4072: {
    word: "冷凍食品 is frozen food, and thawing it is 解凍.",
  },
  4073: {
    word: "沸騰 is also used figuratively for surging popularity or debate, as in 人気が沸騰する.",
    phrase: "沸騰 is a stiff, technical word; in the kitchen people usually say お湯が沸く.",
  },
  4074: {
    word: "焦げる is for food and fabric scorching; a building on fire is 燃える.",
  },
  4075: {
    word: "味付け is the seasoning a cook adds; 味 alone is the resulting taste.",
  },
  4076: {
    word: "分量 is a measured amount, typical in recipes; 量 is quantity in general.",
    phrase: "調味料 means seasonings such as soy sauce, salt, and sugar.",
    sentence: "量る is the kanji for measuring weight or volume, unlike 測る for length.",
  },
  4077: {
    word: "包丁 is a kitchen knife; knives in general are ナイフ or 刃物.",
    phrase: "よく切れる means sharp; a dull knife is simply 切れない包丁.",
  },
  4078: {
    word: "The very gentlest simmer is called とろ火.",
  },
  4079: {
    word: "混ぜる is transitive; things getting mixed by themselves use 混ざる.",
    phrase: "よく here means thoroughly, not often, a common recipe instruction.",
    sentence: "と links the two items being mixed; 卵に砂糖を混ぜる means adding sugar into the eggs.",
  },
  4080: {
    word: "蒸す also describes muggy weather, as in 今日は蒸しますね.",
    phrase: "蒸す is steaming; boiling in water is ゆでる, and simmering is 煮る.",
  },
  4081: {
    word: "講義 is a one-way lecture; a small discussion class is ゼミ.",
    phrase: "講義 is a university lecture; a school lesson is 授業.",
  },
  4082: {
    word: "単位 also means a unit of measurement, as in 長さの単位.",
    sentence: "単位が足りない is the worry of students short of credits to graduate.",
  },
  4083: {
    word: "課題 also means an issue to be solved, as in 今後の課題.",
    phrase: "課題 is typical for university assignments; school homework is usually 宿題.",
    sentence: "課題を提出する is the standard collocation, and the deadline is 締め切り.",
  },
  4084: {
    word: "復習 is going back over what you learned; 練習 is practicing a skill.",
  },
  4085: {
    word: "予習 is studying before class; 下調べ is advance research in general.",
    phrase: "授業の予習 means preparing for class, and 予習復習 together is a standard study habit.",
  },
  4086: {
    word: "合格 is passing; failing is 不合格, or in speech 落ちる.",
    phrase: "With the verb, the exam takes に, as in 試験に合格する, not を.",
  },
  4087: {
    word: "成績 is results over a period; a single test score is 点数.",
    phrase: "学校の成績 means grades; work results are also 成績, as in 営業成績.",
    sentence: "上がる and 下がる are the verbs for grades going up and down.",
  },
  4088: {
    word: "受験 is mainly for entrance exams; for tests in general say 試験を受ける.",
    phrase: "大学を受験する takes を for the school, and a student preparing for exams is a 受験生.",
  },
  4089: {
    word: "Many Japanese scholarships are loans to repay, so check whether one is 給付型 or 貸与型.",
    phrase: "申請 is a formal application to an institution, as in ビザの申請.",
    sentence: "奨学金をもらう is natural in speech; forms write 奨学金を受ける.",
  },
  4090: {
    word: "発表 also means an official announcement, as in 合格発表.",
    phrase: "研究の発表 is often shortened to 研究発表, the set term at schools and conferences.",
  },
  4091: {
    word: "連絡 is contacting someone by any means; contact details are 連絡先.",
    sentence: "後で連絡します is a set promise; in business say 後ほどご連絡いたします.",
  },
  4092: {
    word: "返事 is an everyday reply; 返答 is more formal.",
    sentence: "返事が来る is the natural pairing; replying yourself is 返事をする.",
  },
  4093: {
    word: "相談 is asking for advice or discussing a matter; a counseling office is 相談室.",
    sentence: "に marks the person you consult; と would mean discussing together as equals.",
  },
  4094: {
    word: "迷惑 is trouble caused to others; 迷惑メール is spam, and 迷惑行為 is antisocial behavior.",
    sentence: "迷惑をかけてすみません is the set apology for having inconvenienced someone.",
  },
  4095: {
    word: "敬語 includes 尊敬語, 謙譲語, and 丁寧語, not just polite endings.",
    phrase: "正しい敬語 is a worry even for native speakers, and mistakes are called 間違った敬語.",
    sentence: "敬語を使う is the verb pairing; dropping it with friends is タメ口.",
  },
  4096: {
    word: "誤解 is misreading someone's meaning or intent; 勘違い is a casual mistaken assumption.",
  },
  4097: {
    word: "挨拶 is often written in kana as あいさつ because the kanji are difficult.",
    phrase: "朝の挨拶 is おはようございます; 挨拶 also covers short speeches at events.",
    sentence: "近所の人 is the natural way to say neighbors, and 挨拶する takes に for the person.",
  },
  4098: {
    word: "約束 is a personal promise or plan; business meetings are アポ, and bookings are 予約.",
    sentence: "約束の時間 means the agreed meeting time, and 遅れる takes に.",
  },
  4099: {
    word: "遠慮 is holding back out of politeness; 遠慮なく means feel free.",
    sentence: "遠慮しないで encourages someone to speak freely; hosts politely say ご遠慮なく.",
  },
  4100: {
    word: "感謝 is more formal than ありがとう and also works as a verb, 感謝する.",
    phrase: "感謝の気持ち is common in speeches and cards, as in 感謝の気持ちを伝える.",
    sentence: "感謝している states lasting gratitude; for a quick thanks, ありがとう is more natural.",
  },
  4101: {
    word: "洗濯 is only for washing clothes; washing dishes or hands uses 洗う.",
    phrase: "洗濯物 is the laundry itself, and 干す means hanging it out to dry.",
    sentence: "洗濯をまとめてする means batching laundry; running the machine is 洗濯機を回す.",
  },
  4102: {
    word: "縮む is intransitive; to shrink something on purpose is 縮める.",
    phrase: "で marks the cause, so 洗濯で縮む means it shrinks from being washed.",
  },
  4103: {
    word: "綿素材 is tag language; in speech people say 綿 or コットン, and 綿 read わた means stuffing.",
    phrase: "素材 is the material a product is made of; tags may say 綿 or コットン.",
  },
  4104: {
    word: "丈 appears in clothing terms like 着丈 and 袖丈; a person's height is 身長.",
    phrase: "丈 is the length of clothing; the length of things in general is 長さ.",
    sentence: "丈が長い is how shops describe clothes that are too long, and they offer 裾上げ for trousers.",
  },
  4105: {
    word: "袖を通す means putting on clothes, often for the first time.",
    phrase: "長袖 is long sleeves and 半袖 is short sleeves; sleeveless is ノースリーブ.",
  },
  4106: {
    word: "柄が悪い uses the same word to mean rough or ill-mannered.",
  },
  4107: {
    word: "試着 is trying on clothes in a shop; 試食 is tasting food samples.",
    phrase: "試着室 is the fitting room, and asking 試着してもいいですか is polite in shops.",
  },
  4108: {
    word: "丁寧 means both polite and careful; 丁寧語 is the です and ます level of politeness.",
    phrase: "丁寧に扱う means to handle with care; fragile parcels are labeled 取扱注意.",
  },
  4109: {
    word: "流行 is also used for epidemics, as in インフルエンザの流行.",
  },
  4110: {
    word: "着替え is both the act of changing and the spare clothes; the verb is 着替える.",
    phrase: "持参 is a formal word for bringing, often seen in notices as 持参してください.",
  },
  4111: {
    word: "宿泊 appears in 宿泊費, 宿泊客 and 宿泊施設, all formal travel terms.",
    sentence: "宿泊費 is lodging cost, usually claimed alongside 交通費 on business trips.",
  },
  4112: {
    word: "観光 is sightseeing; a tourist is 観光客, and a tourist spot is 観光地.",
    phrase: "観光する is fine, but 名所を回る or 観光地を巡る often sounds more natural.",
    sentence: "で here gives the purpose of the visit, as in 観光で来る or 仕事で来る.",
  },
  4113: {
    word: "予約 is for bookings; a personal promise to meet is 約束, not 予約.",
  },
  4114: {
    word: "手土産 is a gift you bring when visiting someone's home or office.",
    sentence: "同僚へのお土産 reflects the custom of bringing snacks for coworkers after time off.",
  },
  4115: {
    word: "旅館 is a traditional inn with tatami rooms; a cheaper family-run inn is 民宿.",
    phrase: "旅館に泊まる usually includes dinner and breakfast, unlike a plain hotel stay.",
  },
  4116: {
    word: "At airports, チェックイン is also called 搭乗手続き in formal Japanese.",
    phrase: "フロント is the front desk, and it takes で as the place where you check in.",
  },
  4117: {
    word: "空席 is formal booking language; the opposite is 満席.",
    phrase: "Seat availability is also asked with 空きはありますか in conversation.",
    sentence: "空席がほとんどない is how travel news describes nearly sold-out holiday flights.",
  },
  4118: {
    word: "模様替え changes a room's look; the seasonal switch of wardrobe is 衣替え.",
    sentence: "気分転換に模様替えする is a common pairing: rearranging a room to refresh your mood.",
  },
  4119: {
    word: "眠れない can be one night or ongoing trouble; the medical term is 不眠症.",
    phrase: "眠れない is the potential negative of 眠る; 寝られない is also common in speech.",
    sentence: "眠れない夜が続く is set phrasing for sleepless nights in a row.",
  },
  4120: {
    word: "選択肢 is the options available, while 選択 is the act of choosing.",
    phrase: "Options are counted as 多い or 少ない, and 選択肢がない means there is no choice.",
  },
  4121: {
    word: "目覚まし is short for 目覚まし時計, and people use it for phone alarms too.",
    phrase: "目覚ましをセットする and 目覚ましを掛ける both mean setting an alarm.",
    sentence: "Switching off a ringing alarm is 目覚ましを止める.",
  },
  4122: {
    word: "寝坊 is sleeping past the time you meant to get up; staying up late is 夜更かし.",
    phrase: "寝坊して遅刻する is the classic excuse; 遅刻 is being late for school or work.",
  },
  4123: {
    word: "枕 also appears in 枕元, bedside, and 膝枕, resting your head on someone's lap.",
    phrase: "枕が変わると眠れない is a common saying about sleeping badly away from home.",
    sentence: "枕の高さ is the main thing people choose by, and 合う means it suits you.",
  },
  4124: {
    word: "布団 covers both the mattress, 敷布団, and the quilt, 掛け布団.",
  },
  4125: {
    word: "掃除 is cleaning a space; 大掃除 is the big year-end clean.",
    phrase: "掃除 is removing dirt from a place; washing objects is 洗う, and tidying up is 片付け.",
  },
  4126: {
    word: "片付ける also means finishing off tasks, as in 仕事を片付ける.",
    phrase: "食器の片付け covers clearing the table and putting dishes away, not only washing.",
  },
  4127: {
    word: "ゴミ出し is the chore itself; the verb phrase is ゴミを出す, and collection day is 収集日.",
    sentence: "ゴミ出しの日 is fixed by garbage type, so people check the local calendar.",
  },
  4128: {
    word: "趣味 also means taste in style, as in 趣味がいい.",
    phrase: "Hobbies are introduced with 趣味は and a noun, as in 趣味は読書です.",
  },
  4129: {
    word: "汚れ is the noun of 汚れる, to get dirty; making something dirty is 汚す.",
    sentence: "汚れが取れない is the everyday way to say a stain won't come out.",
  },
  4130: {
    word: "節水 appears on signs and shower heads and pairs with 節電 for saving electricity.",
    phrase: "心がける means to keep something in mind as a habit, often for good practices.",
  },
  4131: {
    word: "環境 also means surroundings, as in 職場環境 or 家庭環境.",
    sentence: "環境保護 is the set term for environmental protection.",
  },
  4132: {
    word: "資源ゴミ is recyclable waste on garbage calendars, such as cans and newspapers.",
    phrase: "天然資源 is natural resources, and 人的資源 means human resources.",
    sentence: "限りある資源 is a set phrase in environmental messages.",
  },
  4133: {
    word: "省エネ is energy saving in general; 節電 is specifically cutting electricity use.",
  },
  4134: {
    word: "A リサイクルショップ is a secondhand store selling used goods.",
  },
  4135: {
    word: "廃棄 is formal and official; in daily life people say 捨てる.",
    phrase: "廃棄物 is formal for waste, while household trash is ゴミ.",
  },
  4136: {
    word: "排気ガス is exhaust from engines, often shortened to 排ガス in the news.",
    phrase: "減らす is transitive, for people reducing something; 減る is for something decreasing.",
  },
  4137: {
    word: "植物 is plants in general, paired with 動物; a botanical garden is 植物園.",
    phrase: "飾る means to decorate or display, and houseplants are called 観葉植物.",
  },
  4138: {
    word: "地球温暖化 is often shortened to 温暖化 in news and conversation.",
    phrase: "影響 takes の for its cause and に for what is affected, as in 生活に影響する.",
    sentence: "温暖化を防ぐ and 温暖化対策 are the standard ways to talk about fighting it.",
  },
  4139: {
    word: "自然災害 covers earthquakes, floods and typhoons; a disaster caused by people is 人災.",
    phrase: "備える means to prepare in advance and takes に, as in 地震に備える.",
    sentence: "防災意識 is disaster awareness, a word closely tied to 自然災害 in Japan.",
  },
  4140: {
    word: "節電 is cutting electricity use; a power outage is 停電.",
    phrase: "夏の節電 is stressed because air conditioners strain the power grid in summer.",
    sentence: "エアコンの温度を上げる means setting the cooling higher so it uses less power.",
  },
  4141: {
    word: "礼儀 is proper manners; マナー is used for everyday etiquette like train or phone manners.",
    phrase: "礼儀を守る means to observe manners, and a polite person is 礼儀正しい.",
    sentence: "礼儀をわきまえる means knowing proper conduct, formal wording often used about adults.",
  },
  4142: {
    word: "招待 is a formal invitation; the invitation card is 招待状.",
    sentence: "招待される is the usual passive form; guests reply to a 招待状 with 出席 or 欠席.",
  },
  4143: {
    word: "断り is the noun of 断る; 断りなく means without asking or giving notice.",
    sentence: "Giving 断り early is courteous; declining at the last minute can seem rude.",
  },
  4144: {
    word: "許可 is permission from someone in charge; 許可なく means without permission, common on signs.",
    phrase: "許可を得る is formal; 許可を取る and 許可をもらう are more conversational.",
    sentence: "許可を取る is the natural spoken collocation before taking photos or recording.",
  },
  4145: {
    word: "Public apologies by companies are 謝罪会見, apology press conferences.",
    sentence: "誠意を持って謝罪する is set phrasing for a sincere formal apology.",
  },
  4146: {
    word: "誘い is a casual invitation from the verb 誘う; a formal one is 招待.",
    phrase: "誘いを断る means to turn down an invitation, and 誘いに乗る means to accept one.",
    sentence: "When turning down 誘い, people soften it with また誘ってね.",
  },
  4147: {
    word: "信頼 is trust in someone's character; 信用 leans toward credibility and credit.",
    phrase: "信頼を築く means to build trust over time; losing it is 信頼を失う.",
    sentence: "信頼を得る is the collocation for earning trust.",
  },
  4148: {
    word: "否定 is denial or negation; the grammatical negative form is 否定形.",
    phrase: "Flatly saying 相手の意見を否定する sounds blunt in Japan, so people usually soften disagreement.",
    sentence: "頭ごなしに否定する is a set phrase for rejecting without hearing someone out.",
  },
  4149: {
    word: "心遣い is thoughtful care for others; 気遣い is a close synonym heard often in speech.",
  },
  4150: {
    word: "要求 is formal and firm; making demands is 要求を出す or 要求する.",
    phrase: "要求 is a firm demand; a softer request is 要望 or お願い.",
    sentence: "要求に応える means meeting demands; 応える here is written with 応, not 答.",
  },
  4151: {
    word: "薬局 fills prescriptions, while ドラッグストア mainly sells over-the-counter drugs and daily goods.",
    phrase: "近くの薬局 is the natural form; 近い薬局 sounds odd.",
  },
  4152: {
    word: "箋 is a rare kanji meaning a slip of paper, so many signs write 処方せん.",
    phrase: "処方箋をもらう is said by the patient, while the doctor 処方箋を出す.",
  },
  4153: {
    word: "The formal term on packaging and in regulations is 一般用医薬品.",
    phrase: "市販 means sold in stores, so 市販薬 needs no prescription.",
  },
  4154: {
    word: "服用 is label and doctor language; instructions mark timing with 服用前 or 服用後.",
    sentence: "一日三回 is typical label wording, often paired with 食後 for after meals.",
  },
  4155: {
    word: "副反応 became an everyday word during vaccine campaigns, covering fever and soreness after a shot.",
    sentence: "出る is used for symptoms appearing, as in 熱が出る.",
  },
  4156: {
    word: "点滴 is an IV drip; originally it means falling drops of water.",
    phrase: "点滴を受ける is neutral; people also say 点滴を打つ.",
  },
  4157: {
    word: "採血 is having blood drawn for tests; donating blood is 献血.",
    phrase: "採血を受ける is having your blood drawn; the test run on it is usually called 血液検査.",
  },
  4158: {
    word: "手術 is surgery; the surgeon performing it is the 執刀医.",
  },
  4159: {
    word: "回復 also applies to the economy or trust, as in 景気の回復.",
    phrase: "体調 is your overall physical condition, as in 体調はどうですか.",
    sentence: "順調に回復する is the set phrase for recovering well after surgery or illness.",
  },
  4160: {
    word: "通院中 means currently receiving outpatient treatment.",
    phrase: "通院 means going regularly as an outpatient; staying in hospital is 入院.",
  },
  4161: {
    word: "自治会 and 町内会 refer to largely the same kind of residents' group.",
    phrase: "集まり is a casual word for a gathering; formal meetings are 会議 or 総会.",
  },
  4162: {
    word: "回覧 alone means circulating a document, used in offices as well.",
    sentence: "Neighbors sign or stamp the 回覧板 to show they read it, then pass it on.",
  },
  4163: {
    word: "粗大 means large and coarse, so 粗大ゴミ is furniture-sized waste.",
    sentence: "粗大ゴミに出す uses に for the category you put the item out as.",
  },
  4164: {
    word: "付き合い alone also covers social obligations, like drinks with coworkers.",
    phrase: "近所付き合いを大切にする is typical of close communities; 近所付き合いが薄い means ties are weak.",
  },
  4165: {
    word: "防犯 is crime prevention; 防災, which looks similar, is disaster prevention.",
    phrase: "防犯カメラ is a security camera; 監視カメラ sounds more like surveillance.",
  },
  4166: {
    word: "避難場所 is where you flee to; 避難所 is a shelter where you can stay.",
    phrase: "最寄り means the nearest, as in 最寄り駅.",
    sentence: "指定の避難場所 is set wording, since each city designates official sites.",
  },
  4167: {
    word: "地域社会 is the local community, and 地区 is a smaller district.",
    phrase: "地域 is used for local community life; 地方 means regions or the countryside.",
    sentence: "地域の安全 and 地域活動 are common phrases in municipal notices.",
  },
  4168: {
    word: "掲示 alone is a posted notice, and 掲示物 are the items put up on a board.",
    phrase: "掲示板 is also used for online message boards.",
  },
  4169: {
    word: "町内会 membership is voluntary in principle but often expected of residents.",
    phrase: "役員 is an officer or committee member, a duty often rotated among residents.",
    sentence: "町内会の祭り is a typical event run by local associations.",
  },
  4170: {
    word: "In condominiums, the legal term for common areas is 共用部分.",
    phrase: "共有スペースの清掃 is often shared by residents on a rota, called 当番.",
  },
  4171: {
    word: "アプリ is used for smartphone software; for computer programs people often say ソフト.",
    phrase: "アプリ is short for アプリケーション, and installing one is アプリを入れる.",
  },
  4172: {
    word: "A numeric PIN for cards is 暗証番号, not パスワード.",
    phrase: "変更 is formal for change; 変える is the everyday verb.",
  },
  4173: {
    word: "検索 is searching data or the web; 探す is looking for things in general.",
    phrase: "で marks the tool you search with; ググる is slang for googling.",
  },
  4174: {
    word: "ダウンロード is often written DL online; the opposite is アップロード.",
    phrase: "ファイルをダウンロードする takes を; keeping it on your device is 保存する.",
  },
  4175: {
    word: "充電 is charging a battery; topping up money on an IC card is チャージ.",
    phrase: "スマホ is short for スマートフォン, and a dead battery is 充電が切れる.",
    sentence: "The charger itself is a 充電器.",
  },
  4176: {
    word: "通知 is an app notification or an official notice, as in 合格通知.",
    phrase: "オフにする means to turn a setting off; turning it on is オンにする.",
    sentence: "切る is the everyday verb for turning off notifications or power.",
  },
  4177: {
    word: "設定 also means the setting or premise of a story.",
    phrase: "設定を確認する is standard device talk; changing settings is 設定を変更する.",
    sentence: "Default settings are 初期設定, and restoring them is 初期化.",
  },
  4178: {
    word: "バックアップ is also used for support, as in 家族のバックアップ.",
    phrase: "バックアップを取る is the most common collocation, though バックアップする also works.",
  },
  4179: {
    word: "Data usage is 通信量, and slowed speeds after a cap are 通信制限.",
    phrase: "Phone plans measure data in gigabytes, casually called ギガ.",
  },
  4180: {
    word: "Official Japanese writes ウイルス, not ウィルス, for virus.",
    phrase: "対策 means countermeasures, as in 熱中症対策 or 防犯対策.",
    sentence: "欠かせない means indispensable and often pairs with 対策 in advice articles.",
  },
  4181: {
    word: "準備運動 comes before exercise; the cool-down afterward is 整理運動.",
    phrase: "準備運動 is the everyday word; ウォーミングアップ is also used in sports.",
  },
  4182: {
    word: "筋肉痛 is post-workout soreness; people joke that it shows up later as you age.",
    phrase: "激しい means intense, and getting sore muscles is 筋肉痛になる.",
  },
  4183: {
    word: "体力 is physical stamina; 気力 is mental energy, and the two are often paired.",
    phrase: "体力をつける means to build up stamina; losing it is 体力が落ちる.",
  },
  4184: {
    word: "柔軟 also describes flexible thinking, as in 柔軟な考え方.",
    phrase: "柔軟体操 is stretching exercise; ストレッチ is the common katakana word.",
    sentence: "柔軟性 is the noun for flexibility, formed with 性 like 安全性.",
  },
  4185: {
    word: "試合 is a single match between opponents; a whole tournament is 大会.",
    phrase: "大事な means important, and 試合 covers sports and board games alike.",
  },
  4186: {
    word: "審判 is both the referee and the act of judging.",
    phrase: "判定 is a ruling, and a mistaken call is called 誤審.",
  },
  4187: {
    word: "記録を取る means to take notes or log data.",
    sentence: "自己記録を更新する means to beat your personal best.",
  },
  4188: {
    word: "A cheer squad is an 応援団, and a fight song is an 応援歌.",
    phrase: "応援する works for sports teams and also for supporting people in general.",
  },
  4189: {
    word: "練習試合 is a practice game against another team; an official match is 公式戦.",
    phrase: "行う is formal for doing; in speech say 練習試合をする.",
  },
  4190: {
    word: "引き分け comes from 引き分ける; a win is 勝ち and a loss is 負け.",
    phrase: "引き分けになる means to end in a draw; 引き分けに終わる is also common.",
  },
  4191: {
    word: "不安 is vague unease; 心配 is concern about a specific thing or person.",
    phrase: "への links the object of worry; 将来が不安だ is also very natural.",
    sentence: "不安になる shows a change into an emotional state.",
  },
  4192: {
    word: "緊張 is nervousness or tension; a tense atmosphere is 緊張感.",
  },
  4193: {
    word: "焦り is mental panic about time or results, while 急ぐ simply means to hurry.",
    phrase: "焦りを感じる is natural, though in speech people usually just say 焦る.",
    sentence: "もと here means the root cause, as in 失敗のもと.",
  },
  4194: {
    word: "落ち込む can also mean sales or numbers dropping.",
    phrase: "ひどく intensifies negative states; とても also works here.",
  },
  4195: {
    word: "励ます is lifting someone who is down; 応援する is cheering someone on toward a goal.",
    phrase: "励ます takes the person with を, and being encouraged is 励まされる.",
  },
  4196: {
    word: "我慢 is enduring discomfort; 忍耐 is formal perseverance.",
    phrase: "我慢する takes を for what you endure; 我慢できない means you have reached your limit.",
    sentence: "我慢強く is the adverb form of 我慢強い, meaning patiently.",
  },
  4197: {
    word: "気持ちいい means pleasant or feels good, a different use of the word.",
    phrase: "気持ちを伝える means expressing feelings, often love or gratitude.",
    sentence: "感謝の気持ち is a set pairing in thank-you speeches and cards.",
  },
  4198: {
    word: "ストレスがたまる means stress builds up; the cause of stress is a ストレスの原因.",
  },
  4199: {
    word: "安心 is feeling at ease; 安全 is objective safety.",
    phrase: "安心できる means reassuring; the opposite feeling is 不安.",
  },
  4200: {
    word: "やる気 is casual; formal writing uses 意欲 or モチベーション.",
    phrase: "やる気が出る means motivation appears; lacking it is やる気がない.",
  },
  4201: {
    word: "予約席 is shown on table signs; unreserved seating, as on trains, is 自由席.",
    phrase: "Restaurants say ご用意しております politely when a reserved seat is ready.",
  },
  4202: {
    word: "注文が多い can also mean being demanding or fussy.",
    phrase: "Staff ask ご注文はお決まりですか when checking whether you are ready to order.",
  },
  4203: {
    word: "個室 is a private room at a restaurant, hospital or internet café.",
    phrase: "個室を予約する is typical for business dinners; 個室あり on a sign means private rooms are available.",
  },
  4204: {
    word: "盛り付け comes from 盛る, to heap food on a plate; the verb is 盛り付ける.",
    phrase: "盛り付け is valued highly in Japanese cooking, where appearance matters as much as taste.",
  },
  4205: {
    word: "辛口 is the opposite of 甘口, and curry menus often add 中辛 in between.",
  },
  4206: {
    word: "薄味 sounds like healthy praise, while 味が薄い can be a complaint that food is bland.",
    phrase: "薄味に仕上げる means to finish with light seasoning; the opposite is 濃い味.",
  },
  4207: {
    word: "お好み焼き literally means grilled the way you like it.",
    phrase: "好み is personal taste, and 好みがうるさい means being picky.",
    sentence: "お好みで means to your liking, a common phrase on menus.",
  },
  4208: {
    word: "偏食 is a formal word; in speech people say 好き嫌いが多い.",
    phrase: "偏食を直す is common in parenting talk; 好き嫌いをなくす says the same casually.",
  },
  4209: {
    word: "会計 also means accounting, as in 会計士, an accountant.",
    sentence: "会計を済ませる is a set pairing for settling the bill.",
  },
  4210: {
    word: "割り勘 is short for 割り前勘定; to pay separately at the register, say 別々でお願いします.",
  },
  4211: {
    word: "料 marks fees, as in 手数料 or 使用料.",
    phrase: "保険料 is the premium you pay; 保険金 is the money paid out to you.",
  },
  4212: {
    word: "書 marks documents, as in 申込書 and 領収書.",
    phrase: "サインする is common, but formal Japanese contracts often need 署名 and a 印鑑 stamp.",
  },
  4213: {
    word: "賠償 is paying for damage you caused; 補償 is compensation for a loss, often from the state.",
  },
  4214: {
    word: "訴える also means to appeal to people, as in 世論に訴える.",
  },
  4215: {
    word: "裁判 is the trial process; the court is 裁判所, and the judge is 裁判官.",
    phrase: "争う means to dispute, and filing a lawsuit is 裁判を起こす.",
  },
  4216: {
    word: "士 marks licensed professions, as in 税理士 or 会計士.",
    phrase: "弁護士に相談する uses に for the expert you ask.",
  },
  4217: {
    word: "Someone who breaks a rule is a 違反者, and illegal parking is 駐車違反.",
  },
  4218: {
    word: "Minor traffic offenses usually carry a 反則金, which is technically different from 罰金.",
  },
  4219: {
    word: "Many renters now use a 保証会社 instead of a personal guarantor.",
    phrase: "保証人になる is a serious legal responsibility, not just a character reference.",
  },
  4220: {
    word: "適用 is applying a rule to a case; 応用 is applying knowledge creatively.",
  },
  4221: {
    word: "親戚 and 親類 both mean relatives; 親戚 is more common.",
    phrase: "親戚が集まる is typical at New Year or お盆.",
    sentence: "親戚一同 is a set phrase meaning all the relatives together.",
  },
  4222: {
    word: "Someone else's grandchild is politely お孫さん, and a great-grandchild is ひ孫.",
    phrase: "孫の世話 is a common role for grandparents; people also say 孫の面倒を見る.",
  },
  4223: {
    word: "In speech people often say 甥っ子 affectionately.",
  },
  4224: {
    word: "離婚 is divorce; living apart without divorcing is 別居.",
    phrase: "決意する expresses firm resolve, stronger than 決める.",
  },
  4225: {
    word: "扶養 is financial support of dependents; the everyday verb is 養う.",
    phrase: "扶養 often appears in tax contexts, as in 扶養家族 for dependents.",
  },
  4226: {
    word: "介護 is long-term care; 介護保険 is the public insurance that covers it.",
  },
  4227: {
    word: "The passive 甘やかされる appears in 甘やかされて育った, raised spoiled.",
    phrase: "甘やかす is spoiling someone by indulging; 甘える is acting spoiled yourself.",
  },
  4228: {
    word: "厳しい also means tough for schedules or budgets, as in 厳しい状況.",
    phrase: "厳しい describes people, rules, or weather, as in 厳しい寒さ.",
  },
  4229: {
    word: "仲 is the relationship between people; 仲間 means friends or companions.",
  },
  4230: {
    word: "円満解決 means an amicable settlement.",
    sentence: "円満に works adverbially, meaning without conflict.",
  },
  4231: {
    word: "水漏れ is a water leak in general; a leaking roof is 雨漏り.",
    phrase: "水漏れ comes from 漏れる, to leak, and 起きる is the natural verb for it happening.",
    sentence: "見つかった is intransitive; 見つけた would mean someone found it.",
  },
  4232: {
    word: "排水管 carries waste water out; 水道管 carries clean water in.",
    phrase: "詰まる means to get clogged, and clearing it is 詰まりを取る.",
  },
  4233: {
    word: "修繕 is formal and used for property; repair costs are 修繕費.",
  },
  4234: {
    word: "塗装 is coating with paint; 塗る is the everyday verb to paint or spread.",
    phrase: "塗装 is professional painting of surfaces; painting a picture is 絵を描く.",
    sentence: "塗装が剥がれる is the set phrase for paint peeling off.",
  },
  4235: {
    word: "腐食 is chemical corrosion; the everyday verb for rusting is 錆びる.",
    phrase: "腐食 is corrosion of metal; food going bad is 腐る.",
  },
  4236: {
    word: "補修工事 is patching work on roads or buildings.",
  },
  4237: {
    word: "業者 is a business hired for a job; people often add さん, as in 業者さん.",
    phrase: "工事業者 is a construction contractor; 業者 alone can sound slightly impersonal.",
  },
  4238: {
    word: "見積もり is a price quote, and the written estimate is a 見積書.",
    sentence: "Getting quotes from several companies to compare is called 相見積もり.",
  },
  4239: {
    word: "工事 is construction or repair work; 建設 is building something new on a larger scale.",
    phrase: "工事中 means under construction, a very common sign.",
  },
  4240: {
    word: "点検 is a routine check for faults; 検査 is a formal test or examination.",
    phrase: "点検 is a routine check of equipment; a medical checkup is 健康診断.",
  },
  4241: {
    word: "The press crowd at a scene is called 報道陣.",
    phrase: "報道する is formal; in everyday speech say ニュースで伝える.",
  },
  4242: {
    word: "記事にする means to write something up as a news story.",
    phrase: "記事を読む is natural, and writing one is 記事を書く.",
    sentence: "載る means to appear in print, as in 新聞に載る.",
  },
  4243: {
    word: "The reporting team sent out to cover a story is a 取材班.",
  },
  4244: {
    word: "The editorial department of a magazine or paper is the 編集部.",
    phrase: "編集 is used for articles, videos, and books, and an editor is 編集者.",
  },
  4245: {
    word: "掲載 is formal for publishing; the everyday verbs are 載せる and 載る.",
    phrase: "掲載 is publishing in print or online, often seen as 掲載中.",
  },
  4246: {
    word: "偏向 means bias or slant, used mostly about media and education.",
    phrase: "偏向報道を批判する is common in debates about media fairness.",
  },
  4247: {
    word: "広告 is the advertisement itself; 宣伝 is the act of promoting something.",
    phrase: "広告を出す means to place an ad, and TV ads are also called CM.",
  },
  4248: {
    word: "虚偽の申告 is a false declaration, typical wording on official forms.",
    phrase: "虚偽 is legal and formal; in daily speech say うそ.",
  },
  4249: {
    word: "視聴 means watching and listening, so a viewer is 視聴者.",
    phrase: "視聴率 is described as 高い or 低い, not 多い or 少ない.",
  },
  4250: {
    word: "A streamer is a 配信者, and a live broadcast is 生配信.",
    phrase: "配信 covers streaming and delivery of digital content; ライブ配信 is live streaming.",
  },
};
