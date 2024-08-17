import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockUploadCatImagePayloadTooLarge: ResponseResolver = () => {
  return HttpResponse.json(
    {
      error: {
        code: httpStatusCode.payloadTooLarge,
        message: 'UploadCatImageSizeTooLargeError',
      },
    },
    { status: httpStatusCode.payloadTooLarge, statusText: 'Payload Too Large' },
  );
};
