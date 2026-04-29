import { getServiceDescriptionText } from "@/functions/service-description-text";
import type { Language } from "@/types/language";

interface Props {
  readonly className?: string;
  readonly language: Language;
}

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
