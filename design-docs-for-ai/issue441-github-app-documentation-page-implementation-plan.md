# Issue #441: GitHub Appのドキュメントページ `/docs/github-app` の実装 - 詳細実装計画書

## 概要

### 目的

GitHub App（LGTMeow）の使い方を説明するドキュメントページ `/docs/github-app` と `/en/docs/github-app` を新規作成する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/441

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS v4
- **Storybook**: v10.1.11

---

## 現状分析

### Done の定義（Issue より）

- [ ] `/docs/github-app` ページが新規作成されている事
- [ ] 他のページと同様に多言語化対応が行われている事
- [ ] `src/app/sitemap.xml` にURLが追加されている事

### 対象ファイル（新規作成）

| ファイルパス | 役割 |
|-------------|------|
| `src/app/(default)/docs/github-app/page.tsx` | 日本語版ルーティング |
| `src/app/(default)/en/docs/github-app/page.tsx` | 英語版ルーティング |
| `src/features/docs/components/docs-github-app-page.tsx` | ページコンポーネント |
| `src/features/docs/functions/github-app-text.ts` | テキスト取得関数 |
| `src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts` | テキスト取得関数のテスト |
| `src/features/docs/components/docs-github-app-page.stories.tsx` | Storybook |

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/url.ts` | `appPathList` と `AppPathName` に `"docs-github-app"` を追加、`i18nUrlList` に追加 |
| `src/features/meta-tag.ts` | `metaTagList` に `"docs-github-app"` を追加、ページタイトル関数を追加 |
| `src/app/sitemap.xml` | `/docs/github-app` エントリを追加 |

### 事前に用意済みの画像ファイル（作業不要）

| ファイルパス | 役割 |
|-------------|------|
| `public/screenshots/github app-Install.webp` | GitHub App インストール画面のスクリーンショット |
| `public/screenshots/github-app-sample-lgtm.webp` | LGTM画像投稿例のスクリーンショット |

### 既存の関連ファイル（変更不要）

| ファイルパス | 役割 |
|-------------|------|
| `src/components/page-layout.tsx` | 共通レイアウト |

### 参考にする既存実装

| ファイルパス | 参考ポイント |
|-------------|-------------|
| `src/features/docs/components/docs-how-to-use-page.tsx` | PageLayoutの使用パターン、Section構造、画像表示 |
| `src/features/docs/functions/how-to-use-text.ts` | テキスト取得関数の設計パターン |
| `src/features/docs/components/docs-mcp-page.tsx` | セクション構造、スタイリング |
| `src/app/(default)/docs/mcp/page.tsx` | ルーティングファイルのパターン |

---

## コンテンツソース

GitHub Issue #441 に記載されているコンテンツを元に、日本語版・英語版のコンテンツを作成する。

### コンテンツ構成

| セクション名 (日本語) | セクション名 (英語) | 内容 |
|----------------------|---------------------|------|
| LGTMeow GitHub App | LGTMeow GitHub App | 概要と GitHub App へのリンク |
| インストール | Install | インストール手順とスクリーンショット |
| 基本機能 LGTM画像の自動投稿 | Basic Feature: Auto LGTM Image Posting | 機能説明とスクリーンショット |

### 使用画像

| 画像パス | 用途 | 表示サイズ（推奨） |
|---------|------|-------------------|
| `/screenshots/github app-Install.webp` | インストール画面 | width: 700, height: 358 (元: 1579x807) |
| `/screenshots/github-app-sample-lgtm.webp` | LGTM投稿例 | width: 560, height: 439 (Issue指定サイズ) |

**注意**: 画像ファイル名に空白が含まれている (`github app-Install.webp`) ため、URLエンコードに注意が必要。Next.js Image コンポーネントでは自動的に処理される。

---

## 仕様詳細

### デザイン方針

- PR #438のMCPドキュメントページの実装を参照
- Figmaデザインは不要
- 既存のドキュメントページ（`/docs/how-to-use`, `/docs/mcp`）と同じスタイルを踏襲

### セクション詳細コンテンツ

#### 1. LGTMeow GitHub App (概要)

**日本語**:
```
[こちら](https://github.com/apps/lgtmeow) からGitHub Appを利用できます。
```

**英語**:
```
You can use the GitHub App from [here](https://github.com/apps/lgtmeow).
```

#### 2. インストール

**日本語**:
```
まずは [こちら](https://github.com/apps/lgtmeow) からインストールを行います。
```

**英語**:
```
First, install the app from [here](https://github.com/apps/lgtmeow).
```

**スクリーンショット**: `/screenshots/github app-Install.webp`

#### 3. 基本機能 LGTM画像の自動投稿

**日本語**:
```
使い方はとてもシンプルです。

GitHub上で作られたPRを `Approve` するとランダムで取得されたLGTM画像が投稿されます🐱
```

**英語**:
```
The usage is very simple.

When you `Approve` a PR created on GitHub, a randomly selected LGTM image will be automatically posted 🐱
```

**スクリーンショット**: `/screenshots/github-app-sample-lgtm.webp`

---

## 設計方針

### 方針概要

1. **テキスト取得関数を新規作成**: `src/features/docs/functions/github-app-text.ts` に各セクションのテキストを返す関数を作成
2. **コンポーネント構造**: docs-how-to-use-page.tsx および docs-mcp-page.tsx の Section コンポーネントパターンを踏襲
3. **スタイリング**: 既存のドキュメントページと同じ Tailwind CSS スタイルを使用
4. **画像表示**: Next.js Image コンポーネントを使用、遅延読み込みを適用
5. **サーバーコンポーネント維持**: ページ全体をサーバーコンポーネントとして実装（クライアントコンポーネントは不要）

### コンポーネント構成

```
DocsGitHubAppPage (サーバーコンポーネント)
├── PageLayout
│   ├── Header
│   └── Footer
└── コンテンツエリア
    ├── Section: LGTMeow GitHub App (概要)
    │   └── リンク付きテキスト
    ├── Section: インストール
    │   ├── 説明テキスト
    │   └── Image (インストール画面)
    └── Section: 基本機能 LGTM画像の自動投稿
        ├── 説明テキスト
        └── Image (LGTM投稿例)
```

### レイアウト設計

docs-how-to-use-page.tsx と同じレイアウトを採用:

```
コンテナ: max-w-[1020px] px-4 py-8 sm:px-10 sm:py-[60px]
セクション間隔: gap-5 sm:gap-7
見出し + 下線: flex gap-2 items-center
本文間隔: gap-2
```

---

## 変更内容

### 1. src/features/url.ts の修正

**変更箇所1**: `appPathList` に `"docs-github-app"` を追加

```typescript
// 変更前 (26-37行目)
appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
  "docs-how-to-use": "/docs/how-to-use",
  "docs-mcp": "/docs/mcp",
} as const;

// 変更後
appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
  "docs-how-to-use": "/docs/how-to-use",
  "docs-mcp": "/docs/mcp",
  "docs-github-app": "/docs/github-app",
} as const;
```

**変更箇所2**: `AppPathName` 型に `"docs-github-app"` を追加

```typescript
// 変更前 (39-48行目)
export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "docs-how-to-use"
  | "docs-mcp";

// 変更後
export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "docs-how-to-use"
  | "docs-mcp"
  | "docs-github-app";
```

**変更箇所3**: `i18nUrlList` に `"docs-github-app"` を追加

```typescript
// 変更前 (123-160行目) - "docs-mcp" の後に追加
i18nUrlList: I18nUrlList = {
  // ... 既存のエントリ ...
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
};

// 変更後
i18nUrlList: I18nUrlList = {
  // ... 既存のエントリ ...
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
  "docs-github-app": {
    ja: `${appPathList["docs-github-app"]}/`,
    en: `/en${appPathList["docs-github-app"]}/`,
  },
};
```

---

### 2. src/features/meta-tag.ts の修正

**変更箇所1**: ページタイトル関数を追加（`docsMcpPageTitle` の直後に追加）

```typescript
// 追加する関数 (130行目の後に追加)
function docsGitHubAppPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} GitHub Appの使い方`;
    case "en":
      return `${defaultTitle} How to Use GitHub App`;
    default:
      return assertNever(language);
  }
}
```

**変更箇所2**: `metaTagList` 関数に `"docs-github-app"` エントリを追加

```typescript
// 変更前 (metaTagList関数内、"docs-mcp" の後)
"docs-mcp": {
  title: docsMcpPageTitle(language),
  ogpImgUrl: appUrlList.ogpImg,
  ogpTargetUrl: createI18nUrl("docs-mcp", language),
  appName,
},

// 変更後
"docs-mcp": {
  title: docsMcpPageTitle(language),
  ogpImgUrl: appUrlList.ogpImg,
  ogpTargetUrl: createI18nUrl("docs-mcp", language),
  appName,
},
"docs-github-app": {
  title: docsGitHubAppPageTitle(language),
  ogpImgUrl: appUrlList.ogpImg,
  ogpTargetUrl: createI18nUrl("docs-github-app", language),
  appName,
},
```

---

### 3. src/features/docs/functions/github-app-text.ts の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

export interface GitHubAppTexts {
  readonly overview: {
    readonly title: string;
    readonly beforeLink: string;
    readonly linkText: string;
    readonly afterLink: string;
    readonly linkUrl: string;
  };
  readonly install: {
    readonly title: string;
    readonly beforeLink: string;
    readonly linkText: string;
    readonly afterLink: string;
    readonly linkUrl: string;
    readonly screenshotAlt: string;
  };
  readonly basicFeature: {
    readonly title: string;
    readonly intro: string;
    readonly screenshotAlt: string;
  };
}

const gitHubAppUrl = "https://github.com/apps/lgtmeow";

export function getGitHubAppTexts(language: Language): GitHubAppTexts {
  switch (language) {
    case "ja":
      return {
        overview: {
          title: "LGTMeow GitHub App",
          beforeLink: "",
          linkText: "こちら",
          afterLink: "からGitHub Appを利用できます。",
          linkUrl: gitHubAppUrl,
        },
        install: {
          title: "インストール",
          beforeLink: "まずは",
          linkText: "こちら",
          afterLink: "からインストールを行います。",
          linkUrl: gitHubAppUrl,
          screenshotAlt: "GitHub App インストール画面",
        },
        basicFeature: {
          title: "基本機能 LGTM画像の自動投稿",
          intro: "使い方はとてもシンプルです。",
          screenshotAlt: "GitHub AppによるLGTM画像の自動投稿例",
        },
      };
    case "en":
      return {
        overview: {
          title: "LGTMeow GitHub App",
          beforeLink: "You can use the GitHub App from ",
          linkText: "here",
          afterLink: ".",
          linkUrl: gitHubAppUrl,
        },
        install: {
          title: "Install",
          beforeLink: "First, install the app from ",
          linkText: "here",
          afterLink: ".",
          linkUrl: gitHubAppUrl,
          screenshotAlt: "GitHub App installation screen",
        },
        basicFeature: {
          title: "Basic Feature: Auto LGTM Image Posting",
          intro: "The usage is very simple.",
          screenshotAlt: "Example of automatic LGTM image posting by GitHub App",
        },
      };
    default:
      return assertNever(language);
  }
}

/**
 * 基本機能セクションの説明文を組み立てる
 * Approveをコードスタイルで表示するため、分割して返す
 */
export function getBasicFeatureFullDescription(language: Language): {
  readonly beforeApprove: string;
  readonly approveText: string;
  readonly afterApprove: string;
} {
  switch (language) {
    case "ja":
      return {
        beforeApprove: "GitHub上で作られたPRを",
        approveText: "Approve",
        afterApprove: "するとランダムで取得されたLGTM画像が投稿されます🐱",
      };
    case "en":
      return {
        beforeApprove: "When you ",
        approveText: "Approve",
        afterApprove: " a PR created on GitHub, a randomly selected LGTM image will be automatically posted 🐱",
      };
    default:
      return assertNever(language);
  }
}

/**
 * インストール画面のスクリーンショットパス
 * public/screenshots/github app-Install.webp を参照
 */
export const installScreenshotPath = "/screenshots/github app-Install.webp";

/**
 * インストール画面スクリーンショットの表示サイズ
 * 元画像サイズ: 1579 x 807
 * アスペクト比を維持して幅700pxに設定
 */
export const installScreenshotWidth = 700;
export const installScreenshotHeight = 358;

/**
 * LGTM投稿例のスクリーンショットパス
 * public/screenshots/github-app-sample-lgtm.webp を参照
 */
export const sampleLgtmScreenshotPath =
  "/screenshots/github-app-sample-lgtm.webp";

/**
 * LGTM投稿例スクリーンショットの表示サイズ
 * Issue指定サイズ: 560 x 439
 */
export const sampleLgtmScreenshotWidth = 560;
export const sampleLgtmScreenshotHeight = 439;
```

---

### 4. src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import {
  getBasicFeatureFullDescription,
  getGitHubAppTexts,
  installScreenshotHeight,
  installScreenshotPath,
  installScreenshotWidth,
  sampleLgtmScreenshotHeight,
  sampleLgtmScreenshotPath,
  sampleLgtmScreenshotWidth,
} from "@/features/docs/functions/github-app-text";
import type { Language } from "@/features/language";

describe("src/features/docs/functions/github-app-text.ts getGitHubAppTexts TestCases", () => {
  interface TestTable {
    readonly language: Language;
    readonly expectedOverviewTitle: string;
    readonly expectedInstallTitle: string;
    readonly expectedBasicFeatureTitle: string;
  }

  it.each`
    language | expectedOverviewTitle      | expectedInstallTitle | expectedBasicFeatureTitle
    ${"ja"}  | ${"LGTMeow GitHub App"}    | ${"インストール"}    | ${"基本機能 LGTM画像の自動投稿"}
    ${"en"}  | ${"LGTMeow GitHub App"}    | ${"Install"}         | ${"Basic Feature: Auto LGTM Image Posting"}
  `(
    "should return correct section titles from getGitHubAppTexts when language is $language",
    ({
      language,
      expectedOverviewTitle,
      expectedInstallTitle,
      expectedBasicFeatureTitle,
    }: TestTable) => {
      const result = getGitHubAppTexts(language);

      expect(result.overview.title).toBe(expectedOverviewTitle);
      expect(result.install.title).toBe(expectedInstallTitle);
      expect(result.basicFeature.title).toBe(expectedBasicFeatureTitle);
    }
  );

  it("should return correct GitHub App URL from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("ja");

    expect(result.overview.linkUrl).toBe("https://github.com/apps/lgtmeow");
    expect(result.install.linkUrl).toBe("https://github.com/apps/lgtmeow");
  });

  it("should return Japanese texts with correct structure from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("ja");

    expect(result.overview.afterLink).toContain("GitHub App");
    expect(result.overview.linkText).toBe("こちら");
    expect(result.overview.beforeLink).toBe("");
    expect(result.install.beforeLink).toBe("まずは");
    expect(result.install.afterLink).toContain("インストール");
    expect(result.basicFeature.intro).toContain("シンプル");
    expect(result.basicFeature.screenshotAlt).toContain("LGTM");
  });

  it("should return English texts with correct structure from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("en");

    expect(result.overview.beforeLink).toContain("GitHub App");
    expect(result.overview.linkText).toBe("here");
    expect(result.overview.afterLink).toBe(".");
    expect(result.install.beforeLink).toContain("install");
    expect(result.basicFeature.intro).toContain("simple");
    expect(result.basicFeature.screenshotAlt).toContain("LGTM");
  });

  it("should return Japanese description with correct structure from getBasicFeatureFullDescription", () => {
    const result = getBasicFeatureFullDescription("ja");

    expect(result.beforeApprove).toContain("PR");
    expect(result.approveText).toBe("Approve");
    expect(result.afterApprove).toContain("LGTM画像");
  });

  it("should return English description with correct structure from getBasicFeatureFullDescription", () => {
    const result = getBasicFeatureFullDescription("en");

    expect(result.beforeApprove).toBe("When you ");
    expect(result.approveText).toBe("Approve");
    expect(result.afterApprove).toContain("LGTM image");
  });

  it("should have correct install screenshot path and dimensions", () => {
    expect(installScreenshotPath).toBe("/screenshots/github app-Install.webp");
    expect(installScreenshotWidth).toBe(700);
    expect(installScreenshotHeight).toBe(358);
  });

  it("should have correct sample LGTM screenshot path and dimensions", () => {
    expect(sampleLgtmScreenshotPath).toBe(
      "/screenshots/github-app-sample-lgtm.webp"
    );
    expect(sampleLgtmScreenshotWidth).toBe(560);
    expect(sampleLgtmScreenshotHeight).toBe(439);
  });
});
```

---

### 5. src/features/docs/components/docs-github-app-page.tsx の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import Image from "next/image";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import {
  getBasicFeatureFullDescription,
  getGitHubAppTexts,
  installScreenshotHeight,
  installScreenshotPath,
  installScreenshotWidth,
  sampleLgtmScreenshotHeight,
  sampleLgtmScreenshotPath,
  sampleLgtmScreenshotWidth,
} from "@/features/docs/functions/github-app-text";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * GitHub Appページの各セクションを表示するコンポーネント
 */
