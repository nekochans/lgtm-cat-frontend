# Issue #329: 実際のねこ画像アップロード機能実装計画

## 1. 概要

本ドキュメントは、既存のアップロードフォームUIに対して、実際の画像アップロード処理を実装するための計画書です。

### 1.1 実装対象

現在 `src/features/upload/functions/mock-upload.ts` でモック化されているアップロード処理を、実際のAPI連携に置き換えます。

### 1.2 処理フロー

> **重要**: Server Actionのデフォルトボディサイズ制限は1MBのため、画像ファイルをFormData経由で送ることはできません。代わりに**Presigned PUT URL方式**を採用し、ブラウザからR2へ直接アップロードします。

```
1. ユーザーが画像を選択
2. プレビュー表示（ローカルのURL.createObjectURLを使用）
3. 「送信する」ボタンクリック
4. [クライアント側前検証] ファイルサイズ・MIMEタイプをチェック（不正なら早期リターン）
5. Server Action (generateUploadUrl) を呼び出し
   - ファイル情報（MIMEタイプ、サイズ）のみを送信（画像データは送らない）
   - サーバー側で署名付きPUT URLとobjectKeyを生成して返す
6. ブラウザから署名付きPUT URLに直接PUTリクエスト → R2にアップロード
7. Server Action (validateAndCreateLgtmImage) を呼び出し
   - objectKeyのみを送信
   - 署名付きGET URLを生成
   - 猫画像判定APIを呼び出し
     - 非合格の場合: エラーを返す
   - LGTM画像作成APIを呼び出し
     - 失敗の場合: エラーを返す
8. 成功画面でコピー機能を有効化
```

### 1.3 Presigned PUT URL方式のメリット

| メリット | 説明 |
|---------|------|
| **ボディサイズ制限回避** | Server Actionには小さなJSON（ファイル情報のみ）を送るだけで、画像データは送らない |
| **サーバー負荷軽減** | 画像データがNext.jsサーバーを経由しない |
| **低レイテンシー** | Cloudflareエッジに直接アップロード |
| **コスト削減** | サーバーのデータ転送コストなし |

> **R2オブジェクトのクリーンアップ**: R2バケットには**ライフサイクルルールがインフラ側で設定済み**です。アップロードされたオブジェクトは一定期間（例: 7日）後に自動削除されるため、アプリケーションコードでの都度削除は不要です。

> **CORS設定**: R2バケットにはブラウザからのPUTリクエストを許可する**CORS設定がインフラ側で設定済み**です。

---

## 2. 新規作成ファイル一覧

| ファイルパス | 概要 |
|-------------|------|
| `src/features/upload/actions/generate-upload-url.ts` | Server Action: 署名付きPUT URL生成 |
| `src/features/upload/actions/validate-and-create-lgtm-image.ts` | Server Action: 猫画像判定とLGTM画像作成 |
| `src/features/upload/types/storage.ts` | ストレージクライアントの抽象型定義（ポリモーフィズム） |
| `src/lib/cloudflare/r2/presigned-url.ts` | R2 Presigned URL生成実装 |
| `src/lib/cloudflare/r2/index.ts` | R2モジュールのエクスポート |
| `src/features/upload/functions/validate-cat-image.ts` | 猫画像判定API呼び出し |
| `src/features/upload/functions/create-lgtm-image.ts` | LGTM画像作成API呼び出し |
| `src/features/upload/functions/upload-to-r2.ts` | ブラウザからR2へ直接アップロードする関数 |
| `src/features/upload/types/api-response.ts` | API レスポンス型定義 |
| `src/mocks/api/external/lgtmeow/mock-create-lgtm-image-error.ts` | LGTM画像作成エラー用モック |
| `src/features/upload/actions/__tests__/generate-upload-url.test.ts` | generateUploadUrl のユニットテスト |
| `src/features/upload/actions/__tests__/validate-and-create-lgtm-image.test.ts` | validateAndCreateLgtmImage のユニットテスト |

---

## 3. 実装詳細

### 3.1 型定義 (`src/features/upload/types/api-response.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { z } from "zod/v4";

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

### 3.2 ストレージクライアントの抽象型定義 (`src/features/upload/types/storage.ts`)

ストレージプロバイダー（R2, S3, GCS等）に依存しない抽象型を定義します。
将来的に別のストレージサービスへ移行する際も、この型に準拠する実装を作成すれば良いという設計です。

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
 *
 * この型に準拠する関数を実装することで、
 * R2, S3, GCS など様々なストレージプロバイダーに対応可能
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
 * 各ストレージプロバイダーで継承して使用
 */
