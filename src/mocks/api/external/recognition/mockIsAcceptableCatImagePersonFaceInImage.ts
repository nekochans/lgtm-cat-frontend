import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";

export const mockIsAcceptableCatImagePersonFaceInImage: ResponseResolver = () =>
  HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: "person face in the image",
    },
    { status: httpStatusCode.ok, statusText: "OK" }
  );
