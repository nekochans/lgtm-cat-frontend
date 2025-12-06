# Issue #329: アップロード中・完了・エラー画面の実装計画

## 概要

既存のアップロードフォームに、アップロード中のプログレス表示、アップロード完了画面、およびアップロードエラー表示機能を追加する。API通信は未実装のため、モックアップロード関数を作成して動作確認を可能にする。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/329

## Figmaデザインリンク

### アップロード中のプログレス

| 画面 | Figma URL |
|------|-----------|
| プログレス表示（日本語） | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=261-6774&m=dev |
| プログレス表示（英語） | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=753-6327&m=dev |

### アップロード完了

| 画面 | Figma URL |
|------|-----------|
| 完了画面（日本語） | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=261-6786&m=dev |
| 完了画面（英語） | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=261-6787&m=dev |
| コピーボタン詳細 | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=707-9022&m=dev |
| Copied!メッセージ | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=707-9023&m=dev |
| ボタン状態詳細 | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=707-9024&m=dev |

### エラー時のメッセージ

| 画面 | Figma URL |
|------|-----------|
| エラー画面全体 | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=271-6839&m=dev |
| エラーメッセージコンポーネント | https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=755-9635&m=dev |

## スコープ

### 対象機能（本件で実装する）

1. **アップロード中のプログレス表示**
   - プレビュー画像の表示
   - 「ただいまアップロード中...」テキスト
   - プログレスバー（HeroUI Progress使用）

2. **アップロード完了画面**
   - プレビュー画像（LGTM画像として表示）
   - 「アップロード成功しました！」メッセージ
   - 説明テキスト
   - 「閉じる」ボタン（初期画面に戻る）
   - 「Markdownソースをコピー」ボタン
   - コピー完了時の「Copied!」メッセージ表示

3. **アップロードエラー表示**
   - エラーメッセージコンポーネント（既存を活用）
   - ファイル名が `error.jpg` の場合にモックエラーを発生

4. **モックアップロード関数**
   - プログレス更新をシミュレート
   - ファイル名による成功/失敗の分岐

5. **多言語対応（i18n）**
   - 新規テキストの日本語/英語対応

### スコープ外（本件では実装しない）

1. R2バケットへの実際のアップロード処理
2. ねこ画像判定APIの呼び出し
3. LGTM画像作成APIの呼び出し

## 前提条件

### 関連既存ファイル

| ファイルパス | 用途 |
|------------|------|
| `src/features/upload/components/upload-form.tsx` | メインフォームコンポーネント（修正対象） |
| `src/features/upload/components/upload-preview.tsx` | プレビューコンポーネント |
| `src/features/upload/components/upload-error-message.tsx` | エラーメッセージコンポーネント（既存） |
| `src/features/upload/types/upload.ts` | 型定義（修正対象） |
| `src/features/upload/upload-i18n.ts` | i18n定義（修正対象） |
| `src/features/main/functions/generate-lgtm-markdown.ts` | Markdown生成関数（使用する） |
| `src/features/main/types/lgtm-image.ts` | LgtmImageUrl型定義（使用する） |
| `src/features/main/components/home-action-buttons.tsx` | コピー処理の参考（パターン参照） |
| `src/app/globals.css` | Tailwindテーマ設定（デザイントークン） |

### 既存のデザイントークン

```css
/* src/app/globals.css より */
--color-text-br: #7c2d12;          /* テキスト（茶色） */
--color-text-wh: #ffffff;          /* テキスト（白） */
--color-background: #fff7ed;       /* 背景色 */
--color-primary: #f97316;          /* プライマリカラー（オレンジ） */
--color-border: #fed7aa;           /* ボーダー色 */
--color-button-primary-base: #f97316;     /* プライマリボタン背景 */
--color-button-primary-hover: #fed7aa;    /* プライマリボタンホバー */
--color-button-tertiary-base: #fff7ed;    /* ターシャリボタン背景 */
--color-button-tertiary-border: #fed7aa;  /* ターシャリボタンボーダー */
--color-button-tertiary-tx: #ea580c;      /* ターシャリボタンテキスト */
--color-button-tertiary-hover: #ffedd5;   /* ターシャリボタンホバー */
```

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|----------|----------|------|
| `@heroui/react` | 2.8.5 | Button, Progress コンポーネント |
| `@heroui/toast` | - | addToast関数 |
| `react` | 19.2.0 | Hooks（useState, useCallback, useRef, useEffect） |
| `next` | 16.0.3 | Next.js App Router, Image コンポーネント |
| `tailwindcss` | 4.1.17 | スタイリング |

### HeroUI Progressコンポーネント仕様

