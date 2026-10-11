# Unity — カフェコミュニティのブランドサイト

HTML / CSS / JavaScriptだけで動く静的サイトです。フレームワークやビルドは不要です。

## 今回の大型リニューアル

トップは全幅の実写写真と大きなUnityの文字へ変更しました。体験紹介は濃色の背景と大小の写真、イベントは番号と文字で構成した一覧、ギャラリーはPCでは写真に大小を付け、スマホでは幅を揃えた縦並びです。写真をタップすると拡大でき、左右ボタン・矢印キーで移動、閉じるボタン・Escapeで戻れます。

ユーザー提供のコーヒーカップとハートのトレードマークを、オープニング・ヘッダー・トップ・締め・フッター・ファビコンに使用しています。元の `unity-logo.jpg` は保持し、WebPのコピーを表示しています。代表・主催メンバーの写真はすべて円形です。にょっき・いけちゃんには、趣味にちなむ白い花・雪景色を使用しています。

英字見出しのCormorant Garamondは `assets/fonts/` に同梱しています。外部フォントの通信は不要で、ライセンスも同じ場所にあります。

## オープニングの演出

ページを開くと、アイボリーの全画面にトレードマークが浮かび、スマホは約4.9秒、PCは約2.3秒で写真のトップへフェードします。スマホはロゴ表示から3秒待ち、約1.8秒かけて本文へつなげます。写真とサイトのCSSが読み込めていなければ、ロゴを表示したまま最大10秒まで待ってから切り替えます。

新しいページを開くときはURLのハッシュ・クエリに関わらず再生します。同一ページ内のリンク移動では再生しません。LINEなどの画面復元（pageshow.persisted）や非表示からの復帰時も再生し、バックグラウンド中に演出が終わることを防ぎます。「動きを減らす」設定では拡大・移動を省き、穏やかな透明度の変化のみで表示します。Tab・Escapeでもすぐに本文へ進めます。

`intro.js` と `opening.css` が演出の原本です。`python3 tools/sync-opening.py` でCSS・実行コード・公式ロゴを `index.html` に埋め込みます。外部JS・ロゴ画像・サイトCSSの読み込みに依存せず、初期HTMLだけでロゴを表示できます。サイトのCSSはpreloadから適用し、JavaScript無効時はnoscriptの通常のstylesheetで本文を表示します。変更後は `node tools/build-static.mjs`、`python3 tools/sync-opening.py` の順に実行してから公開してください。

## ローカルで見る

```bash
cd /workspace/unityHP
python3 -m http.server 8010 --bind 127.0.0.1
```

通常のブラウザーでサーバーを開きます。写真・運営・活動案内は初期HTMLにも含みます。JavaScriptは操作と最新イベントの更新を担当します。外部フォント・外部画像の読み込みはありません。申込・Instagramは既存URLを引き継いでいます。

## 写真の掲載方針

現在の活動写真は、ヒーロー・紹介・体験・ギャラリー・コミュニティでそれぞれ1回ずつ掲載しています。イベント一覧では同じ写真を繰り返さず、番号・内容・日時・申込導線を表示します。追加されたラテアート・体験風景・交流会・フットサルの掲載位置は [PHOTO-PLACEMENT.md](PHOTO-PLACEMENT.md) を参照してください。

## 後から写真を追加する

**サイズ制限で送れなかった写真は、後で追加できます。HTMLの編集は不要です。**

1. 写真を `assets/images/` に保存します（ファイル名は半角英数字を推奨）。
2. `content.js` の `photos` に写真情報を追加、または既存の項目を差し替えます。
3. ギャラリーに追加する場合は `gallery` に写真IDを追加します。

```js
// photos の中に追加する例（実際の画像サイズ・説明に置き換えてください）
newCafe: {
  src: 'assets/images/new-cafe.webp',
  alt: 'カフェで本を囲んで話す参加者たち',
  width: 1600,
  height: 1200,
  position: '50% 45%',
  mobilePosition: '60% 50%'
},

// gallery の中に追加する例
{ photo: 'newCafe', category: 'cafe', caption: '本の話から、広がる会話。', layout: 'wide' },
```

`layout` は `wide` / `portrait` / `landscape`。`position` は切り抜き位置、`mobilePosition` はスマホ専用の位置です。`srcset` があれば画面幅に応じて軽量画像を選びます。

`additionalScene` には今回追加したフットサルの写真を設定しています。`src: null` のギャラリー写真は非表示です。写真が届いたら、その項目の `src`、`alt`、`width`、`height` を設定するだけで掲載されます。にょっき・いけちゃんの写真も同じ方法で設定できます。未設定時はイニシャルを表示し、架空の人物写真は使いません。

