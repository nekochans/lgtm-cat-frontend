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
    StorageError.prototype.name = "StorageError";
  }
}
