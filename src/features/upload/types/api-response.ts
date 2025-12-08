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
