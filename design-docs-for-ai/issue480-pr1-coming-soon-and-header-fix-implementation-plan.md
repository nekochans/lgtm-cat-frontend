# Issue #480 PR1: Coming Soon ページ追加 + Header ハードコード修正 実装計画

## 1. 概要

GitHub ログイン機能を実装する Issue #480 を 2 つの PR に分割した内、本計画は **PR1** を扱う。

**PR1 のスコープ:**

- お気に入り (`/favorites`) と My Cats (`/my-cats`) を ja / en 両言語の **Coming Soon** 表示ページとして新規追加する。本 PR 時点では誰でもアクセス可能で、ログイン処理 / アクセス制御は実装しない。
- Header (Desktop / Mobile) のハードコードパス (`/favorites`, `/cat-list`) を `createIncludeLanguageAppPath` ベースに置き換える。
- Header の `meowlistText` (「にゃんリスト」 / 「Meowlist」) を `myCatsText` にリネームし、表示テキストを 日英ともに **「My Cats」** に統一。URL パスも `/cat-list` から `/my-cats` に変更する。

**PR1 のスコープ外:**

- Better Auth の GitHub Social Provider 有効化、`/api/auth/[...all]/route.ts` 等のログインエンドポイント実装。
- `/login`, `/logout` ページの新規実装、`/logout` ハードコードパス修正。
- Server Component 側の `auth.api.getSession()` を用いた未ログイン時 Home リダイレクトの実装。
- `Header` の `hideLoginButton` Props や `isLoggedIn` ハードコードの撤去。
- 上記はすべて **PR2** で対応する。

## 2. 関連 Issue / 前提

- 親 Issue: <https://github.com/nekochans/lgtm-cat-frontend/issues/480>
- 直前の関連 Issue:
  - #478 — Better Auth / Drizzle / Turso の初期セットアップ (マージ済み)
  - #483 — drizzle-kit によるマイグレーション運用構築 (本 Issue の前提)

PR1 は `src/lib/better-auth/` への依存を一切持たない。`auth.ts` の import 時 throw 設計には影響を受けないが、PR2 担当が読み返したときに混乱しないよう、PR1 の範囲を本ドキュメント上で明示する。

## 3. Done の定義 (本 PR で達成する項目)

### Coming Soon ページ

- [ ] お気に入り (`/favorites`) が ja / en 両言語で Coming Soon 表示ページとして実装されている事
- [ ] My Cats (`/my-cats`) が ja / en 両言語で Coming Soon 表示ページとして実装されている事
- [ ] Coming Soon ページに `robots: { index: false, follow: false }` が設定されている事
- [ ] Storybook で `ComingSoonContent` / `FavoritesPage` / `MyCatsPage` の ja / en 両言語 Story が登録されている事

### Header の整理 (PR1 スコープ分のみ)

- [ ] Header のハードコードパス `/favorites` と `/cat-list` が `createIncludeLanguageAppPath` を使う形に修正されている事
- [ ] にゃんリスト (Meowlist) を **My Cats** に名称変更し、URL パスも `/cat-list` から `/my-cats` に変更されている事
- [ ] `meowlistText` 関数を `myCatsText` にリネームし、表示テキストも `My Cats` に統一されている事
- [ ] `header-mobile.tsx` の `/favorites` / `/cat-list` 行に付与されていた TODO コメントが削除されている事

PR2 で対応する `/logout` ハードコードと `hideLoginButton` 関連 TODO は本 PR では **削除しない**。

## 4. 設計方針

### 4.1 三層構造 (`ErrorPageContent` と同じパターン)

```
src/components/coming-soon-content.tsx          ← 共通インナーコンポーネント
   ↓
src/features/<favorites|my-cats>/components/<feature>-page.tsx  ← ページ単位ラッパー (PageLayout 込み)
   ↓
src/app/(default)/<favorites|my-cats>/page.tsx                  ← Next.js App Router page
src/app/(default)/en/<favorites|my-cats>/page.tsx
```

参考実装:

| 階層           | Coming Soon の実装                          | 参考にする既存実装                                          |
| -------------- | ------------------------------------------- | ----------------------------------------------------------- |
| 共通コンテンツ | `src/components/coming-soon-content.tsx`    | `src/components/error-page-content.tsx`                     |
| 機能ページ     | `src/features/favorites/components/...`     | `src/features/errors/components/maintenance-page.tsx`       |
| ルーティング   | `src/app/(default)/favorites/page.tsx` 他   | `src/app/(default)/maintenance/page.tsx`、`upload/page.tsx` |

### 4.2 Layout の選択 — `PageLayout` を使う

`MaintenancePage` が `ErrorLayout` (orange-50 背景の特別 Layout) を使うのに対し、Coming Soon は **エラー表示ではなく「準備中」のお知らせページ** であるため、通常ページの `PageLayout` (background 色) を採用する。HomePage / UploadPage と同等の見た目にする。

- `PageLayout` は内部で `hideLoginButton={true}` をハードコードしているため、PR1 では `isLoggedIn={false}` のみ指定すればよい (`hideLoginButton` Props は PR2 で撤去予定)。
- `mainClassName` は **明示的に上書き** する。デフォルトの `relative flex w-full flex-1 flex-col items-center px-4 py-8` は外側に追加パディングを付けてしまうが、`ComingSoonContent` 内で既に `px-7 py-10 md:px-10 md:py-[60px]` を持つため不要。`ErrorLayout` の `<main>` と同じ `flex w-full flex-1 flex-col items-center` に揃える。

### 4.3 i18n テキストの配置

- 本 PR で追加する Coming Soon 共通テキスト (タイトル / メッセージ / ボタン) は **`src/components/coming-soon-content-i18n.ts`** に集約する (Issue 本文の指示)。`header-i18n.ts` と同じ `src/components/` 直下配置パターンに従う。
- `src/features/errors/functions/error-i18n.ts` のように feature に置かないのは、Coming Soon コンテンツは複数機能 (favorites / my-cats、将来追加される他機能) で再利用される共通要素だから。

