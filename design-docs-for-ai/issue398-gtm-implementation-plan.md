# Issue #398: GTMの配置とGAイベント送信の実装計画

## 概要

Google Tag Manager (GTM) をNext.jsアプリケーションに配置し、主要操作時にGTM経由でGAイベントを送信する機能を実装する。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/398

## Doneの定義

- [ ] GTM用のComponentが実装されている事
- [ ] 今まで通りGAイベントが送信出来ている事

## 実装対象

### 対象機能

1. **GTMコンポーネントの配置**: ルートレイアウトにGTMコンポーネントを追加
2. **GAイベントの送信**: 以下のタイミングでdataLayerにイベントをpush
   - 「ねこリフレッシュ」ボタン押下時
   - 「新着順」ボタン押下時
   - 画像アップロード成功時
   - トップページの画像クリックでコピー時
   - 作成した画像からコピー時
   - コピーアイコンクリック時
   - 「ランダムコピー」ボタンでコピー成功時

## 前提条件の確認

### 現在のファイル構造

```text
src/
├── app/
│   └── layout.tsx                           # 修正対象: GTMコンポーネントを配置
├── features/
│   ├── main/
│   │   ├── actions/
│   │   │   ├── refresh-images.ts            # 参照: ServerAction (直接修正不可)
│   │   │   └── copy-random-cat.ts           # 参照: ServerAction (直接修正不可)
│   │   └── components/
│   │       ├── home-action-buttons.tsx      # 修正対象: GAイベント送信追加
│   │       └── lgtm-image.tsx               # 修正対象: GAイベント送信追加
│   └── upload/
│       └── components/
│           ├── upload-form.tsx              # 修正対象: GAイベント送信追加
│           └── upload-success.tsx           # 修正対象: GAイベント送信追加
└── utils/
    └── gtm.ts                               # 既存: GAイベント送信関数が定義済み
```

### 既存のGTM関連コード

**`src/utils/gtm.ts`**:

```typescript
export type GoogleTagManagerId = `GTM-${string}`;

export function googleTagManagerId(): GoogleTagManagerId {
  if (isGoogleTagManagerId(process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID)) {
    return process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
  }
  return "GTM-T9VPVTR";
}

type WindowWithDataLayer = Window & {
  dataLayer?: Record<string, unknown>[];
};

function pushDataLayerEvent(event: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const dataLayerWindow = window as WindowWithDataLayer;
  dataLayerWindow.dataLayer?.push({ event });
}

// 各種イベント送信関数
export function sendClickTopFetchRandomCatButton(): void {
  pushDataLayerEvent("ClickTopFetchRandomCatButton");
}

export function sendClickTopFetchNewArrivalCatButton(): void {
  pushDataLayerEvent("ClickTopFetchNewArrivalCatButton");
}

export function sendUploadedCatImage(): void {
  pushDataLayerEvent("UploadedCatImage");
}

export function sendCopyMarkdownFromTopImages(): void {
  pushDataLayerEvent("CopyMarkdownFromTopImages");
}

export function sendCopyMarkdownFromCreatedImage(): void {
  pushDataLayerEvent("CopyMarkdownFromCreatedImage");
}

export function sendCopyMarkdownFromCopyButton(): void {
  pushDataLayerEvent("CopyMarkdownFromCopyButton");
}

export function sendCopyMarkdownFromRandomButton(): void {
  pushDataLayerEvent("CopyMarkdownFromRandomButton");
}
```

**現在の課題**: これらの関数はクライアントサイドでのみ動作するが、全てクライアントコンポーネントから呼び出されるため問題なし。

## 実装方針

### アーキテクチャの選択

**採用方式**: `@next/third-parties/google` の `GoogleTagManager` コンポーネントを使用

