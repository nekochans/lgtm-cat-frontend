# src/ ディレクトリ構成

本ドキュメントはsrc配下の各ディレクトリの役割を説明しています。

## ディレクトリ構成（一部抜粋）

```text
src/
├── app/
│   └── (default)/
│       ├── page.tsx                         # 日本語版ホームページ
│       ├── upload/
│       │   └── page.tsx                     # 日本語版アップロードページ
│       └── en/
│           ├── page.tsx                     # 英語版ホームページ
│           └── upload/
│               └── page.tsx                 # 英語版アップロードページ
├── features/
│   └── main/
│       ├── components/
│       │   ├── home-page.tsx                 # ホームページ
│       │   ├── home-action-buttons.tsx      # アクションボタン群
│       │   ├── random-lgtm-images.tsx       # ランダム画像表示
│       │   ├── latest-lgtm-images.tsx       # 最新画像表示
│       │   └── service-description.tsx      # サービス説明
│       ├── actions/
│       │   ├── refresh-images.ts            # 画像更新アクション
│       │   └── copy-random-cat.ts           # ランダム猫コピーアクション
│       └── functions/
│           └── fetch-lgtm-images.ts         # API呼び出し関数
└── components/
    ├── icon-button.tsx                      # 汎用アイコンボタン
    ├── link-button.tsx                      # 汎用リンクボタン
    └── icons/
        ├── copy-icon.tsx                    # コピーアイコン
        └── github-icon.tsx                  # GitHubアイコン
```

## src/app/ - Next.js App Router層

Next.jsのApp Routerを利用する上で必要なルーティング用のファイルなどが格納されます。

[Next.js App Router - 公式ドキュメント](https://nextjs.org/docs/app)

Next.jsに直接関係しないファイルはここには置きません。

この層からは全ての層のファイルを利用可能です。

## src/components/ - 共通Component層

特定の機能に依存しない複数の機能から利用される可能性があるComponentはここに配置します。

純粋な関数Componentとして定義します。

故にこの層のComponentは全てStorybook上で状態を再現出来るようになっています。

## src/constants/ - 共通定数層

複数機能で利用される定数があればここに定義します。

## src/features/ - ドメイン層

アプリケーション固有のビジネスロジックが記載された、ドメイン層になります。

メタ情報などもLGTMeowのサービス説明などが含まれる重要知識と判断されるのでここに定義が存在します。

ドメイン層の機能は全ての層から利用可能です。

主に以下のような物が含まれます。

- ドメイン知識を持ったオブジェクトの型定義
- ドメイン知識を持った関数の実装
- ドメイン知識に関する関数の型定義の実装
- 各ドメインに特化したComponentの実装

### 外部依存のルール

ドメイン層は基本的には外部ライブラリに依存しません。

ただし例外があります。以下のようなケースでは外部ライブラリに依存している `src/lib` 等の機能を利用出来ます。

- fetchなどの標準で利用出来る機能は利用可能
- src/utils/ に配置している機能は利用可能 (Sentry等に依存している)
- サーバーアクション関数は依存性注入のパターンが使えないので `src/lib` の機能が利用可能

### サブディレクトリ構成

必要に応じてサブディレクトリ構成を作成します。ねこ画像アップロード機能を例に説明します。

`src/features/upload/` にはねこ画像アップロード機能に関する以下のサブディレクトリが存在します。

| サブディレクトリ | 役割                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `components/`    | アップロード機能でしか利用しないComponentを格納する              |
| `functions/`     | アップロード機能でしか利用しない関数を格納する                   |
| `actions/`       | アップロード機能でしか利用しないサーバーアクション関数を格納する |
| `types/`         | アップロード機能でしか利用しない型定義を格納する                 |

## src/lib/ - 外部ライブラリ層

ドメイン駆動設計等で言うインフラストラクチャ層と同じ。

外部ライブラリを利用して実装する機能はここに定義します。

`src/features/` に実装された関数の型定義に従った実装もこの層で実装します。

### 実装例

以下はファイルアップロードの例です。StorageはS3、GCS、R2など複数存在するので `src/features/` で関数のインターフェースを定義して `src/lib/cloudflare/r2/` で Cloudflare R2の実装を追加しています。

- `src/features/upload/types/storage.ts` - インターフェース定義
- `src/lib/cloudflare/r2/upload-to-r2.ts` - R2向け実装

## src/mocks/ - モック層

テストやStorybookで利用する共通のモックを定義する場所。

## src/scripts/ - スクリプト層

外部実行するスクリプトを定義する。

## src/types/ - 共通型定義層

複数の層で利用する型定義を格納する。

## src/utils/ - ユーティリティ層

複数の層で利用するユーティリティ関数を定義する。

ここにファイルを増やす前に他の層に定義出来ないかを検討すること。

ユーティリティ層に定義された関数は全ての層で利用可能とする。
