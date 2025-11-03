import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImageNotModerationImage: ResponseResolver =
  () =>
    HttpResponse.json(
      {
        isAcceptableCatImage: false,
        notAcceptableReason: "not moderation image",
      },
      { status: httpStatusCode.ok, statusText: "OK" }
    );