export class StorageError extends Error {
  static {
    this.prototype.name = "StorageError";
  }
}
```

### 3.3 R2 Presigned URL実装 (`src/lib/cloudflare/r2/presigned-url.ts`)

抽象型に準拠したR2の具体的な実装です。

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
    this.prototype.name = "R2Error";
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
  });
}

/** 署名付きURLの有効期限（秒） */
const signedUrlExpiresInSeconds = 3600;

/**
 * 署名付きPUT URLを生成する
 * ブラウザから直接R2にアップロードするためのURL
 *
 * GeneratePresignedPutUrl 型に準拠した実装
 */
export const generateR2PresignedPutUrl: GeneratePresignedPutUrl = async (
  contentType: string
): Promise<PresignedPutUrlResult> => {
  const config = createR2Config();
  const s3Client = createS3Client(config);

  // MIMEタイプから拡張子を取得
  const extension = contentType.split("/")[1] ?? "webp";
  const objectKey = `uploads/${crypto.randomUUID()}.${extension}`;

  // 署名付きPUT URLを生成
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
 * API呼び出し時の画像参照用
 *
 * GeneratePresignedGetUrl 型に準拠した実装
 */
export const generateR2PresignedGetUrl: GeneratePresignedGetUrl = async (
  objectKey: string
): Promise<PresignedGetUrlResult> => {
  const config = createR2Config();
  const s3Client = createS3Client(config);

  // 署名付きGET URLを生成
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

### 3.4 R2モジュールのエクスポート (`src/lib/cloudflare/r2/index.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

export {
  generateR2PresignedPutUrl,
  generateR2PresignedGetUrl,
  R2Error,
} from "./presigned-url";
```

### 3.5 ブラウザからR2へ直接アップロード (`src/features/upload/functions/upload-to-r2.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * R2へのアップロード結果
 */
type UploadToR2Result =
  | { readonly success: true }
  | { readonly success: false; readonly error: Error };

/**
 * ブラウザから署名付きPUT URLを使ってR2に直接アップロードする
 *
 * この関数はクライアントサイドで実行される
 * Server Actionのボディサイズ制限を回避するため、
 * 画像データはNext.jsサーバーを経由せずに直接R2にアップロードする
 */
export async function uploadToR2(
  file: File,
  presignedPutUrl: string
): Promise<UploadToR2Result> {
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
}
```

### 3.6 猫画像判定API (`src/features/upload/functions/validate-cat-image.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { issueCognitoAccessToken } from "@/lib/cognito/oidc";
import { apiUrl } from "@/features/main/functions/api-url";
import {
  type ValidateCatImageResponse,
  validateCatImageResponseSchema,
} from "../types/api-response";

class ValidateCatImageError extends Error {
  static {
    this.prototype.name = "ValidateCatImageError";
  }
}

class PayloadTooLargeError extends Error {
  static {
    this.prototype.name = "PayloadTooLargeError";
  }
}

type ValidateResult =
  | { readonly success: true; readonly response: ValidateCatImageResponse }
  | { readonly success: false; readonly error: ValidateCatImageError | PayloadTooLargeError };

/**
 * 猫画像判定APIを呼び出す
 * @see https://api.lgtmeow.com/redoc#tag/Cat-Images/operation/validate_cat_image_from_url_cat_images_validate_url_post
 */
export async function validateCatImage(
  signedImageUrl: string
): Promise<ValidateResult> {
  const tokenResult = await issueCognitoAccessToken();
  if (!tokenResult.success) {
    return {
      success: false,
      error: new ValidateCatImageError("Failed to issue access token"),
    };
  }

  const endpoint = apiUrl("/cat-images/validate-url");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenResult.accessToken}`,
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

### 3.7 LGTM画像作成API (`src/features/upload/functions/create-lgtm-image.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { httpStatusCode } from "@/constants/http-status-code";
import { issueCognitoAccessToken } from "@/lib/cognito/oidc";
import { apiUrl } from "@/features/main/functions/api-url";
import {
  type CreateLgtmImageResponse,
  createLgtmImageResponseSchema,
} from "../types/api-response";