### 4.4 イラスト

- `LookingUpCat` (`src/components/cats/looking-up-cat.tsx`) を使用する。
- サイズは `not-found-page.tsx` と同等の `className="h-auto w-[180px] md:w-[245px]"` を採用する。

### 4.5 Coming Soon ページの表示テキスト

| キー         | ja                       | en                                |
| ------------ | ------------------------ | --------------------------------- |
| `title`      | `Coming Soon`            | `Coming Soon`                     |
| `message`    | `この機能は現在準備中です` | `This feature is coming soon.`    |
| `buttonText` | `HOMEに戻る`             | `Go to HOME`                      |

`buttonText` は `error-i18n.ts` 内の表記との整合を取る (英語版は既存 `Go to HOME` に揃え、日本語版は Issue 文面の「HOMEに戻る」を採用)。

### 4.6 メタタグ (`metaTagList`)

- `favorites`: ja `LGTMeow お気に入り`、en `LGTMeow Favorite`
- `my-cats`: ja `LGTMeow My Cats`、en `LGTMeow My Cats` (機能名統一に従い両言語で同じ)
- `description` は省略 (既存 `MetaTag` の `description` は optional。`upload` 等を除いて省略しているページが大半)

App Router の `page.tsx` 側で以下を設定する。

- `robots: { index: false, follow: false }` (Issue 設計方針に従う、検索インデックス対象外)
- `alternates.canonical` / `alternates.languages` / `openGraph` 一式 (`upload/page.tsx` パターン踏襲)

### 4.7 `appPathList` / `i18nUrlList` / `AppPathName` の追加方針

- キー名は `favorites` と `my-cats` (ケバブケース、既存 `external-transmission-policy` や `docs-how-to-use` と同じ命名規則)。
- 追加位置は `login` の直後 (ユーザー機能関連を集めるイメージ)。
- 型 `AppPathName` の Union にも忘れず追加する (型補完が効かなくなり実装漏れに直結する)。

### 4.8 PR1 で扱わない `/logout` の扱い

- `header-mobile.tsx` の `/logout` 行に付いている TODO コメント、および `header-desktop.tsx` の `/logout` 直書き `href` は **本 PR では変更しない**。
- 理由: 現在 `appPathList` / `AppPathName` / `i18nUrlList` には `logout` キーが **存在しない**。`/logout` を `createIncludeLanguageAppPath` 化するには定数 / 型 / メタタグ / `/logout` ページ実装をまとめて行う必要があり、これは PR2 (Better Auth による sign out 処理を含むログアウトページ実装) のスコープと一体である。
- そのため、PR1 ではあえて `/logout` のハードコードと TODO コメントをそのまま残す。
- `header-mobile.tsx` の TODO コメントは `/favorites` (212 行目) / `/cat-list` (221 行目) の 2 箇所のみ削除する。`/logout` (191 行目) は残す。

### 4.9 既存 Header Storybook の扱い

- `src/components/header.stories.tsx` / `header-desktop.stories.tsx` / `header-mobile.stories.tsx` の Stories は **Props の変更を伴わない** (新たに渡す引数なし)。本 PR で追加するのは `myCatsText` 関数の参照変更のみで、Stories の Args は変更不要。
- 結果として既存 Story の表示テキストが「にゃんリスト」/「Meowlist」→「My Cats」へ自動的に切り替わる。Chromatic 上ではこれが意図した視覚差分として現れる (PR レビュー時に承認すべき差分)。

### 4.10 `src/lib/config/app-base-url.ts` の `appUrlList` の扱い

- `app-base-url.ts` には `appPathList` の各キーに対応する **絶対 URL** を集めた `appUrlList` が export されている。
- 全リポジトリ検索したところ、`appUrlList` および型 `AppUrl` は **本ファイル外で参照されていない**。`appUrlList` を更新しなくてもビルド / テストは通る。
- とはいえ、`appPathList` のキーが増えるのに `appUrlList` 側を更新しないと「`appPathList` の鍵リストとほぼ 1:1 対応する絶対 URL リスト」というファイルの意図と乖離してしまう。本 PR ではメンテナンス性のため **`appUrlList` にも `favorites` / `myCats` を追加する** (詳細は §7.1.3)。
- `appUrlList` のキーはキャメルケース (`docsHowToUse` 等)。新キーは `favorites` / `myCats` とする。

## 5. 影響範囲サマリー

| カテゴリ                     | 新規 | 変更 | 合計 |
| ---------------------------- | :--: | :--: | :--: |
| 共通定数 / 型                |  0   |  3   |  3   |
| `appUrlList` (lib/config)    |  0   |  1   |  1   |
| 共通関数 (meta-tag) + テスト |  0   |  2   |  2   |
| 共通コンポーネント           |  3   |  0   |  3   |
| favorites feature            |  2   |  0   |  2   |
| my-cats feature              |  2   |  0   |  2   |
| App Router page              |  4   |  0   |  4   |
| Header                       |  0   |  3   |  3   |
| URL 関数のテスト             |  0   |  1   |  1   |
| **合計**                     | **11** | **10** | **21** |

詳細ファイル一覧:

