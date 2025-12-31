# Issue #367: Header改修・ドキュメントページ追加 - 詳細実装計画書

## 📋 概要

### 目的

Header の改修とドキュメントページの追加を行い、以下の変更を実施する:

1. HeaderDesktop からポリシーメニューを削除し、「ドキュメント」メニューを追加
2. HeaderMobile に MCP の使い方リンクを追加
3. 使い方リンクの URL を `/how-to-use` から `/docs/how-to-use` に変更 (ページは新規作成、ComingSoon 表示)
4. `/docs/mcp` ページを新規作成 (ComingSoon 表示)

**補足**: 現在 `/how-to-use` ページは存在せず、Header にはリンクのみが存在します。本改修では `/docs/how-to-use` と `/docs/mcp` の両ページを ComingSoon として新規作成します。

**注意**: Footer の改修は別の設計書 (`issue367-footer-redesign-implementation-plan.md`) で対応します。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/367

### 技術スタック

- **UIライブラリ**: `@heroui/react` (既にインストール済み)
- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

---

## 📁 ファイル構成

### 新規作成ディレクトリ

以下のディレクトリを新規作成する必要がある:

| ディレクトリパス | 説明 |
|----------------|------|
| `src/features/docs/` | ドキュメント関連の機能を格納 |
| `src/features/docs/components/` | ドキュメント関連のページコンテナコンポーネントを格納 |
| `src/features/docs/functions/` | ドキュメント関連のリンク生成関数を格納 |
| `src/app/(default)/docs/` | 日本語版ドキュメントページのルートディレクトリ |
| `src/app/(default)/docs/how-to-use/` | 日本語版使い方ページ |
| `src/app/(default)/docs/mcp/` | 日本語版MCPページ |
| `src/app/(default)/en/docs/` | 英語版ドキュメントページのルートディレクトリ |
| `src/app/(default)/en/docs/how-to-use/` | 英語版使い方ページ |
| `src/app/(default)/en/docs/mcp/` | 英語版MCPページ |

### 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/features/docs/functions/how-to-use.ts` | 使い方ページのリンク生成関数 |
| `src/features/docs/functions/mcp.ts` | MCPページのリンク生成関数 |
| `src/features/docs/components/docs-how-to-use-page-container.tsx` | 使い方ページのコンテナコンポーネント |
| `src/features/docs/components/docs-mcp-page-container.tsx` | MCPページのコンテナコンポーネント |
| `src/app/(default)/docs/how-to-use/page.tsx` | 日本語版使い方ページ |
| `src/app/(default)/en/docs/how-to-use/page.tsx` | 英語版使い方ページ |
| `src/app/(default)/docs/mcp/page.tsx` | 日本語版MCPページ (ComingSoon) |
| `src/app/(default)/en/docs/mcp/page.tsx` | 英語版MCPページ (ComingSoon) |

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/url.ts` | `docs-how-to-use` と `docs-mcp` のパスを追加 |
| `src/features/meta-tag.ts` | 新規ページのメタタグを追加 |
| `src/components/header-i18n.ts` | `documentsText`, `mcpText` 関数を追加 |
| `src/components/header-desktop.tsx` | ポリシーメニュー削除、ドキュメントメニュー追加 |
| `src/components/header-mobile.tsx` | MCPリンク追加、使い方リンクURL変更 |

---

## 🔧 実装詳細

### 1. URL定義の追加

**ファイルパス**: `src/features/url.ts`

#### 変更内容

`appPathList` に新しいパスを追加:

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
  "docs-how-to-use": "/docs/how-to-use",  // 追加
  "docs-mcp": "/docs/mcp",                  // 追加
} as const;
```

`AppPathName` 型を更新:

```typescript
export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "error"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "docs-how-to-use"  // 追加
  | "docs-mcp";        // 追加
```

**注意**: `AppPathName` 型は `appPathList` オブジェクトのキーから自動的に導出される型であり、新しいキーを `appPathList` に追加すると自動的に型に含まれます。上記は最終的な型の形を示したものです。

