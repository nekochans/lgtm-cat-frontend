# Issue #478: Better Auth + Drizzle + Atlas + Turso 初期セットアップ 実装計画

## 1. 概要

### 1.1 対応 Issue

[#478 Better Auth + Drizzle + Atlas + Turso の初期セットアップ](https://github.com/nekochans/lgtm-cat-frontend/issues/478)

### 1.2 ゴール

`#314` で確定した認証基盤の技術スタック（Better Auth + Drizzle + Atlas + Turso）を、本リポジトリで動かすための **最小セットアップ** を完了する。本 Issue は **「マイグレーションが動く / GitHub ログインが動く」までは含まない**。後続 Issue (#479, #480) が着手可能な土台を整えることが目的。

### 1.3 スコープ

| やる | やらない（後続 Issue で対応 / 既に完了） |
|------|------------------------------|
| Better Auth・Drizzle・Atlas CLI の導入 | Turso 認証用 DB の作成 → **K 側で対応済み**（`prod-lgtm-cat-auth` / `stg-lgtm-cat-auth` / `local-lgtm-cat-auth`） |
| `drizzle.config.ts` / `atlas.hcl` 配置 | `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` の環境変数登録 → **K 側で対応済み**（ローカル `.env.local` および Vercel 全環境） |
| Drizzle DB クライアントと Better Auth インスタンスの最小雛形 | `.env.example` の `TURSO_*` 行追記 → **K 側で対応済み**（コミット `d1ea092`） |
| `.env.example` への `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` 追記（K 側追加分は `TURSO_*` のみ） | スキーマの本格定義（user/session/account/verification）→ `#479` |
| Atlas CLI のインストール手順ドキュメント化（README） | Atlas マイグレーションの実運用検証 → `#479` |
| `atlas schema inspect` で空 DB のスキーマ取得確認 | GitHub OAuth ログイン → `#480` |
| | Better Auth JWT プラグイン有効化 → backend 準備後の別 Issue |
| | lgtm-cat-api への JWT 送信処理 → 同上 |
| | スキーマの最終形検討 |

### 1.4 Done の定義（Issue 引用）と対応マッピング

| Done の定義 | 対応セクション |
|-------------|----------------|
| Turso 認証用 DB（本番用・開発用）が作成されている事 | **K 側で対応済み**（`prod-lgtm-cat-auth` / `stg-lgtm-cat-auth` / `local-lgtm-cat-auth` の 3 種）。§6.1 は参考情報として残す |
| 必要な依存関係（`better-auth`、`drizzle-orm`、`@libsql/client`）がインストールされている事 | §6.2 |
| Atlas CLI のインストール手順がドキュメント化されている事 | §6.7 |
| `drizzle.config.ts` および `atlas.hcl` が配置され、環境変数から接続情報を読める状態になっている事 | §6.3 / §6.5 |
| `atlas schema inspect` で空 DB のスキーマが正常に取得できる事 | §6.9 |
| 必要な環境変数（`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`）が `.env.example` に追記されている事 | `TURSO_*` は K 側で追加済み（コミット `d1ea092`「`#478 .env.example を追加`」）。`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` は本 Issue 実装担当者が §6.4.4 で追記する |

> 補足 1: `.env.example` は **TURSO_* のみ K 側で追加済み**（コミット `d1ea092`）。`auth.ts` が起動時に必須参照する `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` はまだ未追加なので、本 Issue 実装担当者が §6.4.4 でプレースホルダ行を追記する。
>
> 補足 2: `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` は既に K 側でローカル `.env.local`（接続先は `local-lgtm-cat-auth`）および Vercel ダッシュボード全環境に登録済み。よって本 Issue の作業範囲では「ローカルでの動作確認」のみが必要で、新規発行は行わない。
>
> 補足 3: **`.env.local` の中身は閲覧禁止**（実シークレットを含む）。動作確認は `dotenv-cli` 等で読み込ませる方法のみ使用し、ファイル内容を直接表示・コピーしない。
>
> 補足 4: 認証 DB は **3 種運用**（local / stg / prod）。マイグレーションは `local-lgtm-cat-auth` で動作担保した後、stg → prod の順で適用するフローを採用する（Issue #479 以降で本格運用）。

---

## 2. 前提知識と参考リンク

### 2.1 公式ドキュメント

- Better Auth: https://www.better-auth.com/docs/installation
- Better Auth Drizzle Adapter: https://www.better-auth.com/docs/adapters/drizzle
- Drizzle ORM (Turso): https://orm.drizzle.team/docs/get-started/turso-new
- Drizzle Kit `export`: https://orm.drizzle.team/docs/drizzle-kit-export
- Atlas + Drizzle: https://atlasgo.io/guides/orms/drizzle/getting-started
- Atlas + Turso: https://atlasgo.io/guides/sqlite/turso
- Turso CLI: https://docs.turso.tech/cli/installation

### 2.2 関連リポジトリ・社内資源

- 認証技術選定の経緯: [Issue #314](https://github.com/nekochans/lgtm-cat-frontend/issues/314)
- 後続 Issue: `#479`（Atlas マイグレーション動作確認）, `#480`（GitHub ログイン）

### 2.3 アーキテクチャ概念図

```
┌────────────────────────────────────────┐
│  src/lib/better-auth/                  │
│   ├─ auth.ts   ← Better Auth インスタンス │
│   ├─ db.ts     ← drizzle(libsql client) │
│   └─ schema.ts ← Drizzle スキーマ定義    │
└──────────┬─────────────────────────────┘
           │ npx drizzle-kit export
           ▼
       atlas.hcl  (data "external_schema" ブロック経由で SQL DDL を取り込み)
           │
           ▼
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │ Turso (prod DB)    │  │ Turso (stg DB)     │  │ Turso (local DB)   │
   │ prod-lgtm-cat-auth │  │ stg-lgtm-cat-auth  │  │ local-lgtm-cat-auth│
   │  (Production)      │  │ (Preview/Development)│ (各開発者のローカル) │
   └────────────────────┘  └────────────────────┘  └────────────────────┘
```

---

## 3. 採用技術とバージョン方針

| レイヤー | パッケージ / ツール | バージョン方針 | 備考 |
|----------|---------------------|----------------|------|
| 認証ロジック | `better-auth` | 1.6 系の最新 | 2026-05 時点の最新リリースは 1.6.9。実装時に `npm install better-auth` で取得した実バージョンを PR 説明欄に記載する |
| Drizzle adapter | `@better-auth/drizzle-adapter` | 1.6 系の最新（`better-auth` と揃える） | **別パッケージとして公開**。公式 docs (https://www.better-auth.com/docs/adapters/drizzle) が `npm install @better-auth/drizzle-adapter` と `import { drizzleAdapter } from "@better-auth/drizzle-adapter"` を案内している（2026-05 時点 v1.6 Latest） |
| ORM・型推論 | `drizzle-orm` | 0.40 以上を推奨 | `drizzle-orm/libsql`, `drizzle-orm/sqlite-core` を利用 |
| DB ドライバ | `@libsql/client` | 0.x 系の最新 | Turso (libSQL) 公式クライアント |
| スキーマ export | `drizzle-kit` | `export` コマンドが安定する 0.30 以上 | devDependencies。`generate`/`migrate` は使わない |
| マイグレーション | Atlas CLI | 公式最新 | `external_schema` で Drizzle スキーマを読み込み |
| DB ホスティング | Turso（既存 $29 プラン） | - | Turso CLI 経由で DB を作成 |

> **方針**: 本 Issue では「最新版を `npm install` で導入」する。実装後に `package.json` に書き込まれた具体バージョンを PR の説明欄に記載する。バージョン互換性問題が発生したら本セクションを更新する。

### 3.1 Drizzle ベストプラクティス（プロジェクト方針）

- **Drizzle のマイグレーション機能（`drizzle-kit generate` / `drizzle-kit migrate`）は使わない**。Atlas に置き換える。
- `drizzle-kit export` で SQL DDL を吐き出し、Atlas が読み込む。
- 命名: テーブル名は Better Auth デフォルトの単数形（`user` / `session` / `account` / `verification`）。`usePlural` および `fields` マッピングは利用しない（Issue #314 のメモリ通り、デフォルト命名を維持する）。

### 3.2 ライブラリのインポート規約

本 Issue で実際に使う import:

```typescript
// drizzle-orm/libsql から drizzle 関数を import（db.ts で使用）
import { drizzle } from "drizzle-orm/libsql";
// libSQL クライアントは @libsql/client（db.ts で使用）
import { createClient } from "@libsql/client";
// Better Auth と Drizzle adapter（auth.ts で使用）
import { betterAuth } from "better-auth";
// Drizzle adapter は別パッケージ `@better-auth/drizzle-adapter` から import する
// （公式 docs: https://www.better-auth.com/docs/adapters/drizzle, 2026-05 時点 v1.6 Latest）
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
```

Issue #479 以降のスキーマ定義で利用する import（本 Issue では未使用、参考）:

```typescript
// SQLite テーブル定義は drizzle-orm/sqlite-core から
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
```

---

## 4. ファイル構成

### 4.1 新規作成するファイル

| パス | 役割 | レイヤー |
|------|------|---------|
| `drizzle.config.ts` | Drizzle Kit の設定（`drizzle-kit export` 用） | リポジトリルート |
| `atlas.hcl` | Atlas の設定（external_schema + env 別接続情報） | リポジトリルート |
| `migrations/` | Atlas が生成するマイグレーション SQL の格納先（Issue #479 で本格利用） | リポジトリルート |
| `migrations/.gitkeep` | 空ディレクトリ保持用 | リポジトリルート |
| `src/lib/better-auth/auth.ts` | Better Auth インスタンスの最小雛形 | `src/lib/` |
| `src/lib/better-auth/db.ts` | Drizzle DB クライアント（libSQL 接続） | `src/lib/` |
| `src/lib/better-auth/schema.ts` | Drizzle スキーマの空雛形（Issue #479 で正式定義） | `src/lib/` |

### 4.2 編集するファイル

| パス | 内容 |
|------|------|
| `package.json` | `dependencies` に `better-auth` `@better-auth/drizzle-adapter` `drizzle-orm` `@libsql/client`、`devDependencies` に `drizzle-kit` を追加 |
| `package-lock.json` | `npm install` の結果として自動更新 |
| `README.md` | 「Atlas CLI のインストール手順」「Turso CLI のインストール手順」セクション追加 |
| `.env.example` | `BETTER_AUTH_SECRET=` / `BETTER_AUTH_URL=` のプレースホルダ行を追記（`TURSO_*` 行はコミット `d1ea092` で K 側追加済み） |

### 4.3 `.gitignore` の方針（変更不要）

- `migrations/` ディレクトリは **Git 追跡対象**。除外しない（既存 `.gitignore` のままで問題なし）。
- `atlas.sum`（Atlas が `migrations/` 配下に生成する整合性チェックファイル）も **Git 追跡対象**。除外しない。
- 本 Issue 時点では `migrations/` は空のため、`.gitkeep` のみがコミットされる。Issue #479 で初回 SQL ファイルと `atlas.sum` がコミットされる。

### 4.4 ディレクトリ構造（最終形）

```
lgtm-cat-frontend/
├── atlas.hcl                       ← 新規
├── drizzle.config.ts               ← 新規
├── migrations/                     ← 新規（空）
│   └── .gitkeep
├── README.md                       ← 編集
├── .env.example                    ← 編集（BETTER_AUTH_* 追記）
└── src/
    └── lib/
        └── better-auth/            ← 新規ディレクトリ
            ├── auth.ts             ← 新規
            ├── db.ts               ← 新規
            └── schema.ts           ← 新規（空雛形）
```

> **注**: `.env.example` は K 側で TURSO_* 行が追加済み（コミット `d1ea092`）。本 Issue 実装担当者は **追加で** `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` のプレースホルダ行を追記する（§6.4.4 参照）。

> **注**: `src/AGENTS.md` のレイヤー規約（`src/lib/` は外部ライブラリ依存処理）に準拠。Better Auth のサーバーインスタンス・DB クライアント・スキーマはすべて `src/lib/better-auth/` 配下にまとめる。

---

## 5. 実装フェーズ概観

| Phase | 内容 | 担当環境 |
|-------|------|---------|
| 1 | Turso 認証 DB の存在確認（DB 作成・環境変数登録は K 側で対応済み） | ローカル |
| 2 | npm 依存関係の追加 | ローカル |
| 3 | `drizzle.config.ts` 配置 | リポジトリ |
| 4 | `src/lib/better-auth/` 配下のファイル雛形作成 + `.env.example` への `BETTER_AUTH_*` 追記 | リポジトリ |
| 5 | `atlas.hcl` 配置 | リポジトリ |
| 6 | `migrations/` ディレクトリ初期化 | リポジトリ |
| 7 | README.md に Atlas CLI / Turso CLI インストール手順追記 | リポジトリ |
| 8 | 品質管理（format / lint / test / build） | ローカル |
| 9 | 動作確認（`atlas schema inspect`） | ローカル |
| 10 | Vercel 環境変数の確認（TURSO_* は登録済み。`BETTER_AUTH_*` のみ追加要否を判断） | Vercel ダッシュボード |
| 11 | PR 作成 | GitHub |

> **注**: `.env.example` の `TURSO_*` 行は K 側で追加済み（コミット `d1ea092`）。`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` の追記は Phase 4（§6.4.4）で実施する。`.env.local` の中身は閲覧禁止（§1.4 補足 3）。

---

## 6. 実装ステップ詳細

### 6.1 Phase 1: Turso 認証用 DB の存在確認

> **重要**: DB の作成と環境変数（`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`）の登録は **K 側で対応済み**。本フェーズでは「DB が存在し、`.env.local` から接続できる」事の確認のみ実施する。本セクションの作成手順は将来的な再構築・追加 DB 作成時の参考情報として残す。

#### 6.1.1 既存 DB（K 側で作成済み）

| 用途 | DB 名 | 利用環境 |
|------|-------|---------|
| 本番 | `prod-lgtm-cat-auth` | Vercel Production |
| ステージング | `stg-lgtm-cat-auth` | Vercel Preview / Vercel Development |
| ローカル | `local-lgtm-cat-auth` | 各開発者の `.env.local`（マイグレーション動作担保用） |

> **注**: `.env.local`（ローカル開発）は `stg-lgtm-cat-auth` ではなく **`local-lgtm-cat-auth`** を指す。マイグレーションを安全に試すための分離。stg と prod は段階的適用先として位置づける。

#### 6.1.2 既に登録済みの環境変数（K 側で対応済み）

| 変数名 | ローカル `.env.local` | Vercel Production | Vercel Preview | Vercel Development |
|--------|----------------------|-------------------|----------------|--------------------|
| `TURSO_DATABASE_URL` | 登録済み（`local-lgtm-cat-auth`） | 登録済み（`prod-lgtm-cat-auth`） | 登録済み（`stg-lgtm-cat-auth`） | 登録済み（`stg-lgtm-cat-auth`） |
| `TURSO_AUTH_TOKEN` | 登録済み | 登録済み | 登録済み | 登録済み |
| `BETTER_AUTH_SECRET` | 登録済み（local 用、Sensitive） | 登録済み（prod 用、Sensitive） | 登録済み（stg 用、Sensitive） | 登録済み（stg 用、Sensitive） |
| `BETTER_AUTH_URL` | 登録済み（`http://localhost:2222`） | 登録済み（`https://lgtmeow.com`） | 登録済み（`staging` ブランチ限定で `https://lgtm-cat-frontend-git-staging-nekochans.vercel.app`） | 登録済み（`http://localhost:2222`） |

> **`BETTER_AUTH_SECRET` の値の数**: 接続先 DB が異なる環境（local / stg / prod）ごとに別の値を発行する。同じ DB を共有する Preview / Development は同じ値で問題ない（cookie 署名検証の一貫性のため）。
>
> **Preview の `BETTER_AUTH_URL`**: Vercel の **Branch-scoped Preview 環境変数** 機能を使い、`staging` ブランチに限定して固定 URL を登録している。これにより設計書初版で想定していた「#480 で `VERCEL_URL` fallback を実装」が不要になり、staging ブランチ環境では Better Auth がそのまま動作する。`staging` 以外のブランチで Preview デプロイされる場合は、`BETTER_AUTH_URL` 未設定で起動時 throw する想定（必要があれば後続 Issue で動的 URL 対応）。

#### 6.1.3 動作確認（実装担当者の作業）

```bash
# turso CLI が手元にあれば、ログイン状態で DB 一覧を確認できる（任意）
turso db list
# → prod-lgtm-cat-auth と stg-lgtm-cat-auth が表示されれば OK

# `.env.local` に TURSO_DATABASE_URL / TURSO_AUTH_TOKEN が入っていれば
# §6.9 の `atlas schema inspect --env local` で接続確認できる
```

#### 6.1.4 参考: 将来 DB を新規作成する場合の手順

> 本 Issue では実行不要。将来別 DB が必要になった際の参考情報として残す。

```bash
# Turso CLI のインストール
brew install tursodatabase/tap/turso          # macOS
# curl -sSfL https://get.tur.so/install.sh | bash  # その他

# ログイン
turso auth login

# DB 作成（例: PR 別一時 DB が必要になった場合等）
turso db create <db-name>

# 接続情報の取得
turso db show <db-name> --url
turso db tokens create <db-name>
```

> **注意**: `turso db tokens create` で発行されたトークンは再表示できないため、安全な場所（1Password 等）に控えること。

---

### 6.2 Phase 2: npm 依存関係の追加

#### 6.2.1 dependencies

```bash
npm install better-auth @better-auth/drizzle-adapter drizzle-orm @libsql/client
```

> **重要**: `drizzleAdapter` は **別パッケージ** `@better-auth/drizzle-adapter` から提供されている（Better Auth 1.6 系の公式方針）。`better-auth/adapters/drizzle` という旧来のサブパス import は使わない。公式 docs: https://www.better-auth.com/docs/adapters/drizzle

#### 6.2.2 devDependencies

```bash
npm install --save-dev drizzle-kit
```

#### 6.2.3 確認

`package.json` に以下が追加されていること（バージョンは `npm install` 実行時点の最新）:

```jsonc
{
  "dependencies": {
    "better-auth": "^x.y.z",
    "@better-auth/drizzle-adapter": "^x.y.z",
    "drizzle-orm": "^x.y.z",
    "@libsql/client": "^x.y.z"
    // ...既存の依存
  },
  "devDependencies": {
    "drizzle-kit": "^x.y.z"
    // ...既存の依存
  }
}
```

> **バージョン整合性**: `better-auth` と `@better-auth/drizzle-adapter` は同一メジャー・マイナーで揃える事（公式が同期リリースしているため）。`npm install` 後に両者のバージョンを確認し、PR 説明欄に併記する。

> **重要**: `--legacy-peer-deps` の利用は最終手段とする。素直に `npm install` でエラーが出た場合は、まずエラー内容を確認して根本原因を調査する（プロジェクトの README 記載方針に従う）。

---

### 6.3 Phase 3: `drizzle.config.ts` の配置

リポジトリルートに新規作成。

#### 6.3.1 ファイル内容

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/lib/better-auth/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN ?? "",
  },
});
```

#### 6.3.2 設計上のポイント

- `dialect: "turso"`: libSQL/Turso 用ダイアレクト。
- `out`: Drizzle Kit の慣例に従って `./migrations` を指定。本プロジェクトでは Atlas が SQL を管理するため Drizzle Kit が直接ファイルを書き出すことはない。`drizzle-kit export` の出力は標準出力に流れるため、`out` は実質的に未使用。
- `dbCredentials`: ローカルで `drizzle-kit studio` を使う際に参照される（本 Issue では使わないが、Issue #479 以降で利用可能性あり）。
- 環境変数が未定義の場合の `?? ""` は、CI 等で `drizzle-kit export` を実行する際に DB 接続が不要なケースを許容するための保険。

#### 6.3.3 `dialect: "turso"` で問題が発生した場合のフォールバック

`drizzle-kit export` の `dialect: "turso"` 対応はバージョンによって挙動が異なる場合がある。万が一 `npx drizzle-kit export` が「dialect not supported」等のエラーを返す場合は、以下の順で対処する。

1. `npm install --save-dev drizzle-kit@latest` で最新版に更新
2. それでも動かなければ、暫定で `dialect: "sqlite"` に変更し、`dbCredentials` を `{ url: "file:dummy.db" }` に置き換える（Atlas 側は libSQL に接続するため、export だけ SQLite 互換で出力できれば問題ない）

本 Issue 着手時に最新の Drizzle Kit を導入した上で `dialect: "turso"` を試し、動作したらそのまま採用する。フォールバックを採用した場合はその旨を PR 説明欄に明記する。

---

### 6.4 Phase 4: `src/lib/better-auth/` 配下のファイル雛形作成

#### 6.4.1 `src/lib/better-auth/schema.ts`（空雛形）

> Issue #478 では「`atlas schema inspect` で空 DB のスキーマが正常に取得できる」が Done。スキーマ本体の定義は Issue #479 で実施するため、ここでは **テーブル定義を持たないファイル** として配置する。`drizzle-kit export` を実行しても空の SQL DDL が出力されるだけで、エラーにはならない。

```typescript
// src/lib/better-auth/schema.ts
/**
 * Better Auth が必要とする Drizzle スキーマ定義の置き場。
 * Issue #479 で user / session / account / verification の正式定義を追加する。
 * 現時点では Issue #478 の最小セットアップとして、テーブル定義を持たない状態で配置する。
 */

export {};
```

> **理由**: 完全な空ファイルだと Biome / Ultracite が警告を出す可能性があるため、`export {}` で TypeScript の独立モジュールであることを明示する。

#### 6.4.2 `src/lib/better-auth/db.ts`

```typescript
// src/lib/better-auth/db.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoDatabaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!tursoAuthToken) {
  throw new Error("TURSO_AUTH_TOKEN is not defined");
}

