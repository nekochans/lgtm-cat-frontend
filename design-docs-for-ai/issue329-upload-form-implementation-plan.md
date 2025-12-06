# Issue #329: ねこ画像アップロード用コンポーネントの実装計画

## 概要

ねこ画像をアップロードするためのフォームコンポーネントを作成する。Figmaデザインに基づき、ドラッグ＆ドロップまたはファイル選択での画像アップロード機能と、アップロード前のプレビュー表示を実装する。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/329

## スコープ

### 対象機能（本件で実装する）

1. **Figmaデザイン通りのアップロードフォームの作成**
   - ドラッグ＆ドロップエリア
   - ファイル選択ボタン
   - 注意事項の表示
   - アップロードアイコン（クラウド型）
   - ねこアイコン（にゃんすかぱん）

2. **画像プレビュー機能**
   - 選択された画像のプレビュー表示
   - キャンセルボタン
   - アップロードボタン（UI のみ、実際のアップロード処理は対象外）

3. **クライアントサイドバリデーション**
   - 許可された拡張子（png, jpg, jpeg）のチェック
   - ファイルサイズ上限（5MB）のチェック
   - エラーメッセージの表示

4. **多言語対応（i18n）**
   - 日本語/英語のテキスト切り替え

### スコープ外（本件では実装しない）

以下は別Issueで実装予定のため、本件では実装しない：

1. R2バケットへの画像アップロードと署名付きURL作成
2. ねこ画像判定APIの呼び出し
3. LGTM画像作成APIの呼び出し
4. アップロード中のプログレス表示（UIのみモックで対応）
5. アップロード完了画面（UIのみモックで対応）

## 前提条件

### 関連既存ファイル

| ファイルパス | 用途 |
|------------|------|
| `src/app/(default)/upload/page.tsx` | アップロードページ（日本語） |
| `src/app/(default)/en/upload/page.tsx` | アップロードページ（英語） |
| `src/features/main/components/upload-page-container.tsx` | アップロードページコンテナ（修正対象） |
| `src/components/header-i18n.ts` | i18nの参考ファイル |
| `src/features/language.ts` | Language型定義 |
| `src/utils/assert-never.ts` | assertNever関数 |
| `src/app/globals.css` | Tailwindテーマ設定（デザイントークン） |

### 既存のデザイントークン

```css
/* src/app/globals.css より */
--color-text-br: #7c2d12;          /* テキスト（茶色） */
--color-text-wh: #ffffff;          /* テキスト（白） */
--color-background: #fff7ed;       /* 背景色 */
--color-primary: #f97316;          /* プライマリカラー（オレンジ） */
--color-border: #fed7aa;           /* ボーダー色 */
--color-button-tertiary-base: #fff7ed;    /* セカンダリボタン背景 */
--color-button-tertiary-border: #fed7aa;  /* セカンダリボタンボーダー */
--color-button-tertiary-tx: #ea580c;      /* セカンダリボタンテキスト */
```

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|----------|----------|------|
| `@heroui/react` | 2.8.5 | Button, Progress コンポーネント |
| `react` | 19.2.0 | Hooks（useState, useCallback, useRef） |
| `next` | 16.0.3 | Next.js App Router |
| `tailwindcss` | 4.1.17 | スタイリング |

### Provider設定の確認

`addToast` 関数を使用するために、以下のProvider設定が必要です。**本プロジェクトでは既に設定済みです。**

#### アプリケーション

`src/components/heroui/providers.tsx` にて `ToastProvider` が設定されています：

```typescript
import { ToastProvider } from '@heroui/toast';

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <HeroUIProvider>
        <ToastProvider placement="bottom-right" toastOffset={60}>
          {children}
        </ToastProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
```

#### Storybook

`.storybook/preview.tsx` にて `Providers` デコレーターが設定されています：

```typescript
const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
        <Story />
      </Providers>
    ),
  ],
  // ...
};
```

**確認事項**: 実装開始前に上記ファイルが正しく設定されていることを確認してください。設定がない場合、`addToast` 呼び出し時にランタイムエラーが発生します。

## Figmaデザイン仕様

### アップロードフォーム全体

- **コンテナ**: 白背景、角丸16px、オレンジの点線ボーダー（6px）
- **内部要素**: 中央揃え、縦方向に配置

### アップロードエリア（初期状態）

| 要素 | 仕様 |
|------|------|
| アップロードアイコン | クラウド型、オレンジ色（#fb923c）、幅69px×高さ49px |
| 「ここに画像をドロップ」 | font-bold、20px、#7c2d12 |
| ファイル選択ボタン | 背景#fff7ed、ボーダー#fed7aa（2px）、テキスト#ea580c、高さ48px、幅220px、角丸8px |