| #   | パス                                                                          | 種別 | 内容                                                       |
| --- | ----------------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| 1   | `src/types/url.ts`                                                            | 変更 | `AppPathName` に `favorites` / `my-cats` を追加            |
| 2   | `src/constants/url.ts`                                                        | 変更 | `appPathList` / `i18nUrlList` に `favorites` / `my-cats`   |
| 3   | `src/lib/config/app-base-url.ts`                                              | 変更 | `appUrlList` に `favorites` / `myCats` を追加              |
| 4   | `src/functions/meta-tag.ts`                                                   | 変更 | `metaTagList` に `favorites` / `my-cats` の項目追加        |
| 5   | `src/functions/__tests__/meta-tag/meta-tag-list.test.ts`                      | 変更 | favorites / my-cats のタイトル検証ケースを追加             |
| 6   | `src/functions/__tests__/url/create-include-language-app-path.test.ts`       | 変更 | favorites / my-cats のテーブルケースを追加                 |
| 7   | `src/components/coming-soon-content-i18n.ts`                                  | 新規 | i18n テキスト関数 (`comingSoonPageTexts`)                  |
| 8   | `src/components/coming-soon-content.tsx`                                      | 新規 | Coming Soon インナーコンテンツ                              |
| 9   | `src/components/coming-soon-content.stories.tsx`                              | 新規 | ja / en の Story                                            |
| 10  | `src/features/favorites/components/favorites-page.tsx`                        | 新規 | PageLayout + ComingSoonContent                              |
| 11  | `src/features/favorites/components/favorites-page.stories.tsx`                | 新規 | ja / en の Story                                            |
| 12  | `src/features/my-cats/components/my-cats-page.tsx`                            | 新規 | PageLayout + ComingSoonContent                              |
| 13  | `src/features/my-cats/components/my-cats-page.stories.tsx`                    | 新規 | ja / en の Story                                            |
| 14  | `src/app/(default)/favorites/page.tsx`                                        | 新規 | ja の App Router page                                       |
| 15  | `src/app/(default)/en/favorites/page.tsx`                                     | 新規 | en の App Router page                                       |
| 16  | `src/app/(default)/my-cats/page.tsx`                                          | 新規 | ja の App Router page                                       |
| 17  | `src/app/(default)/en/my-cats/page.tsx`                                       | 新規 | en の App Router page                                       |
| 18  | `src/components/header-i18n.ts`                                               | 変更 | `meowlistText` → `myCatsText`、テキスト統一                 |
| 19  | `src/components/header-desktop.tsx`                                           | 変更 | ハードコード `/favorites` / `/cat-list` を関数化、import 更新 |
| 20  | `src/components/header-mobile.tsx`                                            | 変更 | 同上 + TODO コメント削除                                    |

## 6. 既存パターン分析 (実装時の参照リンク)

### 6.1 ErrorPageContent (三層構造の参考実装)

- `src/components/error-page-content.tsx` — `"use client"` で宣言、`title` / `message` / `buttonText` / `catComponent` を Props に受け取る純粋表示コンポーネント。
- `src/features/errors/components/maintenance-page.tsx` — `ErrorPageContent` と `ErrorLayout` を組み合わせるラッパー。
- `src/app/(default)/maintenance/page.tsx` / `src/app/(default)/en/maintenance/page.tsx` — `metadata` を export しつつ `MaintenancePage` を呼ぶ。

### 6.2 PageLayout (本実装で利用するレイアウト)

- `src/components/page-layout.tsx`
  - Header / main / Footer を組み合わせる共通レイアウト
  - `hideLoginButton={true}` をハードコード済み (PR1 では `isLoggedIn={false}` のみ指定)
- 利用例: `src/features/main/components/home-page.tsx`、`src/features/upload/components/upload-page.tsx`

### 6.3 i18n テキスト関数のパターン

- `src/features/errors/functions/error-i18n.ts` — `notFoundPageTexts(language)` / `maintenancePageTexts(language)` 等の interface を返す関数
- 本 PR の `comingSoonPageTexts` は同じシグネチャ・同じ `assertNever` パターンに揃える

### 6.4 Header 周辺の参考実装

- `src/components/header-i18n.ts` — `function uploadText(language: Language): string` のスタイルを踏襲
- `src/components/header-desktop.tsx` / `header-mobile.tsx` — 既存 `createIncludeLanguageAppPath("upload", language)` 等の呼び出しを参考に置換

### 6.5 既存テストパターン

- `src/functions/__tests__/url/create-include-language-app-path.test.ts` — `it.each` テンプレートリテラルでテーブル駆動
- `src/functions/__tests__/meta-tag/meta-tag-list.test.ts` — `it.each` でタイトルを検証

---

## 7. 実装詳細

すべてのコード断片はそのままコピーすれば動く完全形で記載する。差分を最小化するために、変更行のみ提示する場合は前後 2-3 行を含めて提示する。

### 7.1 共通定数 / 型の追加

#### 7.1.1 `src/types/url.ts` の修正

`AppPathName` Union に 2 件追加する。

```typescript
import type { appPathList } from "@/constants/url";
import type { Language } from "@/types/language";

export type Url = `http://localhost${string}` | `https://${string}`;

export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "favorites"
  | "my-cats"
  | "docs-how-to-use"
  | "docs-mcp"
  | "docs-github-app";

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";
```

> 追加位置は `login` の直後とする (ユーザー機能関連の連続性)。

#### 7.1.2 `src/constants/url.ts` の修正

`appPathList` / `i18nUrlList` の双方に追記する。

```typescript
export const appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
  favorites: "/favorites",
  "my-cats": "/my-cats",
  "docs-how-to-use": "/docs/how-to-use",
  "docs-mcp": "/docs/mcp",
  "docs-github-app": "/docs/github-app",
} as const;

