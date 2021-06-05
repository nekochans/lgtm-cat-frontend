import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import SimpleHeader from '../components/SimpleHeader';
import { pathList } from '../constants/url';
import { MetaTag } from '../constants/metaTag';

type Props = {
  children: ReactNode;
  metaTag: MetaTag;
};

const SimpleLayout: React.FC<Props> = ({ children, metaTag }: Props) => (
  <div className="hero is-fullheight">
    <Head>
      <title>{metaTag.title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta property="og:title" content={metaTag.title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={metaTag.ogpImgUrl} />
      <meta property="og:url" content={metaTag.ogpTargetUrl} />
      <meta property="og:site_name" content={metaTag.title} />
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

export default SimpleLayout;
