# src/ ディレクトリ構成

本ドキュメントはsrc配下の各ディレクトリの役割を説明しています。

## ディレクトリ概要

| ディレクトリ / ファイル | 責務                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| `src/proxy.ts`          | Next.js Proxy（リクエスト前処理）                                  |
| `src/features/`         | 機能単位のコード（詳細は `src/features/AGENTS.md` 参照）           |
| `src/types/`            | **共通利用する**型定義（主にドメインオブジェクト）                 |
| `src/lib/`              | 外部ライブラリに依存した処理                                       |
| `src/functions/`        | **共通利用する**ビジネスロジック（原則として外部ライブラリ非依存） |
| `src/constants/`        | **共通利用する**定数                                               |
| `src/utils/`            | **共通利用する**汎用関数（ビジネスロジックを持たない）             |
| `src/actions/`          | **共通利用する** Server Action 関数                                |
| `src/components/`       | **共通利用する** React Component                                   |
| `src/app/`              | Next.js App Router 関連ファイル                                    |
| `src/mocks/`            | テスト用モック（MSW サーバーインスタンス等）                       |
| `src/scripts/`          | ビルド・開発用スクリプト                                           |

## features ディレクトリの概要

特定の機能に閉じたコードは `src/features/<機能名>/` 配下に配置します。

- トップレベルの共通ディレクトリと同じ構成を取れます
- 許可されるサブディレクトリ: `types/`, `functions/`, `actions/`, `components/`, `constants/`
- `lib/` と `utils/` は features 配下には作りません（共通の `src/lib/`, `src/utils/` を利用してください）
- 詳細は `src/features/AGENTS.md` を参照してください

## レイヤー依存関係

```text
src/app/              → 全レイヤーに依存可能
src/features/<機能>/  → 共通レイヤー (types, lib, functions, constants, utils) に依存可能
                        同一機能内の types, functions, constants に依存可能
                        他の機能への直接依存は禁止
src/actions/          → types, lib, functions, constants に依存可能
src/components/       → types, lib, functions, constants, utils, actions（types/ 配下の型定義ファイルのみ）に依存可能
src/functions/        → types, constants に依存可能（lib には原則非依存）
src/lib/              → types, constants, functions, features に依存可能
src/utils/            → 他レイヤーに依存しない
src/constants/        → 他レイヤーに依存しない
src/types/            → constants に依存可能（定数からのユニオン型導出等）
src/mocks/            → 他レイヤーに依存しない（msw パッケージのみに依存）
```

**矢印の逆方向への依存は禁止です。** 例えば `src/types/` から `src/functions/` を import することはできません。

## 各ディレクトリ / ファイルの詳細ルール

### `src/proxy.ts`

Next.js 16 のファイルコンベンションである [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) ファイルです（Next.js 16 で `middleware.ts` から `proxy.ts` にリネームされました）。

- `src/app/` と同じ階層（`src/` 直下）に配置します
- ルートがレンダリングされる前にサーバー上で実行され、認証チェック・リダイレクト・リクエスト/レスポンスヘッダーの変更等を行います
- **レイヤー構造には属しません。** Next.js のファイルコンベンションとして特別な位置付けです
- `next/server`（`NextRequest`, `NextResponse`）に依存します
- 認証ライブラリ（`better-auth/cookies` 等）との連携でセッション判定を行う場合があります

### `src/types/`

共通利用する型を定義します。主にドメインオブジェクトで利用する型を定義する場所です。

- **全てのレイヤーから利用される可能性があります**
- `src/constants/` に依存可能です（定数からユニオン型を導出するパターン等）
- ビジネス上意味のある値には Branded Types を利用します（@docs/project-coding-guidelines.md 参照）
- **全ての型をここに定義する訳ではありません。** 特定の機能でしか使わない型は `src/features/<機能名>/types/` に定義してください
- ここに置くのは **複数箇所で共通利用される型** のみです

### `src/lib/`

特定の外部ライブラリに依存した処理を定義します。

- `src/features/` への依存が可能です。DDD のインフラストラクチャ層がドメイン層に依存するパターンに相当します
- `src/functions/` から `src/lib/` の機能を利用する場合は、`src/types/` に抽象的なインターフェース型を定義し、`src/lib/` 側でその型に準拠する実装を提供します

```typescript
// src/types/upload/storage.ts に抽象インターフェースを定義
export type UploadToStorageFunc = (
  file: File,
  presignedPutUrl: string,
) => Promise<UploadToStorageResult>;

// src/lib/ 側で型に準拠した実装を定義
import type { UploadToStorageFunc } from "@/types/upload/storage";

export const uploadToR2: UploadToStorageFunc = async (
  file: File,
  presignedPutUrl: string,
): Promise<UploadToStorageResult> => {
  // 実装
};
```

### `src/functions/`

ビジネスロジックを実現する為の関数を格納します。

- **全てのレイヤーから利用される可能性があります**
- 原則として純粋な関数として定義し、テスト可能な構造にします
- **テストを必ず用意します**
- **原則として `src/lib/` には依存しません**（上記の抽象インターフェースパターンで間接的に利用します）

#### 例外的に依存を許可する外部ライブラリ

以下には直接依存しても構いません。ただし **必ずテストコードを用意して動作担保を行ってください。**

