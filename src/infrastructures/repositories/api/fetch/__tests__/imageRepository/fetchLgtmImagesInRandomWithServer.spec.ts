import fetchMock from 'fetch-mock-jest';

import {
  cognitoTokenEndpointUrl,
  fetchLgtmImagesUrl,
} from '../../../../../../constants/url';
import FetchLgtmImagesInRandomAuthError from '../../../../../../domain/errors/FetchLgtmImagesInRandomAuthError';
import FetchLgtmImagesInRandomError from '../../../../../../domain/errors/FetchLgtmImagesInRandomError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import { fetchLgtmImagesInRandomWithServer } from '../../imageRepository';

// eslint-disable-next-line max-lines-per-function
describe('imageRepository.ts fetchLgtmImagesInRandomWithServer TestCases', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  // eslint-disable-next-line max-lines-per-function
  it('should be able to fetch LGTM Images', async () => {
    const fetchLgtmImagesMockBody = {
      lgtmImages: [
        {
          id: 1,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp',
        },
        {
          id: 2,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/00/98f86ac2-7227-44dd-bfc9-1d424b45813d.webp',
        },
        {
          id: 3,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/00/bf3bbfb8-56d3-453d-811c-0f5fd9dfa4d0.webp',
        },
        {
          id: 4,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/00/44dc9b25-a0df-4726-a2bd-fccb1e0e832e.webp',
        },
        {
          id: 5,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/00/62b7b519-9811-4e05-8c39-3c6dbab0a42d.webp',
        },
        {
          id: 6,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/01/6c7ab983-4aa1-4af4-ab37-f1327899cc26.webp',
        },
        {
          id: 7,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/01/e549cf62-c8e2-4729-af9e-b35e27bb34e3.webp',
        },
        {
          id: 8,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/01/e62cf588-057c-43a1-82a0-035d7c0e67bf.webp',
        },
        {
          id: 9,
          url: 'https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp',
        },
      ],
    };

    const issueAccessTokenMockBody = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    fetchMock
      .post(cognitoTokenEndpointUrl(), {
        status: 200,
        body: issueAccessTokenMockBody,
      })
      .get(fetchLgtmImagesUrl(), {
        status: 200,
        body: fetchLgtmImagesMockBody,
      });

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeTruthy();
    expect(lgtmImagesResponse.value).toStrictEqual(fetchLgtmImagesMockBody);
  });

  it('should return an FetchLgtmImagesInRandomAuthError because Failed to issueAccessToken', async () => {
    const mockBody = { message: 'Internal Server Error' };

    fetchMock.post(cognitoTokenEndpointUrl(), { status: 500, body: mockBody });

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomAuthError(),
    );
  });

  it('should return an FetchLgtmImagesInRandomError because Failed to fetch LGTM Images', async () => {
    const mockBody = { message: 'Internal Server Error' };

    const issueAccessTokenMockBody = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    fetchMock
      .post(cognitoTokenEndpointUrl(), {
        status: 200,
        body: issueAccessTokenMockBody,
      })
      .get(fetchLgtmImagesUrl(), { status: 500, body: mockBody });

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomError(),
    );
  });
});
