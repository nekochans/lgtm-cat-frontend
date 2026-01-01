# Issue #411: PageLayoutの利用と命名規則の改善 - 詳細実装計画書

## 概要

### 目的

以下の3つのリファクタリングを実施する:

1. 全てのページレイアウトで `src/components/page-layout.tsx` が利用されるように変更
2. `◯◯PageContainer` の名称を `◯◯Page` に変更
3. `src/app/edge/` のディレクトリをより適切な場所に移動

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/411

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4

---

## 重要な設計判断

### PageLayoutのmainスタイリングについて

現在の `PageLayout` のmain要素は以下のスタイリングを持っている:

```tsx
<main className="relative flex w-full flex-1 flex-col items-center px-4 py-8">
```

一方、現在の各コンポーネント (`HomePageContainer`, `PrivacyPageContainer` 等) のmain要素は:

```tsx
<main className="flex w-full flex-1 flex-col items-center bg-background">
```

**問題**: `PageLayout` のmainには `px-4 py-8` があるが、各コンポーネントのmainにはpaddingがない。

**解決策**: `PageLayout` に `mainClassName` propsを追加し、各ページがmainのスタイリングをカスタマイズできるようにする。

---

## 現状分析

### PageLayoutの使用状況

#### PageLayoutを使用しているコンポーネント

| コンポーネント | ファイルパス |
|---------------|-------------|
| `UploadPageContainer` | `src/features/main/components/upload-page-container.tsx` |
| `DocsHowToUsePageContainer` | `src/features/docs/components/docs-how-to-use-page-container.tsx` |
| `DocsMcpPageContainer` | `src/features/docs/components/docs-mcp-page-container.tsx` |

#### PageLayoutを使用していないコンポーネント (直接Header/Footer/mainを記述)

| コンポーネント | ファイルパス |
|---------------|-------------|
| `HomePageContainer` | `src/features/main/components/home-page-container.tsx` |
| `PrivacyPageContainer` | `src/features/privacy/components/privacy-page-container.tsx` |
| `TermsPageContainer` | `src/features/terms/components/terms-page-container.tsx` |
| `ExternalTransmissionPolicyPageContainer` | `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` |

#### ErrorLayoutを使用しているコンポーネント

| コンポーネント | ファイルパス |
|---------------|-------------|
| `ErrorPageContainer` | `src/features/errors/components/error-page-container.tsx` |
| `NotFoundPageContainer` | `src/features/errors/components/not-found-page-container.tsx` |
| `MaintenancePageContainer` | `src/features/errors/components/maintenance-page-container.tsx` |

**注意**: `ErrorLayout` は背景色が `bg-orange-50` であり、通常の `PageLayout` (背景色 `bg-background`) とは異なるスタイリングを持つため、エラー系ページは引き続き `ErrorLayout` を使用する。

### src/app/edge/ の現状

| ファイル | 説明 | 依存ライブラリ |
|---------|------|---------------|
| `country.ts` | アクセス禁止国かどうかをチェック | `@vercel/edge-config`, `@vercel/functions` |
| `maintenance.ts` | メンテナンスモードかどうかをチェック | `@vercel/edge-config` |
| `url.ts` | ベースURLをヘッダーから取得 | `next/headers`, `@/features/url` |

これらは全て `src/proxy.ts` からのみインポートされている。

---

## 変更内容

### 1. 命名規則の変更

`◯◯PageContainer` を `◯◯Page` に変更する。

| 変更前 | 変更後 | ファイル名変更 |
|--------|--------|---------------|
| `HomePageContainer` | `HomePage` | `home-page-container.tsx` → `home-page.tsx` |
| `UploadPageContainer` | `UploadPage` | `upload-page-container.tsx` → `upload-page.tsx` |
| `PrivacyPageContainer` | `PrivacyPage` | `privacy-page-container.tsx` → `privacy-page.tsx` |
| `TermsPageContainer` | `TermsPage` | `terms-page-container.tsx` → `terms-page.tsx` |
| `ExternalTransmissionPolicyPageContainer` | `ExternalTransmissionPolicyPage` | `external-transmission-policy-page-container.tsx` → `external-transmission-policy-page.tsx` |
| `DocsHowToUsePageContainer` | `DocsHowToUsePage` | `docs-how-to-use-page-container.tsx` → `docs-how-to-use-page.tsx` |
| `DocsMcpPageContainer` | `DocsMcpPage` | `docs-mcp-page-container.tsx` → `docs-mcp-page.tsx` |
| `ErrorPageContainer` | `ErrorPage` | `error-page-container.tsx` → `error-page.tsx` |
| `NotFoundPageContainer` | `NotFoundPage` | `not-found-page-container.tsx` → `not-found-page.tsx` |
| `MaintenancePageContainer` | `MaintenancePage` | `maintenance-page-container.tsx` → `maintenance-page.tsx` |

