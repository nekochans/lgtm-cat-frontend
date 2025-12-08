# Issue #329: アップロード中・完了・エラー画面の実装計画

## 概要

既存のアップロードフォームに、アップロード中のプログレス表示、アップロード完了画面、およびアップロードエラー表示機能を追加する。実際のAPI通信（猫画像判定API、LGTM画像作成API）およびCloudflare R2へのアップロード機能を実装。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/329

## Figmaデザインリンク

### アップロード中のプログレス

| 画面 | Figma URL |
|------|-----------
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
   - 各種エラーケースに対応したi18nメッセージ

4. **実際のAPI通信**
   - 署名付きPUT URL生成（Server Action）
   - ブラウザから直接R2へのアップロード
   - 猫画像判定API呼び出し
   - LGTM画像作成API呼び出し
   - キャッシュ無効化（revalidateTag）

5. **多言語対応（i18n）**
   - 新規テキストの日本語/英語対応

6. **依存性注入（DI）パターン**
   - Storybook等でのモック可能な設計

## アーキテクチャ

### アップロードフロー

```
[ブラウザ]
    │
    ├─1. ファイル選択・バリデーション（クライアント側）
    │
    ├─2. generateUploadUrlAction (Server Action)
    │   └─→ R2署名付きPUT URL生成
    │
    ├─3. uploadToR2 (クライアント側)
    │   └─→ 署名付きURLでR2に直接PUT
    │
    ├─4. validateAndCreateLgtmImageAction (Server Action)
    │   ├─→ R2署名付きGET URL生成
    │   ├─→ 猫画像判定API呼び出し
    │   ├─→ LGTM画像作成API呼び出し
    │   └─→ キャッシュ無効化（revalidateTag）
    │
    └─5. 成功/エラー画面表示
```

### なぜブラウザから直接R2にアップロードするのか

- **Server Actionのボディサイズ制限**: Next.jsのServer Actionには1MBのボディサイズ制限がある
- **画像ファイルは5MBまで許可**: 制限を回避するため、画像データはNext.jsサーバーを経由せずに直接R2にアップロード
- **メタデータのみServer Action経由**: contentType、fileSizeなどのメタデータのみをServer Actionで処理

## ファイル構成

### 新規作成ファイル

```text
src/
├── features/
│   └── upload/
│       ├── actions/
│       │   ├── generate-upload-url-action.ts           # 署名付きPUT URL生成 Server Action
│       │   ├── validate-and-create-lgtm-image-action.ts # 猫画像判定+LGTM作成 Server Action
│       │   └── __tests__/
│       │       ├── generate-upload-url-action.test.ts
│       │       └── validate-and-create-lgtm-image-action.test.ts
│       ├── functions/
│       │   ├── create-lgtm-image.ts                    # LGTM画像作成API呼び出し
│       │   └── validate-cat-image.ts                   # 猫画像判定API呼び出し
│       └── types/
│           ├── api-response.ts                         # API レスポンス型定義
│           └── storage.ts                              # ストレージ関連型定義
├── lib/
│   └── cloudflare/
│       └── r2/
│           ├── presigned-url.ts                        # R2署名付きURL生成
│           └── upload-to-r2.ts                         # ブラウザからR2へのアップロード
└── mocks/
    └── handlers/
        └── upload-handlers.ts                          # MSWハンドラー（Storybook用）
```

### 修正ファイル

```text
src/features/upload/types/upload.ts                     # DI用型定義の追加
src/features/upload/upload-i18n.ts                      # エラーメッセージの追加
src/features/upload/components/upload-form.tsx          # DIパターン導入、プログレス管理
src/features/upload/components/upload-success.tsx       # props変更（lgtmImageUrl + previewImageUrl）
src/features/upload/components/upload-form.stories.tsx  # モック関数注入
src/features/upload/components/upload-success.stories.tsx # props変更対応
src/features/upload/components/__tests__/upload-success.test.tsx # props変更対応
```

### 削除ファイル

```text
src/features/upload/functions/mock-upload.ts            # モック関数（実装に置き換え）
src/features/upload/functions/__tests__/mock-upload.test.ts
```

## 実装詳細

### 1. 型定義

#### src/features/upload/types/api-response.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { z } from "zod";

