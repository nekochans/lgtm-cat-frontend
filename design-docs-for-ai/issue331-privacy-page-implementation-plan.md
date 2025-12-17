# Issue #331: プライバシーポリシーページ（/privacy, /en/privacy）実装計画書

## 概要

### 目的

プライバシーポリシーページを日本語版（`/privacy`）と英語版（`/en/privacy`）の2ページ作成する。既存のマークダウンファイル（`src/docs/privacy.ja.md`, `src/docs/privacy.en.md`）を読み込み、React Server Component として表示する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/331

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4
- **マークダウン処理**: `react-markdown` パッケージ（PR #388 でインストール済み）
- **既存コンポーネント**: `Header`, `Footer`, `MarkdownContent`（PR #388 で作成済み）
- **既存ユーティリティ**: `loadMarkdown`（PR #388 で作成済み）

### 変更の背景

サービスのプライバシーポリシーを表示するページが必要。既にプライバシーポリシーのマークダウンファイルは `src/docs/` に用意されており、PR #388 で作成された共通コンポーネントを再利用して実装する。

---

## マークダウンファイルの構造

### privacy.ja.md / privacy.en.md の要素

プライバシーポリシーのマークダウンファイルには以下の要素が含まれている：

| 要素 | マークダウン記法 | 使用箇所 |
|------|----------------|---------|
| h1 | `#` | タイトル「プライバシーポリシー」 |
| h2 | `##` | 各条文の見出し（1. 個人情報の定義、2. 個人情報の取得方法、など） |
| h3 | `###` | 5条の小見出し（5.1、5.2） |
| 段落 | 通常テキスト | 各条文の本文 |
| 順序付きリスト | `1.` | 3条の目的リスト |
| 順序なしリスト | `-` | 2条の取得情報リスト、5条の例外リスト |
| リンク | `[text](url)` | お問い合わせフォームへのリンク |

### h3タグに関する注意事項

**重要**: `privacy.ja.md` と `privacy.en.md` には h3 タグ（`###`）が使用されていますが、`MarkdownContent` コンポーネントには h3 のカスタムスタイリングが定義されていません。

```markdown
### 5.1. 運営チームは，次に掲げる場合を除いて...
### 5.2. 前項の定めにかかわらず...
```

h3 タグは `react-markdown` のデフォルトスタイリングで表示されます。既存の `MarkdownContent` コンポーネントは変更しない方針のため、デフォルトのスタイリングで表示されることを許容します。

もしh3のスタイリングに問題がある場合は、動作確認時に報告し、別途対応を検討します。

---

## ファイル構成

### 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/(default)/privacy/page.tsx` | 日本語版プライバシーポリシーページ |
| `src/app/(default)/en/privacy/page.tsx` | 英語版プライバシーポリシーページ |
| `src/features/privacy/components/privacy-page-container.tsx` | プライバシーポリシーページのContainerコンポーネント |

### 既存ファイル（変更なし・流用）

以下のファイルは既に実装済みで、今回の実装で流用する：

| ファイルパス | 説明 | 作成元 |
|-------------|------|--------|
| `src/components/header.tsx` | ヘッダーコンポーネント | 既存 |
| `src/components/footer.tsx` | フッターコンポーネント | 既存 |
| `src/components/markdown-content.tsx` | マークダウンレンダリングコンポーネント | PR #388 |
| `src/features/load-markdown.ts` | マークダウンファイル読み込みユーティリティ | PR #388 |
| `src/features/url.ts` | `privacy` パスが既に定義済み | 既存 |
| `src/features/meta-tag.ts` | `privacyPageTitle` が既に定義済み | 既存 |
| `src/docs/privacy.ja.md` | 日本語版プライバシーポリシー本文 | 既存 |
| `src/docs/privacy.en.md` | 英語版プライバシーポリシー本文 | 既存 |

---

## Figmaデザイン仕様

### Figma Node

**Node ID**: `882-7736`
**URL**: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-7736&m=dev

### ページ構成

