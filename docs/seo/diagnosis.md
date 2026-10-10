# Unity SEO診断・施策記録（2026-10-11）

## 判定

| 項目 | 現在の証拠・判定 |
|---|---|
| Googleインデックス | 未確認。既存の所有権確認は保持。HTTP成功だけで登録済みと判断しない。GSC認証後にURL Inspectionで最終インデックス状態を確認する |
| sitemap/robots/確認HTML | remote mainの既存ファイルを取り込み保持。sitemapには実在する参加ガイド1ページを追加。公開HTTPはActionsの監査JSONで確認する |
| noindex/canonical/HTTP | ローカルHTMLにはnoindexなし、canonicalは正しい公式URL。公開HTTP・ヘッダーは別途Actionsで検証 |
| モバイル | 7画面幅の既存ブラウザー検証で横スクロール・円形写真・導線・演出・操作を確認。Safari/LINE実機の検証ではない |
| Core Web Vitals | 実ユーザーのLCP/INP/CLSは未取得。ブラウザーのレイアウト検証はfield CWVの代用ではない。利用者の希望によるスマホ約4.9秒のロゴ演出は維持し、初期HTML化・既存WebP/srcset・寸法指定・lazy loading・ローカルフォントを活用。演出による体感表示時間のトレードオフは残る |
| 検索可読性 | 写真・運営紹介・活動案内等がJS生成のみだった。今は同じcontent.jsから初期HTMLへ生成し、JS無効でも本文/画像/リンクが読める。JSは既存操作と最新イベント取得を引き継ぐ |
| GSC API | 注入済み認証のADC読込を試したが利用不可。読み取り専用API実装・模擬検証・未認証レポート生成済み。実指標の取得にはGoogle/API権限が必要 |
| Instagram検索 | 相互リンクのHP側を整備。設定条件・提案はinstagram.md参照。アカウント状態/検索表示許可/Insightsは認証なしでは確認できない |

## 変更内容

- titleに実際の地域・対象・活動を自然に含め、初期HTMLから全運営紹介・既存の写真/alt・活動案内を読めるようにした。
- Organization/WebSite/WebPage構造化データ、Instagram/つなげーとへの公式リンク、参加ガイドへの内部リンクを追加。未確定日時のEvent、架空の評価・住所は追加していない。
- `cafe-community/` を1ページ追加。東京・品川の20代向けカフェ会、初参加の流れ、開催ごとの条件確認を説明。五反田/ボードゲーム等の別ページ量産はしない。
- Google確認HTMLとrobotsは内容を変えない。GitHub **Project Pagesの `/unityHP/robots.txt` はcrawlerが読むorigin root `/robots.txt` の代わりにならない**。root 404ならブロックではなく、root設定はプロジェクト側から変更できない。公開監査では両方を区別する。
- 週次監視はUnity-agentで実装。検索指標と申込数・Instagram Insightsは別データとして扱う。現時点で申込CVRやSEO因果効果を取得できるとはしない。

## 証拠と制約

クラウドのHTTP proxyがGoogle/Meta/Pagesを遮断したため、ローカル接続失敗をサイトのHTTP403と誤認しない。公開監査はGitHub Actionsから実行し `public-audit.json` に取得日時・HTTP・robots・構造化データ・公式仕様資料の取得結果を保存する。公式資料のHTTP200と本文条件が確認できたものだけを「取得済み」とする。

Googleへの登録・順位上昇・流入増加は未保証、未測定。GSC接続後に28日以上の観察と前後比較を続ける。既存の所有権確認が完了していてもインデックス完了やAPI認証とは別である。

## ロールバック

SEO変更commitを `git revert` し、テスト後にmainへ通常pushする。確認HTMLは削除しない。sitemapは実際に存在するcanonical URLのみ維持する。監視停止はAgentのActions無効化または専用secretの解除で行う。