**特記事項**: `src/app/(default)/error.tsx` 内の関数名 `ErrorPage` は `Error` に変更する (default export なので問題なし)。

### 2. PageLayoutへの統一

以下のコンポーネントを `PageLayout` を使用するように改修する:

- `HomePageContainer` → `HomePage`
- `PrivacyPageContainer` → `PrivacyPage`
- `TermsPageContainer` → `TermsPage`
- `ExternalTransmissionPolicyPageContainer` → `ExternalTransmissionPolicyPage`

**注意**: `HomePageContainer` は他のコンポーネントと異なり、main要素内のスタイリングが独自のため、`PageLayout` を使用しつつ独自のコンテンツ構造を維持する。

### 3. src/app/edge/ のリファクタリング

`src/app/edge/` を `src/lib/vercel/edge-functions/` に移動する。

| 変更前 | 変更後 |
|--------|--------|
| `src/app/edge/country.ts` | `src/lib/vercel/edge-functions/country.ts` |
| `src/app/edge/maintenance.ts` | `src/lib/vercel/edge-functions/maintenance.ts` |
| `src/app/edge/url.ts` | `src/lib/vercel/edge-functions/url.ts` |

**理由**:
- これらのファイルはVercel Edge Config/Functionsに依存しており、`src/lib/` 層に配置するのが適切
- `src/app/` 配下はNext.jsのApp Router用ファイルのみを配置すべき
- `edge` という名前よりも `edge-functions` の方が機能を正確に表現している

---

## ファイル構成

### 新規作成ディレクトリ

| ディレクトリパス | 説明 |
|----------------|------|
| `src/lib/vercel/edge-functions/` | Vercel Edge関連の関数を格納 |

### 削除対象ディレクトリ

| ディレクトリパス | 説明 |
|----------------|------|
| `src/app/edge/` | 移動後に削除 |

### 修正対象ファイル一覧

#### Phase 1: src/app/edge/ の移動

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/edge/country.ts` | `src/lib/vercel/edge-functions/country.ts` に移動 |
| `src/app/edge/maintenance.ts` | `src/lib/vercel/edge-functions/maintenance.ts` に移動 |
| `src/app/edge/url.ts` | `src/lib/vercel/edge-functions/url.ts` に移動 |
| `src/proxy.ts` | import文を更新 |

#### Phase 2: Container命名の変更とPageLayout統一

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/main/components/home-page-container.tsx` | `home-page.tsx` にリネーム、関数名変更、PageLayout使用に改修 |
| `src/features/main/components/upload-page-container.tsx` | `upload-page.tsx` にリネーム、関数名変更 |
| `src/features/privacy/components/privacy-page-container.tsx` | `privacy-page.tsx` にリネーム、関数名変更、PageLayout使用に改修 |
| `src/features/terms/components/terms-page-container.tsx` | `terms-page.tsx` にリネーム、関数名変更、PageLayout使用に改修 |
| `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` | `external-transmission-policy-page.tsx` にリネーム、関数名変更、PageLayout使用に改修 |
| `src/features/docs/components/docs-how-to-use-page-container.tsx` | `docs-how-to-use-page.tsx` にリネーム、関数名変更 |
| `src/features/docs/components/docs-mcp-page-container.tsx` | `docs-mcp-page.tsx` にリネーム、関数名変更 |
| `src/features/errors/components/error-page-container.tsx` | `error-page.tsx` にリネーム、関数名変更 |
| `src/features/errors/components/error-page-container.stories.tsx` | `error-page.stories.tsx` にリネーム、import更新、title変更 (`features/errors/ErrorPage`) |
| `src/features/errors/components/not-found-page-container.tsx` | `not-found-page.tsx` にリネーム、関数名変更 |
| `src/features/errors/components/not-found-page-container.stories.tsx` | `not-found-page.stories.tsx` にリネーム、import更新、title変更 (`features/errors/NotFoundPage`) |
| `src/features/errors/components/maintenance-page-container.tsx` | `maintenance-page.tsx` にリネーム、関数名変更 |
| `src/features/errors/components/maintenance-page-container.stories.tsx` | `maintenance-page.stories.tsx` にリネーム、import更新、title変更 (`features/errors/MaintenancePage`) |

