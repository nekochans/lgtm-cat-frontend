import { httpStatusCode } from '@/constants';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockInternalServerError: ResponseResolver = () => {
  return HttpResponse.json(
    {
      code: httpStatusCode.internalServerError,
      message: 'Internal Server Error',
    },
    {
      status: httpStatusCode.internalServerError,
      statusText: 'Internal Server Error',
    },
  );
};
