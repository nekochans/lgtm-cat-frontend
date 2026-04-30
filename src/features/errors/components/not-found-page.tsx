import { LookingUpCat } from "@/components/cats/looking-up-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { notFoundPageTexts } from "@/features/errors/functions/error-i18n";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function NotFoundPage({ language }: Props) {
  const texts = notFoundPageTexts(language);
  const currentUrlPath = language === "en" ? "/en" : "/";

  return (
    <ErrorLayout currentUrlPath={currentUrlPath} language={language}>
      <ErrorPageContent
        buttonText={texts.buttonText}
        catComponent={
          <LookingUpCat
            aria-hidden="true"
            className="h-auto w-[180px] md:w-[245px]"
          />
        }
        language={language}
        message={texts.message}
        title={texts.title}
      />
    </ErrorLayout>
  );
}