#### Phase 3: page.tsx のimport更新

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/(default)/page.tsx` | import文を `home-page` に更新 |
| `src/app/(default)/en/page.tsx` | import文を `home-page` に更新 |
| `src/app/(default)/upload/page.tsx` | import文を `upload-page` に更新 |
| `src/app/(default)/en/upload/page.tsx` | import文を `upload-page` に更新 |
| `src/app/(default)/privacy/page.tsx` | import文を `privacy-page` に更新 |
| `src/app/(default)/en/privacy/page.tsx` | import文を `privacy-page` に更新 |
| `src/app/(default)/terms/page.tsx` | import文を `terms-page` に更新 |
| `src/app/(default)/en/terms/page.tsx` | import文を `terms-page` に更新 |
| `src/app/(default)/external-transmission-policy/page.tsx` | import文を `external-transmission-policy-page` に更新 |
| `src/app/(default)/en/external-transmission-policy/page.tsx` | import文を `external-transmission-policy-page` に更新 |
| `src/app/(default)/docs/how-to-use/page.tsx` | import文を `docs-how-to-use-page` に更新 |
| `src/app/(default)/en/docs/how-to-use/page.tsx` | import文を `docs-how-to-use-page` に更新 |
| `src/app/(default)/docs/mcp/page.tsx` | import文を `docs-mcp-page` に更新 |
| `src/app/(default)/en/docs/mcp/page.tsx` | import文を `docs-mcp-page` に更新 |
| `src/app/(default)/maintenance/page.tsx` | import文を `maintenance-page` に更新 |
| `src/app/(default)/en/maintenance/page.tsx` | import文を `maintenance-page` に更新 |
| `src/app/(default)/error.tsx` | 関数名を `Error` に変更、import文を `error-page` に更新 |
| `src/app/not-found.tsx` | import文を `not-found-page` に更新 |

#### Phase 4: AI向けコーディングルールの更新

| ファイルパス | 変更内容 |
|-------------|----------|
| `docs/project-coding-guidelines.md` | `◯◯Page` 命名規則についてのセクションを追加 |
| `src/CLAUDE.md` | ディレクトリ構成の例を更新 |
| `src/AGENTS.md` | ディレクトリ構成の例を更新 |

---

## 実装詳細

### 0. PageLayoutの改修

**ファイルパス**: `src/components/page-layout.tsx`

#### 変更前のコード

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";
import { Footer } from "./footer";
import { Header } from "./header";

type Props = {
  readonly children: ReactNode;
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn?: boolean;
};

/**
 * アプリケーション共通のページレイアウトコンポーネント
 * Header、main、Footerを含む基本構造を提供
 */
export function PageLayout({
  children,
  language,
  currentUrlPath,
  isLoggedIn = false,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={isLoggedIn}
        language={language}
      />
      <main className="relative flex w-full flex-1 flex-col items-center px-4 py-8">
        {children}
      </main>
      <Footer language={language} />
    </div>
  );
}
```

#### 変更後のコード

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";
import { Footer } from "./footer";
import { Header } from "./header";

type Props = {
  readonly children: ReactNode;
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn?: boolean;
  readonly mainClassName?: string;
};

const defaultMainClassName = "relative flex w-full flex-1 flex-col items-center px-4 py-8";

/**
 * アプリケーション共通のページレイアウトコンポーネント
 * Header、main、Footerを含む基本構造を提供
 */
