import type { Language, MetaTag, Url } from '@/features';
import Head from 'next/head';
import type { FC, ReactNode } from 'react';

type Props = {
  metaTag: MetaTag;
  children: ReactNode;
  canonicalLink?: Url;
  alternateUrls?: Array<{
    hreflang: Language;
    link?: Url;
  }>;
};

export const DefaultLayout: FC<Props> = ({
  metaTag,
  children,
  canonicalLink,
  alternateUrls,
}) => (
  <>
    <Head>
      <title>{metaTag.title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      {metaTag.description != null ? (
        <meta name="description" content={metaTag.description} />
      ) : (
        ''
      )}
      <meta property="og:title" content={metaTag.title} />
      <meta property="og:description" content={metaTag.description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={metaTag.ogpImgUrl} />
      <meta property="og:url" content={metaTag.ogpTargetUrl} />
      <meta property="og:site_name" content={metaTag.title} />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicons/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicons/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicons/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicons/site.webmanifest" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
      <meta name="theme-color" content="#ffffff" />
      {canonicalLink != null ? (
        <link rel="canonical" href={canonicalLink} />
      ) : (
        ''
      )}
      {alternateUrls?.map((alternateUrl, index) => (
        <link
          rel="alternate"
          hrefLang={alternateUrl.hreflang}
          href={alternateUrl.link}
          key={index}
        />
      ))}
    </Head>
    {children}
  </>
);