const client = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoAuthToken,
});

export const authDb = drizzle(client, { schema });
```

> **設計上のポイント**:
>
> - 環境変数が未定義なら **起動時に明示的に throw** する。Better Auth の側に到達した際に分かりにくいエラーになるのを防ぐ。
> - `authDb` という変数名で公開し、`db` という汎用名を避ける（プロジェクトコーディング規約「汎用的な名前を避ける」に従う）。
> - 同階層の `./schema` は **相対パス** で import する。`@/` エイリアスはレイヤー間や離れたディレクトリへの参照で使うことが慣例（既存の `src/lib/cognito/oidc.ts` 等もこの方針）。

#### 6.4.3 `src/lib/better-auth/auth.ts`

```typescript
// src/lib/better-auth/auth.ts
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { authDb } from "./db";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is not defined");
}

if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is not defined");
}

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "sqlite",
  }),
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
});
```

> **設計上のポイント**:
>
> - `provider: "sqlite"` を指定。Turso/libSQL は SQLite 互換のため `sqlite` で正しい。
> - `secret` は `openssl rand -base64 32` で生成した値（最低 32 文字。base64 で 32 バイトの出力は約 44 文字でこの要件を満たす）を `.env.local` の `BETTER_AUTH_SECRET` に設定する。`.env.local` の編集・閲覧は K 側で対応するため、本 Issue 実装担当者は触らない。
> - GitHub OAuth プロバイダの設定は **本 Issue では追加しない**（Issue #480 で追加）。
> - JWT プラグインの有効化は本 Issue では行わない（lgtm-cat-api の準備後に別 Issue で対応）。
> - `import { authDb } from "./db"` でも、`authDb` の評価は遅延（`betterAuth(...)` 呼び出し時）ではなく **モジュール読込時**。すなわち本ファイルを import するだけで `db.ts` 側の throw が走るため、テストや CI で `auth.ts` を import するエントリポイントを **本 Issue では追加しない**（§9.1 参照）。

#### 6.4.4 `.env.example` への Better Auth 用変数追記

`auth.ts` が `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` を必須として参照（未定義なら起動時 throw）するため、`.env.example` にプレースホルダ行を追記する。`TURSO_*` は K 側で既に追加済み（コミット `d1ea092`）なので、追記は Better Auth 用 2 行のみ。

`.env.example` への追記内容（既存 `TURSO_AUTH_TOKEN=` 行の **直後** に配置）:

```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

