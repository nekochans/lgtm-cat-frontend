// 絶対厳守：編集前に必ずAI実装ルールを読む

import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
import { getActionButtonText } from "@/features/main/service-description-text";

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);
  const refreshRandomCatsAction = refreshRandomCats.bind(null, language);
  const showLatestCatsAction = showLatestCats.bind(null, language);

  return (
    <div
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      <IconButton
        className="w-full md:w-[240px]"
        displayText={buttonText.randomCopy}
        showRepeatIcon={true}
      />
      <form action={refreshRandomCatsAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          showRandomIcon={true}
          type="submit"
        />
      </form>
      <form action={showLatestCatsAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.latestCats}
          showCatIcon={true}
          type="submit"
        />
      </form>
    </div>
  );
}