/**
 * 猫画像判定APIのレスポンス型
 * @see https://api.lgtmeow.com/redoc#tag/Cat-Images/operation/validate_cat_image_from_url_cat_images_validate_url_post
 */
export const validateCatImageResponseSchema = z.object({
  isAcceptableCatImage: z.boolean(),
  notAcceptableReason: z.string().optional(),
});

export type ValidateCatImageResponse = z.infer<
  typeof validateCatImageResponseSchema
>;

/**
 * LGTM画像作成APIのレスポンス型
 * @see https://api.lgtmeow.com/redoc#tag/LGTM-Images-V2/operation/create_lgtm_image_from_url_v2_lgtm_images_post
 */
export const createLgtmImageResponseSchema = z.object({
  imageUrl: z.url(),
});

export type CreateLgtmImageResponse = z.infer<
  typeof createLgtmImageResponseSchema
>;

/**
 * notAcceptableReason の種類
 * 各理由に対応するi18nメッセージが必要
 */
export type NotAcceptableReason =
  | "not cat image"
  | "not moderation image"
  | "person face in the image"
  | "not an allowed image extension"
  | "an error has occurred";
```

#### src/features/upload/types/storage.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * 署名付きPUT URL生成結果の型
 * ブラウザから直接アップロードするためのURL
 */
export type PresignedPutUrlResult = {
  /** 署名付きPUT URL（ブラウザからのアップロード用） */
  readonly putUrl: string;
  /** ストレージ内のオブジェクトキー */
  readonly objectKey: string;
};

/**
 * 署名付きGET URL生成結果の型
 * API呼び出し時の画像参照用
 */
export type PresignedGetUrlResult = {
  /** 署名付きGET URL（読み取り専用） */
  readonly getUrl: string;
};

/**
 * 署名付きPUT URL生成関数の型定義
 */
export type GeneratePresignedPutUrl = (
  contentType: string
) => Promise<PresignedPutUrlResult>;

/**
 * 署名付きGET URL生成関数の型定義
 */
export type GeneratePresignedGetUrl = (
  objectKey: string
) => Promise<PresignedGetUrlResult>;

/**
 * ストレージエラーの基底クラス
 */
export class StorageError extends Error {
  static {
    StorageError.prototype.name = "StorageError";
  }
}

/**
 * ストレージへのアップロード結果の型
 */
export type UploadToStorageResult =
  | { readonly success: true }
  | { readonly success: false; readonly error: Error };

/**
 * ストレージへのアップロード関数の型定義
 */
export type UploadToStorageFunc = (
  file: File,
  presignedPutUrl: string
) => Promise<UploadToStorageResult>;
```

### 2. Server Actions

