# Issue #330: 利用規約ページ（/terms, /en/terms）実装計画書

## 📋 概要

### 目的

利用規約ページを日本語版（`/terms`）と英語版（`/en/terms`）の2ページ作成する。既存のマークダウンファイル（`src/docs/terms.ja.md`, `src/docs/terms.en.md`）を読み込み、React Server Component として表示する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/330

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4
- **マークダウン処理**: `react-markdown` パッケージ（新規インストール）
- **既存コンポーネント**: `Header`, `Footer`（流用）

### 変更の背景

サービスの利用規約を表示するページが必要。既に利用規約のマークダウンファイルは `src/docs/` に用意されており、これを読み込んで表示する Server Component を実装する。

---

## 📁 ファイル構成

### 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/(default)/terms/page.tsx` | 日本語版利用規約ページ |
| `src/app/(default)/en/terms/page.tsx` | 英語版利用規約ページ |
| `src/features/terms/components/terms-page-container.tsx` | 利用規約ページのContainerコンポーネント |
| `src/components/markdown-content.tsx` | マークダウンレンダリングコンポーネント（共通） |
| `src/components/markdown-content.stories.tsx` | Storybookファイル（共通） |
| `src/features/load-markdown.ts` | マークダウンファイル読み込みユーティリティ（共通） |

### 設計方針（将来の拡張性）

上記の `load-markdown.ts` と `markdown-content.tsx` は、今後実装予定のプライバシーポリシーページ（`/privacy`, `/en/privacy`）や外部送信ポリシーページ（`/external-transmission`, `/en/external-transmission`）でも再利用することを想定した共通モジュールとして設計する。

### 既存ファイル（変更なし）

以下のファイルは既に実装済みで、今回の実装で流用する：

- `src/components/header.tsx` - ヘッダーコンポーネント
- `src/components/footer.tsx` - フッターコンポーネント
- `src/features/terms-of-use.ts` - 利用規約リンク生成関数（既存）
- `src/features/url.ts` - `terms` パスが既に定義済み
- `src/features/meta-tag.ts` - `termsPageTitle` が既に定義済み
- `src/docs/terms.ja.md` - 日本語版利用規約本文（既存）
- `src/docs/terms.en.md` - 英語版利用規約本文（既存）

---

## 📦 パッケージインストール

### 新規インストールが必要なパッケージ

```bash
npm install react-markdown
```

**パッケージ選定理由**:
- `react-markdown` は React コンポーネントとしてマークダウンを安全にレンダリングできる
- Server Component での使用が可能
- XSS攻撃に対して安全（`dangerouslySetInnerHTML` を使用しない）
- プラグインによる拡張が可能

**参考ドキュメント**:
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)

---

## 🎨 Figmaデザイン仕様

### Figma Node

**Node ID**: `882-7528`
**URL**: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-7528&m=dev

### ページ構成

```
┌─────────────────────────────────────┐
│           Header                    │  ← 既存の Header コンポーネント
├─────────────────────────────────────┤
│                                     │
│         Terms of Use                │  ← タイトル（20px, bold）
│                                     │
│   本文コンテンツ                      │  ← マークダウンから生成
│   （第1条、第2条...）                 │
│                                     │
├─────────────────────────────────────┤
│           Footer                    │  ← 既存の Footer コンポーネント
└─────────────────────────────────────┘
```

### レイアウト仕様

