import { GoogleTagManager } from '../components';
import { googleTagManagerId } from '../utils';

import type { AppProps } from 'next/app';
import 'ress/ress.css';
import '../styles/markdown.css';

const CustomApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </>
);

export default CustomApp;
