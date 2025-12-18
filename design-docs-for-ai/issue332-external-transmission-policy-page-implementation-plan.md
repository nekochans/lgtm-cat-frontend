# Issue #332: 外部送信ポリシーページ（/external-transmission-policy, /en/external-transmission-policy）実装計画書

## 概要

### 目的

外部送信ポリシーページを日本語版（`/external-transmission-policy`）と英語版（`/en/external-transmission-policy`）の2ページ作成する。既存のマークダウンファイル（`src/docs/external-transmission.ja.md`, `src/docs/external-transmission.en.md`）を読み込み、React Server Component として表示する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/332

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4
- **マークダウン処理**: `react-markdown` パッケージ（既にインストール済み）
- **既存コンポーネント**: `Header`, `Footer`, `MarkdownContent`
- **既存ユーティリティ**: `loadMarkdown`

### 変更の背景

サービスの外部送信ポリシー（電気通信事業法に基づく情報開示）を表示するページが必要。既に外部送信ポリシーのマークダウンファイルは `src/docs/` に用意されており、PR #389（プライバシーポリシーページ）と同じパターンで実装する。

---

## マークダウンファイルの構造

### external-transmission.ja.md / external-transmission.en.md の要素

外部送信ポリシーのマークダウンファイルには以下の要素が含まれている：

| 要素 | マークダウン記法 | 使用箇所 |
|------|----------------|---------|
| h1 | `#` | タイトル「外部送信ポリシー」/「External Transmission Policy」 |
| h2 | `##` | 各サービスの見出し（Google アナリティクス、Sentry） |
| 段落 | 通常テキスト | 説明文 |
| 太字 | `**text**` | ラベル（送信先事業者名、送信される情報、など） |
| 順序なしリスト | `-` | 送信される情報のリスト、目的のリスト |
| リンク | `[text](url)` | 送信先事業者のWebサイトへのリンク |

### マークダウンファイルの内容確認

**日本語版（src/docs/external-transmission.ja.md）**:
- タイトル: 「外部送信ポリシー」
- 2つのサービス: Google アナリティクス、Sentry
- 制定日: 2024年7月10日

**英語版（src/docs/external-transmission.en.md）**:
- タイトル: 「External Transmission Policy」
- 2つのサービス: Google Analytics、Sentry
- 制定日: July 10, 2024

### マークダウンファイルのサンプル（日本語版の一部）

```markdown
# 外部送信ポリシー

LGTMeow では、サービス品質の向上やユーザーの皆様に合わせた...

## Google アナリティクス

**送信先事業者名**: [Google LLC.](https://about.google/intl/ALL_jp/)

**送信される情報**:

- 端末情報（端末の種類やOSの種類など）
- ユーザー情報（ユーザーIDなど）
- ユーザーのアプリ内の操作に関する情報（セッション情報やユーザーエージェントなど）

**弊社での利用目的**: ユーザーの行動を統計的に分析し、サービスの改善に役立てるため。

...
```

### strong タグ（太字）に関する注意事項

**重要**: `external-transmission.ja.md` と `external-transmission.en.md` には太字（`**text**`）が多用されていますが、`MarkdownContent` コンポーネントには `strong` タグのカスタムスタイリングが定義されていません。

```markdown
**送信先事業者名**: [Google LLC.](...)
**送信される情報**:
**弊社での利用目的**: ...
**送信先事業者での利用目的**:
```

`strong` タグは `react-markdown` のデフォルトスタイリング（ブラウザデフォルトの太字）で表示されます。既存の `MarkdownContent` コンポーネントは変更しない方針のため、デフォルトのスタイリングで表示されることを許容します。

もし太字のスタイリングに問題がある場合は、動作確認時に報告し、別途対応を検討します。

---

## ファイル構成

### 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/(default)/external-transmission-policy/page.tsx` | 日本語版外部送信ポリシーページ |
| `src/app/(default)/en/external-transmission-policy/page.tsx` | 英語版外部送信ポリシーページ |
| `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` | 外部送信ポリシーページのContainerコンポーネント |

### 既存ファイル（変更なし・流用）

以下のファイルは既に実装済みで、今回の実装で流用する：