> **設計上のポイント**:
>
> - 値は **空のまま** にする。実値は各開発者の `.env.local` にのみ書き、`.env.example` には placeholder としてキー名だけを残す（既存の `TURSO_*` 等と同じ運用）。
> - `BETTER_AUTH_SECRET` のローカル値生成は `openssl rand -base64 32` を使う（§6.4.3 設計上のポイント参照）。`.env.local` の編集・閲覧は K 側で対応するため、実装担当者は値の生成手順のみ把握しておく。
> - `BETTER_AUTH_URL` のローカル値は `http://localhost:2222`（本プロジェクトの `npm run dev` ポート）を想定。
> - 本ステップは Done 定義「必要な環境変数が `.env.example` に追記されている事」の **充足条件**。コミット `d1ea092` 単独では `BETTER_AUTH_*` が含まれないため、Done を満たしきれない。
> - Phase 4 にまとめる理由: §6.4.3 の `auth.ts` で導入した変数を、同じ Phase 内で `.env.example` にも反映することで、依存関係の見落としを防ぐため。

---

### 6.5 Phase 5: `atlas.hcl` の配置

リポジトリルートに新規作成。

#### 6.5.1 ファイル内容

```hcl
# atlas.hcl
# Drizzle スキーマを external_schema で読み込み、各環境の Turso DB へ適用する設定。
#
# 注意: env "staging" / "prod" は本 Issue では意図的に配置しない。
# 単一の TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を複数 env で共有すると、
# 実際に読み込まれている環境変数の値（local / staging / prod のいずれか）と env 名が乖離し、
# `--env staging` を指定したつもりで local や prod に接続する migration リスクがある。
# 後続 Issue (#479) で TURSO_STG_DATABASE_URL / TURSO_STG_AUTH_TOKEN /
# TURSO_PROD_DATABASE_URL / TURSO_PROD_AUTH_TOKEN のような専用変数とともに導入する。

variable "turso_database_url" {
  type    = string
  default = getenv("TURSO_DATABASE_URL")
}

variable "turso_auth_token" {
  type    = string
  default = getenv("TURSO_AUTH_TOKEN")
}

# Drizzle スキーマを SQL DDL に変換するデータソース
data "external_schema" "drizzle" {
  program = [
    "npx",
    "drizzle-kit",
    "export",
    "--config=drizzle.config.ts",
  ]
}

# env "local": ローカル開発者の Turso DB（local-lgtm-cat-auth）に接続する。
# .env.local の TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を参照（dotenv-cli 等で読み込ませる）。
# external_schema 単体（接続なし）の検証は
# `atlas schema inspect --env local --url env://src` で `--url env://src` を渡すことで実現できるため、
# 専用の offline 用 env は持たない。
# Turso が内部で作成する Litestream replication 用テーブルは
# アプリケーションのスキーマ管理対象外なので diff/inspect から除外する。
# 参照: https://atlasgo.io/guides/sqlite/turso
env "local" {
  src     = data.external_schema.drizzle.url
  url     = "${var.turso_database_url}?authToken=${var.turso_auth_token}"
  dev     = "sqlite://dev?mode=memory"
  exclude = ["_litestream*"]
  migration {
    dir = "file://migrations"
  }
}
```

#### 6.5.2 設計上のポイント

- **env 名は `local` のみ**: ローカル開発者の `local-lgtm-cat-auth` に接続する 1 ブロックで構成する。K のメンタルモデル（local / staging / prod の 3 環境）と env 名を一致させ、`--env local` を実行したら local DB に繋がることを自明にしている。
- `external_schema.drizzle` で `drizzle-kit export` を呼び出し、Drizzle スキーマを SQL DDL として Atlas に渡す。
- `dev = "sqlite://dev?mode=memory"`: Atlas が schema diff/lint に使う dev DB（**env 名ではなく env ブロック内の属性**）。Turso/libSQL は SQLite 互換のため、メモリ上の SQLite で正しく動く。
- **オフライン検証は `--url env://src` の上書きで実現**: `atlas schema inspect --env local --url env://src` を実行すると DB に接続せず external_schema（Drizzle export）単体を検証できる。CI 等で DB クレデンシャルが無い場合や、Drizzle スキーマだけを確認したい場合に利用する。設計書初版で導入していた offline 用の `env "local"` ブロックは廃止した。
- **`env "staging"` / `env "prod"` は本 Issue では配置しない**: 単一の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` 変数を複数 env で共有する設計だと、env 名と実際の接続先 DB が乖離するリスクがある（例: シェルに staging の値が入った状態で `--env prod` を実行すると staging に接続してしまう）。本 Issue は最小セットアップであり、staging / prod の DB を直接操作する必要が無いため、これらの env を置かないことで誤適用の経路自体を消す。後続 Issue (#479) で `TURSO_STG_DATABASE_URL` / `TURSO_STG_AUTH_TOKEN` / `TURSO_PROD_DATABASE_URL` / `TURSO_PROD_AUTH_TOKEN` のような専用変数とともに導入する。
- **`exclude = ["_litestream*"]`**: Turso が内部的に作成する Litestream replication engine 用テーブルを Atlas の管理対象から外す。これがないと:
  - `atlas schema inspect --env local` の出力に `_litestream*` テーブルが混入し、Done 定義「空 DB のスキーマが正常に取得できる」を満たしにくい。
  - 後続 Issue #479 の `atlas migrate diff` で `_litestream*` テーブルを削除する SQL が誤生成され、本番適用時に DB を破壊するリスクがある。
  - 公式 Turso ガイドで明示されているプラクティス。

---

### 6.6 Phase 6: `migrations/` ディレクトリの初期化

#### 6.6.1 ディレクトリ作成

```bash
mkdir -p migrations
touch migrations/.gitkeep
```

#### 6.6.2 設計上のポイント

- `.gitkeep` は空ディレクトリを Git で追跡するための慣例ファイル。
- 本 Issue 時点ではマイグレーション SQL は **存在しない**。Issue #479 で Atlas が自動生成する。
- `atlas.sum` ファイル（Atlas のマイグレーション整合性チェック用）も将来 Atlas が `migrations/` 配下に作成するが、本 Issue では発生しない。

---

### 6.7 Phase 7: README.md への追記

#### 6.7.1 追加する内容と挿入位置

**挿入位置**: 「環境変数の設定」セクションの **直後**、`Node.js のインストール` セクションの **直前**（両セクションの間に新セクションを差し込む）。`README.md` の見出し構造を可能な限り変更しないために、見出しレベルは `##`（H2）で統一する。

