// 絶対厳守：編集前に必ずAI実装ルールを読む
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/heroui/providers";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import { appBaseUrl, i18nUrlList } from "@/features/url";
import { googleTagManagerId } from "@/utils/gtm";
import { mPlusRounded1c } from "./fonts";

type Props = {
  readonly children: ReactNode;
};

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language).home.title,
  description: metaTagList(language).home.description,
  openGraph: {
    title: metaTagList(language).home.title,
    description: metaTagList(language).home.description,
    url: metaTagList(language).home.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language).home.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language).home.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.home.ja,
    languages: {
      ja: i18nUrlList.home.ja,
      en: i18nUrlList.home.en,
    },
  },
};

export default function RootLayout({ children }: Props): JSX.Element {
  return (
    <html
      className={mPlusRounded1c.variable}
      lang={language}
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId={googleTagManagerId()} />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
