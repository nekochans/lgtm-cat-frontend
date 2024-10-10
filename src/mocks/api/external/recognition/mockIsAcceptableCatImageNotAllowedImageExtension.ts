import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImageNotAllowedImageExtension: ResponseResolver
  = () => {
    return HttpResponse.json(
      {
        isAcceptableCatImage: false,
        notAcceptableReason: 'not an allowed image extension',
      },
      { status: httpStatusCode.ok, statusText: 'OK' },
    );
  };