export const i18nUrlList = {
  home: {
    ja: "/",
    en: "/en/",
  },
  upload: {
    ja: `${appPathList.upload}/`,
    en: `/en${appPathList.upload}/`,
  },
  terms: {
    ja: `${appPathList.terms}/`,
    en: `/en${appPathList.terms}/`,
  },
  privacy: {
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  maintenance: {
    ja: `${appPathList.maintenance}/`,
    en: `/en${appPathList.maintenance}/`,
  },
  "external-transmission-policy": {
    ja: `${appPathList["external-transmission-policy"]}/`,
    en: `/en${appPathList["external-transmission-policy"]}/`,
  },
  login: {
    ja: `${appPathList.login}/`,
    en: `/en${appPathList.login}/`,
  },
  favorites: {
    ja: `${appPathList.favorites}/`,
    en: `/en${appPathList.favorites}/`,
  },
  "my-cats": {
    ja: `${appPathList["my-cats"]}/`,
    en: `/en${appPathList["my-cats"]}/`,
  },
  "docs-how-to-use": {
    ja: `${appPathList["docs-how-to-use"]}/`,
    en: `/en${appPathList["docs-how-to-use"]}/`,
  },
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
  "docs-github-app": {
    ja: `${appPathList["docs-github-app"]}/`,
    en: `/en${appPathList["docs-github-app"]}/`,
  },
} as const;
```

> `error` は既存通り `i18nUrlList` には載せない (既存挙動と一致)。`appPathList` には `error` が残る点も既存仕様。

#### 7.1.3 `src/lib/config/app-base-url.ts` の修正

`appUrlList` に絶対 URL を 2 件追加する。キーはキャメルケース (`docsHowToUse` 等の既存命名規則に従う) なので、`my-cats` は `myCats` とする。

```typescript
export const appUrlList = {
  home: appBaseUrl(),
  ogpImg: `${appBaseUrl()}/opengraph-image.png` as const,
  upload: `${appBaseUrl()}${appPathList.upload}` as const,
  terms: `${appBaseUrl()}${appPathList.terms}` as const,
  privacy: `${appBaseUrl()}${appPathList.privacy}` as const,
  maintenance: `${appBaseUrl()}${appPathList.maintenance}` as const,
  externalTransmission:
    `${appBaseUrl()}${appPathList["external-transmission-policy"]}` as const,
  login: `${appBaseUrl()}${appPathList.login}` as const,
  favorites: `${appBaseUrl()}${appPathList.favorites}` as const,
  myCats: `${appBaseUrl()}${appPathList["my-cats"]}` as const,
  docsHowToUse: `${appBaseUrl()}${appPathList["docs-how-to-use"]}` as const,
  docsMcp: `${appBaseUrl()}${appPathList["docs-mcp"]}` as const,
  docsGitHubApp: `${appBaseUrl()}${appPathList["docs-github-app"]}` as const,
} as const;
```

> 上記以外の export (`appBaseUrl`, `AppUrl`, `createI18nUrl`) は変更しない。

### 7.2 メタタグの追加

#### 7.2.1 `src/functions/meta-tag.ts` の修正

タイトル関数 2 件を追加し、`metaTagList` の戻り値オブジェクトに項目を追加する。

```typescript
function favoritesPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} お気に入り`;
    case "en":
      return `${defaultTitle} Favorite`;
    default:
      return assertNever(language);
  }
}

function myCatsPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} My Cats`;
    case "en":
      return `${defaultTitle} My Cats`;
    default:
      return assertNever(language);
  }
}
```

> 追加位置は `loginPageTitle` の直後。

`metaTagList` の戻り値に追加:

```typescript
    login: {
      title: loginPageTitle(language),
      ogpImgUrl,
      ogpTargetUrl: createI18nUrlFromBase(appBaseUrl, "login", language),
      appName,
    },
    favorites: {
      title: favoritesPageTitle(language),
      ogpImgUrl,
      ogpTargetUrl: createI18nUrlFromBase(appBaseUrl, "favorites", language),
      appName,
    },
    "my-cats": {
      title: myCatsPageTitle(language),
      ogpImgUrl,
      ogpTargetUrl: createI18nUrlFromBase(appBaseUrl, "my-cats", language),
      appName,
    },
    "docs-how-to-use": {
      // 既存のまま
```

> `MetaTagList` 型は `AppPathName` の Mapped Type なので、7.1.1 で `AppPathName` に追加した瞬間に **このオブジェクトに当該キーが必須** になる。コンパイル漏れがあれば TypeScript が即座にエラーで知らせる。

#### 7.2.2 `src/functions/__tests__/meta-tag/meta-tag-list.test.ts` の修正

既存 `PageTitleTestTable` interface とテーブルに 2 列を追加する。

```typescript
  interface PageTitleTestTable {
    readonly expectedDocsGitHubAppTitle: string;
    readonly expectedDocsHowToUseTitle: string;
    readonly expectedDocsMcpTitle: string;
    readonly expectedExternalTransmissionTitle: string;
    readonly expectedFavoritesTitle: string;
    readonly expectedLoginTitle: string;
    readonly expectedMaintenanceTitle: string;
    readonly expectedMyCatsTitle: string;
    readonly expectedPrivacyTitle: string;
    readonly expectedTermsTitle: string;
    readonly language: Language;
  }

  it.each`
    language | expectedTermsTitle        | expectedPrivacyTitle              | expectedMaintenanceTitle  | expectedExternalTransmissionTitle         | expectedLoginTitle    | expectedFavoritesTitle    | expectedMyCatsTitle  | expectedDocsHowToUseTitle | expectedDocsMcpTitle        | expectedDocsGitHubAppTitle
    ${"ja"}  | ${"LGTMeow 利用規約"}     | ${"LGTMeow プライバシーポリシー"} | ${"LGTMeow メンテナンス"} | ${"LGTMeow 外部送信ポリシー"}             | ${"LGTMeow ログイン"} | ${"LGTMeow お気に入り"}    | ${"LGTMeow My Cats"} | ${"LGTMeow 使い方"}       | ${"LGTMeow MCPの使い方"}    | ${"LGTMeow GitHub Appの使い方"}
    ${"en"}  | ${"LGTMeow Terms of Use"} | ${"LGTMeow Privacy Policy"}       | ${"LGTMeow Maintenance"}  | ${"LGTMeow External Transmission Policy"} | ${"LGTMeow Login"}    | ${"LGTMeow Favorite"}      | ${"LGTMeow My Cats"} | ${"LGTMeow How to Use"}   | ${"LGTMeow How to Use MCP"} | ${"LGTMeow How to Use GitHub App"}
  `(
    "should return correct page titles when language is $language",
    ({
      language,
      expectedTermsTitle,
      expectedPrivacyTitle,
      expectedMaintenanceTitle,
      expectedExternalTransmissionTitle,
      expectedLoginTitle,
      expectedFavoritesTitle,
      expectedMyCatsTitle,
      expectedDocsHowToUseTitle,
      expectedDocsMcpTitle,
      expectedDocsGitHubAppTitle,
    }: PageTitleTestTable) => {
      const result = metaTagList(language, appBaseUrl);
      expect(result.terms.title).toBe(expectedTermsTitle);
      expect(result.privacy.title).toBe(expectedPrivacyTitle);
      expect(result.maintenance.title).toBe(expectedMaintenanceTitle);
      expect(result["external-transmission-policy"].title).toBe(
        expectedExternalTransmissionTitle
      );
      expect(result.login.title).toBe(expectedLoginTitle);
      expect(result.favorites.title).toBe(expectedFavoritesTitle);
      expect(result["my-cats"].title).toBe(expectedMyCatsTitle);
      expect(result["docs-how-to-use"].title).toBe(expectedDocsHowToUseTitle);
      expect(result["docs-mcp"].title).toBe(expectedDocsMcpTitle);
      expect(result["docs-github-app"].title).toBe(expectedDocsGitHubAppTitle);
    }
  );
```

#### 7.2.3 `src/functions/__tests__/url/create-include-language-app-path.test.ts` の修正

テーブルに 4 行追加する。

```typescript
  it.each`
    appPathName                       | language | expected
    ${"home"}                         | ${"ja"}  | ${"/"}
    ${"home"}                         | ${"en"}  | ${"/en"}
    ${"upload"}                       | ${"ja"}  | ${"/upload"}
    ${"upload"}                       | ${"en"}  | ${"/en/upload"}
    ${"terms"}                        | ${"ja"}  | ${"/terms"}
    ${"terms"}                        | ${"en"}  | ${"/en/terms"}
    ${"privacy"}                      | ${"ja"}  | ${"/privacy"}
    ${"privacy"}                      | ${"en"}  | ${"/en/privacy"}
    ${"docs-how-to-use"}              | ${"ja"}  | ${"/docs/how-to-use"}
    ${"docs-how-to-use"}              | ${"en"}  | ${"/en/docs/how-to-use"}
    ${"external-transmission-policy"} | ${"ja"}  | ${"/external-transmission-policy"}
    ${"external-transmission-policy"} | ${"en"}  | ${"/en/external-transmission-policy"}
    ${"favorites"}                    | ${"ja"}  | ${"/favorites"}
    ${"favorites"}                    | ${"en"}  | ${"/en/favorites"}
    ${"my-cats"}                      | ${"ja"}  | ${"/my-cats"}
    ${"my-cats"}                      | ${"en"}  | ${"/en/my-cats"}
  `(
    "should return $expected when appPathName is $appPathName and language is $language",
    ({ appPathName, language, expected }: TestTable) => {
      expect(createIncludeLanguageAppPath(appPathName, language)).toBe(
        expected
      );
    }
  );
```

> `is-include-language-app-path.test.ts` は `appPaths` を `appPathList` から動的に生成しているため変更不要。動作担保のためにテーブルへ `/favorites` / `/en/favorites` / `/my-cats` / `/en/my-cats` ケースを足してもよいが、必須ではない。

### 7.3 共通 Coming Soon コンポーネント

#### 7.3.1 `src/components/coming-soon-content-i18n.ts` (新規)

```typescript
import type { Language } from "@/types/language";
import { assertNever } from "@/utils/assert-never";

interface ComingSoonPageTexts {
  readonly buttonText: string;
  readonly message: string;
  readonly title: string;
}

export function comingSoonPageTexts(language: Language): ComingSoonPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "Coming Soon",
        message: "この機能は現在準備中です",
        buttonText: "HOMEに戻る",
      };
    case "en":
      return {
        title: "Coming Soon",
        message: "This feature is coming soon.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}
```

#### 7.3.2 `src/components/coming-soon-content.tsx` (新規)

`ErrorPageContent` の構造をそのまま流用する (見出し / メッセージ / 猫イラスト / Home ボタン)。Props を最小化するため、テキストは内部で `comingSoonPageTexts(language)` から取得する。猫は `LookingUpCat` を固定使用 (Issue 設計方針)。

```typescript
import type { JSX } from "react";
import { LookingUpCat } from "@/components/cats/looking-up-cat";
import { comingSoonPageTexts } from "@/components/coming-soon-content-i18n";
import { LinkButton } from "@/components/link-button";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function ComingSoonContent({ language }: Props): JSX.Element {
  const texts = comingSoonPageTexts(language);
  const homeUrl = createIncludeLanguageAppPath("home", language);

  return (
    // ErrorPageContent と同じ余白・配置 (Figma 仕様: モバイル px-7 py-10 gap-7 / デスクトップ px-10 py-[60px] gap-12)
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:gap-12 md:px-10 md:py-[60px]">
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <h1 className="text-center font-bold text-2xl text-orange-900 md:text-4xl">
          {texts.title}
        </h1>
        <p className="text-center text-amber-900 text-base md:text-xl">
          {texts.message}
        </p>
      </div>
      <div className="flex items-center justify-center">
        <LookingUpCat
          aria-hidden="true"
          className="h-auto w-[180px] md:w-[245px]"
        />
      </div>
      <LinkButton
        className="w-full max-w-[300px] md:max-w-[400px]"
        linkText={texts.buttonText}
        linkUrl={homeUrl}
      />
    </div>
  );
}
```

> `"use client"` 指定は **付けない**。`ErrorPageContent` には付いているが、内部で client-only API (state / event handler) を一切使っていないため不要。CLAUDE.md 系の方針として「不要な directive は使用しない」を遵守する。

#### 7.3.3 `src/components/coming-soon-content.stories.tsx` (新規)

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { ComingSoonContent } from "./coming-soon-content";

const meta = {
  component: ComingSoonContent,
  title: "Components/ComingSoonContent",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComingSoonContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
};
```

### 7.4 favorites feature

#### 7.4.1 `src/features/favorites/components/favorites-page.tsx` (新規)

> `mainClassName` を明示的に上書きしてデフォルトの `px-4 py-8` を取り除く。`ComingSoonContent` 内で `px-7 py-10 md:px-10 md:py-[60px]` のパディングを既に持っているため、外側の追加パディングは不要 (`ErrorLayout` の main と同等の挙動を再現する)。

```typescript
import { ComingSoonContent } from "@/components/coming-soon-content";
import { PageLayout } from "@/components/page-layout";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function FavoritesPage({ language }: Props) {
  return (
    <PageLayout
      currentUrlPath={createIncludeLanguageAppPath("favorites", language)}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center"
    >
      <ComingSoonContent language={language} />
    </PageLayout>
  );
}
```

#### 7.4.2 `src/features/favorites/components/favorites-page.stories.tsx` (新規)

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { FavoritesPage } from "./favorites-page";

const meta = {
  component: FavoritesPage,
  title: "features/favorites/FavoritesPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FavoritesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/favorites",
      },
    },
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/favorites",
      },
    },
  },
};
```

### 7.5 my-cats feature

#### 7.5.1 `src/features/my-cats/components/my-cats-page.tsx` (新規)

> 7.4.1 と同じ理由で `mainClassName` を上書きする。

```typescript
import { ComingSoonContent } from "@/components/coming-soon-content";
import { PageLayout } from "@/components/page-layout";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function MyCatsPage({ language }: Props) {
  return (
    <PageLayout
      currentUrlPath={createIncludeLanguageAppPath("my-cats", language)}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center"
    >
      <ComingSoonContent language={language} />
    </PageLayout>
  );
}
```

#### 7.5.2 `src/features/my-cats/components/my-cats-page.stories.tsx` (新規)

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MyCatsPage } from "./my-cats-page";

const meta = {
  component: MyCatsPage,
  title: "features/my-cats/MyCatsPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MyCatsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/my-cats",
      },
    },
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/my-cats",
      },
    },
  },
};
```