```typescript
import { Progress } from "@heroui/react";

// 基本使用法
<Progress
  aria-label="Loading..."
  value={60}                    // 0-100の数値
  size="md"                     // "sm" | "md" | "lg"
  color="primary"               // "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  showValueLabel={false}        // 数値ラベルの表示
  classNames={{                 // カスタムスタイル
    track: "bg-zinc-200",       // 背景トラック
    indicator: "bg-orange-400", // 進捗インジケーター
  }}
/>
```

## Figmaデザイン仕様

### アップロード中画面（node-id: 261:6774）

| 要素 | 仕様 |
|------|------|
| コンテナ | 白背景、角丸16px、オレンジの点線ボーダー（5px） |
| プレビュー画像 | 最大幅373px×高さ371px |
| テキスト | 「ただいまアップロード中...」font-bold、20px、#7c2d12 |
| プログレスバー | 幅400px、高さ28px、トラック#e4e4e7、インジケーター#fb923c |

### アップロード完了画面（node-id: 261:6786）

| 要素 | 仕様 |
|------|------|
| プレビュー画像 | 最大幅373px×高さ371px |
| 成功メッセージ | 「アップロード成功しました！」font-bold、30px、#f97316 |
| 説明テキスト | font-normal、20px、#7c2d12、複数行 |
| ボタンエリア | gap 20px、中央揃え |
| 閉じるボタン | ターシャリスタイル、幅220px、高さ48px |
| Markdownコピーボタン | プライマリスタイル、幅220px、高さ48px |

### エラーメッセージ（node-id: 755:9635）

| 要素 | 仕様 |
|------|------|
| 背景 | #ffe4e6（rose-100） |
| アイコン | エラーアイコン、24px、rose-600 |
| テキスト | font-normal、20px、#e11d48（rose-600） |

**既存コンポーネント確認結果**: `src/features/upload/components/upload-error-message.tsx`

| Figma仕様 | 既存実装 | 判定 |
|----------|---------|------|
| 背景 #ffe4e6 | `bg-rose-100` (Tailwind rose-100 = #ffe4e6) | ✅ 一致 |
| テキスト #e11d48 | `text-rose-600` (Tailwind rose-600 = #e11d48) | ✅ 一致 |
| アイコン 24px | `size-6` (= 1.5rem = 24px) | ✅ 一致 |

→ **既存コンポーネントはそのまま使用可能**

## ファイル構成

### 新規作成ファイル

```text
src/
├── features/
│   └── upload/
│       ├── components/
│       │   ├── upload-progress.tsx          # アップロード中表示
│       │   └── upload-success.tsx           # アップロード成功表示
│       └── functions/
│           └── mock-upload.ts               # モックアップロード関数
```

### 修正ファイル

```text
src/features/upload/types/upload.ts           # UploadResult型の追加
src/features/upload/upload-i18n.ts            # 新規テキストの追加
src/features/upload/components/upload-form.tsx # 状態管理の拡張
src/features/upload/components/upload-form.stories.tsx # Storybookストーリー追加
src/features/upload/components/__tests__/upload-form.test.tsx # テスト追加
```

## 実装詳細

### ステップ1: 型定義の追加

**修正ファイル**: `src/features/upload/types/upload.ts`

既存の `UploadFormState` 型はそのまま使用します（`uploading` と `success` は既に定義済み）。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

// 既存の定義はそのまま維持

/**
 * モックアップロードの結果
 */
export type MockUploadResult =
  | { readonly success: true; readonly imageUrl: string }
  | { readonly success: false; readonly errorMessage: string };

/**
 * アップロード進捗のコールバック型
 */