#### 重要な型について

**1. `IncludeLanguageAppPath` 型**

`IncludeLanguageAppPath` 型は `createIncludeLanguageAppPath` 関数の戻り値型です。この型は言語プレフィックス (`/en` など) を含むパスを表現するブランド型で、通常の `string` と区別されます。

```typescript
// 例: createIncludeLanguageAppPath の使用
const jaPath = createIncludeLanguageAppPath("docs-how-to-use", "ja");
// 結果: "/docs/how-to-use/" (日本語はプレフィックスなし)

const enPath = createIncludeLanguageAppPath("docs-how-to-use", "en");
// 結果: "/en/docs/how-to-use/" (英語は /en プレフィックス付き)
```

**2. `I18nUrlList` 型と `MetaTagList` 型の自動導出**

`I18nUrlList` と `MetaTagList` は共に `AppPathName` をキーとして使用する型です:

```typescript
type I18nUrlList = {
  [key in AppPathName]: {
    [childrenKey in Language]: string;
  };
};

type MetaTagList = {
  [key in AppPathName]: MetaTag;
};
```

したがって、`appPathList` に新しいキー (`docs-how-to-use`, `docs-mcp`) を追加すると、TypeScript の型システムにより `i18nUrlList` と `metaTagList` の戻り値にも対応するエントリの追加が必須となります。

`appUrlList` に追加:

```typescript
export const appUrlList = {
  // ... 既存のエントリー
  docsHowToUse: `${appBaseUrl()}${appPathList["docs-how-to-use"]}` as const,
  docsMcp: `${appBaseUrl()}${appPathList["docs-mcp"]}` as const,
} as const;
```

`i18nUrlList` に追加:

```typescript
export const i18nUrlList: I18nUrlList = {
  // ... 既存のエントリー
  "docs-how-to-use": {
    ja: `${appPathList["docs-how-to-use"]}/`,
    en: `/en${appPathList["docs-how-to-use"]}/`,
  },
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
};
```

---

### 2. リンク生成関数の作成

#### 2.1 使い方ページリンク生成関数

**ファイルパス**: `src/features/docs/functions/how-to-use.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createHowToUseLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "How to Use",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    case "ja":
      return {
        text: "使い方",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    default:
      return assertNever(language);
  }
}
```

#### 2.2 MCPページリンク生成関数

**ファイルパス**: `src/features/docs/functions/mcp.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createMcpLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "How to Use MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    case "ja":
      return {
        text: "MCPの使い方",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    default:
      return assertNever(language);
  }
}
```

---

### 3. メタタグの追加

**ファイルパス**: `src/features/meta-tag.ts`

#### 追加する関数

```typescript
function docsHowToUsePageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 使い方`;
    case "en":
      return `${defaultTitle} How to Use`;
    default:
      return assertNever(language);
  }
}

function docsMcpPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} MCPの使い方`;
    case "en":
      return `${defaultTitle} How to Use MCP`;
    default:
      return assertNever(language);
  }
}
```

#### metaTagList 関数への追加

```typescript
export function metaTagList(language: Language): MetaTagList {
  return {
    // ... 既存のエントリー
    "docs-how-to-use": {
      title: docsHowToUsePageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("docs-how-to-use", language),
      appName,
    },
    "docs-mcp": {
      title: docsMcpPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("docs-mcp", language),
      appName,
    },
  };
}
```

---

### 4. header-i18n.ts への追加

**ファイルパス**: `src/components/header-i18n.ts`

#### 追加する関数

```typescript
export function documentsText(language: Language): string {
  switch (language) {
    case "ja":
      return "ドキュメント";
    case "en":
      return "Documents";
    default:
      return assertNever(language);
  }
}

export function mcpText(language: Language): string {
  switch (language) {
    case "ja":
      return "MCPの使い方";
    case "en":
      return "How to Use MCP";
    default:
      return assertNever(language);
  }
}
```

