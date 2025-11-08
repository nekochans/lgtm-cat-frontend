// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockInternalServerError: ResponseResolver = () =>
  HttpResponse.json(
    {
      code: httpStatusCode.internalServerError,
      message: "Internal Server Error",
    },
    {
      status: httpStatusCode.internalServerError,
      statusText: "Internal Server Error",
    }
  );
