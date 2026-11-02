# LGTMeow

猫好きのための LGTM 画像作成・共有サービス（https://lgtmeow.com）のフロントエンド。

## Language

**ログイン**:
GitHub アカウントによる利用者認証。LGTMeow の認証手段は GitHub OAuth のみで、Email/Password 認証は提供しない。
_Avoid_: サインイン、GitHub 連携

**匿名化メールアドレス**:
実メールアドレスの代わりに `user.email` へ格納するダミー値。形式は `gh-<GitHub User ID>@no-email.lgtmeow.invalid`。LGTMeow は `user:email` scope を要求せず、実メールアドレスを DB に保存しない（GitHub の公開プロフィールに実メールアドレスが含まれる場合、OAuth 処理中にメモリ上を通過することはある）。
_Avoid_: ダミーメール、仮メール

**アクセス制御ページ**:
ログイン済みユーザーのみ閲覧できるページ。未ログインでアクセスするとホームへリダイレクトされる。現在の対象はお気に入り（/favorites）・My Cats（/my-cats）・ログアウト（/logout）。
_Avoid_: 保護ページ、認証必須ページ

**Coming Soon ページ**:
機能が準備中であることを示す表示。お気に入りと My Cats は本実装までこの表示を返す。
_Avoid_: 準備中ページ、工事中ページ

**My Cats**:
ログインユーザーが自分の投稿した猫画像を確認する機能（準備中）。旧称「にゃんリスト（Meowlist）」から改名済み。
_Avoid_: にゃんリスト、Meowlist、cat-list
