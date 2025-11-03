import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImageError: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: "an error has occurred",
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
