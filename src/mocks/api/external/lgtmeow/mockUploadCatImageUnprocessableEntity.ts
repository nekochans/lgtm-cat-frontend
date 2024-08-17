import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockUploadCatImageUnprocessableEntity: ResponseResolver = () => {
  return HttpResponse.json(
    {
      error: {
        code: httpStatusCode.unprocessableEntity,
        message: 'UploadCatImageValidationError',
      },
    },
    {
      status: httpStatusCode.unprocessableEntity,
      statusText: 'Unprocessable Entity',
    },
  );
};