### 注意事項セクション

| 要素 | 仕様 |
|------|------|
| 「注意事項」タイトル | font-bold、20px、#7c2d12 |
| リスト | font-normal、16px、#7c2d12、箇条書き |
| プライバシーポリシーリンク | font-normal、16px、シアン色（#06b6d4）でリンク表示 |

### プレビュー表示

| 要素 | 仕様 |
|------|------|
| プレビュー画像 | 最大幅373px×高さ371px |
| 確認テキスト | font-bold、20px、#7c2d12 |
| キャンセルボタン | セカンダリスタイル（背景#fff7ed、ボーダー#fed7aa、テキスト#ea580c） |
| アップロードボタン | プライマリスタイル（背景#f97316、テキスト#ffffff） |

### エラーメッセージ

| 要素 | 仕様 |
|------|------|
| 背景 | #ffe4e6（rose-100） |
| アイコン | エラーアイコン（rose色） |
| テキスト | #e11d48（rose-600）、20px |

### ねこアイコン（にゃんすかぱん）

- 位置: フォーム右下
- スタイル: 線画風、ベージュ系（#fed7aa）

## ファイル構成

### 新規作成ファイル

```text
src/
├── features/
│   └── upload/
│       ├── components/
│       │   ├── upload-form.tsx           # メインフォームコンポーネント
│       │   ├── upload-drop-area.tsx      # ドロップエリア
│       │   ├── upload-preview.tsx        # プレビュー表示
│       │   ├── upload-notes.tsx          # 注意事項セクション
│       │   ├── upload-error-message.tsx  # エラーメッセージ
│       │   ├── upload-form.stories.tsx   # Storybook
│       │   └── __tests__/
│       │       └── upload-form.test.tsx  # テスト
│       ├── upload-i18n.ts                # i18n定義
│       ├── upload-validator.ts           # バリデーションロジック
│       └── types/
│           └── upload.ts                 # 型定義
├── components/
│   ├── lgtm-cat-icon.tsx                 # ねこイラストアイコン（既存・サイズオプション追加）
│   └── icons/
│       └── upload-cloud-icon.tsx         # アップロードアイコン
```

### 修正ファイル

```text
src/features/main/components/upload-page-container.tsx  # UploadFormを配置
```

## 実装詳細

### ステップ1: 型定義の作成

**新規ファイル**: `src/features/upload/types/upload.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * 許可される画像の拡張子
 */
export const allowedImageExtensions = ['png', 'jpg', 'jpeg'] as const;

export type AllowedImageExtension = (typeof allowedImageExtensions)[number];

/**
 * 許可される画像のMIMEタイプ
 */
export const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
] as const;

export type AllowedMimeType = (typeof allowedMimeTypes)[number];

/**
 * 画像サイズの上限（バイト単位）
 * 5MB = 5 * 1024 * 1024 = 5242880 bytes
 */
export const maxImageSizeBytes = 5 * 1024 * 1024;

/**
 * 画像サイズの上限（表示用テキスト）
 */
export const acceptableImageSizeThresholdText = '5MB';

/**
 * バリデーションエラーの種類
 */
export type UploadValidationErrorType =
  | 'invalid_extension'
  | 'file_too_large'
  | 'unknown_error';

/**
 * バリデーション結果
 */
export type UploadValidationResult =
  | { readonly isValid: true }
  | {
      readonly isValid: false;
      readonly errorType: UploadValidationErrorType;
      readonly fileType?: string;
    };

/**
 * アップロードフォームの状態
 */
export type UploadFormState =
  | 'idle'           // 初期状態（ドロップエリア表示）
  | 'preview'        // プレビュー表示中
  | 'uploading'      // アップロード中（将来実装用）
  | 'success'        // 成功（将来実装用）
  | 'error';         // エラー表示中
```

### ステップ2: i18n定義の作成

