// 絶対厳守：編集前に必ずAI実装ルールを読む

import { FishHoldingCat } from "@/components/cats/fish-holding-cat";
import { ErrorPageContent } from "@/components/error-page-content";
import { ErrorLayout } from "@/features/errors/components/error-layout";
import { maintenancePageTexts } from "@/features/errors/functions/error-i18n";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
}

export function MaintenancePage({ language }: Props) {
  const texts = maintenancePageTexts(language);

  return (
    <ErrorLayout
      currentUrlPath={createIncludeLanguageAppPath("maintenance", language)}
      language={language}
    >
      <ErrorPageContent
        buttonText={texts.buttonText}
        catComponent={
          <FishHoldingCat
            aria-hidden="true"
            className="h-auto w-[230px] md:w-[350px]"
          />
        }
        language={language}
        message={texts.message}
        title={texts.title}
      />
    </ErrorLayout>
  );
}
