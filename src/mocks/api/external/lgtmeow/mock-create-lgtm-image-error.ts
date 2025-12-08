// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

/**
 * LGTM画像作成APIがエラー（500）を返すモック
 */
export const mockCreateLgtmImageError: ResponseResolver = () =>
  HttpResponse.json(
    { message: "Internal Server Error" },
    { status: httpStatusCode.internalServerError }
  );