```
┌─────────────────────────────────────┐
│           Header                    │  ← 既存の Header コンポーネント
├─────────────────────────────────────┤
│                                     │
│       Privacy Policy                │  ← タイトル（20px, bold, center）
│                                     │
│   本文コンテンツ                      │  ← マークダウンから生成
│   （1. Definition of Personal...）   │
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
| リンク | Inter | 16px | Regular | cyan-500 (#06b6d4) |

**重要**: リンクの色がFigmaでは `cyan-500` になっていますが、利用規約ページの `MarkdownContent` コンポーネントでは `orange-700` が使用されています。一貫性を保つため、既存の `MarkdownContent` のスタイルをそのまま使用します（`orange-700`）。

---

## コンポーネント実装詳細

### 1. privacy-page-container.tsx（ページコンテナ）

**ファイルパス**: `src/features/privacy/components/privacy-page-container.tsx`

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

export function PrivacyPageContainer({
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
- `TermsPageContainer` と同様の構造（Header + main + Footer）
- マークダウンコンテンツを props として受け取る
- レイアウトはFigmaデザインに準拠
- 既存の `MarkdownContent` コンポーネントを再利用

---

### 2. 日本語版ページ（/privacy/page.tsx）

**ファイルパス**: `src/app/(default)/privacy/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { PrivacyPageContainer } from "@/features/privacy/components/privacy-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).privacy.title,
  openGraph: {
    title: metaTagList(language).privacy.title,
    url: metaTagList(language).privacy.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).privacy.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).privacy.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.privacy.ja,
    languages: {
      ja: i18nUrlList.privacy.ja,
      en: i18nUrlList.privacy.en,
    },
  },
};

const PrivacyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("privacy", language);

  return (
    <PrivacyPageContainer
      currentUrlPath={createIncludeLanguageAppPath("privacy", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default PrivacyPage;
```

**説明**:
- Server Component として実装（`async` 関数）
- `loadMarkdown("privacy", language)` で日本語版マークダウンを読み込み
- 既存の `metaTagList` からメタ情報を取得
- `i18nUrlList.privacy` から canonical URL を取得
- `currentUrlPath` は `createIncludeLanguageAppPath("privacy", language)` を使用して `/privacy` を生成

---

### 3. 英語版ページ（/en/privacy/page.tsx）

**ファイルパス**: `src/app/(default)/en/privacy/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { loadMarkdown } from "@/features/load-markdown";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { PrivacyPageContainer } from "@/features/privacy/components/privacy-page-container";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "en";

export const metadata: Metadata = {
  title: metaTagList(language).privacy.title,
  openGraph: {
    title: metaTagList(language).privacy.title,
    url: metaTagList(language).privacy.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).privacy.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).privacy.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.privacy.en,
    languages: {
      ja: i18nUrlList.privacy.ja,
      en: i18nUrlList.privacy.en,
    },
  },
};

const EnPrivacyPage: NextPage = async () => {
  const markdownContent = await loadMarkdown("privacy", language);

  return (
    <PrivacyPageContainer
      currentUrlPath={createIncludeLanguageAppPath("privacy", language)}
      language={language}
      markdownContent={markdownContent}
    />
  );
};

export default EnPrivacyPage;
```

**説明**:
- 日本語版と同様の構造
- `language = "en"` に変更
- `loadMarkdown("privacy", language)` で英語版マークダウンを読み込み
- `currentUrlPath` は `createIncludeLanguageAppPath("privacy", language)` を使用して `/en/privacy` を生成

---

## ディレクトリ構造（実装後）

```
src/
├── app/
│   └── (default)/
│       ├── terms/
│       │   └── page.tsx                    ← 既存（PR #388）
│       ├── privacy/
│       │   └── page.tsx                    ← 新規作成
│       └── en/
│           ├── terms/
│           │   └── page.tsx                ← 既存（PR #388）
│           └── privacy/
│               └── page.tsx                ← 新規作成
├── components/
│   ├── header.tsx                          ← 既存（変更なし）
│   ├── footer.tsx                          ← 既存（変更なし）
│   ├── markdown-content.tsx                ← 既存（PR #388・変更なし）
│   └── markdown-content.stories.tsx        ← 既存（PR #388・変更なし）
├── features/
│   ├── load-markdown.ts                    ← 既存（PR #388・変更なし）
│   ├── terms/
│   │   └── components/
│   │       └── terms-page-container.tsx    ← 既存（PR #388・変更なし）
│   └── privacy/
│       └── components/
│           └── privacy-page-container.tsx  ← 新規作成
└── docs/
    ├── terms.ja.md                         ← 既存（変更なし）
    ├── terms.en.md                         ← 既存（変更なし）
    ├── privacy.ja.md                       ← 既存（変更なし）
    ├── privacy.en.md                       ← 既存（変更なし）
    ├── external-transmission.ja.md         ← 既存（将来使用）
    └── external-transmission.en.md         ← 既存（将来使用）
```

---

## terms ページとの差分比較

プライバシーポリシーページは利用規約ページ（terms）と同じパターンで実装します。以下は主な差分：

| 項目 | terms ページ | privacy ページ |
|------|-------------|----------------|
| 日本語版パス | `/terms` | `/privacy` |
| 英語版パス | `/en/terms` | `/en/privacy` |
| コンテナコンポーネント | `TermsPageContainer` | `PrivacyPageContainer` |
| コンテナファイルパス | `src/features/terms/components/terms-page-container.tsx` | `src/features/privacy/components/privacy-page-container.tsx` |
| loadMarkdown の docType | `"terms"` | `"privacy"` |
| metaTagList のキー | `.terms` | `.privacy` |
| i18nUrlList のキー | `.terms` | `.privacy` |
| createIncludeLanguageAppPath の引数 | `"terms"` | `"privacy"` |
| ページコンポーネント名（日本語版） | `TermsPage` | `PrivacyPage` |
| ページコンポーネント名（英語版） | `EnTermsPage` | `EnPrivacyPage` |

**実装のポイント**: terms ページの実装をコピーし、上記の差分を置換するだけで実装できます。

---

## 実装順序

### Step 1: ディレクトリ作成

`src/features/privacy/components/` は新規ディレクトリのため、以下の構造を作成：

```bash
mkdir -p src/features/privacy/components
```

**注意**: `src/app/(default)/privacy/` および `src/app/(default)/en/privacy/` ディレクトリもファイル作成時に自動生成される。

### Step 2: プライバシーポリシーページ固有のコンポーネント作成

1. `src/features/privacy/components/privacy-page-container.tsx` を作成
   - `TermsPageContainer` をコピーして作成
   - 関数名を `TermsPageContainer` → `PrivacyPageContainer` に変更
   - それ以外の変更は不要（レイアウトは同じ）

### Step 3: ページの作成

1. `src/app/(default)/privacy/page.tsx` を作成
   - `src/app/(default)/terms/page.tsx` をコピーして作成
   - 以下を置換：
     - `TermsPageContainer` → `PrivacyPageContainer`
     - `@/features/terms/components/terms-page-container` → `@/features/privacy/components/privacy-page-container`
     - `.terms` → `.privacy`（全箇所）
     - `"terms"` → `"privacy"`（loadMarkdown、createIncludeLanguageAppPath の引数）
     - `TermsPage` → `PrivacyPage`

2. `src/app/(default)/en/privacy/page.tsx` を作成
   - `src/app/(default)/en/terms/page.tsx` をコピーして作成
   - 上記と同様の置換を行う
   - `EnTermsPage` → `EnPrivacyPage`

### Step 4: 品質管理の実行

詳細は「品質管理手順」セクション参照

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

PR #388 で作成された以下のコンポーネント・ユーティリティをそのまま使用：

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

// プライバシーページコンポーネント
import { PrivacyPageContainer } from "@/features/privacy/components/privacy-page-container";
```

### 5. 既存設定の確認

以下の設定は既に存在するため、新規追加は不要：

**src/features/url.ts:**
- `appPathList.privacy` = `/privacy`
- `i18nUrlList.privacy.ja` = `/privacy/`
- `i18nUrlList.privacy.en` = `/en/privacy/`

**src/features/meta-tag.ts:**
- `privacyPageTitle(language)` - 「LGTMeow プライバシーポリシー」/「LGTMeow Privacy Policy」
- `metaTagList(language).privacy` - OGP情報

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

- [ ] `http://localhost:2222/privacy` にアクセスして日本語版が表示される
- [ ] `http://localhost:2222/en/privacy` にアクセスして英語版が表示される
- [ ] Header が正常に表示される
- [ ] Footer が正常に表示される
- [ ] マークダウンの見出し（h1, h2）が正しくスタイリングされている
- [ ] h3タグ（5.1、5.2の小見出し）が表示されている（デフォルトスタイリング）
- [ ] 本文テキストが正しく表示されている
- [ ] 番号付きリスト（ol）が正しく表示されている
- [ ] 箇条書きリスト（ul）が正しく表示されている
- [ ] ネストされたリスト（5.1.4配下の項目）が正しくインデントされている
- [ ] リンク（お問い合わせフォーム）が正しく表示され、クリック可能
- [ ] 外部リンクが新しいタブで開く（`target="_blank"`）
- [ ] モバイルサイズでもレイアウトが崩れない

### 5. Storybookでの表示確認

Playwright MCPを使って `http://localhost:6006/` にアクセスし、以下を確認：

- [ ] `MarkdownContent` コンポーネントのストーリーが正常に表示される
- [ ] マークダウンのスタイリングがFigmaデザインと一致している

**注意**: `MarkdownContent` のストーリーは PR #388 で既に作成済みのため、新規作成は不要。

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。

特に確認すべき点：
- タイポグラフィ（フォントサイズ、行間、色）
- 余白（padding, margin, gap）
- コンテナ幅（max-width: 1020px）
- マークダウン内の各要素（h1, h2, p, ol, ul, a）のスタイリング

---

## トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| `Cannot find module '@/features/privacy/...'` | ディレクトリ未作成 | `mkdir -p src/features/privacy/components` を実行 |
| `Module not found: Can't resolve '@/features/load-markdown'` | パスの誤り | インポートパスを確認（`@/features/load-markdown`） |
| 404エラーが表示される | ファイルパスの誤り | `src/app/(default)/privacy/page.tsx` の配置を確認 |
| マークダウンが表示されない | `loadMarkdown` のdocTypeの誤り | `"privacy"` を正確に指定しているか確認 |
| OGP画像が表示されない | メタデータの設定誤り | `metaTagList(language).privacy` を使用しているか確認 |

### 実装時の確認ポイント

1. **ファイル先頭のコメント確認**: 全てのソースファイルに `// 絶対厳守：編集前に必ずAI実装ルールを読む` があるか
2. **インポート順序**: 型インポート（`import type`）は通常のインポートと分離する
3. **Props の readonly**: 全てのプロパティに `readonly` 修飾子が付いているか
4. **language 定数の値**: 日本語版は `"ja"`、英語版は `"en"` を正確に設定

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のマークダウンファイル（privacy.ja.md, privacy.en.md）の内容を変更しない**
3. **既存の共通コンポーネント（MarkdownContent, loadMarkdown）を変更しない**
4. **ビジネスロジックの変更禁止** - UI実装のみに集中
5. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 成功基準

以下を全て満たすこと：

### ファイル作成
- [ ] `src/features/privacy/components/privacy-page-container.tsx` が作成されている
- [ ] `src/app/(default)/privacy/page.tsx` が作成されている
- [ ] `src/app/(default)/en/privacy/page.tsx` が作成されている

### 機能確認
- [ ] `/privacy` にアクセスして日本語版プライバシーポリシーが表示される
- [ ] `/en/privacy` にアクセスして英語版プライバシーポリシーが表示される
- [ ] マークダウンの全ての要素（h1, h2, h3, p, ol, ul, a）が正しくレンダリングされる
- [ ] Header / Footer が正常に表示される
- [ ] メタタグ（title, OGP）が正しく設定されている

### デザイン
- [ ] Figmaデザイン（node: `882-7736`）と視覚的に一致している
- [ ] タイポグラフィ（色、サイズ、太さ）が仕様通り
- [ ] レイアウト（余白、幅）が仕様通り

### CI/テスト
- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認
- [ ] `http://localhost:2222/privacy` で正常に表示される
- [ ] `http://localhost:2222/en/privacy` で正常に表示される
- [ ] `http://localhost:6006/` のStorybookで `MarkdownContent` コンポーネントが正常に表示される

---

## 更新履歴

| 日時 | レビュー回 | 改善内容 |
|------|----------|---------|
| 2025-12-17 | 初版 | 実装計画書の初版作成 |
| 2025-12-17 | 1回目 | マークダウンファイルの構造分析を追加、h3タグに関する注意事項を追記、品質管理チェックリストにh3確認項目を追加 |
| 2025-12-17 | 2回目 | termsページとの差分比較表を追加、実装手順の詳細化、トラブルシューティングセクションを追加 |
| 2025-12-17 | 3回目 | 更新履歴セクションを追加、全体の整合性を最終確認 |

---

**作成日**: 2025-12-17
**最終更新日**: 2025-12-17
**対象Issue**: #331
**担当**: AI実装者
