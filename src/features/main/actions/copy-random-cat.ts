// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

export type CopyRandomCatResult =
  | { readonly success: true; readonly markdown: string }
  | { readonly success: false; readonly error: string };

/**
 * ランダムなLGTM画像を1つ取得し、マークダウンソースを返す
 */
export async function copyRandomCat(): Promise<CopyRandomCatResult> {
  try {
    const accessToken = await issueClientCredentialsAccessToken();
    const lgtmImages = await fetchLgtmImagesInRandom(accessToken);

    if (lgtmImages.length === 0) {
      return { success: false, error: "No images available" };
    }

    // ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * lgtmImages.length);
    const selectedImage = lgtmImages[randomIndex];

    // マークダウンソースを生成（共通関数を使用）
    const markdown = generateLgtmMarkdown(selectedImage.imageUrl);

    return { success: true, markdown };
  } catch (error) {
    console.error("Failed to copy random cat:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
