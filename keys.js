/*
 * 調ごとの情報：よく言われるイメージ、ゲーム音楽で使うときの目安、有名な曲（作曲者の没後、長い年月がたった曲）
 * window.KEY_INFO に公開します。
 *
 *   mood:  よく言われるイメージ（主観や歴史的な連想を含む）
 *   game:  自作ゲームに曲を付けるときの使いどころの例
 *   play:  演奏・楽器の面から見た特徴
 *   use:   使われる頻度 3=とてもよく使う 2=よく使う 1=ときどき 0=ほとんど使わない
 *   pieces: [曲名, 作曲者, IMSLP のページ名（曲集の場合は曲集のページ）, 補足]
 */
(() => {
  'use strict';

  const C = {
    bach: 'J.S.バッハ', mozart: 'モーツァルト', beethoven: 'ベートーヴェン', chopin: 'ショパン', haydn: 'ハイドン',
    schubert: 'シューベルト', handel: 'ヘンデル', vivaldi: 'ヴィヴァルディ', pachelbel: 'パッヘルベル', grieg: 'グリーグ',
    dvorak: 'ドヴォルザーク', tchaikovsky: 'チャイコフスキー', mendelssohn: 'メンデルスゾーン', brahms: 'ブラームス',
    liszt: 'リスト', schumann: 'シューマン', debussy: 'ドビュッシー', scriabin: 'スクリャービン', bizet: 'ビゼー',
    rossini: 'ロッシーニ', strauss1: 'J.シュトラウス1世', strauss2: 'J.シュトラウス2世', boccherini: 'ボッケリーニ',
    badarzewska: 'バダジェフスカ', petzold: 'ペツォールト（伝バッハ）'
  };

  window.KEY_INFO = {
    // ===== 調号なし =====
    C: {
      use: 3,
      mood: '素直・明快・まっさら。白鍵だけで弾ける、いちばん基本の調です。飾りのない、すっきりした明るさ。',
      game: 'タイトル画面、チュートリアル、のどかな村、ほのぼのしたミニゲーム。「まだ何も始まっていない」まっさらな感じに。',
      play: 'ピアノは白鍵だけ。ハ長調で作っておけば、あとで他の調へ移すのも簡単です。',
      pieces: [
        ['ピアノ・ソナタ 第16番 K.545', C.mozart, 'Piano Sonata No.16 in C major, K.545 (Mozart, Wolfgang Amadeus)', '「ソナチネ・アルバム」でもおなじみ'],
        ['平均律クラヴィーア曲集 第1巻 第1番 前奏曲', C.bach, 'Prelude and Fugue in C major, BWV 846 (Bach, Johann Sebastian)', ''],
        ['きらきら星変奏曲 K.265', C.mozart, '12 Variations on \'Ah, vous dirai-je maman\', K.265/300e (Mozart, Wolfgang Amadeus)', ''],
        ['交響曲 第41番「ジュピター」', C.mozart, 'Symphony No.41 in C major, K.551 (Mozart, Wolfgang Amadeus)', ''],
        ['結婚行進曲（「真夏の夜の夢」より）', C.mendelssohn, 'A Midsummer Night\'s Dream, incidental music, Op.61 (Mendelssohn, Felix)', '']
      ]
    },
    Am: {
      use: 3,
      mood: 'もの悲しいけれど素朴で、重すぎない。ハ長調と同じ白鍵だけの音でできた短調です。',
      game: 'さびれた村、雨の日、思い出の場面、少し不思議なダンジョンの入口。重すぎない「ちょっと切ない」場面に。',
      play: 'ギターでは開放弦（ラ・ミ）がよく響き、弾きやすい短調です。',
      pieces: [
        ['エリーゼのために', C.beethoven, 'Für Elise, WoO 59 (Beethoven, Ludwig van)', ''],
        ['トルコ行進曲（ピアノ・ソナタ 第11番 第3楽章）', C.mozart, 'Piano Sonata No.11 in A major, K.331/300i (Mozart, Wolfgang Amadeus)', 'イ短調で始まり、最後はイ長調で華やかに終わります'],
        ['ピアノ・ソナタ 第8番 K.310', C.mozart, 'Piano Sonata No.8 in A minor, K.310/300d (Mozart, Wolfgang Amadeus)', ''],
        ['ピアノ協奏曲 イ短調', C.grieg, 'Piano Concerto, Op.16 (Grieg, Edvard)', '']
      ]
    },
    // ===== ♯1 =====
    G: {
      use: 3,
      mood: 'のびやか・さわやか・田園的。ハ長調より少し外向きで、明るく開けた感じ。',
      game: 'フィールド（草原）、朝の町、出発のシーン、牧場や農場もの。',
      play: 'ヴァイオリン・ギターの開放弦が響き、弦楽器にもリコーダーにも扱いやすい調です。',
      pieces: [
        ['メヌエット ト長調', C.petzold, 'Notebooks for Anna Magdalena Bach (Bach, Johann Sebastian)', '「アンナ・マクダレーナ・バッハの音楽帳」より。長くバッハの作とされてきました'],
        ['アイネ・クライネ・ナハトムジーク', C.mozart, 'Eine kleine Nachtmusik, K.525 (Mozart, Wolfgang Amadeus)', ''],
        ['無伴奏チェロ組曲 第1番', C.bach, 'Cello Suite No.1 in G major, BWV 1007 (Bach, Johann Sebastian)', ''],
        ['主よ、人の望みの喜びよ（カンタータ BWV147 より）', C.bach, 'Herz und Mund und Tat und Leben, BWV 147 (Bach, Johann Sebastian)', ''],
        ['交響曲 第94番「驚愕」', C.haydn, 'Symphony No.94 in G major, Hob.I:94 (Haydn, Joseph)', '']
      ]
    },
    Em: {
      use: 3,
      mood: '哀愁・郷愁・ひたむき。悲しみの中にも、どこか澄んだ強さがあります。',
      game: '旅の途中の切ない場面、森の奥、ライバルとの別れ。ロック風の戦闘曲にも。',
      play: 'ギターの最低音（6弦）がミなので、ギターではもっとも鳴らしやすい短調のひとつです。',
      pieces: [
        ['前奏曲 第4番（24の前奏曲 Op.28）', C.chopin, 'Preludes, Op.28 (Chopin, Frédéric)', ''],
        ['交響曲 第9番「新世界より」', C.dvorak, 'Symphony No.9, Op.95 (Dvořák, Antonín)', '第2楽章「家路」は変ニ長調'],
        ['ヴァイオリン協奏曲 ホ短調', C.mendelssohn, 'Violin Concerto, Op.64 (Mendelssohn, Felix)', ''],
        ['ピアノ協奏曲 第1番', C.chopin, 'Piano Concerto No.1, Op.11 (Chopin, Frédéric)', '']
      ]
    },
    // ===== ♯2 =====
    D: {
      use: 3,
      mood: '輝かしい・祝祭的・華やか。トランペットや弦楽器がよく鳴る、晴れやかな調です。',
      game: '王様の城、お祭り、ファンファーレ、エンディングの大団円、ステージクリア。',
      play: 'ヴァイオリンの開放弦（レ・ラ）がよく響くため、オーケストラの祝祭的な曲に多い調です。',
      pieces: [
        ['カノン', C.pachelbel, 'Canon and Gigue in D major, P.37 (Pachelbel, Johann)', ''],
        ['ハレルヤ・コーラス（「メサイア」より）', C.handel, 'Messiah, HWV 56 (Handel, George Frideric)', ''],
        ['G線上のアリア（管弦楽組曲 第3番 より）', C.bach, 'Orchestral Suite No.3 in D major, BWV 1068 (Bach, Johann Sebastian)', '原曲はニ長調。「G線上の」はヴィルヘルミがハ長調に移した編曲から'],
        ['花のワルツ（「くるみ割り人形」より）', C.tchaikovsky, 'The Nutcracker (ballet), Op.71 (Tchaikovsky, Pyotr)', ''],
        ['ラデツキー行進曲', C.strauss1, 'Radetzky-Marsch, Op.228 (Strauss Sr., Johann)', ''],
        ['美しく青きドナウ', C.strauss2, 'An der schönen blauen Donau, Op.314 (Strauss Jr., Johann)', 'ワルツの本体はニ長調']
      ]
    },
    Bm: {
      use: 2,
      mood: '孤独・内省・深い哀しみ。静かに沈んでいくような、気品のある暗さ。',
      game: '最後のダンジョン手前の静けさ、魔王の城の廊下、仲間を失った場面、謎めいた遺跡。',
      play: '弦楽器・ギターで扱いやすい短調。ニ長調と組み合わせて使われることも多い調です。',
      pieces: [
        ['ミサ曲 ロ短調', C.bach, 'Mass in B minor, BWV 232 (Bach, Johann Sebastian)', ''],
        ['交響曲 第7番（8番）「未完成」', C.schubert, 'Symphony No.8, D.759 (Schubert, Franz)', '番号は版によって第7番・第8番'],
        ['交響曲 第6番「悲愴」', C.tchaikovsky, 'Symphony No.6, Op.74 (Tchaikovsky, Pyotr)', ''],
        ['バディネリ（管弦楽組曲 第2番 より）', C.bach, 'Orchestral Suite No.2 in B minor, BWV 1067 (Bach, Johann Sebastian)', ''],
        ['山の魔王の宮殿にて（「ペール・ギュント」より）', C.grieg, 'Peer Gynt Suite No.1, Op.46 (Grieg, Edvard)', '']
      ]
    },
    // ===== ♯3 =====
    A: {
      use: 2,
      mood: '若々しい・はつらつ・陽気。きらきらした明るさと、少しの甘さ。',
      game: '主人公のテーマ、冒険の始まり、海辺の町、軽快なショップ。',
      play: '弦楽器がよく響く調。クラリネット（A管）の曲にも多く使われます。',
      pieces: [
        ['ピアノ・ソナタ 第11番 K.331（第1楽章）', C.mozart, 'Piano Sonata No.11 in A major, K.331/300i (Mozart, Wolfgang Amadeus)', '第3楽章が「トルコ行進曲」'],
        ['交響曲 第7番', C.beethoven, 'Symphony No.7, Op.92 (Beethoven, Ludwig van)', ''],
        ['クラリネット協奏曲 K.622', C.mozart, 'Clarinet Concerto in A major, K.622 (Mozart, Wolfgang Amadeus)', ''],
        ['ピアノ五重奏曲「ます」', C.schubert, 'Piano Quintet in A major, D.667 (Schubert, Franz)', ''],
        ['春の歌（無言歌集 Op.62-6）', C.mendelssohn, 'Lieder ohne Worte, Op.62 (Mendelssohn, Felix)', ''],
        ['メヌエット（弦楽五重奏曲 Op.11-5 より）', C.boccherini, 'String Quintet in E major, G.275 (Boccherini, Luigi)', '']
      ]
    },
    'F#m': {
      use: 2,
      mood: '情熱的・陰りのある激しさ。少しねじれた、熱を帯びた暗さ。',
      game: '敵の幹部との戦い、焦りや不安が高まる場面、異国の夜。',
      play: 'ピアノでは黒鍵が増えて少しむずかしくなります。ギターでは比較的弾きやすい調。',
      pieces: [
        ['ハンガリー舞曲 第5番', C.brahms, 'Hungarian Dances for four hands, WoO 1 (Brahms, Johannes)', '原曲（ピアノ連弾）は嬰ヘ短調。管弦楽版はト短調がよく知られています'],
        ['交響曲 第45番「告別」', C.haydn, 'Symphony No.45 in F-sharp minor, Hob.I:45 (Haydn, Joseph)', '']
      ]
    },
    // ===== ♯4 =====
    E: {
      use: 2,
      mood: 'きらめく・輝きのある・高揚感。まぶしい光のような明るさ。',
      game: '空や天空の城、勝利のあとの朝、聖なる場所。ギターロックの明るい曲にも。',
      play: 'ギターの開放弦（ミ）と相性がよく、ロックやポップスでよく使われます。ピアノでは黒鍵が4つ。',
      pieces: [
        ['「四季」より「春」', C.vivaldi, 'Violin Concerto in E major, RV 269 (Vivaldi, Antonio)', ''],
        ['別れの曲（練習曲 Op.10-3）', C.chopin, 'Études, Op.10 (Chopin, Frédéric)', ''],
        ['無伴奏ヴァイオリン・パルティータ 第3番', C.bach, 'Violin Partita No.3 in E major, BWV 1006 (Bach, Johann Sebastian)', ''],
        ['朝（「ペール・ギュント」より）', C.grieg, 'Peer Gynt Suite No.1, Op.46 (Grieg, Edvard)', ''],
        ['「ウィリアム・テル」序曲（スイス軍の行進）', C.rossini, 'Guillaume Tell (Rossini, Gioachino)', 'よく知られる終盤の行進の部分']
      ]
    },
    'C#m': {
      use: 2,
      mood: '幻想的・切実・夜の気配。月明かりのような、静かで深い暗さ。',
      game: '夜の湖、夢の中、ヒロインの秘密、静かな悲劇。',
      play: 'ピアノの名曲に多い調。黒鍵が多く、手になじむ形で弾ける部分もあります。',
      pieces: [
        ['ピアノ・ソナタ 第14番「月光」', C.beethoven, 'Piano Sonata No.14, Op.27 No.2 (Beethoven, Ludwig van)', ''],
        ['幻想即興曲', C.chopin, 'Fantaisie-impromptu, Op.66 (Chopin, Frédéric)', ''],
        ['ワルツ 第7番 Op.64-2', C.chopin, 'Waltzes, Op.64 (Chopin, Frédéric)', ''],
        ['ハンガリー狂詩曲 第2番', C.liszt, 'Hungarian Rhapsody No.2, S.244/2 (Liszt, Franz)', '嬰ハ短調で始まり、嬰ヘ長調で終わります']
      ]
    },
    // ===== ♯5 =====
    B: {
      use: 1,
      mood: 'まばゆい・強烈な明るさ。少し張りつめた、まぶしすぎる光。',
      game: '奇跡の瞬間、変身シーン、天上の世界。',
      play: 'ピアノでは黒鍵5つを全部使い、実は手の形にはなじみやすい調です。',
      pieces: [
        ['ノクターン 第3番 Op.9-3', C.chopin, 'Nocturnes, Op.9 (Chopin, Frédéric)', ''],
        ['ピアノ三重奏曲 第1番 Op.8', C.brahms, 'Piano Trio No.1, Op.8 (Brahms, Johannes)', ''],
        ['ノクターン 第9番 Op.32-1', C.chopin, 'Nocturnes, Op.32 (Chopin, Frédéric)', '']
      ]
    },
    'G#m': {
      use: 1,
      mood: '鋭い・きらびやかな悲しみ。張りつめた、冷たい輝きのある暗さ。',
      game: '氷の神殿、からくり仕掛けの塔、緊張感のある謎解き。',
      play: '調号は♯5つ。和声的短音階では「ファ𝄪（ダブルシャープ）」が出てきます。',
      pieces: [
        ['ラ・カンパネラ（パガニーニによる大練習曲 第3番）', C.liszt, 'Grandes études de Paganini, S.141 (Liszt, Franz)', ''],
        ['練習曲 Op.25-6（3度）', C.chopin, 'Études, Op.25 (Chopin, Frédéric)', '']
      ]
    },
    // ===== ♯6 =====
    'F#': {
      use: 1,
      mood: 'やわらかい・夢のよう・どこか遠い明るさ。変ト長調と同じ音で、書き方が違うだけです。',
      game: '夢の世界、妖精の森、エンディング後の余韻。',
      play: 'ピアノでは黒鍵が多く、指になじみやすい調。弦楽器にはややむずかしい調です。',
      pieces: [
        ['舟歌 Op.60', C.chopin, 'Barcarolle, Op.60 (Chopin, Frédéric)', ''],
        ['ピアノ・ソナタ 第24番「テレーゼ」', C.beethoven, 'Piano Sonata No.24, Op.78 (Beethoven, Ludwig van)', ''],
        ['ノクターン 第5番 Op.15-2', C.chopin, 'Nocturnes, Op.15 (Chopin, Frédéric)', '']
      ]
    },
    'D#m': {
      use: 0,
      mood: '重く沈んだ・ほの暗い緊張。同じ音の変ホ短調で書かれることのほうが多い調です。',
      game: '深海、底なしの洞窟、最終局面の不穏な静けさ。',
      play: '♯6つ。和声的短音階では「ド𝄪」が出てきます。',
      pieces: [
        ['練習曲 Op.8-12', C.scriabin, '12 Etudes, Op.8 (Scriabin, Aleksandr)', ''],
        ['平均律クラヴィーア曲集 第1巻 第8番 フーガ', C.bach, 'Prelude and Fugue in E-flat minor, BWV 853 (Bach, Johann Sebastian)', '前奏曲は変ホ短調で書かれています']
      ]
    },
    // ===== ♯7 =====
    'C#': {
      use: 0,
      mood: '同じ音の変ニ長調で書かれることがほとんどです。♯7つは「全部の音に♯」。',
      game: '曲の途中で半音上げて盛り上げる（ハ長調→嬰ハ長調）ときに出てくることがあります。',
      play: '♯7つ。ピアノで弾く音は変ニ長調と同じです。',
      pieces: [
        ['平均律クラヴィーア曲集 第1巻 第3番', C.bach, 'Prelude and Fugue in C-sharp major, BWV 848 (Bach, Johann Sebastian)', 'すべての調で書くという曲集なので、この調も使われています']
      ]
    },
    'A#m': {
      use: 0,
      mood: 'ほとんど使われません。ふつうは同じ音の「変ロ短調」で書かれます。',
      game: '使うなら変ロ短調として書くのがおすすめです。',
      play: '♯7つ。和声的短音階では「ソ𝄪」が出てきます。',
      pieces: []
    },
    // ===== ♭1 =====
    F: {
      use: 3,
      mood: 'おだやか・牧歌的・やさしい。ハ長調よりも少しやわらかく、落ち着いた明るさ。',
      game: '自然の中の休憩、のんびりした村、宿屋、ほのぼのした日常パート。',
      play: '♭1つ。管楽器・リコーダー・歌に扱いやすい調です。',
      pieces: [
        ['交響曲 第6番「田園」', C.beethoven, 'Symphony No.6, Op.68 (Beethoven, Ludwig van)', ''],
        ['イタリア協奏曲', C.bach, 'Italienisches Konzert, BWV 971 (Bach, Johann Sebastian)', ''],
        ['トロイメライ（「子供の情景」より）', C.schumann, 'Kinderszenen, Op.15 (Schumann, Robert)', ''],
        ['弦楽四重奏曲 第12番「アメリカ」', C.dvorak, 'String Quartet No.12, Op.96 (Dvořák, Antonín)', ''],
        ['ブランデンブルク協奏曲 第2番', C.bach, 'Brandenburg Concerto No.2 in F major, BWV 1047 (Bach, Johann Sebastian)', '']
      ]
    },
    Dm: {
      use: 3,
      mood: '厳粛・重厚・劇的。荘厳さと不安が同居する、ドラマチックな暗さ。',
      game: 'ボス戦、ラスボスの城、古代の神殿、教会の地下、シリアスな物語の山場。',
      play: '♭1つで読みやすく、ゲームのボス曲やオルガン曲によく合う短調です。',
      pieces: [
        ['トッカータとフーガ ニ短調 BWV565', C.bach, 'Toccata and Fugue in D minor, BWV 565 (Bach, Johann Sebastian)', ''],
        ['レクイエム', C.mozart, 'Requiem in D minor, K.626 (Mozart, Wolfgang Amadeus)', ''],
        ['交響曲 第9番（「合唱付き」）', C.beethoven, 'Symphony No.9, Op.125 (Beethoven, Ludwig van)', '第4楽章の「歓喜の歌」はニ長調'],
        ['シャコンヌ（無伴奏ヴァイオリン・パルティータ 第2番 より）', C.bach, 'Violin Partita No.2 in D minor, BWV 1004 (Bach, Johann Sebastian)', ''],
        ['ピアノ協奏曲 第20番', C.mozart, 'Piano Concerto No.20 in D minor, K.466 (Mozart, Wolfgang Amadeus)', '']
      ]
    },
    // ===== ♭2 =====
    Bb: {
      use: 2,
      mood: '堂々・温かい・ゆったりした明るさ。吹奏楽でおなじみの、ふくよかな響き。',
      game: '騎士団、港町、おおらかな王国、マーチ風の行進。',
      play: '吹奏楽（B♭管のトランペット・クラリネットなど）では基本となる調です。',
      pieces: [
        ['交響曲 第4番', C.beethoven, 'Symphony No.4, Op.60 (Beethoven, Ludwig van)', ''],
        ['交響曲 第5番', C.schubert, 'Symphony No.5, D.485 (Schubert, Franz)', ''],
        ['ピアノ三重奏曲 第7番「大公」', C.beethoven, 'Piano Trio in B-flat major, Op.97 (Beethoven, Ludwig van)', ''],
        ['ピアノ・ソナタ 第29番「ハンマークラヴィーア」', C.beethoven, 'Piano Sonata No.29, Op.106 (Beethoven, Ludwig van)', '']
      ]
    },
    Gm: {
      use: 3,
      mood: '憂い・焦燥・ひたむきな悲しみ。走り出したくなるような、せつない緊張感。',
      game: '追われる場面、時間制限のあるステージ、悲劇的なヒロインのテーマ、戦闘曲。',
      play: '♭2つ。ヴァイオリンの最低音（G線）が主音で、弦楽器が劇的に響きます。',
      pieces: [
        ['交響曲 第40番', C.mozart, 'Symphony No.40 in G minor, K.550 (Mozart, Wolfgang Amadeus)', ''],
        ['「四季」より「夏」', C.vivaldi, 'Violin Concerto in G minor, RV 315 (Vivaldi, Antonio)', ''],
        ['小フーガ ト短調 BWV578', C.bach, 'Fugue in G minor, BWV 578 (Bach, Johann Sebastian)', ''],
        ['バラード 第1番', C.chopin, 'Ballade No.1, Op.23 (Chopin, Frédéric)', '']
      ]
    },
    // ===== ♭3 =====
    Eb: {
      use: 2,
      mood: '雄大・英雄的・厳か。どっしりとした、温かみのある明るさ。',
      game: '英雄の凱旋、大聖堂、壮大なオープニング、王の戴冠。',
      play: '♭3つ。ホルンや吹奏楽がよく鳴る調です。',
      pieces: [
        ['交響曲 第3番「英雄」', C.beethoven, 'Symphony No.3, Op.55 (Beethoven, Ludwig van)', ''],
        ['ノクターン 第2番 Op.9-2', C.chopin, 'Nocturnes, Op.9 (Chopin, Frédéric)', ''],
        ['ピアノ協奏曲 第5番「皇帝」', C.beethoven, 'Piano Concerto No.5, Op.73 (Beethoven, Ludwig van)', ''],
        ['乙女の祈り', C.badarzewska, 'La prière d\'une vierge, Op.4 (Bądarzewska-Baranowska, Tekla)', ''],
        ['子守歌 Op.49-4', C.brahms, '5 Lieder, Op.49 (Brahms, Johannes)', '原曲の調']
      ]
    },
    Cm: {
      use: 3,
      mood: '悲劇的・闘争的・運命的。重く力強い、立ち向かうような暗さ。',
      game: '強敵との決戦、運命に逆らう場面、崩れゆく城、闇の勢力のテーマ。',
      play: '♭3つ。ピアノでも弾きやすく、力強い短調の代表です。',
      pieces: [
        ['交響曲 第5番（「運命」）', C.beethoven, 'Symphony No.5, Op.67 (Beethoven, Ludwig van)', ''],
        ['ピアノ・ソナタ 第8番「悲愴」', C.beethoven, 'Piano Sonata No.8, Op.13 (Beethoven, Ludwig van)', '第2楽章は変イ長調'],
        ['革命のエチュード（練習曲 Op.10-12）', C.chopin, 'Études, Op.10 (Chopin, Frédéric)', ''],
        ['ピアノ協奏曲 第24番', C.mozart, 'Piano Concerto No.24 in C minor, K.491 (Mozart, Wolfgang Amadeus)', '']
      ]
    },
    // ===== ♭4 =====
    Ab: {
      use: 2,
      mood: '甘美・ふくよか・やさしく包む。夕暮れのような、落ち着いた温かい明るさ。',
      game: '告白のシーン、家族との再会、エンディングのスタッフロール。',
      play: '♭4つ。ピアノでは黒鍵が手になじみ、ロマンチックな曲に多い調です。',
      pieces: [
        ['「悲愴」ソナタ 第2楽章', C.beethoven, 'Piano Sonata No.8, Op.13 (Beethoven, Ludwig van)', ''],
        ['英雄ポロネーズ Op.53', C.chopin, 'Polonaise in A-flat major, Op.53 (Chopin, Frédéric)', ''],
        ['愛の夢 第3番', C.liszt, 'Liebesträume, S.541 (Liszt, Franz)', ''],
        ['エオリアン・ハープ（練習曲 Op.25-1）', C.chopin, 'Études, Op.25 (Chopin, Frédéric)', '']
      ]
    },
    Fm: {
      use: 2,
      mood: '深い嘆き・陰うつ・情熱を内に秘めた暗さ。',
      game: '吹雪、廃墟、悲しい過去の回想、静かに燃える怒り。',
      play: '♭4つ。ピアノで重厚に響きます。',
      pieces: [
        ['ピアノ・ソナタ 第23番「熱情」', C.beethoven, 'Piano Sonata No.23, Op.57 (Beethoven, Ludwig van)', ''],
        ['「四季」より「冬」', C.vivaldi, 'Violin Concerto in F minor, RV 297 (Vivaldi, Antonio)', ''],
        ['ピアノ協奏曲 第2番', C.chopin, 'Piano Concerto No.2, Op.21 (Chopin, Frédéric)', ''],
        ['幻想曲 Op.49', C.chopin, 'Fantaisie, Op.49 (Chopin, Frédéric)', '']
      ]
    },
    // ===== ♭5 =====
    Db: {
      use: 2,
      mood: '柔らかい・神秘的・夢見るような明るさ。にじむ光のような響き。',
      game: '月夜、星空、回想、魔法の泉、物語の終わりの静かな余韻。',
      play: '♭5つ。ピアノでは黒鍵5つを全部使い、実は手になじみやすい調です。',
      pieces: [
        ['月の光（「ベルガマスク組曲」より）', C.debussy, 'Suite bergamasque, CD 82 (Debussy, Claude)', ''],
        ['雨だれの前奏曲（Op.28-15）', C.chopin, 'Preludes, Op.28 (Chopin, Frédéric)', ''],
        ['子犬のワルツ（ワルツ 第6番 Op.64-1）', C.chopin, 'Waltzes, Op.64 (Chopin, Frédéric)', ''],
        ['「新世界より」第2楽章（家路）', C.dvorak, 'Symphony No.9, Op.95 (Dvořák, Antonín)', '交響曲全体はホ短調']
      ]
    },
    Bbm: {
      use: 1,
      mood: '暗く重い・葬送・陰影の濃い悲しみ。',
      game: '葬送、滅びの予言、最終決戦前夜、魔王の過去。',
      play: '♭5つ。ピアノではよく使われる短調です。',
      pieces: [
        ['ピアノ・ソナタ 第2番（「葬送」）', C.chopin, 'Piano Sonata No.2, Op.35 (Chopin, Frédéric)', '第3楽章が有名な「葬送行進曲」'],
        ['ピアノ協奏曲 第1番', C.tchaikovsky, 'Piano Concerto No.1, Op.23 (Tchaikovsky, Pyotr)', '有名な冒頭は変ニ長調で鳴ります'],
        ['ノクターン 第1番 Op.9-1', C.chopin, 'Nocturnes, Op.9 (Chopin, Frédéric)', ''],
        ['スケルツォ 第2番', C.chopin, 'Scherzo No.2, Op.31 (Chopin, Frédéric)', '変ロ短調で始まり、変ニ長調で終わります']
      ]
    },
    // ===== ♭6 =====
    Gb: {
      use: 1,
      mood: 'やわらかい・ぼんやり明るい・夢心地。嬰ヘ長調と同じ音で、書き方が違うだけです。',
      game: '雲の上、夢の世界、眠りにつく前の場面。',
      play: '♭6つ。ピアノでは黒鍵中心に弾けて、意外と手になじむ調です。',
      pieces: [
        ['黒鍵のエチュード（練習曲 Op.10-5）', C.chopin, 'Études, Op.10 (Chopin, Frédéric)', ''],
        ['即興曲 Op.90-3', C.schubert, '4 Impromptus, D.899 (Schubert, Franz)', ''],
        ['ユーモレスク（Op.101-7）', C.dvorak, '8 Humoresques, Op.101 (Dvořák, Antonín)', ''],
        ['蝶々のエチュード（練習曲 Op.25-9）', C.chopin, 'Études, Op.25 (Chopin, Frédéric)', '']
      ]
    },
    Ebm: {
      use: 1,
      mood: '深い不安・沈んだ悲しみ・闇。とても暗い響きとして扱われてきた調です。',
      game: '深淵、呪われた土地、すべてを失った場面。',
      play: '♭6つ。同じ音の嬰ニ短調よりは、こちらで書かれるのが一般的です。',
      pieces: [
        ['平均律クラヴィーア曲集 第1巻 第8番 前奏曲', C.bach, 'Prelude and Fugue in E-flat minor, BWV 853 (Bach, Johann Sebastian)', ''],
        ['ポロネーズ 第2番 Op.26-2', C.chopin, 'Polonaises, Op.26 (Chopin, Frédéric)', '']
      ]
    },
    // ===== ♭7 =====
    Cb: {
      use: 0,
      mood: 'ほとんど使われません。同じ音の「ロ長調」で書かれるのがふつうです。',
      game: '使うならロ長調として書くのがおすすめです。',
      play: '♭7つ。ハープは♭7つが基本の調律なので、ハープの曲では見かけることがあります。',
      pieces: []
    },
    Abm: {
      use: 0,
      mood: 'あまり使われません。同じ音の「嬰ト短調」で書かれることが多い調です。',
      game: '曲の途中で、変イ長調から暗転するときに一時的に使われることがあります。',
      play: '♭7つ。',
      pieces: [
        ['ピアノ・ソナタ 第12番 第3楽章「ある英雄の死をいたむ葬送行進曲」', C.beethoven, 'Piano Sonata No.12, Op.26 (Beethoven, Ludwig van)', 'ソナタ全体は変イ長調']
      ]
    }
  };
})();