export type UploadProgressCallback = (progress: number) => void;
```

### ステップ2: i18n定義の追加

**修正ファイル**: `src/features/upload/upload-i18n.ts`

以下の関数を追加します：

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

// 既存のimportとexportはそのまま維持

export function uploadingText(language: Language): string {
  switch (language) {
    case "ja":
      return "ただいまアップロード中...";
    case "en":
      return "Uploading...";
    default:
      return assertNever(language);
  }
}

export function uploadSuccessTitle(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード成功しました！";
    case "en":
      return "Upload successful!";
    default:
      return assertNever(language);
  }
}

export function uploadSuccessDescription(language: Language): readonly string[] {
  switch (language) {
    case "ja":
      return [
        "LGTM画像を作成しているので少々お待ち下さい。",
        "「Markdownソースをコピー」ボタンか画像をクリック",
        "するとMarkdownソースがコピーされます。",
      ] as const;
    case "en":
      return [
        "Please wait while we create your LGTM image.",
        "Click the \"Copy Markdown Source\" button or the image",
        "to copy the Markdown source.",
      ] as const;
    default:
      return assertNever(language);
  }
}

export function closeButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "閉じる";
    case "en":
      return "Close";
    default:
      return assertNever(language);
  }
}

export function copyMarkdownButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "Markdownソースをコピー";
    case "en":
      return "Copy Markdown Source";
    default:
      return assertNever(language);
  }
}

export function copiedText(): string {
  return "Copied!";
}

export function copyFailedTitle(language: Language): string {
  switch (language) {
    case "ja":
      return "コピー失敗";
    case "en":
      return "Copy Failed";
    default:
      return assertNever(language);
  }
}

export function copyFailedDescription(language: Language): string {
  switch (language) {
    case "ja":
      return "クリップボードへのコピーに失敗しました。ブラウザの権限を確認してください。";
    case "en":
      return "Failed to copy to clipboard. Please check browser permissions.";
    default:
      return assertNever(language);
  }
}

/**
 * アップロード成功画面のリンク用テキスト
 */
export type ViewLatestImageLinkText = {
  readonly prefix: string;
  readonly linkText: string;
  readonly suffix: string;
};

/**
 * アップロード成功画面の「最新画像を見る」リンク用テキストを返す
 * リンク先: 日本語 /?view=latest、英語 /en?view=latest
 */
export function viewLatestImageLinkText(
  language: Language
): ViewLatestImageLinkText {
  switch (language) {
    case "ja":
      return {
        prefix: "",
        linkText: "こちら",
        suffix: "からアップロードした画像を確認できます。",
      };
    case "en":
      return {
        prefix: "You can view your uploaded image ",
        linkText: "here",
        suffix: ".",
      };
    default:
      return assertNever(language);
  }
}
```

### ステップ3: モックアップロード関数の作成

**新規ファイル**: `src/features/upload/functions/mock-upload.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type {
  MockUploadResult,
  UploadProgressCallback,
} from "../types/upload";

/**
 * エラーを発生させるファイル名のパターン
 */
const errorFileName = "error.jpg";

/**
 * モックアップロードの総時間（ミリ秒）
 */
const mockUploadDuration = 3000;

/**
 * プログレス更新間隔（ミリ秒）
 */
const progressUpdateInterval = 100;

/**
 * モックアップロード処理
 *
 * @param file - アップロードするファイル
 * @param previewUrl - プレビュー画像のURL（成功時にそのまま使用）
 * @param onProgress - 進捗コールバック（0-100の数値を受け取る）
 * @returns アップロード結果
 *
 * @description
 * - ファイル名が "error.jpg" の場合、プログレスが100%になった後にエラーを返す
 * - それ以外の場合、成功としてプレビューURLをそのまま返す
 * - プログレスは0から100まで段階的に更新される
 */
export async function mockUpload(
  file: File,
  previewUrl: string,
  onProgress: UploadProgressCallback
): Promise<MockUploadResult> {
  const totalSteps = mockUploadDuration / progressUpdateInterval;
  const progressPerStep = 100 / totalSteps;

  // プログレスを段階的に更新
  for (let step = 0; step <= totalSteps; step++) {
    const progress = Math.min(Math.round(progressPerStep * step), 100);
    onProgress(progress);

    if (step < totalSteps) {
      await new Promise((resolve) => setTimeout(resolve, progressUpdateInterval));
    }
  }

  // ファイル名が "error.jpg" の場合はエラーを返す
  if (file.name.toLowerCase() === errorFileName) {
    return {
      success: false,
      errorMessage: "upload_error",
    };
  }

  // 成功: プレビューURLをそのまま返す
  return {
    success: true,
    imageUrl: previewUrl,
  };
}
```

### ステップ4: アップロード中コンポーネントの作成

**新規ファイル**: `src/features/upload/components/upload-progress.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Progress } from "@heroui/react";
import Image from "next/image";
import type { JSX } from "react";
import type { Language } from "@/features/language";
import { uploadingText } from "../upload-i18n";

type Props = {
  readonly language: Language;
  readonly previewUrl: string;
  readonly fileName: string;
  readonly progress: number;
};

/**
 * アップロード中の進捗表示コンポーネント
 * Figmaデザイン（node-id: 261:6774）に基づく
 */
export function UploadProgress({
  language,
  previewUrl,
  fileName,
  progress,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像 */}
      <div className="relative h-[371px] w-[373px]">
        <Image
          alt={`Uploading ${fileName}`}
          className="object-contain"
          fill
          sizes="373px"
          src={previewUrl}
        />
      </div>

      {/* アップロード中テキスト */}
      <p className="font-bold text-text-br text-xl leading-7">
        {uploadingText(language)}
      </p>

      {/* プログレスバー */}
      <Progress
        aria-label={uploadingText(language)}
        classNames={{
          base: "w-[400px]",
          track: "h-7 bg-zinc-200",
          indicator: "bg-orange-400",
        }}
        showValueLabel={false}
        value={progress}
      />
    </div>
  );
}
```

