import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImageNotAllowedImageExtension: ResponseResolver =
  () =>
    HttpResponse.json(
      {
        isAcceptableCatImage: false,
        notAcceptableReason: "not an allowed image extension",
      },
      { status: httpStatusCode.ok, statusText: "OK" }
    );
