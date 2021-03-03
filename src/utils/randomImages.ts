import { Image } from '../domain/image';

const extractRandomImages = (arr: Image[], n: number): Image[] => {
  const copy = [...arr];
  const ret = [];

  for (let i = n; i > 0; i -= 1) {
    const rand = Math.floor(Math.random() * (copy.length + 1)) - 1;
    ret.push(...copy.splice(rand, 1));
  }

  return ret;
};

export default extractRandomImages;
