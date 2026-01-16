# Issue #435: 使い方 `GET /docs/how-to-use` ページの実装 - 詳細実装計画書

## 概要

### 目的

現在「Coming Soon」が表示されている使い方ページ (`/docs/how-to-use`, `/en/docs/how-to-use`) に、LGTMeowの使い方に関する詳細なコンテンツを実装する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/435

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS v4
- **Storybook**: v10系

---

## 現状分析

### 対象ファイル

| ファイルパス | 現状 | 変更内容 |
|-------------|------|----------|
| `src/features/docs/components/docs-how-to-use-page.tsx` | "Coming Soon" 表示 | コンテンツ実装 |
| `src/features/docs/functions/how-to-use-text.ts` | **新規作成** | テキスト取得関数 |
| `src/features/docs/__tests__/functions/how-to-use-text.test.ts` | **新規作成** | テキスト取得関数のテスト |
| `src/features/docs/components/docs-how-to-use-page.stories.tsx` | **新規作成** | Storybook |
| `src/app/sitemap.xml` | 既存 | `/docs/how-to-use` エントリ追加 |

### 既存の関連ファイル (変更不要)

| ファイルパス | 役割 |
|-------------|------|
| `src/app/(default)/docs/how-to-use/page.tsx` | 日本語版ルーティング |
| `src/app/(default)/en/docs/how-to-use/page.tsx` | 英語版ルーティング |
| `src/features/docs/functions/how-to-use.ts` | リンク生成関数 (既存) |
| `src/features/url.ts` | URL生成関数 |
| `src/features/main/service-description-text.ts` | ボタン文言取得関数 |
| `src/components/page-layout.tsx` | 共通レイアウト |
| `public/screenshots/lgtm-image-preview.webp` | 説明用スクリーンショット画像 |

### 参考にする既存実装

| ファイルパス | 参考ポイント |
|-------------|-------------|
| `src/features/privacy/components/privacy-page.tsx` | PageLayoutの使用パターン、mainClassName設定 |
| `src/components/markdown-content.tsx` | マークダウンスタイリング (色設定等) |
| `src/features/main/components/service-description.tsx` | テキスト取得関数の使用パターン |

---

## 仕様詳細

### Figmaデザイン

- メインデザイン: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=190-2892&m=dev
- AIアシスタント機能 (未実装): https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=230-3383&m=dev

### デザイン構成

Figmaデザインに基づき、各セクションは以下の構成で表示:

1. **セクション見出し**: オレンジ色 (`text-orange-500`) + 下線 (`border-orange-300`)
2. **本文**: オレンジ系テキスト (`text-orange-900`)
3. **リンク**: シアン色 (`text-cyan-500`)

### セクション構成 (Issue仕様に準拠)

| 順番 | セクション名 (日本語) | セクション名 (英語) |
|------|----------------------|---------------------|
| 1 | LGTMとは? | What is LGTM? |
| 2 | LGTMeowとは | What is LGTMeow? |
| 3 | LGTM画像を選んでコピーする | Copy LGTM Image by Clicking |
| 4 | LGTM画像をランダムでコピーする | Copy Random LGTM Image |
| 5 | 猫画像をアップロードしてLGTM画像を作成する | Create LGTM Image by Uploading Cat Photo |
| 6 | お問い合わせ | Contact |

### 各セクションの詳細コンテンツ

#### 1. LGTMとは?

**日本語**:
```
「Looks Good To Me」の略で、「私は良いと思う」という意味です。
エンジニアの間では PR を Approve する際に LGTM(Looks Good To Me)を伝えるために画像を貼る文化があります。
```

**英語**:
```
LGTM stands for "Looks Good To Me."
Among engineers, there is a culture of posting LGTM images when approving a PR to convey "Looks Good To Me."
```

#### 2. LGTMeowとは

**日本語**:
```
可愛い猫のLGTM画像を作成して共有できるサービスです。
他のLGTM画像サービスとは違って可愛い猫が写っているLGTM画像を探したり、作ったりできるのが特徴です。
```

**英語**:
```
LGTMeow is a service for creating and sharing cute cat LGTM images.
Unlike other LGTM image services, LGTMeow specializes in finding and creating LGTM images featuring adorable cats.
```

#### 3. LGTM画像を選んでコピーする

**日本語** (動的に生成):
```
[HOME]({homeUrl}) に並んでいるLGTM画像をクリックするとGitHubに貼り付ける為のマークダウンソースがクリップボードにコピーされます。

表示されている猫の画像ですが以下の2つのボタンを押下すると切り替える事が可能です。

- `{refreshCats}` ボタンを押下するとサーバーからランダムに取得したLGTM画像を表示します(押下する度に結果が変わります)
- `{latestCats}` ボタンを押下すると最近アップロードされたLGTM画像を表示します
```

**英語** (動的に生成):
```
Click on an LGTM image displayed on the [HOME]({homeUrl}) to copy the GitHub markdown source to your clipboard.

You can switch the displayed cat images using these two buttons:

- Click the `{refreshCats}` button to display randomly fetched LGTM images from the server (results change with each click)
- Click the `{latestCats}` button to display the most recently uploaded LGTM images
```

