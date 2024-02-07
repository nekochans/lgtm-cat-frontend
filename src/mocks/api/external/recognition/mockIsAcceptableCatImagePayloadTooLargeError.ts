import { httpStatusCode } from '@/constants';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockIsAcceptableCatImagePayloadTooLargeError: ResponseResolver =
  () => {
    return HttpResponse.json(null, {
      status: httpStatusCode.payloadTooLarge,
      statusText: 'Payload Too Large',
    });
  };
