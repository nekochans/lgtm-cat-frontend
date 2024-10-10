import { httpStatusCode } from '@/constants/httpStatusCode';
import { fetchLgtmImagesMockBody } from '@/mocks/api/fetchLgtmImagesMockBody';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockFetchLgtmImages: ResponseResolver = () => {
  return HttpResponse.json(fetchLgtmImagesMockBody.lgtmImages, {
    status: httpStatusCode.ok,
    statusText: 'OK',
  });
};