| ファイルパス | 説明 | 状態 |
|-------------|------|------|
| `src/components/header.tsx` | ヘッダーコンポーネント | 既存 |
| `src/components/footer.tsx` | フッターコンポーネント | 既存 |
| `src/components/markdown-content.tsx` | マークダウンレンダリングコンポーネント | 既存 |
| `src/features/load-markdown.ts` | マークダウンファイル読み込みユーティリティ（`external-transmission` 対応済み） | 既存 |
| `src/features/url.ts` | `external-transmission-policy` パスが既に定義済み | 既存 |
| `src/features/meta-tag.ts` | `externalTransmissionPageTitle` が既に定義済み | 既存 |
| `src/features/external-transmission-policy.ts` | リンク属性作成関数 | 既存 |
| `src/docs/external-transmission.ja.md` | 日本語版外部送信ポリシー本文 | 既存 |
| `src/docs/external-transmission.en.md` | 英語版外部送信ポリシー本文 | 既存 |

---

## Figmaデザイン仕様

### Figma Node

**Node ID**: `882-7528`
**URL**: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-7528&m=dev

**注意**: このFigmaデザインは利用規約ページと同じデザインを使用。外部送信ポリシーページ専用のデザインはないが、同じレイアウト・スタイルで実装する。

### ページ構成

