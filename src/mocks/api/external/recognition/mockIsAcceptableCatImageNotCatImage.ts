import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImageNotCatImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: "not cat image",
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