function Section({ title, children }: SectionProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="shrink-0 font-bold text-orange-500 text-xl leading-7">
          {title}
        </h2>
        <div className="h-px flex-1 bg-orange-300" />
      </div>
      <div className="flex flex-col gap-2 text-base text-orange-900 leading-6">
        {children}
      </div>
    </div>
  );
}

export function DocsGitHubAppPage({ language, currentUrlPath }: Props) {
  const texts = getGitHubAppTexts(language);
  const basicFeatureDescription = getBasicFeatureFullDescription(language);

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-4 py-8 sm:gap-7 sm:px-10 sm:py-[60px]">
        {/* セクション1: LGTMeow GitHub App (概要) */}
        <Section title={texts.overview.title}>
          <p>
            {texts.overview.beforeLink}
            <a
              className="text-cyan-500 hover:underline"
              href={texts.overview.linkUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {texts.overview.linkText}
            </a>
            {texts.overview.afterLink}
          </p>
        </Section>

        {/* セクション2: インストール */}
        <Section title={texts.install.title}>
          <p>
            {texts.install.beforeLink}
            <a
              className="text-cyan-500 hover:underline"
              href={texts.install.linkUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {texts.install.linkText}
            </a>
            {texts.install.afterLink}
          </p>
          <div className="mt-4 flex justify-center">
            <Image
              alt={texts.install.screenshotAlt}
              className="rounded-lg border border-orange-200"
              height={installScreenshotHeight}
              loading="lazy"
              src={installScreenshotPath}
              width={installScreenshotWidth}
            />
          </div>
        </Section>

        {/* セクション3: 基本機能 LGTM画像の自動投稿 */}
        <Section title={texts.basicFeature.title}>
          <p>{texts.basicFeature.intro}</p>
          <p>
            {basicFeatureDescription.beforeApprove}
            <code className="rounded bg-orange-100 px-1.5 py-0.5 font-mono text-orange-800 text-sm">
              {basicFeatureDescription.approveText}
            </code>
            {basicFeatureDescription.afterApprove}
          </p>
          <div className="mt-4 flex justify-center">
            <Image
              alt={texts.basicFeature.screenshotAlt}
              className="rounded-lg border border-orange-200"
              height={sampleLgtmScreenshotHeight}
              loading="lazy"
              src={sampleLgtmScreenshotPath}
              width={sampleLgtmScreenshotWidth}
            />
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
```

---

### 6. src/features/docs/components/docs-github-app-page.stories.tsx の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsGitHubAppPage } from "./docs-github-app-page";

const meta = {
  component: DocsGitHubAppPage,
  title: "features/docs/DocsGitHubAppPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsGitHubAppPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版GitHub Appドキュメントページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/github-app",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/github-app",
      },
    },
  },
};

/**
 * 英語版GitHub Appドキュメントページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/github-app",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/github-app",
      },
    },
  },
};
```

---

### 7. src/app/(default)/docs/github-app/page.tsx の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { DocsGitHubAppPage } from "@/features/docs/components/docs-github-app-page";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-github-app"].title,
  openGraph: {
    title: metaTagList(language)["docs-github-app"].title,
    url: metaTagList(language)["docs-github-app"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-github-app"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-github-app"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-github-app"].ja,
    languages: {
      ja: i18nUrlList["docs-github-app"].ja,
      en: i18nUrlList["docs-github-app"].en,
    },
  },
};

const DocsGitHubApp: NextPage = async () => {
  "use cache";
  cacheLife("max");

  return (
    <DocsGitHubAppPage
      currentUrlPath={createIncludeLanguageAppPath("docs-github-app", language)}
      language={language}
    />
  );
};

export default DocsGitHubApp;
```

---

### 8. src/app/(default)/en/docs/github-app/page.tsx の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { cacheLife } from "next/cache";
import { DocsGitHubAppPage } from "@/features/docs/components/docs-github-app-page";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-github-app"].title,
  openGraph: {
    title: metaTagList(language)["docs-github-app"].title,
    url: metaTagList(language)["docs-github-app"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-github-app"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-github-app"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-github-app"].en,
    languages: {
      ja: i18nUrlList["docs-github-app"].ja,
      en: i18nUrlList["docs-github-app"].en,
    },
  },
};

const EnDocsGitHubApp: NextPage = async () => {
  "use cache";
  cacheLife("max");

  return (
    <DocsGitHubAppPage
      currentUrlPath={createIncludeLanguageAppPath("docs-github-app", language)}
      language={language}
    />
  );
};

export default EnDocsGitHubApp;
```

---

### 9. src/app/sitemap.xml の修正

**追加位置**: `/en/docs/mcp/` エントリの `</url>` 終了タグの直後（171行目の後、172行目の `</urlset>` の前）

**追加するエントリ**:

```xml
  <url>
    <loc>https://lgtmeow.com/docs/github-app/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/github-app/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/github-app/"/>
  </url>
  <url>
    <loc>https://lgtmeow.com/en/docs/github-app/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/github-app/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/github-app/"/>
  </url>
```

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/url.ts` | `appPathList`, `AppPathName`, `i18nUrlList` に `"docs-github-app"` を追加 |
| `src/features/meta-tag.ts` | `docsGitHubAppPageTitle` 関数追加、`metaTagList` に `"docs-github-app"` を追加 |
| `src/features/docs/functions/github-app-text.ts` | **新規作成** - テキスト取得関数 |
| `src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts` | **新規作成** - テキスト取得関数のテスト |
| `src/features/docs/components/docs-github-app-page.tsx` | **新規作成** - ページコンポーネント |
| `src/features/docs/components/docs-github-app-page.stories.tsx` | **新規作成** - Storybook |
| `src/app/(default)/docs/github-app/page.tsx` | **新規作成** - 日本語版ルーティング |
| `src/app/(default)/en/docs/github-app/page.tsx` | **新規作成** - 英語版ルーティング |
| `src/app/sitemap.xml` | `/docs/github-app` エントリ追加 |

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: URL・メタタグの拡張

1. `src/features/url.ts` を修正
   - `appPathList` に `"docs-github-app": "/docs/github-app"` を追加
   - `AppPathName` 型に `| "docs-github-app"` を追加
   - `i18nUrlList` に `"docs-github-app"` エントリを追加

2. `src/features/meta-tag.ts` を修正
   - `docsGitHubAppPageTitle` 関数を追加
   - `metaTagList` に `"docs-github-app"` エントリを追加

### Phase 2: テキスト取得関数の作成

3. `src/features/docs/functions/github-app-text.ts` を新規作成

### Phase 3: テキスト取得関数のテスト作成

4. `src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts` を新規作成

### Phase 4: ページコンポーネントの作成

5. `src/features/docs/components/docs-github-app-page.tsx` を新規作成

### Phase 5: Storybookの作成

6. `src/features/docs/components/docs-github-app-page.stories.tsx` を新規作成

### Phase 6: ルーティングファイルの作成

7. `src/app/(default)/docs/github-app/page.tsx` を新規作成
8. `src/app/(default)/en/docs/github-app/page.tsx` を新規作成

### Phase 7: sitemap.xmlの更新

9. `src/app/sitemap.xml` に `/docs/github-app` エントリを追加

### Phase 8: 品質管理

10. `npm run format` を実行してコードをフォーマット
11. `npm run lint` を実行してLintエラーがないことを確認
12. `npm run test` を実行して全てパスすることを確認
13. Chrome DevTools MCP で `http://localhost:2222/docs/github-app` にアクセスして表示確認
14. Chrome DevTools MCP で `http://localhost:2222/en/docs/github-app` にアクセスして英語版の表示確認
15. Chrome DevTools MCP で `http://localhost:6006/` にアクセスしてStorybookの表示確認

**重要**: 各Phase完了後は次のPhaseに進む前に、変更が正しく動作することを確認すること

---

## 品質管理手順

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

Chrome DevTools MCP を使って以下のURLにアクセスし確認:

#### 日本語版 (`http://localhost:2222/docs/github-app`)

- [ ] ページ全体が正常に表示される
- [ ] 3つのセクションが順番通りに表示される
- [ ] 各セクションの見出しにオレンジ色の下線が表示される
- [ ] GitHub App へのリンクが正しく機能する
- [ ] インストール画面のスクリーンショットが正常に表示される
- [ ] LGTM投稿例のスクリーンショットが正常に表示される

#### 英語版 (`http://localhost:2222/en/docs/github-app`)

- [ ] ページ全体が正常に表示される
- [ ] 3つのセクションが英語で表示される
- [ ] 全てのテキストが英語で表示される

#### レスポンシブ確認

Chrome DevTools のデバイスツールバーを使用:

- [ ] デスクトップ (1280px以上): 適切なレイアウトで表示
- [ ] タブレット (768px): 適切に縮小表示
- [ ] モバイル (375px): 適切にスタック表示

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし確認:

- [ ] `features/docs/DocsGitHubAppPage` がサイドバーに表示される
- [ ] Japanese ストーリーが正常に表示される
- [ ] English ストーリーが正常に表示される
- [ ] 画像が正常に読み込まれる

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **Issueで指定されていないセクションの追加禁止**
3. **画像アセットの追加・変更禁止** - 既存の画像をそのまま使用
4. **既存のコンポーネントへの不必要な変更禁止**

---

## 成功基準

以下を全て満たすこと:

### ファイルの作成・修正

- [ ] `src/features/url.ts` が正しく修正されている
- [ ] `src/features/meta-tag.ts` が正しく修正されている
- [ ] `src/features/docs/functions/github-app-text.ts` が新規作成されている
- [ ] `src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts` が新規作成されている
- [ ] `src/features/docs/components/docs-github-app-page.tsx` が新規作成されている
- [ ] `src/features/docs/components/docs-github-app-page.stories.tsx` が新規作成されている
- [ ] `src/app/(default)/docs/github-app/page.tsx` が新規作成されている
- [ ] `src/app/(default)/en/docs/github-app/page.tsx` が新規作成されている
- [ ] `src/app/sitemap.xml` に `/docs/github-app` エントリが追加されている

### コンテンツ確認

- [ ] 3つのセクションが全て表示される
- [ ] 日本語版と英語版で適切なテキストが表示される
- [ ] 2つのスクリーンショット画像が正しく表示される
- [ ] GitHub App へのリンクが正しく動作する

### スタイリング確認

- [ ] 既存のドキュメントページに準拠したスタイリング
- [ ] 見出しにオレンジ色の下線
- [ ] レスポンシブ対応

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 機能確認

- [ ] `/docs/github-app` が正常に表示される
- [ ] `/en/docs/github-app` が正常に表示される

---

## トラブルシューティング

### 画像が表示されない場合

**原因**: 画像パスが間違っている可能性

**対処法**:
1. `public/screenshots/github app-Install.webp` が存在するか確認（ファイル名に空白あり）
2. `public/screenshots/github-app-sample-lgtm.webp` が存在するか確認
3. パスが `/screenshots/xxx.webp` (先頭にスラッシュ) になっているか確認

### TypeScript エラーが発生する場合

**原因**: `AppPathName` 型や `metaTagList` への追加漏れ

**対処法**:
1. `src/features/url.ts` の `AppPathName` 型に `"docs-github-app"` が追加されているか確認
2. `src/features/meta-tag.ts` の `metaTagList` に `"docs-github-app"` が追加されているか確認

### Lintエラーが発生する場合

**対処法**:
1. `npm run format` を実行してコードをフォーマット
2. 再度 `npm run lint` を実行して確認
3. エラーメッセージに従って手動で修正

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: URL・メタタグの拡張
- [ ] `src/features/url.ts` の `appPathList` に追加
- [ ] `src/features/url.ts` の `AppPathName` 型に追加
- [ ] `src/features/url.ts` の `i18nUrlList` に追加
- [ ] `src/features/meta-tag.ts` に `docsGitHubAppPageTitle` 関数を追加
- [ ] `src/features/meta-tag.ts` の `metaTagList` に追加

### Phase 2: テキスト取得関数の作成
- [ ] `src/features/docs/functions/github-app-text.ts` を新規作成

### Phase 3: テキスト取得関数のテスト作成
- [ ] `src/features/docs/functions/__tests__/github-app-text/get-github-app-texts.test.ts` を新規作成

### Phase 4: ページコンポーネントの作成
- [ ] `src/features/docs/components/docs-github-app-page.tsx` を新規作成

### Phase 5: Storybookの作成
- [ ] `src/features/docs/components/docs-github-app-page.stories.tsx` を新規作成

### Phase 6: ルーティングファイルの作成
- [ ] `src/app/(default)/docs/github-app/page.tsx` を新規作成
- [ ] `src/app/(default)/en/docs/github-app/page.tsx` を新規作成

### Phase 7: sitemap.xmlの更新
- [ ] `src/app/sitemap.xml` に `/docs/github-app` エントリを追加

### Phase 8: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で `/docs/github-app` の表示確認完了
- [ ] Chrome DevTools MCP で `/en/docs/github-app` の表示確認完了
- [ ] Chrome DevTools MCP で `http://localhost:6006/` の表示確認完了

### 最終確認
- [ ] 3つのセクションが全て正しく表示される
- [ ] 日英両方の言語で正常に動作する
- [ ] テストコードが全てパスする
- [ ] sitemap.xml に正しいエントリが追加されている
- [ ] 不要な変更が含まれていない