export function PageLayout({
  children,
  language,
  currentUrlPath,
  isLoggedIn = false,
  mainClassName = defaultMainClassName,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={isLoggedIn}
        language={language}
      />
      <main className={mainClassName}>
        {children}
      </main>
      <Footer language={language} />
    </div>
  );
}
```

**変更点**:
- `mainClassName` propsを追加 (オプショナル)
- デフォルト値として現在のスタイリングを維持 (`defaultMainClassName`)
- 各ページがmainのスタイリングをカスタマイズできるようになる

**既存のPageLayout使用者への影響**:
- `UploadPage`, `DocsHowToUsePage`, `DocsMcpPage` は `mainClassName` を指定しないので、デフォルト値が適用される
- 既存の動作に影響なし

---

### 1. src/app/edge/ の移動

#### 1.1 新規ディレクトリの作成

```bash
mkdir -p src/lib/vercel/edge-functions
```

#### 1.2 ファイルの移動

**推奨**: `git mv` を使用してGitの履歴を保持する

```bash
git mv src/app/edge/country.ts src/lib/vercel/edge-functions/country.ts
git mv src/app/edge/maintenance.ts src/lib/vercel/edge-functions/maintenance.ts
git mv src/app/edge/url.ts src/lib/vercel/edge-functions/url.ts
rmdir src/app/edge
```

**注意**: Serena MCPの `rename_symbol` ツールを使用する場合は、シンボルのリネームのみが行われるため、ファイル自体の移動は別途行う必要がある。

#### 1.3 src/proxy.ts のimport更新

**変更前:**

```typescript
import { isBanCountry } from "@/app/edge/country";
import { isInMaintenance } from "@/app/edge/maintenance";
import { appBaseUrlHeaderName } from "@/app/edge/url";
```

**変更後:**

```typescript
import { isBanCountry } from "@/lib/vercel/edge-functions/country";
import { isInMaintenance } from "@/lib/vercel/edge-functions/maintenance";
import { appBaseUrlHeaderName } from "@/lib/vercel/edge-functions/url";
```

---

### 2. HomePageContainer の改修

**ファイルリネーム**:

```bash
git mv src/features/main/components/home-page-container.tsx src/features/main/components/home-page.tsx
```

**ファイルパス**: `src/features/main/components/home-page.tsx` (リネーム後)

#### 変更前のコード構造

```tsx
export const HomePageContainer = ({
  language,
  currentUrlPath,
  view,
}: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
    <Header
      currentUrlPath={currentUrlPath}
      hideLoginButton={true}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center bg-background">
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
          <ServiceDescription language={language} />
          <HomeActionButtons language={language} />
        </div>
        {view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />}
      </div>
    </main>
    <Footer language={language} />
  </div>
);
```

#### 変更後のコード

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
};

export const HomePage = ({ language, currentUrlPath, view }: Props) => (
  <PageLayout
    currentUrlPath={currentUrlPath}
    isLoggedIn={false}
    language={language}
    mainClassName="flex w-full flex-1 flex-col items-center bg-background"
  >
    <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
      <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
        <ServiceDescription language={language} />
        <HomeActionButtons language={language} />
      </div>
      {view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />}
    </div>
  </PageLayout>
);
```

**重要な変更点**:
- `Header`, `Footer` のimportを削除 (PageLayoutが提供するため)
- `PageLayout` をimport
- main要素の外側のdivを `PageLayout` に置き換え
- main要素を削除し、その中身のみを `PageLayout` の children として渡す
- **`mainClassName` を指定して、現在のmainスタイリングを維持**
- 関数名を `HomePageContainer` から `HomePage` に変更

---

### 3. PrivacyPageContainer の改修

**ファイルリネーム**:

```bash
git mv src/features/privacy/components/privacy-page-container.tsx src/features/privacy/components/privacy-page.tsx
```

**ファイルパス**: `src/features/privacy/components/privacy-page.tsx` (リネーム後)

#### 変更前のコード構造

```tsx
export function PrivacyPageContainer({
  language,
  currentUrlPath,
  markdownContent,
}: Props): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
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

#### 変更後のコード

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { MarkdownContent } from "@/components/markdown-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly markdownContent: string;
};

export function PrivacyPage({
  language,
  currentUrlPath,
  markdownContent,
}: Props): JSX.Element {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-10 py-[60px]">
        <MarkdownContent content={markdownContent} />
      </div>
    </PageLayout>
  );
}
```

**注意**: `TermsPage`, `ExternalTransmissionPolicyPage` も同様のパターンで改修する。`mainClassName` を指定して現在のmainスタイリングを維持すること。

---

### 4. Storybookファイルの更新

各Storybookファイルで以下の変更を行う:

#### 4.1 error-page.stories.tsx (リネーム後)

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { ErrorPage } from "./error-page";  // 変更

const meta = {
  component: ErrorPage,  // 変更
  title: "features/errors/ErrorPage",  // 変更
  // ... 以下同様
} satisfies Meta<typeof ErrorPage>;
```

#### 4.2 not-found-page.stories.tsx (リネーム後)

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundPage } from "./not-found-page";  // 変更

const meta = {
  component: NotFoundPage,  // 変更
  title: "features/errors/NotFoundPage",  // 変更
  // ... 以下同様
} satisfies Meta<typeof NotFoundPage>;
```

