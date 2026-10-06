# Unity Analyticsからのイベント自動取得

既存 `nyokki519/unity-analytics` のHEAD `d1977eda4d38f6280ec0739a480ff2d46e5ab3c5` を確認した変更案です。**ここに置いたファイルだけではVercelサイトにAPIは増えません。Analyticsリポジトリに反映・デプロイが必要です。**

## 方式

Analyticsの `events` テーブル → 公開用 `/api/public/events` → 公式サイトのイベント一覧。

HTMLのスクレイピングや参加者一覧APIは使用しません。イベント名・開始日時・カテゴリ・申込先のみを公開し、参加者、分析指標、raw_json、管理用の認証情報は返しません。既存のサーバー側Supabase設定を利用します。公式サイトにDBキーを入れる必要はありません。

## Analytics側への反映

1. `integrations/unity-analytics/` 内のファイルを、同じ相対パスでAnalyticsリポジトリに追加します。既存ファイルの変更は不要です。`unity-analytics-public-events.patch` をAnalyticsリポジトリで `git apply` しても追加できます。
2. Supabaseで `supabase/migrations/005_website_events.sql` を適用します。
3. **公式サイトに掲載するイベントだけ** `events.website_visible = true` に設定します。取り込み元には下書きも含まれるため、初期値はfalseです。SupabaseのTable Editorで対象を選ぶか、公開してよいイベントのIDを指定して設定してください。全件一括で公開しないでください。
4. Vercelへ通常のデプロイを行います。既存の `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` をサーバー側で利用します。新たなブラウザー用シークレットは不要です。
5. `https://unity-analytics.vercel.app/api/public/events` が200で `version: 1` と `events` 配列を返すことを確認します。
6. 公式サイトから読み込み、開催日・開始時刻・申込先が実際のイベントと一致することを確認します。

掲載設定はイベントごとに一度必要です。**掲載済みイベントの日時変更は、AnalyticsのDBに同期されれば公式サイトにも自動反映されます。** 新しく取り込まれたイベントは公開設定をした後に掲載されます。終了時刻・詳細住所は現行DBに専用項目がないため推測せず、募集先の案内を使います。

開始済み・中止・下書き・非公開イベントは表示対象外です。API側の中止などの判定は標準的な文字列状態を扱います。取り込み元が数値など別の状態コードを使う場合は、`lib/public-events.ts` の `hiddenStatuses` を実際の値に合わせ、状態変更の同期も確認してください。不明な状態のイベントは公開設定をしないでください。

公開データのAPIなのでCORSは `*`、認証Cookieは使いません。成功レスポンスは最大60秒キャッシュします。管理APIや既存のDBのRLSには変更を加えません。

## 公式サイト側（実装済み）

- `content.js` の `eventFeed.url` に公開APIを設定済み。
- サイトを開いた時と約5分ごとに更新。APIキャッシュにより最大約6分程度の反映差がありえます。
- 画面を再び開いた時も、前回更新から5分以上なら取得。
- 日本時間で開催日時を表示し、開始済みイベントは表示しません。
- API成功時に空配列なら「開催予定なし」を表示します。
- 通信・API・CORSエラー時は日付のない活動紹介と募集ページへの案内に戻ります。推測した日時や古いキャッシュは表示しません。
- 写真は公式サイト内のカテゴリ別写真を使います。イベント固有の写真ではなく活動イメージです。
- 公式LINEは `https://lin.ee/vRZi9Rf` を設定済み。

## 検証コマンド

Analyticsリポジトリの依存関係を導入後に実行：

```bash
npm run typecheck
npx tsx --test tests/public-events.test.ts
```

公開しない行の除外、個人情報などの非公開フィールドの除外、日時のタイムゾーン、未来順の並び、不正リンクの除外を検証します。API・CORS・実データの本番検証はデプロイ後に必要です。

このクラウド環境からVercelサイトへの取得は、現在のネットワークポリシーでHTTP 403でした。`unity-analytics.vercel.app` とLINE確認用の `lin.ee` を環境設定案の許可ドメインに追加済みです。既存の許可ドメインは保持しています。設定反映後に再検証してください。
