import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import imageData from '../../../infrastructures/utils/imageData';
import extractRandomImages from '../../../infrastructures/utils/randomImages';
import { UploadedImage } from '../../../domain/types/image';
import { UploadCatImageRequest } from '../../../domain/repositories/imageRepository';
import { uploadCatImageUrl } from '../../../constants/url';
import { issueAccessToken } from '../../../infrastructures/repositories/api/fetch/authTokenRepository';

type Image = { id: number; url: string };

type ImagesResponse = {
  images?: Image[];
  error?: {
    code: number;
    message: string;
  };
};

export type UploadedImageResponse = UploadedImage & {
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

const uploadCatImage = async (
  req: NextApiRequest,
  res: NextApiResponse<UploadedImageResponse>,
) => {
  const requestBody = req.body as UploadCatImageRequest;

  const accessToken = await issueAccessToken();

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.jwtString}`,
    },
    body: JSON.stringify({
      image: requestBody.image,
      imageExtension: requestBody.imageExtension,
    }),
  };

  const response = await fetch(uploadCatImageUrl(), options);

  const responseBody = (await response.json()) as UploadedImage;

  return res.status(202).json({ imageUrl: responseBody.imageUrl });
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
      sizeLimit: '6mb',
    },
  },
};

export default handler;