class CreateLgtmImageError extends Error {
  static {
    this.prototype.name = "CreateLgtmImageError";
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
  const tokenResult = await issueCognitoAccessToken();
  if (!tokenResult.success) {
    return {
      success: false,
      error: new CreateLgtmImageError("Failed to issue access token"),
    };
  }

  const endpoint = apiUrl("/v2/lgtm-images");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenResult.accessToken}`,
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

### 3.8 Server Action: 署名付きPUT URL生成 (`src/features/upload/actions/generate-upload-url.ts`)

> **重要**: AWS SDK v3 は Node.js 環境が必要です。Edge runtime では動作しないため、`runtime = "nodejs"` を明示します。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

/**
 * Node.js runtime を明示
 * AWS SDK v3 は Edge runtime では動作しないため必須
 */
export const runtime = "nodejs";

import type { Language } from "@/features/language";
import { generateR2PresignedPutUrl } from "@/lib/cloudflare/r2";
import {
  allowedMimeTypes,
  maxImageSizeBytes,
} from "../types/upload";
import {
  errorMessageInvalidMimeType,
  errorMessageFileTooLarge,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * generateUploadUrl の結果型
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
export async function generateUploadUrl(
  contentType: string,
  fileSize: number,
  language: Language
): Promise<GenerateUploadUrlResult> {
  // 1. [前検証] MIMEタイプチェック
  if (!allowedMimeTypes.includes(contentType as typeof allowedMimeTypes[number])) {
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
}
```

### 3.9 Server Action: 猫画像判定とLGTM画像作成 (`src/features/upload/actions/validate-and-create-lgtm-image.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

/**
 * Node.js runtime を明示
 * AWS SDK v3 は Edge runtime では動作しないため必須
 */
export const runtime = "nodejs";

import type { Language } from "@/features/language";
import { generateR2PresignedGetUrl } from "@/lib/cloudflare/r2";
import { validateCatImage } from "../functions/validate-cat-image";
import { createLgtmImage } from "../functions/create-lgtm-image";
import type { NotAcceptableReason } from "../types/api-response";
import {
  errorMessageNotAcceptable,
  errorMessageNotCatImage,
  errorMessageNotModerationImage,
  errorMessagePayloadTooLarge,
  errorMessagePersonFaceInImage,
  errorMessageUnknown,
} from "../upload-i18n";

/**
 * validateAndCreateLgtmImage の結果型
 */
export type ValidateAndCreateLgtmImageResult =
  | {
      readonly success: true;
      readonly createdLgtmImageUrl: string;
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
    case "an error has occurred":
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
 *
 * 注: objectKeyのみを受け取る（画像データは既にR2にアップロード済み）
 */
export async function validateAndCreateLgtmImage(
  objectKey: string,
  language: Language
): Promise<ValidateAndCreateLgtmImageResult> {
  try {
    // 1. 署名付きGET URLを生成
    const { getUrl: signedGetUrl } = await generateR2PresignedGetUrl(objectKey);

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
        (validateResult.response.notAcceptableReason as NotAcceptableReason) ??
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

    return {
      success: true,
      createdLgtmImageUrl: createResult.response.imageUrl,
    };
  } catch {
    return {
      success: false,
      errorMessages: [errorMessageUnknown(language)],
    };
  }
}
```

### 3.10 i18n追加 (`src/features/upload/upload-i18n.ts` への追記)

以下の関数を追加します:

```typescript
/**
 * エラーメッセージ: 猫画像ではない
 */
export function errorMessageNotCatImage(language: Language): string {
  return language === "ja"
    ? "この画像は猫の画像として認識されませんでした。猫が写っている画像を選択してください。"
    : "This image was not recognized as a cat image. Please select an image with a cat.";
}

/**
 * エラーメッセージ: 不適切な画像
 */
export function errorMessageNotModerationImage(language: Language): string {
  return language === "ja"
    ? "この画像は利用規約に違反する可能性があります。別の画像を選択してください。"
    : "This image may violate our terms of service. Please select a different image.";
}

/**
 * エラーメッセージ: 人の顔が含まれている
 */
export function errorMessagePersonFaceInImage(language: Language): string {
  return language === "ja"
    ? "画像に人の顔が含まれています。猫だけが写っている画像を選択してください。"
    : "The image contains a human face. Please select an image with only a cat.";
}

/**
 * エラーメッセージ: 許可されていない拡張子
 */
export function errorMessageNotAcceptable(language: Language): string {
  return language === "ja"
    ? "この画像形式は対応していません。JPEG、PNG、WebP形式の画像を選択してください。"
    : "This image format is not supported. Please select a JPEG, PNG, or WebP image.";
}

/**
 * エラーメッセージ: ファイルサイズが大きすぎる（API判定）
 */
export function errorMessagePayloadTooLarge(language: Language): string {
  return language === "ja"
    ? "画像ファイルのサイズが大きすぎます。より小さいファイルを選択してください。"
    : "The image file is too large. Please select a smaller file.";
}

/**
 * エラーメッセージ: 不明なエラー
 */
export function errorMessageUnknown(language: Language): string {
  return language === "ja"
    ? "アップロード中にエラーが発生しました。しばらく経ってから再度お試しください。"
    : "An error occurred during upload. Please try again later.";
}

/**
 * エラーメッセージ: MIMEタイプが許可されていない（サーバー側前検証）
 */
export function errorMessageInvalidMimeType(language: Language): string {
  return language === "ja"
    ? "この画像形式は対応していません。JPEG、PNG形式の画像を選択してください。"
    : "This image format is not supported. Please select a JPEG or PNG image.";
}

/**
 * エラーメッセージ: ファイルサイズが大きすぎる（サーバー側前検証）
 */
export function errorMessageFileTooLarge(language: Language): string {
  return language === "ja"
    ? "ファイルサイズが5MBを超えています。5MB以下の画像を選択してください。"
    : "File size exceeds 5MB. Please select an image under 5MB.";
}

/**
 * エラーメッセージ: R2アップロード失敗
 */
export function errorMessageR2UploadFailed(language: Language): string {
  return language === "ja"
    ? "画像のアップロードに失敗しました。しばらく経ってから再度お試しください。"
    : "Failed to upload the image. Please try again later.";
}
```

---

## 4. 既存ファイルの修正

### 4.1 upload-form.tsx の修正

`mockUpload` を実際の処理に置き換えます。

#### 変更前（現在のコード）

```typescript
// 送信ハンドラ
const handleSubmit = useCallback(async () => {
  if (selectedFile == null) {
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);
  setCurrentState("uploading");

  try {
    const result = await mockUpload(selectedFile, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      setUploadedImageUrl(result.imageUrl);
      setCurrentState("success");
    } else {
      setErrorMessages(result.errors ?? [genericErrorMessage(language)]);
      setCurrentState("error");
    }
  } catch {
    setErrorMessages([genericErrorMessage(language)]);
    setCurrentState("error");
  } finally {
    setIsUploading(false);
  }
}, [selectedFile, language]);
```

#### 変更後

> **レビュー指摘対応**: `progressInterval` のクリア漏れを防ぐため、`finally` ブロックでも確実にクリアするように修正。

```typescript
import { generateUploadUrl } from "../actions/generate-upload-url";
import { validateAndCreateLgtmImage } from "../actions/validate-and-create-lgtm-image";
import { uploadToR2 } from "../functions/upload-to-r2";
import { errorMessageR2UploadFailed } from "../upload-i18n";

// 送信ハンドラ
const handleSubmit = useCallback(async () => {
  if (selectedFile == null) {
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);
  setCurrentState("uploading");

  // プログレス表示用のインターバルID（finally でクリアするため外で宣言）
  let progressInterval: ReturnType<typeof setInterval> | null = null;

  try {
    // プログレス表示開始（擬似的に進捗を表示）
    progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 5, 30));
    }, 200);

