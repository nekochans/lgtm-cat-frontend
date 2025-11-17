// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { getServiceDescriptionText } from "@/features/main/service-description-text";

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function ServiceDescription({ language, className }: Props) {
  const text = getServiceDescriptionText(language);

  return (
    <div className={className}>
      <p className="mb-0 text-center font-inter font-normal text-text-br text-xl leading-7">
        {text.line1}
      </p>
      <p className="text-center font-inter font-normal text-text-br text-xl leading-7">
        {text.line2}
      </p>
    </div>
  );
}
