import { httpStatusCode } from '@/constants';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImageError: ResponseResolver = () => {
  return HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: 'an error has occurred',
    },
    { status: httpStatusCode.ok, statusText: 'OK' },
  );
};
