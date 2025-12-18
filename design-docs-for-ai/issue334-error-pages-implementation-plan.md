# Issue #334: エラーページ（404/500/503）実装計画書

## 概要

### 目的

エラーページ（404 Not Found、500 Internal Server Error、503 Maintenance）と、それらで使用する共通UIコンポーネントを実装する。各ページは日本語・英語の両言語に対応し、Figmaデザインに準拠したUIを提供する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/334

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4
- **UIライブラリ**: HeroUI
- **既存コンポーネント**: `Header`, `Footer`, `LinkButton`, 各種ねこキャラクターSVG

### 変更の背景

サービスのエラーページをカスタムデザインで提供する必要がある。既にねこキャラクターのSVGコンポーネントは作成済みであり、これらを活用してユーザーフレンドリーなエラーページを実装する。

---

## Next.js エラーハンドリングの仕様（重要）

### 404ページ（not-found.tsx）

- **コンポーネントタイプ**: Server Component（`'use client'`不要）
- **metadataエクスポート**: ✅ 可能
- **配置場所**: `app/not-found.tsx`（ルートレベルで全体の未マッチURLを処理）
- **呼び出し方法**: `notFound()` 関数（`next/navigation`から import）

### 500ページ（error.tsx）

- **コンポーネントタイプ**: **Client Component必須**（`'use client'`必須）
- **metadataエクスポート**: ❌ **不可**（代わりにReactの`<title>`コンポーネントを使用）
- **Props**: `error: Error & { digest?: string }`, `reset: () => void`
- **配置場所**: `app/(default)/error.tsx`（ルートグループ内で処理）

### 503メンテナンスページ

- **コンポーネントタイプ**: Server Component
- **metadataエクスポート**: ✅ 可能
- **配置場所**: `app/(default)/maintenance/page.tsx`（通常のルートとして実装）
- **備考**: Next.jsの組み込み機能ではないため、カスタムルートとして実装

---

## Figmaデザイン仕様

### 404ページ

| バージョン | Node ID | URL |
|-----------|---------|-----|
| デスクトップ（日本語） | `882-7959` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-7959&m=dev |
| モバイル（日本語） | `854-7050` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=854-7050&m=dev |
| 英語版 | `882-8152` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-8152&m=dev |

**使用するねこコンポーネント**: `LookingUpCat`（`@/components/cats/looking-up-cat`）

### 500ページ

| バージョン | Node ID | URL |
|-----------|---------|-----|
| デスクトップ（日本語） | `132-79` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=132-79&m=dev |
| モバイル（日本語） | `230-2825` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=230-2825&m=dev |
| 英語版 | `882-8342` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-8342&m=dev |

**使用するねこコンポーネント**: `RunningCat`（`@/components/cats/running-cat`）

### 503メンテナンスページ

| バージョン | Node ID | URL |
|-----------|---------|-----|
| デスクトップ（日本語） | `166-238` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=166-238&m=dev |
| モバイル（日本語） | `230-2866` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=230-2866&m=dev |
| 英語版 | `882-8529` | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=882-8529&m=dev |

**使用するねこコンポーネント**: `FishHoldingCat`（`@/components/cats/fish-holding-cat`）

### ねこコンポーネントサイズ一覧

| エラー種別 | コンポーネント | モバイル幅 | デスクトップ幅 |
|-----------|--------------|-----------|--------------|
| 404 | `LookingUpCat` | 180px | 245px |
| 500 | `RunningCat` | 250px | 370px |
| 503 | `FishHoldingCat` | 230px | 350px |

**クラス指定例**: `className="h-auto w-[180px] md:w-[245px]"`

---

## レイアウト仕様

### 共通レイアウト（Figmaより）