### 7.6 App Router page.tsx

`upload/page.tsx` の構造を踏襲しつつ、Coming Soon ページ専用に `robots: { index: false, follow: false }` を追加する。

#### 7.6.1 `src/app/(default)/favorites/page.tsx` (新規)

```typescript
import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).favorites.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).favorites.title,
    url: metaTagList(language, appBaseUrl()).favorites.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).favorites.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).favorites.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.favorites.ja,
    languages: {
      ja: i18nUrlList.favorites.ja,
      en: i18nUrlList.favorites.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Favorites: NextPage = () => <FavoritesPage language={language} />;

export default Favorites;
```

#### 7.6.2 `src/app/(default)/en/favorites/page.tsx` (新規)

```typescript
import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).favorites.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).favorites.title,
    url: metaTagList(language, appBaseUrl()).favorites.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).favorites.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).favorites.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.favorites.en,
    languages: {
      ja: i18nUrlList.favorites.ja,
      en: i18nUrlList.favorites.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const EnFavorites: NextPage = () => <FavoritesPage language={language} />;

export default EnFavorites;
```

#### 7.6.3 `src/app/(default)/my-cats/page.tsx` (新規)

```typescript
import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { MyCatsPage } from "@/features/my-cats/components/my-cats-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["my-cats"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["my-cats"].title,
    url: metaTagList(language, appBaseUrl())["my-cats"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["my-cats"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["my-cats"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["my-cats"].ja,
    languages: {
      ja: i18nUrlList["my-cats"].ja,
      en: i18nUrlList["my-cats"].en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const MyCats: NextPage = () => <MyCatsPage language={language} />;

export default MyCats;
```

