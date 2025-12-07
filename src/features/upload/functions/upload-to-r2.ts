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