**スクリーンショット**: `/screenshots/lgtm-image-preview.webp` を表示

#### 4. LGTM画像をランダムでコピーする

**日本語** (動的に生成):
```
[HOME]({homeUrl}) にある `{randomCopy}` ボタンを押下するとサーバーからランダムで取得したLGTM画像のマークダウンソースがクリップボードにコピーされます。
```

**英語** (動的に生成):
```
Click the `{randomCopy}` button on the [HOME]({homeUrl}) to copy a randomly fetched LGTM image's markdown source to your clipboard.
```

#### 5. 猫画像をアップロードしてLGTM画像を作成する

**日本語** (動的に生成):
```
[アップロード]({uploadUrl}) (Headerにリンクがあります)からオリジナルの猫画像を使ったLGTM画像が生成されます。

アップロードすると `LGTMeow` の文字が入ったLGTM画像が作成されます。

制約条件等は [アップロード]({uploadUrl}) に注意書きがありますのでご覧ください。
```

**英語** (動的に生成):
```
Upload your original cat photo from the [Upload]({uploadUrl}) page (link available in the header) to generate an LGTM image.

When you upload an image, an LGTM image with the "LGTMeow" text will be created.

Please refer to the [Upload]({uploadUrl}) page for constraints and guidelines.
```

#### 6. お問い合わせ

**日本語**:
```
質問、機能リクエスト等は大歓迎です

お問い合わせは2つの手段があります。

1. 以下のリポジトリからIssueを作成する
   https://github.com/nekochans/lgtm-cat/issues

2. お問い合わせフォームに必要情報を入力
   https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform
```

**英語**:
```
Questions and feature requests are always welcome!

There are two ways to contact us:

1. Create an issue in our repository
   https://github.com/nekochans/lgtm-cat/issues

2. Fill out the contact form
   https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform
```

**実装上の注意**: お問い合わせセクションは `<ol>` タグを使用してセマンティックなHTMLを実現します。番号はHTMLが自動付与するため、テキストデータには含めません。

---

## 依存関係の確認

### 使用する既存関数

#### `appBaseUrl()` (src/features/url.ts:19-24)

```typescript
export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return defaultAppUrl; // "https://lgtmeow.com"
}
```

#### `createIncludeLanguageAppPath()` (src/features/url.ts:91-102)

```typescript
export function createIncludeLanguageAppPath(
  appPathName: AppPathName,
  language: Language
): IncludeLanguageAppPath {
  if (appPathName === "home" && language === "en") {
    return `/${language}`;
  }
  return language === "en"
    ? (`/en${appPathList[appPathName]}` as const)
    : appPathList[appPathName];
}
```

#### `getActionButtonText()` (src/features/main/service-description-text.ts:30-51)

```typescript
export function getActionButtonText(language: Language): {
  readonly randomCopy: string;
  readonly refreshCats: string;
  readonly latestCats: string;
} {
  switch (language) {
    case "ja":
      return {
        randomCopy: "ランダムコピー",
        refreshCats: "ねこリフレッシュ",
        latestCats: "ねこ新着順",
      };
    case "en":
      return {
        randomCopy: "Copy Random Cat",
        refreshCats: "Refresh Cats",
        latestCats: "Show Latest Cats",
      };
    default:
      return assertNever(language);
  }
}
```

### 型定義の確認

**Language型** (`src/features/language.ts`):
```typescript
export type Language = "en" | "ja";
```

**IncludeLanguageAppPath型** (`src/features/url.ts`):
```typescript
export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";
```

---

## 設計方針

### 方針概要

1. **テキスト取得関数を新規作成**: `src/features/docs/functions/how-to-use-text.ts` に各セクションのテキストを返す関数を作成
2. **コンポーネント構造**: セクション単位のサブコンポーネントを作成せず、メインコンポーネント内で直接レンダリング
3. **スタイリング**: Figmaデザインに準拠したTailwind CSSクラスを使用
4. **画像表示**: `public/screenshots/lgtm-image-preview.webp` を使用 (Next.js Image コンポーネント使用)
5. **リンクの処理**: 内部リンク (HOMEやアップロードページ) は同じタブで開き、外部リンク (GitHub Issues, Google Forms) は新しいタブで開く

### アクセシビリティ考慮事項

- **セマンティックHTML**: セクション見出しには `<h2>` を使用、リストには適切な `<ul>` / `<ol>` を使用
- **画像のalt属性**: スクリーンショット画像には言語に応じた適切なalt属性を設定
- **リンクのセキュリティ**: 外部リンクには `rel="noopener noreferrer"` を設定
- **フォーカス可能な要素**: 全てのリンクはキーボードでアクセス可能

### 画像サイズについて

- **元画像サイズ**: 1270 x 818 ピクセル
- **表示サイズ**: 635 x 409 ピクセル (元サイズの半分、アスペクト比維持)
- **理由**: Retinaディスプレイでも鮮明に表示されるよう、実際の表示サイズの2倍の解像度を持つ画像を使用

### コンポーネント構成

