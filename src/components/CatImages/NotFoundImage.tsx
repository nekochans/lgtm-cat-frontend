import Image from 'next/image';
import type { FC } from 'react';
import notFound from './images/not_found.webp';

export const NotFoundImage: FC = () => (
  <Image
    src={notFound.src}
    style={{ objectFit: 'contain' }}
    sizes="100vw"
    fill
    alt="404 Not Found"
    priority={true}
  />
);
