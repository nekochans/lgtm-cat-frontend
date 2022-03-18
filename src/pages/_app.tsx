import '../../styles/styles.scss';
import { AppProps } from 'next/app';

import GoogleTagManager from '../components/GoogleTagManager';
import { googleTagManagerId } from '../infrastructures/utils/gtm';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </>
);

export default App;
