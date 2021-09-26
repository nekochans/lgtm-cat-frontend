import '../../styles/styles.scss';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import GoogleAnalytics from '../components/GoogleAnalytics';

import * as gtag from '../infrastructures/utils/gtag';
import { AppStateProvider } from '../stores/contexts/AppStateContext';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AppStateProvider>
      <GoogleAnalytics />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </AppStateProvider>
  );
};

export default App;
