# 基本方針

UI Component は [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) で開発します。

よって本アプリケーションには UI Component はほとんど実装されずにビジネスロジックの実装が中心となります。

# ディレクトリ構成について

各ディレクトリの役割について記載します。

所々でドメイン駆動設計の用語が出てきますが、厳密にドメイン駆動設計をやろうという意図はなく、一部のパターンと用語を拝借しているだけです。

まだまだ発展途上のアプリケーションなので、今後もより良い形にリファクタリングを継続していきます。

# `src` 以下のディレクトリ

## `index.ts` の作成について

各ディレクトリ毎に `index.ts` を作成して、そこから外のディレクトリに公開したい関数や型定義だけを export するようにします。

これは export の範囲を限定可する事でリファクタリング時の影響範囲を小さくする事が主な目的です。

ただし例外的に `src/pages/` に関しては Next.js のルール上、ここに置かれた物がそのままルーティングとして解釈されてしまうので `index.ts` の配置は行いません。

（例）`src/features/imageData.ts` は `features/` 内でのみ利用したいが外には export したくない。

## `export default` について

以下の記事にもありますが、主にリファクタリング面や IDE のサポート面で不利になる可能性があるので `export default` を利用しない方針とします。

- [なぜ default export を使うべきではないのか？](https://engineering.linecorp.com/ja/blog/you-dont-need-default-export/)
- [Avoid Export Default](https://typescript-jp.gitbook.io/deep-dive/main-1/defaultisbad)

ただし例外的に `src/pages/` に関しては Next.js のルール上 `export default` を利用する必要があるので `src/pages/` では `export default` を利用します。

## components

純粋な関数型 Component を格納する為のディレクトリです。

出来る限り `props` にのみ依存する Component になるのが理想です。

Component の内部で React hooks を利用する事は問題ありません。

一部 `next/future/image` に依存しているものがありますが、将来的にこれは別のディレクトリに移動させるかもしれません。

基本方針のところにも書きましたが、基本的に UI Component は [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) で開発します。

そのため、本アプリケーションには Component が実装される事はあまりないと思います。

[@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) にも ReactNode を渡す Component がいくつか存在するので、そのような Component はここで実装する事になります。

また `GoogleTagManager` などの UI の役割を持たない Component もここで定義する事になります。

## constants

アプリケーション全体で利用する定数を格納します。

定数なので演算処理などを入れないようにします。

また外部ライブラリには依存せずに、順数な TypeScript のオブジェクト、または関数として実装します。

## docs

Markdown 形式で管理したいドキュメントを格納します。

あくまでもアプリケーション上で利用する物が対象で、開発者向けのドキュメントなどは含まない事に注意して下さい。

[react-markdown](https://github.com/remarkjs/react-markdown) 等のライブラリを用いてレンダリングされます。

## edge

Edge Runtime 上で実行されるファイルを格納します。

`src/middleware.ts` からはここに定義されているファイルだけに依存するようにして下さい。

Node.js の API は利用出来ないので以下のドキュメントを参照しながら実装して下さい。

- https://edge-runtime.vercel.sh/features/available-apis

## features

[bulletproof-react](https://github.com/alan2207/bulletproof-react) のように `features` の配下に `components` や `api` などをまとめる設計もありますが、本プリケーションはそれほど機能が多い訳ではないので、本アプリケーションにおける `features` の役割はあくまでも コアとなるビジネスロジックを格納する為のディレクトリです。

ドメイン駆動設計のパターンを全て踏襲している訳ではありません。

`src/api/` で実装する API 接続用関数のインターフェースやビジネスロジック上重要な関数や型定義などを実装します。

また外部ライブラリには依存せずに、順数な TypeScript のオブジェクト、または関数として実装します。

ただし例外的に [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) に定義している型定義や関数に依存している箇所があります。

[@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) は自作 Package なので例外的にこれを認めています。

### features/errors

ビジネス上意味のあるエラーオブジェクトを定義します。

TypeScript の汎用エラーは使わずに何のエラーなのか分かりやすい名前をつけます。

## api

API に通信を行う関数を格納します。

現状は `src/api/fetch/` しか存在しませんが `fetch` の部分には HTTP クライアントが入ります。

実装する際は `features/` 配下に関数のインターフェースを実装して、それを利用する形で実装します。

## hooks

独自定義した Custom Hooks を格納します。

## layouts

レイアウト用の Component を格納します。

## mocks

[msw](https://mswjs.io/) 用の Mock 用関数を格納します。

Storybook やテストコードで利用します。

## pages

Next.js の page 用 Component を格納します。

Next.js に依存する処理以外は極力書かずに、その他の層に処理を移譲するように意識します。

## styles

大部分の Component を [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) で開発しているので、CSS はほとんど登場しません。

例外的に Markdown をスタイリングする為の CSS がここに格納されています。

## templates

アトミックデザインで言うところの `Templates` が格納されます。

大部分の Component を [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) で開発しているので、本アプリケーションで作成する Component のほとんどは `Templates` になります。

ここでは [@nekochans/lgtm-cat-ui](https://github.com/nekochans/lgtm-cat-ui) で作成した `Templates` Component を export して利用しています。

アトミックデザインから用語を拝借しましたが、本プロジェクトではアトミックデザインに準拠している訳ではありません。

`pages` からはここに定義されている `Templates` Component を利用します。

## types

汎用的な型定義を格納します。

## utils

ドメイン駆動設計に出てくる infrastructure のような役割です。

ここでは外部ライブラリに依存して問題ありません。

## その他

### テストコード

各ディレクトリの同階層に `__tests__` ディレクトリを作成し、その中にテストコード用のファイルを作成します。

### Storybook

「Component 名」 + `.stories.tsx` で命名します。