---

### 5. HeaderDesktop の改修

**ファイルパス**: `src/components/header-desktop.tsx`

#### 変更概要

1. **ポリシーメニュー (Dropdown) を削除**
   - プライバシーポリシーと外部送信ポリシーを含むポリシーメニューを削除

2. **直接の「使い方」リンクを削除**
   - 現在の実装ではナビゲーション内に直接「使い方」リンクが存在する
   - このリンクは削除し、代わりに「ドキュメント」メニュー内に移動する

3. **「利用規約」リンクはそのまま維持**
   - 既存の利用規約リンクは変更なし

4. **「ドキュメント」メニューを追加**
   - ポリシーメニューと同じデザインで「ドキュメント」ドロップダウンを作成
   - 以下の2つのリンクを含む:
     - 使い方 (`/docs/how-to-use`)
     - MCPの使い方 (`/docs/mcp`)

#### 削除対象のコード (行番号参照)

現在の `src/components/header-desktop.tsx` における削除対象:

| 削除対象 | 行番号 | 説明 |
|---------|--------|------|
| 使い方リンク | 67-73行目 | 直接の「使い方」リンク (TODO コメント含む) |
| ポリシーメニュー | 80-116行目 | Dropdown コンポーネント全体 |
| privacy 変数定義 | 49行目 | `const privacy = createPrivacyPolicyLinksFromLanguages(language);` |
| externalTransmissionPolicy 変数定義 | 50-51行目 | `const externalTransmissionPolicy = ...` |

**注意**: `externalTransmissionPolicy` の変数定義を削除しても、Footer では Footer 自身でインポートしているため影響はありません。

#### 修正後のナビゲーション部分の構造

```tsx
<nav className="flex items-center gap-1">
  {/* アップロードリンク - 変更なし */}
  <Link
    className="flex items-center justify-center bg-primary p-5 font-bold text-background text-base hover:text-button-tertiary-hover"
    href={createIncludeLanguageAppPath("upload", language)}
  >
    {uploadText(language)}
  </Link>

  {/* 利用規約リンク - 変更なし */}
  <Link
    className="flex items-center justify-center bg-primary p-5 font-bold text-background text-base hover:text-button-tertiary-hover"
    href={terms.link}
  >
    {terms.text}
  </Link>

  {/* ドキュメントメニュー - 新規追加 */}
  <Dropdown
    classNames={{
      content: "p-0",
    }}
  >
    <DropdownTrigger>
      <Button
        className="flex items-center justify-center gap-2 bg-transparent px-5 py-2 font-bold text-background text-base hover:text-button-tertiary-hover data-[hover=true]:bg-transparent"
        variant="light"
      >
        {documentsText(language)}
        <DownIcon />
      </Button>
    </DropdownTrigger>
    <DropdownMenu
      aria-label="Documents menu"
      className="min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
      classNames={{ base: "!gap-0", list: "gap-0" }}
    >
      <DropdownItem
        key="how-to-use"
        as={Link}
        className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
        href={howToUse.link}
      >
        {howToUse.text}
      </DropdownItem>
      <DropdownItem
        key="mcp"
        as={Link}
        className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
        href={mcp.link}
      >
        {mcp.text}
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
</nav>
```

#### 追加するインポート

```typescript
import { documentsText } from "@/components/header-i18n";
import { createHowToUseLinksFromLanguages } from "@/features/docs/functions/how-to-use";
import { createMcpLinksFromLanguages } from "@/features/docs/functions/mcp";
```

#### 削除するインポート

```typescript
// 以下は HeaderDesktop から削除
import { howToUseText, policyText } from "@/components/header-i18n";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/external-transmission-policy/functions/external-transmission-policy";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy/functions/privacy-policy";
```

**重要な注意事項**:

1. `howToUseText` は HeaderMobile で引き続き使用されるため、`header-i18n.ts` から関数自体を削除する必要はありません。HeaderDesktop のインポート文から削除するだけです。

