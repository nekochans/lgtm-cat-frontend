import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { loginAction } from "@/actions/auth/login-action";
import { i18nUrlList } from "@/constants/url";
import { LoginPage } from "@/features/auth/components/login-page";
import { RequireAnonymous } from "@/features/auth/components/require-anonymous";
import {
  resolveLoginErrorCode,
  resolveLoginReturnPath,
} from "@/functions/auth";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).login.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).login.title,
    url: metaTagList(language, appBaseUrl()).login.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).login.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).login.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.login.ja,
    languages: {
      ja: i18nUrlList.login.ja,
      en: i18nUrlList.login.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  readonly searchParams: Promise<{
    readonly error?: string | readonly string[];
    readonly returnTo?: string | readonly string[];
  }>;
}

const LoginPageContent = async ({
  searchParams,
}: {
  readonly searchParams: Props["searchParams"];
}) => {
  const params = await searchParams;
  const errorCode = resolveLoginErrorCode(params.error);
  const returnTo = resolveLoginReturnPath(params.returnTo, language);

  return (
    <RequireAnonymous language={language} returnTo={returnTo}>
      <LoginPage
        errorCode={errorCode}
        language={language}
        loginAction={loginAction}
        returnTo={returnTo}
      />
    </RequireAnonymous>
  );
};

const Login: NextPage<Props> = ({ searchParams }) => (
  <Suspense fallback={null}>
    <LoginPageContent searchParams={searchParams} />
  </Suspense>
);

export default Login;