### ステップ5: アップロード成功コンポーネントの作成

**新規ファイル**: `src/features/upload/components/upload-success.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type { Language } from "@/features/language";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import { createIncludeLanguageAppPath } from "@/features/url";
import {
  closeButtonText,
  copiedText,
  copyFailedDescription,
  copyFailedTitle,
  copyMarkdownButtonText,
  uploadSuccessDescription,
  uploadSuccessTitle,
  viewLatestImageLinkText,
} from "../upload-i18n";

type Props = {
  readonly language: Language;
  readonly imageUrl: string;
  readonly onClose: () => void;
};

/**
 * アップロード成功画面コンポーネント
 * Figmaデザイン（node-id: 261:6786）に基づく
 */
export function UploadSuccess({
  language,
  imageUrl,
  onClose,
}: Props): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const descriptionLines = uploadSuccessDescription(language);
  const linkText = viewLatestImageLinkText(language);
  const viewLatestHref = `${createIncludeLanguageAppPath("home", language)}?view=latest`;

  // クリーンアップ
  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    []
  );

  const handleCopyMarkdown = useCallback(async () => {
    try {
      // LgtmImageUrl型に変換してMarkdownを生成
      const lgtmImageUrl = createLgtmImageUrl(imageUrl);
      const markdown = generateLgtmMarkdown(lgtmImageUrl);

      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);

      // 既存のタイマーをクリア
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }

      // 1.5秒後にコピー状態をリセット
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
  }, [imageUrl, language]);

  const handleImageClick = useCallback(() => {
    handleCopyMarkdown();
  }, [handleCopyMarkdown]);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像（クリックでコピー） */}
      <button
        className="relative h-[371px] w-[373px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={handleImageClick}
        type="button"
      >
        <Image
          alt="Uploaded LGTM image"
          className="object-contain"
          fill
          sizes="373px"
          src={imageUrl}
        />
      </button>

      {/* 成功メッセージ */}
      <p className="font-bold text-3xl text-primary leading-9">
        {uploadSuccessTitle(language)}
      </p>

      {/* 説明テキスト - Figma仕様: 20px/line、上下マージンなし */}
      <div className="text-center font-normal text-text-br text-xl leading-7">
        {descriptionLines.map((line, index) =>
          line === "" ? (
            <br key={`line-${index}-empty`} />
          ) : (
            <p className="m-0" key={`line-${index}-${line.slice(0, 10)}`}>{line}</p>
          )
        )}
      </div>

      {/* 最新画像へのリンク */}
      <p className="text-center font-normal text-text-br text-xl leading-7">
        {linkText.prefix}
        <Link
          className="text-primary underline hover:no-underline"
          href={viewLatestHref}
        >
          {linkText.linkText}
        </Link>
        {linkText.suffix}
      </p>

      {/* ボタンエリア */}
      <div className="relative flex items-center justify-center gap-5">
        {/* 閉じるボタン - variantを指定せずカスタムクラスのみで制御（HeroUIデフォルトスタイルとの重複回避） */}
        <Button
          className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
          onPress={onClose}
        >
          {closeButtonText(language)}
        </Button>
        <div className="relative">
          <Button
            className="h-12 w-[220px] rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover"
            onPress={handleCopyMarkdown}
          >
            {copyMarkdownButtonText(language)}
          </Button>
          {/* Copied! メッセージ */}
          {isCopied ? (
            <div
              aria-live="polite"
              className="-translate-x-1/2 absolute top-full left-1/2 mt-2 rounded bg-[#7B2F1D] px-4 py-2 font-semibold text-sm text-white"
            >
              {copiedText()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

### ステップ6: メインフォームの修正

**修正ファイル**: `src/features/upload/components/upload-form.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import { mockUpload } from "../functions/mock-upload";
import type { UploadFormState, UploadValidationResult } from "../types/upload";
import {
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  unexpectedErrorMessage,
} from "../upload-i18n";
import { validateUploadFile } from "../upload-validator";
import { UploadDropArea } from "./upload-drop-area";
import { UploadErrorMessage } from "./upload-error-message";
import { UploadNotes } from "./upload-notes";
import { UploadPreview } from "./upload-preview";
import { UploadProgress } from "./upload-progress";
import { UploadSuccess } from "./upload-success";

type Props = {
  readonly language: Language;
};

