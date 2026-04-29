import { HttpResponse, type ResponseResolver } from "msw";
import { httpStatusCode } from "@/constants/http-status-code";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";

export const mockFetchLgtmImages: ResponseResolver = () =>
  HttpResponse.json(fetchLgtmImagesMockBody, {
    status: httpStatusCode.ok,
    statusText: "OK",
  });