    // 1. 署名付きPUT URLを取得
    const urlResult = await generateUploadUrl(
      selectedFile.type,
      selectedFile.size,
      language
    );

    if (!urlResult.success) {
      setErrorMessages(urlResult.errorMessages);
      setCurrentState("error");
      return;
    }

    // プログレスを更新
    if (progressInterval != null) {
      clearInterval(progressInterval);
    }
    setUploadProgress(30);

    // プログレス表示再開（R2アップロード中）
    progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 60));
    }, 300);

    // 2. ブラウザからR2へ直接アップロード
    const uploadResult = await uploadToR2(
      selectedFile,
      urlResult.presignedPutUrl
    );

    if (!uploadResult.success) {
      setErrorMessages([errorMessageR2UploadFailed(language)]);
      setCurrentState("error");
      return;
    }

    // プログレスを更新
    if (progressInterval != null) {
      clearInterval(progressInterval);
    }
    setUploadProgress(60);

    // プログレス表示再開（API呼び出し中）
    progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    // 3. 猫画像判定とLGTM画像作成
    const result = await validateAndCreateLgtmImage(
      urlResult.objectKey,
      language
    );

    setUploadProgress(100);

    if (result.success) {
      setUploadedImageUrl(result.createdLgtmImageUrl);
      setCurrentState("success");
    } else {
      setErrorMessages(result.errorMessages);
      setCurrentState("error");
    }
  } catch {
    setErrorMessages([genericErrorMessage(language)]);
    setCurrentState("error");
  } finally {
    // インターバルを確実にクリア（例外発生時も含む）
    if (progressInterval != null) {
      clearInterval(progressInterval);
    }
    setIsUploading(false);
  }
}, [selectedFile, language]);
```

### 4.2 プレビュー画像のURLについて

現在の実装ではローカルファイルの `URL.createObjectURL` を使用しており、これは維持します。署名付きURLはAPIコール時のみ使用します。

---

## 5. MSWモックの追加・修正

### 5.1 既存モックの確認

以下のモックファイルは既に存在しており、そのまま使用可能です：

- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-error.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-moderation-image.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-person-face-in-image.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-allowed-image-extension.ts`
- `src/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error.ts`
- `src/mocks/api/external/lgtmeow/mock-upload-cat-image.ts`

