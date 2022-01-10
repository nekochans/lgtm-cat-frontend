import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import {
  LgtmImage,
  LgtmImages,
  UploadedImage,
} from '../../../domain/types/lgtmImage';
import { UploadCatImageRequest } from '../../../domain/repositories/imageRepository';
import { fetchLgtmImagesUrl, uploadCatImageUrl } from '../../../constants/url';
import { issueAccessToken } from '../../../infrastructures/repositories/api/fetch/authTokenRepository';
import { isSuccessResult } from '../../../domain/repositories/repositoryResult';

type FetchLgtmImagesResponse = {
  lgtmImages?: LgtmImage[];
  error?: {
    code: number;
    message: string;
  };
};

export type UploadedImageResponse = {
  imageUrl?: string;
  error?: {
    code: number;
    message: string;
  };
};

const fetchLgtmImages = async (
  res: NextApiResponse<FetchLgtmImagesResponse>,
) => {
  const accessTokenResult = await issueAccessToken();
  if (isSuccessResult(accessTokenResult)) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessTokenResult.value.jwtString}`,
      },
    };

    const response = await fetch(fetchLgtmImagesUrl(), options);
    if (!response.ok) {
      return res
        .status(500)
        .json({ error: { code: 500, message: 'Internal Server Error' } });
    }

    const lgtmImages = (await response.json()) as LgtmImages;

    return res.status(200).json(lgtmImages);
  }

  return res
    .status(500)
    .json({ error: { code: 500, message: 'IssueAccessTokenError' } });
};

const uploadCatImageIssueAccessTokenErrorResponse = (
  res: NextApiResponse<UploadedImageResponse>,
) =>
  res
    .status(500)
    .json({ error: { code: 500, message: 'IssueAccessTokenError' } });

const createUploadCatImageErrorResponse = (
  res: NextApiResponse<UploadedImageResponse>,
  fetchResponse: Response,
) => {
  switch (fetchResponse.status) {
    case 413:
      return res.status(413).json({
        error: { code: 413, message: 'UploadCatImageSizeTooLargeError' },
      });
    case 422:
      return res.status(422).json({
        error: { code: 422, message: 'UploadCatImageValidationError' },
      });
    default:
      return res
        .status(500)
        .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
};

const uploadCatImage = async (
  req: NextApiRequest,
  res: NextApiResponse<UploadedImageResponse>,
) => {
  const requestBody = req.body as UploadCatImageRequest;

  const accessTokenResult = await issueAccessToken();

  if (isSuccessResult(accessTokenResult)) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessTokenResult.value.jwtString}`,
      },
      body: JSON.stringify({
        image: requestBody.image,
        imageExtension: requestBody.imageExtension,
      }),
    };

    const response = await fetch(uploadCatImageUrl(), options);
    if (response.status !== 202) {
      return createUploadCatImageErrorResponse(res, response);
    }

    const responseBody = (await response.json()) as UploadedImage;

    return res.status(202).json({ imageUrl: responseBody.imageUrl });
  }

  return uploadCatImageIssueAccessTokenErrorResponse(res);
};

const methodNotAllowedErrorResponse = (
  res: NextApiResponse<FetchLgtmImagesResponse | UploadedImageResponse>,
) =>
  res.status(405).json({ error: { code: 405, message: 'Method Not Allowed' } });

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<FetchLgtmImagesResponse | UploadedImageResponse>,
): Promise<void> => {
  switch (req.method) {
    case 'GET': {
      return fetchLgtmImages(res);
    }
    case 'POST': {
      const response = await uploadCatImage(req, res);

      return response;
    }
    default: {
      return methodNotAllowedErrorResponse(res);
    }
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default handler;