**新規ファイル**: `src/features/upload/upload-i18n.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from '@/features/language';
import { assertNever } from '@/utils/assert-never';
import { acceptableImageSizeThresholdText } from './types/upload';

export function imageDropAreaText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'ここに画像をドロップ';
    case 'en':
      return 'Drop image here';
    default:
      return assertNever(language);
  }
}

export function uploadInputButtonText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'またはファイルの選択';
    case 'en':
      return 'Select an image file';
    default:
      return assertNever(language);
  }
}

export function cautionText(language: Language): string {
  switch (language) {
    case 'ja':
      return '注意事項';
    case 'en':
      return 'Precautions';
    default:
      return assertNever(language);
  }
}

export function noteList(language: Language): readonly string[] {
  switch (language) {
    case 'ja':
      return [
        '拡張子が png, jpg, jpeg の画像のみアップロード出来ます。',
        '猫が写っていない画像はアップロード出来ません。',
        '人の顔がはっきり写っている画像はアップロード出来ません。',
        '猫のイラスト等は正確に判定出来ない事があります。',
      ] as const;
    case 'en':
      return [
        'png, jpg, jpeg images are available.',
        'Images without cats cannot be uploaded.',
        "Images that clearly show a person's face cannot be uploaded.",
        'Illustrations of cats may not be accurately determined.',
      ] as const;
    default:
      return assertNever(language);
  }
}

export function privacyPolicyAgreementText(language: Language): {
  readonly prefix: string;
  readonly linkText: string;
  readonly suffix: string;
} {
  switch (language) {
    case 'ja':
      return {
        prefix: 'アップロードするボタンを押下することで',
        linkText: 'プライバシーポリシー',
        suffix: 'に同意したと見なします',
      };
    case 'en':
      return {
        prefix: 'By clicking the upload button, you agree to the ',
        linkText: 'Privacy Policy',
        suffix: '',
      };
    default:
      return assertNever(language);
  }
}

export function previewConfirmationText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'この画像をアップロードします。よろしいですか？';
    case 'en':
      return 'Upload this image. Are you sure?';
    default:
      return assertNever(language);
  }
}

export function cancelButtonText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'キャンセル';
    case 'en':
      return 'Cancel';
    default:
      return assertNever(language);
  }
}

export function uploadButtonText(language: Language): string {
  switch (language) {
    case 'ja':
      return 'アップロード';
    case 'en':
      return 'Upload';
    default:
      return assertNever(language);
  }
}

export function createNotAllowedImageExtensionErrorMessage(
  fileType: string,
  language: Language,
): readonly string[] {
  switch (language) {
    case 'ja':
      return [
        `${fileType} の画像は許可されていません。`,
        'png, jpg, jpeg の画像のみアップロード出来ます。',
      ] as const;
    case 'en':
      return [
        `${fileType} is not allowed.`,
        'Only png, jpg, jpeg images can be uploaded.',
      ] as const;
    default:
      return assertNever(language);
  }
}

export function createImageSizeTooLargeErrorMessage(
  language: Language,
): readonly string[] {
  switch (language) {
    case 'ja':
      return [
        '画像サイズが大きすぎます。',
        `お手数ですが${acceptableImageSizeThresholdText}以下の画像を利用して下さい。`,
      ] as const;
    case 'en':
      return [
        'Image size is too large.',
        `Please use images under ${acceptableImageSizeThresholdText}.`,
      ] as const;
    default:
      return assertNever(language);
  }
}

export function unexpectedErrorMessage(language: Language): readonly string[] {
  switch (language) {
    case 'ja':
      return [
        '予期せぬエラーが発生しました。',
        'お手数ですが、しばらく時間が経ってからお試し下さい。',
      ] as const;
    case 'en':
      return [
        'An unexpected error occurred during upload.',
        'Sorry, please try again after some time has passed.',
      ] as const;
    default:
      return assertNever(language);
  }
}
```

### ステップ3: バリデーションロジックの作成

**新規ファイル**: `src/features/upload/upload-validator.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import {
  type UploadValidationResult,
  allowedImageExtensions,
  allowedMimeTypes,
  maxImageSizeBytes,
} from './types/upload';

/**
 * ファイルのMIMEタイプが許可されているかチェック
 */
function isAllowedMimeType(mimeType: string): boolean {
  return allowedMimeTypes.includes(mimeType as (typeof allowedMimeTypes)[number]);
}

/**
 * ファイルの拡張子を取得
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * ファイルの拡張子が許可されているかチェック
 */
function isAllowedExtension(extension: string): boolean {
  return allowedImageExtensions.includes(
    extension as (typeof allowedImageExtensions)[number],
  );
}

/**
 * アップロードファイルのバリデーション
 * MIMEタイプと拡張子の両方を検証する
 */
export function validateUploadFile(file: File): UploadValidationResult {
  const extension = getFileExtension(file.name);

  // MIMEタイプのチェック
  if (!isAllowedMimeType(file.type)) {
    return {
      isValid: false,
      errorType: 'invalid_extension',
      fileType: extension || file.type,
    };
  }

  // 拡張子のチェック（MIMEタイプが正しくても拡張子が異なる場合を検出）
  if (!isAllowedExtension(extension)) {
    return {
      isValid: false,
      errorType: 'invalid_extension',
      fileType: extension || file.type,
    };
  }

  // ファイルサイズのチェック
  if (file.size > maxImageSizeBytes) {
    return {
      isValid: false,
      errorType: 'file_too_large',
    };
  }

  return { isValid: true };
}
```

