import { httpStatusCode } from '@/constants/httpStatusCode';
import { HttpResponse, type ResponseResolver } from 'msw';

export const mockUploadCatImage: ResponseResolver = () => {
  return HttpResponse.json(
    {
      createdLgtmImageUrl:
        'https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp',
    },
    { status: httpStatusCode.accepted, statusText: 'Accepted' },
  );
};
