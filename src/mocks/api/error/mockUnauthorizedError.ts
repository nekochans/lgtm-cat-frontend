import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockUnauthorizedError: ResponseResolver = () =>
  HttpResponse.json(
    { code: httpStatusCode.unauthorized, message: "Unauthorized" },
    { status: httpStatusCode.unauthorized, statusText: "Unauthorized" }
  );
