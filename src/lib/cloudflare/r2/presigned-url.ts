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
interface R2Config {
  readonly endpointUrl: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucketName: string;
}

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
    // R2はpath-styleアクセスを使用（バケット名をURLパスに含める）
    forcePathStyle: true,
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
