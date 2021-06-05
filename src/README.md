# ディレクトリ構成について

各ディレクトリの役割について記載します。

所々でドメイン駆動設計の用語が出てきますが、厳密にドメイン駆動設計をやろうという意図はなく、一部のパターンと用語を拝借しているだけです。

# `src` 以下のディレクトリ

## components

純粋な関数型Componentを格納する為のディレクトリです。

出来る限り `props` にのみ依存するComponentになるのが理想です。

Componentの内部でReact hooksを利用する事は問題ありません。

一部 `next/image` に依存しているものがありますが、将来的にこれは別のディレクトリに移動させるかもしれません。

## constants

アプリケーション全体で利用する定数を格納します。

定数なので演算処理などを入れないようにします。

また外部ライブラリには依存せずに、順数なTypeScriptのオブジェクト、または関数として実装します。

## containers

他リソースへの依存が含まれる React Component を格納します。

現状だとReactContext、Reduxに接続しているものが該当します。

## docs

Markdown形式で管理したいドキュメントを格納します。

あくまでもアプリケーション上で利用する物が対象で、開発者向けのドキュメントなどは含まない事に注意して下さい。

[react-markdown](https://github.com/remarkjs/react-markdown) 等のライブラリを用いてレンダリングされます。

## domain

コアとなるビジネスロジックを格納する為のディレクトリです。

ドメイン駆動設計のパターンを全て踏襲している訳ではありません。

### domain/errors

ビジネス上意味のあるエラーオブジェクトを定義します。

TypeScriptの汎用エラーは使わずに、`extensible-custom-error` 利用して何のエラーなのか分かりやすい名前をつけます。

### domain/repositories

ドメイン駆動設計でよく出てくる、Repositoryパターンのインターフェースを格納する為のディレクトリです。

APIに通信を行い、ビジネスロジック上重要なデータを取得するインターフェースなどが定義されます。

`type` を使って定義します。

### domain/types

TypeScriptの型定義はビジネスロジックそのものを表す事が多いので、ここに定義します。

### domain/functions

ビジネスロジック上重要な操作を定義します。

純粋なTypeScriptの関数として定義し、外部ライブラリには依存しないようにします。

もしも外部ライブラリに依存する場合はRepositoryパターンの利用を検討して下さい。

### hooks

独自定義したCustom Hooksを格納します。

## infrastructures

ドメイン駆動設計に出てくる infrastructure から言葉を借りています。

技術的な問題を解決する為の層なのでビジネスロジックは `domain` に定義します。

### infrastructures/repositories

`domain/repositories` で定義されたRepositoryの実装が格納されます。

ここでは外部ライブラリに依存して問題ありません。

### infrastructures/utils

どのようなWebアプリケーションを運用する上でも、利用する汎用的な関数を実装します。

例えば、サイトマップの作成やGoogle Analyticsの設定用関数が格納されます。

## layouts

レイアウト用のComponentを格納します。

## pages

Next.jsのpage用Componentを格納します。

Next.jsに依存する処理以外は極力書かずに、その他の層に処理を移譲するように意識します。

## stores

アプリケーション用のState管理を行う為の関数群を定義します。

Reduxなどの状態管理ライブラリに依存する関数群が実装されます。

現状はReactContextを使ったState管理用の関数群が格納されています。
