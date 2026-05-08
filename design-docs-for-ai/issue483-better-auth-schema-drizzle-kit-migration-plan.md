# Issue #483: Better Auth 用 SQL スキーマを drizzle-kit で配置してマイグレーション運用を構築する 実装計画

## 1. 概要

### 1.1 対応 Issue

[#483 Better Auth 用の SQL スキーマを drizzle-kit で配置してマイグレーション運用を構築する](https://github.com/nekochans/lgtm-cat-frontend/issues/483)

### 1.2 ゴール

`#478` で配置した空雛形（`src/lib/better-auth/schema.ts`）に Better Auth 必須の 4 テーブル（`user` / `session` / `account` / `verification`）を Drizzle スキーマとして定義し、**drizzle-kit による宣言的マイグレーション運用フロー**（local → staging → prod の段階適用 + GitHub Actions による検証/適用）を構築する。

本 Issue は **#480（GitHub OAuth ログイン）の前提条件**。本 Issue 完了時点で `user` / `session` / `account` / `verification` の 4 テーブルが local / staging / prod の 3 環境すべてに作成され、Better Auth が正常に動作する DB が用意される。

### 1.3 マイグレーションツール選定の経緯（#479 → #483）

`#479` で当初予定していた **Atlas + Turso 構成は方針変更してクローズ済み**。`drizzle-kit` 単独構成に切り替える。

| 項目 | 旧（#479 廃止） | 新（本 Issue） |
|------|----------------|----------------|
| マイグレーション生成 | `atlas migrate diff` | `drizzle-kit generate --name <name>` |
| マイグレーション適用 | `atlas migrate apply` | `drizzle-kit migrate` |
| 設定ファイル | `atlas.hcl` + `drizzle.config.ts` | `drizzle.config.ts` 単独 |
| 整合性チェック | `migrate validate` + `atlas.sum` | `drizzle-kit check` + `meta/_journal.json` |
| schema drift 検出 | `schema diff` | `drizzle-kit generate` 空実行 + `git status --porcelain -- migrations/` |
| Atlas CLI のインストール | 必要 | **不要**（README から削除する） |
| `migrate lint` | Atlas v0.38 で Pro 限定化（決定打） | 採用しない |

切替の根拠は `#479` のクローズコメント参照（https://github.com/nekochans/lgtm-cat-frontend/issues/479 の最新コメント、Issue 本文の「マイグレーションツールに drizzle-kit を採用する理由」セクションも併読）。

### 1.4 スコープ

| やる | やらない（後続 Issue で対応 / 既に完了） |
|------|------------------------------------------|
| `src/lib/better-auth/schema.ts` に 4 テーブル定義（user / session / account / verification） | GitHub OAuth Provider 設定（`#480`） |
| `drizzle-kit generate --name init_auth_schema` で初回マイグレーション SQL と `meta/_journal.json` を生成・コミット | Better Auth JWT プラグイン（lgtm-cat-api 準備後の別 Issue） |
| ローカル `local-lgtm-cat-auth` DB へ `drizzle-kit migrate` で適用 | フロントエンドからの JWT 送信（同上） |
| GitHub Actions に PR 検証ワークフロー（runner 上の一時 SQLite ファイル DB に検証適用 + SQL プレビュー PR コメント）を追加 | lgtm-cat-api 側の JWT 検証連携（同上） |
| GitHub Actions に staging 自動適用ワークフロー（push to `staging` トリガー）を追加 | Turso Database Branching 採用（セキュリティ境界・運用境界・CI コストの観点で見送り） |
| GitHub Actions に prod 自動適用ワークフロー（push to `main` トリガー）を追加 | 本格的な rollback 機能（forward fix 原則のため最小限） |
| schema drift 検出を CI（PR 検証ワークフロー）に組み込み | |
| `atlas.hcl` を削除し、README から Atlas CLI 関連手順を削除（drizzle-kit コマンドへ置換） | |
| README にマイグレーション失敗時の確認手順とロールバック方針を追記 | |
| `package.json` に `auth-db:generate` / `auth-db:migrate` / `auth-db:check` の npm scripts を追加 | |

### 1.5 Done の定義（Issue 引用）と対応マッピング

| Issue 記載の Done 定義 | 対応セクション |
|------------------------|----------------|
| Better Auth が要求するテーブル定義（`user` / `session` / `account` / `verification`）が Drizzle スキーマとして `src/lib/better-auth/schema.ts` に配置されている事 | §6.2 |
| `drizzle-kit generate` でマイグレーション SQL を生成し、`migrations/` ディレクトリにコミットされている事（`0000_*.sql` および `meta/_journal.json`） | §6.3 |
| ローカル `local-lgtm-cat-auth` DB に対し `drizzle-kit migrate`（または migrator API スクリプト）でマイグレーション適用ができる事 | §6.4 |
| GitHub Actions で PR 起票時にマイグレーション検証ジョブが走り、SQL プレビューが PR コメントに投稿される事 | §6.6 |
| `staging` ブランチへのマージ後に staging Turso DB（`stg-lgtm-cat-auth`）へ自動適用するワークフローが構築されている事 | §6.7 |
| `main` ブランチへのマージ後に本番 Turso DB（`prod-lgtm-cat-auth`）へ自動適用するワークフローが構築されている事 | §6.8 |
| schema.ts と `migrations/` の同期検証が CI に組み込まれている事（例: `drizzle-kit generate` 空実行 + `git diff --exit-code` で検出） | §6.6.4 |
| マイグレーション失敗時の確認手順とロールバック方針（forward fix 原則）が README にドキュメント化されている事 | §6.9 |

---

## 2. 前提知識と参考リンク

### 2.1 公式ドキュメント

- Better Auth: https://www.better-auth.com/docs/installation
- Better Auth Drizzle Adapter: https://www.better-auth.com/docs/adapters/drizzle
- Better Auth Database Schema: https://www.better-auth.com/docs/concepts/database
- Drizzle ORM (Turso): https://orm.drizzle.team/docs/get-started/turso-new
- Drizzle Kit Migrations: https://orm.drizzle.team/docs/migrations
- libSQL Migrator API: https://orm.drizzle.team/docs/migrations#migrate
- Turso CLI: https://docs.turso.tech/cli/installation

### 2.2 関連 Issue / 設計書

- `#314`: 認証基盤の技術選定
- `#478`: Better Auth / Drizzle / Turso の初期セットアップ（マージ済み）
  - 設計書: `design-docs-for-ai/issue478-better-auth-drizzle-atlas-turso-setup-plan.md`
- `#479`: Atlas マイグレーション運用構築（**クローズ**）— マイグレーションツール選定経緯。設計書ファイルは削除済み
- `#480`: GitHub OAuth ログイン実装（本 Issue 完了後に着手）

### 2.3 #478 / #479 から本 Issue へ引き継ぐ前提

#478 で初期セットアップ済み。以下は本 Issue では **再検討不要**。

#### 2.3.1 認証 DB は 3 種運用（K 側で発行・登録済み）

| 環境 | DB 名 | 用途 |
| ---- | ---- | ---- |
| ローカル | `local-lgtm-cat-auth` | 各開発者の `.env.local`。マイグレーション動作担保の主戦場 |
| ステージング | `stg-lgtm-cat-auth` | Vercel Preview / Development、`staging` ブランチ自動適用先 |
| 本番 | `prod-lgtm-cat-auth` | Vercel Production、`main` ブランチ自動適用先 |

**マイグレーションは local → staging → prod の順で段階適用する。**

#### 2.3.2 GitHub Environment / Environment Secret（K 側で整備済み、2026-05-08 K 確認済み）

`gh api repos/nekochans/lgtm-cat-frontend/environments` で Environment 自体の存在を確認済み（`Production` / `staging` / `Preview` / `copilot` の 4 件、`Production` と `staging` には `custom_branch_policies` を伴う protection rule が設定済み）。Secret のキー名は **2026-05-08 に K が手元で確認済み**。本 Issue では新規追加不要、既存を参照するだけ。

| Environment | Secret | 用途 |
|-------------|--------|------|
| `staging` | `TURSO_STG_DATABASE_URL`、`TURSO_STG_AUTH_TOKEN` | `staging` ブランチからのみ参照可（Deployment Branch Policy で `staging` のみ許可） |
| `Production` | `TURSO_PROD_DATABASE_URL`、`TURSO_PROD_AUTH_TOKEN` | `main` ブランチからのみ参照可（Deployment Branch Policy で `main` のみ許可） |

> Repository Secret から `TURSO_*` 系は削除済み。`pull_request` トリガーのワークフローでは Environment Secret に到達できないため、**PR 検証では Turso に接続しない**（§2.3.3）。

#### 2.3.3 PR 検証は Turso 非接続（runner 上の一時 SQLite ファイル DB を使う）

PR 検証ワークフロー（`pull_request` トリガー）では:

- **TURSO_API_TOKEN（org-scoped）も TURSO_*_AUTH_TOKEN も渡さない**（セキュリティ境界の最小化）
- 検証用 DB は `${RUNNER_TEMP}/auth-pr-validation.db` の一時 SQLite ファイル DB
- `@libsql/client` は `file:` URL スキームでローカル SQLite ファイルへ接続できるため、`TURSO_DATABASE_URL=file:${RUNNER_TEMP}/auth-pr-validation.db` を渡せば drizzle-kit migrate が動作する（fallback 設計は §6.6.5 参照）
- staging / prod 適用ワークフローは push トリガー + Environment 指定で初めて Turso に接続する

#### 2.3.4 命名規約: Better Auth デフォルトを維持

- テーブル名は **単数形**（`user`, `session`, `account`, `verification`）
- `usePlural` および `fields` マッピングは **使わない**
- TS プロパティは camelCase、DB 物理カラムは snake_case（Better Auth デフォルト）
- 理由: マッピング層を挟むと Better Auth のバージョンアップ時に追従コストが上がる。設計判断は `#314` メモリ通り

#### 2.3.5 `auth.ts` は import 時点で環境変数を throw する

`src/lib/better-auth/auth.ts` および `db.ts` は `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` / `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` 未定義で起動時 throw する。

- **drizzle-kit は `schema.ts` のみを読む**（`auth.ts` / `db.ts` を import しない）ため、CI で BETTER_AUTH_* を渡さなくても drizzle-kit のコマンドは動く。
- ただし `drizzle-kit migrate` は `drizzle.config.ts` の `dbCredentials` から TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を読むため、これらは必須（PR 検証では `file:` URL を渡す）。

---

## 3. 採用技術とバージョン方針

### 3.1 既存パッケージ（#478 で導入済み、本 Issue では追加・更新なし）

| パッケージ | 現在のバージョン（package.json） | 役割 | 2026-05-08 時点の最新安定版 |
|-----------|----------------------------------|------|-----------------------------|
| `better-auth` | `1.6.9` | 認証ロジック | `1.6.9`（最新安定版） |
| `@better-auth/drizzle-adapter` | `1.6.9` | Drizzle adapter | `1.6.9`（better-auth と同期、最新安定版） |
| `drizzle-orm` | `0.45.2` | ORM・型推論。`drizzle-orm/sqlite-core` のテーブル定義 API を使用 | `0.45.2`（最新安定版。`v1.0.0-rc.2` が rc 段階） |
| `@libsql/client` | `0.17.3` | libSQL/Turso ドライバ | GitHub Releases で追跡困難。`0.17.3` で動作確認済の前提 |
| `drizzle-kit` | `0.31.10`（devDependencies） | スキーマ → SQL 生成、マイグレーション適用 | `0.31.10`（最新安定版） |

> **方針（2026-05-08 K 合意）**: 本 Issue では **既存バージョンをそのまま据え置く**（スコープを最小化するため）。バージョン互換問題が発生した場合のみ、PR 説明欄で個別に共有する。
>
> **drizzle-orm v1.0 が rc 段階の点について**: 本 Issue 着手中に `drizzle-orm v1.0` の stable がリリースされた場合でも、**本 Issue では追従しない**。v1.0 へのアップグレードは migrations 周りに破壊的変更を伴うため、別 Issue で計画を立てて対応する（詳細は §8.10 参照）。

### 3.2 drizzle-kit の利用方針（本 Issue で確立する）

| コマンド | 役割 | 利用場面 |
|---------|------|---------|
| `drizzle-kit generate --name <name>` | `schema.ts` と `migrations/meta/_journal.json` を比較し、差分があれば `migrations/<NNNN>_<name>.sql` および `migrations/meta/<NNNN>_snapshot.json` と更新後 `_journal.json` を生成 | 開発者がローカルでスキーマ変更後に手動実行 |
| `drizzle-kit migrate` | `migrations/meta/_journal.json` を読み、未適用のマイグレーションを `dbCredentials` の DB に適用 | ローカル動作確認、CI（PR 検証 / staging / prod 適用） |
| `drizzle-kit check` | 既存マイグレーションの整合性チェック | CI（PR 検証） |
| `drizzle-kit export` | スキーマ → SQL DDL を標準出力に流す（**本 Issue では使わない**。Atlas 用に #478 で導入されたが drizzle-kit 移行で不要になる） | 利用しない |

> **`drizzle-kit export` は使わない**: #478 で `atlas.hcl` から呼び出すために導入したが、本 Issue で Atlas を撤去するため利用箇所がなくなる。`drizzle.config.ts` 自体は `generate` / `migrate` で使い続ける。

### 3.3 Drizzle スキーマ実装方針

#479 の検討で固まった以下の論点をそのまま引き継ぐ。

1. **TS プロパティは camelCase / DB 物理カラムは snake_case**: Better Auth canonical fixture と一致させる。`drizzleAdapter` の `camelCase: true` は **指定しない**（既に #478 の `auth.ts` でも未指定）。
2. **`onDelete: "cascade"` の付与箇所**: `session.userId` / `account.userId`（user 削除時に紐づく session/account を一掃）。`verification` は user 非依存のため不要。
3. **インデックス**: `session_user_id_idx` / `account_user_id_idx` / `verification_identifier_idx` を手書き（Better Auth は user_id をキーに頻繁にクエリするため、外部キー単独では SQLite 上で自動インデックスが付かない）。
4. **`unique()` 制約**: `user.email` / `session.token`（drizzle-kit が `UNIQUE INDEX` に自動変換）。
5. **タイムスタンプ**: `integer({ mode: "timestamp_ms" })` で JS Date をミリ秒整数として保存。
6. **デフォルト値**: ` sql\`(cast(unixepoch('subsecond') * 1000 as integer))\` ` で挿入時の JS Date 相当値を SQLite 側で生成（Drizzle の `$defaultFn(() => new Date())` ではなく SQL DEFAULT として固定）。
7. **インデックス命名**: drizzle-kit はスキーマで指定した名前をそのまま採用するので、`user_id` のように **物理カラム名を使ったスネークケース命名** にする（DDL ファイルの可読性のため）。

---

## 4. ファイル構成

### 4.1 新規作成するファイル

| パス | 役割 |
|------|------|
| `migrations/0000_init_auth_schema.sql` | drizzle-kit generate の出力（`init_auth_schema` という命名で統一） |
| `migrations/meta/_journal.json` | drizzle-kit が管理するマイグレーション順序ジャーナル |
| `migrations/meta/0000_snapshot.json` | drizzle-kit が次回 generate 時に比較する用のスキーマスナップショット |
| `.github/workflows/auth-db-migration-validate.yml` | PR 検証ワークフロー（`pull_request` トリガー） |
| `.github/workflows/auth-db-migration-apply-staging.yml` | staging 自動適用ワークフロー（`push` to `staging` トリガー） |
| `.github/workflows/auth-db-migration-apply-prod.yml` | prod 自動適用ワークフロー（`push` to `main` トリガー） |

### 4.2 編集するファイル

| パス | 内容 |
|------|------|
| `src/lib/better-auth/schema.ts` | `export {}` のみ → 4 テーブル定義に書き換え |
| `package.json` | `scripts` に `auth-db:generate` / `auth-db:migrate` / `auth-db:check` を追加 |
| `README.md` | Atlas CLI セクションを撤去し、drizzle-kit のコマンド一覧と「マイグレーション失敗時の確認手順 / ロールバック方針」を追記 |

### 4.3 削除するファイル

| パス | 削除理由 |
|------|---------|
| `atlas.hcl` | drizzle-kit 単独構成に切替（#479 廃止により Atlas を使用しない） |
| `migrations/.gitkeep` | drizzle-kit が `0000_*.sql` / `meta/_journal.json` 等を `migrations/` 直下に作成するため、空ディレクトリ保持用の `.gitkeep` は不要になる |

### 4.4 編集しないが意図を確認するファイル

| パス | 状態 | 確認内容 |
|------|-----|---------|
| `drizzle.config.ts` | #478 で配置済み | `dialect: "turso"` / `out: "./migrations"` / `schema: "./src/lib/better-auth/schema.ts"` / `dbCredentials` に TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を読む形になっている。本 Issue の要件をすべて満たすため **編集不要** |
| `src/lib/better-auth/db.ts` | #478 で配置済み | drizzle-kit migrate は `db.ts` を import しないため変更不要 |
| `src/lib/better-auth/auth.ts` | #478 で配置済み | 同上 |
| `.env.example` | #478 で `TURSO_*` / `BETTER_AUTH_*` を追加済み | 本 Issue では追記不要 |

### 4.5 ディレクトリ構造（最終形）

```
lgtm-cat-frontend/
├── atlas.hcl                       ← 削除
├── drizzle.config.ts               ← 既存（編集なし）
├── migrations/
│   ├── .gitkeep                    ← 削除
│   ├── 0000_init_auth_schema.sql   ← 新規（drizzle-kit generate）
│   └── meta/
│       ├── _journal.json           ← 新規（drizzle-kit generate）
│       └── 0000_snapshot.json      ← 新規（drizzle-kit generate）
├── README.md                       ← 編集（Atlas 撤去 + drizzle-kit 手順追加）
├── package.json                    ← 編集（auth-db:* scripts 追加）
├── .github/
│   └── workflows/
│       ├── ci.yml                  ← 既存（編集なし）
│       ├── chromatic.yml           ← 既存（編集なし）
│       ├── create-release-pull-request.yml  ← 既存（編集なし）
│       ├── auth-db-migration-validate.yml        ← 新規
│       ├── auth-db-migration-apply-staging.yml   ← 新規
│       └── auth-db-migration-apply-prod.yml      ← 新規
└── src/
    └── lib/
        └── better-auth/
            ├── auth.ts             ← 既存（編集なし）
            ├── db.ts               ← 既存（編集なし）
            └── schema.ts           ← 編集（4 テーブル定義）
```

---

## 5. 実装フェーズ概観

| Phase | 内容 | 担当環境 |
|-------|------|---------|
| 1 | Atlas 関連ファイル / README 記述の撤去（`atlas.hcl` 削除、README から Atlas CLI セクション削除） | リポジトリ |
| 2 | `src/lib/better-auth/schema.ts` に 4 テーブル定義を実装 | リポジトリ |
| 3 | `drizzle-kit generate --name init_auth_schema` で初回マイグレーション SQL と meta ファイルを生成・コミット | ローカル |
| 4 | `drizzle-kit migrate` で `local-lgtm-cat-auth` に適用、テーブル作成を SQL で確認 | ローカル |
| 5 | `package.json` に `auth-db:*` scripts を追加 | リポジトリ |
| 6 | `.github/workflows/auth-db-migration-validate.yml`（PR 検証 + SQL プレビュー PR コメント + schema drift 検出）を新設 | リポジトリ |
| 7 | `.github/workflows/auth-db-migration-apply-staging.yml`（staging 自動適用）を新設 | リポジトリ |
| 8 | `.github/workflows/auth-db-migration-apply-prod.yml`（prod 自動適用）を新設 | リポジトリ |
| 9 | README に「drizzle-kit のコマンド一覧」「マイグレーション失敗時の確認手順 / ロールバック方針」を追記 | リポジトリ |
| 10 | 品質管理（format / lint / test / build） | ローカル |
| 11 | PR 作成（`create-pr` Skill に従う） | GitHub |

---

## 6. 実装ステップ詳細

### 6.1 Phase 1: Atlas 関連ファイルの撤去

#### 6.1.1 `atlas.hcl` を削除

```bash
rm atlas.hcl
```

#### 6.1.2 `migrations/.gitkeep` を削除

```bash
rm migrations/.gitkeep
```

> **注**: Phase 3 で drizzle-kit が `migrations/0000_*.sql` および `migrations/meta/_journal.json` を生成するため、`.gitkeep` がなくても `migrations/` が Git 追跡対象として残る。Phase 1 と Phase 3 の間で `migrations/` が一時的に空になるが、commit を分けず 1 つの PR にまとめれば Git 履歴上の問題はない（最終 commit 時点で SQL ファイル等が存在する）。

#### 6.1.3 README.md から Atlas CLI セクションを削除

`README.md` の **86 行目から 147 行目までの「Atlas CLI のインストール」「Turso CLI のインストール（任意）」セクション全体を削除** し、代わりに「認証 DB のマイグレーション運用」セクションを §6.9 で追記する。

> **注**: Turso CLI のインストール手順自体は `42〜62 行目`（「認証 DB（Turso）の使い分け」セクション）に既に記載されているため、`128〜147 行目`の重複説明は削除しても情報損失はない。`128〜147 行目`の「Turso CLI のインストール（任意）」セクションは §6.9 の新セクションへ統合する形で再構築する。

具体的な編集内容は §6.9 で示す。

#### 6.1.4 README.md の他の Atlas 言及箇所を修正

`README.md` `51 行目` の以下の文言を:

```
ローカル開発者は **個人用の `local-lgtm-cat-auth` を Turso CLI で作成** してください。マイグレーションをローカルで安全に試した後、Issue #479 以降のフローで stg・prod に適用します。
```

以下に書き換える:

```
ローカル開発者は **個人用の `local-lgtm-cat-auth` を Turso CLI で作成** してください。マイグレーションをローカルで安全に試した後、本リポジトリで構築済みの GitHub Actions 自動適用フロー（`staging` / `main` ブランチへのマージで stg / prod に順次適用）に乗せます。詳細は「[認証 DB のマイグレーション運用](#認証-db-のマイグレーション運用)」を参照。
```

---

### 6.2 Phase 2: `src/lib/better-auth/schema.ts` に 4 テーブル定義を実装

`src/lib/better-auth/schema.ts` の **既存内容（`export {};` のみ）を完全に書き換える**。

#### 6.2.1 ファイル全体の最終形

```typescript
// src/lib/better-auth/schema.ts
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Better Auth 必須の 4 テーブル定義。
 *
 * - テーブル名・カラム名は Better Auth デフォルト（単数形 / camelCase TS プロパティ ↔ snake_case 物理カラム）。
 *   `usePlural` および `fields` マッピングは利用しない。
 * - タイムスタンプは `integer({ mode: "timestamp_ms" })` で JS Date をミリ秒整数として保存する。
 * - デフォルト値は SQLite 側で `unixepoch('subsecond') * 1000` を使い、INSERT 時の現在時刻をサーバ側で確定させる。
 * - 外部キー制約: `session.userId` / `account.userId` に `onDelete: "cascade"` を付与（user 削除時に紐づく session / account を一掃）。
 * - インデックス: `session_user_id_idx` / `account_user_id_idx` / `verification_identifier_idx` を手書き。
 *   外部キー単独では SQLite 上で自動インデックスが付かないため、Better Auth が頻繁に user_id 検索する経路に対応する。
 * - `unique()` 制約: `user.email` / `session.token` は drizzle-kit が UNIQUE INDEX に自動変換する。
 *
 * 参考:
 * - Better Auth Database Schema: https://www.better-auth.com/docs/concepts/database
 */

const timestampDefault = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(timestampDefault),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(timestampDefault),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampDefault),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
```

#### 6.2.2 実装上のポイント

- **`mode: "boolean"` の理由**: SQLite には真偽値型がないため、drizzle-orm では integer に 0/1 を保存する。Better Auth は内部で boolean を扱うので `mode: "boolean"` を指定して TypeScript 型を boolean に寄せる。
- **`mode: "timestamp_ms"` の理由**: JS の `Date` を ms 整数で保存する。Better Auth は `Date` インスタンスを直接受け渡すので `mode: "timestamp"` （秒）ではなく **ms** を選ぶ。
- **`timestampDefault` を共通変数に切り出した理由**: 同じ式が 8 箇所登場するため。`sql` テンプレートはモジュールトップで 1 度だけ評価される定数として扱える。
- **外部キーの `references` の引数**: `() => user.id` のように関数で囲むのは、`session` テーブル定義時点で `user` テーブル定義への前方参照を許容するため。本ファイル内で `user` を先に定義するため実質不要だが、Drizzle の慣例として関数渡しで統一する。
- **`(table) => [...]` の二段目引数**: drizzle-orm 0.43 以降で導入されたタプル形式（公式推奨）。`(table) => ({ idx: index(...) })` のオブジェクト形式は v1 で非推奨化が予告されているため使わない。
- **インデックス名と物理カラム名の一致**: `session_user_id_idx` のようにスネークケース統一。SQL DDL での可読性を優先。

#### 6.2.3 lint で発生し得る警告と対処

`schema.ts` は drizzle-orm を直接利用するため、Ultracite/Biome の以下のルールに引っかかる可能性がある:

| ルール | 想定原因 | 対処 |
|--------|---------|------|
| `noNonNullAssertion` | `references(() => user.id!)` のように `!` を使った場合 | `!` を使わない（本計画書のサンプルは未使用） |
| `useNamingConvention` | `sqliteTable` の第一引数（テーブル / カラムの物理名）が snake_case のため | `// biome-ignore lint/style/useNamingConvention: SQLite 物理名は snake_case 規約に従う` を該当行に付与する |

> **方針**: Phase 10 の lint で警告が出たら **個別の `biome-ignore` コメントで対処** し、`biome.jsonc` の全体設定はいじらない（影響範囲を最小化するため）。当該プロジェクトでは Ultracite が Biome ルールを自動で抑制している場合もあるので、まずは `npm run lint` を実行し警告が出たカラムにのみ ignore を付ける運用にする。

---

### 6.3 Phase 3: `drizzle-kit generate` で初回マイグレーション SQL を生成

#### 6.3.1 コマンド実行

```bash
# .env.local の TURSO_* をシェルに読み込ませる必要はない（generate は DB 接続不要）
npx drizzle-kit generate --name init_auth_schema
```

> **注**: `drizzle-kit generate` は `dbCredentials` を読まずに schema.ts と既存の `meta/_journal.json` のみを比較する。よって `.env.local` の読み込みは不要。

#### 6.3.2 生成されるファイル

```
migrations/
├── 0000_init_auth_schema.sql        ← 生成される
└── meta/                            ← 自動作成される
    ├── _journal.json                ← 生成される
    └── 0000_snapshot.json           ← 生成される
```

#### 6.3.3 期待される `0000_init_auth_schema.sql` の概形（参考）

> 実際の出力は drizzle-kit のバージョンで微妙に異なる可能性がある。本計画書の SQL はレビュー時の「想定」を共有するもので、**実際の生成ファイルをそのままコミットする**（手動編集は禁止）。

```sql
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);
```

> **注**: 上記は **想定形** であり、drizzle-kit 0.31.10 が `dialect: "turso"` で実際に生成する SQL は表記の細部（クォート位置、`--> statement-breakpoint` の有無等）が異なる可能性がある。
>
> **重要: 手動編集禁止のスコープ**: 以下のファイルすべてが drizzle-kit の生成物であり、人間が手動で編集してはならない（次回 generate 時に snapshot との不整合が発生する）。
> - `migrations/<NNNN>_<name>.sql`
> - `migrations/meta/_journal.json`
> - `migrations/meta/<NNNN>_snapshot.json`
>
> 修正したい場合は **必ず schema.ts 側を編集して再 `auth-db:generate`** で全ファイルを再生成する。

#### 6.3.4 期待される `meta/_journal.json` の概形

```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1746636000000,
      "tag": "0000_init_auth_schema",
      "breakpoints": true
    }
  ]
}
```

> **注**: `when` は drizzle-kit 実行時のタイムスタンプ。`dialect` は drizzle.config.ts の指定（"turso"）に対し snapshot は "sqlite" として保存される（drizzle-kit 0.31 系の挙動）。

#### 6.3.5 `meta/0000_snapshot.json` について

- drizzle-kit が **次回 generate 時のスキーマ比較ベースライン** として使う JSON 形式の snapshot
- 内部仕様であり、構造の詳細はドキュメント化されていない（バージョン番号、テーブル定義の記述等を含む）
- **人間は読み書きしない**。Git では普通に追跡するが、PR レビューでも内容を逐一確認する必要はない
- merge conflict が起きた場合は **再 `npm run auth-db:generate`** で解消する（手動マージは禁止）

---

### 6.4 Phase 4: ローカル DB へ適用と動作確認

#### 6.4.0 前提: 実装担当者の個人ローカル DB が `.env.local` に登録されている事

本フェーズの実行前に、**実装担当者個人の Turso DB**（例: `local-lgtm-cat-auth-<your-handle>`）が発行され、`.env.local` の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` がそれを指している必要がある。

- 既に登録されている場合（#478 を経て `.env.local` をコピー済みの環境）はそのまま Phase 4.1 に進む
- 個人 DB がない場合は README「[認証 DB（Turso）の使い分け](../README.md)」セクションの手順で `turso db create local-lgtm-cat-auth` 等を実施し、`.env.local` に値を書き込む（**他人の DB と同名にしない**）
- **絶対に `stg-lgtm-cat-auth` / `prod-lgtm-cat-auth` を `.env.local` に書かない**（手元シェルから stg / prod に意図せず接続するリスクを完全排除する）
- 不明な場合は K に確認する

#### 6.4.1 `.env.local` を読み込んだ状態で `drizzle-kit migrate` を実行

`.env.local` の中身は閲覧禁止（#478 §1.4 補足 3）。`dotenv-cli` 経由で実行する。

```bash
npx dotenv-cli -e .env.local -- npx drizzle-kit migrate
```

> **注**: drizzle-kit 0.31 系では `migrate` コマンドが drizzle.config.ts の `dbCredentials` を直接利用してマイグレーションを適用する。内部的に `__drizzle_migrations` テーブルを作成し、`meta/_journal.json` の各エントリ hash と照合して未適用分のみを適用する。

#### 6.4.2 テーブル作成の確認

`turso db shell` でローカル DB に接続して確認する。

```bash
turso db shell local-lgtm-cat-auth
```

シェル上で:

```sql
.tables
-- 期待: __drizzle_migrations  account  session  user  verification

.schema user
-- 期待: CREATE TABLE user 定義（id text primary key, name text not null, ...）

.schema session
-- 期待: foreign key user_id -> user(id) on delete cascade を含む定義

.schema account
.schema verification

-- インデックスの確認
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name IN ('user', 'session', 'account', 'verification');
-- 期待: user_email_unique, session_token_unique, session_user_id_idx,
--       account_user_id_idx, verification_identifier_idx 等が含まれる
--       （sqlite_autoindex_* も同居するが Drizzle 管理対象外）

-- マイグレーションジャーナルの確認
SELECT * FROM __drizzle_migrations;
-- 期待: 1 行（hash と created_at が記録されている）

.exit
```

#### 6.4.3 失敗時の対処

| 症状 | 対処 |
|------|------|
| `TURSO_DATABASE_URL is not defined` | `.env.local` に `TURSO_DATABASE_URL` が無い。K に確認を依頼 |
| `unauthorized: token expired` | `.env.local` の `TURSO_AUTH_TOKEN` が期限切れ。K に再発行を依頼（中身を覗かない） |
| `table user already exists` | 過去に手動で同名テーブルを作成した可能性。`turso db shell` で `DROP TABLE` するか、別の DB 名で再発行を K に依頼 |
| 適用後の `.tables` に 4 テーブルが揃わない | Phase 3 で生成された SQL が壊れている可能性。`migrations/` 配下を `git restore` で巻き戻して Phase 3 から再実行 |

#### 6.4.4 巻き戻し（個人ローカル DB 限定）

個人ローカル DB をクリーンな状態に戻したい場合は、以下の手順で実行する。**DB 名のハードコードを避け、`.env.local` の `TURSO_DATABASE_URL` を経由してのみ接続する**。

```bash
# 個人 DB の名前を .env.local から間接的に解決して shell に入る
# ※ 事前に turso auth login が必要
DB_NAME=$(npx dotenv-cli -e .env.local -- node -e "
  const url = process.env.TURSO_DATABASE_URL || '';
  // 例: libsql://local-lgtm-cat-auth-yourname-***.turso.io から DB 名を抽出
  const match = url.match(/libsql:\\/\\/([^.]+)\\.turso\\.io/);
  if (!match) throw new Error('TURSO_DATABASE_URL is not a Turso URL');
  console.log(match[1].replace(/-[a-f0-9]+$/, ''));
")

# 念のため stg / prod の名前と衝突していないことを確認してから実行
if [[ "${DB_NAME}" == stg-* || "${DB_NAME}" == prod-* ]]; then
  echo "ERROR: DB 名が stg/prod 命名と一致しています。中断します。"; exit 1
fi

turso db shell "${DB_NAME}" <<'EOF'
DROP TABLE IF EXISTS __drizzle_migrations;
DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS user;
EOF
```

> **重要**: この `DROP TABLE` を **stg / prod に対して絶対に実行しない**。上記の `DB_NAME` ガードに加え、`.env.local` 経由でしか接続しない手順を厳守する（stg/prod の URL が手元シェルに混入していないか実行前に必ず確認）。
>
> **代替手段**: `turso auth login` 等の手間を避けたい場合は、K に依頼して個人 DB を再発行してもらう方が安全。ローカル巻き戻しは **本 Issue のスムーズな進行に必須ではなく、何度も Phase 4 を試行錯誤する場合の便利機能**。

---

### 6.5 Phase 5: `package.json` に npm scripts を追加

#### 6.5.1 追加する scripts

`package.json` の `"scripts"` 配下に **既存スクリプトを保持したまま** 以下を追記する。挿入位置は `"sync:agents-skills"` の **直後**（末尾）。

```jsonc
{
  "scripts": {
    // ...既存
    "sync:agents-skills": "tsx src/scripts/copy-agents-skills.ts",
    "auth-db:generate": "drizzle-kit generate",
    "auth-db:migrate": "drizzle-kit migrate",
    "auth-db:check": "drizzle-kit check"
  }
}
```

#### 6.5.2 ネーミングの理由

- **prefix `auth-db:`**: 認証 DB 専用であることを明示。将来 lgtm-cat-api 側の DB マイグレーションが本リポジトリに合流する場合に備えて識別性を担保する。
- **`db:*` を使わない理由**: 単に `db:migrate` だと「どの DB？」が曖昧。Issue #314 で認証 DB と LGTM 画像/投稿用 DB を完全分離する方針を確定しているため、prefix で明確にする。

#### 6.5.3 利用シーン

```bash
# スキーマ変更後にマイグレーション SQL を生成
npm run auth-db:generate -- --name <migration_name>

# 変更内容をローカル DB へ適用
npx dotenv-cli -e .env.local -- npm run auth-db:migrate

# 既存 migrations の整合性をチェック（CI 用）
npm run auth-db:check
```

> **マイグレーション名の命名規則**: `<migration_name>` は **snake_case で意図を表す名称** にする（例: `init_auth_schema`、`add_user_role_column`、`drop_legacy_session_token_column`）。drizzle-kit はこれをファイル名にそのまま反映する（`migrations/0001_add_user_role_column.sql` 等）。理由:
> - SQL 文化に合わせた snake_case で SQL DDL とファイル名の見た目が揃う
> - ファイル名にハイフンが混じらないため、`migrations/*.sql` 等の glob で扱いやすい
> - `npm run auth-db:generate` の引数として渡す際にクォート不要

---

### 6.6 Phase 6: PR 検証ワークフロー（`auth-db-migration-validate.yml`）

#### 6.6.1 役割

PR 起票時に以下を検証し、SQL プレビューを PR コメントに投稿する:

1. **schema drift 検出**: `schema.ts` と `migrations/` が同期しているか
2. **マイグレーション整合性検証**: `drizzle-kit check` で `_journal.json` と SQL の整合性を確認
3. **runner 上の一時 SQLite ファイル DB に適用**: マイグレーションがエラーなく走るか
4. **新規追加された SQL を PR コメントに投稿**

#### 6.6.2 ファイル: `.github/workflows/auth-db-migration-validate.yml`

```yaml
name: auth-db-migration-validate

on:
  pull_request:
    branches:
      - staging
      - main
    paths:
      - "src/lib/better-auth/schema.ts"
      - "migrations/**"
      - "drizzle.config.ts"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/auth-db-migration-validate.yml"

permissions:
  contents: read
  pull-requests: write

jobs:
  validate:
    name: Validate auth DB migrations
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          # コメント投稿用にデフォルトブランチも取得しておく（diff の base 確認に利用）
          fetch-depth: 0

      - name: Use Node.js 24.x
        uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: npm
          registry-url: "https://npm.pkg.github.com"
          scope: "@nekochans"

      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        env:
          NODE_AUTH_TOKEN: ${{ secrets.AUTH_TOKEN_FOR_GITHUB_PACKAGES }}

      - name: Verify migration journal integrity (drizzle-kit check)
        run: npm run auth-db:check

      - name: Detect schema drift (schema.ts vs migrations/)
        run: |
          # drizzle-kit generate は rename 検出時にインタラクティブな確認を求めることがある。
          # CI では stdin を /dev/null に閉じ、確認がある場合はそのまま EOF で打ち切らせる
          # （rename の判定が必要なケースは初回 generate を local で実施する運用に倒す）。
          npm run auth-db:generate -- --name __drift_check__ < /dev/null
          DRIFT=$(git status --porcelain -- migrations/)
          if [ -n "$DRIFT" ]; then
            echo "::error title=Schema drift detected::schema.ts と migrations/ が同期されていません。ローカルで 'npm run auth-db:generate -- --name <name>' を実行し、生成されたファイルをコミットしてください。"
            git status --short -- migrations/
            git diff --stat -- migrations/
            exit 1
          fi

      - name: Apply migrations to ephemeral SQLite file DB
        run: npx drizzle-kit migrate
        env:
          # @libsql/client は file: スキームでローカル SQLite ファイルへ接続できる。
          # CI runner 上で完結し、Turso へは接続しない（PR 検証では Turso クレデンシャルを渡さない方針）。
          TURSO_DATABASE_URL: file:${{ runner.temp }}/auth-pr-validation.db
          TURSO_AUTH_TOKEN: dummy-token-for-local-file

      - name: Detect newly added migration files in this PR
        id: detect_new_migrations
        run: |
          # pull_request の base への diff から、追加された migrations/*.sql を抽出
          BASE_SHA="${{ github.event.pull_request.base.sha }}"
          NEW_FILES=$(git diff --name-only --diff-filter=A "${BASE_SHA}"...HEAD -- 'migrations/*.sql' | sort)
          if [ -z "${NEW_FILES}" ]; then
            echo "has_new=false" >> "${GITHUB_OUTPUT}"
            echo "新規追加されたマイグレーション SQL はありません。SQL プレビューコメントはスキップします。"
            exit 0
          fi
          echo "has_new=true" >> "${GITHUB_OUTPUT}"
          # 改行込みの multiline output を渡すため delimiter を使う
          {
            echo "files<<__FILES_EOF__"
            echo "${NEW_FILES}"
            echo "__FILES_EOF__"
          } >> "${GITHUB_OUTPUT}"

      - name: Compose SQL preview comment body
        if: steps.detect_new_migrations.outputs.has_new == 'true'
        id: compose_comment
        run: |
          BODY_FILE="${RUNNER_TEMP}/migration-comment.md"
          {
            echo "## :ledger: Auth DB マイグレーション SQL プレビュー"
            echo ""
            echo "本 PR で追加されたマイグレーション SQL を表示しています。レビュー時にスキーマ意図とずれがないか確認してください。"
            echo ""
            while IFS= read -r FILE; do
              [ -z "${FILE}" ] && continue
              echo "<details><summary><code>${FILE}</code></summary>"
              echo ""
              echo '```sql'
              cat "${FILE}"
              echo '```'
              echo ""
              echo "</details>"
              echo ""
            done <<< "${{ steps.detect_new_migrations.outputs.files }}"
          } > "${BODY_FILE}"
          echo "body_file=${BODY_FILE}" >> "${GITHUB_OUTPUT}"

      # 既存の SQL プレビューコメント（同一 PR で再実行時）を特定するため body-includes でマーカーを検索する
      - name: Find existing preview comment
        if: steps.detect_new_migrations.outputs.has_new == 'true'
        id: find_existing_comment
        uses: peter-evans/find-comment@v3
        with:
          issue-number: ${{ github.event.pull_request.number }}
          comment-author: "github-actions[bot]"
          body-includes: "Auth DB マイグレーション SQL プレビュー"

      - name: Post or update SQL preview comment
        if: steps.detect_new_migrations.outputs.has_new == 'true'
        uses: peter-evans/create-or-update-comment@v4
        with:
          # 既存コメントがあれば置き換え、なければ新規作成（comment-id 空のとき新規作成扱い）
          comment-id: ${{ steps.find_existing_comment.outputs.comment-id }}
          issue-number: ${{ github.event.pull_request.number }}
          body-path: ${{ steps.compose_comment.outputs.body_file }}
          edit-mode: replace
```

#### 6.6.3 設計上のポイント

- **`paths` フィルタ**: スキーマ・マイグレーション関連ファイルが変更された PR でのみ走らせる。それ以外の PR で空回りさせない。
- **`permissions`**: `contents: read` で checkout、`pull-requests: write` でコメント投稿。必要最小限。
- **PR の base**: `staging` と `main` のみを対象にする（feature ブランチ間の PR は出さない運用なので、誤発火を防ぐ）。
- **schema drift 検出の方式**: `drizzle-kit generate --name __drift_check__` を実行して、`migrations/` に新ファイル / 既存ファイル変更が出るかを `git status --porcelain` で検出する。新ファイルが生成された場合は `git diff --quiet` ではなく `git status --porcelain` を使うのは untracked file も検出するため。
- **drift 検出後のクリーンアップ不要**: ジョブ終了で runner の作業ディレクトリは破棄されるため、`__drift_check__` 由来のファイルが残る心配はない。
- **一時 SQLite ファイル DB**: `${{ runner.temp }}/auth-pr-validation.db` を使う。`@libsql/client` は `file:<path>` スキームでローカル SQLite ファイルに接続できる。`TURSO_AUTH_TOKEN` は file: 接続では使われないが、`db.ts` の throw を回避するためのダミーは不要（drizzle-kit migrate は db.ts を import しないため）。`drizzle.config.ts` 側の `?? ""` フォールバックがあるため `TURSO_AUTH_TOKEN` 未指定でも動くが、明示性のためダミー値を渡しておく。
- **`drizzle-kit migrate` が `dialect: "turso"` で `file:` URL を受けるか**: `@libsql/client` は file: をサポートするため、libsql 経由で動作する。万が一エラーになった場合のフォールバックは §6.6.5。
- **PR コメントの edit-mode replace**: 同 PR 内で再実行された場合は古いコメントを置き換える（PR 上のコメント数が増殖しない）。`peter-evans/find-comment@v3` で既存マーカー文字列を含むコメントを検索し、見つかれば `comment-id` を渡して同じコメントを更新する。マーカー文字列は本文の `## :ledger: Auth DB マイグレーション SQL プレビュー` を利用する。
- **SQL プレビューを `<details>` で折りたたみ**: 大量の SQL が PR タイムラインを埋め尽くすのを防ぐ。
- **drizzle-kit generate の stdin 閉鎖**: drizzle-kit は rename 検出時にインタラクティブな確認プロンプトを表示することがある。CI では `< /dev/null` で stdin を閉じてプロンプトを EOF で打ち切らせる。rename 判定が必要なケースは local で先行実行する運用前提のため、CI 上での挙動はあくまで「変更が無い事の確認」用途に絞る。

#### 6.6.4 schema drift 検出の補足

drizzle-kit の `generate` コマンドは:

- `migrations/meta/_journal.json` に既登録のスキーマと現在の `schema.ts` を比較
- **差分があれば** 新ファイル `0001_<name>.sql` と更新後 `_journal.json` を生成
- **差分がなければ** ファイルを書き出さず終了（drizzle-kit 0.31 系の挙動）

`generate` 後に `git status --porcelain -- migrations/` が空でない＝差分があった＝開発者が `generate` を忘れて schema.ts のみコミットしたケース。

#### 6.6.5 `file:` URL で `drizzle-kit migrate` が動かない場合のフォールバック

万が一 `dialect: "turso"` で `file:` URL を受け付けない場合（drizzle-kit 0.31 系のバグ等）、`src/scripts/migrate-auth-db.ts` を新設して libSQL migrator API を直接呼ぶ:

```typescript
// src/scripts/migrate-auth-db.ts（フォールバック用、必要時のみ追加）
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

const client = createClient({ url, ...(authToken ? { authToken } : {}) });
const db = drizzle(client);

await migrate(db, { migrationsFolder: "./migrations" });
console.log("Auth DB migrations applied.");
```

呼び出しは `npx tsx src/scripts/migrate-auth-db.ts`。CI ワークフローも同コマンドに差し替える。

> **本 Issue では Phase 4 の動作確認段階で `drizzle-kit migrate` が動くことを確認できた場合、フォールバックスクリプトは作成しない**。動作しなかった場合のみフォールバックに切り替え、PR 説明欄に判断根拠を記載する。

---

### 6.7 Phase 7: staging 自動適用ワークフロー（`auth-db-migration-apply-staging.yml`）

#### 6.7.1 役割

`staging` ブランチへのマージ後、`stg-lgtm-cat-auth` Turso DB に未適用マイグレーションを自動適用する。

#### 6.7.2 ファイル: `.github/workflows/auth-db-migration-apply-staging.yml`

```yaml
name: auth-db-migration-apply-staging

on:
  push:
    branches:
      - staging
    paths:
      - "src/lib/better-auth/schema.ts"
      - "migrations/**"
      - "drizzle.config.ts"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/auth-db-migration-apply-staging.yml"
  workflow_dispatch:

# 並列実行を防ぐ。進行中のマイグレーションを途中で止めないため cancel-in-progress: false。
concurrency:
  group: auth-db-migration-apply-staging
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  apply:
    name: Apply migrations to stg-lgtm-cat-auth
    # GitHub Environment "staging" を指定することで、Deployment Branch Policy（staging のみ許可）と
    # Environment Secret（TURSO_STG_*）が利用可能になる。
    environment: staging
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 24.x
        uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: npm
          registry-url: "https://npm.pkg.github.com"
          scope: "@nekochans"

      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        env:
          NODE_AUTH_TOKEN: ${{ secrets.AUTH_TOKEN_FOR_GITHUB_PACKAGES }}

      - name: Apply migrations to stg-lgtm-cat-auth
        run: npm run auth-db:migrate
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_STG_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_STG_AUTH_TOKEN }}
```

#### 6.7.3 設計上のポイント

- **`environment: staging`**: GitHub Environment "staging" を経由することで、`TURSO_STG_*` Secret に到達可能になる。Deployment Branch Policy で `staging` ブランチのみ許可されているため、他ブランチからは `workflow_dispatch` でも適用できない（K 側で設定済み）。
- **`paths` フィルタ**: マイグレーション関連ファイルが変更されない push（READMEのtypo修正等）では実行しない。冪等性に依存して全 push で走らせる選択肢もあるが、CI コスト最小化を優先。
- **`drizzle-kit migrate` の冪等性**: `__drizzle_migrations` テーブルで適用済み hash を管理しているため、同じマイグレーションを再実行しても No-op で済む（万が一 paths フィルタを通った場合の保険）。
- **`workflow_dispatch`**: 緊急時に手動で再実行できるトリガーを残す（rollback 用途ではなく forward fix 用途。詳細は §9.4）。
- **`concurrency.cancel-in-progress: false`**: 既に走っているマイグレーションを途中で止めると `__drizzle_migrations` の状態が中途半端になる。これを避ける。

---

### 6.8 Phase 8: prod 自動適用ワークフロー（`auth-db-migration-apply-prod.yml`）

#### 6.8.1 役割

`main` ブランチへのマージ後、`prod-lgtm-cat-auth` Turso DB に未適用マイグレーションを自動適用する。

#### 6.8.2 ファイル: `.github/workflows/auth-db-migration-apply-prod.yml`

```yaml
name: auth-db-migration-apply-prod

on:
  push:
    branches:
      - main
    paths:
      - "src/lib/better-auth/schema.ts"
      - "migrations/**"
      - "drizzle.config.ts"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/auth-db-migration-apply-prod.yml"
  workflow_dispatch:

concurrency:
  group: auth-db-migration-apply-prod
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  apply:
    name: Apply migrations to prod-lgtm-cat-auth
    # GitHub Environment "Production" を指定することで、Deployment Branch Policy（main のみ許可）と
    # Environment Secret（TURSO_PROD_*）が利用可能になる。
    # 重要: TURSO_PROD_* は本ワークフロー以外（手元シェル / .env.local 等）から **絶対に参照しない** こと。
    environment: Production
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js 24.x
        uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: npm
          registry-url: "https://npm.pkg.github.com"
          scope: "@nekochans"

      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        env:
          NODE_AUTH_TOKEN: ${{ secrets.AUTH_TOKEN_FOR_GITHUB_PACKAGES }}

      - name: Apply migrations to prod-lgtm-cat-auth
        run: npm run auth-db:migrate
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_PROD_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_PROD_AUTH_TOKEN }}
```

#### 6.8.3 設計上のポイント

- **`environment: Production`** （`P` が大文字）: K 側の Environment 名と一致させる（GitHub Environment 名は case-sensitive）。Issue #478 §6.1.2 の表でも `Production` 表記。
- **`Production` Environment の Deployment Branch Policy**: `main` ブランチのみ許可（K 側設定済み）。これにより、別ブランチから `workflow_dispatch` を起動しても prod の Secret は読めない＝適用されない。多層防御。
- **`workflow_dispatch` の安全性**: 同ワークフローを `workflow_dispatch` で起動する際、デフォルトで GitHub Actions UI からはチェックアウトされるブランチを選択できるが、`Production` Environment が `main` 限定であるため、`feature/foo` ブランチを選んだ場合は Environment Secret に到達できず実質失敗する。これは意図通りの安全弁。
- **手動 rollback**: `workflow_dispatch` で過去 commit に戻して再実行することは可能だが、forward fix 原則のため通常は使わない。緊急対応 SOP は §6.9 / README にも記載する。
- **`.env.local` には絶対に `TURSO_PROD_*` を書かない**: 手元のシェルから prod に意図せず接続できる経路を完全に塞ぐ（メモリの「DB は環境ごとに個別発行」方針に準拠）。

---

### 6.9 Phase 9: README に「認証 DB のマイグレーション運用」セクションを追記

#### 6.9.1 挿入位置

README.md の **「[認証 DB（Turso）の使い分け](#認証-dbturso-の使い分け)」セクションの直後**（現状 62 行目付近）、`Node.js のインストール` セクションの直前。

#### 6.9.2 追加するセクション内容

> :warning: **コピー時の必須注意**: 本計画書では Markdown 内の Markdown を表現するためにコードフェンスをバックスラッシュエスケープ（`` \`\`\` ``）で記載している。実際に README へ反映する際は **すべてのバックスラッシュを除去** して通常の 3 連続バッククオートに置き換える事。バックスラッシュ付きのまま README にコピーすると Markdown レンダリングが壊れる。

```markdown
## 認証 DB のマイグレーション運用

認証 DB（Turso、3 環境）のスキーマ管理は [drizzle-kit](https://orm.drizzle.team/docs/migrations) で運用しています。Atlas は採用していません（経緯は [Issue #479](https://github.com/nekochans/lgtm-cat-frontend/issues/479) のクローズコメント参照）。

### 通常運用フロー

1. **ローカルでスキーマ変更**: `src/lib/better-auth/schema.ts` を編集
2. **マイグレーション SQL を生成**

   \`\`\`bash
   npm run auth-db:generate -- --name <意味のある変更名>
   # 例: npm run auth-db:generate -- --name add_user_role_column
   \`\`\`

   `migrations/<NNNN>_<名前>.sql` と `migrations/meta/` 配下のファイルが追加 / 更新される。

3. **ローカル DB へ適用して動作確認**

   \`\`\`bash
   npx dotenv-cli -e .env.local -- npm run auth-db:migrate
   \`\`\`

4. **生成された全ファイルをコミットして PR を出す**: `migrations/` 配下のファイルは **手動編集禁止**。生成物をそのままコミットする。
5. **PR 検証ワークフロー（`auth-db-migration-validate`）の SQL プレビューコメントをレビューする**: PR コメントに新規 SQL の内容が自動投稿される。意図と一致しない SQL が出ている場合は schema.ts を修正して再 generate する。
6. **`staging` ブランチにマージ** → `auth-db-migration-apply-staging` が自動実行され、`stg-lgtm-cat-auth` に適用される。
7. Vercel Preview で動作確認後、**`main` ブランチへのリリース PR をマージ** → `auth-db-migration-apply-prod` が自動実行され、`prod-lgtm-cat-auth` に適用される。

### よく使うコマンド

\`\`\`bash
# マイグレーション SQL の生成（ローカルでのスキーマ変更後に必須）
npm run auth-db:generate -- --name <name>

# マイグレーションをローカル DB に適用
npx dotenv-cli -e .env.local -- npm run auth-db:migrate

# meta/_journal.json と SQL ファイルの整合性チェック（CI が自動実行）
npm run auth-db:check
\`\`\`

### マイグレーション失敗時の確認手順

#### staging への自動適用が失敗した場合

1. GitHub Actions の `auth-db-migration-apply-staging` ジョブログで失敗箇所と SQL エラーメッセージを確認
2. `stg-lgtm-cat-auth` の現在の状態を確認:

   \`\`\`bash
   npx dotenv-cli -e .env.local.stg -- turso db shell stg-lgtm-cat-auth \
     <<< "SELECT * FROM __drizzle_migrations ORDER BY id;"
   \`\`\`

   > **注**: `.env.local.stg` のような staging 用シェル設定は通常作成しない。確認が必要な場合は K に依頼するか、Turso Dashboard 経由で確認する。
3. 失敗の原因を schema.ts 側で修正し、新しいマイグレーション PR を起票（forward fix）。`migrations/<NNNN>_*.sql` を **手動編集して再 push しない**。

#### prod への自動適用が失敗した場合

prod の自動適用が失敗した時点で、Vercel 側のアプリケーションは「新スキーマ前提のコード × 旧スキーマの DB」状態になり、認証機能が壊れる可能性がある。

1. 即時 GitHub Actions の `auth-db-migration-apply-prod` ジョブログを確認
2. **失敗が一過性のもの（DB 接続瞬断等）の場合**: Actions UI から `Re-run failed jobs` を実行
3. **失敗が SQL レベルの問題の場合**: forward fix の修正 PR を作成し、緊急に `staging` → `main` を辿って適用
4. 致命的なデータ毀損が発生した場合は Turso の **Point-in-Time Recovery (PITR)** を利用（提供条件は契約プランに依存するため、最新の Turso ドキュメント https://docs.turso.tech/ を参照。Turso Dashboard から復旧時刻を指定）

### ロールバック方針: forward fix 原則

本リポジトリでは `drizzle-kit` の `migrate down` 相当の機能を **採用しません**。理由:

- drizzle-kit 自体が `migrate down` を提供しない（Atlas には存在したが、Atlas を採用しない方針）
- Better Auth 4 テーブルのスキーマ変更頻度は低く、down マイグレーションを維持するコストに見合わない
- **問題発生時はロールバックではなく forward fix（修正 SQL を新規マイグレーションとして適用）で対処する**

> どうしても元のスキーマに戻したい場合は、過去マイグレーションを参考にした「逆操作 SQL」を新規マイグレーションとして書き、PR フローに乗せて段階適用する（ただし、まず Vercel 側のコードロールバックで一時凌ぎする方が安全）。

### 認証 DB の Point-in-Time Recovery（PITR）

Turso は Point-in-Time Recovery によるデータ復旧を提供しています。マイグレーションでデータ毀損が発生した場合の最終手段として利用します。

- 操作は Turso Dashboard / `turso db restore` 経由で行います
- 復旧操作は K（リポジトリオーナー）が実施します。実装担当者は症状を Issue / Slack で報告するに留めてください
```

#### 6.9.3 README から削除する既存セクション

§6.1.3 で言及した通り、既存の **86〜147 行目「Atlas CLI のインストール」「Turso CLI のインストール（任意）」セクション全体を削除** する。

> **`Turso CLI のインストール（任意）` セクションの扱い**: §6.9.2 のサンプルにも `turso db shell` 等を使うコマンドが含まれるため、Turso CLI のインストール手順自体は残したい。**§6.9.2 の新セクション末尾に「Turso CLI（任意）」のサブセクションを統合する** か、`認証 DB（Turso）の使い分け` セクション（41〜62 行目）の `turso db create` の補足としてインライン記載する形にする。実装時に既存 README の構造を見て自然な配置を選ぶ。

---

### 6.10 Phase 10: 品質管理

CLAUDE.md「品質管理の実行手順」に従う。

```bash
# 1. フォーマット
npm run format

# 2. lint
npm run lint

# 3. テスト
npm run test

# 4. ビルド（schema.ts 変更によるビルド破壊がないこと）
npm run build
```

#### 6.10.1 期待結果

- `npm run format` がエラーなく完了
- `npm run lint` がパス（schema.ts の Biome/Ultracite 警告が出る場合は §6.2.3 の方針で対処）
- `npm run test` がパス（既存テストへの影響なし）
- `npm run build` がパス（schema.ts は `auth.ts` 経由で間接的に import されるが、本 Issue では `auth.ts` のビルド経路追加なし）

#### 6.10.2 想定エラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `npm run lint` で `useNamingConvention` 警告 | schema.ts のテーブル名 / カラム名が snake_case のため | `// biome-ignore lint/style/useNamingConvention: Better Auth 規約に合わせる` を行頭に付けるか、§6.2.3 の方針で個別対処 |
| `npm run build` でも schema.ts が import されない問題 | 本 Issue では schema.ts のテストや route 追加なし | 想定通り。問題なし |

> **重要**: `npm run build` 時に `auth.ts` / `db.ts` の throw が発火しないことを確認する。`auth.ts` は本 Issue では新規 import 経路を追加しないため、ビルド時には評価されない（#480 で `app/api/auth/[...all]/route.ts` 追加時に注意する）。

---

### 6.11 Phase 11: PR 作成

`create-pr` Skill に従って PR を作成する。

#### 6.11.1 ベースブランチ

`staging`（既定）

#### 6.11.2 タイトル例

```
:sparkles: #483 Better Auth スキーマと drizzle-kit マイグレーション運用を構築
```

#### 6.11.3 本文に含める内容

- 対応 Issue: `Closes #483`
- スコープ（やる / やらないリスト, §1.4）
- 動作確認結果:
  - `npm run auth-db:generate -- --name init_auth_schema` 実行ログ抜粋
  - `npx dotenv-cli -e .env.local -- npm run auth-db:migrate` 実行ログ抜粋
  - `turso db shell` での `.tables` / `.schema user` 出力（DB URL は **マスク**）
- 後続 Issue (#480) への引き継ぎ事項（§12 を参照）
- レビュー時に確認してほしい点:
  - schema.ts の 4 テーブル定義（`onDelete: "cascade"` / インデックス / unique 制約）
  - 生成された `0000_init_auth_schema.sql` の意図と一致性
  - 3 本の GitHub Actions ワークフローの設計（Environment 利用、paths フィルタ、concurrency）
  - PR 検証ワークフローの一時 SQLite ファイル DB 設計
  - schema drift 検出の仕組み

#### 6.11.4 PR 本文での機微情報漏洩防止

- 動作確認ログを貼る際は、**`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` の実値が含まれていないこと** を投稿前に必ず確認
- DB URL は `libsql://local-lgtm-cat-auth-***.turso.io` のようにホスト末尾をマスク
- スクリーンショットを添付する場合も同様。Turso Dashboard / Vercel ダッシュボードでは値表示を **Hide value** で伏せた状態でキャプチャする

---

## 7. テスト方針

### 7.1 ユニットテスト

| ファイル | テスト追加 | 理由 |
|---------|-----------|------|
| `src/lib/better-auth/schema.ts` | 不要 | Drizzle のテーブル定義は外部ライブラリへの宣言的記述。挙動検証は drizzle-kit の自動 SQL 生成と Phase 4 の手動動作確認でカバーされる |
| `src/lib/better-auth/db.ts` | 不要（既存）| 環境変数 throw のロジックは外部ライブラリの責務 |
| `src/lib/better-auth/auth.ts` | 不要（既存）| 同上 |

### 7.2 統合的な動作確認

- **ローカル**: Phase 4（§6.4.2）の `turso db shell` での `.tables` / `.schema` 確認
- **staging**: Phase 7 の自動適用後、Vercel Preview デプロイ（次回 PR 起票時）で `npx dotenv-cli` 不要、Vercel 側の Environment Secret から接続される。本 Issue 自体ではアプリケーション経由の動作確認は対象外（#480 でログイン UI 実装後に検証）
- **prod**: Phase 8 の自動適用後、Turso Dashboard で `prod-lgtm-cat-auth` のテーブル一覧を目視確認

### 7.3 既存テストへの影響

`schema.ts` の変更は既存コードと結合しない（`src/app/` から import される経路はまだ追加されない）ため、既存テストへの影響はない。`npm run test` がパスする事の確認のみで十分。

### 7.4 PR 検証ワークフロー自体のテスト

PR 検証ワークフローの動作は **本 Issue の PR で実際に走らせて確認** する（runner 上の一時 SQLite ファイル DB 適用、SQL プレビュー PR コメント投稿、schema drift 検出）。本 Issue の PR が初回適用となる。

---

## 8. リスクと注意事項

### 8.1 `drizzle-kit migrate` が `dialect: "turso"` 設定下で `file:` URL を受け付けない可能性

PR 検証ワークフローでは `TURSO_DATABASE_URL=file:${RUNNER_TEMP}/auth-pr-validation.db` を渡して runner 上の SQLite ファイルにマイグレーションを適用する設計だが、drizzle-kit 0.31.10 の `dialect: "turso"` で `file:` URL が拒否されるバグがあれば動かない。

- **事前検証（必須）**: Phase 6 の YAML を書く前に、手元で以下を実行して動作確認する。

  ```bash
  TMPDIR_FILE="${TMPDIR:-/tmp}/auth-drizzle-file-check.db"
  rm -f "${TMPDIR_FILE}"
  TURSO_DATABASE_URL="file:${TMPDIR_FILE}" \
  TURSO_AUTH_TOKEN="dummy-token" \
    npx drizzle-kit migrate
  # 期待: マイグレーションがエラーなく完了し、${TMPDIR_FILE} が作成される
  ```

- **動かない場合のフォールバック**: §6.6.5 の `src/scripts/migrate-auth-db.ts` を新設して `drizzle-orm/libsql/migrator` を直接呼ぶ。`drizzle.config.ts` を経由しないため `dialect` の制約を受けない。
- **判断結果は PR 説明欄に記載**: 採用したアプローチ（`drizzle-kit migrate` か フォールバックスクリプトか）と動かなかった場合の症状を記録する

### 8.2 `drizzle-kit generate` の生成 SQL が想定と異なる可能性

Phase 3 の §6.3.3 で示した SQL は **想定形** であり、drizzle-kit 0.31.10 が実際に生成する SQL は細部（クォート位置、`--> statement-breakpoint` の有無、UNIQUE INDEX の自動命名等）が異なる場合がある。

- **対処**: 生成された SQL ファイルを **手動編集してはならない**。意図と一致しない場合は schema.ts 側を修正して再 generate する
- 意図と一致しているかの確認は、レビュアーと PR 検証ワークフローの SQL プレビューコメントで行う

### 8.3 GitHub Environment Secret の到達範囲

- **`pull_request` トリガー**: PR が同一リポジトリ内のブランチからの場合のみ通常の Secret に到達するが、Environment Secret は `environment:` 指定がないと取得できない（**今回は意図的に取得しない**）
- **fork からの PR**: 本リポジトリは `staging` / `main` への直接 push を運用しているため fork PR は想定外。万一 fork から PR が来た場合、`auth-db-migration-validate.yml` の `peter-evans/create-or-update-comment@v4` がコメント書き込みに失敗する可能性がある（`pull-requests: write` 権限が fork PR では制限されるため）。これは fork PR を運用していない現状では問題にしない

### 8.4 `paths` フィルタの抜け穴

- `auth-db-migration-apply-staging.yml` / `auth-db-migration-apply-prod.yml` の `paths` フィルタに該当しない変更が migrations/* と同じ PR に紛れ込んだ場合、適用ジョブがスキップされる事故が起こり得る
- **対策**: 実運用で問題が出た場合は `workflow_dispatch` で手動実行する運用を残す。冪等性が保たれているため再実行で復旧可能

### 8.5 `__drizzle_migrations` テーブルの破損

- 万が一 `__drizzle_migrations` テーブルが手動で書き換わると、drizzle-kit migrate が「適用済み」「未適用」を誤認する
- **対策**: `__drizzle_migrations` を手で触らない。データの整合性が崩れた場合は K に PITR 復旧を依頼する

### 8.6 Better Auth スキーマ要件の将来変更

- 本 Issue で定義する 4 テーブルは Better Auth 1.6.9 の canonical schema に基づく
- Better Auth のメジャーバージョンアップで required column の追加・型変更が起こる場合、追従マイグレーションを別 Issue で起票する
- 現状の方針: `usePlural` / `fields` マッピングを使わないことで、Better Auth デフォルト追従コストを最小化

### 8.7 `unique()` 制約と `accountId + providerId` の組み合わせ

- Better Auth canonical schema では `account` テーブルの `(accountId, providerId)` の組み合わせユニーク性は **明示的にスキーマで強制していない**（Better Auth 内部のロジックで一意性を担保する設計）
- 本 Issue でも複合 UNIQUE 制約は **追加しない**（Better Auth のデフォルトに従う）
- 将来複合ユニークが必要になった場合は別 Issue で対応

### 8.8 `pull_request` の base が `main` のリリース PR への対応

- `git-pr-release` が `staging` → `main` のリリース PR を自動作成する。`auth-db-migration-validate.yml` は `branches: [staging, main]` を指定しているため、リリース PR でも発火する
- リリース PR には feature 由来のマイグレーション SQL ファイルが含まれるため、PR コメントとして SQL プレビューが再投稿される。これは「リリース PR の段階で本番適用される SQL を最終確認する」目的で意図的に有効化している
- ただし、`auth-db-migration-apply-prod.yml` は **PR マージ後の `push to main` で発火** するため、リリース PR の段階では prod に到達しない（安全）

### 8.9 `meta/_journal.json` のマージコンフリクト

- 複数の開発者が同時期にスキーマ変更 PR を出すと、`migrations/meta/_journal.json` の `entries` 配列で merge conflict が起きる
- **解消手順**: コンフリクトしたブランチで `git checkout main -- migrations/` で main の状態に戻し、`npm run auth-db:generate -- --name <自分の変更名>` を再実行する。drizzle-kit が `_journal.json` を再生成し、SQL ファイルの番号を採番し直す
- この運用ノウハウは README §認証 DB のマイグレーション運用 に補足追記する余地がある（後続 Issue 候補）

### 8.10 `drizzle-orm` v1.0 stable リリースとの競合

- 2026-05-08 時点で `drizzle-orm` は `0.45.2` (stable) と並行して `v1.0.0-rc.2`（2026-05-05 リリース）が rc 段階にある
- 本 Issue 着手から PR マージまでの期間中に **v1.0 stable がリリースされても、本 Issue では追従しない**（K 合意済み、§3.1 の方針）
  - drizzle-kit のマイグレーション API も v1.0 で破壊的変更が予告されている
  - 追従するとスコープが膨張し、本 Issue の Done（schema 配置 + drizzle-kit 運用構築）から逸脱する
- **対応**: 本 Issue は `drizzle-orm@0.45.2` / `drizzle-kit@0.31.10` を据え置きで完了させる。v1.0 への移行は **別 Issue を起票** し、移行範囲・互換性・migrations の作り直し方針を別途設計する

---

## 9. 完了確認チェックリスト

実装者は最終的に以下をすべて満たしている事を確認する。

### 9.1 ファイル変更

- [ ] `atlas.hcl` が削除されている
- [ ] `migrations/.gitkeep` が削除されている
- [ ] `src/lib/better-auth/schema.ts` に `user` / `session` / `account` / `verification` の 4 テーブル定義が追加されている（§6.2.1）
- [ ] `migrations/0000_init_auth_schema.sql` がコミットされている
- [ ] `migrations/meta/_journal.json` がコミットされている
- [ ] `migrations/meta/0000_snapshot.json` がコミットされている
- [ ] `package.json` に `auth-db:generate` / `auth-db:migrate` / `auth-db:check` の npm scripts が追加されている
- [ ] `README.md` から Atlas CLI セクション（86〜147 行目相当）が削除されている
- [ ] `README.md` に「認証 DB のマイグレーション運用」セクションが追加されている（drizzle-kit コマンド一覧、失敗時手順、forward fix 方針、PITR 言及）
- [ ] `.github/workflows/auth-db-migration-validate.yml` が新設されている
- [ ] `.github/workflows/auth-db-migration-apply-staging.yml` が新設されている
- [ ] `.github/workflows/auth-db-migration-apply-prod.yml` が新設されている

### 9.2 動作確認

- [ ] `npm run auth-db:generate -- --name init_auth_schema` がエラーなく完了し、想定通りのファイルが生成される
- [ ] `npx dotenv-cli -e .env.local -- npm run auth-db:migrate` がエラーなく完了する
- [ ] `turso db shell local-lgtm-cat-auth` で `.tables` を実行すると `__drizzle_migrations`、`account`、`session`、`user`、`verification` の 5 テーブルが存在する
- [ ] `SELECT * FROM __drizzle_migrations` の結果が 1 行（`0000_init_auth_schema`）
- [ ] 各テーブルの `.schema` 出力が schema.ts の意図と一致している（`onDelete cascade` / `unique` / `index` 含む）

### 9.3 品質管理

- [ ] `npm run format` がエラーなく完了
- [ ] `npm run lint` がパス
- [ ] `npm run test` がパス
- [ ] `npm run build` がエラーなく完了
- [ ] `npm run auth-db:check` がエラーなく完了

### 9.4 PR 作成

- [ ] PR を `create-pr` Skill に従って作成
- [ ] PR タイトルに `#483` が含まれる
- [ ] PR 本文で `Closes #483` で参照
- [ ] PR 本文に動作確認結果と機微情報マスクが反映されている
- [ ] PR 起票時に `auth-db-migration-validate` ワークフローが走り、SQL プレビューが PR コメントとして自動投稿される事を確認

### 9.5 staging / prod 適用後の確認（PR マージ後）

> **担当**: 以下は **PR マージ後の確認項目**であり、実装担当者の作業範囲を超える。実装担当者は PR 説明欄でレビュアー（K）に対し「マージ後に staging / prod 適用ジョブが成功すること」「Turso Dashboard で 4 テーブル作成を目視確認してほしいこと」を明示的に依頼する。

- [ ] `staging` ブランチへのマージ後、`auth-db-migration-apply-staging` が成功する（Actions タブで確認）
- [ ] `main` ブランチへのマージ後、`auth-db-migration-apply-prod` が成功する（Actions タブで確認）
- [ ] Turso Dashboard / `turso db shell` で `stg-lgtm-cat-auth` / `prod-lgtm-cat-auth` 双方に 4 テーブル（`user`, `session`, `account`, `verification`）と `__drizzle_migrations` テーブルが作成されていることを目視確認（K が実施）

---

## 10. PR レビュアー向けの確認ポイント

### 10.1 schema.ts の妥当性

- [ ] テーブル名は単数形（`user`, `session`, `account`, `verification`）
- [ ] TS プロパティは camelCase、DB 物理カラムは snake_case
- [ ] `usePlural` / `fields` マッピングを使っていない（auth.ts も含めて）
- [ ] `session.userId` / `account.userId` に `onDelete: "cascade"` が付与されている
- [ ] `user.email` / `session.token` に `unique()` が付与されている
- [ ] `session_user_id_idx` / `account_user_id_idx` / `verification_identifier_idx` のインデックスが定義されている
- [ ] タイムスタンプは `integer({ mode: "timestamp_ms" })` で定義され、デフォルト値が SQLite 側の `unixepoch('subsecond') * 1000` になっている
- [ ] `emailVerified` は `mode: "boolean"` で `default(false)`

### 10.2 drizzle-kit 生成物の妥当性

- [ ] `migrations/0000_init_auth_schema.sql` が schema.ts の意図と一致（CREATE TABLE / FOREIGN KEY / UNIQUE INDEX / INDEX）
- [ ] `migrations/meta/_journal.json` の `entries[0].tag` が `0000_init_auth_schema`
- [ ] 手動編集の痕跡がない（drizzle-kit が出した生のファイルがそのままコミットされている）

### 10.3 GitHub Actions ワークフローの妥当性

- [ ] `auth-db-migration-validate.yml`:
  - [ ] `pull_request` トリガー、対象 base ブランチが `staging` / `main` のみ
  - [ ] `paths` フィルタが schema.ts / migrations / drizzle.config.ts / package(-lock).json / 自身
  - [ ] `permissions` が `contents: read` + `pull-requests: write` のみ
  - [ ] `npm run auth-db:check` で整合性確認
  - [ ] `npm run auth-db:generate -- --name __drift_check__` + `git status --porcelain` で drift 検出
  - [ ] runner 上の `${{ runner.temp }}/auth-pr-validation.db` への適用
  - [ ] 新規追加 SQL を `<details>` 折りたたみで PR コメント投稿（`peter-evans/create-or-update-comment@v4`）
  - [ ] **TURSO の Secret を一切渡していない**
- [ ] `auth-db-migration-apply-staging.yml`:
  - [ ] `push` to `staging` トリガー + `workflow_dispatch`
  - [ ] `environment: staging` 指定（小文字）
  - [ ] `concurrency.cancel-in-progress: false`
  - [ ] `TURSO_STG_DATABASE_URL` / `TURSO_STG_AUTH_TOKEN` を Environment Secret から取得
- [ ] `auth-db-migration-apply-prod.yml`:
  - [ ] `push` to `main` トリガー + `workflow_dispatch`
  - [ ] `environment: Production` 指定（**大文字 P**）
  - [ ] `concurrency.cancel-in-progress: false`
  - [ ] `TURSO_PROD_DATABASE_URL` / `TURSO_PROD_AUTH_TOKEN` を Environment Secret から取得

### 10.4 README の妥当性

- [ ] Atlas CLI セクションが完全に削除されている
- [ ] 「認証 DB のマイグレーション運用」セクションが追加されている
- [ ] 通常運用フロー、コマンド一覧、失敗時の確認手順、forward fix 方針、PITR 言及が含まれている

### 10.5 セキュリティ

- [ ] `.env.local` の中身を PR / コメント / ログに直接表示していない
- [ ] PR 検証ワークフローで TURSO の Secret が誤って渡されていない
- [ ] `auth-db-migration-apply-prod.yml` のコメントで「`.env.local` に `TURSO_PROD_*` を絶対書かない」方針が明示されている（あるいは README で言及されている）

---

## 11. 設定ファイル参照早見表

レビュー / 実装時に参照するファイルと、それぞれの定義箇所をまとめる。各ファイルの完全な内容は §6 の該当セクションを参照する事。

| ファイル | 定義セクション | 用途 |
|---------|-----------------|------|
| `src/lib/better-auth/schema.ts` | §6.2.1 | Drizzle スキーマ（4 テーブル定義） |
| `migrations/0000_init_auth_schema.sql` | §6.3.3（想定形） | drizzle-kit generate の出力。手動編集禁止 |
| `migrations/meta/_journal.json` | §6.3.4（想定形） | drizzle-kit が管理するマイグレーション順序ジャーナル |
| `package.json` の `scripts` 追記 | §6.5.1 | `auth-db:*` の 3 スクリプト |
| `.github/workflows/auth-db-migration-validate.yml` | §6.6.2 | PR 検証ワークフロー |
| `.github/workflows/auth-db-migration-apply-staging.yml` | §6.7.2 | staging 自動適用 |
| `.github/workflows/auth-db-migration-apply-prod.yml` | §6.8.2 | prod 自動適用 |
| `README.md` 追記内容 | §6.9.2 | 認証 DB のマイグレーション運用ドキュメント |

---

## 12. 後続 Issue への引き継ぎ事項

### Issue #480（GitHub OAuth ログイン実装）

- 4 テーブルが local / staging / prod の全環境で作成されているため、`auth.ts` に `socialProviders.github` を追加すれば DB 側の準備は完了
- `app/api/auth/[...all]/route.ts` を追加する際、ビルド時に `auth.ts` がトップレベル import されないように注意（`auth.ts` は import 時点で BETTER_AUTH_SECRET / BETTER_AUTH_URL を throw する）
- Server Action から `auth.api.*` を呼ぶ際のテストモック方針: `vi.mock("@/lib/better-auth/auth")` でモック化（`auth.ts` がモジュール読込時に throw する設計のため）
- スキーマに変更が必要な場合（プラグイン用テーブル追加等）は、本 Issue で確立したフロー（`npm run auth-db:generate -- --name <name>` → PR → 自動適用）に乗せる

### バックエンド準備後の別 Issue

- Better Auth JWT プラグインの有効化
- フロントエンドからの JWT 送信処理
- lgtm-cat-api 側での JWT 検証実装と連携テスト
- 認証 DB のユーザー ID と lgtm-cat-api 側のユーザー ID の紐付け方針の確定

### 運用面で別途検討する事項

- staging / prod 適用ワークフローの完了通知（Slack 連携等）
- マイグレーション適用前の事前バックアップ自動化（Turso PITR は秒単位の復旧が可能だが、明示的なスナップショットが欲しい運用ニーズが出た場合）
- 複数開発者が同時にスキーマ変更を行う際のコンフリクト解消ガイド（`migrations/meta/_journal.json` のマージは drizzle-kit が再 generate で解消する想定だが、運用ノウハウを README に追記する余地あり）