運営紹介の花・雪景色は趣味を表すモチーフとして採用しています。出典・利用条件は [assets/images/PHOTO-CREDITS.md](assets/images/PHOTO-CREDITS.md) に記録しています。写真の説明ラベルは表示しません。

ヒーローを変更する場合は `featured.hero`、紹介写真は `featured.introduction`、コミュニティ写真は `featured.community` に写真IDを設定します。

### 大きな写真を軽量化する（任意）

元写真は上書きしません。写真掲載はPillowなしでもできます。最適化ツールを使う場合のみPillowが必要です（現在の環境には導入済み）。

```bash
python3 tools/prepare-images.py /path/to/new-cafe.jpg --alt 'カフェで会話を楽しむ参加者たち'
```

WebPの複数サイズを作成し、`photos` に貼り付けられるデータを出力します。最大辺を1600pxに縮小し、位置情報などのEXIFを出力に含めません。同じ名前の出力がある場合は更新するので、別の写真には別のファイル名を使ってください。元のJPEG12枚はリポジトリ直下に残しています。`event-next.jpg` は主役の写真には使用していません。

## イベントを更新する

`content.js` の `events` だけを編集します。追加は項目を複製、削除は該当項目を削除します。

```js
{
  title: '読書とコーヒーの時間',
  category: 'BOOK',
  date: '2026-11-07', // 例です。実際に確定した日付を設定してください。
  time: '14:00–16:00',
  location: '品川',
  description: 'お気に入りの一冊を持ち寄って。',
  url: 'https://nyokki519.github.io/Unity_S/'
}
```

未確定の `date` / `time` は `null` にしてください。日付を勝手に生成しません。現在は確定日時が未提供のため「開催案内」として掲載し、日程・参加費の確認はInstagram・公式LINE、お申し込みは参加申込フォームへ案内しています。公開前に実際のイベント情報へ更新してください。過去のイベントは配列から削除するか、日付を更新します。自動受付・空席管理機能はありません。

Analyticsから開催日時を自動取得する処理も実装済みです。接続先の公開APIを追加・デプロイする手順は [integrations/README.md](integrations/README.md) を参照してください。API未提供・通信失敗時は上記の活動紹介に戻ります。

`links.registration` が全体の申込先、`links.instagram` がInstagramです。個別イベントの `url` が未設定なら共通の申込先を使います。公式LINE `https://lin.ee/vRZi9Rf` を設定済みです。Instagramセクションに表示されます。

## 代表・運営メンバーを更新する

`content.js` の `representative` が代表紹介、`hosts` が主催メンバーです。名前・役割・趣味・写真・メッセージをここで更新できます。メンバー追加は `hosts` の項目を複製してください。`photo` は `photos` の写真IDを指定します。未提供写真は `src: null` のままでイニシャル表示になります。

趣味はサイト内の「好きなこと」をタップすると開きます。紹介文は常に読めるようにしています。代表・主催4名の元の紹介情報を保持した方針は [CONTENT-NOTES.md](CONTENT-NOTES.md) に記録しています。

## ダウンロード版を更新する

```bash
python3 tools/create-preview.py /workspace/scratch/unity-preview/Unity.html
```

写真・ロゴ・フォント・CSS・JavaScriptをまとめたHTMLを生成します。写真を変更した時も再生成してください。イベント自動取得には通信とAnalytics側の公開APIが必要です。

## ファイル構成

- `index.html` — ブランドストーリー、FAQ、SEO・OGP
- `style.css` — 色・余白の変数とレスポンシブ表示
- `content.js` — 写真、イベント、運営、参加者の声、外部リンク
- `script.js` — データの描画、モバイルメニュー、開催情報の更新
- `intro.js` — トレードマークの導入演出・復帰時の再生・終了処理
- `opening.css` — 初期HTMLに埋め込む演出用CSS
- `tools/sync-opening.py` — 演出用コード・CSS・ロゴをHTMLへ埋め込む
- `event-feed.js` — 公開イベント情報の検証と変換
- `integrations/` — Analytics側の公開API・移行SQL・テストの変更案
- `assets/images/` — 軽量化した写真とOGP
- `assets/fonts/` — ローカルの英字フォントとライセンス
- `tools/prepare-images.py` — 任意の画像最適化ツール
- `tools/create-ogp.py` — トップの構成から共有用画像を生成

## 公開前に確認すること

GitHub Pagesでの公開を想定し、canonical / og:url / og:image / Twitter画像は `https://nyokki519.github.io/unityHP/` を設定しています。実際の公開URLが異なる場合は `index.html` の各URLを変更してください。OGP画像は `assets/images/ogp.jpg` です。運営メッセージはサイト用の編集原稿なので、公開前に運営側で内容をご確認ください。

