import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockUploadCatImagePayloadTooLarge: ResponseResolver = () =>
  HttpResponse.json(
    {
      error: {
        code: httpStatusCode.payloadTooLarge,
        message: "UploadCatImageSizeTooLargeError",
      },
    },
    { status: httpStatusCode.payloadTooLarge, statusText: "Payload Too Large" }
  );