#### 7.6.4 `src/app/(default)/en/my-cats/page.tsx` (新規)

```typescript
import type { Metadata, NextPage } from "next";
import { i18nUrlList } from "@/constants/url";
import { MyCatsPage } from "@/features/my-cats/components/my-cats-page";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "en";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl())["my-cats"].title,
  openGraph: {
    title: metaTagList(language, appBaseUrl())["my-cats"].title,
    url: metaTagList(language, appBaseUrl())["my-cats"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl())["my-cats"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl())["my-cats"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["my-cats"].en,
    languages: {
      ja: i18nUrlList["my-cats"].ja,
      en: i18nUrlList["my-cats"].en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const EnMyCats: NextPage = () => <MyCatsPage language={language} />;

export default EnMyCats;
```

### 7.7 Header の修正

#### 7.7.1 `src/components/header-i18n.ts` の修正

`meowlistText` を `myCatsText` にリネームし、ja / en を共に "My Cats" にする。

**変更前:**

```typescript
export function meowlistText(language: Language): string {
  switch (language) {
    case "ja":
      return "にゃんリスト";
    case "en":
      return "Meowlist";
    default:
      return assertNever(language);
  }
}
```

**変更後:**

```typescript
export function myCatsText(language: Language): string {
  switch (language) {
    case "ja":
      return "My Cats";
    case "en":
      return "My Cats";
    default:
      return assertNever(language);
  }
}
```

> 関数名の位置は元の `meowlistText` の場所をそのまま使う (logoutText の前)。

#### 7.7.2 `src/components/header-desktop.tsx` の修正

3 箇所変更する。

**変更箇所 1**: import 文

```typescript
// 変更前
import {
  documentsText,
  favoriteListText,
  logoutText,
  meowlistText,
  uploadText,
} from "@/components/header-i18n";

// 変更後
import {
  documentsText,
  favoriteListText,
  logoutText,
  myCatsText,
  uploadText,
} from "@/components/header-i18n";
```

**変更箇所 2**: お気に入りの DropdownItem (`href="/favorites"`) を `createIncludeLanguageAppPath` 化

```typescript
// 変更前
<Dropdown.Item
  className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
  href="/favorites"
  id="favorites"
  textValue={favoriteListText(language)}
>
  {favoriteListText(language)}
</Dropdown.Item>

// 変更後
<Dropdown.Item
  className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
  href={createIncludeLanguageAppPath("favorites", language)}
  id="favorites"
  textValue={favoriteListText(language)}
>
  {favoriteListText(language)}
</Dropdown.Item>
```

**変更箇所 3**: にゃんリストの DropdownItem (`href="/cat-list"`) を `createIncludeLanguageAppPath("my-cats", language)` 化、id・関数呼び出しも変更