### 5.2 LGTM画像作成エラー用モック (`src/mocks/api/external/lgtmeow/mock-create-lgtm-image-error.ts`)

> **レビュー指摘対応**: LGTM生成APIエラー（非202）用のモックを追加。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { HttpResponse } from "msw";

/**
 * LGTM画像作成APIがエラー（500）を返すモック
 */
export function mockCreateLgtmImageError(): HttpResponse {
  return HttpResponse.json(
    { message: "Internal Server Error" },
    { status: 500 }
  );
}
```

### 5.3 MSWハンドラ定義 (`src/mocks/handlers/upload-handlers.ts`)

> **レビュー指摘対応**: LGTM生成APIエラー用のハンドラファクトリを追加。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { http } from "msw";
import { mockIsAcceptableCatImage } from "../api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockUploadCatImage } from "../api/external/lgtmeow/mock-upload-cat-image";
import { mockCreateLgtmImageError } from "../api/external/lgtmeow/mock-create-lgtm-image-error";

const apiBaseUrl = "https://api.lgtmeow.com";

/**
 * 成功パターンのハンドラ
 */
export const uploadSuccessHandlers = [
  http.post(`${apiBaseUrl}/cat-images/validate-url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
];

/**
 * 猫画像判定APIのエラーパターン用ハンドラを作成するヘルパー
 */
export function createValidationErrorHandlers(
  validateMockResolver: Parameters<typeof http.post>[1]
) {
  return [
    http.post(`${apiBaseUrl}/cat-images/validate-url`, validateMockResolver),
    http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
  ];
}

/**
 * LGTM画像作成APIのエラーパターン用ハンドラを作成するヘルパー
 */
export function createLgtmCreationErrorHandlers(
  lgtmMockResolver: Parameters<typeof http.post>[1] = mockCreateLgtmImageError
) {
  return [
    http.post(`${apiBaseUrl}/cat-images/validate-url`, mockIsAcceptableCatImage),
    http.post(`${apiBaseUrl}/v2/lgtm-images`, lgtmMockResolver),
  ];
}

/**
 * LGTM画像作成APIがエラーを返すハンドラ（デフォルト500エラー）
 */
export const uploadLgtmCreationErrorHandlers = createLgtmCreationErrorHandlers();
```

---

## 6. テスト実装

### 6.1 generateUploadUrl テスト (`src/features/upload/actions/__tests__/generate-upload-url.test.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateUploadUrl } from "../generate-upload-url";

// R2クライアントのモック
const mockGenerateR2PresignedPutUrl = vi.fn();

vi.mock("@/lib/cloudflare/r2", () => ({
  generateR2PresignedPutUrl: () => mockGenerateR2PresignedPutUrl(),
}));

