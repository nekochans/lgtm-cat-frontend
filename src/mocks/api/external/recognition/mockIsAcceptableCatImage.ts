import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImage: ResponseResolver = () => {
  return HttpResponse.json(
    {
      isAcceptableCatImage: true,
    },
    { status: httpStatusCode.ok, statusText: 'OK' },
  );
};
