# lgtm-cat-frontend

[![ci](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/nekochans/lgtm-cat-frontend/branch/main/graph/badge.svg?token=PQ4VYSDNFX)](https://codecov.io/gh/nekochans/lgtm-cat-frontend)
[![chromatic](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/chromatic.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/chromatic.yml)

lgtm-cat（サービス名 LGTMeow https://lgtmeow.com のフロントエンド用プロジェクトです。

2022 年 9 月に新デザインバージョンをリリースしました。

[tomoshige](https://twitter.com/ooopetiteooo) さんに Figma で作成して頂きました。 [tomoshige](https://twitter.com/ooopetiteooo) さん、ありがとうございます 🐱

# Getting Started

## 環境変数の設定

`.env`を作成し、下記を設定してください。

数がそれなりに多いので `vercel env pull .env` で環境変数をダウンロードするのがオススメです。

https://vercel.com/docs/cli#commands/dev/when-to-use-this-command

```
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_APP_URL=本アプリケーションのURL、ローカルの場合は http://localhost:2222
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-から始まるGoogle Tag ManagerのIDを指定
NEXT_PUBLIC_LGTMEOW_BFF_URL=https://github.com/nekochans/lgtm-cat-bff が稼働しているURLを指定
EDGE_CONFIG=Vercel Edge ConfigのURL（Vercel上の値を参照）
```

以下の環境変数はテストコード実行時や Build 時に参照されるので [direnv](https://github.com/direnv/direnv) を使って `.envrc` を配置するのが良いです。

```
export NEXT_PUBLIC_LGTMEOW_BFF_URL=https://github.com/nekochans/lgtm-cat-bff が稼働しているURLを指定
export CHROMATIC_PROJECT_TOKEN=Chromaticのトークンを指定
export NEXT_PUBLIC_APP_ENV=local
export NEXT_PUBLIC_APP_URL=http://localhost:2222
export NEXT_PUBLIC_LGTMEOW_BFF_URL=https://github.com/nekochans/lgtm-cat-bff が稼働しているURLを指定
export SENTRY_ORG=Sentryの組織を指定（Vercel上の値を参照）
export SENTRY_PROJECT=Sentryのプロジェクト名（Vercel上の値を参照）
export NEXT_PUBLIC_SENTRY_DSN=SentryのDNS（Vercel上の値を参照）
export SENTRY_AUTH_TOKEN=Sentryのトークン（Vercel上の値を参照）
```

以下の環境変数はなくてもテストが通りますが、Mock Service Worker に渡す URL が `undefined` になる為、Mock 周りで何かトラブルがあった際にデバッグの妨げになる可能性があるので設定しておくのが無難です。

- `NEXT_PUBLIC_LGTMEOW_BFF_URL`

`CHROMATIC_PROJECT_TOKEN` に関しては `npm run chromatic` を利用しない限りは設定不要です。

以下の環境変数は Sentry の初期化に必須です。

- `NEXT_PUBLIC_APP_ENV`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

## `.npmrc` の追加

GitHub Packages 内の private package を利用しているので、プロジェクトルートに `.npmrc` が必要です。

[こちら](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) を参考に Personal Access Token を発行します。

権限は `read:packages` があれば問題ありません。以下は作成例です。

![personal-access-token](https://user-images.githubusercontent.com/11032365/189850906-6008cb05-1705-409f-beec-4910f9175c90.jpg)

Personal Access Token を発行したら以下の内容で`.npmrc` を作成します。

`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` の部分は発行した Personal Access Token に置き換えて下さい。

```
@nekochans:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Node.js のインストール

18 系の最新を利用して下さい。

複数プロジェクトで異なる Node.js のバージョンを利用する可能性があるので、Node.js 自体をバージョン管理出来るようにしておくのが無難です。

以下は [asdf](https://asdf-vm.com/) を使った設定例です。

```bash
asdf install nodejs 18.12.1

asdf local nodejs 18.12.1
```

## 依存 package のインストールと開発用アプリケーションサーバーの起動

`npm ci` で依存 package をインストールします。

その後 `npm run dev` でホットリロードが有効な状態でアプリケーションサーバーを起動します。

`http://localhost:2222` でアクセス可能です。

## メンテナンスモードについて

`IS_IN_MAINTENANCE` が `1` の場合はメンテナンスページを強制的に表示します。

## 開発でよく使うコマンド

### `npm run lint`

様々な linter を実行します。

現在採用している linter は以下の通りです。（Prettier はどちらかと言うと Formatter）

- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Stylelint](https://stylelint.io/)

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

例えば `storybook` は React の最新版での動作しますが、依存関係上は 16 系を要求してくるので、インストールが出来ません。

具体的には [こんな感じのエラー](https://github.com/nekochans/lgtm-cat-frontend/issues/87#issuecomment-864349773) が発生します。

これを回避する為には、 `npm install --legacy-peer-deps` のように `--legacy-peer-deps` オプションを使って対応します。

あまり良い方法ではありませんが、依存先の package が対応しない限りは、こちらではどうしようもないので、一時的に `--legacy-peer-deps` が必要な場合もあります。

### `npm dedupe` でモジュールの依存関係を整理する

`npm dedupe` を実行すると、モジュールの重複を整理してくれるので、複数の package を入れた後はこちらを実行するようにします。

`npm install` 実行時に `--legacy-peer-deps` を実行した場合は `npm dedupe --legacy-peer-deps` のように実行する必要があります。

https://docs.npmjs.com/cli/v7/commands/npm-dedupe

## デプロイについて

このアプリケーションは [Vercel](https://vercel.com) によってホスティングされています。

`main` ブランチにマージされた時点で本番環境へデプロイが行われます。

### Vercel 上の環境変数について

アプリケーションで利用する環境変数が増えた場合は [こちら](https://vercel.com/nekochans/lgtm-cat-frontend/settings/environment-variables) より設定が必要です。

環境変数は以下の環境毎に必要です。

- Production
  - 本番環境
- Preview
  - GitHub のブランチにプッシュされる度に一時的に生成される環境
- Development
  - [vercel dev](https://vercel.com/docs/cli#commands/dev) コマンドでローカル環境を起動した場合、この環境変数が利用されます。

※ 全環境で共有な環境変数を設定する事も可能です。

## 設計方針

各ドキュメントを参照して下さい。

- [ディレクトリ構成説明](https://github.com/nekochans/lgtm-cat-frontend/blob/main/src/README.md)
