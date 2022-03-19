import Head from 'next/head';
import Link from 'next/link';
import React, { ReactNode } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { MetaTag } from '../constants/metaTag';
import { pathList } from '../constants/url';

type Props = {
  children: ReactNode;
  metaTag: MetaTag;
};

const DefaultLayout: React.FC<Props> = ({ children, metaTag }: Props) => (
  <div className="hero is-fullheight">
    <Head>
      <title>{metaTag.title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta property="og:title" content={metaTag.title} />
      <meta property="og:description" content={metaTag.description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={metaTag.ogpImgUrl} />
      <meta property="og:url" content={metaTag.ogpTargetUrl} />
      <meta property="og:site_name" content={metaTag.title} />
    </Head>
    <Header
      topLink={
        <Link href={pathList.top}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="navbar-item">
            <p className="is-size-4 has-text-black">LGTMeow</p>
          </a>
        </Link>
      }
      uploadLink={
        <Link href={pathList.upload}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="button" style={{ margin: '0.5rem 0.75rem' }}>
            <p className="has-text-gray">猫ちゃん画像をアップロード</p>
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

export default DefaultLayout;
