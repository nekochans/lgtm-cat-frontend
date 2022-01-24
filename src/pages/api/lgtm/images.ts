import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { httpStatusCode } from '../../../constants/httpStatusCode';
import { fetchLgtmImagesUrl, uploadCatImageUrl } from '../../../constants/url';
import { UploadCatImageRequest } from '../../../domain/repositories/imageRepository';
import { isSuccessResult } from '../../../domain/repositories/repositoryResult';
import {
  LgtmImage,
  LgtmImages,
  UploadedImage,
} from '../../../domain/types/lgtmImage';
import { issueAccessToken } from '../../../infrastructures/repositories/api/fetch/authTokenRepository';

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
      return res.status(httpStatusCode.internalServerError).json({
        error: {
          code: httpStatusCode.internalServerError,
          message: 'Internal Server Error',
        },
      });
    }

    const lgtmImages = (await response.json()) as LgtmImages;

    return res.status(httpStatusCode.ok).json(lgtmImages);
  }

  return res.status(httpStatusCode.internalServerError).json({
    error: {
      code: httpStatusCode.internalServerError,
      message: 'IssueAccessTokenError',
    },
  });
};

const uploadCatImageIssueAccessTokenErrorResponse = (
  res: NextApiResponse<UploadedImageResponse>,
) =>
  res.status(httpStatusCode.internalServerError).json({
    error: {
      code: httpStatusCode.internalServerError,
      message: 'IssueAccessTokenError',
    },
  });

const createUploadCatImageErrorResponse = (
  res: NextApiResponse<UploadedImageResponse>,
  fetchResponse: Response,
) => {
  switch (fetchResponse.status) {
    case httpStatusCode.payloadTooLarge:
      return res.status(httpStatusCode.payloadTooLarge).json({
        error: {
          code: httpStatusCode.payloadTooLarge,
          message: 'UploadCatImageSizeTooLargeError',
        },
      });
    case httpStatusCode.unprocessableEntity:
      return res.status(httpStatusCode.unprocessableEntity).json({
        error: {
          code: httpStatusCode.unprocessableEntity,
          message: 'UploadCatImageValidationError',
        },
      });
    default:
      return res.status(httpStatusCode.internalServerError).json({
        error: {
          code: httpStatusCode.internalServerError,
          message: 'Internal Server Error',
        },
      });
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
    if (response.status !== httpStatusCode.accepted) {
      return createUploadCatImageErrorResponse(res, response);
    }

    const responseBody = (await response.json()) as UploadedImage;

    return res
      .status(httpStatusCode.accepted)
      .json({ imageUrl: responseBody.imageUrl });
  }

  return uploadCatImageIssueAccessTokenErrorResponse(res);
};

const methodNotAllowedErrorResponse = (
  res: NextApiResponse<FetchLgtmImagesResponse | UploadedImageResponse>,
) =>
  res.status(httpStatusCode.methodNotAllowed).json({
    error: {
      code: httpStatusCode.methodNotAllowed,
      message: 'Method Not Allowed',
    },
  });

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
