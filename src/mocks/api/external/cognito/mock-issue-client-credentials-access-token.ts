// 絶対厳守：編集前に必ずAI実装ルールを読む
import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockIssueClientCredentialsAccessToken: ResponseResolver = () =>
  HttpResponse.json(
    {
      access_token: "dummy-access-token",
      expires_in: 3600,
      token_type: "Bearer",
    },
    {
      status: httpStatusCode.ok,
      statusText: "OK",
    }
  );
