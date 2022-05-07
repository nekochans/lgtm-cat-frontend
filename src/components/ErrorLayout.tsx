import Head from 'next/head';
import Link from 'next/link';

import { pathList } from '../constants/url';

import Footer from './Footer';
import SimpleHeader from './SimpleHeader';

import type { VFC, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: string;
};

const ErrorLayout: VFC<Props> = ({ children, title }) => (
  <div className="hero is-fullheight">
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="robots" content="noindex" />
    </Head>
    <SimpleHeader
      topLink={
        <Link href={pathList.top}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="navbar-item">
            <p className="is-size-4 has-text-black">LGTMeow</p>
          </a>
        </Link>
      }
    />
    {children}
    <Footer
      termsLink={
        <Link href={pathList.terms}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>利用規約</a>
        </Link>
      }
      privacyLink={
        <Link href={pathList.privacy}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>プライバシーポリシー</a>
        </Link>
      }
    />
  </div>
);

export default ErrorLayout;