/**
 * アップロードフォームメインコンポーネント
 * Figmaデザイン（node-id: 214:1070）に基づく
 */
export function UploadForm({ language }: Props): JSX.Element {
  const [formState, setFormState] = useState<UploadFormState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<readonly string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // プレビューURLのクリーンアップ
  useEffect(
    () => () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      // バリデーション
      const validationResult: UploadValidationResult = validateUploadFile(file);

      if (!validationResult.isValid) {
        let messages: readonly string[];

        switch (validationResult.errorType) {
          case "invalid_extension":
            messages = createNotAllowedImageExtensionErrorMessage(
              validationResult.fileType ?? "unknown",
              language
            );
            break;
          case "file_too_large":
            messages = createImageSizeTooLargeErrorMessage(language);
            break;
          default:
            messages = unexpectedErrorMessage(language);
        }

        setErrorMessages(messages);
        setFormState("error");
        return;
      }

      // プレビューURL作成
      const objectUrl = URL.createObjectURL(file);

      // 古いプレビューURLをクリーンアップ
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setErrorMessages([]);
      setFormState("preview");
    },
    [language, previewUrl]
  );

  const handleCancel = useCallback(() => {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setErrorMessages([]);
    setUploadProgress(0);
    setFormState("idle");
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (selectedFile == null || previewUrl == null) {
      return;
    }

    setFormState("uploading");
    setUploadProgress(0);

    const result = await mockUpload(selectedFile, previewUrl, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      setUploadedImageUrl(result.imageUrl);
      setFormState("success");
    } else {
      setErrorMessages(unexpectedErrorMessage(language));
      setFormState("error");
    }
  }, [selectedFile, previewUrl, language]);

  const handleErrorDismiss = useCallback(() => {
    setErrorMessages([]);
    setFormState("idle");
  }, []);

  const handleSuccessClose = useCallback(() => {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setErrorMessages([]);
    setUploadProgress(0);
    setFormState("idle");
  }, [previewUrl]);

  return (
    <div className="relative overflow-hidden rounded-2xl border-[6px] border-white border-solid bg-white">
      {/* メインコンテンツエリア */}
      <div
        className={`flex min-h-[600px] flex-col items-center justify-center gap-[10px] rounded-2xl border-[5px] border-dashed p-7 ${
          formState === "error" ? "border-rose-400" : "border-primary"
        }`}
      >
        {/* エラー表示 */}
        {formState === "error" && errorMessages.length > 0 && (
          <div className="mb-4 w-full max-w-[500px]">
            <UploadErrorMessage messages={errorMessages} />
            <button
              className="mt-2 text-sm text-text-br underline hover:no-underline"
              onClick={handleErrorDismiss}
              type="button"
            >
              {language === "ja" ? "閉じる" : "Close"}
            </button>
          </div>
        )}

        {/* ドロップエリア（初期状態・エラー状態） */}
        {(formState === "idle" || formState === "error") && (
          <>
            <UploadDropArea
              isDisabled={false}
              language={language}
              onFileSelect={handleFileSelect}
            />
            <UploadNotes language={language} />
          </>
        )}

        {/* プレビュー表示 */}
        {formState === "preview" &&
          previewUrl != null &&
          selectedFile != null && (
            <UploadPreview
              fileName={selectedFile.name}
              isUploading={false}
              language={language}
              onCancel={handleCancel}
              onUpload={handleUpload}
              previewUrl={previewUrl}
            />
          )}

        {/* アップロード中 */}
        {formState === "uploading" &&
          previewUrl != null &&
          selectedFile != null && (
            <UploadProgress
              fileName={selectedFile.name}
              language={language}
              previewUrl={previewUrl}
              progress={uploadProgress}
            />
          )}

        {/* アップロード成功 */}
        {formState === "success" && uploadedImageUrl != null && (
          <UploadSuccess
            imageUrl={uploadedImageUrl}
            language={language}
            onClose={handleSuccessClose}
          />
        )}
      </div>

      {/* ねこイラスト（右下） - 成功画面以外で表示 */}
      {formState !== "success" && (
        <div className="pointer-events-none absolute right-4 bottom-4">
          <LgtmCatIcon
            aria-hidden
            className="rotate-12"
            height={80}
            width={100}
          />
        </div>
      )}
    </div>
  );
}
```

### ステップ7: Storybookストーリーの追加

**修正ファイル**: `src/features/upload/components/upload-form.stories.tsx`

既存のストーリーファイルはそのまま維持します。新しい状態（uploading, success）はインタラクティブに確認するため、追加のストーリーは不要です。

必要であれば、以下の個別コンポーネントのストーリーを追加できます：

**新規ファイル（オプション）**: `src/features/upload/components/upload-progress.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { UploadProgress } from "./upload-progress";

