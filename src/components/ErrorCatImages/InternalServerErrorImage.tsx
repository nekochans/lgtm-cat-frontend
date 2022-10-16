import type { FC } from 'react';
import Image from 'next/future/image';

import internalServerError from './images/internal_server_error.webp';

export const InternalServerErrorImage: FC = () => (
  <Image
    src={internalServerError.src}
    style={{ objectFit: 'contain' }}
    sizes="100vw"
    fill
    alt="500 Internal Server Error"
    priority={true}
  />
);
