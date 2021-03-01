import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import imageData from '../../../utils/imageData';

type Images = { id: number; url: string };

type ImagesResponse = {
  images?: Images[];
  error?: {
    code: number;
    message: string;
  };
};

const imageLength = 9;

const getImages = (arr: Images[], n: number): Images[] => {
  const copy = [...arr];
  const ret = [];

  for (let i = n; i > 0; i -= 1) {
    const rand = Math.floor(Math.random() * (copy.length + 1)) - 1;
    ret.push(...copy.splice(rand, 1));
  }

  return ret;
};

const handler: NextApiHandler = (
  _req: NextApiRequest,
  res: NextApiResponse<ImagesResponse>,
): void => {
  const randomImages = getImages(imageData, imageLength);
  const imagesResponse = {
    images: randomImages,
  };

  return res.status(200).json(imagesResponse);
};

export default handler;
