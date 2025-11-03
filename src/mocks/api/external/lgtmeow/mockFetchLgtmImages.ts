import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/httpStatusCode";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetchLgtmImagesMockBody";

export const mockFetchLgtmImages: ResponseResolver = () =>
  HttpResponse.json(fetchLgtmImagesMockBody.lgtmImages, {
    status: httpStatusCode.ok,
    statusText: "OK",
  });
