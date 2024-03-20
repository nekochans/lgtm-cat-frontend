import {
  isFetchLgtmImagesResponseBody,
  issueClientCredentialsAccessToken,
} from '@/api';
import {
  FetchLgtmImagesError,
  lgtmeowApiUrl,
  type LgtmImage,
} from '@/features';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (): Promise<Response> => {
  const accessToken = await issueClientCredentialsAccessToken();

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(
    `${lgtmeowApiUrl()}/lgtm-images/recently-created`,
    options,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const responseBody = (await response.json()) as unknown;
  if (isFetchLgtmImagesResponseBody(responseBody)) {
    const lgtmImages = responseBody.lgtmImages.map((value) => {
      return {
        id: Number(value.id),
        imageUrl: value.url,
      } as const satisfies LgtmImage;
    });

    return Response.json(lgtmImages);
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  throw new FetchLgtmImagesError(
    `src/app/api/lgtm-images/recently-created/route.ts response body is invalid ${response.status} ${response.statusText}`,
    {
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      responseBody,
    },
  );
};
