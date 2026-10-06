/* 写真・イベント・リンクの更新はこのファイルだけで行えます。README参照。 */
window.UNITY_CONTENT = {
  links: {
    registration: "https://nyokki519.github.io/Unity_S/",
    instagram:
      "https://www.instagram.com/unity_up9?igsh=MXVzcnlxZWloYmNpZQ%3D%3D&utm_source=qr",
    line: "https://lin.ee/vRZi9Rf",
  },
  eventFeed: {
    url: "https://unity-analytics.vercel.app/api/public/events",
    refreshMs: 300000,
    timeoutMs: 8000,
    limit: 6,
    // Analytics側に公開APIを追加・デプロイすると自動表示が始まります。
    images: {
      CAFE: "coffee",
      BOOK: "cafe",
      BEAUTY: "venue",
      "LATTE ART": "coffee",
      "BOARD GAME": "conversation",
      SPORT: "darts",
      COMMUNITY: "cafe",
    },
  },
  photos: {
    cafe: {
      src: "assets/images/gallery-1-1400.webp",
      srcset:
        "assets/images/gallery-1-480.webp 480w, assets/images/gallery-1-960.webp 960w, assets/images/gallery-1-1400.webp 1400w",
      width: 1400,
      height: 1050,
      alt: "カフェのテーブルを囲み、本を読むUnityの参加者たち",
      position: "50% 52%",
      mobilePosition: "47% 50%",
    },
    cafePortrait: {
      src: "assets/images/latte-workshop-768.webp",
      srcset:
        "assets/images/latte-workshop-480.webp 480w, assets/images/latte-workshop-768.webp 768w",
      width: 768,
      height: 1024,
      alt: "同じテーブルを囲んでラテアートを体験する参加者たち",
      position: "50% 50%",
      mobilePosition: "50% 50%",
    },
    darts: {
      src: "assets/images/gallery-2-1400.webp",
      srcset:
        "assets/images/gallery-2-480.webp 480w, assets/images/gallery-2-960.webp 960w, assets/images/gallery-2-1400.webp 1400w",
      width: 1400,
      height: 1050,
      alt: "ダーツを楽しむUnityの参加者たち",
      position: "50% 50%",
    },
    conversation: {
      src: "assets/images/gallery-3-1400.webp",
      srcset:
        "assets/images/gallery-3-480.webp 480w, assets/images/gallery-3-960.webp 960w, assets/images/gallery-3-1400.webp 1400w",
      width: 1400,
      height: 1050,
      alt: "ゲームの合間に、飲み物を囲んで話す参加者たち",
      position: "50% 50%",
    },
    gathering: {
      src: "assets/images/community-gathering-1024.webp",
      srcset:
        "assets/images/community-gathering-480.webp 480w, assets/images/community-gathering-960.webp 960w, assets/images/community-gathering-1024.webp 1024w",
      width: 1024,
      height: 768,
      alt: "会場に集まり、交流を楽しむUnityの参加者たち",
      position: "50% 65%",
      mobilePosition: "50% 65%",
    },
    coffee: {
      src: "assets/images/latte-art-768.webp",
      srcset:
        "assets/images/latte-art-480.webp 480w, assets/images/latte-art-768.webp 768w",
      width: 768,
      height: 1024,
      alt: "木のテーブルに置かれた猫のラテアート",
      position: "50% 57%",
      mobilePosition: "50% 57%",
    },
    venue: {
      src: "assets/images/event-osaki-720.webp",
      srcset:
        "assets/images/event-osaki-480.webp 480w, assets/images/event-osaki-720.webp 720w",
      width: 720,
      height: 480,
      alt: "大きな窓と木のテーブルがあるカフェの店内",
      position: "50% 50%",
    },
    yabu: {
      src: "assets/images/organizer-yabu-700.webp",
      width: 700,
      height: 700,
      alt: "Unity代表のやぶ",
      position: "50% 40%",
    },
    sayaka: {
      src: "assets/images/organizer-sayaka-700.webp",
      width: 700,
      height: 700,
      alt: "運営メンバーのさやか",
      position: "50% 50%",
    },
    michika: {
      src: "assets/images/organizer-michika-700.webp",
      width: 700,
      height: 700,
      alt: "運営メンバーのみちか",
      position: "50% 40%",
    },
    nyokki: {
      src: "assets/images/hobby-flowers-1200.webp",
      srcset:
        "assets/images/hobby-flowers-480.webp 480w, assets/images/hobby-flowers-960.webp 960w, assets/images/hobby-flowers-1200.webp 1200w",
      width: 1200,
      height: 1600,
      alt: "緑の葉の間に咲く白い花",
      position: "50% 40%",
    },
    ikechan: {
      src: "assets/images/hobby-snow-1200.webp",
      srcset:
        "assets/images/hobby-snow-480.webp 480w, assets/images/hobby-snow-960.webp 960w, assets/images/hobby-snow-1200.webp 1200w",
      width: 1200,
      height: 1200,
      alt: "雪山に囲まれた木造の小屋",
      position: "50% 37%",
    },
    // 追加の活動写真。原本はassets/originalsに保持しています。
    additionalScene: {
      src: "assets/images/futsal-1024.webp",
      srcset:
        "assets/images/futsal-480.webp 480w, assets/images/futsal-960.webp 960w, assets/images/futsal-1024.webp 1024w",
      width: 1024,
      height: 768,
      alt: "体育館でフットサルを楽しむUnityの参加者たち",
      position: "50% 50%",
      mobilePosition: "50% 50%",
    },
  },
  featured: {
    hero: "cafe",
    introduction: "cafePortrait",
    community: "gathering",
  },
  gallery: [
    {
      photo: "darts",
      category: "sport",
      caption: "初めましても、一緒に楽しむうちに。",
      layout: "landscape",
    },
    {
      photo: "conversation",
      category: "community",
      caption: "遊びの合間に、話が弾む。",
      layout: "landscape",
    },
    {
      photo: "additionalScene",
      category: "sport",
      caption: "ボールを追いかけて、距離が縮まる。",
      layout: "landscape",
    },
  ],
  // 実際の開催日時が未提供のため、日付を捏造せず募集先を案内します。
  // date:'2026-11-07', time:'14:00–16:00', location:'品川', url:'申込先' で更新できます。
  events: [
    {
      title: "カフェ会",
      category: "CAFE",
      image: "coffee",
      date: null,
      time: null,
      location: "品川エリア",
      description:
        "お気に入りの一杯と、肩の力が抜ける時間。少人数でゆっくり話すカフェ交流会。",
      url: null,
    },
    {
      title: "出会いと成長のある交流会",
      category: "COMMUNITY",
      image: "venue",
      date: null,
      time: null,
      location: "東京・大崎エリア",
      description:
        "新しい人、新しい場所。カフェをきっかけに、いつもの日常を少し広げてみる。",
      url: null,
    },
    {
      title: "一緒に遊ぶと、ぐっと近づく。",
      category: "SPORT",
      image: "darts",
      date: null,
      time: null,
      location: "東京都内",
      description:
        "ダーツやスポーツを通して、自然に生まれる会話。開催内容はInstagramや公式LINEでご確認ください。",
      url: null,
    },
  ],
  representative: {
    name: "やぶ（矢吹）",
    role: "Unity代表",
    photo: "yabu",
    initial: "Y",
    hobby: "カフェ巡り、グルメ開拓、フットサル、アニメ",
    heading: ["お互いに成長できる、", "そんな関係を。"],
    message:
      "美味しいものを巡るのが大好きで、年間300店舗以上開拓しています。お互いに成長できる関係が理想です。",
  },
  hosts: [
    {
      id: "sayaka",
      name: "さやか",
      role: "主催",
      photo: "sayaka",
      initial: "S",
      hobby: "カフェ巡り、ランニング",
      message:
        "Unityのみんなと一緒に、全員が楽しめる場をつくります。みんなで楽しみましょう。",
    },
    {
      id: "nyokki",
      name: "にょっき",
      role: "主催",
      photo: "nyokki",
      initial: "N",
      hobby: "生け花、フットサル、音楽",
      message:
        "ノリを大事に。参加者一人ひとりが心地よく過ごせる場づくりを大切にします。",
    },
    {
      id: "michika",
      name: "みちか",
      role: "主催",
      photo: "michika",
      initial: "M",
      hobby: "美容、読書、カフェ巡り",
      message:
        "向上心のある人や主体性のある人が集まり、つながれる。そんなコミュニティを目指します。",
    },
    {
      id: "ikechan",
      name: "いけちゃん",
      role: "主催",
      photo: "ikechan",
      initial: "I",
      hobby: "ゴルフ、スノボ、ベーグル作り",
      message:
        "「素敵な休日」と感じる。それを実際に体験できる場所づくりを目指します。",
    },
  ],
  voices: [
    {
      quote:
        "初めてでも緊張せずに話せる雰囲気で、気づいたら自然と会話が弾んでいました。",
      name: "Sさん",
      detail: "20代・公務員",
    },
    {
      quote: "少人数だからこそ深い話ができて、参加後もつながりが続いています。",
      name: "Yさん",
      detail: "20代・会社員",
    },
    {
      quote: "カフェという空間が心地よく、無理のないペースで交流できました。",
      name: "Mさん",
      detail: "30代・会社員",
    },
    {
      quote: "運営の方が丁寧にサポートしてくれるので、一人参加でも安心でした。",
      name: "Kさん",
      detail: "20代・自営業",
    },
    {
      quote: "同世代の色々な価値観に触れられて、良い刺激をもらっています。",
      name: "Nさん",
      detail: "30代・会社員",
    },
  ],
};