#### src/features/upload/actions/generate-upload-url-action.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import type { Language } from "@/features/language";
import { generateR2PresignedPutUrl } from "@/lib/cloudflare/r2/presigned-url";
import type { GenerateUploadUrlAction } from "../types/upload";
import { allowedMimeTypes, maxImageSizeBytes } from "../types/upload";
import {
  errorMessageFileTooLarge,
  errorMessageInvalidMimeType,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * generateUploadUrlAction の結果型
 */
export type GenerateUploadUrlResult =
  | {
      readonly success: true;
      readonly presignedPutUrl: string;
      readonly objectKey: string;
    }
  | {
      readonly success: false;
      readonly errorMessages: readonly string[];
    };

/**
 * 署名付きPUT URL生成 Server Action
 *
 * 処理フロー:
 * 1. [前検証] MIMEタイプ・ファイルサイズをサーバー側で検証
 * 2. 署名付きPUT URLを生成
 *
 * 注: 画像データは受け取らない（Server Actionのボディサイズ制限対策）
 */
export const generateUploadUrlAction: GenerateUploadUrlAction = async (
  contentType: string,
  fileSize: number,
  language: Language
): Promise<GenerateUploadUrlResult> => {
  // 1. [前検証] MIMEタイプチェック
  if (
    !allowedMimeTypes.includes(contentType as (typeof allowedMimeTypes)[number])
  ) {
    return {
      success: false,
      errorMessages: [errorMessageInvalidMimeType(language)],
    };
  }

  // 1. [前検証] ファイルサイズチェック
  if (fileSize > maxImageSizeBytes) {
    return {
      success: false,
      errorMessages: [errorMessageFileTooLarge(language)],
    };
  }

  try {
    // 2. 署名付きPUT URLを生成
    const result = await generateR2PresignedPutUrl(contentType);

    return {
      success: true,
      presignedPutUrl: result.putUrl,
      objectKey: result.objectKey,
    };
  } catch {
    return {
      success: false,
      errorMessages: [errorMessageUnknown(language)],
    };
  }
};
```

#### src/features/upload/actions/validate-and-create-lgtm-image-action.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { revalidateTag } from "next/cache";
import type { Language } from "@/features/language";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import {
  createLgtmImageUrl,
  type LgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { generateR2PresignedGetUrl } from "@/lib/cloudflare/r2/presigned-url";
import { createLgtmImage } from "../functions/create-lgtm-image";
import { validateCatImage } from "../functions/validate-cat-image";
import type { NotAcceptableReason } from "../types/api-response";
import type { ValidateAndCreateLgtmImageAction } from "../types/upload";
import {
  errorMessageNotAcceptable,
  errorMessageNotCatImage,
  errorMessageNotModerationImage,
  errorMessagePayloadTooLarge,
  errorMessagePersonFaceInImage,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * validateAndCreateLgtmImageAction の結果型
 */
export type ValidateAndCreateLgtmImageResult =
  | {
      readonly success: true;
      readonly createdLgtmImageUrl: LgtmImageUrl;
      readonly previewImageUrl: string;
    }
  | {
      readonly success: false;
      readonly errorMessages: readonly string[];
    };

/**
 * NotAcceptableReasonからエラーメッセージを取得
 */
function getErrorMessageFromReason(
  reason: NotAcceptableReason,
  language: Language
): string {
  switch (reason) {
    case "not cat image":
      return errorMessageNotCatImage(language);
    case "not moderation image":
      return errorMessageNotModerationImage(language);
    case "person face in the image":
      return errorMessagePersonFaceInImage(language);
    case "not an allowed image extension":
      return errorMessageNotAcceptable(language);
    default:
      return errorMessageUnknown(language);
  }
}

/**
 * 猫画像判定とLGTM画像作成 Server Action
 *
 * 処理フロー:
 * 1. 署名付きGET URLを生成
 * 2. 猫画像判定APIを呼び出し
 * 3. LGTM画像作成APIを呼び出し
 * 4. キャッシュ無効化（revalidateTag）
 *
 * 注: objectKeyのみを受け取る（画像データは既にR2にアップロード済み）
 */
export const validateAndCreateLgtmImageAction: ValidateAndCreateLgtmImageAction =
  async (
    objectKey: string,
    language: Language
  ): Promise<ValidateAndCreateLgtmImageResult> => {
    try {
      // 1. 署名付きGET URLを生成
      const { getUrl: signedGetUrl } =
        await generateR2PresignedGetUrl(objectKey);

      // 2. 猫画像判定APIを呼び出し
      const validateResult = await validateCatImage(signedGetUrl);

      if (!validateResult.success) {
        const errorMessage =
          validateResult.error.name === "PayloadTooLargeError"
            ? errorMessagePayloadTooLarge(language)
            : errorMessageUnknown(language);

        return {
          success: false,
          errorMessages: [errorMessage],
        };
      }

      // 猫画像でない場合はエラー
      if (!validateResult.response.isAcceptableCatImage) {
        const reason =
          (validateResult.response
            .notAcceptableReason as NotAcceptableReason) ??
          "an error has occurred";
        const errorMessage = getErrorMessageFromReason(reason, language);

        return {
          success: false,
          errorMessages: [errorMessage],
        };
      }

      // 3. LGTM画像作成APIを呼び出し
      const createResult = await createLgtmImage(signedGetUrl);

      if (!createResult.success) {
        return {
          success: false,
          errorMessages: [errorMessageUnknown(language)],
        };
      }

      // 4. LGTM画像作成成功時、最新画像一覧のキャッシュを無効化
      // profile="max" でstale-while-revalidateセマンティクスを使用（Next.js 16推奨）
      revalidateTag(CACHE_TAG_LGTM_IMAGES_LATEST, "max");

      return {
        success: true,
        createdLgtmImageUrl: createLgtmImageUrl(createResult.response.imageUrl),
        previewImageUrl: signedGetUrl,
      };
    } catch {
      return {
        success: false,
        errorMessages: [errorMessageUnknown(language)],
      };
    }
  };
```

### 3. API呼び出し関数

#### src/features/upload/functions/validate-cat-image.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import {
  type ValidateCatImageResponse,
  validateCatImageResponseSchema,
} from "../types/api-response";

