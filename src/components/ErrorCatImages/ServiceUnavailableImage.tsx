import Image from 'next/image';

import serviceUnavailable from './images/service_unavailable.webp';

import type { FC } from 'react';

export const ServiceUnavailableImage: FC = () => (
  <Image
    src={serviceUnavailable.src}
    layout="fill"
    objectFit="contain"
    alt="503 Service Unavailable"
    priority={true}
  />
);
