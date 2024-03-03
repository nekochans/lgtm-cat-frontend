import Image from 'next/image';
import { type JSX } from 'react';
import calmCat from './images/calm-cat.webp';

export const CalmCatImage = (): JSX.Element => (
  <Image
    src={calmCat.src}
    width={302}
    height={302}
    alt="CalmCat"
    priority={true}
  />
);
