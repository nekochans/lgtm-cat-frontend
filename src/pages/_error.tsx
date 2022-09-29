import * as Sentry from '@sentry/nextjs';
import type { NextPage } from 'next';
import NextErrorComponent, { type ErrorProps } from 'next/error';

// このComponentは https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/ を参考にして実装した
const CustomErrorComponent: NextPage<ErrorProps> = (props) => (
  <NextErrorComponent statusCode={props.statusCode} />
);

CustomErrorComponent.getInitialProps = async (context) => {
  await Sentry.captureUnderscoreErrorException(context);

  return await NextErrorComponent.getInitialProps(context);
};

export default CustomErrorComponent;
