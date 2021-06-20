# ディレクトリ構成について

各ディレクトリの役割について記載します。

所々でドメイン駆動設計の用語が出てきますが、厳密にドメイン駆動設計をやろうという意図はなく、一部のパターンと用語を拝借しているだけです。

まだまだ発展途上のアプリケーションなので、今後もより良い形にリファクタリングを継続していきます。

# `src` 以下のディレクトリ

## components

純粋な関数型 Component を格納する為のディレクトリです。

出来る限り `props` にのみ依存する Component になるのが理想です。

Component の内部で React hooks を利用する事は問題ありません。

一部 `next/image` に依存しているものがありますが、将来的にこれは別のディレクトリに移動させるかもしれません。

## constants

アプリケーション全体で利用する定数を格納します。

定数なので演算処理などを入れないようにします。

また外部ライブラリには依存せずに、順数な TypeScript のオブジェクト、または関数として実装します。

## containers

他リソースへの依存が含まれる React Component を格納します。

現状だと ReactContext、Redux に接続しているものが該当します。

## docs

Markdown 形式で管理したいドキュメントを格納します。

あくまでもアプリケーション上で利用する物が対象で、開発者向けのドキュメントなどは含まない事に注意して下さい。

[react-markdown](https://github.com/remarkjs/react-markdown) 等のライブラリを用いてレンダリングされます。

## domain

コアとなるビジネスロジックを格納する為のディレクトリです。

ドメイン駆動設計のパターンを全て踏襲している訳ではありません。

### domain/errors

ビジネス上意味のあるエラーオブジェクトを定義します。

TypeScript の汎用エラーは使わずに、`extensible-custom-error` 利用して何のエラーなのか分かりやすい名前をつけます。

### domain/repositories

ドメイン駆動設計でよく出てくる、Repository パターンのインターフェースを格納する為のディレクトリです。

API に通信を行い、ビジネスロジック上重要なデータを取得するインターフェースなどが定義されます。

`type` を使って定義します。

### domain/types

TypeScript の型定義はビジネスロジックそのものを表す事が多いので、ここに定義します。

### domain/functions

ビジネスロジック上重要な操作を定義します。

純粋な TypeScript の関数として定義し、外部ライブラリには依存しないようにします。

もしも外部ライブラリに依存する場合は Repository パターンの利用を検討して下さい。

### hooks

独自定義した Custom Hooks を格納します。

## infrastructures

ドメイン駆動設計に出てくる infrastructure から言葉を借りています。

技術的な問題を解決する為の層なのでビジネスロジックは `domain` に定義します。

### infrastructures/repositories

`domain/repositories` で定義された Repository の実装が格納されます。

ここでは外部ライブラリに依存して問題ありません。

### infrastructures/utils

どのような Web アプリケーションを運用する上でも、利用する汎用的な関数を実装します。

例えば、サイトマップの作成や Google Analytics の設定用関数が格納されます。

## layouts

レイアウト用の Component を格納します。

## pages

Next.js の page 用 Component を格納します。

Next.js に依存する処理以外は極力書かずに、その他の層に処理を移譲するように意識します。

## stores

アプリケーション用の State 管理を行う為の関数群を定義します。

Redux などの状態管理ライブラリに依存する関数群が実装されます。

現状は ReactContext を使った State 管理用の関数群が格納されています。

## その他

### テストコード

各ディレクトリの `__tests__` に定義します。

### Storybook

「Component 名」 + `.stories.tsx` で命名します。

components 配下の Component のみ Storybook を作成しています。
