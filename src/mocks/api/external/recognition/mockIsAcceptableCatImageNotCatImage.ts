import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImageNotCatImage: ResponseResolver = () => {
  return HttpResponse.json(
    {
      isAcceptableCatImage: false,
      notAcceptableReason: 'not cat image',
    },
    { status: httpStatusCode.ok, statusText: 'OK' },
  );
};