```
DocsHowToUsePage
├── PageLayout
│   ├── Header
│   └── Footer
└── コンテンツエリア
    ├── Section: LGTMとは?
    ├── Section: LGTMeowとは
    ├── Section: LGTM画像を選んでコピーする (+ 画像)
    ├── Section: LGTM画像をランダムでコピーする
    ├── Section: 猫画像をアップロードしてLGTM画像を作成する
    └── Section: お問い合わせ
```

### レイアウト設計

Figmaデザインに基づき、以下のレイアウトを採用:

```
コンテナ: max-w-[1020px] px-[40px] py-[60px]
セクション間隔: gap-[28px]
見出し + 下線: flex gap-2 items-center
本文間隔: gap-[8px]
```

---

## 変更内容

### 1. src/features/docs/functions/how-to-use-text.ts の新規作成

**ファイルパス**: `src/features/docs/functions/how-to-use-text.ts`

**コード**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { getActionButtonText } from "@/features/main/service-description-text";
import { appBaseUrl, createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export interface HowToUseSectionText {
  readonly title: string;
  readonly content: readonly string[];
}

export interface HowToUseContactText {
  readonly title: string;
  readonly intro: string;
  readonly methodsIntro: string;
  readonly issueLabel: string;
  readonly issueLinkText: string;
  readonly formLabel: string;
  readonly formLinkText: string;
  readonly issueUrl: string;
  readonly formUrl: string;
}

export interface HowToUseTexts {
  readonly whatIsLgtm: HowToUseSectionText;
  readonly whatIsLgtmeow: HowToUseSectionText;
  readonly copyByClicking: {
    readonly title: string;
    readonly intro: string;
    readonly buttonDescription: readonly string[];
    readonly screenshotDescription: string;
  };
  readonly copyRandom: {
    readonly title: string;
    readonly content: string;
  };
  readonly uploadCatPhoto: {
    readonly title: string;
    readonly content: readonly string[];
  };
  readonly contact: HowToUseContactText;
}

export function getHowToUseTexts(language: Language): HowToUseTexts {
  const baseUrl = appBaseUrl();
  const homePath = createIncludeLanguageAppPath("home", language);
  const homeUrl = homePath === "/" ? baseUrl : `${baseUrl}${homePath}`;
  const uploadPath = createIncludeLanguageAppPath("upload", language);
  const uploadUrl = `${baseUrl}${uploadPath}`;
  const buttonText = getActionButtonText(language);

  switch (language) {
    case "ja":
      return {
        whatIsLgtm: {
          title: "LGTMとは?",
          content: [
            "「Looks Good To Me」の略で、「私は良いと思う」という意味です。",
            "エンジニアの間では PR を Approve する際に LGTM(Looks Good To Me)を伝えるために画像を貼る文化があります。",
          ],
        },
        whatIsLgtmeow: {
          title: "LGTMeowとは",
          content: [
            "可愛い猫のLGTM画像を作成して共有できるサービスです。",
            "他のLGTM画像サービスとは違って可愛い猫が写っているLGTM画像を探したり、作ったりできるのが特徴です。",
          ],
        },
        copyByClicking: {
          title: "LGTM画像を選んでコピーする",
          intro: `[HOME](${homeUrl}) に並んでいるLGTM画像をクリックするとGitHubに貼り付ける為のマークダウンソースがクリップボードにコピーされます。`,
          buttonDescription: [
            "表示されている猫の画像ですが以下の2つのボタンを押下すると切り替える事が可能です。",
            `\`${buttonText.refreshCats}\` ボタンを押下するとサーバーからランダムに取得したLGTM画像を表示します(押下する度に結果が変わります)`,
            `\`${buttonText.latestCats}\` ボタンを押下すると最近アップロードされたLGTM画像を表示します`,
          ],
          screenshotDescription:
            "GitHubにマークダウンソースを貼り付けると以下のようになります。",
        },
        copyRandom: {
          title: "LGTM画像をランダムでコピーする",
          content: `[HOME](${homeUrl}) にある \`${buttonText.randomCopy}\` ボタンを押下するとサーバーからランダムで取得したLGTM画像のマークダウンソースがクリップボードにコピーされます。`,
        },
        uploadCatPhoto: {
          title: "猫画像をアップロードしてLGTM画像を作成する",
          content: [
            `[アップロード](${uploadUrl}) (Headerにリンクがあります)からオリジナルの猫画像を使ったLGTM画像が生成されます。`,
            "アップロードすると `LGTMeow` の文字が入ったLGTM画像が作成されます。",
            `制約条件等は [アップロード](${uploadUrl}) に注意書きがありますのでご覧ください。`,
          ],
        },
        contact: {
          title: "お問い合わせ",
          intro: "質問、機能リクエスト等は大歓迎です",
          methodsIntro: "お問い合わせは2つの手段があります。",
          issueLabel: "以下のリポジトリからIssueを作成する",
          issueLinkText: "GitHub Issues",
          formLabel: "お問い合わせフォームに必要情報を入力",
          formLinkText: "お問い合わせフォーム",
          issueUrl: "https://github.com/nekochans/lgtm-cat/issues",
          formUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform",
        },
      };
    case "en":
      return {
        whatIsLgtm: {
          title: "What is LGTM?",
          content: [
            'LGTM stands for "Looks Good To Me."',
            'Among engineers, there is a culture of posting LGTM images when approving a PR to convey "Looks Good To Me."',
          ],
        },
        whatIsLgtmeow: {
          title: "What is LGTMeow?",
          content: [
            "LGTMeow is a service for creating and sharing cute cat LGTM images.",
            "Unlike other LGTM image services, LGTMeow specializes in finding and creating LGTM images featuring adorable cats.",
          ],
        },
        copyByClicking: {
          title: "Copy LGTM Image by Clicking",
          intro: `Click on an LGTM image displayed on the [HOME](${homeUrl}) to copy the GitHub markdown source to your clipboard.`,
          buttonDescription: [
            "You can switch the displayed cat images using these two buttons:",
            `Click the \`${buttonText.refreshCats}\` button to display randomly fetched LGTM images from the server (results change with each click)`,
            `Click the \`${buttonText.latestCats}\` button to display the most recently uploaded LGTM images`,
          ],
          screenshotDescription:
            "When you paste the markdown source into GitHub, it will look like this:",
        },
        copyRandom: {
          title: "Copy Random LGTM Image",
          content: `Click the \`${buttonText.randomCopy}\` button on the [HOME](${homeUrl}) to copy a randomly fetched LGTM image's markdown source to your clipboard.`,
        },
        uploadCatPhoto: {
          title: "Create LGTM Image by Uploading Cat Photo",
          content: [
            `Upload your original cat photo from the [Upload](${uploadUrl}) page (link available in the header) to generate an LGTM image.`,
            'When you upload an image, an LGTM image with the "LGTMeow" text will be created.',
            `Please refer to the [Upload](${uploadUrl}) page for constraints and guidelines.`,
          ],
        },
        contact: {
          title: "Contact",
          intro: "Questions and feature requests are always welcome!",
          methodsIntro: "There are two ways to contact us:",
          issueLabel: "Create an issue in our repository",
          issueLinkText: "GitHub Issues",
          formLabel: "Fill out the contact form",
          formLinkText: "Contact Form",
          issueUrl: "https://github.com/nekochans/lgtm-cat/issues",
          formUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform",
        },
      };
    default:
      return assertNever(language);
  }
}

/**
 * LGTM画像を選んでコピーするセクションで表示する説明用スクリーンショットのパス
 * public/screenshots/lgtm-image-preview.webp を参照
 */
export const howToUseScreenshotPath = "/screenshots/lgtm-image-preview.webp";
```

**エクスポートされる型・関数:**
- `HowToUseSectionText` - セクションテキストの型定義
- `HowToUseContactText` - お問い合わせセクションの型定義 (formLinkText含む)
- `HowToUseTexts` - 全テキストの型定義
- `getHowToUseTexts(language)` - テキスト取得関数
- `howToUseScreenshotPath` - スクリーンショット画像パス定数

---

### 2. src/features/docs/components/docs-how-to-use-page.tsx の修正

**ファイルパス**: `src/features/docs/components/docs-how-to-use-page.tsx`

**現在のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

export function DocsHowToUsePage({ language, currentUrlPath }: Props) {
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

**変更後のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/page-layout";
import {
  getHowToUseTexts,
  howToUseScreenshotPath,
} from "@/features/docs/functions/how-to-use-text";
import type { Language } from "@/features/language";
import { appBaseUrl } from "@/features/url";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="shrink-0 font-bold text-orange-500 text-xl leading-7">
          # {title}
        </h2>
        <div className="h-px flex-1 bg-orange-300" />
      </div>
      <div className="flex flex-col gap-2 text-base text-orange-900 leading-6">
        {children}
      </div>
    </div>
  );
}

interface TextWithLinksProps {
  readonly text: string;
  readonly baseUrl: string;
}

/**
 * URLが内部リンクかどうかを判定する
 * @param url - 判定対象のURL
 * @param baseUrl - アプリケーションのベースURL
 * @returns 内部リンクの場合true
 */
function isInternalUrl(url: string, baseUrl: string): boolean {
  // 相対パスは内部リンク
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return true;
  }
  // appBaseUrl() のドメインと一致する場合は内部リンク
  return url.startsWith(baseUrl);
}

/**
 * マークダウン形式のリンクとコードをパースしてReact要素に変換するコンポーネント
 *
 * 注意事項:
 * - このコンポーネントは <p> タグを返すため、<li> 内で使用する場合は
 *   スタイリングに影響がないことを確認すること
 * - 現在のマークダウンパーサーはシンプルな [text](url) 形式のみをサポート
 * - ネストした括弧やエスケープ文字を含むURLは非対応
 */
function TextWithLinks({ text, baseUrl }: TextWithLinksProps) {
  // マークダウン形式のリンク [text](url) をパースして変換
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return (
    <p>
      {parts.map((part, partIndex) => {
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const [, linkText, linkUrl] = linkMatch;
          // 内部リンクは同じタブで開く、外部リンクは新しいタブで開く
          const isInternal = isInternalUrl(linkUrl, baseUrl);
          return (
            <a
              key={`link-${partIndex}`}
              className="text-cyan-500 hover:underline"
              href={linkUrl}
              {...(!isInternal && {
                rel: "noopener noreferrer",
                target: "_blank",
              })}
            >
              {linkText}
            </a>
          );
        }
        // バッククォートで囲まれたテキストをコードとして表示
        const codeParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={`text-group-${partIndex}`}>
            {codeParts.map((codePart, codeIndex) => {
              const codeMatch = codePart.match(/`([^`]+)`/);
              if (codeMatch) {
                return (
                  <code
                    key={`code-${partIndex}-${codeIndex}`}
                    className="rounded bg-orange-100 px-1 py-0.5 font-mono text-orange-800"
                  >
                    {codeMatch[1]}
                  </code>
                );
              }
              return codePart;
            })}
          </span>
        );
      })}
    </p>
  );
}