### ステップ4: アイコンコンポーネントの作成

**新規ファイル**: `src/components/icons/upload-cloud-icon.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from 'react';

type Props = {
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
};

/**
 * アップロード用クラウドアイコン
 * Figmaデザイン（node-id: 214:1108）に基づく
 */
export function UploadCloudIcon({
  width = 69,
  height = 49,
  className,
}: Props): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 69 49"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Upload cloud icon</title>
      {/* クラウド部分 */}
      <path
        d="M55.5 20.5C55.5 12.5 49 6 41 6C34.5 6 29 10 27 15.5C26.5 15.5 26 15.5 25.5 15.5C18.5 15.5 13 21 13 28C13 35 18.5 40.5 25.5 40.5H53.5C59.5 40.5 64.5 35.5 64.5 29.5C64.5 24 60.5 19.5 55.5 20.5Z"
        fill="#FB923C"
      />
      {/* 上矢印 */}
      <path
        d="M34.5 34V22M34.5 22L28.5 28M34.5 22L40.5 28"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}
```

**注意**: 上記のSVGパスは参考値です。実装時にFigmaから正確なパスデータを取得してください。

**既存ファイル修正**: `src/components/lgtm-cat-icon.tsx`

ねこイラストには既存の `LgtmCatIcon` を使用します。サイズをオプションパラメータとして指定できるように修正が必要です：

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from 'react';

type Props = {
  readonly width?: number;  // 追加
  readonly height?: number; // 追加
  readonly className?: string;
  readonly "aria-hidden"?: boolean;
};

export function LgtmCatIcon({
  width = 36,   // デフォルト値を維持
  height = 27,  // デフォルト値を維持
  className,
  "aria-hidden": ariaHidden,
}: Props): JSX.Element {
  return (
    <svg
      aria-hidden={ariaHidden}
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 36 27"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 既存のSVGパスをそのまま使用 */}
    </svg>
  );
}
```

### ステップ5: エラーメッセージコンポーネント

**新規ファイル**: `src/features/upload/components/upload-error-message.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { JSX } from 'react';

type Props = {
  readonly messages: readonly string[];
};

/**
 * エラーメッセージ表示コンポーネント
 * Figmaデザイン（node-id: 755:9635）に基づく
 */
export function UploadErrorMessage({ messages }: Props): JSX.Element {
  return (
    <div
      className="flex items-center gap-4 rounded bg-rose-100 p-3"
      role="alert"
    >
      {/* エラーアイコン */}
      <div className="shrink-0">
        <svg
          aria-hidden="true"
          className="size-6 text-rose-600"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Error icon</title>
          <path
            clipRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            fillRule="evenodd"
          />
        </svg>
      </div>
      {/* メッセージ */}
      <div className="flex flex-col font-normal text-rose-600 text-xl leading-7">
        {messages.map((message, index) => (
          <p key={`error-${index}-${message.slice(0, 10)}`}>{message}</p>
        ))}
      </div>
    </div>
  );
}
```

### ステップ6: 注意事項コンポーネント

**新規ファイル**: `src/features/upload/components/upload-notes.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import Link from 'next/link';
import type { JSX } from 'react';
import type { Language } from '@/features/language';
import { createPrivacyPolicyLinksFromLanguages } from '@/features/privacy-policy';
import {
  cautionText,
  noteList,
  privacyPolicyAgreementText,
} from '../upload-i18n';

type Props = {
  readonly language: Language;
};

/**
 * 注意事項セクション
 * Figmaデザイン（node-id: 271:6850）に基づく
 */
export function UploadNotes({ language }: Props): JSX.Element {
  const notes = noteList(language);
  const privacyPolicy = createPrivacyPolicyLinksFromLanguages(language);
  const agreementText = privacyPolicyAgreementText(language);

  return (
    <div className="flex flex-col items-center justify-center gap-5 text-text-br">
      <p className="font-bold text-xl leading-7">{cautionText(language)}</p>
      <ul className="list-disc pl-6 font-normal text-base leading-6">
        {notes.map((note, index) => (
          <li key={`note-${index}-${note.slice(0, 10)}`}>{note}</li>
        ))}
      </ul>
      <p className="max-w-[476px] text-center font-normal text-base leading-6">
        {agreementText.prefix}
        <Link
          className="text-cyan-500 hover:underline"
          href={privacyPolicy.link}
        >
          {agreementText.linkText}
        </Link>
        {agreementText.suffix}
      </p>
    </div>
  );
}
```

### ステップ7: ドロップエリアコンポーネント

**新規ファイル**: `src/features/upload/components/upload-drop-area.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