describe("generateUploadUrl", () => {
  beforeEach(() => {
    mockGenerateR2PresignedPutUrl.mockResolvedValue({
      putUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
      objectKey: "uploads/test-uuid.jpg",
    });
  });

  describe("正常系", () => {
    it("有効なMIMEタイプとサイズで署名付きPUT URLを返す", async () => {
      const result = await generateUploadUrl("image/jpeg", 1024 * 1024, "ja");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.presignedPutUrl).toContain("https://r2.example.com");
        expect(result.objectKey).toBe("uploads/test-uuid.jpg");
      }
    });
  });

  describe("異常系 - 前検証", () => {
    it("MIMEタイプが許可されていない場合、エラーを返す", async () => {
      const result = await generateUploadUrl("image/gif", 1024 * 1024, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("JPEG");
      }
      // R2への呼び出しは行われない
      expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
    });

    it("ファイルサイズが5MBを超える場合、エラーを返す", async () => {
      const result = await generateUploadUrl("image/jpeg", 6 * 1024 * 1024, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("5MB");
      }
      // R2への呼び出しは行われない
      expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
    });
  });

  describe("異常系 - R2エラー", () => {
    it("R2への呼び出しが失敗した場合、エラーを返す", async () => {
      mockGenerateR2PresignedPutUrl.mockRejectedValue(new Error("R2 error"));

      const result = await generateUploadUrl("image/jpeg", 1024 * 1024, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("エラー");
      }
    });
  });
});
```

### 6.2 validateAndCreateLgtmImage テスト (`src/features/upload/actions/__tests__/validate-and-create-lgtm-image.test.ts`)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockIsAcceptableCatImagePayloadTooLargeError } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error";
import { mockUploadCatImage } from "@/mocks/api/external/lgtmeow/mock-upload-cat-image";
import { mockCreateLgtmImageError } from "@/mocks/api/external/lgtmeow/mock-create-lgtm-image-error";
import { validateAndCreateLgtmImage } from "../validate-and-create-lgtm-image";

// Cognito認証をモック
vi.mock("@/lib/cognito/oidc", () => ({
  issueCognitoAccessToken: vi.fn(() =>
    Promise.resolve({
      success: true,
      accessToken: "mock-access-token",
    })
  ),
}));

// R2クライアントのモック
vi.mock("@/lib/cloudflare/r2", () => ({
  generateR2PresignedGetUrl: vi.fn(() =>
    Promise.resolve({
      getUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
    })
  ),
}));

const apiBaseUrl = "https://api.lgtmeow.com";

const server = setupServer(
  http.post(`${apiBaseUrl}/cat-images/validate-url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage)
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("validateAndCreateLgtmImage", () => {
  const testObjectKey = "uploads/test-uuid.jpg";

  describe("正常系", () => {
    it("成功した場合、createdLgtmImageUrlを返す", async () => {
      const result = await validateAndCreateLgtmImage(testObjectKey, "ja");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.createdLgtmImageUrl).toContain("https://lgtm-images.lgtmeow.com");
      }
    });
  });

  describe("異常系 - 猫画像判定API", () => {
    it("猫画像でない場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(
          `${apiBaseUrl}/cat-images/validate-url`,
          mockIsAcceptableCatImageNotCatImage
        )
      );

      const result = await validateAndCreateLgtmImage(testObjectKey, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("猫");
      }
    });

    it("APIからPayloadTooLargeエラーが返る場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(
          `${apiBaseUrl}/cat-images/validate-url`,
          mockIsAcceptableCatImagePayloadTooLargeError
        )
      );

      const result = await validateAndCreateLgtmImage(testObjectKey, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("サイズ");
      }
    });
  });

  describe("異常系 - LGTM画像作成API失敗", () => {
    it("LGTM画像作成APIが非202を返す場合、エラーメッセージを返す", async () => {
      server.use(
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageError)
      );

      const result = await validateAndCreateLgtmImage(testObjectKey, "ja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMessages[0]).toContain("エラー");
      }
    });
  });
});
```

### 6.3 Storybook での MSW 使用方法

#### upload-form.stories.tsx への追加例

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { http } from "msw";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockUploadCatImage } from "@/mocks/api/external/lgtmeow/mock-upload-cat-image";
import { UploadForm } from "./upload-form";

const apiBaseUrl = "https://api.lgtmeow.com";

const meta: Meta<typeof UploadForm> = {
  component: UploadForm,
  title: "Features/Upload/UploadForm",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof UploadForm>;

// 成功パターン
export const UploadSuccess: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${apiBaseUrl}/cat-images/validate-url`, mockIsAcceptableCatImage),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};

