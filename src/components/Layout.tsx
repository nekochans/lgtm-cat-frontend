import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from './Footer';
import Header from './Header';

type Props = {
  children: ReactNode;
  title: string;
};

const Layout: React.FC<Props> = ({ children, title }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Header />
    {children}
    <Footer
      termsLink={
        <Link href="/terms">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>利用規約</a>
        </Link>
      }
      privacyLink={
        <Link href="/privacy">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>プライバシーポリシー</a>
        </Link>
      }
    />
  </div>
);

export default Layout;
