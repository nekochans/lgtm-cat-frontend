import '../../styles/styles.scss';
import { AppProps } from 'next/app';

import GoogleTagManager from '../components/GoogleTagManager';
import { googleTagManagerId } from '../infrastructures/utils/gtm';
import { AppStateProvider } from '../stores/contexts/AppStateContext';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <AppStateProvider>
    <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </AppStateProvider>
);

export default App;