// エラーパターン: 猫画像ではない
export const UploadErrorNotCatImage: Story = {
  args: {
    language: "ja",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${apiBaseUrl}/cat-images/validate-url`, mockIsAcceptableCatImageNotCatImage),
        http.post(`${apiBaseUrl}/v2/lgtm-images`, mockUploadCatImage),
      ],
    },
  },
};
```

---

## 7. 依存パッケージ

### 7.1 追加が必要なパッケージ

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**補足**: `@aws-sdk/s3-request-presigner` は署名付きURL生成に必要です。R2はS3互換APIを提供しているため、AWS SDKを使用します。

**UUID生成について**: UUID v4の生成には外部パッケージではなく、Node.js / ブラウザでネイティブに利用可能な `crypto.randomUUID()` を使用します。これにより依存関係を削減できます。

### 7.2 既存パッケージ（追加不要）

- `msw` (2.7.4) - インストール済み
- `msw-storybook-addon` (2.0.6) - インストール済み
- `zod` (3.25.30) - インストール済み

---

## 8. 環境変数

以下の環境変数が必要です（既に定義済み）:

| 変数名 | 説明 |
|--------|------|
| `R2_ENDPOINT_URL` | R2バケットのエンドポイントURL |
| `R2_ACCESS_KEY_ID` | R2アクセスキーID |
| `R2_SECRET_ACCESS_KEY` | R2シークレットアクセスキー |
| `R2_BUCKET_NAME` | R2バケット名 |
| `LGTMEOW_API_URL` | LGTMEOW APIのベースURL（既存） |

---

## 9. インフラ設定前提

### 9.1 R2 CORS設定

ブラウザからR2への直接アップロードにはCORS設定が必要です。以下の設定がインフラ側で設定済みの前提です：

```json
{
  "rules": [
    {
      "allowed": {
        "methods": ["PUT"],
        "origins": ["https://lgtmeow.com", "http://localhost:2222"],
        "headers": ["content-type", "content-length"]
      },
      "exposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

> **重要**: `AllowedHeaders` に `"*"` を使用するとR2では動作しません。明示的に `["content-type", "content-length"]` を指定する必要があります。

### 9.2 R2 ライフサイクルルール

アップロードされたオブジェクトの自動削除は、R2ライフサイクルルールにより実現します（インフラ側で設定済み）：

| 項目 | 説明 |
|------|------|
| **削除タイミング** | アップロードから一定期間後（例: 7日） |
| **対象オブジェクト** | `uploads/` プレフィックスを持つすべてのオブジェクト |

---

## 10. 実装順序

1. **依存パッケージのインストール** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `uuid`)
2. **ストレージ抽象型の作成** (`src/features/upload/types/storage.ts`)
3. **API レスポンス型の作成** (`src/features/upload/types/api-response.ts`)
4. **R2 Presigned URL実装の作成** (`src/lib/cloudflare/r2/presigned-url.ts`)
5. **R2エクスポートの作成** (`src/lib/cloudflare/r2/index.ts`)
6. **ブラウザからR2へ直接アップロード関数の作成** (`upload-to-r2.ts`)
7. **猫画像判定API関数の実装** (`validate-cat-image.ts`)
8. **LGTM画像作成API関数の実装** (`create-lgtm-image.ts`)
9. **i18nへのエラーメッセージ追加** (`upload-i18n.ts`)
10. **Server Action: generateUploadUrlの実装** (`generate-upload-url.ts`)
11. **Server Action: validateAndCreateLgtmImageの実装** (`validate-and-create-lgtm-image.ts`)
12. **upload-form.tsxの修正**
13. **LGTM画像作成エラー用モックの作成** (`mock-create-lgtm-image-error.ts`)
14. **MSWハンドラの作成** (`upload-handlers.ts`)
15. **ユニットテストの作成**
16. **Storybookでの動作確認**

### 10.1 ディレクトリ構造

実装後のディレクトリ構造は以下のようになります：

```
src/
├── features/
│   └── upload/
│       ├── actions/
│       │   ├── generate-upload-url.ts           # Server Action: URL生成
│       │   ├── validate-and-create-lgtm-image.ts # Server Action: 判定&作成
│       │   └── __tests__/
│       │       ├── generate-upload-url.test.ts
│       │       └── validate-and-create-lgtm-image.test.ts
│       ├── functions/
│       │   ├── upload-to-r2.ts                   # ブラウザからR2への直接アップロード
│       │   ├── validate-cat-image.ts             # 猫画像判定API
│       │   └── create-lgtm-image.ts              # LGTM画像作成API
│       └── types/
│           ├── storage.ts                        # ストレージ抽象型（ポリモーフィズム）
│           ├── api-response.ts                   # API レスポンス型
│           └── upload.ts                         # 既存の型定義
└── lib/
    └── cloudflare/
        └── r2/
            ├── index.ts                          # エクスポート
            └── presigned-url.ts                  # R2 Presigned URL生成実装
```

### 10.2 将来のストレージ拡張例

S3やGCSへ移行する場合は、以下のような構造で追加できます：

```
src/lib/
├── cloudflare/
│   └── r2/                    # 現在の実装
├── aws/
│   └── s3/                    # 将来のS3実装
│       ├── index.ts
│       └── presigned-url.ts   # GeneratePresignedPutUrl/GetUrl 型に準拠
└── gcp/
    └── gcs/                   # 将来のGCS実装
        ├── index.ts
        └── presigned-url.ts   # GeneratePresignedPutUrl/GetUrl 型に準拠
```

---

## 11. 品質管理手順

実装完了後、以下の手順で品質を確認します。

### 11.1 コードフォーマット・Lint

```bash
npm run format
npm run lint
```

### 11.2 テスト実行

```bash
npm run test
```

### 11.3 動作確認（Playwright MCP使用）

1. `http://localhost:2222` にアクセス
2. 画像アップロードページに遷移
3. 以下の操作を確認:
   - 画像選択 → プレビュー表示
   - 「送信する」ボタンクリック → プログレス表示
   - 成功時: 成功画面表示、マークダウンコピー機能
   - エラー時: エラーメッセージ表示

### 11.4 Storybook確認（Playwright MCP使用）

1. `http://localhost:6006/` にアクセス
2. `Features/Upload/UploadForm` を確認
3. 各Story（成功パターン、エラーパターン）が正しく表示されることを確認

### 11.5 デザイン崩れ確認（Chrome DevTools MCP使用）

- レスポンシブ対応の確認
- エラーメッセージの表示位置確認
- プログレスバーの表示確認

---

## 12. 注意事項

1. **Presigned PUT URL方式の採用**: Server Actionのボディサイズ制限（デフォルト1MB）を回避するため、画像データはブラウザからR2へ直接アップロードします。Server Actionにはファイル情報（MIMEタイプ、サイズ）やobjectKeyのみを送信します。

2. **ポリモーフィズムによる抽象化**: `GeneratePresignedPutUrl` / `GeneratePresignedGetUrl` 型を定義し、R2実装はその型に準拠しています。将来S3やGCSへ移行する際は、同じ型に準拠する実装を作成し、インポート先を変更するだけで対応可能です。

3. **CORS設定が必須**: ブラウザからR2へ直接PUTリクエストを送るため、R2バケットにCORS設定が必要です（インフラ側で設定済み）。

4. **R2の署名付きURLは一時的**: 署名付きURLには有効期限（1時間）があるため、APIコール時にのみ使用し、永続化しないでください。

5. **エラーハンドリングは詳細に**: 各APIエラーの種類に応じて、ユーザーに適切なエラーメッセージを表示します。

6. **Cognitoトークンの取得**: 既存の `issueCognitoAccessToken` を使用し、認証済みリクエストを行います。

7. **テストではR2クライアントをモック**: R2への実際のアップロードはテストで行わず、`vi.mock("@/lib/cloudflare/r2")` でモックを使用します。

8. **ストレージエラーの継承**: `R2Error` は基底クラス `StorageError` を継承しています。将来のS3/GCS実装でも同様に継承することで、エラーハンドリングを統一できます。

9. **R2オブジェクトのクリーンアップ**: R2バケットにはライフサイクルルールがインフラ側で設定済みです。アップロードされたオブジェクトは一定期間後に自動削除されるため、アプリケーションコードでの都度削除は不要です。

---

## 13. レビュー指摘対応まとめ

本計画書は以下のレビュー指摘を反映しています。

### 13.1 ブロッカー対応

| 指摘内容 | 対応策 |
|---------|--------|
| **Server Actionのボディサイズ制限（1MB）** | Presigned PUT URL方式を採用し、画像データはブラウザからR2へ直接アップロード。Server Actionにはファイル情報のみを送信 |
| **不正画像の恒久保存リスク** | サーバー側前検証（MIMEタイプ・ファイルサイズ）で不正なファイルを早期に弾く。R2オブジェクトはライフサイクルルールにより一定期間後に自動削除される |
| **実行ランタイムの明示不足** | Server Actionに `export const runtime = "nodejs";` を明示 |

### 13.2 改善対応

| 指摘内容 | 対応策 |
|---------|--------|
| **ファイルサイズ・MIME前検証** | `allowedMimeTypes` と `maxImageSizeBytes` を使った前検証を追加 |
| **Progress intervalのクリア漏れ** | `finally` ブロックで確実に `clearInterval` するよう修正 |
| **テストカバレッジの拡充** | 「R2アップロード失敗」「LGTM生成APIが非202を返す」パスのテストを追加 |
| **MSWハンドラの網羅性** | LGTM生成APIエラー用のモック・ハンドラファクトリを追加 |

### 13.3 インフラ設定前提

| 設定 | 説明 |
|------|------|
| **R2 CORS設定** | ブラウザからのPUTリクエストを許可（`AllowedMethods: ["PUT"]`、`AllowedHeaders: ["content-type", "content-length"]`） |
| **R2 ライフサイクルルール** | `uploads/` プレフィックスのオブジェクトを一定期間後に自動削除 |

### 13.4 Presigned PUT URL方式のメリット

| メリット | 説明 |
|---------|------|
| **ボディサイズ制限回避** | Server Actionには小さなJSON（ファイル情報のみ）を送るだけで、画像データは送らない |
| **サーバー負荷軽減** | 画像データがNext.jsサーバーを経由しない |
| **低レイテンシー** | Cloudflareエッジに直接アップロード |
| **コスト削減** | サーバーのデータ転送コストなし |
