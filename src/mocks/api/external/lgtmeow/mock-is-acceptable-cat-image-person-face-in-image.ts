// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockIsAcceptableCatImagePersonFaceInImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: "person face in the image",
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
