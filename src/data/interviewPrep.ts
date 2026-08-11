/** Online job interview practice — one section at a time. */

export type InterviewLine = {
  japanese: string;
  /** Hepburn-style romaji under the Japanese line. */
  romaji: string;
};

export type InterviewSection = {
  id: string;
  number: number;
  /** Short Japanese section title (stage chip / TOC). */
  title: string;
  /** Short English title shown on the chip and spoken by Andrew. */
  titleEn: string;
  /** Spoken Japanese lines (Nanami) with romaji under each. */
  lines: InterviewLine[];
  /** Short simple English for Andrew (not a full line-by-line translation). */
  english: string;
};

/** Full Japanese text spoken by Nanami for a section. */
export function interviewJapaneseText(section: InterviewSection): string {
  return section.lines.map((line) => line.japanese).join("");
}

/** One-line stage chip: Interview N. 日本語 · English */
export function interviewTitleChip(section: InterviewSection): string {
  return `Interview ${section.number}. ${section.title} · ${section.titleEn}`;
}

/** Nanami speaks this before section content. */
export function interviewTitleSpeakJa(section: InterviewSection): string {
  return `セクション${section.number}。${section.title}`;
}

/** Andrew speaks this before section content. */
export function interviewTitleSpeakEn(section: InterviewSection): string {
  return `Interview ${section.number}. ${section.titleEn}`;
}