2. `policyText` は HeaderDesktop でのみ使用されているため、HeaderDesktop のインポートから削除します。**ただし、`header-i18n.ts` からの `policyText` 関数自体の削除は Issue #367 のスコープ外です**。未使用コードの削除は別途リファクタリング Issue で対応してください。

3. `createExternalTransmissionPolicyLinksFromLanguages` は HeaderDesktop から削除しても、Footer では Footer 自身で独立してインポートしているため影響はありません。

#### コンポーネント内の変数

```typescript
// 追加
const howToUse = createHowToUseLinksFromLanguages(language);
const mcp = createMcpLinksFromLanguages(language);

// 以下は削除
// const privacy = createPrivacyPolicyLinksFromLanguages(language);
// const externalTransmissionPolicy = createExternalTransmissionPolicyLinksFromLanguages(language);
```

---

### 6. HeaderMobile の改修

**ファイルパス**: `src/components/header-mobile.tsx`

#### 変更概要

1. **使い方リンクの URL を変更**
   - `/how-to-use` → `createIncludeLanguageAppPath("docs-how-to-use", language)`

2. **MCPの使い方リンクを追加**
   - 使い方リンクの下に `/docs/mcp` へのリンクを追加

3. **コメントの更新**
   - 行131のコメントを「HOME、アップロード、使い方を表示」から「HOME、アップロード、使い方、MCPの使い方を表示」に変更

#### 修正対象箇所 (行番号参照)

| 修正対象 | 行番号 | 変更内容 |
|---------|--------|----------|
| コメント | 131行目 | `{/* ナビゲーションメニュー: HOME、アップロード、使い方、MCPの使い方を表示 */}` に変更 |
| 使い方リンク | 148-155行目 | href を `createIncludeLanguageAppPath("docs-how-to-use", language)` に変更、TODO コメント削除 |
| MCPリンク | 155行目の後 | 新しいLink要素を追加 |

**注意**: `LoggedInMenu` コンポーネントには使い方リンクが存在しないため、この改修では変更不要です。

#### UnloggedInMenu コンポーネントの修正

```tsx
{/* ナビゲーションメニュー: HOME、アップロード、使い方、MCPの使い方を表示 */}
{menuType === "navigation" && (
  <>
    <Link
      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
      href={createIncludeLanguageAppPath("home", language)}
      onClick={onCloseMenus}
    >
      {homeText(language)}
    </Link>
    <Link
      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
      href={createIncludeLanguageAppPath("upload", language)}
      onClick={onCloseMenus}
    >
      {uploadText(language)}
    </Link>
    <Link
      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
      href={createIncludeLanguageAppPath("docs-how-to-use", language)}
      onClick={onCloseMenus}
    >
      {howToUseText(language)}
    </Link>
    {/* MCPの使い方リンクを追加 */}
    <Link
      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
      href={createIncludeLanguageAppPath("docs-mcp", language)}
      onClick={onCloseMenus}
    >
      {mcpText(language)}
    </Link>
  </>
)}
```

#### 追加するインポート

```typescript
import { mcpText } from "@/components/header-i18n";
```

---

### 7. コンテナコンポーネントの作成

**設計方針**: `src/app/` 配下の page.tsx ではメタデータとコンテナコンポーネントの呼び出しのみを行い、`PageLayout` の使用は `src/features/` 配下のコンテナコンポーネントに委譲します。これは `src/features/main/components/upload-page-container.tsx` と同様のパターンです。

#### 7.1 使い方ページコンテナコンポーネント

**ファイルパス**: `src/features/docs/components/docs-how-to-use-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export function DocsHowToUsePageContainer({ language, currentUrlPath }: Props) {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="font-bold text-3xl text-orange-900">Coming Soon</h1>
        <p className="mt-4 text-orange-800">
          {language === "ja"
            ? "使い方ページは準備中です"
            : "How to Use page is under construction"}
        </p>
      </div>
    </PageLayout>
  );
}
```