- **`zod`**: バリデーション処理のインフラとして広く利用されており、無理に抽象化するとコードが複雑になるため
- **複数の JavaScript ランタイムで共通して利用可能な標準 API**: Node.js、Bun、Cloudflare Workers 等のランタイムで共通のインターフェースを持つ API であれば依存して問題ありません。特定のランタイム固有の API には依存しないでください
  - 例: `fetch`, `URL`, `URLSearchParams`, `Request`, `Response`, `Headers`, `crypto`（Web Crypto API）, `TextEncoder`, `TextDecoder`, `AbortController`, `structuredClone`, `ReadableStream`, `Blob`, `FormData` 等

#### Next.js の directive は例外に含めない

`"use server"`, `"use client"`, `"use cache"` 等の Next.js directive を `src/functions/` 内で使用しないでください。directive が必要な場合、その関数はより適切なレイヤーに属すべきサインです。

| directive      | 配置すべきレイヤー                                         | 理由                                              |
| -------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `"use server"` | `src/actions/` または `src/features/<機能>/actions/`       | Server Action は actions の責務                   |
| `"use client"` | `src/components/` または `src/features/<機能>/components/` | 純粋な関数は server/client 両方で動作するため不要 |
| `"use cache"`  | `src/actions/` または `src/app/`                           | キャッシュの関心事は呼び出し側で制御すべき        |

`src/functions/` の純粋な関数にキャッシュを適用したい場合は、呼び出し側でラップしてください。

```typescript
// src/functions/user.ts — 純粋な関数（directive不要）
export const buildUserProfile = (raw: RawUser): UserProfile => {
  // ...
};
```

```typescript
// src/actions/fetch-user-action.ts — ここでキャッシュを制御
"use cache";

export const fetchUserAction = async (id: UserId) => {
  const raw = await fetchUser(id);
  return buildUserProfile(raw);
};
```

### `src/constants/`

共通利用する定数を格納します。

- **全てのレイヤーから利用される可能性があります**
- 少しでも値の加工や条件分岐を行っている場合は `src/functions/` に定義します

### `src/utils/`

ビジネスロジックを持たない汎用的な関数を定義します。

- **全てのレイヤーから利用される可能性があります**
- **この層にファイルを追加する際は、まず他のレイヤーに定義できないか十分な検討を行ってください**
- **この層に大量のファイルが増える場合、設計に問題がある可能性が高いです**

### `src/actions/`

Server Action 関数を格納します。

- `src/types/`, `src/lib/`, `src/functions/`, `src/constants/` に依存可能です
- **Server Action 関数には必ずテストコードを用意します**
- 関数名・型名・ファイル名の末尾に `Action` / `-action` を付与します（@docs/project-coding-guidelines.md 参照）

#### ディレクトリ構造

ドメインごとにサブディレクトリを作成し、Server Action の実装・型定義・テストをまとめます。

```text
src/actions/
└── <ドメイン>/
    ├── types/
    │   └── <action名>-action.ts    ← 型定義のみ（状態型・関数型）
    ├── <action名>-action.ts         ← 実装（"use server" ディレクティブ付き）
    └── __tests__/
        └── <action名>-action/
            └── <action名>-action.test.ts
```

#### 型定義ファイルの分離ルール

Server Action の型定義（状態型と関数型）は、実装ファイルとは別に `types/` サブディレクトリに配置します。

- 型ファイルには `"use server"` ディレクティブや外部ライブラリへの依存を **含めない**（純粋な TypeScript の型定義のみ）
- 実装ファイルは `types/` から型を import して使用する
- `src/components/` は `types/` 配下の型定義ファイルにのみ依存可能（実装ファイルへの直接依存は禁止）

```typescript
// src/actions/auth/types/signin-action.ts — 型定義のみ
export type SigninActionState =
  | { readonly status: "SUCCESS" }
  | { readonly status: "ERROR"; readonly errorMessage: string }
  | null;

export type SigninAction = (
  previousState: SigninActionState,
  formData: FormData,
) => Promise<SigninActionState>;
```

```typescript
// src/actions/auth/signin-action.ts — 実装
"use server";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/better-auth/auth";
import type {
  SigninAction,
  SigninActionState,
} from "@/actions/auth/types/signin-action";

export const signinAction: SigninAction = async (
  _previousState: SigninActionState,
  formData: FormData,
): Promise<SigninActionState> => {
  // 実装
};
```

サーバーアクション関数を利用するComponent側ではサーバーアクションの型定義のみに依存する形になるのでStorybook上等からモックに置き換えることが容易になります。

### `src/components/`

共通利用する React Component を定義します。詳細なルールは以下を参照してください:

@src/components/AGENTS.md

### `src/app/`

Next.jsのApp Routerを利用する上で必要なルーティング用のファイルなどが格納されます。

[Next.js App Router - 公式ドキュメント](https://nextjs.org/docs/app)

- **全てのレイヤーのファイルに依存可能です**
- **ここにビジネスロジックは含めません。** 各レイヤーの Component やファイルを呼び出す形で実装します

### `src/mocks/`

テスト用のモック設定を格納します。現在は MSW（Mock Service Worker）のサーバーインスタンスを管理します。

- テストコードからのみ利用されます。プロダクションコードからは import しないでください
- MSW のサーバーインスタンスやハンドラファクトリなど、テスト間で共有するモック設定を配置します
- 個別テスト専用のハンドラは各テストファイル内で `server.use()` を使って設定します

### `src/scripts/`

ビルド・開発用のスクリプトが格納されます。