class ValidateCatImageError extends Error {
  static {
    ValidateCatImageError.prototype.name = "ValidateCatImageError";
  }
}

class PayloadTooLargeError extends Error {
  static {
    PayloadTooLargeError.prototype.name = "PayloadTooLargeError";
  }
}

type ValidateResult =
  | { readonly success: true; readonly response: ValidateCatImageResponse }
  | {
      readonly success: false;
      readonly error: ValidateCatImageError | PayloadTooLargeError;
    };

/**
 * 猫画像判定APIを呼び出す
 * @see https://api.lgtmeow.com/redoc#tag/Cat-Images/operation/validate_cat_image_from_url_cat_images_validate_url_post
 */
export async function validateCatImage(
  signedImageUrl: string
): Promise<ValidateResult> {
  let accessToken: string;
  try {
    accessToken = await issueClientCredentialsAccessToken();
  } catch {
    return {
      success: false,
      error: new ValidateCatImageError("Failed to issue access token"),
    };
  }

  const endpoint = `${lgtmeowApiUrl()}/cat-images/validate/url`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl: signedImageUrl }),
  });

  if (response.status === httpStatusCode.payloadTooLarge) {
    return {
      success: false,
      error: new PayloadTooLargeError("Image file is too large"),
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: new ValidateCatImageError(
        `API request failed with status ${response.status}`
      ),
    };
  }

  const responseBody: unknown = await response.json();
  const parseResult = validateCatImageResponseSchema.safeParse(responseBody);

  if (!parseResult.success) {
    return {
      success: false,
      error: new ValidateCatImageError("Invalid API response format"),
    };
  }

  return { success: true, response: parseResult.data };
}
```

#### src/features/upload/functions/create-lgtm-image.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import {
  type CreateLgtmImageResponse,
  createLgtmImageResponseSchema,
} from "../types/api-response";

class CreateLgtmImageError extends Error {
  static {
    CreateLgtmImageError.prototype.name = "CreateLgtmImageError";
  }
}

type CreateResult =
  | { readonly success: true; readonly response: CreateLgtmImageResponse }
  | { readonly success: false; readonly error: CreateLgtmImageError };

/**
 * LGTM画像作成APIを呼び出す
 * @see https://api.lgtmeow.com/redoc#tag/LGTM-Images-V2/operation/create_lgtm_image_from_url_v2_lgtm_images_post
 */
export async function createLgtmImage(
  signedImageUrl: string
): Promise<CreateResult> {
  let accessToken: string;
  try {
    accessToken = await issueClientCredentialsAccessToken();
  } catch {
    return {
      success: false,
      error: new CreateLgtmImageError("Failed to issue access token"),
    };
  }

  const endpoint = `${lgtmeowApiUrl()}/v2/lgtm-images`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl: signedImageUrl }),
  });

  // 成功時は 202 Accepted
  if (response.status !== httpStatusCode.accepted) {
    return {
      success: false,
      error: new CreateLgtmImageError(
        `API request failed with status ${response.status}`
      ),
    };
  }

  const responseBody: unknown = await response.json();
  const parseResult = createLgtmImageResponseSchema.safeParse(responseBody);

  if (!parseResult.success) {
    return {
      success: false,
      error: new CreateLgtmImageError("Invalid API response format"),
    };
  }

  return { success: true, response: parseResult.data };
}
```

### 4. R2関連

#### src/lib/cloudflare/r2/presigned-url.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  GeneratePresignedGetUrl,
  GeneratePresignedPutUrl,
  PresignedGetUrlResult,
  PresignedPutUrlResult,
} from "@/features/upload/types/storage";
import { StorageError } from "@/features/upload/types/storage";

/**
 * R2固有のエラークラス
 */
