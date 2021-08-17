import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import imageData from '../../../infrastructures/utils/imageData';
import extractRandomImages from '../../../infrastructures/utils/randomImages';
import { UploadedImage } from '../../../domain/types/image';
import { UploadCatImageRequest } from '../../../domain/repositories/imageRepository';
import { uploadCatImageUrl } from '../../../constants/url';
import { issueAccessToken } from '../../../infrastructures/repositories/api/fetch/authTokenRepository';
import { isSuccessResult } from '../../../domain/repositories/repositoryResult';

type Image = { id: number; url: string };

type ImagesResponse = {
  images?: Image[];
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

const imageLength = 9;

const fetchLgtmImages = (res: NextApiResponse<ImagesResponse>) => {
  const randomImages = extractRandomImages(imageData, imageLength);
  const imagesResponse = {
    images: randomImages,
  };

  return res.status(200).json(imagesResponse);
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
  res: NextApiResponse<ImagesResponse | UploadedImageResponse>,
) =>
  res.status(405).json({ error: { code: 405, message: 'Method Not Allowed' } });

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImagesResponse | UploadedImageResponse>,
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