| 要素 | デスクトップ | モバイル |
|------|-------------|---------|
| コンテナ最大幅 | 1020px | 100% |
| 左右パディング | 40px | 28px |
| 上下パディング | 60px | 40px |
| 要素間ギャップ | 48px | 28px |
| 背景色 | orange-50 (#fff7ed) | orange-50 (#fff7ed) |

### タイポグラフィ仕様

| 要素 | デスクトップ | モバイル | 色 |
|------|-------------|---------|-----|
| タイトル | text-4xl (36px) / bold | text-2xl (24px) / bold | orange-900 (#7c2d12) |
| メッセージ | text-xl (20px) / normal | text-base (16px) / normal | amber-900 (#78350f) |

### ボタン仕様

| 要素 | デスクトップ | モバイル |
|------|-------------|---------|
| 幅 | 400px | 300px |
| 高さ | 48px | 48px |
| 背景色 | orange-600 | orange-600 |
| テキスト | "Go to HOME" | "Go to HOME" |

**重要**: Figma上の「トップへ」は古い表現のため、日本語・英語ともに `Go to HOME` を使用する。

---

## テキストコンテンツ

### 404ページ

| 言語 | タイトル | メッセージ |
|------|---------|-----------|
| 日本語 | 404 ページが見つかりません | お探しのページは見つかりません。一時的にアクセス出来ない状態か、移動もしくは削除されてしまった可能性があります。 |
| 英語 | 404 Not Found | The page you are looking for cannot be found. It is temporarily inaccessible or has been removed. |

**注**: 上記文言はFigmaデザイン（Node ID: `882-7959`, `882-8152`）に準拠しています。

### 500ページ

| 言語 | タイトル | メッセージ |
|------|---------|-----------|
| 日本語 | 500 システムエラー | システムエラーが発生しました。しばらくお待ちいただいてから再度お試しください。 |
| 英語 | 500 Internal Server Error | A system error has occurred. Please wait a moment and try again. |

### 503メンテナンスページ

| 言語 | タイトル | メッセージ |
|------|---------|-----------|
| 日本語 | 503 メンテナンス | ただいまメンテナンス中です。しばらくお待ちください。 |
| 英語 | 503 Service Unavailable | We are currently under maintenance. Please wait a moment. |

---

## ファイル構成

### アーキテクチャ概要

本実装では**コンテナパターン**を採用しています：

- **ページファイル（`src/app/`配下）**: メタデータ定義とコンテナコンポーネントの呼び出しのみを担当
- **コンテナコンポーネント（`src/features/errors/components/`配下）**: ビジネスロジックとUI構成を担当
- **共通レイアウト（`ErrorLayout`）**: Header/main/Footerの共通構造を提供
- **共通UIコンポーネント（`ErrorPageContent`）**: タイトル・メッセージ・ねこ・ボタンの表示を担当

```
┌─────────────────────────────────────────────────────────────┐
│ ページファイル (src/app/not-found.tsx など)                  │
│   - metadata定義                                            │
│   - 言語判定ロジック                                         │
│   - コンテナコンポーネントの呼び出し                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ コンテナコンポーネント (NotFoundPageContainer など)           │
│   - ErrorLayoutでラップ                                     │
│   - i18nテキストの取得                                       │
│   - ErrorPageContentへのprops受け渡し                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ErrorLayout                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Header                                              │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ main (max-w-[1020px])                               │   │
│   │   └─ children (ErrorPageContent)                    │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ Footer                                              │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/components/error-page-content.tsx` | エラーページ共通UIコンポーネント |
| `src/features/errors/components/error-layout.tsx` | エラーページ共通レイアウト（Header/main/Footer） |
| `src/features/errors/components/error-page-container.tsx` | 500エラーページコンテナ |
| `src/features/errors/components/error-page-container.stories.tsx` | 上記のStorybook |
| `src/features/errors/components/not-found-page-container.tsx` | 404ページコンテナ |
| `src/features/errors/components/not-found-page-container.stories.tsx` | 上記のStorybook |
| `src/features/errors/components/maintenance-page-container.tsx` | 503メンテナンスページコンテナ |
| `src/features/errors/components/maintenance-page-container.stories.tsx` | 上記のStorybook |
| `src/features/errors/error-i18n.ts` | エラーページ用i18nテキスト定義 |
| `src/app/not-found.tsx` | 404ページ（Server Component） |
| `src/app/(default)/error.tsx` | 500ページ（Client Component） |
| `src/app/(default)/maintenance/page.tsx` | 503メンテナンスページ（日本語） |
| `src/app/(default)/en/maintenance/page.tsx` | 503メンテナンスページ（英語） |

### 既存ファイル（変更なし・流用）

| ファイルパス | 説明 |
|-------------|------|
| `src/components/header.tsx` | ヘッダーコンポーネント |
| `src/components/footer.tsx` | フッターコンポーネント |
| `src/components/link-button.tsx` | リンクボタンコンポーネント |
| `src/components/cats/looking-up-cat.tsx` | 404用ねこSVG |
| `src/components/cats/running-cat.tsx` | 500用ねこSVG |
| `src/components/cats/fish-holding-cat.tsx` | 503用ねこSVG |
| `src/features/meta-tag.ts` | メタタグユーティリティ（`notFoundMetaTag`, `errorMetaTag`, `maintenancePageTitle`が既存） |

### 既存ファイル（修正が必要）

| ファイルパス | 修正内容 |
|-------------|----------|
| `src/features/url.ts` | `i18nUrlList.maintenance`のバグ修正（privacyを参照している問題） |

---

## バグ修正: url.ts の maintenance URL

### 現状（バグあり）

```typescript
// src/features/url.ts 135-138行目
maintenance: {
  ja: `${appPathList.privacy}/`,  // ❌ 誤: privacyを参照
  en: `/en${appPathList.privacy}/`,  // ❌ 誤: privacyを参照
},
```

### 修正後

```typescript
maintenance: {
  ja: `${appPathList.maintenance}/`,  // ✅ 正: maintenanceを参照
  en: `/en${appPathList.maintenance}/`,  // ✅ 正: maintenanceを参照
},
```

---

## コンポーネント実装詳細

### 1. error-layout.tsx（共通レイアウトコンポーネント）

**ファイルパス**: `src/features/errors/components/error-layout.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly children: ReactNode;
};

export function ErrorLayout({ language, currentUrlPath, children }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-orange-50">
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
      <main className="flex w-full flex-1 flex-col items-center">
        <div className="flex w-full max-w-[1020px] flex-col items-center">
          {children}
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
```

**説明**:
- エラーページ（404/500/503）で共通して使用するレイアウトコンポーネント
- Header、main、Footerの構造を提供
- `children`でページ固有のコンテンツ（ErrorPageContent）を受け取る
- `currentUrlPath`は`IncludeLanguageAppPath`型（branded type）を使用

---

### 2. error-i18n.ts（i18nテキスト定義）

**ファイルパス**: `src/features/errors/error-i18n.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { assertNever } from "@/utils/assert-never";
import type { Language } from "@/features/language";

type ErrorPageTexts = {
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
};

export function notFoundPageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "404 ページが見つかりません",
        message:
          "お探しのページは見つかりません。一時的にアクセス出来ない状態か、移動もしくは削除されてしまった可能性があります。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "404 Not Found",
        message:
          "The page you are looking for cannot be found. It is temporarily inaccessible or has been removed.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}

export function errorPageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "500 システムエラー",
        message:
          "システムエラーが発生しました。しばらくお待ちいただいてから再度お試しください。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "500 Internal Server Error",
        message:
          "A system error has occurred. Please wait a moment and try again.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}

export function maintenancePageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "503 メンテナンス",
        message: "ただいまメンテナンス中です。しばらくお待ちください。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "503 Service Unavailable",
        message:
          "We are currently under maintenance. Please wait a moment.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}
```

---

### 3. error-page-content.tsx（共通UIコンポーネント）

**ファイルパス**: `src/components/error-page-content.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX, ReactNode } from "react";
import { LinkButton } from "@/components/link-button";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly catComponent: ReactNode;
};

export function ErrorPageContent({
  language,
  title,
  message,
  buttonText,
  catComponent,
}: Props): JSX.Element {
  const homeUrl = createIncludeLanguageAppPath("home", language);

  return (
    // Figma仕様: モバイル px-7(28px) py-10(40px) gap-7(28px)
    // Figma仕様: デスクトップ px-10(40px) py-[60px] gap-12(48px)
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:gap-12 md:px-10 md:py-[60px]">
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <h1 className="text-center font-bold text-2xl text-orange-900 md:text-4xl">
          {title}
        </h1>
        <p className="text-center text-amber-900 text-base md:text-xl">
          {message}
        </p>
      </div>
      {/* ねこイラストは装飾的要素のため、catComponentでaria-hidden="true"を設定 */}
      <div className="flex items-center justify-center">{catComponent}</div>
      {/* Figma仕様: ボタン幅 モバイル300px / デスクトップ400px */}
      <LinkButton
        className="w-full max-w-[300px] md:max-w-[400px]"
        linkText={buttonText}
        linkUrl={homeUrl}
      />
    </div>
  );
}
```

**説明**:
- 404/500/503ページで共通して使用するUIコンポーネント
- タイトル、メッセージ、ねこコンポーネント、ボタンを受け取る
- レスポンシブデザイン対応（モバイル/デスクトップ）
- ねこコンポーネントには呼び出し側で`aria-hidden="true"`を設定（SVGの`<title>`要素との重複を避けるため）
- CSSクラスとFigma仕様の対応関係をコメントで明記
- ボタン幅は`w-full max-w-[300px] md:max-w-[400px]`で、Figma仕様の固定幅（モバイル300px、デスクトップ400px）を満たす

---

### 4. not-found-page-container.tsx（404ページコンテナ）

**ファイルパス**: `src/features/errors/components/not-found-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { LookingUpCat } from "@/components/cats/looking-up-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { notFoundPageTexts } from "@/features/errors/error-i18n";
import type { Language } from "@/features/language";

type Props = {
  readonly language: Language;
};

export function NotFoundPageContainer({ language }: Props) {
  const texts = notFoundPageTexts(language);
  const currentUrlPath = language === "en" ? "/en" : "/";

  return (
    <ErrorLayout currentUrlPath={currentUrlPath} language={language}>
      <ErrorPageContent
        buttonText={texts.buttonText}
        catComponent={
          <LookingUpCat
            aria-hidden="true"
            className="h-auto w-[180px] md:w-[245px]"
          />
        }
        language={language}
        message={texts.message}
        title={texts.title}
      />
    </ErrorLayout>
  );
}
```

**説明**:
- 404ページのUIロジックを担当するコンテナコンポーネント
- `ErrorLayout`でラップし、`ErrorPageContent`にpropsを渡す
- `LookingUpCat`コンポーネントを使用

---

### 5. not-found.tsx（404ページ）

**ファイルパス**: `src/app/not-found.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { JSX } from "react";
import { NotFoundPageContainer } from "@/features/errors/components/not-found-page-container";
import type { Language } from "@/features/language";
import { notFoundMetaTag } from "@/features/meta-tag";

// metadataはビルド時に評価されるため、静的な値を使用
// 動的な言語判定はコンポーネント内で行うが、metadataは日本語固定
// これは仕様として許容する（Next.jsのmetadataはリクエスト情報に依存できないため）
const metaTag = notFoundMetaTag("ja");

export const metadata: Metadata = {
  title: metaTag.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * リクエストヘッダーから言語を判定する
 * 判定優先順位:
 * 1. x-pathname ヘッダー（Next.jsミドルウェアで設定可能）
 * 2. x-matched-path ヘッダー（Next.js内部ヘッダー）
 * 3. next-url ヘッダー（Next.js内部ヘッダー）
 * 4. referer ヘッダー（遷移元URL）
 * 5. 日本語にフォールバック
 */
function detectLanguageFromHeaders(headersList: Headers): Language {
  // 優先度1: x-pathname（ミドルウェアで明示的に設定可能）
  const xPathname = headersList.get("x-pathname");
  if (xPathname?.startsWith("/en")) {
    return "en";
  }

  // 優先度2: x-matched-path（Next.js内部ヘッダー）
  const xMatchedPath = headersList.get("x-matched-path");
  if (xMatchedPath?.startsWith("/en")) {
    return "en";
  }

  // 優先度3: next-url（Next.js内部ヘッダー）
  const nextUrl = headersList.get("next-url");
  if (nextUrl?.startsWith("/en")) {
    return "en";
  }

  // 優先度4: referer（遷移元URL）
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.pathname.startsWith("/en")) {
        return "en";
      }
    } catch {
      // URLパースエラーは無視
    }
  }

  // 優先度5: 日本語にフォールバック
  return "ja";
}

export default async function NotFound(): Promise<JSX.Element> {
  // Next.js 16では headers() は非同期関数
  const headersList = await headers();
  const language = detectLanguageFromHeaders(headersList);

  return <NotFoundPageContainer language={language} />;
}
```

**説明**:
- Server Componentとして実装（`'use client'`不要）
- `metadata`をexport可能（ビルド時に評価されるため静的な日本語を使用。**仕様として日本語固定**）
- ルートの`app/not-found.tsx`は全体の未マッチURLを処理
- `headers()`を使用して複数のヘッダーから言語を判定（パスヘッダー > referer > 日本語フォールバック）
- Next.js 16では`headers()`は非同期関数のため`await`が必要
- **コンテナパターン**: `NotFoundPageContainer`を呼び出すのみ

**言語判定の優先順位**:
1. `x-pathname`ヘッダー（ミドルウェアで設定可能）
2. `x-matched-path`ヘッダー（Next.js内部ヘッダー）
3. `next-url`ヘッダー（Next.js内部ヘッダー）
4. `referer`ヘッダー（遷移元URL）
5. 日本語にフォールバック

**注意**: 直接URLを入力した場合やヘッダーが取得できない場合は日本語にフォールバックする

---

### 6. error-page-container.tsx（500ページコンテナ）

**ファイルパス**: `src/features/errors/components/error-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { captureException } from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useMemo } from "react";
import { RunningCat } from "@/components/cats/running-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { errorPageTexts } from "@/features/errors/error-i18n";
import type { Language } from "@/features/language";
import { customErrorTitle } from "@/features/meta-tag";

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * パスから言語を判定する
 * /en で始まるパスの場合は英語、それ以外は日本語
 */
function detectLanguageFromPathname(pathname: string | null): Language {
  if (!pathname) {
    return "ja";
  }
  return pathname.startsWith("/en") ? "en" : "ja";
}

export function ErrorPageContainer({
  error,
  reset: _reset,
}: Props): JSX.Element {
  const pathname = usePathname();
  const language = useMemo(
    () => detectLanguageFromPathname(pathname),
    [pathname]
  );
  const texts = useMemo(() => errorPageTexts(language), [language]);
  const currentUrlPath = language === "en" ? "/en" : "/";

  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <>
      <title>{customErrorTitle(language)}</title>
      <meta content="noindex,nofollow" name="robots" />
      <ErrorLayout currentUrlPath={currentUrlPath} language={language}>
        <ErrorPageContent
          buttonText={texts.buttonText}
          catComponent={
            <RunningCat
              aria-hidden="true"
              className="h-auto w-[250px] md:w-[370px]"
            />
          }
          language={language}
          message={texts.message}
          title={texts.title}
        />
      </ErrorLayout>
    </>
  );
}
```

**説明**:
- **Client Component必須**（`'use client'`）
- `metadata`のexportは**不可**のため、Reactの`<title>`コンポーネントを使用
- **検索エンジン対策**: `<meta content="noindex,nofollow" name="robots" />`を追加
- `usePathname()`を使用してURLパスから言語を判定
- Sentryへのエラー報告を`useEffect`で実装
- `ErrorLayout`でラップし、`ErrorPageContent`にpropsを渡す
- `RunningCat`コンポーネントを使用

**reset関数について**:
- `reset()`は再レンダリングを試行する関数で、一時的なエラーからの回復に使用可能
- 現在の実装ではホームへの誘導を優先しているため未使用（`_reset`として受け取り）
- 将来的に「もう一度試す」ボタンを追加する場合は、この関数を呼び出す実装に変更可能

---

### 7. error.tsx（500ページ）

**ファイルパス**: `src/app/(default)/error.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { ErrorPageContainer } from "@/features/errors/components/error-page-container";

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ error, reset }: Props): JSX.Element {
  return <ErrorPageContainer error={error} reset={reset} />;
}
```

**説明**:
- **Client Component必須**（`'use client'`）
- **コンテナパターン**: `ErrorPageContainer`を呼び出すのみ
- ページファイルは薄いラッパーとして機能

---

### 8. maintenance-page-container.tsx（503メンテナンスページコンテナ）

**ファイルパス**: `src/features/errors/components/maintenance-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { FishHoldingCat } from "@/components/cats/fish-holding-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { maintenancePageTexts } from "@/features/errors/error-i18n";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
};

export function MaintenancePageContainer({ language }: Props) {
  const texts = maintenancePageTexts(language);

  return (
    <ErrorLayout
      currentUrlPath={createIncludeLanguageAppPath("maintenance", language)}
      language={language}
    >
      <ErrorPageContent
        buttonText={texts.buttonText}
        catComponent={
          <FishHoldingCat
            aria-hidden="true"
            className="h-auto w-[230px] md:w-[350px]"
          />
        }
        language={language}
        message={texts.message}
        title={texts.title}
      />
    </ErrorLayout>
  );
}
```

**説明**:
- 503メンテナンスページのUIロジックを担当するコンテナコンポーネント
- `ErrorLayout`でラップし、`ErrorPageContent`にpropsを渡す
- `FishHoldingCat`コンポーネントを使用
- `createIncludeLanguageAppPath`で言語に応じたURLパスを生成

---

### 9. maintenance/page.tsx（503メンテナンスページ・日本語）

**ファイルパス**: `src/app/(default)/maintenance/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { MaintenancePageContainer } from "@/features/errors/components/maintenance-page-container";
import type { Language } from "@/features/language";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).maintenance.title,
  openGraph: {
    title: metaTagList(language).maintenance.title,
    url: metaTagList(language).maintenance.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).maintenance.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).maintenance.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.maintenance.ja,
    languages: {
      ja: i18nUrlList.maintenance.ja,
      en: i18nUrlList.maintenance.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const MaintenancePage: NextPage = () => (
  <MaintenancePageContainer language={language} />
);

export default MaintenancePage;
```

**説明**:
- **コンテナパターン**: `MaintenancePageContainer`を呼び出すのみ
- `metadata`でSEO設定とOGP設定を行う
- ページファイルは薄いラッパーとして機能

---

### 10. en/maintenance/page.tsx（503メンテナンスページ・英語）

**ファイルパス**: `src/app/(default)/en/maintenance/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { MaintenancePageContainer } from "@/features/errors/components/maintenance-page-container";
import type { Language } from "@/features/language";
import { convertLocaleToLanguage } from "@/features/locale";
import { appName, metaTagList } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";

const language: Language = "en";

export const metadata: Metadata = {
  title: metaTagList(language).maintenance.title,
  openGraph: {
    title: metaTagList(language).maintenance.title,
    url: metaTagList(language).maintenance.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).maintenance.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).maintenance.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.maintenance.en,
    languages: {
      ja: i18nUrlList.maintenance.ja,
      en: i18nUrlList.maintenance.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const EnMaintenancePage: NextPage = () => (
  <MaintenancePageContainer language={language} />
);

export default EnMaintenancePage;
```

**説明**:
- **コンテナパターン**: `MaintenancePageContainer`を呼び出すのみ
- 日本語版との違いは`language`変数のみ

---

### 11. Storybook（各コンテナコンポーネント用）

Storybookファイルは各コンテナコンポーネントと同じディレクトリに配置：

- `src/features/errors/components/error-page-container.stories.tsx`
- `src/features/errors/components/not-found-page-container.stories.tsx`
- `src/features/errors/components/maintenance-page-container.stories.tsx`

**ファイルパス例**: `src/features/errors/components/not-found-page-container.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundPageContainer } from "./not-found-page-container";

const meta = {
  component: NotFoundPageContainer,
  title: "features/errors/NotFoundPageContainer",
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "responsive",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotFoundPageContainer>;

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

**説明**:
- 各コンテナコンポーネントごとにStorybookを作成
- コンテナが`ErrorLayout`を含むため、decoratorsでHeader/Footerをラップする必要がない
- 日本語・英語のストーリーを`language`引数で切り替え
- `layout: "fullscreen"`でフルページ表示

---

## ディレクトリ構造（実装後）

```
src/
├── app/
│   ├── not-found.tsx                       ← 新規作成（404ページ - コンテナを呼び出すのみ）
│   ├── global-error.tsx                    ← 既存（変更なし）
│   └── (default)/
│       ├── error.tsx                       ← 新規作成（500ページ - コンテナを呼び出すのみ）
│       ├── maintenance/
│       │   └── page.tsx                    ← 新規作成（503日本語 - コンテナを呼び出すのみ）
│       └── en/
│           └── maintenance/
│               └── page.tsx                ← 新規作成（503英語 - コンテナを呼び出すのみ）
├── components/
│   ├── error-page-content.tsx              ← 新規作成（共通UIコンポーネント）
│   ├── link-button.tsx                     ← 既存（変更なし）
│   ├── header.tsx                          ← 既存（変更なし）
│   ├── footer.tsx                          ← 既存（変更なし）
│   └── cats/
│       ├── looking-up-cat.tsx              ← 既存（変更なし）
│       ├── running-cat.tsx                 ← 既存（変更なし）
│       └── fish-holding-cat.tsx            ← 既存（変更なし）
└── features/
    ├── errors/
    │   ├── error-i18n.ts                   ← 新規作成（i18nテキスト定義）
    │   └── components/
    │       ├── error-layout.tsx            ← 新規作成（共通レイアウト）
    │       ├── error-page-container.tsx    ← 新規作成（500ページコンテナ）
    │       ├── error-page-container.stories.tsx  ← 新規作成
    │       ├── not-found-page-container.tsx     ← 新規作成（404ページコンテナ）
    │       ├── not-found-page-container.stories.tsx  ← 新規作成
    │       ├── maintenance-page-container.tsx   ← 新規作成（503ページコンテナ）
    │       └── maintenance-page-container.stories.tsx  ← 新規作成
    ├── meta-tag.ts                         ← 既存（変更なし）
    └── url.ts                              ← 既存（バグ修正）
```

---

## 実装順序

### Step 1: バグ修正

`src/features/url.ts`の`i18nUrlList.maintenance`を修正

### Step 2: ディレクトリ作成

```bash
mkdir -p src/features/errors/components
mkdir -p src/app/\(default\)/maintenance
mkdir -p src/app/\(default\)/en/maintenance
```

### Step 3: i18nテキスト定義作成

`src/features/errors/error-i18n.ts`を作成

### Step 4: 共通UIコンポーネント作成

`src/components/error-page-content.tsx`を作成

### Step 5: 共通レイアウトコンポーネント作成

`src/features/errors/components/error-layout.tsx`を作成

### Step 6: コンテナコンポーネント作成

1. `src/features/errors/components/not-found-page-container.tsx`を作成
2. `src/features/errors/components/error-page-container.tsx`を作成
3. `src/features/errors/components/maintenance-page-container.tsx`を作成

### Step 7: ページファイル作成

1. `src/app/not-found.tsx`（404ページ）を作成
2. `src/app/(default)/error.tsx`（500ページ）を作成
3. `src/app/(default)/maintenance/page.tsx`（503日本語）を作成
4. `src/app/(default)/en/maintenance/page.tsx`（503英語）を作成

### Step 8: Storybook作成

1. `src/features/errors/components/not-found-page-container.stories.tsx`を作成
2. `src/features/errors/components/error-page-container.stories.tsx`を作成
3. `src/features/errors/components/maintenance-page-container.stories.tsx`を作成

### Step 9: 品質管理の実行

詳細は「品質管理手順」セクション参照

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

#### 404ページ

- [ ] 存在しないURL（例: `http://localhost:2222/nonexistent`）にアクセスして404ページが表示される
- [ ] タイトル「404 ページが見つかりません」が表示される
- [ ] メッセージが正しく表示される
- [ ] LookingUpCatが表示される
- [ ] 「Go to HOME」ボタンが表示され、クリックするとトップページに遷移する
- [ ] Header / Footer が正常に表示される

**多言語対応確認**:
- [ ] `/en/nonexistent` にアクセスした場合、404ページで英語が表示される（パスヘッダーまたはrefererによる判定）
- [ ] 直接URLを入力した場合は日本語にフォールバックされる（仕様通り）
- [ ] **注意**: 言語判定はヘッダーに依存するため、環境によって挙動が異なる可能性がある

#### 500ページ

- [ ] エラーが発生した場合に500ページが表示される（テスト困難な場合はスキップ可）
- [ ] RunningCatが表示される
- [ ] `<meta name="robots" content="noindex,nofollow" />`が設定されている（ソースで確認）

**多言語対応確認**:
- [ ] `/en/...` でエラーが発生した場合、500ページが英語で表示される（usePathnameによる判定）
- [ ] `/...` でエラーが発生した場合、500ページが日本語で表示される

#### 503メンテナンスページ

- [ ] `http://localhost:2222/maintenance` にアクセスして日本語版が表示される
- [ ] `http://localhost:2222/en/maintenance` にアクセスして英語版が表示される
- [ ] タイトル「503 メンテナンス」/「503 Service Unavailable」が表示される
- [ ] FishHoldingCatが表示される
- [ ] 「Go to HOME」ボタンが表示され、クリックするとトップページに遷移する
- [ ] Header / Footer が正常に表示される

#### レスポンシブデザイン

- [ ] デスクトップサイズ（1024px以上）でレイアウトが崩れない
- [ ] モバイルサイズ（375px程度）でレイアウトが崩れない

### 5. Storybookでの表示確認

Playwright MCPを使って `http://localhost:6006/` にアクセスし、以下を確認：

- [ ] `features/errors/NotFoundPageContainer` のストーリーが表示される
  - [ ] `Japanese` が正常に表示される
  - [ ] `English` が正常に表示される
- [ ] `features/errors/ErrorPageContainer` のストーリーが表示される
  - [ ] `Japanese` が正常に表示される
  - [ ] `English` が正常に表示される
- [ ] `features/errors/MaintenancePageContainer` のストーリーが表示される
  - [ ] `Japanese` が正常に表示される
  - [ ] `English` が正常に表示される
- [ ] 各ストーリーでHeader/Footerが表示される（ErrorLayoutに含まれる）

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。

特に確認すべき点：
- タイポグラフィ（フォントサイズ、行間、色）
- 余白（padding, margin, gap）
- コンテナ幅（max-width: 1020px）
- ボタンサイズ（デスクトップ: 400px、モバイル: 300px）
- ねこSVGのサイズ

### 7. Figmaデザインとの照合

Figma MCP（`mcp__figma-dev-mode-mcp-server__get_design_context`）を使用して、実装がFigmaデザインと一致しているか確認すること。

**確認手順**:
1. 各エラーページのNode IDを使用してFigmaデザインを取得
2. 実際の実装とデザインを比較
3. 色、フォントサイズ、余白、要素サイズが一致しているか確認

**Node ID一覧**:
| ページ | デスクトップ | モバイル | 英語版 |
|--------|------------|---------|--------|
| 404 | `882-7959` | `854-7050` | `882-8152` |
| 500 | `132-79` | `230-2825` | `882-8342` |
| 503 | `166-238` | `230-2866` | `882-8529` |

---

## 実装時の注意事項

### 1. コンポーネントタイプの区別

| ページ | タイプ | `'use client'` | `metadata` |
|--------|--------|----------------|-----------|
| 404 | Server Component | 不要 | 可能 |
| 500 | Client Component | **必須** | **不可**（`<title>`使用） |
| 503 | Server Component | 不要 | 可能 |

### 2. 言語判定について

#### 404ページ（Server Component）

`headers()`関数を使用して複数のヘッダーから言語を判定します。

**実装方針**:
1. `x-pathname`ヘッダー（ミドルウェアで設定可能）を確認
2. `x-matched-path`ヘッダー（Next.js内部ヘッダー）を確認
3. `next-url`ヘッダー（Next.js内部ヘッダー）を確認
4. `referer`ヘッダー（遷移元URL）を確認
5. いずれも`/en`で始まらない場合は日本語にフォールバック

**Next.js 16の注意点**:
- `headers()`は非同期関数のため`await`が必要
- `async function NotFound()`として実装

**注意事項**:
- 直接URLを入力した場合、多くのヘッダーが取得できないため日本語にフォールバックする可能性が高い
- これは仕様として許容する

**metadataについて**:
- 404ページの`metadata`（`<title>`、OGPなど）は**日本語固定**
- **技術検証結果**: `generateMetadata`は`not-found.tsx`で動作するが、`headers()`で取得できるヘッダーにリクエストパス情報が含まれない
  - `x-pathname`, `x-matched-path`, `next-url`, `referer`等が全て`null`
  - 現在のミドルウェア（`proxy.ts`）のmatcherが存在しないパスに適用されないため
- ミドルウェアの大幅な変更が必要となるため、メタデータは日本語固定を仕様として採用
- **本文（コンポーネント内）は引き続き`headers()`で可能な範囲で多言語対応を試みる**

#### 500ページ（Client Component）

`usePathname()`フックを使用してURLパスから言語を判定します。

**実装方針**:
- `usePathname()`で現在のURLパスを取得
- パスが`/en`で始まる場合は英語、それ以外は日本語

**注意事項**:
- Client Componentでは`headers()`が使用できないため、`usePathname()`を使用
- `usePathname()`はクライアントサイドで実行されるため、エラー発生時のURLパスを正確に取得できる

#### 503メンテナンスページ

- 通常のルートとして実装するため、日本語版・英語版を別ファイルで作成
- `/maintenance` → 日本語版
- `/en/maintenance` → 英語版

### 3. 既存コンポーネントの再利用

以下のコンポーネントは変更せずにそのまま使用：

- `Header` / `Footer`
- `LinkButton`
- 各種ねこSVGコンポーネント

### 4. 型定義

Props は `readonly` 修飾子を使用：

```typescript
type Props = {
  readonly language: Language;
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly catComponent: ReactNode;
};
```

### 5. インポートパスの確認

すべてのインポートは `@/` エイリアスを使用。

---

## トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| `Cannot find module '@/features/errors/error-i18n'` | ディレクトリ未作成 | `mkdir -p src/features/errors` を実行 |
| 404ページが表示されない | ファイルパスの誤り | `src/app/not-found.tsx` の配置を確認（`(default)` 内ではなくルート直下） |
| 500ページで`metadata`エラー | Client Componentでmetadata使用 | `metadata`ではなく`<title>`コンポーネントを使用 |
| Headerが動かない | Server ComponentでClient Componentを使用 | Headerは問題なく使用可能（親コンポーネントの境界で自動分離） |
| Storybookでヘッダーが表示されない | decoratorの設定漏れ | 各ストーリーにdecoratorsを設定しているか確認 |
| ボタンのリンク先が間違っている | `createIncludeLanguageAppPath`の引数誤り | 第一引数は`"home"`、第二引数は`language`を指定 |
| メンテナンスページのcanonical URLが間違う | url.tsのバグ未修正 | `i18nUrlList.maintenance`が`appPathList.maintenance`を参照しているか確認 |

### 実装時の確認ポイント

1. **ファイル先頭のコメント確認**: 全てのソースファイルに `// 絶対厳守：編集前に必ずAI実装ルールを読む` があるか
2. **インポート順序**: 型インポート（`import type`）は通常のインポートと分離する
3. **Props の readonly**: 全てのプロパティに `readonly` 修飾子が付いているか
4. **language 定数の型**: `const language: Language = "ja"` のように明示的に型を付ける
5. **error.tsx の `'use client'`**: ファイル先頭（コメント直後）に必ず `"use client";` を記述

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のねこSVGコンポーネントの内容を変更しない**
3. **既存の共通コンポーネント（Header, Footer, LinkButton）を変更しない**
4. **ビジネスロジックの変更禁止** - UI実装のみに集中
5. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 成功基準

以下を全て満たすこと：

### ファイル作成

- [ ] `src/features/errors/error-i18n.ts` が作成されている
- [ ] `src/components/error-page-content.tsx` が作成されている
- [ ] `src/features/errors/components/error-layout.tsx` が作成されている
- [ ] `src/features/errors/components/not-found-page-container.tsx` が作成されている
- [ ] `src/features/errors/components/not-found-page-container.stories.tsx` が作成されている
- [ ] `src/features/errors/components/error-page-container.tsx` が作成されている
- [ ] `src/features/errors/components/error-page-container.stories.tsx` が作成されている
- [ ] `src/features/errors/components/maintenance-page-container.tsx` が作成されている
- [ ] `src/features/errors/components/maintenance-page-container.stories.tsx` が作成されている
- [ ] `src/app/not-found.tsx` が作成されている
- [ ] `src/app/(default)/error.tsx` が作成されている
- [ ] `src/app/(default)/maintenance/page.tsx` が作成されている
- [ ] `src/app/(default)/en/maintenance/page.tsx` が作成されている

### バグ修正

- [ ] `src/features/url.ts` の `i18nUrlList.maintenance` が正しく修正されている

### 機能確認

- [ ] 存在しないURLにアクセスすると404ページが表示される
- [ ] `/maintenance` にアクセスするとメンテナンスページ（日本語）が表示される
- [ ] `/en/maintenance` にアクセスするとメンテナンスページ（英語）が表示される
- [ ] 各ページで「Go to HOME」ボタンが正常に動作する
- [ ] Header / Footer が各ページで正常に表示される

### デザイン

- [ ] Figmaデザインと視覚的に一致している
- [ ] タイポグラフィ（色、サイズ、太さ）が仕様通り
- [ ] レイアウト（余白、幅）が仕様通り
- [ ] レスポンシブデザインが正常に機能する

### CI/テスト

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### Storybook

- [ ] 全6つのストーリー（各コンテナ×2言語）が正常に表示される
- [ ] 各ストーリーでHeader/Footerが含まれている（ErrorLayoutによる）

---

## 更新履歴

| 日時 | レビュー回 | 改善内容 |
|------|----------|---------|
| 2025-12-18 | 初版 | 実装計画書の初版作成 |
| 2025-12-18 | 1回目 | ディレクトリ作成ステップ追加、トラブルシューティングセクション追加、言語型の明示的アノテーション追加、実装順序のステップ番号修正 |
| 2025-12-18 | 2回目 | 全てのcatComponentにaria-hidden="true"を追加、Storybookのビューポート設定追加、コードとコメントの一貫性確保 |
| 2025-12-18 | 3回目 | ねこコンポーネントサイズ一覧表追加、reset関数の将来的活用について補足追加、Figmaデザイン照合手順の強化 |
| 2025-12-18 | 外部レビュー反映 | Figma文言との差異修正（404日本語/英語）、ボタン幅をw-full付きに変更、404/500の多言語対応追加（headers()/usePathname()使用）、500ページにnoindex,nofollow追加、品質管理手順に多言語確認項目追加 |
| 2025-12-18 | 外部レビュー2回目反映 | 404の言語判定ロジックを改善（パスヘッダー > referer > 日本語フォールバック）、Next.js 16のheaders()非同期仕様を明記、404/500の言語判定方針記述の整合性確保、404メタデータの日本語固定を仕様として明文化 |
| 2025-12-18 | 技術検証実施 | `generateMetadata`が`not-found.tsx`で動作することを確認。ただし`headers()`でリクエストパスを取得できないため、メタデータは日本語固定を正式採用。技術検証結果を「metadataについて」セクションに追記 |
| 2025-12-18 | 実装反映 | コンテナパターン採用を反映。`ErrorLayout`コンポーネント追加、`*-page-container.tsx`コンテナコンポーネント追加、ページファイルはコンテナを呼び出すのみに変更。Storybookファイルを`src/features/errors/components/`に配置。アーキテクチャ概要図を追加 |

---

**作成日**: 2025-12-18
**最終更新日**: 2025-12-18
**対象Issue**: #334
**担当**: AI実装者
