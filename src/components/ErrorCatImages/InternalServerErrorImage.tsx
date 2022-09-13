import Image from 'next/image';

import internalServerError from './images/internal_server_error.webp';

import type { FC } from 'react';

export const InternalServerErrorImage: FC = () => (
  <Image
    src={internalServerError.src}
    layout="fill"
    objectFit="contain"
    alt="500 Internal Server Error"
    priority={true}
  />
);
