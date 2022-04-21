/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { fetchLgtmImagesUrl } from '../../../../../../constants/url';
import FetchLgtmImagesAuthError from '../../../../../../domain/errors/FetchLgtmImagesAuthError';
import FetchLgtmImagesError from '../../../../../../domain/errors/FetchLgtmImagesError';
import { isSuccessResult } from '../../../../../../domain/repositories/repositoryResult';
import mockInternalServerError from '../../../../../../mocks/api/error/mockInternalServerError';
import mockUnauthorizedError from '../../../../../../mocks/api/error/mockUnauthorizedError';
import mockFetchLgtmImages from '../../../../../../mocks/api/external/lgtmeow/mockFetchLgtmImages';
import fetchLgtmImagesMockBody from '../../../../../../mocks/api/fetchLgtmImagesMockBody';
import { fetchLgtmImagesInRandom } from '../../imageRepository';

const mockHandlers = [rest.get(fetchLgtmImagesUrl(), mockFetchLgtmImages)];

const mockServer = setupServer(...mockHandlers);

// eslint-disable-next-line max-lines-per-function
describe('imageRepository.ts fetchLgtmImagesInRandom TestCases', () => {
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
    const lgtmImagesResponse = await fetchLgtmImagesInRandom({
      accessToken: { jwtString: '' },
    });

    expect(isSuccessResult(lgtmImagesResponse)).toBeTruthy();
    expect(lgtmImagesResponse.value).toStrictEqual(expected);
  });

  it('should return an FetchLgtmImagesAuthError because the accessToken is invalid', async () => {
    mockServer.use(rest.get(fetchLgtmImagesUrl(), mockUnauthorizedError));

    const lgtmImagesResponse = await fetchLgtmImagesInRandom({
      accessToken: { jwtString: '' },
    });

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(
      new FetchLgtmImagesAuthError(),
    );
  });

  it('should return an FetchLgtmImagesError because Failed to fetch LGTM Images', async () => {
    mockServer.use(rest.get(fetchLgtmImagesUrl(), mockInternalServerError));

    const lgtmImagesResponse = await fetchLgtmImagesInRandom({
      accessToken: { jwtString: '' },
    });

    expect(isSuccessResult(lgtmImagesResponse)).toBeFalsy();
    expect(lgtmImagesResponse.value).toStrictEqual(new FetchLgtmImagesError());
  });
});