#### 7.2 MCPページコンテナコンポーネント

**ファイルパス**: `src/features/docs/components/docs-mcp-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export function DocsMcpPageContainer({ language, currentUrlPath }: Props) {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="font-bold text-3xl text-orange-900">Coming Soon</h1>
        <p className="mt-4 text-orange-800">
          {language === "ja"
            ? "MCPの使い方ページは準備中です"
            : "How to Use MCP page is under construction"}
        </p>
      </div>
    </PageLayout>
  );
}
```

---

### 8. 新規ページの作成

**注意**: 現在 `/how-to-use` ページは存在しないため、新規作成となります。
Issue #367 では `/docs/how-to-use` の中身の実装は別 Issue で行う予定のため、このページは `Coming Soon` 表示のみとします。

page.tsx ではメタデータの定義とコンテナコンポーネントの呼び出しのみを行います。

#### 8.1 日本語版使い方ページ

**ファイルパス**: `src/app/(default)/docs/how-to-use/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsHowToUsePageContainer } from "@/features/docs/components/docs-how-to-use-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-how-to-use"].title,
  openGraph: {
    title: metaTagList(language)["docs-how-to-use"].title,
    url: metaTagList(language)["docs-how-to-use"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-how-to-use"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-how-to-use"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-how-to-use"].ja,
    languages: {
      ja: i18nUrlList["docs-how-to-use"].ja,
      en: i18nUrlList["docs-how-to-use"].en,
    },
  },
};

const DocsHowToUsePage: NextPage = () => {
  return (
    <DocsHowToUsePageContainer
      currentUrlPath={createIncludeLanguageAppPath("docs-how-to-use", language)}
      language={language}
    />
  );
};

export default DocsHowToUsePage;
```

#### 8.2 英語版使い方ページ

**ファイルパス**: `src/app/(default)/en/docs/how-to-use/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsHowToUsePageContainer } from "@/features/docs/components/docs-how-to-use-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-how-to-use"].title,
  openGraph: {
    title: metaTagList(language)["docs-how-to-use"].title,
    url: metaTagList(language)["docs-how-to-use"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-how-to-use"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-how-to-use"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-how-to-use"].en,
    languages: {
      ja: i18nUrlList["docs-how-to-use"].ja,
      en: i18nUrlList["docs-how-to-use"].en,
    },
  },
};

const DocsHowToUsePage: NextPage = () => {
  return (
    <DocsHowToUsePageContainer
      currentUrlPath={createIncludeLanguageAppPath("docs-how-to-use", language)}
      language={language}
    />
  );
};

export default DocsHowToUsePage;
```

#### 8.3 日本語版MCPページ

**ファイルパス**: `src/app/(default)/docs/mcp/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsMcpPageContainer } from "@/features/docs/components/docs-mcp-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-mcp"].title,
  openGraph: {
    title: metaTagList(language)["docs-mcp"].title,
    url: metaTagList(language)["docs-mcp"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-mcp"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-mcp"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-mcp"].ja,
    languages: {
      ja: i18nUrlList["docs-mcp"].ja,
      en: i18nUrlList["docs-mcp"].en,
    },
  },
};

const DocsMcpPage: NextPage = () => {
  return (
    <DocsMcpPageContainer
      currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
      language={language}
    />
  );
};

export default DocsMcpPage;
```

#### 8.4 英語版MCPページ

**ファイルパス**: `src/app/(default)/en/docs/mcp/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsMcpPageContainer } from "@/features/docs/components/docs-mcp-page-container";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-mcp"].title,
  openGraph: {
    title: metaTagList(language)["docs-mcp"].title,
    url: metaTagList(language)["docs-mcp"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-mcp"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-mcp"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-mcp"].en,
    languages: {
      ja: i18nUrlList["docs-mcp"].ja,
      en: i18nUrlList["docs-mcp"].en,
    },
  },
};

const DocsMcpPage: NextPage = () => {
  return (
    <DocsMcpPageContainer
      currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
      language={language}
    />
  );
};

export default DocsMcpPage;
```

