import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

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
