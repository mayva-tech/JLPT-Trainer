import type { GrammarNuanceEntry } from "./types";

/** Grammar nuance notes, part 1. */
export const grammarNuances1: Readonly<Record<number, GrammarNuanceEntry>> = {
  5001: {
    pattern: "にもかかわらず is formal and objective, unlike emotional のに; it reports facts, so requests or intentions after it sound unnatural.",
    sentence: "Heavy rain normally stops a match, so going ahead as planned is the expectation-defying fact にもかかわらず reports.",
  },
  5002: {
    pattern: "ものの concedes a fact, then adds an unsatisfying or unexpected result; more written than けど and less emotional than のに.",
    sentence: "Passing should bring confidence, but it has not; a positive fact followed by a letdown is classic ものの.",
  },
  5003: {
    pattern: "くせに blames or scorns, stronger and more emotional than のに; mostly spoken, and not used about the speaker's own actions.",
    sentence: "The speaker is irritated by someone feigning ignorance; くせに turns the contrast into an accusation of dishonesty.",
  },
  5004: {
    pattern: "とはいえ admits a premise, then notes reality falls short of it; more formal than といっても, and it can open a sentence as a connector.",
    sentence: "Spring suggests warmth; とはいえ grants the season, and まだ shows reality has not caught up.",
  },
  5005: {
    pattern: "に反して follows nouns like 予想, 期待, or 意図 and marks an opposite outcome; fairly formal, and に反する or に反した modify nouns.",
    sentence: "The result is good, so に反して marks a pleasant surprise here; the outcome can be better or worse than expected.",
  },
  5006: {
    pattern: "一方で can add another side or contrast two facts; 反面 is limited to opposite sides of the same thing, often merit and drawback.",
    sentence: "Both roles are positive and としても adds the second, so 一方で here means alongside rather than in contrast.",
  },
  5007: {
    pattern: "はともかく shelves one point for now to focus on a more important one; common in pairs like 見た目はともかく、味は.",
    sentence: "Price is left open while quality is guaranteed, hinting that the price may not be low.",
  },
  5008: {
    pattern: "ながらも concedes a state and adds a contrasting fact about the same subject; more written than けど, often after 狭い or 小さい.",
    sentence: "Being busy would justify skipping exercise, yet the same person keeps going; ながらも adds quiet admiration.",
  },
  5009: {
    pattern: "といっても lowers expectations raised by the speaker's own words; often used modestly about oneself, with the real limit following.",
    sentence: "The speaker claims skill, then deflates it with しか; といっても often signals this kind of modest self-correction.",
  },
  5010: {
    pattern: "だけあって praises a result that matches status or effort; だけに can also be negative, and さすが often appears with it.",
    sentence: "プロ sets the expectation and the wonderful performance meets it; the tone is admiring, like adding さすが.",
  },
  5011: {
    pattern: "さえ〜ば names one condition that is enough by itself; with verbs it becomes stem plus さえすれば, as in 読みさえすれば.",
    sentence: "Health is framed as the only thing needed, implying other worries like money or talent matter less.",
  },
  5012: {
    pattern: "てからでないと says a step must come first, followed by a negative like できない or 無理だ; common when politely postponing a decision.",
    sentence: "A typical polite way to avoid answering on the spot; checking is set as a precondition before any reply.",
  },
  5013: {
    pattern: "をきっかけに marks an event that sparked a change, often a personal one; を契機に and を機に are more formal. The result is often a new start.",
    sentence: "Studying abroad is a one-off event that led to a lasting change, shown by 始めた; a typical trigger-and-new-start story.",
  },
  5014: {
    pattern: "に伴って links an event or change to a resulting change; formal and typical of news, and unlike につれて it also fits one-off events like 移転.",
    sentence: "Economic growth and rising living standards move together, the large social-scale change に伴って usually describes.",
  },
  5015: {
    pattern: "を契機に marks a turning point that prompts a change; formal and written, while をきっかけに is the everyday choice.",
    sentence: "Retirement is a life milestone that opens a new chapter, the kind of turning point を契機に usually marks.",
  },
  5016: {
    pattern: "によって covers cause, means, passive agent, and variation; for variation, compare によっては, which singles out some cases.",
    sentence: "The verb 変わる signals the depending-on use: different amounts of effort bring different results.",
  },
  5017: {
    pattern: "ためには is usually followed by a requirement like 必要だ or なければならない; it takes volitional verbs, while ように suits potential verbs.",
    sentence: "The implied subject is people in general, so the sentence reads as general advice.",
  },
  5018: {
    pattern: "からこそ stresses that this reason and no other explains the result; it often reframes a hardship as the cause of something good.",
    sentence: "Failure is usually negative, but からこそ recasts it as the very reason for the speaker's present self.",
  },
  5019: {
    pattern: "た上で means after first finishing a careful step like 確認 or 相談; more deliberate than てから. With the dictionary form it means in doing.",
    sentence: "A decision is requested only after careful thought; た上で stresses both the order and the care, fitting advice or instructions.",
  },
  5020: {
    pattern: "に応じて means adjusting flexibly to something that varies, like 状況, 能力, or 予算; compare に沿って, which follows a fixed plan.",
    sentence: "The situation varies and the plan shifts to match it; ことがある adds that this adjustment happens only sometimes.",
  },
  5021: {
    pattern: "ほど〜ない says something falls short of a standard; with 思った or 期待した it often reports relief or mild disappointment.",
    sentence: "The speaker expected difficulty, so 思ったほど〜なかった conveys relief that it turned out easier.",
  },
  5022: {
    pattern: "限り sets a condition that holds only while a state lasts; ない限り means unless, and 私の知る限り limits the scope of a claim.",
    sentence: "The wish to keep working is tied to health lasting; である限り implies the speaker would stop once health fails.",
  },
  5023: {
    pattern: "に過ぎない downplays something as merely that, often with ただ or ほんの; にほかならない instead asserts it strongly.",
    sentence: "Calling this just the beginning implies much more is to come, a common way に過ぎない builds anticipation.",
  },
  5024: {
    pattern: "ばかりか adds a second, more striking item marked with も or まで; more written than だけでなく and usually states facts.",
    sentence: "English is expected and Chinese is the surprise; ばかりか builds from the ordinary to the impressive.",
  },
  5025: {
    pattern: "さえ marks an extreme example, implying everything else follows; after subjects it often becomes でさえ, and すら is more written.",
    sentence: "If even a child could solve it, the problem must be easy, which may imply criticism of anyone who failed.",
  },
  5026: {
    pattern: "たきり means an action happened and the expected next step did not follow; common with 一度 or 出かけた, and っきり is casual.",
    sentence: "一度会ったきり implies more contact was hoped for, giving the sentence a wistful tone.",
  },
  5027: {
    pattern: "というより swaps a description for a more accurate one, often with むしろ; compare どころか, which rejects the first idea entirely.",
    sentence: "The speaker does not deny being tired but says sleepy fits better, a typical fine-tuning use of というより.",
  },
  5028: {
    pattern: "てたまらない expresses the speaker's intense feeling or physical sensation; conversational, and for others add らしい or ようだ.",
    sentence: "The news triggers a feeling too strong to contain; てたまらない fits spontaneous joy like this.",
  },
  5029: {
    pattern: "てならない is more written than てたまらない and suits feelings that well up on their own, as in 気がしてならない or 心配でならない.",
    sentence: "Nostalgia arises unbidden, so てならない suits it; the literary tone matches a reflective mood.",
  },
  5030: {
    pattern: "に違いない is a confident guess from the speaker's reasoning; more written than きっと〜だ, and に相違ない is even more formal.",
    sentence: "Seeing an unusual light, the speaker concludes it is a comet; に違いない shows strong conviction without proof.",
  },
  5031: {
    pattern: "らしい passes on outside information with little responsibility; do not confuse it with noun plus らしい meaning typical of, as in 男らしい.",
    sentence: "No source is named, which is typical of らしい when passing on rumors.",
  },
  5032: {
    pattern: "ようだ bases a judgment on the speaker's own observation; in speech みたいだ is more common.",
    sentence: "Looking at the sky gives direct evidence for ようだ; 降りそうだ would stress that rain looks imminent.",
  },
  5033: {
    pattern: "とのことだ relays a message or report and is more formal than そうだ; common in business emails when passing on what someone said.",
    sentence: "から marks the source, so the manager is the one who said it.",
  },
  5034: {
    pattern: "にしては judges against what is normal for a specific premise, for better or worse; わりに compares degree more loosely.",
    sentence: "初めて sets a low expectation, which makes the praise stronger.",
  },
  5035: {
    pattern: "かのようだ describes something as if it were true when it is not; it is more literary than みたいだ.",
    sentence: "She actually knew, so かのように highlights the gap between her act and the truth.",
  },
  5036: {
    pattern: "っぽい is casual and often negative, as in 子供っぽい or 忘れっぽい; 子供らしい instead praises a child for acting like one.",
    sentence: "子供っぽい is a mild criticism, but だけど面白い balances it, showing the slightly negative tone of っぽい.",
  },
  5037: {
    pattern: "と言われている presents a widely held view without naming a source and is common in written explanations.",
    sentence: "昔から with ている shows a long-held view; と言われている keeps the claim impersonal, which suits guidebooks and textbooks.",
  },
  5038: {
    pattern: "気味 marks a slight, unwelcome state or tendency, as in 風邪気味 or 疲れ気味; がち instead stresses that something happens often.",
    sentence: "風邪気味 means signs of a cold rather than a full one, which fits the vague だるい feeling.",
  },
  5039: {
    pattern: "に見える gives a visual impression; with い-adjectives the form is く見える, not に.",
    sentence: "実際より sets up a comparison with reality, a common frame with 見える.",
  },
  5040: {
    pattern: "かねない warns that a bad outcome could happen and is used only for undesirable results; compare かねる, a polite refusal.",
    sentence: "The と clause names the risky behavior, and かねない sounds like a caution to the listener.",
  },
  5041: {
    pattern: "に向けて marks a goal or target date that efforts lead toward, often with 準備 or 努力.",
    sentence: "Graduation is the target, and the ongoing ている shows effort building toward it.",
  },
  5042: {
    pattern: "がちだ describes an undesirable tendency, often with verbs like 忘れる or 休む; unlike 気味, it stresses frequency.",
    sentence: "Skipping meals is a bad habit that shows up when busy, the typical negative tendency がち describes.",
  },
  5043: {
    pattern: "つつある describes gradual change in progress and sounds formal, suited to news and writing.",
    sentence: "Digitalization is a slow social change still underway, the kind of trend つつある typically reports.",
  },
  5044: {
    pattern: "を通じて marks a medium or intermediary, like a person or channel, and with time spans like 一年を通じて it means throughout.",
    sentence: "Email is the channel that makes worldwide contact possible, the medium use of を通じて.",
  },
  5045: {
    pattern: "において is a formal equivalent of で for a place, time, or field, typical of writing and speeches.",
    sentence: "The broad field 現代社会 and formal 不可欠だ give this the essay tone において typically carries.",
  },
  5046: {
    pattern: "に関して is more formal than について and suits business or official contexts.",
    sentence: "The polite します states the speaker's own action, typical of presentations.",
  },
  5047: {
    pattern: "に基づいて means acting on firm grounds like data, law, or facts and is fairly formal; をもとに is looser, marking source material.",
    sentence: "Data serves as an objective foundation, suggesting the plan is reliable rather than a guess.",
  },
  5048: {
    pattern: "べきだ expresses a moral or logical duty and sounds strong; ほうがいい is softer for advice.",
    sentence: "Keeping promises is a general moral duty, so べきだ with 必ず sounds principled rather than like personal advice.",
  },
  5049: {
    pattern: "ざるを得ない means being forced by circumstances against one's wish; formal, with しかない more natural in speech. する becomes せざるを得ない.",
    sentence: "The speaker would rather not admit it, but the evidence leaves no choice; reluctance is built into ざるを得ない.",
  },
  5050: {
    pattern: "に当たって marks an important occasion and what one does for it; common in speeches and formal greetings, and close to に際して.",
    sentence: "Graduation is a milestone, and thanking teachers is a fitting formal act for such an occasion.",
  },
  5051: {
    pattern: "に関わらず often follows opposites or ranges like 天候, 有無, or 年齢, and を問わず is a close synonym.",
    sentence: "Experience is treated as irrelevant, typical of job ads that value motivation over background.",
  },
  5052: {
    pattern: "に対して can mark the target of an action or feeling, or contrast two things.",
    sentence: "Here it marks the target, the proposal that drew objections.",
  },
  5053: {
    pattern: "に沿って means along a physical line like 川 or following a plan, policy, or manual.",
    sentence: "Following a manual step by step is the plan-following use of に沿って, typical of workplace instructions.",
  },
  5054: {
    pattern: "をめぐって marks an issue at the center of a dispute and goes with verbs like 対立 or 議論.",
    sentence: "Land rights are a contested issue with opposing sides, which is why をめぐって fits a long court case.",
  },
  5055: {
    pattern: "に際して is formal and marks a special occasion; it often appears in notices and official procedures.",
    sentence: "誓約書 is an official document, matching the formal tone of に際して.",
  },
  5056: {
    pattern: "にとって is followed by an evaluation like 大切だ, unlike に対して which is followed by attitudes or actions.",
    sentence: "Play is judged from a child's viewpoint, the evaluative use にとって calls for.",
  },
  5057: {
    pattern: "について is the neutral everyday way to say about; に関して is more formal.",
    sentence: "Environmental issues are the topic of discussion; について is the natural choice in a class setting.",
  },
  5058: {
    pattern: "に反する is the form used before nouns or at sentence end, as in 規則に反する行為.",
    sentence: "An action is judged against a rule, a typical use in formal criticism or warnings.",
  },
  5059: {
    pattern: "のもとで marks the guidance, influence, or conditions someone acts under, as in 先生のもとで or 法のもとで; fairly formal.",
    sentence: "Strict guidance is the setting in which the skills were honed, a typical mentor-and-learner use of のもとで.",
  },
  5060: {
    pattern: "をはじめ names the most representative item first, then broadens to a larger group.",
    sentence: "Tokyo is the natural lead example; putting a minor town first with をはじめ would sound odd.",
  },
  5061: {
    pattern: "上に adds a second point in the same direction, both good or both bad; mixing a merit with a drawback sounds unnatural.",
    sentence: "でもある echoes the addition, matching two positive traits.",
  },
  5062: {
    pattern: "はもちろん puts the obvious case first, then adds a less expected one with も; more conversational than はもとより.",
    sentence: "Japanese is taken as a given, so はもちろん highlights English as the extra skill.",
  },
  5063: {
    pattern: "に加えて adds a further item and is slightly formal; it often lists problems or burdens.",
    sentence: "Both items are negative, so the effects pile up.",
  },
  5064: {
    pattern: "どころか rejects the expected idea and says reality is the opposite or far beyond it, often with surprise or frustration.",
    sentence: "Rest was hoped for, but overtime increased instead, the frustrating reversal どころか expresses.",
  },
  5065: {
    pattern: "こそ singles out one item with strong emphasis, as in 今こそ or こちらこそ.",
    sentence: "今こそ〜時だ is a set frame urging action right now.",
  },
  5066: {
    pattern: "まで adds an unexpected extreme case, often with surprise or exasperation.",
    sentence: "Children are an unlikely group to know the title, so まで implies the movie is extremely well known.",
  },
  5067: {
    pattern: "をはじめとして is a stiffer をはじめ, common in speeches and official lists; it always heads a wider group, never a lone item.",
    sentence: "課長 heads the list as the most notable person, implying that if even the boss stayed late, everyone did.",
  },
  5068: {
    pattern: "のみならず is formal and written; in speech だけでなく is more common.",
    sentence: "The passive されている presents the praise as coming from others.",
  },
  5069: {
    pattern: "ばかりでなく is neutral and a bit more formal than だけでなく.",
    sentence: "Sports and study are both strengths, and も marks the added one in the typical ばかりでなく〜も frame.",
  },
  5070: {
    pattern: "反面 contrasts opposite sides of one thing, often a merit and a drawback; 一方で is broader and can compare separate things.",
    sentence: "Convenience and dependence are two sides of the same thing, the merit-and-drawback pairing 反面 is used for.",
  },
  5071: {
    pattern: "にしたがって can mean following a rule or instruction, or changing in step with another change.",
    sentence: "ていく shows the decline continuing into the future.",
  },
  5072: {
    pattern: "につれて links two gradual changes; the result is usually a natural change rather than a volition or command.",
    sentence: "Spring arriving and days lengthening both change gradually and together, exactly what につれて links.",
  },
  5073: {
    pattern: "ていく shows change moving forward from now; てくる shows change up to now, so 増えてきた looks back while 増えていく looks ahead.",
    sentence: "これからも with ていく projects the change into the future; 変わってきた would describe change up to now.",
  },
  5074: {
    pattern: "てくる shows change that has built up to the present or has begun to appear.",
    sentence: "The rise is felt up to now, so てきた shows a change the speaker has noticed approaching the present.",
  },
  5075: {
    pattern: "ようになる marks a gradual change in ability or habit; ようにする is a conscious effort, and できるようになった celebrates progress.",
    sentence: "ようやく stresses the long effort before success.",
  },
  5076: {
    pattern: "にともない is the written connective form of に伴って, typical of news and official texts; に伴う modifies nouns.",
    sentence: "Population growth and a housing shortage are social-scale changes, suiting the news-report style of にともない.",
  },
  5077: {
    pattern: "次第で means the outcome depends entirely on one factor, often effort or choice; 次第だ ends a sentence, and V stem plus 次第 means as soon as.",
    sentence: "Effort is the deciding factor, making this an encouraging message that success is within anyone's control.",
  },
  5078: {
    pattern: "に越したことはない recommends the ideal choice while admitting it is not strictly necessary.",
    sentence: "Early to bed, early to rise is offered as the ideal habit, a common advice-giving use.",
  },
  5079: {
    pattern: "かけ marks something begun but unfinished, and かけの before a noun is common, as in 読みかけの本.",
    sentence: "てしまった adds regret at leaving it unfinished.",
  },
  5080: {
    pattern: "向き means naturally suited to someone; 向け means made for a target group, as in 子供向けの番組.",
    sentence: "The course suits beginners by its nature, such as its level, rather than being designed only for them.",
  },
  5081: {
    pattern: "ようとする shows an attempt or the moment just before an action; with とき it often means just as.",
    sentence: "The action was interrupted at the very moment of starting, a common use with とき or ところ.",
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
    pattern: "かねる is a polite business refusal, softer than できない; do not confuse it with かねない, which warns of a bad outcome.",
    sentence: "お引き受けする is humble, making the refusal extra polite.",
  },
  5085: {
    pattern: "てでも shows willingness to use extreme means and is followed by wishes or intentions.",
    sentence: "Going into debt is a drastic step, so てでも shows how badly the speaker wants the dream.",
  },
  5086: {
    pattern: "ないことには is followed by a negative result like わからない or 始まらない and stresses that a step is essential.",
    sentence: "Trying it yourself is framed as the essential step, a common way to urge action.",
  },
  5087: {
    pattern: "ずにはいられない expresses an irresistible urge or reaction and is more written than ないではいられない; する becomes せずには.",
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
    pattern: "に努める is formal and common in company or official statements of effort; do not confuse it with に勤める, to work for.",
    sentence: "Service improvement is a typical corporate goal, and ている presents the effort as ongoing.",
  },
  5091: {
    pattern: "からすると judges from evidence or a viewpoint and often ends with ようだ or らしい.",
    sentence: "Her expression is the evidence and ようだ softens the conclusion, the typical inference frame.",
  },
  5092: {
    pattern: "にしても concedes a point but still states the speaker's opinion or criticism; にしろ and にせよ are more written.",
    sentence: "Even granting it was a joke, the speaker still finds the remark too harsh, a typical concession then criticism.",
  },
  5093: {
    pattern: "からみると is close to からすると but stresses looking from a particular position.",
    sentence: "The expert's position is the viewpoint, implying laypeople might miss the flaws.",
  },
  5094: {
    pattern: "ということだ can report hearsay or sum up a meaning, and context decides which.",
    sentence: "The news of the delay comes from outside, so ということだ reads as hearsay here.",
  },
  5095: {
    pattern: "わけではない partially denies a natural conclusion rather than denying everything.",
    sentence: "The speaker rejects the belief that money guarantees happiness without saying money is useless.",
  },
  5096: {
    pattern: "わけにはいかない rules an action out for social or moral reasons, not physical inability; できない lacks this sense of duty.",
    sentence: "The promise matters, so forgetting it is ruled out on moral grounds rather than ability.",
  },
  5097: {
    pattern: "ものだ states general truths or norms, and with the past tense it recalls old habits.",
    sentence: "The sentence states a general truth about aging, the kind of wisdom ものだ typically conveys.",
  },
  5098: {
    pattern: "はずがない denies based on the speaker's reasoning and is stronger than ないだろう.",
    sentence: "The speaker's knowledge of his character is the basis for rejecting the idea outright.",
  },
  5099: {
    pattern: "ことになっている states a rule or arrangement decided by others, not by the speaker.",
    sentence: "The uniform rule is set by the school, not the speaker, the typical external-rule use.",
  },
  5100: {
    pattern: "にほかならない asserts strongly and formally that something is exactly this; contrast に過ぎない, which downplays.",
    sentence: "The success is credited entirely to the team, a typical formal way to give credit or thanks.",
  },
  5101: {
    pattern: "はずだ is an expectation based on facts or reasoning, not a mere guess.",
    sentence: "今頃 with ている points to a present result the speaker expects.",
  },
  5102: {
    pattern: "べきではない is a strong moral judgment; ないほうがいい is gentler advice.",
    sentence: "Publishing others' private information is framed as a moral wrong, not just unwise, so べきではない fits.",
  },
  5103: {
    pattern: "ことはない tells someone not to worry or bother and often reassures the listener.",
    sentence: "The second sentence gives the reason, reassuring the listener that so much apologizing is unnecessary.",
  },
  5104: {
    pattern: "に決まっている is a strong, somewhat subjective assertion and sounds conversational.",
    sentence: "のだから gives the reason the speaker is so sure.",
  },
  5105: {
    pattern: "とは限らない denies a general assumption and often pairs with 必ずしも or いつも.",
    sentence: "The common assumption that expensive means good is challenged, with 必ずしも as the typical partner.",
  },
  5106: {
    pattern: "に相違ない is a stiff, written に違いない found in essays and detective prose; in conversation it sounds theatrical.",
    sentence: "Handwriting is solid evidence, which suits the formal, confident tone of に相違ない.",
  },
  5107: {
    pattern: "ないとも限らない means something unlikely might still happen, so it often leads to advice to prepare.",
    sentence: "ほうがいい gives the advice that follows the warning.",
  },
  5108: {
    pattern: "ものではない gives a general warning about proper behavior and can sound preachy.",
    sentence: "Gossiping about secrets is framed as a breach of common decency, typical of a gentle reprimand.",
  },
  5109: {
    pattern: "はずはない is nearly the same as はずがない; は adds a slightly stronger contrastive tone.",
    sentence: "The speaker's view of him makes the rude remark unthinkable, the reasoning-based denial はずはない expresses.",
  },
  5110: {
    pattern: "結果 links a long process to its outcome and is followed by what actually happened.",
    sentence: "ついに stresses that agreement came only after a long effort.",
  },
  5111: {
    pattern: "てはいけない is a direct prohibition used for rules; in casual speech it becomes ちゃいけない.",
    sentence: "Exam rules are a typical setting for てはいけない, a clear prohibition from authority.",
  },
  5112: {
    pattern: "てもかまわない grants permission and is a bit more formal than てもいい.",
    sentence: "Permission is granted on a condition, in a tone slightly more formal than てもいい.",
  },
  5113: {
    pattern: "ないわけにはいかない means you must act out of social duty, even if you would prefer not to.",
    sentence: "A request from the boss creates social pressure, so refusing is not a realistic option.",
  },
  5114: {
    pattern: "ずにはすまない means circumstances or social duty demand the action; it is fairly formal, and ないではすまない is similar.",
    sentence: "Having made a mistake, the speaker feels the situation will not be settled without an apology.",
  },
  5115: {
    pattern: "てはならない is a firm prohibition typical of rules, laws, and moral statements; more formal than てはいけない.",
    sentence: "どんな理由があっても makes the ban absolute; てはならない suits moral rules like this better than casual てはいけない.",
  },
  5116: {
    pattern: "ないではいられない is slightly more spoken than ずにはいられない, with the same meaning.",
    sentence: "His story triggered laughter the speaker could not hold back, an involuntary reaction.",
  },
  5117: {
    pattern: "てはいられない means the situation does not allow you to keep doing something.",
    sentence: "The deadline tomorrow makes relaxing unaffordable, showing the urgency てはいられない conveys.",
  },
  5118: {
    pattern: "ないではおかない is written and describes something that inevitably causes a feeling or reaction.",
    sentence: "The causative させる shows the film acting on the audience.",
  },
  5119: {
    pattern: "得る is written and read うる or える, but the negative 得ない is read えない; common with ある, 起こる, and 考える.",
    sentence: "十分 stresses that the possibility is very real.",
  },
  5120: {
    pattern: "ものか is a strong spoken refusal; もんか is even more casual.",
    sentence: "The shop's rudeness fuels the anger, and 二度と with ものか turns it into a vow of refusal.",
  },
  5121: {
    pattern: "をもとに marks source material, while に基づいて marks firmer grounds such as rules or data.",
    sentence: "A true story is the source material the film draws on, the typical use of をもとに.",
  },
  5122: {
    pattern: "として marks a role or status, and としては or としても add contrast or emphasis.",
    sentence: "He attended not as an individual but in the role of representative, which is what として marks.",
  },
  5123: {
    pattern: "にかけては praises skill in a field and is generally not used for weaknesses.",
    sentence: "Admitting you are no match for her is a way to praise her cooking skill.",
  },
  5124: {
    pattern: "をもって is formal and also marks a cutoff point, as in 本日をもって.",
    sentence: "本日をもって marks the end date, a fixed phrase on closing notices; in speech, 今日で says the same thing.",
  },
  5125: {
    pattern: "によると names a source and usually ends with らしい, そうだ, or ということだ.",
    sentence: "The forecast is named as the source, and らしい at the end completes the hearsay frame.",
  },
};