export class R2Error extends StorageError {
  static {
    R2Error.prototype.name = "R2Error";
  }
}

/**
 * R2設定の型
 */
type R2Config = {
  readonly endpointUrl: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucketName: string;
};

/**
 * 環境変数からR2設定を取得
 */
function createR2Config(): R2Config {
  const endpointUrl = process.env.R2_ENDPOINT_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (
    endpointUrl == null ||
    accessKeyId == null ||
    secretAccessKey == null ||
    bucketName == null
  ) {
    throw new R2Error("R2 environment variables are not configured");
  }

  return { endpointUrl, accessKeyId, secretAccessKey, bucketName };
}

/**
 * S3互換クライアントを作成
 */
function createS3Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: config.endpointUrl,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

/** 署名付きURLの有効期限（秒） */
const signedUrlExpiresInSeconds = 3600;

/**
 * 署名付きPUT URLを生成する
 */
export const generateR2PresignedPutUrl: GeneratePresignedPutUrl = async (
  contentType: string
): Promise<PresignedPutUrlResult> => {
  const config = createR2Config();
  const s3Client = createS3Client(config);

  const extension = contentType.split("/")[1] ?? "webp";
  const objectKey = `uploads/${crypto.randomUUID()}.${extension}`;

  const putCommand = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  const putUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: signedUrlExpiresInSeconds,
  });

  return { putUrl, objectKey };
};

/**
 * 署名付きGET URLを生成する
 */
export const generateR2PresignedGetUrl: GeneratePresignedGetUrl = async (
  objectKey: string
): Promise<PresignedGetUrlResult> => {
  const config = createR2Config();
  const s3Client = createS3Client(config);

  const getCommand = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: objectKey,
  });

  const getUrl = await getSignedUrl(s3Client, getCommand, {
    expiresIn: signedUrlExpiresInSeconds,
  });

  return { getUrl };
};
```

#### src/lib/cloudflare/r2/upload-to-r2.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type {
  UploadToStorageFunc,
  UploadToStorageResult,
} from "@/features/upload/types/storage";

/**
 * ブラウザから署名付きPUT URLを使ってR2に直接アップロードする
 *
 * この関数はクライアントサイドで実行される
 * Server Actionのボディサイズ制限を回避するため、
 * 画像データはNext.jsサーバーを経由せずに直接R2にアップロードする
 */
export const uploadToR2: UploadToStorageFunc = async (
  file: File,
  presignedPutUrl: string
): Promise<UploadToStorageResult> => {
  try {
    const response = await fetch(presignedPutUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "Content-Length": file.size.toString(),
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: new Error(`Upload failed with status ${response.status}`),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown upload error"),
    };
  }
};
```

### 5. コンポーネント

#### upload-form.tsx（主要な変更点）

- **DIパターンの導入**: Server Actions と uploadToStorage をpropsで受け取れるように
- **プログレス管理ヘルパー**: インターバルベースのプログレス更新
- **3段階のプログレス**: URL生成(0-30%) → アップロード(30-60%) → API処理(60-100%)
- **Storybook用の初期状態props**: initialState, initialPreviewUrl 等

```typescript
type Props = {
  readonly language: Language;
  // DI用props（省略時はデフォルト実装を使用）
  readonly generateUploadUrlAction?: GenerateUploadUrlAction;
  readonly uploadToStorage?: UploadToStorageFunc;
  readonly validateAndCreateLgtmImageAction?: ValidateAndCreateLgtmImageAction;
  // Storybook用の初期状態
  readonly initialState?: UploadFormState;
  readonly initialPreviewUrl?: string | null;
  readonly initialSelectedFile?: File | null;
  readonly initialLgtmImageUrl?: LgtmImageUrl | null;
  readonly initialPreviewImageUrlForSuccess?: string | null;
  readonly initialErrorMessages?: readonly string[];
  readonly initialUploadProgress?: number;
};
```

#### upload-success.tsx（props変更）

- `imageUrl: string` → `lgtmImageUrl: LgtmImageUrl` + `previewImageUrl: string`
- Markdownコピー時は `lgtmImageUrl` を使用
- 画像表示は `previewImageUrl` を使用

### 6. i18n追加関数

