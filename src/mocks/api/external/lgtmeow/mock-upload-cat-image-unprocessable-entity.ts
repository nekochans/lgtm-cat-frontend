import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";

export const mockUploadCatImageUnprocessableEntity: ResponseResolver = () =>
  HttpResponse.json(
    {
      error: {
        code: httpStatusCode.unprocessableEntity,
        message: "UploadCatImageValidationError",
      },
    },
    {
      status: httpStatusCode.unprocessableEntity,
      statusText: "Unprocessable Entity",
    }
  );
