// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockUploadCatImageUnprocessableEntity: ResponseResolver = () =>
  HttpResponse.json(
    {
      error: {
        code: httpStatusCode.unprocessableEntity,
        message: "UploadCatImageValidationError",
      },
    },
    {
      status: httpStatusCode.unprocessableEntity,
      statusText: "Unprocessable Entity",
    }
  );
