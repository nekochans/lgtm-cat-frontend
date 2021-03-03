import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import imageData from '../../../utils/imageData';
import extractRandomImages from '../../../utils/randomImages';

type Image = { id: number; url: string };

type ImagesResponse = {
  images?: Image[];
  error?: {
    code: number;
    message: string;
  };
};

const imageLength = 9;

const handler: NextApiHandler = (
  _req: NextApiRequest,
  res: NextApiResponse<ImagesResponse>,
): void => {
  const randomImages = extractRandomImages(imageData, imageLength);
  const imagesResponse = {
    images: randomImages,
  };

  return res.status(200).json(imagesResponse);
};

export default handler;
