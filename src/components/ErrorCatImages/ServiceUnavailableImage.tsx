import type { FC } from 'react';
import Image from 'next/future/image';

import serviceUnavailable from './images/service_unavailable.webp';

export const ServiceUnavailableImage: FC = () => (
  <Image
    src={serviceUnavailable.src}
    style={{ objectFit: 'contain' }}
    sizes="100vw"
    fill
    alt="503 Service Unavailable"
    priority={true}
  />
);