'use client';

import { Button } from '@heroui/react';
import {
  type ChangeEvent,
  type DragEvent,
  type JSX,
  useCallback,
  useRef,
  useState,
} from 'react';
import { UploadCloudIcon } from '@/components/icons/upload-cloud-icon';
import type { Language } from '@/features/language';
import { imageDropAreaText, uploadInputButtonText } from '../upload-i18n';

type Props = {
  readonly language: Language;
  readonly onFileSelect: (file: File) => void;
  readonly isDisabled?: boolean;
};

/**
 * ドラッグ＆ドロップエリア
 * Figmaデザイン（node-id: 214:1093）に基づく
 */
export function UploadDropArea({
  language,
  onFileSelect,
  isDisabled = false,
}: Props): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isDisabled) {
        setIsDragOver(true);
      }
    },
    [isDisabled],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (isDisabled) return;

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile != null) {
        onFileSelect(droppedFile);
      }
    },
    [isDisabled, onFileSelect],
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile != null) {
        onFileSelect(selectedFile);
      }
      // ファイル選択をリセット（同じファイルを再選択できるように）
      if (fileInputRef.current != null) {
        fileInputRef.current.value = '';
      }
    },
    [onFileSelect],
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${
        isDragOver ? 'opacity-70' : ''
      }`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <UploadCloudIcon />
      <p className="font-bold text-text-br text-xl leading-7">
        {imageDropAreaText(language)}
      </p>
      <Button
        className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
        isDisabled={isDisabled}
        onPress={handleButtonClick}
        variant="bordered"
      >
        {uploadInputButtonText(language)}
      </Button>
      <input
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
```

### ステップ8: プレビューコンポーネント

**新規ファイル**: `src/features/upload/components/upload-preview.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

'use client';

import { Button } from '@heroui/react';
import Image from 'next/image';
import type { JSX } from 'react';
import type { Language } from '@/features/language';
import {
  cancelButtonText,
  previewConfirmationText,
  uploadButtonText,
} from '../upload-i18n';

type Props = {
  readonly language: Language;
  readonly previewUrl: string;
  readonly fileName: string;
  readonly onCancel: () => void;
  readonly onUpload: () => void;
  readonly isUploading?: boolean;
};

/**
 * 画像プレビュー表示
 * Figmaデザイン（node-id: 260:6292）に基づく
 */
export function UploadPreview({
  language,
  previewUrl,
  fileName,
  onCancel,
  onUpload,
  isUploading = false,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* プレビュー画像 */}
      <div className="relative h-[371px] w-[373px]">
        <Image
          alt={`Preview of ${fileName}`}
          className="object-contain"
          fill
          sizes="373px"
          src={previewUrl}
        />
      </div>

      {/* 確認テキスト */}
      <p className="font-bold text-text-br text-xl leading-7">
        {previewConfirmationText(language)}
      </p>

      {/* ボタン */}
      <div className="flex items-center justify-center gap-5">
        <Button
          className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
          isDisabled={isUploading}
          onPress={onCancel}
          variant="bordered"
        >
          {cancelButtonText(language)}
        </Button>
        <Button
          className="h-12 w-[220px] rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover"
          isDisabled={isUploading}
          isLoading={isUploading}
          onPress={onUpload}
        >
          {uploadButtonText(language)}
        </Button>
      </div>
    </div>
  );
}
```

### ステップ9: メインフォームコンポーネント

