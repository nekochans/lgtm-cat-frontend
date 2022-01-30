# lgtm-cat-frontend

[![ci](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/nekochans/lgtm-cat-frontend/badge.svg?branch=main)](https://coveralls.io/github/nekochans/lgtm-cat-frontend?branch=main)

lgtm-cat（サービス名 LGTMeow https://lgtmeow.com のフロントエンド用プロジェクトです。

# Getting Started

## 環境変数の設定

`.env`を作成し、下記を設定してください。

```
NEXT_PUBLIC_APP_URL=本アプリケーションのURL、ローカルの場合は http://localhost:2222
NEXT_PUBLIC_GA_MEASUREMENT_ID=Google Analytics（次世代の4）の測定ID（G-から始まるID）を指定
COGNITO_CLIENT_ID=CognitoUserPoolのクライアントIDを指定
COGNITO_CLIENT_SECRET=CognitoUserPoolのクライアントシークレットを指定
COGNITO_TOKEN_ENDPOINT=https://{CognitoUserPoolのドメイン名}.auth.ap-northeast-1.amazoncognito.com/oauth2/token
LGTMEOW_API_URL=https://github.com/nekochans/lgtm-cat-api が稼働しているURLを指定
```

テストコード内で以下の環境変数を参照するので、以下の 2 つは `.env` だけでなく環境変数として登録しておく事をオススメします。

[direnv](https://github.com/direnv/direnv) を使って `.envrc` を配置するのが簡単です。

```
export COGNITO_TOKEN_ENDPOINT=https://{CognitoUserPoolのドメイン名}.auth.ap-northeast-1.amazoncognito.com/oauth2/token
export LGTMEOW_API_URL=https://github.com/nekochans/lgtm-cat-api が稼働しているURLを指定
```

なくてもテストが通りますが、Mock Service Worker に渡す URL が `undefined` になる為、Mock 周りで何かトラブルがあった際にデバッグの妨げになる可能性があるので設定しておくのが無難です。

## 依存 package のインストールと開発用アプリケーションサーバーの起動

`npm ci` で依存 package をインストールします。

その後 `npm run dev` でホットリロードが有効な状態でアプリケーションサーバーを起動します。

`http://localhost:2222` でアクセス可能です。

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
