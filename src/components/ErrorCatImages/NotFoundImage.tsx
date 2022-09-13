import Image from 'next/image';

import notFound from './images/not_found.webp';

import type { FC } from 'react';

export const NotFoundImage: FC = () => (
  <Image
    src={notFound.src}
    layout="fill"
    objectFit="contain"
    alt="404 Not Found"
    priority={true}
  />
);