```typescript
// 変更前
<Dropdown.Item
  className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
  href="/cat-list"
  id="cat-list"
  textValue={meowlistText(language)}
>
  {meowlistText(language)}
</Dropdown.Item>

// 変更後
<Dropdown.Item
  className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
  href={createIncludeLanguageAppPath("my-cats", language)}
  id="my-cats"
  textValue={myCatsText(language)}
>
  {myCatsText(language)}
</Dropdown.Item>
```

> `id` は HeroUI Dropdown 内部のキー。`/cat-list` から `/my-cats` へのリネームに合わせて `cat-list` → `my-cats` にする。
> `/logout` 行 (`href="/logout"`) は **PR2 で対応するため、本 PR では変更しない**。

#### 7.7.3 `src/components/header-mobile.tsx` の修正

3 箇所変更する。

**変更箇所 1**: import 文

```typescript
// 変更前
import {
  closeMenuAriaLabel,
  favoriteListText,
  githubAppText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  mcpText,
  meowlistText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";

// 変更後
import {
  closeMenuAriaLabel,
  favoriteListText,
  githubAppText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  mcpText,
  myCatsText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";
```

**変更箇所 2**: `LoggedInMenu` 内の `/favorites` リンク (TODO コメントごと削除し置換)

```typescript
// 変更前 (LoggedInMenu 内)
<Link
  className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
  // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
  href="/favorites"
  onClick={onCloseMenus}
>
  <HeartIcon color="white" height={24} width={24} />
  {favoriteListText(language)}
</Link>

// 変更後
<Link
  className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
  href={createIncludeLanguageAppPath("favorites", language)}
  onClick={onCloseMenus}
>
  <HeartIcon color="white" height={24} width={24} />
  {favoriteListText(language)}
</Link>
```

**変更箇所 3**: `LoggedInMenu` 内の `/cat-list` リンク (同様に TODO コメント削除して置換、関数も `myCatsText` 化)

```typescript
// 変更前
<Link
  className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
  // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
  href="/cat-list"
  onClick={onCloseMenus}
>
  <CatNyanIcon color="white" height={24} width={24} />
  {meowlistText(language)}
</Link>

// 変更後
<Link
  className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
  href={createIncludeLanguageAppPath("my-cats", language)}
  onClick={onCloseMenus}
>
  <CatNyanIcon color="white" height={24} width={24} />
  {myCatsText(language)}
</Link>
```

> `LoggedInMenu` 内の `/logout` リンク (上部の Logout ボタン) は **PR2 で対応** するため、TODO コメントごと残す。

---

## 8. テストコード更新一覧

| #   | テストファイル                                                          | 内容                                              |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| T1  | `src/functions/__tests__/meta-tag/meta-tag-list.test.ts`                | `favorites` / `my-cats` のタイトル検証ケース追加  |
| T2  | `src/functions/__tests__/url/create-include-language-app-path.test.ts` | `favorites` / `my-cats` (ja/en) の 4 ケース追加   |

ComingSoonContent / FavoritesPage / MyCatsPage の表示テストは Storybook (Chromatic) によるビジュアル回帰テストでカバーする (Storybook 連携 vitest が `npm run test` 内で実行される — `package.json` 参照のこと)。Component の単体テストは追加しない (既存 ErrorPageContent / MaintenancePage も `__tests__/` を持たない方針と整合)。

## 9. 実装順序

下から順に組み立てると依存先が常に整っている状態になる。

### Phase 1: 共通定数 / 型 / メタタグ (赤い土台)

1. `src/types/url.ts` の `AppPathName` に `favorites` / `my-cats` を追加 (7.1.1)
2. `src/constants/url.ts` の `appPathList` / `i18nUrlList` に追加 (7.1.2)
3. `src/lib/config/app-base-url.ts` の `appUrlList` に追加 (7.1.3)
4. `src/functions/meta-tag.ts` の `metaTagList` に項目追加 (7.2.1)
5. `src/functions/__tests__/meta-tag/meta-tag-list.test.ts` を更新 (7.2.2)
6. `src/functions/__tests__/url/create-include-language-app-path.test.ts` を更新 (7.2.3)
7. `npm run test` で Phase 1 まで全パスを確認

### Phase 2: 共通 ComingSoon コンポーネント

8. `src/components/coming-soon-content-i18n.ts` を新規作成 (7.3.1)
9. `src/components/coming-soon-content.tsx` を新規作成 (7.3.2)
10. `src/components/coming-soon-content.stories.tsx` を新規作成 (7.3.3)

### Phase 3: feature ページの作成

11. `src/features/favorites/components/favorites-page.tsx` (7.4.1)
12. `src/features/favorites/components/favorites-page.stories.tsx` (7.4.2)
13. `src/features/my-cats/components/my-cats-page.tsx` (7.5.1)
14. `src/features/my-cats/components/my-cats-page.stories.tsx` (7.5.2)

### Phase 4: App Router page

15. `src/app/(default)/favorites/page.tsx` (7.6.1)
16. `src/app/(default)/en/favorites/page.tsx` (7.6.2)
17. `src/app/(default)/my-cats/page.tsx` (7.6.3)
18. `src/app/(default)/en/my-cats/page.tsx` (7.6.4)

### Phase 5: Header 修正

19. `src/components/header-i18n.ts` で `meowlistText` → `myCatsText` リネーム (7.7.1)
20. `src/components/header-desktop.tsx` のハードコード修正 (7.7.2)
21. `src/components/header-mobile.tsx` のハードコード修正 + TODO 削除 (7.7.3)

### Phase 6: 品質管理 / 動作確認

詳細は §10 / §11。すべての Phase 完了後にまとめて実行する。

> **Phase 進行中の TypeScript 状態について**
>
> - Phase 1 のステップ 1 (`AppPathName` に追加) を実行した直後は、`src/functions/meta-tag.ts` の `metaTagList` が `MetaTagList` 型 (`{[key in AppPathName]: MetaTag}`) と不一致になり TypeScript エラーになる。これはステップ 4 (`metaTagList` への項目追加) で解消する。**Phase 1 はステップ 1 → 7 まで連続で実施し、途中でコミット / ビルドしないこと**。
> - Phase 5 を Phase 1〜4 と並走させると、Header から参照する `appPathList.favorites` / `appPathList["my-cats"]` が未定義の状態でビルドが通らない。Phase 1 で型 / 定数 / メタタグを揃え、Phase 4 終了時点でルーティングが完成してから Phase 5 で Header 内のリンクを安全に切り替える。

