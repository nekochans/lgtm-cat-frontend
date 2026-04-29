import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockIsAcceptableCatImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: true,
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
