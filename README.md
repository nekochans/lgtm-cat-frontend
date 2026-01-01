# lgtm-cat-frontend

[![ci](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/nekochans/lgtm-cat-frontend/branch/main/graph/badge.svg?token=PQ4VYSDNFX)](https://codecov.io/gh/nekochans/lgtm-cat-frontend)
[![chromatic](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/chromatic.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/chromatic.yml)

lgtm-cat（サービス名 LGTMeow https://lgtmeow.com のフロントエンド用プロジェクトです。

# Getting Started

## 環境変数の設定

`.env.local`を作成し、下記を設定してください。

数がそれなりに多いので `vercel env pull .env.local` で環境変数をダウンロードするのがオススメです。

https://vercel.com/docs/cli#commands/dev/when-to-use-this-command

```
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_APP_URL=本アプリケーションのURL、ローカルの場合は http://localhost:2222
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-から始まるGoogle Tag ManagerのIDを指定
EDGE_CONFIG=Vercel Edge ConfigのURL（Vercel上の値を参照）
COGNITO_TOKEN_ENDPOINT=/oauth2/token で終わるCognitoのエンドポイントを指定
COGNITO_CLIENT_ID=CognitoUserPoolのClient IDを指定
COGNITO_CLIENT_SECRET=CognitoUserPoolのClient Secretを指定
LGTMEOW_API_URL=https://github.com/nekochans/lgtm-cat-api が稼働しているAPIサーバーのURLを指定
IMAGE_RECOGNITION_API_URL=ねこ画像判定APIが稼働しているAPIサーバーのURLを指定
UPSTASH_REDIS_REST_URL=upstash Redis REST APIのURLを指定
UPSTASH_REDIS_REST_TOKEN=upstash Redis REST APIのトークンを指定
R2_ENDPOINT_URL=Cloudflareの /r2/overview で確認できるR2のエンドポイントURLを指定（S3 APIという項目）
R2_ACCESS_KEY_ID=CloudflareのR2のアクセスキーIDを指定
R2_SECRET_ACCESS_KEY=CloudflareのR2のアクセスキーシークレットを指定
R2_BUCKET_NAME=CloudflareのR2バケット名を指定
```

ローカルでSentryやChromaticの動作確認を実施する場合 [direnv](https://github.com/direnv/direnv) を使って `.envrc` に以下の環境変数を設定します。

```
export CHROMATIC_PROJECT_TOKEN=Chromaticのトークンを指定
export NEXT_PUBLIC_APP_ENV=local
export NEXT_PUBLIC_APP_URL=http://localhost:2222
export SENTRY_ORG=Sentryの組織を指定（Vercel上の値を参照）
export SENTRY_PROJECT=Sentryのプロジェクト名（Vercel上の値を参照）
export NEXT_PUBLIC_SENTRY_DSN=SentryのDNS（Vercel上の値を参照）
export SENTRY_AUTH_TOKEN=Sentryのトークン（Vercel上の値を参照）
```

`CHROMATIC_PROJECT_TOKEN` に関しては `npm run chromatic` を利用しない限りは設定不要です。

以下の環境変数は Sentry の初期化に必須です。

- `NEXT_PUBLIC_APP_ENV`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

## Node.js のインストール

24 系の最新を利用して下さい。

複数プロジェクトで異なる Node.js のバージョンを利用する可能性があるので、Node.js 自体をバージョン管理出来るようにしておくのが無難です。

以下は [mise](https://github.com/jdx/mise) を使った設定例です。

```bash
mise install node@24.12.0

mise use node@24.12.0
```

## 依存 package のインストールと開発用アプリケーションサーバーの起動

`npm ci` で依存 package をインストールします。

その後 `npm run dev` でホットリロードが有効な状態でアプリケーションサーバーを起動します。

`http://localhost:2222` でアクセス可能です。

## メンテナンスモードについて

[Vercel Edge Config](https://vercel.com/docs/storage/edge-config) を利用してメンテナンスモードを実現しています。

以下から Vercel Edge Config を編集可能です。

https://vercel.com/nekochans/lgtm-cat-frontend/stores

それぞれ以下のように対応しています。

- `lgtm-cat-frontend-store` （本番用）
- `stg-lgtm-cat-frontend-store` （ローカルを含む開発、ステージング用）

<img width="1416" alt="VercelEdgeConfig" src="https://github.com/nekochans/lgtm-cat-frontend/assets/11032365/7cf65e37-9009-4a79-b039-8f9353ec5c54">

メンテナンスモードに移行する為には `isInMaintenance` を `true` に変更します。

編集後は「Save」を押下するか `Command + s` で保存しないと反映されません。

<img width="1415" alt="VercelEdgeConfigEdit" src="https://github.com/nekochans/lgtm-cat-frontend/assets/11032365/e61c7ff4-ded5-4e42-9ce9-0be2abb371bc">

メンテナンスモードになると全てのページでメンテナンス中を示すエラーページが表示されます。

<img width="1069" height="923" alt="Image" src="https://github.com/user-attachments/assets/2fa02175-0214-426b-a702-19083c6f0917" />

## 開発でよく使うコマンド

### `npm run lint`

様々な linter を実行します。

現在採用している linter は以下の通りです。（Prettier はどちらかと言うと Formatter）

- [Prettier](https://prettier.io/)
- [Biome](https://biomejs.dev/ja/guides/getting-started/)

ルールは [Ultracite](https://www.ultracite.ai/) の推奨ルールをそのまま利用しています。

こちらのチェックでエラーになったコードは CI のチェックを通過する事が出来ません。

### `npm run format`

linter で利用しているツールの format 機能を利用してソースコードの整形を行います。

### `npm run storybook`

Storybook のサーバーを起動します。

`http://localhost:6006` でアクセス可能です。

### `npm run test`

テストを実行します。

## npm package の注意点

### `dependencies` と `devDependencies` を明確に使い分ける

`npm install [package名]` を実行すると `package.json` の `dependencies` に追加されます。

開発にしか利用しない package（テストコードや Linter, Storybook とか）は `devDependencies` に追加します。

`devDependencies` に追加を行う為には `--save-dev` オプションを利用します。

`npm install [package名] --save-dev`

### `npm install` より `npm ci` を利用する

package 内容に変更を加えない場合は `npm install` ではなく `npm ci` を利用します。

`npm install` は `package-lock.json` が変更されてしまう可能性がある為です。

また `npm ci` のほうが高速に動作します。

### 場合によっては `--legacy-peer-deps` オプションを利用する

npm の 7 系からは依存 package の整合性を厳密にチェックするようになりました。

具体的には [こんな感じのエラー](https://github.com/nekochans/lgtm-cat-frontend/issues/87#issuecomment-864349773) が発生します。

これを回避する為には、 `npm install --legacy-peer-deps` のように `--legacy-peer-deps` オプションを使って対応します。

あまり良い方法ではありませんが、依存先の package が対応しない限りは、こちらではどうしようもないので、一時的に `--legacy-peer-deps` が必要な場合もあります。

### `npm dedupe` でモジュールの依存関係を整理する

`npm dedupe` を実行すると、モジュールの重複を整理してくれるので、複数の package を入れた後はこちらを実行するようにします。

`npm install` 実行時に `--legacy-peer-deps` を実行した場合は `npm dedupe --legacy-peer-deps` のように実行する必要があります。

https://docs.npmjs.com/cli/v7/commands/npm-dedupe

## デプロイについて

このアプリケーションは [Vercel](https://vercel.com) によってホスティングされています。

デフォルトブランチである `staging` ブランチにマージされるとステージング環境へデプロイされます。

`staging` ブランチにマージされると以下のように `main` ブランチに対してリリース用のPRが自動で作成されます。（追加で `staging` にPRがマージされるとそれもリリース用のPRに追加されます）

https://github.com/nekochans/lgtm-cat-frontend/pull/423

`main` ブランチにマージされた時点で本番環境へデプロイが行われます。

### Vercel 上の環境変数について

アプリケーションで利用する環境変数が増えた場合は [こちら](https://vercel.com/nekochans/lgtm-cat-frontend/settings/environment-variables) より設定が必要です。

環境変数は以下の環境毎に必要です。

- Production
  - 本番環境
- Preview
  - GitHub のブランチにプッシュされる度に一時的に生成される環境
- Preview（staging）
  - ステージング環境専用の環境変数が必要な場合は `staging` ブランチ用に設定します
- Development
  - [vercel dev](https://vercel.com/docs/cli#commands/dev) コマンドでローカル環境を起動した場合、この環境変数が利用されます。

※ 全環境で共有な環境変数を設定する事も可能です。

## 設計方針

AI向けのドキュメントを参照してください。

- [src/AGENTS.md](https://github.com/nekochans/lgtm-cat-frontend/blob/staging/src/AGENTS.md)
