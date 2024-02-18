import 'ress/ress.css';
import '../styles/globals.css';
import '../styles/markdown.css';
import { GoogleTagManager } from '@/components';
import { metaTagList } from '@/features';
import { googleTagManagerId } from '@/utils';
import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: metaTagList('ja').top.title,
  description: metaTagList('ja').top.description,
};

const RootLayout = ({ children }: Props): JSX.Element => {
  return (
    <html lang="ja" prefix="og: https://ogp.me/ns#">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP&family=Roboto&family=Zen+Kaku+Gothic+New&display=swap"
          rel="stylesheet"
        />
        <title>{metaTagList('ja').top.title}</title>
      </head>
      <GoogleTagManager googleTagManagerId={googleTagManagerId()} />
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
