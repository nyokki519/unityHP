# Instagram検索露出・改善案

対象: https://www.instagram.com/unity_up9/

## Google検索に表示される条件

Instagramの公式ヘルプは、対象となる公開のプロアカウントの写真・動画がGoogle等の外部検索エンジンに表示される設定を案内している。一般に年齢18歳以上・公開アカウント・ビジネス/クリエイターが対象条件となるが、**本アカウントの条件適合・設定・Google登録は未確認**。表示許可はインデックス/順位を保証しない。個人アカウントのプロフィールURLが発見されることと、プロアカウントの投稿が外部検索対象になることは区別する。

公式ソース: https://help.instagram.com/147542625391305/

クラウドのMeta通信制限により、この環境では公式本文を直接取得できなかった。HP公開監査の `officialResearch` に取得結果を保存する。資料未取得の場合は、アプリ内設定と公式ヘルプで条件を再確認してから操作する。投稿日時の対象範囲など未確認の条件を断定しない。

## プロフィール案（公開は未実施）

名前: **Unity｜東京・品川のカフェ会**

自己紹介例:

> 東京・品川を中心に、20代が集まるカフェコミュニティ☕️
> 読書・コーヒー・交流をきっかけに、日常に新しいつながりを。
> おひとり・初参加も歓迎。
> 開催案内と参加方法はこちら↓

リンク欄: https://nyokki519.github.io/unityHP/

開催ごとの参加対象が異なる場合は個別案内を優先する。HPは既にInstagramへリンクする。Instagram側からHPへのリンクと名前/自己紹介変更にはアカウント権限が必要。

## 投稿の方針

- 実際に開催したカフェ会/読書会の地域、活動、参加方法を自然な文章で記す。例えば「品川で、一冊の本をきっかけに会話を楽しみました」。キーワードの羅列は避ける。
- 次回イベントは確定日時・場所・料金・対象を確認して記載し、未確定情報を作らない。プロフィールの公式HP/申込導線へ案内する。
- 投稿画像のaltは実際の写真内容を説明する。参加者の公開同意を守り、氏名や参加者の個人情報をSEO素材にしない。
- ハッシュタグは関連する地域・活動に限定する。Google露出のための量産や不自然な相互リンクは行わない。

## Insights連携

Search ConsoleからInstagram Insightsは取得できない。Instagram Platformの別認証・対象プロアカウント・Insights権限が必要。Instagram LoginとFacebook Loginで権限名/要件が異なるため、利用方式と現行API versionを公式資料で決める。スクレイピング、非公式cookie取得、個人アカウントのデータ取得は実装しない。

公式資料:
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/insights/
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/

本プロジェクトではプロフィール案とHP相互リンクの片側まで実装。アカウント設定変更・投稿公開・Insights取得は未実施であり、人間によるアカウント権限の確認後に進める。