const meta = {
  component: UploadProgress,
  title: "features/upload/UploadProgress",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (StoryComponent) => (
      <div className="w-[700px] rounded-2xl border-[5px] border-dashed border-primary bg-white p-7">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof UploadProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 50,
  },
};

export const English: Story = {
  args: {
    language: "en",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 50,
  },
};

export const Progress0: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 0,
  },
};

export const Progress100: Story = {
  args: {
    language: "ja",
    previewUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=Cat+Image",
    fileName: "cat.jpg",
    progress: 100,
  },
};
```

**新規ファイル（オプション）**: `src/features/upload/components/upload-success.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { UploadSuccess } from "./upload-success";

const meta = {
  component: UploadSuccess,
  title: "features/upload/UploadSuccess",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (StoryComponent) => (
      <div className="w-[700px] rounded-2xl border-[5px] border-dashed border-primary bg-white p-7">
        <StoryComponent />
      </div>
    ),
  ],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof UploadSuccess>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    imageUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM+Cat",
  },
};

export const English: Story = {
  args: {
    language: "en",
    imageUrl: "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM+Cat",
  },
};
```

### ステップ8: テストの追加

#### 8-1. UploadFormの基本テスト

**修正ファイル**: `src/features/upload/components/__tests__/upload-form.test.tsx`

既存のテストに以下を追加：

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadForm } from "../upload-form";

describe("UploadForm", () => {
  afterEach(() => {
    cleanup();
  });

  describe("日本語表示", () => {
    it("ドロップエリアのテキストが日本語で表示される", () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText("ここに画像をドロップ")).toBeInTheDocument();
      expect(screen.getByText("またはファイルの選択")).toBeInTheDocument();
    });

    it("注意事項が日本語で表示される", () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText("注意事項")).toBeInTheDocument();
      expect(
        screen.getByText(
          "拡張子が png, jpg, jpeg の画像のみアップロード出来ます。"
        )
      ).toBeInTheDocument();
    });
  });

  describe("英語表示", () => {
    it("ドロップエリアのテキストが英語で表示される", () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText("Drop image here")).toBeInTheDocument();
      expect(screen.getByText("Select an image file")).toBeInTheDocument();
    });

    it("注意事項が英語で表示される", () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText("Precautions")).toBeInTheDocument();
      expect(
        screen.getByText("png, jpg, jpeg images are available.")
      ).toBeInTheDocument();
    });
  });
});
```

#### 8-2. UploadProgressコンポーネントのテスト

**新規ファイル**: `src/features/upload/components/__tests__/upload-progress.test.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadProgress } from "../upload-progress";

describe("UploadProgress", () => {
  afterEach(() => {
    cleanup();
  });

  describe("日本語表示", () => {
    it("アップロード中テキストが日本語で表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByText("ただいまアップロード中...")).toBeInTheDocument();
    });

    it("プログレスバーのaria-labelが正しく設定される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        "ただいまアップロード中..."
      );
    });
  });

  describe("英語表示", () => {
    it("アップロード中テキストが英語で表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="en"
          previewUrl="blob:http://localhost/test"
          progress={50}
        />
      );

      expect(screen.getByText("Uploading...")).toBeInTheDocument();
    });
  });

  describe("プログレス値", () => {
    it("プログレス0%で正しく表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={0}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });

    it("プログレス100%で正しく表示される", () => {
      render(
        <UploadProgress
          fileName="cat.jpg"
          language="ja"
          previewUrl="blob:http://localhost/test"
          progress={100}
        />
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    });
  });
});
```

#### 8-3. UploadSuccessコンポーネントのテスト