#### 4.3 maintenance-page.stories.tsx (リネーム後)

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { MaintenancePage } from "./maintenance-page";  // 変更

const meta = {
  component: MaintenancePage,  // 変更
  title: "features/errors/MaintenancePage",  // 変更
  // ... 以下同様
} satisfies Meta<typeof MaintenancePage>;
```

---

### 5. src/app/(default)/error.tsx の修正

**変更前:**

```tsx
export default function ErrorPage({ error, reset }: Props): JSX.Element {
  return <ErrorPageContainer error={error} reset={reset} />;
}
```

**変更後:**

```tsx
import { ErrorPage } from "@/features/errors/components/error-page";

// ... 中略 ...

export default function Error({ error, reset }: Props): JSX.Element {
  return <ErrorPage error={error} reset={reset} />;
}
```

---

### 5. AI向けコーディングルールの更新

#### 5.1 docs/project-coding-guidelines.md への追加

以下のセクションを追加:

```markdown
## Pageコンポーネントの命名規則

`src/features/` 配下のページコンポーネントは、**`◯◯Page`** という命名規則を使用する。

### 命名規則

```typescript
// 推奨: Page サフィックス
export function HomePage({ ... }: Props) { ... }
export function UploadPage({ ... }: Props) { ... }
export function PrivacyPage({ ... }: Props) { ... }

// 非推奨: Container サフィックス (旧命名規則)
export function HomePageContainer({ ... }: Props) { ... }
```

### ファイル名

```
推奨
home-page.tsx
upload-page.tsx
privacy-page.tsx

非推奨 (旧命名規則)
home-page-container.tsx
```

### 理由

- 2024-2025年のReact/Next.jsベストプラクティスでは、Feature-Based Architectureにおいて `Container` サフィックスを落とすことが推奨されている
- `◯◯Page` という名前は、そのコンポーネントがページのメインコンテンツを構築する役割であることを明確に示す
- `src/app/` 配下の page.tsx はルーティングとメタデータ定義のみを担当し、実際のUI構築は `src/features/` 配下の `◯◯Page` コンポーネントに委譲する
```

#### 5.2 src/CLAUDE.md と src/AGENTS.md の更新

ディレクトリ構成の例を更新:

```markdown
## ディレクトリ構成 (一部抜粋)

```text
src/
├── app/
│   └── (default)/
│       ├── page.tsx                         # 日本語版ホームページ
│       ├── upload/
│       │   └── page.tsx                     # 日本語版アップロードページ
│       └── en/
│           ├── page.tsx                     # 英語版ホームページ
│           └── upload/
│               └── page.tsx                 # 英語版アップロードページ
├── features/
│   └── main/
│       ├── components/
│       │   ├── home-page.tsx                # ホームページ (旧: home-page-container.tsx)
│       │   ├── upload-page.tsx              # アップロードページ (旧: upload-page-container.tsx)
│       │   ├── home-action-buttons.tsx      # アクションボタン群
│       │   ├── random-lgtm-images.tsx       # ランダム画像表示
│       │   ├── latest-lgtm-images.tsx       # 最新画像表示
│       │   └── service-description.tsx      # サービス説明
│       ├── actions/
│       │   ├── refresh-images.ts            # 画像更新アクション
│       │   └── copy-random-cat.ts           # ランダム猫コピーアクション
│       └── functions/
│           └── fetch-lgtm-images.ts         # API呼び出し関数
├── lib/
│   └── vercel/
│       └── edge-functions/                  # Vercel Edge関連関数 (旧: src/app/edge/)
│           ├── country.ts                   # アクセス禁止国チェック
│           ├── maintenance.ts               # メンテナンスモードチェック
│           └── url.ts                       # ベースURL取得
└── components/
    ├── page-layout.tsx                      # 共通ページレイアウト
    ├── icon-button.tsx                      # 汎用アイコンボタン
    └── link-button.tsx                      # 汎用リンクボタン
```
```

---

## ファイル操作コマンド一覧

### ディレクトリ作成

```bash
mkdir -p src/lib/vercel/edge-functions
```

### ファイル移動 (src/app/edge/ → src/lib/vercel/edge-functions/)

```bash
git mv src/app/edge/country.ts src/lib/vercel/edge-functions/country.ts
git mv src/app/edge/maintenance.ts src/lib/vercel/edge-functions/maintenance.ts
git mv src/app/edge/url.ts src/lib/vercel/edge-functions/url.ts
rmdir src/app/edge
```

### ファイルリネーム (Container → Page)

```bash
# main feature
git mv src/features/main/components/home-page-container.tsx src/features/main/components/home-page.tsx
git mv src/features/main/components/upload-page-container.tsx src/features/main/components/upload-page.tsx

