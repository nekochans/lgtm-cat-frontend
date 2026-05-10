import type { JSX } from "react";
import { LookingUpCat } from "@/components/cats/looking-up-cat";
import { comingSoonPageTexts } from "@/components/coming-soon-content-i18n";
import { LinkButton } from "@/components/link-button";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function ComingSoonContent({ language }: Props): JSX.Element {
  const texts = comingSoonPageTexts(language);
  const homeUrl = createIncludeLanguageAppPath("home", language);

  return (
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:gap-12 md:px-10 md:py-[60px]">
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <h1 className="text-center font-bold text-2xl text-orange-900 md:text-4xl">
          {texts.title}
        </h1>
        <p className="text-center text-amber-900 text-base md:text-xl">
          {texts.message}
        </p>
      </div>
      <div className="flex items-center justify-center">
        <LookingUpCat
          aria-hidden="true"
          className="h-auto w-[180px] md:w-[245px]"
        />
      </div>
      <LinkButton
        className="w-full max-w-[300px] md:max-w-[400px]"
        linkText={texts.buttonText}
        linkUrl={homeUrl}
      />
    </div>
  );
}