> **コピー時の注意**: 本計画書では Markdown 内の Markdown を表現するためにコードフェンスをバックスラッシュエスケープ（`` \`\`\` ``）して記載している。実際に README へ反映する際は **バックスラッシュを除去** して通常の 3 連続バッククオートに置き換える事。

```markdown
## Atlas CLI のインストール

認証 DB のスキーマ管理に [Atlas](https://atlasgo.io/) を利用しています。Issue #478 以降、ローカルで Atlas コマンドを実行する場合は CLI のインストールが必要です。

### macOS (Homebrew)

\`\`\`bash
brew install ariga/tap/atlas
\`\`\`

### 上記が使えない環境

\`\`\`bash
curl -sSf https://atlasgo.sh | sh
\`\`\`

インストール確認:

\`\`\`bash
atlas version
\`\`\`

### Atlas のよく使うコマンド

\`\`\`bash
# ローカル Turso DB（local-lgtm-cat-auth）の現在のスキーマを取得（接続あり）
atlas schema inspect --env local

# external_schema（Drizzle export）単体を接続なしで取得（CI 等で DB クレデンシャルが無い場合）
atlas schema inspect --env local --url env://src

# Drizzle スキーマからマイグレーション SQL を生成（Issue #479 以降で使用）
atlas migrate diff --env local <migration_name>

# マイグレーションを Turso DB に適用（Issue #479 以降で使用）
atlas migrate apply --env local
\`\`\`

## Turso CLI のインストール（任意）

> 本リポジトリの通常開発では Turso CLI は **不要** です。Atlas / `@libsql/client` は `.env.local` の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` を使って Turso に直接接続するため、Turso CLI の認証セッションは経由しません。
>
> 以下のような **管理・調査用途** で Turso CLI を使いたい場合のみインストールしてください。
>
> - DB 一覧の確認 (`turso db list`)
> - DB シェルでの直接調査 (`turso db shell <db-name>`)
> - 新規 DB の発行 (`turso db create`) — 通常は管理者作業

\`\`\`bash
# macOS (Homebrew)
brew install tursodatabase/tap/turso

# その他環境
curl -sSfL https://get.tur.so/install.sh | bash

# ログイン（CLI で管理コマンドを実行する場合のみ）
turso auth login
\`\`\`
```

---

### 6.8 Phase 8: 品質管理

CLAUDE.md「品質管理の実行手順」に従う。

```bash
# 1. フォーマット
npm run format

# 2. lint
npm run lint

# 3. テスト
npm run test

# 4. ビルド（依存追加によるビルド破壊がないことを確認）
npm run build
```

#### 8.1 期待結果

- `npm run format` がエラーなく完了する。
- `npm run lint` がパスする（Ultracite + Prettier）。
- `npm run test` がパスする（既存テスト + 既存テストへの影響がないこと）。
- `npm run build` がパスする（Next.js ビルドが Better Auth/Drizzle 追加で破壊されない）。

#### 8.2 想定されるエラーとその対処

| エラー | 対処 |
|--------|------|
| `auth.ts` で `process.env.BETTER_AUTH_SECRET` の型が `string \| undefined` | early throw で型ガード済みのため発生しないはず。発生した場合は throw 後の参照になっているか確認 |
| Biome/Ultracite の `noNonNullAssertion` 警告 | `process.env.X!` を使わず、明示的な `if (!x) throw` にする（既に本計画ではそう書いている） |
| import 順序エラー | `npm run format` で自動修正 |
| `npm run build` 時に `auth.ts` の throw が発火 | 本 Issue では `auth.ts` を import するエントリポイントを追加しないため発生しないはず。発生した場合は誤って import が混入していないかを確認 |

> **重要**: 本 Issue ではプロダクションビルド時に `auth.ts` / `db.ts` がインポートされるエントリポイントは **追加しない**。よって `npm run build` 時に環境変数チェックの throw が走ることはない（Issue #480 で `src/app/api/auth/[...all]/route.ts` を追加する際に、ビルド時に `auth` をインポートしないよう注意する）。

---

### 6.9 Phase 9: 動作確認（`atlas schema inspect`）

> Done の定義「`atlas schema inspect` で空 DB のスキーマが正常に取得できる事」を満たす確認。

#### 9.1 ローカル `.env.local` を読み込んだうえで実行

`.env.local` の中身は閲覧禁止（§1.4 補足 3）。以下のいずれかの方法でツール側に読み込ませて実行する。`cat .env.local` 等で内容を直接表示しない事。`source .env.local` のようにシェルで評価する手段は **使わない**（値中の `$`/バッククォート/`;` 等が任意コマンドとして実行される余地があり、実シークレットを含むファイルを扱うには不適切）。同様に素朴な `export $(grep ...)` パターンも避ける事。

**方法 A: `dotenv-cli` を一時インストールして実行（推奨）**

```bash
npx dotenv-cli -e .env.local -- atlas schema inspect --env local
```

**方法 B: direnv（既に `.envrc` を運用しているため、ローカル運用と整合）**

```bash
# .envrc に dotenv .env.local を追記しておけば、direnv allow するだけで読み込める
direnv allow
atlas schema inspect --env local
```

#### 9.2 期待される出力

DB が空（テーブルなし）の場合、Atlas は以下のような最小限の出力を返す:

```hcl
schema "main" {
}
```

または、空の場合は何も出力されない。**エラーが出ずに正常終了すれば OK**。

#### 9.3 想定されるエラーとその対処

| エラー | 対処 |
|--------|------|
| `connection refused` | `.env.local` 経由の `TURSO_DATABASE_URL` 接続に失敗。K に値の確認・更新を依頼（中身を直接覗かない） |
| `unauthorized` / `401` | `TURSO_AUTH_TOKEN` が期限切れまたは無効の可能性。トークンの再発行は K に依頼 |
| `command not found: atlas` | §6.7.1 に従って Atlas CLI を再インストール |
| `command not found: drizzle-kit` | `npm install` を再実行 |

#### 9.4 補助的な動作確認（接続不要のローカル検証）

```bash
# Drizzle Kit が export できるか（標準出力に DDL or 空が流れる）
npx drizzle-kit export --config=drizzle.config.ts

# Atlas が external_schema（Drizzle export）を読めるかを接続なしで確認する
# `--url env://src` は env ブロックの src（= drizzle export 結果）を直接指す URL 表現。
# 本リポジトリの `env "local"` には `url` が定義されているが、`--url env://src` を渡すことで
# DB 接続をバイパスして external_schema 単体を inspect できる（CI 等で DB クレデンシャルが
# 無い場合に有用）。
# 公式 docs: https://atlasgo.io/atlas-schema/projects#data-source-references
atlas schema inspect --env local --url env://src
```

> **注**: `atlas schema inspect --env local`（引数なし）は `env "local"` の `url` を読みに行くため、`.env.local` をシェルに読み込ませていないと環境変数 `TURSO_DATABASE_URL` が空になり接続エラーになる。Done の定義「`atlas schema inspect` で空 DB のスキーマが取得できる事」の主検証は §9.1 の `dotenv-cli` 経由 `--env local`（実際の Turso DB 接続あり）で実施し、本セクションは接続なしの補助検証として残す。
>
> **削除した不正コマンドについて**: 計画初版の §10 完了確認チェックリストおよび §9.4 で `atlas migrate diff --env local --dry-run sample` / `atlas schema diff --env local --to ...` を案内していたが、Atlas CLI の `migrate diff` には `--dry-run` フラグが **存在しない**（`--dry-run` は `migrate apply` / `schema apply` 用）。`schema diff` も `--from` / `--to` の URL を直接指定する構文が標準であり、`env` と `--to` の併用はそのままでは `env` の `src` が解釈されない。誤った構文で実装者がブロックされるのを避けるため、`atlas schema inspect --env local --url env://src` に統一した。

---

### 6.10 Phase 10: Vercel 環境変数の確認と追加

> `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` は K 側で Vercel 全環境（Production / Preview / Development）に登録済み。本フェーズでは **Better Auth 用の変数を追加するか** の判断のみ行う。

#### 10.1 設定先

https://vercel.com/nekochans/lgtm-cat-frontend/settings/environment-variables

#### 10.2 環境変数の状態と対応

| 変数名 | Production | Preview | Development | 本 Issue での対応 |
|--------|-----------|---------|-------------|-------------------|
| `TURSO_DATABASE_URL` | ✅ 登録済み（`prod-lgtm-cat-auth`） | ✅ 登録済み（`stg-lgtm-cat-auth`） | ✅ 登録済み（`stg-lgtm-cat-auth`） | 確認のみ。再登録不要 |
| `TURSO_AUTH_TOKEN` | ✅ 登録済み | ✅ 登録済み | ✅ 登録済み | 確認のみ。再登録不要 |
| `BETTER_AUTH_SECRET` | ✅ 登録済み（prod 用、Sensitive） | ✅ 登録済み（stg 用、Sensitive） | ✅ 登録済み（stg 用、Sensitive） | 確認のみ。再登録不要 |
| `BETTER_AUTH_URL` | ✅ 登録済み（`https://lgtmeow.com`） | ✅ 登録済み（注 1） | ✅ 登録済み（`http://localhost:2222`） | 確認のみ。再登録不要 |

> **注 1**: `BETTER_AUTH_URL` の Preview 環境は Vercel の **Branch-scoped Preview 環境変数** 機能を使い、**`staging` ブランチに限定** して `https://lgtm-cat-frontend-git-staging-nekochans.vercel.app`（staging 用 Preview の固定 URL）を登録している。`staging` 以外のブランチで Preview デプロイされる場合は `BETTER_AUTH_URL` が未定義になり、`auth.ts` がインポートされる経路では起動時 throw が走る点に留意。`staging` 以外のブランチで Better Auth を有効にしたい場合は、後続 Issue で `process.env.VERCEL_URL` を fallback とする実装を別途検討する。
>
> **注 2**: ローカル開発は **`local-lgtm-cat-auth`**（各開発者個人の DB）を使い、Preview と Development は同一の `stg-lgtm-cat-auth` DB を共有する方針。PR 別の隔離が必要になった場合は個人ローカル DB の追加発行で対応する（Turso は DB 数の上限が緩いため）。
>
> **注 3**: `BETTER_AUTH_SECRET` は接続先 DB が異なる環境（local / stg / prod）ごとに別の値を発行する。同じ DB を共有する Preview / Development は同一値で問題ない（cookie 署名検証の一貫性のため）。

#### 10.3 GitHub Actions Secrets について

本 Issue のスコープでは GitHub Actions Secrets への登録は **不要**。理由:

- 本 Issue では Atlas マイグレーションを CI 上で実行しない（実運用は Issue #479）
- 既存の CI（`npm run lint` / `npm run test` / `npm run build`）は Turso 接続を必要としない（環境変数 throw が走らない構成、§9.1）

Issue #479 で Atlas マイグレーションの CI 検証を組み込む段階で、GitHub Actions Secrets に `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`（dev DB 用）の登録を K に依頼する想定。本 Issue では登録不要。

#### 10.4 セキュリティ注意事項

- 本番用 / 開発用の `TURSO_AUTH_TOKEN` は **混在しない**（K 側で適切に分離済み）。
- `BETTER_AUTH_SECRET` を Vercel に設定する際は **Encrypted** (Sensitive) として保存する。
- 設定変更後は対象環境を再デプロイして反映する（既存ビルドには適用されない）。

---

### 6.11 Phase 11: PR 作成

`create-pr` Skill に従って PR を作成する。

#### 11.1 ベースブランチ

`staging`（既定）

#### 11.2 タイトル例

```
:sparkles: #478 Better Auth + Drizzle + Atlas + Turso の初期セットアップ
```

#### 11.3 本文に含める内容

- 対応 Issue: `Closes #478`
- スコープ（やる／やらないリスト, §1.3）
- 動作確認結果（`atlas schema inspect` の実行ログ抜粋）
- 後続 Issue (#479, #480) の依存関係明記
- レビュー時に確認してほしい点（atlas.hcl の env 設計, `_litestream*` 除外設定の意図, スキーマ空雛形の判断）
- 導入したパッケージの **実バージョン**（`better-auth` / `@better-auth/drizzle-adapter` / `drizzle-orm` / `@libsql/client` / `drizzle-kit`）を記載。`better-auth` と `@better-auth/drizzle-adapter` は同期リリースされているため、メジャー・マイナーが揃っていることも合わせて確認・記載する

#### 11.4 PR 本文での機微情報漏洩防止

- 動作確認ログを貼る際は、`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` などの **実値が含まれていないこと** を投稿前に必ず確認する。
- `atlas schema inspect` の出力に DB の URL が含まれる場合は、ホスト部分をマスク（例: `libsql://stg-lgtm-cat-auth-***.turso.io`）してから貼る。
- スクリーンショットを添付する場合も同様。Vercel ダッシュボードの環境変数画面では、値表示を **Hide value** で伏せた状態でキャプチャする。

---

## 7. 設定ファイル参照早見表

レビュー / 実装時に参照するファイルと、それぞれの定義箇所をまとめる。各ファイルの完全な内容は §6 の該当セクションを参照する事。

| ファイル | 定義セクション | 用途 |
|---------|-----------------|------|
| `drizzle.config.ts` | §6.3.1 | Drizzle Kit の設定（dialect, schema パス等） |
| `atlas.hcl` | §6.5.1 | Atlas のスキーマ管理設定（env 別の DB 接続情報） |
| `src/lib/better-auth/schema.ts` | §6.4.1 | Drizzle スキーマ（本 Issue では空雛形） |
| `src/lib/better-auth/db.ts` | §6.4.2 | Drizzle DB クライアント（libSQL 接続） |
| `src/lib/better-auth/auth.ts` | §6.4.3 | Better Auth インスタンス（最小構成） |
| `.env.example` 追記内容 | §6.4.4 | `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` のプレースホルダ行 |
| `README.md` 追記内容 | §6.7.1 | Atlas / Turso CLI のインストール手順 |

---

## 8. テスト方針

### 8.1 ユニットテスト

本 Issue で追加するコードは:

- **`src/lib/better-auth/db.ts`**: 環境変数 throw のロジックがあるが、Better Auth の DB クライアント生成自体は外部ライブラリの責務であり、このレイヤーで単体テストの価値は低い。テストは追加しない。
- **`src/lib/better-auth/auth.ts`**: 同上。テストは追加しない。
- **`src/lib/better-auth/schema.ts`**: 空雛形のためテスト不要。

> Issue #479 でスキーマ定義が入った時点でも、Drizzle のテーブル定義は外部ライブラリの責務でありテスト対象外。Atlas のマイグレーション動作確認は CI で別途検証する。

### 8.2 統合的な動作確認

Issue #478 の Done 定義は `atlas schema inspect` の成功確認のみ。これは **手動確認** とする（§6.9）。

### 8.3 既存テストへの影響

本 Issue で追加するファイルは既存コードと結合しない（`src/app/` から `auth.ts` を import しない）ため、既存テストへの影響はない。`npm run test` がパスする事の確認のみで十分。

---

## 9. リスクと注意事項

### 9.1 環境変数の throw が SSR / CI を破壊しない事の確認

`src/lib/better-auth/auth.ts` および `db.ts` に書いた `if (!env) throw` は、これらのファイルが import された時点で評価される。

- **本 Issue 時点では import されない** → 影響なし。
- Issue #480 で Server Action や Route Handler から import される際、その経路がビルド時に評価されないように注意（`'use server'` ファイル / `app/api/auth/[...all]/route.ts` での参照は問題ない）。

### 9.2 Atlas dev DB の選定

`sqlite://dev?mode=memory` をそのまま使うと、Drizzle の Turso 固有機能（embedded replicas など）に依存したスキーマでは差異が出る可能性がある。本 Issue のスキーマは空のため問題ないが、将来的にはローカルで `turso dev` コマンドを起動した libSQL に差し替えることも視野に入れる。

### 9.3 Turso CLI のトークン生成方針

`turso db tokens create` は **デフォルトで 7 日間有効**。本番運用では `--expiration none` を指定するか、Vercel 上のローテーション運用を考慮する事。本 Issue ではドキュメント化のみとし、運用設計は #480 以降で詰める。

### 9.4 スキーマ命名規則の方針

Better Auth はテーブル名をデフォルトで単数形（`user`, `session`, `account`, `verification`）で生成する。本プロジェクトは Issue #314 のメモリ通り **デフォルト命名を維持** する。`usePlural: true` や `fields` マッピングは使わない（Issue #479 で確定）。

### 9.5 認証用 DB と lgtm-cat-api の DB の境界

本 Issue で作成する Turso DB（`prod-lgtm-cat-auth` / `stg-lgtm-cat-auth`）は **認証専用**。lgtm-cat-api（PlanetScale MySQL）の DB スキーマ（LGTM 画像、ユーザーアクション等）と **完全に独立**しており、テーブルを横断するクエリは行わない。

- DB 横断のクエリが必要になった場合は backend API（lgtm-cat-api）経由で取得する。
- 認証 DB に画像メタデータや投稿データを混ぜない（境界違反）。
- 認証 DB のユーザー ID と lgtm-cat-api 側のユーザー ID の紐付けは、JWT のクレームを介して行う（バックエンド準備後の別 Issue で実装）。

### 9.6 `migrations/` と `atlas.sum` の扱い

Issue #478 時点では `migrations/` は空ディレクトリ（`.gitkeep` のみ）。`atlas migrate diff` を実行すると以下が生成される:

| ファイル | 役割 | Git 追跡 |
|---------|------|----------|
| `migrations/<timestamp>_<name>.sql` | マイグレーション SQL | する |
| `migrations/atlas.sum` | マイグレーションの整合性チェックファイル | する |

> **理由**: `atlas.sum` を Git で追跡しないと、別の開発者が `atlas migrate diff` を実行した際に「不整合があるから先に既存マイグレーションを再生成しろ」というエラーが出る。チーム開発では追跡が必須。

実際の運用は Issue #479 から開始する。本 Issue では生成されない。

---

## 10. 完了確認チェックリスト

実装者は最終的に以下をすべて満たしている事を確認する。

- [ ] Turso 認証用 DB（`prod-lgtm-cat-auth` / `stg-lgtm-cat-auth`）が存在することを確認済み（K 側で作成済み。任意で `turso db list` を実行）
- [ ] `package.json` の `dependencies` に `better-auth` `@better-auth/drizzle-adapter` `drizzle-orm` `@libsql/client` が追加されている（`better-auth` と `@better-auth/drizzle-adapter` のメジャー・マイナーが一致している事も確認）
- [ ] `package.json` の `devDependencies` に `drizzle-kit` が追加されている
- [ ] `package-lock.json` が更新されている
- [ ] `drizzle.config.ts` が配置され、TypeScript としてコンパイル可能
- [ ] `atlas.hcl` が配置され、`atlas schema inspect --env local --url env://src` がエラーなく実行できる（`--url env://src` を渡すことで external_schema＝Drizzle export 結果を接続なしで読み取れる）
- [ ] `atlas.hcl` の `env "local"` に `exclude = ["_litestream*"]` が設定されている（Turso 内部テーブルの差分混入防止）
- [ ] `atlas.hcl` に `env "staging"` / `env "prod"` ブロックが **存在しない** こと（単一環境変数共有による誤適用リスクを排除する方針。#479 以降で `TURSO_STG_*` / `TURSO_PROD_*` の専用変数とともに導入する）
- [ ] `migrations/` ディレクトリと `migrations/.gitkeep` が存在する
- [ ] `src/lib/better-auth/auth.ts` `db.ts` `schema.ts` が配置されている
- [ ] `src/lib/better-auth/schema.ts` は **空雛形**（`export {}` のみ）で、Turso 上にテーブルは作成しない（テーブル定義と作成は Issue #479 で実施。`atlas migrate diff` / `atlas migrate apply` も本 Issue では実行しない）
- [ ] `README.md` に Atlas CLI と Turso CLI のインストール手順が記載されている
- [ ] `.env.example` に `BETTER_AUTH_SECRET=` / `BETTER_AUTH_URL=` の 2 行が追記されている（`TURSO_*` 行はコミット `d1ea092` で K 側追加済み）
- [ ] `npm run format` がエラーなく完了する
- [ ] `npm run lint` がパスする
- [ ] `npm run test` がパスする
- [ ] `npm run build` がエラーなく完了する
- [ ] 既存の `.env.local` の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`（K 側登録済み、接続先は `local-lgtm-cat-auth`）を使用して `atlas schema inspect --env local` が成功する
- [ ] Vercel ダッシュボードの `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` が Production / Preview / Development の全環境に登録されている事を目視確認（K 側登録済み）
- [ ] Preview の `BETTER_AUTH_URL` は `staging` ブランチ限定で `https://lgtm-cat-frontend-git-staging-nekochans.vercel.app` が登録されている事を確認
- [ ] PR を `create-pr` Skill に従って作成し、Issue #478 を `Closes` で参照している

---

## 11. PR レビュアー向けの確認ポイント

- `src/AGENTS.md` のレイヤー規約に違反していないか（特に `src/lib/better-auth/` 配下の依存関係）
- `atlas.hcl` の env 構成（`local` 単体、`staging` / `prod` は不在）の役割分担に違和感がないか
- `atlas.hcl` の `exclude = ["_litestream*"]` が `env "local"` に入っているか
- `atlas.hcl` に `env "staging"` / `env "prod"` ブロックが含まれていないか（単一環境変数共有による誤適用リスクを排除する方針。#479 以降で `TURSO_STG_*` / `TURSO_PROD_*` の専用変数とともに導入）
- §9.4 / §10 で案内している Atlas コマンドが正しい構文か（`migrate diff` に `--dry-run` は存在しない、`schema inspect --env local --url env://src` で external_schema を接続なしで検証）
- `.env.example` に `BETTER_AUTH_SECRET=` / `BETTER_AUTH_URL=` の 2 行が追記されているか（`TURSO_*` はコミット `d1ea092` で追加済み）
- Better Auth Drizzle adapter が **`@better-auth/drizzle-adapter`** からのインポートになっているか（旧来の `better-auth/adapters/drizzle` ではないこと）
- README の記載粒度が後続 Issue の参加者にとって十分か
- 環境変数の throw タイミングがビルド時に評価されない構成になっているか
- `drizzle-kit export` の利用方針（`generate`/`migrate` を使わない）に逸脱がないか

---

## 12. 後続 Issue への引き継ぎ事項

### Issue #479（Atlas マイグレーション動作確認）

- `src/lib/better-auth/schema.ts` に user / session / account / verification の 4 テーブルを Drizzle で定義
- `atlas migrate diff --env local <name>` で初回マイグレーション SQL を生成
- `atlas migrate apply --env local` でローカル DB に適用、`atlas schema inspect --env local` で結果確認
- `env "staging"` / `env "prod"` を `TURSO_STG_*` / `TURSO_PROD_*` の専用環境変数とともに `atlas.hcl` に追加し、stg → prod の段階適用フローを構築
- CI に Atlas マイグレーションのリント・diff チェックを組み込むかは別途議論

### Issue #480（GitHub OAuth ログイン）

- `auth.ts` に GitHub プロバイダ設定を追加
- `src/app/api/auth/[...all]/route.ts` を追加
- Better Auth クライアント (`createAuthClient`) を `src/lib/better-auth/client.ts` 等に追加
- ログイン UI の実装
- Server Action から `auth.api.*` を呼ぶ際のテストモック方針の確立（`auth.ts` がモジュール読込時に throw する設計のため、テスト側では `vi.mock("@/lib/better-auth/auth", () => ({ auth: { api: { ... } } }))` を活用する）

### バックエンド準備後の別 Issue

- Better Auth JWT プラグインの有効化
- フロントエンドからの JWT 送信処理
- lgtm-cat-api 側での JWT 検証実装と連携テスト
- 認証 DB のユーザー ID と lgtm-cat-api 側のユーザー ID の紐付け方針の確定
