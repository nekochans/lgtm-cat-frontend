import extractRandomImages from '../randomImages';
import { Image } from '../../../domain/types/image';

const testImageList: Image[] = [
  {
    id: 1,
    url: '/cat.jpeg',
  },
  {
    id: 2,
    url: '/cat2.jpeg',
  },
  {
    id: 3,
    url: '/cat.jpeg',
  },
  {
    id: 4,
    url: '/cat2.jpeg',
  },
  {
    id: 5,
    url: '/cat.jpeg',
  },
  {
    id: 6,
    url: '/cat.jpeg',
  },
  {
    id: 7,
    url: '/cat2.jpeg',
  },
  {
    id: 8,
    url: '/cat.jpeg',
  },
  {
    id: 9,
    url: '/cat2.jpeg',
  },
  {
    id: 10,
    url: '/cat2.jpeg',
  },
];

describe('randomImages.ts Functions TestCases', () => {
  it('should return array of size 9 ', () => {
    const result = extractRandomImages(testImageList, 9);
    const expectedLength = 9;

    expect(result.length).toStrictEqual(expectedLength);
  });
});