---

## 📝 実装順序

以下の順序で実装を進めること:

### Phase 0: ディレクトリ作成

新規ファイルを作成する前に、必要なディレクトリを作成する:

```bash
mkdir -p src/features/docs/components
mkdir -p src/features/docs/functions
mkdir -p src/app/\(default\)/docs/how-to-use
mkdir -p src/app/\(default\)/docs/mcp
mkdir -p src/app/\(default\)/en/docs/how-to-use
mkdir -p src/app/\(default\)/en/docs/mcp
```

**注意**: Next.js App Router の Route Groups `(default)` にはカッコが含まれるため、シェルでエスケープが必要です。

### Phase 1: 基盤となる定義の追加

1. `src/features/url.ts` - URL定義の追加
2. `src/features/meta-tag.ts` - メタタグの追加
3. `src/features/docs/functions/how-to-use.ts` - 使い方リンク生成関数 (新規作成)
4. `src/features/docs/functions/mcp.ts` - MCPリンク生成関数 (新規作成)
5. `src/components/header-i18n.ts` - i18n関数の追加

### Phase 2: コンポーネントの修正

6. `src/components/header-desktop.tsx` - ポリシーメニュー削除、ドキュメントメニュー追加
7. `src/components/header-mobile.tsx` - MCPリンク追加、URL変更

### Phase 3: ページの作成

8. `src/features/docs/components/docs-how-to-use-page-container.tsx` - 使い方ページコンテナ
9. `src/features/docs/components/docs-mcp-page-container.tsx` - MCPページコンテナ
10. `src/app/(default)/docs/how-to-use/page.tsx` - 日本語版使い方ページ
11. `src/app/(default)/en/docs/how-to-use/page.tsx` - 英語版使い方ページ
12. `src/app/(default)/docs/mcp/page.tsx` - 日本語版MCPページ
13. `src/app/(default)/en/docs/mcp/page.tsx` - 英語版MCPページ

### Phase 4: 品質管理

14. `npm run format` を実行
15. `npm run lint` を実行
16. `npm run test` を実行
17. Chrome DevTools MCP での表示確認
18. Storybook での表示確認

---

## ✅ 品質管理手順

実装完了後、**必ず以下の順番**で品質管理を実行すること:

### 1. コードフォーマット

```bash
npm run format
```

### 2. Lintチェック

```bash
npm run lint
```

**全てのエラーと警告を解消すること**

### 3. テスト実行

```bash
npm run test
```

**全てのテストがパスすることを確認**

### 4. 開発サーバーでの表示確認

Chrome DevTools MCP を使って `http://localhost:2222` にアクセスし、以下を確認:

#### HeaderDesktop の確認 (768px以上)
- [ ] 「ドキュメント」メニューが表示される
- [ ] 「ドキュメント」をクリックでドロップダウンが開く
- [ ] 「使い方」リンクが `/docs/how-to-use` にリンクしている
- [ ] 「MCPの使い方」リンクが `/docs/mcp` にリンクしている
- [ ] ポリシーメニュー (プライバシーポリシー、外部送信ポリシー) が削除されている
- [ ] 「利用規約」リンクは引き続き表示されている

#### HeaderMobile の確認 (768px未満)
- [ ] ハンバーガーメニュー内に「使い方」リンクが表示される
- [ ] 「使い方」リンクが `/docs/how-to-use` にリンクしている
- [ ] ハンバーガーメニュー内に「MCPの使い方」リンクが表示される
- [ ] 「MCPの使い方」リンクが `/docs/mcp` にリンクしている

