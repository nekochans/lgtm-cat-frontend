import { httpStatusCode } from '@/constants';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockUnauthorizedError: ResponseResolver = () => {
  return HttpResponse.json(
    { code: httpStatusCode.unauthorized, message: 'Unauthorized' },
    { status: httpStatusCode.unauthorized, statusText: 'Unauthorized' },
  );
};