**新規ファイル**: `src/features/upload/components/__tests__/upload-success.test.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UploadSuccess } from "../upload-success";

// clipboard APIのモック
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("UploadSuccess", () => {
  afterEach(() => {
    cleanup();
    mockWriteText.mockClear();
  });

  describe("日本語表示", () => {
    it("成功メッセージが日本語で表示される", () => {
      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText("アップロード成功しました！")).toBeInTheDocument();
    });

    it("ボタンテキストが日本語で表示される", () => {
      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Markdownソースをコピー" })
      ).toBeInTheDocument();
    });
  });

  describe("英語表示", () => {
    it("成功メッセージが英語で表示される", () => {
      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="en"
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText("Upload successful!")).toBeInTheDocument();
    });

    it("ボタンテキストが英語で表示される", () => {
      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="en"
          onClose={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Copy Markdown Source" })
      ).toBeInTheDocument();
    });
  });

  describe("閉じるボタン動作", () => {
    it("閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={onClose}
        />
      );

      await user.click(screen.getByRole("button", { name: "閉じる" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("コピー機能", () => {
    it("コピーボタンをクリックするとクリップボードにコピーされる", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={vi.fn()}
        />
      );

      await user.click(
        screen.getByRole("button", { name: "Markdownソースをコピー" })
      );

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining("https://example.com/image.jpg")
      );
    });

    it("コピー成功時にCopied!メッセージが表示される", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={vi.fn()}
        />
      );

      await user.click(
        screen.getByRole("button", { name: "Markdownソースをコピー" })
      );

      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });

    it("画像クリックでもコピーされる", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(
        <UploadSuccess
          imageUrl="https://example.com/image.jpg"
          language="ja"
          onClose={vi.fn()}
        />
      );

      // 画像をラップしているbuttonをクリック
      const imageButton = screen.getByRole("button", {
        name: "Uploaded LGTM image",
      });
      await user.click(imageButton);

      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
  });
});
```

**新規ファイル**: `src/features/upload/functions/__tests__/mock-upload.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it, vi } from "vitest";
import { mockUpload } from "../mock-upload";

describe("mockUpload", () => {
  it("正常なファイルの場合は成功を返す", async () => {
    const file = new File(["test"], "cat.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.imageUrl).toBe(previewUrl);
    }
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("error.jpgの場合はエラーを返す", async () => {
    const file = new File(["test"], "error.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessage).toBe("upload_error");
    }
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("ERROR.JPG（大文字）の場合もエラーを返す", async () => {
    const file = new File(["test"], "ERROR.JPG", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const onProgress = vi.fn();

    const result = await mockUpload(file, previewUrl, onProgress);

    expect(result.success).toBe(false);
  });

  it("プログレスが0から100まで更新される", async () => {
    const file = new File(["test"], "cat.jpg", { type: "image/jpeg" });
    const previewUrl = "blob:http://localhost/test";
    const progressValues: number[] = [];
    const onProgress = vi.fn((progress: number) => {
      progressValues.push(progress);
    });

    await mockUpload(file, previewUrl, onProgress);

    expect(progressValues[0]).toBe(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
    // 中間値も含まれていることを確認
    expect(progressValues.length).toBeGreaterThan(2);
  });
});
```

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/upload/types/upload.ts` | 修正 | MockUploadResult型、UploadProgressCallback型を追加 |
| `src/features/upload/upload-i18n.ts` | 修正 | アップロード中・成功・コピー関連のテキストを追加 |
| `src/features/upload/functions/mock-upload.ts` | 新規作成 | モックアップロード関数 |
| `src/features/upload/components/upload-progress.tsx` | 新規作成 | アップロード中表示コンポーネント |
| `src/features/upload/components/upload-success.tsx` | 新規作成 | アップロード成功コンポーネント |
| `src/features/upload/components/upload-form.tsx` | 修正 | 状態管理の拡張、新コンポーネントの統合 |
| `src/features/upload/components/upload-progress.stories.tsx` | 新規作成（オプション） | Storybook |
| `src/features/upload/components/upload-success.stories.tsx` | 新規作成（オプション） | Storybook |
| `src/features/upload/functions/__tests__/mock-upload.test.ts` | 新規作成 | モックアップロードのテスト |
| `src/features/upload/components/__tests__/upload-progress.test.tsx` | 新規作成 | プログレスコンポーネントのテスト |
| `src/features/upload/components/__tests__/upload-success.test.tsx` | 新規作成 | 成功画面コンポーネントのテスト |

## 依存関係

### 新規追加するimport

**`upload-form.tsx`**:
```typescript
import { mockUpload } from "../functions/mock-upload";
import { UploadProgress } from "./upload-progress";
import { UploadSuccess } from "./upload-success";
```

**`upload-progress.tsx`**:
```typescript
import { Progress } from "@heroui/react";
```

**`upload-success.tsx`**:
```typescript
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
```

### 使用する既存モジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `Language` | `@/features/language` | 言語型定義 |
| `assertNever` | `@/utils/assert-never` | 網羅性チェック |
| `generateLgtmMarkdown` | `@/features/main/functions/generate-lgtm-markdown` | Markdown生成 |
| `createLgtmImageUrl` | `@/features/main/types/lgtm-image` | LgtmImageUrl型の作成 |
| `Button` | `@heroui/react` | ボタンコンポーネント |
| `Progress` | `@heroui/react` | プログレスバー |
| `addToast` | `@heroui/toast` | トースト通知 |

## 品質管理手順

### 1. コードフォーマット

```bash
npm run format
```

**期待される結果**: エラーなし

### 2. Lint チェック

```bash
npm run lint
```

**期待される結果**: エラーなし

### 3. 型チェック

```bash
npm run build
```

**期待される結果**: エラーなし

### 4. テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 5. Playwright MCP を使用したブラウザ確認

#### 5-1. 日本語版の確認

**確認URL**: `http://localhost:2222/upload`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222/upload` に移動
2. 初期状態の確認:
   - アップロードアイコン、ドロップエリア、注意事項が表示されている