#### 新規ページの確認
- [ ] `/docs/how-to-use` にアクセスすると「Coming Soon」ページが表示される
- [ ] `/en/docs/how-to-use` にアクセスすると英語版「Coming Soon」ページが表示される
- [ ] `/docs/mcp` にアクセスすると「Coming Soon」ページが表示される
- [ ] `/en/docs/mcp` にアクセスすると英語版「Coming Soon」ページが表示される

#### 言語切り替えの確認
- [ ] `/docs/how-to-use` ページで言語切り替えボタンをクリックすると `/en/docs/how-to-use` に遷移する
- [ ] `/en/docs/how-to-use` ページで言語切り替えボタンをクリックすると `/docs/how-to-use` に遷移する
- [ ] `/docs/mcp` ページで言語切り替えボタンをクリックすると `/en/docs/mcp` に遷移する
- [ ] `/en/docs/mcp` ページで言語切り替えボタンをクリックすると `/docs/mcp` に遷移する

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] `HeaderDesktop` の各ストーリーが正常に表示される
- [ ] `HeaderMobile` の各ストーリーが正常に表示される

---

## ⚠️ 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止**
3. **ビジネスロジックの変更禁止** - UI変更のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 📌 対応範囲外の項目

以下の項目は Issue #367 の対応範囲外です。必要に応じて別 Issue で対応してください:

1. **旧URL `/how-to-use` へのリダイレクト設定**
   - 現在 `/how-to-use` ページは存在しないため、リダイレクト設定は不要
   - 将来的にSEO対策として必要になった場合は別途対応

2. **使い方ページ (`/docs/how-to-use`) の実際のコンテンツ実装**
   - この Issue では Coming Soon 表示のみ
   - 実際のコンテンツは別 Issue で実装予定

3. **MCPの使い方ページ (`/docs/mcp`) の実際のコンテンツ実装**
   - この Issue では Coming Soon 表示のみ
   - 実際のコンテンツは別 Issue で実装予定

4. **未使用コードの削除**
   - `header-i18n.ts` から `policyText` 関数の削除
   - これらは HeaderDesktop から参照されなくなるが、リファクタリング Issue で対応

---

## 🎯 成功基準

以下を全て満たすこと:

### URL定義
- [ ] `src/features/url.ts` に `docs-how-to-use` と `docs-mcp` が追加されている
- [ ] `AppPathName` 型が更新されている
- [ ] `appUrlList` と `i18nUrlList` が更新されている

### リンク生成関数
- [ ] `src/features/docs/functions/how-to-use.ts` が作成されている
- [ ] `src/features/docs/functions/mcp.ts` が作成されている

### メタタグ
- [ ] `src/features/meta-tag.ts` に新規ページのメタタグが追加されている

### i18n
- [ ] `src/components/header-i18n.ts` に `documentsText` と `mcpText` が追加されている

### HeaderDesktop
- [ ] 直接の「使い方」リンク (旧 `/how-to-use`) が削除されている
- [ ] ポリシーメニューが削除されている
- [ ] 「ドキュメント」メニューが追加されている
- [ ] ドキュメントメニューに「使い方」と「MCPの使い方」リンクが含まれている

### HeaderMobile
- [ ] 使い方リンクの URL が `/docs/how-to-use` に変更されている
- [ ] 「MCPの使い方」リンクが追加されている

### 新規ページ
- [ ] `/docs/how-to-use` (日本語/英語) ページが作成されている
- [ ] `/docs/mcp` (日本語/英語) ページが作成されている
- [ ] 全てのページで `PageLayout` が使用されている
- [ ] 全てのページで「Coming Soon」が表示されている

### CI/テスト
- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### ブラウザ確認
- [ ] HeaderDesktop の「ドキュメント」メニューが正常に動作する
- [ ] HeaderMobile のナビゲーションメニューに「MCPの使い方」が表示される
- [ ] `/docs/how-to-use` と `/docs/mcp` ページが正常に表示される
- [ ] 言語切り替えが正常に動作する

---

**作成日**: 2025-12-31
**最終更新日**: 2025-12-31
**対象Issue**: #367
**担当**: AI実装者
