import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImagePersonFaceInImage: ResponseResolver
  = () => {
    return HttpResponse.json(
      {
        isAcceptableCatImage: false,
        notAcceptableReason: 'person face in the image',
      },
      { status: httpStatusCode.ok, statusText: 'OK' },
    );
  };
