import Image from 'next/image';
import type { FC } from 'react';
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
