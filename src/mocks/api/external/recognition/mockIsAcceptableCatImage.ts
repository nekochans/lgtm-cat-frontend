import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: true,
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
