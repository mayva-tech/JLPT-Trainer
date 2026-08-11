/** N3 JP+EN mix interview practice — Nanami only. */

export type InterviewMixLine = {
  japanese: string;
  romaji: string;
};

export type InterviewMixSection = {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  lines: InterviewMixLine[];
};

export function interviewMixJapaneseText(section: InterviewMixSection): string {
  return section.lines.map((line) => line.japanese).join("");
}

export function interviewMixTitleChip(section: InterviewMixSection): string {
  return `N3 Mix ${section.number}. ${section.title} · ${section.titleEn}`;
}

export function interviewMixTitleSpeakJa(section: InterviewMixSection): string {
  return `セクション${section.number}。${section.title}`;
}

export const interviewMixSections: InterviewMixSection[] = [
  {
    id: "01-zoom",
    number: 1,
    title: "Zoomの最初",
    titleEn: "Zoom start",
    lines: [
      {
        japanese: "あ、見えました。Hello、ビリヤ・メイです。",
        romaji: "A, miemashita. Hello, Biriya Mei desu.",
      },
      {
        japanese: "えっと、本日はありがとうございます。",
        romaji: "Etto, honjitsu wa arigatō gozaimasu.",
      },
      {
        japanese: "Can you hear me and see me clearly?",
        romaji: "Can you hear me and see me clearly?",
      },
      {
        japanese: "はい、こちらは大丈夫です。よろしくお願いします。",
        romaji: "Hai, kochira wa daijōbu desu. Yoroshiku onegaishimasu.",
      },
    ],
  },
  {
    id: "02-intro",
    number: 2,
    title: "自己紹介",
    titleEn: "Self-introduction",
    lines: [
      {
        japanese:
          "はい。えっと、今はBREXA Technologyの社員で、Lenovo Japanのprojectで働いています。",
        romaji:
          "Hai. Etto, ima wa BREXA Technology no shain de, Lenovo Japan no project de hataraiteimasu.",
      },
      {
        japanese:
          "今の仕事は、えーと、notebook camera moduleのimage quality evaluationです。",
        romaji:
          "Ima no shigoto wa, ēto, notebook camera module no image quality evaluation desu.",
      },
      {
        japanese: "Imatestは毎日使っています。",
        romaji: "Imatest wa mainichi tsukatteimasu.",
      },
      {
        japanese:
          "MTF、SFR、field of view、distortion、color aberration、relative illumination、flare、veiling glareとかをcheckしています。",
        romaji:
          "MTF, SFR, field of view, distortion, color aberration, relative illumination, flare, veiling glare toka o check shiteimasu.",
      },
      {
        japanese:
          "あと、PythonとかPowerShellとかExcelを使って、result extractionとかreport preparationとかを、ちょっと効率化しています。",
        romaji:
          "Ato, Python toka PowerShell toka Excel o tsukatte, result extraction toka report preparation toka o, chotto kōritsuka shiteimasu.",
      },
      {
        japanese:
          "前は、camera SDKとかbeta driverのtestとか、あとPythonでPoCとか簡単な社内ツールも作っていました。",
        romaji:
          "Mae wa, camera SDK toka beta driver no test toka, ato Python de PoC toka kantan na shanai tsūru mo tsukutteimashita.",
      },
      {
        japanese:
          "んで、これからは、もっとcamera image qualityの仕事に関わりたいと思っています。",
        romaji:
          "Nde, kore kara wa, motto camera image quality no shigoto ni kakawaritai to omotteimasu.",
      },
    ],
  },
  {
    id: "03-job",
    number: 3,
    title: "今の仕事内容",
    titleEn: "Current job",
    lines: [
      {
        japanese:
          "そうですね。今はcamera moduleのimage qualityを、数字でcheckしています。",
        romaji:
          "Sō desu ne. Ima wa camera module no image quality o, sūji de check shiteimasu.",
      },
      {
        japanese: "まず、camera toolでRAW imageをcaptureして、",
        romaji: "Mazu, camera tool de RAW image o capture shite,",
      },
      {
        japanese: "で、いくつかのsampleをcompareします。",
        romaji: "De, ikutsuka no sample o compare shimasu.",
      },
      {
        japanese:
          "で、結果をspecificationと比べて、おかしい結果がないか確認します。",
        romaji:
          "De, kekka o specification to kurabete, okashii kekka ga nai ka kakunin shimasu.",
      },
      {
        japanese:
          "最後に、pass or failを決めて、evaluation reportを作る、っていう流れです。",
        romaji:
          "Saigo ni, pass or fail o kimete, evaluation report o tsukuru, tte iu nagare desu.",
      },
    ],
  },
  {
    id: "04-imatest",
    number: 4,
    title: "Imatestの経験",
    titleEn: "Imatest experience",
    lines: [
      {
        japanese: "はい。Imatestは毎日使っています。",
        romaji: "Hai. Imatest wa mainichi tsukatteimasu.",
      },
      {
        japanese: "imageをanalyzeして、numberとかgraphを確認します。",
        romaji: "Image o analyze shite, number toka graph o kakunin shimasu.",
      },
      {
        japanese: "で、そのあとresultをspecificationと比べます。",
        romaji: "De, sono ato result o specification to kurabemasu.",
      },
      {
        japanese:
          "ただ、私がImatest software自体をdevelopしているわけじゃなくて、",
        romaji:
          "Tada, watashi ga Imatest software jitai o develop shiteiru wake ja nakute,",
      },
      {
        japanese:
          "あくまでImatestをevaluation toolとして使っている、っていう感じです。",
        romaji:
          "Akumade Imatest o evaluation tool to shite tsukatteiru, tte iu kanji desu.",
      },
    ],
  },
  {
    id: "05-python",
    number: 5,
    title: "Pythonの経験",
    titleEn: "Python experience",
    lines: [
      {
        japanese:
          "はい。Pythonは、主にworkflow improvementとかPoC developmentに使っています。",
        romaji:
          "Hai. Python wa, omo ni workflow improvement toka PoC development ni tsukatteimasu.",
      },
      {
        japanese:
          "今の仕事だと、file processingとかresult extractionとかspec comparisonとかreport preparation、あたりに使っています。",
        romaji:
          "Ima no shigoto da to, file processing toka result extraction toka spec comparison toka report preparation, atari ni tsukatteimasu.",
      },
      {
        japanese:
          "前のinnovation teamでは、上司とかteamからideaをもらって、simple PoCを作っていました。",
        romaji:
          "Mae no innovation team de wa, jōshi toka team kara idea o moratte, simple PoC o tsukutteimashita.",
      },
      {
        japanese: "で、作ったPoCをteamにpresentして、feedbackをもらって、",
        romaji:
          "De, tsukutta PoC o team ni present shite, feedback o moratte,",
      },
      {
        japanese:
          "で、そのfeedbackに合わせてfunctionとかusabilityを直していました。",
        romaji:
          "De, sono feedback ni awasete function toka usability o naoshiteimashita.",
      },
    ],
  },
  {
    id: "06-why-change",
    number: 6,
    title: "なぜ転職したいですか",
    titleEn: "Why change jobs",
    lines: [
      {
        japanese:
          "そうですね。今の仕事で、camera evaluationの経験をたくさん積むことができました。",
        romaji:
          "Sō desu ne. Ima no shigoto de, camera evaluation no keiken o takusan tsumu koto ga dekimashita.",
      },
      {
        japanese:
          "ただ、今のpositionだと、できる仕事の範囲がちょっと限られているな、って感じています。",
        romaji:
          "Tada, ima no position da to, dekiru shigoto no han'i ga chotto kagirareteiru na, tte kanjiteimasu.",
      },
      {
        japanese:
          "これからは、evaluationだけじゃなくて、improvementとかdevelopment teamとのworkにも、もう少し関わりたいです。",
        romaji:
          "Kore kara wa, evaluation dake ja nakute, improvement toka development team to no work ni mo, mō sukoshi kakawaritai desu.",
      },
      {
        japanese:
          "なので、もっとtechnical skillを伸ばせる環境を探しています。",
        romaji:
          "Nanode, motto technical skill o nobaseru kankyō o sagashiteimasu.",
      },
    ],
  },
  {
    id: "07-why-quest",
    number: 7,
    title: "なぜQuest Globalですか",
    titleEn: "Why Quest Global",
    lines: [
      {
        japanese:
          "はい。Quest Globalはglobal engineering companyなので、興味を持ちました。",
        romaji:
          "Hai. Quest Global wa global engineering company na node, kyōmi o mochimashita.",
      },
      {
        japanese:
          "いろんなprojectがあって、EnglishとJapaneseの両方を使えるところもいいな、と思いました。",
        romaji:
          "Ironna project ga atte, English to Japanese no ryōhō o tsukaeru tokoro mo ii na, to omoimashita.",
      },
      {
        japanese:
          "んで、これまでのcamera evaluationとかPoCとかreport作成の経験を活かしたいと思っています。",
        romaji:
          "Nde, kore made no camera evaluation toka PoC toka report sakusei no keiken o ikashitai to omotteimasu.",
      },
    ],
  },
  {
    id: "08-strengths",
    number: 8,
    title: "強み",
    titleEn: "Strengths",
    lines: [
      {
        japanese:
          "そうですね。私の強みは、carefulなevaluationとtool開発の両方を経験しているところです。",
        romaji:
          "Sō desu ne. Watashi no tsuyomi wa, careful na evaluation to tool kaihatsu no ryōhō o keiken shiteiru tokoro desu.",
      },
      {
        japanese:
          "ただ結果を確認するだけじゃなくて、どうすればもっと速く、正確にできるか、っていうのを考えるようにしています。",
        romaji:
          "Tada kekka o kakunin suru dake ja nakute, dō sureba motto hayaku, seikaku ni dekiru ka, tte iu no o kangaeru yō ni shiteimasu.",
      },
      {
        japanese:
          "あと、problemがあるときは、すぐ結論を出すんじゃなくて、test conditionとかsampleとかsettingを一つずつcheckします。",
        romaji:
          "Ato, problem ga aru toki wa, sugu ketsuron o dasu n ja nakute, test condition toka sample toka setting o hitotsu zutsu check shimasu.",
      },
      {
        japanese:
          "あと、English communicationも得意なので、海外のmemberとかsupplierとの連携にも対応できます。",
        romaji:
          "Ato, English communication mo tokui na node, kaigai no member toka supplier to no renkei ni mo taiō dekimasu.",
      },
    ],
  },
  {
    id: "09-weaknesses",
    number: 9,
    title: "弱み",
    titleEn: "Weaknesses",
    lines: [
      {
        japanese:
          "そうですね。今は、3Aとかcolor designとかimage processing algorithmの経験は、まだ少ないです。",
        romaji:
          "Sō desu ne. Ima wa, 3A toka color design toka image processing algorithm no keiken wa, mada sukunai desu.",
      },
      {
        japanese:
          "ただ、今のevaluation workを通して、それぞれの指標が製品にどういう影響を与えるか、っていうのは学んできました。",
        romaji:
          "Tada, ima no evaluation work o tōshite, sorezore no shihyō ga seihin ni dō iu eikyō o ataeru ka, tte iu no wa manande kimashita.",
      },
      {
        japanese:
          "これからは、今の経験をベースにしながら、もっとknowledgeを広げていきたいと思っています。",
        romaji:
          "Kore kara wa, ima no keiken o bēsu ni shinagara, motto knowledge o hirogete ikitai to omotteimasu.",
      },
    ],
  },
  {
    id: "10-japanese",
    number: 10,
    title: "日本語について",
    titleEn: "About Japanese",
    lines: [
      {
        japanese: "はい。JLPTはN3です。",
        romaji: "Hai. JLPT wa N3 desu.",
      },
      {
        japanese: "今の職場でも、毎日Japaneseを使っています。",
        romaji: "Ima no shokuba demo, mainichi Japanese o tsukatteimasu.",
      },
      {
        japanese:
          "technical wordで分からないのがあったら、確認しながら進めています。",
        romaji:
          "Technical word de wakaranai no ga attara, kakunin shinagara susumeteimasu.",
      },
      {
        japanese:
          "英語の方が得意なんですけど、日本語でも仕事の話とか報告とかはできます。",
        romaji:
          "Eigo no hō ga tokui n desu kedo, Nihongo demo shigoto no hanashi toka hōkoku toka wa dekimasu.",
      },
    ],
  },
  {
    id: "11-salary",
    number: 11,
    title: "年収",
    titleEn: "Salary",
    lines: [
      {
        japanese: "希望年収は、550万円です。",
        romaji: "Kibō nenshū wa, gohyaku gojū-man-en desu.",
      },
      {
        japanese:
          "ただ、仕事の内容とか会社の制度とかも見たうえで、相談できればと思っています。",
        romaji:
          "Tada, shigoto no naiyō toka kaisha no seido toka mo mita ue de, sōdan dekireba to omotteimasu.",
      },
      {
        japanese:
          "すみません、現在の年収については、個人情報ということで控えさせていただいています。",
        romaji:
          "Sumimasen, genzai no nenshū ni tsuite wa, kojin jōhō to iu koto de hikae sasete itadaiteimasu.",
      },
      {
        japanese:
          "希望年収については、今回のpositionの仕事内容と責任を基準に、相談したいと思っています。",
        romaji:
          "Kibō nenshū ni tsuite wa, konkai no position no shigoto naiyō to sekinin o kijun ni, sōdan shitai to omotteimasu.",
      },
    ],
  },
  {
    id: "12-start",
    number: 12,
    title: "入社時期",
    titleEn: "Start date",
    lines: [
      {
        japanese: "今の会社は、one month noticeです。",
        romaji: "Ima no kaisha wa, one month notice desu.",
      },
      {
        japanese:
          "なので、formal offerをいただいてから、だいたい1か月後くらいにstartできます。",
        romaji:
          "Nanode, formal offer o itadaite kara, daitai ikkagetsu-go kurai ni start dekimasu.",
      },
    ],
  },
  {
    id: "13-visa",
    number: 13,
    title: "ビザ",
    titleEn: "Visa",
    lines: [
      {
        japanese: "はい、私はPermanent Residentです。",
        romaji: "Hai, watashi wa Permanent Resident desu.",
      },
      {
        japanese: "日本で働くことに制限はありません。",
        romaji: "Nihon de hataraku koto ni seigen wa arimasen.",
      },
      {
        japanese: "なので、Visa sponsorshipも必要ないです。",
        romaji: "Nanode, Visa sponsorship mo hitsuyō nai desu.",
      },
    ],
  },
  {
    id: "14-relocation",
    number: 14,
    title: "転勤",
    titleEn: "Relocation",
    lines: [
      {
        japanese: "今は横浜市金沢区に住んでいて、自宅も購入しているんです。",
        romaji:
          "Ima wa Yokohama-shi Kanazawa-ku ni sundeite, jitaku mo kōnyū shiteiru n desu.",
      },
      {
        japanese: "なので、relocationは、ちょっと難しい状況です。",
        romaji: "Nanode, relocation wa, chotto muzukashii jōkyō desu.",
      },
      {
        japanese:
          "ただ、横浜とか東京への通勤とか、必要な出張には対応できます。",
        romaji:
          "Tada, Yokohama toka Tōkyō e no tsūkin toka, hitsuyō na shucchō ni wa taiō dekimasu.",
      },
    ],
  },
  {
    id: "15-clarify",
    number: 15,
    title: "分からない質問が来たとき",
    titleEn: "When you don’t understand",
    lines: [
      {
        japanese: "すみません、もう一度お願いできますか。",
        romaji: "Sumimasen, mō ichido onegaishimasu.",
      },
      {
        japanese: "すみません、少しゆっくり話していただけますか。",
        romaji: "Sumimasen, sukoshi yukkuri hanashite itadakemasu ka.",
      },
      {
        japanese: "そのtechnical wordの意味を、確認してもいいですか。",
        romaji: "Sono technical word no imi o, kakunin shite mo ii desu ka.",
      },
      {
        japanese: "すみません、この部分だけEnglishで説明してもいいですか。",
        romaji:
          "Sumimasen, kono bubun dake English de setsumei shite mo ii desu ka.",
      },
      {
        japanese: "Let me explain this part in English.",
        romaji: "Let me explain this part in English.",
      },
    ],
  },
  {
    id: "16-questions",
    number: 16,
    title: "こちらからの質問",
    titleEn: "Your questions",
    lines: [
      {
        japanese: "はい、えっと、二つくらい質問してもいいですか。",
        romaji: "Hai, etto, futatsu kurai shitsumon shite mo ii desu ka.",
      },
      {
        japanese:
          "まず、このpositionだと、入社して最初の3か月から6か月で、どんなworkをする予定ですか。",
        romaji:
          "Mazu, kono position da to, nyūsha shite saisho no sankagetsu kara rokkagetsu de, donna work o suru yotei desu ka.",
      },
      {
        japanese:
          "あと、この仕事で一番importantなskillとかexperienceって何ですか。",
        romaji:
          "Ato, kono shigoto de ichiban important na skill toka experience tte nan desu ka.",
      },
      {
        japanese:
          "それから、この仕事はQuest Globalの社内ですか。それとも、client先でのprojectになりますか。",
        romaji:
          "Sorekara, kono shigoto wa Quest Global no shanai desu ka. Soretomo, client-saki de no project ni narimasu ka.",
      },
      {
        japanese:
          "あと、projectが終わったあと、次の仕事までのsalaryとかsupportってどうなりますか。",
        romaji:
          "Ato, project ga owatta ato, tsugi no shigoto made no salary toka support tte dō narimasu ka.",
      },
    ],
  },
  {
    id: "17-closing",
    number: 17,
    title: "最後",
    titleEn: "Closing",
    lines: [
      {
        japanese:
          "本日は、いろいろ説明していただいて、ありがとうございました。",
        romaji:
          "Honjitsu wa, iroiro setsumei shite itadaite, arigatō gozaimashita.",
      },
      {
        japanese: "お話を聞いて、このpositionにもっと興味を持ちました。",
        romaji:
          "Ohanashi o kiite, kono position ni motto kyōmi o mochimashita.",
      },
      {
        japanese:
          "camera evaluationとかPoCの経験を活かして、teamに貢献したいと思っています。",
        romaji:
          "Camera evaluation toka PoC no keiken o ikashite, team ni kōken shitai to omotteimasu.",
      },
      {
        japanese:
          "本日は、本当にありがとうございました。どうぞよろしくお願いします。",
        romaji:
          "Honjitsu wa, hontō ni arigatō gozaimashita. Dōzo yoroshiku onegaishimasu.",
      },
      {
        japanese: "失礼します。",
        romaji: "Shitsurei shimasu.",
      },
    ],
  },
];

export function getInterviewMixSectionById(
  id: string
): InterviewMixSection | undefined {
  return interviewMixSections.find((s) => s.id === id);
}