## 10. 品質管理の手順

`CLAUDE.md` 記載の標準手順に従う。

1. `npm run format` — Prettier + Ultracite で整形
2. `npm run lint` — Lint チェック (エラー 0 を確認)
3. `npm run test` — Vitest + Storybook 連携テスト (全パスを確認)
4. `npm run build` — 本番ビルドが通る事を確認 (Next.js の型チェック / SSR ビルドエラーをここで早期検知)

## 11. 動作確認の手順

### 11.1 開発サーバー (chrome-devtools MCP を使用)

1. `npm run dev` (port 2222) は起動済み前提。
2. `chrome-devtools` MCP で以下 4 つの URL をすべて開き、Coming Soon タイトル / メッセージ / イラスト / Home ボタンが表示される事を確認:
   - `http://localhost:2222/favorites`
   - `http://localhost:2222/en/favorites`
   - `http://localhost:2222/my-cats`
   - `http://localhost:2222/en/my-cats`
3. 各ページから「HOMEに戻る」/「Go to HOME」ボタンを押して `/` または `/en` に遷移する事を確認。
4. ログイン済み Header の動作確認: Storybook の `LoggedInHeaderDesktopInJapanese` / `LoggedInHeaderMobileInJapanese` (および English 版) で以下を確認:
   - お気に入り (Favorite) リンクの `href` が `/favorites` (ja) / `/en/favorites` (en) になっている
   - My Cats リンクの表示テキストが "My Cats" (両言語) になっている、`href` が `/my-cats` (ja) / `/en/my-cats` (en)
   - Logout リンクは `/logout` のまま (PR2 で対応するため変更されない事)
5. モバイル版 Storybook で TODO コメントが消えている事をソースコード上で確認 (`/favorites` / `/cat-list` 行)。
6. 各ページの HTML を chrome-devtools で確認し、`<meta name="robots" content="noindex,nofollow">` (もしくは Next.js Metadata API 経由で挿入されたもの) が出力されている事を確認。

### 11.2 Storybook (port 6006)

1. `npm run storybook` で Storybook を開く。
2. `Components/ComingSoonContent` の Japanese / English Story が描画される事を確認。
3. `features/favorites/FavoritesPage` の Japanese / English を確認 (Header / Footer 込みの表示)。
4. `features/my-cats/MyCatsPage` の Japanese / English を確認。
5. `Header` 配下の `LoggedInHeader*` Story で My Cats のテキスト / リンクが切り替わっている事を確認。

### 11.3 複雑な操作が必要な場合

- フォーム入力やドラッグ&ドロップは本 PR では発生しない。シンプルな表示確認のみで十分。
- それでもブラウザ操作が複雑になる場合は agent-browser Skill を利用する。

## 12. 成功基準

- [ ] `/favorites` / `/en/favorites` / `/my-cats` / `/en/my-cats` の 4 URL が 200 で開ける
- [ ] それぞれのページで Coming Soon 表示 (タイトル / メッセージ / 猫イラスト / Home ボタン) が確認できる
- [ ] HEAD レスポンスに `noindex,nofollow` の robots タグが含まれる
- [ ] Header のお気に入り / My Cats リンクが `createIncludeLanguageAppPath` 経由で出力されている (`/favorites`、`/en/favorites`、`/my-cats`、`/en/my-cats`)
- [ ] Header の "Meowlist" / "にゃんリスト" 表記がすべて "My Cats" に置き換わっている
- [ ] `header-mobile.tsx` の `/favorites` / `/cat-list` 行に TODO コメントが残っていない
- [ ] `npm run format` / `npm run lint` / `npm run test` / `npm run build` がすべて成功する
- [ ] Storybook で 6 件の Story (ComingSoonContent ja/en、FavoritesPage ja/en、MyCatsPage ja/en) が新規追加されている
- [ ] PR2 で扱う `/logout` ハードコードや `hideLoginButton` の TODO を **撤去していない事**

## 13. 禁止事項

1. **PR2 のスコープ (`/login`、`/logout`、Better Auth 連携、アクセス制御) を本 PR で実装しない**
2. **`Header` の `hideLoginButton` Props を撤去しない / `isLoggedIn` のハードコードを撤去しない** — 双方とも PR2 マターである
3. **依頼内容と関係のないリファクタを混入させない** (HeroUI バージョン上げ、tailwind トークン整理など本 PR の範囲外)
4. **`appPathList` / `AppPathName` への `error` 追加など、既存の意図的な不一致を「修正」しない** — 既存仕様であり別 PR で議論すべき
5. **`favoriteListText` の「お気に入り」/ "Favorite" 表記を変更しない** — Issue は `meowlistText` のリネームのみを指示している
6. **`/cat-list` 配下の旧ルートを残さない** — 旧パスへの 301 リダイレクトは未指定なので不要 (旧パス未公開のため)。万一不安があれば PR で議論する

---

## 付録: 参考リンク

- Issue 本文: <https://github.com/nekochans/lgtm-cat-frontend/issues/480>
- 認証基盤前提 ( #478 ) 設計: `design-docs-for-ai/issue478-better-auth-drizzle-atlas-turso-setup-plan.md`
- 認証基盤マイグレーション ( #483 ) 設計: `design-docs-for-ai/issue483-better-auth-schema-drizzle-kit-migration-plan.md`
- ErrorPageContent: `src/components/error-page-content.tsx`
- MaintenancePage (三層構造の参考): `src/features/errors/components/maintenance-page.tsx`
- PageLayout: `src/components/page-layout.tsx`
- url 関連の型・定数・関数: `src/types/url.ts` / `src/constants/url.ts` / `src/functions/url.ts`
- メタタグ生成: `src/functions/meta-tag.ts`
