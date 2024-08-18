import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImageNotModerationImage: ResponseResolver =
  () => {
    return HttpResponse.json(
      {
        isAcceptableCatImage: false,
        notAcceptableReason: 'not moderation image',
      },
      { status: httpStatusCode.ok, statusText: 'OK' },
    );
  };
