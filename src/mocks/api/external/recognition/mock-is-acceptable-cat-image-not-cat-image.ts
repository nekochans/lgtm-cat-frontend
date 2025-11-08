// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockIsAcceptableCatImageNotCatImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: "not cat image",
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
