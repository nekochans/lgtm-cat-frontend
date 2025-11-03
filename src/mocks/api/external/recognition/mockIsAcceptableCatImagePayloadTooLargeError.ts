import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImagePayloadTooLargeError: ResponseResolver =
  () =>
    HttpResponse.json(null, {
      status: httpStatusCode.payloadTooLarge,
      statusText: "Payload Too Large",
    });
