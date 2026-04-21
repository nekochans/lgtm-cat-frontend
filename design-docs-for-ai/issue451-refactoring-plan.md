# Issue #451 — AI向けルール変更に伴う既存コードのリファクタリング実装計画

## 概要

[PR #462](https://github.com/nekochans/lgtm-cat-frontend/pull/462) で AI 向けルール（ディレクトリ構成・レイヤー依存関係・コーディング規約）を厳密化した。本計画では、更新後のルールに合わせて既存コードをリファクタリングする。

## Done の定義（Issue #451 より）

- [ ] 各ルールの変更に合わせて既存のディレクトリ構成がリファクタリングされている事

**注意:** Done 定義の「もう効果がないルールが削除されている事」は、CLAUDE.md 等の全面的な書き換え（スキルへの移動やドキュメント分割等）を指しており、本計画の対象外。別途対応する。

## 調査結果サマリ

### 違反一覧

| # | カテゴリ | 違反内容 | 影響ファイル数 |
|---|---------|---------|---------------|
| 1 | features ルート直下の共有ファイル | `language.ts`, `url.ts`, `meta-tag.ts`, `open-graph-locale.ts`, `link-attribute.ts`, `load-markdown.ts` が features 直下に存在 | 6 ファイル + 利用側 76 以上 |
| 2 | feature 内ルート直下のファイル | `main/service-description-text.ts`, `errors/error-i18n.ts` が functions/ に配置されていない | 2 ファイル |
| 3 | 非標準サブディレクトリ | `oidc/errors/`（TypeScript ファイルを含む非標準ディレクトリ） | 1 ディレクトリ |
| 4 | feature 間の依存違反 | upload→main, upload→privacy, docs→main, main→oidc, errors→features ルート | 15 以上の import |
| 5 | lib/ → features/ 依存違反 | `lib/cloudflare/r2/` → `features/upload/`, `lib/cognito/` → `features/oidc/`, `lib/vercel/` → `features/url` | 3 ファイル |
| 5b | components/ → features/ レイヤー違反 | `footer.tsx` → privacy/terms/external-transmission-policy、`header-desktop.tsx` → docs/functions (3関数) | 6 つの import |
| 6 | テストファイル配置違反 | features/__tests__/ 直下 (4), docs/__tests__/ (2), upload/__tests__/ (1) | 7 テストファイル |
| 7 | ヘッダーコメント欠落 | `main/functions/api-url.ts`, `lib/upstash/constants.ts` | 2 ファイル |
| 8 | 欠落ドキュメント | `src/components/AGENTS.md` が CLAUDE.md から参照されているが存在しない | 1 ファイル |

---

## ステップ 1: 共通レイヤーの整備（`src/types/`, `src/functions/`, `src/constants/` への移動）

**目的:** `src/features/` 直下の共有ファイルと、feature 間で共有されているモジュールを共通レイヤーに移動し、feature 間の依存を解消する。

### 1-1. `src/types/` に型定義を移動

#### 1-1-a. OIDC アクセストークン型 → `src/types/oidc/access-token.ts`

**移動元:** `src/features/oidc/types/access-token.ts`
**移動先:** `src/types/oidc/access-token.ts`
**理由:** `JwtAccessTokenString` 型と `createJwtAccessTokenString` は main feature と lib/cognito の両方から利用されており、共通型として `src/types/` に属すべき。

**import 修正対象（6 箇所）:**
- `src/lib/cognito/oidc.ts` — `@/features/oidc/types/access-token` → `@/types/oidc/access-token`
- `src/features/main/types/lgtm-image.ts` — 同上
- `src/features/main/functions/fetch-lgtm-images.ts` — 同上
- `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts` — 同上
- `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts` — 同上

#### 1-1-b. OIDC エラークラス → `src/types/oidc/issue-client-credentials-access-token-error.ts`

**移動元:** `src/features/oidc/errors/issue-client-credentials-access-token-error.ts`
**移動先:** `src/types/oidc/issue-client-credentials-access-token-error.ts`
**理由:** カスタムエラークラスは型定義の一種であり、`src/lib/cognito/oidc.ts` から利用されているため共通レイヤーに属すべき。`src/features/oidc/` には `errors/` という非標準サブディレクトリがあるため、この移動で解消。

**import 修正対象（1 箇所）:**
- `src/lib/cognito/oidc.ts` — `@/features/oidc/errors/...` → `@/types/oidc/...`

#### 1-1-c. ストレージ型 → `src/types/upload/storage.ts`

**移動元:** `src/features/upload/types/storage.ts`
**移動先:** `src/types/upload/storage.ts`
**理由:** `StorageError`, `GeneratePresignedPutUrl`, `GeneratePresignedGetUrl`, `UploadToStorageFunc` などの型が `src/lib/cloudflare/r2/presigned-url.ts` から参照されている。`src/CLAUDE.md` のルールで示された「`src/types/` に抽象的なインターフェース型を定義し、`src/lib/` 側でその型に準拠する実装を提供する」パターンそのもの。

**import 修正対象（3 箇所）:**
- `src/lib/cloudflare/r2/presigned-url.ts` — `@/features/upload/types/storage` → `@/types/upload/storage`
- `src/lib/cloudflare/r2/upload-to-r2.ts` — 同上

**追加修正:** `src/features/upload/types/upload.ts` に以下の re-export 行がある:
```typescript
export type { UploadToStorageFunc, UploadToStorageResult } from "./storage";
```
この相対パスを `@/types/upload/storage` に更新する:
```typescript
export type { UploadToStorageFunc, UploadToStorageResult } from "@/types/upload/storage";
```

**注意:** `src/features/upload/types/` に残る他のファイル（`api-response.ts`, `upload.ts`）は upload feature 固有の型であるためそのまま残す。

#### 1-1-d. LGTM 画像型 → `src/types/lgtm-image.ts`

**移動元:** `src/features/main/types/lgtm-image.ts`
**移動先:** `src/types/lgtm-image.ts`
**理由:** `LgtmImageUrl`, `LgtmImage`, `FetchLgtmImages` 等は main と upload の両方から 22 ファイル以上で参照されており、明らかに共通型。

**import 修正対象（22 箇所以上）:** `@/features/main/types/lgtm-image` → `@/types/lgtm-image` に一括置換。

**注意:** 移動先ファイルでの import パスも修正が必要:
- `@/features/oidc/types/access-token` → `@/types/oidc/access-token` （ステップ 1-1-a で移動済みのパスに更新）

#### 1-1-e. URL 関連 → `src/types/url.ts` + `src/constants/url.ts` + `src/functions/url.ts` に3分割

**移動元:** `src/features/url.ts`

**分割方針:** 1 ファイルに型・定数・関数が混在しているため、レイヤールールに従い 3 ファイルに分割。依存方向は `constants/ ← types/ ← functions/` となる。

**循環参照の回避方針:** 現状 `url.ts` と `language.ts` は相互参照している（`url.ts` が `Language` を参照し、`language.ts` が `IncludeLanguageAppPath` を参照）。types 層で循環させないため、以下の依存方向に統一する:

- `types/language.ts` は **基底型**（他の types に依存しない、constants/language のみに依存）
- `types/url.ts` は `types/language.ts` に依存可能（`Language` 型を import）
- `types/url.ts` で `IncludeLanguageAppPath` を定義
- `functions/language.ts` が `IncludeLanguageAppPath` を使う場合は `types/url.ts` から import（functions → types の依存は許可されている）

これにより types 層の依存は一方向（`language → url` ではなく `url → language`）となり、循環参照は発生しない。

**`src/constants/url.ts` に含めるもの:**
```typescript
// 純粋な定数のみ（他レイヤーに依存しない）
export const appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  // ...
} as const;
```

**`src/types/url.ts` に含めるもの:**
```typescript
// 型定義のみ（constants, types/language に依存可能）
import { appPathList } from "@/constants/url";
import type { Language } from "@/types/language";

export type Url = `http://localhost${string}` | `https://${string}`;
export type AppPathName = keyof typeof appPathList;
export type IncludeLanguageAppPath = /* Language を使って定義 */;
export type AppUrl = /* ... */;
export type I18nUrlList = /* ... */;
```

**`src/functions/url.ts` に含めるもの（純粋関数のみ）:**
```typescript
// 純粋関数（types, constants に依存可能。lib には非依存）
import type { Url, AppPathName, IncludeLanguageAppPath } from "@/types/url";
import { appPathList } from "@/constants/url";

export function isUrl(value: unknown): value is Url { /* ... */ }
export function isIncludeLanguageAppPath(value: unknown): value is IncludeLanguageAppPath { /* ... */ }
export function createIncludeLanguageAppPath(appPathName: AppPathName, language: Language): IncludeLanguageAppPath { /* ... */ }
// createI18nUrl は appBaseUrl に依存するため lib に配置（下記参照）
```

**`createI18nUrl` は `src/lib/config/app-base-url.ts` に配置:**
`createI18nUrl()` は内部で `appBaseUrl()` を呼び出しており、環境変数に依存する。`src/functions/` の純粋関数要件を満たさないため、`appBaseUrl()`, `appUrlList`, `i18nUrlList` と共に `src/lib/config/app-base-url.ts` に配置する。

**環境変数に依存する関数は `src/lib/` に配置:**
`appBaseUrl()` は `process.env` を読む構成値アクセサであり、純粋関数ではない。`src/functions/` の責務（原則として純粋関数）に合わないため `src/lib/config/app-base-url.ts` に配置する。`appUrlList`, `i18nUrlList` 等の `appBaseUrl()` に依存する算出値も同様に `src/lib/` に配置する。

**import 修正対象（76 箇所以上）:** `@/features/url` を以下に分割:
- `type Url` 等の型 import → `@/types/url`
- `appPathList` → `@/constants/url`
- `isUrl()`, `isIncludeLanguageAppPath()`, `createIncludeLanguageAppPath()` → `@/functions/url`
- `appBaseUrl()`, `appUrlList`, `i18nUrlList`, `createI18nUrl()` → `@/lib/config/app-base-url`
- 型と関数を同時に使う場合は複数行の import に分ける

#### 1-1-f. Language 関連 → `src/constants/language.ts` + `src/types/language.ts` + `src/functions/language.ts` に3分割

**移動元:** `src/features/language.ts`

**分割方針:** URL と同様に 3 ファイルに分割。依存方向は `constants/ ← types/ ← functions/` となる。

**`src/constants/language.ts` に含めるもの:**
```typescript
// 言語一覧の定数（他レイヤーに依存しない）
export const languages = ["en", "ja"] as const;
```

**`src/types/language.ts` に含めるもの:**
```typescript
// Language 型の導出（constants に依存可能）
import { languages } from "@/constants/language";

export type Language = (typeof languages)[number]; // "en" | "ja"
```

**`src/functions/language.ts` に含めるもの:**
```typescript
// 関数（types, constants に依存可能）
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

export function removeLanguageFromAppPath(appPath: IncludeLanguageAppPath): IncludeLanguageAppPath { /* ... */ }
export function isLanguage(value: unknown): value is Language { /* ... */ }
export function mightExtractLanguageFromAppPath(appPath: IncludeLanguageAppPath): Language | null { /* ... */ }
```

**import 修正対象（72 箇所以上）:** `@/features/language` を以下に分割:
- `type Language` → `@/types/language`
- `languages` 定数 → `@/constants/language`
- `isLanguage()`, `removeLanguageFromAppPath()` 等 → `@/functions/language`

**注意:** 多くのファイルは `Language` 型のみを import しているため、`@/types/language` への書き換えで済む。関数を使うファイルはさらに `@/functions/language` からの import を追加する。

#### 1-1-g. LinkAttribute 型 → `src/types/link-attribute.ts`

**移動元:** `src/features/link-attribute.ts`
**移動先:** `src/types/link-attribute.ts`
**理由:** 純粋な interface 定義で 8 ファイルから利用されている。

**import 修正対象（8 箇所）:** `@/features/link-attribute` → `@/types/link-attribute`

#### 1-1-h. OpenGraphLocale 型 → `src/types/open-graph-locale.ts`

**移動元:** `src/features/open-graph-locale.ts`
**移動先:** `src/types/open-graph-locale.ts`（型定義）と `src/functions/open-graph-locale.ts`（変換関数）

**`src/types/open-graph-locale.ts` に含めるもの:**
- `type OpenGraphLocale`

**`src/functions/open-graph-locale.ts` に含めるもの:**
- `convertLanguageToOpenGraphLocale()` 関数

**import 修正対象（25 箇所以上）:** `@/features/open-graph-locale` → 型は `@/types/open-graph-locale`、関数は `@/functions/open-graph-locale`

### 1-2. `src/functions/` にビジネスロジックを移動

#### 1-2-a. MetaTag 関数 → `src/functions/meta-tag.ts`

**移動元:** `src/features/meta-tag.ts`
**移動先:** `src/functions/meta-tag.ts`
**理由:** 26 ファイルから利用される共有ビジネスロジック。`MetaTag` interface と `MetaTagList` 型は `src/types/meta-tag.ts` へ。

**`src/types/meta-tag.ts` に含めるもの:**
- `interface MetaTag`
- `type MetaTagList`

**`src/functions/meta-tag.ts` に含めるもの:**
- `appName` 定数
- すべての `*title()` 関数
- `description()` 関数
- `metaTagList()` 関数
- `notFoundMetaTag()` 関数
- `errorMetaTag()` 関数

**`src/functions/` → `src/lib/` 逆依存の回避:** 現在の `meta-tag.ts` は `appUrlList` (環境変数依存) を参照している。`src/functions/` は `src/lib/` に依存できないため、`appBaseUrl` を引数として呼び出し側から注入する形にリファクタリングする。

```typescript
// Before: functions 内で直接 appUrlList を参照（lib に依存してしまう）
export function metaTagList(language: Language): MetaTagList { ... }

// After: appBaseUrl を引数で受け取る（純粋関数を維持）
export function metaTagList(language: Language, appBaseUrl: Url): MetaTagList { ... }
```

**呼び出し側の更新が必要な箇所:**
呼び出し側で `appBaseUrl()` を import し引数に渡す形に更新する。主な対象:
- `src/app/(default)/layout.tsx` 等のレイアウトファイル（`metaTagList()` の呼び出し）
- 各 `page.tsx`（`metaTagList()` の呼び出し）
- `src/app/not-found.tsx`（`notFoundMetaTag()` の呼び出し）
- `src/app/(default)/error.tsx`（`errorMetaTag()` の呼び出し）

**import 修正対象（26 箇所以上）:** `@/features/meta-tag` → 型は `@/types/meta-tag`、関数は `@/functions/meta-tag`

#### 1-2-b. API URL 関数 → `src/lib/config/api-url.ts`

**移動元:** `src/features/main/functions/api-url.ts`
**移動先:** `src/lib/config/api-url.ts`
**理由:** upload feature からも利用されており feature 間依存の原因。ただし `lgtmeowApiUrl()`, `fetchLgtmImagesInRandomUrl()`, `fetchLgtmImagesInRecentlyCreatedUrl()` はいずれも `process.env` を読む構成値アクセサであり、`src/functions/` の責務（原則として純粋関数）に合わない。外部ライブラリ（環境変数アクセス）に依存した処理を扱う `src/lib/` が適切。

**import 修正対象（12 箇所以上）:** `@/features/main/functions/api-url` → `@/lib/config/api-url`

**注意:** 移動先で `@/features/url` への import を `@/types/url` と `@/functions/url` に更新する必要あり（ステップ 1-1-e で移動済み）。ヘッダーコメントも追加すること。

#### 1-2-c. LGTM Markdown 生成 → `src/functions/generate-lgtm-markdown.ts`

**移動元:** `src/features/main/functions/generate-lgtm-markdown.ts`
**移動先:** `src/functions/generate-lgtm-markdown.ts`
**理由:** upload feature (`upload-success.tsx`) と main feature の両方から利用されている。

**`src/functions/` → `src/lib/` 逆依存の回避:** 現在の `generate-lgtm-markdown.ts` は `appBaseUrl()` を直接呼び出している。`src/functions/` は `src/lib/` に依存できないため、`appBaseUrl` を引数として受け取る形にリファクタリングする。

```typescript
// Before: functions 内で直接 appBaseUrl() を呼び出し
export function generateLgtmMarkdown(imageUrl: LgtmImageUrl): string { ... }

// After: appBaseUrl を引数で受け取る（純粋関数を維持）
export function generateLgtmMarkdown(imageUrl: LgtmImageUrl, appBaseUrl: Url): string { ... }
```

**呼び出し側の更新が必要な箇所:**
呼び出し側で `appBaseUrl()` を import し引数に渡す形に更新する。主な対象:
- `src/features/upload/components/upload-success.tsx`
- `src/features/main/components/lgtm-image.tsx`
- `src/features/main/actions/copy-random-cat-action.ts`
- 関連テストファイル（テスト内でのモック値渡し追加）

**import 修正対象（8 箇所以上）:** `@/features/main/functions/generate-lgtm-markdown` → `@/functions/generate-lgtm-markdown`

### 1-3. `src/constants/` に定数を移動

#### 1-3-a. キャッシュタグ → `src/constants/cache-tags.ts`

**移動元:** `src/features/main/constants/cache-tags.ts`
**移動先:** `src/constants/cache-tags.ts`
**理由:** upload feature (`validate-and-create-lgtm-image-action.ts`) からも参照されており、共通定数。

**import 修正対象（9 箇所以上）:** `@/features/main/constants/cache-tags` → `@/constants/cache-tags`

---

## ステップ 2: feature 内ファイルの正しい配置

### 2-1. feature ルート直下のファイルを functions/ に移動

#### 2-1-a. `src/features/main/service-description-text.ts` → `src/functions/service-description-text.ts`

**理由:** 関数を含むファイルが feature ルート直下にある。さらに `docs` feature からも利用されており feature 間依存が発生しているため、共通レイヤー `src/functions/` に直接移動する（ステップ 3-2 と統合）。

**import 修正対象（3 箇所）:**
- `src/features/main/components/home-action-buttons.tsx` — `@/features/main/service-description-text` → `@/functions/service-description-text`
- `src/features/main/components/service-description.tsx` — 同上
- `src/features/docs/functions/how-to-use-text.ts` — 同上

#### 2-1-b. `src/features/errors/error-i18n.ts` → `src/features/errors/functions/error-i18n.ts`

**理由:** 関数を含むファイルが feature ルート直下にある。この関数は errors feature 内の 3 コンポーネントからのみ利用されており、feature 固有のコードであるため `functions/` サブディレクトリに移動する。

**import 修正対象（3 箇所）:**
- `src/features/errors/components/error-page.tsx` — `@/features/errors/error-i18n` → `@/features/errors/functions/error-i18n`
- `src/features/errors/components/not-found-page.tsx` — 同上
- `src/features/errors/components/maintenance-page.tsx` — 同上

---

## ステップ 3: feature 間依存の解消

### 3-1. ナビゲーションリンク生成関数の共通化（components/ → features/ レイヤー違反の解消）

**問題:** `src/components/footer.tsx` と `src/components/header-desktop.tsx` が複数の feature の functions を import している。`src/components/` は `src/features/` に依存できないため、レイヤー違反。

**対象関数と移動先:**

| 移動元 | 移動先 | 利用元 |
|--------|--------|--------|
| `src/features/privacy/functions/privacy-policy.ts` | `src/functions/privacy-policy.ts` | footer.tsx, upload-notes.tsx |
| `src/features/terms/functions/terms-of-use.ts` | `src/functions/terms-of-use.ts` | footer.tsx |
| `src/features/external-transmission-policy/functions/external-transmission-policy.ts` | `src/functions/external-transmission-policy.ts` | footer.tsx |
| `src/features/docs/functions/github-app.ts` | `src/functions/github-app.ts` | header-desktop.tsx |
| `src/features/docs/functions/how-to-use.ts` | `src/functions/how-to-use.ts` | header-desktop.tsx |
| `src/features/docs/functions/mcp.ts` | `src/functions/mcp.ts` | header-desktop.tsx |

**import 修正対象:**
- `src/components/footer.tsx` — 3 つの import パスを `@/functions/` に更新
- `src/components/header-desktop.tsx` — 3 つの import パスを `@/functions/` に更新
- `src/features/upload/components/upload-notes.tsx` — `@/features/privacy/...` → `@/functions/privacy-policy`

**移動後の各 feature ディレクトリ影響:**
- `src/features/privacy/functions/` — 空になるため削除（ステップ 9 で対応）
- `src/features/terms/functions/` — 空になるため削除
- `src/features/external-transmission-policy/functions/` — 空になるため削除
- `src/features/docs/functions/` — `how-to-use-text.ts`, `mcp-text.ts`, `github-app-text.ts`, `mcp-code-loader.ts` が残るため削除しない

**注意:** 移動した各ファイルの内部 import も更新が必要（`@/features/language` → `@/types/language` 等、ステップ 1 で移動済みのパスに合わせる）。

### 3-2. docs → main 依存の解消

**問題:** `src/features/docs/functions/how-to-use-text.ts` が `@/features/main/service-description-text` の `getActionButtonText()` を import。

**解決策:** ステップ 2-1-a で `service-description-text.ts` を `src/functions/` に移動済みのため、この依存は自動的に解消される。docs feature は共通レイヤー `src/functions/` からの import となり、ルール違反ではなくなる。

### 3-3. main → oidc 依存の解消

**問題:** `src/features/main/types/lgtm-image.ts` と `src/features/main/functions/fetch-lgtm-images.ts` が `@/features/oidc/types/access-token` を import。

**解決策:** ステップ 1-1-a で `JwtAccessTokenString` を `src/types/oidc/access-token.ts` に移動済みのため、import パスの更新のみで解消。

### 3-4. upload → main 依存の解消

**問題（全て）:**
- `validate-cat-image.ts` → `@/features/main/functions/api-url`（`lgtmeowApiUrl`）
- `create-lgtm-image.ts` → `@/features/main/functions/api-url`（`lgtmeowApiUrl`）
- `validate-and-create-lgtm-image-action.ts` → `@/features/main/constants/cache-tags`, `@/features/main/types/lgtm-image`
- `upload-success.tsx` → `@/features/main/types/lgtm-image`, `@/features/main/functions/generate-lgtm-markdown`
- `upload-form.tsx` → `@/features/main/types/lgtm-image`
- 他複数のコンポーネント・ストーリー・テストファイル

**解決策:** ステップ 1 で以下が全て共通レイヤーに移動済み:
- `api-url.ts` → `src/lib/config/api-url.ts`（ステップ 1-2-b）
- `cache-tags.ts` → `src/constants/cache-tags.ts`（ステップ 1-3-a）
- `lgtm-image.ts` 型 → `src/types/lgtm-image.ts`（ステップ 1-1-d）
- `generate-lgtm-markdown.ts` → `src/functions/generate-lgtm-markdown.ts`（ステップ 1-2-c）

残りの import パス修正のみ。

---

## ステップ 4: lib/ → features/ 依存の解消

ステップ 1 の移動により自動的に解消:
- `src/lib/cloudflare/r2/presigned-url.ts` — ステップ 1-1-c で `src/types/upload/storage.ts` に移動済み
- `src/lib/cognito/oidc.ts` — ステップ 1-1-a, 1-1-b で `src/types/oidc/` に移動済み
- `src/lib/vercel/edge-functions/url.ts` — 2 箇所の import 更新が必要:
  - `isUrl` → `@/functions/url`（ステップ 1-1-e）
  - `appBaseUrl` → `@/lib/config/app-base-url`（ステップ 1-1-e の lib 部分）

---

## ステップ 5: `src/features/` ルート直下の共有ファイルの移動と空 feature の削除

### 5-1. `src/features/oidc/` ディレクトリの削除

ステップ 1-1-a, 1-1-b で `types/` と `errors/` を `src/types/oidc/` に移動した後、`src/features/oidc/` は空になるため削除。

### 5-2. `src/features/load-markdown.ts` の責務分離と移動

**移動元:** `src/features/load-markdown.ts`

**問題:** 現在の `loadMarkdown` は `"use cache"`, `cacheLife()`, `notFound()`, `readFile` が混在している。`src/AGENTS.md` のルールでは `"use cache"` は `src/actions/` or `src/app/` で制御すべきであり、`notFound()` も App Router のページ遷移制御であるため `lib` に持ち込むべきではない。

**解決策: 2 ファイルに分離**

**`src/lib/markdown/read-markdown-file.ts`（ファイル読み込みのみ）:**
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Language } from "@/types/language";

type DocType = "terms" | "privacy" | "external-transmission";

export async function readMarkdownFile(
  docType: DocType,
  language: Language
): Promise<string | null> {
  const docTypeToDir: Record<DocType, string> = {
    terms: "terms",
    privacy: "privacy",
    "external-transmission": "external-transmission-policy",
  };
  const dirName = docTypeToDir[docType];
  const fileName = language === "en" ? `${docType}.en.md` : `${docType}.ja.md`;
  const filePath = join(process.cwd(), "src", "features", dirName, "markdown", fileName);

  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
```

**各 `page.tsx` 側でキャッシュと 404 を制御:**
```typescript
// src/app/(default)/terms/page.tsx 等
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { readMarkdownFile } from "@/lib/markdown/read-markdown-file";

async function loadMarkdown(docType, language) {
  "use cache";
  cacheLife({ stale: 2_592_000, revalidate: 2_592_000, expire: 31_536_000 });
  const content = await readMarkdownFile(docType, language);
  if (!content) notFound();
  return content;
}
```

**注意:** `"use cache"` と `notFound()` の責務は呼び出し側（`src/app/`）に残す。各 page.tsx に同じラッパーを書く重複が発生するが、6 ファイルのみであり共通化の必要性は低い。将来的に共通化する場合は `src/actions/` にラッパーを配置する。

**import 修正対象（6 箇所）:** `@/features/load-markdown` → `@/lib/markdown/read-markdown-file`
- `src/app/(default)/terms/page.tsx`
- `src/app/(default)/privacy/page.tsx`
- `src/app/(default)/external-transmission-policy/page.tsx`
- `src/app/(default)/en/terms/page.tsx`
- `src/app/(default)/en/privacy/page.tsx`
- `src/app/(default)/en/external-transmission-policy/page.tsx`

**注意:** `markdown/` ディレクトリ（`src/features/privacy/markdown/` 等）や `code-examples/` ディレクトリ（`src/features/docs/code-examples/`）は、各 feature 内でのみ使用される静的コンテンツであり、`.ts` ファイルではないためそのまま残す。

---

## ステップ 6: テストファイルの正しい配置

### 6-1. features ルート直下のテストを移動

**現在の配置 → 正しい配置:**

| 現在 | 移動先 |
|------|--------|
| `src/features/__tests__/language/might-extract-language-from-app-path.test.ts` | `src/functions/__tests__/language/might-extract-language-from-app-path.test.ts` |
| `src/features/__tests__/language/remove-language-from-app-path.test.ts` | `src/functions/__tests__/language/remove-language-from-app-path.test.ts` |
| `src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts` | `src/functions/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts` |
| `src/features/__tests__/url/is-include-language-app-path.test.ts` | `src/functions/__tests__/url/is-include-language-app-path.test.ts` |

**修正事項:**
- import パスを更新（テスト対象ファイルが `src/functions/` に移動済みのため）
- `describe` ブロックのファイルパス表記を更新（例: `"src/features/language.ts ..."` → `"src/functions/language.ts ..."`）
- 移動後に `src/features/__tests__/` ディレクトリが空になったら削除

### 6-2. docs feature のテストを正しい位置に移動

| 現在 | 移動先 |
|------|--------|
| `src/features/docs/__tests__/functions/how-to-use-text.test.ts` | `src/features/docs/functions/__tests__/how-to-use-text/how-to-use-text.test.ts` |
| `src/features/docs/__tests__/functions/mcp-text.test.ts` | `src/features/docs/functions/__tests__/mcp-text/mcp-text.test.ts` |

**修正事項:**
- import パスの相対パスを更新
- `describe` ブロックのパス表記は変更不要（テスト対象のソースパスが変わらないため）
- 移動後に `src/features/docs/__tests__/` ディレクトリが空になったら削除

### 6-3. upload feature のテストを正しい位置に移動

| 現在 | 移動先 |
|------|--------|
| `src/features/upload/__tests__/upload-validator.test.ts` | `src/features/upload/functions/__tests__/upload-validator/upload-validator.test.ts` |

**修正事項:**
- import パスの相対パスを更新
- `describe` ブロックのパス表記は変更不要
- 移動後に `src/features/upload/__tests__/` ディレクトリが空になったら削除

### 6-4. `src/functions/` に移動した関数のテスト追加

`src/AGENTS.md` のルールで `src/functions/` の関数にはテストが必須。以下の関数は現状テストが存在しないため、新規にテストを作成する。

**テスト追加が必要な対象:**

| 移動先ファイル | 関数 | テスト配置先 |
|---------------|------|-------------|
| `src/functions/meta-tag.ts` | `metaTagList()`, `notFoundMetaTag()`, `errorMetaTag()` 等 | `src/functions/__tests__/meta-tag/meta-tag.test.ts` |
| `src/functions/service-description-text.ts` | `getServiceDescriptionText()`, `getActionButtonText()` | `src/functions/__tests__/service-description-text/service-description-text.test.ts` |
| `src/functions/privacy-policy.ts` | `createPrivacyPolicyLinksFromLanguages()` | `src/functions/__tests__/privacy-policy/privacy-policy.test.ts` |
| `src/functions/terms-of-use.ts` | `createTermsOfUseLinksFromLanguages()` | `src/functions/__tests__/terms-of-use/terms-of-use.test.ts` |
| `src/functions/external-transmission-policy.ts` | `createExternalTransmissionPolicyLinksFromLanguages()` | `src/functions/__tests__/external-transmission-policy/external-transmission-policy.test.ts` |
| `src/functions/github-app.ts` | `createGitHubAppLinksFromLanguages()` | `src/functions/__tests__/github-app/github-app.test.ts` |
| `src/functions/how-to-use.ts` | `createHowToUseLinksFromLanguages()` | `src/functions/__tests__/how-to-use/how-to-use.test.ts` |
| `src/functions/mcp.ts` | `createMcpLinksFromLanguages()` | `src/functions/__tests__/mcp/mcp.test.ts` |
| `src/lib/markdown/read-markdown-file.ts` | `readMarkdownFile()` | `src/lib/markdown/__tests__/read-markdown-file/read-markdown-file.test.ts` |
| `src/lib/config/app-base-url.ts` | `appBaseUrl()` | `src/lib/config/__tests__/app-base-url/app-base-url.test.ts` |
| `src/lib/config/api-url.ts` | `lgtmeowApiUrl()`, `fetchLgtmImagesInRandomUrl()`, `fetchLgtmImagesInRecentlyCreatedUrl()` | `src/lib/config/__tests__/api-url/api-url.test.ts` |

**テスト不要な対象（既存テストが移動済み）:**
- `src/functions/language.ts` — 既存テスト 2 件がステップ 6-1 で移動済み
- `src/functions/open-graph-locale.ts` — 既存テスト 1 件がステップ 6-1 で移動済み
- `src/functions/url.ts` — 既存テスト 1 件がステップ 6-1 で移動済み
- `src/functions/generate-lgtm-markdown.ts` — 既存テスト `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` を `src/functions/__tests__/generate-lgtm-markdown/generate-lgtm-markdown.test.ts` に移動し、シグネチャ変更（`appBaseUrl` 引数追加）に合わせてテストコードも更新する

---

## ステップ 7: ヘッダーコメントの追加

以下の 2 ファイルに先頭コメントを追加:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
```

- `src/lib/config/api-url.ts`（ステップ 1-2-b で移動後のパス）
- `src/lib/upstash/constants.ts`

**注意:** 新規作成・移動するファイル全てにもこのヘッダーコメントを必ず含めること。

---

## ステップ 8: 欠落ドキュメントの作成

### 8-1. `src/components/AGENTS.md` の作成

`src/CLAUDE.md` の `src/components/` セクションで `@src/components/AGENTS.md` として参照されているが、ファイルが存在しない。

**作成内容:** `src/components/` ディレクトリのルールを記載:
- 共通利用する React Component のみ配置
- Storybook ファイルはソースと同ディレクトリに配置
- テストファイルの配置ルール
- 既存のサブディレクトリ構成（`cats/`, `heroui/`, `icons/`）の説明

**併せて作成:** `src/components/CLAUDE.md`（同一内容）

---

## ステップ 9: 空ディレクトリの削除

全てのファイル移動完了後、空になるディレクトリを削除:

- `src/features/oidc/`（types/ と errors/ が移動済み）
- `src/features/__tests__/`（テストが移動済み）
- `src/features/docs/__tests__/`（テストが移動済み）
- `src/features/upload/__tests__/`（テストが移動済み）
- `src/features/main/constants/`（cache-tags.ts のみ格納 → 削除）
- `src/features/privacy/functions/`（privacy-policy.ts のみ格納 → 削除）
- `src/features/terms/functions/`（terms-of-use.ts のみ格納 → 削除）
- `src/features/external-transmission-policy/functions/`（external-transmission-policy.ts のみ格納 → 削除）

**削除しないディレクトリ:**
- `src/features/main/types/`（`action-state.ts` が残るため削除しない）
- `src/features/docs/functions/`（`how-to-use-text.ts`, `mcp-text.ts`, `github-app-text.ts`, `mcp-code-loader.ts` が残る）

---

## ステップ 10: リファクタリングに伴うドキュメントのパス更新

ファイル移動に伴い、ドキュメント内のパス参照やコード例を更新する。

### 10-1. `src/CLAUDE.md` と `src/AGENTS.md` の更新

- **コード例のパス更新:** ドキュメント内のコード例やパス参照が移動後のパスを指しているか確認
  - 例: `src/features/upload/types/storage.ts` → `src/types/upload/storage.ts` に変わったので、`src/CLAUDE.md` の `src/lib/` セクションのコード例を更新
- **削除された feature (oidc) への参照がないか確認**
- **`src/components/` セクション:** `@src/components/AGENTS.md` の参照がステップ 8 で作成したファイルと整合しているか確認

### 10-2. ルールドキュメントとの一貫性検証

`src/features/CLAUDE.md` 等のドキュメントを一読し、リファクタリング後のディレクトリ構成と矛盾するパス参照がないか確認。矛盾があれば更新する。

---

## ステップ 11: 品質管理

### 11-1. 全 import パスの整合性チェック

```bash
# TypeScript コンパイルエラーがないことを確認
npx tsc --noEmit
```

### 11-2. フォーマット・Lint・テスト

```bash
npm run format
npm run lint
npm run test
```

### 11-3. ブラウザ確認（Chrome DevTools MCP）

- `http://localhost:2222` でトップページの表示確認
- `http://localhost:2222/upload` でアップロードページの表示確認
- `http://localhost:2222/en` で英語ページの表示確認
- `http://localhost:2222/terms` で利用規約ページの表示確認（マークダウン読み込み確認）
- `http://localhost:2222/privacy` でプライバシーポリシーページの表示確認
- `http://localhost:2222/docs/mcp` でドキュメントページの表示確認（コード例読み込み確認）

### 11-4. Storybook 確認（Chrome DevTools MCP）

- `http://localhost:6006/` で修正したコンポーネントが正常に表示されることを確認

---

## 実施順序まとめ

依存関係を考慮した実施順序。各ステップ内のサブステップにも依存関係があるため注意。

### Phase 1: 共通レイヤーの整備（ステップ 1）

**実施順序に注意が必要なサブステップ:**

1. **1-3-a**: `constants/cache-tags.ts`（依存なし、先に移動可能）
2. **1-1-f の constants 部分**: `constants/language.ts`（依存なし）
3. **1-1-e の constants 部分**: `constants/url.ts`（依存なし）
4. **1-1-a**: `types/oidc/access-token.ts`（依存なし）
5. **1-1-b**: `types/oidc/...error.ts`（依存なし）
6. **1-1-f の types 部分**: `types/language.ts`（← constants/language に依存）
7. **1-1-e の types 部分**: `types/url.ts`（← constants/url に依存）
8. **1-1-g**: `types/link-attribute.ts`（← types/url に依存）
9. **1-1-h の types 部分**: `types/open-graph-locale.ts`（依存なし）
10. **1-1-c**: `types/upload/storage.ts`（依存なし）
11. **1-1-d**: `types/lgtm-image.ts`（← types/oidc/access-token に依存）
12. **1-2-a の types 部分**: `types/meta-tag.ts`（依存なし）
13. **1-1-f の functions 部分**: `functions/language.ts`（← types/language, types/url に依存）
14. **1-1-e の functions 部分**: `functions/url.ts`（← types/url, types/language, constants/url, constants/language に依存）
15. **1-1-h の functions 部分**: `functions/open-graph-locale.ts`（← types/language, types/open-graph-locale に依存）
16. **1-2-a の functions 部分**: `functions/meta-tag.ts`（← types/language, types/url, types/meta-tag に依存。appBaseUrl は引数注入のため lib 非依存）
17. **1-2-b**: `lib/config/api-url.ts`（← types/url, functions/url に依存。環境変数アクセサのため lib に配置）
18. **1-1-e の lib 部分**: `lib/config/app-base-url.ts`（← types/url に依存。環境変数アクセサのため lib に配置）
19. **1-2-c**: `functions/generate-lgtm-markdown.ts`（← types/lgtm-image に依存。appBaseUrl は引数注入のため lib 非依存）

### Phase 2: feature 間依存の解消・内部整理（ステップ 2, 3）

19. **2-1-a**: `service-description-text.ts` → `src/functions/`（Phase 1 完了後）
20. **2-1-b**: `error-i18n.ts` → `src/features/errors/functions/`
21. **3-1**: ナビゲーションリンク生成関数 6 つを `src/functions/` に移動:
    - `privacy-policy.ts`, `terms-of-use.ts`, `external-transmission-policy.ts`（footer.tsx 用）
    - `github-app.ts`, `how-to-use.ts`, `mcp.ts`（header-desktop.tsx 用）

（3-2, 3-3, 3-4 は Phase 1 の移動で自動解消済み。ステップ 4 も自動解消済み。）

### Phase 3: features ルート直下ファイルの移動・空 feature の削除（ステップ 5）

22. **5-2**: load-markdown.ts → src/lib/markdown/ へ移動
23. **5-1**: src/features/oidc/ を削除

### Phase 4: テスト・ドキュメント・後始末（ステップ 6, 7, 8, 9, 10）

24. **6-1**: features ルート直下テスト → src/functions/__tests__/
25. **6-2**: docs テスト配置修正
26. **6-3**: upload テスト配置修正
27. **6-4**: src/functions/ に移動した関数のテスト新規作成（10 ファイル）
28. **7**: ヘッダーコメント追加（移動した全ファイルにも確認）
28. **8**: コンポーネントドキュメント作成
29. **9**: 空ディレクトリの削除
30. **10**: リファクタリングに伴うドキュメントのパス参照更新

### Phase 5: 品質管理（ステップ 11）

31. **11-1〜11-4**: TypeScript コンパイル → format → lint → test → ブラウザ確認 → Storybook 確認

---

## 影響範囲の見積もり

| 対象 | ファイル数（概算） |
|------|-------------------|
| 新規作成ファイル | 約 15（型 + 関数 + 定数 + ドキュメント） |
| 移動するファイル | 約 20（ソース + テスト + リンク生成関数） |
| import パス修正 | 約 120〜150 |
| 削除するファイル/ディレクトリ | 約 15（移動元 + 空ディレクトリ） |

## PR 方針

全ての変更を **1 つの PR** にまとめる。変更内容はファイル移動と import パス修正の繰り返しであり、複雑ではない。中途半端にマージすると import が壊れるため、分割するメリットがない。