# privacy feature
git mv src/features/privacy/components/privacy-page-container.tsx src/features/privacy/components/privacy-page.tsx

# terms feature
git mv src/features/terms/components/terms-page-container.tsx src/features/terms/components/terms-page.tsx

# external-transmission-policy feature
git mv src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx src/features/external-transmission-policy/components/external-transmission-policy-page.tsx

# docs feature
git mv src/features/docs/components/docs-how-to-use-page-container.tsx src/features/docs/components/docs-how-to-use-page.tsx
git mv src/features/docs/components/docs-mcp-page-container.tsx src/features/docs/components/docs-mcp-page.tsx

# errors feature
git mv src/features/errors/components/error-page-container.tsx src/features/errors/components/error-page.tsx
git mv src/features/errors/components/error-page-container.stories.tsx src/features/errors/components/error-page.stories.tsx
git mv src/features/errors/components/not-found-page-container.tsx src/features/errors/components/not-found-page.tsx
git mv src/features/errors/components/not-found-page-container.stories.tsx src/features/errors/components/not-found-page.stories.tsx
git mv src/features/errors/components/maintenance-page-container.tsx src/features/errors/components/maintenance-page.tsx
git mv src/features/errors/components/maintenance-page-container.stories.tsx src/features/errors/components/maintenance-page.stories.tsx
```

---

## 実装順序

以下の順序で実装を進めること:

### Phase 0: PageLayoutの改修

1. `src/components/page-layout.tsx` に `mainClassName` propsを追加
2. デフォルト値として現在のスタイリングを維持

### Phase 1: src/app/edge/ の移動

3. `src/lib/vercel/edge-functions/` ディレクトリを作成
4. `src/app/edge/country.ts` を移動
5. `src/app/edge/maintenance.ts` を移動
6. `src/app/edge/url.ts` を移動
7. `src/proxy.ts` のimport文を更新
8. `src/app/edge/` ディレクトリを削除

### Phase 2: Container命名の変更とPageLayout統一

以下の順序でファイルごとにリネームと改修を行う:

9. `HomePageContainer` → `HomePage` (ファイル名変更、関数名変更、PageLayout使用に改修、mainClassName指定)
10. `UploadPageContainer` → `UploadPage` (ファイル名変更、関数名変更)
11. `PrivacyPageContainer` → `PrivacyPage` (ファイル名変更、関数名変更、PageLayout使用に改修、mainClassName指定)
12. `TermsPageContainer` → `TermsPage` (ファイル名変更、関数名変更、PageLayout使用に改修、mainClassName指定)
13. `ExternalTransmissionPolicyPageContainer` → `ExternalTransmissionPolicyPage` (ファイル名変更、関数名変更、PageLayout使用に改修、mainClassName指定)
14. `DocsHowToUsePageContainer` → `DocsHowToUsePage` (ファイル名変更、関数名変更)
15. `DocsMcpPageContainer` → `DocsMcpPage` (ファイル名変更、関数名変更)
16. `ErrorPageContainer` → `ErrorPage` (ファイル名変更、関数名変更、Storybookのtitleも更新)
17. `NotFoundPageContainer` → `NotFoundPage` (ファイル名変更、関数名変更、Storybookのtitleも更新)
18. `MaintenancePageContainer` → `MaintenancePage` (ファイル名変更、関数名変更、Storybookのtitleも更新)

### Phase 3: page.tsx のimport更新

19. 全ての `src/app/(default)/` 配下のpage.tsxファイルのimport文を更新
20. `src/app/(default)/error.tsx` の関数名を `Error` に変更、import文を更新
21. `src/app/not-found.tsx` のimport文を更新

### Phase 4: AI向けコーディングルールの更新

22. `docs/project-coding-guidelines.md` にPageコンポーネント命名規則を追加
23. `src/CLAUDE.md` のディレクトリ構成例を更新
24. `src/AGENTS.md` のディレクトリ構成例を更新

### Phase 5: 品質管理

25. `npm run format` を実行
26. `npm run lint` を実行
27. `npm run test` を実行
28. Chrome DevTools MCP での表示確認
29. Storybook での表示確認

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

Chrome DevTools MCP を使って `http://localhost:2222` にアクセスし、以下を確認:

