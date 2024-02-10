import { httpStatusCode } from '@/constants';
import { fetchLgtmImagesMockBody } from '@/mocks';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockFetchLgtmImages: ResponseResolver = () => {
  return HttpResponse.json(fetchLgtmImagesMockBody, {
    status: httpStatusCode.ok,
    statusText: 'OK',
  });
};