**新規ファイル**: `src/features/upload/components/upload-form.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

'use client';

import { addToast } from '@heroui/toast';
import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { LgtmCatIcon } from '@/components/lgtm-cat-icon';
import type { Language } from '@/features/language';
import type { UploadFormState, UploadValidationResult } from '../types/upload';
import {
  createImageSizeTooLargeErrorMessage,
  createNotAllowedImageExtensionErrorMessage,
  unexpectedErrorMessage,
} from '../upload-i18n';
import { validateUploadFile } from '../upload-validator';
import { UploadDropArea } from './upload-drop-area';
import { UploadErrorMessage } from './upload-error-message';
import { UploadNotes } from './upload-notes';
import { UploadPreview } from './upload-preview';

type Props = {
  readonly language: Language;
};

/**
 * アップロードフォームメインコンポーネント
 * Figmaデザイン（node-id: 214:1070）に基づく
 */
export function UploadForm({ language }: Props): JSX.Element {
  const [formState, setFormState] = useState<UploadFormState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<readonly string[]>([]);

  // プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    (file: File) => {
      // バリデーション
      const validationResult: UploadValidationResult = validateUploadFile(file);

      if (!validationResult.isValid) {
        let messages: readonly string[];

        switch (validationResult.errorType) {
          case 'invalid_extension':
            messages = createNotAllowedImageExtensionErrorMessage(
              validationResult.fileType ?? 'unknown',
              language,
            );
            break;
          case 'file_too_large':
            messages = createImageSizeTooLargeErrorMessage(language);
            break;
          default:
            messages = unexpectedErrorMessage(language);
        }

        setErrorMessages(messages);
        setFormState('error');
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
      setFormState('preview');
    },
    [language, previewUrl],
  );

  const handleCancel = useCallback(() => {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessages([]);
    setFormState('idle');
  }, [previewUrl]);

  const handleUpload = useCallback(() => {
    // TODO: 将来の実装でR2バケットへのアップロード処理を追加
    // 現時点ではアップロードボタンを押してもトーストで通知するのみ
    addToast({
      title: language === 'ja' ? 'お知らせ' : 'Notice',
      description:
        language === 'ja'
          ? 'アップロード機能は現在準備中です。'
          : 'Upload feature is currently under preparation.',
      color: 'warning',
    });
  }, [language]);

  const handleErrorDismiss = useCallback(() => {
    setErrorMessages([]);
    setFormState('idle');
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border-[6px] border-solid border-white bg-white">
      {/* メインコンテンツエリア */}
      <div
        className={`flex min-h-[600px] flex-col items-center justify-center gap-[10px] rounded-2xl border-[5px] border-dashed p-7 ${
          formState === 'error' ? 'border-rose-400' : 'border-primary'
        }`}
      >
        {/* エラー表示 */}
        {formState === 'error' && errorMessages.length > 0 && (
          <div className="mb-4 w-full max-w-[500px]">
            <UploadErrorMessage messages={errorMessages} />
            <button
              className="mt-2 text-text-br text-sm underline hover:no-underline"
              onClick={handleErrorDismiss}
              type="button"
            >
              {language === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        )}

        {/* ドロップエリア or プレビュー */}
        {formState === 'idle' || formState === 'error' ? (
          <>
            <UploadDropArea
              isDisabled={false}
              language={language}
              onFileSelect={handleFileSelect}
            />
            <UploadNotes language={language} />
          </>
        ) : null}

        {formState === 'preview' && previewUrl != null && selectedFile != null && (
          <UploadPreview
            fileName={selectedFile.name}
            isUploading={false}
            language={language}
            onCancel={handleCancel}
            onUpload={handleUpload}
            previewUrl={previewUrl}
          />
        )}
      </div>

      {/* ねこイラスト（右下） */}
      <div className="pointer-events-none absolute right-4 bottom-4">
        <LgtmCatIcon aria-hidden height={80} width={100} />
      </div>
    </div>
  );
}
```

### ステップ10: `UploadPageContainer` の修正

**修正ファイル**: `src/features/main/components/upload-page-container.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import type { Language } from '@/features/language';
import { UploadForm } from '@/features/upload/components/upload-form';
import type { IncludeLanguageAppPath } from '@/features/url';

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

export function UploadPageContainer({ language, currentUrlPath }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
      <main className="flex w-full flex-1 flex-col items-center bg-background px-4 py-8">
        <div className="w-full max-w-[700px]">
          <UploadForm language={language} />
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
```

### ステップ11: Storybookの作成

**新規ファイル**: `src/features/upload/components/upload-form.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from '@storybook/react';
import { UploadForm } from './upload-form';

const meta = {
  component: UploadForm,
  title: 'features/upload/UploadForm',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[700px] bg-background p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UploadForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: 'ja',
  },
};

export const English: Story = {
  args: {
    language: 'en',
  },
};
```

### ステップ12: テストの作成

**新規ファイル**: `src/features/upload/components/__tests__/upload-form.test.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UploadForm } from '../upload-form';

describe('UploadForm', () => {
  describe('日本語表示', () => {
    it('ドロップエリアのテキストが日本語で表示される', () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText('ここに画像をドロップ')).toBeInTheDocument();
      expect(screen.getByText('またはファイルの選択')).toBeInTheDocument();
    });

    it('注意事項が日本語で表示される', () => {
      render(<UploadForm language="ja" />);

      expect(screen.getByText('注意事項')).toBeInTheDocument();
      expect(
        screen.getByText(
          '拡張子が png, jpg, jpeg の画像のみアップロード出来ます。',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('英語表示', () => {
    it('ドロップエリアのテキストが英語で表示される', () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText('Drop image here')).toBeInTheDocument();
      expect(screen.getByText('Select an image file')).toBeInTheDocument();
    });

    it('注意事項が英語で表示される', () => {
      render(<UploadForm language="en" />);

      expect(screen.getByText('Precautions')).toBeInTheDocument();
      expect(
        screen.getByText('png, jpg, jpeg images are available.'),
      ).toBeInTheDocument();
    });
  });
});
```

