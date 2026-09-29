import type { GrammarNuanceEntry } from "./types";

/** Grammar nuance notes, part 1. */
export const grammarNuances1: Readonly<Record<number, GrammarNuanceEntry>> = {
  5001: {
    pattern: "にもかかわらず is formal and cannot be followed by a request or an intention.",
    sentence: "予定通りに stresses that the match went ahead completely unaffected by the rain.",
  },
  5002: {
    pattern: "ものの admits a fact but the result falls short; it sounds more written than けど.",
    sentence: "The speaker admits success but notes a lingering doubt, the typical ものの contrast.",
  },
  5003: {
    pattern: "くせに carries criticism and is not used about yourself; it is mostly spoken.",
    sentence: "ふりをする means to pretend, and the implied subject is the listener being criticized.",
  },
  5004: {
    pattern: "とはいえ grants a premise and then qualifies it; it can also open a sentence on its own as a connector.",
    sentence: "まだ stresses that the cold lingers despite what spring would lead you to expect.",
  },
  5005: {
    pattern: "に反して pairs with nouns like 予想, 期待, or 意図 and marks a result opposite to them.",
    sentence: "The result here is good, showing that に反して can mark a pleasant surprise too.",
  },
  5006: {
    pattern: "一方で can add a second aspect or set up a contrast; 反面 contrasts two sides of the same thing.",
    sentence: "としても uses も to add a second role, so 一方で here adds rather than contrasts.",
  },
  5007: {
    pattern: "はともかく sets a point aside as secondary to focus on something more important.",
    sentence: "Price is left open while quality is guaranteed, hinting that the price may not be low.",
  },
  5008: {
    pattern: "ながらも marks a contrast within the same subject and sounds more written than けど.",
  },
  5009: {
    pattern: "といっても downplays what was just said, correcting an exaggerated impression.",
    sentence: "しか with a negative verb stresses how limited the speaker's cooking really is.",
  },
  5010: {
    pattern: "だけあって praises a result that matches status or effort; unlike だけに it is almost always positive.",
    sentence: "プロ sets up the expectation, and 素晴らしかった confirms it.",
  },
  5011: {
    pattern: "さえ〜ば names a single sufficient condition; nothing else is needed.",
    sentence: "With the verb ある the form becomes さえあれば, a very common set phrase.",
  },
  5012: {
    pattern: "てからでないと is followed by a negative or difficult result such as できない or 無理だ.",
    sentence: "The polite ません suits a business reply where checking first is required.",
  },
  5013: {
    pattern: "をきっかけに is neutral and personal; を契機に and を機に sound more formal.",
    sentence: "本格的に means in earnest, showing the change the trigger set off.",
  },
  5014: {
    pattern: "に伴って links large-scale changes and is formal; its form に伴い is common in news and writing.",
  },
  5015: {
    pattern: "を契機に is formal and written; in speech をきっかけに is more natural.",
    sentence: "定年 is a life milestone, a typical noun to use with を契機に.",
  },
  5016: {
    pattern: "によって covers cause, means, passive agent, and variation, so context decides the meaning.",
    sentence: "The verb 変わる signals the depending-on use, which needs a result that varies.",
  },
  5017: {
    pattern: "ためには is usually followed by a requirement, such as 必要だ or なければならない.",
    sentence: "The implied subject is people in general, so the sentence reads as general advice.",
  },
  5018: {
    pattern: "からこそ stresses the reason itself and often reframes something negative as the cause of a good result.",
    sentence: "今の自分がある is a set expression meaning who I am today.",
  },
  5019: {
    pattern: "た上で means doing one step carefully first; it sounds more deliberate than てから.",
    sentence: "The polite request fits, since た上で often asks someone to act only after due care.",
  },
  5020: {
    pattern: "に応じて means adjusting to something that varies, like 状況, 能力, or 予算.",
    sentence: "ことがある marks this as something that happens only occasionally.",
  },
  5021: {
    pattern: "ほど〜ない compares against a standard and often follows 思った or 期待した.",
    sentence: "The past なかった reports the actual experience against the speaker's earlier expectation.",
  },
  5022: {
    pattern: "限り sets a condition that holds only while a state continues; ない限り means unless.",
    sentence: "である限り is the formal way to attach 限り to a noun describing a state.",
  },
  5023: {
    pattern: "に過ぎない downplays something as small or unimportant; にほかならない instead asserts it strongly.",
    sentence: "ほんの reinforces the smallness, a natural pairing with に過ぎない.",
  },
  5024: {
    pattern: "ばかりか adds a second, more surprising item and sounds fairly written.",
    sentence: "The second item is marked with も, which ばかりか usually pairs with.",
  },
  5025: {
    pattern: "さえ marks an extreme example to imply that everything else goes without saying.",
    sentence: "でさえ follows a noun subject, stressing that even a child succeeded.",
  },
  5026: {
    pattern: "たきり means something happened once and the expected follow-up never came.",
    sentence: "一度 with たきり is a common pairing that stresses there was no later contact.",
  },
  5027: {
    pattern: "というより corrects a description to a more accurate one; むしろ often follows it.",
  },
  5028: {
    pattern: "てたまらない expresses the speaker's own intense feeling; for others add らしい or そうだ.",
  },
  5029: {
    pattern: "てならない sounds more written than てたまらない and suits feelings that arise on their own, like worry or nostalgia.",
  },
  5030: {
    pattern: "に違いない expresses strong conviction from the speaker's own judgment and is more written than きっと.",
  },
  5031: {
    pattern: "らしい reports information heard or inferred from outside, so the speaker takes less responsibility than with ようだ.",
    sentence: "No source is named, which is typical of らしい when passing on rumors.",
  },
  5032: {
    pattern: "ようだ bases a judgment on the speaker's own observation; in speech みたいだ is more common.",
    sentence: "見ると gives the visual evidence that ようだ relies on.",
  },
  5033: {
    pattern: "とのことだ passes on a message or report and is common in business emails and polite speech.",
    sentence: "から marks the source, so the manager is the one who said it.",
  },
  5034: {
    pattern: "にしては judges something against what is normal for its category; the result can be better or worse.",
    sentence: "初めて sets a low expectation, which makes the praise stronger.",
  },
  5035: {
    pattern: "かのようだ describes something as if it were true when it is not; it is more literary than みたいだ.",
    sentence: "かのように before a verb works adverbially to describe how she behaved.",
  },
  5036: {
    pattern: "っぽい is casual and often negative, as in 忘れっぽい or 子供っぽい.",
    sentence: "The topic この映画 drops は, another casual touch.",
  },
  5037: {
    pattern: "と言われている presents a widely held view without naming a source and is common in written explanations.",
    sentence: "昔から with ている shows the view has held for a long time.",
  },
  5038: {
    pattern: "気味 marks a slight, usually unwelcome tendency, as in 風邪気味 or 疲れ気味.",
    sentence: "で links the mild cold to the sluggish feeling as its cause.",
  },
  5039: {
    pattern: "に見える gives a visual impression; with い-adjectives the form is く見える, not に.",
    sentence: "実際より sets up a comparison with reality, a common frame with 見える.",
  },
  5040: {
    pattern: "かねない warns of a possible outcome and is used only for undesirable results.",
    sentence: "The と clause gives the condition that could lead to harm.",
  },
  5041: {
    pattern: "に向けて marks a goal or target date that efforts lead toward, often with 準備 or 努力.",
  },
  5042: {
    pattern: "がちだ describes a tendency that is usually undesirable; it is not used for good habits.",
    sentence: "がちになる shows the tendency arising under a certain condition.",
  },
  5043: {
    pattern: "つつある describes gradual change in progress and sounds formal, suited to news and writing.",
  },
  5044: {
    pattern: "を通じて marks a medium or channel, and with time words like 一年 it means throughout.",
  },
  5045: {
    pattern: "において is a formal equivalent of で for a place, time, or field, typical of writing and speeches.",
  },
  5046: {
    pattern: "に関して is more formal than について and suits business or official contexts.",
    sentence: "The polite します states the speaker's own action, typical of presentations.",
  },
  5047: {
    pattern: "に基づいて means using firm grounds such as data, law, or facts, and is fairly formal.",
  },
  5048: {
    pattern: "べきだ expresses a moral or logical duty and sounds strong; ほうがいい is softer for advice.",
    sentence: "必ず strengthens the rule, making this a general moral statement.",
  },
  5049: {
    pattern: "ざるを得ない is formal; in conversation しかない sounds more natural.",
    sentence: "The ば clause gives the evidence that removes any other choice.",
  },
  5050: {
    pattern: "に当たって marks an important occasion and is common in speeches and formal greetings.",
  },
  5051: {
    pattern: "に関わらず often follows contrasting factors like 天候 or 年齢, and を問わず is a close synonym.",
  },
  5052: {
    pattern: "に対して can mark the target of an action or feeling, or contrast two things.",
    sentence: "Here it marks the target, the proposal that drew objections.",
  },
  5053: {
    pattern: "に沿って means along a physical line like 川 or following a plan, policy, or manual.",
    sentence: "The polite request form fits instructions given at work.",
  },
  5054: {
    pattern: "をめぐって marks an issue at the center of a dispute and goes with verbs like 対立 or 議論.",
  },
  5055: {
    pattern: "に際して is formal and marks a special occasion; it often appears in notices and official procedures.",
    sentence: "誓約書 is an official document, matching the formal tone of に際して.",
  },
  5056: {
    pattern: "にとって is followed by an evaluation like 大切だ, unlike に対して which is followed by attitudes or actions.",
  },
  5057: {
    pattern: "について is the neutral everyday way to say about; に関して is more formal.",
  },
  5058: {
    pattern: "に反する is the form used before nouns or at sentence end, as in 規則に反する行為.",
  },
  5059: {
    pattern: "のもとで marks the guidance, influence, or conditions someone acts under, as in 先生のもとで.",
  },
  5060: {
    pattern: "をはじめ names the most representative item first, then broadens to a larger group.",
    sentence: "全国の主要都市 is the wider group that Tokyo leads.",
  },
  5061: {
    pattern: "上に adds a second point in the same direction, both good or both bad.",
    sentence: "でもある echoes the addition, matching two positive traits.",
  },
  5062: {
    pattern: "はもちろん puts the obvious case first, then adds a less expected one marked with も.",
  },
  5063: {
    pattern: "に加えて adds a further item and is slightly formal; it often lists problems or burdens.",
    sentence: "Both items are negative, so the effects pile up.",
  },
  5064: {
    pattern: "どころか rejects the first idea and states something opposite or far beyond it.",
  },
  5065: {
    pattern: "こそ singles out one item with strong emphasis, as in 今こそ or こちらこそ.",
    sentence: "今こそ〜時だ is a set frame urging action right now.",
  },
  5066: {
    pattern: "まで adds an unexpected extreme case, often with surprise or exasperation.",
  },
  5067: {
    pattern: "をはじめとして is a slightly more formal version of をはじめ.",
    sentence: "全員 is the whole group, led by the section chief.",
  },
  5068: {
    pattern: "のみならず is formal and written; in speech だけでなく is more common.",
    sentence: "The passive されている presents the praise as coming from others.",
  },
  5069: {
    pattern: "ばかりでなく is neutral and a bit more formal than だけでなく.",
  },
  5070: {
    pattern: "反面 contrasts two opposite sides of one thing, often a merit and a drawback.",
  },
  5071: {
    pattern: "にしたがって can mean following a rule or instruction, or changing in step with another change.",
    sentence: "ていく shows the decline continuing into the future.",
  },
  5072: {
    pattern: "につれて links two gradual changes and cannot be followed by a volition or command.",
  },
  5073: {
    pattern: "ていく shows change moving forward from now or away from the speaker.",
    sentence: "だろう makes this a prediction about the future.",
  },
  5074: {
    pattern: "てくる shows change that has built up to the present or has begun to appear.",
  },
  5075: {
    pattern: "ようになる marks a gradual change in ability or habit, not a sudden event.",
    sentence: "ようやく stresses the long effort before success.",
  },
  5076: {
    pattern: "にともない is the written form of に伴って, common in news and official texts.",
  },
  5077: {
    pattern: "次第で means the outcome depends entirely on one factor; 次第だ ends a sentence.",
  },
  5078: {
    pattern: "に越したことはない recommends the ideal choice while admitting it is not strictly necessary.",
  },
  5079: {
    pattern: "かけ marks something begun but unfinished, and かけの before a noun is common, as in 読みかけの本.",
    sentence: "てしまった adds regret at leaving it unfinished.",
  },
  5080: {
    pattern: "向き means naturally suited to; 向け means designed for a target group.",
  },
  5081: {
    pattern: "ようとする shows an attempt or the moment just before an action; with とき it often means just as.",
  },
  5082: {
    pattern: "ようにする describes conscious effort to form a habit; ようにしている stresses an ongoing routine.",
    sentence: "は after the time amount means at least, setting a minimum.",
  },
  5083: {
    pattern: "てみせる shows firm resolve to prove oneself and is used about the speaker's own actions.",
    sentence: "必ず strengthens the vow, a natural pairing with てみせる.",
  },
  5084: {
    pattern: "かねる is a polite business way to refuse, softer than できない.",
    sentence: "お引き受けする is humble, making the refusal extra polite.",
  },
  5085: {
    pattern: "てでも shows willingness to use extreme means and is followed by wishes or intentions.",
  },
  5086: {
    pattern: "ないことには is followed by a negative result such as わからない or できない.",
  },
  5087: {
    pattern: "ずにはいられない expresses an urge the speaker cannot resist and is more written than ないではいられない.",
    sentence: "見ると marks a regular trigger, so the crying happens every time.",
  },
  5088: {
    pattern: "を余儀なくされる is formal and describes being forced by outside circumstances like disasters.",
    sentence: "により is a formal cause marker that suits this news style.",
  },
  5089: {
    pattern: "ようにと quotes an instruction or wish indirectly, often with 言われる or 頼まれる.",
    sentence: "The passive 言われた shows the teacher gave the instruction.",
  },
  5090: {
    pattern: "に努める is formal and common in company or official statements of effort.",
  },
  5091: {
    pattern: "からすると judges from evidence or a viewpoint and often ends with ようだ or らしい.",
  },
  5092: {
    pattern: "にしても concedes a point but still states the speaker's opinion or criticism.",
  },
  5093: {
    pattern: "からみると is close to からすると but stresses looking from a particular position.",
  },
  5094: {
    pattern: "ということだ can report hearsay or sum up a meaning, and context decides which.",
  },
  5095: {
    pattern: "わけではない partially denies a natural conclusion rather than denying everything.",
    sentence: "というわけではない wraps a whole idea before denying it.",
  },
  5096: {
    pattern: "わけにはいかない means you cannot do something for social or moral reasons, not physical inability.",
  },
  5097: {
    pattern: "ものだ states general truths or norms, and with the past tense it recalls old habits.",
  },
  5098: {
    pattern: "はずがない denies based on the speaker's reasoning and is stronger than ないだろう.",
  },
  5099: {
    pattern: "ことになっている states a rule or arrangement decided by others, not by the speaker.",
  },
  5100: {
    pattern: "にほかならない strongly asserts that something is exactly this and is formal.",
  },
  5101: {
    pattern: "はずだ is an expectation based on facts or reasoning, not a mere guess.",
    sentence: "今頃 with ている points to a present result the speaker expects.",
  },
  5102: {
    pattern: "べきではない is a strong moral judgment; ないほうがいい is gentler advice.",
    sentence: "勝手に means without permission, which is why the act is wrong.",
  },
  5103: {
    pattern: "ことはない tells someone not to worry or bother and often reassures the listener.",
  },
  5104: {
    pattern: "に決まっている is a strong, somewhat subjective assertion and sounds conversational.",
    sentence: "のだから gives the reason the speaker is so sure.",
  },
  5105: {
    pattern: "とは限らない denies a general assumption and often pairs with 必ずしも or いつも.",
  },
  5106: {
    pattern: "に相違ない is a formal, written version of に違いない.",
  },
  5107: {
    pattern: "ないとも限らない means something unlikely might still happen, so it often leads to advice to prepare.",
    sentence: "ほうがいい gives the advice that follows the warning.",
  },
  5108: {
    pattern: "ものではない gives a general warning about proper behavior and can sound preachy.",
  },
  5109: {
    pattern: "はずはない is nearly the same as はずがない; は adds a slightly stronger contrastive tone.",
  },
  5110: {
    pattern: "結果 links a long process to its outcome and is followed by what actually happened.",
    sentence: "ついに stresses that agreement came only after a long effort.",
  },
  5111: {
    pattern: "てはいけない is a direct prohibition used for rules; in casual speech it becomes ちゃいけない.",
  },
  5112: {
    pattern: "てもかまわない grants permission and is a bit more formal than てもいい.",
  },
  5113: {
    pattern: "ないわけにはいかない means you must act out of social duty, even if you would prefer not to.",
  },
  5114: {
    pattern: "ずにはすまない means circumstances or social duty demand the action; it is fairly formal.",
  },
  5115: {
    pattern: "てはならない is typical of rules, laws, and moral statements.",
    sentence: "どんな理由があっても makes the ban absolute.",
  },
  5116: {
    pattern: "ないではいられない is slightly more spoken than ずにはいられない, with the same meaning.",
  },
  5117: {
    pattern: "てはいられない means the situation does not allow you to keep doing something.",
    sentence: "The second sentence gives the reason for the urgency.",
  },
  5118: {
    pattern: "ないではおかない is written and describes something that inevitably causes a feeling or reaction.",
    sentence: "The causative させる shows the film acting on the audience.",
  },
  5119: {
    pattern: "得る is written and read うる or える, but the negative 得ない is always read えない.",
    sentence: "十分 stresses that the possibility is very real.",
  },
  5120: {
    pattern: "ものか is a strong spoken refusal; もんか is even more casual.",
    sentence: "二度と with a negative sense means never again.",
  },
  5121: {
    pattern: "をもとに marks source material, while に基づいて marks firmer grounds such as rules or data.",
    sentence: "The passive 作られた keeps the film as the topic.",
  },
  5122: {
    pattern: "として marks a role or status, and としては or としても add contrast or emphasis.",
  },
  5123: {
    pattern: "にかけては praises skill in a field and is not used for weaknesses.",
    sentence: "敵わない means to be no match for, used here to praise her.",
  },
  5124: {
    pattern: "をもって is formal and also marks a cutoff point, as in 本日をもって.",
    sentence: "いたします is humble, typical of official announcements.",
  },
  5125: {
    pattern: "によると names a source and usually ends with らしい, そうだ, or ということだ.",
  },
};