| 要素 | 値 |
|------|-----|
| コンテナ最大幅 | 1020px |
| 左右パディング | 40px |
| 上下パディング | 60px |
| タイトル・本文間ギャップ | 20px |
| 背景色 | orange-50 (#fff7ed) |

### タイポグラフィ仕様

| 要素 | フォント | サイズ | 太さ | 色 |
|------|---------|-------|------|-----|
| タイトル | Inter | 20px | Bold | orange-900 (#7c2d12) |
| 本文 | Inter | 16px | Regular | orange-950 (#431407) |
| 見出し（h2） | Inter | 20px | Bold | orange-900 (#7c2d12) |
| リスト項目 | Inter | 16px | Regular | orange-900 (#7c2d12) |

---

## 🔧 コンポーネント実装詳細

### 1. load-markdown.ts（マークダウン読み込みユーティリティ - 共通）

**ファイルパス**: `src/features/load-markdown.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Language } from "@/features/language";

/**
 * ドキュメントの種類
 * - terms: 利用規約
 * - privacy: プライバシーポリシー
 * - external-transmission: 外部送信ポリシー
 */
type DocType = "terms" | "privacy" | "external-transmission";

/**
 * src/docs/ 配下のマークダウンファイルを読み込む汎用関数
 * @param docType ドキュメントの種類
 * @param language 言語
 * @returns マークダウンコンテンツ
 */
export async function loadMarkdown(
  docType: DocType,
  language: Language
): Promise<string> {
  const fileName = language === "en" ? `${docType}.en.md` : `${docType}.ja.md`;
  const filePath = join(process.cwd(), "src", "docs", fileName);

  try {
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Failed to load markdown file: ${filePath}`, error);
    notFound();
  }
}
```

**説明**:
- `node:fs/promises` を使用してファイルを非同期読み込み
- `DocType` で対応するドキュメント種別を定義（将来の拡張に対応）
- `docType` と `language` の組み合わせでファイル名を生成（例: `terms.ja.md`, `privacy.en.md`）
- Server Component 内で使用（クライアントサイドでは動作しない）
- **エラーハンドリング**: ファイル欠損や権限エラー時は `console.error` でログ出力し、`notFound()` で404ページを表示
- 障害時の原因切り分けが容易になるよう、エラーメッセージにファイルパスを含める

**将来の使用例**:
```typescript
// 利用規約ページ
const termsContent = await loadMarkdown("terms", "ja");

// プライバシーポリシーページ
const privacyContent = await loadMarkdown("privacy", "en");

// 外部送信ポリシーページ
const externalTransmissionContent = await loadMarkdown("external-transmission", "ja");
```

---

### 2. markdown-content.tsx（マークダウンレンダリングコンポーネント - 共通）

**ファイルパス**: `src/components/markdown-content.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import Markdown from "react-markdown";

type Props = {
  readonly content: string;
};

export function MarkdownContent({ content }: Props): JSX.Element {
  return (
    <article className="w-full">
      <Markdown
        components={{
          // タイトル（h1）
          h1: ({ children }) => (
            <h1 className="mb-5 text-center font-bold text-orange-900 text-xl leading-7">
              {children}
            </h1>
          ),
          // 見出し（h2）
          h2: ({ children }) => (
            <h2 className="mt-6 mb-2 font-bold text-orange-900 text-xl leading-7">
              {children}
            </h2>
          ),
          // 段落
          p: ({ children }) => (
            <p className="mb-4 text-orange-950 text-base leading-6">
              {children}
            </p>
          ),
          // 順序付きリスト
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal pl-6 text-orange-900 text-base leading-6">
              {children}
            </ol>
          ),
          // リスト項目
          li: ({ children }) => <li className="mb-1">{children}</li>,
          // リンク
          a: ({ href, children }) => (
            <a
              className="text-orange-700 underline hover:text-orange-900"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          // 順序なしリスト
          ul: ({ children }) => (
            <ul className="mb-4 list-disc pl-6 text-orange-900 text-base leading-6">
              {children}
            </ul>
          ),
        }}
      >
        {content}
      </Markdown>
    </article>
  );
}
```

**説明**:
- `react-markdown` の `Markdown` コンポーネントを使用
- `components` プロパティでカスタムスタイルを適用
- Figmaデザインに合わせたタイポグラフィを設定
- リンクには `rel="noopener noreferrer"` と `target="_blank"` を設定
- **注意**: `prose` クラスは Tailwind Typography プラグインが必要なため、使用しない（カスタムスタイルのみで対応）

---

### 3. terms-page-container.tsx（ページコンテナ）

**ファイルパス**: `src/features/terms/components/terms-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MarkdownContent } from "@/components/markdown-content";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};

export function TermsPageContainer({
  language,
  currentUrlPath,
  markdownContent,
}: Props): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
      <main className="flex w-full flex-1 flex-col items-center bg-background">
        <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-10 py-[60px]">
          <MarkdownContent content={markdownContent} />
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
```

**説明**:
- `HomePageContainer` と同様の構造（Header + main + Footer）
- マークダウンコンテンツを props として受け取る
- レイアウトはFigmaデザインに準拠

---

### 4. 日本語版ページ（/terms/page.tsx）

**ファイルパス**: `src/app/(default)/terms/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { TermsPageContainer } from "@/features/terms/components/terms-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).terms.title,
  openGraph: {
    title: metaTagList(language).terms.title,
    url: metaTagList(language).terms.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).terms.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).terms.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.terms.ja,
    languages: {
      ja: i18nUrlList.terms.ja,
      en: i18nUrlList.terms.en,
    },
  },
};

const TermsPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPageContainer
      currentUrlPath={createIncludeLanguageAppPath("terms", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default TermsPage;
```

**説明**:
- Server Component として実装（`async` 関数）- マークダウンファイルの読み込みに非同期処理が必要なため
- `loadMarkdown("terms", language)` で日本語版マークダウンを読み込み（汎用関数を使用）
- 既存の `metaTagList` からメタ情報を取得
- `i18nUrlList.terms` から canonical URL を取得
- `currentUrlPath` は `createIncludeLanguageAppPath("terms", language)` を使用して `/terms` を生成（実際のアクセスパスと同期）
- **注意**: `metaTagList(language).terms.description` は定義されていないため、`description` は省略

---

### 5. 英語版ページ（/en/terms/page.tsx）

**ファイルパス**: `src/app/(default)/en/terms/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { TermsPageContainer } from "@/features/terms/components/terms-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language).terms.title,
  openGraph: {
    title: metaTagList(language).terms.title,
    url: metaTagList(language).terms.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).terms.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).terms.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.terms.en,
    languages: {
      ja: i18nUrlList.terms.ja,
      en: i18nUrlList.terms.en,
    },
  },
};

const EnTermsPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPageContainer
      currentUrlPath={createIncludeLanguageAppPath("terms", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default EnTermsPage;
```

**説明**:
- 日本語版と同様の構造
- `language = "en"` に変更
- `loadMarkdown("terms", language)` で英語版マークダウンを読み込み（汎用関数を使用）
- `currentUrlPath` は `createIncludeLanguageAppPath("terms", language)` を使用して `/en/terms` を生成（実際のアクセスパスと同期）
- 将来のナビゲーション判定や計測イベントでの不整合を防止

---

### 6. Storybookファイル（共通コンポーネント用）

**ファイルパス**: `src/components/markdown-content.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownContent } from "@/components/markdown-content";

const sampleMarkdown = `# 利用規約

この利用規約は、サービスの利用条件を定めるものです。

## 第1条（適用）

本規約は，ユーザーと運営チームとの間の本サービスの利用に関わる一切の関係に適用されるものとします。

## 第2条（利用登録）

登録希望者が運営チームの定める方法によって利用登録を申請し，運営チームがこれを承認することによって，利用登録が完了するものとします。

1. 利用登録の申請に際して虚偽の事項を届け出た場合
1. 本規約に違反したことがある者からの申請である場合
1. その他，運営チームが利用登録を相当でないと判断した場合

詳しくは[GitHub](https://github.com)をご覧ください。
`;

const meta = {
  component: MarkdownContent,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (StoryComponent) => (
      <div className="max-w-[940px] bg-background p-10">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: sampleMarkdown,
  },
};
```

---

## 📂 ディレクトリ構造（実装後）

```
src/
├── app/
│   └── (default)/
│       ├── terms/
│       │   └── page.tsx                    ← 新規作成
│       └── en/
│           └── terms/
│               └── page.tsx                ← 新規作成
├── components/
│   ├── header.tsx                          ← 既存（変更なし）
│   ├── footer.tsx                          ← 既存（変更なし）
│   ├── markdown-content.tsx                ← 新規作成（共通コンポーネント）
│   └── markdown-content.stories.tsx        ← 新規作成（Storybook）
├── features/
│   ├── load-markdown.ts                    ← 新規作成（共通ユーティリティ）
│   └── terms/
│       └── components/
│           └── terms-page-container.tsx    ← 新規作成
└── docs/
    ├── terms.ja.md                         ← 既存（変更なし）
    ├── terms.en.md                         ← 既存（変更なし）
    ├── privacy.ja.md                       ← 既存（将来使用）
    ├── privacy.en.md                       ← 既存（将来使用）
    ├── external-transmission.ja.md         ← 既存（将来使用）
    └── external-transmission.en.md         ← 既存（将来使用）
```

---

## 📝 実装順序

### Step 1: パッケージインストール

```bash
npm install react-markdown
```

### Step 2: ディレクトリ作成

`src/features/terms/` は新規ディレクトリのため、以下の構造を作成：

```bash
mkdir -p src/features/terms/components
```

**注意**: `src/components/` と `src/features/` は既存ディレクトリのため、新規作成不要。

### Step 3: 共通ユーティリティ関数の作成

1. `src/features/load-markdown.ts` を作成（共通で使用）

### Step 4: 共通コンポーネントの作成

1. `src/components/markdown-content.tsx` を作成（Header, Footerと同レベルに配置）

### Step 5: 利用規約ページ固有のコンポーネント作成

1. `src/features/terms/components/terms-page-container.tsx` を作成

### Step 6: ページの作成

1. `src/app/(default)/terms/page.tsx` を作成
2. `src/app/(default)/en/terms/page.tsx` を作成

### Step 7: Storybookの作成

1. `src/components/markdown-content.stories.tsx` を作成

### Step 8: 品質管理の実行

詳細は「品質管理手順」セクション参照

---

## 🎨 デザイントークン（Tailwind CSS v4）

### 使用するデザイントークン

| 用途 | Tailwindクラス | カラーコード |
|------|---------------|-------------|
| 背景色 | `bg-background` | #fff7ed (orange-50) |
| タイトル・見出しテキスト | `text-orange-900` | #7c2d12 |
| 本文テキスト | `text-orange-950` | #431407 |
| リンク通常 | `text-orange-700` | #c2410c |
| リンクホバー | `hover:text-orange-900` | #7c2d12 |

---

## 🚨 実装時の注意事項

### 1. Server Component として実装

- ページコンポーネントは `async` 関数として実装
- `node:fs/promises` はサーバーサイドのみで動作
- `"use client"` ディレクティブは **使用しない**

### 2. マークダウンファイルの読み込み

- `process.cwd()` を使用してプロジェクトルートからのパスを構築
- 相対パスではなく絶対パスを使用
- **エラーハンドリング**: ファイル読み込み失敗時は `notFound()` で404ページを表示
- `next/navigation` から `notFound` をインポート

### 3. 型定義

Props は `readonly` 修飾子を使用：

```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};
```

### 4. セキュリティ

- `react-markdown` は XSS 攻撃に対して安全
- 外部リンクには `rel="noopener noreferrer"` を設定
- `dangerouslySetInnerHTML` は使用しない

### 5. 既存ファイルの活用

以下のファイルは既に必要な定義が含まれているため、新規追加は不要：

- `src/features/url.ts` - `terms` パスが定義済み
- `src/features/meta-tag.ts` - `termsPageTitle` が定義済み
- `src/features/terms-of-use.ts` - リンク生成関数が定義済み

### 6. インポートパスの確認

すべてのインポートは `@/` エイリアスを使用：

```typescript
// 共通コンポーネント
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MarkdownContent } from "@/components/markdown-content";

