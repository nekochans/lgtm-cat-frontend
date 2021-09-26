import React from 'react';
import Script from 'next/script';
import { gaMeasurementId } from '../infrastructures/utils/gtag';

const GoogleAnalytics: React.FC = () => (
  <>
    <Script
      defer
      src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      strategy="afterInteractive"
    />
    <Script id="ga" defer strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaMeasurementId}', {
          page_path: window.location.pathname,
        });
      `}
    </Script>
  </>
);

export default GoogleAnalytics;