export function DocsHowToUsePage({ language, currentUrlPath }: Props) {
  const texts = getHowToUseTexts(language);
  const baseUrl = appBaseUrl();

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-7 px-10 py-[60px]">
        {/* セクション1: LGTMとは? */}
        <Section title={texts.whatIsLgtm.title}>
          {texts.whatIsLgtm.content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </Section>

        {/* セクション2: LGTMeowとは */}
        <Section title={texts.whatIsLgtmeow.title}>
          {texts.whatIsLgtmeow.content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </Section>

        {/* セクション3: LGTM画像を選んでコピーする */}
        <Section title={texts.copyByClicking.title}>
          <TextWithLinks baseUrl={baseUrl} text={texts.copyByClicking.intro} />
          <p>{texts.copyByClicking.buttonDescription[0]}</p>
          <ul className="list-disc pl-6">
            <li>
              <TextWithLinks baseUrl={baseUrl} text={texts.copyByClicking.buttonDescription[1]} />
            </li>
            <li>
              <TextWithLinks baseUrl={baseUrl} text={texts.copyByClicking.buttonDescription[2]} />
            </li>
          </ul>
          <p className="mt-4">{texts.copyByClicking.screenshotDescription}</p>
          <div className="flex justify-center">
            <Image
              alt={
                language === "ja"
                  ? "GitHubでのLGTM画像表示例"
                  : "Example of LGTM image displayed on GitHub"
              }
              className="rounded-lg border border-orange-200"
              height={409}
              src={howToUseScreenshotPath}
              width={635}
            />
          </div>
        </Section>

        {/* セクション4: LGTM画像をランダムでコピーする */}
        <Section title={texts.copyRandom.title}>
          <TextWithLinks baseUrl={baseUrl} text={texts.copyRandom.content} />
        </Section>

        {/* セクション5: 猫画像をアップロードしてLGTM画像を作成する */}
        <Section title={texts.uploadCatPhoto.title}>
          {texts.uploadCatPhoto.content.map((line, index) => (
            <TextWithLinks baseUrl={baseUrl} key={index} text={line} />
          ))}
        </Section>

        {/* セクション6: お問い合わせ */}
        <Section title={texts.contact.title}>
          <p>{texts.contact.intro}</p>
          <p>{texts.contact.methodsIntro}</p>
          <ol className="list-decimal pl-6">
            <li>
              <span className="font-medium">{texts.contact.issueLabel}</span>
              <p className="mt-1">
                <a
                  className="text-cyan-500 hover:underline"
                  href={texts.contact.issueUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {texts.contact.issueLinkText}
                </a>
              </p>
            </li>
            <li>
              <span className="font-medium">{texts.contact.formLabel}</span>
              <p className="mt-1">
                <a
                  className="text-cyan-500 hover:underline"
                  href={texts.contact.formUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {texts.contact.formLinkText}
                </a>
              </p>
            </li>
          </ol>
        </Section>
      </div>
    </PageLayout>
  );
}
```

---

### 3. src/features/docs/__tests__/functions/how-to-use-text.test.ts の新規作成

**ファイルパス**: `src/features/docs/__tests__/functions/how-to-use-text.test.ts`

**コード**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import type { Language } from "@/features/language";
import {
  getHowToUseTexts,
  howToUseScreenshotPath,
} from "@/features/docs/functions/how-to-use-text";

describe("src/features/docs/functions/how-to-use-text.ts getHowToUseTexts TestCases", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  interface TestTable {
    readonly language: Language;
    readonly expectedWhatIsLgtmTitle: string;
    readonly expectedContactTitle: string;
  }

  it.each`
    language | expectedWhatIsLgtmTitle | expectedContactTitle
    ${"ja"}  | ${"LGTMとは?"}          | ${"お問い合わせ"}
    ${"en"}  | ${"What is LGTM?"}      | ${"Contact"}
  `(
    "should return correct titles when language is $language",
    ({ language, expectedWhatIsLgtmTitle, expectedContactTitle }: TestTable) => {
      const result = getHowToUseTexts(language);

      expect(result.whatIsLgtm.title).toBe(expectedWhatIsLgtmTitle);
      expect(result.contact.title).toBe(expectedContactTitle);
    },
  );

  it("should return Japanese texts with correct structure when language is ja", () => {
    const result = getHowToUseTexts("ja");

    // whatIsLgtm section
    expect(result.whatIsLgtm.content).toHaveLength(2);
    expect(result.whatIsLgtm.content[0]).toContain("Looks Good To Me");

    // whatIsLgtmeow section
    expect(result.whatIsLgtmeow.title).toBe("LGTMeowとは");
    expect(result.whatIsLgtmeow.content).toHaveLength(2);

    // copyByClicking section
    expect(result.copyByClicking.title).toBe("LGTM画像を選んでコピーする");
    expect(result.copyByClicking.intro).toContain("[HOME]");
    expect(result.copyByClicking.buttonDescription).toHaveLength(3);
    expect(result.copyByClicking.buttonDescription[1]).toContain(
      "ねこリフレッシュ",
    );
    expect(result.copyByClicking.buttonDescription[2]).toContain("ねこ新着順");
    expect(result.copyByClicking.screenshotDescription).toBe(
      "GitHubにマークダウンソースを貼り付けると以下のようになります。",
    );

    // copyRandom section
    expect(result.copyRandom.title).toBe("LGTM画像をランダムでコピーする");
    expect(result.copyRandom.content).toContain("ランダムコピー");

    // uploadCatPhoto section
    expect(result.uploadCatPhoto.title).toBe(
      "猫画像をアップロードしてLGTM画像を作成する",
    );
    expect(result.uploadCatPhoto.content).toHaveLength(3);
    expect(result.uploadCatPhoto.content[0]).toContain("[アップロード]");

    // contact section
    expect(result.contact.intro).toBe("質問、機能リクエスト等は大歓迎です");
    expect(result.contact.methodsIntro).toBe(
      "お問い合わせは2つの手段があります。",
    );
    expect(result.contact.issueLabel).toBe(
      "以下のリポジトリからIssueを作成する",
    );
    expect(result.contact.issueLinkText).toBe("GitHub Issues");
    expect(result.contact.formLabel).toBe(
      "お問い合わせフォームに必要情報を入力",
    );
    expect(result.contact.formLinkText).toBe("お問い合わせフォーム");
    expect(result.contact.issueUrl).toBe(
      "https://github.com/nekochans/lgtm-cat/issues",
    );
    expect(result.contact.formUrl).toContain("docs.google.com/forms");
  });

  it("should return English texts with correct structure when language is en", () => {
    const result = getHowToUseTexts("en");

    // whatIsLgtm section
    expect(result.whatIsLgtm.content).toHaveLength(2);
    expect(result.whatIsLgtm.content[0]).toContain("Looks Good To Me");

    // whatIsLgtmeow section
    expect(result.whatIsLgtmeow.title).toBe("What is LGTMeow?");
    expect(result.whatIsLgtmeow.content).toHaveLength(2);

    // copyByClicking section
    expect(result.copyByClicking.title).toBe("Copy LGTM Image by Clicking");
    expect(result.copyByClicking.intro).toContain("[HOME]");
    expect(result.copyByClicking.buttonDescription).toHaveLength(3);
    expect(result.copyByClicking.buttonDescription[1]).toContain("Refresh Cats");
    expect(result.copyByClicking.buttonDescription[2]).toContain(
      "Show Latest Cats",
    );
    expect(result.copyByClicking.screenshotDescription).toBe(
      "When you paste the markdown source into GitHub, it will look like this:",
    );

    // copyRandom section
    expect(result.copyRandom.title).toBe("Copy Random LGTM Image");
    expect(result.copyRandom.content).toContain("Copy Random Cat");

    // uploadCatPhoto section
    expect(result.uploadCatPhoto.title).toBe(
      "Create LGTM Image by Uploading Cat Photo",
    );
    expect(result.uploadCatPhoto.content).toHaveLength(3);
    expect(result.uploadCatPhoto.content[0]).toContain("[Upload]");

    // contact section
    expect(result.contact.intro).toBe(
      "Questions and feature requests are always welcome!",
    );
    expect(result.contact.methodsIntro).toBe(
      "There are two ways to contact us:",
    );
    expect(result.contact.issueLabel).toBe("Create an issue in our repository");
    expect(result.contact.issueLinkText).toBe("GitHub Issues");
    expect(result.contact.formLabel).toBe("Fill out the contact form");
    expect(result.contact.formLinkText).toBe("Contact Form");
    expect(result.contact.issueUrl).toBe(
      "https://github.com/nekochans/lgtm-cat/issues",
    );
    expect(result.contact.formUrl).toContain("docs.google.com/forms");
  });

  it("should include correct URLs when NEXT_PUBLIC_APP_URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://custom-domain.com");

    const result = getHowToUseTexts("ja");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://custom-domain.com)",
    );
    expect(result.uploadCatPhoto.content[0]).toContain(
      "[アップロード](https://custom-domain.com/upload)",
    );
  });

  it("should use default URL when NEXT_PUBLIC_APP_URL is not set", () => {
    const result = getHowToUseTexts("ja");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://lgtmeow.com)",
    );
    expect(result.uploadCatPhoto.content[0]).toContain(
      "[アップロード](https://lgtmeow.com/upload)",
    );
  });

  it("should include English upload path when language is en", () => {
    const result = getHowToUseTexts("en");

    expect(result.uploadCatPhoto.content[0]).toContain(
      "[Upload](https://lgtmeow.com/en/upload)",
    );
  });

  it("should include English home path when language is en", () => {
    const result = getHowToUseTexts("en");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://lgtmeow.com/en)",
    );
    expect(result.copyRandom.content).toContain(
      "[HOME](https://lgtmeow.com/en)",
    );
  });
});

describe("src/features/docs/functions/how-to-use-text.ts howToUseScreenshotPath TestCases", () => {
  it("should return correct screenshot path", () => {
    expect(howToUseScreenshotPath).toBe("/screenshots/lgtm-image-preview.webp");
  });
});
```

**テストの観点**:

1. **言語別タイトル確認**: `it.each` を使用して日本語・英語の両方でタイトルが正しく返されることを確認
2. **日本語テキスト構造確認**: 各セクションのコンテンツが正しい構造・値を持つことを確認
3. **英語テキスト構造確認**: 各セクションのコンテンツが正しい構造・値を持つことを確認
4. **カスタムURL確認**: `NEXT_PUBLIC_APP_URL` 環境変数が設定された場合の動作を確認
5. **デフォルトURL確認**: 環境変数が未設定の場合にデフォルトURL (`https://lgtmeow.com`) が使用されることを確認
6. **英語版アップロードパス確認**: 英語版で `/en/upload` パスが使用されることを確認
7. **スクリーンショットパス確認**: `howToUseScreenshotPath` 定数が正しい値を返すことを確認

---

### 4. src/features/docs/components/docs-how-to-use-page.stories.tsx の新規作成

**ファイルパス**: `src/features/docs/components/docs-how-to-use-page.stories.tsx`

**コード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsHowToUsePage } from "./docs-how-to-use-page";

const meta = {
  component: DocsHowToUsePage,
  title: "features/docs/DocsHowToUsePage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsHowToUsePage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版使い方ページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/how-to-use",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/how-to-use",
      },
    },
  },
};

