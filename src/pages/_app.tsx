import type { AppProps } from 'next/app';
import { GoogleTagManager } from '@/components';
import { googleTagManagerId } from '@/utils';

import 'ress/ress.css';
import '../styles/markdown.css';
import '@nekochans/lgtm-cat-ui/style.css';

const CustomApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </>
);

export default CustomApp;