3. 「またはファイルの選択」ボタンをクリック
4. **正常系の確認（cat.jpg等）**:
   - 画像ファイル（png/jpg/jpeg）を選択
   - プレビュー画面が表示される
   - 「アップロード」ボタンをクリック
   - プログレスバーが0%から100%まで進む
   - 「ただいまアップロード中...」テキストが表示される
   - アップロード完了後、成功画面が表示される
   - 「アップロード成功しました！」が表示される
   - 「Markdownソースをコピー」をクリック
   - 「Copied!」メッセージが表示される
   - 「閉じる」をクリックして初期画面に戻る
5. **エラー系の確認（error.jpg）**:
   - ファイル名が `error.jpg` の画像を選択
   - プレビュー → アップロードボタンクリック
   - プログレスバーが100%まで進む
   - エラーメッセージ「予期せぬエラーが発生しました。」が表示される

#### 5-2. 英語版の確認

**確認URL**: `http://localhost:2222/en/upload`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222/en/upload` に移動
2. 上記と同様の手順で英語テキストを確認:
   - 「Uploading...」
   - 「Upload successful!」
   - 「Copy Markdown Source」
   - 「Close」

### 6. Storybook での確認

**確認URL**: `http://localhost:6006/`

**確認手順**:

1. Storybookで「features/upload/UploadForm」を開く
2. 日本語版（Japanese）の表示を確認
3. 英語版（English）の表示を確認
4. 「features/upload/UploadProgress」でプログレス表示を確認（作成した場合）
5. 「features/upload/UploadSuccess」で成功画面を確認（作成した場合）

### 7. Chrome DevTools MCP でのデバッグ

デザイン崩れやスタイルの問題が発生した場合：

1. Chrome DevTools MCP で対象ページを開く
2. Elements パネルでコンポーネントのスタイルを確認
3. Figmaデザインと比較して差異を修正

## 実装時の注意事項

### 必ず確認すべき事項

1. **全てのファイル先頭に必須コメント**: `// 絶対厳守：編集前に必ずAI実装ルールを読む`
2. **型定義に `readonly` を使用**: オブジェクトプロパティは全て `readonly` を付ける
3. **`onPress` を使用**: HeroUIのButtonでは `onClick` ではなく `onPress` を使用
4. **URL.createObjectURL のクリーンアップ**: useEffectでURL.revokeObjectURLを呼ぶ
5. **タイマーのクリーンアップ**: useEffectでsetTimeoutのクリーンアップを行う
6. **エラーハンドリング**: 全てのエラーケースで適切なメッセージを表示

### 禁止事項

1. **`data` 等の曖昧な変数名使用禁止**: 具体的な名前を使用（例: `uploadProgress`, `uploadedImageUrl`）
2. **`let` の使用禁止**: 可能な限り `const` を使用
3. **存在しないファイルのimport禁止**: 全ての依存関係を事前に確認
4. **テストをスキップしてマージ禁止**: 全てのテストがパスするまで完了としない

### モックアップロード処理の仕様

| 条件 | 結果 |
|------|------|
| ファイル名が `error.jpg`（大文字小文字無視） | プログレス100%後にエラー |
| それ以外のファイル | プログレス100%後に成功 |

### 「Copied!」メッセージの仕様

- 表示位置: 「Markdownソースをコピー」ボタンの直下中央
- 表示時間: 1.5秒
- スタイル: 背景#7B2F1D、白文字、角丸、font-semibold

## まとめ

この実装計画では、以下の機能を実現します：

1. ✅ アップロード中のプログレス表示
2. ✅ アップロード成功画面の表示
3. ✅ Markdownソースのコピー機能
4. ✅ 画像クリックでのコピー機能
5. ✅ 「Copied!」メッセージの表示
6. ✅ error.jpgファイルでのモックエラー
7. ✅ 多言語対応（日本語/英語）
8. ✅ テストカバレッジの確保

**新規作成ファイル数**: 6〜8ファイル（Storybookオプション含む）
**修正ファイル数**: 3ファイル（`upload.ts`, `upload-i18n.ts`, `upload-form.tsx`）