/**
 * 英語版使い方ページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/how-to-use",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/how-to-use",
      },
    },
  },
};
```

---

### 5. src/app/sitemap.xml の修正

**ファイルパス**: `src/app/sitemap.xml`

**追加するエントリ** (既存の `</urlset>` タグの直前に追加):

```xml
  <url>
    <loc>https://lgtmeow.com/docs/how-to-use/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/how-to-use/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/how-to-use/"/>
  </url>
  <url>
    <loc>https://lgtmeow.com/en/docs/how-to-use/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/how-to-use/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/how-to-use/"/>
  </url>
```

**変更後の全体構成** (該当部分のみ抜粋):

```xml
  <!-- 既存のexternal-transmission-policyエントリの後に追加 -->
  <url>
    <loc>https://lgtmeow.com/docs/how-to-use/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/how-to-use/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/how-to-use/"/>
  </url>
  <url>
    <loc>https://lgtmeow.com/en/docs/how-to-use/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/how-to-use/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/how-to-use/"/>
  </url>
</urlset>
```

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/docs/functions/how-to-use-text.ts` | **新規作成** - テキスト取得関数 |
| `src/features/docs/__tests__/functions/how-to-use-text.test.ts` | **新規作成** - テキスト取得関数のテスト |
| `src/features/docs/components/docs-how-to-use-page.tsx` | コンテンツ実装 |
| `src/features/docs/components/docs-how-to-use-page.stories.tsx` | **新規作成** - Storybook |
| `src/app/sitemap.xml` | `/docs/how-to-use` エントリ追加 |

**注意**: 画像は `public/screenshots/lgtm-image-preview.webp` を使用するため、`next.config.ts` の変更は不要

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: テキスト取得関数の作成

1. `src/features/docs/functions/how-to-use-text.ts` を新規作成

### Phase 2: テキスト取得関数のテスト作成

2. `src/features/docs/__tests__/functions/how-to-use-text.test.ts` を新規作成

### Phase 3: コンポーネントの修正

3. `src/features/docs/components/docs-how-to-use-page.tsx` を修正

### Phase 4: Storybookの作成

4. `src/features/docs/components/docs-how-to-use-page.stories.tsx` を新規作成

### Phase 5: sitemap.xmlの更新

5. `src/app/sitemap.xml` に `/docs/how-to-use` エントリを追加

### Phase 6: 品質管理

6. `npm run format` を実行してコードをフォーマット
7. `npm run lint` を実行してLintエラーがないことを確認
8. `npm run test` を実行して全てパスすることを確認
9. Chrome DevTools MCP で `http://localhost:2222/docs/how-to-use` にアクセスして表示確認
10. Chrome DevTools MCP で `http://localhost:2222/en/docs/how-to-use` にアクセスして英語版の表示確認
11. Chrome DevTools MCP で `http://localhost:6006/` にアクセスしてStorybookの表示確認

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

#### 日本語版 (`http://localhost:2222/docs/how-to-use`)

- [ ] ページ全体が正常に表示される
- [ ] 6つのセクションが順番通りに表示される
- [ ] 各セクションの見出しにオレンジ色の下線が表示される
- [ ] リンクがシアン色で表示され、クリック可能
- [ ] ボタン名 (`ねこリフレッシュ`, `ねこ新着順`, `ランダムコピー`) がコード風に表示される
- [ ] スクリーンショット画像 (黒猫のLGTM画像) が正常に表示される
- [ ] お問い合わせセクションのリンクが正常に動作する

#### 英語版 (`http://localhost:2222/en/docs/how-to-use`)

- [ ] ページ全体が正常に表示される
- [ ] 6つのセクションが英語で表示される
- [ ] ボタン名 (`Refresh Cats`, `Show Latest Cats`, `Copy Random Cat`) が英語で表示される
- [ ] リンクが正しいURL (英語版パス) を指している

#### レスポンシブ確認

Chrome DevTools のデバイスツールバーを使用:

- [ ] デスクトップ (1280px以上): 適切なレイアウトで表示
- [ ] タブレット (768px): 適切に縮小表示
- [ ] モバイル (375px): 適切にスタック表示

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし確認:

- [ ] `features/docs/DocsHowToUsePage` がサイドバーに表示される
- [ ] Japanese ストーリーが正常に表示される
- [ ] English ストーリーが正常に表示される
- [ ] 画像が正常に読み込まれる
- [ ] リンクが正しく表示される

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のルーティングファイル (`src/app/` 配下) の変更禁止** - コンポーネントのみ修正
3. **既存の関数 (`appBaseUrl`, `getActionButtonText` 等) の変更禁止**
4. **Issueで指定されていないセクションの追加禁止**
5. **AIアシスタント機能 (Figma node-id=230-3383) の実装禁止** - Issueで「まだ未実装なので実装しなくても問題ありません」と明記

---

## 成功基準

以下を全て満たすこと:

### ファイルの作成・修正

- [ ] `src/features/docs/functions/how-to-use-text.ts` が新規作成されている
- [ ] `src/features/docs/__tests__/functions/how-to-use-text.test.ts` が新規作成されている
- [ ] `src/features/docs/components/docs-how-to-use-page.tsx` がコンテンツ実装されている
- [ ] `src/features/docs/components/docs-how-to-use-page.stories.tsx` が新規作成されている
- [ ] `src/app/sitemap.xml` に `/docs/how-to-use` エントリが追加されている

### コンテンツ確認

- [ ] 6つのセクションが全て表示される
- [ ] 日本語版と英語版で適切なテキストが表示される
- [ ] 動的に生成されるURL (HOME, アップロード) が正しい
- [ ] ボタン名が `getActionButtonText()` から正しく取得されている
- [ ] スクリーンショット画像 (`/screenshots/lgtm-image-preview.webp`) が表示される

### スタイリング確認

- [ ] Figmaデザインに準拠したスタイリング
- [ ] 見出しにオレンジ色の下線
- [ ] リンクがシアン色
- [ ] コード部分が背景色付きで表示

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 機能確認

- [ ] `/docs/how-to-use` が正常に表示される
- [ ] `/en/docs/how-to-use` が正常に表示される
- [ ] 全てのリンクがクリック可能で正しいURLに遷移する

---

## トラブルシューティング

### 画像が表示されない場合

**原因**: 画像パスが間違っている可能性

**対処法**:
1. `public/screenshots/lgtm-image-preview.webp` が存在するか確認
2. パスが `/screenshots/lgtm-image-preview.webp` (先頭にスラッシュ) になっているか確認

### リンクが正しく変換されない場合

**原因**: `TextWithLinks` コンポーネントの正規表現が一致しない可能性

**対処法**:
1. テキスト内のマークダウンリンク形式を確認 `[text](url)`
2. URLに特殊文字が含まれていないか確認

### Lintエラーが発生する場合

**対処法**:
1. `npm run format` を実行してコードをフォーマット
2. 再度 `npm run lint` を実行して確認
3. エラーメッセージに従って手動で修正

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: テキスト取得関数の作成
- [ ] `src/features/docs/functions/how-to-use-text.ts` を新規作成

### Phase 2: テキスト取得関数のテスト作成
- [ ] `src/features/docs/__tests__/functions/how-to-use-text.test.ts` を新規作成

### Phase 3: コンポーネントの修正
- [ ] `src/features/docs/components/docs-how-to-use-page.tsx` を修正

### Phase 4: Storybookの作成
- [ ] `src/features/docs/components/docs-how-to-use-page.stories.tsx` を新規作成

### Phase 5: sitemap.xmlの更新
- [ ] `src/app/sitemap.xml` に `/docs/how-to-use` エントリを追加

### Phase 6: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で `/docs/how-to-use` の表示確認完了
- [ ] Chrome DevTools MCP で `/en/docs/how-to-use` の表示確認完了
- [ ] Chrome DevTools MCP で `http://localhost:6006/` の表示確認完了

### 最終確認
- [ ] 6つのセクションが全て正しく表示される
- [ ] 日英両方の言語で正常に動作する
- [ ] テストコードが全てパスする
- [ ] sitemap.xml に正しいエントリが追加されている
- [ ] 不要な変更が含まれていない
