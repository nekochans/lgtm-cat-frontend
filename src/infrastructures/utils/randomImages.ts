/* eslint-disable no-magic-numbers, id-length */
import { LgtmImage } from '../../domain/types/lgtmImage';

const extractRandomImages = (
  arr: LgtmImage[],
  numberToExtract: number,
): LgtmImage[] => {
  const copy = [...arr];
  const ret = [];

  for (let i = numberToExtract; i > 0; i -= 1) {
    const rand = Math.floor(Math.random() * (copy.length + 1)) - 1;
    ret.push(...copy.splice(rand, 1));
  }

  return ret;
};

export default extractRandomImages;
