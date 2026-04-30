import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

export function createHowToUseLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "How to Use",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    case "ja":
      return {
        text: "使い方",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    default:
      return assertNever(language);
  }
}
