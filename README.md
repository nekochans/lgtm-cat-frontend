# lgtm-cat-frontend

[![ci](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/nekochans/lgtm-cat-frontend/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/nekochans/lgtm-cat-frontend/badge.svg?branch=main)](https://coveralls.io/github/nekochans/lgtm-cat-frontend?branch=main)

lgtm-cat（サービス名 LGTMeow https://lgtmeow.com  のフロントエンド用プロジェクトです。

## 環境変数

`.env`を作成し、下記を設定してください。

```
NEXT_PUBLIC_APP_URL=本アプリケーションのURL、ローカルの場合は http://localhost:2222
NEXT_PUBLIC_GA_MEASUREMENT_ID=Google Analytics（次世代の4）の測定ID（G-から始まるID）を指定
```

## デプロイについて

このアプリケーションは [Vercel](https://vercel.com) によってホスティングされています。 

`main` ブランチにマージされた時点で本番環境へデプロイが行われます。

### Vercel上の環境変数について

アプリケーションで利用する環境変数が増えた場合は [こちら](https://vercel.com/nekochans/lgtm-cat-frontend/settings/environment-variables) より設定が必要です。

環境変数は以下の環境毎に必要です。

- Production
  - 本番環境
- Preview
  - GitHubのブランチにプッシュされる度に一時的に生成される環境
- Development
  - [vercel dev](https://vercel.com/docs/cli#commands/dev) コマンドでローカル環境を起動した場合、この環境変数が利用されます。

※ 全環境で共有な環境変数を設定する事も可能です。

## 設計方針

- [ディレクトリ構成説明](https://github.com/nekochans/lgtm-cat-frontend/blob/main/src/README.md)