GitHub Pagesの既存の公開設定を使用します。`main` の更新が `pages-build-deployment` を起動します。`.nojekyll` により静的ファイルをそのまま配信します。

## 表示と操作の確認

この環境ではPython Playwrightと `/usr/bin/chromium` が使用できます。追加した代表・運営紹介と既存の導線を、次のコマンドで確認できます。

```bash
python3 tools/create-preview.py /workspace/scratch/unity-preview/Unity.html
python3 tools/check-site.py
```

ローカル検証用サーバーはテスト内で起動・終了します。1440 / 1280 / 768 / 414 / 393 / 390 / 375pxで、プロフィール情報、円形の人物写真、趣味の開閉、写真拡大と前後移動・Escape・フォーカス復帰、メニュー、FAQ、ページ内リンク、外部リンクの設定、横スクロール、レイアウトのずれを確認します。AnalyticsのAPIは失敗レスポンスを再現して案内表示を確認します。本番APIや外部サイトの応答を検証したことにはなりません。

オープニングは通常の動きでPC・スマホの表示と切り替えを確認し、動きを減らす設定、ハッシュ付きの入口、Tab・Escape、外部スクリプト失敗、JavaScript無効時の本文表示も確認します。

### スマホのオープニング回帰確認

`python3 tools/check-opening.py` で、タッチ端末の画面設定、CSS・アプリスクリプトの5秒遅延、画像decodeの失敗・未対応、動きを減らす設定を検証します。iPhone・AndroidはChromiumでの端末条件の再現であり、Safari実機での検証ではありません。

## SEO Growth

既存の確認HTML/robotsを保持し、初期HTMLの可読性・構造化データ・内部リンクを改善しました。実際の活動に基づく [参加ガイド](cafe-community/index.html) をsitemapに追加しています。title/description/canonicalは引き続き1組を維持します。

content.jsや写真・紹介文を更新した後は、次を実行して生成HTMLもcommitしてください。

```bash
node tools/build-static.mjs
python3 tools/sync-opening.py
python3 -m unittest discover -s tests -v
```

公開後はActionsの「Validate SEO and published Pages」が実際のHTTP・canonical・確認ファイル等を検査し、`docs/seo/public-audit.json` に証拠を保存します。診断と制約は [docs/seo/diagnosis.md](docs/seo/diagnosis.md)、Instagramの設定条件と改善案は [docs/seo/instagram.md](docs/seo/instagram.md) を参照してください。

週次のSearch Console監視・比較・施策履歴・Obsidian出力は [Unity-agent](https://github.com/nyokki519/Unity-agent)、非公開レポートの保存と設定画面は [unity-analytics](https://github.com/nyokki519/unity-analytics) に実装しています。Google認証等の初回手順はAgent READMEを参照してください。順位やインデックスは未認証のまま断定せず、施策後28日以上を観察します。

## 匿名の参加申込導線計測

`growth-tracker.js` は公式公開originのみで訪問・申込クリックを集計し、Unity_Sへ匿名IDと推定流入元を渡します。Cookie・氏名・全URL・検索語は保存せず、DNT/GPCを尊重します。追跡が使えなくても画面・アニメーション・申込リンクは使えます。Googleの受理は別のフォーム確認トリガー、外部LINE/つなげーとの直接申込や実出席は対象外です。

[Analytics導入手順](https://github.com/nyokki519/unity-analytics/blob/main/docs/growth-measurement.md) / [フォーム受付確認](https://github.com/nyokki519/Unity_S/blob/main/integrations/google-form/README.md)。共有トラッカーを変更した場合はUnity_Sの同名ファイルも同時に更新してください。

検証: `node --test tests/growth-tracker.test.cjs`、`python tools/check-growth-browser.py --form-root ../Unity_S`（Playwright/Chromium使用）。後者は通信を差し替えるので架空申込を本番へ送りません。

## 今月のイベント一覧

紹介01/02/03は#monthly-eventsへ移動し、紹介そのものは維持します。Analyticsの公開専用APIが「運営出席」と同じeventsの今月（日本時間）を返し、HPは5分ごと・ページ復帰時に更新します。公開が明示されたイベントだけを表示し、取得失敗と公開予定0件を区別します。個別URLがあるイベントは「詳細・参加申込」、未設定のイベントは「参加申込フォームへ」として既存の共通フォームへ案内します。

[公開判定と連携仕様](https://github.com/nyokki519/unity-analytics/blob/main/docs/public-monthly-events.md)。`node --test tests/*.test.cjs`、`python tools/check-monthly-events.py`で月替わり/スマホ/アンカー/日時/リンク/取得失敗を検証できます。既存openingのチェックはtools/check-site.pyに維持しています。