**理由**:
1. Next.js公式推奨のベストプラクティス
2. SSR/SSGとの互換性が保証されている
3. `sendGTMEvent` 関数が提供されているが、既存の `src/utils/gtm.ts` の関数群をそのまま活用可能
4. 自動的にhydration後にスクリプトを読み込む最適化が施されている

### GAイベント送信場所の整理

| イベント関数 | 送信タイミング | 呼び出しファイル |
|------------|--------------|----------------|
| `sendClickTopFetchRandomCatButton` | 「ねこリフレッシュ」ボタン押下時 | `home-action-buttons.tsx` |
| `sendClickTopFetchNewArrivalCatButton` | 「新着順」ボタン押下時 | `home-action-buttons.tsx` |
| `sendUploadedCatImage` | 画像アップロード成功時 | `upload-form.tsx` |
| `sendCopyMarkdownFromTopImages` | トップ画像クリックでコピー時 | `lgtm-image.tsx` |
| `sendCopyMarkdownFromCreatedImage` | 作成画像からコピー時 | `upload-success.tsx` |
| `sendCopyMarkdownFromCopyButton` | コピーアイコンクリック時 | `lgtm-image.tsx` |
| `sendCopyMarkdownFromRandomButton` | ランダムコピー成功時 | `home-action-buttons.tsx` |

### 処理フロー

```
[ユーザー]
    │
    ▼ ページ読み込み
[RootLayout]
    │
    └─▶ <GoogleTagManager gtmId="GTM-XXXXXXX" /> でGTMスクリプト読み込み
    │
[ユーザー]
    │
    ▼ ボタンクリック等の操作
[各クライアントコンポーネント]
    │
    └─▶ src/utils/gtm.ts の関数を呼び出し
    │
    └─▶ window.dataLayer.push({ event: "イベント名" })
    │
[GTM]
    │
    └─▶ Google Analytics にイベントを送信
```

## 実装手順

### ステップ1: `@next/third-parties` パッケージのインストール

```bash
npm install @next/third-parties
```

**確認事項**: `package.json` の `dependencies` に `@next/third-parties` が追加されていること。

### ステップ2: ルートレイアウトにGTMコンポーネントを配置

**修正ファイル**: `src/app/layout.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/heroui/providers";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { appBaseUrl, i18nUrlList } from "@/features/url";
import { googleTagManagerId } from "@/utils/gtm";
import { mPlusRounded1c } from "./fonts";

type Props = {
  readonly children: ReactNode;
};

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).home.title,
  description: metaTagList(language).home.description,
  openGraph: {
    title: metaTagList(language).home.title,
    description: metaTagList(language).home.description,
    url: metaTagList(language).home.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).home.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).home.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.home.ja,
    languages: {
      ja: i18nUrlList.home.ja,
      en: i18nUrlList.home.en,
    },
  },
};

export default function RootLayout({ children }: Props): JSX.Element {
  return (
    <html
      className={mPlusRounded1c.variable}
      lang={language}
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId={googleTagManagerId()} />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**変更点**:
1. `GoogleTagManager` を `@next/third-parties/google` からインポート
2. `googleTagManagerId` を `@/utils/gtm` からインポート
3. `<html>` タグの直後に `<GoogleTagManager gtmId={googleTagManagerId()} />` を追加

**実装ポイント**:
- `GoogleTagManager` コンポーネントは `<html>` タグの直下に配置（Next.js公式推奨）
- `googleTagManagerId()` 関数は環境変数または既定値を返すため、サーバーサイドでも実行可能

### ステップ3: HomeActionButtonsにGAイベント送信を追加

**修正ファイル**: `src/features/main/components/home-action-buttons.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { addToast } from "@heroui/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
import { getActionButtonText } from "@/features/main/service-description-text";
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
} from "@/utils/gtm";

/**
 * Server Action のエラーメッセージをユーザー向けにサニタイズする
 * API由来の内部メッセージをそのまま表示しないようにする
 */
