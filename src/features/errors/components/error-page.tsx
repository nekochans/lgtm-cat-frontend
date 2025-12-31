// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { captureException } from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useMemo } from "react";
import { RunningCat } from "@/components/cats/running-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { errorPageTexts } from "@/features/errors/error-i18n";
import type { Language } from "@/features/language";
import { customErrorTitle } from "@/features/meta-tag";

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * パスから言語を判定する
 * /en で始まるパスの場合は英語、それ以外は日本語
 */
function detectLanguageFromPathname(pathname: string | null): Language {
  if (!pathname) {
    return "ja";
  }
  return pathname.startsWith("/en") ? "en" : "ja";
}

export function ErrorPage({ error, reset: _reset }: Props): JSX.Element {
  const pathname = usePathname();
  const language = useMemo(
    () => detectLanguageFromPathname(pathname),
    [pathname]
  );
  const texts = useMemo(() => errorPageTexts(language), [language]);
  const currentUrlPath = language === "en" ? "/en" : "/";

  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <>
      <title>{customErrorTitle(language)}</title>
      <meta content="noindex,nofollow" name="robots" />
      <ErrorLayout currentUrlPath={currentUrlPath} language={language}>
        <ErrorPageContent
          buttonText={texts.buttonText}
          catComponent={
            <RunningCat
              aria-hidden="true"
              className="h-auto w-[250px] md:w-[370px]"
            />
          }
          language={language}
          message={texts.message}
          title={texts.title}
        />
      </ErrorLayout>
    </>
  );
}