```typescript
// エラーメッセージ関数（upload-i18n.ts に追加）
errorMessageNotCatImage(language)
errorMessageNotModerationImage(language)
errorMessagePersonFaceInImage(language)
errorMessageNotAcceptable(language)
errorMessagePayloadTooLarge(language)
errorMessageUnknown(language)
errorMessageInvalidMimeType(language)
errorMessageFileTooLarge(language)
errorMessageStorageUploadFailed(language)
```

### 7. Storybook

#### upload-form.stories.tsx のモック関数注入パターン

```typescript
function createSuccessMocks() {
  return {
    generateUploadUrlAction: async () =>
      Promise.resolve({
        success: true as const,
        presignedPutUrl: "https://mock-storage.example.com/upload",
        objectKey: "mock-object-key",
      }),
    uploadToStorage: async () => Promise.resolve({ success: true as const }),
    validateAndCreateLgtmImageAction: async () =>
      Promise.resolve({
        success: true as const,
        createdLgtmImageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/mock-lgtm.webp"
        ),
        previewImageUrl:
          "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
      }),
  };
}

// 各エラーケース用のモック関数も同様に作成
```

## テスト一覧

| ファイルパス | 内容 |
|------------|------|
| `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts` | Server Action のテスト |
| `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts` | Server Action のテスト |
| `src/features/upload/components/__tests__/upload-form.test.tsx` | フォームコンポーネントのテスト |
| `src/features/upload/components/__tests__/upload-progress.test.tsx` | プログレスコンポーネントのテスト |
| `src/features/upload/components/__tests__/upload-success.test.tsx` | 成功画面コンポーネントのテスト |

## 環境変数

```env
# Cloudflare R2
R2_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
```

## 品質管理手順

### 1. コードフォーマット

```bash
npm run format
```

### 2. Lint チェック

```bash
npm run lint
```

### 3. 型チェック・ビルド

```bash
npm run build
```

### 4. テスト実行

```bash
npm run test
```

### 5. Storybook での確認

```bash
npm run storybook
```

確認URL: `http://localhost:6006/`

### 6. ブラウザ確認（Playwright MCP）

- 日本語: `http://localhost:2222/upload`
- 英語: `http://localhost:2222/en/upload`

## 実装時の注意事項

### 必ず確認すべき事項

1. **全てのファイル先頭に必須コメント**: `// 絶対厳守：編集前に必ずAI実装ルールを読む`
2. **型定義に `readonly` を使用**: オブジェクトプロパティは全て `readonly` を付ける
3. **`onPress` を使用**: HeroUIのButtonでは `onClick` ではなく `onPress` を使用
4. **URL.createObjectURL のクリーンアップ**: useEffectでURL.revokeObjectURLを呼ぶ
5. **タイマーのクリーンアップ**: useEffectでsetIntervalのクリーンアップを行う
6. **エラーハンドリング**: 全てのエラーケースで適切なメッセージを表示
7. **Server Action 命名規則**: 関数名・型名に `Action` サフィックスを付ける

### 禁止事項

1. **`data` 等の曖昧な変数名使用禁止**: 具体的な名前を使用（例: `responseBody`）
2. **`let` の使用禁止**: 可能な限り `const` を使用
3. **存在しないファイルのimport禁止**: 全ての依存関係を事前に確認
4. **テストをスキップしてマージ禁止**: 全てのテストがパスするまで完了としない

## まとめ

この実装では、以下の機能を実現しました：

1. ✅ アップロード中のプログレス表示（3段階）
2. ✅ アップロード成功画面の表示
3. ✅ Markdownソースのコピー機能
4. ✅ 画像クリックでのコピー機能
5. ✅ 「Copied!」メッセージの表示
6. ✅ 各種エラーケースへの対応
7. ✅ 多言語対応（日本語/英語）
8. ✅ 実際のAPI通信（猫画像判定、LGTM画像作成）
9. ✅ Cloudflare R2への直接アップロード
10. ✅ キャッシュ無効化（revalidateTag）
11. ✅ DIパターンによるテスト可能な設計
12. ✅ Storybookでのモック関数注入

**新規作成ファイル数**: 12ファイル
**修正ファイル数**: 7ファイル
**削除ファイル数**: 2ファイル