function sanitizeErrorMessage(error: string): string {
  // 既知のエラーメッセージはそのまま表示
  if (error === "No images available") {
    return "No images available. Please try again later.";
  }
  // API由来などの予期しないエラーは汎用メッセージに置換
  return "An unexpected error occurred. Please try again later.";
}

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);
  const refreshRandomCatsAction = refreshRandomCats.bind(null, language);
  const showLatestCatsAction = showLatestCats.bind(null, language);

  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomCopy = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await copyRandomCat();

      if (result.success) {
        try {
          await navigator.clipboard.writeText(result.markdown);
          setIsCopied(true);

          // GAイベント送信: ランダムコピー成功時
          sendCopyMarkdownFromRandomButton();

          if (copyTimerRef.current != null) {
            clearTimeout(copyTimerRef.current);
          }
          copyTimerRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        } catch {
          // クリップボードへの書き込みに失敗した場合
          addToast({
            title: "Copy Failed",
            description:
              "Failed to copy to clipboard. Please check browser permissions.",
            color: "danger",
          });
        }
      } else {
        // Server Action がエラーを返した場合（エラーメッセージをサニタイズ）
        addToast({
          title: "Error",
          description: sanitizeErrorMessage(result.error),
          color: "danger",
        });
      }
    } catch {
      // 予期しないエラーの場合（汎用メッセージを表示）
      addToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 「ねこリフレッシュ」ボタンのsubmitハンドラ
  const handleRefreshRandomCatsSubmit = useCallback(() => {
    sendClickTopFetchRandomCatButton();
  }, []);

  // 「新着順」ボタンのsubmitハンドラ
  const handleShowLatestCatsSubmit = useCallback(() => {
    sendClickTopFetchNewArrivalCatButton();
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  return (
    <div
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      <div className="relative w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.randomCopy}
          isLoading={isLoading}
          onPress={handleRandomCopy}
          showRepeatIcon={true}
        />
        {isCopied ? (
          <div
            aria-live="polite"
            className="-translate-x-1/2 absolute bottom-full left-1/2 mb-2 rounded bg-[#7B2F1D] px-4 py-2 font-semibold text-sm text-white"
          >
            Copied!
          </div>
        ) : null}
      </div>
      <form
        action={refreshRandomCatsAction}
        className="w-full md:w-auto"
        onSubmit={handleRefreshRandomCatsSubmit}
      >
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          showRandomIcon={true}
          type="submit"
        />
      </form>
      <form
        action={showLatestCatsAction}
        className="w-full md:w-auto"
        onSubmit={handleShowLatestCatsSubmit}
      >
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.latestCats}
          showCatIcon={true}
          type="submit"
        />
      </form>
    </div>
  );
}
```

**変更点**:
1. `sendClickTopFetchRandomCatButton`, `sendClickTopFetchNewArrivalCatButton`, `sendCopyMarkdownFromRandomButton` をインポート
2. `handleRandomCopy` 内でコピー成功時に `sendCopyMarkdownFromRandomButton()` を呼び出し
3. `handleRefreshRandomCatsSubmit` 関数を追加し、フォームの `onSubmit` で `sendClickTopFetchRandomCatButton()` を呼び出し
4. `handleShowLatestCatsSubmit` 関数を追加し、フォームの `onSubmit` で `sendClickTopFetchNewArrivalCatButton()` を呼び出し

**実装ポイント**:
- フォームの `onSubmit` はフォーム送信前に実行されるため、GAイベントを送信してからServerActionが実行される
- `onSubmit` でイベントを送信した後、フォームのデフォルト動作（ServerAction呼び出し）が継続される

### ステップ4: LgtmImageにGAイベント送信を追加

**修正ファイル**: `src/features/main/components/lgtm-image.tsx`

#### 設計方針

現在の `handleCopyIconPress` は `handleCopy()` を呼び出しているが、異なるGAイベントを送信する必要がある。コード重複を避けるため、コピー処理を共通化し、GAイベント送信関数を引数として渡す設計を採用する。

#### 完全な修正コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtm-image";
import {
  sendCopyMarkdownFromCopyButton,
  sendCopyMarkdownFromTopImages,
} from "@/utils/gtm";

type Props = {
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon Propsを削除する
  readonly hideHeartIcon?: boolean;
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};

export function LgtmImage({ hideHeartIcon, id, imageUrl }: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCopyActive, setIsCopyActive] = useState(false);
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);

  /**
   * マークダウンをクリップボードにコピーし、GAイベントを送信する共通処理
   * @param sendGaEvent GAイベント送信関数
   */
  const copyMarkdownAndSendEvent = useCallback(
    (sendGaEvent: () => void) => {
      const markdown = generateLgtmMarkdown(imageUrl);
      navigator.clipboard.writeText(markdown);
      setIsCopied(true);

      // GAイベント送信
      sendGaEvent();

      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    },
    [imageUrl]
  );

  // 画像クリック時のハンドラ
  const handleCopy = useCallback(() => {
    copyMarkdownAndSendEvent(sendCopyMarkdownFromTopImages);
  }, [copyMarkdownAndSendEvent]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((previous) => !previous);
  }, []);

  // コピーアイコンクリック時のハンドラ
  const handleCopyIconPress = useCallback(() => {
    copyMarkdownAndSendEvent(sendCopyMarkdownFromCopyButton);
  }, [copyMarkdownAndSendEvent]);

  const handleCopyPressStart = useCallback(() => {
    setIsCopyActive(true);
  }, []);

  const handleCopyPressEnd = useCallback(() => {
    setIsCopyActive(false);
  }, []);

  const handleFavoritePressStart = useCallback(() => {
    setIsFavoriteActive(true);
  }, []);

  const handleFavoritePressEnd = useCallback(() => {
    setIsFavoriteActive(false);
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  return (
    <div
      className="group relative w-full max-w-[390px] flex-none overflow-hidden rounded-lg"
      data-lgtm-image-id={id}
    >
      <button
        aria-label="Copy LGTM markdown"
        className="relative block h-[220px] w-full max-w-[390px] flex-none cursor-pointer border-0 bg-background p-0 dark:bg-neutral-900"
        onClick={handleCopy}
        type="button"
      >
        <Image
          alt="LGTM image"
          className="object-contain"
          fill
          objectPosition="center top"
          priority={false}
          sizes="(max-width: 768px) 100vw, 390px"
          src={imageUrl}
        />
      </button>
      <div className="absolute top-2 right-2 flex gap-2 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
        <Button
          aria-label="Copy to clipboard"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onPress={handleCopyIconPress}
          onPressEnd={handleCopyPressEnd}
          onPressStart={handleCopyPressStart}
          radius="sm"
          size="sm"
        >
          <CopyIcon
            color={isCopyActive ? "active" : "default"}
            height={20}
            width={20}
          />
        </Button>
        {/* TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon による条件分岐を削除する */}
        {!hideHeartIcon && (
          <Button
            aria-label="Add to favorites"
            className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
            isIconOnly
            onPress={handleToggleFavorite}
            onPressEnd={handleFavoritePressEnd}
            onPressStart={handleFavoritePressStart}
            radius="sm"
            size="sm"
          >
            <HeartIcon
              color={
                isFavorite === true || isFavoriteActive === true
                  ? "favorite"
                  : "default"
              }
              height={20}
              width={20}
            />
          </Button>
        )}
      </div>
      {isCopied ? (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-1/3 flex items-center justify-center bg-[#7B2F1D] px-4 py-3 font-semibold text-base text-white md:py-4 md:text-lg"
        >
          Copied!
        </div>
      ) : null}
    </div>
  );
}
```

**変更点**:
1. `sendCopyMarkdownFromTopImages`, `sendCopyMarkdownFromCopyButton` をインポート
2. `copyMarkdownAndSendEvent` 共通関数を追加（コピー処理とGAイベント送信を統合）
3. `handleCopy` は `copyMarkdownAndSendEvent(sendCopyMarkdownFromTopImages)` を呼び出し
4. `handleCopyIconPress` は `copyMarkdownAndSendEvent(sendCopyMarkdownFromCopyButton)` を呼び出し

**実装ポイント**:
- コピー処理を `copyMarkdownAndSendEvent` に共通化し、コード重複を排除
- GAイベント送信関数を引数として渡すことで、呼び出し元に応じて異なるイベントを送信
- 元の `handleCopyIconPress` が `handleCopy()` を呼び出していた構造を維持しつつ、GAイベントを分離

### ステップ5: UploadFormにGAイベント送信を追加

**修正ファイル**: `src/features/upload/components/upload-form.tsx`

#### 修正箇所の詳細

**1. インポート文の追加（ファイル先頭、既存のimportに追加）**:

```typescript
// 既存のimportの後に追加
import { sendUploadedCatImage } from "@/utils/gtm";
```

**2. `handleUpload` 関数内の修正（約260行目付近）**:

```typescript
// 修正前
if (result.success) {
  setLgtmImageUrl(result.createdLgtmImageUrl);
  setPreviewImageUrlForSuccess(result.previewImageUrl);
  setFormState("success");
}

// 修正後
if (result.success) {
  // GAイベント送信: 画像アップロード成功時
  sendUploadedCatImage();

  setLgtmImageUrl(result.createdLgtmImageUrl);
  setPreviewImageUrlForSuccess(result.previewImageUrl);
  setFormState("success");
}
```

**変更点**:
1. `sendUploadedCatImage` をインポート（ファイル先頭）
2. `handleUpload` 関数内、`result.success === true` の分岐の先頭で `sendUploadedCatImage()` を呼び出し

**実装ポイント**:
- `setFormState("success")` の前にGAイベントを送信することで、成功時のみイベントが送信される
- 既存のロジックには影響を与えない

### ステップ6: UploadSuccessにGAイベント送信を追加

**修正ファイル**: `src/features/upload/components/upload-success.tsx`

#### 修正箇所の詳細

**1. インポート文の追加（ファイル先頭、既存のimportに追加）**:

```typescript
// 既存のimportの後に追加
import { sendCopyMarkdownFromCreatedImage } from "@/utils/gtm";
```

**2. `handleCopyMarkdown` 関数内の修正（約60行目付近）**:

```typescript
// 修正前
const handleCopyMarkdown = useCallback(async () => {
  try {
    const markdown = generateLgtmMarkdown(lgtmImageUrl);

    await navigator.clipboard.writeText(markdown);
    setIsCopied(true);

    if (copyTimerRef.current != null) {
      clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  } catch {
    addToast({
      title: copyFailedTitle(language),
      description: copyFailedDescription(language),
      color: "danger",
    });
  }
}, [lgtmImageUrl, language]);

// 修正後
const handleCopyMarkdown = useCallback(async () => {
  try {
    const markdown = generateLgtmMarkdown(lgtmImageUrl);

    await navigator.clipboard.writeText(markdown);
    setIsCopied(true);

    // GAイベント送信: 作成画像からコピー時
    sendCopyMarkdownFromCreatedImage();

    if (copyTimerRef.current != null) {
      clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  } catch {
    addToast({
      title: copyFailedTitle(language),
      description: copyFailedDescription(language),
      color: "danger",
    });
  }
}, [lgtmImageUrl, language]);
```

**変更点**:
1. `sendCopyMarkdownFromCreatedImage` をインポート（ファイル先頭）
2. `handleCopyMarkdown` 関数内、`setIsCopied(true)` の直後で `sendCopyMarkdownFromCreatedImage()` を呼び出し

**実装ポイント**:
- コピー成功時のみGAイベントを送信（catchブロックでは送信しない）
- 画像クリック時も `handleImageClick` → `handleCopyMarkdown` の順で呼び出されるため、同じイベントが送信される（意図通り）

### ステップ7: ビルド確認

実装完了後、本番ビルドが正常に完了することを確認します。

```bash
npm run build
```

**期待される結果**: エラーなくビルド完了

**確認項目**:
- TypeScriptの型エラーがないこと
- インポートパスが正しいこと
- `@next/third-parties` パッケージが正しく解決されること

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `package.json` | 修正 | `@next/third-parties` パッケージを追加 |
| `src/app/layout.tsx` | 修正 | `GoogleTagManager` コンポーネントを配置 |
| `src/features/main/components/home-action-buttons.tsx` | 修正 | GAイベント送信を追加 |
| `src/features/main/components/lgtm-image.tsx` | 修正 | GAイベント送信を追加 |
| `src/features/upload/components/upload-form.tsx` | 修正 | GAイベント送信を追加 |
| `src/features/upload/components/upload-success.tsx` | 修正 | GAイベント送信を追加 |

## 依存関係の確認

### 新規追加するパッケージ

| パッケージ | バージョン | 用途 |
|----------|----------|------|
| `@next/third-parties` | 最新 | Next.js公式のGTMコンポーネント |

### 使用する既存モジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `googleTagManagerId` | `@/utils/gtm` | GTM IDを取得 |
| `sendClickTopFetchRandomCatButton` | `@/utils/gtm` | ねこリフレッシュボタンイベント |
| `sendClickTopFetchNewArrivalCatButton` | `@/utils/gtm` | 新着順ボタンイベント |
| `sendUploadedCatImage` | `@/utils/gtm` | アップロード成功イベント |
| `sendCopyMarkdownFromTopImages` | `@/utils/gtm` | トップ画像コピーイベント |
| `sendCopyMarkdownFromCreatedImage` | `@/utils/gtm` | 作成画像コピーイベント |
| `sendCopyMarkdownFromCopyButton` | `@/utils/gtm` | コピーボタンイベント |
| `sendCopyMarkdownFromRandomButton` | `@/utils/gtm` | ランダムコピーイベント |

## リスク分析

### 影響範囲

1. **ルートレイアウトの修正**
   - 全ページに影響するが、GTMスクリプトの読み込みのみ
   - パフォーマンスへの影響: `@next/third-parties` は最適化されており、hydration後に読み込まれる

2. **各コンポーネントへのGAイベント送信追加**
   - 既存の動作に影響しない（イベント送信は非同期で行われ、UIブロックしない）

### デグレードリスク

**低い**:
- GTMスクリプト読み込み失敗時も、アプリケーション自体の動作には影響しない
- GAイベント送信関数は `window.dataLayer` が存在しない場合も安全に終了する（オプショナルチェイニング `?.` を使用）
- 広告ブロッカー等でGTMがブロックされても、ユーザー操作に影響なし

### セキュリティ考慮

- GTM IDは環境変数または既定値から取得され、動的に変更されない
- GAイベントにはユーザー個人情報を含めない

## 品質管理手順

### 1. パッケージインストール

```bash
npm install @next/third-parties
```

**期待される結果**: エラーなくインストール完了

### 2. コードフォーマット

```bash
npm run format
```

**期待される結果**: エラーなし

### 3. Lint チェック

```bash
npm run lint
```

**期待される結果**: エラーなし

### 4. テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 5. ビルド確認

```bash
npm run build
```

**期待される結果**: エラーなくビルド完了

**確認項目**:
- TypeScriptの型エラーがないこと
- `@next/third-parties` パッケージが正しく解決されること
- 本番ビルドが正常に完了すること

### 6. Chrome DevTools MCP を使用したブラウザ確認

#### 6-1. GTMスクリプトの読み込み確認

**確認URL**: `http://localhost:2222`

**確認手順**:

1. Chrome DevTools MCPでページを開く
2. 開発者ツールの「Network」パネルを確認
3. `googletagmanager.com` へのリクエストが発生していることを確認
4. 「Console」パネルで `dataLayer` オブジェクトが存在することを確認

**確認コード（開発者ツールのConsoleで実行）**:
```javascript
console.log(window.dataLayer);
```

**期待される結果**: `dataLayer` 配列が存在し、GTMの初期化イベントが含まれている

#### 6-2. GAイベント送信の確認

**確認手順**:

1. 開発者ツールの「Console」パネルを開く
2. 各操作を実行し、`dataLayer` へのpushを確認

**確認操作と期待されるイベント**:

| 操作 | 期待されるイベント |
|------|-------------------|
| 「ねこリフレッシュ」ボタンクリック | `ClickTopFetchRandomCatButton` |
| 「新着順」ボタンクリック | `ClickTopFetchNewArrivalCatButton` |
| LGTM画像をクリック | `CopyMarkdownFromTopImages` |
| LGTM画像のコピーアイコンをクリック | `CopyMarkdownFromCopyButton` |
| 「ランダムコピー」ボタンでコピー成功 | `CopyMarkdownFromRandomButton` |

**確認コード（操作前後でConsoleで実行）**:
```javascript
// 操作前
const beforeLength = window.dataLayer.length;

// 操作実行後
console.log(window.dataLayer.slice(beforeLength));
```

#### 6-3. アップロード機能のGAイベント確認

**確認URL**: `http://localhost:2222/upload`

**確認手順**:

1. 猫画像をアップロード
2. アップロード成功後、`dataLayer` に `UploadedCatImage` イベントがpushされていることを確認
3. 成功画面で「マークダウンをコピー」ボタンをクリック
4. `dataLayer` に `CopyMarkdownFromCreatedImage` イベントがpushされていることを確認

### 7. Storybook での確認

**確認URL**: `http://localhost:6006/`

**確認項目**:
- 各コンポーネントがエラーなく表示されること
- コンポーネントの見た目に変更がないこと（デザイン崩れがないこと）
- 特に以下のコンポーネントを重点的に確認:
  - `LgtmImage` コンポーネント
  - `UploadForm` コンポーネント（各状態）
  - `UploadSuccess` コンポーネント

**注意**: Storybook環境ではGTMスクリプトが読み込まれないため、GAイベント送信のテストは実際のブラウザで行う

### 8. 英語版ページの確認

**確認URL**: `http://localhost:2222/en/`

**確認手順**:

1. Chrome DevTools MCPで `http://localhost:2222/en/` を開く
2. 以下の操作を実行し、GAイベントが送信されることを確認:
   - 「Copy Random Cat」ボタンをクリック → `CopyMarkdownFromRandomButton`
   - 「Refresh Cats」ボタンをクリック → `ClickTopFetchRandomCatButton`
   - 「Show Latest Cats」ボタンをクリック → `ClickTopFetchNewArrivalCatButton`
   - LGTM画像をクリック → `CopyMarkdownFromTopImages`

**確認URL**: `http://localhost:2222/en/upload`

**確認手順**:

1. 英語版アップロードページを開く
2. 猫画像をアップロードして成功を確認
3. `dataLayer` に `UploadedCatImage` イベントがpushされていることを確認

### 9. 既存テストの確認

既存のテストがすべてパスすることを確認します。今回の変更はGAイベント送信の追加のみであり、既存のテストに影響を与えないことを確認します。

```bash
npm run test
```

**確認項目**:
- `src/features/main/actions/__tests__/` 配下のテストがパスすること
- `src/features/upload/components/__tests__/` 配下のテストがパスすること
- その他全てのテストがパスすること

**テストが失敗した場合の対応**:
- GAイベント送信関数のモックが必要な場合は、テストファイルに以下を追加:

```typescript
vi.mock("@/utils/gtm", () => ({
  sendClickTopFetchRandomCatButton: vi.fn(),
  sendClickTopFetchNewArrivalCatButton: vi.fn(),
  sendUploadedCatImage: vi.fn(),
  sendCopyMarkdownFromTopImages: vi.fn(),
  sendCopyMarkdownFromCreatedImage: vi.fn(),
  sendCopyMarkdownFromCopyButton: vi.fn(),
  sendCopyMarkdownFromRandomButton: vi.fn(),
}));
```

**注意**: 既存のテストは主にUIの表示やユーザーインタラクションをテストしており、GAイベント送信はwindow.dataLayerへのpushのみを行うため、多くの場合モックは不要です。テストが失敗した場合のみ上記モックを追加してください。

## 実装時の注意事項

### 必ず確認すべき事項

1. **`@next/third-parties` のインストール**: パッケージが正しくインストールされていること
2. **GTM ID**: 環境変数 `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` が設定されていない場合、既定値 `GTM-T9VPVTR` が使用される
3. **GAイベント送信タイミング**: 各操作の成功後にイベントを送信（失敗時は送信しない）
4. **フォームの `onSubmit` 使用**: ServerAction呼び出し前にGAイベントを送信するため `onSubmit` を使用

### useCallback依存関係について

GAイベント送信関数（`sendCopyMarkdownFromTopImages` など）は副作用のみで戻り値がなく、外部状態に依存しないため、useCallbackの依存配列に追加する必要はありません。既存のuseCallback依存配列はそのまま維持してください。

### 禁止事項

1. **ServerAction内でのGAイベント送信**: サーバーサイドでは `window` オブジェクトが存在しないため動作しない
2. **`sendGTMEvent` の使用強制**: 既存の `src/utils/gtm.ts` の関数をそのまま活用する（同等の機能）
3. **GAイベントへの個人情報の含有**: ユーザーIDやメールアドレスなどをイベントに含めない

## 補足情報

### `@next/third-parties/google` の `sendGTMEvent` について

Next.js公式は `sendGTMEvent` 関数も提供していますが、既存の `src/utils/gtm.ts` の関数群は同等の機能（`window.dataLayer.push`）を実装しています。

既存の関数を使用する理由：
1. 既にプロジェクトに定義されている
2. イベント名が明確に定義されている
3. 関数名からイベントの意図が分かりやすい

### GTMのデバッグ方法

GTMにはプレビューモードがあり、タグの発火を確認できます：

1. [GTM管理画面](https://tagmanager.google.com/) にアクセス
2. 対象のコンテナを選択
3. 「プレビュー」ボタンをクリック
4. 対象サイトのURLを入力して接続
5. Tag Assistantで各タグの発火状況を確認

## まとめ

この実装計画では、以下の機能を実現します：

1. ✅ GTM用Componentの配置（`@next/third-parties/google` の `GoogleTagManager`）
2. ✅ 「ねこリフレッシュ」ボタン押下時のGAイベント送信
3. ✅ 「新着順」ボタン押下時のGAイベント送信
4. ✅ 画像アップロード成功時のGAイベント送信
5. ✅ トップ画像クリックでコピー時のGAイベント送信
6. ✅ 作成画像からコピー時のGAイベント送信
7. ✅ コピーアイコンクリック時のGAイベント送信
8. ✅ 「ランダムコピー」ボタンでコピー成功時のGAイベント送信

**主な変更ファイル**:
- `package.json`（パッケージ追加）
- `src/app/layout.tsx`（GTMコンポーネント配置）
- `src/features/main/components/home-action-buttons.tsx`（GAイベント送信追加）
- `src/features/main/components/lgtm-image.tsx`（GAイベント送信追加）
- `src/features/upload/components/upload-form.tsx`（GAイベント送信追加）
- `src/features/upload/components/upload-success.tsx`（GAイベント送信追加）
