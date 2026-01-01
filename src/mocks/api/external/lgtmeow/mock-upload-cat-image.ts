// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockUploadCatImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      createdLgtmImageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp",
    },
    { status: httpStatusCode.accepted, statusText: "Accepted" }
  );