**新規ファイル**: `src/features/upload/__tests__/upload-validator.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from 'vitest';
import { validateUploadFile } from '../upload-validator';

describe('validateUploadFile', () => {
  describe('許可されたファイル', () => {
    it('PNGファイルは許可される', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });

    it('JPEGファイルは許可される', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe('許可されないファイル', () => {
    it('GIFファイルは許可されない', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe('invalid_extension');
        expect(result.fileType).toBe('gif');
      }
    });

    it('WebPファイルは許可されない', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe('invalid_extension');
      }
    });

    it('MIMEタイプが許可されていても拡張子が不正なら許可されない', () => {
      // 例: MIMEはimage/pngだが拡張子が.gif
      const file = new File(['test'], 'test.gif', { type: 'image/png' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe('invalid_extension');
        expect(result.fileType).toBe('gif');
      }
    });
  });

  describe('ファイルサイズ', () => {
    it('5MB以下のファイルは許可される', () => {
      const content = new Uint8Array(5 * 1024 * 1024); // 5MB
      const file = new File([content], 'test.png', { type: 'image/png' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(true);
    });

    it('5MBを超えるファイルは許可されない', () => {
      const content = new Uint8Array(5 * 1024 * 1024 + 1); // 5MB + 1byte
      const file = new File([content], 'test.png', { type: 'image/png' });
      const result = validateUploadFile(file);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorType).toBe('file_too_large');
      }
    });
  });
});
```

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/upload/types/upload.ts` | 新規作成 | 型定義 |
| `src/features/upload/upload-i18n.ts` | 新規作成 | i18n定義 |
| `src/features/upload/upload-validator.ts` | 新規作成 | バリデーションロジック |
| `src/components/icons/upload-cloud-icon.tsx` | 新規作成 | アップロードアイコン |
| `src/components/lgtm-cat-icon.tsx` | 修正 | サイズオプション追加（width, height） |
| `src/features/upload/components/upload-error-message.tsx` | 新規作成 | エラーメッセージ |
| `src/features/upload/components/upload-notes.tsx` | 新規作成 | 注意事項セクション |
| `src/features/upload/components/upload-drop-area.tsx` | 新規作成 | ドロップエリア |
| `src/features/upload/components/upload-preview.tsx` | 新規作成 | プレビュー表示 |
| `src/features/upload/components/upload-form.tsx` | 新規作成 | メインフォーム |
| `src/features/upload/components/upload-form.stories.tsx` | 新規作成 | Storybook |
| `src/features/upload/components/__tests__/upload-form.test.tsx` | 新規作成 | コンポーネントテスト |
| `src/features/upload/__tests__/upload-validator.test.ts` | 新規作成 | バリデーションテスト |
| `src/features/main/components/upload-page-container.tsx` | 修正 | UploadFormを配置 |

## 依存関係

### 新規追加するimport

**`upload-form.tsx`**:
```typescript
import { addToast } from '@heroui/toast';
```

**`upload-drop-area.tsx`, `upload-preview.tsx`**:
```typescript
import { Button } from '@heroui/react';
```

**`upload-notes.tsx`**:
```typescript
import { createPrivacyPolicyLinksFromLanguages } from '@/features/privacy-policy';
```

### 使用する既存モジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `Language` | `@/features/language` | 言語型定義 |
| `assertNever` | `@/utils/assert-never` | 網羅性チェック |
| `createPrivacyPolicyLinksFromLanguages` | `@/features/privacy-policy` | プライバシーポリシーリンク |
| `IncludeLanguageAppPath` | `@/features/url` | URLパス型 |
| `Header` | `@/components/header` | ヘッダー |
| `Footer` | `@/components/footer` | フッター |

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

### 3. テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 4. Playwright MCP を使用したブラウザ確認

#### 4-1. 日本語版の確認

**確認URL**: `http://localhost:2222/upload`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222/upload` に移動
2. スナップショットを取得して以下を確認:
   - アップロードアイコン（クラウド型）が表示されている
   - 「ここに画像をドロップ」テキストが表示されている
   - 「またはファイルの選択」ボタンが表示されている
   - 注意事項が日本語で表示されている
   - ねこイラストが右下に表示されている
3. 「またはファイルの選択」ボタンをクリック
4. 画像ファイル（png/jpg/jpeg）を選択
5. プレビュー画面が表示されることを確認:
   - 選択した画像がプレビュー表示される
   - 「この画像をアップロードします。よろしいですか？」が表示される
   - 「キャンセル」「アップロード」ボタンが表示される