// 共通ユーティリティ
import { loadMarkdown } from "@/features/load-markdown";

// 型定義
import type { Language } from "@/features/language";
```

---

## ✅ 品質管理手順

実装完了後、**必ず以下の順番**で品質管理を実行すること：

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

Playwright MCPを使って `http://localhost:2222` にアクセスし、以下を確認：

- [ ] `http://localhost:2222/terms` にアクセスして日本語版が表示される
- [ ] `http://localhost:2222/en/terms` にアクセスして英語版が表示される
- [ ] Header が正常に表示される
- [ ] Footer が正常に表示される
- [ ] マークダウンの見出し（h1, h2）が正しくスタイリングされている
- [ ] 本文テキストが正しく表示されている
- [ ] 番号付きリストが正しく表示されている
- [ ] リンク（GitHub等）が正しく表示され、クリック可能
- [ ] モバイルサイズでもレイアウトが崩れない

### 5. Storybookでの表示確認

Playwright MCPを使って `http://localhost:6006/` にアクセスし、以下を確認：

- [ ] `MarkdownContent` コンポーネントのストーリーが正常に表示される
- [ ] マークダウンのスタイリングがFigmaデザインと一致している

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。

特に確認すべき点：
- タイポグラフィ（フォントサイズ、行間、色）
- 余白（padding, margin, gap）
- コンテナ幅（max-width: 1020px）

---

## ⚠️ 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のマークダウンファイル（terms.ja.md, terms.en.md）の内容を変更しない**
3. **ビジネスロジックの変更禁止** - UI実装のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 🎯 成功基準

以下を全て満たすこと：

### ファイル作成
- [ ] `src/features/load-markdown.ts` が作成されている（共通ユーティリティ）
- [ ] `src/components/markdown-content.tsx` が作成されている（共通コンポーネント）
- [ ] `src/components/markdown-content.stories.tsx` が作成されている（Storybook）
- [ ] `src/features/terms/components/terms-page-container.tsx` が作成されている
- [ ] `src/app/(default)/terms/page.tsx` が作成されている
- [ ] `src/app/(default)/en/terms/page.tsx` が作成されている

### パッケージ
- [ ] `react-markdown` がインストールされている

### 機能確認
- [ ] `/terms` にアクセスして日本語版利用規約が表示される
- [ ] `/en/terms` にアクセスして英語版利用規約が表示される
- [ ] マークダウンの全ての要素（h1, h2, p, ol, ul, a）が正しくレンダリングされる
- [ ] Header / Footer が正常に表示される
- [ ] メタタグ（title, OGP）が正しく設定されている（※ `description` は `metaTagList` に未定義のため省略）

### デザイン
- [ ] Figmaデザイン（node: `882-7528`）と視覚的に一致している
- [ ] タイポグラフィ（色、サイズ、太さ）が仕様通り
- [ ] レイアウト（余白、幅）が仕様通り

### CI/テスト
- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認
- [ ] `http://localhost:2222/terms` で正常に表示される
- [ ] `http://localhost:2222/en/terms` で正常に表示される
- [ ] `http://localhost:6006/` のStorybookでコンポーネントが正常に表示される

---

**作成日**: 2025-12-17
**対象Issue**: #330
**担当**: AI実装者