```
┌─────────────────────────────────────┐
│           Header                    │  ← 既存の Header コンポーネント
├─────────────────────────────────────┤
│                                     │
│   External Transmission Policy      │  ← タイトル（20px, bold, center）
│                                     │
│   本文コンテンツ                      │  ← マークダウンから生成
│   （Google Analytics, Sentry...）    │
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
| 見出し（h2） | Inter | 20px | Bold | orange-900 (#7c2d12) |
| 本文 | Inter | 16px | Regular | orange-950 (#431407) |
| リスト項目 | Inter | 16px | Regular | orange-900 (#7c2d12) |
| リンク | Inter | 16px | Regular | orange-700 (#c2410c) |

---

## コンポーネント実装詳細

### 1. external-transmission-policy-page-container.tsx（ページコンテナ）

**ファイルパス**: `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx`

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

export function ExternalTransmissionPolicyPageContainer({
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
- `PrivacyPageContainer` と同様の構造（Header + main + Footer）
- マークダウンコンテンツを props として受け取る
- レイアウトはFigmaデザインに準拠
- 既存の `MarkdownContent` コンポーネントを再利用

---

### 2. 日本語版ページ（/external-transmission-policy/page.tsx）

**ファイルパス**: `src/app/(default)/external-transmission-policy/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { ExternalTransmissionPolicyPageContainer } from "@/features/external-transmission-policy/components/external-transmission-policy-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["external-transmission-policy"].title,
  openGraph: {
    title: metaTagList(language)["external-transmission-policy"].title,
    url: metaTagList(language)["external-transmission-policy"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["external-transmission-policy"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["external-transmission-policy"].title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["external-transmission-policy"].ja,
    languages: {
      ja: i18nUrlList["external-transmission-policy"].ja,
      en: i18nUrlList["external-transmission-policy"].en,
    },
  },
};

const ExternalTransmissionPolicyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("external-transmission", language);

  return (
    <ExternalTransmissionPolicyPageContainer
      currentUrlPath={createIncludeLanguageAppPath(
        "external-transmission-policy",
        language
      )}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default ExternalTransmissionPolicyPage;
```

**説明**:
- Server Component として実装（`async` 関数）
- `loadMarkdown("external-transmission", language)` で日本語版マークダウンを読み込み
- 既存の `metaTagList` からメタ情報を取得（ブラケット記法でアクセス）
- `i18nUrlList["external-transmission-policy"]` から canonical URL を取得
- `currentUrlPath` は `createIncludeLanguageAppPath("external-transmission-policy", language)` を使用して `/external-transmission-policy` を生成

**重要なポイント**:
- `metaTagList` と `i18nUrlList` のアクセスにはブラケット記法 `["external-transmission-policy"]` を使用（ハイフンを含むキーのため）
- `loadMarkdown` の引数は `"external-transmission"`（ファイル名に対応）
- `createIncludeLanguageAppPath` の引数は `"external-transmission-policy"`（AppPathName に対応）

---

### 3. 英語版ページ（/en/external-transmission-policy/page.tsx）

**ファイルパス**: `src/app/(default)/en/external-transmission-policy/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { ExternalTransmissionPolicyPageContainer } from "@/features/external-transmission-policy/components/external-transmission-policy-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language)["external-transmission-policy"].title,
  openGraph: {
    title: metaTagList(language)["external-transmission-policy"].title,
    url: metaTagList(language)["external-transmission-policy"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["external-transmission-policy"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["external-transmission-policy"].title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["external-transmission-policy"].en,
    languages: {
      ja: i18nUrlList["external-transmission-policy"].ja,
      en: i18nUrlList["external-transmission-policy"].en,
    },
  },
};

const EnExternalTransmissionPolicyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("external-transmission", language);

  return (
    <ExternalTransmissionPolicyPageContainer
      currentUrlPath={createIncludeLanguageAppPath(
        "external-transmission-policy",
        language
      )}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default EnExternalTransmissionPolicyPage;
```

**説明**:
- 日本語版と同様の構造
- `language = "en"` に変更
- `loadMarkdown("external-transmission", language)` で英語版マークダウンを読み込み
- `currentUrlPath` は `createIncludeLanguageAppPath("external-transmission-policy", language)` を使用して `/en/external-transmission-policy` を生成

---

## ディレクトリ構造（実装後）

```
src/
├── app/
│   └── (default)/
│       ├── terms/
│       │   └── page.tsx                              ← 既存
│       ├── privacy/
│       │   └── page.tsx                              ← 既存
│       ├── external-transmission-policy/
│       │   └── page.tsx                              ← 新規作成
│       └── en/
│           ├── terms/
│           │   └── page.tsx                          ← 既存
│           ├── privacy/
│           │   └── page.tsx                          ← 既存
│           └── external-transmission-policy/
│               └── page.tsx                          ← 新規作成
├── components/
│   ├── header.tsx                                    ← 既存（変更なし）
│   ├── footer.tsx                                    ← 既存（変更なし）
│   └── markdown-content.tsx                          ← 既存（変更なし）
├── features/
│   ├── load-markdown.ts                              ← 既存（変更なし）
│   ├── url.ts                                        ← 既存（変更なし）
│   ├── meta-tag.ts                                   ← 既存（変更なし）
│   ├── external-transmission-policy.ts               ← 既存（変更なし）
│   ├── terms/
│   │   └── components/
│   │       └── terms-page-container.tsx              ← 既存（変更なし）
│   ├── privacy/
│   │   └── components/
│   │       └── privacy-page-container.tsx            ← 既存（変更なし）
│   └── external-transmission-policy/
│       └── components/
│           └── external-transmission-policy-page-container.tsx  ← 新規作成
└── docs/
    ├── terms.ja.md                                   ← 既存（変更なし）
    ├── terms.en.md                                   ← 既存（変更なし）
    ├── privacy.ja.md                                 ← 既存（変更なし）
    ├── privacy.en.md                                 ← 既存（変更なし）
    ├── external-transmission.ja.md                   ← 既存（変更なし）
    └── external-transmission.en.md                   ← 既存（変更なし）
```

---

## privacy ページとの差分比較

外部送信ポリシーページはプライバシーポリシーページ（privacy）と同じパターンで実装します。以下は主な差分：

| 項目 | privacy ページ | external-transmission-policy ページ |
|------|---------------|-------------------------------------|
| 日本語版パス | `/privacy` | `/external-transmission-policy` |
| 英語版パス | `/en/privacy` | `/en/external-transmission-policy` |
| コンテナコンポーネント | `PrivacyPageContainer` | `ExternalTransmissionPolicyPageContainer` |
| コンテナファイルパス | `src/features/privacy/components/privacy-page-container.tsx` | `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` |
| loadMarkdown の docType | `"privacy"` | `"external-transmission"` |
| metaTagList のキー | `.privacy` | `["external-transmission-policy"]` |
| i18nUrlList のキー | `.privacy` | `["external-transmission-policy"]` |
| createIncludeLanguageAppPath の引数 | `"privacy"` | `"external-transmission-policy"` |
| ページコンポーネント名（日本語版） | `PrivacyPage` | `ExternalTransmissionPolicyPage` |
| ページコンポーネント名（英語版） | `EnPrivacyPage` | `EnExternalTransmissionPolicyPage` |

**実装のポイント**: privacy ページの実装をコピーし、上記の差分を置換することで実装できます。

---

## 実装順序

### Step 1: ディレクトリ作成

`src/features/external-transmission-policy/components/` は新規ディレクトリのため、以下の構造を作成：

```bash
mkdir -p src/features/external-transmission-policy/components
```

**注意**: `src/app/(default)/external-transmission-policy/` および `src/app/(default)/en/external-transmission-policy/` ディレクトリもファイル作成時に自動生成される。

### Step 2: 外部送信ポリシーページ固有のコンポーネント作成

1. `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` を作成
   - `PrivacyPageContainer` をコピーして作成
   - 関数名を `PrivacyPageContainer` → `ExternalTransmissionPolicyPageContainer` に変更
   - それ以外の変更は不要（レイアウトは同じ）

### Step 3: ページの作成

1. `src/app/(default)/external-transmission-policy/page.tsx` を作成
   - `src/app/(default)/privacy/page.tsx` をコピーして作成
   - 以下を置換：
     - `PrivacyPageContainer` → `ExternalTransmissionPolicyPageContainer`
     - `@/features/privacy/components/privacy-page-container` → `@/features/external-transmission-policy/components/external-transmission-policy-page-container`
     - `.privacy` → `["external-transmission-policy"]`（全箇所）
     - `"privacy"` → `"external-transmission"`（loadMarkdown の引数）
     - `"privacy"` → `"external-transmission-policy"`（createIncludeLanguageAppPath の引数）
     - `PrivacyPage` → `ExternalTransmissionPolicyPage`

2. `src/app/(default)/en/external-transmission-policy/page.tsx` を作成
   - `src/app/(default)/en/privacy/page.tsx` をコピーして作成
   - 上記と同様の置換を行う
   - `EnPrivacyPage` → `EnExternalTransmissionPolicyPage`

### Step 4: 品質管理の実行

詳細は「品質管理手順」セクション参照

---

## 実装前チェックリスト

実装を開始する前に、以下の項目を確認すること：

### 既存設定の存在確認

- [ ] `src/features/url.ts` で `appPathList["external-transmission-policy"]` が `/external-transmission-policy` と定義されているか
- [ ] `src/features/url.ts` で `i18nUrlList["external-transmission-policy"]` が日英両方のURLを持っているか
- [ ] `src/features/meta-tag.ts` で `metaTagList(language)["external-transmission-policy"]` が定義されているか
- [ ] `src/features/load-markdown.ts` で `DocType` に `"external-transmission"` が含まれているか
- [ ] `src/docs/external-transmission.ja.md` が存在するか
- [ ] `src/docs/external-transmission.en.md` が存在するか

### 参考実装の確認

- [ ] `src/features/privacy/components/privacy-page-container.tsx` を確認したか
- [ ] `src/app/(default)/privacy/page.tsx` を確認したか
- [ ] `src/app/(default)/en/privacy/page.tsx` を確認したか

---

## デザイントークン（Tailwind CSS v4）

### 使用するデザイントークン

| 用途 | Tailwindクラス | カラーコード |
|------|---------------|-------------|
| 背景色 | `bg-background` | #fff7ed (orange-50) |
| タイトル・見出しテキスト | `text-orange-900` | #7c2d12 |
| 本文テキスト | `text-orange-950` | #431407 |
| リンク通常 | `text-orange-700` | #c2410c |
| リンクホバー | `hover:text-orange-900` | #7c2d12 |

---

## 実装時の注意事項

### 1. Server Component として実装

- ページコンポーネントは `async` 関数として実装
- `node:fs/promises` はサーバーサイドのみで動作
- `"use client"` ディレクティブは **使用しない**

### 2. 既存コンポーネントの再利用

以下のコンポーネント・ユーティリティをそのまま使用：

- `loadMarkdown` - マークダウンファイル読み込み（`src/features/load-markdown.ts`）
- `MarkdownContent` - マークダウンレンダリング（`src/components/markdown-content.tsx`）

これらのファイルは **変更しない**。

### 3. 型定義

Props は `readonly` 修飾子を使用：

```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};
```

### 4. インポートパスの確認

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
import type { IncludeLanguageAppPath } from "@/features/url";

// 外部送信ポリシーページコンポーネント
import { ExternalTransmissionPolicyPageContainer } from "@/features/external-transmission-policy/components/external-transmission-policy-page-container";
```

### 5. 既存設定の確認

以下の設定は既に存在するため、新規追加は不要：

**src/features/url.ts:**
- `appPathList["external-transmission-policy"]` = `/external-transmission-policy`
- `i18nUrlList["external-transmission-policy"].ja` = `/external-transmission-policy/`
- `i18nUrlList["external-transmission-policy"].en` = `/en/external-transmission-policy/`

**src/features/meta-tag.ts:**
- `externalTransmissionPageTitle(language)` - 「LGTMeow 外部送信ポリシー」/「LGTMeow External Transmission Policy」
- `metaTagList(language)["external-transmission-policy"]` - OGP情報

**src/features/load-markdown.ts:**
- `DocType` に `"external-transmission"` が含まれている

### 6. ブラケット記法の使用

`external-transmission-policy` はハイフンを含むキーのため、ドット記法ではなくブラケット記法を使用：

```typescript
// ✅ 正しい
metaTagList(language)["external-transmission-policy"].title
i18nUrlList["external-transmission-policy"].ja

// ❌ 構文エラー
metaTagList(language).external-transmission-policy.title
```

---

## 品質管理手順

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

#### コンテンツ表示確認

- [ ] `http://localhost:2222/external-transmission-policy` にアクセスして日本語版が表示される
- [ ] `http://localhost:2222/en/external-transmission-policy` にアクセスして英語版が表示される
- [ ] Header が正常に表示される
- [ ] Footer が正常に表示される
- [ ] マークダウンのタイトル（h1）が中央揃えで表示されている
- [ ] マークダウンの見出し（h2）「Google アナリティクス」「Sentry」が正しくスタイリングされている
- [ ] 本文テキストが正しく表示されている
- [ ] 太字（**送信先事業者名**等）が正しく表示されている
- [ ] 箇条書きリスト（ul）が正しく表示されている
- [ ] リンク（送信先事業者へのリンク）が正しく表示され、クリック可能
- [ ] 外部リンクが新しいタブで開く（`target="_blank"`）
- [ ] 制定日が正しく表示されている（日本語: 2024年7月10日、英語: July 10, 2024）
- [ ] モバイルサイズでもレイアウトが崩れない

#### SEO/メタデータ確認

Chrome DevTools MCP または開発者ツールを使って、以下のメタデータを確認：

**日本語版（/external-transmission-policy）**:
- [ ] `<title>` が「LGTMeow 外部送信ポリシー」になっているか
- [ ] `og:title` が「LGTMeow 外部送信ポリシー」になっているか
- [ ] `og:url` が正しいURLになっているか
- [ ] `og:image` が設定されているか
- [ ] `canonical` URL が `/external-transmission-policy/` になっているか
- [ ] `alternate` に日本語版と英語版のURLが設定されているか

**英語版（/en/external-transmission-policy）**:
- [ ] `<title>` が「LGTMeow External Transmission Policy」になっているか
- [ ] `og:title` が「LGTMeow External Transmission Policy」になっているか
- [ ] `og:url` が正しいURLになっているか
- [ ] `og:image` が設定されているか
- [ ] `canonical` URL が `/en/external-transmission-policy/` になっているか
- [ ] `alternate` に日本語版と英語版のURLが設定されているか

### 5. Storybookでの表示確認

Playwright MCPを使って `http://localhost:6006/` にアクセスし、以下を確認：

- [ ] `MarkdownContent` コンポーネントのストーリーが正常に表示される
- [ ] マークダウンのスタイリングがFigmaデザインと一致している

**注意**: `MarkdownContent` のストーリーは既に作成済みのため、新規作成は不要。

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。

特に確認すべき点：
- タイポグラフィ（フォントサイズ、行間、色）
- 余白（padding, margin, gap）
- コンテナ幅（max-width: 1020px）
- マークダウン内の各要素（h1, h2, p, ul, a, strong）のスタイリング

---

## トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| `Cannot find module '@/features/external-transmission-policy/...'` | ディレクトリ未作成 | `mkdir -p src/features/external-transmission-policy/components` を実行 |
| `Module not found: Can't resolve '@/features/load-markdown'` | パスの誤り | インポートパスを確認（`@/features/load-markdown`） |
| 404エラーが表示される | ファイルパスの誤り | `src/app/(default)/external-transmission-policy/page.tsx` の配置を確認 |
| マークダウンが表示されない | `loadMarkdown` のdocTypeの誤り | `"external-transmission"` を正確に指定しているか確認 |
| OGP画像が表示されない | メタデータの設定誤り | `metaTagList(language)["external-transmission-policy"]` を使用しているか確認 |
| TypeScriptエラー | ブラケット記法未使用 | ハイフン含むキーはブラケット記法 `["external-transmission-policy"]` を使用 |

### 実装時の確認ポイント

1. **ファイル先頭のコメント確認**: 全てのソースファイルに `// 絶対厳守：編集前に必ずAI実装ルールを読む` があるか
2. **インポート順序**: 型インポート（`import type`）は通常のインポートと分離する
3. **Props の readonly**: 全てのプロパティに `readonly` 修飾子が付いているか
4. **language 定数の値**: 日本語版は `"ja"`、英語版は `"en"` を正確に設定
5. **ブラケット記法**: `external-transmission-policy` にアクセスする際は必ずブラケット記法を使用

---

## よくある質問（FAQ）

### Q1: `loadMarkdown` の引数と `createIncludeLanguageAppPath` の引数が異なるのはなぜ？

**A**: ファイル名とURL パス名が異なるためです。

- `loadMarkdown("external-transmission", language)` - ファイル名 `external-transmission.ja.md` に対応
- `createIncludeLanguageAppPath("external-transmission-policy", language)` - URL パス `/external-transmission-policy` に対応

### Q2: メタタグのアクセスにドット記法が使えないのはなぜ？

**A**: `external-transmission-policy` にはハイフン（`-`）が含まれており、JavaScriptの識別子として無効なためです。ブラケット記法 `["external-transmission-policy"]` を使用してください。

```typescript
// ✅ 正しい
metaTagList(language)["external-transmission-policy"].title

// ❌ 構文エラー（ハイフンが識別子に含まれるため）
metaTagList(language).external-transmission-policy.title
```

### Q3: 既存の `src/features/external-transmission-policy.ts` は何に使われている？

**A**: このファイルは `createExternalTransmissionPolicyLinksFromLanguages` 関数を提供しており、フッターなどで外部送信ポリシーへのリンクを生成するために使用されます。今回の実装では変更は不要ですが、参考として存在を把握しておいてください。

### Q4: コンテナコンポーネントを新規作成せず、PrivacyPageContainer を共通化できないか？

**A**: 技術的には可能ですが、以下の理由から各ページ専用のコンテナを作成することを推奨します：

- 将来的にページ固有のレイアウト変更が発生する可能性
- 各ページの責務を明確に分離
- 既存の terms/privacy ページと同じパターンを維持

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のマークダウンファイル（external-transmission.ja.md, external-transmission.en.md）の内容を変更しない**
3. **既存の共通コンポーネント（MarkdownContent, loadMarkdown, Header, Footer）を変更しない**
4. **既存の設定ファイル（url.ts, meta-tag.ts, external-transmission-policy.ts）を変更しない**
5. **ビジネスロジックの変更禁止** - UI実装のみに集中
6. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 成功基準

以下を全て満たすこと：

### ファイル作成
- [ ] `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` が作成されている
- [ ] `src/app/(default)/external-transmission-policy/page.tsx` が作成されている
- [ ] `src/app/(default)/en/external-transmission-policy/page.tsx` が作成されている

### 機能確認
- [ ] `/external-transmission-policy` にアクセスして日本語版外部送信ポリシーが表示される
- [ ] `/en/external-transmission-policy` にアクセスして英語版外部送信ポリシーが表示される
- [ ] マークダウンの全ての要素（h1, h2, p, ul, a, strong）が正しくレンダリングされる
- [ ] Header / Footer が正常に表示される
- [ ] メタタグ（title, OGP）が正しく設定されている

### デザイン
- [ ] Figmaデザイン（node: `882-7528`）と視覚的に一致している
- [ ] タイポグラフィ（色、サイズ、太さ）が仕様通り
- [ ] レイアウト（余白、幅）が仕様通り

### CI/テスト
- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認
- [ ] `http://localhost:2222/external-transmission-policy` で正常に表示される
- [ ] `http://localhost:2222/en/external-transmission-policy` で正常に表示される
- [ ] `http://localhost:6006/` のStorybookで `MarkdownContent` コンポーネントが正常に表示される

---

## 更新履歴

| 日時 | レビュー回 | 改善内容 |
|------|----------|---------|
| 2025-12-17 | 初版 | 実装計画書の初版作成 |
| 2025-12-17 | 1回目 | マークダウンファイルのサンプルを追加、strong タグ（太字）に関する注意事項を追記 |
| 2025-12-17 | 2回目 | 実装前チェックリストを追加、SEO/メタデータ確認項目を品質管理手順に追加 |
| 2025-12-17 | 3回目 | よくある質問（FAQ）セクションを追加、禁止事項に external-transmission-policy.ts を追加、全体の整合性を最終確認 |

---

**作成日**: 2025-12-17
**最終更新日**: 2025-12-17
**対象Issue**: #332
**担当**: AI実装者