6. キャンセルボタンをクリックして初期状態に戻ることを確認
7. 再度画像を選択し、アップロードボタンをクリック
8. トーストで「アップロード機能は現在準備中です。」が表示されることを確認

**エラーケースの確認**:

1. GIFファイルを選択してエラーメッセージが表示されることを確認
2. 5MBを超えるファイルを選択してエラーメッセージが表示されることを確認

#### 4-2. 英語版の確認

**確認URL**: `http://localhost:2222/en/upload`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222/en/upload` に移動
2. スナップショットを取得して以下を確認:
   - 「Drop image here」テキストが表示されている
   - 「Select an image file」ボタンが表示されている
   - 注意事項が英語で表示されている

### 5. Storybook での確認

**確認URL**: `http://localhost:6006/`

**確認手順**:

1. Storybookで「features/upload/UploadForm」を開く
2. 日本語版（Japanese）の表示を確認
3. 英語版（English）の表示を確認
4. コンポーネントの各状態をControls panelで確認

### 6. Chrome DevTools MCP でのデバッグ

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
5. **エラーハンドリング**: 全てのエラーケースで適切なメッセージを表示

### 禁止事項

1. **`data` 等の曖昧な変数名使用禁止**: 具体的な名前を使用（例: `selectedFile`, `previewUrl`）
2. **`let` の使用禁止**: 可能な限り `const` を使用
3. **存在しないファイルのimport禁止**: 全ての依存関係を事前に確認
4. **テストをスキップしてマージ禁止**: 全てのテストがパスするまで完了としない

### SVGアイコンの実装について

アップロードアイコン（`upload-cloud-icon.tsx`）のSVGパスは、実装時にFigmaから正確なデータを取得して配置してください。

**注意**: ねこイラストは既存の `LgtmCatIcon`（`src/components/lgtm-cat-icon.tsx`）を使用します。新規作成は不要です。

**Figma node-id一覧**:
- アップロードアイコン: `214:1108`

#### SVGアイコン取得手順

1. **Figma Dev Mode MCPを使用してSVGデータを取得**:
   ```
   mcp__figma-dev-mode-mcp-server__get_design_context
   nodeId: "214:1108"  // アップロードアイコン
   ```

2. **取得したSVGをTSXコンポーネント形式に変換**:
   - `fill` 属性を適切に設定（カラーコード or `currentColor`）
   - `viewBox` をFigmaのデザインサイズに合わせる
   - `aria-hidden="true"` と `<title>` を追加してアクセシビリティ対応
   - JSXの命名規則に従う（`stroke-width` → `strokeWidth` など）

3. **プレースホルダーコードを実際のSVGパスで置換**:
   - `upload-cloud-icon.tsx` のコメント `{/* クラウド部分 */}` 以下のpath要素を実際のデータに置換

#### SVGアイコン完了条件

| 項目 | 条件 |
|------|------|
| アップロードアイコン | Figmaデザイン（214:1108）と視覚的に一致すること |
| ねこイラスト | 既存の `LgtmCatIcon` を使用（`width={100}`, `height={80}` で表示） |
| カラー | アップロードアイコンは `#FB923C`（オレンジ） |
| サイズ | アップロードアイコン: 69×49px |
| レンダリング | Storybook/ブラウザで正しく表示されること |
| アクセシビリティ | `aria-hidden="true"` と `<title>` が設定されていること |

#### 確認方法

1. Storybookでコンポーネントを表示
2. Figmaのデザインと並べて視覚的に比較
3. Playwright MCPまたはChrome DevTools MCPでスクリーンショットを取得して確認

## 今後の拡張予定

本件完了後、以下の機能を別Issueで実装予定：

1. **アップロード機能**: R2バケットへのアップロード、署名付きURL作成
2. **ねこ判定API連携**: アップロード画像のねこ判定
3. **LGTM画像作成API連携**: LGTM画像の生成
4. **プログレス表示**: アップロード中の進捗表示
5. **完了画面**: アップロード成功時の画面表示

## まとめ

この実装計画では、以下の機能を実現します：

1. ✅ Figmaデザイン通りのアップロードフォーム作成
2. ✅ ドラッグ＆ドロップによる画像選択
3. ✅ ファイル選択ボタンによる画像選択
4. ✅ 画像プレビュー表示
5. ✅ クライアントサイドバリデーション（拡張子、ファイルサイズ）
6. ✅ エラーメッセージ表示
7. ✅ 多言語対応（日本語/英語）
8. ✅ テストカバレッジの確保

**新規作成ファイル数**: 12ファイル
**修正ファイル数**: 2ファイル（`upload-page-container.tsx`, `lgtm-cat-icon.tsx`）
