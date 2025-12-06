// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { MockUploadResult, UploadProgressCallback } from "../types/upload";

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
      await new Promise((resolve) =>
        setTimeout(resolve, progressUpdateInterval)
      );
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