#### ページ表示確認

- [ ] `/` (日本語版ホームページ) が正常に表示される
- [ ] `/en` (英語版ホームページ) が正常に表示される
- [ ] `/upload` (日本語版アップロードページ) が正常に表示される
- [ ] `/en/upload` (英語版アップロードページ) が正常に表示される
- [ ] `/privacy` (日本語版プライバシーポリシー) が正常に表示される
- [ ] `/en/privacy` (英語版プライバシーポリシー) が正常に表示される
- [ ] `/terms` (日本語版利用規約) が正常に表示される
- [ ] `/en/terms` (英語版利用規約) が正常に表示される
- [ ] `/external-transmission-policy` (日本語版外部送信ポリシー) が正常に表示される
- [ ] `/en/external-transmission-policy` (英語版外部送信ポリシー) が正常に表示される
- [ ] `/docs/how-to-use` (日本語版使い方ページ) が正常に表示される
- [ ] `/en/docs/how-to-use` (英語版使い方ページ) が正常に表示される
- [ ] `/docs/mcp` (日本語版MCPページ) が正常に表示される
- [ ] `/en/docs/mcp` (英語版MCPページ) が正常に表示される
- [ ] `/maintenance` (日本語版メンテナンスページ) が正常に表示される
- [ ] `/en/maintenance` (英語版メンテナンスページ) が正常に表示される

#### レイアウト確認

- [ ] 全てのページでHeader、main、Footerが正しく配置されている
- [ ] 全てのページで背景色が適切に設定されている (通常ページ: bg-background、エラー系: bg-orange-50)

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] `features/errors/ErrorPage` の各ストーリーが正常に表示される
- [ ] `features/errors/NotFoundPage` の各ストーリーが正常に表示される
- [ ] `features/errors/MaintenancePage` の各ストーリーが正常に表示される

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止**
3. **ビジネスロジックの変更禁止** - リファクタリングのみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正
5. **ErrorLayoutの変更禁止** - エラー系ページは引き続きErrorLayoutを使用

---

## 成功基準

以下を全て満たすこと:

### PageLayoutの改修

- [ ] `src/components/page-layout.tsx` に `mainClassName` propsが追加されている
- [ ] デフォルト値として現在のスタイリングが維持されている
- [ ] 既存の `UploadPage`, `DocsHowToUsePage`, `DocsMcpPage` の動作に影響がない

### src/app/edge/ の移動

- [ ] `src/lib/vercel/edge-functions/` ディレクトリが作成されている
- [ ] `country.ts`, `maintenance.ts`, `url.ts` が移動されている
- [ ] `src/app/edge/` ディレクトリが削除されている
- [ ] `src/proxy.ts` のimport文が更新されている

### 命名規則の変更

- [ ] 全ての `◯◯PageContainer` が `◯◯Page` にリネームされている
- [ ] ファイル名も `*-page-container.tsx` から `*-page.tsx` に変更されている
- [ ] Storybookファイルも対応するリネームが完了している
- [ ] Storybookのtitleも `ErrorPageContainer` → `ErrorPage` 等に変更されている

### PageLayoutの統一

- [ ] `HomePage` が `PageLayout` を使用している
- [ ] `PrivacyPage` が `PageLayout` を使用している
- [ ] `TermsPage` が `PageLayout` を使用している
- [ ] `ExternalTransmissionPolicyPage` が `PageLayout` を使用している

### import文の更新

- [ ] 全てのpage.tsxファイルのimport文が新しいファイル名に更新されている
- [ ] `src/app/(default)/error.tsx` の関数名が `Error` に変更されている

### AI向けコーディングルール

- [ ] `docs/project-coding-guidelines.md` にPageコンポーネント命名規則が追加されている
- [ ] `src/CLAUDE.md` のディレクトリ構成例が更新されている
- [ ] `src/AGENTS.md` のディレクトリ構成例が更新されている

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### ブラウザ確認

- [ ] 全てのページが正常に表示される
- [ ] Storybookの全てのストーリーが正常に表示される
