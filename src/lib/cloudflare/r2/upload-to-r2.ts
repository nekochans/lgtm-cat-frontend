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
 *
 * UploadToStorageFn 型に準拠した実装
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
