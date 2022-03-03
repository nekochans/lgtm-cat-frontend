/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  cognitoTokenEndpointUrl,
  fetchLgtmImagesUrl,
} from '../../../../../../constants/url';
import FetchLgtmImagesInRandomAuthError from '../../../../../../domain/errors/FetchLgtmImagesInRandomAuthError';
import FetchLgtmImagesInRandomError from '../../../../../../domain/errors/FetchLgtmImagesInRandomError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockTokenEndpoint from '../../../../../../mocks/api/external/cognito/mockTokenEndpoint';
import mockFetchLgtmImages from '../../../../../../mocks/api/external/lgtmeow/mockFetchLgtmImages';
import fetchLgtmImagesMockBody from '../../../../../../mocks/api/fetchLgtmImagesMockBody';
import { fetchLgtmImagesInRandomWithServer } from '../../imageRepository';

const mockHandlers = [
  rest.post(cognitoTokenEndpointUrl(), mockTokenEndpoint),
  rest.get(fetchLgtmImagesUrl(), mockFetchLgtmImages),
];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('imageRepository.ts fetchLgtmImagesInRandomWithServer TestCases', () => {
  beforeAll(() => {
    mockServer.listen();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  // eslint-disable-next-line max-lines-per-function
  it('should be able to fetch LGTM Images', async () => {
    const expected = fetchLgtmImagesMockBody;
    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeTruthy();
    expect(lgtmImagesResponse.value).toStrictEqual(expected);
  });

  it('should return an FetchLgtmImagesInRandomAuthError because Failed to issueAccessToken', async () => {
    mockServer.use(
      rest.post(cognitoTokenEndpointUrl(), mockInternalServerError),
    );

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomAuthError(),
    );
  });

  it('should return an FetchLgtmImagesInRandomError because Failed to fetch LGTM Images', async () => {
    mockServer.use(
      rest.post(cognitoTokenEndpointUrl(), mockTokenEndpoint),
      rest.get(fetchLgtmImagesUrl(), mockInternalServerError),
    );

    const lgtmImagesResponse = await fetchLgtmImagesInRandomWithServer();

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesInRandomError(),
    );
  });
});
