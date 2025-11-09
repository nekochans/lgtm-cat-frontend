// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockUnauthorizedError: ResponseResolver = () =>
  HttpResponse.json(
    { code: httpStatusCode.unauthorized, message: "Unauthorized" },
    { status: httpStatusCode.unauthorized, statusText: "Unauthorized" }
  );
