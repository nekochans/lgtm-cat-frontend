import 'ress/ress.css';
import '../../styles/globals.css';
import '../../styles/markdown.css';
import { GoogleTagManager } from '@/components';
import {
  appBaseUrl,
  appName,
  convertLocaleToLanguage,
  i18nUrlList,
  metaTagList,
} from '@/features';
import { googleTagManagerId } from '@/utils';
import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const language = 'en';

export const metadata: Metadata = {
  title: metaTagList(language).top.title,
  description: metaTagList(language).top.description,
  openGraph: {
    title: metaTagList(language).top.title,
    description: metaTagList(language).top.description,
    url: metaTagList(language).top.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).top.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).top.title,
      },
    ],
    locale: convertLocaleToLanguage(language),
    type: 'website',
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.top.en,
    languages: {
      ja: i18nUrlList.top.ja,
      en: i18nUrlList.top.en,
    },
  },
};

const InternationalizationLayout = ({ children }: Props): JSX.Element => {
  return (
    <html lang={language}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP&family=Roboto&family=Zen+Kaku+Gothic+New&display=swap"
          rel="stylesheet"
        />
      </head>
      <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
      <body>{children}</body>
    </html>
  );
};

export default InternationalizationLayout;
