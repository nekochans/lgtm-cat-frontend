import { Head, Html, Main, NextScript } from 'next/document';

const CustomDocument = (): JSX.Element => {
  return (
    <Html prefix="og: https://ogp.me/ns#">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP&family=Roboto&family=Zen+Kaku+Gothic+New&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default CustomDocument;