export const interviewPrepSections: InterviewSection[] = [
  {
    id: "01-join",
    number: 1,
    title: "Zoom接続・開始",
    titleEn: "Zoom join",
    lines: [
      {
        japanese: "あ、映りましたね。",
        romaji: "A, utsurimashita ne.",
      },
      {
        japanese: "ビリヤ・メイです。",
        romaji: "Biriya Mei desu.",
      },
      {
        japanese:
          "本日はオンラインで面接のお時間をいただき、ありがとうございます。",
        romaji:
          "Honjitsu wa onrain de mensetsu no ojikan o itadaki, arigatō gozaimasu.",
      },
      {
        japanese: "よろしくお願いします。",
        romaji: "Yoroshiku onegaishimasu.",
      },
      {
        japanese:
          "あの、えーと、音声と画面、こちら問題なく聞こえて見えていますが、そちらも大丈夫でしょうか。",
        romaji:
          "Ano, ēto, onsei to gamen, kochira mondai naku kikoete mieteimasu ga, sochira mo daijōbu deshō ka.",
      },
      {
        japanese: "はい、ありがとうございます。",
        romaji: "Hai, arigatō gozaimasu.",
      },
      {
        japanese: "こちらも問題ありません。",
        romaji: "Kochira mo mondai arimasen.",
      },
    ],
    english:
      "Oh, my camera’s on. I’m Villa May. Thank you for meeting online today. Can you hear and see me okay? Good — everything’s fine on my side too.",
  },
  {
    id: "02-greeting",
    number: 2,
    title: "最初のあいさつ",
    titleEn: "Opening greeting",
    lines: [
      {
        japanese:
          "改めまして、本日はお時間をいただき、ありがとうございます。",
        romaji:
          "Aratamemashite, honjitsu wa ojikan o itadaki, arigatō gozaimasu.",
      },
      {
        japanese:
          "えーと、少し緊張しているんですけど、できるだけ分かりやすくお話しできればと思っています。",
        romaji:
          "Ēto, sukoshi kinchō shiteiru n desu kedo, dekiru dake wakariyasuku ohanashi dekireba to omotteimasu.",
      },
      {
        japanese: "どうぞよろしくお願いします。",
        romaji: "Dōzo yoroshiku onegaishimasu.",
      },
    ],
    english:
      "Thank you for your time today. I’m a little nervous, but I’ll try to speak clearly. Please treat me well.",
  },
  {
    id: "03-self-intro",
    number: 3,
    title: "自己紹介",
    titleEn: "Self-introduction",
    lines: [
      {
        japanese: "はい。えっと、ビリヤ・メイと申します。",
        romaji: "Hai. Etto, Biriya Mei to mōshimasu.",
      },
      {
        japanese:
          "今はBREXA Technologyの社員として、Lenovo Japanのプロジェクトに入っています。",
        romaji:
          "Ima wa BREXA Technology no shain to shite, Lenovo Japan no purojekuto ni haitteimasu.",
      },
      {
        japanese:
          "いま担当しているのは、ノートパソコン向けカメラモジュールの、光学と画質の評価です。",
        romaji:
          "Ima tantō shiteiru no wa, nōto pasokon-muke kamera mojūru no, kōgaku to gashitsu no hyōka desu.",
      },
      {
        japanese:
          "普段はImatestを使って、MTFとかSFR、画角、歪曲、倍率色収差、周辺光量、フレア、ベイリンググレア、あたりを評価しています。",
        romaji:
          "Fudan wa Imatest o tsukatte, MTF toka SFR, gakaku, waikyoku, bairitsu iroshūsa, shūhen kōryō, furea, beiringu gurea, atari o hyōka shiteimasu.",
      },
      {
        japanese:
          "あと、PythonとかPowerShellとかExcelを使って、結果の抽出とか、仕様との比較、レポート作成みたいな作業を、一部効率化しています。",
        romaji:
          "Ato, Python toka PowerShell toka Excel o tsukatte, kekka no chūshutsu toka, shiyō to no hikaku, repōto sakusei mitai na sagyō o, ichibu kōritsuka shiteimasu.",
      },
      {
        japanese:
          "前は、カメラSDKとかベータドライバの検証、あとは新しいカメラ機能とか社内ツールのPoC開発もやっていました。",
        romaji:
          "Mae wa, kamera SDK toka bēta doraiba no kenshō, ato wa atarashii kamera kinō toka shanai tsūru no PoC kaihatsu mo yatteimashita.",
      },
      {
        japanese:
          "んで、これまでの評価とか検証、PoC開発の経験を活かして、これからは画質評価とか開発にも、もう少し深く関わりたいと思っています。",
        romaji:
          "Nde, kore made no hyōka toka kenshō, PoC kaihatsu no keiken o ikashite, kore kara wa gashitsu hyōka toka kaihatsu ni mo, mō sukoshi fukaku kakawaritai to omotteimasu.",
      },
      {
        japanese: "本日はどうぞよろしくお願いします。",
        romaji: "Honjitsu wa dōzo yoroshiku onegaishimasu.",
      },
    ],
    english:
      "I’m Villa May. I work at BREXA on Lenovo Japan’s laptop camera project. I test camera image quality with Imatest. I also use Python and Excel to make reports faster. Before that, I tested camera software and built small tools. Now I want deeper image-quality work.",
  },
  {
    id: "04-current-job",
    number: 4,
    title: "現在の仕事内容",
    titleEn: "Current job",
    lines: [
      {
        japanese:
          "はい。えっと、今は、カメラモジュールの光学性能と画質を、定量的に評価しています。",
        romaji:
          "Hai. Etto, ima wa, kamera mojūru no kōgaku seinō to gashitsu o, teiryōteki ni hyōka shiteimasu.",
      },
      {
        japanese: "評価では、Imatestを毎日使っています。",
        romaji: "Hyōka de wa, Imatest o mainichi tsukatteimasu.",
      },
      {
        japanese:
          "たとえばMTFとかSFRだと、画像の中心だけじゃなくて、周辺の結果もちゃんと見るようにしています。",
        romaji:
          "Tatoeba MTF toka SFR da to, gazō no chūshin dake ja nakute, shūhen no kekka mo chanto miru yō ni shiteimasu.",
      },
      {
        japanese:
          "そのほか、画角、TV歪曲、倍率色収差、周辺光量、フレア、あとISO 18844のベイリンググレア、あたりも評価しています。",
        romaji:
          "Sono hoka, gakaku, TV waikyoku, bairitsu iroshūsa, shūhen kōryō, furea, ato ISO 18844 no beiringu gurea, atari mo hyōka shiteimasu.",
      },
      {
        japanese:
          "カメラ専用のツールでRAW画像を取得して、複数サンプルを比較する、っていう流れです。",
        romaji:
          "Kamera sen'yō no tsūru de RAW gazō o shutoku shite, fukusū sanpuru o hikaku suru, tte iu nagare desu.",
      },
      {
        japanese:
          "で、そのあと仕様とか社内の評価基準と比べて、異常値とか規格外の結果がないかチェックして、合否を判断しています。",
        romaji:
          "De, sono ato shiyō toka shanai no hyōka kijun to kurabete, ijōchi toka kikakugai no kekka ga nai ka chekku shite, gōhi o handan shiteimasu.",
      },
      {
        japanese:
          "最後に、結果をまとめて、設計担当とかプロジェクトメンバー向けの評価レポートを作っています。",
        romaji:
          "Saigo ni, kekka o matomete, sekkei tantō toka purojekuto menbā-muke no hyōka repōto o tsukutteimasu.",
      },
    ],
    english:
      "I measure camera optics and image quality every day with Imatest. I check center and edge results, then compare them with the spec. If something looks wrong, I check it carefully. Then I write a report for the design team.",
  },
  {
    id: "05-imatest",
    number: 5,
    title: "Imatestの経験",
    titleEn: "Imatest experience",
    lines: [
      {
        japanese: "はい。えーと、Imatestは、今の業務で毎日使っています。",
        romaji: "Hai. Ēto, Imatest wa, ima no gyōmu de mainichi tsukatteimasu.",
      },
      {
        japanese:
          "評価条件を確認して画像を解析して、出てきた数値とかグラフを見る、っていう作業です。",
        romaji:
          "Hyōka jōken o kakunin shite gazō o kaiseki shite, detekita sūchi toka gurafu o miru, tte iu sagyō desu.",
      },
      {
        japanese:
          "で、結果を仕様と比べて、合否判定とか異常値のチェックもやっています。",
        romaji:
          "De, kekka o shiyō to kurabete, gōhi hantei toka ijōchi no chekku mo yatteimasu.",
      },
      {
        japanese:
          "ただ、あの、Imatestそのもののアルゴリズムを開発してる、っていうわけじゃなくて、あくまで評価ツールとして実務で使ってるレベルです。",
        romaji:
          "Tada, ano, Imatest sono mono no arugorizumu o kaihatsu shiteru, tte iu wake ja nakute, akumade hyōka tsūru to shite jitsumu de tsukatteru reberu desu.",
      },
    ],
    english:
      "I use Imatest every day. I analyze images, check the numbers, and compare them with the spec. I don’t build Imatest itself — I use it as a work tool.",
  },
  {
    id: "06-python",
    number: 6,
    title: "Pythonの経験",
    titleEn: "Python experience",
    lines: [
      {
        japanese:
          "はい。えっと、Pythonは、主に評価業務の効率化と、あとPoC開発に使っています。",
        romaji:
          "Hai. Etto, Python wa, omo ni hyōka gyōmu no kōritsuka to, ato PoC kaihatsu ni tsukatteimasu.",
      },
      {
        japanese:
          "今の業務だと、テスト操作の一部とか、結果の抽出、ファイル処理、仕様との比較、レポート作成、あたりを効率化しています。",
        romaji:
          "Ima no gyōmu da to, tesuto sōsa no ichibu toka, kekka no chūshutsu, fairu shori, shiyō to no hikaku, repōto sakusei, atari o kōritsuka shiteimasu.",
      },
      {
        japanese:
          "前のイノベーションチームでは、上司とかチームから新しいアイデアの相談を受けて、Pythonで簡単なPoCとか社内ツールを作っていました。",
        romaji:
          "Mae no inobēshon chīmu de wa, jōshi toka chīmu kara atarashii aidea no sōdan o ukete, Python de kantan na PoC toka shanai tsūru o tsukutteimashita.",
      },
      {
        japanese:
          "で、作ったものをチームに見せて、フィードバックをもらって、それに合わせて機能とか操作方法を直す、っていう感じでした。",
        romaji:
          "De, tsukutta mono o chīmu ni misete, fīdobakku o moratte, sore ni awasete kinō toka sōsa hōhō o naosu, tte iu kanji deshita.",
      },
      {
        japanese:
          "まあ、PoCなので、必ず製品化されるわけじゃないんですけど、技術的にできるかどうかを確認するための開発、っていう位置づけでした。",
        romaji:
          "Mā, PoC na node, kanarazu seihinka sareru wake ja nai n desu kedo, gijutsuteki ni dekiru ka dō ka o kakunin suru tame no kaihatsu, tte iu ichidzuke deshita.",
      },
    ],
    english:
      "I use Python to make testing and reports faster. Before, I also built small demo tools for new ideas. We showed them to the team, got feedback, and improved them. Those demos were for checking if an idea works.",
  },
  {
    id: "07-why-change",
    number: 7,
    title: "なぜ転職を考えているか",
    titleEn: "Why change jobs",
    lines: [
      {
        japanese:
          "そうですね。今の仕事自体は満足していて、カメラ評価の経験もかなり積めたんです。",
        romaji:
          "Sō desu ne. Ima no shigoto jitai wa manzoku shiteite, kamera hyōka no keiken mo kanari tsumeta n desu.",
      },
      {
        japanese:
          "ただ、えーと、もっとキャリアアップしたいと思っています。",
        romaji: "Tada, ēto, motto kyaria appu shitai to omotteimasu.",
      },
      {
        japanese:
          "今の派遣会社だと、なかなか成長の機会が得られないと感じていて。",
        romaji:
          "Ima no haken gaisha da to, nakanaka seichō no kikai ga erarenai to kanjiteite.",
      },
      {
        japanese:
          "んで、自分のスキルをもっと新しい形で活かしたい、っていう思いもあります。",
        romaji:
          "Nde, jibun no sukiru o motto atarashii katachi de ikashitai, tte iu omoi mo arimasu.",
      },
      {
        japanese: "なので、より成長できる環境を探しています。",
        romaji: "Nanode, yori seichō dekiru kankyō o sagashiteimasu.",
      },
    ],
    english:
      "I like my current work, and I’ve learned a lot. But I want to level up my career. I can’t find enough growth opportunities at my current dispatch company. I also want to use my skills in new ways.",
  },
  {
    id: "08-why-quest",
    number: 8,
    title: "なぜQuest Globalか",
    titleEn: "Why Quest Global",
    lines: [
      {
        japanese:
          "はい。えーと、Quest Globalは、いろんなグローバル企業の技術開発プロジェクトに関わっている、っていうところに魅力を感じました。",
        romaji:
          "Hai. Ēto, Quest Global wa, ironna gurōbaru kigyō no gijutsu kaihatsu purojekuto ni kakawatteiru, tte iu tokoro ni miryoku o kanjimashita.",
      },
      {
        japanese:
          "私は日本語と英語、両方使いながら、海外チームとか日本のエンジニアと仕事をしてきました。",
        romaji:
          "Watashi wa Nihongo to Eigo, ryōhō tsukainagara, kaigai chīmu toka Nihon no enjinia to shigoto o shitekimashita.",
      },
      {
        japanese:
          "あと、カメラ評価とかPoC開発、技術レポート作成の経験もあるので、Quest Globalのプロジェクトでも活かせるかなと思っています。",
        romaji:
          "Ato, kamera hyōka toka PoC kaihatsu, gijutsu repōto sakusei no keiken mo aru node, Quest Global no purojekuto demo ikaseru kana to omotteimasu.",
      },
    ],
    english:
      "Quest Global works on tech projects for many global companies. That attracts me. I already work in Japanese and English with Japan and overseas teams. I hope my camera testing and tool experience can help.",
  },
  {
    id: "09-strengths",
    number: 9,
    title: "あなたの強み",
    titleEn: "Your strengths",
    lines: [
      {
        japanese:
          "そうですね。私の強みは、定量評価とツール開発、両方を経験しているところです。",
        romaji:
          "Sō desu ne. Watashi no tsuyomi wa, teiryō hyōka to tsūru kaihatsu, ryōhō o keiken shiteiru tokoro desu.",
      },
      {
        japanese:
          "ただ結果を確認するだけじゃなくて、どうすれば評価作業をもっと速く、正確にできるか、っていうことを考えるようにしています。",
        romaji:
          "Tada kekka o kakunin suru dake ja nakute, dō sureba hyōka sagyō o motto hayaku, seikaku ni dekiru ka, tte iu koto o kangaeru yō ni shiteimasu.",
      },
      {
        japanese:
          "あと、問題があったときは、すぐ結論を出すんじゃなくて、テスト条件、サンプル差、ツール設定とかを一つずつ確認するようにしています。",
        romaji:
          "Ato, mondai ga atta toki wa, sugu ketsuron o dasu n ja nakute, tesuto jōken, sanpuru-sa, tsūru settei toka o hitotsu zutsu kakunin suru yō ni shiteimasu.",
      },
      {
        japanese:
          "あと、英語でのコミュニケーションも得意なので、海外メンバーとかサプライヤーとの連携にも対応できます。",
        romaji:
          "Ato, Eigo de no komyunikēshon mo tokui na node, kaigai menbā toka sapuraiyā to no renkei ni mo taiō dekimasu.",
      },
    ],
    english:
      "My strength is both careful testing and making tools. I try to make work faster and more accurate. When something is wrong, I check step by step. I’m also good at English communication with overseas teams.",
  },
  {
    id: "10-weaknesses",
    number: 10,
    title: "あなたの弱み",
    titleEn: "Your weaknesses",
    lines: [
      {
        japanese:
          "そうですね。今は、3Aとか色再現設計、画像処理アルゴリズムの開発経験は、まだ十分じゃないです。",
        romaji:
          "Sō desu ne. Ima wa, 3A toka iro saigen sekkei, gazō shori arugorizumu no kaihatsu keiken wa, mada jūbun ja nai desu.",
      },
      {
        japanese:
          "ただ、評価業務を通して、それぞれの画質指標が製品にどういう影響を与えるか、っていうのは学んできました。",
        romaji:
          "Tada, hyōka gyōmu o tōshite, sorezore no gashitsu shihyō ga seihin ni dō iu eikyō o ataeru ka, tte iu no wa manande kimashita.",
      },
      {
        japanese:
          "これからは、今の定量評価の経験をベースにしながら、3Aとか色再現まわりの知識も広げていきたいと思っています。",
        romaji:
          "Kore kara wa, ima no teiryō hyōka no keiken o bēsu ni shinagara, 3A toka iro saigen mawari no chishiki mo hirogete ikitai to omotteimasu.",
      },
    ],
    english:
      "I’m still not strong in 3A, color design, or image-processing algorithms. But through testing, I learned how each quality number affects the product. I want to grow that knowledge next.",
  },
  {
    id: "11-japanese",
    number: 11,
    title: "日本語について",
    titleEn: "About Japanese",
    lines: [
      {
        japanese: "JLPTはN3を持っています。",
        romaji: "JLPT wa N3 o motteimasu.",
      },
      {
        japanese:
          "今の職場でも、日本語で日常的にコミュニケーションを取っています。",
        romaji:
          "Ima no shokuba demo, Nihongo de nichijōteki ni komyunikēshon o totteimasu.",
      },
      {
        japanese:
          "技術的な内容だと、分からない言葉があったら、確認しながら進めるようにしています。",
        romaji:
          "Gijutsuteki na naiyō da to, wakaranai kotoba ga attara, kakunin shinagara susumeru yō ni shiteimasu.",
      },
      {
        japanese:
          "英語の方がより得意なんですけど、日本語でも業務上の会話とか報告には対応できます。",
        romaji:
          "Eigo no hō ga yori tokui n desu kedo, Nihongo demo gyōmujō no kaiwa toka hōkoku ni wa taiō dekimasu.",
      },
    ],
    english:
      "I have JLPT N3. I use Japanese every day at work. For hard tech words, I check and confirm. English is stronger, but I can handle work talk and reports in Japanese too.",
  },
  {
    id: "12-salary",
    number: 12,
    title: "年収について",
    titleEn: "About salary",
    lines: [
      {
        japanese: "希望年収は、550万円を想定しています。",
        romaji: "Kibō nenshū wa, gohyaku gojū-man-en o sōtei shiteimasu.",
      },
      {
        japanese:
          "ただ、業務内容とか責任範囲、福利厚生とかも含めて、全体の条件を見たうえで、相談できればと思っています。",
        romaji:
          "Tada, gyōmu naiyō toka sekinin han'i, fukuri kōsei toka mo fukumete, zentai no jōken o mita ue de, sōdan dekireba to omotteimasu.",
      },
      {
        japanese:
          "すみません、現在の年収については個人情報ということで、控えさせていただいています。",
        romaji:
          "Sumimasen, genzai no nenshū ni tsuite wa kojin jōhō to iu koto de, hikae sasete itadaiteimasu.",
      },
      {
        japanese:
          "希望年収については、今回のポジションの業務内容と責任を基準に、相談したいと思っています。",
        romaji:
          "Kibō nenshū ni tsuite wa, konkai no pojishon no gyōmu naiyō to sekinin o kijun ni, sōdan shitai to omotteimasu.",
      },
    ],
    english:
      "I’m hoping for about 5.5 million yen. But I’m open to talk based on the full offer. I prefer not to share my current salary. I’d like to discuss based on this role’s work and responsibility.",
  },
  {
    id: "13-start-date",
    number: 13,
    title: "入社可能時期",
    titleEn: "Available start date",
    lines: [
      {
        japanese:
          "今の会社には、退職の1か月前に通知する、っていう決まりがあります。",
        romaji:
          "Ima no kaisha ni wa, taishoku no ikkagetsu mae ni tsūchi suru, tte iu kimari ga arimasu.",
      },
      {
        japanese:
          "なので、正式なオファーをいただいてから、だいたい1か月後くらいに入社できる予定です。",
        romaji:
          "Nanode, seishiki na ofā o itadaite kara, daitai ikkagetsu-go kurai ni nyūsha dekiru yotei desu.",
      },
    ],
    english:
      "My company needs one month’s notice. So I can start about one month after a formal offer.",
  },
  {
    id: "14-visa",
    number: 14,
    title: "ビザについて",
    titleEn: "About visa",
    lines: [
      {
        japanese:
          "在留資格は永住者なので、日本での就労に制限はありません。",
        romaji:
          "Zairyū shikaku wa eijūsha na node, Nihon de no shūrō ni seigen wa arimasen.",
      },
      {
        japanese: "ビザのスポンサーも必要ないです。",
        romaji: "Biza no suponsā mo hitsuyō nai desu.",
      },
    ],
    english:
      "I have permanent residency in Japan. There is no work limit, and I don’t need visa sponsorship.",
  },
  {
    id: "15-relocation",
    number: 15,
    title: "転勤は可能か",
    titleEn: "Relocation",
    lines: [
      {
        japanese:
          "今、横浜市金沢区に住んでいて、自宅も購入しているんです。",
        romaji:
          "Ima, Yokohama-shi Kanazawa-ku ni sundeite, jitaku mo kōnyū shiteiru n desu.",
      },
      {
        japanese:
          "なので、長期的な転居を伴う転勤は、ちょっと難しい状況です。",
        romaji:
          "Nanode, chōkiteki na tenkyo o tomonau tenkin wa, chotto muzukashii jōkyō desu.",
      },
      {
        japanese:
          "ただ、横浜とか東京エリアへの通勤、あと必要に応じた出張には対応可能です。",
        romaji:
          "Tada, Yokohama toka Tōkyō eria e no tsūkin, ato hitsuyō ni ōjita shucchō ni wa taiō kanō desu.",
      },
    ],
    english:
      "I live in Yokohama and own my home. Long-distance relocation is hard for me. But I can commute in the Yokohama–Tokyo area, and I can travel for business when needed.",
  },
  {
    id: "16-questions",
    number: 16,
    title: "こちらからの質問",
    titleEn: "Your questions",
    lines: [
      {
        japanese: "はい、二つほど伺ってもよろしいでしょうか。",
        romaji: "Hai, futatsu hodo ukagatte mo yoroshii deshō ka.",
      },
      {
        japanese:
          "えーと、今回のポジションだと、入社して最初の3か月から6か月くらいで、どんな業務を担当する予定でしょうか。",
        romaji:
          "Ēto, konkai no pojishon da to, nyūsha shite saisho no sankagetsu kara rokkagetsu kurai de, donna gyōmu o tantō suru yotei deshō ka.",
      },
      {
        japanese:
          "あと、このポジションで、特に期待されている技術とか経験について、もう少し詳しく教えていただけますでしょうか。",
        romaji:
          "Ato, kono pojishon de, toku ni kitai sareteiru gijutsu toka keiken ni tsuite, mō sukoshi kuwashiku oshiete itadakemasu deshō ka.",
      },
    ],
    english:
      "Yes, two quick questions. In the first 3 to 6 months, what work would I do? And what skills are most important for this role?",
  },
  {
    id: "17-closing",
    number: 17,
    title: "面接の最後",
    titleEn: "Closing",
    lines: [
      {
        japanese:
          "本日は、詳しくご説明いただき、ありがとうございました。",
        romaji:
          "Honjitsu wa, kuwashiku gosetsumei itadaki, arigatō gozaimashita.",
      },
      {
        japanese:
          "今回のお話を伺って、ポジションへの興味がさらに強くなりました。",
        romaji:
          "Konkai no ohanashi o ukagatte, pojishon e no kyōmi ga sara ni tsuyoku narimashita.",
      },
      {
        japanese:
          "これまでのカメラ評価とか検証、PoC開発の経験を活かして、チームに貢献したいと思っています。",
        romaji:
          "Kore made no kamera hyōka toka kenshō, PoC kaihatsu no keiken o ikashite, chīmu ni kōken shitai to omotteimasu.",
      },
      {
        japanese:
          "本日は貴重なお時間をいただき、本当にありがとうございました。",
        romaji:
          "Honjitsu wa kichō na ojikan o itadaki, hontō ni arigatō gozaimashita.",
      },
      {
        japanese: "今後とも、どうぞよろしくお願いいたします。",
        romaji: "Kongo tomo, dōzo yoroshiku onegai itashimasu.",
      },
      {
        japanese: "失礼します。",
        romaji: "Shitsurei shimasu.",
      },
    ],
    english:
      "Thank you for explaining everything today. I’m even more interested in this role. I want to help the team with my camera testing and tool experience. Thank you again for your time.",
  },
];

export function getInterviewSectionById(
  id: string
): InterviewSection | undefined {
  return interviewPrepSections.find((s) => s.id === id);
}

export function getInterviewSectionIndex(id: string): number {
  return interviewPrepSections.findIndex((s) => s.id === id);
}
